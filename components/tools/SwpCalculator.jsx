"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const INVEST_BASE = { min: 10000, max: 100000000, step: 10000, default: 1000000 };
const WITHDRAW_BASE = { min: 500, max: 1000000, step: 500, default: 10000 };

export default function SwpCalculator() {
  const reg = useRegion();
  const investRange = useMemo(() => moneyRange(INVEST_BASE, reg.scale), [reg.scale]);
  const withdrawRange = useMemo(() => moneyRange(WITHDRAW_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

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
    for (let m = 1; m <= n; m++) {
      balance = balance * (1 + i) - withdrawal;
      monthsWithdrawn = m;
      if (balance <= 0) { balance = 0; depleted = true; break; }
    }
    const totalWithdrawn = withdrawal * monthsWithdrawn;
    return { finalBalance: balance, totalWithdrawn, depleted, depletionMonth: depleted ? monthsWithdrawn : null };
  }, [investment, withdrawal, rate, years]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  const depletionLabel = r.depletionMonth
    ? `${Math.floor(r.depletionMonth / 12)} years ${r.depletionMonth % 12} months`
    : null;

  return (
    <div>
      <Fields>
        <Slider label="Total investment" display={fmt(investment)} value={investment} min={investRange.min} max={investRange.max} step={investRange.step} onChange={setInvestment} />
        <Slider label="Monthly withdrawal" display={fmt(withdrawal)} value={withdrawal} min={withdrawRange.min} max={withdrawRange.max} step={withdrawRange.step} onChange={setWithdrawal} />
        <Slider label="Expected return (p.a.)" display={`${rate}%`} value={rate} min={1} max={30} step={0.5} onChange={setRate} />
        <Slider label="Time period" display={yearsLabel} value={years} min={1} max={40} step={1} onChange={setYears} />
      </Fields>
      <Result>
        <ResultHero label={`Balance after ${yearsLabel}`} value={fmt(r.finalBalance)} />
      </Result>
      <Rows>
        <Row label="Total withdrawn" val={fmt(r.totalWithdrawn)} />
        <Row label="Total invested" val={fmt(investment)} />
      </Rows>
      {r.depleted && (
        <p className="muted small" style={{ marginTop: ".75rem" }}>
          At this withdrawal rate your corpus runs out in about {depletionLabel}, before the end of the chosen period.
        </p>
      )}
      <p className="muted small" style={{ marginTop: ".5rem" }}>
        Assumes withdrawals at the end of each month with returns compounded monthly. Actual mutual-fund returns vary.
      </p>
    </div>
  );
}
