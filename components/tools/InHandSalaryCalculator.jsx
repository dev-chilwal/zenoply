"use client";
import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcGrid, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { NEW_REGIME, OLD_REGIME, TAX_YEAR, computeTax } from "@/lib/incometax";

// India take-home pay is computed in rupees and tied to the tax regime.
const fmt = (n) => formatMoney(n, REGIONS.IN);
const sym = currencySymbol(REGIONS.IN);

export default function InHandSalaryCalculator() {
  const [ctc, setCtc] = useState(1200000);
  const [basicPct, setBasicPct] = useState(50);
  const [pt, setPt] = useState(200); // monthly professional tax
  const [regime, setRegime] = useState("new");

  const r = useMemo(() => {
    const basic = ctc * (basicPct / 100);
    const employerPF = 0.12 * basic;
    const gratuity = 0.0481 * basic;
    const gross = Math.max(0, ctc - employerPF - gratuity);
    const employeePF = 0.12 * basic;
    const cfg = regime === "new" ? NEW_REGIME : OLD_REGIME;
    const taxable = Math.max(0, gross - cfg.standardDeduction);
    const annualTax = computeTax(taxable, cfg).total;
    const annualPT = pt * 12;
    const netAnnual = Math.max(0, gross - employeePF - annualPT - annualTax);
    return { gross, employeePF, annualPT, annualTax, netAnnual, monthly: netAnnual / 12 };
  }, [ctc, basicPct, pt, regime]);

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Annual CTC" hint="Total cost to company, per year."
          prefix={sym} value={ctc} onChange={setCtc}
          min={300000} max={10000000} step={50000}
        />
        <NumberInput
          label="Basic (% of CTC)" hint="Basic pay as a share of CTC."
          suffix="%" value={basicPct} onChange={setBasicPct}
          min={30} max={60} step={1}
        />
        <NumberInput
          label="Professional tax (monthly)" hint="State professional tax deducted each month."
          prefix={sym} value={pt} onChange={setPt}
          min={0} max={300} step={50}
        />
        <Segmented
          ariaLabel="Tax regime"
          value={regime}
          onChange={setRegime}
          options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]}
        />

        <ResultStatement>
          Your monthly in-hand salary is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual in-hand" value={fmt(r.netAnnual)} />
          <SumRow label="Gross salary (CTC − employer PF & gratuity)" value={fmt(r.gross)} />
          <SumRow label="Employee PF (annual)" value={fmt(r.employeePF)} />
          <SumRow label="Professional tax (annual)" value={fmt(r.annualPT)} />
          <SumRow label="Income tax (annual)" value={fmt(r.annualTax)} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimate for FY {TAX_YEAR.fy}. Assumes Basic = the chosen % of CTC, employer and employee PF at 12% of Basic, gratuity at 4.81% of Basic, and income tax on (gross − standard deduction) under the selected regime. Actual pay slips vary with your company's CTC structure, PF wage ceiling and other allowances. Figures in ₹.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          In-hand pay is your gross salary minus PF, professional tax and income tax.
        </RailNote>
        <RailStat
          label="Annual in-hand" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month`}
        />
        <RailStat
          label="Income tax (annual)" tone="loss"
          value={fmt(r.annualTax)}
          sub={`${regime === "new" ? "New" : "Old"} regime, FY ${TAX_YEAR.fy}`}
        />
        <RailFormula
          label="The calculation"
          formula={<>In-hand = Gross − PF − PT − Tax</>}
          note="Gross = CTC − employer PF − gratuity; tax on (gross − standard deduction)."
        />
      </CalcRail>
    </CalcGrid>
  );
}
