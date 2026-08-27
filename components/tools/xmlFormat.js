// XML parsing + formatting, kept out of the component so it can be exercised in
// node against real XML parsers — expat (python3) and libxml2 (xmllint) — the
// same reasoning as jsonYaml.js and rupeesWords.js.
//
// Three decisions shape this file, and none of them are the obvious ones:
//
//  1. **Character data is never altered; only markup is normalised.** A naive
//     pretty-printer indents every child onto its own line, which silently
//     rewrites any element that mixes text with tags: `<p>Hello <b>x</b>!</p>`
//     comes back with newlines around `Hello` and `!`, and those newlines are
//     part of the string now. So an element holding any non-whitespace text is
//     emitted on one line with its text untouched, and only elements whose
//     content is entirely other elements get the indent treatment.
//  2. **Whitespace-only text between elements is the one thing safe to drop** —
//     that is what pretty-printing *is*. Trimming the whitespace around a text
//     value (`<name>\n  Bob\n</name>` -> `<name>Bob</name>`) is a real content
//     change, so it is a switch rather than an assumption, and `xml:space` is
//     honoured above the switch either way.
//  3. **Entities and CDATA are passed through as written.** Decoding `&#233;`
//     and re-encoding it would change the bytes of a document that may be
//     signed, so a reference is only checked for validity, never resolved.

// XML 1.0 NameStartChar / NameChar, minus the astral ranges (which need surrogate
// handling and never appear in practice in the tags people paste).
const NAME_START =
  "A-Za-z_:\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D" +
  "\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF" +
  "\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD";
const NAME_REST = NAME_START + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040";
const NAME_RE = new RegExp("[" + NAME_START + "][" + NAME_REST + "]*", "y");
const ENTITY_RE = new RegExp(
  "&(?:#[0-9]+|#x[0-9A-Fa-f]+|[" + NAME_START + "][" + NAME_REST + "]*);",
  "y"
);

function lineCol(text, idx) {
  let line = 1, last = -1;
  for (let i = 0; i < idx; i++) if (text[i] === "\n") { line++; last = i; }
  return { line, col: idx - last };
}

const isWs = (c) => c === " " || c === "\t" || c === "\n" || c === "\r";

// ---------------------------------------------------------------------------
// Parser. Every node records its source offsets so nothing has to be
// reconstructed from a decoded value.
// ---------------------------------------------------------------------------

