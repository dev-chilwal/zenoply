"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange, MONEY_BASE, COMPOUND_LABEL } from "@/lib/locales";

export default function FdCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.lumpsum, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Compounding frequency varies by country/bank convention (see lib/locales).
    const n = reg.fdCompounding || 4;
    const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
    const interest = amount - principal;
    const pPct = amount > 0 ? (principal / amount) * 100 : 0;
    const iPct = amount > 0 ? (interest / amount) * 100 : 0;
    return { amount, interest, pPct, iPct };
  }, [principal, rate, years, reg.fdCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  const freqLabel = COMPOUND_LABEL[reg.fdCompounding] || "quarterly";

  return (
    <div>
      <Fields>
        <Slider label="Total investment" display={fmt(principal)} value={principal} min={range.min} max={range.max} step={range.step} onChange={setPrincipal} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={1} max={15} step={0.1} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years} min={1} max={20} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label="Maturity value" value={fmt(r.amount)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Assumes {freqLabel} compounding{reg.code === "IN" ? ", as used by most Indian banks" : ""}.
      </p>
    </div>
  );
}
