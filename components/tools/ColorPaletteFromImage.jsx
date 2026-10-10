"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import OutputBox from "@/components/OutputBox";
import { Segmented } from "@/components/calc/Calc";
import { extractPalette, formatPalette, rgbToHsl, textOn, hex } from "./palette";

const SAMPLE_MAX = 300; // longest side of the analysed copy — ~90k pixels is plenty for shares to a tenth of a percent
const PREVIEW_MAX = 900;
const MAX_AREA = 40e6;

const MODE_NOTES = {
  dominant: "The colors that cover the most of the picture, each with the share of pixels it stands for.",
  distinct: "Spreads the colors out instead: a small accent — a red flower, a logo on a wall — gets its own swatch rather than being folded into the background.",
};

export default function ColorPaletteFromImage() {
  const imgRef = useRef(null);
  const previewRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [count, setCount] = useState(6);
  const [mode, setMode] = useState("dominant");
  const [sortBy, setSortBy] = useState("share");
  const [fmt, setFmt] = useState("hex");
  const [colors, setColors] = useState([]);
  const [empty, setEmpty] = useState(false);
  const [picked, setPicked] = useState(null);
  const [copied, setCopied] = useState("");
  const pixelsRef = useRef(null);

  const onImage = (img, file) => {
    imgRef.current = img;
    pixelsRef.current = null;
    setPicked(null);
    setColors([]);
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    setReady(true);
  };

  const tooBig = nat.w * nat.h > MAX_AREA;

  // Downscale once per image into a small RGBA buffer; re-clustering on a
  // count or mode change then never touches the full-size image again.
  useEffect(() => {
    if (!ready || tooBig || !imgRef.current) return;
    const img = imgRef.current;
    if (!pixelsRef.current) {
      const s = Math.min(1, SAMPLE_MAX / Math.max(nat.w, nat.h));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(nat.w * s));
      c.height = Math.max(1, Math.round(nat.h * s));
      const ctx = c.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, c.width, c.height);
      pixelsRef.current = ctx.getImageData(0, 0, c.width, c.height).data;
    }
    const res = extractPalette(pixelsRef.current, { k: count, mode });
    setColors(res.colors);
    setEmpty(res.total === 0);
  }, [ready, tooBig, nat, count, mode]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!ready || tooBig || !canvas || !imgRef.current) return;
    const s = Math.min(1, PREVIEW_MAX / Math.max(nat.w, nat.h));
    canvas.width = Math.max(1, Math.round(nat.w * s));
    canvas.height = Math.max(1, Math.round(nat.h * s));
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgRef.current, 0, 0, canvas.width, canvas.height);
  }, [ready, tooBig, nat]);

  // Eyedropper: read the exact source pixel under the click, not the scaled
  // preview's blend of neighbours, by drawing that one pixel 1:1.
  const pick = (e) => {
    const canvas = previewRef.current;
    if (!canvas || !imgRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.min(nat.w - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * nat.w)));
    const y = Math.min(nat.h - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * nat.h)));
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(imgRef.current, x, y, 1, 1, 0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    setPicked({ r, g, b, a, x, y, hex: hex(r, g, b) });
  };

  const copy = async (val, key) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch {}
  };

  const shown = sortBy === "share" ? colors : colors.slice().sort((p, q) => q.L - p.L);

  // A swatch strip with each color's HEX printed on it, for pasting into a
  // brief or a mood board.
  const downloadStrip = () => {
    if (!shown.length) return;
    const sw = 240, h = 320;
    const c = document.createElement("canvas");
    c.width = sw * shown.length;
    c.height = h;
    const ctx = c.getContext("2d");
    shown.forEach((col, i) => {
      ctx.fillStyle = col.hex;
      ctx.fillRect(i * sw, 0, sw, h);
      ctx.fillStyle = textOn(col.r, col.g, col.b);
      ctx.font = "600 28px ui-monospace, Menlo, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(col.hex.toUpperCase(), i * sw + sw / 2, h - 36);
    });
    downloadCanvas(c, `${baseName}-palette.png`);
  };

  const rowsFor = (col) => {
    const hsl = rgbToHsl(col.r, col.g, col.b);
    return [
      ["HEX", col.hex.toUpperCase()],
      ["RGB", `rgb(${col.r}, ${col.g}, ${col.b})`],
      ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
    ];
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Analysed in your browser — never uploaded." />
      {ready && (
        <>
          {tooBig ? (
            <p className="error">
              {nat.w}×{nat.h}px is past what browsers will allocate for a canvas. Shrink it first with the{" "}
              <a href="/image/image-resizer">image resizer</a>.
            </p>
          ) : (
            <>
              <div className="field-row">
                <label className="field">
                  <span className="field-label">Number of colors: {count}</span>
                  <input type="range" min={2} max={12} step={1} value={count} onChange={(e) => setCount(+e.target.value)} />
                </label>
              </div>
              <Segmented
                ariaLabel="Palette style"
                value={mode}
                onChange={setMode}
                options={[
                  { value: "dominant", label: "Dominant" },
                  { value: "distinct", label: "Distinct" },
                ]}
              />
              <p className="muted small">{MODE_NOTES[mode]}</p>

              {empty ? (
                <p className="error">This image is fully transparent, so there are no colors to read.</p>
              ) : (
                <>
                  <div className="palette-strip" role="list" aria-label="Extracted palette">
                    {shown.map((col) => (
                      <button
                        key={col.hex + col.count}
                        role="listitem"
                        className="palette-chip"
                        style={{ background: col.hex, color: textOn(col.r, col.g, col.b), flexGrow: sortBy === "share" ? Math.max(col.share, 0.04) : 1 }}
                        onClick={() => copy(col.hex.toUpperCase(), "chip" + col.hex)}
                        title={`Copy ${col.hex.toUpperCase()}`}
                      >
                        <span className="mono">{copied === "chip" + col.hex ? "Copied" : col.hex.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                  <Segmented
                    ariaLabel="Order"
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: "share", label: "By share" },
                      { value: "light", label: "Light to dark" },
                    ]}
                  />

                  <div className="palette-table-wrap">
                    <table className="palette-table">
                      <thead>
                        <tr>
                          <th scope="col" aria-label="Swatch" />
                          <th scope="col">HEX</th>
                          <th scope="col">RGB</th>
                          <th scope="col">HSL</th>
                          <th scope="col">Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shown.map((col) => {
                          const [hx, rgb, hsl] = rowsFor(col).map((r) => r[1]);
                          return (
                            <tr key={col.hex + col.count}>
                              <td><span className="palette-dot" style={{ background: col.hex }} aria-hidden /></td>
                              <td><button className="palette-copy mono" onClick={() => copy(hx, "h" + col.hex)}>{copied === "h" + col.hex ? "Copied" : hx}</button></td>
                              <td><button className="palette-copy mono" onClick={() => copy(rgb, "r" + col.hex)}>{copied === "r" + col.hex ? "Copied" : rgb}</button></td>
                              <td><button className="palette-copy mono" onClick={() => copy(hsl, "s" + col.hex)}>{copied === "s" + col.hex ? "Copied" : hsl}</button></td>
                              <td className="mono">{col.share < 0.001 ? "<0.1" : (col.share * 100).toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="muted small">Click any value to copy it. Shares are of the visible pixels; fully see-through areas are left out.</p>

                  <Segmented
                    ariaLabel="Export format"
                    value={fmt}
                    onChange={setFmt}
                    options={[
                      { value: "hex", label: "HEX list" },
                      { value: "css", label: "CSS variables" },
                      { value: "scss", label: "SCSS" },
                      { value: "json", label: "JSON" },
                    ]}
                  />
                  <OutputBox
                    value={formatPalette(shown, fmt)}
                    downloadName={`${baseName}-palette.${{ hex: "txt", css: "css", scss: "scss", json: "json" }[fmt]}`}
                  />
                  <div className="btn-row">
                    <button className="btn" onClick={downloadStrip}>Download palette PNG</button>
                  </div>
                </>
              )}

              <h3 className="palette-sub">Pick a color from the image</h3>
              <p className="muted small">Click anywhere on the picture to read the exact color of that pixel.</p>
              <div className="svg-stage svg-stage-alpha">
                <canvas ref={previewRef} className="rotate-canvas palette-pick" onClick={pick} aria-label="Image — click to pick a color" />
              </div>
              {picked && (
                <div className="result-list">
                  <div className="result-row">
                    <span className="swatch" style={{ background: picked.hex }} aria-hidden />
                    <span className="muted small">
                      Pixel {picked.x}, {picked.y}
                      {picked.a < 255 ? ` — ${Math.round((picked.a / 255) * 100)}% opaque` : ""}
                    </span>
                  </div>
                  {rowsFor(picked).map(([label, val]) => (
                    <div key={label} className="result-row">
                      <span className="result-label">{label}</span>
                      <code className="result-val">{val}</code>
                      <button className="btn-sm" onClick={() => copy(val, "p" + label)}>
                        {copied === "p" + label ? "Copied" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
