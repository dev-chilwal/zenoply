// Resolving an SVG's pixel size is the whole job of an SVG-to-raster converter,
// and it is where the obvious implementation goes visibly wrong. Loading the
// file into `new Image()` and reading `naturalWidth` fails on the three cases
// that actually turn up in exported files:
//
//   1. width/height are optional. An icon exported with only a viewBox has no
//      intrinsic size, so the browser falls back to the CSS default object size
//      of 300x150 and a 24x24 icon rasterises as a 150x150 blur.
//   2. width/height may carry absolute CSS units. Illustrator and Inkscape both
//      emit them, and "10cm" is 378px, not 10.
//   3. Without a viewBox the user coordinate system is pinned 1:1 to px, so
//      raising width and height grows the canvas around an unchanged drawing.
//      Any rescale has to synthesise a viewBox first.
//
// All of the reasoning below is plain string work on purpose: it runs in node,
// which is where it is checked, and it does not depend on DOMParser quirks.

// CSS absolute length units, in px at the reference 96dpi. Relative units
// (%, em, ex, rem, ch, vw, vh) resolve against a context an <img> does not
// have, so they are treated as "no absolute size" rather than guessed at.
const ABS_UNITS = {
  px: 1,
  pt: 96 / 72,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  q: 96 / 101.6,
};

// The CSS default object size, used for a replaced element with neither an
// intrinsic size nor an intrinsic ratio.
export const DEFAULT_OBJECT_SIZE = { width: 300, height: 150 };

export function parseLength(value) {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  const m = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)\s*([a-zA-Z%]*)$/.exec(s);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2].toLowerCase();
  if (!unit) return n;
  const factor = ABS_UNITS[unit];
  return factor == null ? null : n * factor;
}

// viewBox is whitespace- and/or comma-separated. A zero or negative width or
// height disables rendering of the element entirely, so it is not a size.
export function parseViewBox(value) {
  if (value == null) return null;
  const parts = String(value).trim().split(/[\s,]+/).filter(Boolean);
  if (parts.length !== 4) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => !Number.isFinite(n))) return null;
  const [minX, minY, width, height] = nums;
  if (!(width > 0) || !(height > 0)) return null;
  return { minX, minY, width, height };
}

// Walk tags from the start of the document so that an <svg> sitting inside a
// comment, an XML declaration or a doctype's internal subset cannot be mistaken
// for the root element. Attribute values may legally contain ">", so the scan
// tracks quote state instead of stopping at the first ">".
export function findRootSvgTag(text) {
  let i = 0;
  while (i < text.length) {
    const lt = text.indexOf("<", i);
    if (lt === -1) return null;
    if (text.startsWith("<!--", lt)) {
      const end = text.indexOf("-->", lt + 4);
      if (end === -1) return null;
      i = end + 3;
      continue;
    }
    if (text.startsWith("<?", lt)) {
      const end = text.indexOf("?>", lt + 2);
      if (end === -1) return null;
      i = end + 2;
      continue;
    }
    if (text.startsWith("<!", lt)) {
      let j = lt + 2;
      let depth = 0;
      for (; j < text.length; j++) {
        const c = text[j];
        if (c === "[") depth++;
        else if (c === "]") depth--;
        else if (c === ">" && depth <= 0) break;
      }
      if (j >= text.length) return null;
      i = j + 1;
      continue;
    }
    let j = lt + 1;
    let quote = "";
    for (; j < text.length; j++) {
      const c = text[j];
      if (quote) {
        if (c === quote) quote = "";
      } else if (c === '"' || c === "'") {
        quote = c;
      } else if (c === ">") {
        break;
      }
    }
    if (j >= text.length) return null;
    const tag = text.slice(lt, j + 1);
    const qname = /^<\s*([^\s/>]+)/.exec(tag)?.[1] || "";
    const local = qname.includes(":") ? qname.slice(qname.indexOf(":") + 1) : qname;
    if (local.toLowerCase() !== "svg") return null;
    return { tag, start: lt, end: j + 1, qname };
  }
  return null;
}

const ATTR_RE = /([^\s=/<>"']+)\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+)/g;

function unquote(raw) {
  if (raw.length >= 2 && (raw[0] === '"' || raw[0] === "'") && raw[raw.length - 1] === raw[0]) {
    return raw.slice(1, -1);
  }
  return raw;
}

// Keys are lower-cased so lookups do not have to guess at "viewBox" vs
// "viewbox"; values are left exactly as written, entities and all.
export function parseAttrs(tag) {
  const head = /^<\s*[^\s/>]+/.exec(tag)?.[0] ?? "";
  const body = tag.slice(head.length, tag.length - (/\/\s*>$/.test(tag) ? tag.length - tag.lastIndexOf("/") : 1));
  const attrs = {};
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(body))) attrs[m[1].toLowerCase()] = unquote(m[2]);
  return attrs;
}

