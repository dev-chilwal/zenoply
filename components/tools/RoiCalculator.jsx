"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const INVEST_BASE = { min: 1000, max: 100000000, step: 10000, default: 100000 };
const FINAL_BASE = { min: 0, max: 100000000, step: 10000, default: 150000 };

export default function RoiCalculator() {
  const reg = useRegion();
  const investRange = useMemo(() => moneyRange(INVEST_BASE, reg.scale), [reg.scale]);
  const finalRange = useMemo(() => moneyRange(FINAL_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
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
  const gainLabel = r.netGain >= 0 ? "Net gain" : "Net loss";

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Amount invested" hint="What you originally put in."
          prefix={sym} value={invested} onChange={setInvested}
          min={investRange.min} max={investRange.max} step={investRange.step}
        />
        <NumberInput
          label="Final / returned value" hint="What the investment is worth now."
          prefix={sym} value={finalValue} onChange={setFinalValue}
          min={finalRange.min} max={finalRange.max} step={finalRange.step}
        />
        <NumberInput
          label="Holding period (optional)" hint="Years held, for annualized ROI."
          suffix="yrs" value={years} onChange={setYears}
          min={0} max={50} step={1}
        />

        <ResultStatement>
          {fmt(invested)} growing to {fmt(finalValue)} is a return of <span className="pop">{r.roiPct.toFixed(2)}%</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label={gainLabel} value={fmt(r.netGain)} />
          {r.annualized !== null && <SumRow label="Annualized ROI" value={`${r.annualized.toFixed(2)}%`} />}
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="Return on investment">
          ROI measures how much you gained or lost relative to what you put in.
        </RailNote>
        <RailStat
          label="Return on investment" tone={r.netGain >= 0 ? "data" : "loss"}
          value={`${r.roiPct.toFixed(2)}%`}
          sub={`${gainLabel.toLowerCase()} of ${fmt(r.netGain)}`}
        />
        {r.annualized !== null && (
          <RailStat
            label="Annualized ROI" tone="data"
            value={`${r.annualized.toFixed(2)}%`}
            sub={`per year over ${yearsLabel}`}
          />
        )}
        <RailFormula
          label="The calculation"
          formula={<>ROI = (V<sub>final</sub> − V<sub>invested</sub>) ÷ V<sub>invested</sub></>}
          note="ROI = (final − invested) / invested × 100"
        />
      </CalcRail>
    </CalcGrid>
  );
}
