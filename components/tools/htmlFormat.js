// HTML parsing + beautifying, kept out of the component so it can be exercised
// in node against a real HTML parser — parse5, the same tree builder jsdom uses
// — the same reasoning as xmlFormat.js, jsonYaml.js and escapeString.js.
//
// Four decisions shape this file, and none of them are the obvious ones:
//
//  1. **The output differs from the input only in whitespace.** Every tag,
//     attribute, comment and doctype is copied out of the source byte for byte,
//     so attribute quoting, unquoted values, bare boolean attributes, tag-name
//     case (`<MyComponent>` in a Vue or JSX-ish template) and a missing end tag
//     all survive untouched. No tag is ever added or removed. That single rule
//     is what makes the tool safe to run on markup you did not write.
//  2. **Whitespace is only reformatted where CSS does not render it.** In HTML,
//     whitespace between two *inline* boxes is a rendered space — putting
//     `<span>a</span><span>b</span>` onto two lines adds a word gap that was not
//     there. So a line break is only ever inserted next to a block-level
//     boundary, where the whitespace-processing model drops it. Everything else
//     goes on one line with its text copied verbatim.
//  3. **An unknown tag is inline, because that is what a browser does with it.**
//     A custom element with no CSS is `display: inline`, so `<my-a></my-a>
//     <my-b></my-b>` may not be split. There is an option to override this for
//     people who know their components are block-level.
//  4. **Script and style contents are shifted, never rewritten** — and only when
//     the block provably has no multi-line string in it, since re-indenting a
//     line that sits inside a template literal edits the string.

// --------------------------------------------------------------------------
// Element tables
// --------------------------------------------------------------------------

// No end tag, ever.
const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "param", "source", "track", "wbr", "basefont", "bgsound", "frame", "keygen",
]);

// Contents are not markup — the tokenizer must scan straight to the end tag.
// (`noscript` belongs here because browsers, and parse5 by default, tokenize it
// as raw text when scripting is enabled.)
const RAW_TEXT = new Set([
  "script", "style", "xmp", "iframe", "noembed", "noframes", "noscript",
  "textarea", "title",
]);

// Raw text that is still character data rather than a program.
const ESCAPABLE_RAW = new Set(["textarea", "title"]);

// Whitespace inside these is rendered exactly as written.
const PRESERVE_WS = new Set(["pre", "textarea", "listing", "plaintext"]);

// Default display is block / list-item / table-*, so whitespace at their edges
// is dropped by the whitespace-processing model and a line break is free.
const BLOCK = new Set([
  "html", "body", "head", "address", "article", "aside", "blockquote", "center",
  "details", "dialog", "dd", "dir", "div", "dl", "dt", "fieldset", "figcaption",
  "figure", "footer", "form", "frameset", "h1", "h2", "h3", "h4", "h5", "h6",
  "header", "hgroup", "hr", "legend", "li", "main", "menu", "nav", "ol", "p",
  "pre", "search", "section", "summary", "ul", "table", "caption", "colgroup",
  "col", "thead", "tbody", "tfoot", "tr", "td", "th", "optgroup", "option",
  "listing", "plaintext", "fencedframe", "selectedcontent",
]);

// Renders nothing at all. Safe to break around only when nothing beside it in
// the same parent is rendered inline — `a<script></script>b` is "ab", and
// splitting it across lines would make it "a b".
const NOT_RENDERED = new Set([
  "head", "script", "style", "link", "meta", "base", "title", "template",
  "datalist", "noscript", "param", "source", "track", "rp",
]);

// Inside <svg>, whitespace between elements is never rendered — except in the
// text-content elements, where it is character data like anywhere else.
const SVG_INLINE = new Set(["text", "tspan", "textpath", "tref", "altglyph", "a"]);

// A start tag that implies the end tag of the element still open above it.
const CLOSED_BY = {
  li: new Set(["li"]),
  dt: new Set(["dt", "dd"]),
  dd: new Set(["dt", "dd"]),
  p: new Set([
    "address", "article", "aside", "blockquote", "details", "div", "dl",
    "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3",
    "h4", "h5", "h6", "header", "hgroup", "hr", "main", "menu", "nav", "ol",
    "p", "pre", "search", "section", "table", "ul",
  ]),
  rt: new Set(["rt", "rp"]),
  rp: new Set(["rt", "rp"]),
  optgroup: new Set(["optgroup"]),
  option: new Set(["option", "optgroup"]),
  caption: new Set(["colgroup", "thead", "tbody", "tfoot", "tr"]),
  colgroup: new Set(["thead", "tbody", "tfoot", "tr", "caption"]),
  thead: new Set(["tbody", "tfoot"]),
  tbody: new Set(["tbody", "tfoot"]),
  tr: new Set(["tr", "tbody", "tfoot", "thead", "caption", "colgroup"]),
  td: new Set(["td", "th", "tr", "tbody", "tfoot", "thead", "caption", "colgroup"]),
  th: new Set(["td", "th", "tr", "tbody", "tfoot", "thead", "caption", "colgroup"]),
  head: new Set(["body"]),
};

