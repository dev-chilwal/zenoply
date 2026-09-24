// HTML to Markdown, kept out of the component so it can be exercised in node:
// every conversion is checked by rendering the Markdown back to HTML with
// commonmark (the reference implementation) and marked, and comparing the two
// trees. It walks the tree htmlFormat.js already builds, so there is no new
// dependency — the same reasoning that made xmlJson.js zero-dep.
//
// A converter is easy to write and hard to make faithful, because Markdown is a
// format where ordinary characters change meaning by position. Five things
// shape this file:
//
//  1. **Text is escaped by context, not wholesale.** A `*` or `_` in prose can
//     start emphasis, a `1.` or `-` at the start of a line starts a list, `#`
//     a heading, `[x](y)` a link and `&copy;` a character reference. Escaping
//     every punctuation mark is safe and unreadable; escaping none silently
//     reformats the text. So each character is escaped only where it could
//     actually be read as syntax: `snake_case` stays as written because an
//     intraword `_` never opens emphasis, `2 * 3` keeps its bare asterisk, and
//     a leading `2026.` only becomes `2026\.` at the start of a line.
//  2. **Emphasis is checked against CommonMark's flanking rules before it is
//     written.** `<b>"quoted"</b>word` naively becomes `**"quoted"**word`, and
//     that closing `**` is not right-flanking, so it renders as literal
//     asterisks. Every delimiter is emitted as a placeholder, checked against
//     its real neighbours once the paragraph is assembled, and written as
//     `<strong>` instead when the Markdown form would not parse — the one case
//     where HTML is the only faithful output.
//  3. **Whitespace follows CSS.** Runs collapse to one space, a space at the
//     edge of a `<b>` moves outside the `**` (`** bold**` is not emphasis),
//     and `<pre>` is copied byte for byte into a fence longer than any run of
//     backticks inside it.
//  4. **Adjacent lists keep their boundary.** Two `<ul>`s in a row written with
//     the same marker merge into one list in Markdown, so the second switches
//     marker — the only way the format can say "a new list starts here".
//  5. **What Markdown cannot say is kept as HTML or reduced to text — your
//     choice — and counted.** A table with merged cells, `<sup>`, `<u>`, an
//     iframe: Markdown allows raw HTML, so by default they survive as HTML;
//     with that off they become plain text and the tool says how many did.

import { parseHtml, BLOCK } from "./htmlFormat.js";
import { decodeEntities } from "./htmlEntities.js";
import { readAttr } from "./htmlStrip.js";

// --------------------------------------------------------------------------
// Placeholders
//
// Private-use code points, built from numbers so no literal ever sits in the
// source. They never survive into the output: any already present in the input
// are replaced before the walk begins.
// --------------------------------------------------------------------------

const BR = String.fromCharCode(0xe000);
const OPEN = String.fromCharCode(0xe001);
const CLOSE = String.fromCharCode(0xe002);
// A space inside a code span, which the paragraph-level collapse must not touch.
const CODE_SP = String.fromCharCode(0xe003);
// The two ends of a code span, fenced only once the paragraph is assembled.
const CS_OPEN = String.fromCharCode(0xe004);
const CS_CLOSE = String.fromCharCode(0xe005);
const PUA = new RegExp("[" + BR + OPEN + CLOSE + CODE_SP + CS_OPEN + CS_CLOSE + String.fromCharCode(0xe006) + "]", "g");
// The start of a link, so a `!` written just before it can be escaped:
// `![text](url)` is an image.
const LINK_MARK = String.fromCharCode(0xe006);
const CODE_RUN = new RegExp(CS_OPEN + "([^" + CS_CLOSE + "]*)" + CS_CLOSE, "g");
const REPLACEMENT = String.fromCharCode(0xfffd);

// Delimiter kinds: e = emphasis, s = strong, d = strikethrough.
const DELIM = { e: "*", s: "**", d: "~~" };
const TAG = { e: "em", s: "strong", d: "del" };

// --------------------------------------------------------------------------
// Element tables
// --------------------------------------------------------------------------

// Rendered as nothing, so dropped with their contents.
const DROP = new Set([
  "script", "style", "head", "title", "meta", "link", "base", "template",
  "noscript", "datalist", "param", "source", "track", "rp", "canvas", "map",
  "area", "select", "option", "optgroup", "textarea", "input", "noembed",
  "noframes", "frameset", "frame", "col", "colgroup",
]);

// Embedded content with no Markdown form at all: kept as HTML, or dropped.
const EMBED = new Set(["iframe", "video", "audio", "svg", "math", "object", "embed"]);

// Inline elements with no Markdown form that still carry meaning.
const INLINE_HTML = new Set(["sub", "sup", "u", "ins", "mark", "abbr", "kbd", "small", "big"]);

const PRE_LIKE = new Set(["pre", "xmp", "listing", "plaintext"]);
const LIST = new Set(["ul", "ol", "menu", "dir"]);

// Anything that starts a new block, so a `<span>` or `<a>` around one cannot
// be written as a single inline run.
const BLOCKISH = new Set([...BLOCK, "details", "summary", ...EMBED]);

