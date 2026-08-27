"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import { formatXml } from "@/components/tools/xmlFormat";

// The parser and the emitter live in xmlFormat.js so they can be exercised in
// node against real XML parsers; this file is only the form around them.

const MODES = [
  { value: "beautify", label: "Beautify" },
  { value: "minify", label: "Minify" },
];

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer's Guide</title><price>44.95</price></book></catalog>`;

export default function XmlFormatter() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("beautify");
  const [indent, setIndent] = useState("2");
  const [removeComments, setRemoveComments] = useState(false);
  const [trimText, setTrimText] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { text: "", error: "", warnings: [], stats: null };
    try {
      const r = formatXml(input, {
        indent: indent === "tab" ? "\t" : " ".repeat(Number(indent)),
        minify: mode === "minify",
        removeComments,
        trimText,
      });
      return { text: r.text, error: "", warnings: r.warnings, stats: r.stats };
    } catch (e) {
      return { text: "", error: e.message || "That XML could not be parsed.", warnings: [], stats: null };
    }
  }, [input, mode, indent, removeComments, trimText]);

  const saved = input.length - result.text.length;
  const pct = input.length ? Math.round((saved / input.length) * 100) : 0;

  return (
    <div>
      <label className="field">
        <span className="field-label">XML to format</span>
        <textarea
          className="ta mono"
          rows={9}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <Segmented options={MODES} value={mode} onChange={setMode} ariaLabel="Formatting mode" />

      {mode === "beautify" && (
        <div className="field-row">
          <Field label="Indentation">
            <select className="inp" value={indent} onChange={(e) => setIndent(e.target.value)}>
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </Field>
        </div>
      )}

      <label className="check-row">
        <input
          type="checkbox"
          checked={trimText}
          onChange={(e) => setTrimText(e.target.checked)}
        />
        <span>Trim spaces and line breaks around text values</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={removeComments}
          onChange={(e) => setRemoveComments(e.target.checked)}
        />
        <span>Remove comments</span>
      </label>

      <p className="muted small">
        An element that mixes text with tags, like &lt;p&gt;Hello &lt;b&gt;world&lt;/b&gt;!&lt;/p&gt;, is
        kept on one line — indenting its children would add line breaks to the text itself. Entities,
        CDATA sections and anything under xml:space=&quot;preserve&quot; are left exactly as you
        wrote them.
      </p>

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          {result.stats && (
            <p className="muted small">
              {mode === "minify" ? (
                <>
                  Well-formed XML — {result.stats.elements}{" "}
                  {result.stats.elements === 1 ? "element" : "elements"}. Reduced from{" "}
                  {input.length} to {result.text.length} characters
                  {saved > 0 ? `, saving ${saved} (${pct}%)` : ""}.
                </>
              ) : (
                <>
                  Well-formed XML — {result.stats.elements}{" "}
                  {result.stats.elements === 1 ? "element" : "elements"}, nested{" "}
                  {result.stats.depth} {result.stats.depth === 1 ? "level" : "levels"} deep.
                </>
              )}
            </p>
          )}
          {result.warnings.map((w) => (
            <p className="muted small" key={w}>{w}</p>
          ))}
          <OutputBox
            value={result.text}
            downloadName={mode === "minify" ? "minified.xml" : "formatted.xml"}
            mimeType="application/xml"
          />
        </>
      )}
    </div>
  );
}
