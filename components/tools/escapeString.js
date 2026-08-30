// String escaping / unescaping for eight target formats, kept out of the
// component so it can be exercised in node against the real consumers of each
// format (JSON.parse, the JS lexer, python's csv and html modules, expat).
// Same reasoning as rupeesWords.js, jsonYaml.js and xmlFormat.js.
//
// Four things drive the design, and none of them are obvious:
//
//  1. Escaping is per *target*, not per string. The same apostrophe is nothing
//     in JSON, `&#39;` in an HTML attribute, `&apos;` in XML, `''` in SQL and
//     `'\''` in a shell command. There is no such thing as a generally escaped
//     string, so every function here names the exact context it produces.
//  2. Character-by-character is not a stylistic choice. The classic escaper bug
//     is a chain of sequential replaces where `&` is not done first, so `<`
//     becomes `&lt;` and then `&amp;lt;`. Building the output one code point at
//     a time cannot have that bug, and it is also the only way to handle lone
//     surrogates and astral characters correctly.
//  3. Not every character can be escaped. XML 1.0 cannot hold most control
//     characters *at all* - `&#1;` is not a valid escape, it is a parse error -
//     so those are reported rather than silently emitted, which is what a
//     naive five-entity replace does.
//  4. Unescaping is not always the inverse. `\d` in a regex and `\n` in a JS
//     string mean different things from the character after the backslash, so
//     regex and shell offer escaping only; claiming to reverse them would be
//     inventing an answer.

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const hex4 = (n) => n.toString(16).padStart(4, "0");
const hex2 = (n) => n.toString(16).padStart(2, "0").toUpperCase();

// \uXXXX for a BMP code point; a surrogate pair for anything above it, since
// \uXXXX cannot express an astral character in JSON or in pre-ES6 JavaScript.
function uEscape(cp) {
  if (cp > 0xffff) {
    const v = cp - 0x10000;
    return "\\u" + hex4(0xd800 + (v >> 10)) + "\\u" + hex4(0xdc00 + (v & 0x3ff));
  }
  return "\\u" + hex4(cp);
}

const isSurrogate = (cp) => cp >= 0xd800 && cp <= 0xdfff;

// Array.from splits by code point, so an astral character is one entry and a
// lone surrogate (which is what a truncated string leaves behind) is its own.
const codePoints = (s) => Array.from(s);

// ---------------------------------------------------------------------------
// Format registry — drives the UI and says plainly what can be reversed.
// ---------------------------------------------------------------------------

export const FORMATS = [
  { value: "json", label: "JSON string", unescape: true },
  { value: "js", label: "JavaScript / TypeScript string", unescape: true },
  { value: "html", label: "HTML", unescape: true },
  { value: "xml", label: "XML", unescape: true },
  { value: "csv", label: "CSV field", unescape: true },
  { value: "sql", label: "SQL string literal", unescape: true },
  { value: "regex", label: "Regular expression", unescape: false },
  { value: "shell", label: "Shell command (POSIX)", unescape: false },
];

export const canUnescape = (format) =>
  !!FORMATS.find((f) => f.value === format)?.unescape;

// ---------------------------------------------------------------------------
// JSON  (RFC 8259)
// ---------------------------------------------------------------------------