const isHidden = (el) =>
  readAttr(el.openRaw, "hidden") !== null ||
  /\bstyle\s*=\s*(["'])[^"']*display\s*:\s*none/i.test(el.openRaw);

// An icon marked aria-hidden is decoration, and as raw HTML it is just noise
// in the middle of a document.
const isDecorative = (el) => EMBED.has(el.lname) && readAttr(el.openRaw, "aria-hidden") === "true";

// --------------------------------------------------------------------------
// Characters
// --------------------------------------------------------------------------

// Unicode whitespace, which includes the no-break space: `**&nbsp;x**` does
// not open emphasis.
const isWsChar = (c) => c === undefined || c === BR || /\s/.test(c);
// ASCII punctuation plus the Unicode P and S classes, which is what CommonMark
// means by "punctuation" when it decides whether a delimiter is flanking.
const isPunct = (c) => c !== undefined && /[\p{P}\p{S}]/u.test(c);
const isAlnum = (c) => c !== undefined && /[\p{L}\p{N}]/u.test(c);

const ENTITY_SHAPE = /^&(#[0-9]{1,7}|#[xX][0-9a-fA-F]{1,6}|[A-Za-z][A-Za-z0-9]*);/;

function decodeText(raw, context) {
  return decodeEntities(raw, { context }).text.replace(PUA, REPLACEMENT);
}

/**
 * Escape a run of plain text so it reads back as exactly that text.
 * Line-start constructs (`#`, `-`, `1.`, `>`) are handled later, once the
 * paragraph's lines are known.
 */
function escapeText(t, ctx) {
  let out = "";
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    const prev = t[i - 1];
    const next = t[i + 1];
    switch (c) {
      case "\\":
      case "`":
      case "[":
      case "]":
        out += "\\" + c;
        break;
      case "*":
        // `2 * 3` cannot open or close anything: a delimiter surrounded by
        // spaces is neither left- nor right-flanking. Only when those spaces
        // are inside this run, though — a space at either end may be moved
        // outside a `*` span later, leaving the asterisk touching it.
        out += prev === " " && next === " " && i >= 2 && i <= t.length - 3 ? c : "\\" + c;
        break;
      case "_":
        // An underscore inside a word never opens emphasis, so snake_case and
        // file_names_like_this are left alone.
        out += isAlnum(prev) && isAlnum(next) ? c : "\\" + c;
        break;
      case "~":
        out += ctx.gfm ? "\\" + c : c;
        break;
      case "|":
        out += ctx.table ? "\\" + c : c;
        break;
      case "<":
        out += next !== undefined && /[A-Za-z\/!?]/.test(next) ? "\\" + c : c;
        break;
      case "&":
        // `&amp;` rather than `\&`: marked decodes `\&copy;` inside image alt
        // text, and the reference means the same thing everywhere.
        out += ENTITY_SHAPE.test(t.slice(i)) ? "&amp;" : c;
        break;
      default:
        out += c;
    }
  }
  return out;
}

const NBSP = String.fromCharCode(0xa0);
const EDGE_NBSP = new RegExp("^" + NBSP + "+|" + NBSP + "+$", "g");

// The start of any line of a paragraph is where block syntax lives.
function escapeLineStart(line) {
  // Parsers strip a paragraph line's leading and trailing whitespace, and in
  // practice that includes a no-break space; the reference cannot be stripped.
  line = line.replace(EDGE_NBSP, (m) => "&nbsp;".repeat(m.length));
  if (/^#{1,6}(?: |$)/.test(line)) return "\\" + line;
  if (/^[>+=-]/.test(line)) return "\\" + line;
  if (/^~~~/.test(line)) return "\\" + line;
  if (/^\*(?: |$)/.test(line)) return "\\" + line;
  const m = /^(\d{1,9})([.)])(?= |$)/.exec(line);
  if (m) return m[1] + "\\" + line.slice(m[1].length);
  return line;
}

// --------------------------------------------------------------------------
// Emphasis resolution
// --------------------------------------------------------------------------

/**
 * Replace delimiter placeholders with `*`, `**` or `~~` where CommonMark will
 * read them as delimiters, and with the equivalent HTML tag where it will not.
 */
function resolveDelims(s, ctx) {
  // Tokenise into text and delimiter tokens.
  const toks = [];
  let buf = "";
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === OPEN || c === CLOSE) {
      if (buf) { toks.push({ text: buf }); buf = ""; }
      toks.push({ open: c === OPEN, kind: s[i + 1] });
      i++;
    } else {
      buf += c;
    }
  }
  if (buf) toks.push({ text: buf });

  // Pair them. They are generated by a recursive walk, so they nest properly.
  const stack = [];
  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    if (t.text !== undefined) continue;
    if (t.open) stack.push(k);
    else {
      const o = stack.pop();
      toks[o].pair = k;
      t.pair = o;
    }
  }

  // `**a**` directly followed by `**b**` would fuse into a run of four; the
  // two render identically as one span, so the seam is removed.
  for (let k = 0; k + 1 < toks.length; k++) {
    const a = toks[k], b = toks[k + 1];
    if (a.text === undefined && b.text === undefined && !a.dead && !b.dead &&
        !a.open && b.open && a.kind === b.kind) {
      a.dead = b.dead = true;
      toks[a.pair].pair = b.pair;
      toks[b.pair].pair = a.pair;
    }
  }

  // Neighbouring characters, looking through other delimiters, which will be
  // punctuation (`*`, `~`, or the `<`/`>` of a tag) whichever way they go.
  const charBefore = (k) => {
    for (let j = k - 1; j >= 0; j--) {
      const t = toks[j];
      if (t.dead) continue;
      if (t.text === undefined) return "*";
      return t.text[t.text.length - 1];
    }
    return undefined;
  };
  const charAfter = (k) => {
    for (let j = k + 1; j < toks.length; j++) {
      const t = toks[j];
      if (t.dead) continue;
      if (t.text === undefined) return "*";
      return t.text[0];
    }
    return undefined;
  };
  const leftFlanking = (p, n) => !isWsChar(n) && (!isPunct(n) || isWsChar(p) || isPunct(p));
  const rightFlanking = (p, n) => !isWsChar(p) && (!isPunct(p) || isWsChar(n) || isPunct(n));

  // Asterisk spans open around each opener, innermost last.
  const openStars = [];
  for (let k = 0; k < toks.length; k++) {
    const t = toks[k];
    if (t.text !== undefined || t.dead) continue;
    if (!t.open) {
      if (t.kind !== "d" && openStars[openStars.length - 1] === t.pair) openStars.pop();
      continue;
    }
    const c = toks[t.pair];
    const p = charBefore(k), n = charAfter(k);
    // An opener that is right-flanking too can *close* instead: inside an
    // open `*` span, `x\\**y` ends that span rather than starting a new one.
    const ambiguous = t.kind !== "d" && openStars.length > 0 && rightFlanking(p, n);
    const okOpen = leftFlanking(p, n) && !ambiguous;
    const okClose = rightFlanking(charBefore(t.pair), charAfter(t.pair));
    // An asterisk closer touching an asterisk opener fuses into one run.
    const fuse = (j, dir) => {
      const u = toks[j + dir];
      return u && u.text === undefined && !u.dead && u.kind !== "d" && t.kind !== "d" &&
        u.open !== toks[j].open;
    };
    if (!okOpen || !okClose || fuse(k, -1) || fuse(t.pair, 1)) {
      t.html = c.html = true;
      ctx.stats.htmlEmphasis++;
    } else if (t.kind !== "d") {
      openStars.push(k);
    }
  }

  let out = "";
  for (const t of toks) {
    if (t.text !== undefined) out += t.text;
    else if (t.dead) continue;
    else if (t.html) out += t.open ? `<${TAG[t.kind]}>` : `</${TAG[t.kind]}>`;
    else out += DELIM[t.kind];
  }
  return out;
}

