"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ImageDropzone, { fmtBytes } from "./ImageDropzone";

const KB = 1024;
const DPI = 300; // exam portals ask for 200-300 DPI scans; 300 is the safe standard
const cm = (v) => Math.round((v / 2.54) * DPI);

const Q_MIN = 0.05;
// Unlike the plain compressor, the ceiling here is a true 1.0: exam forms set a
// *minimum* size as well as a maximum, so the biggest encode that still fits is
// the one most likely to clear the floor.
const Q_MAX = 1;
const REFINE_STEPS = 5;
const ACCEPT = 0.97; // stop refining once within 3% of the ceiling
const MAX_UPSCALE_ROUNDS = 4;
const MAX_UPSCALE = 4; // never blow the requested dimensions up more than 4x

// Per-exam upload specs. Only exams whose published specs agree across sources are
// listed, and each preset names where its numbers come from — portals restate these
// per notification, so the UI always tells the user to confirm against their own.
const PRESET_GROUPS = [
  {
    group: "Bank — IBPS / SBI / RBI",
    note: "From IBPS's official \"Guidelines for Scanning & Uploading the Photograph and Signature\".",
    items: [
      { label: "Photograph — 200×230 px, 20–50 KB", kind: "photo", w: 200, h: 230, min: 20, max: 50 },
      { label: "Signature — 140×60 px, 10–20 KB", kind: "sign", w: 140, h: 60, min: 10, max: 20 },
      { label: "Left thumb impression — 140×60 px, 20–50 KB", kind: "sign", w: 140, h: 60, min: 20, max: 50 },
    ],
  },
  {
    group: "SSC — CGL / CHSL / GD / MTS (OTR)",
    note: "SSC states its photo and signature sizes in centimetres; these are rendered at 300 DPI.",
    items: [
      { label: "Photograph — 3.5×4.5 cm, 20–50 KB", kind: "photo", w: cm(3.5), h: cm(4.5), min: 20, max: 50 },
      { label: "Signature — 4.0×2.0 cm, 10–20 KB", kind: "sign", w: cm(4), h: cm(2), min: 10, max: 20 },
    ],
  },
  {
    group: "NTA — JEE Main / NEET",
    note: "NTA restates these in each information bulletin and the signature limits differ between JEE Main and NEET — check the bulletin for your exam.",
    items: [
      { label: "Photograph — 3.5×4.5 cm, 10–200 KB", kind: "photo", w: cm(3.5), h: cm(4.5), min: 10, max: 200 },
      { label: "JEE Main signature — 3.5×1.5 cm, 10–100 KB", kind: "sign", w: cm(3.5), h: cm(1.5), min: 10, max: 100 },
      { label: "NEET signature — 3.5×1.5 cm, 4–30 KB", kind: "sign", w: cm(3.5), h: cm(1.5), min: 4, max: 30 },
    ],
  },
  {
    group: "UPSC (OTR)",
    note: "UPSC's OTR profile takes a wide size range; dimensions are not fixed, so a standard 3.5×4.5 cm photo is used here.",
    items: [
      { label: "Photograph — 3.5×4.5 cm, 20–300 KB", kind: "photo", w: cm(3.5), h: cm(4.5), min: 20, max: 300 },
      { label: "Signature — 3.5×1.5 cm, 20–100 KB", kind: "sign", w: cm(3.5), h: cm(1.5), min: 20, max: 100 },
    ],
  },
  {
    group: "General",
    note: "Common sizes for forms that quote a photo size but no exam name.",
    items: [
      { label: "Passport photo — 3.5×4.5 cm, 20–50 KB", kind: "photo", w: cm(3.5), h: cm(4.5), min: 20, max: 50 },
      { label: "Square photo — 300×300 px, 20–100 KB", kind: "photo", w: 300, h: 300, min: 20, max: 100 },
      { label: "Signature — 300×100 px, 10–50 KB", kind: "sign", w: 300, h: 100, min: 10, max: 50 },
    ],
  },
];

