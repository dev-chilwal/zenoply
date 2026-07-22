"use client";
// France take-home pay — 2026 employee social contributions plus income tax on
// the resulting net imposable, with the quotient familial. See lib/tax/fr.js.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { FR_TAX_YEAR, computeFrTakeHome } from "@/lib/tax/fr";

const fmt = (n) => formatMoney(n, REGIONS.FR);
const sym = currencySymbol(REGIONS.FR);

export default function InHandSalaryFR() {
  const [amount, setAmount] = useState(40000);
  const [married, setMarried] = useState(false);
  const [children, setChildren] = useState(0);

  const r = useMemo(
    () => computeFrTakeHome({ amount, married, children }),
    [amount, married, children]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross salary" hint="Salaire brut annuel, before contributions and tax."
          prefix={sym} value={amount} onChange={setAmount}
          min={15000} max={250000} step={1000}
        />
        <Segmented
          ariaLabel="Household"
          value={married ? "married" : "single"}
          onChange={(v) => setMarried(v === "married")}
          options={[
            { value: "single", label: "Single" },
            { value: "married", label: "Married / PACS" },
          ]}
        />
        <NumberInput
          label="Dependent children" hint="Changes your number of parts (quotient familial)."
          value={children} onChange={(v) => setChildren(Math.round(v))}
          min={0} max={6} step={1} slider={false}
        />

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home (after tax)" value={fmt(r.netAnnual)} />
          <SumRow label="Net avant impôt (after contributions)" value={fmt(r.netAvantImpot)} />
          <SumRow label="Social contributions" value={fmt(r.socialTotal)} />
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          <SumRow label="Net imposable" value={fmt(r.netImposable)} />
          <SumRow label={`Parts (quotient familial)`} value={r.parts.toLocaleString("fr-FR")} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimate combining 2026 social-contribution rates with the income tax barème for {FR_TAX_YEAR.year} (on {FR_TAX_YEAR.incomeYear} income — the {FR_TAX_YEAR.incomeYear} barème is the latest published). Private-sector employee, métropole. Income tax uses the quotient familial, plafonnement and décote, verified against the DGFiP Brochure IR tables. Excludes any company mutuelle/prévoyance, the cadre APEC contribution, Alsace-Moselle, résidence alternée and the frais réels option. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          French take-home is your salary minus social contributions (pension, CSG,
          CRDS…) and income tax. Income tax depends on your household — it is charged
          on your income divided by your number of parts.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${FR_TAX_YEAR.year}`}
        />
        <RailStat
          label="Tax + contributions" tone="loss"
          value={fmt(r.socialTotal + r.incomeTax)}
          sub={`${r.effectiveRate.toFixed(1)}% of gross`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Gross − contributions − tax</>}
          note="Income tax on (net imposable − 10%) via the barème and quotient familial."
        />
      </CalcRail>
    </>
  );
}
