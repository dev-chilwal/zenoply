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
  // Infer columns only from multi-cell data rows. Single-run rows (section
  // titles, wrapped notes like "Please check all entries…") span across real
  // column gaps and would otherwise mask them, merging adjacent columns.
  const dataRows = rows.filter((r) => r.glyphs.length >= 2);
  if (dataRows.length < 2) return [];
  const glyphs = dataRows.flatMap((r) => r.glyphs);
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
  for (const r of dataRows) {
    const covered = new Uint8Array(nBins);
    for (const g of r.glyphs) {
      const a = binOf(g.x);
      const b = binOf(g.x + g.w);
      for (let i = a; i <= b; i++) covered[i] = 1;
    }
    for (let i = 0; i < nBins; i++) if (covered[i]) coverCount[i]++;
  }
  // A separator bin is one almost no row covers. Keep this low so a sparsely
  // populated but real column (e.g. a Credit column with only a few deposits)
  // isn't mistaken for whitespace and merged into its neighbour; still tolerates
  // a handful of full-width rows (titles) crossing a genuine gap.
  const sepMax = Math.max(1, Math.floor(dataRows.length * 0.06));
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

  // Attach vertical rules (full clusters) that fall inside each region.
  for (const reg of regions) {
    reg.vLines = vClusters.filter(
      (v) =>
        v.x >= reg.x0 - 2 &&
        v.x <= reg.x1 + 2 &&
        overlap(v.y0, v.y1, reg.yBot, reg.yTop) > (reg.yTop - reg.yBot) * 0.3
    );
    reg.hys.sort((a, b) => b - a); // top first
  }
  // A region needs at least a top and bottom rule to bound rows.
  return regions.filter((r) => r.hys.length >= 2);
}

// A ruled region can span several logically-distinct tables stacked under a run
// of full-width rules (e.g. a summary box, then an interest table, then the
// start of a transaction list). Segment it by vertical gaps and build a table
// per segment, detecting columns per segment so different shapes stay separate.
function tablesFromRegion(reg, glyphs, medCharW, medH) {
  const inside = glyphs.filter(
    (g) => g.x + g.w / 2 >= reg.x0 - 2 && g.x + g.w / 2 <= reg.x1 + 2 && g.y <= reg.yTop + medH && g.y >= reg.yBot - medH
  );
  if (!inside.length) return [];
  const rows = clusterRows(inside, medH * 0.5);
  const out = [];
  for (const block of segmentBlocks(rows, medH)) {
    const t = buildBlockTable(block, reg.vLines, reg.hys, medCharW, medH);
    if (t) out.push(t);
  }
  return out;
}

// Build one table from a run of consecutive rows. Columns come from interior
// vertical rules that span the block, else from text whitespace; rows come from
// horizontal rules that fall inside the block, else from text (with wrap merge).
// Leading/trailing single-cell rows (section titles, notes) are dropped.
function buildBlockTable(block, vLines, hys, medCharW, medH) {
  if (block.length < 2) return null;
  const bg = block.flatMap((r) => r.glyphs);
  let minX = Infinity;
  let maxX = -Infinity;
  for (const g of bg) {
    minX = Math.min(minX, g.x);
    maxX = Math.max(maxX, g.x + g.w);
  }
  const yTop = block[0].y;
  const yBot = block[block.length - 1].y;

  const interior = (vLines || []).filter(
    (v) => v.x > minX + medCharW && v.x < maxX - medCharW && overlap(v.y0, v.y1, yBot, yTop) > (yTop - yBot) * 0.5
  );
  let colEdges;
  if (interior.length >= 1) {
    colEdges = dedupeSorted([minX - 1, ...interior.map((v) => v.x), maxX + 1], medCharW * 0.6);
  } else {
    const bounds = columnsFromText(block, medCharW);
    colEdges = [minX - 1, ...bounds, maxX + 1];
  }
  if (colEdges.length < 3) return null; // need >=2 columns

  // Include the top/bottom border rules: they sit up to a row-height beyond the
  // first/last text baseline, so the margin must be the row pitch, not medH —
  // otherwise the border is dropped and the row bands shift, losing a row.
  const blockGaps = [];
  for (let i = 1; i < block.length; i++) blockGaps.push(block[i - 1].y - block[i].y);
  const band = Math.max(medH * 1.5, median(blockGaps.filter((g) => g > 0)) || medH);
  const hInBlock = (hys || []).filter((y) => y <= yTop + band && y >= yBot - band).sort((a, b) => b - a);
  const t = {
    colEdges,
    yTop,
    yBot,
    xRange: [minX, maxX],
    glyphs: bg,
    rows: block,
    hInBlock,
    // Trust horizontal rules for rows only in a true grid (interior vertical
    // rules too). Otherwise the rules are section boxes, not per-row lines, so
    // use text rows + wrap merge — safer for statements and invoices.
    lineRows: interior.length >= 1 && hInBlock.length >= 3,
    medCharW,
    medH,
  };
  const grid = regrid(t, colEdges);
  if (grid.length < 2) return null;
  t.grid = grid;
  return t;
}

// (Re)build a table's grid for a given set of column edges. Used both for the
// initial grid and to re-grid a page with a chain's unified columns.
function regrid(t, colEdges) {
  let grid;
  if (t.lineRows) {
    grid = assembleGrid(t.glyphs, colEdges, rowBandsFromLines(t.hInBlock), t.medCharW, t.medH);
  } else {
    grid = assembleGrid(t.glyphs, colEdges, rowBandsFromText(t.rows, t.medH), t.medCharW, t.medH);
    const gaps = [];
    for (let i = 1; i < t.rows.length; i++) gaps.push(t.rows[i - 1].y - t.rows[i].y);
    grid = mergeWraps(grid, t.rows.map((r) => r.y), median(gaps.filter((g) => g > 0)) || t.medH);
  }
  return stripEdgeSingleCellRows(grid);
}

