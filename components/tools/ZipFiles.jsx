"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { downloadBytes } from "@/components/tools/PdfDropzone";
import { Segmented } from "@/components/calc/Calc";
import {
  packEntry,
  buildZipBlob,
  zipPath,
  uniquePaths,
  isJunkFile,
  isPrecompressed,
  ZipTooLargeError,
} from "@/components/tools/zipWriter";

// The archive format — Deflate via CompressionStream, the Stored fallback,
// timestamps, path cleaning — is in zipWriter.js and tested in node against
// Python's zipfile and Info-ZIP; this file is the form around it.

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
};

const LIST_LIMIT = 300;
const MAX_TOTAL = 4 * 1024 * 1024 * 1024 - 64 * 1024 * 1024;
const MODES = [
  { value: "deflate", label: "Compress" },
  { value: "store", label: "Store only" },
];

// A dropped folder arrives as a FileSystemDirectoryEntry; readEntries hands
// back at most 100 children per call, so it is called until it returns none.
async function walkEntry(entry, prefix, out) {
  if (entry.isFile) {
    const file = await new Promise((res, rej) => entry.file(res, rej));
    out.push({ file, path: prefix + entry.name });
    return;
  }
  if (!entry.isDirectory) return;
  const reader = entry.createReader();
  const children = [];
  for (;;) {
    const batch = await new Promise((res, rej) => reader.readEntries(res, rej));
    if (!batch.length) break;
    children.push(...batch);
  }
  const path = prefix + entry.name + "/";
  if (!children.length) out.push({ dir: true, path });
  children.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  for (const c of children) await walkEntry(c, path, out);
}

let nextId = 1;

