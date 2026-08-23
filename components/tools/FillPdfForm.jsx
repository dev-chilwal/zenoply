"use client";
import { useState, useMemo } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import {
  LOAD_OPTS,
  FILLABLE,
  readFields,
  buildFilledPdf,
  hasXfa,
  probeFont,
  undrawableChars,
} from "./pdfForm";

const seedValues = (fields) => Object.fromEntries(fields.map((f) => [f.name, f.value]));

// Only text values are drawn from free typing; every other kind can hold only
// values the PDF itself defines, so they are always drawable.
const textOf = (field, value) => (field.kind === "text" ? String(value ?? "") : "");

export default function FillPdfForm() {
  const [file, setFile] = useState(null);
  const [fields, setFields] = useState(null);
  const [values, setValues] = useState({});
  const [pageCount, setPageCount] = useState(0);
  const [xfa, setXfa] = useState(false);
  const [flatten, setFlatten] = useState(false);
  const [font, setFont] = useState(null);
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
      const read = readFields(doc);
      setFile(f);
      setPageCount(doc.getPageCount());
      setXfa(hasXfa(doc));
      setFields(read);
      setValues(seedValues(read));
      setFlatten(false);
      // Used only to warn about characters the built-in font cannot draw; a
      // failure here costs the warning, not the tool.
      probeFont().then(setFont).catch(() => setFont(null));
    } catch {
      setError("Couldn't read that PDF. The file may be corrupted.");
      setFile(null);
      setFields(null);
      setValues({});
    } finally {
      setBusy(false);
    }
  };

  const set = (name, v) => setValues((prev) => ({ ...prev, [name]: v }));

  const fillable = useMemo(() => (fields || []).filter((f) => FILLABLE.has(f.kind)), [fields]);
  const signatures = useMemo(() => (fields || []).filter((f) => f.kind === "signature"), [fields]);

  // Characters the built-in font cannot draw, per field. Advisory only — the
  // download re-checks by actually trying to draw each field.
  const undrawable = useMemo(() => {
    if (!font || !fields) return {};
    const out = {};
    for (const f of fields) {
      if (f.readOnly) continue;
      const bad = undrawableChars(font, textOf(f, values[f.name]));
      if (bad.length) out[f.name] = bad;
    }
    return out;
  }, [font, fields, values]);

  const undrawableNames = Object.keys(undrawable);

  const save = async () => {
    setError("");
    setDone("");
    if (!file) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const result = await buildFilledPdf(bytes, values, { flatten });
      const base = file.name.replace(/\.[^.]+$/, "");
      downloadBytes(result.bytes, `${base}-${result.flattened ? "flattened" : "filled"}.pdf`);
      if (result.flattened) {
        setDone("Downloaded. The answers are part of the page now — they will print and cannot be typed over.");
      } else if (result.undrawable.length) {
        setDone(
          `Downloaded, but ${result.undrawable.length} field${result.undrawable.length === 1 ? "" : "s"} could not be drawn` +
            ` (${result.undrawable.join(", ")}). The value is saved in the file and your PDF reader will draw it —` +
            " flattening was skipped so nothing would be lost."
        );
      } else {
        setDone("Downloaded. The PDF is still an editable form, so the answers can be changed later.");
      }
    } catch {
      setError("Couldn't write that PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  const meta = (f) => {
    const bits = [];
    if (f.page >= 0 && pageCount > 1) bits.push(`Page ${f.page + 1}`);
    if (f.name !== f.label) bits.push(f.name);
    if (f.required) bits.push("required");
    if (f.maxLength) bits.push(`max ${f.maxLength} chars`);
    if (f.readOnly) bits.push("read-only");
    return bits.join(" · ");
  };

  const renderInput = (f) => {
    const v = values[f.name];
    if (f.readOnly) {
      // A read-only tick box is still a tick box; only text-ish values belong
      // in a disabled text input.
      if (f.kind === "checkbox") return <input type="checkbox" checked={!!v} disabled readOnly aria-label={f.label} />;
      const shown = Array.isArray(v) ? v.join(", ") : String(v ?? "");
      return <input className="inp" type="text" value={shown} disabled readOnly />;
    }
    if (f.kind === "checkbox") {
      return (
        <input
          type="checkbox"
          checked={!!v}
          onChange={(e) => set(f.name, e.target.checked)}
          aria-label={f.label}
        />
      );
    }
    if (f.kind === "text" && f.multiline) {
      return (
        <textarea
          className="ta"
          rows={3}
          value={String(v ?? "")}
          maxLength={f.maxLength || undefined}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
    }
    if (f.kind === "text") {
      return (
        <input
          className="inp"
          type={f.password ? "password" : "text"}
          value={String(v ?? "")}
          maxLength={f.maxLength || undefined}
          onChange={(e) => set(f.name, e.target.value)}
        />
      );
    }
    if (f.kind === "radio") {
      return (
        <select className="inp" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>
          <option value="">— not answered —</option>
          {(f.options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    // Dropdown / option list.
    if (f.multi) {
      const selected = Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];
      return (
        <select
          className="inp"
          multiple
          size={Math.min(6, Math.max(3, (f.options || []).length))}
          value={selected}
          onChange={(e) => set(f.name, Array.from(e.target.selectedOptions, (o) => o.value))}
        >
          {(f.options || []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    if (f.editable) {
      // A combo box: the listed options are suggestions, not the only answers.
      const listId = `opts-${f.name.replace(/[^\w-]/g, "_")}`;
      return (
        <>
          <input
            className="inp"
            type="text"
            list={listId}
            value={String(v ?? "")}
            onChange={(e) => set(f.name, e.target.value)}
          />
          <datalist id={listId}>
            {(f.options || []).map((o) => (
              <option key={o} value={o} />
            ))}
          </datalist>
        </>
      );
    }
    return (
      <select className="inp" value={String(v ?? "")} onChange={(e) => set(f.name, e.target.value)}>
        <option value="">— not answered —</option>
        {(f.options || []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a fillable PDF form. It is opened and filled in your browser — never uploaded."
      />

      {busy && !fields && <p className="muted small">Reading the form…</p>}
      {error && <p className="error">{error}</p>}

      {fields && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}, {pageCount} page{pageCount === 1 ? "" : "s"}
          </p>

          {xfa && (
            <p className="error">
              This is an XFA form — the kind built with LiveCycle Designer, where the fields are described by an XML
              layout rather than by the PDF itself. Only Adobe Acrobat can fill those, and this tool cannot see the
              fields.
            </p>
          )}

          {fillable.length === 0 && !xfa && (
            <p className="muted small">
              This PDF has no interactive form fields, so there is nothing to type into. Most documents that look like
              forms are flat — the boxes are printed lines, not real fields — and only a PDF saved as a fillable form
              has anything to fill. Printing it and writing by hand, or asking whoever issued it for the fillable
              version, are the honest options; this tool cannot add fields that were never there.
            </p>
          )}

          {fillable.length > 0 && (
            <>
              <p className="muted small">
                Found <strong>{fillable.length}</strong> fillable field{fillable.length === 1 ? "" : "s"}. Current
                values are already filled in below, so you only change what you need to.
              </p>

              {fillable.map((f) => (
                <div className="field" key={f.name}>
                  {f.kind === "checkbox" ? (
                    <label className="check-row">
                      {renderInput(f)}
                      <span>{f.label}</span>
                    </label>
                  ) : (
                    <label>
                      <span className="field-label">{f.label}</span>
                      {renderInput(f)}
                    </label>
                  )}
                  {meta(f) && <span className="muted small">{meta(f)}</span>}
                  {undrawable[f.name] && (
                    <p className="muted small">
                      <strong>{undrawable[f.name].join(" ")}</strong> can&apos;t be drawn by the built-in font. The
                      value is still saved and most PDF readers will show it, but this field can&apos;t be flattened.
                    </p>
                  )}
                </div>
              ))}

              {signatures.length > 0 && (
                <p className="muted small">
                  This form also has {signatures.length} signature field
                  {signatures.length === 1 ? "" : "s"} ({signatures.map((f) => f.label).join(", ")}). A digital
                  signature has to be applied by a signing tool holding your certificate, so it is left untouched —
                  and flattening will remove the empty box rather than fake one.
                </p>
              )}

              <label className="check-row">
                <input
                  type="checkbox"
                  checked={flatten}
                  disabled={undrawableNames.length > 0}
                  onChange={(e) => setFlatten(e.target.checked)}
                />
                <span>Flatten — lock the answers in so they can&apos;t be edited</span>
              </label>
              <p className="muted small">
                {undrawableNames.length > 0
                  ? "Flattening is unavailable while a field holds characters the built-in font can't draw — the answer would be flattened away to nothing."
                  : flatten
                    ? "The answers are painted onto the pages and the form fields are removed. The text still selects and prints, but nobody can type over it — which is what most offices mean by \"do not send an editable form\"."
                    : "Left off, the file stays a working form: the answers are saved as field values and can be changed again later."}
              </p>

              <div className="btn-row">
                <button className="btn" onClick={save} disabled={busy}>
                  {busy ? "Working…" : flatten ? "Fill, flatten and download" : "Fill and download"}
                </button>
              </div>
              {done && <p className="muted small">{done}</p>}

              <p className="muted small">
                Flattening locks the text but does not lock the file. To stop the PDF being opened at all, add a
                password with <a href="/pdf/protect-pdf">Protect PDF</a>; to check what the finished file says about
                you before you send it, open <a href="/pdf/pdf-metadata">PDF Metadata</a>.
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
