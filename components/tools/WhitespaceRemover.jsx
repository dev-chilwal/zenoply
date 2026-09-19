"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Field } from "@/components/calc/Calc";
import { cleanWhitespace } from "@/components/tools/whitespace";

// The character tables and the cleaning order live in whitespace.js so they can
// be exercised in node; this file is only the form around them.

const SAMPLE = "The  quick   brown fox\n\n\n   jumps over  the lazy dog.  ";

export default function WhitespaceRemover() {
  const [text, setText] = useState("");
  const [collapse, setCollapse] = useState("single");
  const [blankLines, setBlankLines] = useState("collapse");
  const [trimLines, setTrimLines] = useState(true);
  const [normalizeSpaces, setNormalizeSpaces] = useState(true);
  const [removeInvisibles, setRemoveInvisibles] = useState(true);
  const [removeJoiners, setRemoveJoiners] = useState(false);

  const { text: result, findings, stats } = useMemo(() => {
    if (!text) return { text: "", findings: [], stats: null };
    return cleanWhitespace(text, {
      collapse, blankLines, trimLines, normalizeSpaces, removeInvisibles, removeJoiners,
    });
  }, [text, collapse, blankLines, trimLines, normalizeSpaces, removeInvisibles, removeJoiners]);

  return (
    <div>
      <label className="field">
        <span className="field-label">Your text</span>
        <textarea
          className="ta mono"
          rows={9}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <div className="field-row">
        <Field label="Extra spaces and tabs">
          <select className="inp" value={collapse} onChange={(e) => setCollapse(e.target.value)}>
            <option value="single">Collapse to one space</option>
            <option value="none">Remove all spaces</option>
            <option value="keep">Leave alone</option>
          </select>
        </Field>
        <Field label="Blank lines">
          <select className="inp" value={blankLines} onChange={(e) => setBlankLines(e.target.value)}>
            <option value="collapse">Collapse to one</option>
            <option value="remove">Remove all</option>
            <option value="keep">Leave alone</option>
          </select>
        </Field>
      </div>

      <label className="check-row">
        <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} />
        <span>Trim spaces at the start and end of each line</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={normalizeSpaces} onChange={(e) => setNormalizeSpaces(e.target.checked)} />
        <span>Convert no-break and other exotic spaces to a normal space</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={removeInvisibles} onChange={(e) => setRemoveInvisibles(e.target.checked)} />
        <span>Delete zero-width and invisible characters</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={removeJoiners} onChange={(e) => setRemoveJoiners(e.target.checked)} />
        <span>
          Also delete zero-width joiners (ZWJ/ZWNJ) &mdash; breaks emoji and Hindi, Arabic
          and Persian text
        </span>
      </label>

      <p className="muted small">
        Line breaks are always normalised so every option below works per line; a Windows or old
        Mac ending becomes a single newline. Nothing but whitespace is ever changed &mdash; your
        words, punctuation and capitalisation are copied through exactly. Need to join the lines
        into one paragraph instead? Use{" "}
        <a href="/text/remove-line-breaks">Remove Line Breaks</a>.
      </p>

      {stats && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-num">{stats.removed.toLocaleString()}</span>
              <span className="stat-label">characters removed</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.runsCollapsed.toLocaleString()}</span>
              <span className="stat-label">gaps fixed</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.blankRemoved.toLocaleString()}</span>
              <span className="stat-label">blank lines removed</span>
            </div>
            <div className="stat">
              <span className="stat-num">{stats.lines.toLocaleString()}</span>
              <span className="stat-label">{stats.lines === 1 ? "line out" : "lines out"}</span>
            </div>
          </div>

          {findings.length > 0 ? (
            <>
              <p className="muted small" style={{ marginTop: "1rem" }}>
                Whitespace and hidden characters found in your text:
              </p>
              <div className="result-list">
                {findings.map((f) => (
                  <div className="result-row" key={f.name}>
                    <span className="result-label">{f.count.toLocaleString()}</span>
                    <span className="result-val">{f.name}</span>
                    <span className="muted small">{f.removed ? "removed" : "kept"}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="muted small" style={{ marginTop: "1rem" }}>
              No tabs, exotic spaces or hidden characters found &mdash; every gap in your text is an
              ordinary space.
            </p>
          )}
        </>
      )}

      <OutputBox value={result} downloadName="cleaned.txt" />
    </div>
  );
}
