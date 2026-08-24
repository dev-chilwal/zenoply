"use client";

// Rules behind Extract Images from PDF, kept apart from the React component so
// they can be exercised in node (the rupeesWords.js pattern). Nothing here
// touches the DOM: the caller hands over what pdf.js gave it and gets back
// plain arrays and verdicts.
import { PDFDocument, PDFName, PDFArray, PDFRawStream } from "pdf-lib";

// pdf.js ImageKind, mirrored rather than imported so this file never pulls the
// library in. The numbers are part of pdf.js's message format and have been
// stable across major versions.
export const GRAYSCALE_1BPP = 1;
export const RGB_24BPP = 2;
export const RGBA_32BPP = 3;

// pdf.js refers to an image by the string form of its PDF object reference:
// "12R" at generation 0, "12R3" otherwise. That string is the only identifier
// that survives the same picture being reached from two different pages, so it
// is what deduplication keys on.
export function refKey(objectNumber, generationNumber = 0) {
  return generationNumber === 0 ? `${objectNumber}R` : `${objectNumber}R${generationNumber}`;
}

// Walk a page's operator list for the images it actually paints.
//
// Only the two object-backed paints count. The mask operators draw a one-bit
// stencil filled with the current colour — a shape, not a picture — and the
// inline operator only ever carries the postage-stamp images pdf.js inlines
// (its own threshold is width + height < 200). Extracting either would hand
// back a pile of black rectangles and dither tiles alongside the photos. They
// are counted so the tool can tell "this PDF has no photographs" apart from
// "this PDF has nothing in it at all".
export function collectPageImages(opList, OPS) {
  const objIds = [];
  const seen = new Set();
  let stencils = 0;
  const { fnArray, argsArray } = opList;
  for (let i = 0; i < fnArray.length; i++) {
    const fn = fnArray[i];
    if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
      const objId = argsArray[i]?.[0];
      if (typeof objId !== "string" || seen.has(objId)) continue;
      seen.add(objId);
      objIds.push(objId);
    } else if (
      fn === OPS.paintImageMaskXObject ||
      fn === OPS.paintImageMaskXObjectRepeat ||
      fn === OPS.paintImageMaskXObjectGroup ||
      fn === OPS.paintSolidColorImageMask ||
      fn === OPS.paintInlineImageXObject ||
      fn === OPS.paintInlineImageXObjectGroup
    ) {
      stencils++;
    }
  }
  return { objIds, stencils };
}

// Turn one of pdf.js's three decoded image layouts into the RGBA that ImageData
// wants. Follows pdf.js's own putBinaryImageData: rows of a 1-bit image are
// padded out to whole bytes, and a set bit is white.
export function imageDataToRgba({ width, height, kind, data }) {
  const out = new Uint8ClampedArray(width * height * 4);
  if (kind === RGBA_32BPP) {
    out.set(data.subarray(0, Math.min(data.length, out.length)));
    return out;
  }
  if (kind === RGB_24BPP) {
    const limit = Math.min(data.length, width * height * 3);
    for (let src = 0, dst = 0; src < limit; src += 3, dst += 4) {
      out[dst] = data[src];
      out[dst + 1] = data[src + 1];
      out[dst + 2] = data[src + 2];
      out[dst + 3] = 255;
    }
    return out;
  }
  if (kind === GRAYSCALE_1BPP) {
    const stride = (width + 7) >> 3;
    for (let y = 0; y < height; y++) {
      const row = y * stride;
      for (let x = 0; x < width; x++) {
        const byte = data[row + (x >> 3)] || 0;
        const value = byte & (128 >> (x & 7)) ? 255 : 0;
        const dst = (y * width + x) * 4;
        out[dst] = out[dst + 1] = out[dst + 2] = value;
        out[dst + 3] = 255;
      }
    }
    return out;
  }
  throw new Error(`Unsupported image kind: ${kind}`);
}

// JPEG has no alpha channel, so a transparent PNG saved as JPG has to be
// composited against something first. Canvas will not do it for us here:
// putImageData replaces the pixels it writes, alpha included, so a white
// rectangle painted underneath is simply overwritten.
export function flattenOntoWhite(rgba) {
  const out = new Uint8ClampedArray(rgba.length);
  for (let i = 0; i < rgba.length; i += 4) {
    const alpha = rgba[i + 3] / 255;
    out[i] = Math.round(rgba[i] * alpha + 255 * (1 - alpha));
    out[i + 1] = Math.round(rgba[i + 1] * alpha + 255 * (1 - alpha));
    out[i + 2] = Math.round(rgba[i + 2] * alpha + 255 * (1 - alpha));
    out[i + 3] = 255;
  }
  return out;
}

const SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

