"use client";
import { useState } from "react";
import OutputBox from "@/components/OutputBox";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const format = (indent) => {
    setError("");
    if (!input.trim()) { setOutput(""); return; }
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
    } catch (e) {
      setOutput("");
      setError(e.message);
    }
  };

  return (
    <div>
      <label className="field-label" htmlFor="json-input">JSON input</label>
      <textarea
        id="json-input"
        className="ta mono"
        rows={7}
        placeholder='Paste JSON here, e.g. {"name":"zenoply","tools":12}'
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className="btn-row">
        <button className="btn" onClick={() => format(2)}>Beautify (2 spaces)</button>
        <button className="btn" onClick={() => format(4)}>Beautify (4 spaces)</button>
        <button className="btn" onClick={() => format(0)}>Minify</button>
      </div>
      {error && <p className="error">Invalid JSON: {error}</p>}
      <OutputBox value={output} downloadName="formatted.json" mimeType="application/json" />
    </div>
  );
}
