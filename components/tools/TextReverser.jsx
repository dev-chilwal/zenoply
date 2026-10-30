"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented } from "@/components/calc/Calc";

// Split into user-perceived characters (grapheme clusters), so a flag, a
// ZWJ emoji family or a letter + combining accent reverses as one unit
// rather than as its code points (🇮🇳 would otherwise become 🇳🇮).
const segmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;
const graphemes = (line) =>
  segmenter ? Array.from(segmenter.segment(line), (s) => s.segment) : Array.from(line);

// Reverse the order of characters in each line, preserving line breaks.
function reverseCharacters(text) {
  return text
    .split("\n")
    .map((line) => graphemes(line).reverse().join(""))
    .join("\n");
}

// Reverse the order of words within each line, preserving line breaks.
function reverseWords(text) {
  return text
    .split("\n")
    .map((line) => line.split(/(\s+)/).reverse().join(""))
    .join("\n");
}

// Reverse the order of lines in the text.
function reverseLines(text) {
  return text.split("\n").reverse().join("\n");
}

const modes = {
  characters: { label: "Characters", fn: reverseCharacters },
  words: { label: "Words", fn: reverseWords },
  lines: { label: "Lines", fn: reverseLines },
};

export default function TextReverser() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState("characters");

  const output = useMemo(() => {
    if (!text) return "";
    return modes[mode].fn(text);
  }, [text, mode]);

  return (
    <div>
      <Segmented ariaLabel="Reverse mode" value={mode} onChange={setMode}
        options={Object.entries(modes).map(([key, { label }]) => ({ value: key, label }))} />
      <label className="field">
        <span className="field-label">Text to reverse</span>
        <textarea
          className="inp"
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to reverse…"
        />
      </label>
      <OutputBox value={output} mono={false} />
    </div>
  );
}
