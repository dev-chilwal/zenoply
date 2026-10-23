"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ImageDropzone, { fmtBytes } from "./ImageDropzone";
import { downloadBytes } from "./PdfDropzone";
import { Slider, Segmented } from "@/components/calc/Calc";
import { traceSize } from "./vectorize";

const MODES = [
  { value: "color", label: "Colour" },
  { value: "mono", label: "Black & white" },
];

const DETAILS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

// Past this an SVG is usually a photo traced into thousands of blobs: slow to
// open and bigger than the picture it came from.
const HEAVY = 1024 * 1024;

export default function ImageToSvg() {
  const imgRef = useRef(null);
  const workerRef = useRef(null);
  const jobRef = useRef(0);
  const urlRef = useRef("");

  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [srcSize, setSrcSize] = useState(0);
  const [mode, setMode] = useState("color");
  const [colors, setColors] = useState(8);
  const [detail, setDetail] = useState("medium");
  const [smooth, setSmooth] = useState(false);
  const [auto, setAuto] = useState(true);
  const [cut, setCut] = useState(128);
  const [autoCut, setAutoCut] = useState(128);
  const [dropBackground, setDropBackground] = useState(false);
  const [view, setView] = useState("svg");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { svg, url, bytes, paths, colours, cut, traced }
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const release = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
  }, []);

  useEffect(
    () => () => {
      release();
      workerRef.current?.terminate();
    },
    [release]
  );

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    setSrcSize(file?.size || 0);
    release();
    setResult(null);
    setError("");
    setView("svg");
    setReady(true);
  };

  // Re-trace whenever a setting changes. A newer job supersedes an older one:
  // a still-running trace is abandoned by terminating its worker.
  useEffect(() => {
    const img = imgRef.current;
    if (!ready || !img) return;
    const id = ++jobRef.current;
    const timer = setTimeout(() => {
      const { w, h } = traceSize(nat.w, nat.h, detail);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);

      if (busy && workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      const worker = (workerRef.current ||= new Worker(new URL("./vectorize.worker.js", import.meta.url), { type: "module" }));
      setBusy(true);
      setError("");
      worker.onmessage = ({ data: msg }) => {
        if (msg.id !== jobRef.current) return;
        setBusy(false);
        if (msg.error) {
          setError("Could not trace this image: " + msg.error);
          return;
        }
        const blob = new Blob([msg.out.svg], { type: "image/svg+xml" });
        release();
        urlRef.current = URL.createObjectURL(blob);
        setResult({ ...msg.out, url: urlRef.current, bytes: blob.size });
        if (msg.out.cut != null) setAutoCut(msg.out.cut);
      };
      worker.onerror = (e) => {
        if (id !== jobRef.current) return;
        setBusy(false);
        setError("Could not trace this image: " + (e.message || "the tracer stopped"));
        workerRef.current?.terminate();
        workerRef.current = null;
      };
      worker.postMessage(
        {
          id,
          rgba: data.buffer,
          w,
          h,
          opts: { mode, colors, detail, smooth, cut: auto ? null : cut, dropBackground, outW: nat.w, outH: nat.h },
        },
        [data.buffer]
      );
    }, 250);
    return () => clearTimeout(timer);
    // `busy` and `release` are read, not reacted to.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, nat, mode, colors, detail, smooth, auto, cut, dropBackground]);

  const download = () => {
    if (result) downloadBytes(result.svg, `${baseName}.svg`, "image/svg+xml");
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Your browser blocked clipboard access — use Download instead.");
    }
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Traced in your browser — never uploaded." />
      {ready && (
        <>
          <Segmented ariaLabel="Style" value={mode} onChange={setMode} options={MODES} />
          <p className="muted small">
            {mode === "color"
              ? "Traces each colour into its own set of shapes — for logos, icons, flat illustrations and clip art."
              : "Every pixel becomes black or white first, then the black is traced — for signatures, line art, stamps and scanned drawings."}
          </p>

          {mode === "color" ? (
            <>
              <Slider label="Colours" display={colors} value={colors} min={2} max={32} step={1} onChange={setColors} />
              <label className="check-row">
                <input type="checkbox" checked={smooth} onChange={(e) => setSmooth(e.target.checked)} />
                Smooth out noise first — for photos and blocky JPGs
              </label>
            </>
          ) : (
            <>
              <Slider
                label="Threshold — lighter than this turns white"
                display={auto ? `${autoCut} (auto)` : cut}
                value={auto ? autoCut : cut}
                min={1}
                max={255}
                step={1}
                onChange={(v) => {
                  setAuto(false);
                  setCut(v);
                }}
              />
              <label className="check-row">
                <input type="checkbox" checked={auto} onChange={(e) => {
                    setAuto(e.target.checked);
                    if (!e.target.checked) setCut(autoCut);
                  }}
                />
                Pick the threshold automatically
              </label>
            </>
          )}

          <p className="field-label">Detail</p>
          <Segmented ariaLabel="Detail" value={detail} onChange={setDetail} options={DETAILS} />
          <p className="muted small">
            {detail === "low"
              ? "Fewest shapes and the smallest file: traced at up to 500px, specks under 24 pixels are merged into their surroundings and curves are fitted loosely."
              : detail === "medium"
              ? "Traced at up to 1000px with specks under 8 pixels merged away — a balance of accuracy and file size that suits most logos."
              : "Traced at up to 1600px, keeping everything from 3 pixels up and following edges closely — a bigger file, best for intricate artwork."}
          </p>

          <label className="check-row">
            <input type="checkbox" checked={dropBackground} onChange={(e) => setDropBackground(e.target.checked)} />
            Transparent background — leave out the colour around the edges
          </label>

          <Segmented
            ariaLabel="Preview"
            value={view}
            onChange={setView}
            options={[
              { value: "svg", label: "SVG" },
              { value: "original", label: "Original" },
            ]}
          />
          <div className="svg-stage svg-stage-alpha" aria-busy={busy}>
            {view === "original" ? (
              <img src={imgRef.current?.src} alt="The original image" />
            ) : result ? (
              <img src={result.url} alt="Preview of the traced SVG" style={busy ? { opacity: 0.5 } : undefined} />
            ) : (
              <p className="muted">{busy ? "Tracing…" : "Preparing…"}</p>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          {result && (
            <>
              <p className="muted small">
                {busy ? "Re-tracing… " : ""}
                {result.colours} {result.colours === 1 ? "colour" : "colours"}, {result.paths.toLocaleString()}{" "}
                {result.paths === 1 ? "shape" : "shapes"}, {fmtBytes(result.bytes)}
                {srcSize ? ` (the original is ${fmtBytes(srcSize)})` : ""}. Traced at {result.traced.w}×{result.traced.h}
                px; the SVG opens at {nat.w}×{nat.h} and scales to any size.
              </p>
              {result.bytes > HEAVY && (
                <p className="muted small">
                  That is a heavy SVG — usually a photo, where every patch of shading becomes its own shape. Fewer
                  colours, Low detail or smoothing will shrink it a lot; for a photo, a JPG or WebP is the better format.
                </p>
              )}
              <div className="btn-row">
                <button className="btn" onClick={download} disabled={busy}>
                  Download SVG
                </button>
                <button className="btn btn-ghost" onClick={copy} disabled={busy}>
                  {copied ? "Copied" : "Copy SVG code"}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
