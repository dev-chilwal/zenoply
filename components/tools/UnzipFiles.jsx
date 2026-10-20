"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { downloadBytes } from "@/components/tools/PdfDropzone";
import {
  readZip,
  entryStream,
  extractBlob,
  unsupportedReason,
  safePathSegments,
  previewKind,
  mimeFor,
} from "@/components/tools/unzip";

// The zip format work — finding the directory, Zip64, name encodings, CRC
// checks, zip-slip path cleaning — is all in unzip.js and tested in node; this
// file is the form around it. Like FileChecksum it deliberately does not use
// PdfDropzone: that runs PDFs through the password gate, and a zip is read
// exactly as it sits on disk.

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
};

const LIST_LIMIT = 300;
const PREVIEW_MAX = 25 * 1024 * 1024;
const TEXT_PREVIEW_CHARS = 200000;

export default function UnzipFiles() {
  const [archive, setArchive] = useState(null); // File
  const [listing, setListing] = useState(null); // { entries, comment, prepended }
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [hideJunk, setHideJunk] = useState(true);
  const [filter, setFilter] = useState("");
  const [rowState, setRowState] = useState({}); // path -> "busy" | error text
  const [preview, setPreview] = useState(null); // { path, kind, url?, text?, truncated? }
  const [canPickFolder, setCanPickFolder] = useState(false);
  const [extract, setExtract] = useState(null); // { done, total, failed: [], skipped, finished, folder }
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const cancelRef = useRef(false);
  const previewUrlRef = useRef(null);

  // Read after mount so the prerendered HTML and the first client render agree.
  useEffect(() => {
    setCanPickFolder(typeof window !== "undefined" && "showDirectoryPicker" in window);
  }, []);

  const dropPreviewUrl = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };
  useEffect(() => dropPreviewUrl, []);

  const open = async (list) => {
    const file = Array.from(list || [])[0];
    if (!file) return;
    // Cleared here, synchronously, so no render ever pairs the new archive
    // with the previous one's listing or preview.
    dropPreviewUrl();
    setPreview(null);
    setListing(null);
    setExtract(null);
    setRowState({});
    setFilter("");
    setError("");
    setArchive(file);
    setReading(true);
    try {
      const z = await readZip(file);
      z.entries.sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true }));
      setListing(z);
    } catch (e) {
      setError(e.message || "Could not read this archive.");
    } finally {
      setReading(false);
    }
  };

  const files = useMemo(() => (listing ? listing.entries.filter((e) => !e.dir) : []), [listing]);
  const junkCount = useMemo(() => files.filter((e) => e.junk).length, [files]);
  const visible = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return files.filter((e) => !(hideJunk && e.junk) && (!q || e.path.toLowerCase().includes(q)));
  }, [files, hideJunk, filter]);

  const stats = useMemo(() => {
    if (!listing) return null;
    const kept = files.filter((e) => !(hideJunk && e.junk));
    const folders = new Set();
    for (const e of listing.entries) {
      if (hideJunk && e.junk) continue;
      // Counted as they would be written, so "../" and leading slashes in a
      // hostile path do not show up as folders of their own.
      const parts = safePathSegments(e.path) || [];
      for (let i = 1; i < parts.length + (e.dir ? 1 : 0); i++) folders.add(parts.slice(0, i).join("/"));
    }
    return {
      files: kept.length,
      folders: folders.size,
      size: kept.reduce((a, e) => a + e.size, 0),
      blocked: kept.filter((e) => unsupportedReason(e)).length,
      encrypted: kept.some((e) => e.encrypted),
    };
  }, [listing, files, hideJunk]);

  const downloadOne = async (entry) => {
    setRowState((s) => ({ ...s, [entry.path]: "busy" }));
    try {
      const blob = await extractBlob(archive, entry, mimeFor(entry.name));
      const segs = safePathSegments(entry.name);
      downloadBytes(blob, segs ? segs[segs.length - 1] : "file", blob.type);
      setRowState((s) => ({ ...s, [entry.path]: undefined }));
    } catch (e) {
      setRowState((s) => ({ ...s, [entry.path]: e.message }));
    }
  };

  const showPreview = async (entry) => {
    if (preview && preview.path === entry.path) {
      dropPreviewUrl();
      setPreview(null);
      return;
    }
    const kind = previewKind(entry.name);
    setRowState((s) => ({ ...s, [entry.path]: "busy" }));
    try {
      const blob = await extractBlob(archive, entry, mimeFor(entry.name));
      dropPreviewUrl();
      if (kind === "image") {
        previewUrlRef.current = URL.createObjectURL(blob);
        setPreview({ path: entry.path, kind, url: previewUrlRef.current });
      } else {
        const text = await blob.text();
        setPreview({
          path: entry.path,
          kind,
          text: text.slice(0, TEXT_PREVIEW_CHARS),
          truncated: text.length > TEXT_PREVIEW_CHARS,
        });
      }
      setRowState((s) => ({ ...s, [entry.path]: undefined }));
    } catch (e) {
      setRowState((s) => ({ ...s, [entry.path]: e.message }));
    }
  };

  // Writes the archive's real folder structure through the File System Access
  // API, each file streamed straight from its slice of the zip to disk — so a
  // multi-gigabyte entry never has to fit in memory. Into a new folder named
  // after the archive, the way Windows' "Extract All" does it.
  const extractAll = async () => {
    let root;
    try {
      root = await window.showDirectoryPicker({ mode: "readwrite" });
    } catch {
      return; // picker dismissed
    }
    const baseName = (safePathSegments(archive.name.replace(/\.[^.]+$/, "")) || ["archive"])[0];
    const targets = listing.entries.filter((e) => !(hideJunk && e.junk));
    const writable = targets.filter((e) => e.dir || !unsupportedReason(e));
    const state = { done: 0, total: writable.filter((e) => !e.dir).length, failed: [], skipped: targets.length - writable.length, finished: false, folder: baseName };
    setExtract({ ...state });
    cancelRef.current = false;
    let lastPaint = 0;
    try {
      const top = await root.getDirectoryHandle(baseName, { create: true });
      const dirCache = new Map();
      const dirFor = async (segs) => {
        let key = "";
        let handle = top;
        for (const s of segs) {
          key += "/" + s;
          if (!dirCache.has(key)) dirCache.set(key, await handle.getDirectoryHandle(s, { create: true }));
          handle = dirCache.get(key);
        }
        return handle;
      };
      for (const e of writable) {
        if (cancelRef.current) break;
        const segs = safePathSegments(e.path);
        if (!segs) continue;
        if (e.dir) { await dirFor(segs); continue; }
        const dir = await dirFor(segs.slice(0, -1));
        const fileName = segs[segs.length - 1];
        try {
          const stream = await entryStream(archive, e);
          const handle = await dir.getFileHandle(fileName, { create: true });
          await stream.pipeTo(await handle.createWritable());
        } catch (err) {
          state.failed.push({ path: e.path, message: err.message });
          try { await dir.removeEntry(fileName); } catch {}
        }
        state.done++;
        // Thousands of tiny files finish faster than React can usefully
        // repaint, so progress is published at most every 100 ms.
        const now = Date.now();
        if (now - lastPaint > 100) { lastPaint = now; setExtract({ ...state }); }
      }
    } catch (err) {
      state.failed.push({ path: "", message: err.message || "The folder could not be written to." });
    }
    state.finished = true;
    state.cancelled = cancelRef.current;
    setExtract({ ...state });
  };

  const extracting = extract && !extract.finished;
  const shown = visible.slice(0, LIST_LIMIT);

  return (
    <div>
      <div
        className={"dropzone" + (dragOver ? " dropzone-over" : "")}
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); }
        }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!extracting) open(e.dataTransfer.files); }}
      >
        <div className="dropzone-empty">
          <strong>{archive ? "Drop another zip, or click to choose" : "Drop a .zip file here, or click to choose"}</strong>
          <span className="muted small">
            Opened in your browser and never uploaded. Only the directory is read up front, so even a
            multi-gigabyte archive lists in a moment.
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".zip,.jar,.apk,.epub,.docx,.xlsx,.pptx,.odt,.ods,.odp,.cbz,.xpi,.whl,.nupkg,.vsix,application/zip"
          onChange={(e) => { open(e.target.files); e.target.value = ""; }}
        />
      </div>

      {reading && <p className="muted small">Reading the zip directory…</p>}
      {error && <p className="error">{error}</p>}

      {listing && stats && (
        <>
          <p className="field-label" style={{ marginTop: "1.25rem", overflowWrap: "anywhere" }}>
            {archive.name} <span className="muted">— {fmtBytes(archive.size)}</span>
          </p>
          <div className="stat-grid">
            <div className="stat"><span className="stat-num">{stats.files.toLocaleString()}</span><span className="stat-label">files</span></div>
            <div className="stat"><span className="stat-num">{stats.folders.toLocaleString()}</span><span className="stat-label">folders</span></div>
            <div className="stat"><span className="stat-num">{fmtBytes(stats.size)}</span><span className="stat-label">unzipped</span></div>
          </div>

          {listing.entries.length === 0 && <p className="muted small">This zip is empty — it is valid, but holds no files.</p>}
          {listing.prepended > 0 && (
            <p className="muted small">
              The archive starts {fmtBytes(listing.prepended)} into the file — this is a self-extracting
              archive, and that part is the program stub in front of it. It is skipped, not run.
            </p>
          )}
          {listing.comment && (
            <p className="muted small" style={{ overflowWrap: "anywhere" }}>
              <strong>Archive comment:</strong> {listing.comment}
            </p>
          )}
          {stats.encrypted && (
            <p className="error">
              Some files in this zip are password-protected. Encrypted entries cannot be opened here —
              use 7-Zip, Windows Explorer or <code>unzip</code> with the password. Everything else
              extracts normally.
            </p>
          )}
          {stats.blocked > 0 && !stats.encrypted && (
            <p className="error">
              {stats.blocked} file{stats.blocked === 1 ? " uses" : "s use"} a compression method browsers
              cannot decode (only Stored and Deflate are built in) — open {stats.blocked === 1 ? "it" : "them"} with 7-Zip.
            </p>
          )}

          {stats.files > 0 && (
            <div className="btn-row">
              {canPickFolder ? (
                <button className="btn" onClick={extractAll} disabled={extracting}>
                  {extracting ? "Extracting…" : "Extract all to a folder"}
                </button>
              ) : null}
              {extracting && (
                <button className="btn btn-ghost" onClick={() => { cancelRef.current = true; }}>Cancel</button>
              )}
            </div>
          )}
          {stats.files > 0 && !canPickFolder && (
            <p className="muted small">
              Your browser cannot write a folder to disk (that needs Chrome, Edge or another Chromium
              browser on a computer), so download the files you need one at a time below.
            </p>
          )}
          {extract && (
            <div style={{ marginTop: ".75rem" }}>
              {!extract.finished && (
                <div className="ocr-progress">
                  <div className="ocr-bar">
                    <div className="ocr-bar-fill" style={{ width: `${extract.total ? Math.round((extract.done / extract.total) * 100) : 0}%` }} />
                  </div>
                  <span className="muted small">{extract.done} of {extract.total} files</span>
                </div>
              )}
              {extract.finished && (
                <p className={extract.failed.length ? "error" : "muted small"}>
                  {extract.cancelled ? "Stopped. " : ""}
                  {extract.done - extract.failed.filter((f) => f.path).length} of {extract.total} files written to the
                  folder <code>{extract.folder}</code>
                  {extract.skipped ? `; ${extract.skipped} encrypted or unsupported file${extract.skipped === 1 ? "" : "s"} skipped` : ""}
                  .
                  {extract.failed.map((f, i) => (
                    <span key={i} style={{ display: "block", overflowWrap: "anywhere" }}>{f.message}</span>
                  ))}
                </p>
              )}
            </div>
          )}

          {(junkCount > 0 || files.length > 12) && (
            <div style={{ marginTop: "1rem" }}>
              {files.length > 12 && (
                <input
                  className="inp"
                  type="search"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by name or folder"
                  aria-label="Filter files"
                />
              )}
              {junkCount > 0 && (
                <label className="check-row">
                  <input type="checkbox" checked={hideJunk} disabled={extracting} onChange={(e) => setHideJunk(e.target.checked)} />
                  Hide macOS metadata ({junkCount} __MACOSX / .DS_Store file{junkCount === 1 ? "" : "s"})
                </label>
              )}
            </div>
          )}

          <ul className="file-list unzip-list">
            {shown.map((e) => {
              const why = unsupportedReason(e);
              const kind = !why && e.size <= PREVIEW_MAX ? previewKind(e.name) : null;
              const st = rowState[e.path];
              const slash = e.path.lastIndexOf("/");
              const isOpen = preview && preview.path === e.path;
              return (
                <li key={e.path + e.offset}>
                  <div className="file-item" title={e.modified ? `Modified ${e.modified.toLocaleString()}` : undefined}>
                    <span className="file-name">
                      {slash >= 0 && <span className="muted">{e.path.slice(0, slash + 1)}</span>}
                      {e.path.slice(slash + 1)}
                    </span>
                    <span className="file-meta">{fmtBytes(e.size)}</span>
                    <span className="file-ctrl">
                      {kind && (
                        <button className="btn-sm" disabled={st === "busy"} onClick={() => showPreview(e)}>
                          {isOpen ? "Close" : "View"}
                        </button>
                      )}
                      {!why && (
                        <button className="btn-sm" disabled={st === "busy"} onClick={() => downloadOne(e)} aria-label={"Download " + e.path}>
                          {st === "busy" ? "…" : "Download"}
                        </button>
                      )}
                    </span>
                  </div>
                  {why && <p className="muted small" style={{ margin: ".25rem .75rem 0" }}>{why}.</p>}
                  {st && st !== "busy" && <p className="error" style={{ margin: ".25rem .75rem 0" }}>{st}</p>}
                  {isOpen && preview.kind === "image" && (
                    <div className="unzip-preview">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview.url} alt={e.name} />
                    </div>
                  )}
                  {isOpen && preview.kind === "text" && (
                    <div className="unzip-preview">
                      <pre>{preview.text}</pre>
                      {preview.truncated && <p className="muted small">Showing the first {TEXT_PREVIEW_CHARS.toLocaleString()} characters — download the file for the rest.</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {visible.length > LIST_LIMIT && (
            <p className="muted small">
              Showing {LIST_LIMIT} of {visible.length.toLocaleString()} files — type in the filter to find
              the rest.{canPickFolder ? " Extract all writes every one of them." : ""}
            </p>
          )}
          {files.length > 0 && visible.length === 0 && <p className="muted small">No file names match that filter.</p>}
        </>
      )}

      <p className="muted small" style={{ marginTop: "1.5rem" }}>
        <strong>Every file is checked as it comes out.</strong> A zip stores a CRC-32 for each entry,
        and the extracted bytes are compared with it — a damaged archive gives you an error naming the
        file, never a silently corrupted copy. Paths that try to climb out of the destination folder
        (<code>../</code>, the &quot;zip slip&quot; trick) are flattened before anything is written.
      </p>
      <p className="muted small">
        Plenty of formats are zips underneath: <code>.docx</code>, <code>.xlsx</code>,{" "}
        <code>.pptx</code>, <code>.epub</code>, <code>.jar</code> and <code>.apk</code> all open here,
        which is a quick way to pull the original images out of a Word document. To check a download
        against its published checksum, use the <a href="/dev/file-checksum">file checksum calculator</a>.
      </p>
    </div>
  );
}
