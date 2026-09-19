// Whitespace cleaning, kept out of the component so the character tables and
// the ordering can be exercised in node — same reasoning as sortText.js and
// htmlFormat.js.
//
// The premise of this tool is that "remove extra spaces" almost never means
// what the other tools implement. They run something like
// `text.replace(/ +/g, " ")`, which handles the one case a user could have
// fixed by hand, and silently does nothing to the case that actually sent them
// looking for a tool: text pasted out of Word, a PDF, a spreadsheet or a web
// page, where the gaps are **not** ASCII spaces at all. They are non-breaking
// spaces, figure spaces, ideographic spaces and zero-width characters. A tool
// that reports "no extra spaces found" over a line with visibly doubled gaps is
// worse than no tool, because it tells the user the problem is somewhere else.
//
// Four decisions shape this file:
//
//  1. **Exotic space characters are normalised to U+0020 before anything
//     collapses.** Otherwise a run like "a<NBSP> b" is two different characters
//     to the regex and survives the collapse untouched.
//  2. **Zero-width characters are deleted, not turned into spaces.** A
//     zero-width space inside a word ("he<ZWSP>llo") is a line-break hint, not
//     a gap; mapping it to U+0020 would insert a space that was never there and
//     break the word in two.
//  3. **ZWJ and ZWNJ are never touched by default, and are a separate opt-in.**
//     They are zero-width and invisible, so every "remove invisible characters"
//     tool sweeps them up — but they are load-bearing. U+200D joins the
//     codepoints of a family emoji, and in Devanagari and Perso-Arabic both
//     control whether a conjunct renders as a ligature or a half-form, so
//     deleting them corrupts Hindi text and shatters one emoji into three. They
//     get their own checkbox, off by default, with the risk stated.
//  4. **What was found is reported by name.** The diagnostic is the point: a
//     user who sees "4 no-break spaces (U+00A0)" now knows why their CSV column
//     would not parse. Counts come from the input, before any edit.
//
// A note on `\s`: JavaScript's `\s` is not the set below. It includes U+FEFF
// but excludes U+200B, which is exactly backwards for this job — the zero-width
// space is the one people paste and the byte-order mark is the one they do not
// type. So the sets here are written out explicitly rather than leaning on `\s`.

// Horizontal whitespace that is not a plain space or a tab. Every one of these
// renders as a gap of some width, so each is safe to map to U+0020.
// (Unicode General Category Zs, plus the two that are not Zs but behave as
// gaps: U+0009 is handled separately as a tab, U+180E is deprecated-to-Cf.)
const EXOTIC_SPACES = [
  [0x00a0, "No-break space"],
  [0x1680, "Ogham space mark"],
  [0x2000, "En quad"],
  [0x2001, "Em quad"],
  [0x2002, "En space"],
  [0x2003, "Em space"],
  [0x2004, "Three-per-em space"],
  [0x2005, "Four-per-em space"],
  [0x2006, "Six-per-em space"],
  [0x2007, "Figure space"],
  [0x2008, "Punctuation space"],
  [0x2009, "Thin space"],
  [0x200a, "Hair space"],
  [0x202f, "Narrow no-break space"],
  [0x205f, "Medium mathematical space"],
  [0x3000, "Ideographic space"],
];

// Zero-width and invisible characters that carry no meaning worth keeping in
// plain text. Deleted outright rather than replaced with a space.
const INVISIBLES = [
  [0x00ad, "Soft hyphen"],
  [0x180e, "Mongolian vowel separator"],
  [0x200b, "Zero-width space"],
  [0x200e, "Left-to-right mark"],
  [0x200f, "Right-to-left mark"],
  [0x2060, "Word joiner"],
  [0xfeff, "Byte-order mark"],
];

// Deliberately separate from INVISIBLES — see decision 3 above.
const JOINERS = [
  [0x200c, "Zero-width non-joiner"],
  [0x200d, "Zero-width joiner"],
];

// Line separators that are not U+000A. Always normalised, because every
// per-line operation below would otherwise treat a whole paragraph as one line.
const LINE_SEPARATORS = [
  [0x000d, "Carriage return"],
  [0x0085, "Next line"],
  [0x2028, "Line separator"],
  [0x2029, "Paragraph separator"],
];

const TAB = 0x0009;

const label = (cp, name) =>
  `${name} (U+${cp.toString(16).toUpperCase().padStart(4, "0")})`;

const charClass = (table) =>
  new RegExp(`[${table.map(([cp]) => `\\u{${cp.toString(16)}}`).join("")}]`, "gu");

const RE_EXOTIC = charClass(EXOTIC_SPACES);
const RE_INVISIBLE = charClass(INVISIBLES);
const RE_JOINER = charClass(JOINERS);

// Built from the table above rather than written as literal characters: a
// source file holding a raw U+2028 is exactly the hazard this tool exists to
// diagnose, and an editor that silently normalised it on save would change the
// regex without showing anything in the diff. CRLF is its own alternative so a
// Windows line ending collapses to one newline rather than two.
const RE_LINE_SEP = new RegExp(`\\r\\n|${charClass(LINE_SEPARATORS).source}`, "gu");

// Every named character, for the findings report. Tabs are included because a
// tab is a legitimate thing to be surprised by in text you are about to paste
// into a form.
const ALL_NAMED = [
  ...EXOTIC_SPACES,
  ...INVISIBLES,
  ...JOINERS,
  ...LINE_SEPARATORS,
  [TAB, "Tab"],
];

