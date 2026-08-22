// Crop a PDF's pages, kept out of the component so the geometry can be run and
// verified in node (same reasoning as rupeesWords.js, pdfMeta.js and pdfResize.js).
//
// Cropping is done *in place* by rewriting the page boxes. Nothing is re-drawn,
// nothing is rasterised and no content is moved, so text stays selectable and
// links, form fields, comments and bookmarks all survive untouched — their
// coordinates are absolute page-space, and the page origin does not move.
//
// Three things make this less trivial than "set a smaller rectangle":
//
//   1. The crop the user draws is in *display* space — what a reader shows after
//      applying /Rotate, with the origin at the top-left and y pointing down.
//      Page space is unrotated with the origin at the bottom-left. The two are
//      related by a quarter turn that also swaps which edge is which: on a page
//      carrying /Rotate 90, trimming the displayed top trims the stored *left*.
//   2. A PDF rectangle is "any two diagonally opposite corners", so a perfectly
//      legal MediaBox may be written upper-left first. pdf-lib's asRectangle()
//      subtracts blindly and hands back a negative width, which would make every
//      later comparison here silently wrong — so every box is normalised first.
//      (pdf.js normalises internally, which is why a file like that renders fine
//      while the maths around it does not.)
//   3. The MediaBox origin is not always (0, 0), and the CropBox may already be
//      smaller than it. The crop is therefore taken against the box a reader
//      actually shows — CropBox clipped to MediaBox — not against the raw size.
//
// The crop is carried as *fractions* of the displayed page rather than absolute
// points. That is what the drag box on the preview naturally produces, it keeps
// "the top edge" meaning the top edge on a page whose /Rotate differs from its
// neighbours, and it cannot produce a degenerate box on a document whose pages
// are not all the same size — an absolute 20 mm trim applied to a small page can
// ask for more than the page has, and would have to be silently clamped into
// some other crop than the one the user drew.
// Extension included so this module runs directly under node as well as through
// webpack — the verification script imports it straight from disk.
import { normRotation, visibleBox } from "./pdfResize.js";

export { normRotation };

// Smallest surviving fraction of the page on either axis. Stops a drag or a
// stray number from cropping a page down to nothing.
export const MIN_FRACTION = 0.02;

export const NO_MARGINS = { left: 0, top: 0, right: 0, bottom: 0 };

export const hasCrop = (m) => m.left > 0 || m.top > 0 || m.right > 0 || m.bottom > 0;

/**
 * pdf-lib rectangle -> the same rectangle with width and height positive.
 * See note 2 above: asRectangle() does not do this for us.
 */
export function normRect(r) {
  if (!r) return null;
  return {
    x: r.width < 0 ? r.x + r.width : r.x,
    y: r.height < 0 ? r.y + r.height : r.y,
    width: Math.abs(r.width),
    height: Math.abs(r.height),
  };
}

/** The region a reader shows, as { left, bottom, right, top } in page space. */
export function pageBox(media, crop) {
  return visibleBox(normRect(media), normRect(crop));
}

/** Size of a page box as the reader displays it, after /Rotate. */
export function displaySize(box, rotation) {
  const w = box.right - box.left;
  const h = box.top - box.bottom;
  const turned = normRotation(rotation) % 180 === 90;
  return { w: turned ? h : w, h: turned ? w : h };
}

/**
 * A point in display space (origin top-left, y down, after /Rotate) -> the same
 * point in page space (origin bottom-left, y up, before /Rotate).
 *
 * Derived by rotating the page image and reading off where each corner lands;
 * every case is checked against a real pdf.js viewport in the test script.
 */
export function displayToPage(box, rotation, dx, dy) {
  switch (normRotation(rotation)) {
    case 90:
      return { x: box.left + dy, y: box.bottom + dx };
    case 180:
      return { x: box.right - dx, y: box.bottom + dy };
    case 270:
      return { x: box.right - dy, y: box.top - dx };
    default:
      return { x: box.left + dx, y: box.top - dy };
  }
}

/** Clamp margins so at least MIN_FRACTION of each axis survives. */
export function clampMargins(m) {
  const axis = (a, b) => {
    const lo = Math.min(Math.max(Number(a) || 0, 0), 1 - MIN_FRACTION);
    const hi = Math.min(Math.max(Number(b) || 0, 0), 1 - MIN_FRACTION - lo);
    return [lo, hi];
  };
  const [left, right] = axis(m.left, m.right);
  const [top, bottom] = axis(m.top, m.bottom);
  return { left, top, right, bottom };
}

/**
 * Margins (fractions of the displayed page) -> the page-space rectangle to
 * write as the new box. Pure geometry, no pdf-lib objects.
 */
export function cropRect(box, rotation, margins) {
  const m = clampMargins(margins);
  const disp = displaySize(box, rotation);
  const a = displayToPage(box, rotation, m.left * disp.w, m.top * disp.h);
  const b = displayToPage(box, rotation, (1 - m.right) * disp.w, (1 - m.bottom) * disp.h);
  return {
    left: Math.min(a.x, b.x),
    bottom: Math.min(a.y, b.y),
    right: Math.max(a.x, b.x),
    top: Math.max(a.y, b.y),
  };
}

/** Displayed size, in points, that a page ends up with under these margins. */
export function croppedDisplaySize(box, rotation, margins) {
  const m = clampMargins(margins);
  const disp = displaySize(box, rotation);
  return { w: disp.w * (1 - m.left - m.right), h: disp.h * (1 - m.top - m.bottom) };
}

