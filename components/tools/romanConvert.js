// Roman numeral conversion, kept out of the component so the whole range can be
// round-tripped in node — the same reasoning as baseConvert.js and jsonYaml.js.
//
// Three decisions shape this file:
//
//  1. **Reading is separated from judging.** Almost every online converter does
//     one of two unhelpful things with `IIII`, `IL` or `MIM`: it silently
//     returns a number as if the spelling were fine, or it refuses outright
//     with "invalid". Both throw away what the reader actually needs, which is
//     *the value* and *the reason it is not the standard spelling*. So the
//     parser here is deliberately lenient — it returns a number for anything
//     built from the seven letters — and canonicality is decided separately, by
//     re-encoding that number and comparing. Round-tripping is the only
//     definition of "standard form" that cannot drift out of step with the
//     encoder, because it *is* the encoder.
//  2. **Subtraction is grouped, not pairwise.** The rule usually taught is
//     "if a letter is smaller than the one after it, subtract it", applied one
//     letter at a time. That misreads the attested inscriptional forms: `XXC`
//     (80) and `IIC` (98) turn into 100 under the pairwise rule, because the
//     first X or I is compared to the second and added. Runs of equal letters
//     are collected first and the whole run is subtracted, which reads those
//     the way a Latin epigrapher does — and leaves the canonical answers
//     untouched, since a canonical numeral never has a run longer than one on
//     the subtracting side.
//  3. **Above 3,999 the vinculum is used rather than a row of Ms.** A bar over
//     a numeral multiplies it by 1,000, which is the historically attested way
//     to write large numbers and keeps 4,000 as two letters instead of four Ms
//     (a form no Roman used). It costs something: the bar only survives a copy
//     and paste as a combining character (U+0305), which not every font draws
//     well, so the value is exported with the combining marks and drawn on
//     screen with a CSS overline, and the parser accepts either.

export const SYMBOLS = [
  { sym: "I", val: 1 },
  { sym: "V", val: 5 },
  { sym: "X", val: 10 },
  { sym: "L", val: 50 },
  { sym: "C", val: 100 },
  { sym: "D", val: 500 },
  { sym: "M", val: 1000 },
];

const VALUES = Object.fromEntries(SYMBOLS.map((s) => [s.sym, s.val]));

// The only letters that may be written more than once in a row, and the only
// ones that may subtract — and, for each, the only letters they subtract from.
const REPEATABLE = new Set(["I", "X", "C", "M"]);
const SUBTRACT_FROM = { I: ["V", "X"], X: ["L", "C"], C: ["D", "M"] };

