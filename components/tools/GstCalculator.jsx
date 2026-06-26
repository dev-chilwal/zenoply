"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, NumberField, Field, Segmented, Result, ResultHero, SplitBar, Legend } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoneyPrecise, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

export default function GstCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.price, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoneyPrecise(n, reg);
  const tax = reg.taxName; // "GST" / "VAT" / "Sales Tax" / "GST/HST", per region

  const [amount, setAmount] = useState(range.default);
  const [rate, setRate] = useState(reg.taxStandard);
  // mode: "add" = price is tax-exclusive, "remove" = price is tax-inclusive.
  const [mode, setMode] = useState(reg.taxInclusiveDefault ? "remove" : "add");

  // When the region/currency changes, reset amount, rate, and inclusive default.
  useEffect(() => {
    setAmount(range.default);
    setRate(reg.taxStandard);
    setMode(reg.taxInclusiveDefault ? "remove" : "add");
  }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const taxRate = rate / 100;
    if (mode === "add") {
      const t = amount * taxRate;
      return { base: amount, tax: t, total: amount + t };
    }
    const base = amount / (1 + taxRate);
    return { base, tax: amount - base, total: amount };
  }, [amount, rate, mode]);

  const basePct = r.total > 0 ? (r.base / r.total) * 100 : 0;
  const taxPct = r.total > 0 ? (r.tax / r.total) * 100 : 0;

  return (
    <div>
      <Fields>
        <NumberField label="Amount" prefix={currencySymbol(reg)} value={amount} onChange={setAmount} min={range.min} step={range.step} />
        <Field label={`${tax} rate`}>
          <select className="inp" value={rate} onChange={(e) => setRate(parseFloat(e.target.value))}>
            {reg.taxRates.map((x) => <option key={x} value={x}>{x}%</option>)}
          </select>
        </Field>
        <Segmented
          ariaLabel={`${tax} mode`}
          value={mode}
          onChange={setMode}
          options={[{ value: "add", label: `Add ${tax}` }, { value: "remove", label: `Remove ${tax}` }]}
        />
      </Fields>
      <Result>
        <ResultHero
          label={mode === "add" ? `Total (incl. ${tax})` : `Base (excl. ${tax})`}
          value={fmt(mode === "add" ? r.total : r.base)}
        />
        <SplitBar a={basePct} b={taxPct} />
        <Legend left={{ k: "Base amount", v: fmt(r.base) }} right={{ k: `${tax} (${rate}%)`, v: fmt(r.tax) }} />
      </Result>
    </div>
  );
}
