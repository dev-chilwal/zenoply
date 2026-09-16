"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import { jsonToTypeScript } from "@/components/tools/jsonTypes";

// The generation lives in jsonTypes.js so it can be exercised in node against
// the real TypeScript compiler; this file is only the form around it.

const DECLARATIONS = [
  { value: "interface", label: "interface" },
  { value: "type", label: "type" },
];

const UNKNOWNS = [
  { value: "unknown", label: "unknown" },
  { value: "any", label: "any" },
];

const SAMPLE = `[
  { "id": 7, "name": "Ada", "email": "ada@example.com", "team": "core" },
  { "id": 8, "name": "Lin", "email": null, "team": "core" },
  { "id": 9, "name": "Ravi", "team": "growth", "admin": true }
]`;

export default function JsonToTypescript() {
  const [input, setInput] = useState("");
  const [rootName, setRootName] = useState("Root");
  const [declaration, setDeclaration] = useState("interface");
  const [unknownWord, setUnknownWord] = useState("unknown");
  const [indent, setIndent] = useState("2");
  const [exportDecls, setExportDecls] = useState(true);
  const [readonly, setReadonly] = useState(false);
  const [literalUnions, setLiteralUnions] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { code: "", error: "", warnings: [], stats: null };
    try {
      const r = jsonToTypeScript(input, {
        rootName: rootName.trim() || "Root",
        declaration,
        unknownWord,
        exportDecls,
        readonly,
        literalUnions,
        indent: Number(indent),
      });
      return { code: r.code, error: "", warnings: r.warnings, stats: r.stats };
    } catch (e) {
      return {
        code: "",
        error: e.message || "That JSON could not be parsed.",
        warnings: [],
        stats: null,
      };
    }
  }, [input, rootName, declaration, unknownWord, indent, exportDecls, readonly, literalUnions]);

  const s = result.stats;

  return (
    <div>
      <label className="field">
        <span className="field-label">JSON to convert</span>
        <textarea
          className="ta mono"
          rows={10}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <div className="field-row">
        <Field label="Root type name">
          <input
            className="inp"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            placeholder="Root"
            spellCheck={false}
          />
        </Field>
        <Field label="Indentation">
          <select className="inp" value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
          </select>
        </Field>
      </div>

      <div className="field-row">
        <div className="field">
          <span className="field-label">Declare as</span>
          <Segmented
            options={DECLARATIONS}
            value={declaration}
            onChange={setDeclaration}
            ariaLabel="Declaration keyword"
          />
        </div>
        <div className="field">
          <span className="field-label">Unknown values</span>
          <Segmented
            options={UNKNOWNS}
            value={unknownWord}
            onChange={setUnknownWord}
            ariaLabel="Type used where nothing could be inferred"
          />
        </div>
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={exportDecls}
          onChange={(e) => setExportDecls(e.target.checked)}
        />
        <span>Export the declarations</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={readonly}
          onChange={(e) => setReadonly(e.target.checked)}
        />
        <span>Mark every property readonly</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={literalUnions}
          onChange={(e) => setLiteralUnions(e.target.checked)}
        />
        <span>
          Infer string literal unions (only where a field repeats a small set of values across at
          least three records &mdash; otherwise it stays string)
        </span>
      </label>

      <p className="muted small">
        Every element of an array is read, not just the first, so a field missing from some records
        becomes optional and a field holding null becomes nullable &mdash; two different facts, kept
        apart. Paste several records rather than one: a single sample cannot show which fields are
        optional.
      </p>

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          {s && (
            <p className="muted small">
              {s.interfaces} {s.interfaces === 1 ? "type" : "types"}
              {s.records > 0
                ? `, best-sampled shape seen in ${s.records} ${s.records === 1 ? "record" : "records"}`
                : ""}
              {s.optional > 0
                ? `, ${s.optional} optional ${s.optional === 1 ? "field" : "fields"}`
                : ""}
              {s.nullable > 0
                ? `, ${s.nullable} nullable ${s.nullable === 1 ? "field" : "fields"}`
                : ""}
              .
            </p>
          )}
          {result.warnings.map((w) => (
            <p className="muted small" key={w}>{w}</p>
          ))}
          <OutputBox value={result.code} downloadName="types.ts" mimeType="text/plain" />
        </>
      )}
    </div>
  );
}
