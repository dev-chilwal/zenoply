"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { minifyHtml } from "./htmlMinify";

export default function HtmlMinifier() {
  const [input, setInput] = useState("");
  const [removeComments, setRemoveComments] = useState(true);

  const output = useMemo(() => {
    if (!input.trim()) return "";
    try {
      return minifyHtml(input, { removeComments });
    } catch {
      return "";
    }
  }, [input, removeComments]);

  const saved = input.length && output.length ? input.length - output.length : 0;
  const pct = input.length ? Math.round((saved / input.length) * 100) : 0;

  return (
    <div>
      <label className="field">
        <span className="field-label">HTML to minify</span>
        <textarea
          className="inp mono"
          rows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"<div class=\"box\">\n  <p>Hello   world</p>\n</div>"}
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={removeComments} onChange={(e) => setRemoveComments(e.target.checked)} />
        <span>Remove comments (keeps conditional comments)</span>
      </label>
      <p className="muted small">Collapses whitespace and removes it wherever the browser would not render it — beside block elements like div and p — but keeps a single space between inline tags such as span, a and b, where it is a visible word gap. The contents of pre, textarea, script and style tags are preserved exactly. Going the other way? Use the <a href="/dev/html-beautifier">HTML Beautifier</a>.</p>
      {output && (
        <p className="muted small">Reduced from {input.length} to {output.length} characters, saving {saved} ({pct}%).</p>
      )}
      <OutputBox value={output} downloadName="minified.html" mimeType="text/html" />
    </div>
  );
}
