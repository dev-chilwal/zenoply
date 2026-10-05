"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { Dancing_Script, Great_Vibes, Caveat } from "next/font/google";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { loadPdfjs, renderPage } from "./pdfjs";
import { Segmented, Field } from "@/components/calc/Calc";
import { pageBox, displaySize, normRotation } from "./pdfCrop";
import {
  MIN_WIDTH,
  clampPlacement,
  placementHeight,
  stampSignatures,
  inkBounds,
  clearPaper,
  hasDigitalSignature,
} from "./pdfSign";

// Script faces for typed signatures, self-hosted by next/font at build time.
// preload is off: the @font-face rules are tiny, and only someone who actually
// switches to "Type" should download a font file.
const dancing = Dancing_Script({ subsets: ["latin"], weight: "600", display: "swap", preload: false });
const vibes = Great_Vibes({ subsets: ["latin"], weight: "400", display: "swap", preload: false });
const caveat = Caveat({ subsets: ["latin"], weight: "500", display: "swap", preload: false });
const FONTS = [
  { value: "dancing", label: "Flowing", family: dancing.style.fontFamily },
  { value: "vibes", label: "Formal", family: vibes.style.fontFamily },
  { value: "caveat", label: "Casual", family: caveat.style.fontFamily },
];

const MODES = [
  { value: "draw", label: "Draw" },
  { value: "type", label: "Type" },
  { value: "upload", label: "Upload" },
];

const INKS = [
  { value: "#111111", label: "Black" },
  { value: "#1a3a8f", label: "Blue" },
];

// The drawing pad's own pixel size. It is shown at whatever width the column
// allows and keeps this 3:1 shape, so the line weight scales with it.
const PAD_W = 1200;
const PAD_H = 400;
const PEN_PX = 7;
// Transparent margin left around the trimmed signature, in its own pixels, so
// anti-aliased stroke edges are not shaved off by the trim.
const TRIM_PAD = 6;
// Uploaded pictures are scaled down to this long edge before cleaning — a phone
// photo of a signature is 12 megapixels of mostly paper.
const UPLOAD_PX = 1600;
const PREVIEW_PX = 1100;
// Where a new signature lands, as fractions of the displayed page: lower right,
// where a signature line usually is. Width is a typical signed name on A4.
const DEFAULT_PLACE = { x: 0.56, y: 0.8, w: 0.3 };

let nextId = 1;

// Crop a canvas to its ink and return the signature as PNG bytes plus the data
// URL used to show it. null when there is nothing on the canvas.
function trimCanvas(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const b = inkBounds(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height);
  if (!b) return null;
  const out = document.createElement("canvas");
  out.width = b.w + TRIM_PAD * 2;
  out.height = b.h + TRIM_PAD * 2;
  out.getContext("2d").drawImage(canvas, b.x, b.y, b.w, b.h, TRIM_PAD, TRIM_PAD, b.w, b.h);
  // toDataURL rather than toBlob: it is synchronous, and a hidden tab throttles
  // toBlob to about one call a second.
  const url = out.toDataURL("image/png");
  const bin = atob(url.slice(url.indexOf(",") + 1));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { url, bytes, width: out.width, height: out.height };
}

function drawStroke(ctx, pts) {
  if (!pts.length) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  if (pts.length === 1) {
    // A tap is a dot, not nothing.
    ctx.lineTo(pts[0].x + 0.1, pts[0].y);
  } else {
    // Curve through the midpoints so fast strokes come out smooth rather than
    // as a chain of straight segments.
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }
  ctx.stroke();
}

