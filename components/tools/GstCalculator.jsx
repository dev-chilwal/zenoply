"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  Field, Segmented, SplitBar, Legend,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoneyPrecise, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

export default function GstCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.price, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoneyPrecise(n, reg);
  const tax = reg.taxName; // "GST" / "VAT" / "Sales Tax" / "GST/HST", per region

  const [amount, setAmount] = useState(range.default);
  const [rate, setRate] = useState(reg.taxStandard);
  // mode: "add" = price is tax-exclusive, "remove" = price is tax-inclusive.
  const [mode, setMode] = useState(reg.taxInclusiveDefault ? "remove" : "add");
  // India only: "intra" = sale within one state (CGST + SGST halves),
  // "inter" = sale between states (one IGST line). Total tax is identical.
  const [supply, setSupply] = useState("intra");
  const isIndia = reg.code === "IN";
  const half = rate / 2;

  // When the region/currency changes, reset amount, rate, and inclusive default.
  useEffect(() => {
    setAmount(range.default);
    setRate(reg.taxStandard);
    setMode(reg.taxInclusiveDefault ? "remove" : "add");
    setSupply("intra");
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
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Amount" hint={mode === "add" ? `Price before ${tax}.` : `Price including ${tax}.`}
          prefix={sym} value={amount} onChange={setAmount}
          min={range.min} step={range.step}
        />
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
        {isIndia && (
          <Segmented
            ariaLabel="Type of supply"
            value={supply}
            onChange={setSupply}
            options={[{ value: "intra", label: "Within state" }, { value: "inter", label: "Between states" }]}
          />
        )}

        <ResultStatement>
          {mode === "add"
            ? <>Adding {rate}% {tax} makes the total <span className="pop">{fmt(r.total)}</span>.</>
            : <>Removing {rate}% {tax} leaves a base of <span className="pop">{fmt(r.base)}</span>.</>}
        </ResultStatement>

        <SplitBar a={basePct} b={taxPct} />
        <Legend left={{ k: "Base amount", v: fmt(r.base) }} right={{ k: `${tax} (${rate}%)`, v: fmt(r.tax) }} />

        <SumRows>
          <SumRow label="Base amount" value={fmt(r.base)} />
          {isIndia && supply === "intra" && <>
            <SumRow label={`CGST (${half}%)`} value={fmt(r.tax / 2)} />
            <SumRow label={`SGST (${half}%)`} value={fmt(r.tax / 2)} />
          </>}
          {isIndia && supply === "inter" && <SumRow label={`IGST (${rate}%)`} value={fmt(r.tax)} />}
          <SumRow label={isIndia ? `Total GST (${rate}%)` : `${tax} (${rate}%)`} value={fmt(r.tax)} />
          <SumRow label={`Total (incl. ${tax})`} value={fmt(r.total)} />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title={mode === "add" ? `Adding ${tax}` : `Removing ${tax}`}>
          {mode === "add"
            ? `${tax} is added on top of the base price to reach the total.`
            : `${tax} is stripped out of the total to find the base price.`}
        </RailNote>
        <RailStat
          label={`${tax} amount`} tone="loss"
          value={fmt(r.tax)}
          sub={`at ${rate}%`}
        />
        {isIndia && (
          <RailNote title={supply === "intra" ? "CGST + SGST" : "IGST"}>
            {supply === "intra"
              ? `A sale within one state splits the ${rate}% equally: ${half}% CGST to the Centre and ${half}% SGST to the state (UTGST in a union territory without a legislature). An invoice rounds each line to the paisa, so the two can differ by a paisa from a single ${rate}% line.`
              : `A sale to another state, an import or a supply to an SEZ carries the whole ${rate}% as one IGST line. The tax is the same as CGST + SGST — only who collects it changes.`}
          </RailNote>
        )}
        <RailStat
          label={mode === "add" ? `Total (incl. ${tax})` : `Base (excl. ${tax})`} tone="data"
          value={fmt(mode === "add" ? r.total : r.base)}
        />
        <RailFormula
          label="The calculation"
          formula={mode === "add"
            ? <>total = base × (1 + r)</>
            : <>base = total ÷ (1 + r)</>}
          note={mode === "add"
            ? `${tax} = amount × rate; total = amount + ${tax}`
            : `base = amount ÷ (1 + rate); ${tax} = amount − base`}
        />
      </CalcRail>
    </CalcGrid>
  );
}
