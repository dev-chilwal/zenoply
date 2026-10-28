"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail, Segmented,
  ResultStatement, MiniChart, ScheduleTable, SumRows, SumRow,
  RailNote, RailStat, RailFormula, ShareLink,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { useShareLink } from "@/components/calc/useShareLink";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";
import { monthsToLabel } from "@/lib/amortization";
import { comparePrepayment } from "@/lib/prepayment";

// Defaults are the worked example in the guide: 30 lakh at 8.5% for 20 years,
// 5 lakh prepaid after three years of EMIs.
const LOAN_BASE = { ...MONEY_BASE.loan, default: 3000000 };
const PREPAY_BASE = { min: 0, max: 5000000, step: 10000, default: 500000 };

const STRATEGIES = [
  { value: "tenure", label: "Reduce tenure" },
  { value: "emi", label: "Reduce EMI" },
];

export default function LoanPrepaymentCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(LOAN_BASE, reg.scale), [reg.scale]);
  const prepayRange = useMemo(() => moneyRange(PREPAY_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(8.5);
  const [years, setYears] = useState(20);
  const [prepay, setPrepay] = useState(prepayRange.default);
  const [after, setAfter] = useState(36);
  const [repeat, setRepeat] = useState("once");
  const [view, setView] = useState("tenure");

  useEffect(() => { setPrincipal(range.default); setPrepay(prepayRange.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inputs round-trip through the URL (Copy link). Must follow the reset above.
  const share = useShareLink({
    principal: { value: principal, set: setPrincipal, min: 0, max: 1e15 },
    rate: { value: rate, set: setRate, min: 0, max: 100 },
    years: { value: years, set: setYears, min: 1, max: 100 },
    prepay: { value: prepay, set: setPrepay, min: 0, max: 1e15 },
    after: { value: after, set: setAfter, min: 1, max: 1200 },
    repeat: { value: repeat, set: setRepeat, options: ["once", "yearly"] },
    view: { value: view, set: setView, options: ["tenure", "emi"] },
  });

  const n = Math.max(1, Math.round(years)) * 12;
  const afterMonth = Math.min(Math.max(1, Math.round(after)), n - 1);

  const c = useMemo(() => comparePrepayment({
    principal, monthlyRate: rate / 100 / 12, termMonths: n,
    prepay, afterMonth, repeatYearly: repeat === "yearly",
  }), [principal, rate, n, prepay, afterMonth, repeat]);

  const plan = c[view];
  const active = prepay > 0 && plan.prepayments > 0;
  const better = c.tenure.interestSaved >= c.emi.interestSaved ? "tenure" : "emi";
  const gap = Math.abs(c.tenure.interestSaved - c.emi.interestSaved);

  // Pad the shorter balance line with zeros so both series share an x-axis.
  const len = c.base.balanceSeries.length;
  const planSeries = [...plan.balanceSeries, ...Array(Math.max(0, len - plan.balanceSeries.length)).fill(0)];

  const scheduleRows = plan.yearly.map((y) => ({
    year: y.year,
    principal: fmt(y.principalPaid),
    interest: fmt(y.interestPaid),
    balance: fmt(y.balance),
  }));

  const cols = [
    { key: "base", head: "No prepayment", p: c.base },
    { key: "tenure", head: "Reduce tenure", p: c.tenure },
    { key: "emi", head: "Reduce EMI", p: c.emi },
  ];

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Loan amount" hint="The amount originally borrowed."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Annual interest rate on the loan."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={20} step={0.1}
        />
        <NumberInput
          label="Loan tenure" hint="The original repayment period."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={30} step={1}
        />
        <NumberInput
          label="Prepayment amount" hint="The lump sum you pay on top of your EMIs."
          prefix={sym} value={prepay} onChange={setPrepay}
          min={prepayRange.min} max={prepayRange.max} step={prepayRange.step}
        />
        <NumberInput
          label="Prepay after" hint="EMIs already paid when the lump sum goes in."
          suffix="EMIs" value={after} onChange={setAfter}
          min={1} max={n - 1} step={1}
        />
        <Segmented
          ariaLabel="How often you prepay"
          options={[{ value: "once", label: "One time" }, { value: "yearly", label: "Every year" }]}
          value={repeat} onChange={setRepeat}
        />

        <ResultStatement>
          {active ? (
            <>
              {repeat === "yearly" ? <>Prepaying <span className="pop">{fmt(prepay)}</span> a year from EMI {afterMonth}</> : <>Prepaying <span className="pop">{fmt(prepay)}</span> after {afterMonth} EMIs</>}
              {" "}saves <span className="pop">{fmt(c.tenure.interestSaved)}</span> in interest if you keep the EMI
              and finish {monthsToLabel(c.tenure.monthsSaved)} early, or{" "}
              <span className="pop">{fmt(c.emi.interestSaved)}</span> if you cut the EMI
              {c.emi.payoffMonths >= n ? <> to {fmt(c.emi.emiAfterFirst)}{repeat === "yearly" ? " after the first one" : ""}</> : <> and clear it {monthsToLabel(c.emi.monthsSaved)} early</>}.
            </>
          ) : (
            <>Your EMI is <span className="pop">{fmt(c.base.firstEmi)}</span>. Enter a prepayment to see what it saves.</>
          )}
        </ResultStatement>

        <div className="sched-block">
          <p className="chart-caption">Side by side</p>
          <div className="sched-wrap">
            <table className="sched cmp">
              <thead>
                <tr>
                  <th></th>
                  {cols.map((col) => <th key={col.key} className="r">{col.head}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>EMI</td>
                  {cols.map((col) => <td key={col.key} className="r">{fmt(col.key === "emi" && active ? col.p.emiAfterFirst : col.p.firstEmi)}</td>)}
                </tr>
                <tr>
                  <td>Loan ends in</td>
                  {cols.map((col) => <td key={col.key} className="r">{monthsToLabel(col.p.payoffMonths)}</td>)}
                </tr>
                <tr>
                  <td>Total interest</td>
                  {cols.map((col) => <td key={col.key} className="r">{fmt(col.p.totalInterest)}</td>)}
                </tr>
                <tr>
                  <td>Interest saved</td>
                  {cols.map((col) => <td key={col.key} className="r">{col.key === "base" ? "—" : fmt(col.p.interestSaved)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <Segmented ariaLabel="Plan to chart" options={STRATEGIES} value={view} onChange={setView} />
        <MiniChart
          series={planSeries}
          series2={c.base.balanceSeries}
          format={fmtCompact}
          caption={`Outstanding balance by year — ${view === "tenure" ? "reduce tenure" : "reduce EMI"} (solid) vs no prepayment (dashed)`}
        />

        <SumRows>
          <SumRow label="Total prepaid" value={fmt(plan.totalPrepaid)} />
          <SumRow label="Total interest" value={fmt(plan.totalInterest)} />
          <SumRow label="Interest saved" value={fmt(plan.interestSaved)} />
          {plan.monthsSaved > 0 && <SumRow label="Time saved" value={monthsToLabel(plan.monthsSaved)} />}
          {view === "emi" && active && <SumRow label={repeat === "yearly" ? "EMI after first prepayment" : "EMI after prepayment"} value={fmt(plan.emiAfterFirst)} />}
        </SumRows>

        <ScheduleTable
          rows={scheduleRows} caption="Year-by-year schedule (principal includes prepayments)"
          csv={{ yearly: plan.yearly, currency: reg.currency, filename: "loan-prepayment-schedule.csv" }}
          pdf={{
            locale: reg.locale, title: "Loan prepayment schedule", filename: "loan-prepayment-schedule.pdf",
            summary: [
              ["Loan amount", principal],
              ["Interest rate", `${rate}% p.a.`],
              ["Loan tenure", `${years} ${years === 1 ? "year" : "years"}`],
              [repeat === "yearly" ? `Prepayment every year from EMI ${afterMonth}` : `One-time prepayment after EMI ${afterMonth}`, prepay],
              ["Strategy", view === "tenure" ? "Reduce tenure" : "Reduce EMI"],
              ["Total prepaid", plan.totalPrepaid],
              ["Total interest", plan.totalInterest],
              ["Interest saved", plan.interestSaved],
              ...(plan.monthsSaved > 0 ? [["Time saved", monthsToLabel(plan.monthsSaved)]] : []),
            ],
          }}
        />
      </CalcMain>

      <CalcRail>
        <RailNote title="Tenure or EMI?">
          Keeping the EMI and shortening the loan saves more, because the full EMI keeps attacking the
          balance. Cutting the EMI frees cash each month but leaves more interest to run.
        </RailNote>
        <RailStat
          label="Interest saved" tone="data"
          value={fmt(c[better].interestSaved)}
          sub={active ? `${better === "tenure" ? "reducing tenure" : "reducing EMI"} · ${fmt(gap)} more than the other` : "no prepayment yet"}
        />
        <RailStat
          label="Original total interest" tone="loss"
          value={fmt(c.base.totalInterest)}
          sub={`EMI ${fmt(c.base.firstEmi)} for ${monthsToLabel(n)}`}
        />
        <RailFormula
          label="Reduce EMI"
          formula={<>EMI′ = B · i / (1 − (1 + i)<sup>−m</sup>)</>}
          note="B = balance after the prepayment, i = monthly rate, m = EMIs left"
        />
        <ShareLink share={share} />
      </CalcRail>
    </CalcGrid>
  );
}