/**
 * Turn an assembled inline run into finished Markdown text.
 * mode: "para" (hard breaks as backslash-newline, line starts escaped),
 *       "line" (a heading: breaks become spaces), "cell" (breaks become <br>).
 */
function finishInline(s, ctx, mode = "para") {
  s = s.replace(/ {2,}/g, " ");
  s = s.replace(new RegExp(" ?" + BR + " ?", "g"), BR);
  // Leading and trailing breaks render as nothing visible.
  s = s.replace(new RegExp("^[ " + BR + "]+|[ " + BR + "]+$", "g"), "");
  if (!s) return "";
  // Two code spans side by side would fuse: `a` then `b` is written `a``b`,
  // and that middle run of two backticks closes nothing. They are merged.
  s = s.split(CS_CLOSE + CS_OPEN).join("").replace(CODE_RUN, (_, t) => fence(t.split(CODE_SP).join(" ")));
  s = s.replace(new RegExp("(^|[^\\\\])!" + LINK_MARK, "g"), "$1\\!").split(LINK_MARK).join("");
  s = resolveDelims(s, ctx).split(CODE_SP).join(" ");
  const lines = s.split(BR);
  if (mode === "line") return lines.join(ctx.keepHtml ? "<br>" : " ").replace(EDGE_NBSP, (m) => "&nbsp;".repeat(m.length));
  if (mode === "cell") return lines.join("<br>");
  // An empty line would end the paragraph, so a double <br> keeps a backslash.
  return lines.map((l) => escapeLineStart(l)).join("\\\n");
}

// --------------------------------------------------------------------------
// Inline rendering
// --------------------------------------------------------------------------

function textContent(node) {
  if (node.type === "text") return node.raw;
  if (node.type !== "element") return "";
  if (DROP.has(node.lname)) return "";
  if (node.lname === "br") return "\n";
  return (node.children || []).map(textContent).join("");
}

function codeSpan(text, ctx) {
  let t = text.replace(/[ \t\n\r\f]+/g, " ");
  if (!t) return "";
  if (ctx.table) t = t.replace(/\|/g, "\\|");
  return CS_OPEN + t.replace(/ /g, CODE_SP) + CS_CLOSE;
}

