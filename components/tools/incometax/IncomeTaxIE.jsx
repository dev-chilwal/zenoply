"use client";
// Ireland income tax — PAYE bands, USC and PRSI. See lib/tax/ie.js for figures
// and their Revenue / DSP sources.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { IE_TAX_YEAR, computeIeTakeHome } from "@/lib/tax/ie";

const fmt = (n) => formatMoney(n, REGIONS.IE);
const sym = currencySymbol(REGIONS.IE);

const STATUS = [
  { value: "single", label: "Single" },
  { value: "marriedSingle", label: "Married, sole earner" },
  { value: "oneParent", label: "One-parent family" },
];

export default function IncomeTaxIE() {
  const [gross, setGross] = useState(50000);
  const [status, setStatus] = useState("single");

  const r = useMemo(() => computeIeTakeHome({ amount: gross, status }), [gross, status]);
  const totalTax = useMemo(() => r.incomeTax + r.usc + r.prsi, [r]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Gross annual income" hint="Total pay for the year, before deductions."
          prefix={sym} value={gross} onChange={setGross}
          min={15000} max={250000} step={1000}
        />
        <Segmented
          ariaLabel="Personal circumstances"
          value={status}
          onChange={setStatus}
          options={STATUS}
        />

        <ResultStatement>
          Your total tax, USC and PRSI for {IE_TAX_YEAR.year} is <span className="pop">{fmt(totalTax)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Income tax (PAYE)" value={fmt(r.incomeTax)} />
          <SumRow label="USC" value={fmt(r.usc)} />
          <SumRow label="PRSI" value={fmt(r.prsi)} />
          <SumRow label="Total payable" value={fmt(totalTax)} />
          <SumRow label="Standard-rate cut-off point" value={fmt(r.srcop)} />
          <SumRow label="Tax credits" value={fmt(r.credits)} />
          <SumRow label="Income after tax" value={fmt(r.netAnnual)} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on tax year {IE_TAX_YEAR.year} for a resident PAYE employee. Income tax is 20% up to your standard-rate cut-off point and 40% above it, less non-refundable tax credits (floored at zero). USC and PRSI are separate charges on gross income that credits do not reduce; PRSI blends the two 2026 rate periods. Excludes the age-65 exemption limits, reliefs beyond the standard credits, and non-PAYE income. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Three charges, not one">
          An Irish payslip carries income tax, USC and PRSI. Tax credits — not a
          tax-free allowance — reduce the income tax; USC and PRSI apply on top,
          each with its own thresholds.
        </RailNote>
        <RailStat
          label="Total tax, USC & PRSI" tone="loss"
          value={fmt(totalTax)}
          sub={`for tax year ${IE_TAX_YEAR.year}`}
        />
        <RailStat
          label="Income after tax" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${r.effectiveRate.toFixed(1)}% effective rate`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = 20%/40% band split − credits</>}
          note="Credits reduce income tax only; USC and PRSI are added on gross."
        />
      </CalcRail>
    </>
  );
}
