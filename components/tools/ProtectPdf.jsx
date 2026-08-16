"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { encryptPdf } from "./pdfCrypto";

// Add an open password to a PDF. The encryption itself is qpdf's (pdfCrypto.js)
// — AES-256, and the same password set as both user and owner password. See the
// comment on encryptPdf for why the permissions password is not exposed.
//
// Deliberately does not load pdf-lib: qpdf does the whole job, so showing a page
// count would mean pulling a second PDF library into this route's chunk purely
// for a cosmetic line. Name and size come from the File itself.

// A rough, honest strength read: length is what actually matters against the
// AES-256 key derivation, character variety only breaks ties. No dependency, no
// pretence of a real entropy estimate.
function rateStrength(pw) {
  if (!pw) return null;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) => re.test(pw)).length;
  if (pw.length < 8) return { label: "Weak", hint: "Under 8 characters is guessable — aim for 12 or more." };
  if (pw.length < 12 || classes < 2) return { label: "Fair", hint: "Longer is better than more symbols. A short phrase of a few words beats a scrambled 8 characters." };
  if (pw.length < 16 && classes < 3) return { label: "Good", hint: "Fine for most documents." };
  return { label: "Strong", hint: "Fine for financial and personal documents." };
}

export default function ProtectPdf() {
  const [file, setFile] = useState(null);
  const [wasEncrypted, setWasEncrypted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const onFiles = (incoming, metas) => {
    setError("");
    setDone(false);
    setFile(incoming[0] || null);
    setWasEncrypted(Boolean(metas?.[0]?.passwordRemoved));
  };

  const strength = rateStrength(password);
  const mismatch = confirm.length > 0 && password !== confirm;
  const ready = Boolean(file) && password.length > 0 && password === confirm;

  const protectIt = async () => {
    if (!ready || busy) return;
    setError("");
    setDone(false);
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await encryptPdf(bytes, password);
      downloadBytes(result, "protected.pdf");
      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Couldn't protect this PDF. The file may be damaged.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF, set a password, then download the protected copy."
      />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          {wasEncrypted && (
            <p className="muted small">
              This PDF already had a password, and you entered it above — the copy you download will use the new
              password instead.
            </p>
          )}

          <label className="field">
            <span className="field-label">Password to open the PDF</span>
            <input
              className="inp"
              type={reveal ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setDone(false); }}
              placeholder="Choose a password"
            />
          </label>

          <label className="field">
            <span className="field-label">Confirm password</span>
            <input
              className="inp"
              type={reveal ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setDone(false); }}
              placeholder="Type it again"
            />
          </label>

          <label className="check-row">
            <input type="checkbox" checked={reveal} onChange={(e) => setReveal(e.target.checked)} />
            Show password
          </label>

          {mismatch && <p className="muted small">The two passwords don&apos;t match yet.</p>}
          {strength && !mismatch && (
            <p className="muted small">Strength: <strong>{strength.label}</strong> — {strength.hint}</p>
          )}

          <p className="muted small">
            Write the password down somewhere safe before you download. It is what derives the AES-256 key, so a
            protected PDF whose password is lost cannot be opened again — not by this tool, and not by any other.
          </p>

          <div className="btn-row">
            <button className="btn" onClick={protectIt} disabled={!ready || busy}>
              {busy ? "Protecting…" : "Protect PDF and download"}
            </button>
          </div>

          {done && !error && (
            <p className="muted small">
              Saved as protected.pdf. Open it to check — your reader should ask for the password before it shows
              anything.
            </p>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