// Elements whose end tag may simply be left out when the parent closes.
const CLOSED_BY_PARENT = new Set([
  "li", "dt", "dd", "p", "rt", "rp", "optgroup", "option", "thead", "tbody",
  "tfoot", "tr", "td", "th", "head", "body", "html", "caption", "colgroup",
]);

const isWs = (c) => c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f";
const isAsciiAlpha = (c) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");

// --------------------------------------------------------------------------
// Parser
//
// This is a tokenizer with just enough tree building to know how deep a tag
// sits. It deliberately does NOT reimplement HTML's tree construction: the
// output keeps the token stream intact, so whatever recovery a browser performs
// on the input it performs identically on the output.
// --------------------------------------------------------------------------

export function parseHtml(text) {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const n = src.length;
  let i = 0;
  const doc = { type: "document", children: [] };
  const stack = [doc];
  const warnings = new Set();
  let strayEnds = 0;
  let implicitEnds = 0;

  const top = () => stack[stack.length - 1];
  const inForeign = () =>
    stack.some((e) => e.lname === "svg" || e.lname === "math");

  function push(node) {
    top().children.push(node);
  }

  // Pop elements whose end tag the source is entitled to leave out. `at` is the
  // offset of the tag that closed them — not the cursor, which has already
  // moved past it, and using the cursor would pull that tag into the closed
  // element's source range and emit it twice.
  function closeImplied(startName, at) {
    for (;;) {
      const t = top();
      if (t.type !== "element") return;
      const set = CLOSED_BY[t.lname];
      if (!set || !set.has(startName)) return;
      t.srcEnd = t.innerEnd = at;
      implicitEnds++;
      stack.pop();
    }
  }

  function scanTagEnd(from) {
    // `from` sits just after the tag name. Returns { end, selfClosed }.
    let j = from;
    for (;;) {
      while (j < n && isWs(src[j])) j++;
      if (j >= n) return { end: n, selfClosed: false, unterminated: true };
      if (src[j] === ">") return { end: j + 1, selfClosed: false };
      if (src[j] === "/" && src[j + 1] === ">") return { end: j + 2, selfClosed: true };
      if (src[j] === "/") { j++; continue; }
      // Attribute name.
      while (j < n && !isWs(src[j]) && src[j] !== "/" && src[j] !== ">" && src[j] !== "=") j++;
      while (j < n && isWs(src[j])) j++;
      if (src[j] !== "=") continue;
      j++;
      while (j < n && isWs(src[j])) j++;
      const q = src[j];
      if (q === '"' || q === "'") {
        const close = src.indexOf(q, j + 1);
        if (close < 0) return { end: n, selfClosed: false, unterminated: true };
        j = close + 1;
      } else {
        while (j < n && !isWs(src[j]) && src[j] !== ">") j++;
      }
    }
  }

  // Raw-text elements end at the first `</name` followed by whitespace, `/` or
  // `>` — exactly the HTML tokenizer's rule, so `"</scriptish"` inside a string
  // does not end the block but `</script >` does.
  function findRawEnd(name, from) {
    const needle = "</" + name;
    let j = from;
    for (;;) {
      const k = src.toLowerCase().indexOf(needle, j);
      if (k < 0) return -1;
      const after = src[k + needle.length];
      if (after === undefined || isWs(after) || after === "/" || after === ">") return k;
      j = k + 1;
    }
  }

  while (i < n) {
    if (src[i] !== "<") {
      const start = i;
      while (i < n && src[i] !== "<") i++;
      push({ type: "text", raw: src.slice(start, i), srcStart: start, srcEnd: i });
      continue;
    }

    const start = i;

    if (src.startsWith("<!--", i)) {
      let close = src.indexOf("-->", i + 4);
      if (close < 0) {
        warnings.add("A comment is never closed with '-->' — everything after it was treated as comment text.");
        i = n;
      } else {
        i = close + 3;
      }
      push({ type: "comment", raw: src.slice(start, i), srcStart: start, srcEnd: i });
      continue;
    }

    if (/^<!doctype/i.test(src.slice(i, i + 9))) {
      const close = src.indexOf(">", i);
      i = close < 0 ? n : close + 1;
      push({ type: "doctype", raw: src.slice(start, i), srcStart: start, srcEnd: i });
      continue;
    }

    if (src.startsWith("<![CDATA[", i) && inForeign()) {
      const close = src.indexOf("]]>", i + 9);
      i = close < 0 ? n : close + 3;
      push({ type: "opaque", raw: src.slice(start, i), srcStart: start, srcEnd: i });
      continue;
    }

    // `<!` that is not a comment or doctype, and `<?`, are bogus comments in
    // HTML: they run to the first `>`.
    if (src.startsWith("<!", i) || src.startsWith("<?", i)) {
      const close = src.indexOf(">", i);
      i = close < 0 ? n : close + 1;
      push({ type: "opaque", raw: src.slice(start, i), srcStart: start, srcEnd: i });
      continue;
    }

    if (src.startsWith("</", i)) {
      if (!isAsciiAlpha(src[i + 2] || "")) {
        // `</>` and `</ foo>` are bogus comments too.
        const close = src.indexOf(">", i);
        i = close < 0 ? n : close + 1;
        push({ type: "opaque", raw: src.slice(start, i), srcStart: start, srcEnd: i });
        continue;
      }
      let j = i + 2;
      while (j < n && !isWs(src[j]) && src[j] !== ">" && src[j] !== "/") j++;
      const name = src.slice(i + 2, j);
      const lname = name.toLowerCase();
      const { end } = scanTagEnd(j);
      i = end;
      const raw = src.slice(start, i);

      let at = -1;
      for (let k = stack.length - 1; k >= 1; k--) {
        if (stack[k].lname === lname) { at = k; break; }
      }
      if (at === -1) {
        strayEnds++;
        push({ type: "opaque", raw, srcStart: start, srcEnd: i, stray: true });
        continue;
      }
      for (let k = stack.length - 1; k > at; k--) {
        stack[k].srcEnd = stack[k].innerEnd = start;
        implicitEnds++;
        stack.pop();
      }
      const el = stack.pop();
      el.innerEnd = start;
      el.closeRaw = raw;
      el.srcEnd = i;
      continue;
    }

    if (!isAsciiAlpha(src[i + 1] || "")) {
      // A bare `<` is literal text.
      i++;
      const from = start;
      while (i < n && src[i] !== "<") i++;
      push({ type: "text", raw: src.slice(from, i), srcStart: from, srcEnd: i });
      continue;
    }

    // Start tag.
    let j = i + 1;
    while (j < n && !isWs(src[j]) && src[j] !== ">" && src[j] !== "/") j++;
    const name = src.slice(i + 1, j);
    const lname = name.toLowerCase();
    const { end, selfClosed, unterminated } = scanTagEnd(j);
    if (unterminated) warnings.add(`<${name}> is never closed with '>'.`);
    i = end;

    closeImplied(lname, start);
    const inside = inForeign();
    const foreignRoot = !inside && (lname === "svg" || lname === "math");
    const foreign = inside || foreignRoot;

    const el = {
      type: "element",
      name,
      lname,
      foreign,
      foreignRoot,
      openRaw: src.slice(start, i),
      closeRaw: null,
      selfClosed,
      children: [],
      srcStart: start,
      srcEnd: i,
      innerStart: i,
      innerEnd: i,
    };
    push(el);

    // A `/` before `>` only self-closes in foreign content; on an HTML element
    // it is ignored, which is why `<div/>` opens a div in every browser.
    if (VOID.has(lname) || (selfClosed && foreign)) continue;

    if (RAW_TEXT.has(lname) && !foreign) {
      const close = findRawEnd(lname, i);
      const contentEnd = close < 0 ? n : close;
      if (close < 0) warnings.add(`<${name}> is never closed with '</${lname}>'.`);
      if (contentEnd > i) {
        el.children.push({
          type: "text",
          raw: src.slice(i, contentEnd),
          srcStart: i,
          srcEnd: contentEnd,
        });
      }
      el.innerEnd = contentEnd;
      el.raw = true;
      i = contentEnd;
      if (close >= 0) {
        const { end: e2 } = scanTagEnd(close + 2 + lname.length);
        el.closeRaw = src.slice(close, e2);
        el.srcEnd = e2;
        i = e2;
      } else {
        el.srcEnd = n;
      }
      continue;
    }

    stack.push(el);
  }

  for (let k = stack.length - 1; k >= 1; k--) {
    const el = stack[k];
    el.srcEnd = el.innerEnd = n;
    if (!CLOSED_BY_PARENT.has(el.lname)) {
      warnings.add(`<${el.name}> is never closed — it was indented as if it wrapped everything after it.`);
    } else {
      implicitEnds++;
    }
  }

  if (strayEnds > 0) {
    warnings.add(
      `${strayEnds} closing ${strayEnds === 1 ? "tag has" : "tags have"} no matching opening tag. ${strayEnds === 1 ? "It was" : "They were"} left exactly where ${strayEnds === 1 ? "it is" : "they are"}.`
    );
  }

  return { src, doc, warnings: [...warnings], implicitEnds, stats: measure(doc) };
}

