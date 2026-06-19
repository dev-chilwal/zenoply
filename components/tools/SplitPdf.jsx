"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";

// Parse a page-range string like "1-3, 5, 8-10" into a sorted, de-duplicated
// array of 1-based page numbers, validated against the total page count.
export function parseRanges(input, total) {
  const result = new Set();
  const parts = input.split(",").map((s) => s.trim()).filter(Boolean);
  if (!parts.length) return { pages: [], error: "Enter at least one page or range." };
  for (const part of parts) {
    const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (m) {
      let a = parseInt(m[1], 10);
      let b = parseInt(m[2], 10);
      if (a > b) [a, b] = [b, a];
      if (a < 1 || b > total) return { pages: [], error: `Range ${part} is outside 1-${total}.` };
      for (let p = a; p <= b; p++) result.add(p);
    } else if (/^\d+$/.test(part)) {
      const p = parseInt(part, 10);
      if (p < 1 || p > total) return { pages: [], error: `Page ${p} is outside 1-${total}.` };
      result.add(p);
    } else {
      return { pages: [], error: `"${part}" isn't a valid page or range.` };
    }
  }
  return { pages: [...result].sort((a, b) => a - b), error: "" };
}

export default function SplitPdf() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [ranges, setRanges] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFiles = async (incoming) => {
    setError("");
    const f = incoming[0];
    if (!f) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile(f);
      setTotal(doc.getPageCount());
      setRanges(`1-${doc.getPageCount()}`);
    } catch {
      setError("Couldn't read that PDF. It may be corrupted or password-protected.");
      setFile(null);
      setTotal(0);
    } finally {
      setBusy(false);
    }
  };

  const extract = async () => {
    setError("");
    if (!file) return;
    const { pages, error: rangeErr } = parseRanges(ranges, total);
    if (rangeErr) {
      setError(rangeErr);
      return;
    }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, pages.map((p) => p - 1));
      copied.forEach((p) => out.addPage(p));
      const result = await out.save();
      downloadBytes(result, "split.pdf");
    } catch {
      setError("Couldn't extract those pages. The PDF may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose one PDF, then enter the pages to keep." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}, {total} page{total === 1 ? "" : "s"}</p>
          <label className="field">
            <span className="field-label">Pages to extract</span>
            <input
              className="inp mono"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              placeholder="e.g. 1-3, 5, 8-10"
            />
          </label>
          <p className="muted small">Use commas for separate pages and a hyphen for a range, like 1-3, 5, 8-10.</p>
          <div className="btn-row">
            <button className="btn" onClick={extract} disabled={busy}>
              {busy ? "Working…" : "Extract pages"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
