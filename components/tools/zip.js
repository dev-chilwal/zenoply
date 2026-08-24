"use client";

// Minimal ZIP writer — stored (uncompressed) entries only.
//
// Everything this packs is already a compressed image: PNG carries its own
// deflate stream and JPEG its own entropy coding, so deflating them a second
// time buys a fraction of a percent in exchange for a compressor's worth of
// code. Storing them instead keeps this file small enough to read in one
// sitting and free of DOM calls, which is what lets it be tested in node. The
// result is an ordinary .zip that Finder, Explorer and `unzip` open without
// knowing the difference.

const CRC_TABLE = /* @__PURE__ */ (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// ZIP keeps timestamps in the MS-DOS format: two 16-bit words, seconds at two-
// second resolution and years counted from 1980. Dates before 1980 cannot be
// represented at all, so they are clamped rather than written as a negative
// year, which some tools then read as a date in 2107.
export function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  const time =
    (Math.min(23, date.getHours()) << 11) |
    (Math.min(59, date.getMinutes()) << 5) |
    (Math.min(59, date.getSeconds()) >> 1);
  const day = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time: time & 0xffff, date: day & 0xffff };
}

// C0 controls and DEL. Built from char codes rather than written as a literal
// class so the source file itself stays free of control bytes.
const NON_PRINTABLE = new RegExp(
  "[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]",
  "g"
);

// Names inside a zip are the one place an archive can write outside the folder
// it was extracted into, so directory traversal is stripped here rather than
// left to the archive tool to notice.
export function safeZipName(name, fallback = "file") {
  const flat = String(name)
    .replace(/[\\/]+/g, "-")
    .replace(NON_PRINTABLE, "")
    .replace(/^[.\s]+/, "")
    .trim();
  return flat || fallback;
}

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const EOCD_SIG = 0x06054b50;
const MAX_U32 = 0xffffffff;
const MAX_U16 = 0xffff;

export class ZipTooLargeError extends Error {
  constructor(message) {
    super(message);
    this.name = "ZipTooLargeError";
  }
}

// entries: [{ name, data: Uint8Array }] — returns the complete archive.
export function buildZip(entries, { date = new Date() } = {}) {
  if (entries.length > MAX_U16) {
    throw new ZipTooLargeError("Too many files for one zip — download them individually instead.");
  }
  const stamp = dosDateTime(date);
  const encoder = new TextEncoder();
  const prepared = entries.map((entry, i) => {
    const nameBytes = encoder.encode(safeZipName(entry.name, `file-${i + 1}`));
    if (nameBytes.length > MAX_U16) throw new ZipTooLargeError("A file name in this zip is too long.");
    return { nameBytes, data: entry.data, crc: crc32(entry.data), offset: 0 };
  });

  const total =
    prepared.reduce((sum, e) => sum + 30 + e.nameBytes.length + e.data.length + 46 + e.nameBytes.length, 0) + 22;
  // Past 4 GB the header fields stop being wide enough and the archive needs the
  // Zip64 extensions. Refusing outright beats writing a file that only some
  // tools can open.
  if (total > MAX_U32) {
    throw new ZipTooLargeError("These files add up to more than 4 GB — download them individually instead.");
  }

  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  let pos = 0;
  const u16 = (v) => { view.setUint16(pos, v, true); pos += 2; };
  const u32 = (v) => { view.setUint32(pos, v >>> 0, true); pos += 4; };
  const raw = (bytes) => { out.set(bytes, pos); pos += bytes.length; };

  for (const entry of prepared) {
    entry.offset = pos;
    u32(LOCAL_SIG);
    u16(20);            // version needed to extract: 2.0
    u16(0x0800);        // flags: bit 11 says the name is UTF-8
    u16(0);             // method 0 = stored
    u16(stamp.time);
    u16(stamp.date);
    u32(entry.crc);
    u32(entry.data.length);
    u32(entry.data.length);
    u16(entry.nameBytes.length);
    u16(0);             // extra field length
    raw(entry.nameBytes);
    raw(entry.data);
  }

  const centralStart = pos;
  for (const entry of prepared) {
    u32(CENTRAL_SIG);
    u16(20);            // version made by: 2.0, MS-DOS
    u16(20);            // version needed to extract
    u16(0x0800);
    u16(0);
    u16(stamp.time);
    u16(stamp.date);
    u32(entry.crc);
    u32(entry.data.length);
    u32(entry.data.length);
    u16(entry.nameBytes.length);
    u16(0);             // extra field length
    u16(0);             // comment length
    u16(0);             // disk number start
    u16(0);             // internal attributes
    u32(0);             // external attributes
    u32(entry.offset);
    raw(entry.nameBytes);
  }

  // Measured before the record is written: the writers below advance pos, so
  // reading it inline would report a central directory 12 bytes too long.
  const centralSize = pos - centralStart;
  u32(EOCD_SIG);
  u16(0);               // this disk
  u16(0);               // disk holding the central directory
  u16(prepared.length);
  u16(prepared.length);
  u32(centralSize);
  u32(centralStart);
  u16(0);               // comment length
  return out;
}
