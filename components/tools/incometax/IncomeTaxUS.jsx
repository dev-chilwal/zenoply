"use client";
// US federal income tax — by filing status, with FICA shown alongside. State
// and local income taxes are not included. See lib/tax/us.js.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { US_TAX_YEAR, computeUsTakeHome } from "@/lib/tax/us";

const fmt = (n) => formatMoney(n, REGIONS.US);
const sym = currencySymbol(REGIONS.US);

const STATUSES = [
  { value: "single", label: "Single" },
  { value: "mfj", label: "Married (joint)" },
  { value: "hoh", label: "Head of household" },
];

export default function IncomeTaxUS() {
  const [gross, setGross] = useState(80000);
  const [status, setStatus] = useState("single");
  const [children, setChildren] = useState(0);

  const r = useMemo(
    () => computeUsTakeHome({ amount: gross, status, children }),
    [gross, status, children]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross income" hint="Your yearly wages, before deductions."
          prefix={sym} value={gross} onChange={setGross}
          min={12000} max={600000} step={1000}
        />
        <Segmented
          ariaLabel="Filing status"
          value={status}
          onChange={setStatus}
          options={STATUSES}
        />
        <NumberInput
          label="Children under 17" hint="For the Child Tax Credit ($2,200 each)."
          value={children} onChange={(v) => setChildren(Math.round(v))}
          min={0} max={6} step={1} slider={false}
        />

        <ResultStatement>
          Your federal income tax for {US_TAX_YEAR.year} is <span className="pop">{fmt(r.incomeTax)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Federal income tax" value={fmt(r.incomeTax)} />
          <SumRow label="Taxable income" value={fmt(r.taxable)} />
          <SumRow label="Standard deduction" value={fmt(r.stdDeduction)} />
          {r.ctc > 0 && <SumRow label="Child Tax Credit applied" value={`− ${fmt(r.ctc)}`} />}
          <SumRow label="FICA (Social Security + Medicare)" value={fmt(r.fica.total)} />
          <SumRow label="Income after federal tax & FICA" value={fmt(r.netAnnual)} />
        </SumRows>

        <p className="calc-disclaimer">
          <strong>Federal only.</strong> Based on {US_TAX_YEAR.year} federal rate schedules (OBBBA-permanent) with the standard deduction, plus the Child Tax Credit. FICA is shown for context. Does <strong>not</strong> include state or local income tax (41 states plus DC levy one), itemized deductions, or the new tips/overtime/senior/car-loan deductions. Figures in $.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Federal income tax">
          Progressive federal brackets (10%–37%) apply to your income after the
          standard deduction. State income tax, where your state has one, is on
          top of this.
        </RailNote>
        <RailStat
          label="Federal income tax" tone="loss"
          value={fmt(r.incomeTax)}
          sub={`for ${US_TAX_YEAR.year} · excl. state tax`}
        />
        <RailStat
          label="After federal tax & FICA" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${r.effectiveRate.toFixed(1)}% federal effective rate`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = brackets × (income − std deduction)</>}
          note="Federal brackets on taxable income, less the Child Tax Credit."
        />
      </CalcRail>
    </>
  );
}
