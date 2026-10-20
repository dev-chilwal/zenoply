"use client";

// ZIP reader — the other half of zip.js, which only writes.
//
// The archive is never loaded whole. A zip is designed to be read from the
// back: the end-of-central-directory record sits in the last 22 bytes (plus up
// to 64 KB of comment), points at the central directory, and the central
// directory lists every entry with its sizes, CRC and where its data starts. So
// listing a 3 GB archive costs two small Blob.slice reads, and each file is
// streamed out of its own slice only when asked for — through the browser's
// native DecompressionStream("deflate-raw"), with the CRC-32 checked on the way
// past. No library: deflate is the only method that matters in practice, and
// the browser already ships it.
//
// Nothing here touches the DOM, so the whole thing runs in node (which has
// Blob, DecompressionStream and Response) against archives made by Info-ZIP
// and Python's zipfile.

import { crc32Update } from "./zip.js";

export class ZipReadError extends Error {
  constructor(message, code = "corrupt") {
    super(message);
    this.name = "ZipReadError";
    this.code = code;
  }
}

const EOCD_SIG = 0x06054b50;
const Z64_LOCATOR_SIG = 0x07064b50;
const Z64_EOCD_SIG = 0x06064b50;
const CENTRAL_SIG = 0x02014b50;
const LOCAL_SIG = 0x04034b50;
const MAX_COMMENT = 0xffff;

async function readBytes(blob, start, length) {
  return new Uint8Array(await blob.slice(start, start + length).arrayBuffer());
}

const u16 = (b, o) => b[o] | (b[o + 1] << 8);
const u32 = (b, o) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
// Exact up to 2^53, which is 8 PB — further than any Blob goes.
const u64 = (b, o) => u32(b, o) + u32(b, o + 4) * 0x100000000;

// Code page 437, bytes 0x80-0xFF, as code points. The zip spec's default for a
// name without the UTF-8 flag, and what DOS-era and many Windows tools wrote.
// Written as numbers so the source holds no non-ASCII characters to mangle.
const CP437_HIGH = [
  0xc7, 0xfc, 0xe9, 0xe2, 0xe4, 0xe0, 0xe5, 0xe7, 0xea, 0xeb, 0xe8, 0xef, 0xee, 0xec, 0xc4, 0xc5,
  0xc9, 0xe6, 0xc6, 0xf4, 0xf6, 0xf2, 0xfb, 0xf9, 0xff, 0xd6, 0xdc, 0xa2, 0xa3, 0xa5, 0x20a7, 0x192,
  0xe1, 0xed, 0xf3, 0xfa, 0xf1, 0xd1, 0xaa, 0xba, 0xbf, 0x2310, 0xac, 0xbd, 0xbc, 0xa1, 0xab, 0xbb,
  0x2591, 0x2592, 0x2593, 0x2502, 0x2524, 0x2561, 0x2562, 0x2556, 0x2555, 0x2563, 0x2551, 0x2557, 0x255d, 0x255c, 0x255b, 0x2510,
  0x2514, 0x2534, 0x252c, 0x251c, 0x2500, 0x253c, 0x255e, 0x255f, 0x255a, 0x2554, 0x2569, 0x2566, 0x2560, 0x2550, 0x256c, 0x2567,
  0x2568, 0x2564, 0x2565, 0x2559, 0x2558, 0x2552, 0x2553, 0x256b, 0x256a, 0x2518, 0x250c, 0x2588, 0x2584, 0x258c, 0x2590, 0x2580,
  0x3b1, 0xdf, 0x393, 0x3c0, 0x3a3, 0x3c3, 0xb5, 0x3c4, 0x3a6, 0x398, 0x3a9, 0x3b4, 0x221e, 0x3c6, 0x3b5, 0x2229,
  0x2261, 0xb1, 0x2265, 0x2264, 0x2320, 0x2321, 0xf7, 0x2248, 0xb0, 0x2219, 0xb7, 0x221a, 0x207f, 0xb2, 0x25a0, 0xa0,
];

