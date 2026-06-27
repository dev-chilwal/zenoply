"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SplitBar, Legend,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

// `defaultStepUp` lets the dedicated /step-up-sip-calculator page reuse this
// same component with the annual step-up pre-filled. 0 = a plain SIP.
export default function SipCalculator({ defaultStepUp = 0 } = {}) {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.sipMonthly, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [amount, setAmount] = useState(range.default);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [stepUp, setStepUp] = useState(defaultStepUp);

  // Reset the currency-denominated amount when the region/currency changes.
  useEffect(() => { setAmount(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const i = rate / 12 / 100;
    const n = years * 12;
    const s = stepUp / 100;

    if (s === 0) {
      // Plain SIP — closed-form annuity due (kept identical for no regression).
      const invested = amount * n;
      const fv = i === 0 ? invested : amount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
      const returns = Math.max(0, fv - invested);
      const rPct = fv > 0 ? (returns / fv) * 100 : 0;
      const series = Array.from({ length: years + 1 }, (_, y) => {
        const m = y * 12;
        return i === 0 ? amount * m : amount * ((Math.pow(1 + i, m) - 1) / i) * (1 + i);
      });
      return { fv, invested, returns, rPct, iPct: 100 - rPct, series };
    }

    // Step-up SIP — the monthly amount rises by `s` each year. Iterate monthly
    // (annuity due: add the contribution, then apply the month's growth).
    let balance = 0, invested = 0;
    const series = [0];
    for (let m = 1; m <= n; m++) {
      const yearIdx = Math.floor((m - 1) / 12);
      const contribution = amount * Math.pow(1 + s, yearIdx);
      balance = (balance + contribution) * (1 + i);
      invested += contribution;
      if (m % 12 === 0) series.push(balance);
    }
    const returns = Math.max(0, balance - invested);
    const rPct = balance > 0 ? (returns / balance) * 100 : 0;
    return { fv: balance, invested, returns, rPct, iPct: 100 - rPct, series };
  }, [amount, rate, years, stepUp]);

  const yearsLabel = years + (years === 1 ? " year" : " years");

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Monthly investment" hint="How much you invest each month."
          prefix={sym} value={amount} onChange={setAmount}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Expected return (p.a.)" hint="Estimated annual return rate."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={30} step={0.5}
        />
        <NumberInput
          label="Time period" hint="How long you keep investing."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />
        <NumberInput
          label="Annual step-up" hint="Raise your monthly amount by this % each year. 0 = a regular SIP."
          suffix="%" value={stepUp} onChange={setStepUp}
          min={0} max={25} step={1}
        />

        <ResultStatement>
          {stepUp > 0 ? (
            <>Stepping up {fmt(amount)}/month by {stepUp}% a year, your SIP could grow to{" "}
              <span className="pop">{fmt(r.fv)}</span> in {yearsLabel}.</>
          ) : (
            <>After {yearsLabel}, your SIP could grow to <span className="pop">{fmt(r.fv)}</span>.</>
          )}
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Total value per year"
        />

        <SplitBar a={r.iPct} b={r.rPct} />
        <Legend
          left={{ k: "Invested", v: fmt(r.invested) }}
          right={{ k: `Est. returns · ${Math.round(r.rPct)}%`, v: fmt(r.returns) }}
        />
      </CalcMain>

      <CalcRail>
        <RailNote title="How your money grows">
          {stepUp > 0
            ? "Raising your SIP each year invests more as your income grows, so the corpus compounds faster."
            : "Monthly contributions compound over time, so returns build on returns."}
        </RailNote>
        <RailStat
          label="Total invested" tone="loss"
          value={fmt(r.invested)}
          sub={`paid in over ${yearsLabel}`}
        />
        <RailStat
          label="Estimated returns" tone="data"
          value={fmt(r.returns)}
          sub={`${Math.round(r.rPct)}% of the final value`}
        />
        <RailFormula
          label="The calculation"
          formula={<>FV = P × ((1 + i)<sup>n</sup> − 1) / i × (1 + i)</>}
          note={stepUp > 0
            ? "Each year the monthly amount P rises by the step-up %, compounded month by month."
            : "P = monthly amount, i = monthly rate, n = number of months"}
        />
      </CalcRail>
    </CalcGrid>
  );
}
