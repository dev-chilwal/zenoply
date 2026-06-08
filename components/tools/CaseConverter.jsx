"use client";
import { useState } from "react";

const transforms = {
  UPPERCASE: (s) => s.toUpperCase(),
  lowercase: (s) => s.toLowerCase(),
  "Title Case": (s) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()),
  "Sentence case": (s) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
  camelCase: (s) =>
    s.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[A-Z]/, (c) => c.toLowerCase()),
  snake_case: (s) => s.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, ""),
};

export default function CaseConverter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState("");
  const copy = (val, key) => { navigator.clipboard?.writeText(val); setCopied(key); setTimeout(() => setCopied(""), 1200); };

  return (
    <div>
      <textarea className="ta" rows={5} placeholder="Enter text to convert…" value={text} onChange={(e) => setText(e.target.value)} />
      <div className="result-list">
        {Object.entries(transforms).map(([name, fn]) => {
          const out = text ? fn(text) : "";
          return (
            <div key={name} className="result-row">
              <span className="result-label">{name}</span>
              <code className="result-val">{out || <span className="muted">—</span>}</code>
              <button className="btn-sm" disabled={!out} onClick={() => copy(out, name)}>
                {copied === name ? "Copied" : "Copy"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
