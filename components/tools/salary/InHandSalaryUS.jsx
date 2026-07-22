"use client";
// US take-home pay — FEDERAL income tax + FICA + Child Tax Credit. State and
// local income taxes are NOT included. See lib/tax/us.js.

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

export default function InHandSalaryUS() {
  const [amount, setAmount] = useState(80000);
  const [status, setStatus] = useState("single");
  const [children, setChildren] = useState(0);
  const [pretax401k, setPretax401k] = useState(0);

  const r = useMemo(
    () => computeUsTakeHome({ amount, status, children, pretax401k }),
    [amount, status, children, pretax401k]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross wages" hint="Your yearly pay, before deductions."
          prefix={sym} value={amount} onChange={setAmount}
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
        <NumberInput
          label="Traditional 401(k)" hint="Pre-tax contribution — cuts income tax, not FICA."
          prefix={sym} value={pretax401k} onChange={setPretax401k}
          min={0} max={24500} step={500}
        />

        <ResultStatement>
          Your monthly federal take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home (federal)" value={fmt(r.netAnnual)} />
          <SumRow label="Per two weeks" value={fmt(r.biweekly)} />
          {r.deferral > 0 && <SumRow label="401(k) contribution" value={fmt(r.deferral)} />}
          <SumRow label="Federal income tax" value={fmt(r.incomeTax)} />
          {r.ctc > 0 && <SumRow label="(after Child Tax Credit)" value={`− ${fmt(r.ctc)}`} />}
          <SumRow label="Social Security + Medicare" value={fmt(r.fica.total)} />
          <SumRow label="Total federal withholding" value={fmt(r.totalWithheld)} />
        </SumRows>

        <p className="calc-disclaimer">
          <strong>Federal only.</strong> This estimate for {US_TAX_YEAR.year} covers federal income tax (standard deduction, OBBBA-permanent 2026 brackets), FICA (Social Security 6.2% to $184,500, Medicare 1.45%, plus 0.9% above the threshold) and the Child Tax Credit. It does <strong>not</strong> include state or local income tax (41 states plus DC levy one) or state payroll levies (CA SDI, paid-family-leave, etc.), which reduce take-home further. Excludes itemizing and the new tips/overtime/senior/car-loan deductions. Figures in $.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Federal take-home">
          This is your pay after federal income tax and FICA. Depending on your
          state, state and local income tax may take several percent more — add
          that separately.
        </RailNote>
        <RailStat
          label="Annual take-home (federal)" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${US_TAX_YEAR.year}`}
        />
        <RailStat
          label="Federal withholding" tone="loss"
          value={fmt(r.totalWithheld)}
          sub={`${r.effectiveRate.toFixed(1)}% of wages · excl. state tax`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Wages − federal tax − FICA</>}
          note="Tax on (wages − standard deduction), less the Child Tax Credit; FICA on gross."
        />
      </CalcRail>
    </>
  );
}
