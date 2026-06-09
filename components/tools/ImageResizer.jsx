"use client";
import { useState, useRef } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";

const PRESETS = [
  { label: "Instagram square 1080×1080", w: 1080, h: 1080 },
  { label: "Instagram portrait 1080×1350", w: 1080, h: 1350 },
  { label: "HD 1920×1080", w: 1920, h: 1080 },
  { label: "Thumbnail 150×150", w: 150, h: 150 },
];

export default function ImageResizer() {
  const imgRef = useRef(null);
  const [orig, setOrig] = useState({ w: 0, h: 0 });
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [ready, setReady] = useState(false);

  const onImage = (img) => {
    imgRef.current = img;
    setOrig({ w: img.naturalWidth, h: img.naturalHeight });
    setW(img.naturalWidth);
    setH(img.naturalHeight);
    setReady(true);
  };

  const ratio = orig.w && orig.h ? orig.w / orig.h : 1;
  const setWidth = (val) => {
    const nw = Math.max(1, Math.round(val) || 0);
    setW(nw);
    if (lock) setH(Math.max(1, Math.round(nw / ratio)));
  };
  const setHeight = (val) => {
    const nh = Math.max(1, Math.round(val) || 0);
    setH(nh);
    if (lock) setW(Math.max(1, Math.round(nh * ratio)));
  };
  const applyPreset = (p) => {
    setLock(false);
    setW(p.w);
    setH(p.h);
  };

  const download = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    downloadCanvas(canvas, `resized-${w}x${h}.png`, "image/png");
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} />
      {ready && (
        <>
          <p className="muted small">Original: {orig.w}×{orig.h}px</p>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Width (px)</span>
              <input className="inp" type="number" min={1} value={w} onChange={(e) => setWidth(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Height (px)</span>
              <input className="inp" type="number" min={1} value={h} onChange={(e) => setHeight(e.target.value)} />
            </label>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} />
            <span>Lock aspect ratio</span>
          </label>
          <div className="chip-row" style={{ flexWrap: "wrap" }}>
            {PRESETS.map((p) => (
              <button key={p.label} className="btn btn-ghost btn-sm" onClick={() => applyPreset(p)}>{p.label}</button>
            ))}
          </div>
          <div className="btn-row">
            <button className="btn" onClick={download}>Download resized image</button>
          </div>
        </>
      )}
    </div>
  );
}