export default function ZipFiles() {
  const [items, setItems] = useState([]); // { id, file?, dir?, path }
  const [mode, setMode] = useState("deflate");
  const [skipJunk, setSkipJunk] = useState(true);
  const [zipName, setZipName] = useState("");
  const [nameEdited, setNameEdited] = useState(false);
  const [progress, setProgress] = useState(null); // { done, total, file }
  const [result, setResult] = useState(null); // { blob, url?, name, inSize, deflated, stored, files }
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [canPickFolder, setCanPickFolder] = useState(false);
  const fileRef = useRef(null);
  const folderRef = useRef(null);
  const abortRef = useRef(null);

  // Read after mount so the prerendered HTML and the first client render agree.
  useEffect(() => {
    const probe = document.createElement("input");
    setCanPickFolder("webkitdirectory" in probe);
  }, []);

  const busy = !!progress;

  // Until the visitor types a name of their own, the suggestion follows the list.
  useEffect(() => {
    if (!nameEdited) setZipName(suggestName(items));
  }, [items, nameEdited]);

  // Every change to the list invalidates the zip already made from it — cleared
  // here, in the handler, so no render shows a download that no longer matches.
  const addItems = (incoming) => {
    const clean = [];
    for (const it of incoming) {
      const p = zipPath(it.path);
      if (p) clean.push({ ...it, path: it.dir ? p + "/" : p, id: nextId++ });
    }
    if (!clean.length) return;
    setResult(null);
    setError("");
    setItems((prev) => [...prev, ...clean]);
  };

  const onPick = (list) => {
    addItems(Array.from(list || []).map((file) => ({ file, path: file.webkitRelativePath || file.name })));
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    if (busy) return;
    // webkitGetAsEntry must be called before the first await: the
    // DataTransfer is emptied once the drop event returns.
    const entries = Array.from(e.dataTransfer.items || [])
      .map((i) => (i.kind === "file" && i.webkitGetAsEntry ? i.webkitGetAsEntry() : null))
      .filter(Boolean);
    if (!entries.length) { onPick(e.dataTransfer.files); return; }
    const out = [];
    try {
      for (const en of entries) await walkEntry(en, "", out);
    } catch {
      setError("Some of the dropped files could not be read. Try adding them with the buttons instead.");
    }
    addItems(out);
  };

  const removeItem = (id) => {
    setResult(null);
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    setResult(null);
    setError("");
    setItems([]);
    setNameEdited(false);
  };

  const included = useMemo(() => items.filter((x) => !(skipJunk && x.file && isJunkFile(x.path))), [items, skipJunk]);
  const junkCount = items.length - included.length;
  const fileItems = included.filter((x) => x.file);
  const totalBytes = fileItems.reduce((a, x) => a + x.file.size, 0);
  const tooBig = totalBytes > MAX_TOTAL;

  const create = async () => {
    setResult(null);
    setError("");
    const ac = new AbortController();
    abortRef.current = ac;
    const paths = uniquePaths(included.map((x) => x.path));
    const state = { done: 0, total: totalBytes, file: "" };
    setProgress({ ...state });
    let lastPaint = 0;
    const tick = (n) => {
      state.done += n;
      const now = Date.now();
      if (now - lastPaint > 100) { lastPaint = now; setProgress({ ...state }); }
    };
    try {
      const entries = [];
      let deflated = 0;
      for (let i = 0; i < included.length; i++) {
        const it = included[i];
        if (it.dir) { entries.push({ path: paths[i], dir: true, mtime: new Date() }); continue; }
        state.file = paths[i];
        const compress = mode === "deflate" && !isPrecompressed(paths[i]);
        const packed = await packEntry(it.file, { compress, onBytes: tick, signal: ac.signal });
        if (packed.method === 8) deflated++;
        entries.push({ path: paths[i], mtime: new Date(it.file.lastModified || Date.now()), ...packed });
      }
      const blob = buildZipBlob(entries);
      const name = (zipName.trim() || "archive").replace(/\.zip$/i, "").replace(/[\\/:*?"<>|]+/g, "-") + ".zip";
      setResult({ blob, name, inSize: totalBytes, deflated, stored: fileItems.length - deflated, files: fileItems.length, storeOnly: mode === "store" });
      downloadBytes(blob, name, "application/zip");
    } catch (err) {
      if (err.name === "AbortError") setError("Stopped — no zip was made.");
      else if (err instanceof ZipTooLargeError) setError(err.message);
      else setError(`Couldn't make the zip: ${err.message || "a file could not be read"}. If a file changed or moved after you added it, add it again.`);
    } finally {
      setProgress(null);
      abortRef.current = null;
    }
  };

  const shown = included.slice(0, LIST_LIMIT);
  const saved = result && result.inSize > 0 ? 1 - result.blob.size / result.inSize : 0;

  return (
    <div>
      <div
        className={"dropzone" + (dragOver ? " dropzone-over" : "")}
        role="button"
        tabIndex={0}
        onClick={() => !busy && fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); if (!busy) fileRef.current?.click(); }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="dropzone-empty">
          <strong>{items.length ? "Drop more files or folders, or click to add files" : "Drop files or folders here, or click to choose files"}</strong>
          <span className="muted small">
            Zipped in your browser and never uploaded. Folders keep their structure inside the zip.
          </span>
        </div>
        <input ref={fileRef} type="file" multiple hidden onChange={(e) => { onPick(e.target.files); e.target.value = ""; }} />
        <input
          ref={folderRef}
          type="file"
          hidden
          {...{ webkitdirectory: "", directory: "" }}
          onChange={(e) => { onPick(e.target.files); e.target.value = ""; }}
        />
      </div>

      <div className="btn-row">
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} disabled={busy}>Add files</button>
        {canPickFolder && (
          <button className="btn btn-ghost" onClick={() => folderRef.current?.click()} disabled={busy}>Add a folder</button>
        )}
        {items.length > 0 && <button className="btn btn-ghost" onClick={clearAll} disabled={busy}>Clear all</button>}
      </div>

      {items.length > 0 && (
        <>
          <div className="stat-grid">
            <div className="stat"><span className="stat-num">{fileItems.length.toLocaleString()}</span><span className="stat-label">files</span></div>
            <div className="stat"><span className="stat-num">{fmtBytes(totalBytes)}</span><span className="stat-label">total</span></div>
          </div>

          <div style={{ marginTop: "1rem" }}>
            <span className="field-label">Compression</span>
            <Segmented options={MODES} value={mode} onChange={(v) => { setMode(v); setResult(null); }} ariaLabel="Compression" />
            <p className="muted small">
              {mode === "deflate"
                ? "Deflate, the method every zip tool reads. Photos, videos, music and other zips are already compressed, so they are stored as they are — squeezing them again saves almost nothing."
                : "Files are packed without compression: fastest, and the zip is the size of the files plus a few bytes each."}
            </p>
          </div>

          <label className="field" style={{ display: "block", marginTop: ".75rem" }}>
            <span className="field-label">Zip file name</span>
            <input
              className="inp"
              value={zipName}
              onChange={(e) => { setZipName(e.target.value); setNameEdited(true); setResult(null); }}
              placeholder="archive"
              aria-label="Zip file name"
            />
          </label>

          {junkCount > 0 && (
            <label className="check-row">
              <input type="checkbox" checked={skipJunk} disabled={busy} onChange={(e) => { setSkipJunk(e.target.checked); setResult(null); }} />
              Leave out system files ({junkCount} .DS_Store / Thumbs.db / __MACOSX file{junkCount === 1 ? "" : "s"})
            </label>
          )}

          {tooBig && (
            <p className="error">
              These files add up to more than 4 GB. A standard zip cannot hold that without the Zip64
              extensions, which this tool does not write — split them into several zips, or use 7-Zip.
            </p>
          )}

          <div className="btn-row">
            <button className="btn" onClick={create} disabled={busy || tooBig || included.length === 0}>
              {busy ? "Zipping…" : "Create zip"}
            </button>
            {busy && <button className="btn btn-ghost" onClick={() => abortRef.current?.abort()}>Cancel</button>}
          </div>

          {progress && (
            <div className="ocr-progress">
              <div className="ocr-bar">
                <div className="ocr-bar-fill" style={{ width: `${progress.total ? Math.round((progress.done / progress.total) * 100) : 100}%` }} />
              </div>
              <span className="muted small" style={{ overflowWrap: "anywhere" }}>
                {fmtBytes(progress.done)} of {fmtBytes(progress.total)}{progress.file ? ` — ${progress.file}` : ""}
              </span>
            </div>
          )}
          {error && <p className="error">{error}</p>}

          {result && (
            <div className="result-row-hl" style={{ marginTop: "1rem", border: "1px solid var(--line)", borderRadius: "8px", padding: ".85rem" }}>
              <p style={{ margin: 0, overflowWrap: "anywhere" }}>
                <strong>{result.name}</strong> — {fmtBytes(result.blob.size)}
                {result.inSize > 0 && (
                  <span className="muted">
                    {" "}({saved > 0.0005 ? `${(saved * 100).toFixed(1)}% smaller than` : "about the same size as"} the {fmtBytes(result.inSize)} of files)
                  </span>
                )}
              </p>
              <p className="muted small" style={{ margin: ".35rem 0 .75rem" }}>
                {result.files.toLocaleString()} file{result.files === 1 ? "" : "s"}: {result.deflated.toLocaleString()} compressed,{" "}
                {result.stored.toLocaleString()} stored as-is{result.storeOnly ? " (Store only)" : result.stored ? " (already compressed, or Deflate would not have made them smaller)" : ""}.
              </p>
              <button className="btn" onClick={() => downloadBytes(result.blob, result.name, "application/zip")}>Download {result.name}</button>
            </div>
          )}

          <ul className="file-list unzip-list">
            {shown.map((x) => {
              const slash = x.path.lastIndexOf("/", x.dir ? x.path.length - 2 : undefined);
              return (
                <li key={x.id}>
                  <div className="file-item">
                    <span className="file-name">
                      {slash >= 0 && <span className="muted">{x.path.slice(0, slash + 1)}</span>}
                      {x.path.slice(slash + 1)}
                    </span>
                    <span className="file-meta">{x.dir ? "empty folder" : fmtBytes(x.file.size)}</span>
                    <span className="file-ctrl">
                      <button className="btn-sm" disabled={busy} onClick={() => removeItem(x.id)} aria-label={"Remove " + x.path}>Remove</button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {included.length > LIST_LIMIT && (
            <p className="muted small">Showing {LIST_LIMIT} of {included.length.toLocaleString()} — all of them go into the zip.</p>
          )}
        </>
      )}

      <p className="muted small" style={{ marginTop: "1.5rem" }}>
        <strong>An ordinary zip.</strong> Windows Explorer, macOS Finder, 7-Zip and the <code>unzip</code>{" "}
        command open it without extra software. Names are written as UTF-8 and each file keeps its
        modified time. Two files with the same name in the same folder are kept as{" "}
        <code>name (2).ext</code> rather than one overwriting the other. Zips are not encrypted here — to
        open one, use <a href="/dev/unzip-files">Unzip Files</a>.
      </p>
    </div>
  );
}

// One folder dropped → its name; one file → that file's name; else "archive".
function suggestName(items) {
  if (!items.length) return "";
  const tops = new Set(items.map((x) => x.path.split("/")[0]));
  if (tops.size === 1) {
    const top = [...tops][0];
    const nested = items.some((x) => x.path.includes("/"));
    return nested ? top : top.replace(/\.[^.]+$/, "") || "archive";
  }
  return "archive";
}