export default function SignPdf() {
  const docRef = useRef(null);
  const stageRef = useRef(null);
  const padRef = useRef(null);
  const strokesRef = useRef([]); // [[{x, y}]] in pad pixels
  const penRef = useRef(null); // stroke in progress
  const dragRef = useRef(null);
  const renderRef = useRef(0);

  const [file, setFile] = useState(null);
  const [pages, setPages] = useState([]); // { dispW, dispH }
  const [pageNo, setPageNo] = useState(1);
  const [preview, setPreview] = useState("");
  const [alreadySigned, setAlreadySigned] = useState(false);

  const [mode, setMode] = useState("draw");
  const [ink, setInk] = useState(INKS[0].value);
  const [strokeCount, setStrokeCount] = useState(0);
  const [typed, setTyped] = useState("");
  const [font, setFont] = useState(FONTS[0].value);
  const [upload, setUpload] = useState(null); // HTMLImageElement
  const [clean, setClean] = useState(true);
  const [threshold, setThreshold] = useState(200);
  const [sig, setSig] = useState(null); // { url, bytes, width, height }

  const [placements, setPlacements] = useState([]); // { id, page, x, y, w }
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const current = pages[pageNo - 1] || null;
  const disp = current ? { w: current.dispW, h: current.dispH } : null;
  const aspect = sig ? sig.width / sig.height : 3;

  // ---------- the PDF ----------

  const onFiles = async (incoming) => {
    setError("");
    const f = incoming[0];
    if (!f) return;
    setBusy(true);
    setProgress("Reading the PDF…");
    setPreview("");
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
      const read = doc.getPages().map((p) => {
        const d = displaySize(pageBox(p.getMediaBox(), p.getCropBox()), normRotation(p.getRotation().angle));
        return { dispW: d.w, dispH: d.h };
      });
      if (!read.length) throw new Error("no pages");

      // pdf.js gets its own copy: it transfers the buffer it is handed.
      const pdfjs = await loadPdfjs();
      docRef.current?.destroy?.();
      docRef.current = await pdfjs.getDocument({ data: bytes.slice() }).promise;

      setFile(f);
      setPages(read);
      setPageNo(1);
      setPlacements([]);
      setSelected(null);
      setAlreadySigned(hasDigitalSignature(bytes));
    } catch {
      setError("Couldn't read that PDF. It may be corrupted or in an unsupported format.");
      setFile(null);
      setPages([]);
      setPreview("");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  useEffect(() => {
    if (!file || !pages.length) return;
    const token = ++renderRef.current;
    let cancelled = false;
    (async () => {
      try {
        const doc = docRef.current;
        if (!doc) return;
        const page = await doc.getPage(pageNo);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: PREVIEW_PX / Math.max(base.width, base.height) });
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await renderPage(page, { canvasContext: ctx, viewport });
        if (cancelled || token !== renderRef.current) return;
        setPreview(canvas.toDataURL("image/jpeg", 0.9));
      } catch {
        if (!cancelled && token === renderRef.current) setPreview("");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, pages, pageNo]);

  useEffect(
    () => () => {
      docRef.current?.destroy?.();
      docRef.current = null;
    },
    []
  );

  // ---------- the signature ----------

  const redrawPad = useCallback(() => {
    const canvas = padRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = ink;
    ctx.lineWidth = PEN_PX;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of strokesRef.current) drawStroke(ctx, s);
    if (penRef.current) drawStroke(ctx, penRef.current);
  }, [ink]);

  // Rebuild the signature image whenever whatever it is made from changes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (mode === "draw") {
        redrawPad();
        setSig(strokeCount && padRef.current ? trimCanvas(padRef.current) : null);
        return;
      }
      if (mode === "type") {
        const text = typed.trim();
        if (!text) return setSig(null);
        const family = FONTS.find((f) => f.value === font).family;
        const css = `160px ${family}`;
        // Canvas does not wait for a web font: drawing before it arrives
        // silently falls back to the default face. Ask for it explicitly.
        try {
          await document.fonts.load(css, text);
        } catch {}
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        ctx.font = css;
        // Script faces swash well past their advance width, so measure and pad
        // generously; the trim takes the slack back off.
        canvas.width = Math.ceil(ctx.measureText(text).width + 240);
        canvas.height = 360;
        ctx.font = css;
        ctx.fillStyle = ink;
        ctx.textBaseline = "middle";
        ctx.fillText(text, 120, canvas.height / 2);
        setSig(trimCanvas(canvas));
        return;
      }
      if (!upload) return setSig(null);
      const scale = Math.min(1, UPLOAD_PX / Math.max(upload.naturalWidth, upload.naturalHeight));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(upload.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(upload.naturalHeight * scale));
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.drawImage(upload, 0, 0, canvas.width, canvas.height);
      if (clean) {
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        clearPaper(img.data, threshold);
        ctx.putImageData(img, 0, 0);
      }
      setSig(trimCanvas(canvas));
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, strokeCount, typed, font, ink, upload, clean, threshold, redrawPad]);

  const padPoint = (e) => {
    const r = padRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * PAD_W, y: ((e.clientY - r.top) / r.height) * PAD_H };
  };

  const padDown = (e) => {
    if (!padRef.current) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    penRef.current = [padPoint(e)];
    redrawPad();
  };
  const padMove = (e) => {
    if (!penRef.current) return;
    penRef.current.push(padPoint(e));
    redrawPad();
  };
  const padUp = (e) => {
    if (!penRef.current) return;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    strokesRef.current.push(penRef.current);
    penRef.current = null;
    setStrokeCount(strokesRef.current.length);
  };
  const undoStroke = () => {
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redrawPad();
  };
  const clearPad = () => {
    strokesRef.current = [];
    setStrokeCount(0);
    redrawPad();
  };

  const onUpload = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setError("");
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setUpload(img);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError("Couldn't open that picture. Try a PNG or JPG.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // ---------- placing it ----------

  const addHere = () => {
    if (!sig || !disp) return;
    const p = clampPlacement({ id: nextId++, page: pageNo, ...DEFAULT_PLACE }, aspect, disp);
    setPlacements((list) => [...list, p]);
    setSelected(p.id);
  };

  // Same spot on every other page — what initialling each page of a contract
  // needs. Taken from the selected signature on this page when there is one.
  const addEverywhere = () => {
    if (!sig) return;
    const from = placements.find((p) => p.id === selected && p.page === pageNo) || { ...DEFAULT_PLACE };
    const added = [];
    pages.forEach((pg, i) => {
      const n = i + 1;
      if (n === pageNo && from.id) return;
      added.push(
        clampPlacement({ id: nextId++, page: n, x: from.x, y: from.y, w: from.w }, aspect, { w: pg.dispW, h: pg.dispH })
      );
    });
    setPlacements((list) => [...list, ...added]);
  };

  const remove = (id) => {
    setPlacements((list) => list.filter((p) => p.id !== id));
    if (selected === id) setSelected(null);
  };

  const stageScale = () => {
    const r = stageRef.current?.getBoundingClientRect();
    return r && r.width > 1 && r.height > 1 ? { x: r.width, y: r.height } : null;
  };

  const startDrag = (e, p, mode) => {
    const scale = stageScale();
    if (!scale) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { mode, id: p.id, startX: e.clientX, startY: e.clientY, from: p, scale };
    setSelected(p.id);
    setDragging(true);
  };

  const onMove = (e) => {
    const d = dragRef.current;
    if (!d || !disp) return;
    const dx = (e.clientX - d.startX) / d.scale.x;
    const dy = (e.clientY - d.startY) / d.scale.y;
    const s = d.from;
    // Resizing holds the top-left corner and the signature's shape; only the
    // width is free, and the height follows from it — so the width is capped
    // by whichever of the right and bottom edges it would reach first.
    const maxW = Math.min(1 - s.x, ((1 - s.y) * disp.h * aspect) / disp.w);
    const next =
      d.mode === "move"
        ? { ...s, x: s.x + dx, y: s.y + dy }
        : { ...s, w: Math.max(MIN_WIDTH, Math.min(s.w + dx, maxW)) };
    setPlacements((list) => list.map((p) => (p.id === d.id ? clampPlacement(next, aspect, disp) : p)));
  };

  const endDrag = (e) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  };

  const dragProps = { onPointerMove: onMove, onPointerUp: endDrag, onPointerCancel: endDrag };

  // ---------- output ----------

  const apply = async () => {
    setError("");
    if (!file || !sig || !placements.length) return;
    setBusy(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
      await stampSignatures(doc, sig, placements);
      const result = await doc.save();
      const stem = file.name.replace(/\.pdf$/i, "") || "document";
      downloadBytes(result, `${stem}-signed.pdf`);
    } catch {
      setError("Couldn't sign that PDF. The file may be corrupted.");
    } finally {
      setBusy(false);
    }
  };

  const pct = (v) => v * 100 + "%";
  const onPage = placements.filter((p) => p.page === pageNo);
  const signedPages = [...new Set(placements.map((p) => p.page))].sort((a, b) => a - b);

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF, make your signature, then drag it where it belongs."
      />
      {progress && <p className="muted small">{progress}</p>}

      {file && pages.length > 0 && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}, {pages.length} page{pages.length === 1 ? "" : "s"}
          </p>
          {alreadySigned && (
            <p className="muted small">
              <strong>This PDF already carries a digital signature.</strong> Saving it with anything added — a
              signature picture included — breaks that signature&apos;s validation, and the signer&apos;s software
              will report the document as changed. If someone else signed it first, ask them how they want it
              countersigned.
            </p>
          )}

          <h3 className="sign-step">1. Your signature</h3>
          <Field label="Make it by">
            <Segmented options={MODES} value={mode} onChange={setMode} ariaLabel="How to make the signature" />
          </Field>
          {mode !== "upload" && (
            <Field label="Ink">
              <Segmented options={INKS} value={ink} onChange={setInk} ariaLabel="Ink colour" />
            </Field>
          )}

          {mode === "draw" && (
            <>
              <canvas
                ref={padRef}
                className="sign-pad"
                width={PAD_W}
                height={PAD_H}
                onPointerDown={padDown}
                onPointerMove={padMove}
                onPointerUp={padUp}
                onPointerCancel={padUp}
                aria-label="Signature pad — draw with a mouse, finger or stylus"
              />
              <div className="btn-row">
                <button className="btn btn-ghost btn-sm" onClick={undoStroke} disabled={!strokeCount}>
                  Undo stroke
                </button>
                <button className="btn btn-ghost btn-sm" onClick={clearPad} disabled={!strokeCount}>
                  Clear
                </button>
              </div>
            </>
          )}

          {mode === "type" && (
            <>
              <label className="field">
                <span className="field-label">Your name</span>
                <input
                  className="inp"
                  value={typed}
                  maxLength={60}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                />
              </label>
              <Field label="Style">
                <Segmented options={FONTS} value={font} onChange={setFont} ariaLabel="Signature style" />
              </Field>
            </>
          )}

          {mode === "upload" && (
            <>
              <label className="field">
                <span className="field-label">Photo or scan of your signature</span>
                <input className="inp" type="file" accept="image/png,image/jpeg,image/webp" onChange={onUpload} />
              </label>
              <label className="check-row">
                <input type="checkbox" checked={clean} onChange={(e) => setClean(e.target.checked)} />
                <span>Make the paper transparent, so only the ink lands on the page</span>
              </label>
              {clean && (
                <label className="field">
                  <span className="field-label">Paper sensitivity — {threshold}</span>
                  <input
                    type="range"
                    min={120}
                    max={250}
                    step={1}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                  />
                </label>
              )}
              {clean && upload && (
                <p className="muted small">Lower it if grey paper or shadows are left behind; raise it if faint strokes go missing.</p>
              )}
            </>
          )}

          {sig ? (
            <div className="sign-sample">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sig.url} alt="Your signature" />
            </div>
          ) : (
            <p className="muted small">
              {mode === "draw"
                ? "Sign in the box above."
                : mode === "type"
                  ? "Type your name to see it as a signature."
                  : upload
                    ? "Nothing is left once the paper is removed — lower the sensitivity."
                    : "Choose a picture of your signature on plain paper."}
            </p>
          )}

          <h3 className="sign-step">2. Place it</h3>
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

          <div className={"crop-stage sign-stage" + (dragging ? " dragging" : "")} ref={stageRef}>
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
            {sig &&
              disp &&
              onPage.map((p) => (
                <div
                  key={p.id}
                  className={"sign-place" + (selected === p.id ? " selected" : "")}
                  style={{ left: pct(p.x), top: pct(p.y), width: pct(p.w), height: pct(placementHeight(p.w, aspect, disp)) }}
                  onPointerDown={(e) => startDrag(e, p, "move")}
                  {...dragProps}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sig.url} alt="" draggable={false} />
                  <button
                    type="button"
                    className="sign-remove"
                    aria-label="Remove this signature"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => remove(p.id)}
                  >
                    &times;
                  </button>
                  <span
                    className="crop-handle crop-handle-se"
                    style={{ left: "100%", top: "100%" }}
                    onPointerDown={(e) => startDrag(e, p, "resize")}
                    {...dragProps}
                  />
                </div>
              ))}
          </div>
          <p className="muted small center">
            Drag a signature to move it, or drag its corner to resize. &times; removes it.
          </p>

          <div className="btn-row">
            <button className="btn btn-ghost" onClick={addHere} disabled={!sig}>
              Add to this page
            </button>
            {pages.length > 1 && (
              <button className="btn btn-ghost" onClick={addEverywhere} disabled={!sig}>
                Add to every page
              </button>
            )}
            {placements.length > 0 && (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setPlacements([]);
                  setSelected(null);
                }}
              >
                Remove all
              </button>
            )}
          </div>

          {placements.length > 0 && (
            <div className="result-list">
              <div className="result-row">
                <span className="result-label">Signatures placed</span>
                <code className="result-val">
                  {placements.length} on {signedPages.length === pages.length && pages.length > 1
                    ? "every page"
                    : `page${signedPages.length === 1 ? "" : "s"} ${signedPages.join(", ")}`}
                </code>
              </div>
            </div>
          )}

          <h3 className="sign-step">3. Download</h3>
          <p className="muted small">
            This adds a <strong>picture</strong> of your signature to the page — the same as signing a printout and
            scanning it back, without the printer. It is not a certificate-based digital signature: nothing in the
            file proves who placed it, and nothing stops it being edited later. That is enough for most everyday
            forms, letters and agreements, but if a bank, court or government portal asks for a &quot;digital
            signature&quot; (a DSC or certificate), this is not that.
          </p>

          <div className="btn-row">
            <button className="btn" onClick={apply} disabled={busy || !sig || !placements.length}>
              {busy ? "Signing…" : "Sign and download"}
            </button>
          </div>
          {!placements.length && sig && <p className="muted small">Add your signature to a page to download.</p>}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
