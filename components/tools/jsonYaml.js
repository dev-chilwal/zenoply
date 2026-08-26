// JSON -> YAML conversion, kept out of the component so it can be run and
// verified in node (same reasoning as rupeesWords.js and pdfForm.js).
//
// Four things drive the design, and none of them are obvious:
//
//  1. `JSON.parse` is lossy for this job, so the JSON is parsed here instead.
//     It rounds `12345678901234567890` to `12345678901234567000` and rewrites
//     `1.50` as `1.5`, and a config file's IDs and version pins are exactly the
//     values people notice going wrong. The parser below keeps every number as
//     its original literal text and only ever re-emits that text.
//  2. YAML resolves unquoted scalars by shape, so a *string* that happens to
//     look like something else silently changes type. `NO` (Norway),
//     `yes`/`off`, `1_000`, `017`, `0x1F`, `1:30` and `2026-08-25` all parse as
//     non-strings; `isPlainSafe` is deliberately conservative and quotes the
//     union of the YAML 1.1 and 1.2 resolvers rather than either one alone.
//  3. The reverse of (2): JSON exponent numbers are not portable. `1e5` is a
//     float under YAML 1.2 but a plain *string* under the 1.1 resolver Ruby's
//     Psych and PyYAML use (their regex demands both a `.` and a signed
//     exponent). Numbers are therefore canonicalised to `1.0e+5`, which both
//     resolvers read as a number.
//  4. Multi-line strings only look right as block scalars, but a block scalar
//     cannot express every string: a first line starting with a space would
//     make the parser infer the wrong indentation, and trailing spaces on a
//     line survive only by accident. Those fall back to a double-quoted scalar,
//     which is always exact because YAML's double-quoted style is a superset of
//     a JSON string.

// ---------------------------------------------------------------------------
// JSON parser: preserves number literals, key order and duplicate-key counts.
// ---------------------------------------------------------------------------

function lineCol(text, idx) {
  let line = 1, last = -1;
  for (let i = 0; i < idx; i++) if (text[i] === "\n") { line++; last = i; }
  return { line, col: idx - last };
}

export function parseJson(text) {
  let i = 0;
  const n = text.length;
  let duplicates = 0;

  function fail(msg, at = i) {
    const { line, col } = lineCol(text, Math.min(at, n));
    throw new Error(`${msg} (line ${line}, column ${col})`);
  }
  function ws() {
    while (i < n) {
      const c = text[i];
      if (c === " " || c === "\t" || c === "\n" || c === "\r") i++;
      else break;
    }
  }
  function expect(ch) {
    if (text[i] !== ch) fail(`Expected '${ch}' but found ${found()}`);
    i++;
  }
  function found() {
    if (i >= n) return "end of input";
    return `'${text[i]}'`;
  }

  function parseString() {
    // Assumes text[i] === '"'.
    i++;
    let out = "";
    while (true) {
      if (i >= n) fail("Unterminated string");
      const c = text[i];
      if (c === '"') { i++; return out; }
      if (c === "\\") {
        i++;
        const e = text[i];
        if (e === undefined) fail("Unterminated escape");
        if (e === '"') out += '"';
        else if (e === "\\") out += "\\";
        else if (e === "/") out += "/";
        else if (e === "b") out += "\b";
        else if (e === "f") out += "\f";
        else if (e === "n") out += "\n";
        else if (e === "r") out += "\r";
        else if (e === "t") out += "\t";
        else if (e === "u") {
          const hex = text.slice(i + 1, i + 5);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) fail("Invalid \\u escape", i - 1);
          out += String.fromCharCode(parseInt(hex, 16));
          i += 4;
        } else fail(`Invalid escape '\\${e}'`, i - 1);
        i++;
        continue;
      }
      if (c < " ") fail("Unescaped control character in string");
      out += c;
      i++;
    }
  }

  function parseNumber() {
    const start = i;
    if (text[i] === "-") i++;
    if (text[i] === "0") i++;
    else if (text[i] >= "1" && text[i] <= "9") { while (text[i] >= "0" && text[i] <= "9") i++; }
    else fail("Invalid number", start);
    if (text[i] === ".") {
      i++;
      if (!(text[i] >= "0" && text[i] <= "9")) fail("Invalid number: digits expected after '.'", start);
      while (text[i] >= "0" && text[i] <= "9") i++;
    }
    if (text[i] === "e" || text[i] === "E") {
      i++;
      if (text[i] === "+" || text[i] === "-") i++;
      if (!(text[i] >= "0" && text[i] <= "9")) fail("Invalid number: digits expected in exponent", start);
      while (text[i] >= "0" && text[i] <= "9") i++;
    }
    return { t: "number", raw: text.slice(start, i) };
  }

  function parseValue(depth) {
    if (depth > 200) fail("JSON is nested too deeply");
    ws();
    if (i >= n) fail("Unexpected end of input");
    const c = text[i];
    if (c === "{") {
      i++;
      const entries = [];
      const index = new Map();
      ws();
      if (text[i] === "}") { i++; return { t: "object", entries }; }
      while (true) {
        ws();
        if (text[i] !== '"') fail(`Expected a quoted key but found ${found()}`);
        const key = parseString();
        ws();
        expect(":");
        const value = parseValue(depth + 1);
        if (index.has(key)) {
          // Match JSON.parse: the last value wins, at the first key's position.
          duplicates++;
          entries[index.get(key)].value = value;
        } else {
          index.set(key, entries.length);
          entries.push({ key, value });
        }
        ws();
        if (text[i] === ",") { i++; continue; }
        if (text[i] === "}") { i++; break; }
        fail(`Expected ',' or '}' but found ${found()}`);
      }
      return { t: "object", entries };
    }
    if (c === "[") {
      i++;
      const items = [];
      ws();
      if (text[i] === "]") { i++; return { t: "array", items }; }
      while (true) {
        items.push(parseValue(depth + 1));
        ws();
        if (text[i] === ",") { i++; continue; }
        if (text[i] === "]") { i++; break; }
        fail(`Expected ',' or ']' but found ${found()}`);
      }
      return { t: "array", items };
    }
    if (c === '"') return { t: "string", v: parseString() };
    if (c === "-" || (c >= "0" && c <= "9")) return parseNumber();
    if (text.startsWith("true", i)) { i += 4; return { t: "bool", v: true }; }
    if (text.startsWith("false", i)) { i += 5; return { t: "bool", v: false }; }
    if (text.startsWith("null", i)) { i += 4; return { t: "null" }; }
    fail(`Unexpected ${found()}`);
  }

  ws();
  if (i >= n) throw new Error("Nothing to convert.");
  const root = parseValue(0);
  ws();
  if (i < n) fail(`Unexpected ${found()} after the end of the JSON value`);
  return { root, duplicates };
}

