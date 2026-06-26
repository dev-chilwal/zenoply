"use client";
import { useState, useMemo } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend, Rows, Row } from "@/components/calc/Calc";

const fmt = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function EmiCalculator() {
  const [principal, setPrincipal] = useState(1000000);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  const r = useMemo(() => {
    const n = years * 12;
    const i = rate / 100 / 12;
    const emi = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;
    const interest = total - principal;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (interest / total) * 100 : 0;
    return { emi, total, interest, pPct, iPct };
  }, [principal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Loan amount" display={fmt(principal)} value={principal} min={50000} max={10000000} step={50000} onChange={setPrincipal} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={1} max={20} step={0.1} onChange={setRate} />
        <Slider label="Loan tenure" display={yearsLabel} value={years} min={1} max={30} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label="Monthly EMI" value={fmt(r.emi)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Principal", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
      <Rows>
        <Row label="Total payment" val={fmt(r.total)} />
      </Rows>
    </div>
  );
}
