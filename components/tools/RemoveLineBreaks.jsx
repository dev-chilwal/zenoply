"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

export default function RemoveLineBreaks() {
  const [input, setInput] = useState("");
  const [replaceWith, setReplaceWith] = useState("space"); // space | nothing
  const [stripExtraSpaces, setStripExtraSpaces] = useState(true);

  const output = useMemo(() => {
    if (!input) return "";
    let out = input.replace(/\r\n?/g, "\n"); // normalize newlines
    out = out.replace(/\n+/g, replaceWith === "space" ? " " : "");
    if (stripExtraSpaces) out = out.replace(/[ \t]{2,}/g, " ").trim();
    return out;
  }, [input, replaceWith, stripExtraSpaces]);

  return (
    <div>
      <label className="field">
        <span className="field-label">Your text</span>
        <textarea
          className="inp"
          rows={6}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste text with line breaks…"
        />
      </label>
      <label className="field">
        <span className="field-label">Replace each line break with</span>
        <select className="inp" value={replaceWith} onChange={(e) => setReplaceWith(e.target.value)}>
          <option value="space">A space</option>
          <option value="nothing">Nothing (join directly)</option>
        </select>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={stripExtraSpaces} onChange={(e) => setStripExtraSpaces(e.target.checked)} />
        <span>Collapse extra spaces</span>
      </label>
      <OutputBox value={output} mono={false} />
    </div>
  );
}
