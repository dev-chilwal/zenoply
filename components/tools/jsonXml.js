// JSON -> XML conversion, kept out of the component so it can be exercised in
// node against real XML parsers — expat (python3) and libxml2 (xmllint) — the
// same reasoning as xmlJson.js, whose mapping this inverts.
//
// The two formats do not describe the same thing, and this is the harder
// direction: XML constrains what JSON does not. A JSON key is any string, an
// XML element name is a narrow production; a JSON document has any number of
// top-level values, an XML document has exactly one root; a JSON string can
// hold characters XML 1.0 cannot represent at all. So the work is deciding
// which of those gaps to close silently and which to report:
//
//  1. **A JSON key is not an XML name.** "first name", "2024", "" and "@type"
//     are all legal keys and none is a legal element name. Renaming is the only
//     way through, so every rename is reported — and so is the case that
//     matters more: two *sibling* keys that sanitise to the same name become
//     two elements with one name, which any reader (this site's own XML to JSON
//     included) hands back as a two-item array. That is a silent merge of two
//     fields. Two attributes that collide are worse still: duplicate attribute
//     names are a well-formedness error, so there the later one is dropped
//     rather than emitted.
//  2. **Numbers are re-emitted as their original text**, which is why
//     `parseJson` from jsonYaml.js is used instead of `JSON.parse`. A price of
//     1.50 stays 1.50 and a 20-digit order ID keeps all twenty digits rather
//     than being rounded through a double.
//  3. **Escaping is not the obvious set.** `>` is escaped everywhere, not for
//     symmetry but because the sequence `]]>` is a hard parse error in content
//     (verified against both expat and xmllint). And a carriage return must be
//     written `&#13;`, because line-ending normalisation turns a literal one
//     into a line feed before the application ever sees the value — inside an
//     attribute, a literal tab or newline becomes a *space*. A converter that
//     writes those literally loses them, and the loss only appears on the far
//     side of a parser.
//  4. **Some strings cannot be written at all.** XML 1.0 has no way to carry
//     most control characters: `&#1;` is a parse error, not an escape. Those
//     are refused with a message naming the character, and removed only if the
//     user asks — never dropped quietly.
//  5. **Indentation is not free.** A newline added beside character data
//     becomes part of that data, so only an element whose content is entirely
//     child elements is ever broken across lines. Same contract as
//     xmlFormat.js, and the reason a text value keeps its own spacing.
//
// The mapping is the exact inverse of xmlJson.js: "@name" keys become
// attributes, "#text" becomes an element's text, and an array becomes repeated
// sibling elements — which is what makes an XML -> JSON -> XML round trip land
// back where it started.

import { parseJson } from "./jsonYaml.js";
import { NAME_START, NAME_REST } from "./xmlFormat.js";

// Full-match forms of the productions the site's XML parser already uses. Like
// that parser, the astral NameStartChar ranges are left out: a name emitted
// with one in it could not be read back by xmlFormat.js, so such a character is
// sanitised rather than passed through.
const XML_NAME_RE = new RegExp("^[" + NAME_START + "][" + NAME_REST + "]*$");
const NAME_START_RE = new RegExp("^[" + NAME_START + "]$");
const NAME_CHAR_RE = new RegExp("^[" + NAME_REST + "]$");

export const isXmlName = (s) => XML_NAME_RE.test(s);

// XML 1.0 Char production. Everything outside it — the C0 controls other than
// tab/LF/CR, the surrogate halves, U+FFFE and U+FFFF — is unrepresentable in a
// document, escaped or not.
const isXmlChar = (cp) =>
  cp === 0x9 || cp === 0xa || cp === 0xd ||
  (cp >= 0x20 && cp <= 0xd7ff) ||
  (cp >= 0xe000 && cp <= 0xfffd) ||
  (cp >= 0x10000 && cp <= 0x10ffff);

const CONTROL_NAMES = {
  0: "NUL", 1: "START OF HEADING", 7: "BELL", 8: "BACKSPACE", 0xb: "VERTICAL TAB",
  0xc: "FORM FEED", 0x1b: "ESCAPE", 0x7f: "DELETE",
};

export function codeName(cp) {
  const hex = "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
  if (cp >= 0xd800 && cp <= 0xdfff) return `${hex} (an unpaired surrogate)`;
  return CONTROL_NAMES[cp] ? `${hex} (${CONTROL_NAMES[cp]})` : hex;
}