// Rewrite the root tag by splicing the original string rather than re-emitting
// parsed attributes: a value like style='font-family:"Inter"' cannot be put
// back into double quotes without corrupting it.
function editRootTag(tag, { set = {}, drop = [] }) {
  const head = /^<\s*[^\s/>]+/.exec(tag)?.[0] ?? "<svg";
  const selfClosing = /\/\s*>$/.test(tag);
  const tailLen = selfClosing ? tag.length - tag.lastIndexOf("/") : 1;
  const body = tag.slice(head.length, tag.length - tailLen);
  const dropSet = new Set(drop.map((d) => d.toLowerCase()));
  let out = "";
  let last = 0;
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(body))) {
    if (dropSet.has(m[1].toLowerCase())) {
      // Swallow the whitespace that separated this attribute from the previous
      // one as well, so removing one from the middle of the tag does not leave
      // a double space behind.
      let cut = m.index;
      while (cut > last && /\s/.test(body[cut - 1])) cut--;
      out += body.slice(last, cut);
      last = m.index + m[0].length;
    }
  }
  out += body.slice(last);
  const added = Object.entries(set)
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
    .join("");
  return head + out.replace(/\s+$/, "") + added + (selfClosing ? " />" : ">");
}

const num = (n) => String(Number(n.toFixed(4)));

export const SIZE_SOURCE_LABEL = {
  attributes: "from the width and height attributes",
  "width-and-viewbox": "width attribute, height derived from the viewBox ratio",
  "height-and-viewbox": "height attribute, width derived from the viewBox ratio",
  viewbox: "from the viewBox — the file declares no width or height",
  default: "no width, height or viewBox in the file",
};

// Returns null when the document has no root <svg> element.
export function resolveSvgSize(text) {
  const root = findRootSvgTag(text);
  if (!root) return null;
  const attrs = parseAttrs(root.tag);
  const w = parseLength(attrs.width);
  const h = parseLength(attrs.height);
  const viewBox = parseViewBox(attrs.viewbox);
  const vbRatio = viewBox ? viewBox.width / viewBox.height : null;

  let width;
  let height;
  let source;
  if (w > 0 && h > 0) {
    width = w;
    height = h;
    source = "attributes";
  } else if (w > 0 && vbRatio) {
    width = w;
    height = w / vbRatio;
    source = "width-and-viewbox";
  } else if (h > 0 && vbRatio) {
    height = h;
    width = h * vbRatio;
    source = "height-and-viewbox";
  } else if (viewBox) {
    // A browser would render this at 150x150 (the default object size, fitted
    // to the ratio). The viewBox's own units are the size the file was drawn
    // at and the size its author means by "1x", so that is what is reported.
    width = viewBox.width;
    height = viewBox.height;
    source = "viewbox";
  } else {
    width = DEFAULT_OBJECT_SIZE.width;
    height = DEFAULT_OBJECT_SIZE.height;
    source = "default";
  }

  return {
    width,
    height,
    source,
    ratio: width / height,
    viewBox,
    hasXmlns: typeof attrs.xmlns === "string" && attrs.xmlns.trim() !== "",
    attrs,
    root,
  };
}

// Produce an SVG document that rasterises to exactly targetWidth x targetHeight
// in any browser: explicit pixel width and height, a viewBox to scale against,
// and the SVG namespace (without which the blob parses as generic XML and the
// <img> renders nothing — a common state for markup copied out of HTML).
export function normalizeSvg(text, targetWidth, targetHeight) {
  const info = resolveSvgSize(text);
  if (!info) return null;
  const set = {
    width: String(Math.max(1, Math.round(targetWidth))),
    height: String(Math.max(1, Math.round(targetHeight))),
  };
  const drop = ["width", "height"];
  if (!info.viewBox) {
    set.viewBox = `0 0 ${num(info.width)} ${num(info.height)}`;
    drop.push("viewBox");
  }
  if (!info.hasXmlns) {
    set.xmlns = "http://www.w3.org/2000/svg";
    drop.push("xmlns");
  }
  const tag = editRootTag(info.root.tag, { set, drop });
  return text.slice(0, info.root.start) + tag + text.slice(info.root.end);
}
