"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const INITIAL_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };
const FINAL_BASE = { min: 1000, max: 10000000, step: 10000, default: 200000 };

export default function CagrCalculator() {
  const reg = useRegion();
  const initRange = useMemo(() => moneyRange(INITIAL_BASE, reg.scale), [reg.scale]);
  const finalRange = useMemo(() => moneyRange(FINAL_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

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
    return { cagr, totalGrowth, gain };
  }, [initialValue, finalValue, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Initial value" display={fmt(initialValue)} value={initialValue} min={initRange.min} max={initRange.max} step={initRange.step} onChange={setInitialValue} />
        <Slider label="Final value" display={fmt(finalValue)} value={finalValue} min={finalRange.min} max={finalRange.max} step={finalRange.step} onChange={setFinalValue} />
        <Slider label="Number of years" display={yearsLabel} value={years} min={1} max={40} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label={`CAGR over ${yearsLabel}`} value={`${r.cagr.toFixed(2)}%`} />
      </Result>
      <Rows>
        <Row label="Absolute gain" val={fmt(r.gain)} />
        <Row label="Total growth" val={`${r.totalGrowth.toFixed(1)}%`} />
      </Rows>
    </div>
  );
}