export function escapeJson(s, opts = {}) {
  const { asciiOnly = false, escapeSlash = false, embedSafe = false } = opts;
  const notes = [];
  let lone = 0;
  let out = "";
  for (const ch of codePoints(s)) {
    const cp = ch.codePointAt(0);
    if (ch === '"') { out += '\\"'; continue; }
    if (ch === "\\") { out += "\\\\"; continue; }
    if (ch === "/" && escapeSlash) { out += "\\/"; continue; }
    if (cp === 0x08) { out += "\\b"; continue; }
    if (cp === 0x09) { out += "\\t"; continue; }
    if (cp === 0x0a) { out += "\\n"; continue; }
    if (cp === 0x0c) { out += "\\f"; continue; }
    if (cp === 0x0d) { out += "\\r"; continue; }
    // JSON forbids a raw control character inside a string; there is no choice
    // about these regardless of the options.
    if (cp < 0x20) { out += uEscape(cp); continue; }
    // A lone surrogate cannot be encoded as UTF-8, so RFC 8259 has no way to
    // write one literally. Escaping it is what "well-formed JSON.stringify"
    // (ES2019) settled on, and every parser reads it back unchanged.
    if (isSurrogate(cp)) { lone++; out += uEscape(cp); continue; }
    if (embedSafe && (ch === "<" || ch === ">" || ch === "&")) { out += uEscape(cp); continue; }
    // Legal in JSON, fatal in JavaScript before ES2019 - the JSONP footgun.
    if (embedSafe && (cp === 0x2028 || cp === 0x2029)) { out += uEscape(cp); continue; }
    if (asciiOnly && cp > 0x7e) { out += uEscape(cp); continue; }
    out += ch;
  }
  if (lone) {
    notes.push(
      `${lone} unpaired surrogate ${lone === 1 ? "character was" : "characters were"} escaped as \\u form — a lone surrogate has no UTF-8 encoding, so it cannot be written literally in JSON.`
    );
  }
  return { text: out, notes };
}

// Shared escape-sequence reader for JSON and JavaScript. `js` widens it to the
// sequences JSON does not have: \v, \0, \xNN, \u{...} and line continuations.
function readEscapes(s, js) {
  let out = "";
  let i = 0;
  const n = s.length;
  const fail = (msg, at) => {
    let line = 1, last = -1;
    for (let k = 0; k < at; k++) if (s[k] === "\n") { line++; last = k; }
    throw new Error(`${msg} (line ${line}, column ${at - last})`);
  };
  while (i < n) {
    const c = s[i];
    if (c !== "\\") { out += c; i++; continue; }
    const start = i;
    i++;
    if (i >= n) fail("A backslash at the end of the input escapes nothing", start);
    const e = s[i++];
    if (e === '"') out += '"';
    else if (e === "'" && js) out += "'";
    else if (e === "`" && js) out += "`";
    else if (e === "\\") out += "\\";
    else if (e === "/") out += "/";
    else if (e === "b") out += "\b";
    else if (e === "f") out += "\f";
    else if (e === "n") out += "\n";
    else if (e === "r") out += "\r";
    else if (e === "t") out += "\t";
    else if (e === "u") {
      if (js && s[i] === "{") {
        const end = s.indexOf("}", i);
        if (end < 0) fail("Unterminated \\u{...} escape", start);
        const body = s.slice(i + 1, end);
        if (!/^[0-9a-fA-F]{1,6}$/.test(body)) fail(`\\u{${body}} is not a valid code point escape`, start);
        const cp = parseInt(body, 16);
        if (cp > 0x10ffff) fail(`\\u{${body}} is above the highest code point U+10FFFF`, start);
        out += String.fromCodePoint(cp);
        i = end + 1;
      } else {
        const h = s.slice(i, i + 4);
        if (!/^[0-9a-fA-F]{4}$/.test(h)) fail(`\\u must be followed by four hex digits, found "${s.slice(i, i + 4)}"`, start);
        out += String.fromCharCode(parseInt(h, 16));
        i += 4;
      }
    } else if (js && e === "x") {
      const h = s.slice(i, i + 2);
      if (!/^[0-9a-fA-F]{2}$/.test(h)) fail(`\\x must be followed by two hex digits, found "${s.slice(i, i + 2)}"`, start);
      out += String.fromCharCode(parseInt(h, 16));
      i += 2;
    } else if (js && e === "v") out += "\v";
    else if (js && e === "0" && !/[0-9]/.test(s[i] || "")) out += "\0";
    else if (js && (e === "\n" || e.charCodeAt(0) === 0x2028 || e.charCodeAt(0) === 0x2029)) {
      /* line continuation: the backslash and the break both vanish */
    } else if (js && e === "\r") {
      if (s[i] === "\n") i++;
    } else if (js) {
      // JavaScript's actual rule for an unrecognised escape: the backslash is
      // dropped and the character stands for itself. \q is the letter q.
      out += e;
    } else {
      fail(`\\${e} is not a valid JSON escape sequence`, start);
    }
  }
  return out;
}

