// Pure, framework-free multi-table reconstruction from pdf.js text + ruling
// lines. Kept out of the React component so the heuristics can be unit-tested.
//
// Pipeline (see extractTables):
//   1. map glyphs per page, strip repeated headers/footers
//   2. per page, find ruled table regions (from drawn lines) and build exact
//      cells; anything outside a ruled region falls back to text-geometry blocks
//   3. merge tables that continue across a page break (same column structure)
//   4. keep real tables (>=2 cols, >=2 rows), emit one grid each
//
// Ruling lines give exact cell edges, which is the only reliable way to handle
// right-aligned numbers, tight columns and wrapped (multi-line) cells together.

import { clusterLines } from "./pdfLines.js";

export function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function pageGlyphs(items) {
  return items
    .filter((it) => it.str && it.str.trim().length)
    .map((it) => ({
      x: it.transform[4],
      y: it.transform[5],
      w: it.width || 0,
      h: it.height || Math.abs(it.transform[3]) || 10,
      str: it.str,
    }));
}

// Cluster glyphs into visual lines (top of page first).
function clusterRows(glyphs, yTol) {
  const gs = [...glyphs].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows = [];
  for (const g of gs) {
    const r = rows[rows.length - 1];
    if (r && Math.abs(r.y - g.y) <= yTol) {
      r.glyphs.push(g);
      r.y = (r.y * (r.glyphs.length - 1) + g.y) / r.glyphs.length;
    } else {
      rows.push({ y: g.y, glyphs: [g] });
    }
  }
  return rows;
}

// Join glyphs left-to-right, inserting a space across gaps the PDF didn't encode.
function joinGlyphs(glyphs, spaceRef) {
  // top-to-bottom then left-to-right (handles wrapped lines inside one cell)
  const sorted = [...glyphs].sort((a, b) =>
    Math.abs(a.y - b.y) > spaceRef ? b.y - a.y : a.x - b.x
  );
  let text = "";
  let prev = null;
  for (const g of sorted) {
    if (prev) {
      const sameLine = Math.abs(g.y - prev.y) <= spaceRef;
      if (!sameLine) {
        if (!/\s$/.test(text)) text += " ";
      } else {
        const gap = g.x - (prev.x + prev.w);
        if (gap > spaceRef * 0.5 && !/\s$/.test(text) && !/^\s/.test(g.str)) text += " ";
      }
    }
    text += g.str;
    prev = g;
  }
  return text.replace(/\s+/g, " ").trim();
}

function glyphStats(glyphs) {
  const medH = median(glyphs.map((g) => g.h)) || 10;
  const cw = glyphs
    .filter((g) => g.w > 0 && g.str.trim().length)
    .map((g) => g.w / g.str.length);
  const medCharW = median(cw) || medH * 0.5;
  return { medH, medCharW };
}

// ---- header / footer stripping --------------------------------------------

function chromeSignature(row) {
  return row.glyphs
    .map((g) => g.str)
    .join(" ")
    .toLowerCase()
    .replace(/\d+/g, "#")
    .replace(/\s+/g, " ")
    .trim();
}

// Remove running heads/footers: text rows in the top/bottom margin band that
// repeat across most pages. Operates on leftover rows only (rows already inside
// a detected table are never candidates), so a repeated *table header* is safe.
// `pageData[i]` = { leftoverRows, height }. Returns filtered leftover rows.
function stripChromeFromLeftover(pageData) {
  const pages = pageData.length;
  const leftover = pageData.map((pd) => pd.leftoverRows);
  if (pages < 2) return leftover;

  const candidates = pageData.map((pd) => {
    const rows = pd.leftoverRows;
    if (!rows.length) return [];
    const ys = rows.map((r) => r.y);
    const top = pd.height || Math.max(...ys);
    const bot = pd.height ? 0 : Math.min(...ys);
    const range = (pd.height || Math.max(...ys) - Math.min(...ys)) || 1;
    const hiCut = top - range * 0.12;
    const loCut = bot + range * 0.12;
    return rows.filter((r) => r.y >= hiCut || r.y <= loCut);
  });

  const tally = new Map();
  for (const cand of candidates) {
    const seen = new Set();
    for (const row of cand) {
      const sig = chromeSignature(row);
      if (!sig || seen.has(sig)) continue;
      seen.add(sig);
      tally.set(sig, (tally.get(sig) || 0) + 1);
    }
  }
  const threshold = Math.max(2, Math.ceil(pages / 2));
  const chrome = new Set([...tally.entries()].filter(([, n]) => n >= threshold).map(([s]) => s));
  if (!chrome.size) return leftover;
  return leftover.map((rows, i) => {
    const drop = new Set(candidates[i].filter((row) => chrome.has(chromeSignature(row))));
    return rows.filter((row) => !drop.has(row));
  });
}

