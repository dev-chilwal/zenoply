"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  FORMATS,
  canUnescape,
  csvDelimiter,
  escapeText,
  unescapeText,
} from "@/components/tools/escapeString";

// Every escaping rule lives in escapeString.js so it can be run in node against
// the real consumer of each format (JSON.parse, the JS lexer, python's csv and
// html modules, expat, sqlite3, bash); this file is only the form around them.

const DIRECTIONS = [
  { value: "escape", label: "Escape" },
  { value: "unescape", label: "Unescape" },
];

const DELIMS = [
  { value: "comma", label: "Comma  ,", ch: "," },
  { value: "semicolon", label: "Semicolon  ;", ch: ";" },
  { value: "tab", label: "Tab", ch: "\t" },
  { value: "pipe", label: "Pipe  |", ch: "|" },
];

// One line per format saying exactly which position the output is valid in,
// because "escaped" on its own never means anything.
const BLURB = {
  json: "Produces the inside of a JSON string, ready to sit between a pair of double quotes.",
  js: "Produces the inside of a JavaScript or TypeScript string literal, for the quote style you pick.",
  html: "Produces HTML that is safe as element text and inside a quoted attribute value. It does not make text safe inside a <script> or <style> block, or in a URL attribute.",
  xml: "Produces XML character data using the five predefined entities. Pick attribute value if it is going inside quotes.",
  csv: "Produces one RFC 4180 field, quoted only when a CSV reader would otherwise misread it.",
  sql: "Produces the inside of a SQL string literal. Use a parameterised query instead wherever you can — see the note below.",
  regex: "Produces a pattern that matches your text literally, with every character that has a special meaning escaped.",
  shell: "Produces a single argument for a POSIX shell — sh, bash or zsh.",
};

const SAMPLE = {
  json: 'He said "hello"\nand left.',
  js: "It's a `template` with ${interpolation}",
  html: '<a href="/x?a=1&b=2">Tom & Jerry</a>',
  xml: "Tom & Jerry's <best> bits",
  csv: 'Smith, John\t"Manager"',
  sql: "O'Brien",
  regex: "price: $9.99 (50% off)",
  shell: "my file's name.txt",
};

