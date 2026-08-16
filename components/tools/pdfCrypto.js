"use client";

// Shared password gate for the PDF tools. PdfDropzone runs every dropped PDF
// through probePdf(); encrypted files are decrypted here — silently for
// owner-only restrictions, after a password prompt for open passwords — so the
// tools themselves only ever see ordinary unencrypted bytes.
//
// The engine is qpdf compiled to wasm (@neslinesli93/qpdf-wasm, qpdf 12.2.0).
// It decrypts structure-preservingly: streams and strings are decoded and the
// encryption dictionary dropped, nothing else is rewritten. The 1.3 MB binary
// is served from our own origin (scripts/copy-qpdf-assets.mjs keeps public/ in
// step with the installed package) and is only fetched once a dropped file
// actually carries encryption — the common unencrypted path never loads it.
//
// Empirical notes that shaped this module (verified against the wasm build in
// Node, see the password-gate fixtures):
// - qpdf's --is-encrypted / --requires-password inspection flags hard-fail
//   with "invalid password" on files that need an open password, so the gate
//   probes by attempting decryption instead. --is-encrypted IS reliable for
//   files that open without a password, which is the only place we use it.
// - The build ignores print/printErr overrides (closure-compiled with a
//   restricted incoming-API surface) and instead binds whatever console
//   methods exist at instantiation time. We tee the console during the factory
//   call — and only during it — so the instance permanently writes qpdf's
//   diagnostics into our buffer and the global console is left untouched.
// - callMain returns qpdf's exit code (0 ok, 2 error, 3 ok-with-warnings) and
//   one instance stays usable across runs, including after error runs.

let qpdfPromise = null;
let messages = [];

function loadQpdf() {
  qpdfPromise ||= (async () => {
    const factory = (await import("@neslinesli93/qpdf-wasm")).default;
    const real = { log: console.log, warn: console.warn, error: console.error };
    const tee = (fn) => (...args) => {
      messages.push(args.join(" "));
      fn.apply(console, args);
    };
    console.log = tee(real.log);
    console.warn = tee(real.warn);
    console.error = tee(real.error);
    try {
      return await factory({ locateFile: () => "/qpdf.wasm", noInitialRun: true });
    } finally {
      console.log = real.log;
      console.warn = real.warn;
      console.error = real.error;
    }
  })();
  return qpdfPromise;
}

let seq = 0;

async function runQpdf(args, inputBytes, { output = true } = {}) {
  const qpdf = await loadQpdf();
  const inName = `/in-${++seq}.pdf`;
  const outName = `/out-${seq}.pdf`;
  messages = [];
  try {
    qpdf.FS.writeFile(inName, inputBytes);
    const rc = qpdf.callMain([...args, inName, ...(output ? [outName] : [])]);
    const ok = rc === 0 || rc === 3;
    return { rc, ok, out: ok && output ? qpdf.FS.readFile(outName) : null, messages: messages.join("\n") };
  } catch (err) {
    // A throw out of callMain (as opposed to a nonzero exit) may leave the
    // runtime wedged — rebuild on next use.
    qpdfPromise = null;
    throw err;
  } finally {
    try { qpdf.FS.unlink(inName); } catch {}
    try { qpdf.FS.unlink(outName); } catch {}
  }
}

// "/Encrypt" — the key of the trailer entry every encrypted PDF must carry.
// The trailer dictionary is never inside a compressed stream, so a byte scan
// cannot miss real encryption; a stray literal in page content can only cause
// a false positive, which the probe below then resolves.
const TOKEN = [0x2f, 0x45, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74];

export function sniffEncrypted(bytes) {
  const last = bytes.length - TOKEN.length;
  for (let i = bytes.indexOf(TOKEN[0]); i !== -1 && i <= last; i = bytes.indexOf(TOKEN[0], i + 1)) {
    let hit = true;
    for (let j = 1; j < TOKEN.length; j++) {
      if (bytes[i + j] !== TOKEN[j]) { hit = false; break; }
    }
    if (hit) return true;
  }
  return false;
}

export class PdfWrongPasswordError extends Error {
  constructor() {
    super("That password didn't unlock this PDF.");
    this.name = "PdfWrongPasswordError";
  }
}

// Inspect a dropped PDF and auto-unlock what needs no password. Returns one of:
//   { status: "plain" }                 – not encrypted, use the original file
//   { status: "unlocked", bytes }       – owner restrictions removed silently
//   { status: "needs-password" }        – has an open password; prompt the user
export async function probePdf(bytes) {
  if (!sniffEncrypted(bytes)) return { status: "plain" };
  const probe = await runQpdf(["--decrypt"], bytes);
  if (!probe.ok) return { status: "needs-password" };
  // Opened without a password, so either owner-only encryption (decrypt did
  // real work) or a sniff false positive (decrypt was a pointless rewrite —
  // prefer the untouched original). Safe to ask --is-encrypted here.
  const check = await runQpdf(["--is-encrypted"], bytes, { output: false });
  if (check.rc === 2) return { status: "plain" };
  return { status: "unlocked", bytes: probe.out };
}

// Decrypt with a user-supplied open password. Resolves to the unlocked bytes;
// throws PdfWrongPasswordError when qpdf rejects the password.
export async function unlockPdf(bytes, password) {
  const res = await runQpdf(["--password=" + password, "--decrypt"], bytes);
  if (!res.ok) {
    if (/invalid password/i.test(res.messages)) throw new PdfWrongPasswordError();
    throw new Error("Couldn't unlock this PDF — the file may be damaged.");
  }
  return res.out;
}

// The other direction: encrypt with an open password (Protect PDF). AES-256,
// which is revision 6 of the PDF encryption handler — the only strength worth
// offering, since 40-bit and RC4-128 are broken and qpdf refuses to write them
// without --allow-weak-crypto anyway.
//
// The same password is set as both the user and the owner password, and that is
// deliberate rather than a shortcut. PDF's second password only gates the
// permission flags (no printing, no copying), which are advisory bits that any
// conforming reader is free to ignore and any tool can strip — including this
// site's own Unlock PDF. Offering them as a feature would promise enforcement
// the format cannot deliver. The alternative shape, an empty user password with
// a real owner password, is what qpdf explicitly refuses at 256-bit ("insecure
// as it can be opened without a password") unless --allow-insecure is passed.
// So one password, doing the one job that is actually cryptographic.
//
// Passwords go in via --user-password=<pw> rather than qpdf's older positional
// form, so a password that happens to start with "-" is not parsed as an option.
export async function encryptPdf(bytes, password) {
  const res = await runQpdf(
    ["--encrypt", "--user-password=" + password, "--owner-password=" + password, "--bits=256", "--"],
    bytes
  );
  if (!res.ok) throw new Error("Couldn't protect this PDF — the file may be damaged.");
  return res.out;
}
