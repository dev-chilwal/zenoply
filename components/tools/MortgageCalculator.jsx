"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SplitBar, Legend, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoneyPrecise, formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

export default function MortgageCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.mortgage, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoneyPrecise(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const n = years * 12;
    // Most markets compound monthly; Canada uses federally-regulated
    // semi-annual compounding, so derive the effective monthly rate.
    const cmp = reg.mortgageCompounding || 12;
    const i = Math.pow(1 + rate / 100 / cmp, cmp / 12) - 1;
    const emi = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;
    const interest = total - principal;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (interest / total) * 100 : 0;
    // Outstanding balance at the end of each year (amortisation curve).
    const series = [principal];
    let bal = principal;
    for (let m = 1; m <= n; m++) {
      bal = bal + bal * i - emi;
      if (m % 12 === 0) series.push(Math.max(0, bal));
    }
    return { emi, total, interest, pPct, iPct, series };
  }, [principal, rate, years, reg.mortgageCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Loan amount" hint="The amount you borrow."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Annual interest rate on the loan."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={15} step={0.1}
        />
        <NumberInput
          label="Loan term" hint="How long you take to repay."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />

        <ResultStatement>
          Your monthly payment is <span className="pop">{fmt(r.emi)}</span> over {yearsLabel}.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Outstanding balance by year"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend
          left={{ k: "Principal", v: fmt(principal) }}
          right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }}
        />

        <SumRows>
          <SumRow label="Total paid" value={fmt(r.total)} />
        </SumRows>

        {reg.mortgageCompounding === 2 && (
          <p className="calc-disclaimer">
            Uses semi-annual compounding, the regulated standard for Canadian fixed-rate mortgages.
          </p>
        )}
      </CalcMain>

      <CalcRail>
        <RailNote title="What you'll repay">
          Your monthly payment covers both principal and interest over the full term.
        </RailNote>
        <RailStat
          label="Total interest" tone="loss"
          value={fmt(r.interest)}
          sub={`on top of ${fmt(principal)} borrowed`}
        />
        <RailStat
          label="Total paid" tone="data"
          value={fmt(r.total)}
          sub={`over ${yearsLabel}`}
        />
        <RailFormula
          label="The calculation"
          formula={<>EMI = P × i × (1 + i)<sup>n</sup> ÷ ((1 + i)<sup>n</sup> − 1)</>}
          note="P = principal, i = monthly rate, n = number of months"
        />
      </CalcRail>
    </CalcGrid>
  );
}