// A pasted literal usually still has its quotes on. Removing a matched pair is
// what people expect; anything else is left alone so nothing is silently lost.
function stripQuotes(s, chars) {
  const t = s.trim();
  if (t.length >= 2 && chars.includes(t[0]) && t[t.length - 1] === t[0]) {
    return { text: t.slice(1, -1), stripped: true };
  }
  return { text: s, stripped: false };
}

export function unescapeJson(s) {
  const { text, stripped } = stripQuotes(s, '"');
  const notes = stripped ? ["The surrounding double quotes were treated as the string delimiters and removed."] : [];
  return { text: readEscapes(text, false), notes };
}

// ---------------------------------------------------------------------------
// JavaScript / TypeScript
// ---------------------------------------------------------------------------

export function escapeJs(s, opts = {}) {
  const { quote = "double", asciiOnly = false, scriptSafe = false, wrap = false } = opts;
  const q = quote === "single" ? "'" : quote === "backtick" ? "`" : '"';
  const chars = codePoints(s);
  const notes = [];
  let out = "";
  for (let k = 0; k < chars.length; k++) {
    const ch = chars[k];
    const cp = ch.codePointAt(0);
    if (ch === "\\") { out += "\\\\"; continue; }
    if (ch === q) { out += "\\" + q; continue; }
    // In a template literal `${` opens an interpolation, so the dollar has to
    // go even though it is an ordinary character everywhere else.
    if (quote === "backtick" && ch === "$" && chars[k + 1] === "{") { out += "\\$"; continue; }
    if (cp === 0x08) { out += "\\b"; continue; }
    if (cp === 0x09) { out += "\\t"; continue; }
    if (cp === 0x0a) { out += "\\n"; continue; }
    if (cp === 0x0b) { out += "\\v"; continue; }
    if (cp === 0x0c) { out += "\\f"; continue; }
    if (cp === 0x0d) { out += "\\r"; continue; }
    // \0 is legal but becomes a legacy octal escape - a strict-mode syntax
    // error - the moment a digit follows it, so \x00 is written instead.
    if (cp < 0x20 || cp === 0x7f) { out += "\\x" + hex2(cp); continue; }
    // Legal in a string literal only since ES2019. Older engines treat them as
    // line terminators and the literal simply fails to parse.
    if (cp === 0x2028 || cp === 0x2029) { out += "\\u" + hex4(cp); continue; }
    if (isSurrogate(cp)) { out += uEscape(cp); continue; }
    // The HTML parser does not know JavaScript: a literal </script inside an
    // inline script ends the block, string or not.
    if (scriptSafe && ch === "<") { out += "\\x3C"; continue; }
    if (asciiOnly && cp > 0x7e) { out += uEscape(cp); continue; }
    out += ch;
  }
  if (quote === "backtick" && s.includes("${")) {
    notes.push("The ${ sequence was escaped so it stays literal text rather than opening a template interpolation.");
  }
  return { text: wrap ? q + out + q : out, notes };
}

export function unescapeJs(s) {
  const { text, stripped } = stripQuotes(s, "\"'`");
  const notes = stripped ? ["The surrounding quotes were treated as the string delimiters and removed."] : [];
  return { text: readEscapes(text, true), notes };
}

// ---------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------

// The Latin-1 block is contiguous, so its 96 names are stored in code-point
// order rather than as 96 hand-typed pairs (which is where typos come from).
// Verified name by name against python's html.entities.
const LATIN1 =
  "nbsp iexcl cent pound curren yen brvbar sect uml copy ordf laquo not shy reg macr deg plusmn sup2 sup3 acute micro para middot cedil sup1 ordm raquo frac14 frac12 frac34 iquest Agrave Aacute Acirc Atilde Auml Aring AElig Ccedil Egrave Eacute Ecirc Euml Igrave Iacute Icirc Iuml ETH Ntilde Ograve Oacute Ocirc Otilde Ouml times Oslash Ugrave Uacute Ucirc Uuml Yacute THORN szlig agrave aacute acirc atilde auml aring aelig ccedil egrave eacute ecirc euml igrave iacute icirc iuml eth ntilde ograve oacute ocirc otilde ouml divide oslash ugrave uacute ucirc uuml yacute thorn yuml".split(" ");

