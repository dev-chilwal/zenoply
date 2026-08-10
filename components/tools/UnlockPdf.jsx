"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";

// The actual unlocking happens in the dropzone's password gate (pdfCrypto.js):
// owner restrictions are stripped silently, open passwords after the inline
// prompt. By the time this component receives the file it is already
// decrypted — all that's left is to report what happened and offer the copy.
export default function UnlockPdf() {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);

  const onFiles = (incoming, metas) => {
    setFile(incoming[0] || null);
    setMeta(metas?.[0] || null);
  };

  const download = async () => {
    if (!file) return;
    setBusy(true);
    try {
      downloadBytes(new Uint8Array(await file.arrayBuffer()), "unlocked.pdf");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF with printing or copying restrictions, or one that needs a password to open."
      />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          {meta?.wasEncrypted ? (
            <>
              <p className="muted small">
                {meta.passwordRemoved
                  ? "The open password has been removed. Download the unlocked copy — it opens without a password, with no printing or copying restrictions."
                  : "This PDF carried owner restrictions (locks on printing, copying or editing). They have been removed — download the unrestricted copy."}
              </p>
              <div className="btn-row">
                <button className="btn" onClick={download} disabled={busy}>
                  {busy ? "Preparing…" : "Download unlocked PDF"}
                </button>
              </div>
            </>
          ) : (
            <p className="muted small">
              This PDF isn't locked — it has no open password and no restrictions, so there is nothing to remove.
            </p>
          )}
        </>
      )}
    </div>
  );
}