// ---------------------------------------------------------------------------
// Escaping.
// ---------------------------------------------------------------------------

// `attribute` switches on the escapes that exist purely to defeat
// attribute-value normalisation: written literally, a tab or newline inside an
// attribute value is handed to the application as a space.
function escapeChars(s, attribute, ctx, where) {
  let out = "";
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (!isXmlChar(cp)) {
      ctx.badChars.set(cp, (ctx.badChars.get(cp) || 0) + 1);
      if (ctx.stripInvalid) continue;
      const e = new Error(
        `${where} contains ${codeName(cp)}, which XML 1.0 cannot hold in any form — it is not a ` +
        `character that can be escaped, and a document containing it will not parse. Switch on ` +
        `"Remove characters XML cannot hold" to drop it, or take it out of the JSON.`
      );
      e.badChar = cp;
      throw e;
    }
    if (ch === "&") { out += "&amp;"; continue; }
    if (ch === "<") { out += "&lt;"; continue; }
    // Not symmetry: a literal '>' closing the sequence ']]>' is a parse error
    // in content, so it is escaped unconditionally rather than contextually.
    if (ch === ">") { out += "&gt;"; continue; }
    if (ch === "\r") { out += "&#13;"; continue; }
    if (attribute) {
      if (ch === '"') { out += "&quot;"; continue; }
      if (ch === "\n") { out += "&#10;"; continue; }
      if (ch === "\t") { out += "&#9;"; continue; }
    }
    out += ch;
  }
  return out;
}

const strictCtx = () => ({ badChars: new Map(), stripInvalid: false });
export const escapeText = (s) => escapeChars(s, false, strictCtx(), "text");
export const escapeAttr = (s) => escapeChars(s, true, strictCtx(), "attribute value");

// ---------------------------------------------------------------------------
// Key -> element name.
// ---------------------------------------------------------------------------

