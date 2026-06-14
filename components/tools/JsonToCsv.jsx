"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// Wrap a value in quotes only when it contains the delimiter, a quote,
// or a newline. Embedded quotes are doubled, per RFC 4180.
function escapeField(value, delimiter) {
  if (value === null || value === undefined) return "";
  let s;
  if (typeof value === "object") {
    s = JSON.stringify(value);
  } else {
    s = String(value);
  }
  if (s.includes('"') || s.includes(delimiter) || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function convert(text, { delimiter, header }) {
  const data = JSON.parse(text);
  if (!Array.isArray(data)) {
    throw new Error("Top-level JSON must be an array.");
  }
  if (data.length === 0) return "";

  const eol = "\r\n";

  // Array of arrays: emit rows directly.
  if (Array.isArray(data[0])) {
    return data
      .map((row) => row.map((v) => escapeField(v, delimiter)).join(delimiter))
      .join(eol);
  }

  // Array of objects: collect the union of keys, preserving first-seen order.
  const keys = [];
  const seen = new Set();
  data.forEach((obj) => {
    if (obj && typeof obj === "object") {
      Object.keys(obj).forEach((k) => {
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      });
    }
  });

  const lines = [];
  if (header) {
    lines.push(keys.map((k) => escapeField(k, delimiter)).join(delimiter));
  }
  data.forEach((obj) => {
    const row = keys.map((k) => {
      const v = obj && typeof obj === "object" ? obj[k] : undefined;
      return escapeField(v, delimiter);
    });
    lines.push(row.join(delimiter));
  });
  return lines.join(eol);
}

export default function JsonToCsv() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [header, setHeader] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { value: "", error: "" };
    try {
      return { value: convert(input, { delimiter, header }), error: "" };
    } catch (e) {
      return { value: "", error: e.message || "Invalid JSON." };
    }
  }, [input, delimiter, header]);

  return (
    <div>
      <label className="field">
        <span className="field-label">JSON input (an array of objects or arrays)</span>
        <textarea
          className="ta mono"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'[\n  {"name": "Ada", "age": 36},\n  {"name": "Grace", "age": 40}\n]'}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Delimiter</span>
          <select className="inp" value={delimiter} onChange={(e) => setDelimiter(e.target.value)}>
            <option value=",">Comma ,</option>
            <option value=";">Semicolon ;</option>
            <option value={"\t"}>Tab</option>
            <option value="|">Pipe |</option>
          </select>
        </label>
      </div>

      <label className="check-row">
        <input type="checkbox" checked={header} onChange={(e) => setHeader(e.target.checked)} />
        Include a header row of column names
      </label>

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <OutputBox value={result.value} downloadName="data.csv" mimeType="text/csv" />
      )}
    </div>
  );
}
