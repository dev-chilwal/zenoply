"use client";
import { useState, useRef, useEffect } from "react";
import ImageDropzone from "./ImageDropzone";
import { downloadBytes } from "./PdfDropzone";
import { Field, Segmented } from "@/components/calc/Calc";
import { createOcrWorker, OCR_LANGS, ocrStatusLabel } from "./tesseract";

export default function ImageToText() {
  const [file, setFile] = useState(null);
  const [lang, setLang] = useState("eng");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [pct, setPct] = useState(0);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Reuse one worker across runs; recreate only when the language changes. The
  // ref survives re-renders so repeated "Extract text" clicks don't re-download
  // and re-init the engine. workerLang tracks what the live worker was built for.
  const workerRef = useRef(null);
  const workerLang = useRef("");

  useEffect(() => {
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const onImage = (_img, f) => {
    setFile(f);
    setText("");
    setError("");
    setStatus("");
    setPct(0);
  };

  const extract = async () => {
    if (!file) return;
    setBusy(true);
    setError("");
    setText("");
    setStatus("Loading OCR engine…");
    setPct(0);
    try {
      if (!workerRef.current || workerLang.current !== lang) {
        await workerRef.current?.terminate();
        workerRef.current = await createOcrWorker(lang, (s, p) => {
          setStatus(ocrStatusLabel(s));
          setPct(Math.round(p * 100));
        });
        workerLang.current = lang;
      }
      const { data } = await workerRef.current.recognize(file);
      setText(data.text.trim());
      setStatus("");
      if (!data.text.trim()) {
        setError("No text was found in this image. Try a sharper or higher-contrast scan.");
      }
    } catch (err) {
      // A failed run can leave the worker in a bad state — drop it so the next
      // attempt starts clean.
      await workerRef.current?.terminate();
      workerRef.current = null;
      workerLang.current = "";
      setError("Couldn't read this image. It may be an unsupported format, or the page was too complex.");
      setStatus("");
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div>
      <ImageDropzone onImage={onImage} hint="PNG, JPG, WebP or a screenshot. Read in your browser — never uploaded." />

      {file && (
        <>
          <Field label="Language">
            <Segmented options={OCR_LANGS} value={lang} onChange={(v) => { setLang(v); }} ariaLabel="OCR language" />
          </Field>
          <p className="muted small">Pick the language(s) in the image. The first run downloads the engine and language data (a few MB); after that it is cached.</p>

          <div className="btn-row">
            <button className="btn" onClick={extract} disabled={busy}>
              {busy ? "Working…" : "Extract text"}
            </button>
          </div>

          {busy && (
            <div className="ocr-progress" role="status" aria-live="polite">
              <div className="ocr-bar"><div className="ocr-bar-fill" style={{ width: `${pct}%` }} /></div>
              <span className="muted small">{status}{pct ? ` ${pct}%` : ""}</span>
            </div>
          )}
        </>
      )}

      {text && (
        <div className="ocr-result">
          <div className="result-head">
            <span className="field-label">Extracted text</span>
            <div className="btn-row">
              <button className="btn-sm" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
              <button className="btn-sm" onClick={() => downloadBytes(text, "extracted-text.txt", "text/plain")}>Download .txt</button>
            </div>
          </div>
          <textarea className="ta mono" rows={12} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
