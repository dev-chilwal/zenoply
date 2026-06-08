"use client";
import { useState, useMemo } from "react";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const FREQ = { Annually: 1, "Half-yearly": 2, Quarterly: 4, Monthly: 12 };

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);
  const [freq, setFreq] = useState("Annually");

  const r = useMemo(() => {
    const nfreq = FREQ[freq];
    const amount = principal * Math.pow(1 + rate / 100 / nfreq, nfreq * years);
    return { amount, interest: amount - principal };
  }, [principal, rate, years, freq]);

  return (
    <div>
      <Field label="Principal amount (₹)" value={principal} set={setPrincipal} min={0} step={10000} />
      <Field label="Interest rate (% p.a.)" value={rate} set={setRate} min={0} max={50} step={0.5} />
      <Field label="Time period (years)" value={years} set={setYears} min={1} max={50} step={1} />
      <label className="field">
        <span className="field-label">Compounding frequency</span>
        <select className="inp" value={freq} onChange={(e) => setFreq(e.target.value)}>
          {Object.keys(FREQ).map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </label>
      <div className="result-list">
        <Row label="Principal" val={fmt(principal)} />
        <Row label="Total interest" val={fmt(r.interest)} />
        <Row label="Maturity value" val={fmt(r.amount)} highlight />
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