// ---- column detection from text (fallback) --------------------------------

// Vertical whitespace bands uncovered in most rows become column boundaries.
function columnsFromText(rows, medCharW) {
  const glyphs = rows.flatMap((r) => r.glyphs);
  if (!glyphs.length) return [];
  let minX = Infinity;
  let maxX = -Infinity;
  for (const g of glyphs) {
    minX = Math.min(minX, g.x);
    maxX = Math.max(maxX, g.x + g.w);
  }
  const span = maxX - minX;
  if (!(span > 0)) return [];
  const binSize = span > 4000 ? span / 4000 : 1;
  const nBins = Math.ceil(span / binSize) + 1;
  const binOf = (x) => Math.min(nBins - 1, Math.max(0, Math.floor((x - minX) / binSize)));

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
  const sepMax = Math.max(1, Math.floor(rows.length * 0.2));
  const gapBins = Math.max(1, Math.round((medCharW * 1.2) / binSize));
  const bounds = [];
  let runStart = -1;
  for (let i = 0; i <= nBins; i++) {
    const isSep = i < nBins && coverCount[i] <= sepMax;
    if (isSep && runStart < 0) runStart = i;
    else if (!isSep && runStart >= 0) {
      const runLen = i - runStart;
      if (runLen >= gapBins && runStart > 0 && i < nBins) {
        bounds.push(minX + (runStart + runLen / 2) * binSize);
      }
      runStart = -1;
    }
  }
  return bounds; // interior boundary x's
}

// ---- grid assembly ---------------------------------------------------------

// colEdges: full list of column edge x's (length nCols+1). rowBands: list of
// {yTop, yBot} spans, top-to-bottom. Glyphs are dropped into cells by centre.
function assembleGrid(glyphs, colEdges, rowBands, medCharW, medH) {
  const nCols = colEdges.length - 1;
  const colOf = (cx) => {
    for (let c = 0; c < nCols; c++) {
      if (cx >= colEdges[c] && cx <= colEdges[c + 1]) return c;
    }
    return cx < colEdges[0] ? 0 : nCols - 1;
  };
  return rowBands.map((band) => {
    const cells = Array.from({ length: nCols }, () => []);
    for (const g of glyphs) {
      const cy = g.y;
      if (cy <= band.yTop && cy >= band.yBot) {
        cells[colOf(g.x + g.w / 2)].push(g);
      }
    }
    return cells.map((cg) => joinGlyphs(cg, medH * 0.6));
  });
}

// Row bands from clustered text rows (each row -> a band around its baseline).
function rowBandsFromText(rows, medH) {
  return rows.map((r, i) => {
    const yTop = i === 0 ? r.y + medH : (rows[i - 1].y + r.y) / 2;
    const yBot = i === rows.length - 1 ? r.y - medH : (r.y + rows[i + 1].y) / 2;
    return { yTop, yBot };
  });
}

// Row bands from horizontal gridlines (consecutive lines bound a row).
function rowBandsFromLines(hys) {
  const bands = [];
  for (let i = 0; i < hys.length - 1; i++) bands.push({ yTop: hys[i], yBot: hys[i + 1] });
  return bands;
}

// ---- ruled region detection ------------------------------------------------

function overlap(a0, a1, b0, b1) {
  return Math.max(0, Math.min(a1, b1) - Math.max(a0, b0));
}

// Group horizontal rules into table regions: same x-extent, stacked in y,
// split where a big vertical gap separates two tables.
function ruledRegions(hClusters, vClusters, medH) {
  if (hClusters.length < 2) return [];
  const hs = [...hClusters].sort((a, b) => b.y - a.y); // top first
  const gaps = [];
  for (let i = 1; i < hs.length; i++) gaps.push(hs[i - 1].y - hs[i].y);
  const maxGap = Math.max((median(gaps.filter((g) => g > 1)) || medH) * 3.5, medH * 6);

  const regions = [];
  for (const h of hs) {
    let placed = null;
    for (const reg of regions) {
      const ov = overlap(h.x0, h.x1, reg.x0, reg.x1);
      const minW = Math.min(h.x1 - h.x0, reg.x1 - reg.x0);
      if (ov > minW * 0.5 && reg.yBot - h.y <= maxGap) {
        placed = reg;
        break;
      }
    }
    if (placed) {
      placed.hys.push(h.y);
      placed.x0 = Math.min(placed.x0, h.x0);
      placed.x1 = Math.max(placed.x1, h.x1);
      placed.yBot = Math.min(placed.yBot, h.y);
      placed.yTop = Math.max(placed.yTop, h.y);
    } else {
      regions.push({ x0: h.x0, x1: h.x1, yTop: h.y, yBot: h.y, hys: [h.y] });
    }
  }

  // Attach vertical rules that fall inside each region.
  for (const reg of regions) {
    reg.vxs = vClusters
      .filter(
        (v) =>
          v.x >= reg.x0 - 2 &&
          v.x <= reg.x1 + 2 &&
          overlap(v.y0, v.y1, reg.yBot, reg.yTop) > (reg.yTop - reg.yBot) * 0.3
      )
      .map((v) => v.x)
      .sort((a, b) => a - b);
    reg.hys.sort((a, b) => b - a); // top first
  }
  // A region needs at least a top and bottom rule to bound rows.
  return regions.filter((r) => r.hys.length >= 2);
}

