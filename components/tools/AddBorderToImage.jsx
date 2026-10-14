"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { Segmented } from "@/components/calc/Calc";
import { SIDES, resolveSides, borderLayout, cornerRadius } from "./borderLayout";

const FORMATS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
];

const SWATCHES = [
  { value: "#ffffff", label: "White" },
  { value: "#000000", label: "Black" },
  { value: "#f4efe6", label: "Cream" },
  { value: "#808080", label: "Gray" },
];

const MAX_AREA = 40e6; // past this browsers refuse or blank the canvas
const PREVIEW_MAX = 900; // longest preview side, in canvas pixels
const LIMITS = { pct: 50, px: 4000 };

// A rounded rectangle path built from arcTo, which every canvas supports
// (ctx.roundRect is newer). Filling a path is anti-aliased, unlike clip().
function roundedRect(ctx, w, h, r) {
  ctx.beginPath();
  if (r <= 0) {
    ctx.rect(0, 0, w, h);
    return;
  }
  ctx.moveTo(r, 0);
  ctx.arcTo(w, 0, w, h, r);
  ctx.arcTo(w, h, 0, h, r);
  ctx.arcTo(0, h, 0, 0, r);
  ctx.arcTo(0, 0, w, 0, r);
  ctx.closePath();
}

export default function AddBorderToImage() {
  const imgRef = useRef(null);
  const previewRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [unit, setUnit] = useState("pct"); // pct | px
  const [uniform, setUniform] = useState(true);
  const [size, setSize] = useState(5);
  const [sides, setSides] = useState({ top: 5, right: 5, bottom: 5, left: 5 });
  const [color, setColor] = useState("#ffffff");
  const [radius, setRadius] = useState(0);
  const [square, setSquare] = useState(false);
  const [format, setFormat] = useState("image/png");

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    // Keep a JPG a JPG: a photo round-tripped to PNG comes back several times bigger.
    setFormat(file?.type === "image/jpeg" ? "image/jpeg" : "image/png");
    setReady(true);
  };

  const px = resolveSides(nat.w, nat.h, { unit, uniform, size, sides });
  const layout = borderLayout(nat.w, nat.h, px, { square });
  const r = cornerRadius(radius, layout.width, layout.height);
  const tooBig = layout.width * layout.height > MAX_AREA;
  const fmt = FORMATS.find((f) => f.value === format);

  // Lay the frame out at full size and draw it through ctx.scale, so the
  // preview is the download at reduced scale rather than a separate layout.
  const paint = (canvas, scale) => {
    const img = imgRef.current;
    const { width, height, x, y } = layout;
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
    // Border colour everywhere, then a hole where the picture goes, so a
    // transparent PNG stays transparent instead of picking up the border colour.
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    ctx.clearRect(x, y, nat.w, nat.h);
    ctx.drawImage(img, x, y, nat.w, nat.h);
    if (r > 0) {
      // Mask last, so border and picture share one smooth outer edge.
      ctx.globalCompositeOperation = "destination-in";
      roundedRect(ctx, width, height, r);
      ctx.fill();
    }
    if (format === "image/jpeg") {
      // JPG has no alpha: anything see-through (rounded corners, a PNG's
      // transparent areas) is filled white behind the frame.
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.globalCompositeOperation = "source-over";
  };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!ready || !canvas || !imgRef.current || tooBig) return;
    paint(canvas, Math.min(1, PREVIEW_MAX / Math.max(layout.width, layout.height)));
  });

  const download = () => {
    if (!imgRef.current || tooBig) return;
    const canvas = document.createElement("canvas");
    paint(canvas, 1);
    downloadCanvas(canvas, `${baseName}-border.${fmt.ext}`, format, format === "image/jpeg" ? 0.92 : undefined);
  };

  const changeUnit = (next) => {
    if (next === unit || !nat.w) return setUnit(next);
    // Convert the typed values so the border does not jump when the unit flips.
    const short = Math.min(nat.w, nat.h);
    const conv = (v) =>
      next === "px" ? Math.round((v / 100) * short) : Math.round(((v / short) * 100) * 10) / 10;
    setSize(conv(size));
    setSides(Object.fromEntries(SIDES.map((s) => [s, conv(sides[s])])));
    setUnit(next);
  };

  const toggleUniform = (on) => {
    if (!on && uniform) setSides({ top: size, right: size, bottom: size, left: size });
    setUniform(on);
  };

  const reset = () => {
    setUnit("pct");
    setUniform(true);
    setSize(5);
    setSides({ top: 5, right: 5, bottom: 5, left: 5 });
    setColor("#ffffff");
    setRadius(0);
    setSquare(false);
  };

  const max = LIMITS[unit];
  const clamp = (v) => Math.min(max, Math.max(0, Number(v) || 0));
  const suffix = unit === "pct" ? "%" : "px";
  const transparentCorners = r > 0 && format === "image/png";

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Framed in your browser — never uploaded." />
      {ready && (
        <>
          <Segmented
            ariaLabel="Border unit"
            value={unit}
            onChange={changeUnit}
            options={[
              { value: "pct", label: "% of image" },
              { value: "px", label: "Pixels" },
            ]}
          />
          <p className="muted small">
            {unit === "pct"
              ? `A percentage of the picture's shorter side (${Math.min(nat.w, nat.h)}px), so the border looks the same at any resolution.`
              : "An exact width in pixels of the original image."}
          </p>

          {uniform ? (
            <div className="field-row">
              <label className="field">
                <span className="field-label">
                  Border: {size}
                  {suffix}
                  {unit === "pct" ? ` (${px.top}px)` : ""}
                </span>
                <input
                  type="range"
                  min={0}
                  max={unit === "pct" ? 25 : Math.max(200, Math.round(Math.min(nat.w, nat.h) / 4))}
                  step={unit === "pct" ? 0.5 : 1}
                  value={size}
                  onChange={(e) => setSize(+e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Exact ({suffix})</span>
                <input className="inp" type="number" min={0} max={max} step="any" value={size} onChange={(e) => setSize(clamp(e.target.value))} />
              </label>
            </div>
          ) : (
            <div className="field-row">
              {SIDES.map((s) => (
                <label className="field" key={s}>
                  <span className="field-label">
                    {s[0].toUpperCase() + s.slice(1)} ({suffix}) — {px[s]}px
                  </span>
                  <input
                    className="inp"
                    type="number"
                    min={0}
                    max={max}
                    step="any"
                    value={sides[s]}
                    onChange={(e) => setSides({ ...sides, [s]: clamp(e.target.value) })}
                  />
                </label>
              ))}
            </div>
          )}
          <label className="check-row">
            <input type="checkbox" checked={!uniform} onChange={(e) => toggleUniform(!e.target.checked)} />
            Set each side separately — for example a deeper bottom edge, like a Polaroid
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Border colour</span>
              <input className="inp" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </label>
            <div className="field">
              <span className="field-label">Quick colours</span>
              <Segmented ariaLabel="Quick colours" value={color} onChange={setColor} options={SWATCHES} />
            </div>
          </div>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Rounded corners: {radius}%</span>
              <input type="range" min={0} max={50} step={1} value={radius} onChange={(e) => setRadius(+e.target.value)} />
            </label>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={square} onChange={(e) => setSquare(e.target.checked)} />
            Make it square — pads the shorter side with the border colour so nothing is cropped (Instagram, WhatsApp DP)
          </label>

          <div className={"svg-stage" + (format === "image/jpeg" ? "" : " svg-stage-alpha")}>
            {tooBig ? (
              <p className="error">
                {layout.width}×{layout.height}px is past what browsers will allocate for a canvas. Use a thinner border
                or shrink the picture first with the <a href="/image/image-resizer">image resizer</a>.
              </p>
            ) : (
              <canvas ref={previewRef} className="rotate-canvas" aria-label="Preview of the image with its border" />
            )}
          </div>
          <p className="muted small">
            {nat.w}×{nat.h}px picture → {layout.width}×{layout.height}px with the border. The picture itself is not
            resized or cropped.
          </p>

          <Segmented
            ariaLabel="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
          />
          <p className="muted small">
            {format === "image/jpeg"
              ? r > 0
                ? "JPG has no transparency, so the area outside the rounded corners becomes white. Choose PNG to keep it see-through."
                : "JPG keeps photos small. Any see-through areas become white."
              : transparentCorners
                ? "PNG keeps the area outside the rounded corners transparent."
                : "PNG is lossless and keeps transparency."}
          </p>

          <div className="btn-row">
            <button className="btn" onClick={download} disabled={tooBig}>Download {fmt.label}</button>
            <button className="btn btn-ghost" onClick={reset}>Reset</button>
          </div>
        </>
      )}
    </div>
  );
}
