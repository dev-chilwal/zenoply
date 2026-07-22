"use client";
// Ireland take-home pay — PAYE income tax, USC and PRSI. See lib/tax/ie.js for
// the figures and their Revenue / DSP sources.

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

export default function InHandSalaryIE() {
  const [amount, setAmount] = useState(50000);
  const [status, setStatus] = useState("single");
  const [pensionPct, setPensionPct] = useState(0);

  const r = useMemo(
    () => computeIeTakeHome({ amount, status, pensionPct }),
    [amount, status, pensionPct]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual salary" hint="Your gross pay for the year, before tax."
          prefix={sym} value={amount} onChange={setAmount}
          min={15000} max={250000} step={1000}
        />
        <Segmented
          ariaLabel="Personal circumstances"
          value={status}
          onChange={setStatus}
          options={STATUS}
        />
        <NumberInput
          label="Pension contribution" hint="Your own pension, as a % of salary. Relieved from income tax only."
          suffix="%" value={pensionPct} onChange={setPensionPct}
          min={0} max={40} step={1}
        />

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home" value={fmt(r.netAnnual)} />
          <SumRow label="Per fortnight" value={fmt(r.fortnightly)} />
          {r.pension > 0 && <SumRow label="Pension (from gross)" value={fmt(r.pension)} />}
          <SumRow label="Income tax (PAYE)" value={fmt(r.incomeTax)} />
          <SumRow label="USC" value={fmt(r.usc)} />
          <SumRow label="PRSI" value={fmt(r.prsi)} />
          <SumRow label="Total deductions" value={fmt(r.totalWithheld)} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimate for {IE_TAX_YEAR.year}, assuming a resident PAYE employee taxed on the cumulative basis for the full year. Income tax uses the standard/higher bands and your standard-rate cut-off point ({fmt(r.srcop)}) less non-refundable credits ({fmt(r.credits)}). PRSI blends the two 2026 rate periods (4.20% to 30 Sep, 4.35% from 1 Oct). Pension is relieved from income tax only, not USC or PRSI. Excludes the age-65 exemption limits and benefit-in-kind. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          Take-home pay is your salary minus three separate charges — income tax,
          the Universal Social Charge and PRSI. Tax credits reduce the income tax
          only; USC and PRSI are charged on your gross regardless.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${fmt(r.fortnightly)} per fortnight`}
        />
        <RailStat
          label="Total deductions" tone="loss"
          value={fmt(r.totalWithheld)}
          sub={`${r.effectiveRate.toFixed(1)}% of salary · ${IE_TAX_YEAR.year}`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Gross − PAYE − USC − PRSI</>}
          note="PAYE = 20%/40% on the band split, less credits (floored at zero). USC and PRSI apply on top."
        />
      </CalcRail>
    </>
  );
}
