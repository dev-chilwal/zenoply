"use client";
import { useState, useRef, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes } from "./PdfDropzone";
import { loadPdfjs, renderPage } from "./pdfjs";

// Upload caps that job, exam and government portals actually set for documents.
const PRESETS = [100, 200, 300, 500, 1024, 2048];

const KB = 1024;
const Q_MIN = 0.25; // below this JPEG blocking makes body text unreadable
const Q_MAX = 0.92;
// Upper bracket for rounds that already had to drop the resolution. Those rounds
// shrank until the *lowest* quality fits, so the highest is certain not to — and
// probing it anyway costs a full pass over every page for nothing.
const Q_PROBE = 0.6;
const REFINE_STEPS = 4; // refinement passes, on top of the two bracketing probes
const ACCEPT = 0.95; // stop refining once we are within 5% of the budget
const MAX_ROUNDS = 5; // how many times we may drop the raster resolution
const BUILD_ATTEMPTS = 3;

// Pages are rasterised once and kept, so the search can re-encode without paying
// for another pdf.js render. That trades memory for time, so the render scale is
// chosen to keep the whole cache inside a pixel budget (~64 MB of canvas) however
// many pages there are; HARD_CAP is the point where even the lowest scale would
// not fit and the document is simply too long for this to run in a tab.
const PIXEL_BUDGET = 16e6;
const HARD_CAP = 28e6;
// 1.6 is 115 DPI. Rendering higher would only make every probe more expensive:
// this tool exists for small targets, and no small target can pay for the extra
// pixels — a document that could is already under its limit and never rasterised.
const REF_MAX = 1.6;
const REF_MIN = 0.5;

const encode = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

const release = (canvas) => {
  canvas.width = 0;
  canvas.height = 0;
};

