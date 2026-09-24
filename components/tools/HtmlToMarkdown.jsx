"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Field } from "@/components/calc/Calc";
import { htmlToMarkdown } from "@/components/tools/htmlMarkdown";

// The conversion lives in htmlMarkdown.js so it can be exercised in node, where
// every result is rendered back to HTML with commonmark and marked and compared
// with the input; this file is only the form around it.

const SAMPLE = `<h2>Release notes</h2>
<p>A short <b>intro</b> with a <a href="https://example.com">link</a>.</p>
<ul>
  <li>Faster export</li>
  <li>Fixed the <i>date</i> picker</li>
</ul>
<pre><code class="language-bash">npm install</code></pre>`;

const BULLETS = [
  { key: "-", label: "- (hyphen)" },
  { key: "*", label: "* (asterisk)" },
  { key: "+", label: "+ (plus)" },
];

export default function HtmlToMarkdown() {
  const [html, setHtml] = useState("");
  const [gfm, setGfm] = useState(true);
  const [keepHtml, setKeepHtml] = useState(true);
  const [mainOnly, setMainOnly] = useState(true);
  const [bullet, setBullet] = useState("-");
  const [pasteHtml, setPasteHtml] = useState(true);
  const [pasted, setPasted] = useState(false);

  const { result, error } = useMemo(() => {
    if (!html.trim()) return { result: null, error: "" };
    try {
      return { result: htmlToMarkdown(html, { gfm, keepHtml, mainOnly, bullet }), error: "" };
    } catch (e) {
      return { result: null, error: e?.message || "That HTML could not be converted." };
    }
  }, [html, gfm, keepHtml, mainOnly, bullet]);

  // Copying from a web page or Google Docs puts two versions on the clipboard:
  // plain text and the HTML behind it. A textarea takes the plain text, which
  // has already lost the headings and links, so the HTML is taken instead.
  function onPaste(e) {
    if (!pasteHtml) return;
    const rich = e.clipboardData?.getData("text/html");
    if (!rich) { setPasted(false); return; }
    e.preventDefault();
    const ta = e.currentTarget;
    const next = html.slice(0, ta.selectionStart) + rich + html.slice(ta.selectionEnd);
    setHtml(next);
    setPasted(true);
  }

  const s = result?.stats;

  return (
    <div>
      <label className="field">
        <span className="field-label">HTML to convert</span>
        <textarea
          className="ta mono"
          rows={10}
          value={html}
          onChange={(e) => { setHtml(e.target.value); if (!e.target.value) setPasted(false); }}
          onPaste={onPaste}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>
      {pasted && (
        <p className="muted small">
          Pasted the formatted version from your clipboard, so the headings, links and bold text
          came with it. Untick &ldquo;Paste formatted text as HTML&rdquo; to paste plain text instead.
        </p>
      )}

      <div className="field-row">
        <Field label="Bullet list marker">
          <select className="inp" value={bullet} onChange={(e) => setBullet(e.target.value)}>
            {BULLETS.map((b) => (
              <option key={b.key} value={b.key}>{b.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <label className="check-row">
        <input type="checkbox" checked={gfm} onChange={(e) => setGfm(e.target.checked)} />
        <span>GitHub extras: tables, ~~strikethrough~~ and task lists</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={keepHtml} onChange={(e) => setKeepHtml(e.target.checked)} />
        <span>Keep what Markdown can&apos;t express as HTML (&lt;sup&gt;, merged table cells, embeds)</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={mainOnly} onChange={(e) => setMainOnly(e.target.checked)} />
        <span>Main content only &mdash; skip the navigation when the page has a &lt;main&gt;</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={pasteHtml} onChange={(e) => setPasteHtml(e.target.checked)} />
        <span>Paste formatted text as HTML (copy from a web page or Google Docs)</span>
      </label>

      <p className="muted small">
        Text is escaped only where Markdown would read it as syntax, so <code>snake_case</code> and{" "}
        <code>2 * 3</code> stay as written while a line starting <code>1.</code> does not turn into a
        list. Scripts and styles are dropped with their contents. Going the other way? Use{" "}
        <a href="/convert/markdown-to-html">Markdown to HTML</a>, or the{" "}
        <a href="/text/remove-html-tags">HTML tag remover</a> if you only want the plain text.
      </p>

      {error && <p className="error">{error}</p>}

      {result && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-num">{s.headings.toLocaleString()}</span>
              <span className="stat-label">{s.headings === 1 ? "heading" : "headings"}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{s.links.toLocaleString()}</span>
              <span className="stat-label">{s.links === 1 ? "link" : "links"}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{(s.lists + s.tables + s.codeBlocks).toLocaleString()}</span>
              <span className="stat-label">lists, tables &amp; code blocks</span>
            </div>
            <div className="stat">
              <span className="stat-num">{s.keptHtml.toLocaleString()}</span>
              <span className="stat-label">kept as HTML</span>
            </div>
          </div>

          {result.notes.map((n) => (
            <p className="muted small" key={n}>{n}</p>
          ))}

          {!result.markdown && (
            <p className="muted small">
              Nothing came out &mdash; that input held no visible text, only markup, comments or
              scripts.
            </p>
          )}
        </>
      )}

      <OutputBox value={result ? result.markdown : ""} downloadName="content.md" mimeType="text/markdown" />
    </div>
  );
}
