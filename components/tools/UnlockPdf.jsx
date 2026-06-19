"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";

export default function UnlockPdf() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onFiles = (incoming) => {
    setError("");
    const f = incoming[0];
    if (f) setFile(f);
  };

  const unlock = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      // ignoreEncryption lets us load PDFs that carry owner-level restrictions
      // (printing/copying locks) without an open password. Re-saving writes an
      // unrestricted copy.
      const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
      const result = await doc.save();
      downloadBytes(result, "unlocked.pdf");
    } catch {
      setError(
        "Couldn't unlock this PDF. If it needs a password just to open it, that password is required to decrypt the file and this in-browser tool can't bypass it."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone onFiles={onFiles} multiple={false} hint="Choose a PDF that has printing or copying restrictions you want removed." />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          <p className="muted small">
            This removes owner restrictions (locks on printing, copying or editing) from a PDF you own. It cannot
            bypass a password that is required just to open the file.
          </p>
          <div className="btn-row">
            <button className="btn" onClick={unlock} disabled={busy}>
              {busy ? "Unlocking…" : "Unlock and download"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