function measure(doc) {
  let elements = 0;
  let depth = 0;
  const walk = (node, d) => {
    for (const c of node.children || []) {
      if (c.type !== "element") continue;
      elements++;
      if (d > depth) depth = d;
      walk(c, d + 1);
    }
  };
  walk(doc, 1);
  return { elements, depth };
}

// --------------------------------------------------------------------------
// Emitter
// --------------------------------------------------------------------------

// Is a line break next to *this element* free, or does it add a rendered space?
// Note that <svg> and <math> answer no: they sit in the HTML flow as inline
// replaced boxes, however block-like their insides are.
function isBlockLevel(el, opts) {
  if (el.foreign && !el.foreignRoot) return !SVG_INLINE.has(el.lname);
  if (BLOCK.has(el.lname)) return true;
  if (NOT_RENDERED.has(el.lname)) return true;
  // Unknown / custom element: `display: inline` unless told otherwise.
  if (opts.customBlock && el.lname.includes("-")) return true;
  return false;
}

// Is a line break next to this element's *children* free? The two questions
// come apart inside <svg>, where the root is inline but everything under it —
// bar the text-content elements — may be laid out freely.
function maySplitInside(el, opts) {
  if (el.foreign) return !SVG_INLINE.has(el.lname);
  return isBlockLevel(el, opts);
}

