// XML -> JSON conversion, kept out of the component so it can be exercised in
// node against a real XML parser (expat, via python3) — the same reasoning as
// xmlFormat.js, whose parser this reuses.
//
// There is no canonical XML-to-JSON mapping, because the two formats do not
// describe the same thing: XML has attributes, ordered mixed content, comments
// and namespaces, and JSON has none of them. So the interesting decisions here
// are all about which losses to make loud rather than silent:
//
//  1. **Entities must be decoded, and that is the one thing xmlFormat.js
//     deliberately does not do.** JSON has no entity syntax, so leaving &amp;
//     in a string would be simply wrong. Decoding also means enforcing what a
//     real parser enforces: a numeric reference outside XML's legal character
//     range is an error, not a character, and a named entity nobody declared
//     (&nbsp; is the usual one — it is an HTML entity, not an XML one) is
//     reported and left literal rather than guessed at.
//  2. **Attribute-value normalisation and line-ending normalisation are real.**
//     A parser turns a literal tab or newline inside an attribute value into a
//     space, and CRLF into LF everywhere, before the application ever sees the
//     value — while a character reference to the same character survives. A
//     converter that skips this disagrees with every XML parser on documents
//     that contain either.
//  3. **A repeated element is an array; a single one is not** — and that is the
//     bug that outlives the conversion. The shape of the output depends on the
//     data, so a list that happens to have one entry today comes back as an
//     object and breaks the code that mapped over it. It cannot be fixed
//     silently (both shapes are what people ask for), so it is an option and,
//     when it applies, a warning.
//  4. **Values stay strings unless a number round-trips exactly.** Turning
//     text into numbers loses 007, 1.50 and any integer past 2^53. Coercion is
//     off by default and, when on, only converts a value whose digits come back
//     identical — so a zip code, a version and a 20-digit ID stay text.

import { parseXml } from "./xmlFormat.js";

const PREDEFINED = { lt: "<", gt: ">", amp: "&", apos: "'", quot: '"' };

// XML 1.0 Char production. Anything outside it cannot appear in a document at
// all, even written as a character reference — &#0; is a parse error, not a NUL.
const isXmlChar = (cp) =>
  cp === 0x9 || cp === 0xa || cp === 0xd ||
  (cp >= 0x20 && cp <= 0xd7ff) ||
  (cp >= 0xe000 && cp <= 0xfffd) ||
  (cp >= 0x10000 && cp <= 0x10ffff);

const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

// Resolves character data the way a parser does. `attribute` switches on
// attribute-value normalisation: a *literal* tab, newline or carriage return
// becomes a space, while the same character written as &#9; or &#10; does not.
// Outside attributes, CRLF and a lone CR both become LF (line-ending
// normalisation), which again a character reference escapes.
function decodeChars(raw, attribute, ctx) {
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "&") {
      const semi = raw.indexOf(";", i + 1);
      // parseXml has already checked that every & starts a well-formed
      // reference, so a miss here cannot happen; treated as literal if it does.
      if (semi === -1) { out += c; continue; }
      const body = raw.slice(i + 1, semi);
      if (body[0] === "#") {
        const hex = body[1] === "x";
        const cp = parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
        if (!isXmlChar(cp)) {
          throw new Error(
            `&${body}; is not a character XML allows. Only tab, newline, carriage return and ` +
            `code points above 31 (excluding the surrogate range) can appear in a document, ` +
            `so this reference cannot be decoded.`
          );
        }
        out += String.fromCodePoint(cp);
      } else if (hasOwn(PREDEFINED, body)) {
        out += PREDEFINED[body];
      } else {
        // Only the five predefined entities exist without a DTD. Anything else
        // is undeclared; a validating parser rejects the document, so guessing
        // at HTML's table here would be inventing content.
        ctx.undefinedEntities.add(body);
        out += "&" + body + ";";
      }
      i = semi;
      continue;
    }
    if (c === "\r") {
      out += attribute ? " " : "\n";
      if (raw[i + 1] === "\n") i++;
      continue;
    }
    if (attribute && (c === "\n" || c === "\t")) { out += " "; continue; }
    out += c;
  }
  return out;
}

