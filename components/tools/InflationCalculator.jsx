"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const AMOUNT_BASE = { min: 1000, max: 10000000, step: 10000, default: 100000 };

export default function InflationCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(AMOUNT_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [amount, setAmount] = useState(range.default);
  const [inflation, setInflation] = useState(6);
  const [years, setYears] = useState(10);

  useEffect(() => { setAmount(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const factor = Math.pow(1 + inflation / 100, years);
    const futureCost = amount * factor;
    const purchasingPower = amount / factor;
    const increase = futureCost - amount;
    return { futureCost, purchasingPower, increase };
  }, [amount, inflation, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <div>
      <Fields>
        <Slider label="Current amount / cost" display={fmt(amount)} value={amount} min={range.min} max={range.max} step={range.step} onChange={setAmount} />
        <Slider label="Annual inflation rate" display={`${inflation}%`} value={inflation} min={0} max={20} step={0.1} onChange={setInflation} />
        <Slider label="Number of years" display={yearsLabel} value={years} min={1} max={50} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label={`What it will cost in ${yearsLabel}`} value={fmt(r.futureCost)} />
      </Result>
      <Rows>
        <Row label={`Purchasing power of today's amount in ${yearsLabel}`} val={fmt(r.purchasingPower)} />
        <Row label="Total increase in cost" val={fmt(r.increase)} />
      </Rows>
    </div>
  );
}
