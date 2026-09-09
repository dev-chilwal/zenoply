// HTML character references — encoding and decoding, kept out of the component
// so the whole thing can be exercised in node. Same reasoning as
// escapeString.js, xmlFormat.js and jsonYaml.js.
//
// The named table is imported from escapeString.js rather than re-typed, so the
// String Escaper and this tool can never drift apart on what `&hellip;` means.
//
// Four things drive the design, and only the first is obvious:
//
//  1. Encoding is a choice, not a fixed answer. `&` `<` `>` `"` `'` have to be
//     encoded or the markup breaks; everything else is optional and depends on
//     where the file is going. So the caller says how far to go and which form
//     to prefer, rather than the tool guessing.
//  2. A named entity is not always available, and a name is not always safe.
//     `&eacute;` is understood by every parser; `&notin;` is HTML5-only. This
//     table is the HTML 4.01 set, so a code point with no name here falls back
//     to a numeric reference, which every parser has always understood.
//  3. Decoding has to follow the HTML tokenizer, not a regex. 106 legacy names
//     are valid *without* the closing semicolon — which is why `?a=1&copy=2`
//     renders as `?a=1©=2` — and whether that consumption happens depends on
//     whether the text is element content or an attribute value. Getting this
//     wrong is not academic: it is the single most common way a query string
//     silently mangles itself.
//  4. Where the table is a subset, refuse rather than guess. A reference that
//     closes with a semicolon but names something not in this table is left
//     exactly as it was found and reported, because the HTML5 table has 2231
//     names and a longest-prefix fallback would turn `&notin;` into `¬in;` —
//     a confidently wrong answer where "I do not know this one" is correct.

import { ENTITY_TO_CP } from "./escapeString.js";

const codePoints = (s) => Array.from(s);
const hex = (cp) => cp.toString(16).toUpperCase();

// ---------------------------------------------------------------------------
// Tables
// ---------------------------------------------------------------------------

// HTML5 keeps six ALL-CAPS aliases from the pre-HTML4 days. They are the only
// case variants in the whole table, so they are listed rather than derived.
const UPPER_ALIASES = { AMP: 38, COPY: 169, GT: 62, LT: 60, QUOT: 34, REG: 174 };

export const DECODE_TABLE = { ...ENTITY_TO_CP, ...UPPER_ALIASES };

// The 106 names a browser accepts with the semicolon missing. It is exactly the
// 96-name Latin-1 block (U+00A0-U+00FF), plus amp/lt/gt/quot and the six
// all-caps aliases — and, notably, NOT `apos`, which post-dates the rule. The
// set is derived from the code points rather than re-typed, so it cannot drift.
export const NO_SEMICOLON = (() => {
  const s = new Set(Object.keys(UPPER_ALIASES));
  for (const [name, cp] of Object.entries(ENTITY_TO_CP)) {
    if (cp >= 0xa0 && cp <= 0xff) s.add(name);
  }
  for (const name of ["amp", "lt", "gt", "quot"]) s.add(name);
  return s;
})();

// Longest name in the table, so the scanner knows when to stop looking.
const MAX_NAME = Object.keys(DECODE_TABLE).reduce((m, n) => Math.max(m, n.length), 0);

// Reverse map for encoding. Built from ENTITY_TO_CP in insertion order with
// first-name-wins, then corrected for the two code points people actually
// notice: U+0027 must stay numeric (see below) and the caps aliases must never
// win over their lowercase forms.
export const CP_TO_NAME = (() => {
  const m = {};
  for (const [name, cp] of Object.entries(ENTITY_TO_CP)) {
    if (!(cp in m)) m[cp] = name;
  }
  return m;
})();

// HTML5's numeric-reference replacement table. A page authored in Windows-1252
// but served as UTF-8 writes an em dash as `&#151;`, and every browser maps the
// 0x80-0x9F range to the Windows-1252 character rather than the C1 control it
// literally names. Duplicated from escapeString.js only because that copy is
// module-private; the values are the spec's.
const C1_REPLACEMENTS = {
  0x00: 0xfffd, 0x0d: 0x0d, 0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192,
  0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6,
  0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d,
  0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022,
  0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161,
  0x9b: 0x203a, 0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
};