export function parseXml(text) {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const n = src.length;
  let i = 0;
  const doc = { type: "document", children: [] };
  const stack = [doc];
  const warnings = [];
  let roots = 0;
  let doctypeSeen = false;

  const top = () => stack[stack.length - 1];

  function fail(msg, at = i) {
    const { line, col } = lineCol(src, Math.min(Math.max(at, 0), n));
    const e = new Error(`${msg} (line ${line}, column ${col})`);
    e.line = line;
    e.col = col;
    throw e;
  }

  function checkEntities(s, base) {
    let k = -1;
    while ((k = s.indexOf("&", k + 1)) !== -1) {
      ENTITY_RE.lastIndex = k;
      if (!ENTITY_RE.exec(s)) {
        fail("A bare '&' is not allowed — write &amp; for a literal ampersand", base + k);
      }
    }
  }

  function skipWs() {
    const from = i;
    while (i < n && isWs(src[i])) i++;
    return i > from;
  }

  function readName() {
    NAME_RE.lastIndex = i;
    const m = NAME_RE.exec(src);
    if (!m) return null;
    i += m[0].length;
    return m[0];
  }

  while (i < n) {
    if (src[i] !== "<") {
      const start = i;
      while (i < n && src[i] !== "<") i++;
      const raw = src.slice(start, i);
      checkEntities(raw, start);
      const bad = raw.indexOf("]]>");
      if (bad !== -1) fail("The sequence ']]>' is not allowed in text — write ]]&gt;", start + bad);
      if (stack.length === 1) {
        if (/\S/.test(raw)) fail("Text is not allowed outside the root element", start + raw.search(/\S/));
      } else {
        top().children.push({ type: "text", raw, start, end: i });
      }
      continue;
    }

    const start = i;

    if (src.startsWith("<!--", i)) {
      const close = src.indexOf("-->", i + 4);
      if (close < 0) fail("This comment is never closed with '-->'", start);
      const body = src.slice(i + 4, close);
      const dd = body.indexOf("--");
      if (dd !== -1) fail("A comment may not contain '--'", i + 4 + dd);
      if (body.endsWith("-")) fail("A comment may not end with '-' just before '-->'", close - 1);
      i = close + 3;
      top().children.push({ type: "comment", raw: src.slice(start, i), start, end: i });
      continue;
    }

    if (src.startsWith("<![CDATA[", i)) {
      const close = src.indexOf("]]>", i + 9);
      if (close < 0) fail("This CDATA section is never closed with ']]>'", start);
      i = close + 3;
      if (stack.length === 1) fail("A CDATA section is not allowed outside the root element", start);
      top().children.push({ type: "cdata", raw: src.slice(start, i), start, end: i });
      continue;
    }

    if (src.startsWith("<!DOCTYPE", i)) {
      if (stack.length > 1 || roots > 0) fail("A DOCTYPE must come before the root element", start);
      if (doctypeSeen) fail("A document may have only one DOCTYPE declaration", start);
      let j = i + 9;
      let depth = 0;
      let quote = "";
      for (; j < n; j++) {
        const c = src[j];
        if (quote) { if (c === quote) quote = ""; continue; }
        if (c === '"' || c === "'") { quote = c; continue; }
        if (c === "[") depth++;
        else if (c === "]") depth--;
        else if (c === ">" && depth <= 0) break;
        // Outside the internal subset only a name, a quoted external id and
        // '[' may appear, so a bare '<' here means the '>' was forgotten.
        else if (c === "<" && depth <= 0) fail("Unexpected '<' inside the DOCTYPE declaration — it is probably missing its closing '>'", j);
      }
      if (j >= n) fail("This DOCTYPE declaration is never closed with '>'", start);
      i = j + 1;
      doctypeSeen = true;
      doc.children.push({ type: "doctype", raw: src.slice(start, i), start, end: i });
      continue;
    }

    if (src.startsWith("<!", i)) {
      fail("Only a comment, a CDATA section or a DOCTYPE may start with '<!'", start);
    }

    if (src.startsWith("<?", i)) {
      const isDecl = src.startsWith("<?xml", i) && (i + 5 >= n || isWs(src[i + 5]) || src[i + 5] === "?");
      i += 2;
      const target = readName();
      if (!target) fail("A processing instruction needs a target name after '<?'", start);
      if (!isDecl && target.toLowerCase() === "xml") {
        fail("Processing instruction targets beginning with 'xml' are reserved", start);
      }
      const close = src.indexOf("?>", i);
      if (close < 0) fail("This processing instruction is never closed with '?>'", start);
      i = close + 2;
      if (isDecl) {
        if (doc.children.length > 0 || stack.length > 1) {
          fail("The XML declaration must come before everything else in the document", start);
        }
        doc.children.push({ type: "decl", raw: src.slice(start, i), start, end: i });
      } else {
        top().children.push({ type: "pi", raw: src.slice(start, i), start, end: i });
      }
      continue;
    }

    if (src.startsWith("</", i)) {
      i += 2;
      const name = readName();
      if (!name) fail("'</' must be followed by an element name", start);
      skipWs();
      if (src[i] !== ">") fail(`Expected '>' to close </${name}>`, i);
      i++;
      if (stack.length === 1) fail(`</${name}> has no matching opening tag`, start);
      const open = top();
      if (open.name !== name) {
        fail(`</${name}> does not match the open <${open.name}> tag — XML tag names are case sensitive and must nest`, start);
      }
      open.innerEnd = start;
      open.end = i;
      stack.pop();
      continue;
    }

    // Start tag.
    i++;
    const name = readName();
    if (!name) {
      fail("'<' must be followed by an element name — write &lt; for a literal less-than sign", start);
    }
    const attrs = [];
    const seen = new Set();
    let selfClosed = false;
    for (;;) {
      const hadWs = skipWs();
      if (i >= n) fail(`<${name}> is never closed with '>'`, start);
      if (src[i] === ">") { i++; break; }
      if (src[i] === "/") {
        if (src[i + 1] !== ">") fail(`Expected '/>' to close the empty element <${name}>`, i);
        selfClosed = true;
        i += 2;
        break;
      }
      if (!hadWs) fail(`A space is needed before the next attribute of <${name}>`, i);
      const aStart = i;
      const aName = readName();
      if (!aName) {
        fail(`Unexpected '${src[i]}' inside the <${name}> tag — expected an attribute name, '>' or '/>'`, i);
      }
      skipWs();
      if (src[i] !== "=") {
        fail(`Attribute '${aName}' needs a value — XML has no bare attributes, write ${aName}="..."`, aStart);
      }
      i++;
      skipWs();
      const q = src[i];
      if (q !== '"' && q !== "'") fail(`The value of '${aName}' must be in quotes`, i);
      const vStart = i + 1;
      const vEnd = src.indexOf(q, vStart);
      if (vEnd < 0) fail(`The value of '${aName}' is never closed with ${q}`, i);
      const value = src.slice(vStart, vEnd);
      const lt = value.indexOf("<");
      if (lt !== -1) fail("'<' is not allowed in an attribute value — write &lt;", vStart + lt);
      checkEntities(value, vStart);
      if (seen.has(aName)) fail(`Attribute '${aName}' appears twice on <${name}>`, aStart);
      seen.add(aName);
      i = vEnd + 1;
      attrs.push({ name: aName, value, quote: q });
    }
    const el = {
      type: "element", name, attrs, selfClosed, children: [],
      start, end: selfClosed ? i : 0, innerStart: i, innerEnd: i,
    };
    if (stack.length === 1) roots++;
    top().children.push(el);
    if (!selfClosed) stack.push(el);
  }

  if (stack.length > 1) {
    const open = stack[stack.length - 1];
    fail(`<${open.name}> is never closed`, open.start);
  }
  if (roots === 0) {
    if (doc.children.length === 0) fail("There is nothing to format here", 0);
    warnings.push("No element was found — a complete XML document needs a root element.");
  } else if (roots > 1) {
    warnings.push(
      `This is a fragment, not a complete document: it has ${roots} top-level elements and XML allows exactly one root. It has been formatted anyway.`
    );
  }

  return { src, doc, warnings, stats: measure(doc) };
}

