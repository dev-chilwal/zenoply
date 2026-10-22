"use client";
import { useMemo, useState } from "react";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  CATEGORIES,
  belowAbsoluteZero,
  convert,
  feetInches,
  formatRational,
  getCategory,
  getUnit,
  parseInput,
  rat,
  toBase,
  toCopyText,
  toDisplay,
} from "@/components/tools/unitConvert";

// The arithmetic lives in unitConvert.js, on exact BigInt fractions, where every
// unit pair is round-tripped in node; this file is only the form around it.

const DEFAULTS = {
  length: ["cm", "ft"],
  weight: ["kg", "lb"],
  temperature: ["c", "f"],
  volume: ["l", "gal"],
  area: ["ft2", "m2"],
  speed: ["kmh", "mph"],
  time: ["h", "min"],
  data: ["GB", "GiB"],
};
const START_VALUE = { length: "170", weight: "70", temperature: "37", volume: "1", area: "1000", speed: "100", time: "1", data: "1" };

const SIG_OPTIONS = [4, 6, 8, 10, 12, 15];

/** A formatted value, with ×10ⁿ written as a superscript for extremes. */
function Value({ f, bare }) {
  const d = toDisplay(f);
  const mark = f.exact || bare ? "" : "≈ ";
  if (typeof d === "string") return <>{mark}{d}</>;
  return (
    <>
      {mark}{d.sign}{d.mantissa} × 10<sup>{d.exp}</sup>
    </>
  );
}

const unitName = (u, f) => (f && f.exact && f.digits === "1" && f.exp === 0 && !f.negative ? u.name : u.plural);

