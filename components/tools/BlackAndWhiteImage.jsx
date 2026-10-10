"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { Segmented } from "@/components/calc/Calc";
import { renderMono } from "./grayscale";

const FORMATS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
];

const METHOD_NOTES = {
  luminance: "Keeps each colour as bright as it looks: decodes to linear light and weights red, green and blue by how sensitive the eye is to them.",
  luma: "The classic Rec. 601 weights most apps use. Saturated reds and blues come out darker than they look.",
  average: "Red, green and blue counted equally. Blue skies turn pale and greens turn dark.",
};

const MAX_AREA = 40e6; // past this browsers refuse or blank the canvas
const PREVIEW_MAX = 900; // longest preview side, in canvas pixels

export default function BlackAndWhiteImage() {
  const imgRef = useRef(null);
  const previewRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [mode, setMode] = useState("gray"); // gray | bw
  const [method, setMethod] = useState("luminance");
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [auto, setAuto] = useState(true);
  const [cut, setCut] = useState(128);
  const [dither, setDither] = useState(false);
  const [format, setFormat] = useState("image/png");
  const [autoCut, setAutoCut] = useState(128);

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    // Keep a JPG a JPG: a photo round-tripped to PNG comes back several times bigger.
    setFormat(file?.type === "image/jpeg" ? "image/jpeg" : "image/png");
    setReady(true);
  };

  const tooBig = nat.w * nat.h > MAX_AREA;
  const fmt = FORMATS.find((f) => f.value === format);

  // Draw the source at `scale`, flattening onto white for JPG (no alpha), then
  // run the pixels through the same pipeline at any size. Returns the cut used.
  const paint = (canvas, scale, cutOverride) => {
    const img = imgRef.current;
    canvas.width = Math.max(1, Math.round(nat.w * scale));
    canvas.height = Math.max(1, Math.round(nat.h * scale));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const used = renderMono(id.data, canvas.width, canvas.height, {
      mode,
      method,
      brightness,
      contrast,
      cut: cutOverride !== undefined ? cutOverride : auto ? null : cut,
      dither,
    });
    ctx.putImageData(id, 0, 0);
    return used;
  };

  // The preview is the export pipeline at reduced scale. In auto mode the cut
  // Otsu picks here is the one the download uses, so the file matches what
  // you saw rather than a slightly different cut from the full-size histogram.
  useEffect(() => {
    const canvas = previewRef.current;
    if (!ready || !canvas || !imgRef.current || tooBig) return;
    const used = paint(canvas, Math.min(1, PREVIEW_MAX / Math.max(nat.w, nat.h)));
    if (used != null && auto && used !== autoCut) setAutoCut(used);
  });

  const download = () => {
    if (!imgRef.current || tooBig) return;
    const canvas = document.createElement("canvas");
    paint(canvas, 1, mode === "bw" ? (auto ? autoCut : cut) : undefined);
    const suffix = mode === "bw" ? "black-and-white" : "grayscale";
    downloadCanvas(canvas, `${baseName}-${suffix}.${fmt.ext}`, format, format === "image/jpeg" ? 0.92 : undefined);
  };

  const reset = () => {
    setMethod("luminance");
    setBrightness(0);
    setContrast(0);
    setAuto(true);
    setDither(false);
  };

  const shownCut = auto ? autoCut : cut;
  const previewScaled = Math.max(nat.w, nat.h) > PREVIEW_MAX;

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Converted in your browser — never uploaded." />
      {ready && (
        <>
          <Segmented
            ariaLabel="Style"
            value={mode}
            onChange={setMode}
            options={[
              { value: "gray", label: "Grayscale" },
              { value: "bw", label: "Pure black & white" },
            ]}
          />
          <p className="muted small">
            {mode === "gray"
              ? "Shades of gray, like a black-and-white photo."
              : "Every pixel becomes either black or white — for scanned documents, signatures, stencils and line art."}
          </p>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Conversion</span>
              <select className="inp" value={method} onChange={(e) => setMethod(e.target.value)}>
                <option value="luminance">Natural (luminance)</option>
                <option value="luma">Classic (Rec. 601 luma)</option>
                <option value="average">Average of R, G, B</option>
              </select>
            </label>
          </div>
          <p className="muted small">{METHOD_NOTES[method]}</p>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Brightness: {brightness > 0 ? "+" : ""}{brightness}</span>
              <input type="range" min={-100} max={100} step={1} value={brightness} onChange={(e) => setBrightness(+e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Contrast: {contrast > 0 ? "+" : ""}{contrast}</span>
              <input type="range" min={-100} max={100} step={1} value={contrast} onChange={(e) => setContrast(+e.target.value)} />
            </label>
          </div>

          {mode === "bw" && (
            <>
              {!dither && (
                <>
                  <div className="field-row">
                    <label className="field">
                      <span className="field-label">
                        Threshold: {shownCut}
                        {auto ? " (auto)" : ""} — lighter than this turns white
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={255}
                        step={1}
                        value={shownCut}
                        onChange={(e) => {
                          setAuto(false);
                          setCut(+e.target.value);
                        }}
                      />
                    </label>
                  </div>
                  <label className="check-row">
                    <input
                      type="checkbox"
                      checked={auto}
                      onChange={(e) => {
                        setAuto(e.target.checked);
                        if (!e.target.checked) setCut(autoCut);
                      }}
                    />
                    Pick the threshold automatically
                  </label>
                </>
              )}
              <label className="check-row">
                <input type="checkbox" checked={dither} onChange={(e) => setDither(e.target.checked)} />
                Dither — a dot pattern that keeps a photo&apos;s shading in pure black and white
              </label>
              {dither && (
                <p className="muted small">
                  Dithering keeps the image&apos;s overall tone, so there is no threshold to set — use Brightness and
                  Contrast to make the result lighter, darker or punchier.
                </p>
              )}
            </>
          )}

          <div className={"svg-stage" + (format === "image/jpeg" ? "" : " svg-stage-alpha")}>
            {tooBig ? (
              <p className="error">
                {nat.w}×{nat.h}px is past what browsers will allocate for a canvas. Shrink it first with the{" "}
                <a href="/image/image-resizer">image resizer</a>.
              </p>
            ) : (
              <canvas ref={previewRef} className="rotate-canvas" aria-label="Preview of the converted image" />
            )}
          </div>
          <p className="muted small">
            {nat.w}×{nat.h}px — the download keeps the full size.
            {previewScaled && mode === "bw" && dither && " The preview is scaled down, so the dots in the file are finer than they look here."}
          </p>

          <Segmented
            ariaLabel="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
          />
          <p className="muted small">
            {format === "image/jpeg"
              ? "JPG has no transparency, so see-through areas become white. For pure black and white, PNG is sharper and usually smaller."
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
