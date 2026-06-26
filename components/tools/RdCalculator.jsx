"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const DEPOSIT_BASE = { min: 500, max: 100000, step: 500, default: 5000 };

export default function RdCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(DEPOSIT_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [deposit, setDeposit] = useState(range.default);
  const [rate, setRate] = useState(7.2);
  const [months, setMonths] = useState(24);

  useEffect(() => { setDeposit(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Indian banks compound RD interest quarterly: each monthly instalment
    // earns interest compounded every quarter until maturity.
    const i = rate / 400;     // quarterly rate
    const n = months / 3;     // number of quarters
    const invested = deposit * months;
    const maturity = i === 0
      ? invested
      : deposit * (Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3));
    const interest = maturity - invested;
    const pPct = maturity > 0 ? (invested / maturity) * 100 : 0;
    const iPct = maturity > 0 ? (interest / maturity) * 100 : 0;
    return { maturity, invested, interest, pPct, iPct };
  }, [deposit, rate, months]);

  const monthsLabel = `${months} ${months === 1 ? "month" : "months"}`;

  return (
    <div>
      <Fields>
        <Slider label="Monthly deposit" display={fmt(deposit)} value={deposit} min={range.min} max={range.max} step={range.step} onChange={setDeposit} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={1} max={15} step={0.1} onChange={setRate} />
        <Slider label="Tenure" display={monthsLabel} value={months} min={3} max={120} step={3} onChange={setMonths} />
      </Fields>
      <Result>
        <ResultHero label="Maturity value" value={fmt(r.maturity)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(r.invested) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Assumes quarterly compounding, as used by most Indian banks. Tenure is set in multiples of 3 months to match quarterly interest credits.
      </p>
    </div>
  );
}