const EXTRA_ENTITIES = {
  quot: 34, amp: 38, apos: 39, lt: 60, gt: 62,
  OElig: 338, oelig: 339, Scaron: 352, scaron: 353, Yuml: 376, fnof: 402,
  circ: 710, tilde: 732,
  Alpha: 913, Beta: 914, Gamma: 915, Delta: 916, Epsilon: 917, Zeta: 918,
  Eta: 919, Theta: 920, Iota: 921, Kappa: 922, Lambda: 923, Mu: 924, Nu: 925,
  Xi: 926, Omicron: 927, Pi: 928, Rho: 929, Sigma: 931, Tau: 932, Upsilon: 933,
  Phi: 934, Chi: 935, Psi: 936, Omega: 937,
  alpha: 945, beta: 946, gamma: 947, delta: 948, epsilon: 949, zeta: 950,
  eta: 951, theta: 952, iota: 953, kappa: 954, lambda: 955, mu: 956, nu: 957,
  xi: 958, omicron: 959, pi: 960, rho: 961, sigmaf: 962, sigma: 963, tau: 964,
  upsilon: 965, phi: 966, chi: 967, psi: 968, omega: 969,
  ensp: 8194, emsp: 8195, thinsp: 8201, zwnj: 8204, zwj: 8205, lrm: 8206, rlm: 8207,
  ndash: 8211, mdash: 8212, lsquo: 8216, rsquo: 8217, sbquo: 8218,
  ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224, Dagger: 8225,
  bull: 8226, hellip: 8230, permil: 8240, prime: 8242, Prime: 8243,
  lsaquo: 8249, rsaquo: 8250, oline: 8254, frasl: 8260, euro: 8364, trade: 8482,
  larr: 8592, uarr: 8593, rarr: 8594, darr: 8595, harr: 8596,
  part: 8706, nabla: 8711, prod: 8719, sum: 8721, minus: 8722, radic: 8730,
  infin: 8734, cap: 8745, cup: 8746, int: 8747, asymp: 8776, ne: 8800,
  equiv: 8801, le: 8804, ge: 8805,
  lceil: 8968, rceil: 8969, lfloor: 8970, rfloor: 8971, loz: 9674,
  spades: 9824, clubs: 9827, hearts: 9829, diams: 9830,
};

const ENTITY_TO_CP = (() => {
  const m = { ...EXTRA_ENTITIES };
  LATIN1.forEach((name, i) => { m[name] = 160 + i; });
  return m;
})();

// HTML5's numeric-reference replacement table. A page authored in Windows-1252
// and served as UTF-8 writes an em dash as &#151;, and every browser maps that
// range to the Windows-1252 character rather than the C1 control it names.
const C1_REPLACEMENTS = {
  0x00: 0xfffd, 0x0d: 0x0d, 0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x0192,
  0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x02c6,
  0x89: 0x2030, 0x8a: 0x0160, 0x8b: 0x2039, 0x8c: 0x0152, 0x8e: 0x017d,
  0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022,
  0x96: 0x2013, 0x97: 0x2014, 0x98: 0x02dc, 0x99: 0x2122, 0x9a: 0x0161,
  0x9b: 0x203a, 0x9c: 0x0153, 0x9e: 0x017e, 0x9f: 0x0178,
};