// Build a table grid for one ruled region, using line edges where available and
// falling back to text geometry for whichever axis the lines don't define.
function tableFromRegion(reg, glyphs, medCharW, medH) {
  const inside = glyphs.filter(
    (g) => g.x + g.w / 2 >= reg.x0 - 2 && g.x + g.w / 2 <= reg.x1 + 2 && g.y <= reg.yTop + medH && g.y >= reg.yBot - medH
  );
  if (!inside.length) return null;

  // Columns: prefer vertical rules (>=2 cols), else text.
  let colEdges;
  if (reg.vxs.length >= 3) {
    colEdges = dedupeSorted(reg.vxs, medCharW * 0.6);
    if (colEdges[0] > reg.x0 + 1) colEdges.unshift(reg.x0);
    if (colEdges[colEdges.length - 1] < reg.x1 - 1) colEdges.push(reg.x1);
  } else {
    const rows = clusterRows(inside, medH * 0.5);
    const bounds = columnsFromText(rows, medCharW);
    colEdges = [reg.x0 - 1, ...bounds, reg.x1 + 1];
  }
  if (colEdges.length < 3) return null; // need >=2 columns

  // Rows: prefer horizontal rules (>=3 => >=2 bands), else text.
  let rowBands;
  if (reg.hys.length >= 3) {
    rowBands = rowBandsFromLines(reg.hys);
  } else {
    const rows = clusterRows(inside, medH * 0.5);
    rowBands = rowBandsFromText(rows, medH);
  }

  const grid = assembleGrid(inside, colEdges, rowBands, medCharW, medH);
  return { grid, colEdges, yTop: reg.yTop, yBot: reg.yBot };
}

function dedupeSorted(xs, tol) {
  const out = [];
  for (const x of [...xs].sort((a, b) => a - b)) {
    if (!out.length || x - out[out.length - 1] > tol) out.push(x);
  }
  return out;
}

// ---- unruled (text-only) tables -------------------------------------------

// Split rows into blocks separated by unusually large vertical gaps.
function segmentBlocks(rows, medH) {
  if (!rows.length) return [];
  const gaps = [];
  for (let i = 1; i < rows.length; i++) gaps.push(rows[i - 1].y - rows[i].y);
  const medGap = median(gaps.filter((g) => g > 0)) || medH;
  const blocks = [];
  let cur = [rows[0]];
  for (let i = 1; i < rows.length; i++) {
    const gap = rows[i - 1].y - rows[i].y;
    if (gap > medGap * 2.4) {
      blocks.push(cur);
      cur = [];
    }
    cur.push(rows[i]);
  }
  if (cur.length) blocks.push(cur);
  return blocks;
}

// Merge a row into the previous one when it looks like a wrapped continuation:
// it fills only a subset of columns and sits an unusually short gap below.
function mergeWraps(grid, rowYs, medGap) {
  const out = [];
  const outY = [];
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    const filled = row.filter((c) => c.trim() !== "").length;
    const gapAbove = i > 0 ? outY[outY.length - 1] - rowYs[i] : Infinity;
    if (out.length && filled > 0 && filled < row.length && gapAbove < medGap * 0.72) {
      const prev = out[out.length - 1];
      for (let c = 0; c < row.length; c++) {
        if (row[c].trim()) prev[c] = (prev[c] ? prev[c] + " " : "") + row[c];
      }
    } else {
      out.push(row.slice());
      outY.push(rowYs[i]);
    }
  }
  return out;
}

function tableFromBlock(block, medCharW, medH) {
  const bounds = columnsFromText(block, medCharW);
  if (!bounds.length) return null; // single column -> prose, not a table
  let minX = Infinity;
  let maxX = -Infinity;
  for (const r of block) for (const g of r.glyphs) {
    minX = Math.min(minX, g.x);
    maxX = Math.max(maxX, g.x + g.w);
  }
  const colEdges = [minX - 1, ...bounds, maxX + 1];
  const glyphs = block.flatMap((r) => r.glyphs);
  const rowBands = rowBandsFromText(block, medH);
  let grid = assembleGrid(glyphs, colEdges, rowBands, medCharW, medH);
  const gaps = [];
  for (let i = 1; i < block.length; i++) gaps.push(block[i - 1].y - block[i].y);
  const medGap = median(gaps.filter((g) => g > 0)) || medH;
  grid = mergeWraps(grid, block.map((r) => r.y), medGap);
  return { grid, colEdges, yTop: block[0].y, yBot: block[block.length - 1].y };
}

