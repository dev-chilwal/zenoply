"use client";
import { useState, useMemo } from "react";
import {
  NumberInput, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { NEW_REGIME, OLD_REGIME, DEDUCTION_CAPS, TAX_YEAR, computeTax } from "@/lib/incometax";

// India income tax is statutory in rupees, so this tool always shows ₹.
const fmt = (n) => formatMoney(n, REGIONS.IN);
const sym = currencySymbol(REGIONS.IN);

export default function IncomeTaxIN() {
  const [gross, setGross] = useState(1500000);
  const [c80, setC80] = useState(150000);
  const [d80, setD80] = useState(25000);
  const [nps, setNps] = useState(0);
  const [homeLoan, setHomeLoan] = useState(0);
  const [hraOther, setHraOther] = useState(0);

  const r = useMemo(() => {
    const newTaxable = Math.max(0, gross - NEW_REGIME.standardDeduction);
    const oldDeductions =
      Math.min(c80, DEDUCTION_CAPS.c80) +
      d80 +
      Math.min(nps, DEDUCTION_CAPS.nps80ccd1b) +
      Math.min(homeLoan, DEDUCTION_CAPS.homeLoan24b) +
      hraOther;
    const oldTaxable = Math.max(0, gross - OLD_REGIME.standardDeduction - oldDeductions);
    const newTax = computeTax(newTaxable, NEW_REGIME);
    const oldTax = computeTax(oldTaxable, OLD_REGIME);
    const better = newTax.total <= oldTax.total ? "New" : "Old";
    const betterTotal = Math.min(newTax.total, oldTax.total);
    const save = Math.abs(newTax.total - oldTax.total);
    return { newTax, oldTax, newTaxable, oldTaxable, better, betterTotal, save };
  }, [gross, c80, d80, nps, homeLoan, hraOther]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Gross annual income" hint="Total income before any deductions."
          prefix={sym} value={gross} onChange={setGross}
          min={300000} max={5000000} step={50000}
        />
        <NumberInput
          label="Section 80C (EPF, PPF, ELSS…)" hint="Capped at ₹1,50,000 (old regime)."
          prefix={sym} value={c80} onChange={setC80}
          min={0} max={150000} step={5000}
        />
        <NumberInput
          label="Section 80D (health insurance)" hint="Medical insurance premiums."
          prefix={sym} value={d80} onChange={setD80}
          min={0} max={100000} step={1000}
        />
        <NumberInput
          label="NPS — Section 80CCD(1B)" hint="Extra ₹50,000 NPS deduction."
          prefix={sym} value={nps} onChange={setNps}
          min={0} max={50000} step={5000}
        />
        <NumberInput
          label="Home loan interest — Section 24(b)" hint="Capped at ₹2,00,000 (old regime)."
          prefix={sym} value={homeLoan} onChange={setHomeLoan}
          min={0} max={200000} step={5000}
        />
        <NumberInput
          label="HRA + other exemptions" hint="House-rent allowance and similar."
          prefix={sym} value={hraOther} onChange={setHraOther}
          min={0} max={1000000} step={10000}
        />

        <ResultStatement>
          The {r.better} regime is cheaper, with a tax of <span className="pop">{fmt(r.betterTotal)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="New regime — total tax" value={fmt(r.newTax.total)} />
          <SumRow label="Old regime — total tax" value={fmt(r.oldTax.total)} />
          <SumRow label={`You save with the ${r.better} regime`} value={fmt(r.save)} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on FY {TAX_YEAR.fy} (AY {TAX_YEAR.ay}) slabs, including the standard deduction (₹75,000 new / ₹50,000 old), Section 87A rebate and 4% cess. Deductions apply to the old regime only; the new regime is the default. Excludes surcharge (income over ₹50 lakh), capital-gains/special-rate income and senior-citizen exemptions. Figures in ₹.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Which regime wins">
          The new regime has lower slab rates but few deductions; the old regime trades higher rates for deductions.
        </RailNote>
        <RailStat
          label={`Lower tax — ${r.better} regime`} tone="loss"
          value={fmt(r.betterTotal)}
          sub={`for FY ${TAX_YEAR.fy}`}
        />
        <RailStat
          label={`You save with the ${r.better} regime`} tone="data"
          value={fmt(r.save)}
          sub="versus the other regime"
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = slab(TI) − 87A, ×1.04 cess</>}
          note="Tax on taxable income, less rebate, plus 4% cess; lower of the two regimes wins."
        />
      </CalcRail>
    </>
  );
}
