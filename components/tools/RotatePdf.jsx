"use client";
import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented } from "@/components/calc/Calc";

export default function RotatePdf() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [angle, setAngle] = useState(90);
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

  const rotate = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      doc.getPages().forEach((page) => {
        const current = page.getRotation().angle || 0;
        page.setRotation(degrees((current + angle) % 360));
      });
      const result = await doc.save();
      downloadBytes(result, "rotated.pdf");
    } catch {
      setError("Couldn't rotate that PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF, pick a rotation, then download." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}, {total} page{total === 1 ? "" : "s"}</p>
          <Segmented ariaLabel="Rotation" value={angle} onChange={setAngle}
            options={[90, 180, 270].map((a) => ({ value: a, label: `${a}° clockwise` }))} />
          <div className="btn-row">
            <button className="btn" onClick={rotate} disabled={busy}>
              {busy ? "Rotating…" : "Rotate and download"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
