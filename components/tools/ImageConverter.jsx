"use client";
import { useState, useRef } from "react";
import ImageDropzone, { downloadCanvas } from "./ImageDropzone";

const FORMATS = [
  { label: "PNG", type: "image/png", ext: "png" },
  { label: "JPG", type: "image/jpeg", ext: "jpg" },
  { label: "WebP", type: "image/webp", ext: "webp" },
];

export default function ImageConverter() {
  const imgRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [target, setTarget] = useState("image/jpeg");

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setReady(true);
  };

  const fmt = FORMATS.find((f) => f.type === target) || FORMATS[1];
  const isLossy = target === "image/jpeg" || target === "image/webp";

  const download = () => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    // JPG has no transparency: fill white so transparent areas aren't black.
    if (target === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    downloadCanvas(canvas, `${baseName}.${fmt.ext}`, target, isLossy ? 0.92 : undefined);
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} />
      {ready && (
        <>
          <label className="field">
            <span className="field-label">Convert to</span>
            <select className="inp" value={target} onChange={(e) => setTarget(e.target.value)}>
              {FORMATS.map((f) => <option key={f.type} value={f.type}>{f.label}</option>)}
            </select>
          </label>
          {target === "image/jpeg" && (
            <p className="muted small">JPG has no transparency — transparent areas will become white.</p>
          )}
          <div className="btn-row">
            <button className="btn" onClick={download}>Download as {fmt.label}</button>
          </div>
        </>
      )}
    </div>
  );
}
