"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { Segmented } from "@/components/calc/Calc";
import { POSITIONS, anchorCenter, tileCenters } from "./watermarkLayout";

const FORMATS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
];

const POSITION_LABELS = {
  "top-left": "↖", top: "↑", "top-right": "↗",
  left: "←", center: "•", right: "→",
  "bottom-left": "↙", bottom: "↓", "bottom-right": "↘",
};

const FONT = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const PREVIEW_MAX = 900; // longest preview side, in canvas pixels

// Per-layout defaults: a single mark sits level in a corner; a tiled pattern
// is smaller and tilted, the way stock-photo proofs are marked.
const LAYOUT_DEFAULTS = {
  single: { size: 30, angle: 0, opacity: 60 },
  tile: { size: 22, angle: -30, opacity: 25 },
};

export default function WatermarkImage() {
  const imgRef = useRef(null);
  const logoRef = useRef(null);
  const previewRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [kind, setKind] = useState("text"); // text | logo
  const [text, setText] = useState("© Your Name");
  const [color, setColor] = useState("#ffffff");
  const [shadow, setShadow] = useState(true);
  const [logoName, setLogoName] = useState("");
  const [logoError, setLogoError] = useState("");
  const [logoTick, setLogoTick] = useState(0); // re-renders the preview once a logo loads
  const [layout, setLayout] = useState("single"); // single | tile
  const [position, setPosition] = useState("bottom-right");
  const [size, setSize] = useState(LAYOUT_DEFAULTS.single.size); // % of image width
  const [opacity, setOpacity] = useState(LAYOUT_DEFAULTS.single.opacity);
  const [angle, setAngle] = useState(LAYOUT_DEFAULTS.single.angle);
  const [margin, setMargin] = useState(3); // % of the shorter side
  const [gap, setGap] = useState(8); // tile spacing, % of the shorter side
  const [format, setFormat] = useState("image/png");

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    // Keep a JPG a JPG: a photo round-tripped to PNG comes back several times bigger.
    setFormat(file?.type === "image/jpeg" ? "image/jpeg" : "image/png");
    setReady(true);
  };

  const onLogo = (file) => {
    setLogoError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setLogoError("That file isn't an image. A PNG with a transparent background works best.");
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      logoRef.current = img;
      setLogoName(file.name);
      setLogoTick((n) => n + 1);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setLogoError("Couldn't read that logo. It may be corrupted or an unsupported format.");
    };
    img.src = url;
  };

  const switchLayout = (next) => {
    setLayout(next);
    const d = LAYOUT_DEFAULTS[next];
    setSize(d.size);
    setAngle(d.angle);
    setOpacity(d.opacity);
  };

  const fmt = FORMATS.find((f) => f.value === format);
  const hasMark = kind === "text" ? text.trim().length > 0 : !!logoRef.current;

  // Draws the photo plus the watermark onto `canvas` at `scale` of full size.
  // Every watermark length is a fraction of the image, so the preview is the
  // export pipeline shrunk — what you see is where the mark lands in the file.
  const paint = (canvas, scale) => {
    const img = imgRef.current;
    const W = Math.max(1, Math.round(nat.w * scale));
    const H = Math.max(1, Math.round(nat.h * scale));
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    if (format === "image/jpeg") {
      // JPG has no alpha; fill so transparent areas come out white, not black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.drawImage(img, 0, 0, W, H);
    if (!hasMark) return;

    const targetW = (W * size) / 100;
    let markW;
    let markH;
    let drawMark; // draws one mark centred on (0, 0)
    if (kind === "text") {
      const label = text.trim();
      // Size the font so the text spans the chosen share of the width.
      ctx.font = `bold 100px ${FONT}`;
      const at100 = Math.max(1, ctx.measureText(label).width);
      const px = Math.max(1, (100 * targetW) / at100);
      ctx.font = `bold ${px}px ${FONT}`;
      markW = ctx.measureText(label).width;
      markH = px;
      drawMark = () => {
        ctx.font = `bold ${px}px ${FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        if (shadow) {
          // A soft contrasting shadow keeps the mark legible over both light
          // and dark parts of the photo.
          const dark = isLight(color);
          ctx.shadowColor = dark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.55)";
          ctx.shadowBlur = px * 0.12;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = px * 0.04;
        }
        ctx.fillStyle = color;
        ctx.fillText(label, 0, 0);
      };
    } else {
      const logo = logoRef.current;
      markW = targetW;
      markH = (targetW * logo.naturalHeight) / logo.naturalWidth;
      drawMark = () => ctx.drawImage(logo, -markW / 2, -markH / 2, markW, markH);
    }

    const rad = (angle * Math.PI) / 180;
    ctx.save();
    ctx.globalAlpha = opacity / 100;
    if (layout === "single") {
      const c = anchorCenter(W, H, markW, markH, angle, position, margin);
      ctx.translate(c.x, c.y);
      ctx.rotate(rad);
      drawMark();
    } else {
      ctx.translate(W / 2, H / 2);
      ctx.rotate(rad);
      for (const p of tileCenters(W, H, markW, markH, gap)) {
        ctx.save();
        ctx.translate(p.x, p.y);
        drawMark();
        ctx.restore();
      }
    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!ready || !canvas || !imgRef.current) return;
    paint(canvas, Math.min(1, PREVIEW_MAX / Math.max(nat.w, nat.h)));
  });

  const download = () => {
    if (!imgRef.current || !hasMark) return;
    const canvas = document.createElement("canvas");
    paint(canvas, 1);
    downloadCanvas(canvas, `${baseName}-watermarked.${fmt.ext}`, format, format === "image/jpeg" ? 0.92 : undefined);
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Watermarked in your browser — never uploaded." />
      {ready && (
        <>
          <Segmented
            ariaLabel="Watermark type"
            value={kind}
            onChange={setKind}
            options={[
              { value: "text", label: "Text" },
              { value: "logo", label: "Logo image" },
            ]}
          />

          {kind === "text" ? (
            <>
              <label className="field">
                <span className="field-label">Watermark text</span>
                <input className="inp" value={text} onChange={(e) => setText(e.target.value)} placeholder="© Your Name" />
              </label>
              <div className="field-row">
                <label className="field">
                  <span className="field-label">Colour</span>
                  <input className="qr-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </label>
                <label className="check-row">
                  <input type="checkbox" checked={shadow} onChange={(e) => setShadow(e.target.checked)} />
                  Soft shadow for contrast
                </label>
              </div>
            </>
          ) : (
            <label className="field">
              <span className="field-label">Logo file {logoName && `— ${logoName}`}</span>
              <input className="inp" type="file" accept="image/*" onChange={(e) => onLogo(e.target.files?.[0])} />
              <span className="muted small">A PNG with a transparent background blends in best.</span>
              {logoError && <span className="error">{logoError}</span>}
            </label>
          )}

          <Segmented
            ariaLabel="Layout"
            value={layout}
            onChange={switchLayout}
            options={[
              { value: "single", label: "Single mark" },
              { value: "tile", label: "Tiled pattern" },
            ]}
          />

          {layout === "single" && (
            <div className="field">
              <span className="field-label">Position</span>
              <div className="wm-grid" role="radiogroup" aria-label="Watermark position">
                {POSITIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={position === p}
                    aria-label={p.replace("-", " ")}
                    className={"wm-cell" + (position === p ? " wm-cell-on" : "")}
                    onClick={() => setPosition(p)}
                  >
                    {POSITION_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="field-row">
            <label className="field">
              <span className="field-label">Size: {size}% of width</span>
              <input type="range" min={5} max={90} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </label>
            <label className="field">
              <span className="field-label">Opacity: {opacity}%</span>
              <input type="range" min={5} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Rotation: {angle}°</span>
              <input type="range" min={-90} max={90} value={angle} onChange={(e) => setAngle(Number(e.target.value))} />
            </label>
            {layout === "single" ? (
              <label className="field">
                <span className="field-label">Margin from edge: {margin}%</span>
                <input type="range" min={0} max={15} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
              </label>
            ) : (
              <label className="field">
                <span className="field-label">Spacing: {gap}%</span>
                <input type="range" min={0} max={40} value={gap} onChange={(e) => setGap(Number(e.target.value))} />
              </label>
            )}
          </div>

          <div className="svg-stage svg-stage-alpha">
            <canvas
              ref={previewRef}
              className="rotate-canvas"
              aria-label="Preview of the watermarked image"
              data-logo={logoTick}
            />
          </div>
          <p className="muted small">
            {nat.w}×{nat.h}px — the download keeps the original size.
            {!hasMark && (kind === "text" ? " Type some watermark text." : " Choose a logo file.")}
          </p>

          <Segmented
            ariaLabel="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
          />
          {format === "image/jpeg" && (
            <p className="muted small">
              Saving a JPG re-encodes the photo once at high quality; any transparent areas are filled with white. Pick
              PNG for a lossless copy.
            </p>
          )}

          <div className="btn-row">
            <button className="btn" onClick={download} disabled={!hasMark}>Download {fmt.label}</button>
          </div>
        </>
      )}
    </div>
  );
}

// True for a light colour, judged by Rec. 709 luma — it gets a dark shadow.
function isLight(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 140;
}
