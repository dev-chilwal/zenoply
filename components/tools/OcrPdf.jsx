"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { renderPage, loadPdfjs } from "./pdfjs";
import { Field, Segmented } from "@/components/calc/Calc";
import { createOcrWorker, OCR_LANGS } from "./tesseract";

// Render pages at ~144 DPI (72 * 2). Enough detail for OCR without ballooning
// the embedded image in the output PDF.
const RENDER_SCALE = 2;

export default function OcrPdf() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // A single worker processes every page sequentially — one worker is inherently
  // bounded, so there's no risk of the resource-exhaustion crash that spawning a
  // worker per page would cause. Held in a ref only so unmount can terminate it.
  const workerRef = useRef(null);
  useEffect(() => () => { workerRef.current?.terminate(); workerRef.current = null; }, []);

  const onFiles = async (incoming) => {
    setError("");
    setResult(null);
    const f = incoming[0];
    if (!f) return;
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile(f);
      setTotal(doc.getPageCount());
    } catch {
      setError("Couldn't read that PDF. It may be corrupted or password-protected.");
      setFile(null);
      setTotal(0);
    }
  };

  const run = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setResult(null);
    setPct(0);
    setStatus("Loading OCR engine…");
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await pdfjs.getDocument({ data: bytes }).promise;
      const pageCount = src.numPages;

      workerRef.current = await createOcrWorker(lang);
      const out = await PDFDocument.create();

      for (let n = 1; n <= pageCount; n++) {
        setStatus(`Reading page ${n} of ${pageCount}…`);
        const page = await src.getPage(n);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await renderPage(page, { canvasContext: ctx, viewport });

        // Tesseract returns a one-page PDF: the page image with an invisible,
        // selectable text layer positioned over it.
        const { data } = await workerRef.current.recognize(canvas, {}, { pdf: true });
        const pageDoc = await PDFDocument.load(new Uint8Array(data.pdf));
        const [copied] = await out.copyPages(pageDoc, [0]);
        out.addPage(copied);

        setPct(Math.round((n / pageCount) * 100));
      }

      await workerRef.current.terminate();
      workerRef.current = null;

      const result = await out.save();
      downloadBytes(result, file.name.replace(/\.pdf$/i, "") + "-searchable.pdf");
      setResult({ pages: pageCount, size: result.byteLength });
      setStatus("");
    } catch (err) {
      await workerRef.current?.terminate();
      workerRef.current = null;
      setError(
        err?.name === "PdfRenderTimeoutError"
          ? "A page took too long to render. Try a smaller PDF."
          : "Couldn't make this PDF searchable. It may be corrupted or password-protected."
      );
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a scanned PDF. OCR runs in your browser — nothing is uploaded." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}, {total} page{total === 1 ? "" : "s"}</p>

          <Field label="Language">
            <Segmented options={OCR_LANGS} value={lang} onChange={setLang} ariaLabel="OCR language" />
          </Field>
          <p className="muted small">Pick the language(s) in the document. The first run downloads the OCR engine and language data (a few MB), then it is cached. Larger documents take a while — each page is read in turn.</p>

          <div className="btn-row">
            <button className="btn" onClick={run} disabled={busy}>
              {busy ? "Working…" : "Make searchable PDF"}
            </button>
          </div>

          {busy && (
            <div className="ocr-progress" role="status" aria-live="polite">
              <div className="ocr-bar"><div className="ocr-bar-fill" style={{ width: `${pct}%` }} /></div>
              <span className="muted small">{status}{pct ? ` ${pct}%` : ""}</span>
            </div>
          )}

          {result && (
            <p className="muted small">
              Done — {result.pages} page{result.pages === 1 ? "" : "s"} made searchable, {fmtBytes(result.size)}. The text layer is invisible; the page still looks like your scan, but the text is now selectable and searchable.
            </p>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
