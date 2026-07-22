"use client";
// Australia income tax — PAYG brackets, Medicare levy, LITO and optional
// study-loan repayments. See lib/tax/au.js for the figures and ATO sources.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import {
  AU_TAX_YEAR, AU_BRACKETS, AU_MEDICARE,
  auIncomeTax, auMedicareLevy, auLito, auHelpRepayment,
} from "@/lib/tax/au";

const fmt = (n) => formatMoney(n, REGIONS.AU);
const sym = currencySymbol(REGIONS.AU);

/** Top marginal rate that applies at a given taxable income. */
function marginalRate(taxable) {
  let lower = 0;
  for (const b of AU_BRACKETS) {
    if (taxable > lower && taxable <= b.to) return b.rate;
    lower = b.to;
  }
  return AU_BRACKETS[AU_BRACKETS.length - 1].rate;
}

export default function IncomeTaxAU() {
  const [gross, setGross] = useState(120000);
  const [deductions, setDeductions] = useState(0);
  const [studyLoan, setStudyLoan] = useState("no");

  const r = useMemo(() => {
    const taxable = Math.max(0, gross - deductions);
    const incomeTax = auIncomeTax(taxable);
    const lito = auLito(taxable);
    const taxAfterOffset = Math.max(0, incomeTax - lito);
    const medicare = auMedicareLevy(taxable);
    const help = studyLoan === "yes" ? auHelpRepayment(taxable) : 0;
    const total = taxAfterOffset + medicare + help;
    return {
      taxable, incomeTax, lito, taxAfterOffset, medicare, help, total,
      net: Math.max(0, taxable - total),
      effectiveRate: taxable > 0 ? (total / taxable) * 100 : 0,
      marginal: marginalRate(taxable),
    };
  }, [gross, deductions, studyLoan]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Gross annual income" hint="Total assessable income before deductions."
          prefix={sym} value={gross} onChange={setGross}
          min={20000} max={500000} step={1000}
        />
        <NumberInput
          label="Work-related deductions" hint="Total deductions you intend to claim."
          prefix={sym} value={deductions} onChange={setDeductions}
          min={0} max={50000} step={500}
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
          Your total tax for FY {AU_TAX_YEAR.fy} is <span className="pop">{fmt(r.total)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Taxable income" value={fmt(r.taxable)} />
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          {r.lito > 0 && <SumRow label="Less low income tax offset" value={`− ${fmt(r.lito)}`} />}
          <SumRow label="Medicare levy" value={fmt(r.medicare)} />
          {r.help > 0 && <SumRow label="Study loan repayment" value={fmt(r.help)} />}
          <SumRow label="Total payable" value={fmt(r.total)} />
          <SumRow label="Income after tax" value={fmt(r.net)} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on FY {AU_TAX_YEAR.fy} resident rates (the 16% rate fell to 15% on 1 July 2026), including the 2% Medicare levy with its low-income shade-in and the low income tax offset. Assumes you are an Australian resident for tax purposes for the full year and entitled to the full tax-free threshold. Excludes the Medicare levy surcharge, private health rebate, SAPTO, offsets other than LITO, and capital-gains or other special-rate income. Medicare levy low-income thresholds are the latest published ({AU_MEDICARE.thresholdYear}) figures. Figures in A$.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="How Australian tax adds up">
          Australia taxes income in progressive brackets, then adds the Medicare
          levy on top. The low income tax offset reduces the tax itself, but
          never the levy.
        </RailNote>
        <RailStat
          label="Total tax payable" tone="loss"
          value={fmt(r.total)}
          sub={`for FY ${AU_TAX_YEAR.fy}`}
        />
        <RailStat
          label="Income after tax" tone="data"
          value={fmt(r.net)}
          sub={`${r.effectiveRate.toFixed(1)}% effective · ${r.marginal}% marginal rate`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = bracket(TI) − LITO + Medicare</>}
          note="Progressive brackets on taxable income, less the offset (floored at zero), plus the 2% levy."
        />
      </CalcRail>
    </>
  );
}
