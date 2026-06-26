"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SplitBar, Legend, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const DEPOSIT_BASE = { min: 500, max: 150000, step: 500, default: 150000 };

export default function PpfCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(DEPOSIT_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [deposit, setDeposit] = useState(range.default);
  const [rate, setRate] = useState(7.1);
  const [years, setYears] = useState(15);

  useEffect(() => { setDeposit(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Deposit at the start of each year, compounded annually (annuity-due).
    const i = rate / 100;
    const maturity = i === 0
      ? deposit * years
      : deposit * ((Math.pow(1 + i, years) - 1) / i) * (1 + i);
    const invested = deposit * years;
    const interest = maturity - invested;
    const pPct = maturity > 0 ? (invested / maturity) * 100 : 0;
    const iPct = maturity > 0 ? (interest / maturity) * 100 : 0;
    // Per-year closing balance series (starts at 0, deposit at start of each year).
    const series = [0];
    let bal = 0;
    for (let y = 1; y <= years; y++) {
      bal = (bal + deposit) * (1 + i);
      series.push(bal);
    }
    return { maturity, invested, interest, pPct, iPct, series };
  }, [deposit, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Yearly deposit" hint="Contributed at the start of each year."
          prefix={sym} value={deposit} onChange={setDeposit}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Government-set PPF rate."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={12} step={0.1}
        />
        <NumberInput
          label="Time period" hint="PPF has a 15-year base tenure."
          suffix="yrs" value={years} onChange={setYears}
          min={15} max={50} step={5}
        />

        <ResultStatement>
          After {yearsLabel}, your PPF account grows to <span className="pop">{fmt(r.maturity)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Balance per year"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(r.invested) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />

        <SumRows>
          <SumRow label="Total invested" value={fmt(r.invested)} />
          <SumRow label="Interest earned" value={fmt(r.interest)} />
        </SumRows>

        <p className="calc-disclaimer">
          Assumes a deposit at the start of each year, compounded annually. PPF has a 15-year base tenure (extendable in 5-year blocks); the government revises the rate each quarter (currently 7.1%).
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What you'll have">
          PPF compounds annually and is fully tax-free at maturity.
        </RailNote>
        <RailStat
          label="Maturity value" tone="data"
          value={fmt(r.maturity)}
          sub={`after ${yearsLabel}`}
        />
        <RailStat
          label="Interest earned" tone="data"
          value={fmt(r.interest)}
          sub={`${Math.round(r.iPct)}% of the maturity value`}
        />
        <RailFormula
          label="The calculation"
          formula={<>M = P × ((1 + i)<sup>n</sup> − 1) ÷ i × (1 + i)</>}
          note="Annuity-due: each deposit compounds from the start of its year."
        />
      </CalcRail>
    </CalcGrid>
  );
}
