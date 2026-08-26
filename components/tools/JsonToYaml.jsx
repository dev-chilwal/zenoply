"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { jsonToYaml } from "@/components/tools/jsonYaml";

// The conversion itself lives in jsonYaml.js so it can be exercised in node
// against a real YAML loader; this file is only the form around it.

export default function JsonToYaml() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    if (!input.trim()) return { value: "", error: "", duplicates: 0 };
    try {
      const { yaml, duplicates } = jsonToYaml(input, { indent });
      return { value: yaml, error: "", duplicates };
    } catch (e) {
      return { value: "", error: e.message || "Could not parse that JSON.", duplicates: 0 };
    }
  }, [input, indent]);

  return (
    <div>
      <label className="field">
        <span className="field-label">JSON to convert</span>
        <textarea
          className="ta mono"
          rows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={'{\n  "name": "web-server",\n  "port": 8080,\n  "enabled": true,\n  "tags": ["production", "critical"]\n}'}
        />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Indentation</span>
          <select className="inp" value={indent} onChange={(e) => setIndent(Number(e.target.value))}>
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
      </div>

      <p className="muted small">
        Numbers keep their exact digits, so long IDs and versions like 1.50 are not rounded or
        trimmed. Values that YAML would otherwise read as something else — NO, yes, off, 017,
        1:30, a date — are quoted so they stay strings, and multi-line text is written as a block
        scalar.
      </p>

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          {result.duplicates > 0 && (
            <p className="muted small">
              {result.duplicates === 1
                ? "One duplicate key was found; its last value was kept, which is what a JSON parser does."
                : `${result.duplicates} duplicate keys were found; the last value of each was kept, which is what a JSON parser does.`}
            </p>
          )}
          <OutputBox value={result.value} downloadName="data.yaml" mimeType="text/yaml" />
        </>
      )}
    </div>
  );
}
