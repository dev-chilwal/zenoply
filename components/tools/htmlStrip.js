// Turning HTML into the text a browser would render. Kept out of the component
// so it can be exercised in node — the same reasoning as htmlFormat.js, whose
// tokenizer and element tables this file reuses rather than re-typing.
//
// The obvious implementation is `html.replace(/<[^>]*>/g, "")`, and it is wrong
// in five separate ways, each of which shows up on the first real page anyone
// pastes in:
//
//  1. **It empties the tags but keeps the programs.** `<script>` and `<style>`
//     hold character data, not markup, so a regex strips their tags and leaves
//     the minified JavaScript and the whole style sheet sitting in your "plain
//     text". This is the single most visible failure of every small stripper.
//  2. **Deleting a tag deletes the word boundary.** `<p>one</p><p>two</p>` is
//     rendered as two paragraphs and stripped to `onetwo`; a table row becomes
//     one long word. But the opposite is just as wrong: `<b>c</b>at` renders as
//     "cat", so a stripper that inserts a space at every tag breaks words in
//     half. The line has to be drawn where CSS draws it — between block boxes,
//     never between inline ones — which is the same table htmlFormat.js uses to
//     decide where a line break is free.
//  3. **`>` is legal inside an attribute value and inside a comment.**
//     `<a title="a > b">x</a>` stops `[^>]*` early and leaves `b">x` in the
//     output; `<!-- a > b -->` leaks its own text. A tokenizer that tracks
//     quoting gets both right, and parseHtml already is one.
//  4. **Character references are left encoded**, so the output is full of
//     `&amp;`, `&nbsp;` and `&#8217;` — and decoding them is not a find and
//     replace either (see htmlEntities.js).
//  5. **Order is load-bearing: strip first, then decode.** Decoding first turns
//     an escaped `&lt;script&gt;` — text a browser shows literally, and exactly
//     what a page about HTML is full of — into a tag, which the strip step then
//     eats. Every chunk is decoded on its own for the same reason: an `href` is
//     an attribute value, where `?a=1&copy=2` is not a copyright sign.

import { parseHtml, VOID, PRESERVE_WS, NOT_RENDERED } from "./htmlFormat.js";
import { decodeEntities } from "./htmlEntities.js";

// --------------------------------------------------------------------------
// How much vertical space a box leaves behind when its markup is removed.
//
// 0 = inline: the boundary is not a boundary at all, and nothing may be
//     inserted there or "cat" becomes "c at".
// 1 = a line break.
// 2 = a blank line — the paragraph-level boxes people actually read by.
// A table cell is its own case: a row of cells reads as a row, so they are
// separated by a tab, which is also what pastes into a spreadsheet correctly.
// --------------------------------------------------------------------------

const BREAK_2 = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "pre", "hr", "table",
  "figure", "article", "section", "header", "footer", "main", "aside", "nav",
  "form", "details", "dl", "ul", "ol", "address", "fieldset", "dialog",
  "hgroup", "listing", "plaintext", "search", "frameset",
]);

const BREAK_1 = new Set([
  "div", "li", "dt", "dd", "tr", "thead", "tbody", "tfoot", "caption",
  "colgroup", "col", "option", "optgroup", "legend", "figcaption", "summary",
  "center", "dir", "menu", "body", "html", "head", "frame", "selectedcontent",
  "fencedframe",
]);

const CELL = new Set(["td", "th"]);

// Rendered as nothing, so their character data is not text. `template` holds an
// inert document fragment and `noscript` a fallback the browser never shows;
// both are dropped whole rather than unwrapped.
const DROP_CONTENT = new Set([
  "script", "style", "head", "title", "meta", "link", "base", "template",
  "datalist", "noscript", "param", "source", "track", "rp", "xmp", "noembed",
  "noframes", "iframe", "frame", "frameset", "object", "embed", "applet",
  "canvas", "area", "col", "colgroup",
]);

