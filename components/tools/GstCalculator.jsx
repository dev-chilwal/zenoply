"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, NumberField, Field, Segmented, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoneyPrecise, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

export default function GstCalculator() {
  const reg = useRegion();
  const fmt = (n) => formatMoneyPrecise(n, reg);

  // Default amount + step scale with the region's currency.
  const money = useMemo(() => moneyRange({ default: MONEY_BASE, step: 100 }, reg.scale), [reg.scale]);

  const [amount, setAmount] = useState(money.default);
  const [rate, setRate] = useState(reg.taxStandardRate);
  // add = exclusive (price excludes tax), remove = inclusive (price includes tax)
  const [mode, setMode] = useState(reg.taxInclusiveDefault ? "remove" : "add");

  // Reset to the new region's defaults when the region changes.
  useEffect(() => {
    setAmount(money.default);
    setRate(reg.taxStandardRate);
    setMode(reg.taxInclusiveDefault ? "remove" : "add");
  }, [reg.code, money.default, reg.taxStandardRate, reg.taxInclusiveDefault]);

  const r = useMemo(() => {
    const taxRate = rate / 100;
    if (mode === "add") {
      const tax = amount * taxRate;
      return { base: amount, tax, total: amount + tax };
    }
    const base = amount / (1 + taxRate);
    return { base, tax: amount - base, total: amount };
  }, [amount, rate, mode]);

  const basePct = r.total > 0 ? (r.base / r.total) * 100 : 0;
  const taxPct = r.total > 0 ? (r.tax / r.total) * 100 : 0;

  return (
    <div>
      <Fields>
        <NumberField label="Amount" prefix={currencySymbol(reg)} value={amount} onChange={setAmount} min={0} step={money.step} />
        <Field label={`${reg.taxName} rate`}>
          <select className="inp" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}>
            {reg.taxRates.map((x) => <option key={x} value={x}>{x}%</option>)}
          </select>
        </Field>
        <Segmented
          ariaLabel={`${reg.taxName} mode`}
          value={mode}
          onChange={setMode}
          options={[{ value: "add", label: `Add ${reg.taxName}` }, { value: "remove", label: `Remove ${reg.taxName}` }]}
        />
      </Fields>
      <Result>
        <ResultHero
          label={mode === "add" ? `Total (incl. ${reg.taxName})` : `Base (excl. ${reg.taxName})`}
          value={fmt(mode === "add" ? r.total : r.base)}
        />
        <SplitBar a={basePct} b={taxPct} />
        <Legend left={{ k: "Base amount", v: fmt(r.base) }} right={{ k: `${reg.taxName} (${rate}%)`, v: fmt(r.tax) }} />
      </Result>
    </div>
  );
}
