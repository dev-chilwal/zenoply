"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";

export default function MergePdf() {
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const addFiles = (incoming) => {
    setError("");
    const pdfs = incoming.filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!pdfs.length) {
      setError("Those files aren't PDFs. Please choose PDF files only.");
      return;
    }
    setFiles((prev) => [...prev, ...pdfs]);
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

  const merge = async () => {
    setError("");
    if (files.length < 2) {
      setError("Add at least two PDF files to merge.");
      return;
    }
    setBusy(true);
    try {
      const out = await PDFDocument.create();
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        pages.forEach((p) => out.addPage(p));
      }
      const merged = await out.save();
      downloadBytes(merged, "merged.pdf");
    } catch (e) {
      setError("Couldn't merge those files. One may be corrupted or password-protected.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={addFiles} multiple hint="Select two or more PDFs. They merge in the order shown below." />
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
      {error && <p className="error">{error}</p>}
      <div className="btn-row">
        <button className="btn" onClick={merge} disabled={busy || files.length < 2}>
          {busy ? "Merging…" : "Merge PDFs"}
        </button>
        {files.length > 0 && (
          <button className="btn btn-ghost" onClick={() => setFiles([])} disabled={busy}>Clear all</button>
        )}
      </div>
    </div>
  );
}
