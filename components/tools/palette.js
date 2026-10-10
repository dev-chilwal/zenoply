// Dominant-colour extraction for Color Palette from Image. Pure functions over
// RGBA bytes, so the whole pipeline is node-testable.
//
// 1. Histogram: pixels are binned at 5 bits per channel (32,768 bins), keeping
//    each bin's exact RGB sum so its mean is the real average of the pixels in
//    it, not the bin's corner. Pixels under half opacity are skipped.
// 2. Every bin mean moves to Oklab, where straight-line distance tracks how
//    different two colours look. Clustering in raw RGB merges dark blues with
//    blacks and splits one sky into three near-identical swatches.
// 3. Divisive seeding: always split the box with the largest weighted error,
//    at the cut (over all three axes) that minimises the error of the two
//    halves — Wu's criterion, not the median. A median cut lands inside the
//    biggest mass and never isolates a small accent. Lloyd iterations then
//    refine the seeds. Deterministic — the same image always gives
//    the same palette.
//

export function srgbToLinear(c) {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function linearToSrgb(v) {
  const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
}

export function rgbToOklab(r, g, b) {
  const R = srgbToLinear(r), G = srgbToLinear(g), B = srgbToLinear(b);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

export function oklabToRgb(L, a, b) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    linearToSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    linearToSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    linearToSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
}

export function hex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h: Math.round(h) % 360, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// WCAG 2 relative luminance and the text colour (black or white) that reads
// best on top of a swatch.
export function relLuminance(r, g, b) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}
export function contrastRatio(y1, y2) {
  return (Math.max(y1, y2) + 0.05) / (Math.min(y1, y2) + 0.05);
}
export function textOn(r, g, b) {
  const y = relLuminance(r, g, b);
  return contrastRatio(y, 0) >= contrastRatio(y, 1) ? "#000000" : "#ffffff";
}

export function histogram(data, alphaMin = 128) {
  const count = new Uint32Array(32768);
  const sr = new Float64Array(32768), sg = new Float64Array(32768), sb = new Float64Array(32768);
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < alphaMin) continue;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    count[k]++;
    sr[k] += r; sg[k] += g; sb[k] += b;
    total++;
  }
  const bins = [];
  for (let k = 0; k < 32768; k++) {
    if (!count[k]) continue;
    const n = count[k];
    const r = sr[k] / n, g = sg[k] / n, b = sb[k] / n;
    bins.push({ n, lab: rgbToOklab(r, g, b) });
  }
  return { bins, total };
}

function boxStats(box, w) {
  let W = 0;
  const mean = [0, 0, 0];
  for (const i of box) {
    W += w[i.idx];
    for (let c = 0; c < 3; c++) mean[c] += w[i.idx] * i.lab[c];
  }
  for (let c = 0; c < 3; c++) mean[c] /= W || 1;
  const v = [0, 0, 0];
  for (const i of box) for (let c = 0; c < 3; c++) v[c] += w[i.idx] * (i.lab[c] - mean[c]) ** 2;
  return { W, mean, v, sse: v[0] + v[1] + v[2] };
}

