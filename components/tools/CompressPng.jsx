"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { parsePng, dropChunks } from "./pngChunks";
import { buildZip, ZipTooLargeError } from "./zip";
import { Segmented } from "@/components/calc/Calc";

// oxipng's own levels run 0–6; upstream advises against anything above 4,
// where the time grows steeply for a fraction of a percent more.
const LEVELS = [
  { value: 2, label: "Fast" },
  { value: 3, label: "Better" },
  { value: 4, label: "Best" },
];

const REASONS = {
  "not-png": "This isn't a PNG file. For JPG or WebP use the image compressor.",
  truncated: "This PNG looks damaged or cut short, so it was left alone.",
  animated: "Animated PNG (APNG) — left untouched so the animation keeps playing.",
};

// One worker for the batch, replaced after any failure: a Rust panic inside
// the wasm leaves the instance in a state that is not safe to call again.
function makeWorker() {
  return new Worker(new URL("./oxipng.worker.js", import.meta.url), { type: "module" });
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
    worker.postMessage(msg, [msg.bytes.buffer]);
  });
}

function uniqueName(name, taken) {
  let candidate = name;
  for (let n = 2; taken.has(candidate); n++) candidate = name.replace(/(\.png)$/i, `-${n}$1`);
  taken.add(candidate);
  return candidate;
}

export default function CompressPng() {
  const [files, setFiles] = useState([]);
  const [level, setLevel] = useState(2);
  const [strip, setStrip] = useState(true);
  const [optimiseAlpha, setOptimiseAlpha] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState([]); // { name, url, data, srcSize, w, h, stripped, unchanged }
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

  const compress = async () => {
    if (!files.length) {
      setError("Add at least one PNG.");
      return;
    }
    setError("");
    setBusy(true);
    releaseUrls();
    setResults([]);
    setFailures([]);

    const done = [];
    const bad = [];
    const taken = new Set();
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Optimising ${i + 1} of ${files.length} — ${file.name}…`);
      const original = new Uint8Array(await file.arrayBuffer());
      const info = parsePng(original);
      if (!info.ok) {
        bad.push({ name: file.name, reason: REASONS[info.reason] || REASONS.truncated });
        setFailures([...bad]);
        continue;
      }
      const input = strip && info.metadata.length ? dropChunks(original, info.chunks) : original.slice();
      try {
        workerRef.current ||= makeWorker();
        const out = await runInWorker(workerRef.current, {
          id: i,
          bytes: input,
          level,
          optimiseAlpha,
        });
        // oxipng never makes a file bigger by design, but stripping happens
        // before it, so compare against the original: if nothing at all was
        // gained, hand back the original bytes rather than a rewritten twin.
        const unchanged = out.length >= original.length;
        const data = unchanged ? original : out;
        const blob = new Blob([data], { type: "image/png" });
        const url = URL.createObjectURL(blob);
        urlsRef.current.push(url);
        done.push({
          name: uniqueName(file.name.replace(/\.png$/i, "") + "-min.png", taken),
          url,
          data,
          srcSize: original.length,
          w: info.width,
          h: info.height,
          stripped: strip && !unchanged ? info.metadata : [],
          unchanged,
        });
        setResults([...done]);
      } catch {
        workerRef.current?.terminate();
        workerRef.current = null;
        bad.push({ name: file.name, reason: "The optimiser couldn't read this PNG — it may be damaged." });
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
      downloadBytes(buildZip(results.map((r) => ({ name: r.name, data: r.data }))), "compressed-png.zip", "application/zip");
    } catch (err) {
      setError(err instanceof ZipTooLargeError ? err.message : "Couldn't build the zip.");
    }
  };

  const pct = (r) => Math.round((1 - r.data.length / r.srcSize) * 1000) / 10;

  return (
    <div>
      <PdfDropzone
        onFiles={addFiles}
        accept=".png,image/png"
        multiple
        label="Drop PNG files here, or click to choose"
        hint="Screenshots, logos, icons, exports. Optimised in your browser — never uploaded."
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

      <Segmented ariaLabel="Compression effort" value={level} onChange={setLevel} options={LEVELS} />
      <p className="muted small">
        Every setting is lossless — the pixels come out identical. Higher effort tries more ways of packing the same
        pixels and takes longer; Best is usually only a few percent smaller than Fast.
      </p>

      <label className="check-row">
        <input type="checkbox" checked={strip} onChange={(e) => setStrip(e.target.checked)} />
        Remove metadata (text comments, timestamps, EXIF)
      </label>
      <label className="check-row">
        <input type="checkbox" checked={optimiseAlpha} onChange={(e) => setOptimiseAlpha(e.target.checked)} />
        Clean up colour hidden under fully transparent pixels
      </label>

      <div className="btn-row">
        <button className="btn" onClick={compress} disabled={busy || !files.length}>
          {busy ? "Optimising…" : "Compress PNG"}
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
                {/* The readout is long, so it sits under the name rather than in
                    .file-meta, which does not shrink and would overflow a phone. */}
                <span className="file-name">
                  {r.name}
                  <span className="muted small" style={{ display: "block", wordBreak: "normal" }}>
                    {r.w}×{r.h} — {fmtBytes(r.srcSize)} → {fmtBytes(r.data.length)}
                    {r.unchanged ? " (already optimal — original kept)" : ` (−${pct(r)}%)`}
                    {r.stripped.length > 0 && ` · removed ${[...new Set(r.stripped)].join(", ")}`}
                  </span>
                </span>
                <span className="file-ctrl">
                  <button className="btn-sm" onClick={() => downloadBytes(r.data, r.name, "image/png")}>Download</button>
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
        Lossless means the savings are smaller than a lossy compressor would give — anywhere from nothing on a file that's
        already been optimised to a quarter or more on screenshots and exports from apps that favour speed over size. If you need a much
        smaller file and can accept some change to the pixels, converting to JPG or WebP in the{" "}
        <a href="/image/image-compressor">image compressor</a> will shrink a photo far further.
      </p>
    </div>
  );
}
