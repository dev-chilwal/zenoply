"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Field, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

const FREQ = { Annually: 1, "Half-yearly": 2, Quarterly: 4, Monthly: 12 };

export default function CompoundInterest() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.lumpsum, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);
  const [freq, setFreq] = useState("Annually");

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const nfreq = FREQ[freq];
    const amount = principal * Math.pow(1 + rate / 100 / nfreq, nfreq * years);
    const interest = amount - principal;
    const pPct = amount > 0 ? (principal / amount) * 100 : 0;
    const iPct = amount > 0 ? (interest / amount) * 100 : 0;
    return { amount, interest, pPct, iPct };
  }, [principal, rate, years, freq]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  return (
    <div>
      <Fields>
        <Slider label="Principal amount" display={fmt(principal)} value={principal} min={range.min} max={range.max} step={range.step} onChange={setPrincipal} />
        <Slider label="Interest rate (p.a.)" display={`${rate}%`} value={rate} min={0.5} max={30} step={0.5} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years} min={1} max={40} step={1} onChange={setYears} />
        <Field label="Compounding frequency">
          <select className="inp" value={freq} onChange={(e) => setFreq(e.target.value)}>
            {Object.keys(FREQ).map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>
      </Fields>
      <Result>
        <ResultHero label="Maturity value" value={fmt(r.amount)} />
        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Principal", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />
      </Result>
    </div>
  );
}
