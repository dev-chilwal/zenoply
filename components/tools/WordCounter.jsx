"use client";
import { useState, useMemo } from "react";

export default function WordCounter() {
  const [text, setText] = useState("");
  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed ? (trimmed.match(/[.!?]+(\s|$)/g) || []).length || 1 : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter(Boolean).length : 0;
    return { words, chars, charsNoSpaces, sentences, paragraphs };
  }, [text]);

  return (
    <div>
      <label className="field-label" htmlFor="wc-input">Your text</label>
      <textarea
        id="wc-input"
        className="ta"
        rows={8}
        placeholder="Type or paste your text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="stat-grid">
        <Stat label="Words" value={stats.words} />
        <Stat label="Characters" value={stats.chars} />
        <Stat label="No spaces" value={stats.charsNoSpaces} />
        <Stat label="Sentences" value={stats.sentences} />
        <Stat label="Paragraphs" value={stats.paragraphs} />
      </div>
    </div>
  );
}
function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-num">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
