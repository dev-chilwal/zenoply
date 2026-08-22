"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { loadPdfjs, renderPage } from "./pdfjs";
import { Segmented, Field } from "@/components/calc/Calc";
import { parseRanges } from "./SplitPdf";
import { PT_PER_MM } from "./pdfResize";
import {
  MIN_FRACTION,
  NO_MARGINS,
  clampMargins,
  contentMargins,
  cropPage,
  croppedDisplaySize,
  displaySize,
  hasCrop,
  normRotation,
  pageBox,
  unionMargins,
} from "./pdfCrop";

// Long edge of the preview raster. The stage is 560px wide at most, so this is
// roughly 2x for a portrait page — sharp on a retina screen without turning a
// 300-page document's page flip into a stall.
const PREVIEW_PX = 1100;
// Auto-trim scans a much smaller raster: it is looking for where the ink stops,
// not reading it, and this keeps a 40-page sweep well under a second per page.
const SCAN_PX = 700;
// Above this many pages, auto-trim samples evenly instead of scanning all of
// them. The count actually scanned is always reported — a cap the user cannot
// see reads as "checked everything" when it did not.
const SCAN_LIMIT = 40;

const HANDLES = [
  { key: "nw", x: 0, y: 0 },
  { key: "n", x: 0.5, y: 0 },
  { key: "ne", x: 1, y: 0 },
  { key: "e", x: 1, y: 0.5 },
  { key: "se", x: 1, y: 1 },
  { key: "s", x: 0.5, y: 1 },
  { key: "sw", x: 0, y: 1 },
  { key: "w", x: 0, y: 0.5 },
];

const SCOPES = [
  { value: "all", label: "Every page" },
  { value: "range", label: "Chosen pages" },
];

const EDGES = [
  { key: "top", label: "Top" },
  { key: "right", label: "Right" },
  { key: "bottom", label: "Bottom" },
  { key: "left", label: "Left" },
];

const round1 = (n) => Math.round(n * 10) / 10;
const mmOf = (pt) => round1(pt / PT_PER_MM);
const boxToMargins = (b) => ({ left: b.x, top: b.y, right: 1 - b.x - b.w, bottom: 1 - b.y - b.h });
const marginsToBox = (m) => ({ x: m.left, y: m.top, w: 1 - m.left - m.right, h: 1 - m.top - m.bottom });
const FULL_BOX = { x: 0, y: 0, w: 1, h: 1 };