const PRESETS = PRESET_GROUPS.flatMap((g) => g.items.map((it) => ({ ...it, note: g.note })));

const encode = (canvas, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

// Highest JPEG quality whose encode still fits `maxBytes`.
//
// Probing the ceiling first is right here (the plain compressor deliberately does
// the opposite): exam dimensions are small, so a full-quality encode is cheap and
// very often already fits — and when it does it is also the result most likely to
// clear the form's minimum.
async function bestUnder(canvas, maxBytes) {
  const top = await encode(canvas, Q_MAX);
  if (!top) return null;
  if (top.size <= maxBytes) return { blob: top, quality: Q_MAX, ceiling: top.size };

  const floor = await encode(canvas, Q_MIN);
  if (!floor) return null;
  // Even the lowest quality overshoots — the caller has to lose pixels, not quality.
  if (floor.size > maxBytes) return { blob: null, quality: 0, floor, ceiling: top.size };

  let lo = { q: Q_MIN, size: floor.size, blob: floor }; // fits
  let hi = { q: Q_MAX, size: top.size }; // does not fit
  for (let i = 0; i < REFINE_STEPS; i++) {
    if (lo.size >= maxBytes * ACCEPT || hi.q - lo.q < 0.01) break;
    // Size grows roughly geometrically with quality, so interpolate the next guess
    // in log-size space rather than bisecting blindly.
    const span = Math.log(hi.size / lo.size);
    let q =
      span > 1e-6
        ? lo.q + ((hi.q - lo.q) * Math.log(maxBytes / lo.size)) / span
        : (lo.q + hi.q) / 2;
    q = Math.min(hi.q - 0.005, Math.max(lo.q + 0.005, q));
    const blob = await encode(canvas, q);
    if (!blob) break;
    if (blob.size <= maxBytes) lo = { q, size: blob.size, blob };
    else hi = { q, size: blob.size };
  }
  return { blob: lo.blob, quality: lo.q, ceiling: top.size };
}

export default function ExamPhotoResizer() {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const runRef = useRef(0);
  const slackRef = useRef({ slackX: 0, slackY: 0 });
  const dragRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom, setCustom] = useState(false);
  const [dims, setDims] = useState({ w: PRESETS[0].w, h: PRESETS[0].h });
  const [band, setBand] = useState({ min: PRESETS[0].min, max: PRESETS[0].max });
  const [fit, setFit] = useState("cover");
  const [whiten, setWhiten] = useState(false);
  const [threshold, setThreshold] = useState(190);
  const [zoom, setZoom] = useState(1);
  const [offX, setOffX] = useState(0);
  const [offY, setOffY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [allowUpscale, setAllowUpscale] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const preset = PRESETS[presetIdx];
  const targetW = Math.max(1, Math.round(Number(dims.w) || 0));
  const targetH = Math.max(1, Math.round(Number(dims.h) || 0));
  const minBytes = Math.round((Number(band.min) || 0) * KB);
  const maxBytes = Math.round((Number(band.max) || 0) * KB);
  const bandValid = maxBytes > 0 && maxBytes >= minBytes;

  useEffect(() => {
    return () => {
      if (result?.url) URL.revokeObjectURL(result.url);
    };
  }, [result]);

  const onImage = (img) => {
    imgRef.current = img;
    setReady(true);
    setZoom(1);
    setOffX(0);
    setOffY(0);
    setResult(null);
    setError("");
  };

  const applyPreset = (idx) => {
    const p = PRESETS[idx];
    setPresetIdx(idx);
    setDims({ w: p.w, h: p.h });
    setBand({ min: p.min, max: p.max });
    // A signature has to be visible end to end, so it is fitted whole; a face photo
    // is cropped to fill the frame the way an ID photo is meant to be.
    setFit(p.kind === "sign" ? "contain" : "cover");
    setWhiten(p.kind === "sign");
    setResult(null);
    setZoom(1);
    setOffX(0);
    setOffY(0);
  };

  // Paint the source into a canvas of exactly w x h, then optionally flatten the
  // paper behind a signature to pure white.
  const paint = useCallback(
    (w, h) => {
      const img = imgRef.current;
      if (!img) return null;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      ctx.imageSmoothingQuality = "high";

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const boxRatio = w / h;
      let baseW, baseH;
      if (fit === "cover" ? imgRatio > boxRatio : imgRatio < boxRatio) {
        baseH = h;
        baseW = h * imgRatio;
      } else {
        baseW = w;
        baseH = w / imgRatio;
      }
      const drawW = baseW * (fit === "cover" ? zoom : 1);
      const drawH = baseH * (fit === "cover" ? zoom : 1);
      const slackX = Math.max(0, drawW - w) / 2;
      const slackY = Math.max(0, drawH - h) / 2;
      slackRef.current = { slackX, slackY };
      const dx = (w - drawW) / 2 + (fit === "cover" ? offX * slackX : 0);
      const dy = (h - drawH) / 2 + (fit === "cover" ? offY * slackY : 0);
      ctx.drawImage(img, dx, dy, drawW, drawH);

      if (whiten) {
        const data = ctx.getImageData(0, 0, w, h);
        const px = data.data;
        for (let i = 0; i < px.length; i += 4) {
          // Rec. 601 luma — anything lighter than the threshold is paper, not ink.
          const lum = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
          if (lum >= threshold) {
            px[i] = 255;
            px[i + 1] = 255;
            px[i + 2] = 255;
          }
        }
        ctx.putImageData(data, 0, 0);
      }
      return canvas;
    },
    [fit, zoom, offX, offY, whiten, threshold]
  );

  // Live preview, always at the exact output dimensions.
  const renderPreview = useCallback(() => {
    const canvas = canvasRef.current;
    const src = paint(targetW, targetH);
    if (!canvas || !src) return;
    canvas.width = targetW;
    canvas.height = targetH;
    canvas.getContext("2d").drawImage(src, 0, 0);
  }, [paint, targetW, targetH]);

  useEffect(() => {
    if (ready) renderPreview();
  }, [ready, renderPreview]);

  const run = async () => {
    if (!imgRef.current || !bandValid) return;
    const runId = ++runRef.current;
    setBusy(true);
    setResult(null);
    setError("");

    try {
      let scale = 1;
      let outcome = null;
      let best = null;

      for (let round = 0; round < MAX_UPSCALE_ROUNDS; round++) {
        const w = Math.round(targetW * scale);
        const h = Math.round(targetH * scale);
        setStatus(`Encoding ${w}×${h}…`);
        const canvas = paint(w, h);
        if (!canvas) break;
        const found = await bestUnder(canvas, maxBytes);
        if (runRef.current !== runId) return;
        if (!found) break;

        if (!found.blob) {
          // Nothing fits under the ceiling even at the lowest quality.
          best = { blob: found.floor, quality: Q_MIN, w, h, over: true };
          break;
        }

        best = { blob: found.blob, quality: found.quality, w, h };
        if (found.blob.size >= minBytes) {
          outcome = best;
          break;
        }
        // Under the floor. Dimensions are the only lever left, and most portals
        // publish their pixel size as "preferred" while the KB range is a hard
        // check — so growing the image is the honest way to reach the minimum.
        if (!allowUpscale) break;
        const grow = Math.min(1.8, Math.max(1.15, Math.sqrt(minBytes / found.blob.size)));
        const next = scale * grow;
        if (next > MAX_UPSCALE) break;
        scale = next;
      }

      if (runRef.current !== runId) return;
      const final = outcome || best;
      if (final?.blob) {
        setResult({
          size: final.blob.size,
          quality: final.quality,
          w: final.w,
          h: final.h,
          inBand: Boolean(outcome),
          over: Boolean(final.over),
          url: URL.createObjectURL(final.blob),
        });
      } else {
        setError("Your browser couldn't encode this image. Try a different photo.");
      }
    } catch {
      if (runRef.current === runId) {
        setError("Couldn't process this image — it may be too large for this device.");
      }
    } finally {
      if (runRef.current === runId) {
        setStatus("");
        setBusy(false);
      }
    }
  };

  // --- Drag to reposition (cover mode only) ---
  const pointFrom = (e) => {
    const t = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: t.clientX, y: t.clientY };
  };

  const onDragStart = (e) => {
    if (!ready || fit !== "cover") return;
    e.preventDefault();
    const p = pointFrom(e);
    dragRef.current = { x: p.x, y: p.y, offX, offY };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => {
      const start = dragRef.current;
      const canvas = canvasRef.current;
      if (!start || !canvas) return;
      e.preventDefault();
      const p = pointFrom(e);
      const rect = canvas.getBoundingClientRect();
      const dxCanvas = (p.x - start.x) * (canvas.width / rect.width);
      const dyCanvas = (p.y - start.y) * (canvas.height / rect.height);
      const { slackX, slackY } = slackRef.current;
      const clamp = (v) => Math.max(-1, Math.min(1, v));
      setOffX(slackX > 0 ? clamp(start.offX + dxCanvas / slackX) : 0);
      setOffY(slackY > 0 ? clamp(start.offY + dyCanvas / slackY) : 0);
    };
    const up = () => {
      dragRef.current = null;
      setDragging(false);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging]);

  // Scale the preview to fill a ~300x340 box, so a 140x60 signature is readable and
  // a 413x531 photo still fits. Only the width is set; the canvas keeps its own
  // aspect ratio from there, and max-width lets it shrink on narrow screens.
  const dispScale = Math.min(3, 300 / targetW, 340 / targetH);
  const kind = custom ? (fit === "cover" ? "photo" : "signature") : preset.kind === "sign" ? "signature" : "photograph";

  return (
    <div>
      <ImageDropzone
        onImage={onImage}
        hint="A phone photo or scan works. For a signature, sign in black ink on white paper."
      />
      {ready && (
        <>
          <label className="field">
            <span className="field-label">Exam &amp; document</span>
            <select
              className="inp"
              value={custom ? "custom" : presetIdx}
              onChange={(e) => {
                if (e.target.value === "custom") {
                  setCustom(true);
                  setResult(null);
                } else {
                  setCustom(false);
                  applyPreset(parseInt(e.target.value));
                }
              }}
            >
              {(() => {
                let idx = 0;
                return PRESET_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((p) => {
                      const i = idx++;
                      return (
                        <option key={i} value={i}>
                          {p.label}
                        </option>
                      );
                    })}
                  </optgroup>
                ));
              })()}
              <optgroup label="Custom">
                <option value="custom">Custom size and KB limit…</option>
              </optgroup>
            </select>
          </label>

          {!custom && <p className="muted small">{preset.note}</p>}

          <div className="field-row">
            <label className="field">
              <span className="field-label">Width (px)</span>
              <input
                className="inp"
                type="number"
                min={1}
                value={dims.w}
                onChange={(e) => {
                  setCustom(true);
                  setDims((d) => ({ ...d, w: e.target.value }));
                }}
              />
            </label>
            <label className="field">
              <span className="field-label">Height (px)</span>
              <input
                className="inp"
                type="number"
                min={1}
                value={dims.h}
                onChange={(e) => {
                  setCustom(true);
                  setDims((d) => ({ ...d, h: e.target.value }));
                }}
              />
            </label>
            <label className="field">
              <span className="field-label">Min size (KB)</span>
              <input
                className="inp"
                type="number"
                min={0}
                value={band.min}
                onChange={(e) => {
                  setCustom(true);
                  setBand((b) => ({ ...b, min: e.target.value }));
                }}
              />
            </label>
            <label className="field">
              <span className="field-label">Max size (KB)</span>
              <input
                className="inp"
                type="number"
                min={1}
                value={band.max}
                onChange={(e) => {
                  setCustom(true);
                  setBand((b) => ({ ...b, max: e.target.value }));
                }}
              />
            </label>
          </div>

          {!bandValid && (
            <p className="error">
              The maximum size must be at least the minimum, and above zero.
            </p>
          )}

          <div className="passport-preview">
            <canvas
              ref={canvasRef}
              className={
                "passport-canvas exam-canvas" +
                (dragging ? " dragging" : "") +
                (fit === "cover" ? "" : " no-drag")
              }
              style={{ width: Math.round(targetW * dispScale) }}
              onMouseDown={onDragStart}
              onTouchStart={onDragStart}
            />
          </div>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Framing</span>
              <select
                className="inp"
                value={fit}
                onChange={(e) => {
                  setFit(e.target.value);
                  setResult(null);
                }}
              >
                <option value="cover">Crop to fill the frame (photos)</option>
                <option value="contain">Fit the whole image, pad white (signatures)</option>
              </select>
            </label>
            {fit === "cover" && (
              <label className="field">
                <span className="field-label">Zoom</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </label>
            )}
          </div>

          {fit === "cover" && (
            <p className="muted small center">Drag the image to reposition it inside the frame.</p>
          )}

          <label className="check-row">
            <input type="checkbox" checked={whiten} onChange={(e) => setWhiten(e.target.checked)} />
            <span>Clean the background to pure white (for signatures on paper)</span>
          </label>

          {whiten && (
            <label className="field">
              <span className="field-label">Background sensitivity — {threshold}</span>
              <input
                type="range"
                min={120}
                max={250}
                step={5}
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value))}
              />
            </label>
          )}

          <label className="check-row">
            <input
              type="checkbox"
              checked={allowUpscale}
              onChange={(e) => setAllowUpscale(e.target.checked)}
            />
            <span>Enlarge the pixel size if the file lands under the minimum KB</span>
          </label>

          <div className="btn-row">
            <button className="btn" onClick={run} disabled={busy || !bandValid}>
              {busy ? "Resizing…" : `Resize ${kind}`}
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
                  <span className="result-label">Required</span>
                  <code className="result-val">
                    {targetW}&times;{targetH}px, {band.min}&ndash;{band.max} KB
                  </code>
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
                    {result.w !== targetW ? " (enlarged to reach the minimum)" : ""}
                  </code>
                </div>
                <div className="result-row">
                  <span className="result-label">JPG quality</span>
                  <code className="result-val">{Math.round(result.quality * 100)}%</code>
                </div>
              </div>

              {result.inBand ? (
                <p className="muted small">
                  This file is inside the {band.min}&ndash;{band.max} KB range the form asks for.
                </p>
              ) : result.over ? (
                <p className="error">
                  Even the lowest quality stays above {band.max} KB at {targetW}&times;{targetH}px. The
                  requested dimensions are too large for that limit — double-check them against the
                  notification.
                </p>
              ) : (
                <p className="error">
                  This is the largest file these settings can produce, and it is still under{" "}
                  {band.min} KB
                  {allowUpscale ? "" : " — try ticking the enlarge option above"}. That usually means
                  the source photo is soft or low-detail: re-scan or re-shoot it sharper and try
                  again. Nothing is padded with filler bytes to fake the size.
                </p>
              )}

              <div className="btn-row">
                <a className="btn" href={result.url} download={`${kind}-${result.w}x${result.h}.jpg`}>
                  Download JPG
                </a>
              </div>
            </>
          )}

          <p className="muted small">
            Specs are restated in every notification and do change between cycles — always confirm the
            size and dimensions against the official notification for your exam before you upload.
          </p>
        </>
      )}
    </div>
  );
}
