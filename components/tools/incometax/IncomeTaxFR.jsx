"use client";
// France income tax — barème 2026 with the quotient familial, on the taxable
// income derived from a gross salary. See lib/tax/fr.js.

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

export default function IncomeTaxFR() {
  const [gross, setGross] = useState(40000);
  const [married, setMarried] = useState(false);
  const [children, setChildren] = useState(0);

  const r = useMemo(
    () => computeFrTakeHome({ amount: gross, married, children }),
    [gross, married, children]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross salary" hint="Salaire brut annuel."
          prefix={sym} value={gross} onChange={setGross}
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
          Your income tax for {FR_TAX_YEAR.year} is <span className="pop">{fmt(r.incomeTax)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          <SumRow label="Net imposable (after 10% déduction)" value={fmt(r.netImposable)} />
          <SumRow label={`Parts (quotient familial)`} value={r.parts.toLocaleString("fr-FR")} />
          <SumRow label="Income per part" value={fmt(Math.round(r.netImposable / r.parts))} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on the income tax barème for {FR_TAX_YEAR.year} (on {FR_TAX_YEAR.incomeYear} income). Your salary is converted to net imposable using 2026 social-contribution rates, less the 10% déduction forfaitaire. Tax is charged on income divided by your number of parts (quotient familial), with the plafonnement du quotient familial and the décote applied — verified against the DGFiP Brochure IR lookup tables. Tax under €61 is not collected. Excludes réductions/crédits d'impôt and the CEHR/CDHR surtaxes. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Income ÷ parts, then the barème">
          France divides your taxable income by your number of parts (2 for a
          couple, +0.5 per child…), taxes that, then multiplies back — so the
          same income is taxed less with more dependants.
        </RailNote>
        <RailStat
          label="Income tax" tone="loss"
          value={fmt(r.incomeTax)}
          sub={`for ${FR_TAX_YEAR.year} · ${r.parts.toLocaleString("fr-FR")} parts`}
        />
        <RailStat
          label="Net imposable" tone="data"
          value={fmt(r.netImposable)}
          sub="after social contributions and the 10% déduction"
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = barème(R ÷ parts) × parts</>}
          note="Progressive barème on income per part, then plafonnement and décote."
        />
      </CalcRail>
    </>
  );
}