// ---------------------------------------------------------------------------
// YAML emitter.
// ---------------------------------------------------------------------------

// Plain (unquoted) scalars that a loader resolves to something other than a
// string. The YAML 1.2 core schema and the YAML 1.1 schema that Ruby's Psych
// and PyYAML use disagree about several of these, so the union of both is
// quoted -- a value should survive whichever loader the file ends up in.
const NON_STRING_PLAIN = new RegExp(
  "^(?:" +
    // Empty, and the null spellings.
    "|~|[Nn]ull|NULL" +
    // Booleans: 1.2 core, plus the 1.1 y/n/yes/no/on/off family.
    "|[Tt]rue|TRUE|[Ff]alse|FALSE" +
    "|[Yy]|[Yy]es|YES|[Nn]|[Nn]o|NO|[Oo]n|ON|[Oo]ff|OFF" +
    // Integers: decimal, octal, hex and binary, with 1.1 digit separators.
    "|[-+]?[0-9][0-9_]*" +
    "|[-+]?0[oO]?[0-7_]+" +
    "|[-+]?0[xX][0-9a-fA-F_]+" +
    "|[-+]?0[bB][01_]+" +
    // Sexagesimal, the 1.1 rule that turns a bare 1:30 into 90.
    "|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+(?:\\.[0-9_]*)?" +
    // Floats, including the leading-dot form, and the infinities.
    "|[-+]?(?:[0-9][0-9_]*)?\\.[0-9_]*(?:[eE][-+]?[0-9]+)?" +
    "|[-+]?[0-9][0-9_]*[eE][-+]?[0-9]+" +
    "|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN)" +
    // Timestamps, which the 1.1 schema resolves to a date object.
    "|[0-9]{4}-[0-9]{1,2}-[0-9]{1,2}(?:[Tt ][^\\n]*)?" +
    // The 1.1 merge and value keys.
    "|<<|=" +
  ")$"
);

// Control characters cannot appear in a plain or single-quoted scalar, and
// only the newline may appear in a block one. Tab counts as a control
// character here: it is legal in YAML content but invisible in a diff, and
// the double-quoted fallback writes it back exactly.
function hasControl(s, allowNewline) {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (allowNewline && c === 10) continue;
    if (c < 32 || (c >= 127 && c <= 159)) return true;
  }
  return false;
}

// True when `s` can be written with no quotes at all and still read back as
// exactly this string.
export function isPlainSafe(s) {
  if (s === "") return false;
  // Leading and trailing whitespace is stripped from a plain scalar.
  if (/^\s|\s$/.test(s)) return false;
  if (hasControl(s, false)) return false;
  // Indicators only matter as the first character of a scalar.
  if ("-?:,[]{}#&*!|>'\"%@`".includes(s[0])) return false;
  // ": " opens a mapping and " #" opens a comment, anywhere on the line.
  if (s.includes(": ") || s.includes(" #") || s.endsWith(":")) return false;
  return !NON_STRING_PLAIN.test(s);
}

