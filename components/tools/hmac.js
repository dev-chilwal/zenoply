// HMAC construction and the byte codecs around it, kept out of the component so
// the whole thing can be run in node against OpenSSL (node:crypto) and the RFC
// 4231 test vectors — the same reasoning as escapeString.js and baseConvert.js.
//
// Four decisions shape this file:
//
//  1. **HMAC is built here rather than handed to `crypto.subtle.sign`.**
//     WebCrypto refuses a zero-length key outright ("Zero-length key is not
//     supported"), while RFC 2104 defines it, and OpenSSL, Node, Python and Go
//     all compute it happily. A tool whose job is to reproduce the signature
//     some other stack produced cannot have a hole where that stack has a
//     value, so the ipad/opad construction is written out and driven over the
//     hash primitives. That also makes HMAC-MD5 available on the same code
//     path — WebCrypto has no MD5 at all, and HMAC-MD5 is still what a lot of
//     older payment and telecom APIs sign with.
//  2. **The key is bytes, not text, and the encoding is the user's to state.**
//     Half of all "my signature does not match" reports are a hex or Base64
//     secret that was HMAC'd as its own printable characters. `48656c6c6f`
//     read as text is eleven bytes; read as hex it is five. Both are ordinary
//     readings of the same secret and they produce entirely unrelated MACs, so
//     there is no safe default to guess — it is an explicit choice, and when
//     the result does not match, every reading is tried and the one that works
//     is named.
//  3. **A signature is compared as bytes, never as text.** Upper- and
//     lower-case hex are the same MAC; so are Base64 and Base64url of the same
//     digest, and Base64 with or without its padding. Comparing strings makes
//     four spurious mismatches out of one match.
//  4. **Nothing here is constant-time and it does not pretend to be.** This
//     runs in a browser on data you already hold; the timing-safe requirement
//     belongs to the server doing the verifying, and the UI says so rather
//     than implying a JS `===` was ever good enough.

export const ALGOS = [
  { id: "SHA-256", label: "HMAC-SHA256", hash: "SHA-256", block: 64, size: 32 },
  { id: "SHA-1", label: "HMAC-SHA1", hash: "SHA-1", block: 64, size: 20 },
  { id: "SHA-512", label: "HMAC-SHA512", hash: "SHA-512", block: 128, size: 64 },
  { id: "SHA-384", label: "HMAC-SHA384", hash: "SHA-384", block: 128, size: 48 },
  { id: "MD5", label: "HMAC-MD5", hash: null, block: 64, size: 16 },
];

const BY_ID = Object.fromEntries(ALGOS.map((a) => [a.id, a]));

export function algoById(id) {
  return BY_ID[id] || BY_ID["SHA-256"];
}

/* ---------------------------------------------------------------- MD5 ---- */

// MD5 over raw bytes. SubtleCrypto has no MD5 — it was dropped from the spec
// deliberately — so it is written out here. It takes and returns bytes rather
// than a string because HMAC feeds a hash its own padded key block, which is
// not text and has no UTF-8 reading.
export function md5Bytes(bytes) {
  const rl = (n, c) => (n << c) | (n >>> (32 - c));
  const add = (a, b) => (a + b) & 0xffffffff;
  const cmn = (q, a, b, x, s, t) => add(rl(add(add(a, q), add(x, t)), s), b);
  const ff = (a, b, c, d, x, s, t) => cmn((b & c) | (~b & d), a, b, x, s, t);
  const gg = (a, b, c, d, x, s, t) => cmn((b & d) | (c & ~d), a, b, x, s, t);
  const hh = (a, b, c, d, x, s, t) => cmn(b ^ c ^ d, a, b, x, s, t);
  const ii = (a, b, c, d, x, s, t) => cmn(c ^ (b | ~d), a, b, x, s, t);

  const len = bytes.length;
  // One block per 64 bytes, plus room for the 0x80 terminator and the 8-byte
  // length. The +1 is what makes a 56..63-byte tail spill into a second block.
  const nBlocks = ((len + 8) >> 6) + 1;
  const x = new Array(nBlocks * 16).fill(0);
  for (let i = 0; i < len; i++) x[i >> 2] |= bytes[i] << ((i % 4) * 8);
  x[len >> 2] |= 0x80 << ((len % 4) * 8);
  const bitLen = len * 8;
  x[nBlocks * 16 - 2] = bitLen & 0xffffffff;
  x[nBlocks * 16 - 1] = Math.floor(bitLen / 0x100000000);

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, x[i], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = ff(c, d, a, b, x[i + 2], 17, 606105819); b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = ff(a, b, c, d, x[i + 8], 7, 1770035416); d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = ff(c, d, a, b, x[i + 14], 17, -1502002290); b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i], 20, -373897302);
    a = gg(a, b, c, d, x[i + 5], 5, -701558691); d = gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, x[i + 3], 14, -187363961); b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = hh(a, b, c, d, x[i + 5], 4, -378558); d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, x[i + 7], 16, -155497632); b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i], 11, -358537222);
    c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = hh(a, b, c, d, x[i + 9], 4, -640364487); d = hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = ii(a, b, c, d, x[i], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, x[i + 14], 15, -1416354905); b = ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, x[i + 8], 6, 1873313359); d = ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, x[i + 2], 15, 718787259); b = ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }

  const out = new Uint8Array(16);
  [a, b, c, d].forEach((w, i) => {
    for (let j = 0; j < 4; j++) out[i * 4 + j] = (w >> (j * 8)) & 255;
  });
  return out;
}

