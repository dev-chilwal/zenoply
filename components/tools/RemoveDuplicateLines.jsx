"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// Remove duplicate lines, keeping the first occurrence of each line.
function dedupe(text, { ignoreCase, trimLines, dropEmpty }) {
  const lines = text.split(/\r\n|\r|\n/);
  const seen = new Set();
  const out = [];
  let removed = 0;
  for (const raw of lines) {
    const line = trimLines ? raw.trim() : raw;
    if (dropEmpty && line === "") {
      removed++;
      continue;
    }
    const key = ignoreCase ? line.toLowerCase() : line;
    if (seen.has(key)) {
      removed++;
      continue;
    }
    seen.add(key);
    out.push(line);
  }
  return { result: out.join("\n"), kept: out.length, removed };
}

export default function RemoveDuplicateLines() {
  const [text, setText] = useState("");
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines] = useState(true);
  const [dropEmpty, setDropEmpty] = useState(false);

  const { result, kept, removed } = useMemo(
    () => (text ? dedupe(text, { ignoreCase, trimLines, dropEmpty }) : { result: "", kept: 0, removed: 0 }),
    [text, ignoreCase, trimLines, dropEmpty]
  );

  return (
    <div>
      <label className="field">
        <span className="field-label">Paste your lines</span>
        <textarea
          className="inp mono"
          rows={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="One item per line..."
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
        <span>Ignore case (treat &quot;Apple&quot; and &quot;apple&quot; as duplicates)</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} />
        <span>Trim leading and trailing spaces before comparing</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={dropEmpty} onChange={(e) => setDropEmpty(e.target.checked)} />
        <span>Remove empty lines</span>
      </label>
      {text && (
        <p className="muted small">
          {kept} unique {kept === 1 ? "line" : "lines"} kept, {removed} removed.
        </p>
      )}
      <OutputBox value={result} downloadName="unique-lines.txt" />
    </div>
  );
}
