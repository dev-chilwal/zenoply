"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange, compoundingLabel } from "@/lib/locales";

// Loan-amount range in the IN baseline (scale = 1); scaled per region. At the US
// scale (0.1) this reproduces the familiar $10k–$2M / $300k mortgage range.
const LOAN_BASE = { min: 100000, max: 20000000, step: 100000, default: 3000000 };

export default function MortgageCalculator() {
  const reg = useRegion();
  const fmt = (n) => formatMoney(n, reg);
  const loan = useMemo(() => moneyRange(LOAN_BASE, reg.scale), [reg.scale]);

  const [principal, setPrincipal] = useState(loan.default);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  useEffect(() => { setPrincipal(loan.default); }, [reg.code, loan.default]);

  const r = useMemo(() => {
    const n = years * 12;
    const c = reg.mortgageCompounding;
    // Effective monthly rate from the region's compounding convention. With
    // monthly compounding (c = 12) this is just rate/12; Canada (c = 2) uses
    // the semi-annual convention.
    const i = c === 12 ? rate / 100 / 12 : Math.pow(1 + rate / 100 / c, c / 12) - 1;
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
        <Slider label="Loan amount" display={fmt(principal)} value={principal} min={loan.min} max={loan.max} step={loan.step} onChange={setPrincipal} />
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
      {reg.mortgageCompounding !== 12 && (
        <p className="muted small" style={{ marginTop: ".75rem" }}>
          Assumes {compoundingLabel(reg.mortgageCompounding)} compounding, as is standard in {reg.label}.
        </p>
      )}
    </div>
  );
}
