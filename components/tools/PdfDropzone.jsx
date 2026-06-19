"use client";
import { useState, useRef, useCallback } from "react";

// Reusable file picker for PDF tools: drag-drop or click to select file(s).
// Calls onFiles(fileArray) with the chosen File objects.
// Set multiple={false} to accept a single file. accept defaults to PDFs.
export default function PdfDropzone({
  onFiles,
  accept = "application/pdf,.pdf",
  multiple = true,
  hint,
  label,
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;
      onFiles(multiple ? files : [files[0]]);
    },
    [onFiles, multiple]
  );

  return (
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
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="dropzone-empty">
        <strong>{label || (multiple ? "Drop PDF files here, or click to choose" : "Drop a PDF here, or click to choose")}</strong>
        <span className="muted small">{hint || "Processed in your browser — never uploaded."}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Shared helper: human-readable byte size.
export function fmtBytes(n) {
  if (n < 1024) return n + " B";
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + " KB";
  return (n / (1024 * 1024)).toFixed(2) + " MB";
}

// Shared helper: trigger a download of a Uint8Array / Blob as a file.
export function downloadBytes(data, filename, mimeType = "application/pdf") {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