// An inline `style` that turns whitespace back on — the one CSS effect that is
// visible from the markup alone. Same rule as htmlFormat.js.
const stylePreservesWs = (openTag) =>
  /\bstyle\s*=\s*(["'])[^"']*white-space\s*:\s*(pre|pre-wrap|break-spaces)/i.test(openTag);

const styleHides = (openTag) =>
  /\bstyle\s*=\s*(["'])[^"']*display\s*:\s*none/i.test(openTag) ||
  readAttr(openTag, "hidden") !== null;

// --------------------------------------------------------------------------
// Attributes
//
// A small reader rather than a regex over the whole tag, so a value containing
// `>` or the name of another attribute cannot be picked up by accident.
// --------------------------------------------------------------------------

export function readAttr(openRaw, want) {
  const s = openRaw;
  const n = s.length;
  // Skip `<` and the tag name.
  let i = 1;
  while (i < n && !/[\s/>]/.test(s[i])) i++;
  for (;;) {
    while (i < n && /\s/.test(s[i])) i++;
    if (i >= n || s[i] === ">" || (s[i] === "/" && s[i + 1] === ">")) return null;
    if (s[i] === "/") { i++; continue; }
    const nameStart = i;
    while (i < n && !/[\s/>=]/.test(s[i])) i++;
    const name = s.slice(nameStart, i).toLowerCase();
    while (i < n && /\s/.test(s[i])) i++;
    if (s[i] !== "=") {
      // A bare boolean attribute; its value is the empty string.
      if (name === want) return "";
      continue;
    }
    i++;
    while (i < n && /\s/.test(s[i])) i++;
    const q = s[i];
    let value;
    if (q === '"' || q === "'") {
      const close = s.indexOf(q, i + 1);
      if (close < 0) { value = s.slice(i + 1); i = n; }
      else { value = s.slice(i + 1, close); i = close + 1; }
    } else {
      const start = i;
      while (i < n && !/[\s>]/.test(s[i])) i++;
      value = s.slice(start, i);
    }
    if (name === want) return value;
  }
}

// --------------------------------------------------------------------------
// Whitespace
// --------------------------------------------------------------------------

// The characters CSS treats as collapsible whitespace, plus U+00A0. A no-break
// space is NOT collapsible in CSS — but it is what `&nbsp;` decodes to, and a
// run of them is how a page fakes indentation, so leaving them alone means the
// output of a stripped page is full of invisible non-spaces that break a later
// search. They are folded here and the count is reported rather than hidden.
const COLLAPSIBLE = /[ \t\n\r\f ]+/g;
const NBSP_RUN = / /g;

// --------------------------------------------------------------------------
// Extraction
// --------------------------------------------------------------------------

/**
 * Strip markup and return the rendered text.
 *
 * opts:
 *   collapse   - collapse whitespace the way CSS does (default true)
 *   decode     - decode character references (default true)
 *   altText    - emit an <img alt=""> in place of the image (default false)
 *   linkUrls   - append " (href)" after link text (default false)
 *   lineBreaks - "smart" (block structure) | "source" (keep the source's own
 *                newlines) | "none" (one single line)
 */
export function stripHtml(text, opts = {}) {
  const {
    collapse = true,
    decode = true,
    altText = false,
    linkUrls = false,
    lineBreaks = "smart",
  } = opts;

  const { src, doc, warnings } = parseHtml(text);
  const stats = {
    tags: 0, comments: 0, scripts: 0, styles: 0, dropped: 0,
    links: 0, images: 0, nbsp: 0,
  };
  const entityNotes = new Set();

  // Output is built as a list of chunks with a pending separator between them,
  // so a separator is decided by both sides of the boundary and never doubles
  // up. `pending` holds the strongest break seen since the last chunk.
  const out = [];
  let pending = 0;       // 0 none, 1 newline, 2 blank line
  let pendingCell = false;
  let pendingSpace = false;

  const verbatim = lineBreaks === "source";

  function sep() {
    if (!out.length || verbatim) return "";
    if (lineBreaks === "none") return pending || pendingCell || pendingSpace ? " " : "";
    if (pending >= 2) return "\n\n";
    if (pending === 1) return "\n";
    if (pendingCell) return "\t";
    return pendingSpace ? " " : "";
  }

  function emit(s) {
    if (!s) return;
    const j = sep();
    if (j) out.push(j);
    out.push(s);
    pending = 0;
    pendingCell = false;
    pendingSpace = false;
  }

  function breakAt(w) {
    if (w > pending) pending = w;
  }

  function decodeChunk(s, context) {
    if (!decode) return s;
    const { text: t, notes } = decodeEntities(s, { context });
    for (const note of notes) {
      // The per-chunk running commentary ("Decoded 3 character references") is
      // noise once a document has a thousand chunks; only the notes that say
      // something went unhandled are worth surfacing.
      if (!/^Decoded /.test(note)) entityNotes.add(note);
    }
    return t;
  }

  // Character data inside a normal (non-pre) box: decode, then collapse. The
  // two ends are turned into a pending space rather than emitted, so the
  // boundary decides — a space next to a block edge is not rendered.
  function emitText(rawSlice, preserve) {
    const decoded = decodeChunk(rawSlice, "text");
    const nbsp = decoded.match(NBSP_RUN);
    if (nbsp) stats.nbsp += nbsp.length;
    if (verbatim || preserve || !collapse) {
      emit(decoded);
      return;
    }
    const squeezed = decoded.replace(COLLAPSIBLE, " ");
    if (!squeezed) return;
    if (squeezed === " ") { pendingSpace = true; return; }
    const lead = squeezed.startsWith(" ");
    const tail = squeezed.endsWith(" ");
    const body = squeezed.slice(lead ? 1 : 0, tail ? squeezed.length - 1 : undefined);
    if (lead) pendingSpace = true;
    if (body) emit(body);
    if (tail) pendingSpace = true;
  }

  function walk(node, preserve) {
    for (const c of node.children || []) {
      if (c.type === "text") { emitText(c.raw, preserve); continue; }
      if (c.type === "comment") { stats.comments++; continue; }
      if (c.type === "doctype") continue;
      if (c.type === "opaque") {
        // A stray end tag or a bogus comment. Both are markup the browser
        // renders as nothing, and both are counted as a tag.
        stats.tags++;
        continue;
      }
      if (c.type !== "element") continue;

      stats.tags++;
      const name = c.lname;

      if (name === "script") stats.scripts++;
      else if (name === "style") stats.styles++;

      if (DROP_CONTENT.has(name) || NOT_RENDERED.has(name) || styleHides(c.openRaw)) {
        if (c.children && c.children.length) stats.dropped++;
        // A dropped box still ends the line it was on if it is block-level.
        if (BREAK_2.has(name)) breakAt(2);
        else if (BREAK_1.has(name)) breakAt(1);
        continue;
      }

      if (name === "br") { breakAt(1); continue; }
      if (name === "wbr") continue;

      if (name === "img") {
        stats.images++;
        if (altText) {
          const alt = readAttr(c.openRaw, "alt");
          if (alt) emit(decodeChunk(alt, "attribute").replace(COLLAPSIBLE, " ").trim());
        }
        continue;
      }

      const isLink = name === "a" && linkUrls;
      let href = null;
      if (isLink) {
        href = readAttr(c.openRaw, "href");
        if (href) href = decodeChunk(href, "attribute").trim();
      }

      const weight = BREAK_2.has(name) ? 2 : BREAK_1.has(name) ? 1 : 0;
      const cell = CELL.has(name);
      if (weight) breakAt(weight);
      else if (cell && out.length) pendingCell = true;

      const keepWs =
        lineBreaks !== "none" &&
        (preserve || PRESERVE_WS.has(name) || stylePreservesWs(c.openRaw));

      if (!VOID.has(name) && !c.selfClosed) {
        if (c.raw) {
          // textarea / title-shaped raw text: character data, not markup.
          const inner = src.slice(c.innerStart, c.innerEnd);
          if (inner) emitText(inner, keepWs);
        } else {
          walk(c, keepWs);
        }
      }

      if (isLink && href && !/^(#|javascript:)/i.test(href)) {
        stats.links++;
        pendingSpace = true;
        emit((verbatim ? " (" : "(") + href + ")");
      }

      if (weight) breakAt(weight);
      else if (cell) pendingCell = true;
    }
  }

  walk(doc, false);

  // Verbatim mode promises that every byte outside a tag survives, so it is
  // the one mode that is not trimmed.
  const result = verbatim ? out.join("") : out.join("").replace(/^\s+|\s+$/g, "");

  const notes = [...warnings, ...entityNotes];
  if (stats.scripts) {
    notes.push(
      `${stats.scripts} <script> ${stats.scripts === 1 ? "block was" : "blocks were"} removed along with ${stats.scripts === 1 ? "its" : "their"} code. A script's contents are character data, not markup, so a plain tag-stripping regex deletes the tags and leaves the JavaScript behind as "text".`
    );
  }
  if (stats.styles) {
    notes.push(
      `${stats.styles} <style> ${stats.styles === 1 ? "block was" : "blocks were"} removed along with ${stats.styles === 1 ? "its" : "their"} CSS, for the same reason.`
    );
  }
  if (stats.nbsp && collapse) {
    notes.push(
      stats.nbsp === 1
        ? "One no-break space (&nbsp;) became an ordinary space. The two look identical on screen but are different characters, which is why a search over pasted web text can fail to match."
        : `${stats.nbsp} no-break spaces (&nbsp;) became ordinary spaces. They look identical on screen but are a different character, which is why a search over pasted web text can fail to match.`
    );
  }
  if (stats.images && !altText) {
    notes.push(
      `${stats.images} ${stats.images === 1 ? "image was" : "images were"} removed. Tick "Keep image alt text" to put the alt text in ${stats.images === 1 ? "its" : "their"} place.`
    );
  }

  return { text: result, stats, notes };
}
