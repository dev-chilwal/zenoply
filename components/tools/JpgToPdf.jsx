"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";

// A4 at 72 dpi, in points.
const A4 = { w: 595.28, h: 841.89 };
const MARGIN = 24;

export default function JpgToPdf() {
  const [files, setFiles] = useState([]);
  const [fit, setFit] = useState("a4"); // "a4" = each image on an A4 page; "image" = page matches image
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (incoming) => {
    setError("");
    const imgs = incoming.filter((f) => f.type === "image/jpeg" || f.type === "image/png" || /\.(jpe?g|png)$/i.test(f.name));
    if (!imgs.length) {
      setError("Choose JPG or PNG images.");
      return;
    }
    setFiles((prev) => [...prev, ...imgs]);
  };

  const move = (i, dir) => {
    setFiles((prev) => {
      const next = [...prev];
      const j = i + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const remove = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const build = async () => {
    setError("");
    if (!files.length) {
      setError("Add at least one image.");
      return;
    }
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const isPng = file.type === "image/png" || /\.png$/i.test(file.name);
        const img = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
        if (fit === "image") {
          const page = doc.addPage([img.width, img.height]);
          page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
        } else {
          const page = doc.addPage([A4.w, A4.h]);
          const maxW = A4.w - MARGIN * 2;
          const maxH = A4.h - MARGIN * 2;
          const scale = Math.min(maxW / img.width, maxH / img.height, 1);
          const w = img.width * scale;
          const h = img.height * scale;
          page.drawImage(img, {
            x: (A4.w - w) / 2,
            y: (A4.h - h) / 2,
            width: w,
            height: h,
          });
        }
      }
      const result = await doc.save();
      downloadBytes(result, "images.pdf");
    } catch {
      setError("Couldn't convert those images. One may be an unsupported format.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={addFiles}
        accept="image/jpeg,image/png,.jpg,.jpeg,.png"
        multiple
        label="Drop JPG or PNG images here, or click to choose"
        hint="Each image becomes a page, in the order shown below."
      />
      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li className="file-item" key={i}>
              <span className="file-name">{f.name}</span>
              <span className="file-meta">{fmtBytes(f.size)}</span>
              <span className="file-ctrl">
                <button className="btn-sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">Up</button>
                <button className="btn-sm" onClick={() => move(i, 1)} disabled={i === files.length - 1} aria-label="Move down">Down</button>
                <button className="btn-sm" onClick={() => remove(i)} aria-label="Remove">Remove</button>
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="btn-row">
        <button className={"btn" + (fit === "a4" ? "" : " btn-ghost")} onClick={() => setFit("a4")}>Fit to A4 page</button>
        <button className={"btn" + (fit === "image" ? "" : " btn-ghost")} onClick={() => setFit("image")}>Page matches image</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="btn-row">
        <button className="btn" onClick={build} disabled={busy || !files.length}>
          {busy ? "Building…" : "Create PDF"}
        </button>
        {files.length > 0 && (
          <button className="btn btn-ghost" onClick={() => setFiles([])} disabled={busy}>Clear all</button>
        )}
      </div>
    </div>
  );
}
