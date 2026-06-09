"use client";
import { useState, useMemo } from "react";

const fmt = (n) =>
  "$" + (Math.round(n * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MortgageCalculator() {
  const [principal, setPrincipal] = useState(300000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  const r = useMemo(() => {
    const n = years * 12;
    const i = rate / 100 / 12;
    const emi = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;
    return { emi, total, interest: total - principal };
  }, [principal, rate, years]);

  return (
    <div>
      <Field label="Loan amount ($)" value={principal} set={setPrincipal} min={0} step={1000} />
      <Field label="Interest rate (% p.a.)" value={rate} set={setRate} min={0} max={30} step={0.1} />
      <Field label="Loan term (years)" value={years} set={setYears} min={1} max={40} step={1} />
      <div className="result-list">
        <Row label="Monthly payment" val={fmt(r.emi)} highlight />
        <Row label="Total interest" val={fmt(r.interest)} />
        <Row label="Total paid" val={fmt(r.total)} />
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
