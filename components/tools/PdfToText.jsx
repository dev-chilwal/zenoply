"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { loadPdfjs } from "./pdfjs";
import { parseRanges } from "./SplitPdf";
import { pageBlocks, assembleText } from "./pdfText";
import { Field, Segmented } from "@/components/calc/Calc";

export default function PdfToText() {
  const [file, setFile] = useState(null);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState("paragraphs");
  const [ranges, setRanges] = useState("");
  const [markPages, setMarkPages] = useState(false);
  const [text, setText] = useState("");
  const [stats, setStats] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const reset = () => {
    setText("");
    setStats(null);
    setError("");
    setProgress("");
  };

  const onFiles = async (incoming) => {
    const f = incoming[0];
    if (!f) return;
    reset();
    setFile(f);
    setTotal(0);
    setRanges("");
    setBusy(true);
    try {
      // Read the page count up front so the range box can be validated as it is
      // typed, rather than only when the user hits Extract.
      const pdfjs = await loadPdfjs();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise;
      setTotal(pdf.numPages);
    } catch {
      setError("Couldn't read this PDF. It may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  // Live validation of the range box; blank means every page.
  const parsed = total && ranges.trim() ? parseRanges(ranges, total) : null;
  const rangeError = parsed?.error || "";

  const extract = async () => {
    if (!file || !total) return;
    setError("");
    setText("");
    setStats(null);
    const pages = parsed && !parsed.error ? parsed.pages : Array.from({ length: total }, (_, i) => i + 1);
    if (parsed?.error) return;
    setBusy(true);
    setProgress("");
    try {
      const pdfjs = await loadPdfjs();
      const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;

      const read = [];
      let withText = 0;
      for (const n of pages) {
        setProgress(`Reading page ${n}…`);
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const blocks = pageBlocks(content.items, mode);
        if (blocks.length) withText++;
        // A page marker is kept even for an empty page — it is how you tell
        // "this page held no text" from "this page is missing".
        read.push({ n, blocks });
      }

      const out = assembleText(read, markPages);
      if (!withText) {
        setError(
          "No selectable text was found on those pages. This PDF looks scanned, so the pages are pictures of text rather than text itself — run it through the OCR PDF tool below first."
        );
        setProgress("");
        return;
      }
      setText(out);
      setStats({
        pages: pages.length,
        withText,
        words: out.split(/\s+/).filter(Boolean).length,
        chars: out.length,
      });
      setProgress("");
    } catch {
      setError("Couldn't read this PDF. It may be corrupted or password-protected.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const download = () => {
    const base = file?.name.replace(/\.pdf$/i, "") || "document";
    // A BOM so Notepad on Windows reads a UTF-8 .txt as UTF-8 rather than as
    // the system code page, which is what mangles accents and rupee signs.
    downloadBytes("\uFEFF" + text, `${base}.txt`, "text/plain;charset=utf-8");
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF. Its text is extracted in your browser — never uploaded."
      />

      {file && (
        <>
          <p className="muted small">
            {file.name} &mdash; {fmtBytes(file.size)}
            {total ? ` — ${total} page${total === 1 ? "" : "s"}` : ""}
          </p>

          <Field label="Layout">
            <Segmented
              ariaLabel="Layout"
              value={mode}
              onChange={(v) => { setMode(v); reset(); }}
              options={[
                { value: "paragraphs", label: "Flowing paragraphs" },
                { value: "lines", label: "Keep line breaks" },
              ]}
            />
          </Field>
          <p className="muted small">
            {mode === "paragraphs"
              ? "Wrapped lines are merged back into paragraphs — best for articles, letters and anything you will re-read or re-flow."
              : "Every line on the page stays its own line — best for addresses, tables, code and poetry."}
          </p>

          {total > 1 && (
            <Field label="Pages (optional)">
              <input
                className="inp"
                type="text"
                value={ranges}
                onChange={(e) => { setRanges(e.target.value); reset(); }}
                placeholder={`All ${total} pages — or e.g. 1-3, 7`}
                aria-label="Pages to extract"
              />
            </Field>
          )}
          {rangeError && <p className="error">{rangeError}</p>}

          <label className="check-row">
            <input type="checkbox" checked={markPages} onChange={(e) => { setMarkPages(e.target.checked); reset(); }} />
            <span>Mark where each page starts</span>
          </label>

          <div className="btn-row">
            <button className="btn" onClick={extract} disabled={busy || !total || !!rangeError}>
              {busy ? "Reading…" : "Extract text"}
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
        </>
      )}

      {text && (
        <div className="ocr-result">
          <div className="result-head">
            <span className="field-label">Extracted text</span>
            <div className="btn-row">
              <button className="btn-sm" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
              <button className="btn-sm" onClick={download}>Download .txt</button>
            </div>
          </div>
          <textarea className="ta mono" rows={16} value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} />
          {stats && (
            <p className="muted small">
              {stats.words.toLocaleString()} words, {stats.chars.toLocaleString()} characters from{" "}
              {stats.withText} of {stats.pages} page{stats.pages === 1 ? "" : "s"}
              {stats.withText < stats.pages ? " — the rest held no selectable text." : "."}{" "}
              Edit it here before you copy or download if you like.
            </p>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
