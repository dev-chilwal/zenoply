"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented } from "@/components/calc/Calc";

// UTF-8 safe Base64 (handles non-Latin1 characters).
function encode(str) {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return null;
  }
}
function decode(str) {
  try {
    return decodeURIComponent(escape(atob(str.trim())));
  } catch {
    return null;
  }
}

export default function Base64Encoder() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) return { value: "", error: false };
    const res = mode === "encode" ? encode(input) : decode(input);
    return res === null ? { value: "", error: true } : { value: res, error: false };
  }, [input, mode]);

  return (
    <div>
      <Segmented ariaLabel="Mode" value={mode} onChange={setMode}
        options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
      <label className="field">
        <span className="field-label">{mode === "encode" ? "Text to encode" : "Base64 to decode"}</span>
        <textarea
          className="inp mono"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Type or paste text…" : "Paste a Base64 string…"}
        />
      </label>
      {output.error ? (
        <p className="error">That doesn&apos;t look like valid Base64. Check for stray characters or whitespace.</p>
      ) : (
        <OutputBox value={output.value} />
      )}
    </div>
  );
}
