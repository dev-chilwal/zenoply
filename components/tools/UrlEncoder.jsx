"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented } from "@/components/calc/Calc";

// Percent-encode / decode. "Component" mode escapes reserved chars (for query
// values); "Full URL" mode keeps the URL structure intact.
function encode(str, full) {
  try {
    return full ? encodeURI(str) : encodeURIComponent(str);
  } catch {
    return null;
  }
}
function decode(str, full) {
  try {
    return full ? decodeURI(str) : decodeURIComponent(str);
  } catch {
    return null;
  }
}

export default function UrlEncoder() {
  const [mode, setMode] = useState("encode");
  const [full, setFull] = useState(false);
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    if (!input) return { value: "", error: false };
    const res = mode === "encode" ? encode(input, full) : decode(input, full);
    return res === null ? { value: "", error: true } : { value: res, error: false };
  }, [input, mode, full]);

  return (
    <div>
      <Segmented ariaLabel="Mode" value={mode} onChange={setMode}
        options={[{ value: "encode", label: "Encode" }, { value: "decode", label: "Decode" }]} />
      <label className="field">
        <span className="field-label">{mode === "encode" ? "Text or URL to encode" : "Encoded text to decode"}</span>
        <textarea
          className="inp mono"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === "encode" ? "Type or paste text…" : "Paste a percent-encoded string…"}
        />
      </label>
      <label className="check-row">
        <input type="checkbox" checked={full} onChange={(e) => setFull(e.target.checked)} />
        <span>Treat as a full URL (keep / : ? &amp; # intact)</span>
      </label>
      {output.error ? (
        <p className="error">That string can&apos;t be decoded. Check for stray or incomplete % sequences.</p>
      ) : (
        <OutputBox value={output.value} />
      )}
    </div>
  );
}