/* ------------------------------------------------------------- codecs ---- */

const HEX_STRIP = /[\s:_-]/g;
const B64_STRIP = /\s/g;

export function bytesToHex(bytes, upper = false) {
  let s = "";
  for (const b of bytes) s += b.toString(16).padStart(2, "0");
  return upper ? s.toUpperCase() : s;
}

export function bytesToBase64(bytes, url = false) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  const b64 = btoa(bin);
  return url ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

export function hexToBytes(text) {
  // Separators people actually paste: spaces, newlines, colons (tcpdump,
  // openssl), dashes and underscores. A 0x prefix is dropped once, at the
  // front only, because "0x" repeated per byte is a C array, not a digest.
  let s = String(text).replace(HEX_STRIP, "");
  if (/^0x/i.test(s)) s = s.slice(2);
  if (!s) return { ok: true, bytes: new Uint8Array(0) };
  if (/[^0-9a-fA-F]/.test(s)) {
    const bad = s.match(/[^0-9a-fA-F]/)[0];
    return { ok: false, error: `"${bad}" is not a hex digit. Hex uses 0-9 and a-f only.` };
  }
  if (s.length % 2) {
    // Left-padding "a1b" to "0a1b" and right-padding to "a1b0" are both
    // defensible and give different bytes, so neither is guessed.
    return { ok: false, error: `Hex needs an even number of digits — this has ${s.length}. One digit is half a byte, so it is not clear which end is missing.` };
  }
  const bytes = new Uint8Array(s.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(s.substr(i * 2, 2), 16);
  return { ok: true, bytes };
}

export function base64ToBytes(text) {
  // Both alphabets are accepted on input: -_ is Base64url and it is never
  // ambiguous, since + and / cannot appear in the same string.
  let s = String(text).replace(B64_STRIP, "").replace(/-/g, "+").replace(/_/g, "/");
  if (!s) return { ok: true, bytes: new Uint8Array(0) };
  s = s.replace(/=+$/, "");
  if (/[^A-Za-z0-9+/]/.test(s)) {
    const bad = s.match(/[^A-Za-z0-9+/]/)[0];
    return { ok: false, error: `"${bad}" is not a Base64 character.` };
  }
  if (s.length % 4 === 1) {
    return { ok: false, error: "That is not a whole number of Base64 groups — one character is left over." };
  }
  // Padding is restored rather than required: plenty of APIs strip it.
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  let bin;
  try {
    bin = atob(padded);
  } catch {
    return { ok: false, error: "That is not valid Base64." };
  }
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { ok: true, bytes };
}

export const INPUT_ENCODINGS = [
  { value: "text", label: "Text" },
  { value: "hex", label: "Hex" },
  { value: "base64", label: "Base64" },
];

export function decodeInput(text, encoding) {
  if (encoding === "hex") return hexToBytes(text);
  if (encoding === "base64") return base64ToBytes(text);
  return { ok: true, bytes: new TextEncoder().encode(String(text)) };
}

export const OUTPUT_ENCODINGS = [
  { value: "hex", label: "Hex" },
  { value: "HEX", label: "HEX" },
  { value: "base64", label: "Base64" },
  { value: "base64url", label: "Base64url" },
];

export function encodeDigest(bytes, encoding) {
  if (encoding === "HEX") return bytesToHex(bytes, true);
  if (encoding === "base64") return bytesToBase64(bytes, false);
  if (encoding === "base64url") return bytesToBase64(bytes, true);
  return bytesToHex(bytes, false);
}

/* --------------------------------------------------------------- hmac ---- */

async function digest(algo, bytes) {
  if (algo.id === "MD5") return md5Bytes(bytes);
  const buf = await crypto.subtle.digest(algo.hash, bytes);
  return new Uint8Array(buf);
}

// RFC 2104. A key longer than the hash's block size is replaced by its own
// digest — which is why a 200-character secret and its SHA-256 hash sign
// identically — and anything shorter is zero-padded up to the block.
export async function hmac(algoId, keyBytes, msgBytes) {
  const algo = algoById(algoId);
  const B = algo.block;
  let k = keyBytes;
  if (k.length > B) k = await digest(algo, k);
  const k0 = new Uint8Array(B);
  k0.set(k);

  const inner = new Uint8Array(B + msgBytes.length);
  for (let i = 0; i < B; i++) inner[i] = k0[i] ^ 0x36;
  inner.set(msgBytes, B);
  const innerHash = await digest(algo, inner);

  const outer = new Uint8Array(B + innerHash.length);
  for (let i = 0; i < B; i++) outer[i] = k0[i] ^ 0x5c;
  outer.set(innerHash, B);
  return digest(algo, outer);
}

export function sameBytes(a, b) {
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/* ---------------------------------------------------- expected signature -- */

// Signature headers rarely arrive as a bare digest. GitHub sends
// "sha256=<hex>", Stripe sends "t=<ts>,v1=<hex>" with more schemes appended
// over time, Shopify sends bare Base64. The prefix is pulled off and reported
// rather than silently dropped, because "sha256=" is also the reader's only
// clue about which algorithm the sender used.
export function parseSignature(raw) {
  const text = String(raw).trim();
  if (!text) return null;

  let body = text;
  let scheme = null;

  if (text.includes(",") && /[A-Za-z0-9]+=/.test(text)) {
    const pairs = text.split(",").map((p) => p.trim());
    const parsed = pairs
      .map((p) => {
        const i = p.indexOf("=");
        return i > 0 ? { k: p.slice(0, i).trim(), v: p.slice(i + 1).trim() } : null;
      })
      .filter(Boolean)
      .filter((p) => !/^(t|timestamp|ts)$/i.test(p.k) && p.v.length >= 16);
    if (parsed.length) {
      body = parsed[parsed.length - 1].v;
      scheme = parsed[parsed.length - 1].k;
    }
  } else {
    // "sha256=<hex>" is a scheme; "aGVsbG8=" and "...ab==" are Base64 padding.
    // Two guards separate them: the name before the "=" is capped at 20
    // characters (a 43-character Base64 body cannot pass for a scheme name),
    // and the character straight after the "=" may not itself be "=", which is
    // the only place standard Base64 ever puts one.
    const m = text.match(/^([A-Za-z][A-Za-z0-9_.-]{0,19})=([^=][\s\S]*)$/);
    if (m && m[2].replace(/=+$/, "").length >= 16) {
      scheme = m[1];
      body = m[2];
    }
  }

  const compact = body.replace(/\s/g, "");
  const readings = [];
  if (/^[0-9a-fA-F]+$/.test(compact) && compact.length % 2 === 0) {
    const r = hexToBytes(compact);
    if (r.ok) readings.push({ encoding: "hex", label: "hex", bytes: r.bytes });
  }
  if (/^[A-Za-z0-9+/_=-]+$/.test(compact) && compact.length % 4 !== 1) {
    const r = base64ToBytes(compact);
    if (r.ok && r.bytes.length) {
      const dup = readings.some((x) => sameBytes(x.bytes, r.bytes));
      if (!dup) {
        readings.push({
          encoding: /[-_]/.test(compact) ? "base64url" : "base64",
          label: /[-_]/.test(compact) ? "Base64url" : "Base64",
          bytes: r.bytes,
        });
      }
    }
  }
  return { text, body: compact, scheme, readings };
}

// A digest length is a fingerprint: 32 hex characters can only be MD5, 64 can
// only be SHA-256. Saying so up front settles more mismatches than the sweep
// does, because the usual answer is "the sender is not using the algorithm you
// picked".
export function algosForLength(byteLength) {
  return ALGOS.filter((a) => a.size === byteLength);
}

/* ------------------------------------------------------------ diagnose ---- */

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((item) => {
    const k = bytesToHex(item.bytes);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

// Every reading of the key that parses. The point is that all of them are
// legitimate — the secret "48656c6c6f" is five bytes to one API and eleven to
// the next, and only the far end knows which.
export function keyReadings(keyText) {
  const out = [];
  for (const enc of INPUT_ENCODINGS) {
    const r = decodeInput(keyText, enc.value);
    if (r.ok) out.push({ how: enc.value, label: enc.label, bytes: r.bytes });
  }
  return dedupe(out);
}

// The message variants worth trying are the ones a copy/paste actually
// changes. A trailing newline is the classic: `curl -d @body.json` sends the
// file's final newline and a textarea does not, so the signature moves.
export function messageVariants(msgText, encoding) {
  const base = decodeInput(msgText, encoding);
  const out = [];
  if (base.ok) out.push({ how: "as-is", label: "exactly as typed", bytes: base.bytes });

  if (encoding === "text") {
    const s = String(msgText);
    const add = (label, how, value) => {
      const b = new TextEncoder().encode(value);
      out.push({ how, label, bytes: b });
    };
    if (!s.endsWith("\n")) add("with a trailing newline added", "add-lf", s + "\n");
    else add("with the trailing newline removed", "strip-lf", s.replace(/\n+$/, ""));
    if (s.includes("\n") && !s.includes("\r\n")) add("with CRLF line endings", "crlf", s.replace(/\n/g, "\r\n"));
    if (s.includes("\r\n")) add("with LF line endings", "lf", s.replace(/\r\n/g, "\n"));
    if (s.trim() !== s) add("with surrounding whitespace trimmed", "trim", s.trim());

    // A message that is itself a digest or a blob is frequently signed as
    // bytes, not as the characters spelling it out.
    for (const enc of ["hex", "base64"]) {
      const r = decodeInput(msgText, enc);
      if (r.ok && r.bytes.length) out.push({ how: enc, label: `read as ${enc === "hex" ? "hex" : "Base64"} bytes`, bytes: r.bytes });
    }
  }
  return dedupe(out);
}

// Cross product of algorithm × key reading × message variant, compared against
// every byte reading of the expected signature. Roughly 100 HMACs of a short
// string, which is imperceptible, and it answers the question the tool exists
// for: not "what is the MAC" but "why is mine different from theirs".
export async function diagnose({ keyText, msgText, msgEncoding, signature }) {
  const sig = parseSignature(signature);
  if (!sig || !sig.readings.length) return { ok: false, matches: [] };

  const keys = keyReadings(keyText);
  const msgs = messageVariants(msgText, msgEncoding);
  const matches = [];

  for (const algo of ALGOS) {
    const usable = sig.readings.filter((r) => r.bytes.length === algo.size);
    if (!usable.length) continue;
    for (const k of keys) {
      for (const m of msgs) {
        const mac = await hmac(algo.id, k.bytes, m.bytes);
        const hit = usable.find((r) => sameBytes(r.bytes, mac));
        if (hit) {
          matches.push({
            algo: algo.id,
            algoLabel: algo.label,
            keyHow: k.how,
            keyLabel: k.label,
            msgHow: m.how,
            msgLabel: m.label,
            sigEncoding: hit.label,
          });
        }
      }
    }
  }
  return { ok: true, matches, sig };
}
