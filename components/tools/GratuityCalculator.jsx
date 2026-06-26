"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const SALARY_BASE = { min: 5000, max: 500000, step: 1000, default: 60000 };
const EXEMPT_CAP = 2000000; // Section 10(10) lifetime tax-exemption cap (Rs 20 lakh)

export default function GratuityCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(SALARY_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
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

  const yearsLabel = `${r.roundedYears} ${r.roundedYears === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Last drawn salary (Basic + DA, monthly)" hint="Basic pay plus dearness allowance per month."
          prefix={sym} value={salary} onChange={setSalary}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Years of service" hint="Completed years with the employer."
          suffix="yrs" value={years} onChange={setYears}
          min={0} max={40} step={1}
        />
        <NumberInput
          label="Additional months" hint="Months beyond the completed years."
          suffix="months" value={months} onChange={setMonths}
          min={0} max={11} step={1}
        />

        <ResultStatement>
          After {yearsLabel} of service, your gratuity payable is <span className="pop">{fmt(r.gratuity)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Years counted" value={yearsLabel} />
          <SumRow label="Tax-exempt portion" value={fmt(r.taxExempt)} />
          {r.taxable > 0 && <SumRow label="Taxable portion" value={fmt(r.taxable)} />}
        </SumRows>

        <p className="calc-disclaimer">
          Uses the Payment of Gratuity Act formula (15 × Basic+DA × years ÷ 26) for employees covered by the Act. A part-year over 6 months rounds up. Eligibility usually needs 5 years of continuous service. The employer pays the full amount; income-tax exemption under Section 10(10) is capped at ₹20 lakh (lifetime, across employers).
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What your employer owes">
          Gratuity is a lump sum your employer pays for long service.
        </RailNote>
        <RailStat
          label="Gratuity payable" tone="data"
          value={fmt(r.gratuity)}
          sub={`after ${yearsLabel} of service`}
        />
        {r.taxable > 0 && (
          <RailStat
            label="Taxable portion" tone="loss"
            value={fmt(r.taxable)}
            sub="above the ₹20 lakh Section 10(10) cap"
          />
        )}
        <RailFormula
          label="The calculation"
          formula={<>G = 15 × S × N ÷ 26</>}
          note="Gratuity = 15 × last salary × years ÷ 26"
        />
      </CalcRail>
    </CalcGrid>
  );
}
