"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { fmtBytes } from "./ImageDropzone";

// Common upload caps on job, exam and government forms.
const PRESETS = [20, 50, 100, 200, 500, 1024];

const KB = 1024;
const Q_MIN = 0.05;
const Q_MAX = 0.95;
const REFINE_STEPS = 5; // refinement encodes per round, on top of the two probes
const ACCEPT = 0.95; // stop refining once we are within 5% of the budget
const MAX_ROUNDS = 8; // how many times we may shrink the pixels

const encode = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

// Draw the source image into a fresh canvas at `scale` of its natural size.
// JPG has no alpha, so transparent areas are flattened onto white first.
function drawAt(img, scale, type) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  if (type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// Highest quality whose encode still fits `budget` bytes.
// Returns { blob, quality } on success. On failure blob is null and `floor` holds
// the smallest encode this canvas can produce — which tells the caller how far
// the pixels still have to shrink.
//
// Encoding is by far the expensive step (it scales with pixel count and costs the
// same at every quality), so the aim is to spend as few encodes as possible:
// two probes to bracket the answer, then guesses interpolated from the sizes
// already measured rather than blind bisection, stopping as soon as a result
// lands close under the budget.
async function bestUnder(canvas, type, budget, topFirst) {
  let top = null;
  // Probing max quality first only pays off when it has a real chance of fitting;
  // otherwise it is a wasted full-resolution encode, so start at the floor.
  if (topFirst) {
    top = await encode(canvas, type, Q_MAX);
    if (top && top.size <= budget) return { blob: top, quality: Q_MAX, floor: null };
  }

  const floor = await encode(canvas, type, Q_MIN);
  if (!floor || floor.size > budget) return { blob: null, quality: 0, floor };

  if (!top) {
    top = await encode(canvas, type, Q_MAX);
    if (top && top.size <= budget) return { blob: top, quality: Q_MAX, floor };
  }
  // The floor encoded but the ceiling didn't, so there is nothing to bracket
  // against. Keep the result we do have rather than reading a size off null.
  if (!top) return { blob: floor, quality: Q_MIN, floor };

  let lo = { q: Q_MIN, size: floor.size, blob: floor }; // fits
  let hi = { q: Q_MAX, size: top.size }; // does not fit
  for (let i = 0; i < REFINE_STEPS; i++) {
    if (lo.size >= budget * ACCEPT || hi.q - lo.q < 0.01) break;
    // File size grows roughly geometrically with quality, so interpolate the
    // next guess in log-size space; fall back to the midpoint if the two
    // bracket sizes are too close for that to mean anything.
    const span = Math.log(hi.size / lo.size);
    let q =
      span > 1e-6
        ? lo.q + ((hi.q - lo.q) * Math.log(budget / lo.size)) / span
        : (lo.q + hi.q) / 2;
    q = Math.min(hi.q - 0.005, Math.max(lo.q + 0.005, q));
    const blob = await encode(canvas, type, q);
    if (!blob) break;
    if (blob.size <= budget) lo = { q, size: blob.size, blob };
    else hi = { q, size: blob.size };
  }
  return { blob: lo.blob, quality: lo.q, floor };
}

export default function CompressImageToSize() {
  const imgRef = useRef(null);
  const fileRef = useRef(null);
  const runRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [orig, setOrig] = useState({ size: 0, w: 0, h: 0 });
  const [targetKb, setTargetKb] = useState(100);
  const [format, setFormat] = useState("image/jpeg");
  const [allowResize, setAllowResize] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  // Revoke the previous preview URL whenever the result is replaced or unmounted.
  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const onImage = (img, file) => {
    imgRef.current = img;
    fileRef.current = file || null;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setOrig({ size: file?.size || 0, w: img.naturalWidth, h: img.naturalHeight });
    setResult(null);
    setStatus("");
    setError("");
    setReady(true);
  };

  const run = async () => {
    const img = imgRef.current;
    const kb = Number(targetKb);
    if (!img || !(kb > 0)) return;
    const budget = Math.round(kb * KB);
    const runId = ++runRef.current;
    setBusy(true);
    setResult(null);
    setError("");

    try {
      // Nothing to do if the file already fits — re-encoding it would only throw
      // away detail, and at a generous target can even make the file bigger than
      // the original. Hand the untouched original straight back instead.
      const source = fileRef.current;
      if (source && source.size <= budget) {
        setResult({
          size: source.size,
          w: orig.w,
          h: orig.h,
          hit: true,
          untouched: true,
          name: source.name,
          url: URL.createObjectURL(source),
        });
        return;
      }

      let scale = 1;
      let fallback = null;
      let outcome = null;

      for (let round = 0; round < MAX_ROUNDS; round++) {
        const canvas = drawAt(img, scale, format);
        setStatus(`Trying ${canvas.width}×${canvas.height}…`);
        // Only worth probing max quality on the first round, and only when the
        // source file is already near the budget. After a round has failed we
        // shrank deliberately, so max quality is certain to still be too big.
        const found = await bestUnder(canvas, format, budget, round === 0 && orig.size <= budget * 2);
        if (runRef.current !== runId) return; // a newer run superseded this one

        if (found.blob) {
          outcome = { blob: found.blob, quality: found.quality, w: canvas.width, h: canvas.height };
          break;
        }
        fallback = { blob: found.floor, quality: Q_MIN, w: canvas.width, h: canvas.height };
        if (!allowResize || !found.floor) break;

        // Encoded size tracks pixel count, so the linear scale moves by the square
        // root of how far over budget we are. Clamped so every round shrinks, but
        // never so hard that we blow far past the target and waste detail.
        const shrink = Math.min(0.9, Math.max(0.5, Math.sqrt(budget / found.floor.size) * 0.92));
        const next = scale * shrink;
        if (Math.round(img.naturalWidth * next) < 16 || Math.round(img.naturalHeight * next) < 16) break;
        scale = next;
      }

      const final = outcome || fallback;
      if (final?.blob) {
        setResult({
          size: final.blob.size,
          quality: final.quality,
          w: final.w,
          h: final.h,
          hit: Boolean(outcome),
          url: URL.createObjectURL(final.blob),
        });
      } else {
        setError("Your browser couldn't encode this image in the chosen format. Try JPG instead.");
      }
    } catch {
      // Canvas throws on images too large for this device to allocate, and
      // toBlob rejects on a tainted canvas. Either way, don't strand the button.
      if (runRef.current === runId) {
        setError("Couldn't compress this image — it may be too large for this device. Try a smaller image.");
      }
    } finally {
      if (runRef.current === runId) {
        setStatus("");
        setBusy(false);
      }
    }
  };

  const ext = format === "image/webp" ? "webp" : "jpg";
  const budgetBytes = Math.round(Number(targetKb) * KB) || 0;
  const alreadySmall = orig.size > 0 && budgetBytes > 0 && orig.size <= budgetBytes;
  const saving = orig.size && result ? Math.round((1 - result.size / orig.size) * 100) : 0;

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="JPG, PNG or WebP. The result is saved as JPG or WebP." />
      {ready && (
        <>
          <p className="muted small">
            Original: {orig.w}&times;{orig.h}px, {fmtBytes(orig.size)}
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
            <label className="field">
              <span className="field-label">Output format</span>
              <select className="inp" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP (smaller)</option>
              </select>
            </label>
          </div>

          <div className="chip-row">
            {PRESETS.map((kb) => (
              <button
                key={kb}
                className="btn btn-ghost btn-sm"
                onClick={() => setTargetKb(kb)}
              >
                {kb >= 1024 ? `${kb / 1024} MB` : `${kb} KB`}
              </button>
            ))}
          </div>

          <label className="check-row">
            <input
              type="checkbox"
              checked={allowResize}
              onChange={(e) => setAllowResize(e.target.checked)}
            />
            <span>Shrink the dimensions if quality alone can&rsquo;t reach the target</span>
          </label>

          {alreadySmall && (
            <p className="muted small">
              Your image is already under {targetKb} KB, so it will be handed back untouched rather
              than re-compressed.
            </p>
          )}

          <div className="btn-row">
            <button className="btn" onClick={run} disabled={busy}>
              {busy ? "Compressing…" : "Compress to target size"}
            </button>
          </div>

          {busy && status && (
            <p className="muted small" role="status" aria-live="polite">{status}</p>
          )}

          {error && <p className="error">{error}</p>}

          {result && (
            <>
              <div className="result-list">
                <div className="result-row">
                  <span className="result-label">Original</span>
                  <code className="result-val">{fmtBytes(orig.size)}</code>
                </div>
                <div className="result-row">
                  <span className="result-label">Target</span>
                  <code className="result-val">{targetKb} KB ({budgetBytes.toLocaleString()} bytes)</code>
                </div>
                <div className="result-row result-row-hl">
                  <span className="result-label">Result</span>
                  <code className="result-val">
                    {fmtBytes(result.size)} ({result.size.toLocaleString()} bytes)
                  </code>
                </div>
                <div className="result-row">
                  <span className="result-label">Dimensions</span>
                  <code className="result-val">
                    {result.w}&times;{result.h}px
                    {result.w !== orig.w ? ` (resized from ${orig.w}×${orig.h})` : " (unchanged)"}
                  </code>
                </div>
                <div className="result-row">
                  <span className="result-label">Quality</span>
                  <code className="result-val">
                    {result.untouched
                      ? "Original, not re-compressed"
                      : `${Math.round(result.quality * 100)}%${saving > 0 ? ` — ${saving}% smaller` : ""}`}
                  </code>
                </div>
              </div>

              {result.untouched && (
                <p className="muted small">
                  Your file already fits {targetKb} KB, so it is offered back exactly as it is — no
                  re-encoding, no quality lost.
                </p>
              )}

              {!result.hit && (
                <p className="error">
                  Couldn&rsquo;t get under {targetKb} KB{allowResize ? "" : " without resizing"}. This is the
                  smallest result at these settings
                  {allowResize ? " — try WebP, or a slightly higher target." : " — tick the resize option above, or try WebP."}
                </p>
              )}

              <div className="btn-row">
                <a
                  className="btn"
                  href={result.url}
                  download={result.untouched ? result.name : `${baseName}-${targetKb}kb.${ext}`}
                >
                  Download image
                </a>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
