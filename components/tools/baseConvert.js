// Number base conversion, kept out of the component so it can be exercised in
// node against Python's arbitrary-precision integers and exact Fraction
// arithmetic — the same reasoning as sortText.js, htmlFormat.js and jsonYaml.js.
//
// Three decisions shape this file, and the first one is the whole tool:
//
//  1. **Nothing goes through Number.** The obvious implementation of a base
//     converter is `parseInt(text, from).toString(to)`, and that is what
//     essentially every small online converter ships. Both halves run on an
//     IEEE-754 double, so every integer above 2^53 is silently rounded to
//     something else before it is ever printed. It is not a rounding error at
//     the edge, either: `parseInt("FFFFFFFFFFFFFFFF", 16).toString(2)` returns
//     a 1 followed by 64 zeros — every bit wrong, and one digit too long —
//     where the answer is 64 ones. A 64-bit hash, a snowflake ID, a CRC value or a
//     register dump is exactly the kind of number someone opens a base
//     converter for, so the integer path here is BigInt end to end: parsing
//     accumulates into a BigInt, and printing uses BigInt#toString(radix),
//     which is exact for every radix from 2 to 36.
//  2. **The fractional part is exact rational arithmetic, not a float.**
//     `(0.1).toString(2)` prints a terminating 55-digit number, which is a
//     lie twice over: it is the binary expansion of the double nearest to a
//     tenth, not of a tenth, and one tenth has no terminating binary expansion
//     at all. Here a fraction is carried as a reduced BigInt numerator and
//     denominator and expanded by repeated multiplication, so 0.1 in base 2
//     comes out as 0.0(0011) — the parenthesised run being the digits that
//     repeat forever. A remainder that has been seen before is the definition
//     of the cycle starting, which is why `seen` maps remainder to digit index
//     rather than counting iterations.
//  3. **A prefix that disagrees with the chosen base is an error, not a
//     silent override.** `0x1F` typed while the base select says 10 could
//     plausibly mean either thing, and guessing produces a wrong answer that
//     looks right. Prefixes are accepted and stripped only when they match.

export const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
export const MIN_BASE = 2;
export const MAX_BASE = 36;

// Long enough for any cycle a person will paste (1/97 in base 10 repeats after
// 96 digits; a 4096-digit cycle needs a denominator with tens of thousands of
// digits) and short enough that a pathological input cannot hang the tab.
const MAX_FRACTION_DIGITS = 4096;
const MAX_INPUT_LENGTH = 20000;

// Written the way a reader says them, because these four are what the labels
// and the error messages use.
export const BASE_NAMES = {
  2: "binary",
  8: "octal",
  10: "decimal",
  16: "hexadecimal",
};

export function baseName(base) {
  return BASE_NAMES[base] || `base ${base}`;
}

// The prefix a base is conventionally written with. Only these three exist;
// there is no agreed prefix for base 5 or base 36.
const PREFIXES = { 2: "0b", 8: "0o", 16: "0x" };

export function basePrefix(base) {
  return PREFIXES[base] || "";
}

export function digitValue(ch) {
  const i = DIGITS.indexOf(ch.toLowerCase());
  return i;
}

// The digits a base actually uses, phrased for an error message: "0 and 1",
// "0-7", "0-9 and a-f".
export function digitRange(base) {
  if (base === 2) return "0 and 1";
  if (base <= 10) return `0-${base - 1}`;
  return `0-9 and a-${DIGITS[base - 1]}`;
}

function gcd(a, b) {
  while (b) {
    const t = a % b;
    a = b;
    b = t;
  }
  return a;
}

export function isValidBase(base) {
  return Number.isInteger(base) && base >= MIN_BASE && base <= MAX_BASE;
}

