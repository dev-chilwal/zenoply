// Text <-> binary (and hex / decimal bytes), always through UTF-8.
//
// The common one-line build of this tool is charCodeAt(i).toString(2), which
// reads UTF-16 code units rather than bytes: "é" comes out as 11101001 (its
// Latin-1 value, which no UTF-8 decoder will read back as é) and an emoji comes
// out as two 16-bit surrogate halves. Here every character is encoded to its
// real UTF-8 bytes, so what this writes is what a file or a network packet
// actually holds, and what it reads back round-trips exactly.
//
// Kept free of React so it runs in node, which is where it is tested.

export const FORMATS = [
  { id: "binary", label: "Binary", radix: 2, width: 8 },
  { id: "hex", label: "Hex", radix: 16, width: 2 },
  { id: "decimal", label: "Decimal", radix: 10, width: 0 },
];

export const SEPARATORS = [
  { id: "space", label: "Space", value: " " },
  { id: "none", label: "None", value: "" },
  { id: "newline", label: "New line", value: "\n" },
];

const fmtOf = (id) => FORMATS.find((f) => f.id === id) || FORMATS[0];

/** One byte written in a format, padded to its natural width. */
export function formatByte(b, format = "binary", uppercase = true) {
  const f = fmtOf(format);
  let s = b.toString(f.radix);
  if (f.width) s = s.padStart(f.width, "0");
  return uppercase ? s.toUpperCase() : s;
}

const NAMES = {
  0x20: "space",
  0x09: "tab",
  0x0a: "new line",
  0x0d: "carriage return",
  0xa0: "no-break space",
  0x200b: "zero-width space",
  0x200d: "zero-width joiner",
  0xfeff: "byte order mark",
};

/** A visible label for a character in the breakdown table. */
export function charLabel(ch) {
  const cp = ch.codePointAt(0);
  if (NAMES[cp]) return NAMES[cp];
  if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0)) return "control";
  return ch;
}

export const codePointLabel = (cp) =>
  "U+" + cp.toString(16).toUpperCase().padStart(4, "0");

/**
 * Text -> bytes in the chosen format.
 * Returns { output, chars: [{ch, cp, bytes}], charCount, byteCount, multiByte }.
 * A lone surrogate (only possible from pasted, already-broken text) is encoded
 * the way TextEncoder does it, as U+FFFD, and counted so the caller can say so.
 */
export function encodeText(text, { format = "binary", separator = "space", uppercase = true } = {}) {
  const sep = (SEPARATORS.find((s) => s.id === separator) || SEPARATORS[0]).value;
  const enc = new TextEncoder();
  const chars = [];
  const parts = [];
  let byteCount = 0;
  let multiByte = 0;
  let loneSurrogates = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp >= 0xd800 && cp <= 0xdfff) loneSurrogates++;
    const bytes = Array.from(enc.encode(ch));
    if (bytes.length > 1) multiByte++;
    byteCount += bytes.length;
    chars.push({ ch, cp, bytes });
    for (const b of bytes) parts.push(formatByte(b, format, uppercase));
  }
  return {
    output: parts.join(sep),
    chars,
    charCount: chars.length,
    byteCount,
    multiByte,
    loneSurrogates,
  };
}

const groups = (bits, size) => {
  const out = [];
  for (let i = 0; i < bits.length; i += size) out.push(parseInt(bits.slice(i, i + size), 2));
  return out;
};

const DIGITS = { binary: /^[01]+$/, hex: /^[0-9a-fA-F]+$/, decimal: /^[0-9]+$/ };

/**
 * Split the pasted digits into byte values.
 * Separators are any run of whitespace, commas or semicolons. Prefixes 0b / 0x
 * and the \x escape are stripped per token. A token with no separators at all is
 * chunked at the format's natural width (8 bits, 2 hex digits).
 *
 * Binary has one special case: 7-bit ASCII. Plenty of textbooks and older
 * converters drop the always-zero top bit, so "1001000 1101001" is common. A
 * separated token of 1-8 bits is simply padded, which reads those correctly; a
 * continuous run whose length is a multiple of 7 but not of 8 is read in groups
 * of 7 and reported, rather than refused.
 *
 * Returns { ok, bytes, sevenBit } or { ok:false, error }.
 */
