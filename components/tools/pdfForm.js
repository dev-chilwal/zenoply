// AcroForm read / fill / flatten, kept out of the component so it can be run
// and verified in node (same reasoning as rupeesWords.js and pdfMeta.js).
//
// Four things about pdf-lib drive the whole design:
//
//  1. It redraws field appearances with its own built-in Helvetica, which is
//     WinAnsi-encoded. Any character outside WinAnsi — Devanagari, CJK, emoji,
//     and the rupee sign U+20B9 — throws at save time with a message naming the
//     codepoint and nothing else. Appearances are therefore generated one field
//     at a time so a single bad value cannot sink the whole document, and the
//     value is still written even when its appearance cannot be drawn.
//  2. `flatten()` and `removeField()` both call `findWidgetAppearanceRef()`,
//     which throws "Unexpected N type: undefined" for any widget with no /AP /N.
//     Unsigned signature fields always look like that — PDFSignature reports
//     `needsAppearancesUpdate() === false`, so nothing ever generates one — so
//     flattening an ordinary form that ends with a signature box fails outright
//     unless every bare widget is given an appearance first.
//  3. `removeField()` un-links annotations by their *appearance* ref rather than
//     the widget ref, so on a form whose fields and widgets are separate objects
//     (radio groups always; most real-world forms) the widget objects are
//     deleted but their references stay in the page's /Annots array. Flattening
//     therefore leaves dangling references behind unless they are pruned.
//  4. `PDFDocument.load` re-stamps Producer and a fresh ModDate on every save
//     unless loaded with updateMetadata:false.
import {
  PDFBool,
  PDFButton,
  PDFCheckBox,
  PDFDocument,
  PDFDropdown,
  PDFName,
  PDFOptionList,
  PDFRadioGroup,
  PDFRef,
  PDFSignature,
  PDFTextField,
  StandardFonts,
} from "pdf-lib";

export const LOAD_OPTS = { updateMetadata: false, ignoreEncryption: true };

const ACROFORM = PDFName.of("AcroForm");
const ANNOTS = PDFName.of("Annots");
const NEED_APPEARANCES = PDFName.of("NeedAppearances");
const TU = PDFName.of("TU");
const XFA = PDFName.of("XFA");

/** Field kinds this tool can offer an input for. */
export const FILLABLE = new Set(["text", "checkbox", "radio", "dropdown", "optionlist"]);

const kindOf = (field) => {
  if (field instanceof PDFTextField) return "text";
  if (field instanceof PDFCheckBox) return "checkbox";
  if (field instanceof PDFRadioGroup) return "radio";
  if (field instanceof PDFDropdown) return "dropdown";
  if (field instanceof PDFOptionList) return "optionlist";
  if (field instanceof PDFSignature) return "signature";
  if (field instanceof PDFButton) return "button";
  return "other";
};

const attempt = (fn, fallback) => {
  try {
    const v = fn();
    return v === undefined ? fallback : v;
  } catch {
    return fallback;
  }
};