// Characters that are invisible, or that look like an ordinary space while not
// being one. These are what people are chasing when a paste from Word or a CMS
// makes a line wrap in the wrong place or a search stop matching.
const INVISIBLE = {
  0x00a0: "no-break space",
  0x00ad: "soft hyphen",
  0x2000: "en quad", 0x2001: "em quad", 0x2002: "en space", 0x2003: "em space",
  0x2004: "three-per-em space", 0x2005: "four-per-em space",
  0x2006: "six-per-em space", 0x2007: "figure space", 0x2008: "punctuation space",
  0x2009: "thin space", 0x200a: "hair space",
  0x200b: "zero-width space", 0x200c: "zero-width non-joiner",
  0x200d: "zero-width joiner", 0x200e: "left-to-right mark",
  0x200f: "right-to-left mark",
  0x2028: "line separator", 0x2029: "paragraph separator",
  0x202a: "left-to-right embedding", 0x202b: "right-to-left embedding",
  0x202c: "pop directional formatting", 0x202d: "left-to-right override",
  0x202e: "right-to-left override",
  0x202f: "narrow no-break space", 0x205f: "medium mathematical space",
  0x2060: "word joiner", 0x3000: "ideographic space", 0xfeff: "zero-width no-break space",
};

const isSurrogate = (cp) => cp >= 0xd800 && cp <= 0xdfff;
const isAlnum = (c) => (c >= "0" && c <= "9") || (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");

// ---------------------------------------------------------------------------
// Encoding
// ---------------------------------------------------------------------------

export const SCOPES = [
  { value: "markup", label: "Only the five markup characters" },
  { value: "nonascii", label: "Markup + everything above plain ASCII" },
];

export const FORMS = [
  { value: "named", label: "Named where one exists — &copy;" },
  { value: "decimal", label: "Decimal — &#169;" },
  { value: "hex", label: "Hexadecimal — &#xA9;" },
];

function reference(cp, form) {
  if (form === "named" && cp in CP_TO_NAME) return "&" + CP_TO_NAME[cp] + ";";
  if (form === "decimal") return "&#" + cp + ";";
  return "&#x" + hex(cp) + ";";
}

/**
 * Encode text as HTML character references.
 *   scope "markup"   - only & < > " ' , which is all a browser requires
 *   scope "nonascii" - the above plus every code point past 0x7E
 *   form             - which shape to prefer for everything past 0x7E
 */
export function encodeEntities(s, opts = {}) {
  const { scope = "markup", form = "named" } = opts;
  const nonAscii = scope === "nonascii";
  const notes = [];
  const found = new Map();
  let out = "";

  for (const ch of codePoints(s)) {
    const cp = ch.codePointAt(0);
    if (cp in INVISIBLE) found.set(cp, INVISIBLE[cp]);

    if (ch === "&") { out += "&amp;"; continue; }
    if (ch === "<") { out += "&lt;"; continue; }
    if (ch === ">") { out += "&gt;"; continue; }
    if (ch === '"') { out += "&quot;"; continue; }
    // Deliberately numeric. `&apos;` was an XML entity that HTML did not define
    // until HTML5, so it is undefined in an XHTML document served as text/html
    // and in HTML 4 — `&#39;` is the one spelling every parser has understood.
    if (ch === "'") { out += "&#39;"; continue; }

    if (nonAscii && cp > 0x7e) { out += reference(cp, form); continue; }
    out += ch;
  }

  if (found.size) {
    const list = [...found].slice(0, 5)
      .map(([cp, name]) => `U+${hex(cp).padStart(4, "0")} ${name}`).join(", ");
    notes.push(
      nonAscii
        ? `Encoded ${found.size} invisible ${found.size === 1 ? "character" : "characters"} (${list}). These are the ones worth writing as references whatever else you do: they are impossible to see in an editor, and they decide where a line wraps and whether a search matches.`
        : `Heads up: this text contains ${found.size} invisible ${found.size === 1 ? "character" : "characters"} (${list}). They are being passed through as-is. Switch to "Markup + everything above plain ASCII" to write them as references so they are visible in the source.`
    );
  }
  return { text: out, notes };
}

// ---------------------------------------------------------------------------
// Decoding
// ---------------------------------------------------------------------------

export const CONTEXTS = [
  { value: "text", label: "Element text" },
  { value: "attribute", label: "Attribute value" },
];

function decodeNumeric(digits, isHex, state) {
  const cp = parseInt(digits, isHex ? 16 : 10);
  if (!Number.isFinite(cp)) return null;
  if (Object.prototype.hasOwnProperty.call(C1_REPLACEMENTS, cp)) {
    if (cp >= 0x80 && cp <= 0x9f) state.windows1252 = true;
    return String.fromCodePoint(C1_REPLACEMENTS[cp]);
  }
  // A reference past the Unicode range, or naming half of a surrogate pair, is
  // a parse error; the tokenizer emits U+FFFD rather than failing.
  if (cp > 0x10ffff || isSurrogate(cp)) { state.replaced = true; return "�"; }
  return String.fromCodePoint(cp);
}

function decodePass(s, context, state) {
  const attr = context === "attribute";
  let out = "";
  let i = 0;

  while (i < s.length) {
    if (s[i] !== "&") { out += s[i]; i++; continue; }

    // Numeric reference. The missing-semicolon rule is different here: unlike a
    // name, a numeric reference is consumed in an attribute value too.
    const num = /^&#(?:([xX])([0-9a-fA-F]+)|([0-9]+))(;?)/.exec(s.slice(i));
    if (num) {
      const isHex = Boolean(num[1]);
      const digits = isHex ? num[2] : num[3];
      const dec = decodeNumeric(digits, isHex, state);
      if (dec !== null) {
        if (!num[4]) state.noSemicolon = true;
        out += dec;
        i += num[0].length;
        state.count++;
        continue;
      }
    }

    // Named reference: read the alphanumeric run, then decide.
    let j = i + 1;
    while (j < s.length && j - i - 1 < MAX_NAME && isAlnum(s[j])) j++;
    const word = s.slice(i + 1, j);
    const terminated = s[j] === ";";

    if (word && terminated && Object.prototype.hasOwnProperty.call(DECODE_TABLE, word)) {
      out += String.fromCodePoint(DECODE_TABLE[word]);
      i = j + 1;
      state.count++;
      continue;
    }

    if (word && terminated) {
      // Closed with a semicolon but unknown to this table. See note 4 at the
      // top: passing it through is the only answer that cannot be wrong.
      state.unknown.add(word);
      out += s.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    if (word) {
      // No semicolon. Longest prefix that is one of the 106 legacy names wins.
      let k = Math.min(word.length, MAX_NAME);
      while (k > 0 && !NO_SEMICOLON.has(word.slice(0, k))) k--;
      if (k > 0) {
        const next = s[i + 1 + k];
        // HTML tokenizer, named character reference state: inside an attribute
        // value a semicolon-less reference followed by `=` or an alphanumeric is
        // NOT consumed. This is what keeps `?a=1&copy=2` intact in an href.
        if (attr && next !== undefined && (next === "=" || isAlnum(next))) {
          state.attrSaved.add(word.slice(0, k));
          out += s.slice(i, i + 1 + k);
        } else {
          out += String.fromCodePoint(DECODE_TABLE[word.slice(0, k)]);
          state.noSemicolon = true;
          state.count++;
        }
        i += 1 + k;
        continue;
      }
      if (Object.prototype.hasOwnProperty.call(DECODE_TABLE, word)) {
        // A real name, but one of the ~150 that a browser will not accept
        // without its semicolon. Left alone, because that is what a browser does.
        state.needSemicolon.add(word);
      }
    }

    out += "&";
    i++;
  }
  return out;
}

/**
 * Decode HTML character references.
 *   context "text" | "attribute" - changes how a semicolon-less name is read
 *   repeat                       - keep decoding until stable, for text that
 *                                  has been through an encoder more than once
 */
export function decodeEntities(s, opts = {}) {
  const { context = "text", repeat = false } = opts;
  const state = {
    count: 0, unknown: new Set(), needSemicolon: new Set(), attrSaved: new Set(),
    noSemicolon: false, windows1252: false, replaced: false,
  };

  let out = decodePass(s, context, state);
  let passes = 1;
  if (repeat) {
    // 8 is far past anything real; it exists so a pathological input cannot
    // spin. `&amp;amp;amp;x` needs three.
    while (passes < 8) {
      const next = decodePass(out, context, state);
      if (next === out) break;
      out = next;
      passes++;
    }
  }

  const notes = [];
  if (state.count) {
    notes.push(`Decoded ${state.count} character ${state.count === 1 ? "reference" : "references"}${passes > 1 ? ` over ${passes} passes` : ""}.`);
  }
  if (!repeat && decodePass(out, context, { ...state, unknown: new Set(), needSemicolon: new Set(), attrSaved: new Set() }) !== out) {
    notes.push("This text is still encoded after one pass, which means it was encoded twice — an `&amp;lt;` where an `<` was meant. Tick \"Keep decoding until nothing changes\" to unwind it fully.");
  }
  if (state.noSemicolon) {
    notes.push("Some references were missing their closing semicolon. A browser accepts that for 106 legacy names such as &nbsp and &copy, and for numeric references, so they were decoded — but it is a parse error, and the same text inside an attribute value would be read differently.");
  }
  if (state.attrSaved.size) {
    const list = [...state.attrSaved].slice(0, 4).map((n) => "&" + n).join(", ");
    notes.push(`Left alone: ${list}. In an attribute value a semicolon-less reference followed by "=" or a letter is not a character reference at all, which is exactly why a query string like ?a=1&copy=2 survives inside an href but turns into ?a=1©=2 as page text.`);
  }
  if (state.windows1252) {
    notes.push("A numeric reference in the 128-159 range was decoded to its Windows-1252 character rather than the C1 control it names — &#151; is an em dash, not U+0097. Browsers have always done this, and the HTML5 spec now requires it, because so many pages were authored in Windows-1252 and served as something else.");
  }
  if (state.replaced) {
    notes.push("A numeric reference named a value outside Unicode or half of a surrogate pair, which has no character; it was replaced with U+FFFD, the same as a browser would.");
  }
  if (state.needSemicolon.size) {
    const list = [...state.needSemicolon].slice(0, 4).map((n) => "&" + n).join(", ");
    notes.push(`Left alone: ${list}. These are real entity names, but only 106 legacy ones may drop the closing semicolon — everything else needs it, so a browser would show this text literally too.`);
  }
  if (state.unknown.size) {
    const list = [...state.unknown].slice(0, 6).map((n) => `&${n};`).join(", ");
    notes.push(`Left unchanged: ${list}. These names are not in this tool's HTML 4.01 table, so they were passed through rather than guessed at.`);
  }
  return { text: out, notes };
}

// ---------------------------------------------------------------------------
// Reference list for the UI
// ---------------------------------------------------------------------------

// Short descriptions for the ones people look up by meaning rather than by
// name. Everything else is listed by name and character alone.
const LABELS = {
  nbsp: "no-break space", amp: "ampersand", lt: "less-than", gt: "greater-than",
  quot: "double quote", apos: "apostrophe", copy: "copyright", reg: "registered",
  trade: "trademark", deg: "degree", euro: "euro", pound: "pound", yen: "yen",
  cent: "cent", curren: "currency", sect: "section", para: "pilcrow",
  middot: "middle dot", bull: "bullet", hellip: "ellipsis", mdash: "em dash",
  ndash: "en dash", lsquo: "left single quote", rsquo: "right single quote / apostrophe",
  ldquo: "left double quote", rdquo: "right double quote", laquo: "left guillemet",
  raquo: "right guillemet", times: "multiplication", divide: "division",
  plusmn: "plus-minus", frac12: "one half", frac14: "one quarter", frac34: "three quarters",
  larr: "left arrow", rarr: "right arrow", uarr: "up arrow", darr: "down arrow",
  harr: "left-right arrow", dagger: "dagger", permil: "per mille", micro: "micro",
  infin: "infinity", ne: "not equal", le: "less than or equal", ge: "greater than or equal",
  asymp: "approximately equal", radic: "square root", sum: "n-ary sum", prod: "n-ary product",
  int: "integral", shy: "soft hyphen", ensp: "en space", emsp: "em space",
  thinsp: "thin space", zwnj: "zero-width non-joiner", zwj: "zero-width joiner",
  iexcl: "inverted exclamation", iquest: "inverted question", oline: "overline",
  prime: "prime", Prime: "double prime", spades: "spade", clubs: "club",
  hearts: "heart", diams: "diamond", loz: "lozenge", brvbar: "broken bar",
  not: "not sign", macr: "macron", acute: "acute accent", cedil: "cedilla",
  crarr: "carriage return arrow", lArr: "left double arrow", uArr: "up double arrow",
  rArr: "right double arrow / implies", dArr: "down double arrow",
  hArr: "left-right double arrow / if and only if",
  forall: "for all", exist: "there exists", empty: "empty set",
  isin: "element of", notin: "not an element of", ni: "contains as member",
  lowast: "asterisk operator", prop: "proportional to", ang: "angle",
  and: "logical and", or: "logical or", there4: "therefore",
  sim: "similar to", cong: "congruent to", sub: "subset of", sup: "superset of",
  nsub: "not a subset of", sube: "subset of or equal to", supe: "superset of or equal to",
  oplus: "circled plus", otimes: "circled times", perp: "perpendicular",
  sdot: "dot operator", lang: "left angle bracket", rang: "right angle bracket",
  image: "imaginary part", real: "real part", weierp: "Weierstrass p / power set",
  alefsym: "aleph", thetasym: "theta symbol", upsih: "upsilon with hook",
  piv: "pi symbol",
  uml: "diaeresis", ordf: "feminine ordinal", ordm: "masculine ordinal",
  sup1: "superscript one", sup2: "superscript two", sup3: "superscript three",
  szlig: "sharp s", minus: "minus sign", lrm: "left-to-right mark", rlm: "right-to-left mark",
};

// One row per name in the table, sorted so the everyday ones come first: the
// five markup characters, then the labelled set, then everything else by code
// point. A flat alphabetical list is useless for browsing.
export const ENTITY_ROWS = (() => {
  const rows = Object.entries(ENTITY_TO_CP).map(([name, cp]) => ({
    name,
    cp,
    char: String.fromCodePoint(cp),
    label: LABELS[name] || "",
    dec: "&#" + cp + ";",
    hex: "&#x" + hex(cp) + ";",
  }));
  const FIRST = ["amp", "lt", "gt", "quot", "apos", "nbsp"];
  const rank = (r) => {
    const i = FIRST.indexOf(r.name);
    if (i >= 0) return [0, i];
    return [r.label ? 1 : 2, r.cp];
  };
  return rows.sort((a, b) => {
    const [ga, va] = rank(a);
    const [gb, vb] = rank(b);
    return ga - gb || va - vb || a.name.localeCompare(b.name);
  });
})();

export function searchEntities(q) {
  const s = q.trim().toLowerCase();
  if (!s) return ENTITY_ROWS;
  const bare = s.replace(/^&|;$/g, "");
  return ENTITY_ROWS.filter(
    (r) =>
      r.name.toLowerCase().includes(bare) ||
      r.label.includes(s) ||
      r.char === q.trim() ||
      String(r.cp) === bare ||
      hex(r.cp).toLowerCase() === bare.replace(/^(0x|u\+)/, "")
  );
}
