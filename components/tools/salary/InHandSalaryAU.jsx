"use client";
// Australia take-home pay — PAYG income tax, Medicare levy, LITO, super
// guarantee and optional study-loan repayments. See lib/tax/au.js for the
// figures and their ATO sources.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import {
  AU_TAX_YEAR, AU_SUPER, AU_MEDICARE, computeAuTakeHome,
} from "@/lib/tax/au";

const fmt = (n) => formatMoney(n, REGIONS.AU);
const sym = currencySymbol(REGIONS.AU);
const superPct = (AU_SUPER.rate * 100).toFixed(2).replace(/\.00$/, "");

export default function InHandSalaryAU() {
  const [amount, setAmount] = useState(100000);
  const [basis, setBasis] = useState("excl"); // salary excl. super, or total package
  const [studyLoan, setStudyLoan] = useState("no");

  const r = useMemo(
    () => computeAuTakeHome({
      amount,
      includesSuper: basis === "incl",
      hasStudyLoan: studyLoan === "yes",
    }),
    [amount, basis, studyLoan]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label={basis === "incl" ? "Total package" : "Annual salary"}
          hint={basis === "incl"
            ? "Your package including employer super."
            : "Your base salary, before employer super is added."}
          prefix={sym} value={amount} onChange={setAmount}
          min={20000} max={400000} step={1000}
        />
        <Segmented
          ariaLabel="Whether the figure includes super"
          value={basis}
          onChange={setBasis}
          options={[
            { value: "excl", label: "Plus super" },
            { value: "incl", label: "Including super" },
          ]}
        />
        <Segmented
          ariaLabel="Study or training loan"
          value={studyLoan}
          onChange={setStudyLoan}
          options={[
            { value: "no", label: "No study loan" },
            { value: "yes", label: "HECS-HELP debt" },
          ]}
        />

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home" value={fmt(r.netAnnual)} />
          <SumRow label="Per fortnight" value={fmt(r.fortnightly)} />
          <SumRow label="Base salary (taxable)" value={fmt(r.baseSalary)} />
          <SumRow label={`Employer super (${superPct}%)`} value={fmt(r.superAmount)} />
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          {r.lito > 0 && <SumRow label="Less low income tax offset" value={`− ${fmt(r.lito)}`} />}
          <SumRow label="Medicare levy" value={fmt(r.medicare)} />
          {r.help > 0 && <SumRow label="Study loan repayment" value={fmt(r.help)} />}
          <SumRow label="Total withheld" value={fmt(r.totalWithheld)} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimate for FY {AU_TAX_YEAR.fy}, assuming you are an Australian resident for tax purposes for the full year and entitled to the full tax-free threshold. Includes the Medicare levy and the low income tax offset; excludes the Medicare levy surcharge, private health rebate, SAPTO, salary sacrifice, fringe benefits and work-related deductions. Study-loan repayments assume your repayment income equals your taxable income. Medicare levy low-income thresholds are the latest published ({AU_MEDICARE.thresholdYear}) figures. Employer super is shown for context and is not part of take-home pay. Figures in A$.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          Take-home pay is your salary minus income tax, the Medicare levy and any
          compulsory study-loan repayment. Employer super is paid on top, into
          your fund — you don&apos;t see it in your bank account.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${fmt(r.fortnightly)} per fortnight`}
        />
        <RailStat
          label="Total withheld" tone="loss"
          value={fmt(r.totalWithheld)}
          sub={`${r.effectiveRate.toFixed(1)}% of salary · FY ${AU_TAX_YEAR.fy}`}
        />
        <RailStat
          label="Employer super"
          value={fmt(r.superAmount)}
          sub={`${superPct}% guarantee, paid into your fund`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Take-home = Salary − Tax − Medicare − HELP</>}
          note="Tax is reduced by the low income tax offset (never below zero); the offset doesn't reduce the Medicare levy."
        />
      </CalcRail>
    </>
  );
}
