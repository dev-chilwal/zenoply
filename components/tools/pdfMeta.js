// PDF metadata read/edit/strip, kept out of the component so it can be run and
// verified in node (same reasoning as rupeesWords.js).
//
// Two things about pdf-lib drive the whole design:
//   1. Left at its default, `PDFDocument.load` re-stamps Producer and a fresh
//      ModDate on every save — so a metadata remover would hand back a file
//      with brand new metadata in it. Every load here passes updateMetadata:false.
//   2. Deleting a /Metadata entry only unlinks the object. The XMP packet stays
//      in the saved bytes and `strings file.pdf` still prints it, so the object
//      has to be overwritten before the reference is dropped.
import { PDFName, PDFRef } from "pdf-lib";

// The eight information-dictionary entries, read through pdf-lib's typed
// getters: they decode UTF-16BE hex strings, so a Devanagari or accented
// author name comes back intact.
export const TEXT_FIELDS = [
  ["title", "Title", "getTitle", "setTitle"],
  ["author", "Author", "getAuthor", "setAuthor"],
  ["subject", "Subject", "getSubject", "setSubject"],
  ["keywords", "Keywords", "getKeywords", "setKeywords"],
  ["creator", "Creator", "getCreator", "setCreator"],
  ["producer", "Producer", "getProducer", "setProducer"],
];

const INFO_KEYS = ["Title", "Author", "Subject", "Keywords", "Creator", "Producer", "CreationDate", "ModDate"];
const METADATA = PDFName.of("Metadata");
const PIECEINFO = PDFName.of("PieceInfo");

const DATE_FIELDS = [
  ["created", "setCreationDate", "CreationDate"],
  ["modified", "setModificationDate", "ModDate"],
];

export const LOAD_OPTS = { updateMetadata: false, ignoreEncryption: true };

const pad = (n) => String(n).padStart(2, "0");

/** Date -> the value a datetime-local input wants, in the reader's timezone. */
export const toInput = (d) =>
  d instanceof Date && !Number.isNaN(d.getTime())
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    : "";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Date -> a short human-readable string, or "" for anything unusable. */
export const fmtDate = (d) =>
  d instanceof Date && !Number.isNaN(d.getTime())
    ? `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
    : "";

const infoDict = (doc) => doc.context.lookup(doc.context.trailerInfo.Info);

// Overwrite the object a ref points at, then unlink it. Unlinking alone leaves
// the packet recoverable in the saved file.
function purge(doc, dict, key) {
  const ref = dict.get(key);
  if (!ref) return false;
  if (ref instanceof PDFRef) {
    try {
      doc.context.assign(ref, doc.context.stream(""));
    } catch {
      /* couldn't overwrite; unlinking below still removes it from the tree */
    }
  }
  dict.delete(key);
  return true;
}

/** Drop the XMP packets — document-level and per-page. */
export function purgeXmp(doc) {
  purge(doc, doc.catalog, METADATA);
  for (const page of doc.getPages()) purge(doc, page.node, METADATA);
}

/** Every place this tool knows metadata can sit, cleared in one pass. */
export function stripAll(doc) {
  const info = infoDict(doc);
  if (info) for (const k of INFO_KEYS) info.delete(PDFName.of(k));
  purge(doc, doc.catalog, METADATA);
  purge(doc, doc.catalog, PIECEINFO);
  for (const page of doc.getPages()) {
    purge(doc, page.node, METADATA);
    purge(doc, page.node, PIECEINFO);
  }
}

/** Current values plus a count of the blocks no PDF reader displays. */
export function readMeta(doc) {
  const out = {};
  for (const [key, , getter] of TEXT_FIELDS) out[key] = doc[getter]() || "";
  out.created = doc.getCreationDate();
  out.modified = doc.getModificationDate();
  let extras = 0;
  if (doc.catalog.get(METADATA)) extras++;
  if (doc.catalog.get(PIECEINFO)) extras++;
  for (const page of doc.getPages()) {
    if (page.node.get(METADATA)) extras++;
    if (page.node.get(PIECEINFO)) extras++;
  }
  out.extras = extras;
  return out;
}

/**
 * Write the edited fields back. `form` holds strings (dates as datetime-local
 * values); `orig` is the readMeta() result the form was seeded from, used to
 * tell an untouched date from an edited one.
 */
export function applyEdits(doc, form, orig) {
  const info = infoDict(doc);
  for (const [key, , , setter] of TEXT_FIELDS) {
    const v = (form[key] || "").trim();
    // One array element, so the exact string survives — setKeywords joins on " ".
    if (v) doc[setter](key === "keywords" ? [v] : v);
    else info?.delete(PDFName.of(key[0].toUpperCase() + key.slice(1)));
  }
  for (const [key, setter, infoKey] of DATE_FIELDS) {
    const v = form[key];
    if (!v) {
      info?.delete(PDFName.of(infoKey));
    } else if (v === toInput(orig[key])) {
      // Untouched — keep the original Date so its seconds are not truncated
      // by the minute-resolution input.
      doc[setter](orig[key]);
    } else {
      const parsed = new Date(v);
      if (!Number.isNaN(parsed.getTime())) doc[setter](parsed);
    }
  }
  // A stale XMP packet would still carry the old title, and readers that prefer
  // XMP over the info dictionary would show it — undoing the edit just made.
  purgeXmp(doc);
}
