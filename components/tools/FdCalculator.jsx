"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange, compoundingLabel } from "@/lib/locales";

// Deposit-amount range in the IN baseline (scale = 1); scaled per region.
const DEPOSIT_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };

export default function FdCalculator() {
  const reg = useRegion();
  const fmt = (n) => formatMoney(n, reg);
  const dep = useMemo(() => moneyRange(DEPOSIT_BASE, reg.scale), [reg.scale]);

  const [principal, setPrincipal] = useState(dep.default);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);

  useEffect(() => { setPrincipal(dep.default); }, [reg.code, dep.default]);

  const r = useMemo(() => {
    const n = reg.fdCompounding;
    const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
    const interest = amount - principal;
    const pPct = amount > 0 ? (principal / amount) * 100 : 0;
    const iPct = amount > 0 ? (interest / amount) * 100 : 0;
    return { amount, interest, pPct, iPct };
  }, [principal, rate, years, reg.fdCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Total investment" display={fmt(principal)} value={principal} min={dep.min} max={dep.max} step={dep.step} onChange={setPrincipal} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={1} max={15} step={0.1} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years} min={1} max={20} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label="Maturity value" value={fmt(r.amount)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Assumes {compoundingLabel(reg.fdCompounding)} compounding.
      </p>
    </div>
  );
}
