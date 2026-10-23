// Image → SVG tracing around imagetracerjs (Unlicense). The library does the
// colour quantisation and path fitting; everything either side of it is here
// so it can run in node, where it is tested:
//
//  * the palette — imagetracer's own grid sampling + RGB k-means turned a
//    clean navy-and-orange logo into one muddy brown, and its rectilinear RGB
//    distance sends the blended pixels along a navy/white edge to *orange*
//    (closer by that measure), leaving hundreds of sliver shapes. So the
//    palette comes from the same Oklab k-means as Color Palette from Image,
//    every pixel is snapped to its nearest palette colour in Oklab, and the
//    tracer is handed exact colours with a fixed palette and one pass.
//  * prepPixels — alpha is made binary first (below 128 → fully transparent
//    black, else opaque). The tracer measures colour distance in RGBA, so a
//    soft anti-aliased edge would otherwise spend palette slots on half-
//    transparent copies of every colour.
//  * the SVG emitter — imagetracer's own getsvgstring rounds hole paths to
//    whole pixels while outer paths keep a decimal (holes visibly shift), and
//    writes `rgb()` fill + stroke + opacity on every path. Here each colour is
//    one <g> with a hex fill, transparent layers are dropped, the largest
//    colour is drawn first, and the SVG carries the original image's
//    width/height with the traced grid as its viewBox, so it opens at the
//    size the picture was.

import { toGray, otsu } from "./grayscale";
import { extractPalette, rgbToOklab } from "./palette";

// Longest side the picture is traced at, per detail level. Tracing a 12 MP
// photo at full size takes minutes and yields a multi-megabyte SVG whose
// extra paths are noise; the viewBox scales the result back up losslessly.
export const DETAIL = {
  low: { maxSide: 500, pathomit: 16, ltres: 2, qtres: 2, minArea: 24 },
  medium: { maxSide: 1000, pathomit: 8, ltres: 1, qtres: 1, minArea: 8 },
  high: { maxSide: 1600, pathomit: 3, ltres: 0.5, qtres: 0.5, minArea: 3 },
};

export function traceSize(w, h, detail) {
  const max = DETAIL[detail].maxSide;
  const k = Math.min(1, max / Math.max(w, h));
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)) };
}

// In place on an RGBA buffer. mode "mono" also reduces it to pure black and
// white at `cut` (null = Otsu); returns the cut used, or null in colour mode.
export function prepPixels(data, mode, cut = null) {
  const n = data.length >> 2;
  for (let p = 0; p < data.length; p += 4) {
    if (data[p + 3] < 128) data[p] = data[p + 1] = data[p + 2] = data[p + 3] = 0;
    else data[p + 3] = 255;
  }
  if (mode !== "mono") return null;
  const gray = toGray(data);
  const alpha = new Uint8Array(n);
  for (let i = 0; i < n; i++) alpha[i] = data[i * 4 + 3];
  const t = cut == null ? otsu(gray, alpha) : cut;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    if (!alpha[i]) continue;
    const v = gray[i] >= t ? 255 : 0;
    data[p] = data[p + 1] = data[p + 2] = v;
  }
  return t;
}

export function traceOptions({ detail }) {
  const d = DETAIL[detail];
  const base = {
    ltres: d.ltres,
    qtres: d.qtres,
    pathomit: d.pathomit,
    rightangleenhance: true,
    layering: 0,
    roundcoords: 1,
    mincolorratio: 0,
    blurradius: 0,
    blurdelta: 20,
  };
  // Pixels arrive already snapped to the palette (or transparent), so the
  // tracer's fixed-palette path with one assignment pass maps them exactly.
  return { ...base, colorquantcycles: 1 };
}

const MONO_PAL = [
  { r: 0, g: 0, b: 0, a: 255 },
  { r: 255, g: 255, b: 255, a: 255 },
];

// Up to `colors` palette entries for the opaque pixels, from Oklab k-means.
export function buildPalette(data, colors) {
  return extractPalette(data, { k: colors, mode: "dominant" }).colors.map(({ r, g, b }) => ({ r, g, b, a: 255 }));
}

