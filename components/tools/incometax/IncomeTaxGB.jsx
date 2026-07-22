"use client";
// UK income tax — rUK or Scottish bands, plus National Insurance. See lib/tax/gb.js.

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

export default function IncomeTaxGB() {
  const [gross, setGross] = useState(45000);
  const [region, setRegion] = useState("ruk");

  const r = useMemo(() => computeGbTakeHome({ amount: gross, region }), [gross, region]);
  const taxPlusNi = useMemo(() => r.incomeTax + r.ni, [r]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Gross annual income" hint="Total pay for the year, before deductions."
          prefix={sym} value={gross} onChange={setGross}
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

        <ResultStatement>
          Your income tax and National Insurance for {GB_TAX_YEAR.year} is <span className="pop">{fmt(taxPlusNi)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          <SumRow label="National Insurance" value={fmt(r.ni)} />
          <SumRow label="Total payable" value={fmt(taxPlusNi)} />
          <SumRow label="Personal Allowance" value={fmt(r.personalAllowance)} />
          <SumRow label="Income after tax & NI" value={fmt(r.netAnnual)} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on tax year {GB_TAX_YEAR.year} for an employee, {region === "scotland" ? "using the six Scottish income tax bands (19%–48%)" : "using the England/Wales/NI bands (20%/40%/45%)"}. Includes employee Class 1 National Insurance (8% then 2%). The Personal Allowance (£12,570) tapers away between £100,000 and £125,140, creating a 60% marginal band. Excludes the High Income Child Benefit Charge, dividend and savings income and student loans. Figures in £.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Tax plus National Insurance">
          A UK payslip carries income tax and National Insurance. Scotland sets
          its own income tax bands (six of them); NI is the same UK-wide.
        </RailNote>
        <RailStat
          label="Income tax & NI" tone="loss"
          value={fmt(taxPlusNi)}
          sub={`for tax year ${GB_TAX_YEAR.year}`}
        />
        <RailStat
          label="Income after tax & NI" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${r.effectiveRate.toFixed(1)}% effective rate`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = bands × (income − allowance)</>}
          note="Personal Allowance first, then the income tax bands; NI added on gross."
        />
      </CalcRail>
    </>
  );
}
