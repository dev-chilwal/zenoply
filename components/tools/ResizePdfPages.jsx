"use client";
import { useState, useMemo } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  PAGE_SIZES,
  PT_PER_MM,
  getPageSize,
  planPage,
  resizePage,
  matchSizeName,
  normRotation,
} from "./pdfResize";

const ORIENTATIONS = [
  { value: "auto", label: "Keep each page's" },
  { value: "portrait", label: "Portrait" },
  { value: "landscape", label: "Landscape" },
];

const MODES = [
  { value: "fit", label: "Fit to page" },
  { value: "actual", label: "Keep actual size" },
  { value: "percent", label: "Scale by %" },
];

const UNITS = [
  { value: "mm", label: "mm" },
  { value: "in", label: "inches" },
];

const perUnit = (unit) => (unit === "in" ? 72 : PT_PER_MM);
const round1 = (n) => Math.round(n * 10) / 10;

// Two readouts per size: a compact monospace one for the result rows, and a
// friendly name for the prose line under them.
const dims = (w, h) => `${Math.round(w)}x${Math.round(h)}`;
const friendly = (w, h) => {
  const name = matchSizeName(w, h);
  return name || `${Math.round(w / PT_PER_MM)} x ${Math.round(h / PT_PER_MM)} mm`;
};
// The size without the orientation word, for the mixed-page line: with
// Orientation on auto the pages do not all end up the same way round, so
// naming one of them there would be wrong.
const baseName = (w, h) => friendly(w, h).replace(/ (portrait|landscape)$/, "");