export function escapeHtml(s, opts = {}) {
  const { escapeNonAscii = false } = opts;
  let out = "";
  for (const ch of codePoints(s)) {
    const cp = ch.codePointAt(0);
    if (ch === "&") { out += "&amp;"; continue; }
    if (ch === "<") { out += "&lt;"; continue; }
    if (ch === ">") { out += "&gt;"; continue; }
    if (ch === '"') { out += "&quot;"; continue; }
    // &apos; is an XML entity that HTML did not define until HTML5, so a
    // numeric reference is the one form every parser has always understood.
    if (ch === "'") { out += "&#39;"; continue; }
    if (escapeNonAscii && cp > 0x7e) { out += "&#x" + cp.toString(16).toUpperCase() + ";"; continue; }
    out += ch;
  }
  return { text: out, notes: [] };
}

function decodeNumeric(body, isHex) {
  const cp = parseInt(body, isHex ? 16 : 10);
  if (!Number.isFinite(cp)) return null;
  if (Object.prototype.hasOwnProperty.call(C1_REPLACEMENTS, cp)) {
    return String.fromCodePoint(C1_REPLACEMENTS[cp]);
  }
  if (cp > 0x10ffff || isSurrogate(cp)) return "�";
  return String.fromCodePoint(cp);
}

export function unescapeHtml(s, opts = {}) {
  const { xmlOnly = false } = opts;
  const notes = [];
  const unknown = new Set();
  const out = s.replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body) => {
    if (body[0] === "#") {
      const isHex = body[1] === "x" || body[1] === "X";
      const digits = isHex ? body.slice(2) : body.slice(1);
      const dec = decodeNumeric(digits, isHex);
      return dec === null ? whole : dec;
    }
    if (xmlOnly) {
      // XML predefines exactly five entities; anything else has to come from a
      // DTD this tool has never seen, so guessing at it would be wrong.
      const five = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };
      if (Object.prototype.hasOwnProperty.call(five, body)) return five[body];
      unknown.add(body);
      return whole;
    }
    if (Object.prototype.hasOwnProperty.call(ENTITY_TO_CP, body)) {
      return String.fromCodePoint(ENTITY_TO_CP[body]);
    }
    unknown.add(body);
    return whole;
  });
  if (unknown.size) {
    const list = [...unknown].slice(0, 6).map((n) => `&${n};`).join(", ");
    notes.push(
      xmlOnly
        ? `Left unchanged: ${list}. XML predefines only &amp;amp; &amp;lt; &amp;gt; &amp;quot; and &amp;apos; — anything else must be declared in the document's DTD.`
        : `Left unchanged: ${list}. These names are not in this tool's entity table, so they were passed through rather than guessed at.`
    );
  }
  return { text: out, notes };
}

// ---------------------------------------------------------------------------
// XML
// ---------------------------------------------------------------------------

// XML 1.0 §2.2: Char ::= #x9 | #xA | #xD | [#x20-#xD7FF] | [#xE000-#xFFFD] |
// [#x10000-#x10FFFF]. Everything outside that is not escapable, only removable.
function xmlIllegal(cp) {
  if (cp === 0x09 || cp === 0x0a || cp === 0x0d) return false;
  if (cp < 0x20) return true;
  if (isSurrogate(cp)) return true;
  if (cp === 0xfffe || cp === 0xffff) return true;
  return false;
}