// Palette index per pixel (255 = transparent): the nearest palette colour by
// Oklab distance. Cached per distinct colour — logos have a few hundred.
export function snapToPalette(data, pal) {
  const labs = pal.map((c) => rgbToOklab(c.r, c.g, c.b));
  const cache = new Map();
  const labels = new Uint8Array(data.length >> 2);
  for (let i = 0, p = 0; p < data.length; i++, p += 4) {
    if (!data[p + 3]) {
      labels[i] = 255;
      continue;
    }
    const key = (data[p] << 16) | (data[p + 1] << 8) | data[p + 2];
    let ci = cache.get(key);
    if (ci === undefined) {
      const q = rgbToOklab(data[p], data[p + 1], data[p + 2]);
      let best = Infinity;
      ci = 0;
      for (let k = 0; k < labs.length; k++) {
        const l = labs[k];
        const d = (q[0] - l[0]) ** 2 + (q[1] - l[1]) ** 2 + (q[2] - l[2]) ** 2;
        if (d < best) {
          best = d;
          ci = k;
        }
      }
      cache.set(key, ci);
    }
    labels[i] = ci;
  }
  return labels;
}

// Merges every 4-connected region smaller than minArea pixels into the label
// it shares the most edge with. Needed because the blended pixels along an
// anti-aliased edge between two colours can sit nearest to a *third* one (a
// navy/white edge passes close to orange in any colour space), which leaves a
// trail of one-to-five-pixel specks; on a test logo that was 105 of its 108
// shapes. Thin real lines survive: a 1px line is one long region, not specks.
// In place; returns how many regions were merged.
export function despeckle(labels, w, h, minArea) {
  const n = w * h;
  const seen = new Uint8Array(n);
  const stack = new Int32Array(n);
  const region = new Int32Array(n);
  const tally = new Uint32Array(256);
  let merged = 0;
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue;
    const lab = labels[s];
    let top = 0;
    let size = 0;
    stack[top++] = s;
    seen[s] = 1;
    while (top) {
      const i = stack[--top];
      region[size++] = i;
      const x = i % w;
      if (x > 0 && !seen[i - 1] && labels[i - 1] === lab) (seen[i - 1] = 1), (stack[top++] = i - 1);
      if (x < w - 1 && !seen[i + 1] && labels[i + 1] === lab) (seen[i + 1] = 1), (stack[top++] = i + 1);
      if (i >= w && !seen[i - w] && labels[i - w] === lab) (seen[i - w] = 1), (stack[top++] = i - w);
      if (i < n - w && !seen[i + w] && labels[i + w] === lab) (seen[i + w] = 1), (stack[top++] = i + w);
    }
    if (size >= minArea) continue;
    tally.fill(0);
    for (let r = 0; r < size; r++) {
      const i = region[r];
      const x = i % w;
      if (x > 0 && labels[i - 1] !== lab) tally[labels[i - 1]]++;
      if (x < w - 1 && labels[i + 1] !== lab) tally[labels[i + 1]]++;
      if (i >= w && labels[i - w] !== lab) tally[labels[i - w]]++;
      if (i < n - w && labels[i + w] !== lab) tally[labels[i + w]]++;
    }
    let to = -1;
    for (let k = 0, most = 0; k < 256; k++) if (tally[k] > most) (most = tally[k]), (to = k);
    if (to < 0) continue; // the whole picture is one region
    for (let r = 0; r < size; r++) labels[region[r]] = to;
    merged++;
  }
  return merged;
}

// Pixels per palette entry, and how many of the outer border's pixels each
// one covers — the biggest share of the border is the background.
export function labelStats(labels, w, h, palLength) {
  const counts = new Array(palLength).fill(0);
  const border = new Array(palLength).fill(0);
  for (let y = 0, i = 0; y < h; y++) {
    for (let x = 0; x < w; x++, i++) {
      counts[labels[i]]++;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) border[labels[i]]++;
    }
  }
  return { counts, border };
}

const num = (v) => {
  const s = (Math.round(v * 10) / 10).toString();
  return s === "-0" ? "0" : s;
};

const hex = (c) => "#" + [c.r, c.g, c.b].map((v) => v.toString(16).padStart(2, "0")).join("");

