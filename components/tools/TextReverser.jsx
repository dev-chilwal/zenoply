"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// Reverse the order of characters in each line, preserving line breaks.
function reverseCharacters(text) {
  return text
    .split("\n")
    .map((line) => Array.from(line).reverse().join(""))
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
      <div className="btn-row">
        {Object.entries(modes).map(([key, { label }]) => (
          <button
            key={key}
            className={"btn" + (mode === key ? "" : " btn-ghost")}
            onClick={() => setMode(key)}
          >
            {label}
          </button>
        ))}
      </div>
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
