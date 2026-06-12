"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// Escape regex metacharacters so the search term is treated literally.
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build the search regex from the find term and options.
// Returns null when the term is empty (nothing to search for).
function buildRegex(find, matchCase, wholeWord) {
  if (!find) return null;
  let pattern = escapeRegExp(find);
  if (wholeWord) pattern = "\\b" + pattern + "\\b";
  return new RegExp(pattern, matchCase ? "g" : "gi");
}

export default function FindAndReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);

  const { output, count } = useMemo(() => {
    const re = buildRegex(find, matchCase, wholeWord);
    if (!text || !re) return { output: "", count: 0 };
    const matches = text.match(re);
    if (!matches) return { output: text, count: 0 };
    // Escape "$" so replacement patterns like "$&" are treated literally.
    const literal = replace.replace(/\$/g, "$$$$");
    return { output: text.replace(re, literal), count: matches.length };
  }, [text, find, replace, matchCase, wholeWord]);

  return (
    <div>
      <label className="field">
        <span className="field-label">Your text</span>
        <textarea
          className="inp"
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the text you want to search..."
        />
      </label>
      <label className="field">
        <span className="field-label">Find</span>
        <input
          className="inp"
          value={find}
          onChange={(e) => setFind(e.target.value)}
          placeholder="Text to find"
        />
      </label>
      <label className="field">
        <span className="field-label">Replace with</span>
        <input
          className="inp"
          value={replace}
          onChange={(e) => setReplace(e.target.value)}
          placeholder="Replacement text (leave empty to delete)"
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} />
        <span>Match case</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={wholeWord} onChange={(e) => setWholeWord(e.target.checked)} />
        <span>Whole words only</span>
      </label>
      {text && find ? (
        <p className="muted small">
          {count === 0
            ? "No matches found."
            : count + (count === 1 ? " match replaced." : " matches replaced.")}
        </p>
      ) : (
        <p className="muted small">Enter text and a search term to see the result.</p>
      )}
      <OutputBox value={output} downloadName="replaced.txt" mono={false} />
    </div>
  );
}
