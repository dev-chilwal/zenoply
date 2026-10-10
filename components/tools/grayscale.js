// Pixel maths for Black and White Image. Pure functions over RGBA byte arrays —
// no DOM — so node can test exactly what the canvas code runs.
//
// "Grayscale" is not one formula. Three are offered, because they disagree in
// ways people notice:
//
// - luminance: the physically right one. sRGB bytes are gamma-encoded, so they
//   are decoded to linear light first, weighted by the Rec. 709 primaries (the
//   ones sRGB uses), and the result encoded back. A pure red keeps the
//   brightness it appears to have (gray 127) instead of going near-black. It is
//   GIMP's default "Luminance" mode.
// - luma: the same weights' older cousin, Rec. 601 (0.299 / 0.587 / 0.114)
//   applied straight to the encoded bytes. It is what JPEG's Y channel, most
//   image libraries and most "grayscale" buttons compute, so it is the answer
//   people expect when they compare against another tool. Saturated colours
//   come out darker than they look (pure red → 76).
// - average: (R + G + B) / 3. Treats blue as being as bright as green, so skies
//   go pale and foliage goes dark; offered because it is sometimes the look
//   someone wants, and because it is what "average" tools produce.

export const METHODS = ["luminance", "luma", "average"];

const toLinear = (v) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};
const fromLinear = (y) => {
  const c = y <= 0.0031308 ? 12.92 * y : 1.055 * Math.pow(y, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(c * 255)));
};

// Per-channel decode tables with the Rec. 709 weight folded in, so a pixel is
// three lookups and two adds. Encoding back cannot use a uniform table: the
// sRGB curve is so steep near black that even 4096 steps put one value in 50 a
// byte off. Instead BOUND[k] holds the linear level where the exact encode
// rounds up to byte k, and a pixel is placed by binary search — eight
// comparisons, and identical to the Math.pow path (checked in the tests).
const LIN = /* @__PURE__ */ (() => {
  const r = new Float64Array(256);
  const g = new Float64Array(256);
  const b = new Float64Array(256);
  for (let i = 0; i < 256; i++) {
    const l = toLinear(i);
    r[i] = 0.2126 * l;
    g[i] = 0.7152 * l;
    b[i] = 0.0722 * l;
  }
  return { r, g, b };
})();
const BOUND = /* @__PURE__ */ (() => {
  const t = new Float64Array(256);
  for (let k = 1; k < 256; k++) {
    // Smallest y with fromLinear(y) >= k: bisect the continuous curve, then
    // the loop below never disagrees with fromLinear at the boundary.
    let lo = 0;
    let hi = 1;
    for (let it = 0; it < 60; it++) {
      const mid = (lo + hi) / 2;
      if (fromLinear(mid) >= k) hi = mid;
      else lo = mid;
    }
    t[k] = hi;
  }
  return t;
})();
const encode = (y) => {
  let lo = 0;
  let hi = 255;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (y >= BOUND[mid]) lo = mid;
    else hi = mid - 1;
  }
  return lo;
};

// Exact single-pixel versions — the reference the fast loop is tested against.
export function grayOf(r, g, b, method = "luminance") {
  if (method === "luma") return Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  if (method === "average") return Math.round((r + g + b) / 3);
  return fromLinear(LIN.r[r] + LIN.g[g] + LIN.b[b]);
}

// One gray byte per pixel from an RGBA buffer (ImageData.data). Alpha is not
// part of the gray value; callers copy it across separately.
export function toGray(data, method = "luminance") {
  const n = data.length >> 2;
  const out = new Uint8Array(n);
  if (method === "luma") {
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      out[i] = Math.round(0.299 * data[p] + 0.587 * data[p + 1] + 0.114 * data[p + 2]);
    }
  } else if (method === "average") {
    for (let i = 0, p = 0; i < n; i++, p += 4) out[i] = Math.round((data[p] + data[p + 1] + data[p + 2]) / 3);
  } else {
    const { r, g, b } = LIN;
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      out[i] = encode(r[data[p]] + g[data[p + 1]] + b[data[p + 2]]);
    }
  }
  return out;
}

// Brightness and contrast on the gray values, as the familiar ±100 sliders.
// Contrast pivots on mid-gray 128 so it never shifts the overall exposure;
// brightness is a straight offset of up to ±128. Both clamp to 0–255.
export function adjust(gray, brightness = 0, contrast = 0) {
  if (!brightness && !contrast) return gray;
  const k = contrast >= 0 ? 1 + (contrast / 100) * 2 : 1 + contrast / 100; // 0..3
  const off = (brightness / 100) * 128;
  const lut = new Uint8Array(256);
  for (let v = 0; v < 256; v++) lut[v] = Math.max(0, Math.min(255, Math.round((v - 128) * k + 128 + off)));
  const out = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = lut[gray[i]];
  return out;
}

