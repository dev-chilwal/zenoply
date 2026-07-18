"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented } from "@/components/calc/Calc";
import { buildDocx, DOCX_MIME } from "./officeExport";
import { loadPdfjs } from "./pdfjs";

function median(nums) {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Turn a page's raw text items into visual lines, sorted top-to-bottom and
// left-to-right. Each line is { y, text }.
function itemsToLines(items) {
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
function linesToParagraphs(lines) {
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

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("paragraphs");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const onFiles = (incoming) => {
    setError("");
    setProgress("");
    const f = incoming[0];
    if (f) setFile(f);
  };

  const convert = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    setProgress("");
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;

      const paragraphs = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        setProgress(`Reading page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const lines = itemsToLines(content.items);
        if (mode === "lines") {
          lines.forEach((l) => l.text && paragraphs.push(l.text));
        } else {
          paragraphs.push(...linesToParagraphs(lines));
        }
        if (n < pdf.numPages) paragraphs.push(""); // page break spacer
      }

      const hasText = paragraphs.some((p) => p.trim());
      if (!hasText) {
        setError(
          "No selectable text was found. This PDF looks scanned or image-based — text can only be extracted from PDFs that contain real text, not scans."
        );
        setProgress("");
        return;
      }

      const blob = await buildDocx(paragraphs);
      const base = file.name.replace(/\.pdf$/i, "") || "document";
      downloadBytes(blob, `${base}.docx`, DOCX_MIME);
      setProgress(`Done — ${base}.docx downloaded.`);
    } catch {
      setError("Couldn't convert this PDF. It may be corrupted or password-protected.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF. Its text is extracted into an editable Word document."
      />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          <Segmented
            ariaLabel="Layout"
            value={mode}
            onChange={setMode}
            options={[
              { value: "paragraphs", label: "Flowing paragraphs" },
              { value: "lines", label: "Keep line breaks" },
            ]}
          />
          <p className="muted small">
            {mode === "paragraphs"
              ? "Lines are merged into paragraphs — best for articles and letters you'll re-edit."
              : "Every line becomes its own line in Word — best for addresses, lists and code."}
          </p>
          <div className="btn-row">
            <button className="btn" onClick={convert} disabled={busy}>
              {busy ? "Converting…" : "Convert to Word"}
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
