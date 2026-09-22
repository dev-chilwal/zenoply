// Markdown -> HTML.
//
// The Markdown parsing itself is marked's (MIT, CommonMark + GFM) and is lazily
// imported, so it costs nothing on any other page. Everything in this file is
// about what happens around the parse: heading anchors, what to do with the raw
// HTML a Markdown document is allowed to contain, the URL schemes that survive,
// and the shape of the document that comes out. Keeping it here rather than in
// the component means all of it runs in node, which is where it is tested.

import { formatHtml } from "./htmlFormat.js";
import { C1_REPLACEMENTS } from "./htmlEntities.js";

let markedPromise;
export const loadMarked = () => (markedPromise ||= import("marked"));

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ESCAPES[c]);

// A URL is judged after character references are resolved, because
// "java&#115;cript:alert(1)" is a live javascript: URL to a browser and a
// harmless string to a naive regex.
const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", Tab: "\t", NewLine: "\n", colon: ":" };
function decodeRefs(s) {
  return String(s).replace(/&(?:#[xX]([0-9a-fA-F]+)|#(\d+)|([a-zA-Z][a-zA-Z0-9]*));?/g, (m, hex, dec, name) => {
    if (hex != null) return String.fromCodePoint(parseInt(hex, 16) || 0);
    if (dec != null) return String.fromCodePoint(Number(dec) || 0);
    return Object.prototype.hasOwnProperty.call(NAMED, name) ? NAMED[name] : m;
  });
}

// Control characters and whitespace are dropped before the scheme is read, for
// the same reason: a browser ignores a tab or a newline sitting inside
// "java<tab>script:". Built from character codes rather than an escape range so
// the source stays plain ASCII.
export function isUnsafeUrl(url) {
  let flat = "";
  for (const ch of decodeRefs(url)) {
    const code = ch.codePointAt(0);
    if (code > 32 && code !== 127) flat += ch;
  }
  flat = flat.toLowerCase();
  if (/^(javascript|vbscript|livescript|mocha):/.test(flat)) return true;
  if (/^data:text\/html/.test(flat)) return true;
  return false;
}

// GitHub's heading-anchor rule, so an anchor generated here is the one GitHub
// would generate for the same README: lower-case, drop everything that is not a
// letter, a number, a combining mark, a space, a hyphen or an underscore, then
// turn each remaining *space* into a hyphen. Runs of spaces are deliberately
// NOT collapsed and the text is NOT trimmed, because GitHub does neither - two
// spaces give two hyphens. A repeat gets -1, -2 ... The one divergence is a
// heading with no slug-able characters at all, where GitHub produces an empty
// id and this produces "section", since id="" is no use to anyone.
export function slugify(text, seen) {
  let base = String(text)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M} _-]/gu, "")
    .replace(/ /g, "-");
  if (!base) base = "section";
  if (!seen) return base;
  const n = seen.get(base) || 0;
  seen.set(base, n + 1);
  return n === 0 ? base : base + "-" + n;
}

const stripTags = (html) => decodeRefs(String(html).replace(/<[^>]*>/g, ""));

// A table cell carries a boolean `header` field, so every branch is checked for
// being an array rather than merely truthy.
function walk(tokens, visit, parent) {
  if (!Array.isArray(tokens)) return;
  for (const token of tokens) {
    if (!token || typeof token !== "object") continue;
    visit(token, parent);
    walk(token.tokens, visit, token);
    walk(token.items, visit, token);
    walk(token.header, visit, token);
    if (Array.isArray(token.rows)) for (const row of token.rows) walk(row, visit, token);
  }
}

