// Extract horizontal/vertical ruling lines from a pdf.js operator list.
//
// Table borders are drawn as stroked/filled paths and rectangles. pdf.js emits
// them via constructPath ops whose coordinates land in the SAME PDF user space
// as getTextContent() item transforms (verified), so the lines can be matched
// directly against the extracted text to reconstruct exact cells. Op codes are
// read from the live pdfjs.OPS map, so this is version-independent.

// 2D affine compose: returns m1 applied then m2 (point · m1 · m2).
// Matrices are [a,b,c,d,e,f] = [[a,b,0],[c,d,0],[e,f,1]].
function mul(m1, m2) {
  const [a1, b1, c1, d1, e1, f1] = m1;
  const [a2, b2, c2, d2, e2, f2] = m2;
  return [
    a1 * a2 + b1 * c2,
    a1 * b2 + b1 * d2,
    c1 * a2 + d1 * c2,
    c1 * b2 + d1 * d2,
    e1 * a2 + f1 * c2 + e2,
    e1 * b2 + f1 * d2 + f2,
  ];
}

function apply(x, y, m) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

const EPS = 1.2; // max off-axis drift (pt) for a segment to count as H or V
const MIN_LEN = 3; // ignore segments shorter than this (pt)

// Returns { hLines: [{y, x0, x1}], vLines: [{x, y0, y1}] } in PDF user space.
export function extractRulingLines(opList, OPS) {
  const hLines = [];
  const vLines = [];
  if (!opList || !OPS) return { hLines, vLines };

  const { fnArray, argsArray } = opList;
  let ctm = [1, 0, 0, 1, 0, 0];
  const stack = [];

  const addSeg = (p1, p2) => {
    const dx = Math.abs(p1[0] - p2[0]);
    const dy = Math.abs(p1[1] - p2[1]);
    if (dy <= EPS && dx > MIN_LEN) {
      hLines.push({ y: (p1[1] + p2[1]) / 2, x0: Math.min(p1[0], p2[0]), x1: Math.max(p1[0], p2[0]) });
    } else if (dx <= EPS && dy > MIN_LEN) {
      vLines.push({ x: (p1[0] + p2[0]) / 2, y0: Math.min(p1[1], p2[1]), y1: Math.max(p1[1], p2[1]) });
    }
  };

  const addRect = (x, y, w, h, m) => {
    const a = apply(x, y, m);
    const b = apply(x + w, y, m);
    const c = apply(x + w, y + h, m);
    const d = apply(x, y + h, m);
    addSeg(a, b);
    addSeg(b, c);
    addSeg(c, d);
    addSeg(d, a);
  };

  const processPath = (args, m) => {
    const subOps = args[0];
    const coords = args[1];
    if (!subOps || !coords) return;
    let ci = 0;
    let cur = null;
    let start = null; // first point of the current subpath, for closePath
    for (const op of subOps) {
      if (op === OPS.moveTo) {
        cur = apply(coords[ci], coords[ci + 1], m);
        start = cur;
        ci += 2;
      } else if (op === OPS.lineTo) {
        const p = apply(coords[ci], coords[ci + 1], m);
        ci += 2;
        if (cur) addSeg(cur, p);
        cur = p;
      } else if (op === OPS.curveTo) {
        cur = apply(coords[ci + 4], coords[ci + 5], m);
        ci += 6;
      } else if (op === OPS.curveTo2 || op === OPS.curveTo3) {
        cur = apply(coords[ci + 2], coords[ci + 3], m);
        ci += 4;
      } else if (op === OPS.rectangle) {
        addRect(coords[ci], coords[ci + 1], coords[ci + 2], coords[ci + 3], m);
        cur = apply(coords[ci], coords[ci + 1], m);
        start = cur;
        ci += 4;
      } else if (op === OPS.closePath) {
        if (cur && start) addSeg(cur, start);
        cur = start;
      }
    }
  };

  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    if (fn === OPS.save) {
      stack.push(ctm);
    } else if (fn === OPS.restore) {
      ctm = stack.pop() || [1, 0, 0, 1, 0, 0];
    } else if (fn === OPS.transform) {
      ctm = mul(argsArray[i], ctm);
    } else if (fn === OPS.constructPath) {
      processPath(argsArray[i], ctm);
    }
  }

  return { hLines, vLines };
}

// Merge a set of parallel lines whose position is within `tol` into single
// gridlines, unioning their extent. `pos` picks x or y; `lo`/`hi` the extent.
export function clusterLines(lines, pos, lo, hi, tol) {
  if (!lines.length) return [];
  const sorted = [...lines].sort((a, b) => a[pos] - b[pos]);
  const out = [];
  let group = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i][pos] - group[group.length - 1][pos] <= tol) {
      group.push(sorted[i]);
    } else {
      out.push(mergeGroup(group, pos, lo, hi));
      group = [sorted[i]];
    }
  }
  out.push(mergeGroup(group, pos, lo, hi));
  return out;
}

function mergeGroup(group, pos, lo, hi) {
  const p = group.reduce((s, g) => s + g[pos], 0) / group.length;
  return {
    [pos]: p,
    [lo]: Math.min(...group.map((g) => g[lo])),
    [hi]: Math.max(...group.map((g) => g[hi])),
    weight: group.length,
  };
}
