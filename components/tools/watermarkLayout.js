// Geometry for the image watermark tool, kept free of the DOM so it can be
// tested in node. Named watermarkLayout.js rather than watermarkImage.js: a
// helper that only differs from its component (WatermarkImage.jsx) by case
// collides on a case-insensitive filesystem and prerenders a 404 stub.
//
// Every length is derived from the image's own size, never from fixed pixels,
// so the preview (the export pipeline at reduced scale) and the full-size file
// put the mark in the same place at the same relative size.

export const POSITIONS = [
  "top-left", "top", "top-right",
  "left", "center", "right",
  "bottom-left", "bottom", "bottom-right",
];

// Margin from the edge, as a fraction of the shorter side, so a 3% inset looks
// the same on a portrait phone shot and a wide panorama.
export function marginPx(W, H, marginPct) {
  return (Math.min(W, H) * marginPct) / 100;
}

// Rotated bounding box of a w×h mark turned by `deg` — what has to fit inside
// the margin when the mark sits against an edge.
export function rotatedBox(w, h, deg) {
  const r = (deg * Math.PI) / 180;
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  return { w: w * c + h * s, h: w * s + h * c };
}

// Centre point of a single mark of size w×h (before rotation) at one of the
// nine anchor positions. The rotated box is what is kept inside the margin, so
// a tilted mark in a corner never pokes off the edge.
export function anchorCenter(W, H, w, h, deg, position, marginPctValue) {
  const m = marginPx(W, H, marginPctValue);
  const box = rotatedBox(w, h, deg);
  const [row, col] = (() => {
    const i = Math.max(0, POSITIONS.indexOf(position));
    return [Math.floor(i / 3), i % 3];
  })();
  const x = col === 0 ? m + box.w / 2 : col === 2 ? W - m - box.w / 2 : W / 2;
  const y = row === 0 ? m + box.h / 2 : row === 2 ? H - m - box.h / 2 : H / 2;
  return { x, y };
}

// Centres of a tiled pattern, in a frame rotated by `deg` around the image
// centre (the caller rotates the context the same way before drawing). Rows
// are offset by half a step, brick-style, so the marks don't line up into
// stripes. The grid covers a square as wide as the image's diagonal, which is
// the smallest region that still reaches every corner after any rotation.
export function tileCenters(W, H, w, h, gapPct) {
  const gap = (Math.min(W, H) * gapPct) / 100;
  const stepX = Math.max(1, w + gap);
  const stepY = Math.max(1, h + gap);
  const half = Math.hypot(W, H) / 2;
  const reachX = half + stepX; // one extra step so half-offset rows still cover
  const reachY = half + stepY;
  const nx = Math.ceil(reachX / stepX);
  const ny = Math.ceil(reachY / stepY);
  const pts = [];
  for (let j = -ny; j <= ny; j++) {
    const off = (Math.abs(j) % 2) * (stepX / 2);
    for (let i = -nx; i <= nx; i++) {
      pts.push({ x: i * stepX + off, y: j * stepY });
    }
  }
  return pts;
}
