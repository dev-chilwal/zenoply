"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";
import { Segmented } from "@/components/calc/Calc";
import { pixelate, gaussianBlur, effectSize, clampRect } from "./blurRegions";

const EFFECTS = [
  { value: "pixelate", label: "Pixelate" },
  { value: "blur", label: "Blur" },
  { value: "box", label: "Solid box" },
];
const SHAPES = [
  { value: "rect", label: "Rectangle" },
  { value: "ellipse", label: "Ellipse" },
];
const HANDLES = [
  { key: "nw", x: 0, y: 0 },
  { key: "ne", x: 1, y: 0 },
  { key: "se", x: 1, y: 1 },
  { key: "sw", x: 0, y: 1 },
];
const PREVIEW_MAX = 1000; // longest side of the on-page preview, in pixels
const MIN_PX = 4; // a drawn region smaller than this (source px) is a stray click

// Apply every region to a canvas holding the picture at `scale` (1 = full size).
// Regions are in source pixels; effect sizes scale with the canvas so the
// preview is the download at reduced size.
function render(canvas, img, regions, scale, opts) {
  const W = Math.max(1, Math.round(img.naturalWidth * scale));
  const H = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, W, H);
  const size = opts.size * scale;

  for (const r of regions) {
    const x = Math.round(r.x * scale);
    const y = Math.round(r.y * scale);
    const w = Math.min(W - x, Math.max(1, Math.round(r.w * scale)));
    const h = Math.min(H - y, Math.max(1, Math.round(r.h * scale)));
    if (w < 1 || h < 1) continue;

    if (opts.effect === "box") {
      ctx.fillStyle = opts.color;
      ctx.beginPath();
      if (opts.shape === "ellipse") ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      else ctx.rect(x, y, w, h);
      ctx.fill();
      continue;
    }

    // Blur reads a margin of surrounding pixels, so the region's edge is blurred
    // with what is really next to it rather than a clamped copy of itself.
    const pad = opts.effect === "blur" ? Math.min(Math.ceil(size * 3), Math.max(W, H)) : 0;
    const px = Math.max(0, x - pad);
    const py = Math.max(0, y - pad);
    const pw = Math.min(W, x + w + pad) - px;
    const ph = Math.min(H, y + h + pad) - py;
    const data = ctx.getImageData(px, py, pw, ph);
    if (opts.effect === "blur") gaussianBlur(data.data, pw, ph, size);
    else pixelate(data.data, pw, ph, Math.max(1, size));

    const tmp = document.createElement("canvas");
    tmp.width = pw;
    tmp.height = ph;
    const t = tmp.getContext("2d");
    t.putImageData(data, 0, 0);
    // Keep only the region itself: a filled shape with destination-in is
    // anti-aliased everywhere, which clip() is not in every browser.
    t.globalCompositeOperation = "destination-in";
    t.beginPath();
    if (opts.shape === "ellipse") t.ellipse(x - px + w / 2, y - py + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else t.rect(x - px, y - py, w, h);
    t.fill();
    if (opts.shape === "rect") {
      // A hard-edged rectangle: replace the pixels outright so a semi-transparent
      // source never shows the original through the effect.
      ctx.clearRect(x, y, w, h);
    }
    ctx.drawImage(tmp, px, py);
  }
}

let nextId = 1;