// Returns a legal XML name for `key`, or the key itself when it already is one.
export function sanitiseName(key, fallback = "item") {
  if (isXmlName(key)) return key;
  let out = "";
  for (const ch of key) out += NAME_CHAR_RE.test(ch) ? ch : "_";
  if (out === "") return fallback;
  if (!NAME_START_RE.test(out[0])) out = "_" + out;
  return out;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const cap = (list, msg) => { if (list.length < 5 && !list.includes(msg)) list.push(msg); };

const XSI_NS = "http://www.w3.org/2001/XMLSchema-instance";

// ---------------------------------------------------------------------------
// Emitter.
// ---------------------------------------------------------------------------

export function jsonToXml(text, opts = {}) {
  const {
    rootName = "root",
    itemName = "item",
    attrPrefix = "@",
    textKey = "#text",
    indent = 2,
    declaration = true,
    nullMode = "empty", // "empty" | "nil" | "omit"
    stripInvalid = false,
  } = opts;

  const { root, duplicates } = parseJson(text);

  const safeRoot = sanitiseName(rootName, "root");
  const safeItem = sanitiseName(itemName, "item");
  const useAttrs = attrPrefix !== "";
  const useText = textKey !== "";

  const isAttrKey = (k) => useAttrs && k.length > attrPrefix.length && k.startsWith(attrPrefix);
  const isTextKey = (k) => useText && k === textKey;
  const isScalar = (n) => n.t === "string" || n.t === "number" || n.t === "bool" || n.t === "null";

  let ctx;
  const freshCtx = () => ({
    badChars: new Map(), stripInvalid,
    renames: [], collisions: [], dupAttrs: [], nsPrefixes: new Set(),
    inventedItems: 0, emptyArrays: [], nulls: 0, omitted: 0,
    nonScalarAttrs: [], nonScalarText: [],
    elements: 0, attributes: 0, depth: 0, usedNil: false,
  });

  function noteRename(kind, key, name) {
    cap(ctx.renames, `the ${kind} "${key}" became ${kind === "key" ? `<${name}>` : name}`);
  }

  // Element names collide only among *siblings*, so the map is per-parent — a
  // document-wide map would flag two unrelated branches as a collision.
  function nameFor(key, path, siblings) {
    const name = sanitiseName(key, safeItem);
    if (name !== key) noteRename("key", key, name);
    const first = siblings.get(name);
    if (first === undefined) siblings.set(name, key);
    else if (first !== key) {
      cap(ctx.collisions,
        `${path}: the keys "${first}" and "${key}" both become <${name}>, so they are now two ` +
        `elements sharing a name — read back, that is a two-item array rather than two fields`);
    }
    const colon = name.indexOf(":");
    if (colon > 0) ctx.nsPrefixes.add(name.slice(0, colon));
    return name;
  }

  function scalarText(n, path, attribute) {
    if (n.t === "string") return escapeChars(n.v, attribute, ctx, `The value at ${path}`);
    if (n.t === "number") return n.raw;
    if (n.t === "bool") return n.v ? "true" : "false";
    return ""; // null; the caller decides what an absent value looks like
  }

  let out = [];
  const pad = (d) => (indent > 0 ? " ".repeat(indent * d) : "");

  // Expands one key/value slot into zero or more sibling elements. An array in
  // a named slot is the inverse of xmlJson.js's "repeated name becomes array".
  function writeSlot(name, node, depth, path) {
    if (node.t === "array") {
      if (node.items.length === 0) { cap(ctx.emptyArrays, path); return; }
      // Each item becomes its own element under this name. An item that is
      // itself an array must be *wrapped*, not expanded again, or two levels
      // of nesting flatten into one.
      node.items.forEach((item, i) => writeElement(name, item, depth, `${path}[${i}]`, null));
      return;
    }
    writeElement(name, node, depth, path, null);
  }

  function writeElement(name, node, depth, path, extraAttrs) {
    if (node.t === "null" && nullMode === "omit") { ctx.nulls++; ctx.omitted++; return; }

    ctx.elements++;
    if (depth + 1 > ctx.depth) ctx.depth = depth + 1;

    const attrs = [];
    const attrSeen = new Map();
    const pushAttr = (aname, value, src) => {
      const prev = attrSeen.get(aname);
      if (prev !== undefined) {
        // Duplicate attribute names are a well-formedness error, not merely a
        // shape change, so the later one cannot be emitted.
        cap(ctx.dupAttrs,
          `${path}: "${prev}" and "${src}" both become the attribute ${aname}. XML forbids an ` +
          `element carrying the same attribute twice, so "${src}" was dropped`);
        return;
      }
      attrSeen.set(aname, src);
      attrs.push([aname, value]);
      ctx.attributes++;
    };
    for (const [k, v] of extraAttrs || []) pushAttr(k, v, k);

    const children = []; // { name, node, path, slot }
    const siblings = new Map();
    let textParts = null;

    if (node.t === "object") {
      for (const { key, value } of node.entries) {
        if (isAttrKey(key)) {
          const raw = key.slice(attrPrefix.length);
          if (isScalar(value)) {
            const aname = sanitiseName(raw, "attr");
            if (aname !== raw) noteRename("attribute", raw, aname);
            if (value.t === "null") ctx.nulls++;
            pushAttr(aname, scalarText(value, `${path}/${key}`, true), raw);
            const colon = aname.indexOf(":");
            if (colon > 0 && aname.slice(0, colon) !== "xmlns") ctx.nsPrefixes.add(aname.slice(0, colon));
            continue;
          }
          // An object or an array cannot be an attribute value, so the key
          // becomes an ordinary element rather than being dropped.
          cap(ctx.nonScalarAttrs,
            `${path}: "${key}" holds ${value.t === "array" ? "an array" : "an object"}, which cannot ` +
            `be an attribute value, so it was written as a child element instead`);
          children.push({ name: nameFor(key, path, siblings), node: value, path: `${path}/${key}`, slot: true });
          continue;
        }
        if (isTextKey(key)) {
          if (isScalar(value)) {
            if (value.t === "null") ctx.nulls++;
            textParts = scalarText(value, `${path}/${key}`, false);
          } else {
            cap(ctx.nonScalarText,
              `${path}: "${key}" holds ${value.t === "array" ? "an array" : "an object"} rather than ` +
              `text, so it was written as a child element instead`);
            children.push({ name: nameFor(key, path, siblings), node: value, path: `${path}/${key}`, slot: true });
          }
          continue;
        }
        children.push({ name: nameFor(key, path, siblings), node: value, path: `${path}/${key}`, slot: true });
      }
    } else if (node.t === "array") {
      // Reached when an array has no key to take a name from: a nested array,
      // or the whole document being one.
      ctx.inventedItems++;
      if (node.items.length === 0) cap(ctx.emptyArrays, path);
      node.items.forEach((item, i) =>
        children.push({ name: safeItem, node: item, path: `${path}[${i}]`, slot: false })
      );
    } else if (node.t === "null") {
      ctx.nulls++;
      if (nullMode === "nil") { pushAttr("xsi:nil", "true", "null"); ctx.usedNil = true; }
    } else {
      textParts = scalarText(node, path, false);
    }

    // A child that is an empty array, or a null being omitted, produces nothing.
    const producesNothing = (c) =>
      (c.slot && c.node.t === "array" && c.node.items.length === 0) ||
      (c.node.t === "null" && nullMode === "omit");
    const hasChildren = children.some((c) => !producesNothing(c));

    const attrText = attrs.map(([k, v]) => ` ${k}="${v}"`).join("");
    const open = `<${name}${attrText}`;

    if (!hasChildren && (textParts === null || textParts === "")) {
      out.push(pad(depth) + open + "/>");
      // Still walk the silent children so their losses get recorded.
      for (const c of children) {
        if (c.slot) writeSlot(c.name, c.node, depth + 1, c.path);
        else writeElement(c.name, c.node, depth + 1, c.path, null);
      }
      return;
    }

    // Children only go on their own lines when there is no character data to
    // damage; otherwise the whole element is written on one line.
    if (indent > 0 && textParts === null) {
      out.push(pad(depth) + open + ">");
      for (const c of children) {
        if (c.slot) writeSlot(c.name, c.node, depth + 1, c.path);
        else writeElement(c.name, c.node, depth + 1, c.path, null);
      }
      out.push(pad(depth) + `</${name}>`);
      return;
    }

    const mark = out.length;
    for (const c of children) {
      if (c.slot) writeSlot(c.name, c.node, depth + 1, c.path);
      else writeElement(c.name, c.node, depth + 1, c.path, null);
    }
    const inner = out.splice(mark).map((l) => l.trimStart()).join("");
    out.push(pad(depth) + open + ">" + (textParts || "") + inner + `</${name}>`);
  }

  // -------------------------------------------------------------------------
  // Root selection. XML allows exactly one root element; JSON promises nothing
  // of the sort, so this is where a wrapper gets invented.
  // -------------------------------------------------------------------------
  const single =
    root.t === "object" &&
    root.entries.length === 1 &&
    !isAttrKey(root.entries[0].key) &&
    !isTextKey(root.entries[0].key) &&
    !(root.entries[0].value.t === "array" && root.entries[0].value.items.length !== 1) &&
    !(root.entries[0].value.t === "null" && nullMode === "omit");

  let rootKey = null;
  let rootNode = root;
  if (single) {
    rootKey = root.entries[0].key;
    rootNode = root.entries[0].value;
    if (rootNode.t === "array") rootNode = rootNode.items[0];
  }

  // Whether an xsi:nil declaration is needed is only known after walking the
  // tree, and it has to sit on the root element — so the tree is walked twice.
  function run(rootAttrs) {
    ctx = freshCtx();
    out = [];
    if (single) writeElement(nameFor(rootKey, "$", new Map()), rootNode, 0, rootKey, rootAttrs);
    else writeElement(safeRoot, rootNode, 0, "$", rootAttrs);
  }

  run(null);
  if (ctx.usedNil) run([["xmlns:xsi", XSI_NS]]);

  const sep = indent > 0 ? "\n" : "";
  const body = out.join(sep);
  const xml = (declaration ? '<?xml version="1.0" encoding="UTF-8"?>' + sep : "") + body;

  // -------------------------------------------------------------------------
  // Warnings — everything the mapping could not carry across, said out loud.
  // -------------------------------------------------------------------------
  const warnings = [];

  if (ctx.collisions.length > 0) warnings.push(...ctx.collisions);
  if (ctx.dupAttrs.length > 0) warnings.push(...ctx.dupAttrs);
  if (ctx.renames.length > 0) {
    warnings.push(
      `Some keys are not legal XML names and were renamed: ${ctx.renames.join("; ")}. An XML name ` +
      `cannot start with a digit and cannot contain a space or most punctuation, so a key such as ` +
      `"first name" has to change to be written at all.`
    );
  }
  if (!single) {
    const why =
      root.t === "array" ? "this JSON is an array"
      : root.t === "object" ? `this JSON has ${root.entries.length === 0 ? "no" : root.entries.length} top-level ${root.entries.length === 1 ? "key" : "keys"}`
      : "this JSON is a single value";
    warnings.push(
      `A <${safeRoot}> element was added around the output. XML allows exactly one root element and ` +
      `${why}, so there was no single key to use as the root name.`
    );
  }
  if (ctx.inventedItems > 0) {
    warnings.push(
      `${plural(ctx.inventedItems, "array had", "arrays had")} no key to take an element name from ` +
      `— a nested array, or the document itself being one — so ${ctx.inventedItems === 1 ? "its" : "their"} ` +
      `entries were written as <${safeItem}>. That name is this tool's invention, not something ` +
      `from your data.`
    );
  }
  if (ctx.emptyArrays.length > 0) {
    warnings.push(
      `Empty ${ctx.emptyArrays.length === 1 ? "array at" : "arrays at"} ${ctx.emptyArrays.join(", ")} ` +
      `produced no elements. XML has no way to write a list with nothing in it, so an empty list and ` +
      `a missing key look identical once this is read back.`
    );
  }
  if (ctx.nulls > 0 && nullMode === "empty") {
    warnings.push(
      `${plural(ctx.nulls, "null was", "nulls were")} written as an empty element. XML has no null, ` +
      `so these are indistinguishable from an empty string when read back. Choose xsi:nil to mark ` +
      `them explicitly, or Omit to leave those elements out.`
    );
  }
  if (ctx.nulls > 0 && nullMode === "nil") {
    warnings.push(
      `${plural(ctx.nulls, "null was", "nulls were")} marked with xsi:nil="true", and the ` +
      `xmlns:xsi declaration it needs was added to the root element. A reader that does not know ` +
      `XML Schema instances sees an ordinary empty element carrying an attribute.`
    );
  }
  if (ctx.omitted > 0) {
    warnings.push(
      `${plural(ctx.omitted, "null was", "nulls were")} left out entirely, so ` +
      `${ctx.omitted === 1 ? "that key is" : "those keys are"} absent from the XML rather than ` +
      `present and empty.`
    );
  }
  if (ctx.nonScalarAttrs.length > 0) warnings.push(...ctx.nonScalarAttrs);
  if (ctx.nonScalarText.length > 0) warnings.push(...ctx.nonScalarText);

  if (ctx.nsPrefixes.size > 0) {
    const declared = new Set();
    const scan = (n) => {
      if (n.t === "object") {
        for (const { key, value } of n.entries) {
          if (isAttrKey(key)) {
            const raw = key.slice(attrPrefix.length);
            if (raw === "xmlns") declared.add("");
            else if (raw.startsWith("xmlns:")) declared.add(raw.slice(6));
          }
          scan(value);
        }
      } else if (n.t === "array") n.items.forEach(scan);
    };
    scan(root);
    // "xml" and "xmlns" are bound by the specification and never declared.
    const undeclared = [...ctx.nsPrefixes].filter((p) => !declared.has(p) && p !== "xml" && p !== "xmlns");
    if (undeclared.length > 0) {
      warnings.push(
        `${undeclared.length === 1 ? "The namespace prefix" : "The namespace prefixes"} ` +
        `${undeclared.map((p) => `"${p}:"`).join(", ")} ${undeclared.length === 1 ? "is" : "are"} used ` +
        `but never declared. The document is still well-formed XML, but a namespace-aware reader ` +
        `rejects it — add an "${attrPrefix}xmlns:${undeclared[0]}" key holding the namespace URI.`
      );
    }
  }
  if (ctx.badChars.size > 0 && stripInvalid) {
    const names = [...ctx.badChars.keys()].slice(0, 5).map(codeName).join(", ");
    const total = [...ctx.badChars.values()].reduce((a, b) => a + b, 0);
    warnings.push(
      `${plural(total, "character was", "characters were")} removed because XML 1.0 cannot hold ` +
      `${total === 1 ? "it" : "them"} in any form: ${names}. These cannot be escaped either — a ` +
      `document containing one does not parse.`
    );
  }
  if (duplicates > 0) {
    warnings.push(
      `${plural(duplicates, "duplicate key was", "duplicate keys were")} found in the JSON. The ` +
      `last value for each won, which is what JSON.parse does, but the earlier ones are gone.`
    );
  }

  return {
    xml,
    warnings,
    stats: { elements: ctx.elements, attributes: ctx.attributes, depth: ctx.depth },
  };
}
