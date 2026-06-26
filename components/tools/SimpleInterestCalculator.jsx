"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SplitBar, Legend,
  SumRows, SumRow, RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const PRINCIPAL_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };

export default function SimpleInterestCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(PRINCIPAL_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const interest = (principal * rate * years) / 100;
    const total = principal + interest;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (interest / total) * 100 : 0;
    const yrs = Math.max(1, Math.round(years));
    const series = Array.from({ length: yrs + 1 }, (_, i) => principal + (principal * rate * i) / 100);
    return { interest, total, pPct, iPct, series };
  }, [principal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Principal amount" hint="The amount you invest or borrow."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Simple interest rate per year."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={30} step={0.5}
        />
        <NumberInput
          label="Time period" hint="How long the money is invested or borrowed."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />

        <ResultStatement>
          After {yearsLabel}, {fmt(principal)} grows to <span className="pop">{fmt(r.total)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Total amount over time"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Principal", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />

        <SumRows>
          <SumRow label="Simple interest" value={fmt(r.interest)} />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="How it grows">
          Simple interest is charged only on the original principal — it does not compound.
        </RailNote>
        <RailStat
          label="Total amount" tone="data"
          value={fmt(r.total)}
          sub={`principal plus interest after ${yearsLabel}`}
        />
        <RailStat
          label="Interest earned" tone="loss"
          value={fmt(r.interest)}
          sub={`over ${yearsLabel} at ${rate}% p.a.`}
        />
        <RailFormula
          label="The calculation"
          formula={<>SI = (P × R × T) ÷ 100</>}
          note="Interest = principal × rate × years ÷ 100"
        />
      </CalcRail>
    </CalcGrid>
  );
}
