"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// A small, dependency-free YAML parser covering the common subset people paste
// into a converter: indentation-based mappings and sequences, scalars, quoted
// strings, inline (flow) arrays and objects, comments and blank lines. It does
// not aim to be a full YAML 1.2 engine (no anchors, tags or block scalars), and
// it reports a clear error rather than guessing on anything it cannot handle.

function stripComment(line) {
  // Remove a trailing # comment that is not inside quotes.
  let inS = false, inD = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inD) inS = !inS;
    else if (c === '"' && !inS) inD = !inD;
    else if (c === "#" && !inS && !inD) {
      // Only treat as a comment if preceded by start-of-line or whitespace.
      if (i === 0 || /\s/.test(line[i - 1])) return line.slice(0, i);
    }
  }
  return line;
}

function parseScalar(raw) {
  const s = raw.trim();
  if (s === "" || s === "~" || s === "null" || s === "Null" || s === "NULL") return null;
  if (s === "true" || s === "True" || s === "TRUE") return true;
  if (s === "false" || s === "False" || s === "FALSE") return false;
  if (
    (s.startsWith('"') && s.endsWith('"') && s.length >= 2) ||
    (s.startsWith("'") && s.endsWith("'") && s.length >= 2)
  ) {
    const inner = s.slice(1, -1);
    if (s[0] === '"') {
      return inner.replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\\\/g, "\\");
    }
    return inner.replace(/''/g, "'");
  }
  if (s.startsWith("[") || s.startsWith("{")) return parseFlow(s);
  if (/^-?\d+$/.test(s)) return parseInt(s, 10);
  if (/^-?\d*\.\d+$/.test(s) || /^-?\d+\.\d*$/.test(s) || /^-?\d+(\.\d+)?[eE][+-]?\d+$/.test(s)) return parseFloat(s);
  return s;
}

// Parse an inline flow collection like [1, 2, {a: b}] or {x: 1, y: [2,3]}.
function parseFlow(str) {
  const s = str.trim();
  let i = 0;
  function ws() { while (i < s.length && /\s/.test(s[i])) i++; }
  function readToken() {
    // Read a scalar token up to the next , ] } : (respecting quotes/brackets).
    let depth = 0, inS = false, inD = false, start = i;
    while (i < s.length) {
      const c = s[i];
      if (inS) { if (c === "'") inS = false; i++; continue; }
      if (inD) { if (c === '"') inD = false; i++; continue; }
      if (c === "'") { inS = true; i++; continue; }
      if (c === '"') { inD = true; i++; continue; }
      if (c === "[" || c === "{") { depth++; i++; continue; }
      if (c === "]" || c === "}") { if (depth === 0) break; depth--; i++; continue; }
      if (depth === 0 && (c === "," || c === ":")) break;
      i++;
    }
    return s.slice(start, i);
  }
  function value() {
    ws();
    if (s[i] === "[") {
      i++;
      const arr = [];
      ws();
      if (s[i] === "]") { i++; return arr; }
      while (i < s.length) {
        arr.push(value());
        ws();
        if (s[i] === ",") { i++; continue; }
        if (s[i] === "]") { i++; break; }
        throw new Error("Malformed inline array near: " + s.slice(i, i + 12));
      }
      return arr;
    }
    if (s[i] === "{") {
      i++;
      const obj = {};
      ws();
      if (s[i] === "}") { i++; return obj; }
      while (i < s.length) {
        ws();
        const key = parseScalar(readToken().trim());
        ws();
        if (s[i] !== ":") throw new Error("Expected ':' in inline object");
        i++;
        const val = value();
        obj[String(key)] = val;
        ws();
        if (s[i] === ",") { i++; continue; }
        if (s[i] === "}") { i++; break; }
        throw new Error("Malformed inline object near: " + s.slice(i, i + 12));
      }
      return obj;
    }
    return parseScalar(readToken().trim());
  }
  const v = value();
  ws();
  if (i < s.length) throw new Error("Unexpected characters after value: " + s.slice(i, i + 12));
  return v;
}

function indentOf(line) {
  const m = line.match(/^ */);
  return m[0].length;
}

