"use client";
import { useState, useRef, useCallback } from "react";
import { probePdf, unlockPdf, PdfWrongPasswordError } from "./pdfCrypto";

// Reusable file picker for PDF tools: drag-drop or click to select file(s).
// Calls onFiles(fileArray, metaArray) with the chosen File objects.
// Set multiple={false} to accept a single file. accept defaults to PDFs.
//
// Every PDF passes through the password gate (pdfCrypto.js) before the tool
// sees it: owner-only restrictions are removed silently, and files with an
// open password get an inline password prompt here. Tools therefore always
// receive ordinary unencrypted bytes. The meta array is aligned with the
// files: { wasEncrypted, passwordRemoved } — most tools ignore it; Unlock PDF
// uses it to report what the gate did.
export default function PdfDropzone({
  onFiles,
  accept = "application/pdf,.pdf",
  multiple = true,
  hint,
  label,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [checking, setChecking] = useState(false);
  const [prompt, setPrompt] = useState(null); // { name } of the file awaiting a password
  const [password, setPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [pwError, setPwError] = useState("");
  const inputRef = useRef(null);
  // { slots: [{ file, bytes|null, locked, meta }], intake: n } — bytes kept
  // only for locked files so unlock doesn't re-read. intake invalidates
  // in-flight gate work when a new selection replaces the current one.
  const pendingRef = useRef({ slots: null, intake: 0 });

  const isPdf = (f) => f.type === "application/pdf" || /\.pdf$/i.test(f.name);

  const resetGate = () => {
    setChecking(false);
    setPrompt(null);
    setPassword("");
    setUnlocking(false);
    setPwError("");
  };

  const finish = useCallback(
    (slots) => {
      resetGate();
      pendingRef.current.slots = null;
      if (slots.length) onFiles(slots.map((s) => s.file), slots.map((s) => s.meta));
    },
    [onFiles]
  );

  // Show the prompt for the next locked slot, or hand everything to the tool.
  const advance = useCallback(
    (slots) => {
      const next = slots.find((s) => s.locked);
      if (!next) return finish(slots);
      setChecking(false);
      setPassword("");
      setPwError("");
      setUnlocking(false);
      setPrompt({ name: next.file.name });
    },
    [finish]
  );

  const handleFiles = useCallback(
    async (fileList) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;
      const picked = multiple ? files : [files[0]];
      const intake = ++pendingRef.current.intake;
      resetGate();
      setChecking(true);

      const slots = [];
      for (const file of picked) {
        const slot = { file, bytes: null, locked: false, meta: { wasEncrypted: false, passwordRemoved: false } };
        if (isPdf(file)) {
          try {
            const bytes = new Uint8Array(await file.arrayBuffer());
            const probed = await probePdf(bytes);
            if (probed.status === "unlocked") {
              slot.file = new File([probed.bytes], file.name, { type: "application/pdf" });
              slot.meta.wasEncrypted = true;
            } else if (probed.status === "needs-password") {
              slot.locked = true;
              slot.bytes = bytes;
            }
          } catch (err) {
            // Gate unavailable (e.g. wasm failed to load) — pass the original
            // file through so the tools behave exactly as they did before.
            console.error("PDF password gate unavailable:", err);
          }
        }
        if (pendingRef.current.intake !== intake) return; // superseded by a newer drop
        slots.push(slot);
      }
      pendingRef.current.slots = slots;
      advance(slots);
    },
    [multiple, advance]
  );

  const submitPassword = async (e) => {
    e.preventDefault();
    const slots = pendingRef.current.slots;
    const slot = slots?.find((s) => s.locked);
    if (!slot || !password || unlocking) return;
    const intake = pendingRef.current.intake;
    setUnlocking(true);
    setPwError("");
    try {
      const bytes = await unlockPdf(slot.bytes, password);
      if (pendingRef.current.intake !== intake) return;
      slot.file = new File([bytes], slot.file.name, { type: "application/pdf" });
      slot.bytes = null;
      slot.locked = false;
      slot.meta = { wasEncrypted: true, passwordRemoved: true };
      advance(slots);
    } catch (err) {
      if (pendingRef.current.intake !== intake) return;
      setUnlocking(false);
      setPwError(
        err instanceof PdfWrongPasswordError
          ? "That password didn't work — check it and try again."
          : "Couldn't unlock this PDF — the file may be damaged."
      );
    }
  };

  const skipLocked = () => {
    const slots = pendingRef.current.slots;
    if (!slots) return;
    const idx = slots.findIndex((s) => s.locked);
    if (idx !== -1) slots.splice(idx, 1);
    advance(slots);
  };

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
      {checking && !prompt && <p className="muted small">Checking the file…</p>}
      {prompt && (
        <form onSubmit={submitPassword}>
          <p className="small">
            <strong>{prompt.name}</strong> is password-protected. Enter its password to open it — the password and
            the file stay in your browser.
          </p>
          <div className="field-row">
            <input
              className="inp"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PDF password"
              aria-label={"Password for " + prompt.name}
            />
            <button className="btn" type="submit" disabled={unlocking || !password}>
              {unlocking ? "Unlocking…" : "Unlock"}
            </button>
            <button className="btn" type="button" onClick={skipLocked} disabled={unlocking}>
              {multiple ? "Skip this file" : "Cancel"}
            </button>
          </div>
          {pwError && <p className="error">{pwError}</p>}
        </form>
      )}
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
