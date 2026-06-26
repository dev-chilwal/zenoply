"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const CONTRIB_BASE = { min: 500, max: 150000, step: 500, default: 10000 };

export default function NpsCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(CONTRIB_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

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
    // Corpus accumulated at the end of each whole year (presentation only).
    const yearsToRetire = Math.max(0, retirementAge - currentAge);
    const series = Array.from({ length: yearsToRetire + 1 }, (_, y) => {
      const m = y * 12;
      return m === 0 ? 0
        : i === 0 ? contribution * m
        : contribution * ((Math.pow(1 + i, m) - 1) / i) * (1 + i);
    });
    return { corpus, annuitised, lumpSum, pension, invested, series };
  }, [contribution, currentAge, retirementAge, rate, annuityPct, annuityRate]);

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Monthly contribution" hint="How much you invest into NPS each month."
          prefix={sym} value={contribution} onChange={setContribution}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Current age" hint="Your age today."
          suffix="yrs" value={currentAge} onChange={setCurrentAge}
          min={18} max={59} step={1}
        />
        <NumberInput
          label="Retirement age" hint="When you plan to withdraw."
          suffix="yrs" value={retirementAge} onChange={setRetirementAge}
          min={40} max={75} step={1}
        />
        <NumberInput
          label="Expected return (p.a.)" hint="Average annual growth of the NPS corpus."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={15} step={0.5}
        />
        <NumberInput
          label="Corpus to annuitise" hint="At least 40% must buy an annuity."
          suffix="%" value={annuityPct} onChange={setAnnuityPct}
          min={40} max={100} step={1}
        />
        <NumberInput
          label="Expected annuity rate (p.a.)" hint="Rate the annuity provider pays."
          suffix="%" value={annuityRate} onChange={setAnnuityRate}
          min={3} max={12} step={0.5}
        />

        <ResultStatement>
          At retirement you could build a corpus of <span className="pop">{fmt(r.corpus)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Corpus per year"
        />

        <SumRows>
          <SumRow label="Invested" value={fmt(r.invested)} />
          <SumRow label="Tax-free lump-sum (up to 60%)" value={fmt(r.lumpSum)} />
          <SumRow label="Amount annuitised" value={fmt(r.annuitised)} />
          <SumRow label="Estimated monthly pension" value={fmt(r.pension)} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimates only, assuming monthly compounding and constant rates. At least 40% of the corpus must buy an annuity; the lump-sum (up to 60%) is tax-free under Section 10(12A), but the annuity pension is taxable as income. Returns and annuity rates are not guaranteed.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What you retire with">
          NPS splits into a tax-free lump-sum and an annuity that pays a monthly pension.
        </RailNote>
        <RailStat
          label="Estimated monthly pension" tone="data"
          value={fmt(r.pension)}
          sub={`from ${fmt(r.annuitised)} annuitised`}
        />
        <RailStat
          label="Tax-free lump-sum" tone="data"
          value={fmt(r.lumpSum)}
          sub="up to 60% of the corpus"
        />
        <RailFormula
          label="The calculation"
          formula={<>FV = P × ((1 + i)<sup>n</sup> − 1) ÷ i × (1 + i)</>}
          note="Monthly contributions compound to retirement (annuity-due)."
        />
      </CalcRail>
    </CalcGrid>
  );
}
