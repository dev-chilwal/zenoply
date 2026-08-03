"use client";
import { useState, useRef, useCallback } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";

// Aspect presets. ratio = width / height; null means free-form.
const RATIOS = [
  { label: "Free", ratio: null },
  { label: "1:1", ratio: 1 },
  { label: "4:3", ratio: 4 / 3 },
  { label: "3:2", ratio: 3 / 2 },
  { label: "16:9", ratio: 16 / 9 },
  { label: "3:4", ratio: 3 / 4 },
  { label: "2:3", ratio: 2 / 3 },
  { label: "9:16", ratio: 9 / 16 },
];

// The eight resize grips, as the box edges each one moves.
const HANDLES = [
  { key: "nw", x: 0, y: 0 },
  { key: "n", x: 0.5, y: 0 },
  { key: "ne", x: 1, y: 0 },
  { key: "e", x: 1, y: 0.5 },
  { key: "se", x: 1, y: 1 },
  { key: "s", x: 0.5, y: 1 },
  { key: "sw", x: 0, y: 1 },
  { key: "w", x: 0, y: 0.5 },
];

const MIN_PX = 8; // smallest crop side, in source pixels

// Largest box of the given ratio that fits in w×h, centred.
function fitRatio(w, h, ratio) {
  if (!ratio) return { x: 0, y: 0, w, h };
  let bw = w;
  let bh = Math.round(w / ratio);
  if (bh > h) {
    bh = h;
    bw = Math.round(h * ratio);
  }
  return { x: Math.round((w - bw) / 2), y: Math.round((h - bh) / 2), w: bw, h: bh };
}