export function escapeXml(s, opts = {}) {
  const { escapeNonAscii = false, dropIllegal = false, context = "text" } = opts;
  const attr = context === "attribute";
  const notes = [];
  const bad = new Set();
  let normalised = false;
  let out = "";
  for (const ch of codePoints(s)) {
    const cp = ch.codePointAt(0);
    if (xmlIllegal(cp)) {
      bad.add(cp);
      if (dropIllegal) continue;
      out += ch;
      continue;
    }
    if (ch === "&") { out += "&amp;"; continue; }
    if (ch === "<") { out += "&lt;"; continue; }
    // Not strictly required in text, but a bare > can close a stray ]]
    // sequence and end a CDATA section that was never opened here.
    if (ch === ">") { out += "&gt;"; continue; }
    if (ch === '"') { out += "&quot;"; continue; }
    if (ch === "'") { out += "&apos;"; continue; }
    // XML 1.0 s2.11: a parser turns a literal CR (and CRLF) into a single LF
    // before the application ever sees it, so a carriage return in your data
    // survives only as a numeric reference. This is the character every other
    // escaper silently loses.
    if (cp === 0x0d) { out += "&#13;"; normalised = true; continue; }
    // s3.3.3: inside an attribute value, tab and newline are normalised to a
    // space as well, so attribute-safe output has to escape those too.
    if (attr && cp === 0x09) { out += "&#9;"; normalised = true; continue; }
    if (attr && cp === 0x0a) { out += "&#10;"; normalised = true; continue; }
    if (escapeNonAscii && cp > 0x7e) { out += "&#x" + cp.toString(16).toUpperCase() + ";"; continue; }
    out += ch;
  }
  if (normalised) {
    notes.push(
      attr
        ? "Tab, newline and carriage return were written as numeric references. An XML parser normalises all three to a plain space inside an attribute value, so they survive only in this form."
        : "A carriage return was written as &#13;. XML normalises a literal CR to a line feed before your program sees it, so it is the one whitespace character that must be escaped to survive."
    );
  }
  if (bad.size) {
    const list = [...bad].slice(0, 6).map((c) => "U+" + hex4(c).toUpperCase()).join(", ");
    notes.push(
      dropIllegal
        ? `Removed ${bad.size} character ${bad.size === 1 ? "type" : "types"} XML 1.0 cannot hold (${list}). There is no escape for these — &#1; is itself a parse error — so removing them is the only way to produce a parseable document.`
        : `Warning: this text contains ${list}, which XML 1.0 cannot represent at all. No escape exists for them (&#1; is a parse error, not an escape), so the output will not parse. Tick "Remove characters XML cannot hold" to strip them, or move to XML 1.1, where they may be written as numeric references.`
    );
  }
  return { text: out, notes, illegal: [...bad] };
}

export const unescapeXml = (s) => unescapeHtml(s, { xmlOnly: true });

// ---------------------------------------------------------------------------
// CSV  (RFC 4180)
// ---------------------------------------------------------------------------

const DELIMITERS = { comma: ",", semicolon: ";", tab: "\t", pipe: "|" };
export const csvDelimiter = (key) => DELIMITERS[key] ?? ",";