// A number is only produced when writing it back gives the identical text.
// That single rule covers every case worth worrying about: 007 and 0123 keep
// their leading zeros, 1.50 keeps its trailing one, 12345678901234567890 keeps
// all twenty digits instead of being rounded to a double, and +1 stays text.
export function coerceScalar(s) {
  if (s === "true") return true;
  if (s === "false") return false;
  if (/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n) && String(n) === s) return n;
  }
  return s;
}

function preserveOf(el, inherited) {
  const a = el.attrs.find((x) => x.name === "xml:space");
  if (!a) return inherited;
  if (a.value === "preserve") return true;
  if (a.value === "default") return false;
  return inherited;
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export function xmlToJson(text, opts = {}) {
  const {
    attrPrefix = "@",
    textKey = "#text",
    coerceTypes = false,
    arrays = "repeated", // "repeated" | "all"
    trimText = true,
    stripNamespaces = false,
    indent = 2,
  } = opts;

  const { doc, warnings: parseWarnings, stats } = parseXml(text);

  const ctx = {
    undefinedEntities: new Set(),
    mixed: [],
    collisions: [],
    nsCollisions: [],
    droppedNodes: 0,
    droppedNsDecls: 0,
    arrayKeys: 0,
    repeatedKeys: 0,
  };

  const scalar = (s) => (coerceTypes ? coerceScalar(s) : s);

  const localName = (raw) => {
    if (!stripNamespaces) return raw;
    const i = raw.indexOf(":");
    return i === -1 ? raw : raw.slice(i + 1);
  };

  const note = (list, msg) => { if (list.length < 4 && !list.includes(msg)) list.push(msg); };

  function elementValue(el, path, inheritedPreserve) {
    const preserve = preserveOf(el, inheritedPreserve);
    const elems = [];
    const textParts = [];
    let hasCdata = false;

    for (const c of el.children) {
      if (c.type === "element") { elems.push(c); continue; }
      if (c.type === "cdata") { hasCdata = true; textParts.push(c.raw.slice(9, -3)); continue; }
      if (c.type === "text") { textParts.push(c); continue; }
      ctx.droppedNodes++; // comment or processing instruction
    }

    // Whitespace-only text sitting between two child elements is indentation,
    // not content, so it goes — unless xml:space says otherwise. Text in an
    // element that has no child elements is that element's value, whitespace
    // and all, subject only to the trim switch.
    const runs = [];
    for (const part of textParts) {
      if (typeof part === "string") { runs.push(part); continue; }
      if (elems.length > 0 && !preserve && !/\S/.test(part.raw)) continue;
      runs.push(decodeChars(part.raw, false, ctx));
    }
    let value = runs.join("");
    // CDATA exists to quote content verbatim, so trimming inside an element
    // that used one would undo the thing it was asked for.
    if (trimText && !preserve && !hasCdata) value = value.trim();
    const hasText = value !== "";

    const attrs = [];
    for (const a of el.attrs) {
      if (stripNamespaces && (a.name === "xmlns" || a.name.startsWith("xmlns:"))) {
        // The prefixes these declare are being removed from every name, so the
        // declarations describe nothing that is left in the output.
        ctx.droppedNsDecls++;
        continue;
      }
      attrs.push([attrPrefix + localName(a.name), scalar(decodeChars(a.value, true, ctx))]);
    }

    if (attrs.length === 0 && elems.length === 0) return scalar(value);

    const obj = {};
    for (const [k, v] of attrs) {
      if (hasOwn(obj, k)) note(ctx.nsCollisions, `${path}: two attributes both map to the key "${k}"`);
      obj[k] = v;
    }

    const order = [];
    const groups = new Map();
    const sources = new Map();
    for (const c of elems) {
      const key = localName(c.name);
      if (!groups.has(key)) { groups.set(key, []); sources.set(key, new Set()); order.push(key); }
      groups.get(key).push(c);
      sources.get(key).add(c.name);
    }

    for (const key of order) {
      const list = groups.get(key);
      if (sources.get(key).size > 1) {
        note(ctx.nsCollisions,
          `${path}: <${[...sources.get(key)].join("> and <")}> both map to the key "${key}"`);
      }
      if (list.length > 1) ctx.repeatedKeys++;
      const values = list.map((c) => elementValue(c, `${path} > ${key}`, preserve));
      const asArray = arrays === "all" || values.length > 1;
      if (asArray) ctx.arrayKeys++;
      if (hasOwn(obj, key)) {
        // Only reachable with an empty attribute prefix: <a id="1"><id>2</id></a>.
        note(ctx.collisions,
          `${path}: the attribute "${key}" and the child element <${key}> both map to the key ` +
          `"${key}" — the element's value was kept and the attribute dropped`);
      }
      obj[key] = asArray ? values : values[0];
    }

    if (hasText) {
      if (elems.length > 0) note(ctx.mixed, path);
      if (hasOwn(obj, textKey)) {
        note(ctx.collisions,
          `${path}: an attribute or child element already uses the key "${textKey}", so this ` +
          `element's own text was dropped`);
      } else {
        obj[textKey] = scalar(value);
      }
    }

    return obj;
  }

  const roots = [];
  for (const c of doc.children) {
    if (c.type === "element") roots.push(c);
    else ctx.droppedNodes++; // declaration, DOCTYPE, comment, processing instruction
  }

  let value;
  if (roots.length === 0) {
    value = {};
  } else {
    value = {};
    const order = [];
    const groups = new Map();
    for (const c of roots) {
      const key = localName(c.name);
      if (!groups.has(key)) { groups.set(key, []); order.push(key); }
      groups.get(key).push(c);
    }
    for (const key of order) {
      const list = groups.get(key);
      if (list.length > 1) ctx.repeatedKeys++;
      const values = list.map((c) => elementValue(c, key, false));
      const asArray = arrays === "all" || values.length > 1;
      if (asArray) ctx.arrayKeys++;
      value[key] = asArray ? values : values[0];
    }
  }

  const warnings = [...parseWarnings];

  if (ctx.undefinedEntities.size > 0) {
    const names = [...ctx.undefinedEntities].slice(0, 5).map((n) => `&${n};`).join(", ");
    warnings.push(
      `Undeclared ${ctx.undefinedEntities.size === 1 ? "entity" : "entities"} left as written: ` +
      `${names}. Only &lt; &gt; &amp; &apos; and &quot; exist in XML without a DTD — ` +
      `named entities such as &nbsp; come from HTML, and a validating XML parser rejects them, ` +
      `so they have not been guessed at.`
    );
  }
  if (ctx.mixed.length > 0) {
    warnings.push(
      `Mixed content found at ${ctx.mixed.join(", ")}. These elements hold text and child ` +
      `elements together, and JSON has nowhere to record the order between them: the text runs ` +
      `are joined into "${textKey}" and the elements become their own keys, so a paragraph with ` +
      `a tag in the middle of it loses where that tag sat.`
    );
  }
  if (ctx.collisions.length > 0) warnings.push(...ctx.collisions);
  if (ctx.nsCollisions.length > 0) {
    warnings.push(
      ...ctx.nsCollisions.map((c) => `${c}. Removing namespace prefixes made these names ` +
        `identical; turn that option off to keep them apart.`)
    );
  }
  if (ctx.repeatedKeys > 0 && arrays === "repeated") {
    warnings.push(
      `${plural(ctx.repeatedKeys, "element name repeats", "element names repeat")} and ` +
      `${ctx.repeatedKeys === 1 ? "became a JSON array" : "became JSON arrays"}. That shape ` +
      `depends on your data rather than your schema: had one of those lists held a single entry, ` +
      `it would have come back as a plain object instead, and code written to loop over it would ` +
      `break. Switch on "Always arrays" if something will read this output programmatically.`
    );
  }
  if (ctx.droppedNsDecls > 0) {
    warnings.push(
      `${plural(ctx.droppedNsDecls, "xmlns declaration was", "xmlns declarations were")} dropped, ` +
      `because the prefixes they declare no longer appear anywhere in the output.`
    );
  }
  if (ctx.droppedNodes > 0) {
    warnings.push(
      `${plural(ctx.droppedNodes, "comment, processing instruction or declaration was", "comments, processing instructions or declarations were")} ` +
      `dropped — JSON has nowhere to put them.`
    );
  }

  return {
    value,
    json: JSON.stringify(value, null, indent) ?? "",
    warnings,
    stats: { ...stats, arrays: ctx.arrayKeys },
  };
}