const NAMES = new Map(ALL_NAMED);
const IS_JOINER = new Set(JOINERS.map(([cp]) => cp));
const IS_INVISIBLE = new Set(INVISIBLES.map(([cp]) => cp));

/**
 * Count each named character present in the text, for the diagnostic readout.
 * Run against the raw input so the report describes what arrived, not what
 * survived.
 *
 * One pass over the string rather than one pass per character class: a pasted
 * spreadsheet column is easily a megabyte, and thirty scans of it is thirty
 * times the work for the same answer.
 *
 * @returns {{ name: string, count: number, removed: boolean }[]} sorted by count
 */
export function findWhitespace(text, opts = {}) {
  const { removeInvisibles = true, removeJoiners = false, collapse = "single" } = opts;

  const counts = new Map();
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (NAMES.has(cp)) counts.set(cp, (counts.get(cp) || 0) + 1);
  }

  const out = [];
  for (const [cp, count] of counts) {
    // Whether this run of the tool will act on it, so the report can say
    // "found and removed" rather than just "found".
    let removed = true;
    if (IS_JOINER.has(cp)) removed = removeJoiners;
    else if (IS_INVISIBLE.has(cp)) removed = removeInvisibles;
    else if (cp === TAB) removed = collapse !== "keep";
    out.push({ name: label(cp, NAMES.get(cp)), count, removed });
  }
  return out.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/**
 * Clean the whitespace in a block of text.
 *
 * @param {string} text
 * @param {object} opts
 *   collapse         "single" runs of horizontal whitespace to one space (default),
 *                    "none" delete all horizontal whitespace, "keep" leave it alone
 *   trimLines        strip leading/trailing whitespace from every line (default true)
 *   blankLines       "keep" | "collapse" (many blank lines to one, default) | "remove"
 *   normalizeSpaces  map exotic space characters to U+0020 (default true)
 *   removeInvisibles delete zero-width and directional marks (default true)
 *   removeJoiners    also delete ZWJ/ZWNJ — corrupts emoji and Indic text (default false)
 * @returns {{ text: string, findings: object[], stats: object }}
 */
export function cleanWhitespace(text, opts = {}) {
  const {
    collapse = "single",
    trimLines = true,
    blankLines = "collapse",
    normalizeSpaces = true,
    removeInvisibles = true,
    removeJoiners = false,
  } = opts;

  const findings = findWhitespace(text, { removeInvisibles, removeJoiners, collapse });
  const charsBefore = text.length;

  // 1. One kind of line break. Done unconditionally: a CR-only file from an old
  //    Mac, or a U+2028 pasted out of a JS string, is a single line to every
  //    regex below and no per-line option would fire.
  let out = text.replace(RE_LINE_SEP, "\n");

  // 2. Invisibles go before the collapse, not after. "a<space><ZWSP><space>b"
  //    is not a run of horizontal whitespace while the ZWSP sits in the middle
  //    of it, so collapsing first would leave two spaces behind.
  if (removeInvisibles) out = out.replace(RE_INVISIBLE, "");
  if (removeJoiners) out = out.replace(RE_JOINER, "");

  // 3. Exotic gaps become plain spaces, so step 4 sees one character class.
  if (normalizeSpaces) out = out.replace(RE_EXOTIC, " ");

  let linesTrimmed = 0;
  let runsCollapsed = 0;
  let lines = out.split("\n");

  if (collapse === "single") {
    // `[ \t]+`, not `[ \t]{2,}`: a lone tab is a gap of the wrong width in text
    // headed for a form field or a CSV cell, and leaving it behind would also
    // make the findings report lie, since it says the tab was removed. A run
    // that is already one space rewrites to itself and is not counted.
    lines = lines.map((l) =>
      l.replace(/[ \t]+/g, (run) => {
        if (run !== " ") runsCollapsed++;
        return " ";
      })
    );
  } else if (collapse === "none") {
    lines = lines.map((l) =>
      l.replace(/[ \t]+/g, () => {
        runsCollapsed++;
        return "";
      })
    );
  }

  if (trimLines) {
    lines = lines.map((l) => {
      const t = l.replace(/^[ \t]+|[ \t]+$/g, "");
      if (t !== l) linesTrimmed++;
      return t;
    });
  }

  const blankBefore = lines.filter((l) => l.trim() === "").length;
  if (blankLines === "remove") {
    lines = lines.filter((l) => l.trim() !== "");
  } else if (blankLines === "collapse") {
    // A run of blank lines becomes exactly one, which is the paragraph break a
    // reader expects. Leading and trailing runs collapse to nothing instead —
    // an empty first line is not a paragraph break.
    const kept = [];
    for (const l of lines) {
      if (l.trim() === "" && kept.length > 0 && kept[kept.length - 1].trim() === "") continue;
      kept.push(l);
    }
    while (kept.length && kept[0].trim() === "") kept.shift();
    while (kept.length && kept[kept.length - 1].trim() === "") kept.pop();
    lines = kept;
  }
  const blankRemoved = blankBefore - lines.filter((l) => l.trim() === "").length;

  const result = lines.join("\n");
  return {
    text: result,
    findings,
    stats: {
      charsBefore,
      charsAfter: result.length,
      removed: charsBefore - result.length,
      linesTrimmed,
      runsCollapsed,
      blankRemoved,
      lines: lines.length,
    },
  };
}
