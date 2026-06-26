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

const AMOUNT_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };

export default function InflationCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(AMOUNT_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [amount, setAmount] = useState(range.default);
  const [inflation, setInflation] = useState(6);
  const [years, setYears] = useState(10);

  useEffect(() => { setAmount(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const yrs = Math.max(1, Math.round(years));
    const factor = Math.pow(1 + inflation / 100, yrs);
    const futureCost = amount * factor;
    const purchasingPower = amount / factor;
    const increase = futureCost - amount;
    const series = Array.from({ length: yrs + 1 }, (_, i) => amount * Math.pow(1 + inflation / 100, i));
    return { yrs, futureCost, purchasingPower, increase, series };
  }, [amount, inflation, years]);

  const yearsLabel = `${r.yrs} ${r.yrs === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Current amount" hint="The amount in today's money."
          prefix={sym} value={amount} onChange={setAmount}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Annual inflation rate" hint="Expected average inflation per year."
          suffix="%" value={inflation} onChange={setInflation}
          min={0} max={20} step={0.1}
        />
        <NumberInput
          label="Number of years" hint="How far into the future."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={50} step={1}
        />

        <ResultStatement>
          In {yearsLabel}, {fmt(amount)} costs <span className="pop">{fmt(r.futureCost)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Cost over time"
        />

        <SumRows>
          <SumRow label={`Purchasing power of ${fmt(amount)} then`} value={fmt(r.purchasingPower)} />
          <SumRow label="Total increase in cost" value={fmt(r.increase)} />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="What your money loses">
          Inflation reduces the purchasing power of your money over time.
        </RailNote>
        <RailStat
          label="Your spending power" tone="loss"
          value={fmt(r.purchasingPower)}
          sub={`in today's money after ${yearsLabel}`}
        />
        <RailStat
          label="Total increase in cost" tone="data"
          value={fmt(r.increase)}
          sub={`over the next ${yearsLabel}`}
        />
        <RailFormula
          label="The calculation"
          formula={<>FV = PV × (1 + r)<sup>n</sup></>}
          note="Future cost = amount × (1 + rate) ^ years"
        />
      </CalcRail>
    </CalcGrid>
  );
}