export default function StringEscaper() {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState("json");
  const [dir, setDir] = useState("escape");

  const [asciiOnly, setAsciiOnly] = useState(false);
  const [escapeSlash, setEscapeSlash] = useState(false);
  const [embedSafe, setEmbedSafe] = useState(false);
  const [quote, setQuote] = useState("double");
  const [wrap, setWrap] = useState(false);
  const [scriptSafe, setScriptSafe] = useState(false);
  const [escapeNonAscii, setEscapeNonAscii] = useState(false);
  const [xmlContext, setXmlContext] = useState("text");
  const [dropIllegal, setDropIllegal] = useState(false);
  const [delim, setDelim] = useState("comma");
  const [perLine, setPerLine] = useState(false);
  const [quoteAlways, setQuoteAlways] = useState(false);
  const [guardFormulas, setGuardFormulas] = useState(true);
  const [dialect, setDialect] = useState("standard");
  const [shellStyle, setShellStyle] = useState("single");

  const reversible = canUnescape(format);

  // Switching to a format that cannot be reversed would otherwise leave the
  // Unescape tab selected with nothing behind it.
  const changeFormat = (value) => {
    setFormat(value);
    if (!canUnescape(value)) setDir("escape");
  };

  const opts = useMemo(
    () => ({
      asciiOnly,
      escapeSlash,
      embedSafe,
      quote,
      wrap,
      scriptSafe,
      escapeNonAscii,
      context: xmlContext,
      dropIllegal,
      delimiter: csvDelimiter(delim),
      perLine,
      quoteAlways,
      guardFormulas,
      dialect,
      style: shellStyle,
    }),
    [asciiOnly, escapeSlash, embedSafe, quote, wrap, scriptSafe, escapeNonAscii,
     xmlContext, dropIllegal, delim, perLine, quoteAlways, guardFormulas,
     dialect, shellStyle]
  );

  const result = useMemo(() => {
    if (!input) return { text: "", notes: [], error: "" };
    try {
      const r = dir === "escape"
        ? escapeText(input, format, opts)
        : unescapeText(input, format, opts);
      return { text: r.text, notes: r.notes || [], error: "" };
    } catch (e) {
      return { text: "", notes: [], error: e.message || "That input could not be read." };
    }
  }, [input, format, dir, opts]);

  const check = (label, value, onChange, key) => (
    <label className="check-row" key={key}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );

  const escaping = dir === "escape";

  return (
    <div>
      <div className="field-row">
        <Field label="Target format">
          <select className="inp" value={format} onChange={(e) => changeFormat(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>
      </div>

      {reversible ? (
        <Segmented options={DIRECTIONS} value={dir} onChange={setDir} ariaLabel="Direction" />
      ) : (
        <p className="muted small">
          {format === "regex"
            ? "Escape only. A regular expression cannot be reliably unescaped — \\d, \\b and \\w stand for whole character classes, so there is no way to tell an escaped letter from a metasequence."
            : "Escape only. A shell command cannot be reliably unescaped — the same argument can be quoted several different ways, and undoing it means running the shell's own word-splitting rules."}
        </p>
      )}

      <label className="field">
        <span className="field-label">{escaping ? "Text to escape" : "Escaped text to decode"}</span>
        <textarea
          className="ta mono"
          rows={7}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={escaping ? SAMPLE[format] : ""}
          spellCheck={false}
        />
      </label>

      {escaping && format === "json" && (
        <>
          {check("Escape non-ASCII as \\uXXXX (pure ASCII output)", asciiOnly, setAsciiOnly, "a")}
          {check("Escape / as \\/", escapeSlash, setEscapeSlash, "b")}
          {check("Safe to embed in an HTML page (hides <, > and &)", embedSafe, setEmbedSafe, "c")}
        </>
      )}

      {escaping && format === "js" && (
        <>
          <div className="field-row">
            <Field label="Quote style">
              <select className="inp" value={quote} onChange={(e) => setQuote(e.target.value)}>
                <option value="double">Double quotes &quot; &quot;</option>
                <option value="single">Single quotes &#39; &#39;</option>
                <option value="backtick">Backticks (template literal)</option>
              </select>
            </Field>
          </div>
          {check("Include the surrounding quotes", wrap, setWrap, "d")}
          {check("Escape non-ASCII as \\uXXXX (pure ASCII output)", asciiOnly, setAsciiOnly, "e")}
          {check("Safe inside an inline <script> block", scriptSafe, setScriptSafe, "f")}
        </>
      )}

      {escaping && (format === "html" || format === "xml") && (
        <>
          {format === "xml" && (
            <div className="field-row">
              <Field label="Where it goes">
                <select className="inp" value={xmlContext} onChange={(e) => setXmlContext(e.target.value)}>
                  <option value="text">Element text</option>
                  <option value="attribute">Attribute value</option>
                </select>
              </Field>
            </div>
          )}
          {check("Escape non-ASCII as numeric references", escapeNonAscii, setEscapeNonAscii, "g")}
          {format === "xml" &&
            check("Remove characters XML cannot hold", dropIllegal, setDropIllegal, "h")}
        </>
      )}

      {format === "csv" && (
        <>
          <div className="field-row">
            <Field label="Delimiter">
              <select className="inp" value={delim} onChange={(e) => setDelim(e.target.value)}>
                {DELIMS.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {escaping && (
            <>
              {check("Treat each line as its own field (one-column CSV)", perLine, setPerLine, "i")}
              {check("Quote every field, even when not required", quoteAlways, setQuoteAlways, "j")}
              {check("Guard against spreadsheet formula injection", guardFormulas, setGuardFormulas, "k")}
            </>
          )}
        </>
      )}

      {format === "sql" && (
        <>
          <div className="field-row">
            <Field label="Dialect">
              <select className="inp" value={dialect} onChange={(e) => setDialect(e.target.value)}>
                <option value="standard">Standard SQL (Postgres, SQLite, Oracle, SQL Server)</option>
                <option value="mysql">MySQL / MariaDB (backslash escapes)</option>
              </select>
            </Field>
          </div>
          {escaping && check("Include the surrounding single quotes", wrap, setWrap, "l")}
        </>
      )}

      {escaping && format === "shell" && (
        <div className="field-row">
          <Field label="Quoting style">
            <select className="inp" value={shellStyle} onChange={(e) => setShellStyle(e.target.value)}>
              <option value="single">Single quotes (nothing expands)</option>
              <option value="double">Double quotes (variables still expand)</option>
            </select>
          </Field>
        </div>
      )}

      {escaping && <p className="muted small">{BLURB[format]}</p>}

      {escaping && format === "sql" && (
        <p className="muted small">
          Escaping is not a substitute for a parameterised query. It cannot help at all where the
          value is not inside quotes — a numeric column, a table or column name, an ORDER BY
          direction — and it has to match the exact dialect, character set and server settings you
          are running against. Use a placeholder and let the driver send the value separately
          wherever you possibly can; this tool is for the times you are writing a literal by hand,
          such as a migration or a one-off query.
        </p>
      )}

      {result.error ? (
        <p className="error">{result.error}</p>
      ) : (
        <>
          {result.notes.map((n) => (
            <p className="muted small" key={n}>{n}</p>
          ))}
          <OutputBox value={result.text} />
        </>
      )}
    </div>
  );
}