// Read the component count out of a JPEG's frame header — 1 for greyscale,
// 3 for the usual colour photo, 4 for CMYK. Returns null if the bytes are not a
// JPEG or end before the frame header, which is treated as "don't trust these".
export function jpegComponentCount(bytes) {
  if (!bytes || bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i < bytes.length - 1) {
    if (bytes[i] !== 0xff) return null;
    let marker = bytes[i + 1];
    i += 2;
    // A run of 0xFF bytes is padding before the real marker.
    while (marker === 0xff && i < bytes.length) marker = bytes[i++];
    // Standalone markers carry no length.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    // End of image, or the start of the scan, without ever meeting a frame.
    if (marker === 0xd9 || marker === 0xda) return null;
    if (i + 1 >= bytes.length) return null;
    const length = (bytes[i] << 8) | bytes[i + 1];
    if (length < 2) return null;
    if (SOF_MARKERS.has(marker)) {
      // [length 2][precision 1][height 2][width 2][component count 1]
      return i + 7 < bytes.length ? bytes[i + 7] : null;
    }
    i += length;
  }
  return null;
}

const GRAY_SPACES = new Set(["DeviceGray", "CalGray", "ICCBased1"]);
const RGB_SPACES = new Set(["DeviceRGB", "CalRGB", "ICCBased3"]);

// Decide whether an image XObject's stored bytes are already a JPEG that will
// open correctly on its own.
//
// When a PDF embeds a photo it usually stores the photographer's original JPEG
// untouched, so those bytes can be handed straight back — the same file, at the
// same quality, byte for byte, with no decode-and-re-encode round trip in
// between. That is only true when nothing in the PDF changes how the samples
// are to be read, and each of these conditions is a way that can happen:
//
//   * a second filter means the bytes are wrapped in something else first;
//   * /Decode inverts or remaps the samples;
//   * /SMask or /Mask holds the transparency, which a bare JPEG cannot carry;
//   * /DecodeParms may set ColorTransform, which decides whether three
//     components are YCbCr or already RGB — a standalone file has only its
//     Adobe marker to go on and may read them the other way;
//   * an Indexed, Separation, DeviceN or Lab space makes the samples mean
//     something other than grey or colour, and CMYK JPEGs, which browsers
//     cannot display at all, are excluded with them.
//
// Anything that fails goes through pdf.js instead, which understands all of it.
export function rawJpegExtractable({ filters, colorSpace, hasDecode, hasSMask, hasMask, hasDecodeParms, components }) {
  if (!Array.isArray(filters) || filters.length !== 1 || filters[0] !== "DCTDecode") return false;
  if (hasDecode || hasSMask || hasMask || hasDecodeParms) return false;
  if (components === 1) return GRAY_SPACES.has(colorSpace);
  if (components === 3) return RGB_SPACES.has(colorSpace);
  return false;
}

// Scan a PDF for image XObjects whose stored bytes can be handed back as-is.
// Keyed by the same reference string pdf.js reports, so the two scans line up.
export async function collectRawJpegs(bytes) {
  const found = new Map();
  let doc;
  try {
    doc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
  } catch {
    return found; // unreadable by pdf-lib is not fatal — pdf.js still gets its turn
  }

  const nameOf = (value) => (value && typeof value.asString === "function" ? value.asString().replace(/^\//, "") : null);

  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const dict = obj.dict;
    if (nameOf(dict.get(PDFName.of("Subtype"))) !== "Image") continue;
    if (dict.get(PDFName.of("ImageMask"))) continue;

    const rawFilter = dict.lookup(PDFName.of("Filter"));
    const filters =
      rawFilter instanceof PDFArray
        ? rawFilter.asArray().map((entry) => nameOf(entry))
        : [nameOf(rawFilter)];

    let colorSpace = null;
    const cs = dict.lookup(PDFName.of("ColorSpace"));
    if (cs instanceof PDFArray) {
      const family = nameOf(cs.get(0));
      if (family === "ICCBased") {
        const profile = cs.lookup(1);
        const n = profile?.dict?.get(PDFName.of("N"));
        colorSpace = typeof n?.asNumber === "function" ? `ICCBased${n.asNumber()}` : "ICCBased";
      } else {
        colorSpace = family;
      }
    } else {
      colorSpace = nameOf(cs);
    }

    const contents = obj.getContents();
    if (
      !rawJpegExtractable({
        filters,
        colorSpace,
        hasDecode: !!dict.get(PDFName.of("Decode")),
        hasSMask: !!dict.get(PDFName.of("SMask")),
        hasMask: !!dict.get(PDFName.of("Mask")),
        hasDecodeParms: !!dict.get(PDFName.of("DecodeParms")) || !!dict.get(PDFName.of("DP")),
        components: jpegComponentCount(contents),
      })
    ) {
      continue;
    }
    found.set(refKey(ref.objectNumber, ref.generationNumber), contents);
  }
  return found;
}

// doc.pdf, page 3, second image on it -> "doc-p3-2.jpg".
export function imageFileName(sourceName, page, index, ext) {
  const base = String(sourceName || "")
    .replace(/\.pdf$/i, "")
    .trim();
  return `${base || "pdf"}-p${page}-${index}.${ext}`;
}
