// JSON -> TypeScript interface generation, kept out of the component so it can
// be run in node and checked against the real TypeScript compiler — the same
// reasoning as jsonYaml.js, whose lossless JSON parser this reuses.
//
// The generated types are only worth anything if `const x: Root = <your JSON>`
// actually compiles under `strict`, so that is what the test suite asserts:
// tsc, not a second copy of the guesswork here, decides whether the output is
// right. Five things drive the design, and none of them are obvious:
//
//  1. **Every element of an array is read, not just the first.** Real API
//     records differ — a field is absent on some rows, null on others — and a
//     converter that types the first element produces a type the second row
//     fails. Object shapes are merged rather than unioned, because a union of
//     twelve near-identical interfaces is useless.
//  2. **A missing key and a null value are different facts, and both survive.**
//     A key absent from some records is optional (`name?: string`); a key
//     present holding null is nullable (`name: string | null`); a key that does
//     both is `name?: string | null`. Collapsing the two — which is what
//     emitting `any` or a bare `?` does — throws away the half that
//     `strictNullChecks` exists to catch.
//  3. **Identical shapes become one interface.** Structural signatures are
//     computed with keys sorted, so two objects with the same fields in a
//     different order still share a type rather than fragmenting into User and
//     User2.
//  4. **A key is not an identifier.** `first name`, `2fa` and `content-type`
//     are legal JSON keys and illegal TypeScript property names unquoted, so
//     the emitter quotes what it must and leaves alone what it need not.
//     Interface *names* are a separate problem: they are derived from keys, so
//     they get sanitised, singularised for arrays, and kept away from the lib
//     type names that `interface Object {}` would silently merge with.
//  5. **A sample is evidence, not a schema.** One record cannot show
//     optionality, an empty array carries no element type, and an integer past
//     2^53 does not survive `number`. Each of those is reported rather than
//     papered over.

import { parseJson } from "./jsonYaml.js";

// Above this many distinct strings at one position, stop tracking values —
// the field is free text, not a closed set.
const LIT_CAP = 24;
// A literal union is only inferred with this much evidence: enough samples,
// few enough distinct values, and at least one repeat proving the set closed.
const LIT_MIN_SAMPLES = 3;
const LIT_MAX_VALUES = 12;

// Declaring `interface Object {}` merges with the lib declaration rather than
// shadowing it, which breaks the whole file in ways that point nowhere useful.
// These names are pre-taken so a key called "object" yields Object2 instead.
const RESERVED = [
  "any", "unknown", "never", "void", "null", "undefined", "string", "number",
  "boolean", "bigint", "symbol", "object", "Object", "String", "Number",
  "Boolean", "Array", "Function", "Date", "Error", "RegExp", "Promise", "Map",
  "Set", "WeakMap", "WeakSet", "Record", "Partial", "Required", "Readonly",
  "Pick", "Omit", "Exclude", "Extract", "JSON", "Math",
];

// A few plurals no rule gets right.
const IRREGULAR = {
  children: "child", people: "person", men: "man", women: "woman",
  feet: "foot", teeth: "tooth", mice: "mouse", geese: "goose",
  indices: "index", matrices: "matrix", vertices: "vertex", criteria: "criterion",
};

// Words ending in s that are not plurals of anything. The -ss, -us, -is and -os
// endings are handled by rule below; these are the ones that would otherwise be
// cut down to a non-word, and they are all common JSON keys. Getting this wrong
// only ever produces an ugly interface name, so the rules stay conservative:
// a word that might not be plural is left alone.
const INVARIANT_S = new Set([
  "news", "series", "species", "alias", "canvas", "gas", "atlas", "bias",
  "lens", "iris", "https", "dns", "cms", "rss", "css", "aws", "gps", "sms",
  "plus", "bonus", "https", "class",
]);

// ---------------------------------------------------------------------------
// The type lattice.
//
// A type is a bag holding at most one member of each JSON kind, which is
// exactly what a union of JSON values can be: `string | number | null` is three
// flags, and there is no such thing as `string | string`. Objects merge with
// objects and arrays merge element-wise, so the bag never needs two of a kind.
// ---------------------------------------------------------------------------

function emptyType() {
  return { str: null, num: null, bool: false, nul: false, obj: null, arr: null };
}

