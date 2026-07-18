"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { loadPdfjs, renderPage } from "./pdfjs";

// Detection is deliberately conservative: scanned pages carry speckle and edge
// artifacts, so a page is only "blank" when almost nothing survives both the
// border crop and the ink threshold.
const DETECT_SCALE = 0.5;   // render small — we only need ink/no-ink, not detail
const INK_LEVEL = 245;      // channel value at or below this counts as ink
const BORDER_CROP = 0.02;   // ignore outer 2%: scan edges and punch holes

// Sensitivity is the share of inked pixels a page may have and still count as
// blank. Scans are never mathematically empty, hence the non-zero floor.
const LEVELS = {
  strict: { value: 0.0002, label: "Strict", hint: "Only near-perfectly empty pages" },
  normal: { value: 0.001, label: "Normal", hint: "Suits most scans" },
  loose: { value: 0.004, label: "Loose", hint: "Also catches pages with a stray mark or footer" },
};

function inkRatio(ctx, width, height) {
  const cropX = Math.floor(width * BORDER_CROP);
  const cropY = Math.floor(height * BORDER_CROP);
  const w = width - cropX * 2;
  const h = height - cropY * 2;
  if (w <= 0 || h <= 0) return 0;
  const { data } = ctx.getImageData(cropX, cropY, w, h);
  let ink = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Transparent pixels render as white on our filled canvas, so alpha is not
    // consulted; the fill below guarantees an opaque background.
    if (data[i] <= INK_LEVEL || data[i + 1] <= INK_LEVEL || data[i + 2] <= INK_LEVEL) ink++;
  }
  return ink / (w * h);
}

export default function RemoveBlankPages() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState("normal");
  const [scanned, setScanned] = useState(null); // [{ page, ratio, thumb }]
  const [dropping, setDropping] = useState(new Set());
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setScanned(null);
    setDropping(new Set());
  };

  const onFiles = async (incoming) => {
    setError("");
    reset();
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

  const scan = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    reset();
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await pdfjs.getDocument({ data: bytes }).promise;
      const found = [];
      for (let n = 1; n <= src.numPages; n++) {
        setProgress(`Checking page ${n} of ${src.numPages}…`);
        const page = await src.getPage(n);
        const viewport = page.getViewport({ scale: DETECT_SCALE });
        const canvas = document.createElement("canvas");
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await renderPage(page, { canvasContext: ctx, viewport });
        const ratio = inkRatio(ctx, canvas.width, canvas.height);
        if (ratio <= LEVELS[level].value) {
          found.push({ page: n, ratio, thumb: canvas.toDataURL("image/jpeg", 0.6) });
        }
      }
      setScanned(found);
      setDropping(new Set(found.map((f) => f.page)));
      setProgress("");
    } catch (err) {
      setError(
        err?.name === "PdfRenderTimeoutError"
          ? "This PDF is taking too long to scan. Try a smaller file."
          : "Couldn't scan this PDF. It may be corrupted or password-protected."
      );
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (page) => {
    const next = new Set(dropping);
    if (next.has(page)) next.delete(page);
    else next.add(page);
    setDropping(next);
  };

  const apply = async () => {
    setError("");
    if (!file || !dropping.size) return;
    if (dropping.size === total) {
      setError("Every page was detected as blank. Leave at least one page in the PDF.");
      return;
    }
    setBusy(true);
    try {
      const keep = [];
      for (let p = 1; p <= total; p++) if (!dropping.has(p)) keep.push(p - 1);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, keep);
      copied.forEach((p) => out.addPage(p));
      const result = await out.save();
      downloadBytes(result, "cleaned.pdf");
    } catch {
      setError("Couldn't rebuild the PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF, scan for blank pages, then download the cleaned file." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}, {total} page{total === 1 ? "" : "s"}</p>

          <label className="field">
            <span className="field-label">Sensitivity</span>
            <select className="inp" value={level} onChange={(e) => { setLevel(e.target.value); reset(); }}>
              {Object.entries(LEVELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label} — {v.hint}</option>
              ))}
            </select>
          </label>

          <div className="btn-row">
            <button className="btn" onClick={scan} disabled={busy}>
              {busy ? (progress || "Scanning…") : "Scan for blank pages"}
            </button>
          </div>

          {scanned && scanned.length === 0 && (
            <p className="muted small">
              No blank pages found at this sensitivity. Try &ldquo;Loose&rdquo; if you expected some.
            </p>
          )}

          {scanned && scanned.length > 0 && (
            <>
              <p className="muted small">
                Found {scanned.length} blank page{scanned.length === 1 ? "" : "s"}. Untick any you want to keep, then
                download — {total - dropping.size} page{total - dropping.size === 1 ? "" : "s"} will remain.
              </p>
              <div className="page-grid">
                {scanned.map((p) => (
                  <label className="page-card" key={p.page}>
                    <div className="page-thumb">
                      <img src={p.thumb} alt={`Page ${p.page}`} />
                    </div>
                    <div className="page-card-bar">
                      <span className="muted small">Page {p.page}</span>
                      <input
                        type="checkbox"
                        checked={dropping.has(p.page)}
                        onChange={() => toggle(p.page)}
                        aria-label={`Remove page ${p.page}`}
                      />
                    </div>
                  </label>
                ))}
              </div>
              <div className="btn-row">
                <button className="btn" onClick={apply} disabled={busy || !dropping.size}>
                  {busy ? "Working…" : `Remove ${dropping.size} page${dropping.size === 1 ? "" : "s"} and download`}
                </button>
              </div>
            </>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
