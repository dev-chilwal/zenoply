"use client";
import { useEffect, useRef, useState } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { loadPdfjs } from "./pdfjs";
import { parseRanges } from "./SplitPdf";
import { Segmented } from "@/components/calc/Calc";
import { buildZip, ZipTooLargeError } from "./zip";
import {
  collectPageImages,
  collectRawJpegs,
  flattenOntoWhite,
  imageDataToRgba,
  imageFileName,
} from "./pdfImages";

// A PDF can reference the same picture from a hundred pages; without a ceiling
// a pathological file would fill the tab with thumbnails before anyone could
// stop it. Reaching the cap is reported rather than passed off as the whole set.
const MAX_IMAGES = 200;

// pdf.js hands an image over asynchronously, and there are two ways the handover
// never completes: it resolves to null when the image could not be decoded, and
// when a picture shared between pages is copied from an earlier page's cache
// that lookup can come back empty, in which case nothing is ever resolved at
// all. The wait is therefore bounded and a miss is simply skipped.
function resolveImage(page, objId, timeoutMs = 30000) {
  const store = objId.startsWith("g_") ? page.commonObjs : page.objs;
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve(null);
    }, timeoutMs);
    store.get(objId, (data) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// A note on how exact the PNG route is, measured in a real browser over all 256
// alpha values: an opaque pixel round-trips bit for bit, and the alpha channel
// is always exact. Partly transparent pixels are not, because canvas holds
// colour already multiplied by alpha in eight bits — the recovered colour is off
// by about 255/(2a), so a step or two at a=128 and everything at a=0. What is
// preserved exactly is the product, which is the colour anyone actually sees;
// only the hidden colour under a faint pixel drifts. Users who need untouched
// bytes have the Original option, which never decodes the image at all.

async function encodeImage(img, type) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  const isJpeg = type === "image/jpeg";
  if (img.bitmap) {
    // Browsers hand back an ImageBitmap for anything they can decode natively,
    // and drawImage composites it over the white below.
    if (isJpeg) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(img.bitmap, 0, 0);
  } else {
    // putImageData overwrites alpha instead of blending, so transparency has to
    // be composited before it reaches the canvas, not painted underneath.
    const rgba = imageDataToRgba(img);
    ctx.putImageData(new ImageData(isJpeg ? flattenOntoWhite(rgba) : rgba, img.width, img.height), 0, 0);
  }
  return canvasToBlob(canvas, type, isJpeg ? 0.92 : undefined);
}