// Redraw a cached page render at `scale` of its cached size. Always measured
// against the original cache rather than the previous round's output, so
// repeated shrinking never compounds resampling losses.
function drawAt(source, scale) {
  if (scale >= 1) return source;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// One JPEG quality applied to every page, because a PDF has a single size budget
// to share and there is no reason to spend it unevenly across pages.
async function encodeAll(canvases, quality) {
  const blobs = [];
  let total = 0;
  for (const canvas of canvases) {
    const blob = await encode(canvas, quality);
    if (!blob) return null;
    blobs.push(blob);
    total += blob.size;
  }
  return { blobs, total };
}

// Highest quality whose encoded pages still fit `budget` bytes in total.
// Returns the fitting set, or fit:null plus `floor` — the smallest this
// resolution can produce, which tells the caller how far the pixels must drop.
//
// Encoding is the expensive step and costs the same at every quality, so the aim
// is to spend as few passes as possible: two probes to bracket the answer, then
// guesses interpolated in log-size space (size grows roughly geometrically with
// quality) rather than blind bisection, stopping as soon as one lands close
// under the budget.
async function bestUnder(canvases, budget, topFirst, hiQ = Q_MAX) {
  let top = null;
  // Probing the ceiling first only pays off when it has a real chance of
  // fitting; otherwise it is a wasted full-resolution pass over every page.
  if (topFirst) {
    top = await encodeAll(canvases, hiQ);
    if (top && top.total <= budget) return { fit: top, quality: hiQ, floor: null };
  }

  const floor = await encodeAll(canvases, Q_MIN);
  if (!floor || floor.total > budget) return { fit: null, quality: 0, floor };

  if (!top) top = await encodeAll(canvases, hiQ);
  // The floor encoded but the ceiling didn't, so there is nothing to bracket
  // against. Keep the result we do have rather than reading a size off null.
  if (!top) return { fit: floor, quality: Q_MIN, floor };

  let lo = { q: Q_MIN, size: floor.total, set: floor }; // fits
  let hi = { q: hiQ, size: top.total }; // assumed not to fit

  if (top.total <= budget) {
    // A reduced bracket that fits leaves budget unspent, so reach for the real
    // ceiling — but only here, where the extra pass can actually buy quality.
    if (hiQ >= Q_MAX || top.total >= budget * ACCEPT) return { fit: top, quality: hiQ, floor };
    const max = await encodeAll(canvases, Q_MAX);
    if (!max) return { fit: top, quality: hiQ, floor };
    if (max.total <= budget) return { fit: max, quality: Q_MAX, floor };
    lo = { q: hiQ, size: top.total, set: top };
    hi = { q: Q_MAX, size: max.total };
  }

  for (let i = 0; i < REFINE_STEPS; i++) {
    if (lo.size >= budget * ACCEPT || hi.q - lo.q < 0.01) break;
    const span = Math.log(hi.size / lo.size);
    let q =
      span > 1e-6
        ? lo.q + ((hi.q - lo.q) * Math.log(budget / lo.size)) / span
        : (lo.q + hi.q) / 2;
    q = Math.min(hi.q - 0.005, Math.max(lo.q + 0.005, q));
    const set = await encodeAll(canvases, q);
    if (!set) break;
    if (set.total <= budget) lo = { q, size: set.total, set };
    else hi = { q, size: set.total };
  }
  return { fit: lo.set, quality: lo.q, floor };
}

// Rebuild the pages as a PDF. Page boxes are the document's own point sizes, not
// the raster dimensions, so a page stays A4 whatever resolution it was drawn at.
async function buildPdf(blobs, sizes) {
  const out = await PDFDocument.create();
  for (let i = 0; i < blobs.length; i++) {
    const img = await out.embedJpg(new Uint8Array(await blobs[i].arrayBuffer()));
    const page = out.addPage([sizes[i].w, sizes[i].h]);
    page.drawImage(img, { x: 0, y: 0, width: sizes[i].w, height: sizes[i].h });
  }
  return out.save();
}

export default function CompressPdfToSize() {
  const runRef = useRef(0);
  const [file, setFile] = useState(null);
  const [targetKb, setTargetKb] = useState(100);
  const [allowShrink, setAllowShrink] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const onFiles = (incoming) => {
    const f = incoming[0];
    if (!f) return;
    runRef.current++; // abandon any run still working on the previous file
    setFile(f);
    setResult(null);
    setStatus("");
    setError("");
  };

  const run = async () => {
    const kb = Number(targetKb);
    if (!file || !(kb > 0)) return;
    const budget = Math.round(kb * KB);
    const runId = ++runRef.current;
    const live = () => runRef.current === runId;
    setBusy(true);
    setResult(null);
    setError("");

    let cache = [];
    try {
      // Nothing to do if the document already fits. Rasterising it would throw
      // away its selectable text for no reason, and a text PDF re-rendered as
      // images can easily come out larger than it went in.
      if (file.size <= budget) {
        setResult({
          size: file.size,
          untouched: true,
          hit: true,
          name: file.name,
          url: URL.createObjectURL(file),
        });
        return;
      }

      setStatus("Reading the PDF…");
      const pdfjs = await loadPdfjs();
      const src = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
      if (!live()) return;
      const numPages = src.numPages;

      // Page boxes at scale 1 are the document's own point sizes, and already
      // account for any /Rotate on the page.
      const sizes = [];
      let unitPixels = 0;
      for (let n = 1; n <= numPages; n++) {
        const view = (await src.getPage(n)).getViewport({ scale: 1 });
        sizes.push({ w: view.width, h: view.height });
        unitPixels += view.width * view.height;
      }
      if (!live()) return;

      const refScale = Math.min(REF_MAX, Math.max(REF_MIN, Math.sqrt(PIXEL_BUDGET / unitPixels)));
      if (unitPixels * refScale * refScale > HARD_CAP) {
        setError(
          `This PDF has ${numPages} pages — too many to re-render in a browser tab at once. Split it into smaller files first, then compress each part.`
        );
        return;
      }

      for (let n = 1; n <= numPages; n++) {
        setStatus(`Rendering page ${n} of ${numPages}…`);
        const page = await src.getPage(n);
        const viewport = page.getViewport({ scale: refScale });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await renderPage(page, { canvasContext: ctx, viewport });
        if (!live()) return;
        cache.push(canvas);
      }

      // The search works against the space left after the PDF's own structure.
      // That is estimated to begin with and then measured exactly from the first
      // build, so at most one extra pass is needed to correct for it.
      let overhead = 900 + 320 * numPages;
      let outcome = null;

      for (let attempt = 0; attempt < BUILD_ATTEMPTS; attempt++) {
        const jpegBudget = budget - overhead;
        if (jpegBudget <= 0) {
          setError(
            `A ${numPages}-page PDF needs about ${fmtBytes(overhead)} just for its own structure, so ${kb} KB is not reachable. Try a larger target, or split the file first.`
          );
          return;
        }

        let scale = 1;
        let found = null;
        let fallback = null;

        for (let round = 0; round < MAX_ROUNDS; round++) {
          const canvases = cache.map((c) => drawAt(c, scale));
          setStatus(
            round === 0
              ? `Searching for the quality that fits ${kb} KB…`
              : `Retrying at ${Math.round(scale * 100)}% resolution…`
          );
          // Worth probing max quality only on the first round, and only when the
          // source is already near the budget. Later rounds shrank deliberately,
          // so max quality is certain to still be too big.
          const attemptFit = await bestUnder(
            canvases,
            jpegBudget,
            round === 0 && file.size <= budget * 2,
            round === 0 ? Q_MAX : Q_PROBE
          );
          if (scale < 1) canvases.forEach(release);
          if (!live()) return;

          if (attemptFit.fit) {
            found = { ...attemptFit.fit, quality: attemptFit.quality, scale, hit: true };
            break;
          }
          if (attemptFit.floor) {
            fallback = { ...attemptFit.floor, quality: Q_MIN, scale, hit: false };
          }
          if (!allowShrink || !attemptFit.floor) break;

          // Encoded size tracks pixel count, so the linear scale moves by the
          // square root of how far over budget we are. Clamped so every round
          // shrinks, but never so hard that detail is thrown away for nothing.
          // The lower clamp is deliberately generous: a document many times over
          // its budget should reach the right resolution in a round or two
          // rather than creep down through several full passes over every page.
          const shrink = Math.min(
            0.9,
            Math.max(0.4, Math.sqrt(jpegBudget / attemptFit.floor.total) * 0.92)
          );
          const next = scale * shrink;
          if (Math.round(cache[0].width * next) < 120) break;
          scale = next;
        }

        const chosen = found || fallback;
        if (!chosen) break;

        setStatus("Building the PDF…");
        const bytes = await buildPdf(chosen.blobs, sizes);
        if (!live()) return;
        outcome = { bytes, chosen, refScale };

        if (bytes.length <= budget || !chosen.hit) break;
        // Overspent on structure rather than on pixels. Now that a real build has
        // been measured the overhead is known exactly, so search again against it.
        const measured = bytes.length - chosen.total + 128;
        if (measured <= overhead) break;
        overhead = measured;
      }

      if (!outcome) {
        setError("Couldn't compress this PDF — your browser wasn't able to encode its pages.");
        return;
      }

      const { bytes, chosen } = outcome;
      setResult({
        size: bytes.length,
        pages: numPages,
        quality: chosen.quality,
        dpi: Math.round(72 * refScale * chosen.scale),
        hit: bytes.length <= budget,
        url: URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })),
      });
    } catch (err) {
      if (!live()) return;
      setError(
        err?.name === "PdfRenderTimeoutError"
          ? "This PDF is taking too long to render. Try a smaller file, or split it first."
          : "Couldn't compress this PDF. It may be corrupted, or too large for this device."
      );
    } finally {
      cache.forEach(release);
      if (live()) {
        setStatus("");
        setBusy(false);
      }
    }
  };

  const budgetBytes = Math.round(Number(targetKb) * KB) || 0;
  const alreadySmall = file && budgetBytes > 0 && file.size <= budgetBytes;
  const saving = file && result ? Math.round((1 - result.size / file.size) * 100) : 0;
  const targetLabel = Number(targetKb) >= 1024 ? `${(Number(targetKb) / 1024).toFixed(1)} MB` : `${targetKb} KB`;

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF and name your size limit — the quality is found for you."
      />
      {file && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}
          </p>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Target size (KB)</span>
              <input
                className="inp"
                type="number"
                min={1}
                value={targetKb}
                onChange={(e) => setTargetKb(e.target.value)}
              />
            </label>
          </div>

          <div className="chip-row">
            {PRESETS.map((kb) => (
              <button key={kb} className="btn btn-ghost btn-sm" onClick={() => setTargetKb(kb)}>
                {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
              </button>
            ))}
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={allowShrink}
              onChange={(e) => setAllowShrink(e.target.checked)}
            />
            <span>Lower the page resolution if quality alone can&rsquo;t reach the target</span>
          </label>

          <p className="muted small">
            Pages are re-rendered as compressed images, so selectable text becomes part of the picture.
            That is what makes an exact size limit reachable, and it works best on scans and
            image-heavy documents.
          </p>

          {alreadySmall && (
            <p className="muted small">
              This PDF is already under {targetLabel}, so it will be handed back untouched rather than
              re-compressed.
            </p>
          )}

          <div className="btn-row">
            <button className="btn" onClick={run} disabled={busy}>
              {busy ? "Compressing…" : "Compress to target size"}
            </button>
          </div>

          {busy && status && (
            <p className="muted small" role="status" aria-live="polite">
              {status}
            </p>
          )}

          {error && <p className="error">{error}</p>}

          {result && (
            <>
              <div className="result-list">
                <div className="result-row">
                  <span className="result-label">Original</span>
                  <code className="result-val">{fmtBytes(file.size)}</code>
                </div>
                <div className="result-row">
                  <span className="result-label">Target</span>
                  <code className="result-val">
                    {targetLabel} ({budgetBytes.toLocaleString()} bytes)
                  </code>
                </div>
                <div className="result-row result-row-hl">
                  <span className="result-label">Result</span>
                  <code className="result-val">
                    {fmtBytes(result.size)} ({result.size.toLocaleString()} bytes)
                  </code>
                </div>
                {!result.untouched && (
                  <>
                    <div className="result-row">
                      <span className="result-label">Pages</span>
                      <code className="result-val">
                        {result.pages} at about {result.dpi} DPI
                      </code>
                    </div>
                    <div className="result-row">
                      <span className="result-label">Quality</span>
                      <code className="result-val">
                        {Math.round(result.quality * 100)}%
                        {saving > 0 ? ` — ${saving}% smaller` : ""}
                      </code>
                    </div>
                  </>
                )}
              </div>

              {result.untouched && (
                <p className="muted small">
                  Your file already fits {targetLabel}, so it is offered back exactly as it is — no
                  re-rendering, and its text stays selectable.
                </p>
              )}

              {!result.hit && (
                <p className="error">
                  Couldn&rsquo;t get under {targetLabel}
                  {allowShrink ? "" : " without lowering the resolution"}. This is the smallest result at
                  these settings
                  {allowShrink
                    ? " — try a slightly higher target, or remove pages you don't need."
                    : " — tick the resolution option above, or raise the target."}
                  .
                </p>
              )}

              <div className="btn-row">
                <a
                  className="btn"
                  href={result.url}
                  download={
                    result.untouched
                      ? result.name
                      : `${file.name.replace(/\.pdf$/i, "")}-${targetKb}kb.pdf`
                  }
                >
                  Download PDF
                </a>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