// Sort along each axis and take the cut minimising the summed weighted SSE of
// both halves, from prefix sums of w, w*x and w*x^2 over all three channels.
function bestSplit(items, w) {
  let best = null;
  for (let axis = 0; axis < 3; axis++) {
    const sorted = items.slice().sort((p, q) => p.lab[axis] - q.lab[axis]);
    const n = sorted.length;
    const W = new Float64Array(n + 1), S = new Float64Array((n + 1) * 3), Q = new Float64Array(n + 1);
    for (let i = 0; i < n; i++) {
      const wi = w[sorted[i].idx], p = sorted[i].lab;
      W[i + 1] = W[i] + wi;
      Q[i + 1] = Q[i] + wi * (p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
      for (let c = 0; c < 3; c++) S[(i + 1) * 3 + c] = S[i * 3 + c] + wi * p[c];
    }
    const sse = (a, b) => {
      const ww = W[b] - W[a];
      if (ww <= 0) return 0;
      let m2 = 0;
      for (let c = 0; c < 3; c++) m2 += (S[b * 3 + c] - S[a * 3 + c]) ** 2;
      return Q[b] - Q[a] - m2 / ww;
    };
    for (let cut = 1; cut < n; cut++) {
      // Equal coordinates on this axis must stay on one side.
      if (sorted[cut].lab[axis] === sorted[cut - 1].lab[axis]) continue;
      const e = sse(0, cut) + sse(cut, n);
      if (!best || e < best.e) best = { e, sorted, cut };
    }
  }
  return best || { sorted: items, cut: Math.max(1, items.length >> 1) };
}

function nearest(p, cents) {
  let best = 0, bd = Infinity;
  for (let c = 0; c < cents.length; c++) {
    const q = cents[c];
    const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}

function meansOf(bins, assign, cents) {
  const sum = cents.map(() => [0, 0, 0, 0]);
  for (let i = 0; i < bins.length; i++) {
    const s = sum[assign[i]], p = bins[i].lab, n = bins[i].n;
    s[0] += n * p[0]; s[1] += n * p[1]; s[2] += n * p[2]; s[3] += n;
  }
  return cents.map((c, j) => (sum[j][3] ? [sum[j][0] / sum[j][3], sum[j][1] / sum[j][3], sum[j][2] / sum[j][3]] : c));
}

// Pixel-weighted k-means: divisive seeding, then Lloyd until stable.
function cluster(bins, k, iterations) {
  const w = bins.map((b) => b.n);
  const boxes = [{ items: bins, ...boxStats(bins, w) }];
  while (boxes.length < k) {
    let pick = -1;
    for (let i = 0; i < boxes.length; i++) {
      if (boxes[i].items.length < 2 || boxes[i].sse <= 0) continue;
      if (pick < 0 || boxes[i].sse > boxes[pick].sse) pick = i;
    }
    if (pick < 0) break;
    const { sorted, cut } = bestSplit(boxes[pick].items, w);
    const lo = sorted.slice(0, cut), hi = sorted.slice(cut);
    boxes.splice(pick, 1, { items: lo, ...boxStats(lo, w) }, { items: hi, ...boxStats(hi, w) });
  }
  let cents = boxes.map((b) => b.mean.slice());
  const assign = new Int32Array(bins.length).fill(-1);
  for (let it = 0; it < iterations; it++) {
    let changed = 0;
    for (let i = 0; i < bins.length; i++) {
      const best = nearest(bins[i].lab, cents);
      if (assign[i] !== best) { assign[i] = best; changed++; }
    }
    cents = meansOf(bins, assign, cents);
    if (!changed) break;
  }
  return { cents, assign };
}

// `mode: "distinct"` over-segments into about 3k clusters, then picks k of
// them greedily: the largest first, then each time the cluster that scores
// highest on (distance to the nearest colour already picked) x share^0.25.
// Area-weighted k-means alone spends its colours splitting a big sky into
// three blues and folds a 1% red flower into whatever is nearest; the quarter
// power keeps a tiny cluster in contention without letting single stray pixels
// win. Every pixel is then re-assigned to the nearest picked colour, so the
// shares still add up to 100%.
export function extractPalette(data, { k = 6, mode = "dominant", alphaMin = 128, iterations = 20 } = {}) {
  const { bins, total } = histogram(data, alphaMin);
  if (!bins.length) return { colors: [], total: 0 };
  bins.forEach((b, idx) => (b.idx = idx));

  let { cents, assign } = cluster(bins, mode === "distinct" ? Math.min(3 * k, 36) : k, iterations);

  if (mode === "distinct" && cents.length > k) {
    const share = new Float64Array(cents.length);
    for (let i = 0; i < bins.length; i++) share[assign[i]] += bins[i].n / total;
    const live = cents.map((_, j) => j).filter((j) => share[j] > 0);
    const picked = [live.reduce((a, j) => (share[j] > share[a] ? j : a), live[0])];
    while (picked.length < Math.min(k, live.length)) {
      let best = -1, bs = -1;
      for (const j of live) {
        if (picked.includes(j)) continue;
        let dmin = Infinity;
        for (const q of picked) {
          const a = cents[j], b = cents[q];
          dmin = Math.min(dmin, Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]));
        }
        const sc = dmin * Math.pow(share[j], 0.25);
        if (sc > bs) { bs = sc; best = j; }
      }
      picked.push(best);
    }
    cents = picked.map((j) => cents[j]);
    for (let i = 0; i < bins.length; i++) assign[i] = nearest(bins[i].lab, cents);
    cents = meansOf(bins, assign, cents);
  }

  const counts = new Float64Array(cents.length);
  for (let i = 0; i < bins.length; i++) counts[assign[i]] += bins[i].n;
  const colors = [];
  cents.forEach((c, j) => {
    if (!counts[j]) return;
    const [r, g, b] = oklabToRgb(c[0], c[1], c[2]);
    colors.push({ r, g, b, hex: hex(r, g, b), L: c[0], count: counts[j], share: counts[j] / total });
  });
  colors.sort((p, q) => q.count - p.count);
  return { colors, total };
}

export function formatPalette(colors, fmt) {
  const hexes = colors.map((c) => c.hex);
  if (fmt === "css") return ":root {\n" + hexes.map((h, i) => `  --color-${i + 1}: ${h};`).join("\n") + "\n}";
  if (fmt === "scss") return hexes.map((h, i) => `$color-${i + 1}: ${h};`).join("\n");
  if (fmt === "json") return JSON.stringify(hexes, null, 2);
  return hexes.join("\n");
}
