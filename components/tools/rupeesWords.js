/*
 * Amount-to-words for Indian rupees, kept as a plain module (no React) so the
 * conversion can be exercised directly in node.
 *
 * Two things make this different from the plain Number to Words converter:
 *   1. The Indian numbering system groups in lakh (10^5) and crore (10^7)
 *      rather than in threes, and above a crore it repeats itself — a trillion
 *      is "one lakh crore", not a new scale word.
 *   2. Cheques and invoices spell the fractional part as a whole number of
 *      paise ("and fifty paise"), never as "point five zero", and close with
 *      the word "Only" so nothing can be appended to the line.
 */

const ONES = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
  "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
  "sixteen", "seventeen", "eighteen", "nineteen",
];
const TENS = [
  "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
  "eighty", "ninety",
];
// Short-scale group names for the international system, ascending.
const SCALES = [
  "", "thousand", "million", "billion", "trillion", "quadrillion",
  "quintillion",
];

// Long enough for any cheque or invoice; keeps the wording sane.
export const MAX_DIGITS = 15;

// 0-99. Compounds from 21 to 99 are hyphenated, which is standard written
// English and what a bank expects to see on the amount line.
function twoDigitsToWords(n) {
  if (n < 20) return ONES[n];
  const tens = TENS[Math.floor(n / 10)];
  const unit = n % 10;
  return unit ? `${tens}-${ONES[unit]}` : tens;
}

// 0-999.
function threeDigitsToWords(n) {
  const parts = [];
  if (n >= 100) {
    parts.push(ONES[Math.floor(n / 100)], "hundred");
    n %= 100;
  }
  if (n > 0) parts.push(twoDigitsToWords(n));
  return parts.join(" ");
}

const CRORE = 10000000n;
const LAKH = 100000n;
const THOUSAND = 1000n;

/**
 * Indian system. Recursing on the crore count is what produces "one hundred
 * crore" (10^9) and "one lakh crore" (10^12) instead of inventing scale words
 * above crore, which is how the amounts are actually written and read.
 */
function indianToWords(n) {
  if (n === 0n) return "zero";
  const parts = [];
  if (n >= CRORE) {
    parts.push(indianToWords(n / CRORE) + " crore");
    n %= CRORE;
  }
  if (n >= LAKH) {
    parts.push(twoDigitsToWords(Number(n / LAKH)) + " lakh");
    n %= LAKH;
  }
  if (n >= THOUSAND) {
    parts.push(twoDigitsToWords(Number(n / THOUSAND)) + " thousand");
    n %= THOUSAND;
  }
  if (n > 0n) parts.push(threeDigitsToWords(Number(n)));
  return parts.join(" ");
}

/** International short scale: thousand, million, billion, trillion. */
function intlToWords(n) {
  if (n === 0n) return "zero";
  const groups = [];
  while (n > 0n) {
    groups.unshift(Number(n % 1000n));
    n /= 1000n;
  }
  if (groups.length > SCALES.length) return null;
  const words = [];
  groups.forEach((g, i) => {
    if (g === 0) return;
    const scale = SCALES[groups.length - 1 - i];
    words.push(threeDigitsToWords(g) + (scale ? " " + scale : ""));
  });
  return words.join(" ");
}

/** Words for a non-negative integer given as a digit string. */
export function integerToWords(digits, system = "indian") {
  const n = BigInt(digits);
  return system === "intl" ? intlToWords(n) : indianToWords(n);
}

/** 1,23,456 for the Indian system — commas every two digits above the last three. */
export function groupIndian(digits) {
  if (digits.length <= 3) return digits;
  const last3 = digits.slice(-3);
  let rest = digits.slice(0, -3);
  const groups = [];
  while (rest.length > 2) {
    groups.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  if (rest) groups.unshift(rest);
  return groups.join(",") + "," + last3;
}

/** 123,456 — plain thousands separators. */
export function groupIntl(digits) {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function groupDigits(digits, system = "indian") {
  return system === "intl" ? groupIntl(digits) : groupIndian(digits);
}

/**
 * Parse a typed amount into whole rupees and whole paise.
 * Accepts a rupee symbol, "Rs."/"INR", and commas in either grouping style.
 * Returns { ok, error, rupees (digit string), paise (0-99), rounded }.
 */
export function parseAmount(raw) {
  const cleaned = String(raw)
    .trim()
    .replace(/^(₹|rs\.?|inr)\s*/i, "")
    .replace(/[,\s_]/g, "");

  if (cleaned === "") return { ok: false, empty: true };
  if (/^-/.test(cleaned)) {
    return { ok: false, error: "Enter a positive amount — a cheque cannot be written for a negative figure." };
  }

  const m = cleaned.match(/^(\d*)(?:\.(\d*))?$/);
  if (!m || (m[1] === "" && (m[2] === undefined || m[2] === ""))) {
    return { ok: false, error: "Enter a valid amount, for example 123456.50 or 1,23,456.50." };
  }

  let intPart = (m[1] || "0").replace(/^0+(?=\d)/, "");
  const frac = m[2] || "";

  // Round to whole paise using the digits themselves, so 0.005 does not drift
  // through binary floating point on its way to 1 paisa.
  let paise = Number(frac.slice(0, 2).padEnd(2, "0") || "0");
  const rounded = frac.length > 2 && /[1-9]/.test(frac.slice(2));
  if (frac.length > 2 && Number(frac[2]) >= 5) {
    paise += 1;
    if (paise === 100) {
      paise = 0;
      intPart = (BigInt(intPart) + 1n).toString();
    }
  }

  if (intPart.length > MAX_DIGITS) {
    return { ok: false, error: `That is more than ${MAX_DIGITS} digits — enter a smaller amount.` };
  }

  return { ok: true, rupees: intPart, paise, rounded };
}

/** Title Case, hyphen-aware: "twenty-three lakh" -> "Twenty-Three Lakh". */
export function titleCase(s) {
  return s.replace(/[a-z]+/g, (w) => w[0].toUpperCase() + w.slice(1));
}

/**
 * All the wordings for one parsed amount.
 * cheque  - what goes on the pre-printed "Rupees ______" line of a cheque.
 * invoice - lower-case, currency after the number, for contracts and invoices.
 * words   - the figure alone, no currency, paise read out after "point".
 */
export function amountWordings(rupees, paise, system = "indian") {
  const rupeeWords = integerToWords(rupees, system);
  if (rupeeWords === null) return null;
  const paiseWords = twoDigitsToWords(paise);

  const cheque = paise > 0
    ? `Rupees ${titleCase(rupeeWords)} and ${titleCase(paiseWords)} Paise Only`
    : `Rupees ${titleCase(rupeeWords)} Only`;

  const invoice = paise > 0
    ? `${rupeeWords} rupees and ${paiseWords} paise only`
    : `${rupeeWords} rupees only`;

  // Digit-by-digit after "point", matching the plain Number to Words converter.
  const words = paise > 0
    ? `${rupeeWords} point ${String(paise).padStart(2, "0").split("").map((d) => ONES[Number(d)]).join(" ")}`
    : rupeeWords;

  const figures = groupDigits(rupees, system) +
    (paise > 0 ? "." + String(paise).padStart(2, "0") : "");

  return { cheque, invoice, words, figures, rupeeWords, paiseWords };
}
