"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";

const DPI = 300;
const mm = (v) => Math.round((v / 25.4) * DPI); // mm -> px at 300 DPI
const inch = (v) => Math.round(v * DPI);

// Official passport / visa / ID photo sizes by country, grouped for the dropdown.
// Dimensions are width × height; rendered at 300 DPI for print quality.
const PRESET_GROUPS = [
  {
    group: "Most common",
    items: [
      { label: "US passport / visa — 2×2 in (51×51 mm)", w: inch(2), h: inch(2) },
      { label: "India passport — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Schengen / EU visa — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "UK passport — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "China passport / visa — 33×48 mm", w: mm(33), h: mm(48) },
    ],
  },
  {
    group: "Americas",
    items: [
      { label: "United States — 2×2 in (51×51 mm)", w: inch(2), h: inch(2) },
      { label: "Canada — 50×70 mm", w: mm(50), h: mm(70) },
      { label: "Mexico — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Brazil — 50×70 mm", w: mm(50), h: mm(70) },
      { label: "Argentina — 40×40 mm", w: mm(40), h: mm(40) },
    ],
  },
  {
    group: "Europe",
    items: [
      { label: "Schengen visa — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "United Kingdom — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Germany — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "France — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Italy — 35×40 mm", w: mm(35), h: mm(40) },
      { label: "Spain — 30×40 mm", w: mm(30), h: mm(40) },
      { label: "Netherlands — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Russia — 35×45 mm", w: mm(35), h: mm(45) },
    ],
  },
  {
    group: "Asia & Middle East",
    items: [
      { label: "India — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "China — 33×48 mm", w: mm(33), h: mm(48) },
      { label: "Japan — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "South Korea — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Pakistan — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Bangladesh — 45×55 mm", w: mm(45), h: mm(55) },
      { label: "Philippines — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Indonesia — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Singapore — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Thailand — 40×60 mm", w: mm(40), h: mm(60) },
      { label: "UAE — 40×60 mm", w: mm(40), h: mm(60) },
      { label: "Saudi Arabia — 40×60 mm", w: mm(40), h: mm(60) },
    ],
  },
  {
    group: "Africa & Oceania",
    items: [
      { label: "Australia — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "New Zealand — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "South Africa — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Nigeria — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Kenya — 35×45 mm", w: mm(35), h: mm(45) },
      { label: "Egypt — 40×60 mm", w: mm(40), h: mm(60) },
    ],
  },
];

// Flatten to a single indexable list (dropdown uses these indices).
const PRESETS = PRESET_GROUPS.flatMap((g) => g.items);

export default function PassportPhotoMaker() {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [presetIdx, setPresetIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offX, setOffX] = useState(0); // -1..1 horizontal pan
  const [offY, setOffY] = useState(0); // -1..1 vertical pan
  const [dragging, setDragging] = useState(false);
  // Holds drag start state: pointer coords + offsets, set on pointer down.
  const dragRef = useRef(null);
  // Latest slack (canvas px) written by render(), read by drag handlers.
  const slackRef = useRef({ slackX: 0, slackY: 0 });

  const onImage = (img) => {
    imgRef.current = img;
    setReady(true);
    setZoom(1);
    setOffX(0);
    setOffY(0);
  };

  const preset = PRESETS[presetIdx];

  const render = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const { w, h } = preset;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.imageSmoothingQuality = "high";

    // Scale source to "cover" the target box, then apply zoom.
    const targetRatio = w / h;
    const imgRatio = img.naturalWidth / img.naturalHeight;
    let baseW, baseH;
    if (imgRatio > targetRatio) {
      baseH = h;
      baseW = h * imgRatio;
    } else {
      baseW = w;
      baseH = w / imgRatio;
    }
    const drawW = baseW * zoom;
    const drawH = baseH * zoom;
    // Pan range: how far the image can move while still covering the box.
    const slackX = Math.max(0, drawW - w) / 2;
    const slackY = Math.max(0, drawH - h) / 2;
    // Remember slack (in canvas px) so drag handlers can convert movement to offset.
    slackRef.current = { slackX, slackY };
    const dx = (w - drawW) / 2 + offX * slackX;
    const dy = (h - drawH) / 2 + offY * slackY;
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }, [preset, zoom, offX, offY]);

  useEffect(() => {
    if (ready) render();
  }, [ready, render]);

  const download = () => {
    if (canvasRef.current) downloadCanvas(canvasRef.current, "passport-photo.jpg", "image/jpeg", 0.95);
  };

  // --- Drag to reposition ---
  const pointFrom = (e) => {
    const t = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: t.clientX, y: t.clientY };
  };

  const onDragStart = (e) => {
    if (!ready) return;
    e.preventDefault();
    const p = pointFrom(e);
    dragRef.current = { x: p.x, y: p.y, offX, offY };
    setDragging(true);
  };

  const onDragMove = (e) => {
    const start = dragRef.current;
    const canvas = canvasRef.current;
    if (!start || !canvas) return;
    e.preventDefault();
    const p = pointFrom(e);
    const rect = canvas.getBoundingClientRect();
    // Convert on-screen movement to canvas-pixel movement.
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const dxCanvas = (p.x - start.x) * scaleX;
    const dyCanvas = (p.y - start.y) * scaleY;
    const { slackX, slackY } = slackRef.current;
    // Dragging the image right increases the offset; clamp to -1..1.
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    setOffX(slackX > 0 ? clamp(start.offX + dxCanvas / slackX) : 0);
    setOffY(slackY > 0 ? clamp(start.offY + dyCanvas / slackY) : 0);
  };

  const onDragEnd = () => {
    dragRef.current = null;
    setDragging(false);
  };

  // Attach window listeners during a drag so it keeps working outside the canvas.
  useEffect(() => {
    if (!dragging) return;
    const move = (e) => onDragMove(e);
    const up = () => onDragEnd();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dragging]);

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="A clear, front-facing photo on a plain background works best." />
      {ready && (
        <>
          <label className="field">
            <span className="field-label">Country / photo size</span>
            <select className="inp" value={presetIdx} onChange={(e) => setPresetIdx(parseInt(e.target.value))}>
              {(() => {
                let idx = 0;
                return PRESET_GROUPS.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map((p) => {
                      const i = idx++;
                      return <option key={i} value={i}>{p.label}</option>;
                    })}
                  </optgroup>
                ));
              })()}
            </select>
          </label>
          <div className="passport-preview">
            <canvas
              ref={canvasRef}
              className={"passport-canvas" + (dragging ? " dragging" : "")}
              onMouseDown={onDragStart}
              onTouchStart={onDragStart}
            />
          </div>
          <p className="muted small center">Drag the photo to position the face. Use zoom below to fit the frame.</p>
          <label className="field">
            <span className="field-label">Zoom</span>
            <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
          </label>
          <p className="muted small">Output: {preset.w}×{preset.h}px at 300 DPI.</p>
          <div className="btn-row">
            <button className="btn" onClick={download}>Download passport photo</button>
          </div>
        </>
      )}
    </div>
  );
}