// Greedy pairs, largest first. The six subtractive entries are what make the
// greedy walk produce the standard spelling rather than IIII / VIIII.
const TABLE = [
  [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
  [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
  [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
];

export const MAX_STANDARD = 3999;
export const MAX_VALUE = 3999999; // 3,999 barred + 999 plain
export const OVERLINE = "̅"; // COMBINING OVERLINE

// 1..3999 in the standard subtractive spelling, plus the greedy decomposition
// that produced it — the steps are what the "how it adds up" line shows.
function encodeBasic(n) {
  let text = "";
  const steps = [];
  for (const [value, sym] of TABLE) {
    while (n >= value) {
      text += sym;
      steps.push({ text: sym, value });
      n -= value;
    }
  }
  return { text, steps };
}

/**
 * Convert a positive integer to Roman numerals.
 *
 * Returns `segments`, not a plain string, because a barred group has to be
 * drawn differently from an unbarred one: [{ text: "IV", bars: 1 }] is 4,000.
 */
export function toRoman(n) {
  if (typeof n !== "number" || !Number.isFinite(n)) {
    return { ok: false, error: "Enter a whole number." };
  }
  if (!Number.isInteger(n)) {
    return {
      ok: false,
      error:
        "Roman numerals only write whole numbers — there is no way to spell a decimal. Round it first.",
    };
  }
  if (n === 0) {
    return {
      ok: false,
      error:
        "There is no Roman numeral for zero. The Romans had no symbol for it; medieval scribes writing in Latin used the word nulla instead.",
    };
  }
  if (n < 0) {
    return {
      ok: false,
      error: "Roman numerals have no sign, so a negative number cannot be written.",
    };
  }
  if (n > MAX_VALUE) {
    return {
      ok: false,
      error: `The largest number this writes is ${MAX_VALUE.toLocaleString(
        "en-US"
      )} — a bar over MMMCMXCIX followed by CMXCIX. Above that a second bar would be needed, and there is no notation people agree on.`,
    };
  }

  if (n <= MAX_STANDARD) {
    const basic = encodeBasic(n);
    return { ok: true, segments: [{ text: basic.text, bars: 0 }], steps: basic.steps, standard: true };
  }

  const thousands = Math.floor(n / 1000);
  const rest = n % 1000;
  const high = encodeBasic(thousands);
  const low = rest > 0 ? encodeBasic(rest) : { text: "", steps: [] };

  const segments = [{ text: high.text, bars: 1 }];
  if (rest > 0) segments.push({ text: low.text, bars: 0 });

  const steps = [
    ...high.steps.map((s) => ({ text: s.text, value: s.value * 1000, bars: 1 })),
    ...low.steps.map((s) => ({ ...s, bars: 0 })),
  ];
  return { ok: true, segments, steps, standard: false };
}

/** Segments as copyable text: barred letters carry a combining overline. */
export function segmentsToText(segments) {
  return segments
    .map((s) => (s.bars ? s.text.split("").map((c) => c + OVERLINE).join("") : s.text))
    .join("");
}

/** Segments with the bars dropped — what a plain-ASCII field can hold. */
export function segmentsToPlain(segments) {
  return segments.map((s) => s.text).join("");
}

// ---------------------------------------------------------------------------
// Reading a numeral
// ---------------------------------------------------------------------------

// Everything a person plausibly types or pastes between two numerals of a date.
const SEPARATORS = /[\s.·•/\-–—,;|]+/;

function tokenize(text) {
  const tokens = [];
  for (const ch of text) {
    // A combining mark attaches to the letter already pushed.
    if (ch === OVERLINE || ch === "̄" || ch === "‾") {
      if (!tokens.length) return { error: "A bar has to sit over a letter." };
      tokens[tokens.length - 1].bars = 1;
      continue;
    }
    const sym = ch.toUpperCase();
    if (!(sym in VALUES)) return { error: `"${ch}" is not a Roman numeral letter. Use only I, V, X, L, C, D and M.` };
    tokens.push({ sym, bars: 0 });
  }
  return { tokens };
}

/**
 * Read one numeral leniently and report how far it is from the standard form.
 *
 * `value` is always the number the writer meant, even for a spelling nobody
 * would call correct; `issues` says what is wrong with the spelling and
 * `canonical` gives the form that means the same thing.
 */
export function parseRoman(raw) {
  const text = String(raw).trim();
  if (!text) return { ok: false, empty: true };

  const { tokens, error } = tokenize(text);
  if (error) return { ok: false, error };

  // Runs of equal effective value. M and a barred M are different values and so
  // never share a run, which is what keeps M̅M readable as 1,001,000.
  const runs = [];
  for (const t of tokens) {
    const value = VALUES[t.sym] * (t.bars ? 1000 : 1);
    const last = runs[runs.length - 1];
    if (last && last.value === value) last.count += 1;
    else runs.push({ sym: t.sym, bars: t.bars, value, count: 1 });
  }

  let value = 0;
  const subtractions = [];
  runs.forEach((run, i) => {
    const next = runs[i + 1];
    const total = run.value * run.count;
    if (next && run.value < next.value) {
      value -= total;
      subtractions.push({ run, next });
    } else {
      value += total;
    }
  });

  if (value <= 0) {
    return {
      ok: false,
      error:
        "Read in order, that subtracts more than it adds and comes out at or below zero — there is no number it can mean.",
    };
  }

  const issues = [];
  for (const run of runs) {
    const label = run.sym + (run.bars ? " with a bar" : "");
    if (REPEATABLE.has(run.sym)) {
      if (run.count > 3) {
        issues.push(
          `${label} is written ${run.count} times in a row. I, X, C and M repeat at most three times; a fourth is written as a subtraction instead.`
        );
      }
    } else if (run.count > 1) {
      issues.push(
        `${label} is written ${run.count} times. V, L and D are never repeated — two of them make the next letter up.`
      );
    }
  }
  for (const { run, next } of subtractions) {
    if (run.count > 1) {
      issues.push(
        `${run.sym.repeat(run.count)} is subtracted from ${next.sym}. Only a single letter ever subtracts.`
      );
    } else if (!SUBTRACT_FROM[run.sym]) {
      issues.push(
        `${run.sym} is used to subtract from ${next.sym}. Only I, X and C subtract; V, L and D never do.`
      );
    } else if (!SUBTRACT_FROM[run.sym].includes(next.sym) || run.bars !== next.bars) {
      const [a, b] = SUBTRACT_FROM[run.sym];
      issues.push(
        `${run.sym}${next.sym} subtracts ${run.sym} from ${next.sym}, which is too big a jump. ${run.sym} only subtracts from ${a} or ${b}, giving ${run.sym}${a} and ${run.sym}${b}.`
      );
    }
  }

  const encoded = toRoman(value);
  const canonicalText = encoded.ok ? segmentsToText(encoded.segments) : null;
  // Normalised back to the same shape the encoder emits — upper case, and a
  // combining overline for every barred letter — so the comparison below is
  // about the spelling and not about the case or the bar character used.
  const typed = tokens.map((t) => t.sym + (t.bars ? OVERLINE : "")).join("");
  const isCanonical = canonicalText !== null && typed === canonicalText;

  // Descending order broken, or simply a longer spelling than it needs to be —
  // real but not covered by any of the specific rules above.
  if (!isCanonical && issues.length === 0 && canonicalText) {
    issues.push(
      `The letters are not in the order the standard form uses, so the same value is written more briefly as ${canonicalText}.`
    );
  }

  return {
    ok: true,
    value,
    runs,
    typed,
    issues,
    isCanonical,
    canonicalSegments: encoded.ok ? encoded.segments : null,
    canonicalText,
    oversize: !encoded.ok,
  };
}

/**
 * The arithmetic a numeral describes, written the way it is read.
 *
 * A subtractive run is normally shown bracketed with the letter it is taken
 * from — MCMXCIV as 1,000 + (1,000 − 100) + (100 − 10) + (5 − 1) — which is how
 * anyone explains it on paper. That bracketing is only faithful while no run is
 * both subtracted and subtracted from: in IXC the X is taken off the C *and*
 * has the I taken off it, so the value is 100 − 10 − 1 = 89 and any pairing
 * would show a different total from the one reported. Chained subtraction
 * therefore falls back to a plain signed sum, which is always exact.
 */
export function readingExpression(runs) {
  const num = (n) => n.toLocaleString("en-US");
  const sub = runs.map((r, i) => Boolean(runs[i + 1] && r.value < runs[i + 1].value));
  const chained = sub.some((s, i) => s && sub[i + 1]);

  if (chained) {
    return runs
      .map((r, i) => (sub[i] ? "− " : "+ ") + num(r.value * r.count))
      .join(" ")
      .replace(/^\+ /, "");
  }

  const terms = [];
  for (let i = 0; i < runs.length; i++) {
    const total = runs[i].value * runs[i].count;
    if (sub[i]) {
      const next = runs[i + 1].value * runs[i + 1].count;
      terms.push(`(${num(next)} − ${num(total)})`);
      i += 1; // the letter subtracted from is spent by the bracket
    } else {
      terms.push(num(total));
    }
  }
  return terms.join(" + ");
}

/** Split an input on separators and read every numeral in it. */
export function parseRomanInput(raw) {
  const parts = String(raw).trim().split(SEPARATORS).filter(Boolean);
  if (!parts.length) return { parts: [] };
  return { parts: parts.slice(0, 12).map((p) => ({ text: p, ...parseRoman(p) })) };
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export const DATE_ORDERS = [
  { id: "dmy", label: "Day · Month · Year", keys: ["d", "m", "y"] },
  { id: "mdy", label: "Month · Day · Year", keys: ["m", "d", "y"] },
  { id: "ymd", label: "Year · Month · Day", keys: ["y", "m", "d"] },
];

export const DATE_SEPARATORS = [
  { id: "middot", label: "·  middle dot", ch: "·" },
  { id: "dot", label: ".  full stop", ch: "." },
  { id: "slash", label: "/  slash", ch: "/" },
  { id: "dash", label: "–  en dash", ch: "–" },
  { id: "space", label: "(space)", ch: " " },
];

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysInMonth = (y, m) =>
  [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Convert an ISO `YYYY-MM-DD` date to three numerals joined by a separator.
 *
 * The day is checked against the month rather than just against 31, because a
 * date tattoo that reads 29·II·1900 is a date that never happened.
 */
export function dateToRoman(iso, orderId, sepId) {
  const m = String(iso || "").match(/^(\d{1,6})-(\d{2})-(\d{2})$/);
  if (!m) return { ok: false, empty: true };

  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);

  if (y < 1) {
    return { ok: false, error: "There is no year zero, and Roman numerals cannot write a negative year." };
  }
  if (mo < 1 || mo > 12) return { ok: false, error: "The month has to be between 1 and 12." };
  if (d < 1 || d > daysInMonth(y, mo)) {
    return {
      ok: false,
      error: `${MONTH_NAMES[mo - 1] || "That month"} ${y} has ${
        mo >= 1 && mo <= 12 ? daysInMonth(y, mo) : 31
      } days, so that date does not exist.`,
    };
  }
  if (y > MAX_STANDARD) {
    return { ok: false, error: `Years above ${MAX_STANDARD} need a bar over the numeral; pick the Number tab for those.` };
  }

  const piece = { d: toRoman(d), m: toRoman(mo), y: toRoman(y) };
  const order = DATE_ORDERS.find((o) => o.id === orderId) || DATE_ORDERS[0];
  const sep = DATE_SEPARATORS.find((s) => s.id === sepId) || DATE_SEPARATORS[0];

  const parts = order.keys.map((k) => ({
    key: k,
    label: k === "d" ? "Day" : k === "m" ? "Month" : "Year",
    number: k === "d" ? d : k === "m" ? mo : y,
    text: segmentsToPlain(piece[k].segments),
  }));

  return {
    ok: true,
    text: parts.map((p) => p.text).join(sep.ch),
    parts,
    separator: sep.ch,
    longDate: `${d} ${MONTH_NAMES[mo - 1]} ${y}`,
  };
}

/**
 * Read three numbers back as a date — the reverse of the tab above, for someone
 * holding a numeral date and wanting to know which day it is.
 *
 * Every field order that yields a real date is returned, because the answer is
 * genuinely ambiguous when both of the small numbers are 12 or under: V·XI·MMXX
 * is 5 November 2020 read day-first and 11 May 2020 read month-first, and there
 * is nothing in the numerals themselves that settles it.
 */
export function readRomanDate(values) {
  if (!Array.isArray(values) || values.length !== 3 || values.some((v) => !Number.isInteger(v))) {
    return [];
  }
  const readings = [];
  const seen = new Set();
  for (const order of DATE_ORDERS) {
    const map = {};
    order.keys.forEach((k, i) => { map[k] = values[i]; });
    const { d, m, y } = map;
    if (y < 1 || y > MAX_STANDARD || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) continue;
    const label = `${d} ${MONTH_NAMES[m - 1]} ${y}`;
    if (seen.has(label)) continue;
    seen.add(label);
    readings.push({ order: order.id, orderLabel: order.label, label });
  }
  return readings;
}
