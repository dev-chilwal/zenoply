"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { loadPdfjs, renderPage } from "./pdfjs";

const THUMB_WIDTH = 150;

export default function OrganizePdf() {
  // order holds 1-based source page numbers in their new sequence, so the
  // array itself is the reorder instruction we hand to copyPages.
  const [file, setFile] = useState(null);
  const [order, setOrder] = useState([]);
  const [thumbs, setThumbs] = useState({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const onFiles = async (incoming) => {
    setError("");
    const f = incoming[0];
    if (!f) return;
    setBusy(true);
    setProgress("Reading pages…");
    setThumbs({});
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setFile(f);
      setOrder(Array.from({ length: count }, (_, i) => i + 1));

      const pdfjs = await loadPdfjs();
      const src = await pdfjs.getDocument({ data: bytes }).promise;
      for (let n = 1; n <= count; n++) {
        setProgress(`Rendering page ${n} of ${count}…`);
        const page = await src.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: THUMB_WIDTH / base.width });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await renderPage(page, { canvasContext: ctx, viewport });
        const url = canvas.toDataURL("image/jpeg", 0.7);
        setThumbs((t) => ({ ...t, [n]: url }));
      }
      setProgress("");
    } catch (err) {
      setError(
        err?.name === "PdfRenderTimeoutError"
          ? "This PDF is taking too long to render. Try a smaller file."
          : "Couldn't read that PDF. It may be corrupted or password-protected."
      );
      setFile(null);
      setOrder([]);
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  const move = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  };

  const remove = (index) => setOrder(order.filter((_, i) => i !== index));
  const reverse = () => setOrder([...order].reverse());
  const reset = () => setOrder(Array.from({ length: Object.keys(thumbs).length || order.length }, (_, i) => i + 1));

  const apply = async () => {
    setError("");
    if (!file) return;
    if (!order.length) {
      setError("Keep at least one page.");
      return;
    }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, order.map((p) => p - 1));
      copied.forEach((p) => out.addPage(p));
      const result = await out.save();
      downloadBytes(result, "organized.pdf");
    } catch {
      setError("Couldn't rebuild the PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF, rearrange the pages, then download." />
      {file && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}, {order.length} page{order.length === 1 ? "" : "s"} in the new PDF
          </p>
          {progress && <p className="muted small">{progress}</p>}

          <div className="btn-row">
            <button className="btn btn-ghost" onClick={reverse} disabled={busy || order.length < 2}>Reverse order</button>
            <button className="btn btn-ghost" onClick={reset} disabled={busy}>Reset</button>
          </div>

          <div className="page-grid">
            {order.map((pageNum, i) => (
              <div className="page-card" key={`${pageNum}-${i}`}>
                <div className="page-thumb">
                  {thumbs[pageNum]
                    ? <img src={thumbs[pageNum]} alt={`Page ${pageNum}`} />
                    : <span className="muted small">…</span>}
                </div>
                <div className="page-card-bar">
                  <span className="muted small">Page {pageNum}</span>
                  <div className="page-card-actions">
                    <button type="button" aria-label={`Move page ${pageNum} earlier`} onClick={() => move(i, -1)} disabled={i === 0}>&larr;</button>
                    <button type="button" aria-label={`Move page ${pageNum} later`} onClick={() => move(i, 1)} disabled={i === order.length - 1}>&rarr;</button>
                    <button type="button" aria-label={`Remove page ${pageNum}`} onClick={() => remove(i)}>&times;</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="btn-row">
            <button className="btn" onClick={apply} disabled={busy || !order.length}>
              {busy ? "Working…" : "Save reordered PDF"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
