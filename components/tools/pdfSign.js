// Stamp a signature image onto PDF pages, kept out of the component so the
// geometry can be run and verified in node (same reasoning as pdfCrop.js).
// Named pdfSign.js, not signPdf.js: a helper whose name differs from its
// component only by case silently prerenders a 404 stub on a case-insensitive
// file system.
//
// What this produces is a *visual* signature: a picture of a signature drawn
// into the page content, exactly like a pasted image. It is not a
// certificate-based digital signature — there is no key, no hash of the
// document and no tamper evidence — and the copy on the page says so.
//
// The placement the user drags around is held in *display* space, as fractions
// of the page a reader shows (after /Rotate, origin top-left, y down). It is
// turned into page space only at stamping time, through the same
// displayToPage() the crop tool uses, so a page carrying /Rotate 90 gets the
// signature upright where the user put it rather than sideways in a corner.
// Extensions included so this module runs directly under node as well as
// through webpack.
import { degrees } from "pdf-lib";
import { pageBox, displaySize, displayToPage, normRotation } from "./pdfCrop.js";

// Narrowest a placed signature may get, as a fraction of the page width.
export const MIN_WIDTH = 0.04;

/** Height of a placement as a fraction of the page height, from its aspect. */
export function placementHeight(w, aspect, disp) {
  return (w * disp.w) / aspect / disp.h;
}

/**
 * Keep a placement on the page: shrink it if it is taller or wider than the
 * page, then slide it inside. `aspect` is the signature's width / height.
 */
export function clampPlacement(p, aspect, disp) {
  let w = Math.min(Math.max(p.w, MIN_WIDTH), 1);
  let h = placementHeight(w, aspect, disp);
  if (h > 1) {
    w = (aspect * disp.h) / disp.w;
    h = 1;
  }
  const x = Math.min(Math.max(0, p.x), 1 - w);
  const y = Math.min(Math.max(0, p.y), 1 - h);
  return { ...p, x, y, w };
}

/**
 * Where a placement lands in page space, as pdf-lib drawImage() options.
 *
 * pdf-lib draws the image's unit square scaled to width x height, rotated
 * counter-clockwise by `rotate` about its own bottom-left corner. /Rotate R
 * turns the whole page R degrees clockwise for display, so drawing the image
 * turned R counter-clockwise cancels it and the signature reads upright. The
 * anchor is the image's own bottom-left — which, upright on screen, is the
 * bottom-left corner of the box the user placed.
 */
export function placementRect(box, rotation, place, aspect) {
  const r = normRotation(rotation);
  const disp = displaySize(box, r);
  const width = place.w * disp.w;
  const height = width / aspect;
  const anchor = displayToPage(box, r, place.x * disp.w, place.y * disp.h + height);
  return { x: anchor.x, y: anchor.y, width, height, rotate: r };
}

/**
 * Draw the signature onto every placement. `doc` is a loaded pdf-lib document,
 * `png` the signature as PNG bytes with its pixel size, `placements` a list of
 * { page (1-based), x, y, w }. Returns how many stamps were drawn.
 */
export async function stampSignatures(doc, png, placements) {
  const image = await doc.embedPng(png.bytes);
  const aspect = png.width / png.height;
  const pages = doc.getPages();
  let drawn = 0;
  for (const p of placements) {
    const page = pages[p.page - 1];
    if (!page) continue;
    const box = pageBox(page.getMediaBox(), page.getCropBox());
    const rotation = page.getRotation().angle;
    const rect = placementRect(box, rotation, clampPlacement(p, aspect, displaySize(box, rotation)), aspect);
    page.drawImage(image, {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      rotate: degrees(rect.rotate),
    });
    drawn++;
  }
  return drawn;
}

/**
 * Bounding box of everything visible on a canvas, so a signature is cropped to
 * its ink before it is placed — otherwise the empty pad around a small scrawl
 * becomes part of the box the user is trying to line up with a signature line.
 * Returns null for an empty canvas.
 */
export function inkBounds(data, w, h, minAlpha = 16) {
  let x0 = w;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w * 4;
    for (let x = 0; x < w; x++) {
      if (data[row + x * 4 + 3] < minAlpha) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Turn the paper behind a photographed or scanned signature transparent, in
 * place. Pixels at or above `threshold` (Rec. 601 luma) become fully
 * transparent; darker ones keep their colour and fade in over a short ramp, so
 * the anti-aliased edge of a pen stroke does not turn into a hard white fringe
 * when it lands on a page that is not pure white.
 */
export function clearPaper(data, threshold = 200, ramp = 40) {
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum >= threshold) {
      data[i + 3] = 0;
    } else {
      const k = Math.min(1, (threshold - lum) / ramp);
      data[i + 3] = Math.round(data[i + 3] * k);
    }
  }
  return data;
}

/**
 * Does this PDF already carry a certificate-based digital signature? Every
 * signature dictionary holds a /ByteRange array, written uncompressed because
 * the signer has to patch its byte offsets in after the fact. Saving the file
 * again rewrites those offsets, so any such signature stops validating — worth
 * saying before the user stamps a document someone else has already signed.
 */
export function hasDigitalSignature(bytes) {
  const n = bytes.length;
  // "/ByteRange" scanned as raw bytes — decoding a large PDF to a string first
  // would double its memory for a ten-byte search.
  const needle = [47, 66, 121, 116, 101, 82, 97, 110, 103, 101];
  outer: for (let i = 0; i + needle.length <= n; i++) {
    if (bytes[i] !== 47) continue;
    for (let j = 1; j < needle.length; j++) if (bytes[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}
