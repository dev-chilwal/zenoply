"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  SCOPES,
  FORMS,
  CONTEXTS,
  encodeEntities,
  decodeEntities,
  searchEntities,
} from "@/components/tools/htmlEntities";

// Every rule lives in htmlEntities.js so it can be run in node and diffed
// against a real HTML5 parser; this file is only the form around it.

const DIRECTIONS = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
];

const SAMPLE_ENCODE = '<a href="/search?q=tea&sort=new">Tom & Jerry’s café — 5 < 6</a>';
const SAMPLE_DECODE = "Tom &amp; Jerry&rsquo;s caf&eacute; &mdash; 5 &lt; 6 &#8212; &copy;2026";

// Only the first rows are rendered until someone searches: the table has 253
// names, and a 253-row list nobody asked for is not a reference, it is noise.
const PREVIEW_ROWS = 24;

export default function HtmlEntityEncoder() {
  const [input, setInput] = useState("");
  const [dir, setDir] = useState("encode");
  const [scope, setScope] = useState("markup");
  const [form, setForm] = useState("named");
  const [context, setContext] = useState("text");
  const [repeat, setRepeat] = useState(false);
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);

  const encoding = dir === "encode";

  const result = useMemo(() => {
    if (!input) return { text: "", notes: [] };
    return encoding
      ? encodeEntities(input, { scope, form })
      : decodeEntities(input, { context, repeat });
  }, [input, encoding, scope, form, context, repeat]);

  const matches = useMemo(() => searchEntities(query), [query]);
  const rows = query || showAll ? matches : matches.slice(0, PREVIEW_ROWS);

  return (
    <div>
      <Segmented options={DIRECTIONS} value={dir} onChange={setDir} ariaLabel="Direction" />

      <label className="field">
        <span className="field-label">
          {encoding ? "Text to encode" : "HTML to decode"}
        </span>
        <textarea
          className="ta mono"
          rows={7}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={encoding ? SAMPLE_ENCODE : SAMPLE_DECODE}
          spellCheck={false}
        />
      </label>

      {encoding ? (
        <>
          <div className="field-row">
            <Field label="What to convert">
              <select className="inp" value={scope} onChange={(e) => setScope(e.target.value)}>
                {SCOPES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Field>
            {scope === "nonascii" && (
              <Field label="Preferred form">
                <select className="inp" value={form} onChange={(e) => setForm(e.target.value)}>
                  {FORMS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>
          <p className="muted small">
            {scope === "markup"
              ? "Encodes only & < > \" and ', which is everything a browser needs to read your text as text rather than as markup. Save the file as UTF-8 and an accent or an emoji can stay exactly as it is."
              : "Encodes the five markup characters plus every code point above plain ASCII, so the output is pure 7-bit and survives a pipeline that mangles UTF-8 — an old CMS field, an email template, a database column with the wrong collation."}
          </p>
        </>
      ) : (
        <>
          <div className="field-row">
            <Field label="Where this text came from">
              <select className="inp" value={context} onChange={(e) => setContext(e.target.value)}>
                {CONTEXTS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <label className="check-row">
            <input
              type="checkbox"
              checked={repeat}
              onChange={(e) => setRepeat(e.target.checked)}
            />
            <span>Keep decoding until nothing changes (fixes double-encoded text)</span>
          </label>
          <p className="muted small">
            {context === "text"
              ? "Element text: the 106 legacy names may drop their closing semicolon, so &copy is read as © here."
              : "Attribute value: a semicolon-less name followed by = or a letter is not a reference at all, which is why ?a=1&copy=2 survives inside an href."}
          </p>
        </>
      )}

      {result.notes.map((n) => (
        <p className="muted small" key={n}>{n}</p>
      ))}
      <OutputBox value={result.text} />

      <h2 style={{ marginTop: "2.25rem" }}>Entity reference</h2>
      <p className="muted small">
        All 253 names HTML 4.01 and XHTML define, which is the set every browser and every XML
        parser has understood since 1999. Search by name, by character, or by number.
      </p>
      <label className="field">
        <span className="field-label">Search</span>
        <input
          className="inp"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="arrow, &mdash;, ©, 8212"
          spellCheck={false}
        />
      </label>

      {rows.length === 0 ? (
        <p className="muted small">
          No entity matches that. Only the HTML 4.01 set is listed here — HTML5 adds about 2,000
          more names, most of them MathML aliases and alternate spellings of these.
        </p>
      ) : (
        <div className="tbl-wrap">
          <table className="tbl-preview" style={{ width: "100%" }}>
            <tbody>
              <tr>
                <td>Char</td>
                <td>Name</td>
                <td>Decimal</td>
                <td>Hex</td>
                <td style={{ whiteSpace: "normal" }}>Description</td>
              </tr>
              {rows.map((r) => (
                <tr key={r.name}>
                  <td style={{ fontSize: "1.05rem" }}>{r.cp === 0xa0 || r.cp === 0xad ? "·" : r.char}</td>
                  <td className="mono">&amp;{r.name};</td>
                  <td className="mono">{r.dec}</td>
                  <td className="mono">{r.hex}</td>
                  <td style={{ whiteSpace: "normal" }}>{r.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!query && !showAll && matches.length > PREVIEW_ROWS && (
        <p className="muted small">
          <button className="btn-sm" onClick={() => setShowAll(true)}>
            Show all {matches.length}
          </button>
        </p>
      )}
    </div>
  );
}