function measure(doc) {
  let elements = 0;
  let depth = 0;
  const walk = (node, d) => {
    for (const c of node.children) {
      if (c.type !== "element") continue;
      elements++;
      if (d > depth) depth = d;
      walk(c, d + 1);
    }
  };
  walk(doc, 1);
  return { elements, depth };
}

// ---------------------------------------------------------------------------
// Emitter.
// ---------------------------------------------------------------------------

const openTag = (el) =>
  "<" + el.name +
  el.attrs.map((a) => " " + a.name + "=" + a.quote + a.value + a.quote).join("") +
  (el.selfClosed ? "/>" : ">");

const closeTag = (el) => "</" + el.name + ">";

function preserveOf(el, inherited) {
  const a = el.attrs.find((x) => x.name === "xml:space");
  if (!a) return inherited;
  if (a.value === "preserve") return true;
  if (a.value === "default") return false;
  return inherited;
}

export function formatXml(text, opts = {}) {
  const {
    indent = "  ",
    minify = false,
    removeComments = false,
    trimText = true,
  } = opts;
  const { doc, warnings, stats } = parseXml(text);

  const kidsOf = (node) =>
    removeComments ? node.children.filter((c) => c.type !== "comment") : node.children;

  const hasTextIn = (kids) =>
    kids.some((c) => c.type === "cdata" || (c.type === "text" && /\S/.test(c.raw)));

  // Emits an element and everything under it on one line. Character data is
  // copied through byte for byte; only the tags around it are rebuilt.
  function inlineElement(el, trim) {
    if (el.selfClosed) return openTag(el);
    const kids = kidsOf(el);
    let s = openTag(el);
    kids.forEach((c, idx) => {
      if (c.type === "text") {
        let t = c.raw;
        if (trim && idx === 0) t = t.replace(/^\s+/, "");
        if (trim && idx === kids.length - 1) t = t.replace(/\s+$/, "");
        s += t;
      } else if (c.type === "element") {
        s += inlineElement(c, false);
      } else {
        s += c.raw;
      }
    });
    return s + closeTag(el);
  }

  function kindOf(el, preserve) {
    if (el.selfClosed) return "empty";
    // Whitespace kept verbatim rather than dropped, so an element that holds
    // only spaces is still "inline" here.
    if (preserve) return "inline";
    const kids = kidsOf(el);
    if (kids.every((c) => c.type === "text" && !/\S/.test(c.raw))) return "empty";
    if (hasTextIn(kids)) return "inline";
    return "block";
  }

  // ---- pretty print ----
  const lines = [];
  function emitElement(el, depth, inherited) {
    const preserve = preserveOf(el, inherited);
    const pad = indent.repeat(depth);
    const kind = kindOf(el, preserve);
    if (kind === "empty") {
      lines.push(pad + (el.selfClosed ? openTag(el) : openTag(el) + closeTag(el)));
    } else if (kind === "inline") {
      lines.push(pad + inlineElement(el, trimText && !preserve));
    } else {
      lines.push(pad + openTag(el));
      for (const c of kidsOf(el)) {
        if (c.type === "text") continue; // whitespace only, by definition of "block"
        if (c.type === "element") emitElement(c, depth + 1, preserve);
        else lines.push(indent.repeat(depth + 1) + c.raw);
      }
      lines.push(pad + closeTag(el));
    }
  }

  // ---- minify ----
  function minifyElement(el, inherited) {
    const preserve = preserveOf(el, inherited);
    const kind = kindOf(el, preserve);
    if (kind === "empty") {
      return el.selfClosed ? openTag(el) : openTag(el) + closeTag(el);
    }
    if (kind === "inline") return inlineElement(el, trimText && !preserve);
    let s = openTag(el);
    for (const c of kidsOf(el)) {
      if (c.type === "text") continue;
      s += c.type === "element" ? minifyElement(c, preserve) : c.raw;
    }
    return s + closeTag(el);
  }

  let out;
  if (minify) {
    out = kidsOf(doc)
      .map((c) => (c.type === "element" ? minifyElement(c, false) : c.raw))
      .join("");
  } else {
    for (const c of kidsOf(doc)) {
      if (c.type === "element") emitElement(c, 0, false);
      else lines.push(c.raw);
    }
    out = lines.join("\n");
  }

  return { text: out, warnings, stats };
}
