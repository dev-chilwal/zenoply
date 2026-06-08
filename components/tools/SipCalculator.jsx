"use client";
import { useState, useMemo } from "react";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function SipCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const r = useMemo(() => {
    const n = years * 12;
    const i = rate / 100 / 12;
    const invested = monthly * n;
    // Future value of a series (SIP), contributions at period start
    const fv = i === 0 ? invested : monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    return { invested, fv, gain: fv - invested };
  }, [monthly, rate, years]);

  return (
    <div>
      <Field label="Monthly investment (₹)" value={monthly} set={setMonthly} min={100} step={500} />
      <Field label="Expected return rate (% p.a.)" value={rate} set={setRate} min={1} max={30} step={0.5} />
      <Field label="Time period (years)" value={years} set={setYears} min={1} max={40} step={1} />
      <div className="result-list">
        <Row label="Invested amount" val={fmt(r.invested)} />
        <Row label="Estimated returns" val={fmt(r.gain)} />
        <Row label="Total value" val={fmt(r.fv)} highlight />
      </div>
    </div>
  );
}
function Field({ label, value, set, min, max, step }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="inp" type="number" value={value} min={min} max={max} step={step}
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
