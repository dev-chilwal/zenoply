"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const SALARY_BASE = { min: 5000, max: 500000, step: 1000, default: 60000 };
const EXEMPT_CAP = 2000000; // Section 10(10) lifetime tax-exemption cap (Rs 20 lakh)

export default function GratuityCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(SALARY_BASE, reg.scale), [reg.scale]);
  const fmt = (n) => formatMoney(n, reg);

  const [salary, setSalary] = useState(range.default);
  const [years, setYears] = useState(10);
  const [months, setMonths] = useState(7);

  useEffect(() => { setSalary(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Round up only when the final part-year exceeds 6 months (the Act counts
    // service "in excess of six months" as a full year; exactly 6 months drops).
    const roundedYears = months > 6 ? years + 1 : years;
    const gratuity = (15 * salary * roundedYears) / 26;
    const taxExempt = Math.min(gratuity, EXEMPT_CAP);
    const taxable = Math.max(0, gratuity - taxExempt);
    return { roundedYears, gratuity, taxExempt, taxable };
  }, [salary, years, months]);

  return (
    <div>
      <Fields>
        <Slider label="Last drawn salary (Basic + DA, monthly)" display={fmt(salary)} value={salary} min={range.min} max={range.max} step={range.step} onChange={setSalary} />
        <Slider label="Years of service" display={`${years} ${years === 1 ? "year" : "years"}`} value={years} min={0} max={40} step={1} onChange={setYears} />
        <Slider label="Additional months" display={`${months} ${months === 1 ? "month" : "months"}`} value={months} min={0} max={11} step={1} onChange={setMonths} />
      </Fields>
      <Result>
        <ResultHero label="Gratuity payable" value={fmt(r.gratuity)} />
      </Result>
      <Rows>
        <Row label="Years counted" val={`${r.roundedYears} ${r.roundedYears === 1 ? "year" : "years"}`} />
        <Row label="Tax-exempt portion" val={fmt(r.taxExempt)} />
        {r.taxable > 0 && <Row label="Taxable portion" val={fmt(r.taxable)} highlight />}
      </Rows>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Uses the Payment of Gratuity Act formula (15 × Basic+DA × years ÷ 26) for employees covered by the Act. A part-year over 6 months rounds up. Eligibility usually needs 5 years of continuous service. The employer pays the full amount; income-tax exemption under Section 10(10) is capped at ₹20 lakh (lifetime, across employers).
      </p>
    </div>
  );
}
