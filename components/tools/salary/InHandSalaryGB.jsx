"use client";
// UK take-home pay — income tax (rUK or Scottish bands), National Insurance and
// student-loan repayments. See lib/tax/gb.js for figures and gov.uk/gov.scot sources.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { GB_TAX_YEAR, computeGbTakeHome } from "@/lib/tax/gb";

const fmt = (n) => formatMoney(n, REGIONS.GB);
const sym = currencySymbol(REGIONS.GB);

const PLANS = [
  { value: "none", label: "No plan" },
  { value: "plan1", label: "Plan 1" },
  { value: "plan2", label: "Plan 2" },
  { value: "plan4", label: "Plan 4" },
  { value: "plan5", label: "Plan 5" },
];

export default function InHandSalaryGB() {
  const [amount, setAmount] = useState(45000);
  const [region, setRegion] = useState("ruk");
  const [studentPlan, setStudentPlan] = useState("none");
  const [pensionPct, setPensionPct] = useState(0);

  const r = useMemo(
    () => computeGbTakeHome({ amount, region, studentPlan, pensionPct }),
    [amount, region, studentPlan, pensionPct]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual salary" hint="Your gross pay for the year, before tax."
          prefix={sym} value={amount} onChange={setAmount}
          min={12570} max={250000} step={1000}
        />
        <Segmented
          ariaLabel="Where you live"
          value={region}
          onChange={setRegion}
          options={[
            { value: "ruk", label: "England/Wales/NI" },
            { value: "scotland", label: "Scotland" },
          ]}
        />
        <Segmented
          ariaLabel="Student loan plan"
          value={studentPlan}
          onChange={setStudentPlan}
          options={PLANS}
        />
        <NumberInput
          label="Pension contribution" hint="Your own pension, as a % of salary (net-pay: relieved from income tax)."
          suffix="%" value={pensionPct} onChange={setPensionPct}
          min={0} max={40} step={1}
        />

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home" value={fmt(r.netAnnual)} />
          <SumRow label="Per week" value={fmt(r.weekly)} />
          {r.pension > 0 && <SumRow label="Pension (from gross)" value={fmt(r.pension)} />}
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          <SumRow label="National Insurance" value={fmt(r.ni)} />
          {r.studentLoan > 0 && <SumRow label="Student loan" value={fmt(r.studentLoan)} />}
          <SumRow label="Total deductions" value={fmt(r.totalWithheld)} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimate for tax year {GB_TAX_YEAR.year}, assuming even earnings across the year, the standard tax code and category A National Insurance. {region === "scotland" ? "Uses the six Scottish income tax bands; " : "Uses the England/Wales/NI bands; "}the Personal Allowance (£12,570) tapers away between £100,000 and £125,140. Pension is modelled as a net-pay contribution — relieved from income tax but not NI. Excludes the High Income Child Benefit Charge, dividends and benefits in kind. Figures in £.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          Take-home pay is your salary minus income tax, National Insurance and
          any student-loan repayment. Scotland sets its own income tax bands; NI
          and student loans are the same UK-wide.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${GB_TAX_YEAR.year}`}
        />
        <RailStat
          label="Total deductions" tone="loss"
          value={fmt(r.totalWithheld)}
          sub={`${r.effectiveRate.toFixed(1)}% of salary`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Gross − Tax − NI − Student loan</>}
          note="Tax on income above the Personal Allowance; NI at 8% (PT→UEL) then 2%."
        />
      </CalcRail>
    </>
  );
}
