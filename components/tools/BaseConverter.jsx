"use client";
import { useState, useMemo } from "react";
import { Field } from "@/components/calc/Calc";
import {
  MIN_BASE,
  MAX_BASE,
  baseName,
  bitLength,
  formatValue,
  isValidBase,
  parseValue,
  twosComplement,
} from "@/components/tools/baseConvert";

// All of the arithmetic lives in baseConvert.js so it can be exercised in node
// against Python's arbitrary-precision integers and exact Fraction arithmetic;
// this file is only the form around it.

const COMMON = [2, 8, 10, 16];
const WIDTHS = [8, 16, 32, 64];

// Every two's-complement width is a multiple of four bits, so splitting from
// the left lands on the same nibble boundaries as splitting from the right.
const groupNibbles = (bits) => bits.replace(/(.{4})(?=.)/g, "$1 ");

const PLACEHOLDER = {
  2: "1010 1010",
  8: "777",
  10: "255",
  16: "FFFFFFFFFFFFFFFF",
};

export default function BaseConverter() {
  const [text, setText] = useState("");
  const [fromBase, setFromBase] = useState(10);
  const [customBase, setCustomBase] = useState(36);
  const [uppercase, setUppercase] = useState(true);
  const [grouped, setGrouped] = useState(true);
  const [prefix, setPrefix] = useState(false);
  const [copied, setCopied] = useState("");

  const copy = (val, key) => {
    navigator.clipboard?.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1200);
  };

  const parsed = useMemo(() => parseValue(text, fromBase), [text, fromBase]);

  const custom = Number(customBase);
  const showCustom = isValidBase(custom) && !COMMON.includes(custom);

  const rows = useMemo(() => {
    if (!parsed.ok) return [];
    const bases = showCustom ? [...COMMON, custom] : COMMON;
    return bases.map((b) => ({
      base: b,
      label: b === 10 ? "Decimal" : b === 16 ? "Hexadecimal" : b === 2 ? "Binary" : b === 8 ? "Octal" : `Base ${b}`,
      ...formatValue(parsed, b, { uppercase, prefix, grouped }),
    }));
  }, [parsed, showCustom, custom, uppercase, prefix, grouped]);

  // The two's-complement panel is only meaningful for a negative whole number.
  // Showing it for a positive value would just repeat the binary row.
  const signed = parsed.ok && parsed.negative && !parsed.hasFraction;
  const patterns = useMemo(() => {
    if (!signed) return [];
    // `width` rather than `bits`, because twosComplement returns the bit
    // pattern under the name `bits` and the two would collide on the spread.
    return WIDTHS.map((width) => ({ width, ...twosComplement(parsed, width) }));
  }, [signed, parsed]);

  const repeating = rows.some((r) => r.repeatStart >= 0);

  return (
    <div>
      <div className="field-row">
        <Field label="Input base">
          <select
            className="inp"
            value={fromBase}
            onChange={(e) => setFromBase(Number(e.target.value))}
          >
            <option value={2}>2 — Binary</option>
            <option value={8}>8 — Octal</option>
            <option value={10}>10 — Decimal</option>
            <option value={16}>16 — Hexadecimal</option>
            {Array.from({ length: MAX_BASE - MIN_BASE + 1 }, (_, i) => i + MIN_BASE)
              .filter((b) => !COMMON.includes(b))
              .map((b) => (
                <option key={b} value={b}>{`${b} — Base ${b}`}</option>
              ))}
          </select>
        </Field>
        <Field label="Also show base">
          <input
            className="inp"
            type="number"
            min={MIN_BASE}
            max={MAX_BASE}
            value={customBase}
            onChange={(e) => setCustomBase(e.target.value)}
          />
        </Field>
      </div>

      <label className="field">
        <span className="field-label">Number in {baseName(fromBase)}</span>
        <input
          className="inp mono"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={PLACEHOLDER[fromBase] || "0"}
          spellCheck={false}
          autoComplete="off"
        />
      </label>

      <label className="check-row">
        <input type="checkbox" checked={uppercase} onChange={(e) => setUppercase(e.target.checked)} />
        <span>Uppercase letters (FF rather than ff)</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={grouped} onChange={(e) => setGrouped(e.target.checked)} />
        <span>Group digits (1111 0000, 1,234,567)</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={prefix} onChange={(e) => setPrefix(e.target.checked)} />
        <span>Add the 0x, 0o and 0b prefixes</span>
      </label>

      {parsed.ok === false && parsed.error && <p className="error">{parsed.error}</p>}

      {rows.length > 0 && (
        <div className="result-list">
          {rows.map((r) => (
            <div key={r.base} className="result-row">
              <span className="result-label">{r.label}</span>
              <code className="result-val">{r.text}</code>
              <button className="btn-sm" onClick={() => copy(r.text, r.label)}>
                {copied === r.label ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      )}

      {parsed.ok && !parsed.hasFraction && (
        <p className="muted small">
          {parsed.int === 0n
            ? "Zero."
            : `${bitLength(parsed.int)} bits wide — it needs ${Math.ceil(bitLength(parsed.int) / 8)} ${
                Math.ceil(bitLength(parsed.int) / 8) === 1 ? "byte" : "bytes"
              } unsigned.`}
        </p>
      )}

      {repeating && (
        <p className="muted small">
          Digits in brackets repeat forever. A fraction only stops in a given base when the
          bottom of the fraction is built from that base&apos;s own prime factors — so a tenth
          is exact in base 10, but in binary it runs 0.0(0011) with no end. The brackets say
          so instead of rounding it off and pretending otherwise.
        </p>
      )}

      {signed && (
        <>
          <p className="field-label">Two&apos;s complement</p>
          <p className="muted small">
            How a negative whole number is actually stored at each width, with the hex of the
            same pattern underneath. A value too big for a width is reported rather than
            silently wrapped, which is how a converter ends up claiming that -200 fits in a
            byte.
          </p>
          <div className="result-list">
            {patterns.map((p) => (
              <div key={p.width} className="result-row">
                <span className="result-label">{p.width}-bit</span>
                {p.ok ? (
                  <>
                    <div className="result-val">
                      <code className="mono">{groupNibbles(p.bits)}</code>
                      <div className="muted small mono">0x{p.hex}</div>
                    </div>
                    <button className="btn-sm" onClick={() => copy(p.bits, `tc${p.width}`)}>
                      {copied === `tc${p.width}` ? "Copied" : "Copy"}
                    </button>
                  </>
                ) : (
                  <span className="result-val muted">{p.error}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="muted small">
        Every conversion here runs on arbitrary-precision integers, so a 64-bit hash, a
        snowflake ID or a 128-bit UUID converts exactly. Converters built the usual way — on
        JavaScript&apos;s <code>parseInt</code> — round every value above about 9 quadrillion,
        which turns <code>0xFFFFFFFFFFFFFFFF</code> into a 1 followed by 64 zeros instead of
        64 ones. Spaces, underscores and commas in the input are ignored, so you can paste a
        grouped value straight in; use a dot for the point.
      </p>
    </div>
  );
}
