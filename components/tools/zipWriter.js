"use client";

// ZIP writer with real Deflate, for the Zip Files tool.
//
// zip.js only stores, which is right for the image tools that call it: their
// output is already compressed. Arbitrary files are not, so this one runs each
// through the browser's native CompressionStream("deflate-raw") — the same
// Deflate every zip tool writes, with no compressor shipped in the bundle.
//
// Nothing is ever held as one big buffer. Each file streams from disk through
// a CRC-32 and the compressor, the compressed chunks are kept as Blob parts,
// and the archive is a Blob stitched from headers and those parts. A file that
// Deflate does not shrink is written Stored instead, using the original File
// itself as the data part, so it is never copied at all.
//
// No DOM calls: Blob, CompressionStream and TextEncoder all exist in node, so
// this file is tested there against Python's zipfile and Info-ZIP's unzip.

import { crc32Update, dosDateTime, ZipTooLargeError } from "./zip";

export { ZipTooLargeError };

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
const MAX_U32 = 0xffffffff;
const MAX_U16 = 0xffff;

// Formats that carry their own compression. Deflating them again costs time
// and saves well under 1%, so with "Compress" chosen they are stored anyway —
// what 7-Zip and Info-ZIP's -n list do. Office/ODF files are zips themselves.
export const PRECOMPRESSED_EXT = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "avif", "heic", "heif", "jxl",
  "mp3", "aac", "m4a", "ogg", "opus", "flac", "wma",
  "mp4", "m4v", "mov", "mkv", "webm", "avi", "wmv",
  "zip", "gz", "tgz", "bz2", "xz", "7z", "rar", "zst", "lz", "lzma", "br",
  "docx", "xlsx", "pptx", "odt", "ods", "odp", "epub", "jar", "apk", "cbz", "woff", "woff2",
]);

const extOf = (name) => {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
};

export const isPrecompressed = (path) => PRECOMPRESSED_EXT.has(extOf(path));

// Operating-system clutter that a dropped folder brings along.
export function isJunkFile(path) {
  const base = path.slice(path.lastIndexOf("/") + 1);
  return base === ".DS_Store" || base === "Thumbs.db" || base === "desktop.ini" || base.startsWith("._") ||
    path.split("/").includes("__MACOSX");
}

const CONTROL = new RegExp("[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");

// A name as it should sit inside the archive: forward slashes, relative, no
// "." or ".." segments, no drive letter, no control characters. A zip that
// holds "../x" is a zip-slip archive however innocently it was made.
export function zipPath(path) {
  const parts = String(path)
    .replace(/\\/g, "/")
    .replace(/^[a-zA-Z]:/, "")
    .split("/")
    .map((s) => s.replace(CONTROL, ""))
    .filter((s) => s && s !== "." && s !== "..");
  return parts.length ? parts.join("/") : null;
}

// Two files with the same path would both be written, and most extractors
// would then silently keep only the last. Compared case-insensitively because
// Windows and macOS file systems are, so "Report.pdf" and "report.pdf" would
// collide on extraction there. The later one becomes "report (2).pdf".
export function uniquePaths(paths) {
  const taken = new Set();
  return paths.map((p) => {
    let candidate = p;
    if (taken.has(candidate.toLowerCase())) {
      const slash = p.lastIndexOf("/");
      const dot = p.lastIndexOf(".");
      const cut = dot > slash + 1 ? dot : p.length;
      for (let n = 2; taken.has(candidate.toLowerCase()); n++) {
        candidate = p.slice(0, cut) + ` (${n})` + p.slice(cut);
      }
    }
    taken.add(candidate.toLowerCase());
    return candidate;
  });
}

const STEP = 1 << 20;

// Reads the blob in 1 MB slices rather than through blob.stream(), whose chunk
// size is up to the browser (64 KB in Chrome) — larger writes keep the
// compressor's per-call overhead negligible, and `onBytes` gets a steady pulse.
// Returns { crc, size, method, compressedSize, data } for buildZipBlob.
export async function packEntry(blob, { compress = true, onBytes, signal } = {}) {
  const size = blob.size;
  let crc = 0xffffffff;
  if (!compress || size === 0) {
    for (let at = 0; at < size; at += STEP) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const bytes = new Uint8Array(await blob.slice(at, at + STEP).arrayBuffer());
      crc = crc32Update(crc, bytes);
      onBytes?.(bytes.length);
    }
    return { crc: (crc ^ MAX_U32) >>> 0, size, method: 0, compressedSize: size, data: blob };
  }

  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  const chunks = [];
  const drained = (async () => {
    const reader = cs.readable.getReader();
    let n = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return n;
      chunks.push(value);
      n += value.length;
    }
  })();
  try {
    for (let at = 0; at < size; at += STEP) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const bytes = new Uint8Array(await blob.slice(at, at + STEP).arrayBuffer());
      crc = crc32Update(crc, bytes);
      await writer.write(bytes);
      onBytes?.(bytes.length);
    }
    await writer.close();
  } catch (err) {
    writer.abort(err).catch(() => {});
    drained.catch(() => {});
    throw err;
  }
  const compressedSize = await drained;
  crc = (crc ^ MAX_U32) >>> 0;
  // Deflate can make a file slightly larger (random or already-compressed
  // data). Stored is then strictly better, and costs nothing: the original
  // File is the data, and the compressed chunks are dropped.
  if (compressedSize >= size) return { crc, size, method: 0, compressedSize: size, data: blob };
  return { crc, size, method: 8, compressedSize, data: new Blob(chunks) };
}

