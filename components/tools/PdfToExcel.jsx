"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { buildXlsx, XLSX_MIME } from "./officeExport";
import { extractPageTable, trimTable, rectangular, toCsv } from "./pdfTable";
import { loadPdfjs } from "./pdfjs";

export default function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState(null);
  const [delimiter, setDelimiter] = useState(",");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setRows(null);
    setError("");
    setProgress("");
  };

  const onFiles = (incoming) => {
    reset();
    const f = incoming[0];
    if (f) setFile(f);
  };

  const extract = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    setProgress("");
    setRows(null);
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;

      let all = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        setProgress(`Reading page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        all = all.concat(extractPageTable(content.items));
      }

      const table = trimTable(all);
      if (!table.length) {
        setError(
          "No table data was found. This PDF looks scanned or image-based — data can only be pulled from PDFs that contain real text, not scans."
        );
        setProgress("");
        return;
      }
      // Normalise every row to the widest row so CSV/XLSX stay rectangular.
      const { rows: norm, cols: nCols } = rectangular(table);
      setRows(norm);
      setProgress(`Found ${norm.length} rows × ${nCols} columns.`);
    } catch {
      setError("Couldn't read this PDF. It may be corrupted or password-protected.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  const base = file ? file.name.replace(/\.pdf$/i, "") || "table" : "table";

  const downloadCsv = () => {
    downloadBytes(toCsv(rows, delimiter), `${base}.csv`, "text/csv");
  };
  const downloadXlsx = async () => {
    const blob = await buildXlsx(rows);
    downloadBytes(blob, `${base}.xlsx`, XLSX_MIME);
  };

  const preview = rows ? rows.slice(0, 100) : [];

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF with a table. Its rows and columns are detected and exported to Excel or CSV."
      />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          <div className="btn-row">
            <button className="btn" onClick={extract} disabled={busy}>
              {busy ? "Reading…" : "Extract table"}
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
        </>
      )}

      {rows && (
        <>
          <div className="tbl-wrap">
            <table className="tbl-preview">
              <tbody>
                {preview.map((r, i) => (
                  <tr key={i}>
                    {r.map((c, j) => (
                      <td key={j}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > preview.length && (
            <p className="muted small">Showing the first {preview.length} of {rows.length} rows. The download includes all of them.</p>
          )}
          <label className="field">
            <span className="field-label">CSV delimiter</span>
            <select className="inp" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
              <option value=",">Comma ,</option>
              <option value=";">Semicolon ;</option>
              <option value={"\t"}>Tab</option>
            </select>
          </label>
          <div className="btn-row">
            <button className="btn" onClick={downloadXlsx}>Download Excel (.xlsx)</button>
            <button className="btn btn-ghost" onClick={downloadCsv}>Download CSV</button>
          </div>
          <p className="muted small">
            Detection works best on digital PDFs with clear rows and columns. If a column looks split or merged, try the other file — scanned pages can't be read.
          </p>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
