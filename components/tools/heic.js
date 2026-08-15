"use client";

// Loader for heic-to, the libheif build that decodes HEIC/HEIF in the browser.
//
// The import is deliberately hidden from webpack (`webpackIgnore`) and points at
// a file we copy into public/ ourselves (scripts/copy-heic-assets.mjs). Two
// reasons, in order of importance:
//
// 1. Licence. heic-to wraps libheif and is LGPL-3.0; the rest of the site is
//    not. Keeping it a standalone script the page loads at runtime — rather
//    than letting webpack inline it into a chunk of our own code — is what
//    keeps this a shared-library-style use, and it means the library can be
//    replaced by dropping a different build at the same path.
// 2. Size. The bundle is 3 MB because upstream base64-inlines the wasm into the
//    JS. There is no separate .wasm file to fetch. Nothing here is loaded until
//    someone actually converts a file, so the tool page itself stays small and
//    webpack never has to parse three megabytes of base64.
//
// The module creates its own Worker from a Blob the first time it decodes, so
// decoding runs off the main thread; only the final canvas encode does not.
let libPromise = null;

export function loadHeic() {
  libPromise ||= import(/* webpackIgnore: true */ "/heic/heic-to.js");
  return libPromise;
}

// Brands that heic-to's own isHeic() recognises, and the ones it does not.
// It only accepts mif1/msf1/heic/heix/hevc/hevx, but plenty of real files —
// Android and camera HEIFs especially — carry heim/heis/hevm/hevs/msf1/miaf,
// and every one of them decodes fine. So this is used only to give a useful
// message when a file looks like something else entirely; the conversion is
// always attempted regardless, and libheif gets the final say.
const HEIF_BRANDS = new Set([
  "mif1", "msf1", "miaf", "heic", "heix", "hevc", "hevx", "heim", "heis", "hevm", "hevs", "mif2",
]);

// Reads the ftyp brand from the first 12 bytes. Returns "" when the file is too
// short or is not an ISO base-media container at all.
export async function heifBrand(file) {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  if (head.length < 12) return "";
  const ascii = (from, to) => String.fromCharCode(...head.subarray(from, to));
  if (ascii(4, 8) !== "ftyp") return "";
  return ascii(8, 12).replace(/\0/g, " ").trim();
}

export async function looksLikeHeif(file) {
  if (/\.(heic|heif|hif)$/i.test(file.name)) return true;
  if (/^image\/(heic|heif)/i.test(file.type)) return true;
  return HEIF_BRANDS.has(await heifBrand(file));
}

// Convert one HEIC/HEIF file to a Blob of `type` ("image/jpeg" | "image/png" |
// "image/webp"). Quality is ignored for PNG.
export async function convertHeic(file, type, quality) {
  const { heicTo } = await loadHeic();
  return heicTo({ blob: file, type, quality: type === "image/png" ? undefined : quality });
}
