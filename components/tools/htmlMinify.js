// HTML minifier — whitespace and comments only, and only where CSS would not
// render them. Kept out of the component so it can be tested in node.
//
// The rule that matters: in HTML a run of whitespace collapses to ONE SPACE,
// not to nothing. `<b>Hello</b> <i>world</i>` reads "Hello world"; deleting
// the gap between the tags makes it "Helloworld". So whitespace between two
// tags is only dropped where the whitespace-processing model drops it anyway:
// beside a block-level element (start or end of a line box), or between two
// elements that render nothing (<meta>, <link>, <script> in a <head>).
// Everywhere else it is collapsed to a single space.
import { BLOCK, NOT_RENDERED } from "./htmlFormat.js";

// A tag, honouring quoted attribute values that contain ">".
const TAG = /<(?:"[^"]*"|'[^']*'|[^'">])*>/g;

function tagName(text) {
  const m = /^<\/?([a-zA-Z][^\s/>]*)/.exec(text);
  return m ? m[1].toLowerCase() : null;
}

function tokenize(html) {
  const out = [];
  const pushHtml = (chunk) => {
    let last = 0;
    let m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(chunk)) !== null) {
      if (m.index > last) out.push({ kind: "text", text: chunk.slice(last, m.index) });
      out.push({ kind: "tag", name: tagName(m[0]), text: m[0] });
      last = TAG.lastIndex;
    }
    if (last < chunk.length) out.push({ kind: "text", text: chunk.slice(last) });
  };
  // Comments, then blocks whose contents are copied verbatim (whitespace or
  // code that matters), then ordinary markup.
  const re = /(<!--[\s\S]*?-->)|<(pre|textarea|script|style)\b[^>]*>[\s\S]*?<\/\2\s*>/gi;
  let last = 0;
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) pushHtml(html.slice(last, m.index));
    if (m[1] !== undefined) out.push({ kind: "comment", text: m[1] });
    else out.push({ kind: "tag", name: m[2].toLowerCase(), text: m[0], raw: true });
    last = re.lastIndex;
  }
  if (last < html.length) pushHtml(html.slice(last));
  return out;
}

// null = start/end of the document, which behaves like a block edge.
const isBlock = (tok) => !tok || (tok.kind === "tag" && (tok.name == null || BLOCK.has(tok.name)));
const isHidden = (tok) => tok && tok.kind === "tag" && NOT_RENDERED.has(tok.name);

export function minifyHtml(html, { removeComments = true } = {}) {
  let toks = tokenize(html);
  if (removeComments) {
    // Conditional comments (<!--[if IE]>) change rendering, so they stay.
    toks = toks.filter((t) => t.kind !== "comment" || /^<!--\[if/i.test(t.text));
  }
  // Merge text left adjacent by a removed comment: "a <!-- x --> b" → "a b".
  const merged = [];
  for (const t of toks) {
    const prev = merged[merged.length - 1];
    if (t.kind === "text" && prev && prev.kind === "text") prev.text += t.text;
    else merged.push({ ...t });
  }
  // Nearest neighbour that is not a kept comment (comments are transparent).
  const neighbour = (i, dir) => {
    for (let j = i + dir; j >= 0 && j < merged.length; j += dir) {
      if (merged[j].kind !== "comment") return merged[j];
    }
    return null;
  };

  let out = "";
  merged.forEach((t, i) => {
    if (t.kind !== "text") { out += t.text; return; }
    let s = t.text.replace(/\s+/g, " ");
    const prev = neighbour(i, -1);
    const next = neighbour(i, 1);
    if (s === " ") {
      const drop = isBlock(prev) || isBlock(next) || (isHidden(prev) && isHidden(next));
      out += drop ? "" : " ";
      return;
    }
    if (s.startsWith(" ") && isBlock(prev)) s = s.slice(1);
    if (s.endsWith(" ") && isBlock(next)) s = s.slice(0, -1);
    out += s;
  });
  return out;
}
