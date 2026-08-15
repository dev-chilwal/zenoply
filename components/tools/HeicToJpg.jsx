"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { convertHeic, loadHeic, looksLikeHeif } from "./heic";
import { Segmented } from "@/components/calc/Calc";

const FORMATS = [
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

// Chrome asks the user to confirm before letting a page save several files in a
// row, and fires the prompt once for the whole burst only if the clicks are
// close together; a small gap also keeps the tab from stalling on big photos.
const DOWNLOAD_GAP_MS = 150;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function HeicToJpg() {
  const [files, setFiles] = useState([]);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [results, setResults] = useState([]); // { name, url, blob, srcSize, w, h }
  const [failures, setFailures] = useState([]); // { name, reason }
  const [error, setError] = useState("");
  // Object URLs outlive React state updates, so they are tracked separately and
  // revoked on replacement and on unmount — a batch of 4 MB photos left behind
  // would otherwise pin tens of megabytes for the life of the tab.
  const urlsRef = useRef([]);

  const releaseUrls = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);

  useEffect(() => releaseUrls, [releaseUrls]);

  const addFiles = (incoming) => {
    setError("");
    if (!incoming.length) return;
    setFiles((prev) => [...prev, ...incoming]);
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

  const fmt = FORMATS.find((f) => f.value === format) || FORMATS[0];
  const isLossy = format !== "image/png";

  const convert = async () => {
    if (!files.length) {
      setError("Add at least one HEIC photo.");
      return;
    }
    setError("");
    setBusy(true);
    releaseUrls();
    setResults([]);
    setFailures([]);

    const done = [];
    const bad = [];
    try {
      // Fetch the decoder before the loop rather than on the first file, so a
      // network failure is reported as what it is instead of being attributed
      // to whichever photo happened to be first in the queue.
      setProgress("Loading the decoder…");
      await loadHeic();
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(`Converting ${i + 1} of ${files.length} — ${file.name}…`);
        try {
          const blob = await convertHeic(file, format, quality);
          const url = URL.createObjectURL(blob);
          urlsRef.current.push(url);
          // Read the size back off the decoded result rather than the source:
          // libheif applies the file's own rotation flag, so a portrait iPhone
          // photo stored as landscape reports its upright dimensions here.
          let w = 0;
          let h = 0;
          try {
            const bmp = await createImageBitmap(blob);
            w = bmp.width;
            h = bmp.height;
            bmp.close?.();
          } catch {
            /* dimensions are a nicety — a converted file is still a result */
          }
          done.push({
            name: file.name.replace(/\.(heic|heif|hif)$/i, "") + "." + fmt.ext,
            url,
            blob,
            srcSize: file.size,
            w,
            h,
          });
          setResults([...done]);
        } catch (err) {
          const heif = await looksLikeHeif(file).catch(() => false);
          bad.push({
            name: file.name,
            reason: heif
              ? "Couldn't decode this one — it may be damaged, or use a codec libheif doesn't read."
              : "This doesn't look like a HEIC or HEIF file.",
          });
          setFailures([...bad]);
        }
      }
      setProgress(
        done.length
          ? `Done — ${done.length} file${done.length === 1 ? "" : "s"} converted to ${fmt.label}.`
          : ""
      );
    } catch {
      setError("Couldn't load the HEIC decoder. Check your connection and try again.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  };

  const downloadAll = async () => {
    for (const r of results) {
      downloadBytes(r.blob, r.name, format);
      await sleep(DOWNLOAD_GAP_MS);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={addFiles}
        accept=".heic,.heif,.hif,image/heic,image/heif"
        multiple
        label="Drop HEIC photos here, or click to choose"
        hint="Straight from an iPhone or iPad. Converted in your browser — never uploaded."
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

      <Segmented
        ariaLabel="Output format"
        value={format}
        onChange={setFormat}
        options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
      />

      {isLossy ? (
        <label className="field">
          <span className="field-label">Quality: {Math.round(quality * 100)}%</span>
          <input
            type="range"
            min={0.3}
            max={1}
            step={0.01}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </label>
      ) : (
        <p className="muted small">PNG keeps every pixel exactly, so the files are much larger than the HEIC originals.</p>
      )}

      <div className="btn-row">
        <button className="btn" onClick={convert} disabled={busy || !files.length}>
          {busy ? "Converting…" : `Convert to ${fmt.label}`}
        </button>
        {(files.length > 0 || results.length > 0) && (
          <button className="btn btn-ghost" onClick={clearAll} disabled={busy}>Clear all</button>
        )}
      </div>

      {progress && <p className="muted small">{progress}</p>}
      {busy && files.length > 0 && (
        <p className="muted small">The decoder is a 3 MB download on the first conversion, then it is cached.</p>
      )}
      {error && <p className="error">{error}</p>}

      {results.length > 0 && (
        <>
          <ul className="file-list">
            {results.map((r) => (
              <li className="file-item" key={r.url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="file-thumb" src={r.url} alt={r.name} />
                <span className="file-name">{r.name}</span>
                <span className="file-meta">
                  {r.w ? `${r.w}×${r.h} — ` : ""}{fmtBytes(r.srcSize)} → {fmtBytes(r.blob.size)}
                </span>
                <span className="file-ctrl">
                  <button className="btn-sm" onClick={() => downloadBytes(r.blob, r.name, format)}>Download</button>
                </span>
              </li>
            ))}
          </ul>
          {results.length > 1 && (
            <div className="btn-row">
              <button className="btn" onClick={downloadAll} disabled={busy}>
                Download all {results.length}
              </button>
            </div>
          )}
        </>
      )}

      {failures.length > 0 && (
        <ul className="file-list">
          {failures.map((f, i) => (
            <li className="file-item" key={f.name + i}>
              <span className="file-name">{f.name}</span>
              <span className="file-meta">{f.reason}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="muted small">
        Converting through a canvas rewrites the pixels and drops everything else, so the JPG or PNG you get carries no
        EXIF — no GPS coordinates, no camera serial, no timestamp. To check what a photo you already have is carrying,
        use the <a href="/image/exif-viewer">EXIF viewer and remover</a>.
      </p>
    </div>
  );
}
