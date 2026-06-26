"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoneyPrecise } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

export default function MortgageCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.mortgage, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoneyPrecise(n, reg);

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const n = years * 12;
    // Most markets compound monthly; Canada uses federally-regulated
    // semi-annual compounding, so derive the effective monthly rate.
    const cmp = reg.mortgageCompounding || 12;
    const i = Math.pow(1 + rate / 100 / cmp, cmp / 12) - 1;
    const emi = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;
    const interest = total - principal;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (interest / total) * 100 : 0;
    return { emi, total, interest, pPct, iPct };
  }, [principal, rate, years, reg.mortgageCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Loan amount" display={fmt(principal)} value={principal} min={range.min} max={range.max} step={range.step} onChange={setPrincipal} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={1} max={15} step={0.1} onChange={setRate} />
        <Slider label="Loan term" display={yearsLabel} value={years} min={1} max={40} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label="Monthly payment" value={fmt(r.emi)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Principal", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
      <Rows>
        <Row label="Total paid" val={fmt(r.total)} />
      </Rows>
      {reg.mortgageCompounding === 2 && (
        <p className="muted small" style={{ marginTop: ".75rem" }}>
          Uses semi-annual compounding, the regulated standard for Canadian fixed-rate mortgages.
        </p>
      )}
    </div>
  );
}
