"use client";
import { useState, useMemo } from "react";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function FdCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);

  const r = useMemo(() => {
    // Indian FDs typically compound quarterly
    const n = 4;
    const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
    return { amount, interest: amount - principal };
  }, [principal, rate, years]);

  return (
    <div>
      <Field label="Total investment (₹)" value={principal} set={setPrincipal} min={0} step={10000} />
      <Field label="Interest rate (% p.a.)" value={rate} set={setRate} min={0} max={15} step={0.1} />
      <Field label="Time period (years)" value={years} set={setYears} min={1} max={20} step={1} />
      <div className="result-list">
        <Row label="Invested amount" val={fmt(principal)} />
        <Row label="Interest earned" val={fmt(r.interest)} />
        <Row label="Maturity value" val={fmt(r.amount)} highlight />
      </div>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Assumes quarterly compounding, as used by most Indian banks.
      </p>
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
