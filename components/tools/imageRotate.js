// Geometry for Rotate / Flip Image. Pure functions — no DOM — so node can test
// the maths the canvas code relies on.
//
// A transform is { angle, flipH, flipV }: the flips are applied to the source
// first, then the picture is turned `angle` degrees clockwise about its centre.
// Canvas y points down, so ctx.rotate() with a positive angle turns clockwise on
// screen, which is the direction "rotate right" means to everyone.

// Wrap any angle into (-180, 180]. Keeps the readout short (270 shows as -90)
// and keeps repeated 90° clicks from counting up forever.
export function normAngle(a) {
  let r = ((a % 360) + 360) % 360; // [0, 360)
  if (r > 180) r -= 360;
  return Object.is(r, -0) ? 0 : r;
}

// |sin| and |cos| with the multiples of 90° made exact. Math.cos(Math.PI / 2) is
// 6e-17, not 0, and that dust is enough to push a Math.ceil() a pixel over.
function absTrig(angle) {
  const a = normAngle(angle);
  if (a === 0) return { s: 0, c: 1 };
  if (a === 90 || a === -90) return { s: 1, c: 0 };
  if (a === 180) return { s: 0, c: 1 };
  const rad = (a * Math.PI) / 180;
  return { s: Math.abs(Math.sin(rad)), c: Math.abs(Math.cos(rad)) };
}

export const isRightAngle = (angle) => normAngle(angle) % 90 === 0;

// Size of the canvas that holds the whole turned picture: its axis-aligned
// bounding box. Right angles are exact swaps; anything else rounds to the
// nearest pixel, which can shave at most half a pixel off a corner tip.
export function expandedSize(w, h, angle) {
  const { s, c } = absTrig(angle);
  if (s === 0) return { w, h };
  if (c === 0) return { w: h, h: w };
  return { w: Math.round(w * c + h * s), h: Math.round(w * s + h * c) };
}

// Largest axis-aligned rectangle that fits entirely inside a w×h rectangle
// turned by `angle` — the "crop off the empty corners" size a straightened photo
// wants. Centred on the same point. Two regimes: when the turn is small enough
// that the rectangle still touches all four sides of the tilted frame, the
// solution is the 2×2 linear system in the else branch; past that point (thin
// images, or angles near 45°) it is limited by the short side alone and becomes
// a half-constrained rectangle touching two opposite corners.
export function innerSize(w, h, angle) {
  const { s, c } = absTrig(angle);
  if (s === 0) return { w, h };
  if (c === 0) return { w: h, h: w };
  const wide = w >= h;
  const long = wide ? w : h;
  const short = wide ? h : w;
  let iw;
  let ih;
  if (short <= 2 * s * c * long || Math.abs(s - c) < 1e-10) {
    const x = 0.5 * short;
    [iw, ih] = wide ? [x / s, x / c] : [x / c, x / s];
  } else {
    const cos2 = c * c - s * s;
    iw = (w * c - h * s) / cos2;
    ih = (h * c - w * s) / cos2;
  }
  // Floor, never round: a rectangle half a pixel too big shows a sliver of
  // background along one edge, which is exactly what this mode promises not to.
  return { w: Math.max(1, Math.floor(iw)), h: Math.max(1, Math.floor(ih)) };
}

// Output size for a transform and a corner mode ("expand" | "crop").
export function outputSize(w, h, { angle }, mode = "expand") {
  return mode === "crop" ? innerSize(w, h, angle) : expandedSize(w, h, angle);
}

// Draw `source` (anything drawImage accepts, sized sw×sh) into ctx with the
// transform applied, filling an outW×outH box. `scale` shrinks everything for a
// preview; the full-size export passes 1. The caller sets the canvas size and
// paints any background first.
export function drawTransformed(ctx, source, sw, sh, t, outW, outH, scale = 1) {
  ctx.save();
  ctx.scale(scale, scale);
  // Right angles map pixel centres onto pixel centres (the translate below
  // lands on whole or half pixels that cancel out), so smoothing would only
  // blur; turn it off and the rotation is a lossless shuffle of pixels.
  ctx.imageSmoothingEnabled = !(isRightAngle(t.angle) && scale === 1);
  ctx.imageSmoothingQuality = "high";
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate((normAngle(t.angle) * Math.PI) / 180);
  ctx.scale(t.flipH ? -1 : 1, t.flipV ? -1 : 1);
  ctx.drawImage(source, -sw / 2, -sh / 2, sw, sh);
  ctx.restore();
}

// Forward map of one source pixel's centre to output coordinates — the same
// sequence of operations as drawTransformed, for tests.
export function mapPoint(x, y, sw, sh, t, outW, outH) {
  let px = x - sw / 2;
  let py = y - sh / 2;
  if (t.flipH) px = -px;
  if (t.flipV) py = -py;
  const rad = (normAngle(t.angle) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return { x: px * cos - py * sin + outW / 2, y: px * sin + py * cos + outH / 2 };
}

// A flip followed by a 180° turn is the other flip; normalise so the readout
// and the file name describe the result in the fewest words.
export function simplify(t) {
  let { angle, flipH, flipV } = t;
  angle = normAngle(angle);
  if (flipH && flipV) {
    flipH = false;
    flipV = false;
    angle = normAngle(angle + 180);
  }
  // Likewise a 180° turn plus one flip is just the other flip.
  if (angle === 180 && flipH !== flipV) {
    angle = 0;
    flipH = !flipH;
    flipV = !flipV;
  }
  return { angle, flipH, flipV };
}

// Mirroring the picture reverses the sense of rotation, so a flip applied after
// a turn has to negate the angle to leave the already-turned picture where it
// is and only mirror it. That is what makes the buttons act on what you see.
export function flipAfter(t, axis) {
  const angle = normAngle(-t.angle);
  const next = axis === "h" ? { ...t, angle, flipH: !t.flipH } : { ...t, angle, flipV: !t.flipV };
  return simplify(next);
}

export function describe(t) {
  const parts = [];
  const a = normAngle(t.angle);
  if (a === 180) parts.push("rotated 180°");
  else if (a) parts.push(`rotated ${Math.abs(a)}° ${a > 0 ? "clockwise" : "anticlockwise"}`);
  if (t.flipH) parts.push("flipped horizontally");
  if (t.flipV) parts.push("flipped vertically");
  return parts.length ? parts.join(", ") : "unchanged";
}
