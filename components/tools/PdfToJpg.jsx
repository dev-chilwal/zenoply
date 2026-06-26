"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented } from "@/components/calc/Calc";

// Load pdf.js lazily on the client and point it at a matching worker so the
// static export stays light and nothing runs at build time.
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  return pdfjs;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export default function PdfToJpg() {
  const [file, setFile] = useState(null);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const onFiles = (incoming) => {
    setError("");
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
      const ext = format === "image/png" ? "png" : "jpg";
      const base = file.name.replace(/\.pdf$/i, "") || "page";
      for (let n = 1; n <= pdf.numPages; n++) {
        setProgress(`Rendering page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await canvasToBlob(canvas, format, format === "image/jpeg" ? 0.92 : undefined);
        if (blob) downloadBytes(blob, `${base}-page-${n}.${ext}`, format);
      }
      setProgress(`Done — ${pdf.numPages} image${pdf.numPages === 1 ? "" : "s"} downloaded.`);
    } catch {
      setError("Couldn't convert this PDF. It may be corrupted or password-protected.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF. Each page is saved as a separate image." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          <Segmented ariaLabel="Image format" value={format} onChange={setFormat}
            options={[{ value: "image/jpeg", label: "JPG" }, { value: "image/png", label: "PNG" }]} />
          <label className="field">
            <span className="field-label">Quality: {scale}x resolution</span>
            <input type="range" min={1} max={4} step={1} value={scale} onChange={(e) => setScale(Number(e.target.value))} />
          </label>
          <p className="muted small">Higher resolution gives sharper images and larger files. 2x suits most screens; 3-4x is best for print.</p>
          <div className="btn-row">
            <button className="btn" onClick={convert} disabled={busy}>
              {busy ? "Converting…" : "Convert to images"}
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
