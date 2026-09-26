"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { Segmented } from "@/components/calc/Calc";
import { normAngle, isRightAngle, outputSize, drawTransformed, flipAfter, simplify, describe } from "./imageRotate";

const IDENTITY = { angle: 0, flipH: false, flipV: false };

const FORMATS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
];

// Past this a browser either refuses the canvas or hands back a blank one; a
// photo turned 45° grows by up to 2×, so a big panorama can get there.
const MAX_AREA = 40e6;
const PREVIEW_MAX = 900; // longest preview side, in canvas pixels

export default function RotateImage() {
  const imgRef = useRef(null);
  const previewRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [t, setT] = useState(IDENTITY);
  const [corners, setCorners] = useState("expand"); // expand | crop
  const [format, setFormat] = useState("image/png");
  const [bg, setBg] = useState("transparent"); // transparent | white | custom
  const [bgColor, setBgColor] = useState("#ffffff");

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    setT(IDENTITY);
    setCorners("expand");
    // Keep a JPG a JPG: a photo round-tripped to PNG comes back several times bigger.
    setFormat(file?.type === "image/jpeg" ? "image/jpeg" : "image/png");
    setReady(true);
  };

  const right = isRightAngle(t.angle);
  const out = outputSize(nat.w, nat.h, t, corners);
  const tooBig = out.w * out.h > MAX_AREA;
  const fmt = FORMATS.find((f) => f.value === format);
  // Background shows through the corners a free angle opens up, and through any
  // transparency in the source; JPG cannot store alpha, so it always gets a fill.
  const effBg = format === "image/jpeg" && bg === "transparent" ? "white" : bg;
  const fill = effBg === "transparent" ? null : effBg === "white" ? "#ffffff" : bgColor;
  const showsCorners = !right && corners === "expand";

  const paint = (canvas, scale) => {
    const img = imgRef.current;
    canvas.width = Math.max(1, Math.round(out.w * scale));
    canvas.height = Math.max(1, Math.round(out.h * scale));
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    drawTransformed(ctx, img, nat.w, nat.h, t, out.w, out.h, scale);
  };

  // The preview is the export pipeline at reduced scale, so what you see is
  // what the file will contain — corners, fill and all.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!ready || !canvas || !imgRef.current || tooBig) return;
    paint(canvas, Math.min(1, PREVIEW_MAX / Math.max(out.w, out.h)));
  });

  const turn = (deg) => setT((p) => simplify({ ...p, angle: p.angle + deg }));
  const flip = (axis) => setT((p) => flipAfter(p, axis));
  const setAngle = (v) => {
    const n = parseFloat(v);
    setT((p) => ({ ...p, angle: normAngle(Number.isFinite(n) ? Math.round(n * 10) / 10 : 0) }));
  };

  const download = () => {
    if (!imgRef.current || tooBig) return;
    const canvas = document.createElement("canvas");
    paint(canvas, 1);
    downloadCanvas(canvas, `${baseName}-rotated.${fmt.ext}`, format, format === "image/jpeg" ? 0.92 : undefined);
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Rotated in your browser — never uploaded." />
      {ready && (
        <>
          <div className="btn-row">
            <button className="btn btn-ghost btn-sm" onClick={() => turn(-90)}>↺ Rotate left</button>
            <button className="btn btn-ghost btn-sm" onClick={() => turn(90)}>↻ Rotate right</button>
            <button className="btn btn-ghost btn-sm" onClick={() => turn(180)}>180°</button>
            <button className="btn btn-ghost btn-sm" onClick={() => flip("h")}>⇆ Flip horizontal</button>
            <button className="btn btn-ghost btn-sm" onClick={() => flip("v")}>⇅ Flip vertical</button>
          </div>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Angle: {t.angle}° {t.angle > 0 ? "clockwise" : t.angle < 0 ? "anticlockwise" : ""}</span>
              <input
                type="range"
                min={-180}
                max={180}
                step={0.5}
                value={t.angle}
                onChange={(e) => setAngle(e.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Exact angle (°)</span>
              <input
                className="inp"
                type="number"
                min={-180}
                max={180}
                step={0.1}
                value={t.angle}
                onChange={(e) => setAngle(e.target.value)}
              />
            </label>
          </div>

          {!right && (
            <>
              <Segmented
                ariaLabel="Corners"
                value={corners}
                onChange={setCorners}
                options={[
                  { value: "expand", label: "Keep whole picture" },
                  { value: "crop", label: "Crop empty corners" },
                ]}
              />
              <p className="muted small">
                {corners === "expand"
                  ? "The canvas grows to fit the tilted picture, and the corners it opens up are filled with the background below."
                  : "Trims to the largest upright rectangle inside the tilted picture — no filled corners, at the cost of some edge."}
              </p>
            </>
          )}

          <div className={"svg-stage" + (fill ? "" : " svg-stage-alpha")}>
            {tooBig ? (
              <p className="error">
                {out.w}×{out.h}px is past what browsers will allocate for a canvas. Crop the empty corners, or shrink the
                image first with the <a href="/image/image-resizer">image resizer</a>.
              </p>
            ) : (
              <canvas ref={previewRef} className="rotate-canvas" aria-label="Preview of the rotated image" />
            )}
          </div>
          <p className="muted small">
            Original {nat.w}×{nat.h}px → {out.w}×{out.h}px, {describe(t)}.
            {right && t.angle !== 0 && " Right-angle turns move pixels without resampling, so nothing is blurred."}
          </p>

          <Segmented
            ariaLabel="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
          />

          {showsCorners && (
            <div className="field-row">
              <label className="field">
                <span className="field-label">Background</span>
                <select className="inp" value={effBg} onChange={(e) => setBg(e.target.value)}>
                  {format !== "image/jpeg" && <option value="transparent">Transparent</option>}
                  <option value="white">White</option>
                  <option value="custom">Custom colour</option>
                </select>
              </label>
              {effBg === "custom" && (
                <label className="field">
                  <span className="field-label">Colour</span>
                  <input className="qr-color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </label>
              )}
            </div>
          )}
          {format === "image/jpeg" && (
            <p className="muted small">
              JPG has no transparency, so any see-through areas are filled with the background colour. Saving a JPG
              re-encodes it once at high quality; pick PNG for a lossless copy.
            </p>
          )}

          <div className="btn-row">
            <button className="btn" onClick={download} disabled={tooBig}>Download {fmt.label}</button>
            <button className="btn btn-ghost" onClick={() => setT(IDENTITY)}>Reset</button>
          </div>
        </>
      )}
    </div>
  );
}
