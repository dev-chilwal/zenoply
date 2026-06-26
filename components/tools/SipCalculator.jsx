"use client";
import { useState, useMemo } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function SipCalculator() {
  const [amount, setAmount] = useState(25000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  const r = useMemo(() => {
    const i = rate / 12 / 100;
    const n = years * 12;
    const invested = amount * n;
    // Future value of a series (SIP), contributions at period start.
    const fv = i === 0 ? invested : amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const returns = Math.max(0, fv - invested);
    const rPct = fv > 0 ? (returns / fv) * 100 : 0;
    return { fv, invested, returns, rPct, iPct: 100 - rPct };
  }, [amount, rate, years]);

  const yearsLabel = years + (years === 1 ? " year" : " years");

  return (
    <div>
      <Fields>
        <Slider label="Monthly investment" display={fmt(amount)} value={amount}
          min={500} max={100000} step={500} onChange={setAmount} />
        <Slider label="Expected return (p.a.)" display={`${rate}%`} value={rate}
          min={1} max={30} step={0.5} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years}
          min={1} max={40} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label={`Total value after ${yearsLabel}`} value={fmt(r.fv)} />
        <SplitBar a={r.iPct} b={r.rPct} />
        <Legend
          left={{ k: "Invested", v: fmt(r.invested) }}
          right={{ k: `Est. returns · ${Math.round(r.rPct)}%`, v: fmt(r.returns) }}
        />
      </Result>
    </div>
  );
}
