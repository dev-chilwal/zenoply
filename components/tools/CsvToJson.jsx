"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// RFC 4180-aware CSV parser. Handles quoted fields, embedded commas and
// newlines, and escaped double quotes ("" inside a quoted field).
function parseCsv(text, delimiter) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delimiter) {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (c === "\r") {
      // swallow CR; the following LF (if any) ends the row
      i++;
      continue;
    }
    if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += c;
    i++;
  }
  // flush the final field/row (unless input ended exactly on a newline)
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function coerce(value) {
  if (value === "") return "";
  const t = value.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  // strict number check: avoids turning "007" or "1,000" into a number
  if (/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(t)) {
    const num = Number(t);
    if (Number.isFinite(num)) return num;
  }
  return value;
}

function convert(text, { delimiter, header, typed }) {
  const rows = parseCsv(text, delimiter).filter(
    (r) => !(r.length === 1 && r[0] === "")
  );
  if (rows.length === 0) return { value: "", error: false };

  const cast = (v) => (typed ? coerce(v) : v);
  let out;

  if (header) {
    const keys = rows[0];
    out = rows.slice(1).map((r) => {
      const obj = {};
      keys.forEach((k, idx) => {
        obj[k] = cast(r[idx] === undefined ? "" : r[idx]);
      });
      return obj;
    });
  } else {
    out = rows.map((r) => r.map(cast));
  }
  return { value: JSON.stringify(out, null, 2), error: false };
}

export default function CsvToJson() {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [header, setHeader] = useState(true);
  const [typed, setTyped] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { value: "", error: false };
    try {
      return convert(input, { delimiter, header, typed });
    } catch {
      return { value: "", error: true };
    }
  }, [input, delimiter, header, typed]);

  return (
    <div>
      <label className="field">
        <span className="field-label">CSV input</span>
        <textarea
          className="ta mono"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"name,age,active\nAda,36,true\nGrace,40,false"}
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
        First row is a header (use as object keys)
      </label>
      <label className="check-row">
        <input type="checkbox" checked={typed} onChange={(e) => setTyped(e.target.checked)} />
        Convert numbers and true/false to typed values
      </label>

      {result.error ? (
        <p className="error">Could not parse that CSV. Check for unbalanced quotes.</p>
      ) : (
        <OutputBox value={result.value} downloadName="data.json" mimeType="application/json" />
      )}
    </div>
  );
}
