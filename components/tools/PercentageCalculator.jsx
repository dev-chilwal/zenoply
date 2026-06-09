"use client";
import { useState, useMemo } from "react";

const round = (n) => Math.round(n * 10000) / 10000;
const show = (n) =>
  Number.isFinite(n) ? round(n).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "—";

export default function PercentageCalculator() {
  const [mode, setMode] = useState("of"); // of | isWhat | change

  // mode "of": what is A% of B
  const [a, setA] = useState(15);
  const [b, setB] = useState(200);
  // mode "isWhat": X is what % of Y
  const [x, setX] = useState(30);
  const [y, setY] = useState(200);
  // mode "change": from V1 to V2
  const [v1, setV1] = useState(100);
  const [v2, setV2] = useState(125);

  const result = useMemo(() => {
    if (mode === "of") {
      return { label: `${show(a)}% of ${show(b)}`, val: show((a / 100) * b) };
    }
    if (mode === "isWhat") {
      return { label: `${show(x)} is this % of ${show(y)}`, val: y === 0 ? "—" : show((x / y) * 100) + "%" };
    }
    const pct = v1 === 0 ? NaN : ((v2 - v1) / Math.abs(v1)) * 100;
    return {
      label: `Change from ${show(v1)} to ${show(v2)}`,
      val: Number.isFinite(pct) ? (pct >= 0 ? "+" : "") + show(pct) + "%" : "—",
    };
  }, [mode, a, b, x, y, v1, v2]);

  return (
    <div>
      <div className="btn-row">
        <button className={"btn" + (mode === "of" ? "" : " btn-ghost")} onClick={() => setMode("of")}>% of a number</button>
        <button className={"btn" + (mode === "isWhat" ? "" : " btn-ghost")} onClick={() => setMode("isWhat")}>X is what % of Y</button>
        <button className={"btn" + (mode === "change" ? "" : " btn-ghost")} onClick={() => setMode("change")}>% increase / decrease</button>
      </div>

      {mode === "of" && (
        <>
          <Field label="Percentage (%)" value={a} set={setA} step={1} />
          <Field label="Of value" value={b} set={setB} step={1} />
        </>
      )}
      {mode === "isWhat" && (
        <>
          <Field label="Value (X)" value={x} set={setX} step={1} />
          <Field label="Total (Y)" value={y} set={setY} step={1} />
        </>
      )}
      {mode === "change" && (
        <>
          <Field label="Original value" value={v1} set={setV1} step={1} />
          <Field label="New value" value={v2} set={setV2} step={1} />
        </>
      )}

      <div className="result-list">
        <Row label={result.label} val={result.val} highlight />
      </div>
    </div>
  );
}
function Field({ label, value, set, step }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="inp" type="number" value={value} step={step}
        onChange={(e) => set(parseFloat(e.target.value) || 0)} />
    </label>
  );
}
function Row({ label, val, highlight }) {
  return (
    <div className={"result-row" + (highlight ? " result-row-hl" : "")}>
      <span className="result-label">{label}</span>
      <code className="result-val">{val}</code>
    </div>
  );
}
