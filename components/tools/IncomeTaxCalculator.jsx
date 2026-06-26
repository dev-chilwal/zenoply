"use client";
import { useState, useMemo } from "react";
import { Fields, Slider, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { formatMoney } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { NEW_REGIME, OLD_REGIME, DEDUCTION_CAPS, TAX_YEAR, computeTax } from "@/lib/incometax";

// India income tax is statutory in rupees, so this tool always shows ₹.
const fmt = (n) => formatMoney(n, REGIONS.IN);

export default function IncomeTaxCalculator() {
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
    <div>
      <Fields>
        <Slider label="Gross annual income" display={fmt(gross)} value={gross} min={300000} max={5000000} step={50000} onChange={setGross} />
        <Slider label="Section 80C (EPF, PPF, ELSS…)" display={fmt(c80)} value={c80} min={0} max={150000} step={5000} onChange={setC80} />
        <Slider label="Section 80D (health insurance)" display={fmt(d80)} value={d80} min={0} max={100000} step={1000} onChange={setD80} />
        <Slider label="NPS — Section 80CCD(1B)" display={fmt(nps)} value={nps} min={0} max={50000} step={5000} onChange={setNps} />
        <Slider label="Home loan interest — Section 24(b)" display={fmt(homeLoan)} value={homeLoan} min={0} max={200000} step={5000} onChange={setHomeLoan} />
        <Slider label="HRA + other exemptions" display={fmt(hraOther)} value={hraOther} min={0} max={1000000} step={10000} onChange={setHraOther} />
      </Fields>
      <Result>
        <ResultHero label={`Lower tax — ${r.better} regime`} value={fmt(r.betterTotal)} />
      </Result>
      <Rows>
        <Row label="New regime — total tax" val={fmt(r.newTax.total)} highlight={r.better === "New"} />
        <Row label="Old regime — total tax" val={fmt(r.oldTax.total)} highlight={r.better === "Old"} />
        <Row label={`You save with the ${r.better} regime`} val={fmt(r.save)} />
      </Rows>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Based on FY {TAX_YEAR.fy} (AY {TAX_YEAR.ay}) slabs, including the standard deduction (₹75,000 new / ₹50,000 old), Section 87A rebate and 4% cess. Deductions apply to the old regime only; the new regime is the default. Excludes surcharge (income over ₹50 lakh), capital-gains/special-rate income and senior-citizen exemptions. Figures in ₹.
      </p>
    </div>
  );
}