export function decodeCp437(bytes) {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b < 0x80 ? b : CP437_HIGH[b - 0x80]);
  return s;
}

const utf8 = new TextDecoder("utf-8");
const utf8Strict = /* @__PURE__ */ (() => {
  try { return new TextDecoder("utf-8", { fatal: true }); } catch { return null; }
})();

// A name without the UTF-8 flag is CP437 by the letter of the spec, but macOS's
// Archive Utility and plenty of Linux tools write UTF-8 and never set the flag.
// Multi-byte UTF-8 has a rigid shape that CP437 text almost never happens to
// match, so a name that decodes cleanly as UTF-8 is taken as UTF-8 and anything
// else falls back to CP437. Names in other Windows code pages (Cyrillic CP866,
// Japanese Shift-JIS) cannot be told apart from the bytes alone.
export function decodeName(bytes, utf8Flag) {
  if (utf8Flag) return utf8.decode(bytes);
  if (bytes.every((b) => b < 0x80)) return String.fromCharCode(...bytes);
  if (utf8Strict) {
    try { return utf8Strict.decode(bytes); } catch {}
  }
  return decodeCp437(bytes);
}

function crc32(bytes) {
  return (crc32Update(0xffffffff, bytes) ^ 0xffffffff) >>> 0;
}

// Extra fields: [id u16][size u16][data] repeated.
function extraFields(b, start, length) {
  const out = new Map();
  let p = start;
  const end = start + length;
  while (p + 4 <= end) {
    const id = u16(b, p);
    const size = u16(b, p + 2);
    if (p + 4 + size > end) break;
    if (!out.has(id)) out.set(id, b.subarray(p + 4, p + 4 + size));
    p += 4 + size;
  }
  return out;
}

function dosDate(time, date) {
  if (!date) return null;
  const d = new Date(
    1980 + (date >> 9),
    ((date >> 5) & 0xf) - 1,
    date & 0x1f,
    time >> 11,
    (time >> 5) & 0x3f,
    (time & 0x1f) * 2
  );
  return isNaN(d.getTime()) ? null : d;
}

export const METHOD_NAMES = {
  0: "Stored",
  1: "Shrink",
  6: "Implode",
  8: "Deflate",
  9: "Deflate64",
  12: "BZIP2",
  14: "LZMA",
  93: "Zstandard",
  95: "XZ",
  98: "PPMd",
  99: "AES-encrypted",
};

export const isSupportedMethod = (m) => m === 0 || m === 8;

// __MACOSX/ holds AppleDouble copies of Finder metadata; .DS_Store is a
// Finder window's view settings. Archive Utility adds both to every zip made
// by right-click > Compress, and nobody on another OS wants them.
export function isMacJunk(path) {
  if (path.startsWith("__MACOSX/") || path === "__MACOSX/") return true;
  const base = path.replace(/\/$/, "").split("/").pop();
  return base === ".DS_Store";
}

// What the magic bytes say a non-zip is, so the error can name it.
function sniffOther(head) {
  const ascii = String.fromCharCode(...head.subarray(0, 8));
  if (ascii.startsWith("Rar!")) return "a RAR archive";
  if (head[0] === 0x37 && head[1] === 0x7a && head[2] === 0xbc && head[3] === 0xaf) return "a 7-Zip archive";
  if (head[0] === 0x1f && head[1] === 0x8b) return "a gzip file (.gz / .tar.gz)";
  if (ascii.startsWith("%PDF")) return "a PDF";
  if (head.length > 262 && String.fromCharCode(...head.subarray(257, 262)) === "ustar") return "a tar archive";
  return null;
}