export default function CropImage() {
  const imgRef = useRef(null);
  const stageRef = useRef(null);
  const dragRef = useRef(null); // { mode, startX, startY, box, scale }

  const [src, setSrc] = useState("");
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ x: 0, y: 0, w: 0, h: 0 }); // source pixels
  const [ratioIdx, setRatioIdx] = useState(0);
  const [format, setFormat] = useState("image/png");
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);

  const ratio = RATIOS[ratioIdx].ratio;

  const onImage = (img, file) => {
    imgRef.current = img;
    setSrc(img.src);
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    setNat({ w, h });
    // Start at 80% of the image, centred — makes the handles obvious.
    const iw = Math.round(w * 0.8);
    const ih = Math.round(h * 0.8);
    setBox({ x: Math.round((w - iw) / 2), y: Math.round((h - ih) / 2), w: iw, h: ih });
    setRatioIdx(0);
    setReady(true);
  };

  // Switching preset re-fits the box to that shape, centred on the image.
  const pickRatio = (i) => {
    setRatioIdx(i);
    const r = RATIOS[i].ratio;
    if (r) setBox(fitRatio(nat.w, nat.h, r));
  };

  // Displayed-pixels-per-source-pixel, read fresh at drag start. Returns 0 when
  // the stage has no measurable width (a hidden tab reports a zero-size box) —
  // dividing by that would turn a small drag into a huge jump.
  const stageScale = () => {
    const stage = stageRef.current;
    if (!stage || !nat.w) return 0;
    const w = stage.getBoundingClientRect().width;
    return w > 1 ? w / nat.w : 0;
  };

  // Pointer capture routes every later event for this pointer back to the element
  // that took the press, so the drag survives the cursor leaving the box — and,
  // unlike window listeners added in an effect, it is live from the first move.
  const startDrag = (e, mode) => {
    const scale = stageScale();
    if (!scale) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, box, scale };
    setDragging(true);
  };

  const onMove = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (e.clientX - d.startX) / d.scale;
      const dy = (e.clientY - d.startY) / d.scale;
      const s = d.box;

      if (d.mode === "move") {
        setBox({
          ...s,
          x: Math.round(Math.min(Math.max(0, s.x + dx), nat.w - s.w)),
          y: Math.round(Math.min(Math.max(0, s.y + dy), nat.h - s.h)),
        });
        return;
      }

      // Resize: move only the edges this handle owns, keeping the opposite ones fixed.
      let left = s.x;
      let top = s.y;
      let right = s.x + s.w;
      let bottom = s.y + s.h;
      if (d.mode.includes("w")) left = Math.min(Math.max(0, s.x + dx), right - MIN_PX);
      if (d.mode.includes("e")) right = Math.max(Math.min(nat.w, right + dx), left + MIN_PX);
      if (d.mode.includes("n")) top = Math.min(Math.max(0, s.y + dy), bottom - MIN_PX);
      if (d.mode.includes("s")) bottom = Math.max(Math.min(nat.h, bottom + dy), top + MIN_PX);

      let w = right - left;
      let h = bottom - top;

      if (ratio) {
        // Drive the locked side from whichever axis this handle actually moves.
        const vertical = d.mode === "n" || d.mode === "s";
        if (vertical) w = h * ratio;
        else h = w / ratio;
        // Re-anchor to the edges the handle is not moving, then shrink to fit.
        if (d.mode.includes("w")) left = right - w;
        else right = left + w;
        if (d.mode.includes("n")) top = bottom - h;
        else bottom = top + h;
        if (left < 0 || right > nat.w || top < 0 || bottom > nat.h) {
          const k = Math.min(
            left < 0 ? (right - 0) / w : 1,
            right > nat.w ? (nat.w - left) / w : 1,
            top < 0 ? (bottom - 0) / h : 1,
            bottom > nat.h ? (nat.h - top) / h : 1
          );
          w *= k;
          h *= k;
          if (d.mode.includes("w")) left = right - w;
          else right = left + w;
          if (d.mode.includes("n")) top = bottom - h;
          else bottom = top + h;
        }
      }

      setBox({
        x: Math.round(Math.max(0, left)),
        y: Math.round(Math.max(0, top)),
        w: Math.max(MIN_PX, Math.round(Math.min(w, nat.w))),
        h: Math.max(MIN_PX, Math.round(Math.min(h, nat.h))),
      });
    },
    [nat.w, nat.h, ratio]
  );

  const endDrag = useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  }, []);

  // Handlers shared by the box and every grip — pointer capture does the rest.
  const dragProps = {
    onPointerMove: onMove,
    onPointerUp: endDrag,
    onPointerCancel: endDrag,
  };

  // Numeric inputs: clamp so the box always stays inside the image.
  const setField = (key, val) => {
    const n = Math.round(parseFloat(val) || 0);
    setBox((b) => {
      const next = { ...b };
      if (key === "x") next.x = Math.min(Math.max(0, n), nat.w - b.w);
      if (key === "y") next.y = Math.min(Math.max(0, n), nat.h - b.h);
      if (key === "w") {
        next.w = Math.min(Math.max(MIN_PX, n), nat.w - b.x);
        if (ratio) next.h = Math.min(Math.round(next.w / ratio), nat.h - b.y);
      }
      if (key === "h") {
        next.h = Math.min(Math.max(MIN_PX, n), nat.h - b.y);
        if (ratio) next.w = Math.min(Math.round(next.h * ratio), nat.w - b.x);
      }
      return next;
    });
  };

  const reset = () => {
    setRatioIdx(0);
    setBox({ x: 0, y: 0, w: nat.w, h: nat.h });
  };

  const download = () => {
    const img = imgRef.current;
    if (!img || box.w < 1 || box.h < 1) return;
    const canvas = document.createElement("canvas");
    canvas.width = box.w;
    canvas.height = box.h;
    const ctx = canvas.getContext("2d");
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, box.w, box.h);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, box.x, box.y, box.w, box.h, 0, 0, box.w, box.h);
    const ext = format === "image/jpeg" ? "jpg" : "png";
    downloadCanvas(canvas, `${baseName}-cropped.${ext}`, format, format === "image/jpeg" ? 0.92 : undefined);
  };

  // Box in percentages of the stage — stays correct at any display size.
  const pct = (v, total) => (total ? (v / total) * 100 + "%" : "0%");

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Cropped in your browser — never uploaded." />
      {ready && (
        <>
          <div className="field">
            <span className="field-label">Aspect ratio</span>
            <div className="chip-row">
              {RATIOS.map((r, i) => (
                <button
                  key={r.label}
                  className={"btn btn-sm " + (i === ratioIdx ? "" : "btn-ghost")}
                  onClick={() => pickRatio(i)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className={"crop-stage" + (dragging ? " dragging" : "")} ref={stageRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Image to crop" draggable={false} />
            <div
              className="crop-box"
              style={{
                left: pct(box.x, nat.w),
                top: pct(box.y, nat.h),
                width: pct(box.w, nat.w),
                height: pct(box.h, nat.h),
              }}
              onPointerDown={(e) => startDrag(e, "move")}
              {...dragProps}
            >
              {HANDLES.map((h) => (
                <span
                  key={h.key}
                  className={"crop-handle crop-handle-" + h.key}
                  style={{ left: h.x * 100 + "%", top: h.y * 100 + "%" }}
                  onPointerDown={(e) => startDrag(e, h.key)}
                  {...dragProps}
                />
              ))}
            </div>
          </div>
          <p className="muted small center">Drag inside the box to move it, or drag a corner or edge to resize.</p>

          <div className="field-row">
            <label className="field">
              <span className="field-label">X (px)</span>
              <input className="inp" type="number" min={0} value={box.x} onChange={(e) => setField("x", e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Y (px)</span>
              <input className="inp" type="number" min={0} value={box.y} onChange={(e) => setField("y", e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Width (px)</span>
              <input className="inp" type="number" min={MIN_PX} value={box.w} onChange={(e) => setField("w", e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Height (px)</span>
              <input className="inp" type="number" min={MIN_PX} value={box.h} onChange={(e) => setField("h", e.target.value)} />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Output format</span>
            <select className="inp" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="image/png">PNG — lossless, keeps transparency</option>
              <option value="image/jpeg">JPG — smaller, no transparency</option>
            </select>
          </label>

          <p className="muted small">
            Original {nat.w}×{nat.h}px → crop {box.w}×{box.h}px
          </p>
          <div className="btn-row">
            <button className="btn" onClick={download}>Download cropped image</button>
            <button className="btn btn-ghost" onClick={reset}>Reset</button>
          </div>
        </>
      )}
    </div>
  );
}
