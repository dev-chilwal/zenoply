"use client";
// Singapore take-home pay — resident income tax plus employee CPF (Citizens/PRs
// only). See lib/tax/sg.js for figures and IRAS/CPF Board sources.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { SG_TAX_YEAR, computeSgTakeHome } from "@/lib/tax/sg";

const fmt = (n) => formatMoney(n, REGIONS.SG);
const sym = currencySymbol(REGIONS.SG);

export default function InHandSalarySG() {
  const [amount, setAmount] = useState(72000);
  const [age, setAge] = useState(40);
  const [isCitizenOrPR, setIsCitizenOrPR] = useState(true);

  const r = useMemo(
    () => computeSgTakeHome({ amount, age, isCitizenOrPR }),
    [amount, age, isCitizenOrPR]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross salary" hint="Your yearly Ordinary Wages, before CPF and tax."
          prefix={sym} value={amount} onChange={setAmount}
          min={20000} max={600000} step={1000}
        />
        <Segmented
          ariaLabel="Residency status"
          value={isCitizenOrPR ? "cpr" : "foreigner"}
          onChange={(v) => setIsCitizenOrPR(v === "cpr")}
          options={[
            { value: "cpr", label: "Citizen / PR" },
            { value: "foreigner", label: "Foreigner (EP/S Pass)" },
          ]}
        />
        <NumberInput
          label="Age" hint="Sets your CPF contribution rate."
          suffix="yrs" value={age} onChange={(v) => setAge(Math.round(v))}
          min={20} max={75} step={1}
        />

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home" value={fmt(r.netAnnual)} />
          {r.cpfEmployee > 0 && <SumRow label="Employee CPF" value={fmt(r.cpfEmployee)} />}
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          <SumRow label="Chargeable income" value={fmt(r.chargeable)} />
          {r.cpfEmployer > 0 && <SumRow label="Employer CPF (on top)" value={fmt(r.cpfEmployer)} />}
        </SumRows>

        <p className="calc-disclaimer">
          Estimate for income earned in {SG_TAX_YEAR.year} (Year of Assessment {SG_TAX_YEAR.ya}), tax-resident employee. {isCitizenOrPR ? "Employee CPF is 20% of Ordinary Wages (age ≤ 55) up to the $8,000/month ceiling; employer CPF is paid on top and isn't part of take-home." : "Foreigners on an Employment/S Pass pay no CPF."} Income tax uses the resident schedule (YA 2024 onwards, top rate 24%) with CPF Relief and Earned Income Relief applied; other reliefs (child, spouse, parent…) are personal and excluded, so your actual tax may be lower. No income-tax rebate applies for YA {SG_TAX_YEAR.ya}. Bonuses are not modelled. Figures in S$.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          Singapore has no monthly tax withholding — CPF comes out each month, and
          income tax is billed after year-end. Take-home is your salary minus CPF
          (Citizens/PRs) and the annual income tax.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · YA ${SG_TAX_YEAR.ya}`}
        />
        <RailStat
          label="CPF + income tax" tone="loss"
          value={fmt(r.cpfEmployee + r.incomeTax)}
          sub={`${r.effectiveRate.toFixed(1)}% of salary`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Salary − CPF − income tax</>}
          note="Tax on (salary − CPF Relief − Earned Income Relief) via the resident schedule."
        />
      </CalcRail>
    </>
  );
}
