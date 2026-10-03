"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { Segmented } from "@/components/calc/Calc";
import { REF_PX, fitCaption, strokeWidth } from "./memeLayout";

const FORMATS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
];

// Impact is the meme font, but it ships with Windows and macOS only. The
// fallbacks are the nearest heavy faces on Android, Linux and ChromeOS.
const IMPACT = 'Impact, Haettenschweiler, "Arial Narrow Bold", "Arial Black", sans-serif';
const SANS = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const PREVIEW_MAX = 900; // longest preview side, in canvas pixels
const LINE_HEIGHT = 1.12;

// Each style's defaults: the font size is a share of the image width, the most
// a caption may grow to before it is wrapped and shrunk to fit its band.
const STYLE_DEFAULTS = {
  classic: { size: 11 },
  bar: { size: 6 },
};

export default function MemeGenerator() {
  const imgRef = useRef(null);
  const previewRef = useRef(null);

  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [style, setStyle] = useState("classic"); // classic | bar
  const [top, setTop] = useState("Top text");
  const [bottom, setBottom] = useState("Bottom text");
  const [caption, setCaption] = useState("When the meme generator doesn't upload your photo anywhere");
  const [upper, setUpper] = useState(true);
  const [fill, setFill] = useState("#ffffff");
  const [edge, setEdge] = useState("#000000");
  const [outline, setOutline] = useState(16); // stroke width, % of the font size
  const [size, setSize] = useState(STYLE_DEFAULTS.classic.size);
  const [format, setFormat] = useState("image/png");
  const [overflow, setOverflow] = useState(false);
  const [hasImpact, setHasImpact] = useState(true);

  useEffect(() => {
    setHasImpact(fontInstalled("Impact"));
  }, []);

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    // Keep a JPG a JPG: a photo round-tripped to PNG comes back several times bigger.
    setFormat(file?.type === "image/jpeg" ? "image/jpeg" : "image/png");
    setReady(true);
  };

  const switchStyle = (next) => {
    setStyle(next);
    setSize(STYLE_DEFAULTS[next].size);
  };

  const fmt = FORMATS.find((f) => f.value === format);
  const shout = (s) => (upper ? s.toLocaleUpperCase() : s);
  const hasText = style === "classic" ? (top + bottom).trim().length > 0 : caption.trim().length > 0;

  // Draws the meme onto `canvas` at `scale` of full size and reports whether
  // every caption fitted its band. All lengths are shares of the image width,
  // so the preview is the export pipeline shrunk.
  const paint = (canvas, scale) => {
    const img = imgRef.current;
    const W = Math.max(1, Math.round(nat.w * scale));
    const H = Math.max(1, Math.round(nat.h * scale));
    const pad = W * 0.04;
    const ctx = canvas.getContext("2d");

    // Sets the font on every call: drawing a caption changes ctx.font, and a
    // canvas resize resets it, so a font set once would go stale between captions.
    const measurer = (family, weight = "") => {
      const font = `${weight} ${REF_PX}px ${family}`.trim();
      return (s) => {
        ctx.font = font;
        return ctx.measureText(s).width;
      };
    };

    if (style === "bar") {
      // Caption bar above the picture: black text on a white band that grows
      // with the caption, the format used on most social feeds today.
      const text = caption.trim();
      const fit = text
        ? fitCaption(text, {
            maxW: W - 2 * pad,
            maxH: H * 1.5,
            startPx: (W * size) / 100,
            minPx: W * 0.025,
            lineHeight: LINE_HEIGHT,
            measure: measurer(SANS, "500"),
          })
        : null;
      const bar = fit ? Math.round(fit.height + 2 * pad) : 0;
      canvas.width = W;
      canvas.height = H + bar;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H + bar);
      ctx.drawImage(img, 0, bar, W, H);
      if (fit) {
        ctx.font = `500 ${fit.px}px ${SANS}`;
        ctx.fillStyle = "#111111";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        fit.lines.forEach((line, i) => {
          ctx.fillText(line, W / 2, pad + (i + 0.5) * fit.px * LINE_HEIGHT);
        });
      }
      return fit ? fit.fits : true;
    }

    canvas.width = W;
    canvas.height = H;
    ctx.clearRect(0, 0, W, H);
    if (format === "image/jpeg") {
      // JPG has no alpha; fill so transparent areas come out white, not black.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
    }
    ctx.drawImage(img, 0, 0, W, H);

    // Each caption gets at most a third of the height, so top and bottom text
    // never meet in the middle of the picture.
    const measure = measurer(IMPACT);
    const opts = {
      maxW: W - 2 * pad,
      maxH: H / 3 - pad,
      startPx: (W * size) / 100,
      minPx: W * 0.025,
      lineHeight: LINE_HEIGHT,
      measure,
    };
    let fits = true;
    for (const [raw, where] of [[top, "top"], [bottom, "bottom"]]) {
      const text = shout(raw.trim());
      if (!text) continue;
      const fit = fitCaption(text, opts);
      fits = fits && fit.fits;
      const y0 = where === "top" ? pad : H - pad - fit.height;
      const ys = fit.lines.map((_, i) => y0 + (i + 0.5) * fit.px * LINE_HEIGHT);
      ctx.font = `${fit.px}px ${IMPACT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      // All outlines first, then all fills, so one line's outline never cuts
      // into the letters of the line above it.
      const lw = strokeWidth(fit.px, outline);
      if (lw > 0) {
        ctx.strokeStyle = edge;
        ctx.lineWidth = lw;
        fit.lines.forEach((line, i) => ctx.strokeText(line, W / 2, ys[i]));
      }
      ctx.fillStyle = fill;
      fit.lines.forEach((line, i) => ctx.fillText(line, W / 2, ys[i]));
    }
    return fits;
  };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!ready || !canvas || !imgRef.current) return;
    const fits = paint(canvas, Math.min(1, PREVIEW_MAX / Math.max(nat.w, nat.h)));
    if (overflow === fits) setOverflow(!fits);
  });

  const download = () => {
    if (!imgRef.current || !hasText) return;
    const canvas = document.createElement("canvas");
    paint(canvas, 1);
    downloadCanvas(canvas, `${baseName}-meme.${fmt.ext}`, format, format === "image/jpeg" ? 0.92 : undefined);
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Made into a meme in your browser — never uploaded." />
      {ready && (
        <>
          <Segmented
            ariaLabel="Meme style"
            value={style}
            onChange={switchStyle}
            options={[
              { value: "classic", label: "Top & bottom text" },
              { value: "bar", label: "Caption above" },
            ]}
          />

          {style === "classic" ? (
            <>
              <label className="field">
                <span className="field-label">Top text</span>
                <textarea className="ta" rows={2} value={top} onChange={(e) => setTop(e.target.value)} />
              </label>
              <label className="field">
                <span className="field-label">Bottom text</span>
                <textarea className="ta" rows={2} value={bottom} onChange={(e) => setBottom(e.target.value)} />
              </label>
              <div className="field-row">
                <label className="field">
                  <span className="field-label">Text colour</span>
                  <input className="qr-color" type="color" value={fill} onChange={(e) => setFill(e.target.value)} />
                </label>
                <label className="field">
                  <span className="field-label">Outline colour</span>
                  <input className="qr-color" type="color" value={edge} onChange={(e) => setEdge(e.target.value)} />
                </label>
              </div>
              <label className="check-row">
                <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
                ALL CAPS
              </label>
            </>
          ) : (
            <label className="field">
              <span className="field-label">Caption</span>
              <textarea className="ta" rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} />
            </label>
          )}

          <div className="field-row">
            <label className="field">
              <span className="field-label">Max text size: {size}% of width</span>
              <input type="range" min={3} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </label>
            {style === "classic" && (
              <label className="field">
                <span className="field-label">Outline: {outline === 0 ? "off" : `${outline}%`}</span>
                <input type="range" min={0} max={30} value={outline} onChange={(e) => setOutline(Number(e.target.value))} />
              </label>
            )}
          </div>

          <div className="svg-stage svg-stage-alpha">
            <canvas ref={previewRef} className="rotate-canvas" aria-label="Preview of the meme" />
          </div>
          <p className="muted small">
            {nat.w}×{nat.h}px — the download keeps the original resolution
            {style === "bar" ? ", plus the caption bar on top." : "."}
            {" "}Long captions wrap and shrink to fit automatically.
            {overflow && " This caption is too long to fit at a readable size — try shortening it."}
          </p>
          {style === "classic" && !hasImpact && (
            <p className="muted small">
              Impact isn&apos;t installed on this device, so the nearest heavy font is used instead. Make the meme on a
              Windows PC or a Mac for the classic look.
            </p>
          )}

          <Segmented
            ariaLabel="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
          />

          <div className="btn-row">
            <button className="btn" onClick={download} disabled={!hasText}>Download {fmt.label}</button>
          </div>
        </>
      )}
    </div>
  );
}

// Whether a font is installed locally: text set in it, with a monospace and a
// serif fallback behind it, measures differently from text in the fallback
// alone. A missing font falls through to both fallbacks and matches each.
function fontInstalled(name) {
  try {
    const ctx = document.createElement("canvas").getContext("2d");
    const sample = "mmmmmmmmmmlli1WQ";
    return ["monospace", "serif"].some((fb) => {
      ctx.font = `72px ${fb}`;
      const base = ctx.measureText(sample).width;
      ctx.font = `72px "${name}", ${fb}`;
      return ctx.measureText(sample).width !== base;
    });
  } catch {
    return true;
  }
}
