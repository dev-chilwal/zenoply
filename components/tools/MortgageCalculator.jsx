"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, ScheduleTable, SplitBar, Legend, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoneyPrecise, formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";
import { amortize, monthsToLabel } from "@/lib/amortization";

const EXTRA_BASE = { min: 0, max: 100000, step: 1000, default: 0 };

export default function MortgageCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.mortgage, reg.scale), [reg.scale]);
  const extraRange = useMemo(() => moneyRange(EXTRA_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoneyPrecise(n, reg);
  const fmtWhole = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extra, setExtra] = useState(0);

  useEffect(() => { setPrincipal(range.default); setExtra(0); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const n = years * 12;
    // Most markets compound monthly; Canada uses federally-regulated
    // semi-annual compounding, so derive the effective monthly rate.
    const cmp = reg.mortgageCompounding || 12;
    const i = Math.pow(1 + rate / 100 / cmp, cmp / 12) - 1;
    const base = amortize({ principal, monthlyRate: i, termMonths: n, extraMonthly: 0 });
    const plan = amortize({ principal, monthlyRate: i, termMonths: n, extraMonthly: extra });
    const interest = plan.totalInterest;
    const total = plan.totalPaid;
    const pPct = total > 0 ? (principal / total) * 100 : 0;
    const iPct = total > 0 ? (interest / total) * 100 : 0;
    const monthsSaved = Math.max(0, n - plan.payoffMonths);
    const interestSaved = Math.max(0, base.totalInterest - plan.totalInterest);
    return { emi: base.emi, total, interest, pPct, iPct, plan, monthsSaved, interestSaved };
  }, [principal, rate, years, extra, reg.mortgageCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  const scheduleRows = r.plan.yearly.map((y) => ({
    year: y.year,
    principal: fmtWhole(y.principalPaid),
    interest: fmtWhole(y.interestPaid),
    balance: fmtWhole(y.balance),
  }));

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
        <NumberInput
          label="Extra payment / month" hint="Optional. Pay more each month to finish early."
          prefix={sym} value={extra} onChange={setExtra}
          min={extraRange.min} max={extraRange.max} step={extraRange.step}
        />

        <ResultStatement>
          Your monthly payment is <span className="pop">{fmt(r.emi)}</span> over {yearsLabel}.
          {extra > 0 && r.monthsSaved > 0 && (
            <> Adding <span className="pop">{fmt(extra)}</span> a month clears it in{" "}
              <span className="pop">{monthsToLabel(r.plan.payoffMonths)}</span>, saving {fmt(r.interestSaved)} in interest.</>
          )}
        </ResultStatement>

        <MiniChart
          series={r.plan.balanceSeries}
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
          <SumRow label="Total interest" value={fmt(r.interest)} />
          {extra > 0 && r.interestSaved > 0 && <SumRow label="Interest saved" value={fmt(r.interestSaved)} />}
          {extra > 0 && r.monthsSaved > 0 && <SumRow label="Time saved" value={monthsToLabel(r.monthsSaved)} />}
        </SumRows>

        <ScheduleTable rows={scheduleRows} caption="Year-by-year amortization schedule" />

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
          label={extra > 0 && r.interestSaved > 0 ? "Interest saved" : "Total interest"}
          tone={extra > 0 && r.interestSaved > 0 ? "data" : "loss"}
          value={fmt(extra > 0 && r.interestSaved > 0 ? r.interestSaved : r.interest)}
          sub={extra > 0 && r.interestSaved > 0 ? `paying ${fmt(extra)}/mo extra` : `on top of ${fmt(principal)} borrowed`}
        />
        <RailStat
          label="Total paid" tone="data"
          value={fmt(r.total)}
          sub={`over ${monthsToLabel(r.plan.payoffMonths)}`}
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
