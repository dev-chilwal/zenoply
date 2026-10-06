// PNG container helpers for the Compress PNG tool. Pure byte work, no DOM, so
// it runs in node alongside the oxipng wasm for testing.
//
// Two jobs that oxipng itself does not do in the Squoosh build we ship:
//
// 1. Validate before handing bytes to the wasm. The Rust side reports a bad
//    file by panicking, and a panic leaves wasm-bindgen's shadow stack pointer
//    unwound, so the instance is not safe to reuse afterwards. Catching the
//    obvious cases here (not a PNG, truncated, animated) means the worker is
//    only ever asked to do work it can finish.
// 2. Strip metadata. That build runs with oxipng's default of keeping every
//    chunk, so a PNG carrying text comments, a timestamp or an eXIf block
//    (which can hold GPS coordinates) comes out still carrying them. Stripping
//    is offered as an option and touches only chunks that cannot change how the
//    image looks — colour chunks (iCCP, sRGB, gAMA, cHRM, sBIT) are always kept,
//    because dropping them shifts colours on a colour-managed screen.

export const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

// Ancillary chunks that describe the file rather than the picture.
export const METADATA_CHUNKS = new Set(["tEXt", "zTXt", "iTXt", "tIME", "eXIf"]);

const COLOR_TYPES = { 0: "Greyscale", 2: "RGB", 3: "Indexed", 4: "Greyscale + alpha", 6: "RGBA" };

const u32 = (b, i) => ((b[i] << 24) | (b[i + 1] << 16) | (b[i + 2] << 8) | b[i + 3]) >>> 0;
const fourcc = (b, i) => String.fromCharCode(b[i], b[i + 1], b[i + 2], b[i + 3]);

export function isPngSignature(bytes) {
  if (bytes.length < 8) return false;
  for (let i = 0; i < 8; i++) if (bytes[i] !== PNG_SIGNATURE[i]) return false;
  return true;
}

// Walk the chunk list. Returns { ok: false, reason } for anything the
// optimiser should not be given, otherwise the header fields and chunk spans
// ({ type, start, end } — `end` is one past the CRC).
export function parsePng(bytes) {
  if (!isPngSignature(bytes)) return { ok: false, reason: "not-png" };
  const chunks = [];
  let i = 8;
  let sawEnd = false;
  while (i + 12 <= bytes.length) {
    const len = u32(bytes, i);
    const type = fourcc(bytes, i + 4);
    const end = i + 12 + len;
    if (end > bytes.length || !/^[A-Za-z]{4}$/.test(type)) return { ok: false, reason: "truncated" };
    chunks.push({ type, start: i, end });
    i = end;
    if (type === "IEND") {
      sawEnd = true;
      break;
    }
  }
  if (!sawEnd || chunks[0]?.type !== "IHDR" || u32(bytes, chunks[0].start) !== 13) {
    return { ok: false, reason: "truncated" };
  }
  if (!chunks.some((c) => c.type === "IDAT")) return { ok: false, reason: "truncated" };
  const h = chunks[0].start + 8;
  const info = {
    ok: true,
    width: u32(bytes, h),
    height: u32(bytes, h + 4),
    bitDepth: bytes[h + 8],
    colorType: bytes[h + 9],
    colorLabel: COLOR_TYPES[bytes[h + 9]] || "Unknown",
    interlaced: bytes[h + 12] === 1,
    chunks,
    metadata: chunks.filter((c) => METADATA_CHUNKS.has(c.type)).map((c) => c.type),
  };
  // APNG keeps its extra frames in fdAT chunks that a still-image optimiser
  // has no business rewriting; rather than risk a file that plays wrong, an
  // animated PNG is reported and left alone.
  if (chunks.some((c) => c.type === "acTL")) return { ...info, ok: false, reason: "animated" };
  if (!info.width || !info.height) return { ok: false, reason: "truncated" };
  return info;
}

// Copy of `bytes` without the chunks whose type is in `drop`. Chunks are
// copied whole (length, type, data, CRC), so no CRC needs recomputing.
export function dropChunks(bytes, chunks, drop = METADATA_CHUNKS) {
  const keep = chunks.filter((c) => !drop.has(c.type));
  const size = 8 + keep.reduce((n, c) => n + (c.end - c.start), 0);
  const out = new Uint8Array(size);
  out.set(bytes.subarray(0, 8), 0);
  let o = 8;
  for (const c of keep) {
    out.set(bytes.subarray(c.start, c.end), o);
    o += c.end - c.start;
  }
  return out;
}

export function chunkTypes(bytes) {
  const p = parsePng(bytes);
  return p.chunks ? p.chunks.map((c) => c.type) : [];
}
