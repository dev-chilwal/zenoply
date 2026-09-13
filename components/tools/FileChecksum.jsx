"use client";
import { useState, useRef, useCallback, useMemo } from "react";
import { Field } from "@/components/calc/Calc";
import {
  ALGOS,
  DEFAULT_ALGOS,
  algoById,
  algoForLength,
  bytesToHex,
  entryForFile,
  hashBlob,
  nameDiffers,
  parseExpected,
  verdictFor,
} from "@/components/tools/checksum";

// Every digest, the streaming that makes them work on a file too big to hold in
// memory, and the parsing of a pasted SHA256SUMS line all live in checksum.js so
// they can be run in node against node:crypto; this file is only the form
// around them.
//
// The one thing worth noting here rather than there: this tool deliberately
// does NOT use PdfDropzone. That component runs every PDF through the qpdf
// password gate, which rewrites the bytes — and a checksum of rewritten bytes
// is the wrong answer to the only question this tool is asked. Files are read
// exactly as they sit on disk, whatever they are.

const fmtBytes = (n) => {
  if (n < 1024) return `${n} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let v = n / 1024, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
};

export default function FileChecksum() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(DEFAULT_ALGOS);
  const [results, setResults] = useState([]); // { name, size, digests }
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(null); // { index, total, done, bytes }
  const [expected, setExpected] = useState("");
  const [copied, setCopied] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const cancelRef = useRef(false);

  const addFiles = useCallback((list) => {
    const picked = Array.from(list || []);
    if (!picked.length) return;
    setResults([]);
    setFiles((prev) => [...prev, ...picked]);
  }, []);

  const toggle = (id) => {
    setResults([]);
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : ALGOS.filter((a) => a.id === id || prev.includes(a.id)).map((a) => a.id)));
  };

  const run = async () => {
    if (!files.length || !selected.length) return;
    cancelRef.current = false;
    setBusy(true);
    setResults([]);
    const out = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      setProgress({ index: i, total: files.length, done: 0, bytes: f.size });
      const digests = await hashBlob(f, selected, {
        onProgress: (done, bytes) => setProgress({ index: i, total: files.length, done, bytes }),
        shouldStop: () => cancelRef.current,
      });
      if (!digests) break;
      out.push({ name: f.name, size: f.size, digests });
      setResults([...out]);
    }
    setProgress(null);
    setBusy(false);
  };

  const copy = async (value, tag) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(tag);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  };

  const parsed = useMemo(() => parseExpected(expected), [expected]);

  // Two files with the same SHA-256 are the same file. Worth saying outright:
  // "are these two downloads identical" is the other half of why people hash a
  // file at all, and it needs no published checksum to answer.
  const dupes = useMemo(() => {
    if (results.length < 2 || !selected.includes("SHA256")) return [];
    const seen = new Map();
    for (const r of results) {
      const k = bytesToHex(r.digests.SHA256);
      if (!seen.has(k)) seen.set(k, []);
      seen.get(k).push(r.name);
    }
    return [...seen.values()].filter((g) => g.length > 1);
  }, [results, selected]);

  const pct = progress && progress.bytes ? Math.round((progress.done / progress.bytes) * 100) : 0;
  const totalBytes = files.reduce((a, f) => a + f.size, 0);

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
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
      >
        <div className="dropzone-empty">
          <strong>Drop files here, or click to choose</strong>
          <span className="muted small">
            Any file, any size — an ISO, a .zip, an installer. Read in your browser a few megabytes at
            a time and never uploaded.
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {files.length > 0 && (
        <>
          <ul className="file-list">
            {files.map((f, i) => (
              <li className="file-item" key={f.name + i + f.size}>
                <span className="file-name">{f.name}</span>
                <span className="file-meta">{fmtBytes(f.size)}</span>
                <span className="file-ctrl">
                  <button
                    className="btn-sm"
                    disabled={busy}
                    onClick={() => { setResults([]); setFiles((p) => p.filter((_, j) => j !== i)); }}
                    aria-label={"Remove " + f.name}
                  >
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
          {files.length > 1 && (
            <p className="muted small">
              {files.length} files, {fmtBytes(totalBytes)} in total.
            </p>
          )}
        </>
      )}

      <Field label="Checksums to compute">
        <div>
          {ALGOS.map((a) => (
            <label className="check-row" key={a.id} style={{ display: "inline-flex", marginRight: "1.1rem" }}>
              <input
                type="checkbox"
                checked={selected.includes(a.id)}
                disabled={busy}
                onChange={() => toggle(a.id)}
              />
              {a.label}
            </label>
          ))}
        </div>
      </Field>
      <p className="muted small">
        Every ticked checksum is computed in a single pass over the file, so adding one costs
        arithmetic but not a second read. On a multi-gigabyte file, unticking what you do not need is
        still the quickest way to finish sooner.
      </p>

      <div className="btn-row">
        <button className="btn" onClick={run} disabled={busy || !files.length || !selected.length}>
          {busy ? "Hashing…" : files.length > 1 ? `Checksum ${files.length} files` : "Checksum file"}
        </button>
        {busy && (
          <button className="btn btn-ghost" onClick={() => { cancelRef.current = true; }}>
            Cancel
          </button>
        )}
        {!busy && files.length > 0 && (
          <button className="btn btn-ghost" onClick={() => { setFiles([]); setResults([]); }}>
            Clear
          </button>
        )}
      </div>

      {progress && (
        <div className="ocr-progress">
          <div className="ocr-bar"><div className="ocr-bar-fill" style={{ width: `${pct}%` }} /></div>
          <span className="muted small">
            {progress.total > 1 ? `File ${progress.index + 1} of ${progress.total} — ` : ""}
            {fmtBytes(progress.done)} of {fmtBytes(progress.bytes)} ({pct}%)
          </span>
        </div>
      )}

      {results.map((r) => {
        const entry = entryForFile(parsed.entries, r.name);
        const verdict = verdictFor(r.digests, entry);
        return (
          <div key={r.name + r.size} style={{ marginTop: "1.5rem" }}>
            <p className="field-label">
              {r.name} <span className="muted">— {fmtBytes(r.size)}</span>
            </p>
            <div className="result-list">
              {ALGOS.filter((a) => r.digests[a.id]).map((a) => {
                const hex = bytesToHex(r.digests[a.id]);
                const tag = r.name + a.id;
                const hit = verdict && verdict.algo && verdict.algo.id === a.id;
                return (
                  <div className={"result-row" + (hit && verdict.state === "match" ? " result-row-hl" : "")} key={a.id}>
                    <span className="result-label">{a.label}</span>
                    <code className="result-val">{hex}</code>
                    <button className="btn-sm" onClick={() => copy(hex, tag)}>
                      {copied === tag ? "Copied" : "Copy"}
                    </button>
                  </div>
                );
              })}
            </div>
            {verdict && (
              <p className={verdict.state === "mismatch" ? "error" : "muted small"}>
                {verdict.state === "match" ? "✓ " : verdict.state === "mismatch" ? "✗ " : ""}
                {verdict.text}
                {verdict.state === "match" && nameDiffers(entry, r.name) && (
                  <> The checksum was published for <code>{entry.name}</code>, so this is that file
                  under a different name.</>
                )}
                {verdict.state === "mismatch" && nameDiffers(entry, r.name) && (
                  <> Note the checksum you pasted is filed under <code>{entry.name}</code>, not{" "}
                  <code>{r.name}</code> — check you are comparing the right two things before
                  assuming the download is bad.</>
                )}
              </p>
            )}
            {!verdict && parsed.entries.length > 1 && (
              <p className="muted small">
                Nothing in the pasted list is filed under <code>{r.name}</code>, so there is no
                verdict for it — rename the file to match, or paste just its line.
              </p>
            )}
          </div>
        );
      })}

      {dupes.length > 0 && (
        <div className="result-list" style={{ marginTop: "1.25rem" }}>
          {dupes.map((g, i) => (
            <div className="result-row result-row-hl" key={i}>
              <span className="result-label">Identical</span>
              <span className="result-val">{g.join(", ")} — same SHA-256, so byte-for-byte the same file.</span>
            </div>
          ))}
        </div>
      )}

      <Field label="Compare with a published checksum">
        <textarea
          className="inp mono"
          rows={3}
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder={"e3b0c442…  ubuntu-24.04.iso\nor SHA256 (file) = e3b0c442…\nor paste the whole SHA256SUMS file"}
          spellCheck={false}
        />
      </Field>
      {parsed.entries.length > 0 && (
        <p className="muted small">
          {parsed.entries.length === 1
            ? (() => {
                const a = algoForLength(parsed.entries[0].bytes.length);
                return a
                  ? `Read as a ${a.label} digest — its length says so, no label needed.`
                  : `Read as ${parsed.entries[0].bytes.length} bytes, which is not a length any of these algorithms produces.`;
              })()
            : `Read ${parsed.entries.length} checksums; each file above is matched to the line filed under its name.`}
          {parsed.errors.length > 0 && ` ${parsed.errors.length} line${parsed.errors.length === 1 ? "" : "s"} could not be read as a checksum and ${parsed.errors.length === 1 ? "was" : "were"} skipped.`}
        </p>
      )}
      {expected.trim() && !parsed.entries.length && (
        <p className="error">
          That is not a checksum in any form recognised here — a bare hex or Base64 digest, a{" "}
          <code>&lt;hex&gt;  filename</code> line, or a <code>SHA256 (file) = &lt;hex&gt;</code> line.
        </p>
      )}

      <p className="muted small" style={{ marginTop: "1.5rem" }}>
        <strong>A checksum only proves the file you have is the file that was hashed.</strong> It
        catches a truncated download, a corrupted disk and a mirror serving stale bytes, which is
        most of what goes wrong. It does not prove who published it: an attacker who can replace the
        download can usually replace the checksum on the same page. For that you need a signature —
        a GPG-signed <code>SHA256SUMS.gpg</code>, or the vendor&apos;s own code signature — verified
        against a key you already trust.
      </p>
      <p className="muted small">
        <strong>CRC-32 is not a hash.</strong> It is a 4-byte error-detecting code, the one zip,
        gzip and PNG store, and it answers &quot;did this transfer cleanly&quot;. It is trivial to
        produce a different file with the same CRC-32, so never use it to decide a file is genuine.
        MD5 and SHA-1 are broken for collisions too — fine for spotting corruption, and still what a
        lot of older software publishes, but SHA-256 is the one to trust when you have the choice.
      </p>
      <p className="muted small">
        Hashing a large file in a browser is slower than <code>sha256sum</code> on the command line —
        the work is real arithmetic over every byte, in JavaScript. Nothing is uploaded, and the file
        is read a few megabytes at a time rather than loaded whole, so a 4 GB ISO costs you patience
        rather than memory. To hash text rather than a file, use the{" "}
        <a href="/dev/hash-generator">hash generator</a>; to sign a message with a secret key, the{" "}
        <a href="/dev/hmac-generator">HMAC generator</a>.
      </p>
    </div>
  );
}
