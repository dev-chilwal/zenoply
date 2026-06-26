"use client";
import { useState, useMemo } from "react";
import { Fields, Slider, Segmented, Result, ResultHero, Rows, Row } from "@/components/calc/Calc";
import { formatMoney } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { NEW_REGIME, OLD_REGIME, TAX_YEAR, computeTax } from "@/lib/incometax";

// India take-home pay is computed in rupees and tied to the tax regime.
const fmt = (n) => formatMoney(n, REGIONS.IN);

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
    <div>
      <Fields>
        <Slider label="Annual CTC" display={fmt(ctc)} value={ctc} min={300000} max={10000000} step={50000} onChange={setCtc} />
        <Slider label="Basic (% of CTC)" display={`${basicPct}%`} value={basicPct} min={30} max={60} step={1} onChange={setBasicPct} />
        <Slider label="Professional tax (monthly)" display={fmt(pt)} value={pt} min={0} max={300} step={50} onChange={setPt} />
        <Segmented
          ariaLabel="Tax regime"
          value={regime}
          onChange={setRegime}
          options={[{ value: "new", label: "New regime" }, { value: "old", label: "Old regime" }]}
        />
      </Fields>
      <Result>
        <ResultHero label="Monthly in-hand salary" value={fmt(r.monthly)} />
      </Result>
      <Rows>
        <Row label="Annual in-hand" val={fmt(r.netAnnual)} highlight />
        <Row label="Gross salary (CTC − employer PF & gratuity)" val={fmt(r.gross)} />
        <Row label="Employee PF (annual)" val={fmt(r.employeePF)} />
        <Row label="Professional tax (annual)" val={fmt(r.annualPT)} />
        <Row label="Income tax (annual)" val={fmt(r.annualTax)} />
      </Rows>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Estimate for FY {TAX_YEAR.fy}. Assumes Basic = the chosen % of CTC, employer and employee PF at 12% of Basic, gratuity at 4.81% of Basic, and income tax on (gross − standard deduction) under the selected regime. Actual pay slips vary with your company's CTC structure, PF wage ceiling and other allowances. Figures in ₹.
      </p>
    </div>
  );
}