// One traced outline plus its holes. Holes are walked backwards so they wind
// against the outline and the default nonzero fill rule leaves them empty.
function pathData(layer, path) {
  const segs = path.segments;
  let d = "M" + num(segs[0].x1) + " " + num(segs[0].y1);
  for (const s of segs) {
    d += s.type + num(s.x2) + " " + num(s.y2);
    if ("x3" in s) d += " " + num(s.x3) + " " + num(s.y3);
  }
  d += "Z";
  for (const hi of path.holechildren) {
    const hs = layer[hi].segments;
    const last = hs[hs.length - 1];
    d += "M" + ("x3" in last ? num(last.x3) + " " + num(last.y3) : num(last.x2) + " " + num(last.y2));
    for (let i = hs.length - 1; i >= 0; i--) {
      const s = hs[i];
      d += s.type;
      if ("x3" in s) d += num(s.x2) + " " + num(s.y2) + " ";
      d += num(s.x1) + " " + num(s.y1);
    }
    d += "Z";
  }
  return d;
}

// tracedata: imagetracer's { layers, palette, width, height }.
// stroke: a hairline in each shape's own colour, hiding the seams anti-aliasing
// would otherwise open between neighbouring colours. Off for black and white,
// where it would thicken every line.
export function emitSvg(tracedata, { outW, outH, counts, drop = -1, stroke = true }) {
  const { layers, palette, width, height } = tracedata;
  const order = palette.map((_, k) => k).sort((a, b) => (counts ? counts[b] - counts[a] : a - b));
  let body = "";
  let paths = 0;
  let colours = 0;
  for (const k of order) {
    const c = palette[k];
    if (c.a < 128 || k === drop) continue;
    const ds = [];
    for (const p of layers[k]) if (!p.isholepath && p.segments.length) ds.push(pathData(layers[k], p));
    if (!ds.length) continue;
    const fill = hex(c);
    body +=
      `<g fill="${fill}"` +
      (stroke ? ` stroke="${fill}" stroke-width="1" stroke-linejoin="round"` : "") +
      ">" +
      ds.map((d) => `<path d="${d}"/>`).join("") +
      "</g>";
    paths += ds.length;
    colours++;
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${outW}" height="${outH}" viewBox="0 0 ${width} ${height}">` +
    body +
    "</svg>";
  return { svg, paths, colours };
}

// The whole pipeline on an RGBA buffer already scaled to the trace size.
export function vectorize(tracer, data, w, h, { mode, colors, detail, smooth, cut, dropBackground, outW, outH }) {
  if (mode !== "mono" && smooth) {
    // imagetracer's selective Gaussian: blurs within flat areas, leaves edges
    // whose colour differs by more than blurdelta alone. Alpha is re-binarised
    // after, by prepPixels.
    const blurred = tracer.blur({ width: w, height: h, data }, 2, 64);
    data.set(blurred.data);
  }
  const usedCut = prepPixels(data, mode, cut);
  let pal;
  let labels;
  if (mode === "mono") {
    pal = MONO_PAL.slice();
    labels = new Uint8Array(w * h);
    for (let i = 0, p = 0; i < labels.length; i++, p += 4) labels[i] = data[p + 3] ? (data[p] ? 1 : 0) : 255;
  } else {
    pal = buildPalette(data, colors);
    labels = snapToPalette(data, pal);
  }
  despeckle(labels, w, h, DETAIL[detail].minArea);
  if (labels.includes(255)) {
    const t = pal.length;
    pal.push({ r: 0, g: 0, b: 0, a: 0 });
    for (let i = 0; i < labels.length; i++) if (labels[i] === 255) labels[i] = t;
  }
  // Exact palette colours back into the buffer: the tracer's single
  // fixed-palette pass then reproduces these labels one for one.
  for (let i = 0, p = 0; i < labels.length; i++, p += 4) {
    const c = pal[labels[i]];
    data[p] = c.r;
    data[p + 1] = c.g;
    data[p + 2] = c.b;
    data[p + 3] = c.a;
  }
  const td = tracer.imagedataToTracedata({ width: w, height: h, data }, { ...traceOptions({ detail }), pal });
  const { counts, border } = labelStats(labels, w, h, pal.length);
  let drop = -1;
  if (dropBackground) {
    for (let k = 0, most = 0; k < pal.length; k++) if (pal[k].a && border[k] > most) (most = border[k]), (drop = k);
  }
  const out = emitSvg(td, { outW, outH, counts, drop, stroke: mode !== "mono" });
  return { ...out, cut: usedCut, traced: { w, h } };
}