export default function CropPdf() {
  const docRef = useRef(null); // live pdf.js document, reused across page flips
  const stageRef = useRef(null);
  const dragRef = useRef(null); // { mode, startX, startY, box, scale }
  const renderRef = useRef(0); // invalidates a preview render the user has moved past

  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { box, rotation, dispW, dispH }
  const [pageNo, setPageNo] = useState(1);
  const [preview, setPreview] = useState("");
  const [box, setBox] = useState(FULL_BOX); // crop as fractions of the displayed page
  const [mmText, setMmText] = useState({ top: "0", right: "0", bottom: "0", left: "0" });
  const [scope, setScope] = useState("all");
  const [ranges, setRanges] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState("");
  const [note, setNote] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  const current = pages[pageNo - 1] || null;
  const margins = clampMargins(boxToMargins(box));

  // Millimetres are always quoted against the page on screen. The crop itself is
  // stored as fractions, so on a document with more than one page size the same
  // proportion lands on every page and the mm figure only describes this one.
  const syncMm = useCallback((next, page) => {
    if (!page) return;
    const m = clampMargins(boxToMargins(next));
    setMmText({
      top: String(mmOf(m.top * page.dispH)),
      right: String(mmOf(m.right * page.dispW)),
      bottom: String(mmOf(m.bottom * page.dispH)),
      left: String(mmOf(m.left * page.dispW)),
    });
  }, []);

  const applyBox = useCallback(
    (next) => {
      setBox(next);
      syncMm(next, pages[pageNo - 1]);
    },
    [pages, pageNo, syncMm]
  );

  const reset = () => {
    applyBox(FULL_BOX);
    setNote("");
  };

  const onFiles = async (incoming) => {
    setError("");
    setNote("");
    const f = incoming[0];
    if (!f) return;
    setBusy(true);
    setProgress("Reading the PDF…");
    setPreview("");
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
      const read = doc.getPages().map((p) => {
        const b = pageBox(p.getMediaBox(), p.getCropBox());
        const rotation = normRotation(p.getRotation().angle);
        const d = displaySize(b, rotation);
        return { box: b, rotation, dispW: d.w, dispH: d.h };
      });
      if (!read.length) throw new Error("no pages");

      // pdf.js gets its own copy: it transfers the buffer it is handed, which
      // would leave the array pdf-lib is still holding detached.
      const pdfjs = await loadPdfjs();
      docRef.current?.destroy?.();
      docRef.current = await pdfjs.getDocument({ data: bytes.slice() }).promise;

      setFile(f);
      setPages(read);
      setPageNo(1);
      setRanges("");
      setScope("all");
      setBox(FULL_BOX);
      syncMm(FULL_BOX, read[0]);
    } catch (err) {
      setError(
        err?.name === "PdfRenderTimeoutError"
          ? "This PDF is taking too long to render. Try a smaller file."
          : "Couldn't read that PDF. It may be corrupted or in an unsupported format."
      );
      setFile(null);
      setPages([]);
      setPreview("");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  // Rasterise one page for the drag stage. pdf.js's viewport already applies
  // /Rotate, so the image is in the same display space the crop box lives in.
  const rasterise = useCallback(async (n, longEdge) => {
    const doc = docRef.current;
    if (!doc) return null;
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const scale = longEdge / Math.max(base.width, base.height);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    // Pages are transparent where nothing is drawn; auto-trim reads "white" as
    // empty, so the white has to actually be there.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await renderPage(page, { canvasContext: ctx, viewport });
    return { canvas, ctx };
  }, []);

  useEffect(() => {
    if (!file || !pages.length) return;
    const token = ++renderRef.current;
    let cancelled = false;
    (async () => {
      try {
        const out = await rasterise(pageNo, PREVIEW_PX);
        if (cancelled || token !== renderRef.current || !out) return;
        setPreview(out.canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        if (!cancelled && token === renderRef.current) setPreview("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, pages, pageNo, rasterise]);

  // Page sizes are quoted per page, so flipping to a differently sized page
  // re-states the same proportional crop in that page's millimetres.
  useEffect(() => {
    syncMm(box, pages[pageNo - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNo]);

  useEffect(
    () => () => {
      docRef.current?.destroy?.();
      docRef.current = null;
    },
    []
  );

  const targetPages = useCallback(() => {
    const total = pages.length;
    if (scope === "all") return { pages: Array.from({ length: total }, (_, i) => i + 1), error: "" };
    return parseRanges(ranges, total);
  }, [scope, ranges, pages.length]);

  const autoTrim = async () => {
    setError("");
    setNote("");
    const { pages: list, error: rangeErr } = targetPages();
    if (rangeErr) {
      setError(rangeErr);
      return;
    }
    setScanning(true);
    try {
      // Evenly spaced sample rather than the first N: the first pages of a
      // scanned document are the least representative of its margins.
      let sample = list;
      if (list.length > SCAN_LIMIT) {
        const step = list.length / SCAN_LIMIT;
        sample = Array.from({ length: SCAN_LIMIT }, (_, i) => list[Math.floor(i * step)]);
      }
      const found = [];
      let blank = 0;
      for (let i = 0; i < sample.length; i++) {
        setProgress(`Checking page ${sample[i]}… (${i + 1} of ${sample.length})`);
        const out = await rasterise(sample[i], SCAN_PX);
        if (!out) continue;
        const { width, height } = out.canvas;
        const m = contentMargins(out.ctx.getImageData(0, 0, width, height).data, width, height);
        if (m) found.push(m);
        else blank++;
      }
      const merged = unionMargins(found);
      if (!merged || !hasCrop(merged)) {
        setNote(
          found.length
            ? "Nothing to trim — the content already reaches the edges of these pages."
            : "Every page checked came out blank, so there was no content to measure."
        );
        return;
      }
      applyBox(marginsToBox(merged));
      const scanned = `Measured ${sample.length} page${sample.length === 1 ? "" : "s"}`;
      const sampled = sample.length < list.length ? `, sampled evenly from ${list.length}` : "";
      const blanks = blank ? `; ${blank} blank page${blank === 1 ? "" : "s"} skipped` : "";
      setNote(`${scanned}${sampled}${blanks}. The box is the smallest crop that keeps every one of them whole — drag it if you want it tighter.`);
    } catch (err) {
      setError(
        err?.name === "PdfRenderTimeoutError"
          ? "This PDF is taking too long to render. Try trimming the margins by hand."
          : "Couldn't measure the margins on this PDF."
      );
    } finally {
      setScanning(false);
      setProgress("");
    }
  };

  // Pixels per fraction unit on each axis, read fresh at drag start. The box is
  // held as fractions of the page, and the stage is not square, so the two axes
  // have different scales — using one for both would make a vertical drag run at
  // the wrong speed. Returns null when the stage has no measurable size (a hidden
  // tab reports a zero-size box), since dividing by that turns a small drag into
  // a huge jump.
  const stageScale = () => {
    const stage = stageRef.current;
    if (!stage) return null;
    const r = stage.getBoundingClientRect();
    return r.width > 1 && r.height > 1 ? { x: r.width, y: r.height } : null;
  };

  // Pointer capture routes every later event for this pointer back to the element
  // that took the press, so the drag survives the cursor leaving the box — and,
  // unlike window listeners added in an effect, it is live from the first move.
  const startDrag = (e, mode) => {
    const scale = stageScale();
    if (!scale) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, box, scale };
    setDragging(true);
    setNote("");
  };

  const onMove = useCallback(
    (e) => {
      const d = dragRef.current;
      if (!d) return;
      const dx = (e.clientX - d.startX) / d.scale.x;
      const dy = (e.clientY - d.startY) / d.scale.y;
      const s = d.box;

      if (d.mode === "move") {
        applyBox({
          ...s,
          x: Math.min(Math.max(0, s.x + dx), 1 - s.w),
          y: Math.min(Math.max(0, s.y + dy), 1 - s.h),
        });
        return;
      }

      // Resize: move only the edges this handle owns, keeping the opposite ones fixed.
      let left = s.x;
      let top = s.y;
      let right = s.x + s.w;
      let bottom = s.y + s.h;
      if (d.mode.includes("w")) left = Math.min(Math.max(0, s.x + dx), right - MIN_FRACTION);
      if (d.mode.includes("e")) right = Math.max(Math.min(1, right + dx), left + MIN_FRACTION);
      if (d.mode.includes("n")) top = Math.min(Math.max(0, s.y + dy), bottom - MIN_FRACTION);
      if (d.mode.includes("s")) bottom = Math.max(Math.min(1, bottom + dy), top + MIN_FRACTION);

      applyBox({ x: left, y: top, w: right - left, h: bottom - top });
    },
    [applyBox]
  );

  const endDrag = useCallback((e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  }, []);

  const dragProps = { onPointerMove: onMove, onPointerUp: endDrag, onPointerCancel: endDrag };

  const setEdgeMm = (key, raw) => {
    setMmText((t) => ({ ...t, [key]: raw }));
    setNote("");
    const page = pages[pageNo - 1];
    if (!page) return;
    const n = parseFloat(raw);
    if (!Number.isFinite(n) || n < 0) return;
    const along = key === "top" || key === "bottom" ? page.dispH : page.dispW;
    setBox(marginsToBox(clampMargins({ ...boxToMargins(box), [key]: (n * PT_PER_MM) / along })));
  };

  const apply = async () => {
    setError("");
    setNote("");
    if (!file) return;
    const { pages: list, error: rangeErr } = targetPages();
    if (rangeErr) {
      setError(rangeErr);
      return;
    }
    if (!hasCrop(margins)) {
      setError("The box still covers the whole page, so there is nothing to crop yet.");
      return;
    }
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
      const all = doc.getPages();
      const wanted = new Set(list);
      all.forEach((p, i) => {
        if (wanted.has(i + 1)) cropPage(p, margins);
      });
      const result = await doc.save();
      const stem = file.name.replace(/\.pdf$/i, "") || "document";
      downloadBytes(result, `${stem}-cropped.pdf`);
    } catch {
      setError("Couldn't crop that PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  const pct = (v) => v * 100 + "%";
  const sizes = new Set(pages.map((p) => `${Math.round(p.dispW)}x${Math.round(p.dispH)}`));
  const mixed = sizes.size > 1;
  const after = current ? croppedDisplaySize(current.box, current.rotation, margins) : null;
  const { pages: targetList, error: targetErr } = file ? targetPages() : { pages: [], error: "" };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF, drag the box around what you want to keep, then download."
      />

      {file && pages.length > 0 && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}, {pages.length} page{pages.length === 1 ? "" : "s"},{" "}
            {mixed
              ? `${sizes.size} different page sizes`
              : `${Math.round(pages[0].dispW)}x${Math.round(pages[0].dispH)} pt (${mmOf(pages[0].dispW)} x ${mmOf(pages[0].dispH)} mm)`}
          </p>

          {pages.length > 1 && (
            <div className="btn-row">
              <button className="btn btn-ghost btn-sm" onClick={() => setPageNo((n) => Math.max(1, n - 1))} disabled={pageNo <= 1}>
                &larr; Previous
              </button>
              <span className="muted small">Page {pageNo} of {pages.length}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setPageNo((n) => Math.min(pages.length, n + 1))}
                disabled={pageNo >= pages.length}
              >
                Next &rarr;
              </button>
            </div>
          )}

          <div className={"crop-stage" + (dragging ? " dragging" : "")} ref={stageRef}>
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={`Page ${pageNo}`} draggable={false} />
            ) : (
              <div
                className="crop-placeholder"
                style={{ aspectRatio: current ? `${current.dispW} / ${current.dispH}` : "1 / 1.414" }}
              >
                <span className="muted small">Rendering page {pageNo}…</span>
              </div>
            )}
            <div
              className="crop-box"
              style={{ left: pct(box.x), top: pct(box.y), width: pct(box.w), height: pct(box.h) }}
              onPointerDown={(e) => startDrag(e, "move")}
              {...dragProps}
            >
              {HANDLES.map((h) => (
                <span
                  key={h.key}
                  className={"crop-handle crop-handle-" + h.key}
                  style={{ left: h.x * 100 + "%", top: h.y * 100 + "%" }}
                  onPointerDown={(e) => startDrag(e, h.key)}
                  {...dragProps}
                />
              ))}
            </div>
          </div>
          <p className="muted small center">Drag inside the box to move it, or drag a corner or edge to resize.</p>

          <div className="btn-row">
            <button className="btn btn-ghost" onClick={autoTrim} disabled={busy || scanning}>
              {scanning ? "Measuring…" : "Trim white margins"}
            </button>
            <button className="btn btn-ghost" onClick={reset} disabled={busy || scanning}>
              Reset
            </button>
          </div>
          {progress && <p className="muted small">{progress}</p>}
          {note && <p className="muted small">{note}</p>}

          <div className="field-row">
            {EDGES.map((e) => (
              <label className="field" key={e.key}>
                <span className="field-label">{e.label} (mm)</span>
                <input
                  className="inp"
                  type="number"
                  min={0}
                  step="0.5"
                  value={mmText[e.key]}
                  onChange={(ev) => setEdgeMm(e.key, ev.target.value)}
                />
              </label>
            ))}
          </div>
          <p className="muted small">
            How much to cut off each edge, as the page is shown here.
            {mixed
              ? " This document has more than one page size, so the crop is kept as a proportion of each page and these millimetres describe the page on screen."
              : ""}
          </p>

          {pages.length > 1 && (
            <>
              <Field label="Crop">
                <Segmented options={SCOPES} value={scope} onChange={setScope} ariaLabel="Which pages to crop" />
              </Field>
              {scope === "range" && (
                <>
                  <label className="field">
                    <span className="field-label">Pages to crop</span>
                    <input
                      className="inp mono"
                      value={ranges}
                      onChange={(e) => setRanges(e.target.value)}
                      placeholder="e.g. 2, 5-7"
                    />
                  </label>
                  <p className="muted small">
                    Use commas for separate pages and a hyphen for a range, like 2, 5-7. Pages you leave out keep their
                    full size.
                  </p>
                </>
              )}
            </>
          )}

          {after && (
            <div className="result-list">
              <div className="result-row">
                <span className="result-label">Page size</span>
                <code className="result-val">
                  {Math.round(current.dispW)}x{Math.round(current.dispH)} &rarr; {Math.round(after.w)}x{Math.round(after.h)} pt
                  {" "}({mmOf(after.w)} x {mmOf(after.h)} mm)
                </code>
              </div>
              <div className="result-row">
                <span className="result-label">Area kept</span>
                <code className="result-val">
                  {Math.round((1 - margins.left - margins.right) * (1 - margins.top - margins.bottom) * 100)}% of the page
                </code>
              </div>
              {pages.length > 1 && !targetErr && (
                <div className="result-row">
                  <span className="result-label">Pages cropped</span>
                  <code className="result-val">
                    {targetList.length} of {pages.length}
                  </code>
                </div>
              )}
            </div>
          )}

          <p className="muted small">
            Pages are cropped in place, so text stays selectable and links, bookmarks, form fields and comments all
            survive. Cropping <strong>hides</strong> what falls outside the box rather than deleting it — the text is
            still inside the file and can be recovered, so do not use a crop to take out anything confidential.
          </p>

          <div className="btn-row">
            <button className="btn" onClick={apply} disabled={busy || scanning || !hasCrop(margins)}>
              {busy ? "Cropping…" : "Crop and download"}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