function csvField(v, delimiter, quoteAlways, guardFormulas, state) {
  let f = v;
  // A field starting with one of these is executed as a formula when the file
  // is opened in Excel or Sheets - CSV injection. A leading apostrophe forces
  // it back to text (OWASP's recommendation).
  if (guardFormulas && /^[=+\-@\t\r]/.test(f)) { f = "'" + f; state.guarded++; }
  const needs =
    quoteAlways ||
    f.includes(delimiter) ||
    f.includes('"') ||
    /[\r\n]/.test(f) ||
    /^[ \t]|[ \t]$/.test(f);
  if (!needs) return f;
  state.quoted++;
  return '"' + f.replace(/"/g, '""') + '"';
}

export function escapeCsv(s, opts = {}) {
  const {
    delimiter = ",",
    perLine = false,
    quoteAlways = false,
    guardFormulas = false,
  } = opts;
  const state = { quoted: 0, guarded: 0 };
  const notes = [];
  let text;
  let count;
  if (perLine) {
    const lines = s.split(/\r\n|\n|\r/);
    count = lines.length;
    text = lines.map((l) => csvField(l, delimiter, quoteAlways, guardFormulas, state)).join("\r\n");
  } else {
    count = 1;
    text = csvField(s, delimiter, quoteAlways, guardFormulas, state);
  }
  if (state.guarded) {
    notes.push(
      `${state.guarded} ${state.guarded === 1 ? "field was" : "fields were"} prefixed with an apostrophe because ${state.guarded === 1 ? "it starts" : "they start"} with =, +, - or @, which a spreadsheet would otherwise run as a formula.`
    );
  }
  notes.push(
    perLine
      ? `${count} ${count === 1 ? "line" : "lines"} written as a one-column CSV; ${state.quoted} needed quoting. Rows are joined with CRLF, which is what RFC 4180 specifies.`
      : state.quoted
        ? "Quoted, because the value contains the delimiter, a quote mark, a line break or edge whitespace."
        : "No quoting needed — the value contains nothing a CSV reader would misread."
  );
  return { text, notes };
}

// A full RFC 4180 reader: quotes may hold the delimiter and line breaks, and a
// doubled quote inside a quoted field is one literal quote.
export function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;
  let started = false;
  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === "") { inQuotes = true; started = true; i++; continue; }
    if (c === delimiter) { row.push(field); field = ""; started = true; i++; continue; }
    if (c === "\r" || c === "\n") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); rows.push(row); row = []; field = ""; started = false; i++;
      continue;
    }
    field += c; started = true; i++;
  }
  if (started || field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

export function unescapeCsv(s, opts = {}) {
  const { delimiter = "," } = opts;
  const rows = parseCsv(s, delimiter);
  const fields = rows.flat();
  const cols = rows.reduce((m, r) => Math.max(m, r.length), 0);
  const notes = [
    `${rows.length} ${rows.length === 1 ? "row" : "rows"} × ${cols} ${cols === 1 ? "column" : "columns"} — each field is shown on its own line.`,
  ];
  if (fields.some((f) => /[\r\n]/.test(f))) {
    notes.push("One or more fields contain a line break of their own, so a single field may span several lines below.");
  }
  return { text: fields.join("\n"), notes };
}

// ---------------------------------------------------------------------------
// SQL
// ---------------------------------------------------------------------------

export function escapeSql(s, opts = {}) {
  const { dialect = "standard", wrap = false } = opts;
  const notes = [];
  let out = "";
  for (const ch of codePoints(s)) {
    const cp = ch.codePointAt(0);
    // Doubling the quote is the ISO SQL rule and is understood by every
    // engine, including MySQL with backslash escapes turned on.
    if (ch === "'") { out += "''"; continue; }
    if (dialect === "mysql") {
      if (ch === "\\") { out += "\\\\"; continue; }
      if (cp === 0x00) { out += "\\0"; continue; }
      if (cp === 0x08) { out += "\\b"; continue; }
      if (cp === 0x09) { out += "\\t"; continue; }
      if (cp === 0x0a) { out += "\\n"; continue; }
      if (cp === 0x0d) { out += "\\r"; continue; }
      if (cp === 0x1a) { out += "\\Z"; continue; }
    }
    out += ch;
  }
  if (dialect === "standard" && s.includes("\\")) {
    notes.push("This text contains a backslash. Standard SQL treats it as an ordinary character, but MySQL and MariaDB read it as an escape unless NO_BACKSLASH_ESCAPES is set — switch the dialect if the query runs there.");
  }
  if (s.includes("\0")) {
    notes.push("This text contains a NUL byte, which several client libraries use to mark the end of a string. Send it as a parameter rather than inline.");
  }
  return { text: wrap ? "'" + out + "'" : out, notes };
}

export function unescapeSql(s, opts = {}) {
  const { dialect = "standard" } = opts;
  const { text, stripped } = stripQuotes(s, "'");
  const notes = stripped ? ["The surrounding single quotes were treated as the literal's delimiters and removed."] : [];
  let out = "";
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === "'" && text[i + 1] === "'") { out += "'"; i += 2; continue; }
    if (dialect === "mysql" && c === "\\" && i + 1 < text.length) {
      const e = text[i + 1];
      const map = { "0": "\0", b: "\b", n: "\n", r: "\r", t: "\t", Z: "", "\\": "\\", "'": "'", '"': '"', "%": "\\%", _: "\\_" };
      out += Object.prototype.hasOwnProperty.call(map, e) ? map[e] : e;
      i += 2;
      continue;
    }
    out += c;
    i++;
  }
  return { text: out, notes };
}

// ---------------------------------------------------------------------------
// Regular expression
// ---------------------------------------------------------------------------

// The ECMAScript syntax characters, plus '/' (which would close a regex
// literal). Escaping the superset means one output works in a literal, in
// new RegExp() and inside a [...] character class.
const REGEX_SPECIAL = "^$\\.*+?()[]{}|/";

