"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SplitBar, Legend, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

export default function EmiCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.loan, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const n = years * 12;
    const i = rate / 100 / 12;
    const emi = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;
    const interest = total - principal;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (interest / total) * 100 : 0;

    // Outstanding balance at the end of each year (index 0 = today's principal).
    const series = [principal];
    let bal = principal;
    for (let m = 1; m <= n; m++) {
      const interestPart = bal * i;
      bal = bal + interestPart - emi;
      if (bal < 0) bal = 0;
      if (m % 12 === 0) series.push(bal);
    }

    return { emi, total, interest, pPct, iPct, series };
  }, [principal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Loan amount" hint="The amount you want to borrow."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Annual interest rate on the loan."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={20} step={0.1}
        />
        <NumberInput
          label="Loan tenure" hint="How long you take to repay."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={30} step={1}
        />

        <ResultStatement>
          Your monthly EMI is <span className="pop">{fmt(r.emi)}</span> for {yearsLabel}.
        </ResultStatement>

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Principal", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Outstanding balance by year"
        />

        <SumRows>
          <SumRow label="Total payment" value={fmt(r.total)} />
          <SumRow label="Total interest" value={fmt(r.interest)} />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="What you actually pay">
          Your EMI stays fixed, but early payments are mostly interest before the balance falls.
        </RailNote>
        <RailStat
          label="Monthly EMI" tone="data"
          value={fmt(r.emi)}
          sub={`every month for ${yearsLabel}`}
        />
        <RailStat
          label="Total interest" tone="loss"
          value={fmt(r.interest)}
          sub={`${Math.round(r.iPct)}% of what you repay`}
        />
        <RailFormula
          label="The calculation"
          formula={<>EMI = P · i · (1 + i)<sup>n</sup> / ((1 + i)<sup>n</sup> − 1)</>}
          note="P = principal, i = monthly rate, n = number of months"
        />
      </CalcRail>
    </CalcGrid>
  );
}