// One pass over the token tree collects everything the UI reports: the counts,
// the raw HTML, the unsafe URLs, and the soft line breaks. That last one is the
// question people actually arrive with - "why did my line breaks disappear?" -
// so it is counted whether or not the option is currently switched on.
function analyze(tokens) {
  const stats = { headings: 0, links: 0, images: 0, code: 0, tables: 0, listItems: 0 };
  let softBreaks = 0;
  let htmlBlocks = 0;
  let htmlInline = 0;
  const risky = new Set();
  const unsafeUrls = new Set();

  walk(tokens, (t, parent) => {
    // A tight list item holds its lines in a `text` token rather than a
    // paragraph, so it is counted here and its identical inner `text` child is
    // not - hence the parent check rather than a bare type check.
    if (t.type === "text" && parent && parent.type === "list_item" && t.text) {
      const nl = t.text.match(/\n/g);
      if (nl) softBreaks += nl.length;
    }
    switch (t.type) {
      case "heading": stats.headings++; break;
      case "code": stats.code++; break;
      case "table": stats.tables++; break;
      case "list_item": stats.listItems++; break;
      case "paragraph": {
        const nl = t.text ? t.text.match(/\n/g) : null;
        if (nl) softBreaks += nl.length;
        break;
      }
      case "link":
      case "image": {
        if (t.type === "link") stats.links++;
        else stats.images++;
        const url = t.href || "";
        if (isUnsafeUrl(url)) unsafeUrls.add(url.slice(0, 60));
        break;
      }
      case "html": {
        if (t.block) htmlBlocks++;
        else htmlInline++;
        const raw = t.raw || "";
        const tag = raw.match(/<\s*(script|iframe|object|embed|form|base|meta|link)\b/i);
        if (tag) risky.add(tag[1].toLowerCase());
        if (/\son[a-z]+\s*=/i.test(raw)) risky.add("an event handler");
        const attr = raw.match(/(?:href|src|action)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
        if (attr && isUnsafeUrl(attr[1] ?? attr[2] ?? attr[3] ?? "")) risky.add("a script URL");
        break;
      }
      default: break;
    }
  });

  return { stats, softBreaks, htmlBlocks, htmlInline, risky: [...risky], unsafeUrls: [...unsafeUrls] };
}

// marked decodes a numeric character reference with String.fromCharCode, so
// &#151; becomes U+0097 - the C1 control the reference literally names, which a
// browser renders as nothing at all. Every browser, and HTML5 itself, maps that
// 0x80-0x9F range to the Windows-1252 character instead, which is why &#151; is
// an em dash on every page that uses it. Text pasted out of Word is full of
// them, so the reference is repaired here rather than silently swallowed. Only
// decoded inline text can hold a raw C1 character: a code block keeps the
// reference escaped and a raw HTML block passes it to the browser intact, which
// applies the same table.
function repairC1(html) {
  let count = 0;
  const fixed = html.replace(/[\u0080-\u009f]/g, (ch) => {
    const cp = ch.codePointAt(0);
    if (!Object.prototype.hasOwnProperty.call(C1_REPLACEMENTS, cp)) return ch;
    count++;
    return String.fromCodePoint(C1_REPLACEMENTS[cp]);
  });
  return { html: fixed, count };
}

const BASE_CSS = `:root { color-scheme: light dark }
body { max-width: 46rem; margin: 2rem auto; padding: 0 1rem; font: 16px/1.65 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif }
h1, h2, h3, h4, h5, h6 { line-height: 1.25; margin: 1.6em 0 .6em }
h1 { font-size: 2em } h2 { font-size: 1.5em } h3 { font-size: 1.2em }
p, ul, ol, blockquote, table, pre { margin: 0 0 1em }
code { font: .9em/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; background: rgba(127,127,127,.15); padding: .15em .35em; border-radius: 3px }
pre { background: rgba(127,127,127,.12); padding: 1em; overflow: auto; border-radius: 6px }
pre code { background: none; padding: 0 }
blockquote { border-left: 3px solid rgba(127,127,127,.4); margin-left: 0; padding-left: 1em; opacity: .85 }
table { border-collapse: collapse; width: 100% }
th, td { border: 1px solid rgba(127,127,127,.35); padding: .45em .6em; text-align: left }
img { max-width: 100% }
hr { border: 0; border-top: 1px solid rgba(127,127,127,.35) }`;

export function wrapDocument(body, { title = "Document", css = true } = {}) {
  const style = css
    ? "  <style>\n" + BASE_CSS.split("\n").map((l) => "    " + l).join("\n") + "\n  </style>\n"
    : "";
  return (
    "<!doctype html>\n" +
    '<html lang="en">\n' +
    "<head>\n" +
    '  <meta charset="utf-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    "  <title>" + escapeHtml(title) + "</title>\n" +
    style +
    "</head>\n" +
    "<body>\n" +
    body +
    "\n</body>\n" +
    "</html>\n"
  );
}

/**
 * Convert Markdown to HTML.
 *
 * opts:
 *   gfm        - tables, strikethrough, task lists and autolinks (default true)
 *   breaks     - a single newline becomes <br> (default false, which is CommonMark)
 *   headingIds - give every heading a GitHub-style id (default true)
 *   rawHtml    - "keep" | "escape" | "remove"; what to do with HTML written
 *                inside the Markdown (default "keep")
 *   pretty     - indent the result with the site's own HTML beautifier, which
 *                only ever moves whitespace a browser does not render
 *   fullDocument / documentTitle / includeCss - wrap the result in a page
 *
 * Returns { html, body, warnings, stats, softBreaks, title }.
 */
export async function markdownToHtml(src, opts = {}) {
  const {
    gfm = true,
    breaks = false,
    headingIds = true,
    rawHtml = "keep",
    pretty = true,
    fullDocument = false,
    documentTitle = "",
    includeCss = true,
  } = opts;

  const { Marked, Lexer } = await loadMarked();
  const flags = { gfm, breaks, pedantic: false };

  const info = analyze(new Lexer(flags).lex(src));

  // "escape" and "remove" both mean the Markdown is not the user's own, so link
  // and image URLs are neutralised in those modes too - a javascript: link
  // written in plain Markdown syntax never passes through the raw-HTML branch.
  const untrusted = rawHtml !== "keep";
  const seen = new Map();
  let firstHeading = "";
  let neutralised = 0;

  const renderer = {
    html(token) {
      if (rawHtml === "remove") return "";
      if (rawHtml === "escape") return escapeHtml(token.text);
      return token.text;
    },
    heading(token) {
      const text = this.parser.parseInline(token.tokens);
      if (!firstHeading) firstHeading = text.replace(/<[^>]*>/g, "").trim();
      if (!headingIds) return "<h" + token.depth + ">" + text + "</h" + token.depth + ">\n";
      const id = slugify(stripTags(text), seen);
      return '<h' + token.depth + ' id="' + escapeHtml(id) + '">' + text + "</h" + token.depth + ">\n";
    },
    link(token) {
      const text = this.parser.parseInline(token.tokens);
      let href = token.href || "";
      if (untrusted && isUnsafeUrl(href)) {
        href = "#";
        neutralised++;
      }
      const title = token.title ? ' title="' + escapeHtml(token.title) + '"' : "";
      return '<a href="' + escapeHtml(href) + '"' + title + ">" + text + "</a>";
    },
    image(token) {
      let href = token.href || "";
      if (untrusted && isUnsafeUrl(href)) {
        href = "";
        neutralised++;
      }
      const title = token.title ? ' title="' + escapeHtml(token.title) + '"' : "";
      return '<img src="' + escapeHtml(href) + '" alt="' + escapeHtml(token.text || "") + '"' + title + ">";
    },
  };

  const repaired = repairC1(new Marked(flags, { renderer }).parse(src).trimEnd());
  let body = repaired.html;

  const warnings = [];
  if (repaired.count > 0) {
    warnings.push(
      (repaired.count === 1
        ? "One numeric character reference in the 128-159 range was"
        : repaired.count + " numeric character references in the 128-159 range were") +
        " decoded the way a browser decodes them - &#151; is an em dash, not the control code it literally names. Text pasted out of Word is the usual source."
    );
  }

  // marked emits a table's rows on their own lines but runs a raw HTML block
  // straight into the paragraph after it, so the result is neither one line nor
  // indented. formatHtml fixes that without touching a single rendered byte: it
  // breaks lines only at block boundaries, where the whitespace-processing model
  // drops them, so nothing inside a paragraph shifts by a space.
  if (pretty) {
    try {
      body = formatHtml(body, { indent: "  " }).text;
    } catch {
      warnings.push("The HTML could not be indented, so it is shown exactly as generated.");
    }
  }
  if (info.softBreaks > 0 && !breaks) {
    warnings.push(
      info.softBreaks === 1
        ? "One line break sits inside a paragraph. Markdown joins those lines into one, which is why it vanishes here. Switch on 'Keep single line breaks' to get a <br> instead."
        : info.softBreaks +
          " line breaks sit inside paragraphs. Markdown joins those lines into one, which is why they vanish here. Switch on 'Keep single line breaks' to get a <br> for each."
    );
  }
  const rawTotal = info.htmlBlocks + info.htmlInline;
  if (rawTotal > 0) {
    const n = rawTotal + " piece" + (rawTotal === 1 ? "" : "s") + " of raw HTML";
    if (rawHtml === "keep") {
      warnings.push(n + " in the Markdown " + (rawTotal === 1 ? "was" : "were") + " copied through untouched, which is what a Markdown renderer does.");
    } else if (rawHtml === "remove") {
      warnings.push(n + " " + (rawTotal === 1 ? "was" : "were") + " removed.");
    } else {
      warnings.push(n + " " + (rawTotal === 1 ? "is" : "are") + " shown as text rather than rendered.");
    }
  }
  if (info.risky.length && rawHtml === "keep") {
    warnings.push(
      "That raw HTML contains " +
        info.risky.join(", ") +
        ". If the Markdown did not come from you, set raw HTML to 'Remove it' before publishing this."
    );
  }
  if (info.unsafeUrls.length) {
    warnings.push(
      untrusted
        ? neutralised + " link or image URL" + (neutralised === 1 ? " used" : "s used") + " a javascript: style scheme and " + (neutralised === 1 ? "was" : "were") + " disabled."
        : "A link or image points at " + info.unsafeUrls[0] + " - a script URL, not a page. It is left exactly as written; escaping or removing raw HTML disables it too."
    );
  }

  const title = documentTitle.trim() || firstHeading || "Document";
  const html = fullDocument ? wrapDocument(body, { title, css: includeCss }) : body;

  return { html, body, warnings, stats: info.stats, softBreaks: info.softBreaks, title };
}
