"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { Segmented } from "@/components/calc/Calc";

// Grips sit on the circle itself at 45°, not on the square's corners, so they
// stay on the picture when the circle touches an edge. sx/sy = which way the
// grip grows the circle.
const D = 0.5 - Math.SQRT1_2 / 2; // 0.1464…
const HANDLES = [
  { key: "nw", x: D, y: D, sx: -1, sy: -1 },
  { key: "ne", x: 1 - D, y: D, sx: 1, sy: -1 },
  { key: "se", x: 1 - D, y: 1 - D, sx: 1, sy: 1 },
  { key: "sw", x: D, y: 1 - D, sx: -1, sy: 1 },
];

const SIZES = [0, 1024, 512, 400, 256, 128]; // 0 = the crop's own size
const MIN_PX = 16; // smallest circle diameter, in source pixels
const PREVIEW_MAX = 320;

const BACKGROUNDS = [
  { value: "transparent", label: "Transparent" },
  { value: "#ffffff", label: "White" },
  { value: "custom", label: "Colour" },
];

// Largest centred circle that fits the image.
function fitCircle(w, h) {
  const side = Math.min(w, h);
  return { x: Math.round((w - side) / 2), y: Math.round((h - side) / 2), side };
}

// Draw the crop as a circle of diameter `out`. Order matters: the ring is drawn
// on the square first, slightly past the edge, and only then is everything
// masked — so the outer edge of image and ring is one anti-aliased curve with
// no fringe of photo pixels peeking out beyond the border. A filled arc with
// destination-in is anti-aliased everywhere; clip() is not in every browser.
function renderCircle(canvas, img, box, out, opts) {
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  const r = out / 2;
  ctx.clearRect(0, 0, out, out);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, box.x, box.y, box.side, box.side, 0, 0, out, out);

  const bw = (out * opts.borderPct) / 100;
  if (bw > 0) {
    ctx.beginPath();
    ctx.arc(r, r, r - bw / 2 + 1, 0, Math.PI * 2);
    ctx.lineWidth = bw + 2;
    ctx.strokeStyle = opts.borderColor;
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "destination-in";
  ctx.beginPath();
  ctx.arc(r, r, r, 0, Math.PI * 2);
  ctx.fill();

  if (opts.bg) {
    ctx.globalCompositeOperation = "destination-over";
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, out, out);
  }
  ctx.globalCompositeOperation = "source-over";
}