export default function BlurImage() {
  const imgRef = useRef(null);
  const stageRef = useRef(null);
  const previewRef = useRef(null);
  const dragRef = useRef(null); // { mode, id, startX, startY, region, scale }

  const [baseName, setBaseName] = useState("image");
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [regions, setRegions] = useState([]); // source pixels
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [effect, setEffect] = useState("pixelate");
  const [shape, setShape] = useState("rect");
  const [strength, setStrength] = useState(3); // % of the shorter side
  const [color, setColor] = useState("#000000");
  const [format, setFormat] = useState("image/png");

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    const type = file?.type === "image/jpeg" ? "image/jpeg" : "image/png";
    setFormat(type);
    setNat({ w: img.naturalWidth, h: img.naturalHeight });
    setRegions([]);
    setSelected(null);
    setReady(true);
  };

  const shortSide = Math.min(nat.w, nat.h);
  const size = effectSize(strength, shortSide);
  const opts = { effect, shape, size, color };
  const previewScale = nat.w ? Math.min(1, PREVIEW_MAX / Math.max(nat.w, nat.h)) : 1;

  useEffect(() => {
    const canvas = previewRef.current;
    const img = imgRef.current;
    if (!ready || !canvas || !img) return;
    render(canvas, img, regions, previewScale, opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, regions, effect, shape, size, color, previewScale]);

  // Displayed-pixels-per-source-pixel, read fresh at drag start. A hidden tab
  // reports a zero-size box; dividing by that would turn a drag into a jump.
  const stageScale = () => {
    const stage = stageRef.current;
    if (!stage || !nat.w) return 0;
    const w = stage.getBoundingClientRect().width;
    return w > 1 ? w / nat.w : 0;
  };

  // Everything after pointerdown is captured by the stage, so one set of
  // move/up handlers serves drawing, moving and resizing.
  const begin = (e, mode, region) => {
    const scale = stageScale();
    if (!scale) return;
    e.preventDefault();
    e.stopPropagation();
    const stage = stageRef.current;
    stage.setPointerCapture?.(e.pointerId);
    stage.focus({ preventScroll: true });
    let r = region;
    if (mode === "draw") {
      const rect = stage.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) / scale);
      const y = Math.round((e.clientY - rect.top) / scale);
      r = { id: nextId++, x, y, w: 0, h: 0 };
      setRegions((rs) => [...rs, r]);
    }
    setSelected(r.id);
    dragRef.current = { mode, id: r.id, startX: e.clientX, startY: e.clientY, region: r, scale };
    setDragging(true);
  };

  const onMove = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (e.clientX - d.startX) / d.scale;
      const dy = (e.clientY - d.startY) / d.scale;
      const s = d.region;
      let next;
      if (d.mode === "move") {
        next = {
          ...s,
          x: Math.round(Math.min(Math.max(0, s.x + dx), nat.w - s.w)),
          y: Math.round(Math.min(Math.max(0, s.y + dy), nat.h - s.h)),
        };
      } else if (d.mode === "draw") {
        next = { id: s.id, ...clampRect(s.x, s.y, s.x + dx, s.y + dy, nat.w, nat.h) };
      } else {
        // Corner resize: the opposite corner stays put; dragging past it flips.
        const h = HANDLES.find((g) => g.key === d.mode);
        const ax = h.x ? s.x : s.x + s.w;
        const ay = h.y ? s.y : s.y + s.h;
        const mx = (h.x ? s.x + s.w : s.x) + dx;
        const my = (h.y ? s.y + s.h : s.y) + dy;
        next = { id: s.id, ...clampRect(ax, ay, mx, my, nat.w, nat.h) };
      }
      d.latest = next;
      setRegions((rs) => rs.map((r) => (r.id === d.id ? next : r)));
    },
    [nat.w, nat.h]
  );

  const endDrag = useCallback((e) => {
    stageRef.current?.releasePointerCapture?.(e.pointerId);
    const d = dragRef.current;
    dragRef.current = null;
    setDragging(false);
    if (!d) return;
    // Drop a click that never became a region, and a box shrunk to nothing.
    const r = d.latest || d.region;
    if (r.w < MIN_PX || r.h < MIN_PX) {
      setRegions((rs) => rs.filter((x) => x.id !== d.id));
      setSelected(null);
    }
  }, []);

  const remove = (id) => {
    setRegions((rs) => rs.filter((r) => r.id !== id));
    setSelected(null);
  };

  const onKeyDown = (e) => {
    if ((e.key === "Delete" || e.key === "Backspace") && selected != null) {
      e.preventDefault();
      remove(selected);
    }
  };

  const addWhole = () => {
    const r = { id: nextId++, x: 0, y: 0, w: nat.w, h: nat.h };
    setRegions((rs) => [...rs, r]);
    setSelected(r.id);
  };

  const fileType = format;
  const download = () => {
    const img = imgRef.current;
    if (!img || !regions.length) return;
    const canvas = document.createElement("canvas");
    render(canvas, img, regions, 1, opts);
    const ext = fileType === "image/jpeg" ? "jpg" : "png";
    downloadCanvas(canvas, `${baseName}-blurred.${ext}`, fileType, fileType === "image/jpeg" ? 0.92 : undefined);
  };

  const pct = (v, total) => (total ? (v / total) * 100 + "%" : "0%");
  const sizeLabel =
    effect === "pixelate" ? `${size}px blocks` : effect === "blur" ? `${size}px blur radius` : "";

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG or WebP. Blurred in your browser — never uploaded." />
      {ready && (
        <>
          <div className="field">
            <span className="field-label">Effect</span>
            <Segmented options={EFFECTS} value={effect} onChange={setEffect} ariaLabel="Effect" />
          </div>

          <div
            className={"crop-stage sign-stage blur-stage" + (dragging ? " dragging" : "")}
            ref={stageRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={(e) => begin(e, "draw")}
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            aria-label="Picture — drag across it to mark an area to hide"
          >
            <canvas ref={previewRef} className="blur-preview" aria-label="Preview of the blurred image" />
            {regions.map((r) => (
              <div
                key={r.id}
                className={"sign-place blur-region" + (shape === "ellipse" ? " blur-ellipse" : "") + (selected === r.id ? " selected" : "")}
                style={{ left: pct(r.x, nat.w), top: pct(r.y, nat.h), width: pct(r.w, nat.w), height: pct(r.h, nat.h) }}
                onPointerDown={(e) => begin(e, "move", r)}
              >
                <button
                  type="button"
                  className="sign-remove"
                  aria-label="Remove this area"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => remove(r.id)}
                >
                  &times;
                </button>
                {HANDLES.map((h) => (
                  <span
                    key={h.key}
                    className={"crop-handle crop-handle-" + h.key}
                    style={{ left: h.x * 100 + "%", top: h.y * 100 + "%" }}
                    onPointerDown={(e) => begin(e, h.key, r)}
                  />
                ))}
              </div>
            ))}
          </div>
          <p className="muted small center">
            {regions.length
              ? "Drag across the picture to add another area. Drag an area to move it, a corner to resize, × (or Delete) to remove."
              : "Drag across the picture to mark a face, number plate or text to hide."}
          </p>

          <div className="field-row">
            <div className="field">
              <span className="field-label">Shape</span>
              <Segmented options={SHAPES} value={shape} onChange={setShape} ariaLabel="Shape of each area" />
            </div>
            {effect === "box" ? (
              <label className="field">
                <span className="field-label">Box colour</span>
                <input className="inp" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              </label>
            ) : (
              <label className="field">
                <span className="field-label">Strength: {sizeLabel}</span>
                <input
                  type="range"
                  min={0.5}
                  max={10}
                  step={0.5}
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value))}
                />
              </label>
            )}
          </div>

          {effect !== "box" && (
            <p className="muted small">
              Hiding text such as a card number, address or password? Use <strong>Solid box</strong>. Pixelated or
              lightly blurred text can sometimes be reconstructed, because each block still carries an average of the
              letters beneath it. A solid box keeps nothing.
            </p>
          )}

          <div className="field">
            <span className="field-label">Format</span>
            <Segmented
              options={[{ value: "image/png", label: "PNG" }, { value: "image/jpeg", label: "JPG" }]}
              value={format}
              onChange={setFormat}
              ariaLabel="Output format"
            />
          </div>
          <p className="muted small center">
            {regions.length
              ? `${regions.length} area${regions.length > 1 ? "s" : ""} marked — saved as ${fileType === "image/jpeg" ? "JPG" : "PNG"} at the original ${nat.w}×${nat.h}px.`
              : "Mark at least one area to download."}
          </p>

          <div className="btn-row">
            <button className="btn" onClick={download} disabled={!regions.length}>
              Download image
            </button>
            <button className="btn btn-ghost" onClick={addWhole}>
              Select whole image
            </button>
            {regions.length > 0 && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setRegions([]);
                  setSelected(null);
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
