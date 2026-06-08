"use client";
import { useState } from "react";

// Reusable output panel with Copy + optional Download actions.
// Props:
//   value        - the text to show / copy / download (required)
//   downloadName - filename for download (omit to hide the Download button)
//   mimeType     - blob type for download (default text/plain)
//   mono         - render in monospace (default true)
export default function OutputBox({
  value,
  downloadName,
  mimeType = "text/plain",
  mono = true,
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const download = () => {
    const blob = new Blob([value], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="output-block">
      <div className="output-actions">
        <button className="btn-sm" onClick={copy}>{copied ? "Copied!" : "Copy"}</button>
        {downloadName && (
          <button className="btn-sm" onClick={download}>Download</button>
        )}
      </div>
      <pre className={"output" + (mono ? " mono" : "")}>{value}</pre>
    </div>
  );
}
