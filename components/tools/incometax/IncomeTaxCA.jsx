"use client";
// Canada federal income tax — with CPP and EI shown alongside. Provincial tax
// is not included. See lib/tax/ca.js.

import { useState, useMemo } from "react";
import {
  NumberInput, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { CA_TAX_YEAR, computeCaTakeHome } from "@/lib/tax/ca";

const fmt = (n) => formatMoney(n, REGIONS.CA);
const sym = currencySymbol(REGIONS.CA);

export default function IncomeTaxCA() {
  const [gross, setGross] = useState(75000);

  const r = useMemo(() => computeCaTakeHome({ amount: gross }), [gross]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross income" hint="Your yearly employment income."
          prefix={sym} value={gross} onChange={setGross}
          min={15000} max={400000} step={1000}
        />

        <ResultStatement>
          Your federal income tax for {CA_TAX_YEAR.year} is <span className="pop">{fmt(r.federalTax)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Federal income tax" value={fmt(r.federalTax)} />
          <SumRow label="Taxable income" value={fmt(r.taxable)} />
          <SumRow label="CPP + CPP2" value={fmt(r.cppCash)} />
          <SumRow label="Employment Insurance" value={fmt(r.ei)} />
          <SumRow label="Income after federal tax, CPP & EI" value={fmt(r.netAnnual)} />
        </SumRows>

        <p className="calc-disclaimer">
          <strong>Federal only.</strong> Based on {CA_TAX_YEAR.year} federal brackets (14%–33%) with the basic personal amount and Canada employment amount, using CRA&apos;s R/K formula. CPP and EI are shown for context. Does <strong>not</strong> include provincial or territorial income tax, which every province levies on top, nor Quebec&apos;s separate regime. Figures in C$.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Federal income tax">
          Progressive federal brackets apply after the basic personal amount (a
          credit worth up to $2,303). Your province charges its own income tax on
          top of this federal figure.
        </RailNote>
        <RailStat
          label="Federal income tax" tone="loss"
          value={fmt(r.federalTax)}
          sub={`for ${CA_TAX_YEAR.year} · excl. provincial tax`}
        />
        <RailStat
          label="After federal tax, CPP & EI" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${r.effectiveRate.toFixed(1)}% federal + payroll`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = R × income − K − credits</>}
          note="CRA's R/K formula, less the basic personal and employment credits."
        />
      </CalcRail>
    </>
  );
}