export default function ResizePdfPages() {
  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { media, crop, rotation, dispW, dispH }
  const [sizeKey, setSizeKey] = useState("a4");
  const [unit, setUnit] = useState("mm");
  const [customW, setCustomW] = useState(210);
  const [customH, setCustomH] = useState(297);
  const [orientation, setOrientation] = useState("auto");
  const [mode, setMode] = useState("fit");
  const [percent, setPercent] = useState(100);
  const [marginMm, setMarginMm] = useState(0);
  const [enlarge, setEnlarge] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isCustom = sizeKey === "custom";

  const target = useMemo(() => {
    if (!isCustom) return getPageSize(sizeKey) || getPageSize("a4");
    const f = perUnit(unit);
    const w = Math.max(1, (Number(customW) || 0) * f);
    const h = Math.max(1, (Number(customH) || 0) * f);
    return { key: "custom", label: "Custom", w: Math.min(w, h), h: Math.max(w, h) };
  }, [isCustom, sizeKey, unit, customW, customH]);

  const opts = useMemo(
    () => ({
      target,
      orientation,
      mode,
      percent: Number(percent) || 100,
      marginPt: Math.max(0, Number(marginMm) || 0) * PT_PER_MM,
      enlarge,
    }),
    [target, orientation, mode, percent, marginMm, enlarge]
  );

  const onFiles = async (incoming) => {
    setError("");
    const f = incoming[0];
    if (!f) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
      const read = doc.getPages().map((p) => {
        const media = p.getMediaBox();
        const crop = p.getCropBox();
        const rotation = normRotation(p.getRotation().angle);
        const turned = rotation === 90 || rotation === 270;
        const w = crop.width || media.width;
        const h = crop.height || media.height;
        return { media, crop, rotation, dispW: turned ? h : w, dispH: turned ? w : h };
      });
      if (!read.length) throw new Error("no pages");
      setFile(f);
      setPages(read);
    } catch {
      setError("Couldn't read that PDF. It may be corrupted or in an unsupported format.");
      setFile(null);
      setPages([]);
    } finally {
      setBusy(false);
    }
  };

  // One row per distinct source page size, so a 200-page document reports two
  // lines rather than two hundred.
  const preview = useMemo(() => {
    const groups = new Map();
    pages.forEach((p, i) => {
      const key = `${Math.round(p.dispW)}x${Math.round(p.dispH)}x${p.rotation}`;
      const plan = planPage({ ...p, ...opts });
      const g = groups.get(key);
      if (g) g.pageNos.push(i + 1);
      else groups.set(key, { src: p, plan, pageNos: [i + 1] });
    });
    return [...groups.values()];
  }, [pages, opts]);

  const anyClipped = preview.some((g) => g.plan.clipped);
  const anyOverflow = preview.some((g) => g.plan.overflows);

  const apply = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
      doc.getPages().forEach((p) => resizePage(p, opts));
      const result = await doc.save();
      const stem = file.name.replace(/\.pdf$/i, "") || "document";
      const tag = isCustom ? "resized" : target.key;
      downloadBytes(result, `${stem}-${tag}.pdf`);
    } catch {
      setError("Couldn't resize that PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  const sizeSummary = () => {
    const distinct = new Set(pages.map((p) => `${Math.round(p.dispW)}x${Math.round(p.dispH)}`));
    if (distinct.size === 1) return `${dims(pages[0].dispW, pages[0].dispH)} pt (${friendly(pages[0].dispW, pages[0].dispH)})`;
    return `${distinct.size} different page sizes`;
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF, pick the page size you want, then download."
      />

      {file && pages.length > 0 && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}, {pages.length} page{pages.length === 1 ? "" : "s"}, {sizeSummary()}
          </p>

          <Field label="New page size">
            <select
              className="inp"
              value={sizeKey}
              onChange={(e) => setSizeKey(e.target.value)}
              aria-label="New page size"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
              <option value="custom">Custom size…</option>
            </select>
          </Field>

          {isCustom && (
            <div className="field-row">
              <label className="field">
                <span className="field-label">Width</span>
                <input
                  className="inp"
                  type="number"
                  min={1}
                  step="any"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                />
              </label>
              <label className="field">
                <span className="field-label">Height</span>
                <input
                  className="inp"
                  type="number"
                  min={1}
                  step="any"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                />
              </label>
              <Field label="Units">
                <Segmented options={UNITS} value={unit} onChange={setUnit} ariaLabel="Custom size units" />
              </Field>
            </div>
          )}

          <Field label="Orientation">
            <Segmented
              options={ORIENTATIONS}
              value={orientation}
              onChange={setOrientation}
              ariaLabel="Page orientation"
            />
          </Field>

          <Field label="Content">
            <Segmented options={MODES} value={mode} onChange={setMode} ariaLabel="How to scale the content" />
          </Field>

          {mode === "fit" && (
            <>
              <label className="field">
                <span className="field-label">Margin: {round1(marginMm)} mm</span>
                <input
                  type="range"
                  min={0}
                  max={30}
                  step={0.5}
                  value={marginMm}
                  onChange={(e) => setMarginMm(Number(e.target.value))}
                />
              </label>
              <label className="check-row">
                <input type="checkbox" checked={!enlarge} onChange={(e) => setEnlarge(!e.target.checked)} />
                <span>Never enlarge — pages smaller than the new size keep their size and get a border</span>
              </label>
            </>
          )}

          {mode === "percent" && (
            <label className="field">
              <span className="field-label">Scale content to {percent}% of its current size</span>
              <input
                type="range"
                min={10}
                max={200}
                step={1}
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
              />
            </label>
          )}

          <div className="result-list">
            {preview.map((g, i) => (
              <div className="result-row" key={i}>
                <span className="result-label">
                  {preview.length > 1
                    ? `Page${g.pageNos.length > 1 ? "s" : ""} ${summarise(g.pageNos)}`
                    : pages.length === 1
                    ? "Page"
                    : "All pages"}
                </span>
                <code className="result-val">
                  {dims(g.src.dispW, g.src.dispH)} &rarr; {dims(g.plan.dispW, g.plan.dispH)} pt, content at{" "}
                  {Math.round(g.plan.scale * 100)}%
                  {g.plan.clipped ? ", cropped" : g.plan.overflows ? ", past the margin" : ""}
                </code>
              </div>
            ))}
          </div>

          <p className="muted small">
            {preview.length === 1
              ? `${friendly(preview[0].src.dispW, preview[0].src.dispH)} to ${friendly(preview[0].plan.dispW, preview[0].plan.dispH)}.`
              : orientation === "auto"
              ? `Each page becomes ${baseName(target.w, target.h)}, keeping the way round it already is.`
              : `Each page becomes ${baseName(target.w, target.h)} ${orientation}.`}{" "}
            Links, bookmarks and form fields are carried across.
          </p>

          {anyClipped && (
            <p className="muted small">
              At this setting the content is wider or taller than the new page, so the edges will be cut off. Switch
              Content to &ldquo;Fit to page&rdquo; to scale it down instead.
            </p>
          )}
          {!anyClipped && anyOverflow && (
            <p className="muted small">
              The content reaches past the margin you set but still fits on the page.
            </p>
          )}

          <div className="btn-row">
            <button className="btn" onClick={apply} disabled={busy}>
              {busy ? "Resizing…" : "Resize and download"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}

// "1, 2, 3, 7" -> "1-3, 7" so a long document's grouping stays readable.
function summarise(nums) {
  const out = [];
  let start = nums[0];
  let prev = nums[0];
  for (let i = 1; i <= nums.length; i++) {
    const n = nums[i];
    if (n !== prev + 1) {
      out.push(start === prev ? String(start) : `${start}-${prev}`);
      start = n;
    }
    prev = n;
  }
  return out.join(", ");
}