const rendersInline = (node, opts) => {
  if (node.type === "text") return /\S/.test(node.raw);
  if (node.type === "element") {
    return !NOT_RENDERED.has(node.lname) && !isBlockLevel(node, opts);
  }
  return node.type === "opaque";
};

// An inline `style` that turns whitespace back on. This is the one case where a
// style sheet's effect on whitespace is visible from the markup alone, so it is
// worth honouring; a class that does the same thing cannot be seen from here.
const preservesWs = (openTag) =>
  /\bstyle\s*=\s*(["'])[^"']*white-space\s*:\s*(pre|pre-wrap|break-spaces)/i.test(openTag);

// Shift a script or style block to a new indentation. Returns null when that
// would be an edit rather than a move: a backtick means a template literal, and
// a backslash at end of line means a continued string — in both cases a line's
// leading whitespace can be part of a value.
function reindentBlock(content, pad) {
  if (content.includes("`")) return null;
  if (/\\[ \t]*\r?\n/.test(content)) return null;
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  if (lines.length < 2) return null;
  while (lines.length && !lines[0].trim()) lines.shift();
  while (lines.length && !lines[lines.length - 1].trim()) lines.pop();
  if (!lines.length) return "";
  let common = Infinity;
  for (const l of lines) {
    if (!l.trim()) continue;
    const m = l.match(/^[ \t]*/)[0].length;
    if (m < common) common = m;
  }
  if (!isFinite(common)) common = 0;
  return lines.map((l) => (l.trim() ? pad + l.slice(common) : "")).join("\n");
}

export function formatHtml(text, opts = {}) {
  const {
    indent = "  ",
    customBlock = false,
    reindentScripts = true,
  } = opts;
  const o = { customBlock };
  const { src, doc, warnings, implicitEnds, stats } = parseHtml(text);
  const notes = [...warnings];
  let scriptsLeftAlone = 0;

  const lines = [];

  // A run of inline content is copied straight out of the source, so every byte
  // of character data — entities, nested tags, interior line breaks — survives
  // untouched. Only the two ends are trimmed, and only because a run always
  // sits against a block boundary, where whitespace is not rendered.
  function pushRun(kids, depth) {
    if (!kids.length) return;
    const s = src
      .slice(kids[0].srcStart, kids[kids.length - 1].srcEnd)
      .replace(/^\s+/, "")
      .replace(/\s+$/, "");
    if (!s) return;
    lines.push(indent.repeat(depth) + s);
  }

  // Only ever called for a container it is safe to break inside, so the
  // whitespace at the two ends of each inline run is not rendered.
  function emitChildren(node, depth) {
    const kids = node.children;
    const inlineCount = kids.filter((c) => rendersInline(c, o)).length;
    const hasInline = inlineCount > 0;
    // Inside <svg> the whitespace between elements is never rendered, so every
    // child is a break point regardless of what it is.
    const foreign = node.type === "element" && node.foreign;

    const breakable = kids.map((c) => {
      if (c.type === "doctype") return true;
      if (c.type === "element") {
        if (foreign) return true;
        if (!isBlockLevel(c, o)) {
          // An <svg> is an inline box, so a break beside it normally costs a
          // rendered space — but when it is the only thing rendering inline in
          // its parent, both sides are block edges and its insides are worth
          // laying out.
          return Boolean(c.foreignRoot) && inlineCount === 1;
        }
        // A not-rendered element between rendered inline content is not a safe
        // break point: the whitespace either side of it would become a space.
        return !(NOT_RENDERED.has(c.lname) && hasInline);
      }
      if (c.type === "comment") return !hasInline;
      return false;
    });

    if (!breakable.some(Boolean)) return false; // caller keeps it on one line

    let run = [];
    const flush = () => {
      pushRun(run, depth);
      run = [];
    };

    for (let k = 0; k < kids.length; k++) {
      const c = kids[k];
      if (breakable[k]) {
        flush();
        if (c.type === "element") emitElement(c, depth);
        else lines.push(indent.repeat(depth) + c.raw);
        continue;
      }
      run.push(c);
    }
    flush();
    return true;
  }

  function emitElement(el, depth) {
    const pad = indent.repeat(depth);
    const open = el.openRaw;
    const close = el.closeRaw || "";

    if (el.selfClosed || VOID.has(el.lname)) {
      lines.push(pad + open);
      return;
    }

    const inner = src.slice(el.innerStart, el.innerEnd);

    if (PRESERVE_WS.has(el.lname) || preservesWs(open)) {
      // A newline straight after <pre> is swallowed by the parser, so one must
      // never be introduced — and nothing inside may be touched at all.
      lines.push(pad + open + inner + close);
      return;
    }

    if (el.raw) {
      if (reindentScripts && (el.lname === "script" || el.lname === "style")) {
        const shifted = reindentBlock(inner, pad + indent);
        if (shifted === "") {
          lines.push(pad + open + close);
          return;
        }
        if (shifted !== null) {
          lines.push(pad + open + "\n" + shifted + "\n" + pad + close);
          return;
        }
        if (/\n/.test(inner.trim())) scriptsLeftAlone++;
      }
      lines.push(pad + open + inner + close);
      return;
    }

    const canSplit = maySplitInside(el, o);

    if (!inner.trim() && !el.children.some((c) => c.type !== "text")) {
      lines.push(pad + open + close);
      return;
    }

    // Splitting is only ever safe inside a box whose own whitespace is not
    // rendered. An inline element — a <span> that somehow wraps a <div>, a
    // custom element, an SVG <text> — keeps everything on one line, because
    // whitespace at *its* edges is a rendered space.
    if (canSplit) {
      const at = lines.length;
      lines.push(pad + open);
      if (emitChildren(el, depth + 1)) {
        // No closing tag in the source (a bare <tr>, <li> or <p>) means no
        // closing line — otherwise the indent alone would be left behind as a
        // line of trailing whitespace.
        if (close) lines.push(pad + close);
        return;
      }
      lines.length = at;
    }

    // Inline or mixed content: one line, character data copied verbatim. The
    // two ends are trimmed only where they are not rendered.
    const s = canSplit ? inner.replace(/^\s+/, "").replace(/\s+$/, "") : inner;
    lines.push(pad + open + s + close);
  }

  if (!emitChildren(doc, 0)) {
    const s = src.trim();
    if (s) lines.push(s);
  }

  if (scriptsLeftAlone > 0) {
    notes.push(
      `${scriptsLeftAlone} script or style ${scriptsLeftAlone === 1 ? "block was" : "blocks were"} left at the original indentation because ${scriptsLeftAlone === 1 ? "it contains" : "they contain"} a template literal or a continued string, where a line's leading spaces can be part of a value.`
    );
  }
  if (implicitEnds > 0) {
    notes.push(
      `${implicitEnds} ${implicitEnds === 1 ? "element uses" : "elements use"} HTML's optional end tags (such as a bare <li> or <p>). ${implicitEnds === 1 ? "It was" : "They were"} indented correctly and no closing tag was added.`
    );
  }

  return { text: lines.join("\n"), warnings: notes, stats };
}