// A PDF field name is a dotted path ("applicant.address.line1"). The last
// segment is the only part specific to this field, so it makes the better
// fallback label when the form carries no /TU.
function prettyName(name) {
  const leaf = String(name).split(".").filter(Boolean).pop() || String(name);
  const spaced = leaf
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return String(name);
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// /TU is the tooltip Acrobat shows on hover, and on a well-made form it holds
// the actual question ("Full name as it appears on your ID") while /T holds a
// database-ish key. Prefer it when present.
function tooltipOf(field) {
  return attempt(() => {
    const tu = field.acroField.dict.lookup(TU);
    const text = tu?.decodeText?.();
    return typeof text === "string" && text.trim() ? text.trim() : undefined;
  }, undefined);
}

// Map every page-level annotation reference to its page index, so a widget can
// be located even when it carries no /P back-pointer.
function annotPageIndex(doc) {
  const byAnnot = new Map();
  const byPage = new Map();
  doc.getPages().forEach((page, idx) => {
    if (page.ref instanceof PDFRef) byPage.set(page.ref.tag, idx);
    const annots = attempt(() => page.node.Annots(), undefined);
    if (!annots) return;
    for (let i = 0; i < annots.size(); i++) {
      const ref = annots.get(i);
      if (ref instanceof PDFRef) byAnnot.set(ref.tag, idx);
    }
  });
  return { byAnnot, byPage };
}

function widgetPage(doc, widget, index) {
  const p = attempt(() => widget.P(), undefined);
  if (p instanceof PDFRef && index.byPage.has(p.tag)) return index.byPage.get(p.tag);
  const ref = attempt(() => doc.context.getObjectRef(widget.dict), undefined);
  if (ref instanceof PDFRef && index.byAnnot.has(ref.tag)) return index.byAnnot.get(ref.tag);
  return -1;
}

/** True for an XFA (LiveCycle) form, whose fields do not live in the AcroForm. */
export function hasXfa(doc) {
  return attempt(() => !!doc.catalog.lookup(ACROFORM)?.get?.(XFA), false);
}

/**
 * Every field in the document as a plain descriptor. Keyed by `name` — the
 * fully qualified field name, which a valid AcroForm keeps unique.
 */
export function readFields(doc) {
  const form = doc.getForm();
  const index = annotPageIndex(doc);
  return form.getFields().map((field) => {
    const kind = kindOf(field);
    const name = field.getName();
    const widgets = attempt(() => field.acroField.getWidgets(), []);
    const pages = [...new Set(widgets.map((w) => widgetPage(doc, w, index)).filter((n) => n >= 0))].sort(
      (a, b) => a - b
    );
    const d = {
      name,
      kind,
      label: tooltipOf(field) || prettyName(name),
      readOnly: attempt(() => field.isReadOnly(), false),
      required: attempt(() => field.isRequired(), false),
      page: pages.length ? pages[0] : -1,
      value: "",
    };
    if (kind === "text") {
      d.value = attempt(() => field.getText(), "") || "";
      d.multiline = attempt(() => field.isMultiline(), false);
      d.password = attempt(() => field.isPassword(), false);
      d.maxLength = attempt(() => field.getMaxLength(), undefined);
    } else if (kind === "checkbox") {
      d.value = attempt(() => field.isChecked(), false);
    } else if (kind === "radio") {
      d.options = attempt(() => field.getOptions(), []);
      d.value = attempt(() => field.getSelected(), "") || "";
    } else if (kind === "dropdown" || kind === "optionlist") {
      d.options = attempt(() => field.getOptions(), []);
      d.multi = attempt(() => field.isMultiselect(), false);
      d.editable = kind === "dropdown" && attempt(() => field.isEditable(), false);
      const selected = attempt(() => field.getSelected(), []) || [];
      d.value = d.multi ? selected : selected[0] || "";
    }
    return d;
  });
}

/**
 * Write `values` (keyed by field name) into the document's fields. Read-only
 * fields, buttons and signatures are skipped; a value a field refuses leaves
 * that field as it was rather than failing the whole fill.
 */
export function fillForm(doc, values) {
  const form = doc.getForm();
  const filled = [];
  for (const field of form.getFields()) {
    const kind = kindOf(field);
    const name = field.getName();
    if (!FILLABLE.has(kind)) continue;
    if (attempt(() => field.isReadOnly(), false)) continue;
    if (!Object.prototype.hasOwnProperty.call(values, name)) continue;
    const v = values[name];
    const list = Array.isArray(v) ? v.map(String).filter((s) => s !== "") : v ? [String(v)] : [];
    try {
      if (kind === "text") field.setText(v == null ? "" : String(v));
      else if (kind === "checkbox") (v ? field.check() : field.uncheck());
      else if (kind === "radio") (list.length ? field.select(list[0]) : field.clear());
      else if (list.length) field.select(list);
      else field.clear();
      filled.push(name);
    } catch {
      /* the field refused this value — leave it as it was */
    }
  }
  return filled;
}

/**
 * Regenerate appearance streams one field at a time and return the names of the
 * fields whose value could not be drawn. Done per field on purpose: pdf-lib's
 * own `updateFieldAppearances()` aborts the whole document on the first field
 * holding a character its built-in font cannot encode.
 */
export function updateAppearances(doc) {
  const form = doc.getForm();
  const font = form.getDefaultFont();
  const undrawable = [];
  for (const field of form.getFields()) {
    if (!attempt(() => field.needsAppearancesUpdate(), false)) continue;
    try {
      field.defaultUpdateAppearances(font);
    } catch {
      undrawable.push(field.getName());
    }
  }
  return undrawable;
}

/** Set or clear the AcroForm's NeedAppearances flag. */
export function setNeedAppearances(doc, on) {
  const form = doc.getForm();
  if (on) form.acroForm.dict.set(NEED_APPEARANCES, PDFBool.True);
  else form.acroForm.dict.delete(NEED_APPEARANCES);
}

/**
 * Give every widget that has no normal appearance an empty one, so flatten and
 * removeField can find a ref to stamp. Without this an unsigned signature field
 * — which nothing ever generates an appearance for — makes flattening throw.
 */
export function ensureWidgetAppearances(doc) {
  const form = doc.getForm();
  let patched = 0;
  for (const field of form.getFields()) {
    for (const widget of attempt(() => field.acroField.getWidgets(), [])) {
      if (attempt(() => !!widget.getNormalAppearance(), false)) continue;
      const rect = attempt(() => widget.getRectangle(), null);
      // A rect written from its opposite corner comes back negative; the BBox
      // of an empty stamp only needs to be non-negative and the right size.
      const w = Math.abs(rect?.width || 0);
      const h = Math.abs(rect?.height || 0);
      const stream = doc.context.formXObject([], {
        BBox: doc.context.obj([0, 0, w, h]),
        Matrix: doc.context.obj([1, 0, 0, 1, 0, 0]),
        Resources: doc.context.obj({}),
      });
      widget.setNormalAppearance(doc.context.register(stream));
      patched++;
    }
  }
  return patched;
}

/**
 * Drop /Annots entries whose object no longer exists. pdf-lib's flatten deletes
 * the widget objects but un-links them by the wrong ref, so without this the
 * saved file carries an /Annots array full of dangling references.
 */
export function pruneDeadAnnots(doc) {
  let removed = 0;
  for (const page of doc.getPages()) {
    const annots = attempt(() => page.node.Annots(), undefined);
    if (!annots) continue;
    const keep = [];
    let dropped = 0;
    for (let i = 0; i < annots.size(); i++) {
      const entry = annots.get(i);
      const target = entry instanceof PDFRef ? doc.context.lookup(entry) : entry;
      if (target) keep.push(entry);
      else dropped++;
    }
    if (!dropped) continue;
    removed += dropped;
    if (keep.length) page.node.set(ANNOTS, doc.context.obj(keep));
    else page.node.delete(ANNOTS);
  }
  return removed;
}

/**
 * Paint every field's appearance into its page and remove the interactive
 * fields, leaving values that can be read and printed but no longer edited.
 */
export function flattenForm(doc) {
  const form = doc.getForm();
  const patched = ensureWidgetAppearances(doc);
  form.flatten({ updateFieldAppearances: false });
  const pruned = pruneDeadAnnots(doc);
  // Nothing interactive is left, so the (now empty) form dictionary — and the
  // NeedAppearances flag inside it — would only mislead a reader.
  if (attempt(() => form.getFields().length, 0) === 0) doc.catalog.delete(ACROFORM);
  return { patched, pruned };
}

/**
 * Fill, draw and optionally flatten in one pass, returning the saved bytes plus
 * what happened. `flatten` is honoured only when every value could be drawn:
 * flattening bakes the appearance into the page, so a value with no appearance
 * would be flattened away entirely.
 */
export async function buildFilledPdf(bytes, values, { flatten = false } = {}) {
  const doc = await PDFDocument.load(bytes, LOAD_OPTS);
  const filled = fillForm(doc, values);
  const undrawable = updateAppearances(doc);
  let flattened = false;
  if (flatten && undrawable.length === 0) {
    flattenForm(doc);
    flattened = true;
  } else if (undrawable.length) {
    // The values are in the file even though we could not draw them; ask the
    // reader to render the fields itself so they are not shown blank.
    setNeedAppearances(doc, true);
  }
  return { bytes: await doc.save({ updateFieldAppearances: false }), filled, undrawable, flattened };
}

// ---------------------------------------------------------------------------
// Advisory check for characters the built-in font cannot draw, used to warn
// while the user types. The authority is still updateAppearances() above —
// this only has to be right often enough to be useful before the download.

// pdf-lib's own cleanText()/lineSplit() strip or break on these before anything
// is encoded, so they never reach the font and must not be reported.
const PRE_STRIPPED = new Set(
  // \b \t \n \v \f \r, then NEL, LINE SEPARATOR and PARAGRAPH SEPARATOR.
  [0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x85, 0x2028, 0x2029].map((c) => String.fromCodePoint(c))
);

let probeFontPromise = null;
const drawableCache = new Map();

/** The built-in Helvetica pdf-lib draws field values with. */
export function probeFont() {
  if (!probeFontPromise) {
    probeFontPromise = (async () => {
      const doc = await PDFDocument.create();
      return doc.embedFont(StandardFonts.Helvetica);
    })().catch((err) => {
      probeFontPromise = null;
      throw err;
    });
  }
  return probeFontPromise;
}

/** The distinct characters in `text` that the built-in font cannot draw. */
export function undrawableChars(font, text) {
  const bad = [];
  for (const ch of String(text ?? "")) {
    if (PRE_STRIPPED.has(ch)) continue;
    let ok = drawableCache.get(ch);
    if (ok === undefined) {
      try {
        font.encodeText(ch);
        ok = true;
      } catch {
        ok = false;
      }
      drawableCache.set(ch, ok);
    }
    if (!ok && !bad.includes(ch)) bad.push(ch);
  }
  return bad;
}