// Lists the archive. Returns { entries, comment, prepended } where each entry
// is { path, name, dir, size, compSize, crc, method, encrypted, offset,
// modified, junk }. Throws ZipReadError with a message fit to show as-is.
export async function readZip(blob) {
  const size = blob.size;
  const head = await readBytes(blob, 0, Math.min(size, 512));
  if (size < 22) {
    throw new ZipReadError("This file is too small to be a zip archive.", "not-zip");
  }

  const tailLen = Math.min(size, 22 + MAX_COMMENT);
  const tailStart = size - tailLen;
  const tail = await readBytes(blob, tailStart, tailLen);

  // Scan back for the end record. Prefer one whose comment runs exactly to the
  // end of the file; accept one followed by junk only if there is no better.
  let eocd = -1;
  let loose = -1;
  for (let i = tail.length - 22; i >= 0; i--) {
    if (u32(tail, i) !== EOCD_SIG) continue;
    const end = i + 22 + u16(tail, i + 20);
    if (end === tail.length) { eocd = i; break; }
    if (end < tail.length && loose < 0) loose = i;
  }
  if (eocd < 0) eocd = loose;
  if (eocd < 0) {
    const other = sniffOther(head);
    if (other) throw new ZipReadError(`This is ${other}, not a zip — this tool only opens .zip files.`, "not-zip");
    if (u32(head, 0) === LOCAL_SIG) {
      throw new ZipReadError(
        "This starts like a zip but its end is missing — the file was almost certainly cut off mid-download. Download it again.",
        "truncated"
      );
    }
    throw new ZipReadError("This is not a zip archive — there is no zip directory anywhere in it.", "not-zip");
  }

  const eocdAbs = tailStart + eocd;
  let diskNo = u16(tail, eocd + 4);
  let cdDisk = u16(tail, eocd + 6);
  let count = u16(tail, eocd + 10);
  let cdSize = u32(tail, eocd + 12);
  let cdOffset = u32(tail, eocd + 16);
  const commentLen = u16(tail, eocd + 20);
  const comment = decodeName(tail.subarray(eocd + 22, eocd + 22 + commentLen), false);

  // Zip64: a locator sits immediately before the end record and points at a
  // wider version of it, needed past 65,535 entries or 4 GB.
  let cdEnd = eocdAbs;
  if (eocdAbs >= 20) {
    const loc = await readBytes(blob, eocdAbs - 20, 20);
    if (u32(loc, 0) === Z64_LOCATOR_SIG) {
      const recorded = u64(loc, 8);
      // Normally exactly 56 bytes before the locator; the recorded offset is
      // wrong by the length of anything prepended to the archive.
      const expected = eocdAbs - 20 - 56;
      let z64 = null;
      let z64Abs = -1;
      for (const at of [recorded, expected]) {
        if (at < 0 || at + 56 > size) continue;
        const rec = await readBytes(blob, at, 56);
        if (u32(rec, 0) === Z64_EOCD_SIG) { z64 = rec; z64Abs = at; break; }
      }
      if (!z64) throw new ZipReadError("The zip64 directory record is missing or damaged.");
      diskNo = u32(z64, 16);
      cdDisk = u32(z64, 20);
      count = u64(z64, 32);
      cdSize = u64(z64, 40);
      cdOffset = u64(z64, 48);
      cdEnd = z64Abs;
    }
  }

  if (diskNo !== 0 || cdDisk !== 0) {
    throw new ZipReadError(
      "This is one part of a split (multi-volume) zip. Put every part — .z01, .z02 … and the .zip — in one folder and open the .zip with 7-Zip or your system's archive tool.",
      "split"
    );
  }

  // Anything before the archive proper (a self-extractor's .exe stub) shifts
  // every real position by its length. Some writers correct the offsets and
  // some do not, so try both and keep the one that lands on a directory entry.
  const shift = cdEnd - (cdOffset + cdSize);
  if (shift < 0) {
    throw new ZipReadError("The zip directory points past the end of the file — the archive is truncated or damaged.", "truncated");
  }
  let base = 0;
  if (count > 0) {
    let found = false;
    for (const s of shift ? [shift, 0] : [0]) {
      if (cdOffset + s + 4 > size) continue;
      const sig = await readBytes(blob, cdOffset + s, 4);
      if (u32(sig, 0) === CENTRAL_SIG) { base = s; found = true; break; }
    }
    if (!found) throw new ZipReadError("The zip directory is not where the archive says it is — the file is damaged.");
  }

  const cd = await readBytes(blob, cdOffset + base, cdSize);
  const entries = [];
  let p = 0;
  for (let i = 0; i < count; i++) {
    if (p + 46 > cd.length || u32(cd, p) !== CENTRAL_SIG) {
      throw new ZipReadError(`The zip directory is damaged after ${i} of ${count} entries.`);
    }
    const madeBy = cd[p + 5];
    const flags = u16(cd, p + 8);
    const method = u16(cd, p + 10);
    const time = u16(cd, p + 12);
    const date = u16(cd, p + 14);
    const crc = u32(cd, p + 16);
    let compSize = u32(cd, p + 20);
    let usize = u32(cd, p + 24);
    const nameLen = u16(cd, p + 28);
    const extraLen = u16(cd, p + 30);
    const commentLen = u16(cd, p + 32);
    const extAttr = u32(cd, p + 38);
    let offset = u32(cd, p + 42);
    const nameBytes = cd.subarray(p + 46, p + 46 + nameLen);
    const extra = extraFields(cd, p + 46 + nameLen, extraLen);

    // Zip64 extended info carries only the fields that overflowed, in order.
    const z = extra.get(0x0001);
    if (z) {
      let q = 0;
      if (usize === 0xffffffff && q + 8 <= z.length) { usize = u64(z, q); q += 8; }
      if (compSize === 0xffffffff && q + 8 <= z.length) { compSize = u64(z, q); q += 8; }
      if (offset === 0xffffffff && q + 8 <= z.length) { offset = u64(z, q); q += 8; }
    }

    let name = decodeName(nameBytes, (flags & 0x0800) !== 0);
    // Info-ZIP Unicode Path: a UTF-8 copy of the name, trusted only while its
    // CRC still matches the header name it was written alongside.
    const up = extra.get(0x7075);
    if (up && up.length > 5 && up[0] === 1 && u32(up, 1) === crc32(nameBytes)) {
      name = utf8.decode(up.subarray(5));
    }

    // Info-ZIP extended timestamp: the central copy holds just the mtime, in
    // Unix seconds — real time zone and one-second precision, unlike DOS time.
    let modified = dosDate(time, date);
    const ut = extra.get(0x5455);
    if (ut && ut.length >= 5 && ut[0] & 1) modified = new Date(u32(ut, 1) * 1000);

    const path = name.replace(/\\/g, "/");
    const dir = path.endsWith("/") || (madeBy === 0 && (extAttr & 0x10) !== 0 && usize === 0);
    entries.push({
      path,
      name: path.replace(/\/$/, "").split("/").pop() || path,
      dir,
      size: usize,
      compSize,
      crc,
      method,
      encrypted: (flags & 1) !== 0 || method === 99,
      offset: offset + base,
      modified,
      junk: isMacJunk(path),
    });
    p += 46 + nameLen + extraLen + commentLen;
  }

  return { entries, comment, prepended: base };
}

