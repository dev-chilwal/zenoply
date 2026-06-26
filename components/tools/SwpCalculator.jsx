"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const INVEST_BASE = { min: 10000, max: 100000000, step: 10000, default: 1000000 };
const WITHDRAW_BASE = { min: 500, max: 1000000, step: 500, default: 10000 };

export default function SwpCalculator() {
  const reg = useRegion();
  const investRange = useMemo(() => moneyRange(INVEST_BASE, reg.scale), [reg.scale]);
  const withdrawRange = useMemo(() => moneyRange(WITHDRAW_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [investment, setInvestment] = useState(investRange.default);
  const [withdrawal, setWithdrawal] = useState(withdrawRange.default);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(10);

  useEffect(() => {
    setInvestment(investRange.default);
    setWithdrawal(withdrawRange.default);
  }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Withdrawals at the end of each month; balance compounds monthly.
    // Iterate so the corpus can deplete partway and we report when it runs out.
    const i = rate / 12 / 100;
    const n = years * 12;
    let balance = investment;
    let monthsWithdrawn = 0;
    let depleted = false;
    const series = [investment]; // remaining balance at the end of each year (index 0 = start)
    for (let m = 1; m <= n; m++) {
      balance = balance * (1 + i) - withdrawal;
      monthsWithdrawn = m;
      if (balance <= 0) { balance = 0; depleted = true; series.push(0); break; }
      if (m % 12 === 0) series.push(balance);
    }
    const totalWithdrawn = withdrawal * monthsWithdrawn;
    return { finalBalance: balance, totalWithdrawn, depleted, depletionMonth: depleted ? monthsWithdrawn : null, series };
  }, [investment, withdrawal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  const depletionLabel = r.depletionMonth
    ? `${Math.floor(r.depletionMonth / 12)} years ${r.depletionMonth % 12} months`
    : null;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Total investment" hint="Your starting corpus."
          prefix={sym} value={investment} onChange={setInvestment}
          min={investRange.min} max={investRange.max} step={investRange.step}
        />
        <NumberInput
          label="Monthly withdrawal" hint="Amount drawn at the end of each month."
          prefix={sym} value={withdrawal} onChange={setWithdrawal}
          min={withdrawRange.min} max={withdrawRange.max} step={withdrawRange.step}
        />
        <NumberInput
          label="Expected return (p.a.)" hint="Annual return, compounded monthly."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={30} step={0.5}
        />
        <NumberInput
          label="Time period" hint="How long you keep withdrawing."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />

        <ResultStatement>
          After {yearsLabel}, your balance is <span className="pop">{fmt(r.finalBalance)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Remaining balance by year"
        />

        <SumRows>
          <SumRow label="Total withdrawn" value={fmt(r.totalWithdrawn)} />
          <SumRow label="Total invested" value={fmt(investment)} />
        </SumRows>

        {r.depleted && (
          <p className="muted small" style={{ marginTop: ".75rem" }}>
            At this withdrawal rate your corpus runs out in about {depletionLabel}, before the end of the chosen period.
          </p>
        )}
        <p className="calc-disclaimer">
          Assumes withdrawals at the end of each month with returns compounded monthly. Actual mutual-fund returns vary.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What a SWP does">
          A systematic withdrawal plan draws a fixed amount each month while the rest keeps compounding.
        </RailNote>
        <RailStat
          label={`Balance after ${yearsLabel}`} tone="data"
          value={fmt(r.finalBalance)}
          sub={r.depleted ? `corpus depletes in ~${depletionLabel}` : "remaining corpus"}
        />
        <RailStat
          label="Total withdrawn" tone="loss"
          value={fmt(r.totalWithdrawn)}
          sub={`over ${yearsLabel}`}
        />
        <RailFormula
          label="The calculation"
          formula={<>B<sub>m</sub> = B<sub>m-1</sub> × (1 + r) − W</>}
          note="Each month: balance grows by the monthly rate, then the withdrawal is taken out."
        />
      </CalcRail>
    </CalcGrid>
  );
}
