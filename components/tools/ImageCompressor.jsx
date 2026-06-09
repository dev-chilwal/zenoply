"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import ImageDropzone, { fmtBytes } from "./ImageDropzone";

export default function ImageCompressor() {
  const imgRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [baseName, setBaseName] = useState("image");
  const [origSize, setOrigSize] = useState(0);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState("image/jpeg");
  const [out, setOut] = useState({ size: 0, url: "" });

  const onImage = (img, file) => {
    imgRef.current = img;
    setBaseName((file?.name || "image").replace(/\.[^.]+$/, ""));
    setOrigSize(file?.size || 0);
    setReady(true);
  };

  const recompress = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setOut((prev) => {
          if (prev.url) URL.revokeObjectURL(prev.url);
          return { size: blob.size, url: URL.createObjectURL(blob) };
        });
      },
      format,
      quality
    );
  }, [quality, format]);

  useEffect(() => {
    if (ready) recompress();
  }, [ready, quality, format, recompress]);

  const ext = format === "image/webp" ? "webp" : "jpg";
  const saving = origSize && out.size ? Math.round((1 - out.size / origSize) * 100) : 0;

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="JPG or WebP work best for compression." />
      {ready && (
        <>
          <label className="field">
            <span className="field-label">Output format</span>
            <select className="inp" value={format} onChange={(e) => setFormat(e.target.value)}>
              <option value="image/jpeg">JPG</option>
              <option value="image/webp">WebP (smaller)</option>
            </select>
          </label>
          <label className="field">
            <span className="field-label">Quality: {Math.round(quality * 100)}%</span>
            <input type="range" min={0.1} max={1} step={0.05} value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))} />
          </label>
          <div className="result-list">
            <div className="result-row"><span className="result-label">Original size</span><code className="result-val">{fmtBytes(origSize)}</code></div>
            <div className="result-row"><span className="result-label">Compressed size</span><code className="result-val">{fmtBytes(out.size)}</code></div>
            <div className="result-row result-row-hl"><span className="result-label">Saved</span><code className="result-val">{saving > 0 ? saving + "%" : "—"}</code></div>
          </div>
          {out.url && (
            <div className="btn-row">
              <a className="btn" href={out.url} download={`${baseName}-compressed.${ext}`}>Download compressed image</a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
