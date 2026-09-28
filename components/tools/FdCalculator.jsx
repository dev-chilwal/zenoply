"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SplitBar, Legend, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE, COMPOUND_LABEL } from "@/lib/locales";
import { depositAfterTax } from "@/lib/depositTax";

export default function FdCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.lumpsum, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);
  const [taxPct, setTaxPct] = useState(0);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Compounding frequency varies by country/bank convention (see lib/locales).
    const n = reg.fdCompounding || 4;
    const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
    const interest = amount - principal;
    const pPct = amount > 0 ? (principal / amount) * 100 : 0;
    const iPct = amount > 0 ? (interest / amount) * 100 : 0;
    const series = Array.from(
      { length: Math.max(1, Math.round(years)) + 1 },
      (_, i) => principal * Math.pow(1 + rate / 100 / n, n * i)
    );
    const after = depositAfterTax({
      invested: principal, interest, taxPct,
      effRatePct: (Math.pow(1 + rate / 100 / n, n) - 1) * 100,
    });
    return { amount, interest, pPct, iPct, series, after };
  }, [principal, rate, years, taxPct, reg.fdCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  const freqLabel = COMPOUND_LABEL[reg.fdCompounding] || "quarterly";

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Total investment" hint="The lump sum you deposit today."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Annual interest rate offered."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={15} step={0.1}
        />
        <NumberInput
          label="Time period" hint="How long the deposit stays invested."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={20} step={1}
        />
        <NumberInput
          label="Tax on interest" hint="Your income-tax slab rate. Leave at 0 to see pre-tax figures only."
          suffix="%" value={taxPct} onChange={setTaxPct}
          min={0} max={50} step={1}
        />

        <ResultStatement>
          After {yearsLabel}, your deposit grows to <span className="pop">{fmt(r.amount)}</span>
          {taxPct > 0 && <> — <span className="pop">{fmt(r.after.net)}</span> after {taxPct}% tax on the interest</>}.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Maturity value per year"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />

        {taxPct > 0 && (
          <SumRows>
            <SumRow label="Interest before tax" value={fmt(r.interest)} />
            <SumRow label={`Tax at ${taxPct}%`} value={fmt(r.after.tax)} />
            <SumRow label="Interest after tax" value={fmt(r.after.netInterest)} />
            <SumRow label="Post-tax rate (p.a.)" value={`${r.after.netYield.toFixed(2)}%`} />
          </SumRows>
        )}

        <p className="muted small" style={{ marginTop: ".75rem" }}>
          Assumes {freqLabel} compounding{reg.code === "IN" ? ", as used by most Indian banks" : ""}.
          {taxPct > 0 && " Tax is taken on the total interest and assumed paid from other income, so the deposit compounds in full."}
          {reg.code === "IN" && " Banks deduct 10% TDS once your interest from that bank passes ₹50,000 in a financial year (₹1 lakh for senior citizens; 20% without a PAN). TDS is an advance — what you finally owe is set by your slab rate."}
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="How your deposit grows">
          A fixed deposit earns compound interest at a guaranteed rate until maturity.
        </RailNote>
        <RailStat
          label="Maturity value" tone="data"
          value={fmt(r.amount)}
          sub={`after ${yearsLabel}`}
        />
        <RailStat
          label="Interest earned" tone="data"
          value={fmt(r.interest)}
          sub={`${Math.round(r.iPct)}% of the maturity value`}
        />
        {taxPct > 0 && (
          <RailStat
            label="Post-tax maturity" tone="data"
            value={fmt(r.after.net)}
            sub={`${r.after.netYield.toFixed(2)}% a year after tax — compare with tax-free rates`}
          />
        )}
        <RailFormula
          label="The calculation"
          formula={<>A = P × (1 + r/n)<sup>n·t</sup></>}
          note={taxPct > 0
            ? "Maturity = principal × (1 + rate/freq) ^ (freq × years); after tax = principal + interest × (1 − tax rate)"
            : "Maturity = principal × (1 + rate/freq) ^ (freq × years)"}
        />
      </CalcRail>
    </CalcGrid>
  );
}
