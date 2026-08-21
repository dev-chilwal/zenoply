// Change the page size of a PDF (A4 <-> Letter, scale up/down), kept out of the
// component so the geometry can be run and verified in node (same reasoning as
// rupeesWords.js and pdfMeta.js).
//
// The approach is deliberately *in place* rather than the obvious
// `embedPage` + `drawPage` into a fresh document. Re-drawing every page as a
// form XObject flattens the file: links, form fields, comments and outlines are
// all left behind. Resizing in place keeps them, at the cost of having to do
// three things pdf-lib will not do for you:
//
//   1. `page.setSize()` only follows the CropBox when it already equals the
//      MediaBox, so a cropped page keeps its old, now-wrong crop. Both boxes
//      are written explicitly here.
//   2. The MediaBox origin is not always (0, 0). Content coordinates are
//      relative to that origin, so it has to be subtracted out or the page
//      lands offset by the origin.
//   3. `page.scaleAnnotations()` scales annotation rectangles about the origin
//      but cannot translate them, so centring the content would leave every
//      link behind where it used to be. `transformAnnots` below applies the
//      full affine transform instead.
//
// /Rotate is left untouched and handled by swapping the *stored* page box:
// a page displayed as landscape A4 because it carries /Rotate 90 is stored as a
// portrait box, so the target size is swapped back before it is written. Fitting
// is then done entirely in unrotated space, which is valid because rotation is
// rigid and cannot change how much of the box the content fills.
import { PDFDict, PDFName, PDFArray, PDFNumber } from "pdf-lib";

export const PT_PER_MM = 72 / 25.4;
export const PT_PER_IN = 72;

// Point sizes are pdf-lib's own PageSizes values so a page written here is
// byte-identical in size to one pdf-lib would create. Every entry is stored
// portrait (w <= h); orientation is applied afterwards.
export const PAGE_SIZES = [
  { key: "a4", label: "A4 — 210 x 297 mm", w: 595.28, h: 841.89 },
  { key: "letter", label: "US Letter — 8.5 x 11 in", w: 612, h: 792 },
  { key: "legal", label: "US Legal — 8.5 x 14 in", w: 612, h: 1008 },
  { key: "a3", label: "A3 — 297 x 420 mm", w: 841.89, h: 1190.55 },
  { key: "a5", label: "A5 — 148 x 210 mm", w: 419.53, h: 595.28 },
  { key: "a6", label: "A6 — 105 x 148 mm", w: 297.64, h: 419.53 },
  { key: "b5", label: "B5 — 176 x 250 mm", w: 498.9, h: 708.66 },
  { key: "executive", label: "Executive — 7.25 x 10.5 in", w: 521.86, h: 756 },
  { key: "tabloid", label: "Tabloid — 11 x 17 in", w: 792, h: 1224 },
];

export const getPageSize = (key) => PAGE_SIZES.find((s) => s.key === key);

/** Points -> a short human string in mm and inches, for the UI readout. */
export const describeSize = (w, h) =>
  `${Math.round(w / PT_PER_MM)} x ${Math.round(h / PT_PER_MM)} mm ` +
  `(${(w / PT_PER_IN).toFixed(2)} x ${(h / PT_PER_IN).toFixed(2)} in)`;

/** The name of a standard size matching these points, or "" — tolerance 1pt. */
export function matchSizeName(w, h) {
  const lo = Math.min(w, h);
  const hi = Math.max(w, h);
  const hit = PAGE_SIZES.find((s) => Math.abs(s.w - lo) < 1 && Math.abs(s.h - hi) < 1);
  if (!hit) return "";
  const base = hit.label.split(" —")[0];
  return hi - lo < 1 ? base : `${base} ${w > h ? "landscape" : "portrait"}`;
}

// A rotation as PDF stores it: clockwise degrees, any multiple of 90, possibly
// negative or > 360. Anything else (a malformed file) normalises to 0.
export const normRotation = (angle) => {
  const n = Math.round(Number(angle) || 0);
  if (n % 90 !== 0) return 0;
  return ((n % 360) + 360) % 360;
};

/**
 * The part of a page a reader actually shows: the CropBox clipped to the
 * MediaBox. Falls back to the MediaBox if the two do not overlap sensibly,
 * which is what readers do with a malformed CropBox.
 * Boxes come in as pdf-lib rectangles: { x, y, width, height }.
 */
export function visibleBox(media, crop) {
  const mediaBox = {
    left: media.x,
    bottom: media.y,
    right: media.x + media.width,
    top: media.y + media.height,
  };
  if (!crop) return mediaBox;
  const box = {
    left: Math.max(crop.x, mediaBox.left),
    bottom: Math.max(crop.y, mediaBox.bottom),
    right: Math.min(crop.x + crop.width, mediaBox.right),
    top: Math.min(crop.y + crop.height, mediaBox.top),
  };
  return box.right - box.left > 1 && box.top - box.bottom > 1 ? box : mediaBox;
}

/**
 * Work out the new page box and the transform to apply to one page's content.
 * Pure geometry — no pdf-lib objects — so it is directly testable.
 *
 * opts:
 *   target      { w, h } in points, stored portrait (w <= h)
 *   orientation "auto" | "portrait" | "landscape"
 *   mode        "fit" | "actual" | "percent"
 *   percent     scale factor for mode "percent", e.g. 50
 *   marginPt    uniform margin in points, kept clear on all four sides
 *   enlarge     mode "fit" only: allow scaling a small page up to fill the box
 *
 * Returns the new (unrotated) media box, the content transform, the size a
 * reader will display, and whether content spills outside the page.
 */
