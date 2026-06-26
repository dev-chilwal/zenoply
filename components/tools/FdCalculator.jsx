"use client";
import { useState, useMemo } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function FdCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);

  const r = useMemo(() => {
    // Indian FDs typically compound quarterly
    const n = 4;
    const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
    const interest = amount - principal;
    const pPct = amount > 0 ? (principal / amount) * 100 : 0;
    const iPct = amount > 0 ? (interest / amount) * 100 : 0;
    return { amount, interest, pPct, iPct };
  }, [principal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Total investment" display={fmt(principal)} value={principal} min={1000} max={10000000} step={10000} onChange={setPrincipal} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={1} max={15} step={0.1} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years} min={1} max={20} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label="Maturity value" value={fmt(r.amount)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Assumes quarterly compounding, as used by most Indian banks.
      </p>
    </div>
  );
}
