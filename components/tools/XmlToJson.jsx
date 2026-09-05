"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import { xmlToJson } from "@/components/tools/xmlJson";

// The conversion lives in xmlJson.js so it can be exercised in node against
// expat, a real XML parser; this file is only the form around it.

const ARRAY_MODES = [
  { value: "repeated", label: "Repeated only" },
  { value: "all", label: "Always arrays" },
];

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <price currency="USD">44.95</price>
  </book>
</catalog>`;

export default function XmlToJson() {
  const [input, setInput] = useState("");
  const [attrPrefix, setAttrPrefix] = useState("@");
  const [arrays, setArrays] = useState("repeated");
  const [indent, setIndent] = useState("2");
  const [coerceTypes, setCoerceTypes] = useState(false);
  const [stripNamespaces, setStripNamespaces] = useState(false);
  const [trimText, setTrimText] = useState(true);

  const result = useMemo(() => {
    if (!input.trim()) return { json: "", error: "", warnings: [], stats: null };
    try {
      const r = xmlToJson(input, {
        attrPrefix,
        arrays,
        coerceTypes,
        stripNamespaces,
        trimText,
        indent: Number(indent),
      });
      return { json: r.json, error: "", warnings: r.warnings, stats: r.stats };
    } catch (e) {
      return {
        json: "",
        error: e.message || "That XML could not be parsed.",
        warnings: [],
        stats: null,
      };
    }
  }, [input, attrPrefix, arrays, indent, coerceTypes, stripNamespaces, trimText]);

  return (
    <div>
      <label className="field">
        <span className="field-label">XML to convert</span>
        <textarea
          className="ta mono"
          rows={9}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={SAMPLE}
          spellCheck={false}
        />
      </label>

      <div className="field-row">
        <Field label="Attributes become">
          <select className="inp" value={attrPrefix} onChange={(e) => setAttrPrefix(e.target.value)}>
            <option value="@">@name (recommended)</option>
            <option value="_">_name</option>
            <option value="$">$name</option>
            <option value="">name (no prefix)</option>
          </select>
        </Field>
        <Field label="Indentation">
          <select className="inp" value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="0">Minified</option>
          </select>
        </Field>
      </div>

      <div className="field">
        <span className="field-label">Arrays</span>
        <Segmented
          options={ARRAY_MODES}
          value={arrays}
          onChange={setArrays}
          ariaLabel="When to use arrays"
        />
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={stripNamespaces}
          onChange={(e) => setStripNamespaces(e.target.checked)}
        />
        <span>Remove namespace prefixes (soap:Body becomes Body)</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={coerceTypes}
          onChange={(e) => setCoerceTypes(e.target.checked)}
        />
        <span>Convert numbers and true/false instead of keeping every value as text</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={trimText}
          onChange={(e) => setTrimText(e.target.checked)}
        />
        <span>Trim spaces and line breaks around text values</span>
      </label>

      <p className="muted small">
        Every value stays a string unless you ask for conversion, and even then a number is only
        written when its digits come back identical — so 007, 1.50 and a 20-digit ID keep every
        character. Entities such as &amp;amp; and &amp;#233; are decoded, because JSON has no way to
        write them.
      </p>

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          {result.stats && (
            <p className="muted small">
              Well-formed XML — {result.stats.elements}{" "}
              {result.stats.elements === 1 ? "element" : "elements"}, nested{" "}
              {result.stats.depth} {result.stats.depth === 1 ? "level" : "levels"} deep
              {result.stats.arrays > 0
                ? `, ${result.stats.arrays} ${result.stats.arrays === 1 ? "key" : "keys"} written as an array`
                : ""}
              .
            </p>
          )}
          {result.warnings.map((w) => (
            <p className="muted small" key={w}>{w}</p>
          ))}
          <OutputBox value={result.json} downloadName="data.json" mimeType="application/json" />
        </>
      )}
    </div>
  );
}
