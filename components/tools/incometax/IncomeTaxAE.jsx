"use client";
// UAE income tax — there is none. This states the definitive negative clearly
// rather than presenting inputs that would always compute zero.

import {
  NumberInput, CalcMain, CalcRail,
  ResultStatement, RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useState } from "react";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { AE_TAX_YEAR } from "@/lib/tax/ae";

const fmt = (n) => formatMoney(n, REGIONS.AE);
const sym = currencySymbol(REGIONS.AE);

export default function IncomeTaxAE() {
  const [income, setIncome] = useState(300000);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual salary" hint="Your yearly employment income, in dirhams."
          prefix={sym} value={income} onChange={setIncome}
          min={0} max={5000000} step={10000}
        />

        <ResultStatement>
          Your income tax is <span className="pop">{fmt(0)}</span>. The UAE has no personal income tax.
        </ResultStatement>

        <p className="calc-disclaimer">
          As of {AE_TAX_YEAR.year} there is no personal income tax in the United Arab Emirates on employment income, at any salary level — no brackets, allowances, or withholding. The 9% Corporate Tax and 15% Domestic Minimum Top-up Tax apply to businesses and large multinational groups, never to an employee&apos;s salary. For your monthly take-home (including GPSSA pension for UAE nationals), use the in-hand salary calculator. Figures in AED.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="No personal income tax">
          The UAE does not tax employment income. Salary, allowances, bonuses and
          benefits in kind are all untaxed — there is no return to file.
        </RailNote>
        <RailStat
          label="Income tax on any salary" tone="data"
          value={fmt(0)}
          sub={`for ${AE_TAX_YEAR.year}`}
        />
        <RailFormula
          label="The rule"
          formula={<>income tax = 0</>}
          note="Corporate Tax (9%) and the DMTT (15%) never apply to wages."
        />
      </CalcRail>
    </>
  );
}
