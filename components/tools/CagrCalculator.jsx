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

const INITIAL_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };
const FINAL_BASE = { min: 1000, max: 10000000, step: 10000, default: 200000 };

export default function CagrCalculator() {
  const reg = useRegion();
  const initRange = useMemo(() => moneyRange(INITIAL_BASE, reg.scale), [reg.scale]);
  const finalRange = useMemo(() => moneyRange(FINAL_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [initialValue, setInitialValue] = useState(initRange.default);
  const [finalValue, setFinalValue] = useState(finalRange.default);
  const [years, setYears] = useState(5);

  useEffect(() => {
    setInitialValue(initRange.default);
    setFinalValue(finalRange.default);
  }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const cagr = initialValue > 0 ? (Math.pow(finalValue / initialValue, 1 / years) - 1) * 100 : 0;
    const totalGrowth = initialValue > 0 ? (finalValue / initialValue - 1) * 100 : 0;
    const gain = finalValue - initialValue;
    const series = Array.from({ length: years + 1 }, (_, i) => initialValue * Math.pow(1 + cagr / 100, i));
    return { cagr, totalGrowth, gain, series };
  }, [initialValue, finalValue, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Initial value" hint="What the investment was worth at the start."
          prefix={sym} value={initialValue} onChange={setInitialValue}
          min={initRange.min} max={initRange.max} step={initRange.step}
        />
        <NumberInput
          label="Final value" hint="What the investment is worth now."
          prefix={sym} value={finalValue} onChange={setFinalValue}
          min={finalRange.min} max={finalRange.max} step={finalRange.step}
        />
        <NumberInput
          label="Number of years" hint="The holding period."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />

        <ResultStatement>
          Over {yearsLabel}, your money grew at <span className="pop">{r.cagr.toFixed(2)}%</span> a year.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Value growth at the CAGR rate"
        />

        <SumRows>
          <SumRow label="Absolute gain" value={fmt(r.gain)} />
          <SumRow label="Total growth" value={`${r.totalGrowth.toFixed(1)}%`} />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="The smoothed annual rate">
          CAGR is the steady yearly rate that takes the initial value to the final value.
        </RailNote>
        <RailStat
          label={`CAGR over ${yearsLabel}`} tone="data"
          value={`${r.cagr.toFixed(2)}%`}
          sub="compounded annual growth rate"
        />
        <RailStat
          label="Absolute gain" tone="data"
          value={fmt(r.gain)}
          sub={`${r.totalGrowth.toFixed(1)}% over the whole period`}
        />
        <RailFormula
          label="The calculation"
          formula={<>CAGR = (FV / PV)<sup>1/n</sup> − 1</>}
          note="rate = (final ÷ initial) ^ (1 / years) − 1"
        />
      </CalcRail>
    </CalcGrid>
  );
}
