"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { buildZip, ZipTooLargeError } from "./zip";
import { Slider, Segmented, Field } from "@/components/calc/Calc";
import { defaultOptions } from "@jsquash/webp/meta.js";

// The encoder needs the whole RGBA frame plus its working copies in wasm
// memory; past this a phone tab is likely to run out of memory mid-encode.
const MAX_PIXELS = 50_000_000;
// The WebP bitstream stores each dimension in 14 bits.
const MAX_SIDE = 16383;

const ACCEPT = ".jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,image/jpeg,image/png,image/webp,image/gif,image/bmp,image/avif";

const MODES = [
  { value: "lossy", label: "Lossy (photos)" },
  { value: "lossless", label: "Lossless (graphics)" },
];

// One worker for the batch, replaced after any failure: an aborted emscripten
// instance is not safe to call again.
function makeWorker() {
  return new Worker(new URL("./webp.worker.js", import.meta.url), { type: "module" });
}

function runInWorker(worker, msg) {
  return new Promise((resolve, reject) => {
    const onMessage = ({ data }) => {
      if (data.id !== msg.id) return;
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      if (data.error) reject(new Error(data.error));
      else resolve(data.out);
    };
    const onError = (e) => {
      worker.removeEventListener("message", onMessage);
      worker.removeEventListener("error", onError);
      reject(new Error(e.message || "worker failed"));
    };
    worker.addEventListener("message", onMessage);
    worker.addEventListener("error", onError);
    worker.postMessage(msg, [msg.rgba]);
  });
}

// Decodes with the browser's own decoders. createImageBitmap applies the EXIF
// orientation, which matters because the WebP carries no EXIF to rotate it by.
async function readPixels(file) {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  if (width > MAX_SIDE || height > MAX_SIDE) {
    bitmap.close();
    throw new RangeError(`${width}×${height} is too big for WebP, which stops at 16,383 pixels a side — resize it first.`);
  }
  if (width * height > MAX_PIXELS) {
    bitmap.close();
    throw new RangeError(`${width}×${height} is over 50 megapixels — resize it first.`);
  }
  const canvas =
    typeof OffscreenCanvas !== "undefined"
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement("canvas"), { width, height });
  const ctx = canvas.getContext("2d");
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const { data } = ctx.getImageData(0, 0, width, height);
  return { rgba: data.buffer, width, height };
}

function uniqueName(name, taken) {
  let candidate = name;
  for (let n = 2; taken.has(candidate); n++) candidate = name.replace(/(\.webp)$/i, `-${n}$1`);
  taken.add(candidate);
  return candidate;
}

