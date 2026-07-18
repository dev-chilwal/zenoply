"use client";
import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented, Field } from "@/components/calc/Calc";

const POSITIONS = [
  { value: "bottom-center", label: "Bottom centre" },
  { value: "bottom-right", label: "Bottom right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "top-center", label: "Top centre" },
  { value: "top-right", label: "Top right" },
  { value: "top-left", label: "Top left" },
];

const FORMATS = [
  { value: "n", label: "1" },
  { value: "page-n", label: "Page 1" },
  { value: "n-of-total", label: "1 of 10" },
  { value: "page-n-of-total", label: "Page 1 of 10" },
];

function label(format, n, total) {
  if (format === "page-n") return `Page ${n}`;
  if (format === "n-of-total") return `${n} of ${total}`;
  if (format === "page-n-of-total") return `Page ${n} of ${total}`;
  return String(n);
}

// Place the label inside the page box, insetting by `margin` on the two edges
// the position names. x is returned as the left edge, so callers centre or
// right-align by subtracting the measured text width.
function place(position, pageWidth, pageHeight, textWidth, size, margin) {
  const top = position.startsWith("top");
  const y = top ? pageHeight - margin - size : margin;
  let x;
  if (position.endsWith("left")) x = margin;
  else if (position.endsWith("right")) x = pageWidth - margin - textWidth;
  else x = pageWidth / 2 - textWidth / 2;
  return { x, y };
}

export default function AddPageNumbers() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [position, setPosition] = useState("bottom-center");
  const [format, setFormat] = useState("n");
  const [startAt, setStartAt] = useState(1);
  const [size, setSize] = useState(11);
  const [margin, setMargin] = useState(28);
  const [skipFirst, setSkipFirst] = useState(false);
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
    } catch {
      setError("Couldn't read that PDF. It may be corrupted or password-protected.");
      setFile(null);
      setTotal(0);
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const numbered = skipFirst ? pages.length - 1 : pages.length;
      pages.forEach((page, i) => {
        if (skipFirst && i === 0) return;
        const n = startAt + (skipFirst ? i - 1 : i);
        const text = label(format, n, numbered + startAt - 1);
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, size);
        const { x, y } = place(position, width, height, textWidth, size, margin);
        page.drawText(text, { x, y, size, font, color: rgb(0.15, 0.15, 0.15) });
      });
      const result = await doc.save();
      downloadBytes(result, "numbered.pdf");
    } catch {
      setError("Couldn't add page numbers. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  const preview = label(format, startAt, (skipFirst ? total - 1 : total) + startAt - 1);

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF, set the numbering, then download." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}, {total} page{total === 1 ? "" : "s"}</p>

          <Field label="Position">
            <Segmented options={POSITIONS} value={position} onChange={setPosition} ariaLabel="Page number position" />
          </Field>

          <Field label="Format">
            <Segmented options={FORMATS} value={format} onChange={setFormat} ariaLabel="Page number format" />
          </Field>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Start numbering at</span>
              <input
                className="inp"
                type="number"
                min={0}
                value={startAt}
                onChange={(e) => setStartAt(Math.max(0, Number(e.target.value) || 0))}
              />
            </label>
            <label className="field">
              <span className="field-label">Font size: {size}pt</span>
              <input type="range" min={7} max={24} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </label>
            <label className="field">
              <span className="field-label">Margin: {margin}pt</span>
              <input type="range" min={8} max={72} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
            </label>
          </div>

          <label className="check">
            <input type="checkbox" checked={skipFirst} onChange={(e) => setSkipFirst(e.target.checked)} />
            <span>Skip the first page (useful when page 1 is a cover)</span>
          </label>

          <p className="muted small">First numbered page will read &ldquo;{preview}&rdquo;.</p>

          <div className="btn-row">
            <button className="btn" onClick={apply} disabled={busy}>
              {busy ? "Working…" : "Add page numbers and download"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