// Parse `text` as a number written in `base`.
//
// Returns { ok: true, negative, int, fracNum, fracDen, hasFraction } where
// `int` is the magnitude of the integer part as a BigInt and the fraction is
// the reduced magnitude fracNum/fracDen with 0 <= fracNum < fracDen. On
// failure, { ok: false, error }.
export function parseValue(text, base) {
  if (!isValidBase(base)) {
    return { ok: false, error: `Base must be a whole number from ${MIN_BASE} to ${MAX_BASE}.` };
  }

  let s = String(text).trim();
  if (!s) return { ok: false, error: "" };
  if (s.length > MAX_INPUT_LENGTH) {
    return { ok: false, error: `That is longer than ${MAX_INPUT_LENGTH.toLocaleString("en-US")} characters.` };
  }

  let negative = false;
  if (s[0] === "-" || s[0] === "+") {
    negative = s[0] === "-";
    s = s.slice(1).trim();
  }

  // A prefix is stripped only when it names the base that is selected. The
  // mismatch case is reported rather than guessed at, because "0x1F read as
  // base 10" and "0x1F read as base 16" are both defensible readings and only
  // one of them is what the person meant.
  const lower = s.toLowerCase();
  for (const [b, prefix] of Object.entries(PREFIXES)) {
    if (lower.startsWith(prefix)) {
      if (Number(b) === base) {
        s = s.slice(prefix.length);
      } else {
        return {
          ok: false,
          error: `${prefix} is the ${baseName(Number(b))} prefix, but the input base is set to ${baseName(base)}. Change the base, or remove the prefix.`,
        };
      }
      break;
    }
  }

  // Grouping characters people paste with: 1,234,567 out of a spreadsheet,
  // 1010_1010 out of Rust or Java, FFFF FFFF out of a register dump. None of
  // them is a digit in any base up to 36, so dropping them is unambiguous —
  // but a comma is a radix point in much of the world, so the point is stated
  // in the UI rather than guessed at here.
  s = s.replace(/[\s_,']/g, "");
  if (!s) return { ok: false, error: "Enter a number to convert." };

  const parts = s.split(".");
  if (parts.length > 2) {
    return { ok: false, error: "That has more than one decimal point." };
  }
  const [intText, fracText = ""] = parts;
  if (!intText && !fracText) {
    return { ok: false, error: "Enter a number to convert." };
  }

  const B = BigInt(base);
  let int = 0n;
  for (const ch of intText) {
    const v = digitValue(ch);
    if (v < 0 || v >= base) return { ok: false, error: badDigit(ch, base) };
    int = int * B + BigInt(v);
  }

  let fracNum = 0n;
  let fracDen = 1n;
  for (const ch of fracText) {
    const v = digitValue(ch);
    if (v < 0 || v >= base) return { ok: false, error: badDigit(ch, base) };
    fracNum = fracNum * B + BigInt(v);
    fracDen *= B;
  }
  if (fracNum > 0n) {
    const g = gcd(fracNum, fracDen);
    fracNum /= g;
    fracDen /= g;
  } else {
    fracDen = 1n;
  }

  // "-0" and "-0.0" are the same number as zero; carrying the sign would print
  // a minus in front of every output row.
  if (int === 0n && fracNum === 0n) negative = false;

  return { ok: true, negative, int, fracNum, fracDen, hasFraction: fracNum > 0n };
}

function badDigit(ch, base) {
  const shown = ch === " " ? "a space" : `"${ch}"`;
  const v = digitValue(ch);
  if (v >= 0) {
    return `${shown} is not a ${baseName(base)} digit — base ${base} uses only ${digitRange(base)}.`;
  }
  return `${shown} is not a digit in any base up to ${MAX_BASE}. Use ${digitRange(base)} for ${baseName(base)}, and a dot for the point.`;
}

// Expand fracNum/fracDen in `base` by repeated multiplication.
//
// Returns { digits, repeatStart, truncated }. repeatStart is the index at
// which the digits begin repeating forever, or -1 when the expansion
// terminates. A remainder seen twice is exactly the point where the whole
// expansion starts over, which is why the map holds remainder -> index.
export function fractionDigits(fracNum, fracDen, base) {
  if (fracNum === 0n) return { digits: "", repeatStart: -1, truncated: false };
  const B = BigInt(base);
  const seen = new Map();
  const out = [];
  let n = fracNum;
  while (n !== 0n) {
    const at = seen.get(n);
    if (at !== undefined) return { digits: out.join(""), repeatStart: at, truncated: false };
    seen.set(n, out.length);
    const scaled = n * B;
    out.push(DIGITS[Number(scaled / fracDen)]);
    n = scaled % fracDen;
    if (out.length >= MAX_FRACTION_DIGITS) {
      return { digits: out.join(""), repeatStart: -1, truncated: true };
    }
  }
  return { digits: out.join(""), repeatStart: -1, truncated: false };
}

// Insert a separator every `size` digits, counting from the right for the
// integer part and from the left for the fraction — which is how a reader
// groups them, and the reason this cannot be one loop.
function group(digits, size, sep, fromLeft) {
  if (!size || digits.length <= size) return digits;
  const parts = [];
  if (fromLeft) {
    for (let i = 0; i < digits.length; i += size) parts.push(digits.slice(i, i + size));
  } else {
    for (let i = digits.length; i > 0; i -= size) parts.push(digits.slice(Math.max(0, i - size), i));
    parts.reverse();
  }
  return parts.join(sep);
}

// Conventional grouping per base: bytes/nibbles for the machine bases,
// thousands for decimal. Everything else is left alone, because there is no
// convention to follow for base 7.
const GROUPING = {
  2: { size: 4, sep: " " },
  8: { size: 3, sep: " " },
  10: { size: 3, sep: "," },
  16: { size: 4, sep: " " },
};

// Render a parsed value in `base`.
//
// opts: { uppercase, prefix, grouped }
// Returns { text, repeatStart, truncated, exact }.
export function formatValue(value, base, opts = {}) {
  const { uppercase = false, prefix = false, grouped = false } = opts;
  const g = grouped ? GROUPING[base] : null;

  let intText = value.int.toString(base);
  const frac = fractionDigits(value.fracNum, value.fracDen, base);

  let fracText = frac.digits;
  if (frac.repeatStart >= 0) {
    // The parentheses mark the run that repeats forever. Grouping inside a
    // marked cycle would make the cycle boundary unreadable, so a repeating
    // expansion is never grouped.
    fracText =
      frac.digits.slice(0, frac.repeatStart) + "(" + frac.digits.slice(frac.repeatStart) + ")";
  } else if (frac.truncated) {
    fracText = frac.digits + "...";
  } else if (g) {
    fracText = group(fracText, g.size, g.sep, true);
  }

  if (g) intText = group(intText, g.size, g.sep, false);

  let text = intText + (fracText ? "." + fracText : "");
  // Order matters: the digits uppercase, the prefix does not. Every language
  // that prints a hex literal writes 0xFF rather than 0XFF.
  if (uppercase) text = text.toUpperCase();
  if (prefix && basePrefix(base)) text = basePrefix(base) + text;
  if (value.negative) text = "-" + text;

  return {
    text,
    repeatStart: frac.repeatStart,
    truncated: frac.truncated,
    exact: frac.repeatStart < 0 && !frac.truncated,
  };
}

// The two's-complement bit pattern of a whole number at a given width.
//
// Returns { ok: true, bits, hex } or { ok: false, error }. Only whole numbers
// have one — a fraction has no two's-complement form — and a value outside the
// signed range of the width is reported rather than wrapped, because silently
// wrapping is how a converter tells you -200 is 0x38 in 8 bits.
export function twosComplement(value, bits) {
  if (value.hasFraction) return { ok: false, error: "Whole numbers only." };
  const width = BigInt(bits);
  const span = 1n << width;
  const signed = value.negative ? -value.int : value.int;
  const min = -(1n << (width - 1n));
  const max = (1n << (width - 1n)) - 1n;
  if (signed < min || signed > max) {
    return { ok: false, error: `Outside the ${bits}-bit signed range.` };
  }
  const pattern = ((signed % span) + span) % span;
  return {
    ok: true,
    bits: pattern.toString(2).padStart(bits, "0"),
    hex: pattern.toString(16).toUpperCase().padStart(bits / 4, "0"),
  };
}

// How many bits the magnitude occupies — the width of the shortest unsigned
// field that holds it. Zero needs no bits to distinguish it, but reporting "0
// bits" reads as an error, so it is reported as 1.
export function bitLength(int) {
  if (int === 0n) return 1;
  return int.toString(2).length;
}
