"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

export default function EmiCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.loan, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <Slider label="Loan amount" display={fmt(principal)} value={principal} min={range.min} max={range.max} step={range.step} onChange={setPrincipal} />
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