export function planPage({ media, crop, rotation, target, orientation = "auto", mode = "fit", percent = 100, marginPt = 0, enlarge = true }) {
  const box = visibleBox(media, crop);
  const w = box.right - box.left;
  const h = box.top - box.bottom;
  const rot = normRotation(rotation);
  const quarterTurned = rot === 90 || rot === 270;

  // What the reader sees today, and therefore which way round this page is.
  const srcDispW = quarterTurned ? h : w;
  const srcDispH = quarterTurned ? w : h;

  const lo = Math.min(target.w, target.h);
  const hi = Math.max(target.w, target.h);
  const landscape =
    orientation === "landscape" || (orientation === "auto" && srcDispW > srcDispH);
  const dispW = landscape ? hi : lo;
  const dispH = landscape ? lo : hi;

  // The box actually written to the file is pre-rotation, so undo the quarter
  // turn the reader will apply.
  const mediaW = quarterTurned ? dispH : dispW;
  const mediaH = quarterTurned ? dispW : dispH;

  // Margins are uniform, so they only ever constrain the scale — they never
  // move the centre of the page.
  const margin = Math.max(0, Math.min(marginPt, (Math.min(mediaW, mediaH) - 2) / 2));
  const availW = Math.max(1, mediaW - 2 * margin);
  const availH = Math.max(1, mediaH - 2 * margin);

  let scale;
  if (mode === "actual") scale = 1;
  else if (mode === "percent") scale = Math.max(0.01, (Number(percent) || 100) / 100);
  else {
    scale = Math.min(availW / w, availH / h);
    if (!enlarge) scale = Math.min(scale, 1);
  }

  // Centre the scaled content in the page box, then undo the source box origin
  // so a MediaBox that does not start at (0, 0) still lands centred.
  const tx = (mediaW - scale * w) / 2 - scale * box.left;
  const ty = (mediaH - scale * h) / 2 - scale * box.bottom;

  const EPS = 0.01;
  return {
    mediaW,
    mediaH,
    dispW,
    dispH,
    scale,
    tx,
    ty,
    rotation: rot,
    srcDispW,
    srcDispH,
    overflows: scale * w > availW + EPS || scale * h > availH + EPS,
    clipped: scale * w > mediaW + EPS || scale * h > mediaH + EPS,
  };
}

// Annotation coordinate arrays that hold (x, y) pairs in page space. RD is
// deliberately absent: it holds four inset *differences*, not points, so it
// scales but must not be translated.
const POINT_ARRAYS = ["Rect", "QuadPoints", "Vertices", "L", "CL"];

function affinePairs(arr, scale, tx, ty) {
  if (!(arr instanceof PDFArray)) return;
  for (let i = 0; i < arr.size(); i++) {
    const n = arr.lookup(i, PDFNumber);
    if (!n) continue;
    const v = n.asNumber();
    arr.set(i, PDFNumber.of(i % 2 === 0 ? scale * v + tx : scale * v + ty));
  }
}

function scaleOnly(arr, scale) {
  if (!(arr instanceof PDFArray)) return;
  for (let i = 0; i < arr.size(); i++) {
    const n = arr.lookup(i, PDFNumber);
    if (n) arr.set(i, PDFNumber.of(scale * n.asNumber()));
  }
}

/**
 * Move every annotation on a page by the same transform the content got.
 * pdf-lib's scaleAnnotations() only scales, which would leave links stranded
 * once the content is centred in a differently sized page.
 */
export function transformAnnots(page, scale, tx, ty) {
  const annots = page.node.Annots();
  if (!annots) return 0;
  let moved = 0;
  for (let i = 0; i < annots.size(); i++) {
    const annot = annots.lookup(i);
    if (!(annot instanceof PDFDict)) continue;
    for (const key of POINT_ARRAYS) affinePairs(annot.lookup(PDFName.of(key)), scale, tx, ty);
    const ink = annot.lookup(PDFName.of("InkList"));
    if (ink instanceof PDFArray) {
      for (let j = 0; j < ink.size(); j++) affinePairs(ink.lookup(j), scale, tx, ty);
    }
    scaleOnly(annot.lookup(PDFName.of("RD")), scale);
    moved++;
  }
  return moved;
}

/**
 * Resize one already-loaded pdf-lib page in place. Returns the plan used.
 *
 * Order matters: scaleContent wraps the stream first and translateContent wraps
 * that, so the operators come out as [translate][scale][original] and the
 * effective transform is translate(scale(p)) — scale about the origin, then
 * shift — which is what the plan's tx/ty assume.
 */
export function resizePage(page, opts) {
  const plan = planPage({
    media: page.getMediaBox(),
    crop: page.getCropBox(),
    rotation: page.getRotation().angle,
    ...opts,
  });

  page.setMediaBox(0, 0, plan.mediaW, plan.mediaH);
  page.setCropBox(0, 0, plan.mediaW, plan.mediaH);
  // Stale Bleed/Trim/Art boxes from the old, larger page would clip a print
  // workflow, so any that exist are squared up with the new page.
  if (page.node.BleedBox()) page.setBleedBox(0, 0, plan.mediaW, plan.mediaH);
  if (page.node.TrimBox()) page.setTrimBox(0, 0, plan.mediaW, plan.mediaH);
  if (page.node.ArtBox()) page.setArtBox(0, 0, plan.mediaW, plan.mediaH);

  if (plan.scale !== 1) page.scaleContent(plan.scale, plan.scale);
  if (plan.tx !== 0 || plan.ty !== 0) page.translateContent(plan.tx, plan.ty);
  transformAnnots(page, plan.scale, plan.tx, plan.ty);

  return plan;
}