// Drop leading/trailing rows that fill only one column (section titles, notes).
function stripEdgeSingleCellRows(grid) {
  const filled = (r) => r.filter((c) => c.trim() !== "").length;
  let a = 0;
  let b = grid.length;
  while (a < b && filled(grid[a]) <= 1) a++;
  while (b > a && filled(grid[b - 1]) <= 1) b--;
  return grid.slice(a, b);
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
  const threshold = Math.max(medGap * 1.9, medH * 2.2);
  const blocks = [];
  let cur = [rows[0]];
  for (let i = 1; i < rows.length; i++) {
    const gap = rows[i - 1].y - rows[i].y;
    if (gap > threshold) {
      blocks.push(cur);
      cur = [];
    }
    cur.push(rows[i]);
  }
  if (cur.length) blocks.push(cur);
  return blocks;
}

// Merge a row into the previous one when it looks like a wrapped continuation:
// either its key (first) column is empty — the classic statement/invoice case
// where a description spills onto the next line with no new date — or it fills
// only a subset of columns at an unusually short gap. Never merge across a gap
// large enough to be a real row break.
function mergeWraps(grid, rowYs, medGap) {
  const out = [];
  const outY = [];
  for (let i = 0; i < grid.length; i++) {
    const row = grid[i];
    const filled = row.filter((c) => c.trim() !== "").length;
    const gapAbove = i > 0 ? outY[outY.length - 1] - rowYs[i] : Infinity;
    const keyEmpty = row[0] !== undefined && row[0].trim() === "";
    const isWrap =
      out.length &&
      filled > 0 &&
      filled < row.length &&
      gapAbove < medGap * 1.6 &&
      (keyEmpty || gapAbove < medGap * 0.72);
    if (isWrap) {
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

// Text-only block table (leftover regions with no ruling lines).
function tableFromBlock(block, medCharW, medH) {
  return buildBlockTable(block, [], [], medCharW, medH);
}

// ---- cross-page continuation ----------------------------------------------

function xOverlapFrac(a, b) {
  const ov = overlap(a.xRange[0], a.xRange[1], b.xRange[0], b.xRange[1]);
  const minW = Math.min(a.xRange[1] - a.xRange[0], b.xRange[1] - b.xRange[0]) || 1;
  return ov / minW;
}

// Two tables can be the same table across a page break only if their columns
// line up: near-equal column count and each interior boundary of the smaller
// has a match in the larger. Stops an unrelated footer/box that merely overlaps
// horizontally from being appended to a real table.
function columnsCompatible(a, b, tol) {
  const ia = a.colEdges.slice(1, -1);
  const ib = b.colEdges.slice(1, -1);
  if (Math.abs(ia.length - ib.length) > 1) return false;
  const [short, long] = ia.length <= ib.length ? [ia, ib] : [ib, ia];
  return short.every((x) => long.some((y) => Math.abs(x - y) <= tol));
}

function rowsEqual(r1, r2) {
  if (!r1 || !r2 || r1.length !== r2.length) return false;
  return r1.every((c, i) => c.trim() === r2[i].trim());
}

// Group tables that continue across page breaks into chains: consecutive pages,
// bottom-of-page to top-of-next, and overlapping x-extent — NOT requiring the
// detected column count to match, since an empty column on one page can change
// how many columns text detection finds.
function chainContinuations(tables) {
  const chains = [];
  for (const t of tables) {
    const chain = chains[chains.length - 1];
    const prev = chain ? chain[chain.length - 1] : null;
    if (
      prev &&
      t.page === prev.page + 1 &&
      prev.lastOnPage &&
      t.firstOnPage &&
      xOverlapFrac(prev, t) > 0.6 &&
      columnsCompatible(prev, t, Math.max(15, prev.medCharW * 4))
    ) {
      chain.push(t);
    } else {
      chains.push([t]);
    }
  }
  return chains;
}

// Collapse each chain into one table. For multi-page chains, re-detect columns
// from every page's text pooled together so the whole table shares one column
// structure, then re-grid each page and concatenate, dropping repeated headers.
function mergeContinuations(tables) {
  return chainContinuations(tables).map((chain) => {
    if (chain.length === 1) return { grid: chain[0].grid, page: chain[0].page };

    const pooledRows = chain.flatMap((t) => t.rows);
    let minX = Infinity;
    let maxX = -Infinity;
    for (const t of chain) {
      minX = Math.min(minX, t.xRange[0]);
      maxX = Math.max(maxX, t.xRange[1]);
    }
    const bounds = columnsFromText(pooledRows, chain[0].medCharW);
    const unified = [minX - 1, ...bounds, maxX + 1];

    let grid = [];
    let header = null;
    for (const t of chain) {
      const g = regrid(t, unified);
      let rows = g;
      if (header && rows.length && rowsEqual(rows[0], header)) rows = rows.slice(1);
      if (!header && rows.length) header = rows[0];
      grid.push(...rows);
    }
    return { grid, page: chain[0].page };
  });
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
      const ts = tablesFromRegion(reg, glyphs, medCharW, medH);
      if (ts.length) {
        ruled.push(...ts);
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
  const merged = mergeContinuations(tables);
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