function fromNode(node, ctx) {
  const t = emptyType();
  if (node.t === "string") {
    t.str = { lits: new Set([node.v]), n: 1 };
  } else if (node.t === "number") {
    // Only integers can be silently wrong: a double holds 1.5 exactly, but
    // 9007199254740993 comes back as ...92. Flag it against the literal text,
    // which is why the parser keeps that text in the first place.
    const unsafe = /^-?\d+$/.test(node.raw) && !Number.isSafeInteger(Number(node.raw));
    if (unsafe && ctx.bigNumbers.size < 4) ctx.bigNumbers.add(node.raw);
    t.num = { unsafe };
  } else if (node.t === "bool") {
    t.bool = true;
  } else if (node.t === "null") {
    t.nul = true;
  } else if (node.t === "object") {
    const props = new Map();
    for (const { key, value } of node.entries) {
      props.set(key, { type: fromNode(value, ctx), seen: 1 });
    }
    if (node.entries.length === 0) ctx.emptyObjects++;
    t.obj = { props, n: 1 };
  } else if (node.t === "array") {
    let el = emptyType();
    for (const item of node.items) el = mergeType(el, fromNode(item, ctx));
    if (node.items.length === 0) ctx.emptyArrays++;
    t.arr = el;
  }
  return t;
}

function mergeType(a, b) {
  const t = emptyType();
  if (a.str || b.str) {
    const n = (a.str ? a.str.n : 0) + (b.str ? b.str.n : 0);
    let lits;
    if (a.str && b.str) {
      lits = a.str.lits && b.str.lits ? new Set(a.str.lits) : null;
      if (lits) for (const v of b.str.lits) lits.add(v);
    } else {
      const only = a.str || b.str;
      lits = only.lits ? new Set(only.lits) : null;
    }
    if (lits && lits.size > LIT_CAP) lits = null;
    t.str = { lits, n };
  }
  if (a.num || b.num) {
    t.num = { unsafe: !!((a.num && a.num.unsafe) || (b.num && b.num.unsafe)) };
  }
  t.bool = a.bool || b.bool;
  t.nul = a.nul || b.nul;
  if (a.obj && b.obj) t.obj = mergeObject(a.obj, b.obj);
  else t.obj = a.obj || b.obj;
  if (a.arr && b.arr) t.arr = mergeType(a.arr, b.arr);
  else t.arr = a.arr || b.arr;
  return t;
}

// `n` counts the records merged into this shape and `seen` how many of them
// carried the key, so optionality falls out of the arithmetic rather than
// needing a separate pass.
function mergeObject(x, y) {
  const props = new Map();
  for (const [k, v] of x.props) props.set(k, { type: v.type, seen: v.seen });
  for (const [k, v] of y.props) {
    const cur = props.get(k);
    if (cur) props.set(k, { type: mergeType(cur.type, v.type), seen: cur.seen + v.seen });
    else props.set(k, { type: v.type, seen: v.seen });
  }
  return { props, n: x.n + y.n };
}

// ---------------------------------------------------------------------------
// Names.
// ---------------------------------------------------------------------------

export function pascalCase(s) {
  const parts = String(s).split(/[^A-Za-z0-9]+/).filter(Boolean);
  if (!parts.length) return "";
  let out = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join("");
  if (/^[0-9]/.test(out)) out = "_" + out;
  return out;
}

export function singularize(word) {
  const lower = word.toLowerCase();
  for (const [plural, single] of Object.entries(IRREGULAR)) {
    if (lower === plural) return matchCase(word, single);
    // A compound only counts when the key itself marks the boundary
    // (subChildren, item_people). Matching a bare suffix would turn "specimen"
    // into "speciman", and a wrong name is worse than an unsingularised one.
    const at = word.length - plural.length;
    if (at > 0 && lower.endsWith(plural) && /[A-Z0-9_]/.test(word[at])) {
      return word.slice(0, at) + matchCase(word.slice(at), single);
    }
  }
  if (!lower.endsWith("s")) return word;
  if (INVARIANT_S.has(lower)) return word;
  // "address", "status", "analysis", "macos" are not plurals of anything.
  if (/(?:ss|us|is|os)$/i.test(word)) return word;
  if (/[^aeiou]ies$/i.test(word)) return word.slice(0, -3) + (word[word.length - 3] === "I" ? "Y" : "y");
  if (/(?:ch|sh|x|z|s)es$/i.test(word)) return word.slice(0, -2);
  // Below four characters it is far more likely to be an acronym (js, os, gps)
  // than a plural, and a wrong cut there is unreadable.
  if (word.length > 3) return word.slice(0, -1);
  return word;
}

