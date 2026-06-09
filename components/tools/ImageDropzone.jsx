"use client";
import { useState, useRef, useCallback } from "react";

// Reusable image picker: drag-drop or click to select an image file.
// Calls onImage(img, file) with a loaded HTMLImageElement and the original File.
// Renders its own preview/empty state; children render below once an image is set.
export default function ImageDropzone({ onImage, accept = "image/*", hint }) {
  const [name, setName] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(
    (file) => {
      setError("");
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("That file isn't an image. Please choose a PNG, JPG or WebP.");
        return;
      }
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        setName(file.name);
        setPreviewUrl(url);
        onImage(img, file);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError("Couldn't read that image. It may be corrupted or an unsupported format.");
      };
      img.src = url;
    },
    [onImage]
  );

  return (
    <div>
      <div
        className={"dropzone" + (dragOver ? " dropzone-over" : "")}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
      >
        {previewUrl ? (
          <div className="dropzone-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt={name || "Selected image"} />
            <span className="muted small">{name} — click to choose a different image</span>
          </div>
        ) : (
          <div className="dropzone-empty">
            <strong>Drop an image here, or click to choose</strong>
            <span className="muted small">{hint || "PNG, JPG or WebP. Processed in your browser — never uploaded."}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

// Shared helper: trigger a download of a canvas as a given type/quality.
export function downloadCanvas(canvas, filename, type = "image/png", quality) {
  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    type,
    quality
  );
}

// Shared helper: human-readable byte size.
export function fmtBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}
