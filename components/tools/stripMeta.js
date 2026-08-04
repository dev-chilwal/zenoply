// Removes metadata from an image without touching a single pixel.
//
// Every format below stores metadata in its own container blocks, separate from
// the compressed pixel data. So instead of decoding and re-encoding the picture
// (which is what a canvas round-trip does, and which re-compresses a JPEG), we
// walk the container, drop the blocks that hold metadata, and copy the rest
// through byte for byte. The result is bit-identical image data in a smaller
// file. Returns null when the bytes don't parse as the format, so the caller
// can fall back rather than hand back something corrupt.

// JPEG markers whose payload is metadata rather than image data.
// APP0 (JFIF), APP2 (ICC colour profile) and APP14 (Adobe colour transform) are
// deliberately kept: dropping them changes how the picture is rendered.
const JPEG_DROP = new Set([
  0xe1, // APP1  — Exif, XMP
  0xe3, // APP3  — Meta / Kodak
  0xe4,
  0xe5, // APP5  — Ricoh
  0xe6,
  0xe7,
  0xe8,
  0xe9,
  0xea,
  0xeb, // APP11 — JPEG XT / JUMBF (can carry provenance metadata)
  0xec, // APP12 — Ducky / picture info
  0xed, // APP13 — Photoshop image resource block, IPTC
  0xfe, // COM   — free-text comment
]);

// PNG ancillary chunks that carry metadata. iCCP (colour profile), gAMA, cHRM,
// sRGB, pHYs and the rest are kept for the same reason as APP2 above.
const PNG_DROP = new Set(["tEXt", "zTXt", "iTXt", "eXIf", "tIME", "dSIG"]);

const concat = (u8, ranges) => {
  const total = ranges.reduce((n, [a, b]) => n + (b - a), 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const [a, b] of ranges) {
    out.set(u8.subarray(a, b), at);
    at += b - a;
  }
  return out;
};

export function stripJpeg(u8) {
  if (u8.length < 4 || u8[0] !== 0xff || u8[1] !== 0xd8) return null;
  const keep = [];
  let keepFrom = 0;
  let i = 2;
  while (i + 1 < u8.length) {
    if (u8[i] !== 0xff) return null; // lost sync — refuse rather than guess
    // A run of 0xFF before a marker is legal padding; step over it.
    while (u8[i + 1] === 0xff) i++;
    const marker = u8[i + 1];
    if (marker === 0xd9) break; // EOI
    // Markers that carry no payload.
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    if (i + 3 >= u8.length) return null;
    const len = (u8[i + 2] << 8) | u8[i + 3];
    if (len < 2) return null;
    const end = i + 2 + len;
    if (end > u8.length) return null;
    // Start of scan: everything from here on is compressed pixel data (plus any
    // trailer the camera appended), copied through untouched.
    if (marker === 0xda) break;
    if (JPEG_DROP.has(marker)) {
      keep.push([keepFrom, i]);
      keepFrom = end;
    }
    i = end;
  }
  keep.push([keepFrom, u8.length]);
  return concat(u8, keep);
}

export function stripPng(u8) {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (u8.length < 12 || sig.some((b, n) => u8[n] !== b)) return null;
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const keep = [];
  let keepFrom = 0;
  let i = 8;
  while (i + 8 <= u8.length) {
    const len = view.getUint32(i);
    const type = String.fromCharCode(u8[i + 4], u8[i + 5], u8[i + 6], u8[i + 7]);
    const end = i + 12 + len; // length + type + data + CRC
    if (end > u8.length) return null;
    if (PNG_DROP.has(type)) {
      keep.push([keepFrom, i]);
      keepFrom = end;
    }
    i = end;
    if (type === "IEND") break;
  }
  keep.push([keepFrom, i < u8.length ? i : u8.length]);
  return concat(u8, keep);
}

export function stripWebp(u8) {
  const tag = (at) => String.fromCharCode(u8[at], u8[at + 1], u8[at + 2], u8[at + 3]);
  if (u8.length < 16 || tag(0) !== "RIFF" || tag(8) !== "WEBP") return null;
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const chunks = [];
  let i = 12;
  while (i + 8 <= u8.length) {
    const type = tag(i);
    const size = view.getUint32(i + 4, true);
    const end = i + 8 + size + (size & 1); // chunks are padded to even length
    if (end > u8.length) return null;
    if (type !== "EXIF" && type !== "XMP ") chunks.push([i, Math.min(end, u8.length), type]);
    i = end;
  }
  if (!chunks.length) return null;
  const body = concat(
    u8,
    chunks.map(([a, b]) => [a, b])
  );
  // The extended-format header advertises which optional chunks exist; leaving
  // the Exif and XMP bits set after removing them makes the file inconsistent.
  if (chunks[0][2] === "VP8X") body[8] &= ~0x0c;
  const out = new Uint8Array(12 + body.length);
  out.set(u8.subarray(0, 12));
  out.set(body, 12);
  new DataView(out.buffer).setUint32(4, out.length - 8, true); // RIFF size
  return out;
}

// WebP keeps Exif in its own RIFF chunk, and the chunk's payload is a bare TIFF
// block — the same thing a JPEG carries inside APP1. Handing that block to an
// Exif reader as if it were a .tif file is how WebP becomes readable, since the
// readers themselves generally don't speak RIFF. Returns null when there is none.
export function webpExifBlock(u8) {
  const tag = (at) => String.fromCharCode(u8[at], u8[at + 1], u8[at + 2], u8[at + 3]);
  if (u8.length < 16 || tag(0) !== "RIFF" || tag(8) !== "WEBP") return null;
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let i = 12;
  while (i + 8 <= u8.length) {
    const type = tag(i);
    const size = view.getUint32(i + 4, true);
    if (type === "EXIF") return u8.subarray(i + 8, Math.min(i + 8 + size, u8.length));
    i += 8 + size + (size & 1);
  }
  return null;
}

// Sniff the container from its magic bytes — the file's declared MIME type is
// whatever the operating system guessed from the extension.
export function sniffFormat(u8) {
  if (u8.length > 3 && u8[0] === 0xff && u8[1] === 0xd8 && u8[2] === 0xff) return "jpeg";
  if (u8.length > 8 && u8[0] === 0x89 && u8[1] === 0x50 && u8[2] === 0x4e && u8[3] === 0x47) return "png";
  if (
    u8.length > 12 &&
    String.fromCharCode(u8[0], u8[1], u8[2], u8[3]) === "RIFF" &&
    String.fromCharCode(u8[8], u8[9], u8[10], u8[11]) === "WEBP"
  )
    return "webp";
  return null;
}

// Strip whatever the bytes turn out to be. Returns null when the format has no
// lossless path here, so the caller can decide what to do instead.
export function stripMetadata(u8) {
  const format = sniffFormat(u8);
  const bytes =
    format === "jpeg" ? stripJpeg(u8) : format === "png" ? stripPng(u8) : format === "webp" ? stripWebp(u8) : null;
  if (!bytes) return null;
  return { bytes, format, removed: u8.length - bytes.length };
}
