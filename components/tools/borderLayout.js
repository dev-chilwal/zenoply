// Geometry for Add Border to Image. Pure, so it runs (and is tested) in node.
// Named borderLayout.js, not addBorder.js, so it can never case-collide with
// the AddBorderToImage component.

export const SIDES = ["top", "right", "bottom", "left"];

// Turn a thickness typed in px or as a percentage of the image's shorter side
// into whole pixels. Percentages are what keep a border looking the same on a
// 600px thumbnail and a 6000px original.
export function toPx(value, unit, w, h) {
  const v = Number(value);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.round(unit === "pct" ? (v / 100) * Math.min(w, h) : v);
}

// Resolve each side to pixels. `uniform` uses `size` for all four; otherwise
// `sides` holds one value per side, in the same unit.
export function resolveSides(w, h, { unit, uniform, size, sides }) {
  const out = {};
  for (const s of SIDES) out[s] = toPx(uniform ? size : sides[s], unit, w, h);
  return out;
}

// Canvas size and where the picture sits on it. With `square`, the shorter
// dimension is extended (in the border colour) so the whole frame is square —
// the Instagram "no crop" layout — and the picture stays centred within the
// space the borders leave it; an odd leftover pixel goes to the right/bottom.
export function borderLayout(w, h, px, { square = false } = {}) {
  let width = w + px.left + px.right;
  let height = h + px.top + px.bottom;
  let x = px.left;
  let y = px.top;
  if (square && width !== height) {
    const s = Math.max(width, height);
    x += Math.floor((s - width) / 2);
    y += Math.floor((s - height) / 2);
    width = height = s;
  }
  return { width, height, x, y };
}

// Corner radius in px for the outer frame: a percentage of the output's
// shorter side, capped at half of it (where the short side becomes a semicircle).
export function cornerRadius(pct, width, height) {
  const v = Number(pct);
  if (!Number.isFinite(v) || v <= 0) return 0;
  return Math.min(Math.min(width, height) / 2, (v / 100) * Math.min(width, height));
}
