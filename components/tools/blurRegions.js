// Pixel maths for Blur Image. Pure functions over RGBA byte arrays so they can
// be checked in node. (Not named blurImage.js: a helper spelled like its
// component collides on case-insensitive filesystems.)

// Pixelate in place: each block becomes the mean of its own pixels. Blocks are
// laid out from the region's top-left corner. `block` may be fractional (the
// preview runs at reduced scale), so edges fall at round(k * block). Colour is
// averaged weighted by alpha, so a transparent pixel's hidden RGB cannot tint
// the block.
export function pixelate(data, w, h, block) {
  const b = Math.max(1, block);
  const nx = Math.max(1, Math.ceil(w / b - 1e-9));
  const ny = Math.max(1, Math.ceil(h / b - 1e-9));
  for (let by = 0; by < ny; by++) {
    const y0 = Math.round(by * b);
    const y1 = Math.min(h, Math.round((by + 1) * b));
    for (let bx = 0; bx < nx; bx++) {
      const x0 = Math.round(bx * b);
      const x1 = Math.min(w, Math.round((bx + 1) * b));
      if (x1 <= x0 || y1 <= y0) continue;
      let r = 0, g = 0, bl = 0, a = 0;
      for (let y = y0; y < y1; y++) {
        for (let x = x0, i = (y * w + x0) * 4; x < x1; x++, i += 4) {
          const al = data[i + 3];
          r += data[i] * al;
          g += data[i + 1] * al;
          bl += data[i + 2] * al;
          a += al;
        }
      }
      const n = (x1 - x0) * (y1 - y0);
      const R = a ? Math.round(r / a) : 0;
      const G = a ? Math.round(g / a) : 0;
      const B = a ? Math.round(bl / a) : 0;
      const A = Math.round(a / n);
      for (let y = y0; y < y1; y++) {
        for (let x = x0, i = (y * w + x0) * 4; x < x1; x++, i += 4) {
          data[i] = R;
          data[i + 1] = G;
          data[i + 2] = B;
          data[i + 3] = A;
        }
      }
    }
  }
  return data;
}

// Widths of three box filters whose repeated application approximates a
// Gaussian of standard deviation sigma (the central limit theorem at work).
export function boxesForGauss(sigma, n = 3) {
  const wIdeal = Math.sqrt((12 * sigma * sigma) / n + 1);
  let wl = Math.floor(wIdeal);
  if (wl % 2 === 0) wl--;
  const wu = wl + 2;
  const mIdeal = (12 * sigma * sigma - n * wl * wl - 4 * n * wl - 3 * n) / (-4 * wl - 4);
  const m = Math.round(mIdeal);
  const sizes = [];
  for (let i = 0; i < n; i++) sizes.push(i < m ? wl : wu);
  return sizes;
}

// One horizontal box pass of radius r, edges clamped. src -> dst, Float32 planes.
function boxH(src, dst, w, h, r) {
  const d = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[row + Math.min(w - 1, Math.max(0, k))];
    for (let x = 0; x < w; x++) {
      dst[row + x] = sum / d;
      sum += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
    }
  }
}

function boxV(src, dst, w, h, r) {
  const d = 2 * r + 1;
  for (let x = 0; x < w; x++) {
    let sum = 0;
    for (let k = -r; k <= r; k++) sum += src[Math.min(h - 1, Math.max(0, k)) * w + x];
    for (let y = 0; y < h; y++) {
      dst[y * w + x] = sum / d;
      sum += src[Math.min(h - 1, y + r + 1) * w + x] - src[Math.max(0, y - r) * w + x];
    }
  }
}

// Gaussian blur in place (three box passes each way, premultiplied alpha so a
// transparent neighbour does not bleed its hidden colour in). Running sums
// make the cost independent of sigma.
export function gaussianBlur(data, w, h, sigma) {
  if (sigma < 0.5 || w < 1 || h < 1) return data;
  const radii = boxesForGauss(sigma).map((s) => (s - 1) / 2);
  const n = w * h;
  const planes = [0, 1, 2, 3].map(() => new Float32Array(n));
  for (let i = 0, p = 0; p < n; p++, i += 4) {
    const a = data[i + 3] / 255;
    planes[0][p] = data[i] * a;
    planes[1][p] = data[i + 1] * a;
    planes[2][p] = data[i + 2] * a;
    planes[3][p] = data[i + 3];
  }
  const tmp = new Float32Array(n);
  for (const plane of planes) {
    for (const r of radii) {
      if (r < 1) continue;
      boxH(plane, tmp, w, h, r);
      boxV(tmp, plane, w, h, r);
    }
  }
  for (let i = 0, p = 0; p < n; p++, i += 4) {
    const A = planes[3][p];
    const k = A > 0 ? 255 / A : 0;
    data[i] = Math.round(planes[0][p] * k);
    data[i + 1] = Math.round(planes[1][p] * k);
    data[i + 2] = Math.round(planes[2][p] * k);
    data[i + 3] = Math.round(A);
  }
  return data;
}

// Strength is a percentage of the image's shorter side, so a setting means the
// same thing on a 600px screenshot and a 4000px photo, and the reduced-scale
// preview matches the full-size download.
export function effectSize(strengthPct, shortSide) {
  return Math.max(2, Math.round((shortSide * strengthPct) / 100));
}

// Normalise a dragged rectangle (any corner first) and clamp it to the image.
export function clampRect(x0, y0, x1, y1, w, h) {
  const ax = Math.max(0, Math.min(w, Math.min(x0, x1)));
  const ay = Math.max(0, Math.min(h, Math.min(y0, y1)));
  const bx = Math.max(0, Math.min(w, Math.max(x0, x1)));
  const by = Math.max(0, Math.min(h, Math.max(y0, y1)));
  return { x: Math.round(ax), y: Math.round(ay), w: Math.round(bx - ax), h: Math.round(by - ay) };
}
