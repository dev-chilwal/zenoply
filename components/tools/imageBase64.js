// Image <-> Base64 helpers.
//
// No React and no browser global beyond btoa/atob/TextDecoder (all present in
// node since 16), so the encoding rules can be exercised directly in node,
// which is where they are tested.

// String.fromCharCode is applied one slice at a time. Spreading a whole file
// into the argument list overflows the call stack somewhere above ~100k
// arguments, which is the bug in nearly every "image to base64" snippet going
// and which only surfaces once somebody drops a photo rather than an icon.
const CHUNK = 0x8000;

export function bytesToBase64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin);
}

export function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// Characters a Base64 payload of n bytes occupies: every 3 bytes become 4
// characters, rounded up, padding included. This is the 33% everyone quotes.
export const base64Chars = (n) => 4 * Math.ceil(n / 3);

// ---- format sniffing ----------------------------------------------------

const ascii = (b, i, s) => {
  for (let k = 0; k < s.length; k++) if (b[i + k] !== s.charCodeAt(k)) return false;
  return true;
};

const SIGNATURES = [
  { label: "PNG", mime: "image/png", ext: "png",
    test: (b) => b[0] === 0x89 && ascii(b, 1, "PNG") && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a },
  { label: "JPEG", mime: "image/jpeg", ext: "jpg",
    test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { label: "GIF", mime: "image/gif", ext: "gif",
    test: (b) => ascii(b, 0, "GIF8") },
  { label: "WebP", mime: "image/webp", ext: "webp",
    test: (b) => ascii(b, 0, "RIFF") && ascii(b, 8, "WEBP") },
  { label: "BMP", mime: "image/bmp", ext: "bmp",
    test: (b) => ascii(b, 0, "BM") },
  { label: "TIFF", mime: "image/tiff", ext: "tif",
    test: (b) => (ascii(b, 0, "II") && b[2] === 0x2a && b[3] === 0x00) || (ascii(b, 0, "MM") && b[2] === 0x00 && b[3] === 0x2a) },
  { label: "ICO", mime: "image/x-icon", ext: "ico",
    test: (b) => b[0] === 0x00 && b[1] === 0x00 && b[2] === 0x01 && b[3] === 0x00 },
  // AVIF and HEIC are both ISO base media files; the brand at offset 8 is the
  // only thing separating them, and it is why a HEIC renamed .avif still fails.
  { label: "AVIF", mime: "image/avif", ext: "avif",
    test: (b) => ascii(b, 4, "ftyp") && (ascii(b, 8, "avif") || ascii(b, 8, "avis")) },
  { label: "HEIC", mime: "image/heic", ext: "heic",
    test: (b) => ascii(b, 4, "ftyp") && (ascii(b, 8, "heic") || ascii(b, 8, "heix") || ascii(b, 8, "hevc") || ascii(b, 8, "mif1")) },
];

export function looksLikeSvg(bytes) {
  const head = new TextDecoder("utf-8").decode(bytes.subarray(0, 2048));
  return /<svg[\s>]/i.test(head);
}

// Identify an image by its first bytes rather than by a filename or a declared
// MIME type, either of which can be wrong. Returns null for anything that is
// not a recognised image.
export function sniffImage(bytes) {
  if (!bytes || bytes.length < 4) return null;
  for (const s of SIGNATURES) if (s.test(bytes)) return s;
  if (looksLikeSvg(bytes)) return { label: "SVG", mime: "image/svg+xml", ext: "svg" };
  return null;
}

// ---- decoding -----------------------------------------------------------

// Accepts Base64 as it is actually found in the wild: wrapped at 76 columns by
// a MIME encoder, wearing the URL-safe alphabet, stripped of its padding by a
// JSON tool, or still sitting inside the CSS rule or <img> tag it was copied
// from. Every one of those makes a bare atob() throw.
export function cleanBase64(raw) {
  const src = String(raw);
  const kept = src.replace(/[^A-Za-z0-9+/=_-]/g, "");
  const notes = [];
  if (/\s/.test(src.trim())) notes.push("line breaks");
  if (src.replace(/\s+/g, "").length !== kept.length) notes.push("surrounding markup");
  if (/[-_]/.test(kept)) notes.push("URL-safe characters");

  const translated = kept.replace(/-/g, "+").replace(/_/g, "/");
  const body = translated.replace(/=+$/, "");
  const existing = translated.length - body.length;
  const rem = body.length % 4;
  // 4n+1 characters cannot be produced by any Base64 encoder: 1 byte makes 2
  // characters, 2 bytes make 3, 3 bytes make 4. A remainder of 1 means the
  // string is truncated, so say that instead of handing back half an image.
  if (rem === 1) throw new Error("That Base64 string is truncated - its length cannot come from any whole number of bytes.");
  const needed = rem === 0 ? 0 : 4 - rem;
  // Only a real discrepancy is worth reporting: the padding is stripped and
  // rebuilt either way, so comparing counts is what separates "this string was
  // missing its =" from "this string was fine all along".
  if (needed !== existing) notes.push("missing padding");
  return { b64: body + "=".repeat(needed), notes };
}

// Pull an image out of whatever was pasted: a bare Base64 blob, a data URI, or
// either of those still wrapped in url("...") or src="...".
export function decodeImageInput(raw) {
  const text = String(raw || "").trim();
  if (!text) return null;

  const notes = [];
  let declaredMime = "";
  let payload = text;
  let isBase64 = true;

  const at = text.indexOf("data:");
  if (at >= 0) {
    const comma = text.indexOf(",", at);
    if (comma < 0) throw new Error("That data URI has no comma, so there is no image data after the header.");
    const head = text.slice(at + 5, comma).split(";");
    declaredMime = (head[0] || "").trim().toLowerCase();
    isBase64 = head.some((p) => p.trim().toLowerCase() === "base64");
    payload = text.slice(comma + 1);
    if (at > 0) notes.push("surrounding markup");
  }

  let bytes;
  if (isBase64) {
    // Cut at the closing quote or bracket before anything else. Stripping
    // non-alphabet characters is not enough on its own: in <img src="..."
    // alt="logo"> the trailing alt="logo" is made entirely of Base64
    // characters, so it would be swallowed into the payload and decode to
    // seven bytes of garbage appended to the image.
    const cleaned = cleanBase64(payload.replace(/^["'\s]+/, "").split(/["'<>)]/)[0]);
    for (const n of cleaned.notes) if (!notes.includes(n)) notes.push(n);
    try {
      bytes = base64ToBytes(cleaned.b64);
    } catch {
      throw new Error("That is not valid Base64 - the characters do not decode.");
    }
  } else {
    // A header with no ";base64" means the payload is percent-encoded text,
    // which is how SVG data URIs are normally written. Here the closing quote
    // or bracket has to be found, because unlike Base64 the payload can
    // legitimately contain almost anything.
    // Find the end by matching the wrapper it arrived in, never by guessing.
    // An apostrophe is a legal, unescaped character in a percent-encoded SVG
    // URI - it is what the optimiser swaps attribute quotes to - so cutting at
    // the first quote-like character truncates every minified icon.
    let end = payload.length;
    const before = at > 0 ? text[at - 1] : "";
    if (before === '"' || before === "'") {
      const q = payload.indexOf(before);
      if (q >= 0) end = q;
    } else if (before === "(") {
      const q = payload.indexOf(")");
      if (q >= 0) end = q;
    } else {
      const m = /\s/.exec(payload);
      if (m) end = m.index;
    }
    let decoded;
    try {
      decoded = decodeURIComponent(payload.slice(0, end));
    } catch {
      throw new Error("That percent-encoded data URI contains a broken % escape.");
    }
    bytes = new TextEncoder().encode(decoded);
    notes.push("percent-encoded rather than Base64");
  }

  if (!bytes.length) throw new Error("That decoded to an empty file.");
  return { bytes, declaredMime, notes };
}

// ---- SVG: the case where Base64 is the wrong encoding -------------------

// SVG is the one image format that is text, and Base64 inflates text by a
// third while destroying how well it compresses. A percent-encoded data URI
// only pays for the characters it has to escape, stays readable in the
// stylesheet, and gzips like the markup it still is.

// Trims what is pure overhead inside a data URI, and reports every change so
// the tool can say what it did rather than quietly rewriting someone's file.
// Both transforms are gated on the file having no text content: whitespace
// between tags is insignificant in SVG, but whitespace and quotes inside a
// <text> node are not.
export function svgOptimize(text) {
  const changes = [];
  let s = String(text).replace(/^\uFEFF/, "");

  const bare = s.replace(/<\?xml[^>]*\?>\s*/i, "").replace(/<!DOCTYPE[^>]*>\s*/i, "");
  if (bare !== s) { s = bare; changes.push("dropped the XML prolog"); }

  const noComments = s.replace(/<!--[\s\S]*?-->/g, "");
  if (noComments !== s) { s = noComments; changes.push("dropped comments"); }

  const hasText = /<text[\s>]|<tspan[\s>]|xml:space/i.test(s);
  if (!hasText) {
    const tight = s.replace(/>\s+</g, "><").replace(/\s{2,}/g, " ").trim();
    if (tight !== s) { s = tight; changes.push("collapsed whitespace between tags"); }

    // Single-quoted attributes need no escaping at all inside a
    // double-quoted url("..."), which saves two characters on every quote in
    // the file. Only sound when no apostrophe is already present.
    if (!s.includes("'")) {
      const swapped = s.replace(/"/g, "'");
      if (swapped !== s) { s = swapped; changes.push("switched attributes to single quotes"); }
    }
  }
  return { svg: s, changes, minified: s !== String(text) };
}

// Escapes the union of what a URI forbids and what would terminate a CSS
// url(...) token or an HTML attribute. The apostrophe is deliberately left
// alone - it is what the optimiser swapped the quotes to - so the result must
// always be wrapped in double quotes, which is what wrapDataUri() does.
const FORCE = { "(": "%28", ")": "%29" };

export function svgPercentEncode(text) {
  return String(text).replace(/[^\x21-\x7E]|["#%<>()[\\\]^`{|}]/gu, (c) => FORCE[c] || encodeURIComponent(c));
}

export function svgPercentDataUri(text) {
  return "data:image/svg+xml," + svgPercentEncode(text);
}

// ---- output wrappers ----------------------------------------------------

export const WRAPPERS = [
  { value: "uri", label: "Data URI" },
  { value: "raw", label: "Base64 only" },
  { value: "css", label: "CSS" },
  { value: "html", label: "HTML" },
  { value: "md", label: "Markdown" },
];

const attr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function wrapDataUri(kind, uri, { base64 = "", alt = "", width = 0, height = 0 } = {}) {
  switch (kind) {
    case "raw":
      return base64;
    case "css":
      return "background-image: url(\"" + uri + "\");";
    case "html": {
      const size = width && height ? ' width="' + width + '" height="' + height + '"' : "";
      return '<img src="' + uri + '" alt="' + attr(alt) + '"' + size + ">";
    }
    case "md":
      return "![" + alt.replace(/([\[\]])/g, "\\$1") + "](" + uri + ")";
    default:
      return uri;
  }
}
