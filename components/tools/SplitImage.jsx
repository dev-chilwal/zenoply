"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { downloadBytes } from "./PdfDropzone";
import { Segmented } from "@/components/calc/Calc";
import { buildZip } from "./zip";
import { MAX_SIDE, cropRegion, trimAxis, tileRects, tileName } from "./gridSplit";

const FORMATS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
];

const PRESETS = [
  { value: "1x3", label: "1×3 carousel", rows: 1, cols: 3 },
  { value: "3x3", label: "3×3 grid", rows: 3, cols: 3 },
  { value: "2x3", label: "2×3 grid", rows: 2, cols: 3 },
  { value: "2x2", label: "2×2", rows: 2, cols: 2 },
];

const SHAPE_OPTIONS = [
  { value: "exact", label: "Whole image" },
  { value: "1:1", label: "Square" },
  { value: "4:5", label: "4:5" },
  { value: "3:4", label: "3:4" },
];

const PREVIEW_MAX = 900; // longest preview side, in canvas pixels
const THUMB_MAX = 220; // longest tile-thumbnail side

function canvasBytes(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (b) => {
        if (!b) return reject(new Error("encode"));
        resolve(new Uint8Array(await b.arrayBuffer()));
      },
      type,
      quality
    );
  });
}

export default function SplitImage() {
  const imgRef = useRef(null);
  const previewRef = useRef(null);
  const thumbRefs = useRef([]);

  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [rows, setRows] = useState(1);
  const [cols, setCols] = useState(3);
  const [shape, setShape] = useState("exact");
  const [pos, setPos] = useState(50);
  const [format, setFormat] = useState("image/png");
  const [postingOrder, setPostingOrder] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    // Keep a JPG a JPG: a photo round-tripped to PNG comes back several times bigger.
    setFormat(file?.type === "image/jpeg" ? "image/jpeg" : "image/png");
    setError("");
    setReady(true);
  };

  const region = cropRegion(nat.w, nat.h, { rows, cols, shape, pos: pos / 100 });
  const tiles = tileRects(region, rows, cols);
  const axis = trimAxis(nat.w, nat.h, region);
  const fmt = FORMATS.find((f) => f.value === format);
  const quality = format === "image/jpeg" ? 0.92 : undefined;
  const tooSmall = tiles.some((t) => t.w < 1 || t.h < 1);
  const sizes = [...new Set(tiles.map((t) => `${t.w}×${t.h}`))];
  const preset = PRESETS.find((p) => p.rows === rows && p.cols === cols)?.value ?? "";

  // One tile at full size. JPG has no alpha, so see-through areas go white.
  const paintTile = (canvas, t, scale = 1) => {
    canvas.width = Math.max(1, Math.round(t.w * scale));
    canvas.height = Math.max(1, Math.round(t.h * scale));
    const ctx = canvas.getContext("2d");
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(imgRef.current, t.x, t.y, t.w, t.h, 0, 0, canvas.width, canvas.height);
  };

  // The whole picture with the trimmed-off part dimmed and the cut lines drawn,
  // so the crop position can be judged before anything is downloaded.
  useEffect(() => {
    const canvas = previewRef.current;
    const img = imgRef.current;
    if (!ready || !canvas || !img) return;
    const s = Math.min(1, PREVIEW_MAX / Math.max(nat.w, nat.h));
    canvas.width = Math.max(1, Math.round(nat.w * s));
    canvas.height = Math.max(1, Math.round(nat.h * s));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.drawImage(img, 0, 0, nat.w, nat.h);
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    const { x, y, w, h } = region;
    ctx.fillRect(0, 0, nat.w, y);
    ctx.fillRect(0, y + h, nat.w, nat.h - y - h);
    ctx.fillRect(0, y, x, h);
    ctx.fillRect(x + w, y, nat.w - x - w, h);
    // Lines a fixed 2 screen-ish pixels wide whatever the source resolution.
    const lw = 2 / s;
    ctx.lineWidth = lw;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.setLineDash([6 / s, 4 / s]);
    ctx.beginPath();
    for (const t of tiles) {
      if (t.col > 0) { ctx.moveTo(t.x, t.y); ctx.lineTo(t.x, t.y + t.h); }
      if (t.row > 0) { ctx.moveTo(t.x, t.y); ctx.lineTo(t.x + t.w, t.y); }
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeRect(x + lw / 2, y + lw / 2, w - lw, h - lw);

    tiles.forEach((t, i) => {
      const c = thumbRefs.current[i];
      if (c) paintTile(c, t, Math.min(1, THUMB_MAX / Math.max(t.w, t.h)));
    });
  });

  const nameFor = (t, i) => tileName(baseName, t, i, tiles.length, { postingOrder, ext: fmt.ext });

  const downloadOne = (i) => {
    const canvas = document.createElement("canvas");
    paintTile(canvas, tiles[i]);
    downloadCanvas(canvas, nameFor(tiles[i], i), format, quality);
  };

  // Tiles are encoded one at a time and the canvas is reused, so a 10×10 split
  // of a 12 MP photo never holds more than one tile's pixels at once.
  const downloadZip = async () => {
    if (!imgRef.current || tooSmall) return;
    setBusy(true);
    setError("");
    try {
      const canvas = document.createElement("canvas");
      const entries = [];
      for (let i = 0; i < tiles.length; i++) {
        paintTile(canvas, tiles[i]);
        entries.push({ name: nameFor(tiles[i], i), data: await canvasBytes(canvas, format, quality) });
      }
      canvas.width = 0;
      canvas.height = 0;
      downloadBytes(buildZip(entries), `${baseName}-${rows}x${cols}.zip`, "application/zip");
    } catch {
      setError("Your browser could not encode one of the tiles. Try PNG, or fewer, smaller tiles.");
    } finally {
      setBusy(false);
    }
  };

  const setGrid = (r, c) => {
    setRows(Math.min(MAX_SIDE, Math.max(1, Math.round(Number(r) || 1))));
    setCols(Math.min(MAX_SIDE, Math.max(1, Math.round(Number(c) || 1))));
  };

  const reset = () => {
    setRows(1);
    setCols(3);
    setShape("exact");
    setPos(50);
    setPostingOrder(false);
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Split in your browser — never uploaded." />
      {ready && (
        <>
          <div className="field">
            <span className="field-label">Layout</span>
            <Segmented
              ariaLabel="Grid preset"
              value={preset}
              onChange={(v) => {
                const p = PRESETS.find((x) => x.value === v);
                if (p) setGrid(p.rows, p.cols);
              }}
              options={PRESETS.map((p) => ({ value: p.value, label: p.label }))}
            />
          </div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Rows (1–{MAX_SIDE})</span>
              <input className="inp" type="number" min={1} max={MAX_SIDE} step={1} value={rows} onChange={(e) => setGrid(e.target.value, cols)} />
            </label>
            <label className="field">
              <span className="field-label">Columns (1–{MAX_SIDE})</span>
              <input className="inp" type="number" min={1} max={MAX_SIDE} step={1} value={cols} onChange={(e) => setGrid(rows, e.target.value)} />
            </label>
          </div>

          <div className="field">
            <span className="field-label">Tile shape</span>
            <Segmented ariaLabel="Tile shape" value={shape} onChange={setShape} options={SHAPE_OPTIONS} />
          </div>
          <p className="muted small">
            {shape === "exact"
              ? "Cuts the whole picture with nothing removed. Tiles keep the picture's own proportions, so they may not be square."
              : `Trims the picture so every tile is exactly ${shape === "1:1" ? "square" : shape}. ${
                  shape === "1:1"
                    ? "Square suits a classic grid or a square carousel."
                    : shape === "4:5"
                      ? "4:5 is Instagram's tallest feed post — the best fit for a portrait carousel."
                      : "3:4 matches the tall thumbnails Instagram's profile grid now shows."
                }`}
          </p>
          {axis && (
            <div className="field-row">
              <label className="field">
                <span className="field-label">
                  Keep: {axis === "x" ? (pos < 34 ? "left" : pos > 66 ? "right" : "centre") : pos < 34 ? "top" : pos > 66 ? "bottom" : "centre"} ({pos}%)
                </span>
                <input type="range" min={0} max={100} step={1} value={pos} onChange={(e) => setPos(+e.target.value)} aria-label="Position of the kept area" />
              </label>
            </div>
          )}

          <div className="svg-stage svg-stage-alpha">
            <canvas ref={previewRef} className="rotate-canvas" aria-label="Preview of the image with the cut lines" />
          </div>
          <p className="muted small">
            {nat.w}×{nat.h}px picture
            {axis ? ` trimmed to ${region.w}×${region.h}px` : ""} → {tiles.length} tile{tiles.length === 1 ? "" : "s"} of{" "}
            {sizes.join(" or ")}px.
            {sizes.length > 1 ? " The size does not divide evenly, so the spare pixels are spread one at a time across the tiles — nothing is lost." : ""}
          </p>

          <div
            className="split-grid"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            aria-label="Tiles — select one to download it"
          >
            {tiles.map((t, i) => (
              <button key={`${rows}x${cols}-${i}`} className="split-tile" onClick={() => downloadOne(i)} title={`Download ${nameFor(t, i)}`}>
                <canvas ref={(el) => (thumbRefs.current[i] = el)} />
                <span className="split-num">{postingOrder ? tiles.length - i : i + 1}</span>
              </button>
            ))}
          </div>
          <p className="muted small">Select any tile to download it on its own.</p>

          <label className="check-row">
            <input type="checkbox" checked={postingOrder} onChange={(e) => setPostingOrder(e.target.checked)} />
            Number tiles in Instagram posting order — the bottom-right tile is 1, because the newest post shows at the top left
          </label>

          <Segmented
            ariaLabel="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
          />
          <p className="muted small">
            {format === "image/jpeg"
              ? "JPG keeps photos small. Any see-through areas become white."
              : "PNG is lossless and keeps transparency."}
          </p>

          {error && <p className="error">{error}</p>}
          <div className="btn-row">
            <button className="btn" onClick={downloadZip} disabled={busy || tooSmall}>
              {busy ? "Preparing…" : `Download all ${tiles.length} as ZIP`}
            </button>
            <button className="btn btn-ghost" onClick={reset}>Reset</button>
          </div>
        </>
      )}
    </div>
  );
}