function matchCase(sample, word) {
  if (sample === sample.toUpperCase() && sample !== sample.toLowerCase()) return word.toUpperCase();
  if (/^[A-Z]/.test(sample)) return word[0].toUpperCase() + word.slice(1);
  return word;
}

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// JSON.stringify is exactly right here: TypeScript's string-literal syntax is a
// superset of JSON's, escapes and lone surrogates included.
export function propertyKey(key) {
  return IDENT.test(key) ? key : JSON.stringify(key);
}

// ---------------------------------------------------------------------------
// Structural signature — what decides whether two objects share an interface.
// Keys are sorted, so field order never fragments a type.
// ---------------------------------------------------------------------------

function signatureOf(t, literals) {
  const parts = [];
  if (t.obj) parts.push("O" + objectSignature(t.obj, literals));
  if (t.arr) parts.push("A" + signatureOf(t.arr, literals));
  if (t.str) {
    const lits = literalValues(t.str, literals);
    parts.push("S" + (lits ? lits.join("") : ""));
  }
  if (t.num) parts.push("N");
  if (t.bool) parts.push("B");
  if (t.nul) parts.push("Z");
  return "(" + parts.join("|") + ")";
}

function objectSignature(o, literals) {
  const keys = [...o.props.keys()].sort();
  return "{" + keys.map((k) => {
    const p = o.props.get(k);
    return JSON.stringify(k) + (p.seen < o.n ? "?" : "") + ":" + signatureOf(p.type, literals);
  }).join(",") + "}";
}

// The evidence rule for a string-literal union: enough samples, few enough
// distinct values, and fewer distinct values than samples — that last clause is
// what separates a closed set from three rows of free text.
function literalValues(str, enabled) {
  if (!enabled || !str.lits) return null;
  if (str.n < LIT_MIN_SAMPLES) return null;
  if (str.lits.size > LIT_MAX_VALUES || str.lits.size >= str.n) return null;
  return [...str.lits].sort();
}

// The largest number of records merged into any one object shape in the
// document — the evidence available for deciding what is optional.
function maxMerged(t, best = 0) {
  if (t.obj) {
    best = Math.max(best, t.obj.n);
    for (const p of t.obj.props.values()) best = maxMerged(p.type, best);
  }
  if (t.arr) best = maxMerged(t.arr, best);
  return best;
}

// ---------------------------------------------------------------------------
// Emitter.
// ---------------------------------------------------------------------------

