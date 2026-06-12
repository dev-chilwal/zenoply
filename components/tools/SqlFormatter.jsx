"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

const KEYWORDS = new Set([
  "select", "from", "where", "and", "or", "not", "in", "is", "null", "like",
  "ilike", "between", "insert", "into", "values", "update", "set", "delete",
  "create", "table", "drop", "alter", "add", "join", "inner", "left", "right",
  "full", "outer", "cross", "natural", "on", "using", "as", "case", "when",
  "then", "else", "end", "group", "by", "order", "having", "limit", "offset",
  "union", "all", "distinct", "exists", "asc", "desc", "count", "sum", "avg",
  "min", "max", "with", "primary", "key", "foreign", "references", "default",
  "index", "view", "if", "cast", "coalesce", "nullif", "substring", "concat",
  "upper", "lower", "length", "round", "now", "abs",
]);
// Words that start a new clause line at indent 0.
const NEWLINE_WORDS = new Set([
  "select", "from", "where", "having", "limit", "offset", "values", "set",
  "union", "except", "intersect", "returning", "insert", "update", "delete",
  "group", "order", "with",
]);
const JOIN_START = new Set(["join", "inner", "left", "right", "full", "cross", "natural"]);
const PRE_JOIN = new Set(["inner", "left", "right", "full", "cross", "outer", "natural"]);
const INDENT_WORDS = new Set(["and", "or", "on"]);
// Keywords that act like function calls (no space before their paren).
const FUNCS = new Set([
  "count", "sum", "avg", "min", "max", "cast", "coalesce", "nullif",
  "substring", "concat", "upper", "lower", "length", "round", "now", "abs",
  "exists", "in",
]);

function formatSql(sql, upperKeywords) {
  const re = /('(?:[^']|'')*'|"[^"]*"|`[^`]*`|--[^\n]*|\/\*[\s\S]*?\*\/|[A-Za-z_][\w$]*(?:\.(?:[A-Za-z_*][\w$]*|\*))*|\d+(?:\.\d+)?|::|<>|<=|>=|!=|\|\||[(),;]|[*=<>+\-\/%.])/g;
  const tokens = sql.match(re) || [];
  if (!tokens.length) return "";
  const out = [];
  let line = "";
  let depth = 0; // paren nesting; line breaks only apply at depth 0
  const newline = (ind) => {
    if (line.trim()) out.push(line.replace(/\s+$/, ""));
    line = "  ".repeat(ind);
  };
  let prevTok = "";
  let prevWord = "";
  for (let i = 0; i < tokens.length; i++) {
    let t = tokens[i];
    const isWord = /^[A-Za-z_]/.test(t);
    const w = isWord ? t.toLowerCase() : "";
    if (w && KEYWORDS.has(w) && upperKeywords) t = t.toUpperCase();

    if (depth === 0 && w) {
      if (NEWLINE_WORDS.has(w) && !(w === "from" && prevWord === "delete")) newline(0);
      else if (JOIN_START.has(w) && !PRE_JOIN.has(prevWord)) newline(0);
      else if (INDENT_WORDS.has(w)) newline(1);
    }

    if (t === ",") {
      line += ",";
      if (depth === 0) newline(1);
    } else if (t === ";") {
      line = line.replace(/\s+$/, "") + ";";
      newline(0);
    } else if (t === "(") {
      const fnCall =
        prevTok && /^[A-Za-z_"`)]/.test(prevTok) &&
        (!KEYWORDS.has(prevWord) || FUNCS.has(prevWord));
      const noSpace = line.trim() === "" || /[(\s]$/.test(line) || fnCall;
      line += (noSpace ? "" : " ") + "(";
      depth++;
    } else if (t === ")") {
      line = line.replace(/\s+$/, "") + ")";
      depth = Math.max(0, depth - 1);
    } else if (t === "::" || t === ".") {
      line = line.replace(/\s+$/, "") + t;
      prevTok = t;
      prevWord = "";
      continue;
    } else {
      const noSpace = line.trim() === "" || /[(\s]$/.test(line) || /(::|\.)$/.test(line);
      line += (noSpace ? "" : " ") + t;
    }
    prevTok = t;
    prevWord = w;
  }
  newline(0);
  return out.join("\n");
}

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [upper, setUpper] = useState(true);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return formatSql(input, upper);
    } catch {
      return "";
    }
  }, [input, upper]);

  return (
    <div>
      <label className="field">
        <span className="field-label">SQL query</span>
        <textarea
          className="inp mono"
          rows={7}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="select id, name from users where active = 1 order by name"
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={upper} onChange={(e) => setUpper(e.target.checked)} />
        <span>Uppercase keywords</span>
      </label>
      <p className="muted small">Formatting only changes whitespace, line breaks and keyword casing. Strings, identifiers and comments are preserved exactly.</p>
      <OutputBox value={output} downloadName="formatted.sql" mimeType="application/sql" />
    </div>
  );
}
