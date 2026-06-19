"use client";
import { useState } from "react";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";

export default function WatermarkPdf() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(20);
  const [size, setSize] = useState(60);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFiles = async (incoming) => {
    setError("");
    const f = incoming[0];
    if (!f) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      setFile(f);
      setTotal(doc.getPageCount());
    } catch {
      setError("Couldn't read that PDF. It may be corrupted or password-protected.");
      setFile(null);
      setTotal(0);
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    setError("");
    if (!file) return;
    if (!text.trim()) {
      setError("Enter the watermark text.");
      return;
    }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const op = Math.min(1, Math.max(0.02, opacity / 100));
      doc.getPages().forEach((page) => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, size);
        page.drawText(text, {
          x: width / 2 - textWidth / 2,
          y: height / 2 - size / 2,
          size,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: op,
          rotate: degrees(45),
        });
      });
      const result = await doc.save();
      downloadBytes(result, "watermarked.pdf");
    } catch {
      setError("Couldn't add the watermark. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF, set your watermark text, then download." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}, {total} page{total === 1 ? "" : "s"}</p>
          <label className="field">
            <span className="field-label">Watermark text</span>
            <input className="inp" value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIDENTIAL" />
          </label>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Opacity: {opacity}%</span>
              <input type="range" min={2} max={100} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            </label>
            <label className="field">
              <span className="field-label">Font size: {size}pt</span>
              <input type="range" min={20} max={120} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </label>
          </div>
          <div className="btn-row">
            <button className="btn" onClick={apply} disabled={busy}>
              {busy ? "Applying…" : "Add watermark and download"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
