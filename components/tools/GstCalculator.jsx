"use client";
import { useState, useMemo } from "react";
import { Fields, NumberField, Field, Segmented, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";

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

  const basePct = r.total > 0 ? (r.base / r.total) * 100 : 0;
  const gstPct = r.total > 0 ? (r.gst / r.total) * 100 : 0;

  return (
    <div>
      <Fields>
        <NumberField label="Amount" prefix="₹" value={amount} onChange={setAmount} min={0} step={100} />
        <Field label="GST rate">
          <select className="inp" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}>
            {[0, 3, 5, 12, 18, 28].map((x) => <option key={x} value={x}>{x}%</option>)}
          </select>
        </Field>
        <Segmented
          ariaLabel="GST mode"
          value={mode}
          onChange={setMode}
          options={[{ value: "add", label: "Add GST" }, { value: "remove", label: "Remove GST" }]}
        />
      </Fields>
      <Result>
        <ResultHero
          label={mode === "add" ? "Total (incl. GST)" : "Base (excl. GST)"}
          value={fmt(mode === "add" ? r.total : r.base)}
        />
        <SplitBar a={basePct} b={gstPct} />
        <Legend left={{ k: "Base amount", v: fmt(r.base) }} right={{ k: `GST (${rate}%)`, v: fmt(r.gst) }} />
      </Result>
    </div>
  );
}
