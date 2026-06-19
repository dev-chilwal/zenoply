"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";

async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  return pdfjs;
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

const LEVELS = {
  high: { label: "Smaller file", quality: 0.5, scale: 1.3 },
  medium: { label: "Balanced", quality: 0.7, scale: 1.5 },
  low: { label: "Better quality", quality: 0.85, scale: 2 },
};

export default function CompressPdf() {
  const [file, setFile] = useState(null);
  const [level, setLevel] = useState("medium");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const onFiles = (incoming) => {
    setError("");
    setResult(null);
    const f = incoming[0];
    if (f) setFile(f);
  };

  const compress = async () => {
    setError("");
    setResult(null);
    if (!file) return;
    setBusy(true);
    setProgress("");
    try {
      const { quality, scale } = LEVELS[level];
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await pdfjs.getDocument({ data: bytes }).promise;
      const out = await PDFDocument.create();
      for (let n = 1; n <= src.numPages; n++) {
        setProgress(`Compressing page ${n} of ${src.numPages}…`);
        const page = await src.getPage(n);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await canvasToBlob(canvas, "image/jpeg", quality);
        const jpgBytes = new Uint8Array(await blob.arrayBuffer());
        const img = await out.embedJpg(jpgBytes);
        const pdfPage = out.addPage([viewport.width, viewport.height]);
        pdfPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
      }
      const compressed = await out.save();
      const newSize = compressed.byteLength;
      downloadBytes(compressed, "compressed.pdf");
      setResult({ before: file.size, after: newSize });
      setProgress("");
    } catch {
      setError("Couldn't compress this PDF. It may be corrupted or password-protected.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF. Works best on scanned or image-heavy documents." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          <div className="btn-row">
            {Object.entries(LEVELS).map(([key, v]) => (
              <button key={key} className={"btn" + (level === key ? "" : " btn-ghost")} onClick={() => setLevel(key)}>
                {v.label}
              </button>
            ))}
          </div>
          <p className="muted small">
            Pages are re-rendered as compressed images, so selectable text becomes part of the picture. Best for scans
            and image-heavy PDFs rather than plain text documents.
          </p>
          <div className="btn-row">
            <button className="btn" onClick={compress} disabled={busy}>
              {busy ? "Compressing…" : "Compress PDF"}
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
          {result && (
            <div className="result-list">
              <div className="result-row">
                <span className="result-label">Before</span>
                <code className="result-val">{fmtBytes(result.before)}</code>
              </div>
              <div className="result-row">
                <span className="result-label">After</span>
                <code className="result-val">{fmtBytes(result.after)}</code>
              </div>
              <div className="result-row result-row-hl">
                <span className="result-label">Saved</span>
                <code className="result-val">
                  {result.after < result.before
                    ? `${Math.round((1 - result.after / result.before) * 100)}% smaller`
                    : "No reduction — this PDF was already compact"}
                </code>
              </div>
            </div>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
