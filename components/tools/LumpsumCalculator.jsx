"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const PRINCIPAL_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };

export default function LumpsumCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(PRINCIPAL_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const total = principal * Math.pow(1 + rate / 100, years);
    const returns = total - principal;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (returns / total) * 100 : 0;
    return { total, returns, pPct, iPct };
  }, [principal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Total investment" display={fmt(principal)} value={principal} min={range.min} max={range.max} step={range.step} onChange={setPrincipal} />
        <Slider label="Expected return (p.a.)" display={`${rate}%`} value={rate} min={1} max={30} step={0.5} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years} min={1} max={40} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label={`Total value after ${yearsLabel}`} value={fmt(r.total)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(principal) }} right={{ k: `Est. returns · ${Math.round(r.iPct)}%`, v: fmt(r.returns) }} />
      </Result>
    </div>
  );
}
