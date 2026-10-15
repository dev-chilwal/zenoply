// Geometry for Split Image. Pure, so it runs (and is tested) in node.
// Named gridSplit.js, not splitImage.js, so it can never case-collide with the
// SplitImage component.

// Tile shapes. "exact" cuts the whole picture with nothing removed; the others
// trim the picture first so every tile comes out at that aspect ratio, which is
// what Instagram's grid and carousel need (a 3:4 profile thumbnail, a 4:5 or
// square post).
export const SHAPES = {
  exact: null,
  "1:1": [1, 1],
  "4:5": [4, 5],
  "3:4": [3, 4],
};

export const MAX_SIDE = 10; // rows or columns

const clampInt = (v, lo, hi) => Math.min(hi, Math.max(lo, Math.round(Number(v) || lo)));

// The part of the picture that gets cut up, as { x, y, w, h } in source pixels.
// For a shaped split the tile size is the largest whole-pixel tile of that
// ratio that fits `cols` across and `rows` down, so every tile is identical.
// `pos` (0–1) slides the kept area along whichever axis is being trimmed:
// 0 keeps the left/top, 1 the right/bottom, 0.5 the centre.
export function cropRegion(w, h, { rows, cols, shape = "exact", pos = 0.5 }) {
  rows = clampInt(rows, 1, MAX_SIDE);
  cols = clampInt(cols, 1, MAX_SIDE);
  const ratio = SHAPES[shape];
  if (!ratio) return { x: 0, y: 0, w, h };
  const [aw, ah] = ratio;
  // Tile width is limited by the width (w / cols) or by the height
  // (h / rows converted to a width at this ratio), whichever is smaller.
  let tw = Math.floor(Math.min(w / cols, ((h / rows) * aw) / ah));
  let th = Math.floor((tw * ah) / aw);
  // Rounding can leave th one short of the ratio for tiny inputs; never zero.
  tw = Math.max(1, tw);
  th = Math.max(1, th);
  const cw = Math.min(w, tw * cols);
  const ch = Math.min(h, th * rows);
  const p = Math.min(1, Math.max(0, Number(pos)));
  return { x: Math.round((w - cw) * p), y: Math.round((h - ch) * p), w: cw, h: ch };
}

// Which axis a shaped split trims, for labelling the position slider.
export function trimAxis(w, h, region) {
  if (region.w < w) return "x";
  if (region.h < h) return "y";
  return null;
}

// Cut points along one axis: n+1 boundaries from `start` to `start + len`.
// Rounding i*len/n spreads a remainder one pixel at a time across the tiles
// instead of dumping it all on the last one, so a 1000px row in 3 gives
// 333/334/333 rather than 333/333/334 — and adjacent tiles share an edge, so
// no pixel is lost or duplicated.
export function cuts(start, len, n) {
  const out = [];
  for (let i = 0; i <= n; i++) out.push(start + Math.round((i * len) / n));
  return out;
}

// Every tile as { row, col, x, y, w, h } in reading order (left to right, top
// to bottom). Row and column are zero-based.
export function tileRects(region, rows, cols) {
  rows = clampInt(rows, 1, MAX_SIDE);
  cols = clampInt(cols, 1, MAX_SIDE);
  const xs = cuts(region.x, region.w, cols);
  const ys = cuts(region.y, region.h, rows);
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      tiles.push({ row: r, col: c, x: xs[c], y: ys[r], w: xs[c + 1] - xs[c], h: ys[r + 1] - ys[r] });
    }
  }
  return tiles;
}

// Instagram shows the newest post at the top left of a profile, so a grid has
// to be posted backwards: bottom-right tile first, top-left tile last. Given a
// tile's reading-order index, returns its 1-based posting number.
export function postingNumber(index, total) {
  return total - index;
}

// File name for a tile. Zero-padded so the files sort in order in Finder,
// Explorer and a phone's gallery picker, which is the order you upload them.
export function tileName(base, tile, index, total, { postingOrder = false, ext = "png" } = {}) {
  const n = postingOrder ? postingNumber(index, total) : index + 1;
  const width = String(total).length < 2 ? 2 : String(total).length;
  const num = String(n).padStart(width, "0");
  return `${base}-${num}-r${tile.row + 1}c${tile.col + 1}.${ext}`;
}