export function jsonToTypeScript(text, opts = {}) {
  const {
    rootName = "Root",
    declaration = "interface",
    unknownWord = "unknown",
    exportDecls = true,
    readonly = false,
    literalUnions = false,
    indent = 2,
  } = opts;

  const { root: node, duplicates } = parseJson(text);
  const ctx = { bigNumbers: new Set(), emptyObjects: 0, emptyArrays: 0 };
  const rootType = fromNode(node, ctx);

  const taken = new Set(RESERVED);
  const bySignature = new Map();
  const decls = [];
  let optionalCount = 0;
  let nullableCount = 0;
  let renamed = 0;
  let literalFields = 0;

  function uniqueName(base) {
    const name = base || "Item";
    if (!taken.has(name)) { taken.add(name); return name; }
    if (bySignature.size > 0 || !RESERVED.includes(name)) renamed++;
    let i = 2;
    while (taken.has(name + i)) i++;
    taken.add(name + i);
    return name + i;
  }

  function objectName(obj, hint) {
    const sig = objectSignature(obj, literalUnions);
    const existing = bySignature.get(sig);
    if (existing) return existing;
    const name = uniqueName(pascalCase(hint));
    bySignature.set(sig, name);
    // The slot is pushed before the body is built, so declarations come out in
    // the order they are reached from the root rather than leaves-first.
    const slot = { name, lines: [] };
    decls.push(slot);
    slot.lines = propertyLines(obj);
    return name;
  }

  function propertyLines(obj) {
    const lines = [];
    for (const [key, p] of obj.props) {
      const optional = p.seen < obj.n;
      if (optional) optionalCount++;
      if (p.type.nul) nullableCount++;
      const value = typeText(p.type, key);
      lines.push(
        (readonly ? "readonly " : "") + propertyKey(key) + (optional ? "?" : "") + ": " + value + ";"
      );
    }
    return lines;
  }

  function typeText(t, hint) {
    const parts = [];
    if (t.obj) {
      parts.push(t.obj.props.size ? objectName(t.obj, hint) : `Record<string, ${unknownWord}>`);
    }
    if (t.arr) {
      const singular = singularize(hint);
      const inner = typeText(t.arr, singular === hint ? hint + "Item" : singular);
      parts.push(inner.includes("|") ? `(${inner})[]` : `${inner}[]`);
    }
    if (t.str) {
      const lits = literalValues(t.str, literalUnions);
      if (lits) { literalFields++; parts.push(lits.map((v) => JSON.stringify(v)).join(" | ")); }
      else parts.push("string");
    }
    if (t.num) parts.push("number");
    if (t.bool) parts.push("boolean");
    if (t.nul) parts.push("null");
    if (!parts.length) return unknownWord;
    return parts.join(" | ");
  }

  const kw = exportDecls ? "export " : "";
  const root = pascalCase(rootName) || "Root";
  const pureObject =
    !!rootType.obj && rootType.obj.props.size > 0 &&
    !rootType.arr && !rootType.str && !rootType.num && !rootType.bool && !rootType.nul;

  let alias = "";
  if (pureObject) {
    objectName(rootType.obj, root);
  } else {
    // A type alias occupies the name too, so reserve it before anything
    // nested can be allocated it.
    taken.add(root);
    alias = `${kw}type ${root} = ${typeText(rootType, root)};`;
  }

  const pad = " ".repeat(indent);
  const blocks = [];
  if (alias) blocks.push(alias);
  for (const d of decls) {
    const body = d.lines.map((l) => pad + l).join("\n");
    blocks.push(
      declaration === "type"
        ? `${kw}type ${d.name} = {\n${body}\n};`
        : `${kw}interface ${d.name} {\n${body}\n}`
    );
  }
  const code = blocks.join("\n\n") + "\n";

  // The most records merged into any single shape. A document whose root is one
  // object can still hold a well-sampled array inside it, so this rather than
  // the root's own element count decides whether optionality could be seen.
  const records = maxMerged(rootType);
  const warnings = [];
  if (duplicates > 0) {
    warnings.push(
      duplicates === 1
        ? "One duplicate key was found; its last value was used, which is what a JSON parser does."
        : `${duplicates} duplicate keys were found; the last value of each was used, which is what a JSON parser does.`
    );
  }
  if (records === 1) {
    warnings.push(
      node.t === "array"
        ? "The array holds one element, so nothing here can show which fields are optional. More elements give a type that describes the endpoint rather than one response."
        : "This is a single record, so every field is typed as required. Paste an array of several records to find out which fields are actually optional."
    );
  }
  if (ctx.bigNumbers.size > 0) {
    const list = [...ctx.bigNumbers].join(", ");
    warnings.push(
      `Some integers are past 2^53 and TypeScript's number cannot hold them exactly (${list}). Type those fields as string or bigint, and check the JSON is not already being parsed with JSON.parse, which rounds them.`
    );
  }
  if (ctx.emptyArrays > 0) {
    warnings.push(
      `${ctx.emptyArrays === 1 ? "An empty array carries" : `${ctx.emptyArrays} empty arrays carry`} no element type, so ${ctx.emptyArrays === 1 ? "it is" : "they are"} typed ${unknownWord}[]. Paste a sample with entries to fill that in.`
    );
  }
  if (ctx.emptyObjects > 0) {
    warnings.push(
      `${ctx.emptyObjects === 1 ? "An empty object has" : `${ctx.emptyObjects} empty objects have`} no keys to read, so ${ctx.emptyObjects === 1 ? "it is" : "they are"} typed Record<string, ${unknownWord}> rather than {}, which in TypeScript means any non-null value.`
    );
  }
  if (renamed > 0) {
    warnings.push(
      `${renamed} ${renamed === 1 ? "name was" : "names were"} given a numeric suffix because a different shape already had that name.`
    );
  }

  return {
    code,
    warnings,
    stats: {
      interfaces: decls.length,
      optional: optionalCount,
      nullable: nullableCount,
      literalFields,
      records,
    },
  };
}