export default function CircleCropImage() {
  const imgRef = useRef(null);
  const stageRef = useRef(null);
  const previewRef = useRef(null);
  const dragRef = useRef(null); // { mode, startX, startY, box, scale }

  const [src, setSrc] = useState("");
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [box, setBox] = useState({ x: 0, y: 0, side: 0 }); // source pixels
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState(0);
  const [bgMode, setBgMode] = useState("transparent");
  const [bgColor, setBgColor] = useState("#000000");
  const [borderPct, setBorderPct] = useState(0);
  const [borderColor, setBorderColor] = useState("#ffffff");
  const [format, setFormat] = useState("image/png");

  const onImage = (img, file) => {
    imgRef.current = img;
    setSrc(img.src);
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    setBox(fitCircle(img.naturalWidth, img.naturalHeight));
    setReady(true);
  };

  const bg = bgMode === "transparent" ? null : bgMode === "custom" ? bgColor : bgMode;
  // JPG has no alpha, so it is only offered once the corners have a fill.
  const fileType = bg ? format : "image/png";
  const out = size || box.side;
  const opts = { bg, borderPct, borderColor };

  useEffect(() => {
    const canvas = previewRef.current;
    const img = imgRef.current;
    if (!ready || !canvas || !img || box.side < 1) return;
    renderCircle(canvas, img, box, Math.min(out, PREVIEW_MAX), opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, box, out, bg, borderPct, borderColor]);

  // Displayed-pixels-per-source-pixel, read fresh at drag start. A hidden tab
  // reports a zero-size box; dividing by that would turn a drag into a jump.
  const stageScale = () => {
    const stage = stageRef.current;
    if (!stage || !nat.w) return 0;
    const w = stage.getBoundingClientRect().width;
    return w > 1 ? w / nat.w : 0;
  };

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
          x: Math.round(Math.min(Math.max(0, s.x + dx), nat.w - s.side)),
          y: Math.round(Math.min(Math.max(0, s.y + dy), nat.h - s.side)),
        });
        return;
      }

      // Resize about the opposite corner of the bounding square, which stays put.
      // The drag is projected onto the grip's diagonal so either axis works.
      const h = HANDLES.find((g) => g.key === d.mode);
      const ax = h.sx > 0 ? s.x : s.x + s.side;
      const ay = h.sy > 0 ? s.y : s.y + s.side;
      const room = Math.min(h.sx > 0 ? nat.w - ax : ax, h.sy > 0 ? nat.h - ay : ay);
      const side = Math.round(Math.min(Math.max(MIN_PX, s.side + (h.sx * dx + h.sy * dy) / 2), room));
      setBox({ x: h.sx > 0 ? ax : ax - side, y: h.sy > 0 ? ay : ay - side, side });
    },
    [nat.w, nat.h]
  );

  const endDrag = useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  }, []);

  const dragProps = { onPointerMove: onMove, onPointerUp: endDrag, onPointerCancel: endDrag };

  // Slider resize keeps the circle's centre where it is, as far as the edges allow.
  const maxSide = Math.min(nat.w, nat.h);
  const setSide = (v) => {
    setBox((b) => {
      const side = Math.min(Math.max(MIN_PX, Math.round(v)), maxSide);
      const cx = b.x + b.side / 2;
      const cy = b.y + b.side / 2;
      return {
        side,
        x: Math.round(Math.min(Math.max(0, cx - side / 2), nat.w - side)),
        y: Math.round(Math.min(Math.max(0, cy - side / 2), nat.h - side)),
      };
    });
  };

  const download = () => {
    const img = imgRef.current;
    if (!img || box.side < 1) return;
    const canvas = document.createElement("canvas");
    renderCircle(canvas, img, box, out, opts);
    const ext = fileType === "image/jpeg" ? "jpg" : "png";
    downloadCanvas(canvas, `${baseName}-circle.${ext}`, fileType, fileType === "image/jpeg" ? 0.92 : undefined);
  };

  const pct = (v, total) => (total ? (v / total) * 100 + "%" : "0%");

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Cropped in your browser — never uploaded." />
      {ready && (
        <>
          <div className={"crop-stage" + (dragging ? " dragging" : "")} ref={stageRef}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Image to crop into a circle" draggable={false} />
            <div
              className="crop-box crop-circle"
              style={{
                left: pct(box.x, nat.w),
                top: pct(box.y, nat.h),
                width: pct(box.side, nat.w),
                height: pct(box.side, nat.h),
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
          <p className="muted small center">Drag the circle to move it, or drag a grip on its edge to resize.</p>

          <label className="field">
            <span className="field-label">Circle diameter: {box.side}px</span>
            <input type="range" min={MIN_PX} max={maxSide} value={box.side} onChange={(e) => setSide(e.target.value)} />
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Output size</span>
              <select className="inp" value={size} onChange={(e) => setSize(Number(e.target.value))}>
                {SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s === 0 ? `Original crop (${box.side}×${box.side}px)` : `${s}×${s}px${s > box.side ? " (enlarged)" : ""}`}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field-label">Border: {borderPct === 0 ? "none" : borderPct + "% of width"}</span>
              <input type="range" min={0} max={10} step={0.5} value={borderPct} onChange={(e) => setBorderPct(Number(e.target.value))} />
            </label>
            {borderPct > 0 && (
              <label className="field">
                <span className="field-label">Border colour</span>
                <input className="inp" type="color" value={borderColor} onChange={(e) => setBorderColor(e.target.value)} />
              </label>
            )}
          </div>

          <div className="field">
            <span className="field-label">Corners outside the circle</span>
            <Segmented options={BACKGROUNDS} value={bgMode} onChange={setBgMode} ariaLabel="Background outside the circle" />
          </div>
          {bgMode === "custom" && (
            <label className="field">
              <span className="field-label">Corner colour</span>
              <input className="inp" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
            </label>
          )}
          {bg && (
            <div className="field">
              <span className="field-label">Format</span>
              <Segmented
                options={[{ value: "image/png", label: "PNG" }, { value: "image/jpeg", label: "JPG" }]}
                value={format}
                onChange={setFormat}
                ariaLabel="Output format"
              />
            </div>
          )}

          <div className={"svg-stage" + (bg ? "" : " svg-stage-alpha")}>
            <canvas ref={previewRef} className="rotate-canvas circle-preview" aria-label="Preview of the circular image" />
          </div>
          <p className="muted small center">
            {bg
              ? `Corners filled with ${bgMode === "custom" ? bgColor : "white"} — ${fileType === "image/jpeg" ? "JPG" : "PNG"}, ${out}×${out}px.`
              : `Transparent corners — saved as PNG, ${out}×${out}px. The checkerboard marks see-through areas.`}
          </p>

          <div className="btn-row">
            <button className="btn" onClick={download}>Download circle image</button>
            <button className="btn btn-ghost" onClick={() => setBox(fitCircle(nat.w, nat.h))}>Reset</button>
          </div>
        </>
      )}
    </div>
  );
}