// Why an entry cannot be extracted, or null if it can.
export function unsupportedReason(entry) {
  if (entry.dir) return "folder";
  if (entry.encrypted) return "Password-protected — not supported here";
  if (!isSupportedMethod(entry.method)) {
    return `${METHOD_NAMES[entry.method] || `Method ${entry.method}`} compression — not supported in a browser`;
  }
  return null;
}

// A stream of the entry's original bytes. Errors (rather than ending cleanly)
// if the data comes out longer or shorter than the directory promised, or its
// CRC-32 disagrees — so a corrupted or tampered entry can never be saved as if
// it were fine, and a zip bomb cannot inflate past its own declared size.
export async function entryStream(blob, entry) {
  const why = unsupportedReason(entry);
  if (why) throw new ZipReadError(`${entry.name}: ${why}.`, "unsupported");

  const local = await readBytes(blob, entry.offset, 30);
  if (local.length < 30 || u32(local, 0) !== LOCAL_SIG) {
    throw new ZipReadError(`${entry.name}: its data is not where the zip directory says — the archive is damaged.`);
  }
  const start = entry.offset + 30 + u16(local, 26) + u16(local, 28);
  if (start + entry.compSize > blob.size) {
    throw new ZipReadError(`${entry.name}: its data runs past the end of the file — the archive is truncated.`, "truncated");
  }

  let stream = blob.slice(start, start + entry.compSize).stream();
  if (entry.method === 8) stream = stream.pipeThrough(new DecompressionStream("deflate-raw"));

  let crc = 0xffffffff;
  let seen = 0;
  return stream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        seen += chunk.length;
        if (seen > entry.size) {
          controller.error(new ZipReadError(`${entry.name}: expands past its declared size — refusing to continue.`));
          return;
        }
        crc = crc32Update(crc, chunk);
        controller.enqueue(chunk);
      },
      flush(controller) {
        if (seen !== entry.size) {
          controller.error(new ZipReadError(`${entry.name}: came out ${seen} bytes instead of ${entry.size} — the archive is damaged.`));
          return;
        }
        if (((crc ^ 0xffffffff) >>> 0) !== entry.crc) {
          controller.error(new ZipReadError(`${entry.name}: CRC-32 check failed — the data is corrupted.`));
        }
      },
    })
  );
}

