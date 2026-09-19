"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Field } from "@/components/calc/Calc";
import { stripHtml } from "@/components/tools/htmlStrip";

// The tokenizer, the element tables and the whitespace model live in
// htmlStrip.js so they can be exercised in node; this file is only the form
// around them.

const SAMPLE =
  '<h1>Hello</h1>\n<p>Some <b>bold</b> text &amp; an <a href="/x">link</a>.</p>';

export default function RemoveHtmlTags() {
  const [html, setHtml] = useState("");
  const [lineBreaks, setLineBreaks] = useState("smart");
  const [collapse, setCollapse] = useState(true);
  const [decode, setDecode] = useState(true);
  const [altText, setAltText] = useState(false);
  const [linkUrls, setLinkUrls] = useState(false);

  const result = useMemo(() => {
    if (!html.trim()) return null;
    return stripHtml(html, { lineBreaks, collapse, decode, altText, linkUrls });
  }, [html, lineBreaks, collapse, decode, altText, linkUrls]);

  const verbatim = lineBreaks === "source";

  return (
    <div>
      <label className="field">
        <span className="field-label">Your HTML</span>
        <textarea
          className="ta mono"
          rows={9}
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <div className="field-row">
        <Field label="Layout of the text">
          <select
            className="inp"
            value={lineBreaks}
            onChange={(e) => setLineBreaks(e.target.value)}
          >
            <option value="smart">Readable — break where the page breaks</option>
            <option value="none">One single line</option>
            <option value="source">Leave every other byte exactly as it is</option>
          </select>
        </Field>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={decode}
          onChange={(e) => setDecode(e.target.checked)}
        />
        <span>Decode character references (&amp;amp; &rarr; &amp;, &amp;#8217; &rarr; &rsquo;)</span>
      </label>
      {!verbatim && (
        <label className="check-row">
          <input
            type="checkbox"
            checked={collapse}
            onChange={(e) => setCollapse(e.target.checked)}
          />
          <span>Collapse runs of whitespace, the way a browser renders them</span>
        </label>
      )}
      <label className="check-row">
        <input
          type="checkbox"
          checked={altText}
          onChange={(e) => setAltText(e.target.checked)}
        />
        <span>Keep image alt text in place of the image</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={linkUrls}
          onChange={(e) => setLinkUrls(e.target.checked)}
        />
        <span>Keep link URLs, written after the link text in brackets</span>
      </label>

      <p className="muted small">
        {verbatim
          ? "Every byte that is not part of a tag is copied through untouched — no line breaks are added or removed and nothing is collapsed, so a templated file keeps its own layout."
          : "Line breaks follow the page, not the source file: a paragraph, heading or list gets a blank line, a <br> or a list item gets one line, table cells are separated by a tab, and text inside <pre> keeps its own spacing. Tags that only ever sat between words — <b>, <span>, <a> — leave nothing behind, so “<b>c</b>at” stays “cat”."}
      </p>
      <p className="muted small">
        Script and style blocks are removed <em>with their contents</em>, which is what a
        find-and-replace on <code>&lt;...&gt;</code> cannot do. Need the markup tidied rather than
        removed? Use the <a href="/dev/html-beautifier">HTML Beautifier</a>, or{" "}
        <a href="/dev/html-entity-encoder">HTML Entity Encoder</a> to go the other way.
      </p>

      {result && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-num">{result.stats.tags.toLocaleString()}</span>
              <span className="stat-label">{result.stats.tags === 1 ? "tag removed" : "tags removed"}</span>
            </div>
            <div className="stat">
              <span className="stat-num">{result.stats.comments.toLocaleString()}</span>
              <span className="stat-label">{result.stats.comments === 1 ? "comment removed" : "comments removed"}</span>
            </div>
            <div className="stat">
              <span className="stat-num">
                {(result.stats.scripts + result.stats.styles).toLocaleString()}
              </span>
              <span className="stat-label">script / style blocks</span>
            </div>
            <div className="stat">
              <span className="stat-num">{result.text.length.toLocaleString()}</span>
              <span className="stat-label">characters out</span>
            </div>
          </div>

          {result.notes.map((n) => (
            <p className="muted small" key={n}>{n}</p>
          ))}

          {!result.text && (
            <p className="muted small">
              Nothing came out &mdash; every part of that input was markup, a comment, or a
              script or style block.
            </p>
          )}
        </>
      )}

      <OutputBox value={result ? result.text : ""} downloadName="text.txt" />
    </div>
  );
}