// Otsu's method: the threshold that maximises the variance between the two
// classes it creates, i.e. the cut that best separates ink from paper. Pixels
// with `alpha` below 128 are ignored when an alpha array is given, so a
// transparent margin (stored as black by most encoders) does not drag the cut.
// Returns t such that gray >= t is white. A single-tone image has no split;
// 128 is returned for it.
export function otsu(gray, alpha) {
  const hist = new Float64Array(256);
  let total = 0;
  for (let i = 0; i < gray.length; i++) {
    if (alpha && alpha[i] < 128) continue;
    hist[gray[i]]++;
    total++;
  }
  if (!total) return 128;
  let sumAll = 0;
  for (let v = 0; v < 256; v++) sumAll += v * hist[v];
  let wB = 0;
  let sumB = 0;
  let best = -1;
  let lo = 0;
  let hi = 0;
  for (let t = 0; t < 255; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB;
    const mF = (sumAll - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    // Two well-separated tones leave an empty gap in the histogram, and every
    // cut inside it scores the same. Take the middle of that plateau rather
    // than its first step, so the cut sits between the tones, not hard
    // against the darker one.
    if (between > best * (1 + 1e-12)) {
      best = between;
      lo = hi = t;
    } else if (between >= best * (1 - 1e-12)) {
      hi = t;
    }
  }
  // Class "below" is 0..t, so white starts at t + 1.
  return best <= 0 ? 128 : ((lo + hi) >> 1) + 1;
}

// Hard threshold: gray >= t → 255, else 0.
export function threshold(gray, t) {
  const out = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) out[i] = gray[i] >= t ? 255 : 0;
  return out;
}

// Floyd–Steinberg error diffusion to pure black and white, serpentine scan so
// the error does not pile up in one direction and draw diagonal "worms".
// Errors carry in a float buffer; nothing is rounded until the pixel is decided.
// Diffusion preserves the mean tone whatever the cut point `t` is — measured: a
// gradient dithered at t = 200 comes out with the same white fraction per band
// as at 128 — so `t` only changes the texture. Lightness is steered with
// brightness and contrast before this step, not with the cut.
export function dither(gray, w, h, t = 128) {
  const buf = new Float32Array(gray.length);
  for (let i = 0; i < gray.length; i++) buf[i] = gray[i];
  const out = new Uint8Array(gray.length);
  for (let y = 0; y < h; y++) {
    const ltr = (y & 1) === 0;
    const dir = ltr ? 1 : -1;
    for (let k = 0; k < w; k++) {
      const x = ltr ? k : w - 1 - k;
      const i = y * w + x;
      const old = buf[i];
      const v = old >= t ? 255 : 0;
      out[i] = v;
      const err = old - v;
      const xn = x + dir;
      const xp = x - dir;
      if (xn >= 0 && xn < w) buf[i + dir] += (err * 7) / 16;
      if (y + 1 < h) {
        const j = i + w;
        if (xp >= 0 && xp < w) buf[j - dir] += (err * 3) / 16;
        buf[j] += (err * 5) / 16;
        if (xn >= 0 && xn < w) buf[j + dir] += err / 16;
      }
    }
  }
  return out;
}

// The whole pipeline, writing the result back into an RGBA buffer in place.
// opts: { mode: "gray" | "bw", method, brightness, contrast, cut, dither }.
// `cut` is the black/white threshold, or null for Otsu. Returns the cut used
// (null in gray mode or when dithering) so the UI can show what "auto" picked.
export function renderMono(data, w, h, opts) {
  const { mode = "gray", method = "luminance", brightness = 0, contrast = 0, cut = null } = opts || {};
  let g = adjust(toGray(data, method), brightness, contrast);
  let used = null;
  if (mode === "bw") {
    let alpha;
    if (cut == null && !opts.dither) {
      alpha = new Uint8Array(g.length);
      for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
    }
    if (opts.dither) {
      g = dither(g, w, h, 128);
    } else {
      used = cut == null ? otsu(g, alpha) : cut;
      g = threshold(g, used);
    }
  }
  for (let i = 0, p = 0; i < g.length; i++, p += 4) {
    data[p] = data[p + 1] = data[p + 2] = g[i];
  }
  return used;
}
