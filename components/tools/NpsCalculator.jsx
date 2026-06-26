"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const CONTRIB_BASE = { min: 500, max: 150000, step: 500, default: 10000 };

export default function NpsCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(CONTRIB_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [contribution, setContribution] = useState(range.default);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [rate, setRate] = useState(10);
  const [annuityPct, setAnnuityPct] = useState(40);
  const [annuityRate, setAnnuityRate] = useState(6);

  useEffect(() => { setContribution(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Contributions compound monthly until retirement (annuity-due).
    const months = Math.max(0, (retirementAge - currentAge) * 12);
    const i = rate / 1200;
    const corpus = months === 0 ? 0
      : i === 0 ? contribution * months
      : contribution * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
    // At least 40% of the corpus must buy an annuity; up to 60% is a lump sum.
    const share = Math.min(100, Math.max(40, annuityPct)) / 100;
    const annuitised = corpus * share;
    const lumpSum = corpus - annuitised;
    const pension = annuitised * (annuityRate / 1200);
    const invested = contribution * months;
    return { corpus, annuitised, lumpSum, pension, invested };
  }, [contribution, currentAge, retirementAge, rate, annuityPct, annuityRate]);

  return (
    <div>
      <Fields>
        <Slider label="Monthly contribution" display={fmt(contribution)} value={contribution} min={range.min} max={range.max} step={range.step} onChange={setContribution} />
        <Slider label="Current age" display={`${currentAge} yrs`} value={currentAge} min={18} max={59} step={1} onChange={setCurrentAge} />
        <Slider label="Retirement age" display={`${retirementAge} yrs`} value={retirementAge} min={40} max={75} step={1} onChange={setRetirementAge} />
        <Slider label="Expected return (p.a.)" display={`${rate}%`} value={rate} min={1} max={15} step={0.5} onChange={setRate} />
        <Slider label="Corpus to annuitise" display={`${annuityPct}%`} value={annuityPct} min={40} max={100} step={1} onChange={setAnnuityPct} />
        <Slider label="Expected annuity rate (p.a.)" display={`${annuityRate}%`} value={annuityRate} min={3} max={12} step={0.5} onChange={setAnnuityRate} />
      </Fields>
      <Result>
        <ResultHero label="Total corpus at retirement" value={fmt(r.corpus)} />
      </Result>
      <Rows>
        <Row label="Invested" val={fmt(r.invested)} />
        <Row label="Tax-free lump-sum (up to 60%)" val={fmt(r.lumpSum)} />
        <Row label="Amount annuitised" val={fmt(r.annuitised)} />
        <Row label="Estimated monthly pension" val={fmt(r.pension)} highlight />
      </Rows>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Estimates only, assuming monthly compounding and constant rates. At least 40% of the corpus must buy an annuity; the lump-sum (up to 60%) is tax-free under Section 10(12A), but the annuity pension is taxable as income. Returns and annuity rates are not guaranteed.
      </p>
    </div>
  );
}
