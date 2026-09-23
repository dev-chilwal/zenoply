"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  FORMATS,
  SEPARATORS,
  charLabel,
  codePointLabel,
  decodeBytes,
  encodeText,
  formatByte,
  parseBytes,
} from "@/components/tools/textBinary";

// All of the encoding lives in textBinary.js, where it is checked against
// Python's UTF-8 encoder and the browser's own strict decoder; this file is only
// the form around it.

const BREAKDOWN_LIMIT = 200;

const PLACEHOLDER = {
  binary: "01001000 01101001",
  hex: "48 69",
  decimal: "72 105",
};

export default function TextToBinary() {
  const [mode, setMode] = useState("encode"); // encode | decode
  const [format, setFormat] = useState("binary");
  const [separator, setSeparator] = useState("space");
  const [text, setText] = useState("Hi 👋");
  const [digits, setDigits] = useState("");

  const fmtLabel = FORMATS.find((f) => f.id === format).label.toLowerCase();
  // Decimal byte values have no fixed width, so run together they cannot be
  // split back apart; the no-separator option is not offered for them.
  const sep = format === "decimal" && separator === "none" ? "space" : separator;

  const encoded = useMemo(
    () => (mode === "encode" ? encodeText(text, { format, separator: sep }) : null),
    [mode, text, format, sep]
  );

  const decoded = useMemo(() => {
    if (mode !== "decode") return null;
    const parsed = parseBytes(digits, format);
    if (!parsed.ok) return parsed;
    return { ...parsed, ...decodeBytes(parsed.bytes) };
  }, [mode, digits, format]);

  const switchMode = (m) => {
    // Carry the result across, so flipping direction checks the round trip.
    if (m === "decode" && encoded?.output) setDigits(encoded.output);
    if (m === "encode" && decoded?.ok) setText(decoded.text);
    setMode(m);
  };

  return (
    <div>
      <Segmented
        ariaLabel="Conversion direction"
        value={mode}
        onChange={switchMode}
        options={[
          { value: "encode", label: "Text → Binary" },
          { value: "decode", label: "Binary → Text" },
        ]}
      />

      <div className="field-row">
        <Field label={mode === "encode" ? "Write bytes as" : "Input is"}>
          <select className="inp" value={format} onChange={(e) => setFormat(e.target.value)}>
            {FORMATS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </Field>
        {mode === "encode" && (
          <Field label="Between bytes">
            <select className="inp" value={sep} onChange={(e) => setSeparator(e.target.value)}>
              {SEPARATORS.filter((s) => !(format === "decimal" && s.id === "none")).map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </Field>
        )}
      </div>

      {mode === "encode" ? (
        <>
          <label className="field">
            <span className="field-label">Text</span>
            <textarea
              className="ta"
              rows={5}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text"
              spellCheck={false}
            />
          </label>

          {encoded.charCount > 0 && (
            <div className="stat-grid">
              <div className="stat">
                <span className="stat-num">{encoded.charCount.toLocaleString()}</span>
                <span className="stat-label">{encoded.charCount === 1 ? "character" : "characters"}</span>
              </div>
              <div className="stat">
                <span className="stat-num">{encoded.byteCount.toLocaleString()}</span>
                <span className="stat-label">{encoded.byteCount === 1 ? "byte" : "bytes"}</span>
              </div>
              <div className="stat">
                <span className="stat-num">{(encoded.byteCount * 8).toLocaleString()}</span>
                <span className="stat-label">bits</span>
              </div>
            </div>
          )}

          <OutputBox value={encoded.output} downloadName={`text-${format}.txt`} />

          {encoded.multiByte > 0 && (
            <p className="muted small">
              {encoded.multiByte.toLocaleString()}{" "}
              {encoded.multiByte === 1 ? "character takes" : "characters take"} more than one byte.
              That is UTF-8 working as intended: only the 128 ASCII characters fit in a single
              byte, so an accented letter takes two, most Indian scripts three, and an emoji four.
              A converter that gives one 8-bit group for &ldquo;é&rdquo; is writing its Latin-1
              value, which will not decode back to é anywhere that expects UTF-8.
            </p>
          )}
          {encoded.loneSurrogates > 0 && (
            <p className="error">
              The text holds {encoded.loneSurrogates} broken half of an emoji (a lone surrogate),
              which has no UTF-8 form; it is written as the replacement character U+FFFD.
            </p>
          )}

          {encoded.charCount > 0 && (
            <>
              <p className="field-label" style={{ marginTop: "1.4rem" }}>
                Character by character
              </p>
              <div className="result-list">
                {encoded.chars.slice(0, BREAKDOWN_LIMIT).map((c, i) => (
                  <div className="result-row" key={i}>
                    <span className="result-label">
                      {charLabel(c.ch)} <span className="muted small mono">{codePointLabel(c.cp)}</span>
                    </span>
                    <span className="result-val mono">
                      {c.bytes.map((b) => formatByte(b, format)).join(" ")}
                    </span>
                  </div>
                ))}
              </div>
              {encoded.charCount > BREAKDOWN_LIMIT && (
                <p className="muted small">
                  Showing the first {BREAKDOWN_LIMIT} characters; the output above holds all{" "}
                  {encoded.charCount.toLocaleString()}.
                </p>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <label className="field">
            <span className="field-label">{FORMATS.find((f) => f.id === format).label} bytes</span>
            <textarea
              className="ta mono"
              rows={5}
              value={digits}
              onChange={(e) => setDigits(e.target.value)}
              placeholder={PLACEHOLDER[format]}
              spellCheck={false}
            />
          </label>
          <p className="muted small">
            {format === "decimal"
              ? "Separate the byte values with spaces, commas or new lines."
              : "Spaces, commas and new lines between bytes are all fine, and so is no separator at all."}
            {format === "binary" && " 0b prefixes are ignored, and 7-bit groups — ASCII with the leading zero dropped — are read too."}
            {format === "hex" && " 0x and \\x prefixes are ignored."}
          </p>

          {decoded.error && <p className="error">{decoded.error}</p>}

          {decoded.ok && (
            <>
              <div className="stat-grid">
                <div className="stat">
                  <span className="stat-num">{decoded.bytes.length.toLocaleString()}</span>
                  <span className="stat-label">{decoded.bytes.length === 1 ? "byte read" : "bytes read"}</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{[...decoded.text].length.toLocaleString()}</span>
                  <span className="stat-label">characters</span>
                </div>
              </div>
              {decoded.sevenBit && (
                <p className="muted small">
                  Read as 7-bit groups: the digits did not split evenly into 8-bit bytes but did
                  into 7, which is how ASCII is written when the always-zero top bit is left off.
                </p>
              )}
              {!decoded.valid && (
                <>
                  <p className="error">
                    These bytes are not valid UTF-8 (first problem at byte{" "}
                    {decoded.firstBad + 1}), so {decoded.replacements}{" "}
                    {decoded.replacements === 1 ? "spot shows" : "spots show"} as �.
                  </p>
                  <p className="muted small">
                    Read one byte per character instead (Latin-1, which is what many older
                    converters write for accented letters), they say:{" "}
                    <span className="mono">{decoded.latin1}</span>
                  </p>
                </>
              )}
              <OutputBox value={decoded.text} downloadName="decoded.txt" mono={false} />
            </>
          )}
        </>
      )}

      <p className="muted small" style={{ marginTop: "1.4rem" }}>
        Text is always encoded as UTF-8, the encoding of nearly every web page, file and API, so
        the {mode === "encode" ? fmtLabel : "bytes"} here match what is actually stored. Need to
        convert a single number between binary, hex and decimal instead? Use the{" "}
        <a href="/convert/base-converter">Base Converter</a>. Everything runs in your browser;
        nothing you type is uploaded.
      </p>
    </div>
  );
}
