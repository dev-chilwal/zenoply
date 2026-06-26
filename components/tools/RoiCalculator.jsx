"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const INVEST_BASE = { min: 1000, max: 100000000, step: 10000, default: 100000 };
const FINAL_BASE = { min: 0, max: 100000000, step: 10000, default: 150000 };

export default function RoiCalculator() {
  const reg = useRegion();
  const investRange = useMemo(() => moneyRange(INVEST_BASE, reg.scale), [reg.scale]);
  const finalRange = useMemo(() => moneyRange(FINAL_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [invested, setInvested] = useState(investRange.default);
  const [finalValue, setFinalValue] = useState(finalRange.default);
  const [years, setYears] = useState(3);

  useEffect(() => {
    setInvested(investRange.default);
    setFinalValue(finalRange.default);
  }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const netGain = finalValue - invested;
    const roiPct = invested > 0 ? (netGain / invested) * 100 : 0;
    const annualized = invested > 0 && years > 0 && finalValue > 0
      ? (Math.pow(finalValue / invested, 1 / years) - 1) * 100
      : null;
    return { netGain, roiPct, annualized };
  }, [invested, finalValue, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Amount invested" display={fmt(invested)} value={invested} min={investRange.min} max={investRange.max} step={investRange.step} onChange={setInvested} />
        <Slider label="Final / returned value" display={fmt(finalValue)} value={finalValue} min={finalRange.min} max={finalRange.max} step={finalRange.step} onChange={setFinalValue} />
        <Slider label="Holding period (optional)" display={years === 0 ? "—" : yearsLabel} value={years} min={0} max={50} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label="Return on investment" value={`${r.roiPct.toFixed(2)}%`} />
      </Result>
      <Rows>
        <Row label={r.netGain >= 0 ? "Net gain" : "Net loss"} val={fmt(r.netGain)} />
        {r.annualized !== null && <Row label="Annualized ROI" val={`${r.annualized.toFixed(2)}%`} />}
      </Rows>
    </div>
  );
}