function quoteScalar(s) {
  // Single quotes keep backslashes literal, which is what a Windows path or a
  // regex wants. They cannot carry control characters, so those fall back to
  // the double-quoted style -- and there JSON's own escaping is already valid
  // YAML, which makes the round trip exact.
  if (hasControl(s, false)) return JSON.stringify(s);
  return "'" + s.replace(/'/g, "''") + "'";
}

function keyText(key) {
  // A bare colon in a key is ambiguous even when no space follows it, so keys
  // are held to a slightly stricter standard than values.
  return isPlainSafe(key) && !key.includes(":") ? key : quoteScalar(key);
}

// A literal block scalar is the only readable way to write a multi-line
// string, but it cannot express every one of them. Returns null when this
// string has to be double-quoted instead.
function blockScalar(s) {
  if (!s.includes("\n")) return null;
  // Any control character other than the newlines themselves, tabs included.
  if (hasControl(s, true)) return null;
  // Keeping two or more trailing newlines depends on blank lines at the end of
  // the block surviving intact, which is too fragile to rely on.
  if (s.endsWith("\n\n")) return null;
  const chomp = s.endsWith("\n") ? "" : "-";
  const lines = (s.endsWith("\n") ? s.slice(0, -1) : s).split("\n");
  // An empty or space-led first line makes the reader infer the wrong
  // indentation; a trailing space on any line would be silently dropped.
  if (lines[0] === "" || /^[ \t]/.test(lines[0])) return null;
  if (lines.some((l) => /[ \t]$/.test(l))) return null;
  return { header: "|" + chomp, lines };
}

// `1e5` is a float under YAML 1.2 but a plain string under the 1.1 resolver,
// whose regex demands both a '.' in the mantissa and a signed exponent.
// Writing it as `1.0e+5` satisfies both, and invents no digits.
function yamlNumber(raw) {
  const e = raw.search(/[eE]/);
  if (e === -1) return raw;
  let mantissa = raw.slice(0, e);
  let exponent = raw.slice(e + 1);
  if (!mantissa.includes(".")) mantissa += ".0";
  if (exponent[0] !== "+" && exponent[0] !== "-") exponent = "+" + exponent;
  return mantissa + "e" + exponent;
}

export function toYaml(root, { indent = 2 } = {}) {
  const step = indent;
  const out = [];

  const isEmpty = (n) =>
    (n.t === "object" && n.entries.length === 0) ||
    (n.t === "array" && n.items.length === 0);
  const emptyText = (n) => (n.t === "object" ? "{}" : "[]");

  function scalarText(n) {
    if (n.t === "string") return isPlainSafe(n.v) ? n.v : quoteScalar(n.v);
    if (n.t === "number") return yamlNumber(n.raw);
    if (n.t === "bool") return n.v ? "true" : "false";
    return "null";
  }

  function pushBlock(block, col) {
    for (const l of block.lines) out.push(l === "" ? "" : " ".repeat(col) + l);
  }

  // Writes every line of a non-empty object or array, starting at column `col`.
  function writeNode(node, col) {
    const pad = " ".repeat(col);
    if (node.t === "object") {
      for (const { key, value } of node.entries) {
        const label = pad + keyText(key) + ":";
        if (value.t === "object" || value.t === "array") {
          if (isEmpty(value)) out.push(label + " " + emptyText(value));
          else { out.push(label); writeNode(value, col + step); }
          continue;
        }
        const block = value.t === "string" ? blockScalar(value.v) : null;
        if (block) {
          out.push(label + " " + block.header);
          pushBlock(block, col + step);
        } else {
          out.push(label + " " + scalarText(value));
        }
      }
      return;
    }
    // A sequence. The dash is padded out to the child column so the first line
    // of a nested collection lines up with the ones below it -- the reason a
    // 4-space indent needs "-   item" rather than "- item".
    const lead = pad + "-" + " ".repeat(step - 1);
    for (const item of node.items) {
      if (item.t === "object" || item.t === "array") {
        if (isEmpty(item)) { out.push(pad + "- " + emptyText(item)); continue; }
        const first = out.length;
        writeNode(item, col + step);
        out[first] = lead + out[first].slice(col + step);
        continue;
      }
      const block = item.t === "string" ? blockScalar(item.v) : null;
      if (block) {
        out.push(pad + "- " + block.header);
        pushBlock(block, col + step);
      } else {
        out.push(pad + "- " + scalarText(item));
      }
    }
  }

  if (root.t === "object" || root.t === "array") {
    if (isEmpty(root)) return emptyText(root) + "\n";
    writeNode(root, 0);
  } else {
    const block = root.t === "string" ? blockScalar(root.v) : null;
    if (block) { out.push(block.header); pushBlock(block, step); }
    else out.push(scalarText(root));
  }
  return out.join("\n") + "\n";
}

export function jsonToYaml(text, opts) {
  const { root, duplicates } = parseJson(text);
  return { yaml: toYaml(root, opts), duplicates };
}
