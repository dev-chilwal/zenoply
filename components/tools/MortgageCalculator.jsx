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
import { monthsToLabel } from "@/lib/amortization";
import { mortgageCost } from "@/lib/mortgageCost";

// INR bases; other currencies derive their slider bounds via the region scale.
const EXTRA_BASE = { min: 0, max: 100000, step: 1000, default: 0 };
const INSURANCE_BASE = { min: 0, max: 1000000, step: 1000, default: 0 };
const HOA_BASE = { min: 0, max: 200000, step: 500, default: 0 };

export default function MortgageCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.mortgage, reg.scale), [reg.scale]);
  const extraRange = useMemo(() => moneyRange(EXTRA_BASE, reg.scale), [reg.scale]);
  const insRange = useMemo(() => moneyRange(INSURANCE_BASE, reg.scale), [reg.scale]);
  const hoaRange = useMemo(() => moneyRange(HOA_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoneyPrecise(n, reg);
  const fmtWhole = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });
  const isIN = reg.code === "IN";

  const [price, setPrice] = useState(range.default);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(30);
  const [extra, setExtra] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [insurance, setInsurance] = useState(0);
  const [pmiPct, setPmiPct] = useState(0);
  const [hoa, setHoa] = useState(0);
  const [oneTimePct, setOneTimePct] = useState(0);

  useEffect(() => {
    setPrice(range.default); setExtra(0); setInsurance(0); setHoa(0);
  }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const c = mortgageCost({
      price, downPct, rate, years, compounding: reg.mortgageCompounding || 12,
      extraMonthly: extra, taxPct, insuranceYear: insurance, pmiPct, hoaMonthly: hoa, oneTimePct,
    });
    const total = c.plan.totalPaid;
    const pPct = total > 0 ? (c.loan / total) * 100 : 0;
    const iPct = total > 0 ? (c.plan.totalInterest / total) * 100 : 0;
    return { ...c, total, interest: c.plan.totalInterest, pPct, iPct };
  }, [price, downPct, rate, years, extra, taxPct, insurance, pmiPct, hoa, oneTimePct, reg.mortgageCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  const scheduleRows = r.plan.yearly.map((y) => ({
    year: y.year,
    principal: fmtWhole(y.principalPaid),
    interest: fmtWhole(y.interestPaid),
    balance: fmtWhole(y.balance),
  }));
  const pmiNote = pmiPct > 0 && !r.pmiApplies && r.loan > 0;
  const oneTimeHint = isIN
    ? "Optional. Stamp duty, registration and other one-off charges, as % of the price."
    : "Optional. Closing costs and other one-off charges, as % of the price.";

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Home price" hint="The purchase price of the property."
          prefix={sym} value={price} onChange={setPrice}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Down payment" hint={`${fmtWhole(r.down)} upfront, so you borrow ${fmtWhole(r.loan)}.`}
          suffix="%" value={downPct} onChange={setDownPct}
          min={0} max={100} step={1}
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
        <NumberInput
          label="Property tax (p.a.)" hint="Optional. Yearly, as % of the home price."
          suffix="%" value={taxPct} onChange={setTaxPct}
          min={0} max={5} step={0.05}
        />
        <NumberInput
          label="Home insurance / year" hint="Optional. Your yearly buildings or homeowner's premium."
          prefix={sym} value={insurance} onChange={setInsurance}
          min={insRange.min} max={insRange.max} step={insRange.step}
        />
        <NumberInput
          label="Mortgage insurance (PMI)" hint="Optional. Yearly % of the loan, charged while the down payment is under 20%."
          suffix="%" value={pmiPct} onChange={setPmiPct}
          min={0} max={2} step={0.05}
        />
        <NumberInput
          label={isIN ? "Maintenance / month" : "HOA / maintenance / month"} hint="Optional. Society, HOA or service charges."
          prefix={sym} value={hoa} onChange={setHoa}
          min={hoaRange.min} max={hoaRange.max} step={hoaRange.step}
        />
        <NumberInput
          label="One-time costs" hint={oneTimeHint}
          suffix="%" value={oneTimePct} onChange={setOneTimePct}
          min={0} max={15} step={0.5}
        />

        <ResultStatement>
          {r.hasCosts ? (
            <>Your monthly payment is <span className="pop">{fmt(r.monthly)}</span> all-in, of which{" "}
              {fmt(r.plan.payment)} is the loan itself, over {yearsLabel}.</>
          ) : (
            <>Your monthly payment is <span className="pop">{fmt(r.emi)}</span> over {yearsLabel}.</>
          )}
          {r.pmiMonths > 0 && (
            <> PMI drops off after <span className="pop">{monthsToLabel(r.pmiMonths)}</span>, taking it to {fmt(r.monthlyAfterPmi)}.</>
          )}
          {extra > 0 && r.monthsSaved > 0 && (
            <> Adding <span className="pop">{fmt(extra)}</span> a month clears the loan in{" "}
              <span className="pop">{monthsToLabel(r.plan.payoffMonths)}</span>, saving {fmt(r.interestSaved)} in interest.</>
          )}
        </ResultStatement>

        {r.hasCosts && (
          <SumRows>
            <SumRow label={extra > 0 ? "Principal, interest & extra" : "Principal & interest"} value={fmt(r.plan.payment)} />
            {r.tax > 0 && <SumRow label="Property tax" value={fmt(r.tax)} />}
            {r.ins > 0 && <SumRow label="Home insurance" value={fmt(r.ins)} />}
            {r.pmi > 0 && <SumRow label={`PMI (first ${monthsToLabel(r.pmiMonths)})`} value={fmt(r.pmi)} />}
            {r.hoa > 0 && <SumRow label={isIN ? "Maintenance" : "HOA / maintenance"} value={fmt(r.hoa)} />}
            <SumRow label="Monthly total" value={fmt(r.monthly)} />
          </SumRows>
        )}

        <MiniChart
          series={r.plan.balanceSeries}
          format={fmtCompact}
          caption="Outstanding balance by year"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend
          left={{ k: "Principal", v: fmt(r.loan) }}
          right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }}
        />

        <SumRows>
          <SumRow label="Total paid on the loan" value={fmt(r.total)} />
          <SumRow label="Total interest" value={fmt(r.interest)} />
          {extra > 0 && r.interestSaved > 0 && <SumRow label="Interest saved" value={fmt(r.interestSaved)} />}
          {extra > 0 && r.monthsSaved > 0 && <SumRow label="Time saved" value={monthsToLabel(r.monthsSaved)} />}
          {r.pmiTotal > 0 && <SumRow label="Total PMI" value={fmt(r.pmiTotal)} />}
          {r.ownershipTotal > 0 && <SumRow label="Tax, insurance & upkeep while repaying" value={fmt(r.ownershipTotal)} />}
          <SumRow label={r.oneTime > 0 ? "Cash upfront (down payment + one-time)" : "Cash upfront (down payment)"} value={fmt(r.upfront)} />
          <SumRow label="All-in cost of the home" value={fmt(r.allIn)} />
        </SumRows>

        <ScheduleTable rows={scheduleRows} caption="Year-by-year amortization schedule" />

        {pmiNote && (
          <p className="calc-disclaimer">
            No PMI is added: with {downPct}% down, the loan is already at or below 80% of the price.
          </p>
        )}
        {reg.mortgageCompounding === 2 && (
          <p className="calc-disclaimer">
            Uses semi-annual compounding, the regulated standard for Canadian fixed-rate mortgages.
          </p>
        )}
      </CalcMain>

      <CalcRail>
        <RailNote title="What you'll repay">
          The loan payment covers principal and interest. Tax, insurance, PMI and upkeep sit on top of it,
          and PMI stops once the balance falls to 78% of the price.
        </RailNote>
        {r.hasCosts && (
          <RailStat
            label="Monthly, all-in" tone="data"
            value={fmt(r.monthly)}
            sub={`${fmt(r.plan.payment)} loan + ${fmt(r.monthly - r.plan.payment)} costs`}
          />
        )}
        <RailStat
          label={extra > 0 && r.interestSaved > 0 ? "Interest saved" : "Total interest"}
          tone={extra > 0 && r.interestSaved > 0 ? "data" : "loss"}
          value={fmt(extra > 0 && r.interestSaved > 0 ? r.interestSaved : r.interest)}
          sub={extra > 0 && r.interestSaved > 0 ? `paying ${fmt(extra)}/mo extra` : `on top of ${fmt(r.loan)} borrowed`}
        />
        <RailStat
          label="All-in cost" tone="data"
          value={fmt(r.allIn)}
          sub={`upfront cash plus everything paid over ${monthsToLabel(r.plan.payoffMonths)}`}
        />
        <RailFormula
          label="The calculation"
          formula={<>EMI = P × i × (1 + i)<sup>n</sup> ÷ ((1 + i)<sup>n</sup> − 1)</>}
          note="P = price − down payment, i = monthly rate, n = number of months"
        />
      </CalcRail>
    </CalcGrid>
  );
}