export default function WebpConverter() {
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState("lossy");
  const [quality, setQuality] = useState(75);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState([]); // { name, url, data, srcSize, w, h, lossless }
  const [failures, setFailures] = useState([]); // { name, reason }
  const [error, setError] = useState("");
  const urlsRef = useRef([]);
  const workerRef = useRef(null);

  const releaseUrls = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  useEffect(
    () => () => {
      releaseUrls();
      workerRef.current?.terminate();
    },
    [releaseUrls]
  );

  const addFiles = (incoming) => {
    setError("");
    if (incoming.length) setFiles((prev) => [...prev, ...incoming]);
  };

  const remove = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const clearAll = () => {
    releaseUrls();
    setFiles([]);
    setResults([]);
    setFailures([]);
    setProgress("");
    setError("");
  };

  const convert = async () => {
    if (!files.length) {
      setError("Add at least one image.");
      return;
    }
    setError("");
    setBusy(true);
    releaseUrls();
    setResults([]);
    setFailures([]);

    // libwebp's own defaults (method 4, the cwebp default) with two switches.
    // In lossless mode "quality" is compression effort, not fidelity; 75
    // matches cwebp -lossless. libwebp keeps every pixel with any opacity
    // exactly (checked in node, partial alpha included) and only rewrites the
    // colour under fully transparent ones, which is what lets lossless WebP
    // beat PNG on cut-out graphics. The one loss is upstream: the canvas we
    // decode through stores pixels premultiplied, so partly transparent ones
    // come back up to one level off (measured: 0 opaque pixels changed).
    const options =
      mode === "lossless" ? { ...defaultOptions, lossless: 1, quality: 75 } : { ...defaultOptions, quality };

    const done = [];
    const bad = [];
    const taken = new Set();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Converting ${i + 1} of ${files.length} — ${file.name}…`);
      let pixels;
      try {
        pixels = await readPixels(file);
      } catch (err) {
        const heic = /\.hei[cf]$/i.test(file.name);
        bad.push({
          name: file.name,
          reason:
            err instanceof RangeError
              ? err.message
              : heic
                ? "HEIC photos need converting to JPG first — use the HEIC to JPG tool."
                : "Your browser couldn't open this file as an image.",
        });
        setFailures([...bad]);
        continue;
      }
      try {
        workerRef.current ||= makeWorker();
        const data = await runInWorker(workerRef.current, { id: i, ...pixels, options });
        const blob = new Blob([data], { type: "image/webp" });
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        done.push({
          name: uniqueName(file.name.replace(/\.[^.]+$/, "") + ".webp", taken),
          url,
          data,
          srcSize: file.size,
          w: pixels.width,
          h: pixels.height,
          lossless: options.lossless === 1,
        });
        setResults([...done]);
      } catch {
        workerRef.current?.terminate();
        workerRef.current = null;
        bad.push({ name: file.name, reason: "The WebP encoder failed on this image — it may be too large for this device." });
        setFailures([...bad]);
      }
    }
    const before = done.reduce((n, r) => n + r.srcSize, 0);
    const after = done.reduce((n, r) => n + r.data.length, 0);
    setProgress(
      done.length
        ? `Done — ${fmtBytes(before)} → ${fmtBytes(after)} across ${done.length} file${done.length === 1 ? "" : "s"}.`
        : ""
    );
    setBusy(false);
  };

  const downloadZip = () => {
    try {
      downloadBytes(buildZip(results.map((r) => ({ name: r.name, data: r.data }))), "webp-images.zip", "application/zip");
    } catch (err) {
      setError(err instanceof ZipTooLargeError ? err.message : "Couldn't build the zip.");
    }
  };

  const change = (r) => {
    const pct = Math.round((r.data.length / r.srcSize - 1) * 1000) / 10;
    return pct <= 0 ? `−${Math.abs(pct)}%` : r.lossless
      ? `+${pct}% — larger than the original; lossy mode suits photos`
      : `+${pct}% — larger than the original; try a lower quality`;
  };

  return (
    <div>
      <PdfDropzone
        onFiles={addFiles}
        accept={ACCEPT}
        multiple
        label="Drop JPG, PNG, GIF or AVIF images here, or click to choose"
        hint="Converted to WebP in your browser — never uploaded."
      />

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((f, i) => (
            <li className="file-item" key={f.name + i}>
              <span className="file-name">{f.name}</span>
              <span className="file-meta">{fmtBytes(f.size)}</span>
              <span className="file-ctrl">
                <button className="btn-sm" onClick={() => remove(i)} disabled={busy} aria-label={"Remove " + f.name}>
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Field label="Compression">
        <Segmented options={MODES} value={mode} onChange={setMode} ariaLabel="Compression mode" />
      </Field>
      {mode === "lossy" ? (
        <>
          <Slider label="Quality" display={quality} value={quality} min={1} max={100} step={1} onChange={setQuality} />
          <p className="muted small">
            75 is libwebp&apos;s default and suits most photos on the web; 80–90 if people will zoom in on detail.
            Transparency is kept at full quality whatever the setting.
          </p>
        </>
      ) : (
        <p className="muted small">
          Every solid pixel is kept exactly, like a PNG — usually in a smaller file than the PNG it came from. (Partly
          see-through edge pixels can shift by one colour level, because browsers store them premultiplied — too
          small to see.) Best for logos, screenshots and graphics; photos come out much larger than in lossy mode.
        </p>
      )}

      <div className="btn-row">
        <button className="btn" onClick={convert} disabled={busy || !files.length}>
          {busy ? "Converting…" : "Convert to WebP"}
        </button>
        {(files.length > 0 || results.length > 0) && (
          <button className="btn btn-ghost" onClick={clearAll} disabled={busy}>Clear all</button>
        )}
      </div>

      {progress && <p className="muted small">{progress}</p>}
      {error && <p className="error">{error}</p>}

      {results.length > 0 && (
        <>
          <ul className="file-list">
            {results.map((r) => (
              <li className="file-item" key={r.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="file-thumb" src={r.url} alt={r.name} />
                <span className="file-name">
                  {r.name}
                  <span className="muted small" style={{ display: "block", wordBreak: "normal" }}>
                    {r.w}×{r.h} — {fmtBytes(r.srcSize)} → {fmtBytes(r.data.length)} ({change(r)})
                  </span>
                </span>
                <span className="file-ctrl">
                  <button className="btn-sm" onClick={() => downloadBytes(r.data, r.name, "image/webp")}>Download</button>
                </span>
              </li>
            ))}
          </ul>
          {results.length > 1 && (
            <div className="btn-row">
              <button className="btn" onClick={downloadZip} disabled={busy}>
                Download all as ZIP
              </button>
            </div>
          )}
        </>
      )}

      {failures.length > 0 && (
        <ul className="file-list">
          {failures.map((f, i) => (
            <li className="file-item" key={f.name + i}>
              <span className="file-name">
                {f.name}
                <span className="muted small" style={{ display: "block", wordBreak: "normal" }}>{f.reason}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="muted small">
        Animated GIFs are converted from their first frame only, and camera EXIF data is not carried over. To turn a
        WebP back into a JPG or PNG, open it in the <a href="/image/image-converter">image converter</a>; for an even
        smaller file in newer browsers, try the <a href="/image/avif-converter">AVIF converter</a>.
      </p>
    </div>
  );
}