export function escapeRegex(s) {
  let out = "";
  for (const ch of codePoints(s)) {
    const cp = ch.codePointAt(0);
    if (REGEX_SPECIAL.includes(ch)) { out += "\\" + ch; continue; }
    // '-' is a range operator inside [...] so it has to be escaped, but \- is
    // a SyntaxError *outside* a class once the u or v flag is on. \x2D is the
    // one spelling that is legal in every position and every mode.
    if (ch === "-") { out += "\\x2D"; continue; }
    if (cp === 0x09) { out += "\\t"; continue; }
    if (cp === 0x0a) { out += "\\n"; continue; }
    if (cp === 0x0b) { out += "\\v"; continue; }
    if (cp === 0x0c) { out += "\\f"; continue; }
    if (cp === 0x0d) { out += "\\r"; continue; }
    if (cp < 0x20 || cp === 0x7f) { out += "\\x" + hex2(cp); continue; }
    // Line terminators to the regex-literal grammar, exactly like \n.
    if (cp === 0x2028 || cp === 0x2029) { out += "\\u" + hex4(cp); continue; }
    out += ch;
  }
  return {
    text: out,
    notes: [
      "Safe in a /.../ literal, in new RegExp(), inside a [...] character class, and under the u and v flags — the escape set is the union of all of them, so one output covers every position.",
    ],
  };
}

// ---------------------------------------------------------------------------
// Shell (POSIX sh / bash / zsh)
// ---------------------------------------------------------------------------

export function escapeShell(s, opts = {}) {
  const { style = "single" } = opts;
  if (style === "double") {
    let out = "";
    for (const ch of codePoints(s)) {
      if (ch === "\\" || ch === "$" || ch === "`" || ch === '"') out += "\\" + ch;
      else out += ch;
    }
    return {
      text: '"' + out + '"',
      notes: [
        "Double quotes still expand $variables, `backticks` and $(commands) unless each is escaped, so this form is only safe for text you control. Single quotes are the safer default.",
      ],
    };
  }
  // Inside single quotes a shell expands nothing at all, so the only character
  // needing attention is the quote itself: close, emit an escaped quote, reopen.
  const out = "'" + s.split("'").join("'\\''") + "'";
  const notes = [
    "Wrapped in single quotes, where a POSIX shell expands nothing — no variables, no globbing, no command substitution. Each interior quote closes the string, adds an escaped quote and reopens it.",
  ];
  if (s.includes("\n")) {
    notes.push("The line breaks are preserved literally inside the quotes; the shell reads the whole thing as one argument.");
  }
  notes.push("This is POSIX shell quoting. Windows cmd.exe and PowerShell use different rules and this will not be correct there.");
  return { text: out, notes };
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function escapeText(text, format, opts = {}) {
  switch (format) {
    case "json": return escapeJson(text, opts);
    case "js": return escapeJs(text, opts);
    case "html": return escapeHtml(text, opts);
    case "xml": return escapeXml(text, opts);
    case "csv": return escapeCsv(text, opts);
    case "sql": return escapeSql(text, opts);
    case "regex": return escapeRegex(text);
    case "shell": return escapeShell(text, opts);
    default: throw new Error(`Unknown format "${format}"`);
  }
}

export function unescapeText(text, format, opts = {}) {
  switch (format) {
    case "json": return unescapeJson(text);
    case "js": return unescapeJs(text);
    case "html": return unescapeHtml(text);
    case "xml": return unescapeXml(text);
    case "csv": return unescapeCsv(text, opts);
    case "sql": return unescapeSql(text, opts);
    default:
      throw new Error(
        format === "regex"
          ? "A regular expression cannot be reliably unescaped: \\d, \\b and \\w stand for whole character classes rather than for the letters d, b and w, so there is no way to tell an escaped literal from a metasequence."
          : "A shell command cannot be reliably unescaped: the same text can be quoted several different ways, and undoing it means running the shell's own word-splitting rules."
      );
  }
}
