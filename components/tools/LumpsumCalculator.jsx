"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SumRows, SumRow, SplitBar, Legend,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const PRINCIPAL_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };

export default function LumpsumCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(PRINCIPAL_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const total = principal * Math.pow(1 + rate / 100, years);
    const returns = total - principal;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (returns / total) * 100 : 0;
    const yrs = Math.max(1, Math.round(years));
    const series = Array.from({ length: yrs + 1 }, (_, i) => principal * Math.pow(1 + rate / 100, i));
    return { total, returns, pPct, iPct, series };
  }, [principal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Total investment" hint="The lump sum you invest today."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Expected return (p.a.)" hint="Expected annual rate of return."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={30} step={0.5}
        />
        <NumberInput
          label="Time period" hint="How long the money stays invested."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />

        <ResultStatement>
          After {yearsLabel}, {fmt(principal)} grows to <span className="pop">{fmt(r.total)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Value over time"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(principal) }} right={{ k: `Est. returns · ${Math.round(r.iPct)}%`, v: fmt(r.returns) }} />

        <SumRows>
          <SumRow label="Invested amount" value={fmt(principal)} />
          <SumRow label={`Estimated returns · ${Math.round(r.iPct)}%`} value={fmt(r.returns)} />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="How your lump sum grows">
          A one-time investment compounds at the expected rate over the full period.
        </RailNote>
        <RailStat
          label="Total value" tone="data"
          value={fmt(r.total)}
          sub={`after ${yearsLabel}`}
        />
        <RailStat
          label="Estimated returns" tone="data"
          value={fmt(r.returns)}
          sub={`${Math.round(r.iPct)}% of the final value`}
        />
        <RailFormula
          label="The calculation"
          formula={<>FV = PV × (1 + r)<sup>n</sup></>}
          note="Future value = investment × (1 + rate) ^ years"
        />
      </CalcRail>
    </CalcGrid>
  );
}