// entries: [{ path, dir?, mtime: Date, crc, size, method, compressedSize, data }]
// (directory entries need only path, dir: true and mtime). Returns a Blob.
export function buildZipBlob(entries) {
  if (entries.length > MAX_U16) {
    throw new ZipTooLargeError("More than 65,535 files is past what a standard zip can index — split them into several zips.");
  }
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;

  for (const e of entries) {
    const name = enc.encode(e.dir ? e.path.replace(/\/?$/, "/") : e.path);
    if (name.length > MAX_U16) throw new ZipTooLargeError(`The path ${e.path.slice(0, 60)}… is too long for a zip.`);
    const crc = e.dir ? 0 : e.crc;
    const size = e.dir ? 0 : e.size;
    const csize = e.dir ? 0 : e.compressedSize;
    const method = e.dir ? 0 : e.method;
    const when = e.mtime instanceof Date && !isNaN(e.mtime) ? e.mtime : new Date();
    // DOS dates start at 1980; an older file gets the earliest one, not a
    // 1980 date that keeps its own month and day.
    const dos = dosDateTime(when.getFullYear() < 1980 ? new Date(1980, 0, 1) : when);
    // Info-ZIP extended timestamp (0x5455): the mtime in UTC seconds. DOS time
    // is local, two-second and has no zone, so a zip made in Delhi and opened
    // in London would otherwise shift every file by 4.5 hours.
    const unix = Math.min(MAX_U32, Math.max(0, Math.floor(when.getTime() / 1000)));

    const local = new Uint8Array(30 + name.length + 9);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, LOCAL_SIG, true);
    lv.setUint16(4, 20, true);          // version needed: 2.0 (Deflate)
    lv.setUint16(6, 0x0800, true);      // bit 11: name is UTF-8
    lv.setUint16(8, method, true);
    lv.setUint16(10, dos.time, true);
    lv.setUint16(12, dos.date, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, csize, true);
    lv.setUint32(22, size, true);
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 9, true);
    local.set(name, 30);
    writeUt(lv, 30 + name.length, unix);

    const cd = new Uint8Array(46 + name.length + 9);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, CENTRAL_SIG, true);
    cv.setUint16(4, 0x031e, true);      // made by: Unix, spec 3.0 — so the mode below is honoured
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, method, true);
    cv.setUint16(12, dos.time, true);
    cv.setUint16(14, dos.date, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, csize, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, name.length, true);
    cv.setUint16(30, 9, true);
    // comment length, disk start, internal attributes: 0
    // External attributes: Unix mode in the high word (rw-r--r-- files,
    // rwxr-xr-x folders), plus the MS-DOS directory bit for Windows.
    cv.setUint32(38, e.dir ? ((0o040755 << 16) | 0x10) >>> 0 : (0o100644 << 16) >>> 0, true);
    cv.setUint32(42, offset, true);
    cd.set(name, 46);
    writeUt(cv, 46 + name.length, unix);

    parts.push(local);
    if (!e.dir && csize > 0) parts.push(e.data);
    central.push(cd);
    offset += local.length + csize;
    if (offset > MAX_U32) {
      throw new ZipTooLargeError("The zip would pass 4 GB, which needs the Zip64 extensions this tool does not write — split the files into several zips.");
    }
  }

  const cdSize = central.reduce((a, c) => a + c.length, 0);
  if (offset + cdSize + 22 > MAX_U32) {
    throw new ZipTooLargeError("The zip would pass 4 GB, which needs the Zip64 extensions this tool does not write — split the files into several zips.");
  }
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, EOCD_SIG, true);
  ev.setUint16(8, entries.length, true);
  ev.setUint16(10, entries.length, true);
  ev.setUint32(12, cdSize, true);
  ev.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end], { type: "application/zip" });
}

function writeUt(view, at, unix) {
  view.setUint16(at, 0x5455, true);
  view.setUint16(at + 2, 5, true);
  view.setUint8(at + 4, 1);             // flags: mtime present
  view.setUint32(at + 5, unix, true);
}
