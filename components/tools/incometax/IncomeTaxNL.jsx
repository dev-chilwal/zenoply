"use client";
// Netherlands income tax — Box 1 combined tax less the general and employment
// credits. See lib/tax/nl.js for figures and Belastingdienst sources.

import { useState, useMemo } from "react";
import {
  NumberInput, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { NL_TAX_YEAR, computeNlTakeHome } from "@/lib/tax/nl";

const fmt = (n) => formatMoney(n, REGIONS.NL);
const sym = currencySymbol(REGIONS.NL);

export default function IncomeTaxNL() {
  const [gross, setGross] = useState(48000);

  const r = useMemo(() => computeNlTakeHome({ amount: gross }), [gross]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Gross annual income" hint="Total Box 1 income from work, per year."
          prefix={sym} value={gross} onChange={setGross}
          min={15000} max={250000} step={1000}
        />

        <ResultStatement>
          Your Box 1 tax for {NL_TAX_YEAR.year} is <span className="pop">{fmt(r.netTax)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Box 1 tax (incl. national insurance)" value={fmt(r.grossTax)} />
          <SumRow label="Less general credit (heffingskorting)" value={`− ${fmt(r.ahk)}`} />
          <SumRow label="Less employment credit (arbeidskorting)" value={`− ${fmt(r.ark)}`} />
          <SumRow label="Tax payable" value={fmt(r.netTax)} />
          <SumRow label="Income after tax" value={fmt(r.netAnnual)} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on Box 1 (income from work) for tax year {NL_TAX_YEAR.year}, working-age employee. The bracket rate already includes national insurance (AOW, Anw, Wlz); the general and employment tax credits are then subtracted (floored at zero). The Zvw healthcare contribution is employer-paid for a regular employee. Excludes the working-parent credit, 30% ruling, Box 2/3 income and mortgage relief. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="One rate, two credits">
          The Dutch Box 1 rate bundles income tax and national insurance into one
          bracket. Two tax credits — general and employment — then reduce the
          bill, phasing out as income rises.
        </RailNote>
        <RailStat
          label="Box 1 tax payable" tone="loss"
          value={fmt(r.netTax)}
          sub={`for ${NL_TAX_YEAR.year}, after credits`}
        />
        <RailStat
          label="Income after tax" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${r.effectiveRate.toFixed(1)}% effective rate`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = bracket tax − AHK − ARK</>}
          note="Floored per bracket, less the general (AHK) and employment (ARK) credits."
        />
      </CalcRail>
    </>
  );
}
