"use client";
import { useState, useEffect, useRef } from "react";
import OutputBox from "@/components/OutputBox";
import { Field } from "@/components/calc/Calc";
import { markdownToHtml } from "@/components/tools/markdownHtml";

// The conversion lives in markdownHtml.js so it can be exercised in node
// against commonmark (the reference implementation), github-slugger and parse5;
// this file is only the form around it.

const SAMPLE = `# Release notes

A short **intro** with a [link](https://example.com).

## What changed

- Faster export
- Fixed the *date* picker

| Version | Date |
|---------|------|
| 2.1     | May  |

> Upgrade when you can.

\`\`\`bash
npm install
\`\`\``;

const RAW_HTML_MODES = [
  { key: "keep", label: "Keep it as HTML" },
  { key: "escape", label: "Show it as text" },
  { key: "remove", label: "Remove it" },
];

export default function MarkdownToHtml() {
  const [input, setInput] = useState("");
  const [gfm, setGfm] = useState(true);
  const [breaks, setBreaks] = useState(false);
  const [headingIds, setHeadingIds] = useState(true);
  const [rawHtml, setRawHtml] = useState("keep");
  const [pretty, setPretty] = useState(true);
  const [fullDocument, setFullDocument] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [includeCss, setIncludeCss] = useState(true);
  const [view, setView] = useState("html");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const runRef = useRef(0);

  // marked is fetched on first conversion, so the options can all be live.
  // Every run carries a sequence number because a slow first import would
  // otherwise let an early result land after a later one.
  useEffect(() => {
    if (!input.trim()) {
      setResult(null);
      setError("");
      return;
    }
    const run = ++runRef.current;
    markdownToHtml(input, { gfm, breaks, headingIds, rawHtml, pretty, fullDocument, documentTitle, includeCss })
      .then((r) => {
        if (run !== runRef.current) return;
        setResult(r);
        setError("");
      })
      .catch((e) => {
        if (run !== runRef.current) return;
        setResult(null);
        setError(e?.message || "That Markdown could not be converted.");
      });
  }, [input, gfm, breaks, headingIds, rawHtml, pretty, fullDocument, documentTitle, includeCss]);

  // The preview is always a whole styled page, whatever the output option says,
  // and it runs in a sandboxed iframe: no scripts, no access to this page. That
  // is stronger than sanitising the HTML, and it means the preview shows the
  // raw HTML exactly as a browser would render it rather than a cleaned copy.
  const previewDoc = result
    ? (fullDocument ? result.html : wrapForPreview(result.body))
    : "";

  const stats = result?.stats;

  return (
    <div>
      <label className="field">
        <span className="field-label">Markdown to convert</span>
        <textarea
          className="ta mono"
          rows={10}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <div className="field-row">
        <Field label="Raw HTML in the Markdown">
          <select className="inp" value={rawHtml} onChange={(e) => setRawHtml(e.target.value)}>
            {RAW_HTML_MODES.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </Field>
        {fullDocument && (
          <Field label="Page title">
            <input
              className="inp"
              type="text"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              placeholder={result?.title || "From the first heading"}
            />
          </Field>
        )}
      </div>

      <label className="check-row">
        <input type="checkbox" checked={gfm} onChange={(e) => setGfm(e.target.checked)} />
        <span>GitHub extras: tables, task lists, ~~strikethrough~~ and bare URLs</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={breaks} onChange={(e) => setBreaks(e.target.checked)} />
        <span>Keep single line breaks (each newline becomes a &lt;br&gt;)</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={headingIds} onChange={(e) => setHeadingIds(e.target.checked)} />
        <span>Add an id to every heading, the way GitHub does</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} />
        <span>Indent the HTML</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={fullDocument} onChange={(e) => setFullDocument(e.target.checked)} />
        <span>Wrap it in a complete HTML page</span>
      </label>
      {fullDocument && (
        <label className="check-row">
          <input type="checkbox" checked={includeCss} onChange={(e) => setIncludeCss(e.target.checked)} />
          <span>Include a small readable stylesheet</span>
        </label>
      )}

      <p className="muted small">
        Markdown is parsed to the CommonMark rules, with GitHub&apos;s extras on top when that box
        is ticked. Everything runs in your browser. Need it the other way round? Use{" "}
        <a href="/convert/html-to-markdown">HTML to Markdown</a>; the{" "}
        <a href="/dev/html-beautifier">HTML Beautifier</a> and{" "}
        <a href="/text/remove-html-tags">HTML tag remover</a> handle HTML you already have.
      </p>

      {error && <p className="error">{error}</p>}

      {result && (
        <>
          {stats && (
            <p className="muted small">
              {stats.headings} {stats.headings === 1 ? "heading" : "headings"}, {stats.links}{" "}
              {stats.links === 1 ? "link" : "links"}, {stats.images}{" "}
              {stats.images === 1 ? "image" : "images"}, {stats.code}{" "}
              {stats.code === 1 ? "code block" : "code blocks"}
              {stats.tables > 0 && `, ${stats.tables} ${stats.tables === 1 ? "table" : "tables"}`}.
            </p>
          )}
          {result.warnings.map((w) => (
            <p className="muted small" key={w}>{w}</p>
          ))}

          <div className="seg" role="tablist" aria-label="Output view">
            <button
              type="button"
              role="tab"
              aria-selected={view === "html"}
              className={"seg-btn" + (view === "html" ? " active" : "")}
              onClick={() => setView("html")}
            >
              HTML
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "preview"}
              className={"seg-btn" + (view === "preview" ? " active" : "")}
              onClick={() => setView("preview")}
            >
              Preview
            </button>
          </div>

          {view === "html" ? (
            <OutputBox
              value={result.html}
              downloadName={fullDocument ? "document.html" : "content.html"}
              mimeType="text/html"
            />
          ) : (
            <iframe
              className="md-preview"
              title="Rendered preview"
              sandbox=""
              srcDoc={previewDoc}
            />
          )}
        </>
      )}
    </div>
  );
}

// A minimal page for the preview pane only - never part of what you copy.
function wrapForPreview(body) {
  return (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    "<style>:root{color-scheme:light dark}" +
    'body{margin:0;padding:1rem 1.2rem;font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}' +
    "h1,h2,h3,h4,h5,h6{line-height:1.25;margin:1.4em 0 .5em}h1{font-size:1.7em}h2{font-size:1.35em}h3{font-size:1.12em}" +
    "h1:first-child,h2:first-child,h3:first-child{margin-top:0}" +
    "p,ul,ol,blockquote,table,pre{margin:0 0 1em}" +
    "code{font:.9em/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(127,127,127,.15);padding:.15em .35em;border-radius:3px}" +
    "pre{background:rgba(127,127,127,.12);padding:.9em;overflow:auto;border-radius:6px}pre code{background:none;padding:0}" +
    "blockquote{border-left:3px solid rgba(127,127,127,.4);margin-left:0;padding-left:1em;opacity:.85}" +
    "table{border-collapse:collapse;width:100%}th,td{border:1px solid rgba(127,127,127,.35);padding:.4em .55em;text-align:left}" +
    "img{max-width:100%}hr{border:0;border-top:1px solid rgba(127,127,127,.35)}" +
    "</style></head><body>" +
    body +
    "</body></html>"
  );
}
