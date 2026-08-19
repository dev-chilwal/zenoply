"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented, Field } from "@/components/calc/Calc";
import { TEXT_FIELDS, LOAD_OPTS, toInput, fmtDate, readMeta, stripAll, applyEdits } from "./pdfMeta";

export default function PdfMetadata() {
  const [file, setFile] = useState(null);
  const [orig, setOrig] = useState(null);
  const [form, setForm] = useState(null);
  const [pages, setPages] = useState(0);
  const [mode, setMode] = useState("edit");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  const onFiles = async (incoming) => {
    setError("");
    setDone("");
    const f = incoming[0];
    if (!f) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, LOAD_OPTS);
      const values = readMeta(doc);
      setFile(f);
      setPages(doc.getPageCount());
      setOrig(values);
      setForm({ ...values, created: toInput(values.created), modified: toInput(values.modified) });
    } catch {
      setError("Couldn't read that PDF. The file may be corrupted.");
      setFile(null);
      setOrig(null);
      setForm(null);
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setError("");
    setDone("");
    if (!file) return;
    setBusy(true);
    try {
      const base = file.name.replace(/\.[^.]+$/, "");
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, LOAD_OPTS);
      if (mode === "remove") {
        stripAll(doc);
        downloadBytes(await doc.save(), `${base}-no-metadata.pdf`);
        setDone("Clean copy downloaded — every field listed above was removed.");
      } else {
        applyEdits(doc, form, orig);
        downloadBytes(await doc.save(), `${base}-metadata.pdf`);
        setDone("Updated PDF downloaded.");
      }
    } catch {
      setError("Couldn't write that PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  const filled = orig
    ? TEXT_FIELDS.filter(([k]) => orig[k]).length + (orig.created ? 1 : 0) + (orig.modified ? 1 : 0)
    : 0;
  const found = orig ? filled + orig.extras : 0;

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF to see what it says about you. Read in your browser — never uploaded."
      />

      {busy && !orig && <p className="muted small">Reading metadata…</p>}
      {error && <p className="error">{error}</p>}

      {orig && form && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}, {pages} page{pages === 1 ? "" : "s"}
          </p>

          {found === 0 ? (
            <p className="muted small">
              This PDF carries no title, author, dates or XMP packet — either it was never written, or something has
              already stripped it. Saving a clean copy anyway is harmless.
            </p>
          ) : (
            <>
              <p className="muted small">
                Found <strong>{found}</strong> metadata {found === 1 ? "entry" : "entries"} in this PDF
                {orig.extras > 0 && (
                  <>
                    , including {orig.extras} XMP or application {orig.extras === 1 ? "block" : "blocks"} that no PDF
                    reader shows you
                  </>
                )}
                .
              </p>
              <div className="result-list">
                {TEXT_FIELDS.filter(([k]) => orig[k]).map(([k, label]) => (
                  <div className="result-row" key={k}>
                    <span className="result-label">{label}</span>
                    <span className="result-val">{orig[k]}</span>
                  </div>
                ))}
                {orig.created && (
                  <div className="result-row">
                    <span className="result-label">Created</span>
                    <span className="result-val">{fmtDate(orig.created)}</span>
                  </div>
                )}
                {orig.modified && (
                  <div className="result-row">
                    <span className="result-label">Modified</span>
                    <span className="result-val">{fmtDate(orig.modified)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          <Field label="What to do">
            <Segmented
              ariaLabel="Metadata action"
              value={mode}
              onChange={setMode}
              options={[
                { value: "edit", label: "Edit the fields" },
                { value: "remove", label: "Remove everything" },
              ]}
            />
          </Field>

          {mode === "edit" ? (
            <>
              <div className="field-row">
                {TEXT_FIELDS.map(([k, label]) => (
                  <label className="field" key={k}>
                    <span className="field-label">{label}</span>
                    <input className="inp" type="text" value={form[k]} onChange={set(k)} placeholder="(empty)" />
                  </label>
                ))}
                <label className="field">
                  <span className="field-label">Created</span>
                  <input className="inp" type="datetime-local" value={form.created} onChange={set("created")} />
                </label>
                <label className="field">
                  <span className="field-label">Modified</span>
                  <input className="inp" type="datetime-local" value={form.modified} onChange={set("modified")} />
                </label>
              </div>
              <p className="muted small">
                Clear a box to drop that field entirely. The XMP packet is removed rather than rewritten — some readers
                prefer XMP over these fields, so leaving a stale copy behind would undo the edit you just made.
              </p>
            </>
          ) : (
            <p className="muted small">
              Removes the title, author, subject, keywords, creator, producer and both dates, plus the XMP packet and
              any per-page or application-private blocks. The pages themselves are untouched — text, images and page
              size all stay exactly as they are.
            </p>
          )}

          <div className="btn-row">
            <button className="btn" onClick={save} disabled={busy}>
              {busy ? "Working…" : mode === "remove" ? "Download clean copy" : "Save changes and download"}
            </button>
          </div>
          {done && <p className="muted small">{done}</p>}

          <p className="muted small">
            Photos carry the same problem in a different format — a JPG from a phone records the camera, the serial
            number and often the GPS coordinates. The <a href="/image/exif-viewer">EXIF Viewer &amp; Remover</a> reads
            and clears those.
          </p>
        </>
      )}
    </div>
  );
}