export default function UnitConverter() {
  const [catId, setCatId] = useState("length");
  const [text, setText] = useState(START_VALUE.length);
  const [fromId, setFromId] = useState(DEFAULTS.length[0]);
  const [toId, setToId] = useState(DEFAULTS.length[1]);
  const [sig, setSig] = useState(6);
  const [copied, setCopied] = useState("");

  const cat = getCategory(catId);
  const from = getUnit(cat, fromId) || cat.units[0];
  const to = getUnit(cat, toId) || cat.units[1];

  const switchCategory = (id) => {
    setCatId(id);
    setFromId(DEFAULTS[id][0]);
    setToId(DEFAULTS[id][1]);
    setText(START_VALUE[id]);
  };

  const swap = () => {
    setFromId(to.id);
    setToId(from.id);
  };

  const copy = (val, key) => {
    navigator.clipboard?.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1200);
  };

  const parsed = useMemo(() => parseInput(text), [text]);
  // A feet-and-inches value (5'7") is only meaningful as a length; anywhere
  // else it is an error rather than a silent reinterpretation.
  const heightInput = parsed.ok && parsed.ftIn;
  const effFrom = heightInput && catId === "length" ? getUnit(cat, "in") : from;
  const usable = parsed.ok && (!heightInput || catId === "length");

  const result = useMemo(() => {
    if (!usable) return null;
    const value = convert(parsed.value, effFrom, to);
    return { value, f: formatRational(value, sig) };
  }, [usable, parsed, effFrom, to, sig]);

  const all = useMemo(() => {
    if (!usable) return [];
    return cat.units.map((u) => {
      const value = convert(parsed.value, effFrom, u);
      return { u, f: formatRational(value, sig) };
    });
  }, [usable, parsed, effFrom, cat, sig]);

  const height = useMemo(() => {
    if (!usable || catId !== "length") return null;
    return feetInches(toBase(parsed.value, effFrom));
  }, [usable, catId, parsed, effFrom]);

  // The one-unit factor, so the conversion can be done by hand or in a sheet.
  const factor = useMemo(() => {
    if (cat.affine || effFrom.id === to.id) return null;
    return formatRational(convert(rat(1n), effFrom, to), Math.max(sig, 10));
  }, [cat, effFrom, to, sig]);

  const cold = usable && cat.affine && belowAbsoluteZero(toBase(parsed.value, effFrom));

  return (
    <div>
      <Segmented
        ariaLabel="What to convert"
        value={catId}
        onChange={switchCategory}
        options={CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
      />

      <label className="field">
        <span className="field-label">Value</span>
        <input
          className="inp mono"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={catId === "length" ? "170 or 5'7\"" : "1"}
          inputMode="text"
          spellCheck={false}
          autoComplete="off"
          aria-label="Value to convert"
        />
      </label>

      <div className="field-row" style={{ alignItems: "flex-end" }}>
        <Field label="From">
          <select className="inp" value={from.id} onChange={(e) => setFromId(e.target.value)}>
            {cat.units.map((u) => (
              <option key={u.id} value={u.id}>{`${u.plural} (${u.sym})`}</option>
            ))}
          </select>
        </Field>
        <button
          type="button"
          className="btn-sm"
          onClick={swap}
          aria-label="Swap the from and to units"
          style={{ marginBottom: ".9rem", flex: "0 0 auto" }}
        >
          ⇄ Swap
        </button>
        <Field label="To">
          <select className="inp" value={to.id} onChange={(e) => setToId(e.target.value)}>
            {cat.units.map((u) => (
              <option key={u.id} value={u.id}>{`${u.plural} (${u.sym})`}</option>
            ))}
          </select>
        </Field>
      </div>

      {parsed.ok === false && parsed.error && <p className="error">{parsed.error}</p>}
      {heightInput && catId !== "length" && (
        <p className="error">Feet and inches only make sense as a length — switch to Length, or type a plain number.</p>
      )}
      {heightInput && catId === "length" && (
        <p className="muted small">
          Read as {parsed.ftIn.ft} ft {parsed.ftIn.inch} in, which is{" "}
          {toDisplay(formatRational(parsed.value, 15))} inches — the From box is ignored for a
          feet-and-inches value.
        </p>
      )}

      {result && (
        <div className="output-block">
          <div className="output-actions">
            <button className="btn-sm" onClick={() => copy(toCopyText(result.f), "main")} aria-label="Copy the result">
              {copied === "main" ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="output mono" style={{ fontSize: "clamp(1.3rem, 4.5vw, 1.9rem)", lineHeight: 1.35, overflowWrap: "anywhere" }}>
            <Value f={result.f} /> <span style={{ fontSize: ".6em" }}>{unitName(to, result.f)}</span>
          </div>
        </div>
      )}

      {result && height && to.id === "ft" && (
        <p className="muted small">
          That is {`${height.ft} ft ${height.inch} in`}. A decimal of a foot is not a number of inches
          — multiply it by 12 — so 5.5 ft is 5′6″, not 5′5″.
        </p>
      )}

      {result && (
        <p className="muted small">
          {result.f.exact
            ? "Exact — no rounding was needed."
            : `Rounded to ${sig} significant figures. The ≈ marks a value whose decimals carry on further.`}
          {factor && (
            <>
              {" "}1 {effFrom.name} {factor.exact ? "=" : "≈"} <Value f={factor} bare /> {unitName(to, factor)}
              {factor.exact ? " exactly." : "."}
            </>
          )}
          {cat.affine && from.id !== to.id && " Temperature scales have different zero points, so this is a formula, not a single multiplier."}
        </p>
      )}

      {cold && (
        <p className="error">
          That is below absolute zero (0 K, −273.15 °C, −459.67 °F), the coldest a temperature can
          physically be. The arithmetic is shown, but it is not a real temperature.
        </p>
      )}

      {height && (
        <div className="result-list">
          <div className="result-row result-row-hl">
            <span className="result-label">Feet + inches</span>
            <span className="result-val">
              {`${height.ft} ft ${height.inch} in`}
              <span className="muted small">{`  ·  ${height.wholeFt}′${height.wholeIn}″ to the nearest inch`}</span>
            </span>
            <button className="btn-sm" onClick={() => copy(`${height.ft} ft ${height.inch} in`, "ftin")}>
              {copied === "ftin" ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {all.length > 0 && (
        <>
          <p className="field-label" style={{ marginTop: "1.25rem" }}>In every {cat.label.toLowerCase()} unit</p>
          <div className="result-list">
            {all.map(({ u, f }) => (
              <div key={u.id} className={"result-row" + (u.id === to.id ? " result-row-hl" : "")}>
                <span className="result-label">{u.sym}</span>
                <span className="result-val"><Value f={f} /></span>
                <button className="btn-sm" onClick={() => copy(toCopyText(f), u.id)} aria-label={`Copy the value in ${u.plural}`}>
                  {copied === u.id ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="field-row" style={{ marginTop: "1rem" }}>
        <Field label="Round inexact results to">
          <select className="inp" value={sig} onChange={(e) => setSig(Number(e.target.value))}>
            {SIG_OPTIONS.map((n) => (
              <option key={n} value={n}>{`${n} significant figures`}</option>
            ))}
          </select>
        </Field>
      </div>

      <p className="muted small">
        Every unit here is defined as an exact multiple of a metric one — an inch is 2.54 cm
        exactly, a pound 0.45359237 kg, a US gallon 231 cubic inches — so the conversion is
        worked out as an exact fraction and a result that ends is shown in full. Only a value
        whose decimals go on forever is rounded, and it is marked ≈. Copy gives a plain number
        with no thousands commas, ready for a spreadsheet. Nothing you type leaves your browser.
      </p>
    </div>
  );
}
