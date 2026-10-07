// Favicon set: the pure half — geometry, the ICO container, the manifest and
// the <head> snippet. Nothing here touches the DOM, so it can be checked in node.

// What a site actually needs in 2026. The .ico carries 16, 32 and 48 because
// that is what Windows and the browser tab strip ask for; the PNGs cover
// browsers that prefer a <link rel="icon">, iOS home screens and the Android /
// PWA install prompt.
export const ICO_SIZES = [16, 32, 48];

export const PNG_OUTPUTS = [
  { name: "favicon-16x16.png", size: 16 },
  { name: "favicon-32x32.png", size: 32 },
  // iOS paints a transparent apple-touch-icon onto black, so this one is
  // always flattened onto the background colour.
  { name: "apple-touch-icon.png", size: 180, opaque: true },
  { name: "android-chrome-192x192.png", size: 192 },
  { name: "android-chrome-512x512.png", size: 512 },
];

// Where the source lands on a size×size square.
//   crop: fill the square, trimming the long side equally from both ends.
//   fit:  show the whole image, centred, leaving bands on the short side.
// `padding` is the fraction of the square kept empty on each edge (0–0.25).
export function fitRect(srcW, srcH, size, mode = "crop", padding = 0) {
  const inner = size * (1 - 2 * padding);
  const off = (size - inner) / 2;
  if (mode === "crop") {
    const side = Math.min(srcW, srcH);
    return {
      sx: (srcW - side) / 2, sy: (srcH - side) / 2, sw: side, sh: side,
      dx: off, dy: off, dw: inner, dh: inner,
    };
  }
  const scale = inner / Math.max(srcW, srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  return {
    sx: 0, sy: 0, sw: srcW, sh: srcH,
    dx: off + (inner - dw) / 2, dy: off + (inner - dh) / 2, dw, dh,
  };
}

// ICO with PNG-compressed entries: a 6-byte ICONDIR, one 16-byte entry per
// image, then the PNG files back to back. Every browser and every Windows since
// Vista reads PNG entries, and they are a fraction of the size of the old
// uncompressed bitmaps. A width or height of 256 is written as 0 by the spec.
// images: [{ size, png: Uint8Array }], largest-last or any order.
export function buildIco(images) {
  const headerLen = 6 + 16 * images.length;
  const total = headerLen + images.reduce((s, im) => s + im.png.length, 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type 1 = icon (2 would be a cursor)
  view.setUint16(4, images.length, true);
  let offset = headerLen;
  images.forEach((im, i) => {
    const e = 6 + 16 * i;
    out[e] = im.size >= 256 ? 0 : im.size;
    out[e + 1] = im.size >= 256 ? 0 : im.size;
    out[e + 2] = 0; // palette colours: 0 = no palette
    out[e + 3] = 0; // reserved
    view.setUint16(e + 4, 1, true); // colour planes
    view.setUint16(e + 6, 32, true); // bits per pixel
    view.setUint32(e + 8, im.png.length, true);
    view.setUint32(e + 12, offset, true);
    out.set(im.png, offset);
    offset += im.png.length;
  });
  return out;
}

// Inverse of buildIco's header, for checking a written file.
export function readIcoDirectory(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < 6 || view.getUint16(0, true) !== 0 || view.getUint16(2, true) !== 1) return null;
  const count = view.getUint16(4, true);
  const entries = [];
  for (let i = 0; i < count; i++) {
    const e = 6 + 16 * i;
    entries.push({
      width: bytes[e] || 256,
      height: bytes[e + 1] || 256,
      bitCount: view.getUint16(e + 6, true),
      length: view.getUint32(e + 8, true),
      offset: view.getUint32(e + 12, true),
    });
  }
  return entries;
}

const HEX = /^#[0-9a-f]{6}$/i;

export function buildManifest({ name = "", color = "#ffffff" } = {}) {
  const clean = name.trim();
  const c = HEX.test(color) ? color.toLowerCase() : "#ffffff";
  const manifest = {
    name: clean,
    short_name: clean.length > 12 ? clean.slice(0, 12).trim() : clean,
    icons: [
      { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    theme_color: c,
    background_color: c,
    display: "standalone",
  };
  return JSON.stringify(manifest, null, 2) + "\n";
}

export function buildHeadSnippet() {
  return [
    '<link rel="icon" href="/favicon.ico" sizes="16x16 32x32 48x48">',
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
    '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
  ].join("\n");
}
