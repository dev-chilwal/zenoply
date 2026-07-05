"use client";
import { useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { buildXlsxMulti, XLSX_MIME } from "./officeExport";
import { extractRulingLines } from "./pdfLines";
import { extractTables, rectangular, toCsv } from "./pdfTable";

// Load pdf.js lazily on the client with a matching worker so the static export
// stays light and nothing runs at build time.
async function loadPdfjs() {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  return pdfjs;
}

export default function PdfToExcel() {
  const [file, setFile] = useState(null);
  const [tables, setTables] = useState(null); // [{ rows, cols, page }]
  const [delimiter, setDelimiter] = useState(",");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const reset = () => {
    setTables(null);
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
    setTables(null);
    try {
      const pdfjs = await loadPdfjs();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjs.getDocument({ data: bytes }).promise;

      const pages = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        setProgress(`Reading page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const [content, opList] = await Promise.all([
          page.getTextContent(),
          page.getOperatorList(),
        ]);
        const { hLines, vLines } = extractRulingLines(opList, pdfjs.OPS);
        pages.push({
          items: content.items,
          hLines,
          vLines,
          height: page.getViewport({ scale: 1 }).height,
        });
      }

      setProgress("Detecting tables…");
      const found = extractTables(pages).map((t) => {
        const { rows, cols } = rectangular(t.rows);
        return { rows, cols, page: t.page };
      });

      if (!found.length) {
        setError(
          "No tables were detected. Extraction needs real, selectable text with clear rows and columns — scanned or image-only PDFs can't be read."
        );
        setProgress("");
        return;
      }
      setTables(found);
      setProgress(
        found.length === 1
          ? `Found 1 table — ${found[0].rows.length} rows × ${found[0].cols} columns.`
          : `Found ${found.length} tables.`
      );
    } catch {
      setError("Couldn't read this PDF. It may be corrupted or password-protected.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  const base = file ? file.name.replace(/\.pdf$/i, "") || "tables" : "tables";

  const downloadAllXlsx = async () => {
    const sheets = tables.map((t, i) => ({
      name: `Table ${i + 1} (p${t.page})`,
      rows: t.rows,
    }));
    const blob = await buildXlsxMulti(sheets);
    downloadBytes(blob, `${base}.xlsx`, XLSX_MIME);
  };

  const downloadCsv = (t, i) => {
    const suffix = tables.length > 1 ? `-table-${i + 1}` : "";
    downloadBytes(toCsv(t.rows, delimiter), `${base}${suffix}.csv`, "text/csv");
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF with tables. Each table is detected separately and exported to Excel or CSV."
      />
      {file && (
        <>
          <p className="muted small">{file.name} — {fmtBytes(file.size)}</p>
          <div className="btn-row">
            <button className="btn" onClick={extract} disabled={busy}>
              {busy ? "Reading…" : "Extract tables"}
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
        </>
      )}

      {tables && (
        <>
          <div className="btn-row">
            <button className="btn" onClick={downloadAllXlsx}>
              {tables.length > 1
                ? `Download Excel — ${tables.length} sheets`
                : "Download Excel (.xlsx)"}
            </button>
          </div>
          <label className="field" style={{ marginTop: ".9rem" }}>
            <span className="field-label">CSV delimiter</span>
            <select className="inp" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
              <option value=",">Comma ,</option>
              <option value=";">Semicolon ;</option>
              <option value={"\t"}>Tab</option>
            </select>
          </label>

          {tables.map((t, i) => {
            const preview = t.rows.slice(0, 50);
            return (
              <div key={i} className="tbl-result">
                <div className="tbl-head">
                  <strong>
                    {tables.length > 1 ? `Table ${i + 1}` : "Extracted table"}
                  </strong>
                  <span className="muted small">
                    {t.rows.length} rows × {t.cols} columns · page {t.page}
                  </span>
                  <button className="btn-sm" onClick={() => downloadCsv(t, i)}>Download CSV</button>
                </div>
                <div className="tbl-wrap">
                  <table className="tbl-preview">
                    <tbody>
                      {preview.map((r, ri) => (
                        <tr key={ri}>
                          {r.map((c, ci) => (
                            <td key={ci}>{c}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {t.rows.length > preview.length && (
                  <p className="muted small">Showing the first {preview.length} of {t.rows.length} rows. The download includes all of them.</p>
                )}
              </div>
            );
          })}

          <p className="muted small">
            Detection works best on digital PDFs with clear rows and columns (ruled borders help most). If a column looks split or merged, the source layout is ambiguous — scanned pages can't be read.
          </p>
        </>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}
