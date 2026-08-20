"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented } from "@/components/calc/Calc";
import { buildDocx, DOCX_MIME } from "./officeExport";
import { loadPdfjs } from "./pdfjs";
import { pageBlocks } from "./pdfText";

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [mode, setMode] = useState("paragraphs");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const onFiles = (incoming) => {
    setError("");
    setProgress("");
    const f = incoming[0];
    if (f) setFile(f);
  };

  const convert = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    setProgress("");
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;

      const paragraphs = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        setProgress(`Reading page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        paragraphs.push(...pageBlocks(content.items, mode));
        if (n < pdf.numPages) paragraphs.push(""); // page break spacer
      }

      const hasText = paragraphs.some((p) => p.trim());
      if (!hasText) {
        setError(
          "No selectable text was found. This PDF looks scanned or image-based — text can only be extracted from PDFs that contain real text, not scans."
        );
        setProgress("");
        return;
      }

      const blob = await buildDocx(paragraphs);
      const base = file.name.replace(/\.pdf$/i, "") || "document";
      downloadBytes(blob, `${base}.docx`, DOCX_MIME);
      setProgress(`Done — ${base}.docx downloaded.`);
    } catch {
      setError("Couldn't convert this PDF. It may be corrupted or password-protected.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF. Its text is extracted into an editable Word document."
      />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          <Segmented
            ariaLabel="Layout"
            value={mode}
            onChange={setMode}
            options={[
              { value: "paragraphs", label: "Flowing paragraphs" },
              { value: "lines", label: "Keep line breaks" },
            ]}
          />
          <p className="muted small">
            {mode === "paragraphs"
              ? "Lines are merged into paragraphs — best for articles and letters you'll re-edit."
              : "Every line becomes its own line in Word — best for addresses, lists and code."}
          </p>
          <div className="btn-row">
            <button className="btn" onClick={convert} disabled={busy}>
              {busy ? "Converting…" : "Convert to Word"}
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
