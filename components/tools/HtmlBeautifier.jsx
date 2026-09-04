"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Field } from "@/components/calc/Calc";
import { formatHtml } from "@/components/tools/htmlFormat";

// The parser and the emitter live in htmlFormat.js so they can be exercised in
// node against parse5, a real HTML tree builder; this file is only the form
// around them.

const SAMPLE = `<div class="card"><h2>Title</h2><ul><li>One<li>Two</ul><p>Some <b>bold</b> text.</p></div>`;

export default function HtmlBeautifier() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState("2");
  const [customBlock, setCustomBlock] = useState(false);
  const [reindentScripts, setReindentScripts] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { text: "", warnings: [], stats: null };
    try {
      const r = formatHtml(input, {
        indent: indent === "tab" ? "\t" : " ".repeat(Number(indent)),
        customBlock,
        reindentScripts,
      });
      return { text: r.text, warnings: r.warnings, stats: r.stats };
    } catch (e) {
      return { text: "", warnings: [], stats: null, error: e.message || "That HTML could not be read." };
    }
  }, [input, indent, customBlock, reindentScripts]);

  return (
    <div>
      <label className="field">
        <span className="field-label">HTML to beautify</span>
        <textarea
          className="ta mono"
          rows={9}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <div className="field-row">
        <Field label="Indentation">
          <select className="inp" value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </select>
        </Field>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={reindentScripts}
          onChange={(e) => setReindentScripts(e.target.checked)}
        />
        <span>Re-indent script and style blocks</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={customBlock}
          onChange={(e) => setCustomBlock(e.target.checked)}
        />
        <span>Treat custom elements (my-widget) as block-level</span>
      </label>

      <p className="muted small">
        Only whitespace is changed, and only where a browser does not render it. Tags, attributes,
        quoting and letter case are copied through exactly, nothing is added or removed, and an
        element holding text — like &lt;p&gt;Some &lt;b&gt;bold&lt;/b&gt; text&lt;/p&gt; — stays on
        one line, because a line break between inline tags is a space on the page. Need the reverse?
        Use the <a href="/dev/html-minifier">HTML Minifier</a>.
      </p>

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          {result.stats && (
            <p className="muted small">
              {result.stats.elements} {result.stats.elements === 1 ? "element" : "elements"}, nested{" "}
              {result.stats.depth} {result.stats.depth === 1 ? "level" : "levels"} deep.
            </p>
          )}
          {result.warnings.map((w) => (
            <p className="muted small" key={w}>{w}</p>
          ))}
          <OutputBox value={result.text} downloadName="formatted.html" mimeType="text/html" />
        </>
      )}
    </div>
  );
}
