"use client";
import { useState, useMemo } from "react";

const fmt = (n) => "₹" + (Math.round(n * 100) / 100).toLocaleString("en-IN");

export default function GstCalculator() {
  const [amount, setAmount] = useState(1000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState("add"); // add = exclusive, remove = inclusive

  const r = useMemo(() => {
    const gstRate = rate / 100;
    if (mode === "add") {
      const gst = amount * gstRate;
      return { base: amount, gst, total: amount + gst };
    }
    const base = amount / (1 + gstRate);
    return { base, gst: amount - base, total: amount };
  }, [amount, rate, mode]);

  return (
    <div>
      <Field label="Amount (₹)" value={amount} set={setAmount} min={0} step={100} />
      <label className="field">
        <span className="field-label">GST rate</span>
        <select className="inp" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}>
          {[0, 3, 5, 12, 18, 28].map((x) => <option key={x} value={x}>{x}%</option>)}
        </select>
      </label>
      <div className="btn-row">
        <button className={"btn" + (mode === "add" ? "" : " btn-ghost")} onClick={() => setMode("add")}>Add GST</button>
        <button className={"btn" + (mode === "remove" ? "" : " btn-ghost")} onClick={() => setMode("remove")}>Remove GST</button>
      </div>
      <div className="result-list">
        <Row label="Base amount" val={fmt(r.base)} />
        <Row label={`GST (${rate}%)`} val={fmt(r.gst)} />
        <Row label="Total amount" val={fmt(r.total)} highlight />
      </div>
    </div>
  );
}
function Field({ label, value, set, min, step }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="inp" type="number" value={value} min={min} step={step}
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