// Read with a plain reader rather than new Response(stream): Chrome reports
// any error inside a Response body as a bare "Failed to fetch", which would
// swallow the CRC message — a reader rejects with the stream's own error.
export async function extractBlob(blob, entry, type = "") {
  const reader = (await entryStream(blob, entry)).getReader();
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return new Blob(chunks, { type });
}

// Turns an archive path into folder/file names safe to create on disk, or null
// if nothing is left. ".." and "." segments are dropped rather than followed —
// a crafted zip can otherwise write outside the folder it is extracted into
// ("zip slip") — as is a leading drive letter or slash. Characters Windows
// refuses are replaced, and its reserved device names (CON, NUL, COM1…) get a
// leading underscore.
const RESERVED = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?$/i;
const BAD_CHARS = new RegExp(
  "[<>:\"|?*" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + "]",
  "g"
);
export function safePathSegments(path) {
  const parts = path
    .replace(/\\/g, "/")
    .replace(/^[a-zA-Z]:/, "")
    .split("/")
    .filter((s) => s && s !== "." && s !== "..")
    .map((s) => {
      let t = s.replace(BAD_CHARS, "_").replace(/[. ]+$/, "");
      if (!t) t = "_";
      if (RESERVED.test(t)) t = "_" + t;
      return t;
    });
  return parts.length ? parts : null;
}

const MIME = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
  avif: "image/avif", bmp: "image/bmp", ico: "image/x-icon", svg: "image/svg+xml",
  pdf: "application/pdf", txt: "text/plain", md: "text/markdown", csv: "text/csv",
  json: "application/json", xml: "application/xml", html: "text/html", htm: "text/html",
  mp3: "audio/mpeg", mp4: "video/mp4", wav: "audio/wav", zip: "application/zip",
};

export const extOf = (name) => {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
};

export const mimeFor = (name) => MIME[extOf(name)] || "application/octet-stream";

const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "ico", "svg"]);
const TEXT_EXT = new Set([
  "txt", "md", "csv", "tsv", "json", "xml", "html", "htm", "css", "js", "mjs", "ts", "jsx", "tsx",
  "py", "rb", "java", "c", "h", "cpp", "cs", "go", "rs", "php", "sh", "bat", "ps1", "yml", "yaml",
  "toml", "ini", "cfg", "conf", "log", "sql", "srt", "vtt", "tex", "gitignore", "env",
]);

// "image" | "text" | null. Text means it is shown as text — never rendered as
// HTML, so an .html entry cannot run script on this page.
export function previewKind(name) {
  const ext = extOf(name);
  if (IMAGE_EXT.has(ext)) return "image";
  if (TEXT_EXT.has(ext) || /^(readme|license|licence|changelog|makefile|dockerfile)$/i.test(name)) return "text";
  return null;
}