export default function ExtractPdfImages() {
  const [file, setFile] = useState(null);
  const [ranges, setRanges] = useState("");
  const [format, setFormat] = useState("original");
  const [minSize, setMinSize] = useState(24);
  const [results, setResults] = useState(null);
  const [summary, setSummary] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const urlsRef = useRef([]);

  const releaseUrls = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  };
  useEffect(() => releaseUrls, []);

  const reset = () => {
    releaseUrls();
    setResults(null);
    setSummary(null);
  };

  const onFiles = (incoming) => {
    setError("");
    reset();
    const f = incoming[0];
    if (f) setFile(f);
  };

  const extract = async () => {
    setError("");
    if (!file) return;
    setBusy(true);
    reset();
    setProgress("Opening the PDF…");
    let pdf = null;
    try {
      const pdfjs = await loadPdfjs();
      // pdf.js transfers the array it is given to its worker, so pdf-lib gets
      // its own read of the file rather than a detached buffer.
      pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;

      let rawJpegs = new Map();
      if (format === "original") {
        rawJpegs = await collectRawJpegs(new Uint8Array(await file.arrayBuffer()));
      }

      let pages = [];
      if (ranges.trim()) {
        const parsed = parseRanges(ranges, pdf.numPages);
        if (parsed.error) {
          setError(parsed.error);
          return;
        }
        pages = parsed.pages;
      } else {
        for (let n = 1; n <= pdf.numPages; n++) pages.push(n);
      }

      const found = [];
      const seen = new Set();
      let tooSmall = 0;
      let stencils = 0;
      let capped = false;

      for (const n of pages) {
        setProgress(`Scanning page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const opList = await page.getOperatorList();
        const { objIds, stencils: pageStencils } = collectPageImages(opList, pdfjs.OPS);
        stencils += pageStencils;

        let indexOnPage = 0;
        for (const objId of objIds) {
          if (found.length >= MAX_IMAGES) {
            capped = true;
            break;
          }
          const img = await resolveImage(page, objId);
          if (!img || !img.width || !img.height) continue;
          // The reference string is the same on every page that draws this
          // picture; the object id is not, so it alone would save the same
          // photo once per page it appears on.
          const key = img.ref || `obj:${objId}`;
          if (seen.has(key)) continue;
          seen.add(key);
          if (img.width < minSize || img.height < minSize) {
            tooSmall++;
            continue;
          }

          const raw = format === "original" ? rawJpegs.get(img.ref) : null;
          let blob;
          let ext;
          let origin;
          if (raw) {
            blob = new Blob([raw], { type: "image/jpeg" });
            ext = "jpg";
            origin = "original JPEG";
          } else {
            const type = format === "image/jpeg" ? "image/jpeg" : "image/png";
            blob = await encodeImage(img, type);
            if (!blob) continue;
            ext = type === "image/jpeg" ? "jpg" : "png";
            origin = type === "image/jpeg" ? "re-encoded JPG" : "rebuilt PNG";
          }
          // Numbered only once an image has actually been produced, so the
          // names on a page run 1, 2, 3 with no gap where one failed to encode.
          indexOnPage++;
          const url = URL.createObjectURL(blob);
          urlsRef.current.push(url);
          found.push({
            key,
            url,
            blob,
            origin,
            page: n,
            width: img.width,
            height: img.height,
            name: imageFileName(file.name, n, indexOnPage, ext),
          });
        }
        if (capped) break;
      }
      // Deliberately no page.cleanup() in the loop: a picture shared between
      // pages is delivered to later pages by copying it out of an earlier
      // page's store, and clearing that store makes the copy fail.

      setResults(found);
      setSummary({ tooSmall, stencils, capped, pages: pages.length });
      setProgress("");
    } catch (err) {
      setError(
        err?.name === "PdfRenderTimeoutError"
          ? "This PDF is taking too long to read. Try a smaller page range."
          : "Couldn't read this PDF. It may be corrupted or password-protected."
      );
      setProgress("");
    } finally {
      // Every image now exists as an encoded blob, so the decoded copies pdf.js
      // is holding — which for a photo-heavy document are the larger of the two
      // — can go. Only safe here, after the whole sweep: closing the document
      // also closes the bitmaps and the shared-image store the loop relies on.
      pdf?.destroy().catch(() => {});
      setBusy(false);
    }
  };

  const downloadZip = async () => {
    if (!results?.length) return;
    setError("");
    setBusy(true);
    try {
      const entries = [];
      for (const item of results) entries.push({ name: item.name, data: new Uint8Array(await item.blob.arrayBuffer()) });
      const base = file.name.replace(/\.pdf$/i, "") || "pdf";
      downloadBytes(buildZip(entries), `${base}-images.zip`, "application/zip");
    } catch (err) {
      setError(
        err instanceof ZipTooLargeError ? err.message : "Couldn't build the zip. Try downloading the images one by one."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        hint="Choose a PDF. Every picture inside it is pulled out at the size it is stored, not the size it is printed."
      />
      {file && (
        <>
          <p className="muted small">
            {file.name} — {fmtBytes(file.size)}
          </p>

          <label className="field">
            <span className="field-label">Pages (blank for all)</span>
            <input
              className="inp"
              value={ranges}
              onChange={(e) => {
                setRanges(e.target.value);
                reset();
              }}
              placeholder="e.g. 1-5, 8, 11-13"
            />
          </label>

          <span className="field-label">Save as</span>
          <Segmented
            ariaLabel="Image format"
            value={format}
            onChange={(v) => {
              setFormat(v);
              reset();
            }}
            options={[
              { value: "original", label: "Original" },
              { value: "image/png", label: "PNG" },
              { value: "image/jpeg", label: "JPG" },
            ]}
          />
          <p className="muted small">
            <strong>Original</strong> hands back the photographer&rsquo;s own JPEG untouched wherever the PDF stored one
            that way — same file, same quality, byte for byte — and falls back to PNG for the rest.{" "}
            <strong>PNG</strong> rebuilds every image from the decoded pixels with no lossy compression, keeps
            transparency, and is pixel-exact on anything opaque. <strong>JPG</strong> makes photos smaller but
            flattens transparency onto white.
          </p>

          <label className="field">
            <span className="field-label">Skip images smaller than {minSize}px on either side</span>
            <input
              type="range"
              min={0}
              max={200}
              step={8}
              value={minSize}
              onChange={(e) => {
                setMinSize(Number(e.target.value));
                reset();
              }}
            />
          </label>
          <p className="muted small">
            Documents are full of tiny images that are not pictures — one-pixel gradient strips, rules and bullet
            artwork. Set this to 0 to keep every last one.
          </p>

          <div className="btn-row">
            <button className="btn" onClick={extract} disabled={busy}>
              {busy ? progress || "Working…" : "Find images"}
            </button>
          </div>
          {busy && progress && <p className="muted small">{progress}</p>}

          {results && results.length === 0 && (
            <p className="muted small">
              {summary?.stencils
                ? "No photographs in this PDF. Its graphics are drawn as vector art and one-colour stencils, which are shapes rather than images, so there is nothing to save out."
                : summary?.tooSmall
                ? `No images above ${minSize}px — ${summary.tooSmall} smaller one${summary.tooSmall === 1 ? " was" : "s were"} skipped. Lower the size limit to include them.`
                : "No images found on these pages. A PDF made from a word processor is often pure text and vector graphics."}
            </p>
          )}

          {results && results.length > 0 && (
            <>
              <p className="muted small">
                Found {results.length} image{results.length === 1 ? "" : "s"} across {summary.pages} page
                {summary.pages === 1 ? "" : "s"}
                {summary.tooSmall ? `, and skipped ${summary.tooSmall} under ${minSize}px` : ""}.
                {summary.capped ? ` Stopped at the first ${MAX_IMAGES} — narrow the page range for the rest.` : ""}
              </p>
              <div className="btn-row">
                <button className="btn" onClick={downloadZip} disabled={busy}>
                  {busy ? "Zipping…" : `Download all ${results.length} as a zip`}
                </button>
              </div>
              <div className="page-grid">
                {results.map((item) => (
                  <div className="page-card" key={item.key}>
                    <div className="page-thumb page-thumb-img">
                      <img src={item.url} alt={`Image from page ${item.page}`} loading="lazy" />
                    </div>
                    <div className="page-card-bar">
                      <span className="muted small">
                        {item.width}&times;{item.height}
                      </span>
                      <div className="page-card-actions">
                        <button
                          onClick={() => downloadBytes(item.blob, item.name, item.blob.type)}
                          title={`Download ${item.name} — ${item.origin}, ${fmtBytes(item.blob.size)}`}
                          aria-label={`Download ${item.name}`}
                        >
                          &darr;
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
