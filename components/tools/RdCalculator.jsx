"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SumRows, SumRow, SplitBar, Legend,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const DEPOSIT_BASE = { min: 500, max: 100000, step: 500, default: 5000 };

export default function RdCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(DEPOSIT_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [deposit, setDeposit] = useState(range.default);
  const [rate, setRate] = useState(7.2);
  const [months, setMonths] = useState(24);

  useEffect(() => { setDeposit(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Indian banks compound RD interest quarterly: each monthly instalment
    // earns interest compounded every quarter until maturity.
    const i = rate / 400;     // quarterly rate
    const n = months / 3;     // number of quarters
    const invested = deposit * months;
    const maturity = i === 0
      ? invested
      : deposit * (Math.pow(1 + i, n) - 1) / (1 - Math.pow(1 + i, -1 / 3));
    const interest = maturity - invested;
    const pPct = maturity > 0 ? (invested / maturity) * 100 : 0;
    const iPct = maturity > 0 ? (interest / maturity) * 100 : 0;
    // Per-year maturity series for the chart: maturity value reached if the
    // RD ran for each whole year up to the chosen tenure (same formula).
    const years = Math.max(1, Math.round(months / 12));
    const series = [0];
    for (let y = 1; y <= years; y++) {
      const m = Math.min(months, y * 12);
      const nq = m / 3;
      const inv = deposit * m;
      const mat = i === 0
        ? inv
        : deposit * (Math.pow(1 + i, nq) - 1) / (1 - Math.pow(1 + i, -1 / 3));
      series.push(mat);
    }
    return { maturity, invested, interest, pPct, iPct, series };
  }, [deposit, rate, months]);

  const monthsLabel = `${months} ${months === 1 ? "month" : "months"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Monthly deposit" hint="The amount you set aside each month."
          prefix={sym} value={deposit} onChange={setDeposit}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Annual rate offered by your bank."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={15} step={0.1}
        />
        <NumberInput
          label="Tenure" hint="In multiples of 3 months."
          suffix="months" value={months} onChange={setMonths}
          min={3} max={120} step={3}
        />

        <ResultStatement>
          After {monthsLabel}, your recurring deposit matures to <span className="pop">{fmt(r.maturity)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Maturity value by year"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(r.invested) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />

        <SumRows>
          <SumRow label="Total invested" value={fmt(r.invested)} />
          <SumRow label="Interest earned" value={fmt(r.interest)} />
        </SumRows>

        <p className="calc-disclaimer">
          Assumes quarterly compounding, as used by most Indian banks. Tenure is set in multiples of 3 months to match quarterly interest credits.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What your RD earns">
          A recurring deposit grows each monthly instalment with quarterly compounding.
        </RailNote>
        <RailStat
          label="Maturity value" tone="data"
          value={fmt(r.maturity)}
          sub={`after ${monthsLabel}`}
        />
        <RailStat
          label="Interest earned" tone="data"
          value={fmt(r.interest)}
          sub={`${Math.round(r.iPct)}% of maturity`}
        />
        <RailFormula
          label="The calculation"
          formula={<>M = P × [(1 + i)<sup>n</sup> − 1] ÷ (1 − (1 + i)<sup>−1/3</sup>)</>}
          note="i = rate ÷ 400 (quarterly), n = months ÷ 3 (quarters)"
        />
      </CalcRail>
    </CalcGrid>
  );
}
