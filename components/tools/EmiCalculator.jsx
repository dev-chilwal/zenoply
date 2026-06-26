"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

// Loan-amount range in the IN baseline (scale = 1); scaled per region.
const LOAN_BASE = { min: 50000, max: 10000000, step: 50000, default: 1000000 };

export default function EmiCalculator() {
  const reg = useRegion();
  const fmt = (n) => formatMoney(n, reg);
  const loan = useMemo(() => moneyRange(LOAN_BASE, reg.scale), [reg.scale]);

  const [principal, setPrincipal] = useState(loan.default);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  useEffect(() => { setPrincipal(loan.default); }, [reg.code, loan.default]);

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
        <Slider label="Loan amount" display={fmt(principal)} value={principal} min={loan.min} max={loan.max} step={loan.step} onChange={setPrincipal} />
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