const intersect = (a, r) => ({
  left: Math.max(a.left, r.left),
  bottom: Math.max(a.bottom, r.bottom),
  right: Math.min(a.right, r.right),
  top: Math.min(a.top, r.top),
});

/**
 * Crop one already-loaded pdf-lib page in place. Returns the rectangle written.
 *
 * Both the CropBox and the MediaBox are set. CropBox alone is what the spec
 * calls a crop, but plenty of software — print pipelines especially — lays the
 * page out from the MediaBox and would ignore it, so the trim would appear to
 * have silently failed. Setting both keeps every reader agreeing on the page.
 *
 * /Rotate is deliberately left alone: the rectangle is already computed in
 * unrotated page space, so the page keeps turning the same way it did.
 */
export function cropPage(page, margins) {
  const box = pageBox(page.getMediaBox(), page.getCropBox());
  const rect = cropRect(box, page.getRotation().angle, margins);
  const w = rect.right - rect.left;
  const h = rect.top - rect.bottom;

  page.setMediaBox(rect.left, rect.bottom, w, h);
  page.setCropBox(rect.left, rect.bottom, w, h);

  // Bleed/Trim/Art must sit inside the MediaBox. Any that exist are clipped into
  // the new page rather than dropped, so a print workflow keeps whatever of its
  // marks still fits; one that no longer intersects collapses to the page.
  const squareUp = (has, get, set) => {
    if (!has) return;
    const cur = normRect(get());
    const clipped = intersect(rect, {
      left: cur.x,
      bottom: cur.y,
      right: cur.x + cur.width,
      top: cur.y + cur.height,
    });
    const cw = clipped.right - clipped.left;
    const ch = clipped.top - clipped.bottom;
    if (cw > 0 && ch > 0) set(clipped.left, clipped.bottom, cw, ch);
    else set(rect.left, rect.bottom, w, h);
  };
  squareUp(page.node.BleedBox(), () => page.getBleedBox(), (...a) => page.setBleedBox(...a));
  squareUp(page.node.TrimBox(), () => page.getTrimBox(), (...a) => page.setTrimBox(...a));
  squareUp(page.node.ArtBox(), () => page.getArtBox(), (...a) => page.setArtBox(...a));

  return rect;
}

/**
 * Find the content on a rendered page and report the empty border around it as
 * margins, in the same display-space fractions the rest of this module uses.
 *
 * `data` is RGBA from a canvas the page was drawn on over white. A pixel counts
 * as ink when its darkest channel is below `threshold`.
 *
 * Ink alone is not enough to anchor the crop, because a single speck of scanner
 * dust in the corner would then hold the whole margin open. A pixel only counts
 * once its own 3x3 neighbourhood holds `minNeighbours` inked pixels, which drops
 * isolated specks and isolated pairs while keeping anything connected — a 1px
 * hairline rule survives, since every pixel on it has two neighbours above and
 * below. That connectedness test is why this is not simply a per-row and
 * per-column count: a count applied to each axis on its own would find no row
 * with enough ink to qualify on a page whose only content *is* a vertical
 * hairline, and would report that page blank.
 *
 * Returns null for a page with nothing on it — a blank page must not drag the
 * crop out to the full sheet, so callers skip it rather than treat it as
 * "content everywhere".
 */
export function contentMargins(data, w, h, { threshold = 240, minNeighbours = 3, padFraction = 0.005 } = {}) {
  if (!w || !h || !data || data.length < w * h * 4) return null;

  const ink = new Uint8Array(w * h);
  for (let p = 0, i = 0; p < w * h; p++, i += 4) {
    if (data[i + 3] < 8) continue; // nothing was drawn here
    if (Math.min(data[i], data[i + 1], data[i + 2]) < threshold) ink[p] = 1;
  }

  let x0 = w;
  let x1 = -1;
  let y0 = h;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!ink[y * w + x]) continue;
      // A pixel already inside the box found so far cannot widen it, and the
      // neighbourhood test is the expensive part — so skip it. On a dense page
      // this is most of the pixels.
      if (x >= x0 && x <= x1 && y >= y0 && y <= y1) continue;
      const yLo = y > 0 ? y - 1 : 0;
      const yHi = y < h - 1 ? y + 1 : h - 1;
      const xLo = x > 0 ? x - 1 : 0;
      const xHi = x < w - 1 ? x + 1 : w - 1;
      let neighbours = 0;
      for (let yy = yLo; yy <= yHi; yy++) {
        const row = yy * w;
        for (let xx = xLo; xx <= xHi; xx++) neighbours += ink[row + xx];
      }
      if (neighbours < minNeighbours) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return null;

  const pad = Math.max(0, padFraction);
  return clampMargins({
    left: Math.max(0, x0 / w - pad),
    right: Math.max(0, (w - 1 - x1) / w - pad),
    top: Math.max(0, y0 / h - pad),
    bottom: Math.max(0, (h - 1 - y1) / h - pad),
  });
}

/**
 * The smallest crop that keeps every page's content — the per-edge minimum of a
 * list of margins. Blank pages come in as null and are skipped.
 */
export function unionMargins(list) {
  const found = list.filter(Boolean);
  if (!found.length) return null;
  return clampMargins({
    left: Math.min(...found.map((m) => m.left)),
    top: Math.min(...found.map((m) => m.top)),
    right: Math.min(...found.map((m) => m.right)),
    bottom: Math.min(...found.map((m) => m.bottom)),
  });
}
