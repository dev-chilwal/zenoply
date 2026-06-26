"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const DEPOSIT_BASE = { min: 500, max: 150000, step: 500, default: 150000 };

export default function PpfCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(DEPOSIT_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [deposit, setDeposit] = useState(range.default);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(15);

  useEffect(() => { setDeposit(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Deposit at the start of each year, compounded annually (annuity-due).
    const i = rate / 100;
    const maturity = i === 0
      ? deposit * years
      : deposit * ((Math.pow(1 + i, years) - 1) / i) * (1 + i);
    const invested = deposit * years;
    const interest = maturity - invested;
    const pPct = maturity > 0 ? (invested / maturity) * 100 : 0;
    const iPct = maturity > 0 ? (interest / maturity) * 100 : 0;
    return { maturity, invested, interest, pPct, iPct };
  }, [deposit, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Yearly deposit" display={fmt(deposit)} value={deposit} min={range.min} max={range.max} step={range.step} onChange={setDeposit} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={1} max={12} step={0.1} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years} min={15} max={50} step={5} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label="Maturity value" value={fmt(r.maturity)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(r.invested) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Assumes a deposit at the start of each year, compounded annually. PPF has a 15-year base tenure (extendable in 5-year blocks); the government revises the rate each quarter (currently 7.1%).
      </p>
    </div>
  );
}