function fence(t) {
  const runs = t.match(/`+/g) || [];
  const longest = runs.reduce((m, r) => Math.max(m, r.length), 0);
  const ticks = "`".repeat(longest + 1);
  // CommonMark strips one space from each end when both ends have one, and a
  // backtick at either end would join the fence — both need a pad.
  const pad = /^`|`$/.test(t) || (/^ /.test(t) && / $/.test(t) && /[^ ]/.test(t));
  const out = pad ? `${ticks} ${t} ${ticks}` : ticks + t + ticks;
  return out.replace(/ /g, CODE_SP);
}

function escapeDestination(url) {
  let u = url.replace(/[\t\n\r\f]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));
  u = u.replace(/\\(?=[!-\/:-@\[-`{-~])/g, "\\\\");
  u = u.replace(/&(?=#[0-9]{1,7};|#[xX][0-9a-fA-F]{1,6};|[A-Za-z][A-Za-z0-9]*;)/g, "\\&");
  let depth = 0, balanced = true;
  for (const c of u) {
    if (c === "(") depth++;
    else if (c === ")" && --depth < 0) { balanced = false; break; }
  }
  if (depth !== 0) balanced = false;
  if (!u || / |<|>/.test(u)) return "<" + u.replace(/[<>]/g, "\\$&") + ">";
  return balanced ? u : u.replace(/[()]/g, "\\$&");
}

function titlePart(el) {
  const t = readAttr(el.openRaw, "title");
  if (!t) return "";
  const v = decodeText(t, "attribute").replace(/[ \t\n\r\f]+/g, " ").trim();
  if (!v) return "";
  return ' "' + v.replace(/["\\]/g, "\\$&").replace(/&(?=[A-Za-z#])/g, "\\&") + '"';
}

const UNSAFE_URL = /^[\s\x00-\x1f]*(javascript|vbscript):/i;

// Split a run into its leading whitespace and breaks, its core, and its
// trailing whitespace and breaks. `** bold**` is not emphasis and `[\
// text](x)` starts a link with a break, so both edges move outside.
const EDGES = new RegExp("^([ " + BR + "]*)([^]*?)([ " + BR + "]*)$");

function wrap(kind, inner) {
  const [, lead, core, trail] = EDGES.exec(inner);
  if (!core) return lead + trail;
  return lead + OPEN + kind + core + CLOSE + kind + trail;
}

function rawOpen(el) {
  return el.openRaw.replace(/[\r\n]+/g, " ");
}

function inlineChildren(kids, ctx) {
  let s = "";
  for (const c of kids || []) s += inlineNode(c, ctx);
  return s;
}

function inlineNode(c, ctx) {
  if (c.type === "text") {
    const t = decodeText(c.raw, "text").replace(/[ \t\n\r\f]+/g, " ");
    return escapeText(t, ctx);
  }
  if (c.type === "comment") { ctx.stats.comments++; return ""; }
  if (c.type !== "element") return "";
  return inlineEl(c, ctx);
}

function inlineEl(c, ctx) {
  const name = c.lname;
  const { stats } = ctx;

  if (DROP.has(name) || isHidden(c)) { noteDropped(c, ctx); return ""; }

  switch (name) {
    case "br":
      return BR;
    case "wbr":
      return "";
    case "img":
      return image(c, ctx);
    case "a":
      return link(c, ctx);
    case "b":
    case "strong":
      return styled(c, ctx, "s");
    case "i":
    case "em":
    case "cite":
    case "dfn":
    case "var":
      return styled(c, ctx, "e");
    case "s":
    case "strike":
    case "del":
      if (ctx.gfm) return styled(c, ctx, "d");
      return keepInline(c, ctx);
    case "code":
    case "tt":
    case "samp":
      return codeSpan(decodeText(textContent(c), "text"), ctx);
    case "q": {
      const inner = inlineChildren(c.children, ctx);
      return "“" + inner + "”";
    }
  }

  if (INLINE_HTML.has(name)) return keepInline(c, ctx);

  if (EMBED.has(name)) {
    if (isDecorative(c)) { stats.decorative++; return ""; }
    if (!ctx.keepHtml) { stats.droppedEmbeds++; return ""; }
    stats.keptHtml++;
    return ctx.src.slice(c.srcStart, c.srcEnd).replace(/\n[ \t]*(?=\n)/g, "").replace(/\n+/g, " ");
  }

  if (PRE_LIKE.has(name)) return codeSpan(preText(c), ctx);

  // A block inside inline content (a heading inside a link, say): its edges
  // become line breaks, the closest an inline run can come.
  if (BLOCKISH.has(name)) return BR + inlineChildren(c.children, ctx) + BR;

  return styled(c, ctx, null);
}

// Google Docs, and most rich-text editors, mark bold and italic with inline
// styles on a <span> rather than <b> and <i> — and wrap the whole paste in a
// <b style="font-weight:normal">, which is not bold at all.
function styleOf(el) {
  const st = readAttr(el.openRaw, "style");
  if (!st) return null;
  const w = /font-weight\s*:\s*([a-z0-9]+)/i.exec(st);
  const i = /font-style\s*:\s*(italic|oblique)/i.test(st);
  const d = /text-decoration(?:-line)?\s*:[^;]*line-through/i.test(st);
  let bold = null;
  if (w) bold = /^(bold|bolder|[6-9]00)$/i.test(w[1]) ? true : /^(normal|lighter|[1-5]00)$/i.test(w[1]) ? false : null;
  return { bold, italic: i, strike: d };
}

function styled(c, ctx, base) {
  const st = styleOf(c);
  if (!st) return base ? nest(c, ctx, base) : inlineChildren(c.children, ctx);
  let kinds = [];
  if (base === "s" ? st.bold !== false : st.bold) kinds.push("s");
  if (base === "e" || st.italic) kinds.push("e");
  if (base === "d" || (st.strike && ctx.gfm)) kinds.push("d");
  kinds = kinds.filter((k) => !ctx.open[k]);
  const render = (i) => {
    if (i === kinds.length) return inlineChildren(c.children, ctx);
    const k = kinds[i];
    ctx.open[k] = true;
    const inner = render(i + 1);
    ctx.open[k] = false;
    return wrap(k, inner);
  };
  return render(0);
}

function nest(c, ctx, kind) {
  // <i><em>x</em></i> is one level of emphasis, and `**x**` would be two.
  if (ctx.open[kind]) return inlineChildren(c.children, ctx);
  ctx.open[kind] = true;
  const inner = inlineChildren(c.children, ctx);
  ctx.open[kind] = false;
  return wrap(kind, inner);
}

function keepInline(c, ctx) {
  const inner = inlineChildren(c.children, ctx);
  if (!ctx.keepHtml) { ctx.stats.flattened++; return inner; }
  if (!inner.trim()) return inner;
  ctx.stats.keptHtml++;
  return rawOpen(c) + inner + `</${c.name}>`;
}

function image(c, ctx) {
  const src = readAttr(c.openRaw, "src");
  if (src === null || !src.trim()) return "";
  const url = decodeText(src, "attribute").trim();
  if (UNSAFE_URL.test(url)) { ctx.stats.unsafe++; return ""; }
  const altRaw = readAttr(c.openRaw, "alt");
  const alt = altRaw ? decodeText(altRaw, "attribute").replace(/[ \t\n\r\f]+/g, " ").trim() : "";
  ctx.stats.images++;
  return "![" + escapeText(alt, ctx) + "](" + escapeDestination(url) + titlePart(c) + ")";
}

function link(c, ctx) {
  const hrefRaw = readAttr(c.openRaw, "href");
  const inner = inlineChildren(c.children, ctx);
  // <a name="x"> with no href is an anchor, not a link.
  if (hrefRaw === null) return inner;
  const href = decodeText(hrefRaw, "attribute").trim();
  if (UNSAFE_URL.test(href)) { ctx.stats.unsafe++; return inner; }
  ctx.stats.links++;

  // When the text is the URL, the short autolink form says the same thing.
  const plain = decodeText(textContent(c), "text").replace(/[ \t\n\r\f]+/g, " ").trim();
  const title = titlePart(c);
  if (!title && plain && !ctx.table) {
    if (plain === href && /^[A-Za-z][A-Za-z0-9+.-]{1,31}:[^\s<>]*$/.test(href) && !/[\\]/.test(href)) {
      return "<" + href + ">";
    }
    if (href === "mailto:" + plain && /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/.test(plain)) {
      return "<" + plain + ">";
    }
  }
  // Link text keeps its outer spaces and breaks outside the brackets.
  const [, lead, core, trail] = EDGES.exec(inner);
  return lead + LINK_MARK + "[" + core + "](" + escapeDestination(href) + title + ")" + trail;
}

function preText(el) {
  let t = decodeText(textContent(el), "text");
  // The HTML parser drops a single newline straight after <pre> — only when
  // it is the very first thing inside, so not after a comment.
  const first = (el.children || [])[0];
  if (first && first.type === "text" && /^\r?\n/.test(first.raw)) t = t.replace(/^\r?\n/, "");
  return t.replace(/\r\n?/g, "\n");
}

function noteDropped(c, ctx) {
  if (c.lname === "script") ctx.stats.scripts++;
  else if (c.lname === "style") ctx.stats.styles++;
}

// --------------------------------------------------------------------------
// Block rendering
// --------------------------------------------------------------------------

function hasBlockDescendant(el) {
  for (const c of el.children || []) {
    if (c.type !== "element") continue;
    if (BLOCKISH.has(c.lname) || LIST.has(c.lname)) return true;
    if (hasBlockDescendant(c)) return true;
  }
  return false;
}

const indent = (text, n) =>
  text.split("\n").map((l) => (l ? " ".repeat(n) + l : l)).join("\n");

/**
 * Render a list of child nodes as Markdown blocks: [{ type, text, ... }].
 */
function renderBlocks(kids, ctx) {
  const out = [];
  let buf = "";

  const flush = () => {
    const t = finishInline(buf, ctx, ctx.table ? "cell" : "para");
    buf = "";
    if (t) out.push({ type: "p", text: t });
  };
  const push = (b) => { if (b && b.text !== undefined) out.push(b); };

  const visit = (nodes) => {
    for (const c of nodes || []) {
      if (c.type !== "element") { buf += inlineNode(c, ctx); continue; }
      const name = c.lname;
      if (DROP.has(name) || isHidden(c)) { noteDropped(c, ctx); continue; }

      if (/^h[1-6]$/.test(name)) { flush(); push(heading(c, ctx)); continue; }
      if (name === "p") { flush(); buf = inlineChildren(c.children, ctx); flush(); continue; }
      if (PRE_LIKE.has(name)) { flush(); push(codeBlock(c, ctx)); continue; }
      if (LIST.has(name)) {
        flush();
        const prev = out[out.length - 1];
        push(list(c, ctx, prev && prev.type === "list" ? prev : null));
        continue;
      }
      if (name === "blockquote") { flush(); push(quote(c, ctx)); continue; }
      if (name === "hr") { flush(); push({ type: "hr", text: "---" }); continue; }
      if (name === "table") { flush(); for (const b of table(c, ctx)) push(b); continue; }
      if (name === "details") { flush(); for (const b of details(c, ctx)) push(b); continue; }
      if (EMBED.has(name)) {
        if (isDecorative(c)) { ctx.stats.decorative++; continue; }
        flush();
        if (!ctx.keepHtml) { ctx.stats.droppedEmbeds++; continue; }
        ctx.stats.keptHtml++;
        const raw = ctx.src.slice(c.srcStart, c.srcEnd).replace(/\n[ \t]*(?=\n)/g, "");
        push({ type: "html", text: raw.trim() });
        continue;
      }
      if (BLOCKISH.has(name)) { flush(); visit(c.children); flush(); continue; }
      if (hasBlockDescendant(c)) {
        // A link round a heading — every blog index card — cannot be one
        // Markdown link, so the link moves inside each heading and paragraph.
        if (name === "a" && readAttr(c.openRaw, "href") !== null) {
          flush();
          for (const b of linkBlocks(c, ctx)) push(b);
          continue;
        }
        // A <span> or <b> wrapped round a <div>: the blocks inside are still
        // blocks, and the wrapper cannot span them in Markdown.
        visit(c.children);
        continue;
      }
      buf += inlineEl(c, ctx);
    }
  };

  visit(kids);
  flush();
  return out;
}

function linkBlocks(a, ctx) {
  const href = decodeText(readAttr(a.openRaw, "href"), "attribute").trim();
  const blocks = renderBlocks(a.children, ctx);
  if (UNSAFE_URL.test(href)) { ctx.stats.unsafe++; return blocks; }
  const dest = "(" + escapeDestination(href) + titlePart(a) + ")";
  return blocks.map((b) => {
    if (b.type === "p") { ctx.stats.links++; return { ...b, text: "[" + b.text + "]" + dest }; }
    if (b.type === "h") {
      ctx.stats.links++;
      const m = /^(#+ )(.*)$/s.exec(b.text);
      return { ...b, text: m[1] + "[" + m[2] + "]" + dest };
    }
    return b;
  });
}

const joinBlocks = (blocks) => blocks.map((b) => b.text).join("\n\n");

function heading(c, ctx) {
  const level = Number(c.lname[1]);
  let t = finishInline(inlineChildren(c.children, ctx), ctx, "line");
  if (!t) return null;
  // A trailing run of #s after a space is a closing sequence and is stripped.
  t = t.replace(/(^| )(#+)$/, "$1\\$2");
  ctx.stats.headings++;
  return { type: "h", text: "#".repeat(level) + " " + t };
}

function codeBlock(c, ctx) {
  let t = preText(c);
  if (t.endsWith("\n")) t = t.slice(0, -1);
  const code = (c.children || []).find((k) => k.type === "element" && k.lname === "code");
  const cls = [readAttr(c.openRaw, "class"), code && readAttr(code.openRaw, "class")]
    .filter(Boolean).join(" ");
  const m = /(?:^|\s)(?:language|lang)-([\w+#.-]+)/.exec(cls);
  const runs = t.match(/`{3,}/g) || [];
  const len = runs.reduce((a, r) => Math.max(a, r.length + 1), 3);
  const fence = "`".repeat(len);
  ctx.stats.codeBlocks++;
  return { type: "code", text: fence + (m ? m[1] : "") + "\n" + (t ? t + "\n" : "") + fence };
}

function quote(c, ctx) {
  const inner = joinBlocks(renderBlocks(c.children, ctx));
  if (!inner) return null;
  return {
    type: "quote",
    text: inner.split("\n").map((l) => (l ? "> " + l : ">")).join("\n"),
  };
}

function list(el, ctx, prevList) {
  const ordered = el.lname === "ol";
  const startAttr = ordered ? parseInt(readAttr(el.openRaw, "start"), 10) : NaN;
  let n = Number.isFinite(startAttr) && startAttr >= 0 ? startAttr : 1;

  // A list straight after another list of the same kind would merge into it,
  // so the second takes the other marker.
  let bullet = ctx.bullet;
  let delim = ".";
  if (prevList && prevList.ordered === ordered) {
    if (ordered) delim = prevList.delim === "." ? ")" : ".";
    else bullet = prevList.bullet === ctx.bullet ? (ctx.bullet === "-" ? "*" : "-") : ctx.bullet;
  }

  const items = [];
  const kids = el.children || [];
  for (const c of kids) {
    if (c.type === "text" && !c.raw.trim()) continue;
    if (c.type === "comment") continue;
    if (c.type === "element" && c.lname === "li") {
      let task = null;
      let children = c.children || [];
      const first = children.find((k) => !(k.type === "text" && !k.raw.trim()));
      if (first && first.type === "element" && first.lname === "input" &&
          /^checkbox$/i.test(readAttr(first.openRaw, "type") || "")) {
        task = readAttr(first.openRaw, "checked") !== null;
        children = children.filter((k) => k !== first);
        ctx.stats.tasks++;
      }
      items.push({ blocks: renderBlocks(children, ctx), task });
    } else {
      // A <ul> sitting directly inside a <ul> is invalid but common; it belongs
      // to the item before it.
      if (!items.length) items.push({ blocks: [], task: null });
      items[items.length - 1].blocks.push(...renderBlocks([c], ctx));
    }
  }
  if (!items.length) return null;
  ctx.stats.lists++;

  // Tight when every item is a line of text, optionally followed by a nested
  // list. Two paragraphs in one item need a blank line between them, and a
  // blank line anywhere makes the whole list loose.
  const loose = items.some((it) =>
    it.blocks.some((b, i) => i > 0 && !(b.type === "list" && it.blocks[i - 1].type === "p"))
  );

  const lines = items.map((it) => {
    const marker = ordered ? `${n++}${delim}` : bullet;
    const width = marker.length + 1;
    const blocks = it.blocks.slice();
    let head = blocks.length ? blocks.shift().text : "";
    // Without GFM there are no task lists, so the box is written as escaped
    // text: it still reads "[x]", and cannot turn into a link reference.
    if (it.task !== null) {
      const box = it.task ? "[x]" : "[ ]";
      head = (ctx.gfm ? box : box.replace(/[\[\]]/g, "\\$&")) + (head ? " " + head : "");
    }
    let text = head ? marker + " " + indent(head, width).slice(width) : marker;
    for (const b of blocks) text += (loose ? "\n\n" : "\n") + indent(b.text, width);
    return text;
  });

  return {
    type: "list", ordered, bullet, delim,
    text: lines.join(loose ? "\n\n" : "\n"),
  };
}

function details(c, ctx) {
  const kids = c.children || [];
  const summary = kids.find((k) => k.type === "element" && k.lname === "summary");
  const rest = kids.filter((k) => k !== summary);
  const body = renderBlocks(rest, ctx);
  if (!ctx.keepHtml) {
    ctx.stats.flattened++;
    const head = summary ? renderBlocks([summary], ctx) : [];
    return [...head, ...body];
  }
  // GitHub's pattern: the tags on their own lines, Markdown between them
  // behind blank lines, so the contents are still Markdown.
  ctx.stats.keptHtml++;
  const sum = summary
    ? rawOpen(summary) + ctx.src.slice(summary.innerStart, summary.innerEnd).replace(/\s*\n\s*/g, " ").trim() + "</summary>"
    : "";
  const out = [{ type: "html", text: rawOpen(c) + (sum ? "\n" + sum : "") }];
  out.push(...body);
  out.push({ type: "html", text: "</details>" });
  return out;
}

// --------------------------------------------------------------------------
// Tables
// --------------------------------------------------------------------------

function tableRows(el) {
  const rows = [];
  let headRows = 0;
  const walk = (node, inHead) => {
    for (const c of node.children || []) {
      if (c.type !== "element") continue;
      if (c.lname === "tr") {
        rows.push(c);
        if (inHead) headRows++;
      } else if (c.lname === "thead") walk(c, true);
      else if (c.lname === "tbody" || c.lname === "tfoot") walk(c, false);
    }
  };
  walk(el, false);
  return { rows, headRows };
}

const cellsOf = (tr) =>
  (tr.children || []).filter((c) => c.type === "element" && (c.lname === "td" || c.lname === "th"));

function alignOf(cell) {
  const a = (readAttr(cell.openRaw, "align") || "").toLowerCase();
  const m = /text-align\s*:\s*(left|right|center)/i.exec(readAttr(cell.openRaw, "style") || "");
  return (m && m[1].toLowerCase()) || (["left", "right", "center"].includes(a) ? a : "");
}

function table(el, ctx) {
  const { rows, headRows } = tableRows(el);
  const caption = (el.children || []).find((c) => c.type === "element" && c.lname === "caption");
  const before = caption ? renderBlocks(caption.children, ctx) : [];
  if (!rows.length) return before;

  const spans = rows.some((r) => cellsOf(r).some((c) =>
    (parseInt(readAttr(c.openRaw, "colspan"), 10) || 1) > 1 ||
    (parseInt(readAttr(c.openRaw, "rowspan"), 10) || 1) > 1));

  // Render every cell, and note whether any holds something a one-line GFM
  // cell cannot: a list, a code block, a nested table.
  const cellCtx = { ...ctx, table: true };
  let complex = spans || headRows > 1;
  const grid = rows.map((r) => cellsOf(r).map((cell) => {
    const blocks = renderBlocks(cell.children, cellCtx);
    if (blocks.some((b) => b.type !== "p")) complex = true;
    return {
      text: blocks.map((b) => b.text.replace(/\n+/g, " ")).join("<br>"),
      span: parseInt(readAttr(cell.openRaw, "colspan"), 10) || 1,
      th: cell.lname === "th",
      align: alignOf(cell),
    };
  }));

  if ((complex || !ctx.gfm) && ctx.keepHtml) {
    ctx.stats.keptHtml++;
    ctx.stats.htmlTables++;
    const raw = ctx.src.slice(el.srcStart, el.srcEnd).replace(/\n[ \t]*(?=\n)/g, "");
    return [...before, { type: "html", text: raw.trim() }];
  }
  if (!ctx.gfm) {
    // No tables in plain CommonMark and HTML is off: one paragraph per row.
    ctx.stats.flattened++;
    return [...before, ...grid.map((r) => ({ type: "p", text: r.map((c) => c.text).join(" — ") }))]
      .filter((b) => b.text);
  }
  if (complex) ctx.stats.flattenedTables++;

  // Expand colspans into empty cells so every row has the same width.
  const matrix = grid.map((r) => r.flatMap((c) => [c, ...Array(c.span - 1).fill({ text: "", align: "" })]));
  const width = Math.max(...matrix.map((r) => r.length));
  if (!width) return before;
  for (const r of matrix) while (r.length < width) r.push({ text: "", align: "" });

  const hasHeader = headRows > 0 || grid[0].every((c) => c.th);
  if (!hasHeader) ctx.stats.promotedHeaders++;
  ctx.stats.tables++;

  const header = matrix[0];
  const body = matrix.slice(1);
  const colW = header.map((_, i) => Math.max(3, ...matrix.map((r) => r[i].text.length)));
  const line = (r) => "| " + r.map((c, i) => c.text.padEnd(colW[i])).join(" | ") + " |";
  const sep = "| " + header.map((c, i) => {
    const w = colW[i];
    if (c.align === "center") return ":" + "-".repeat(w - 2) + ":";
    if (c.align === "right") return "-".repeat(w - 1) + ":";
    if (c.align === "left") return ":" + "-".repeat(w - 1);
    return "-".repeat(w);
  }).join(" | ") + " |";

  return [...before, { type: "table", text: [line(header), sep, ...body.map(line)].join("\n") }];
}

// --------------------------------------------------------------------------
// Entry point
// --------------------------------------------------------------------------

/**
 * Convert HTML to Markdown.
 *
 * opts:
 *   gfm      - GitHub extras: tables, ~~strikethrough~~, task lists (default true)
 *   keepHtml - keep what Markdown cannot express as HTML (default true);
 *              when false it is reduced to its text
 *   bullet   - "-" | "*" | "+" (default "-")
 *   mainOnly - when the page has a <main>, or exactly one <article>, convert
 *              only that and leave the navigation and footer out (default true)
 */
export function htmlToMarkdown(html, opts = {}) {
  try {
    return convert(html, opts);
  } catch (e) {
    // Every stage walks the tree recursively, the parser's own measuring pass
    // included, and a browser's stack is smaller than node's.
    if (e instanceof RangeError) {
      throw new Error("This HTML is nested too deeply to convert — thousands of elements inside one another, which no real page has. Is part of it malformed?");
    }
    throw e;
  }
}

function convert(html, opts) {
  const { gfm = true, keepHtml = true, bullet = "-", mainOnly = true } = opts;
  const { src, doc, warnings } = parseHtml(html);
  const stats = {
    headings: 0, links: 0, images: 0, lists: 0, tables: 0, codeBlocks: 0,
    tasks: 0, comments: 0, scripts: 0, styles: 0, keptHtml: 0, flattened: 0,
    htmlTables: 0, flattenedTables: 0, promotedHeaders: 0, htmlEmphasis: 0,
    droppedEmbeds: 0, unsafe: 0, decorative: 0,
  };
  const ctx = {
    src, gfm, keepHtml, bullet: ["-", "*", "+"].includes(bullet) ? bullet : "-",
    stats, table: false, open: { e: false, s: false, d: false },
  };

  // A whole saved page is mostly navigation. <main> is where its content is
  // by definition; a lone <article> is the next best signal. Several articles
  // (a blog index) are all content, so nothing is cut then.
  let root = doc.children;
  let scope = null;
  if (mainOnly) {
    const found = { main: null, articles: [] };
    const find = (node) => {
      for (const c of node.children || []) {
        if (c.type !== "element" || isHidden(c)) continue;
        if (c.lname === "main" && !found.main) found.main = c;
        else if (c.lname === "article") { found.articles.push(c); continue; }
        find(c);
      }
    };
    find(doc);
    const pick = found.main || (found.articles.length === 1 ? found.articles[0] : null);
    if (pick) { root = [pick]; scope = pick.lname; }
  }

  const markdown = joinBlocks(renderBlocks(root, ctx));

  const notes = [...warnings];
  const plural = (k, one, many) => (k === 1 ? one : many);
  if (scope) {
    notes.push(`Only the <${scope}> element was converted, so the page's navigation, header and footer are left out. Untick "Main content only" to convert everything.`);
  }
  if (stats.scripts || stats.styles) {
    const parts = [];
    if (stats.scripts) parts.push(`${stats.scripts} <script> ${plural(stats.scripts, "block", "blocks")}`);
    if (stats.styles) parts.push(`${stats.styles} <style> ${plural(stats.styles, "block", "blocks")}`);
    const total = stats.scripts + stats.styles;
    notes.push(`${parts.join(" and ")} ${plural(total, "was", "were")} removed along with ${plural(total, "its", "their")} contents — code is not text, and Markdown has nowhere to put it.`);
  }
  if (stats.decorative) {
    notes.push(`${stats.decorative} decorative ${plural(stats.decorative, "icon", "icons")} (marked aria-hidden) ${plural(stats.decorative, "was", "were")} left out.`);
  }
  if (stats.promotedHeaders) {
    notes.push(`${stats.promotedHeaders === 1 ? "A table had" : `${stats.promotedHeaders} tables had`} no header row, so the first row became the header. A Markdown table cannot be written without one.`);
  }
  if (stats.htmlTables) {
    notes.push(gfm
      ? `${stats.htmlTables === 1 ? "A table was" : `${stats.htmlTables} tables were`} kept as HTML because ${plural(stats.htmlTables, "it has", "they have")} merged cells, more than one header row, or a list or code block inside a cell — none of which a Markdown table can hold.`
      : `${stats.htmlTables === 1 ? "A table was" : `${stats.htmlTables} tables were`} kept as HTML, because plain CommonMark has no tables. Tick "GitHub extras" to write ${plural(stats.htmlTables, "it", "them")} as a Markdown table.`);
  }
  if (stats.flattenedTables) {
    notes.push(`${stats.flattenedTables === 1 ? "A table has" : `${stats.flattenedTables} tables have`} merged cells or block content that a Markdown table cannot hold, and HTML is switched off, so ${plural(stats.flattenedTables, "it was", "they were")} flattened: merged cells became empty cells and line breaks became spaces.`);
  }
  if (stats.flattened) {
    notes.push(`${stats.flattened} ${plural(stats.flattened, "element", "elements")} with no Markdown equivalent (such as <sup>, <u> or <details>) ${plural(stats.flattened, "was", "were")} reduced to plain text, because "Keep what Markdown can't express as HTML" is off.`);
  }
  if (stats.droppedEmbeds) {
    notes.push(`${stats.droppedEmbeds} embedded ${plural(stats.droppedEmbeds, "element", "elements")} (iframe, video, audio, SVG) ${plural(stats.droppedEmbeds, "was", "were")} removed, because HTML is switched off and Markdown has no way to write ${plural(stats.droppedEmbeds, "it", "them")}.`);
  }
  if (stats.htmlEmphasis) {
    notes.push(`${stats.htmlEmphasis} bold or italic ${plural(stats.htmlEmphasis, "span was", "spans were")} written as <strong>/<em> rather than ** or *, because the Markdown form would not parse there — for example bold text ending in punctuation that runs straight into a word, where CommonMark reads the asterisks literally.`);
  }
  if (stats.unsafe) {
    notes.push(`${stats.unsafe} javascript: ${plural(stats.unsafe, "link was", "links were")} removed, keeping the text. A script URL is not a destination.`);
  }

  return { markdown, stats, notes };
}