// Parse a block of lines at a given indent into an object or array.
function parseBlock(lines, start, end, indent) {
  // Determine whether this block is a sequence (lines begin with "- ").
  let firstContent = start;
  while (firstContent < end && lines[firstContent].text.trim() === "") firstContent++;
  if (firstContent >= end) return null;
  const isSeq = /^-(\s|$)/.test(lines[firstContent].text.slice(indent));

  if (isSeq) {
    const arr = [];
    let i = firstContent;
    while (i < end) {
      const line = lines[i];
      if (line.text.trim() === "") { i++; continue; }
      if (line.indent < indent) break;
      if (line.indent > indent) throw new Error("Unexpected indentation at line " + (line.no));
      const rest = line.text.slice(indent);
      if (!/^-(\s|$)/.test(rest)) throw new Error("Expected list item at line " + line.no);
      const after = rest.slice(1).replace(/^\s/, "");
      // Find the range of child lines belonging to this item.
      let j = i + 1;
      while (j < end && (lines[j].text.trim() === "" || lines[j].indent > indent)) j++;

      if (after === "") {
        arr.push(parseBlock(lines, i + 1, j, indentOf(firstChildLine(lines, i + 1, j, indent))));
      } else if (/^[^:]*:(\s|$)/.test(after) || isMapEntry(after)) {
        // Item is itself a mapping starting on the same line. Build a virtual
        // block where the first key sits at the item's content column.
        const childIndent = indent + (rest.length - rest.slice(1).replace(/^\s*/, "").length);
        const virtual = [{ no: line.no, indent: childIndent, text: " ".repeat(childIndent) + after }];
        for (let k = i + 1; k < j; k++) virtual.push(lines[k]);
        arr.push(parseBlock(virtual, 0, virtual.length, childIndent));
      } else {
        arr.push(parseScalar(after));
      }
      i = j;
    }
    return arr;
  }

  // Mapping.
  const obj = {};
  let i = firstContent;
  while (i < end) {
    const line = lines[i];
    if (line.text.trim() === "") { i++; continue; }
    if (line.indent < indent) break;
    if (line.indent > indent) throw new Error("Unexpected indentation at line " + line.no);
    const rest = line.text.slice(indent);
    const colon = findKeyColon(rest);
    if (colon === -1) throw new Error("Expected 'key: value' at line " + line.no);
    const key = String(parseScalar(rest.slice(0, colon).trim()));
    const valPart = rest.slice(colon + 1).trim();
    let j = i + 1;
    while (j < end && (lines[j].text.trim() === "" || lines[j].indent > indent)) j++;
    if (valPart === "") {
      // Nested block (object or sequence) on following lines, or null.
      if (j > i + 1 && hasContent(lines, i + 1, j)) {
        obj[key] = parseBlock(lines, i + 1, j, indentOf(firstChildLine(lines, i + 1, j, indent)));
      } else {
        obj[key] = null;
      }
    } else {
      obj[key] = parseScalar(valPart);
    }
    i = j;
  }
  return obj;
}

function isMapEntry(s) {
  return findKeyColon(s) !== -1;
}
// Find the colon that separates a mapping key from its value (skip quotes).
function findKeyColon(s) {
  let inS = false, inD = false, depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inS) { if (c === "'") inS = false; continue; }
    if (inD) { if (c === '"') inD = false; continue; }
    if (c === "'") { inS = true; continue; }
    if (c === '"') { inD = true; continue; }
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
    else if (c === ":" && depth === 0 && (i + 1 >= s.length || /\s/.test(s[i + 1]))) return i;
  }
  return -1;
}
function hasContent(lines, start, end) {
  for (let i = start; i < end; i++) if (lines[i].text.trim() !== "") return true;
  return false;
}
function firstChildLine(lines, start, end, parentIndent) {
  for (let i = start; i < end; i++) {
    if (lines[i].text.trim() !== "" && lines[i].indent > parentIndent) return lines[i].text;
  }
  return "";
}

function yamlToObject(yaml) {
  let text = yaml.replace(/\r\n?/g, "\n");
  // Drop a leading document marker.
  text = text.replace(/^---\s*\n/, "").replace(/\n\.\.\.\s*$/, "");
  if (text.trim() === "") return null;
  const rawLines = text.split("\n");
  const lines = [];
  for (let n = 0; n < rawLines.length; n++) {
    let t = stripComment(rawLines[n]).replace(/\s+$/, "");
    lines.push({ no: n + 1, indent: indentOf(t), text: t });
  }
  // A whole-document inline value (e.g. starts with [ or {).
  const firstNonEmpty = lines.find((l) => l.text.trim() !== "");
  if (firstNonEmpty && /^[\[{]/.test(firstNonEmpty.text.trim()) && lines.filter((l) => l.text.trim() !== "").length === 1) {
    return parseFlow(firstNonEmpty.text.trim());
  }
  return parseBlock(lines, 0, lines.length, 0);
}

export default function YamlToJson() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { value: "", error: "" };
    try {
      const obj = yamlToObject(input);
      return { value: JSON.stringify(obj, null, indent ? 2 : 0), error: "" };
    } catch (e) {
      return { value: "", error: e.message || "Could not parse that YAML." };
    }
  }, [input, indent]);

  return (
    <div>
      <label className="field">
        <span className="field-label">YAML to convert</span>
        <textarea
          className="inp mono"
          rows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"name: Zenoply\ntools:\n  - word counter\n  - json formatter\nlive: true"}
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={indent} onChange={(e) => setIndent(e.target.checked)} />
        <span>Pretty-print with 2-space indentation</span>
      </label>
      <p className="muted small">Handles mappings, lists, nested blocks, inline arrays/objects, quoted strings, numbers and booleans. Anchors, tags and block scalars are not supported.</p>
      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <OutputBox value={result.value} downloadName="data.json" mimeType="application/json" />
      )}
    </div>
  );
}
