// Pure, framework-free table reconstruction from pdf.js text items. Kept in its
// own module (no React) so the heuristics can be unit-tested directly.

export function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Join glyphs left-to-right, inserting a space across gaps the PDF didn't encode.
export function joinGlyphs(glyphs, spaceRef) {
  const sorted = [...glyphs].sort((a, b) => a.x - b.x);
  let text = "";
  let prev = null;
  for (const g of sorted) {
    if (prev) {
      const gap = g.x - (prev.x + prev.w);
      if (gap > spaceRef * 0.5 && !/\s$/.test(text) && !/^\s/.test(g.str)) text += " ";
    }
    text += g.str;
    prev = g;
  }
  return text.replace(/\s+/g, " ").trim();
}

// Reconstruct a table from one page's text items. Returns an array of rows,
// each an array of cell strings. Rows come from clustering by vertical position;
// columns come from vertical whitespace bands that persist across most rows
// (so a full-width title row doesn't collapse the columns).
export function extractPageTable(items) {
  // Drop whitespace-only items: pdf.js emits them (often very wide) to stand in
  // for the gaps *between* cells, which would otherwise fill the coverage map
  // and hide the column separators. Real in-cell spaces live inside word items.
  const glyphs = items
    .filter((it) => it.str && it.str.trim().length)
    .map((it) => ({
      x: it.transform[4],
      y: it.transform[5],
      w: it.width || 0,
      h: it.height || Math.abs(it.transform[3]) || 10,
      str: it.str,
    }));
  if (!glyphs.length) return [];

  const medH = median(glyphs.map((g) => g.h)) || 10;
  const charWidths = glyphs
    .filter((g) => g.w > 0 && g.str.trim().length)
    .map((g) => g.w / g.str.length);
  const medCharW = median(charWidths) || medH * 0.5;

  // Cluster glyphs into rows by y (top of page first).
  glyphs.sort((a, b) => b.y - a.y || a.x - b.x);
  const yTol = medH * 0.5;
  const rows = [];
  for (const g of glyphs) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row.y - g.y) <= yTol) row.glyphs.push(g);
    else rows.push({ y: g.y, glyphs: [g] });
  }

  // Horizontal extent + binning.
  let minX = Infinity;
  let maxX = -Infinity;
  for (const g of glyphs) {
    minX = Math.min(minX, g.x);
    maxX = Math.max(maxX, g.x + g.w);
  }
  const span = maxX - minX;
  if (!(span > 0)) {
    return rows.map((r) => [joinGlyphs(r.glyphs, medCharW)]);
  }
  const binSize = span > 4000 ? span / 4000 : 1;
  const nBins = Math.ceil(span / binSize) + 1;
  const binOf = (x) => Math.min(nBins - 1, Math.max(0, Math.floor((x - minX) / binSize)));

  // Count, per bin, how many rows have any ink there.
  const coverCount = new Uint32Array(nBins);
  for (const r of rows) {
    const covered = new Uint8Array(nBins);
    for (const g of r.glyphs) {
      const a = binOf(g.x);
      const b = binOf(g.x + g.w);
      for (let i = a; i <= b; i++) covered[i] = 1;
    }
    for (let i = 0; i < nBins; i++) if (covered[i]) coverCount[i]++;
  }

  // A bin is a separator if almost no rows cover it. Runs of separator bins
  // wider than one character become the gaps between columns. Allowing a small
  // minimum (>=1 row) means a full-width title or the odd overflowing cell
  // doesn't collapse the columns underneath it.
  const sepMax = Math.max(1, Math.floor(rows.length * 0.2));
  const gapBins = Math.max(1, Math.round((medCharW * 1.2) / binSize));
  const boundaries = [];
  let runStart = -1;
  for (let i = 0; i <= nBins; i++) {
    const isSep = i < nBins && coverCount[i] <= sepMax;
    if (isSep && runStart < 0) runStart = i;
    else if (!isSep && runStart >= 0) {
      const runLen = i - runStart;
      // Ignore the leading/trailing margins — only interior gaps split columns.
      if (runLen >= gapBins && runStart > 0 && i < nBins) {
        boundaries.push(minX + (runStart + runLen / 2) * binSize);
      }
      runStart = -1;
    }
  }

  const colOf = (cx) => {
    let c = 0;
    while (c < boundaries.length && cx >= boundaries[c]) c++;
    return c;
  };
  const nCols = boundaries.length + 1;

  return rows.map((r) => {
    const cells = Array.from({ length: nCols }, () => []);
    for (const g of r.glyphs) cells[colOf(g.x + g.w / 2)].push(g);
    return cells.map((cg) => joinGlyphs(cg, medCharW));
  });
}

// Drop columns and rows that are entirely empty across the whole table.
export function trimTable(rows) {
  if (!rows.length) return [];
  const nCols = Math.max(...rows.map((r) => r.length));
  const keep = [];
  for (let c = 0; c < nCols; c++) {
    keep[c] = rows.some((r) => (r[c] || "").trim() !== "");
  }
  const cols = keep.map((k, i) => (k ? i : -1)).filter((i) => i >= 0);
  return rows
    .map((r) => cols.map((c) => r[c] || ""))
    .filter((r) => r.some((v) => v.trim() !== ""));
}

// Pad every row to the widest row so CSV/XLSX output stays rectangular.
export function rectangular(rows) {
  if (!rows.length) return { rows: [], cols: 0 };
  const cols = Math.max(...rows.map((r) => r.length));
  return {
    rows: rows.map((r) => {
      const copy = r.slice();
      while (copy.length < cols) copy.push("");
      return copy;
    }),
    cols,
  };
}

// RFC 4180 field escaping (matches the JSON-to-CSV tool).
export function escapeCsv(value, delimiter) {
  const s = value == null ? "" : String(value);
  if (s.includes('"') || s.includes(delimiter) || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

export function toCsv(rows, delimiter) {
  return rows.map((r) => r.map((v) => escapeCsv(v, delimiter)).join(delimiter)).join("\r\n");
}