export function parseBytes(input, format = "binary") {
  const f = fmtOf(format);
  const raw = input.trim();
  if (!raw) return { ok: false, empty: true };
  const tokens = raw.split(/[\s,;]+/).filter(Boolean);
  const bytes = [];
  let sevenBit = false;
  const prefix = format === "binary" ? /^0b/i : format === "hex" ? /^(0x|\\x)/i : null;

  for (let t = 0; t < tokens.length; t++) {
    let tok = prefix ? tokens[t].replace(prefix, "") : tokens[t];
    // "\x48\x69" arrives as one token; split it on its own escapes.
    if (format === "hex" && /\\x/i.test(tok)) tok = tok.replace(/\\x/gi, "");
    if (!tok) continue;
    if (!DIGITS[format].test(tok)) {
      const bad = [...tok].find((c) => !DIGITS[format].test(c));
      return {
        ok: false,
        error: `"${bad}" is not a ${f.label.toLowerCase()} digit (in "${tokens[t]}", group ${t + 1}).`,
      };
    }

    if (format === "decimal") {
      const v = Number(tok);
      if (v > 255) {
        return { ok: false, error: `${tok} (group ${t + 1}) is more than 255, so it does not fit in one byte.` };
      }
      bytes.push(v);
      continue;
    }

    if (tok.length <= f.width) {
      bytes.push(parseInt(tok, f.radix));
      continue;
    }

    let size = f.width;
    if (format === "binary" && tok.length % 56 === 0) {
      // Divisible by both 7 and 8 (e.g. "Hi there" written 7-bit is 56 bits).
      // Take the 7-bit reading only when it is all printable ASCII and the
      // 8-bit reading is not — otherwise the ordinary 8-bit reading stands.
      const printable = (s) => groups(tok, s).every((v) => (v >= 0x20 && v < 0x7f) || v === 9 || v === 10 || v === 13);
      if (printable(7) && !printable(8)) {
        size = 7;
        sevenBit = true;
      }
    } else if (format === "binary" && tok.length % 8 !== 0) {
      if (tok.length % 7 === 0) {
        size = 7;
        sevenBit = true;
      } else {
        return {
          ok: false,
          error: `Group ${t + 1} has ${tok.length} bits, which is not a whole number of 8-bit bytes. Check for a missing or extra digit.`,
        };
      }
    }
    if (format === "hex" && tok.length % 2 !== 0) {
      return {
        ok: false,
        error: `Group ${t + 1} has ${tok.length} hex digits — an odd number, so one byte is missing a digit.`,
      };
    }
    for (let i = 0; i < tok.length; i += size) bytes.push(parseInt(tok.slice(i, i + size), f.radix));
  }
  if (!bytes.length) return { ok: false, empty: true };
  return { ok: true, bytes, sevenBit };
}

/**
 * Bytes -> text as UTF-8. Invalid sequences decode to U+FFFD (as every browser
 * does) and are counted, with the offset of the first one, so the page can say
 * the input was not UTF-8 instead of silently showing replacement marks.
 */
export function decodeBytes(bytes) {
  const u8 = Uint8Array.from(bytes);
  const text = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true }).decode(u8);
  let valid = true;
  try {
    new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(u8);
  } catch {
    valid = false;
  }
  let firstBad = -1;
  if (!valid) firstBad = firstInvalidOffset(u8);
  const replacements = valid ? 0 : [...text].filter((c) => c === "�").length;
  // A byte pattern that is wrong as UTF-8 but every byte of which is under 256
  // is usually Latin-1 / Windows-1252 text, which is what the naive converters
  // produce for accented letters. Offered as a second reading, not a guess.
  const latin1 = valid ? null : String.fromCharCode(...u8);
  return { text, valid, replacements, firstBad, latin1 };
}

/** Byte offset of the first byte that starts an invalid UTF-8 sequence. */
export function firstInvalidOffset(u8) {
  let i = 0;
  while (i < u8.length) {
    const b = u8[i];
    let n, min;
    if (b < 0x80) { i++; continue; }
    else if (b >= 0xc2 && b <= 0xdf) { n = 1; min = 0x80; }
    else if (b >= 0xe0 && b <= 0xef) { n = 2; min = 0x800; }
    else if (b >= 0xf0 && b <= 0xf4) { n = 3; min = 0x10000; }
    else return i;
    let cp = b & (0x3f >> n);
    for (let k = 1; k <= n; k++) {
      const c = u8[i + k];
      if (c === undefined || (c & 0xc0) !== 0x80) return i;
      cp = (cp << 6) | (c & 0x3f);
    }
    if (cp < min || cp > 0x10ffff || (cp >= 0xd800 && cp <= 0xdfff)) return i;
    i += n + 1;
  }
  return -1;
}
