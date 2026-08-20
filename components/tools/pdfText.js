// Turning a pdf.js text layer into readable text, kept as a plain module (no
// React) so it can be exercised directly in node — same reasoning as
// rupeesWords.js and pdfMeta.js.
//
// A PDF has no notion of a line or a paragraph. It has glyphs placed at
// coordinates, and pdf.js hands them back as text items in the order the
// content stream draws them, which is not necessarily reading order. Recovering
// text therefore means rebuilding structure from geometry:
//   1. cluster items by their y coordinate into visual lines,
//   2. join each line left-to-right, inserting a space wherever the PDF used a
//      positioning jump instead of an actual space character,
//   3. optionally merge lines into paragraphs, breaking where the vertical gap
//      is noticeably larger than the document's usual line spacing.
//
// Shared by PDF to Word and PDF to Text so both read a page identically.

export function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Turn a page's raw text items into visual lines, sorted top-to-bottom and
// left-to-right. Each line is { y, text }.
export function itemsToLines(items) {
  const glyphs = items
    .filter((it) => it.str && it.str.length)
    .map((it) => ({
      x: it.transform[4],
      y: it.transform[5],
      w: it.width || 0,
      h: it.height || Math.abs(it.transform[3]) || 10,
      str: it.str,
    }));
  if (!glyphs.length) return [];

  const medH = median(glyphs.map((g) => g.h)) || 10;
  const yTol = medH * 0.5;

  // Cluster by y (descending = top of page first).
  glyphs.sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  for (const g of glyphs) {
    const line = lines[lines.length - 1];
    if (line && Math.abs(line.y - g.y) <= yTol) {
      line.glyphs.push(g);
    } else {
      lines.push({ y: g.y, glyphs: [g] });
    }
  }

  // Join each line's glyphs, inserting a space across visual gaps that the PDF
  // didn't already encode as whitespace.
  return lines.map((line) => {
    line.glyphs.sort((a, b) => a.x - b.x);
    let text = "";
    let prev = null;
    for (const g of line.glyphs) {
      if (prev) {
        const gap = g.x - (prev.x + prev.w);
        const needsSpace =
          gap > (prev.h || medH) * 0.25 &&
          !/\s$/.test(text) &&
          !/^\s/.test(g.str);
        if (needsSpace) text += " ";
      }
      text += g.str;
      prev = g;
    }
    return { y: line.y, text: text.replace(/\s+/g, " ").trim() };
  });
}

// Group lines into flowing paragraphs, starting a new one where the vertical
// gap between lines is noticeably larger than the document's usual line spacing.
export function linesToParagraphs(lines) {
  const nonEmpty = lines.filter((l) => l.text);
  if (!nonEmpty.length) return [];
  const gaps = [];
  for (let i = 1; i < nonEmpty.length; i++) {
    gaps.push(nonEmpty[i - 1].y - nonEmpty[i].y);
  }
  const medGap = median(gaps.filter((g) => g > 0)) || 0;
  const paras = [];
  let current = [];
  for (let i = 0; i < nonEmpty.length; i++) {
    if (i > 0) {
      const gap = nonEmpty[i - 1].y - nonEmpty[i].y;
      if (medGap > 0 && gap > medGap * 1.6) {
        paras.push(current.join(" "));
        current = [];
      }
    }
    current.push(nonEmpty[i].text);
  }
  if (current.length) paras.push(current.join(" "));
  return paras;
}

// One page's text items to a list of blocks, in the requested layout.
// mode "paragraphs" merges wrapped lines; mode "lines" keeps every visual line.
export function pageBlocks(items, mode) {
  const lines = itemsToLines(items);
  if (mode === "lines") return lines.map((l) => l.text).filter(Boolean);
  return linesToParagraphs(lines);
}

// Join the per-page block lists into the final text body. Pages are separated
// by a blank line, and an optional marker names each page. Kept here rather
// than in the component so the joining rules can be exercised in node.
//
// pages is [{ n, blocks }] in output order. The collapse of runs of three or
// more newlines is what stops a page that yielded nothing from leaving a hole:
// its marker (or the page spacer around it) would otherwise stack blank lines.
export function assembleText(pages, markPages) {
  const chunks = [];
  for (let i = 0; i < pages.length; i++) {
    if (markPages) chunks.push(`--- Page ${pages[i].n} ---`);
    chunks.push(...pages[i].blocks);
    if (i < pages.length - 1) chunks.push("");
  }
  return chunks.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
