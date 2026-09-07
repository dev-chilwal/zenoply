"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import { jsonToXml } from "@/components/tools/jsonXml";

// The conversion lives in jsonXml.js so it can be exercised in node against
// expat and xmllint, real XML parsers; this file is only the form around it.

const NULL_MODES = [
  { value: "empty", label: "Empty tag" },
  { value: "nil", label: "xsi:nil" },
  { value: "omit", label: "Leave out" },
];

const SAMPLE = `{
  "catalog": {
    "book": [
      { "@id": "bk101", "title": "XML Developer's Guide", "price": "44.95" },
      { "@id": "bk102", "title": "Midnight Rain", "price": "5.95" }
    ]
  }
}`;

export default function JsonToXml() {
  const [input, setInput] = useState("");
  const [attrPrefix, setAttrPrefix] = useState("@");
  const [indent, setIndent] = useState("2");
  const [rootName, setRootName] = useState("root");
  const [itemName, setItemName] = useState("item");
  const [nullMode, setNullMode] = useState("empty");
  const [declaration, setDeclaration] = useState(true);
  const [stripInvalid, setStripInvalid] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { xml: "", error: "", warnings: [], stats: null };
    try {
      const r = jsonToXml(input, {
        attrPrefix,
        textKey: attrPrefix === "" ? "" : "#text",
        indent: Number(indent),
        rootName: rootName.trim() || "root",
        itemName: itemName.trim() || "item",
        nullMode,
        declaration,
        stripInvalid,
      });
      return { xml: r.xml, error: "", warnings: r.warnings, stats: r.stats };
    } catch (e) {
      return { xml: "", error: e.message || "That JSON could not be parsed.", warnings: [], stats: null };
    }
  }, [input, attrPrefix, indent, rootName, itemName, nullMode, declaration, stripInvalid]);

  return (
    <div>
      <label className="field">
        <span className="field-label">JSON to convert</span>
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
        <Field label="Attributes come from">
          <select className="inp" value={attrPrefix} onChange={(e) => setAttrPrefix(e.target.value)}>
            <option value="@">@name keys (recommended)</option>
            <option value="_">_name keys</option>
            <option value="$">$name keys</option>
            <option value="">nothing — every key is an element</option>
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

      <div className="field-row">
        <Field label="Root element name">
          <input
            className="inp"
            value={rootName}
            onChange={(e) => setRootName(e.target.value)}
            spellCheck={false}
          />
        </Field>
        <Field label="Name for unnamed list entries">
          <input
            className="inp"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            spellCheck={false}
          />
        </Field>
      </div>

      <div className="field">
        <span className="field-label">Write null as</span>
        <Segmented
          options={NULL_MODES}
          value={nullMode}
          onChange={setNullMode}
          ariaLabel="How to write a JSON null"
        />
      </div>

      <label className="check-row">
        <input
          type="checkbox"
          checked={declaration}
          onChange={(e) => setDeclaration(e.target.checked)}
        />
        <span>Include the &lt;?xml version=&quot;1.0&quot;?&gt; declaration</span>
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={stripInvalid}
          onChange={(e) => setStripInvalid(e.target.checked)}
        />
        <span>Remove characters XML cannot hold instead of reporting them</span>
      </label>

      <p className="muted small">
        Numbers are written exactly as you typed them, so a price of 1.50 and a 20-digit ID keep
        every character. Keys that are not legal XML names are renamed and the change is listed,
        and anything the mapping cannot carry across is reported rather than dropped quietly.
      </p>

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          {result.stats && (
            <p className="muted small">
              {result.stats.elements}{" "}
              {result.stats.elements === 1 ? "element" : "elements"}
              {result.stats.attributes > 0
                ? `, ${result.stats.attributes} ${result.stats.attributes === 1 ? "attribute" : "attributes"}`
                : ""}
              , nested {result.stats.depth}{" "}
              {result.stats.depth === 1 ? "level" : "levels"} deep.
            </p>
          )}
          {result.warnings.map((w) => (
            <p className="muted small" key={w}>{w}</p>
          ))}
          <OutputBox value={result.xml} downloadName="data.xml" mimeType="application/xml" />
        </>
      )}
    </div>
  );
}