// ---- cross-page continuation ----------------------------------------------

function sameStructure(a, b, tol) {
  if (a.colEdges.length !== b.colEdges.length) return false;
  for (let i = 0; i < a.colEdges.length; i++) {
    if (Math.abs(a.colEdges[i] - b.colEdges[i]) > tol) return false;
  }
  return true;
}

function rowsEqual(r1, r2) {
  if (!r1 || !r2 || r1.length !== r2.length) return false;
  return r1.every((c, i) => c.trim() === r2[i].trim());
}

function mergeContinuations(tables, medCharW) {
  const out = [];
  for (const t of tables) {
    const prev = out[out.length - 1];
    if (
      prev &&
      t.page === prev.page + 1 &&
      prev.lastOnPage &&
      t.firstOnPage &&
      sameStructure(prev, t, Math.max(12, medCharW * 3))
    ) {
      const rows = t.grid.slice();
      if (rowsEqual(rows[0], prev.grid[0])) rows.shift(); // drop repeated header
      prev.grid.push(...rows);
      continue;
    }
    out.push(t);
  }
  return out;
}

// ---- trimming --------------------------------------------------------------

function trimGrid(grid) {
  if (!grid.length) return [];
  const nCols = Math.max(...grid.map((r) => r.length));
  const keep = [];
  for (let c = 0; c < nCols; c++) keep[c] = grid.some((r) => (r[c] || "").trim() !== "");
  const cols = keep.map((k, i) => (k ? i : -1)).filter((i) => i >= 0);
  return grid
    .map((r) => cols.map((c) => (r[c] || "").trim()))
    .filter((r) => r.some((v) => v !== ""));
}

// ---- public API ------------------------------------------------------------

// pages: [{ items, hLines, vLines, height? }]. Returns [{ rows: string[][], page }].
export function extractTables(pages) {
  // Pass 1: per page, detect ruled tables and collect the leftover glyph rows.
  const pageData = pages.map((p) => {
    const glyphs = pageGlyphs(p.items || []);
    if (!glyphs.length) return { ruled: [], leftoverRows: [], medH: 10, medCharW: 5, height: p.height || null };
    const { medH, medCharW } = glyphStats(glyphs);
    const hC = clusterLines(p.hLines || [], "y", "x0", "x1", 3);
    const vC = clusterLines(p.vLines || [], "x", "y0", "y1", 3);
    const regions = ruledRegions(hC, vC, medH);

    const ruled = [];
    const usedBoxes = [];
    for (const reg of regions) {
      const t = tableFromRegion(reg, glyphs, medCharW, medH);
      if (t) {
        ruled.push(t);
        usedBoxes.push(reg);
      }
    }
    const inRuled = (g) =>
      usedBoxes.some(
        (b) =>
          g.x + g.w / 2 >= b.x0 - 2 &&
          g.x + g.w / 2 <= b.x1 + 2 &&
          g.y <= b.yTop + medH &&
          g.y >= b.yBot - medH
      );
    const leftover = glyphs.filter((g) => !inRuled(g));
    const leftoverRows = clusterRows(leftover, medH * 0.5);
    return { ruled, leftoverRows, medH, medCharW, height: p.height || null };
  });

  // Pass 2: strip running heads/footers from the leftover (never from tables).
  const strippedLeftover = stripChromeFromLeftover(pageData);

  // Pass 3: assemble per-page tables (ruled + text blocks from stripped leftover).
  const tables = [];
  pageData.forEach((pd, pi) => {
    const pageTables = [...pd.ruled];
    for (const block of segmentBlocks(strippedLeftover[pi], pd.medH)) {
      if (block.length < 2) continue;
      const t = tableFromBlock(block, pd.medCharW, pd.medH);
      if (t) pageTables.push(t);
    }
    pageTables.sort((a, b) => b.yTop - a.yTop);
    pageTables.forEach((t, i) => {
      tables.push({
        ...t,
        page: pi + 1,
        firstOnPage: i === 0,
        lastOnPage: i === pageTables.length - 1,
      });
    });
  });

  // Pass 4: merge cross-page continuations, trim, keep only real tables.
  const merged = mergeContinuations(tables, 6);
  return merged
    .map((t) => ({ rows: trimGrid(t.grid), page: t.page }))
    .filter((t) => t.rows.length >= 2 && t.rows[0].length >= 2);
}

// Pad every row of a grid to the widest row so CSV/XLSX stay rectangular.
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
