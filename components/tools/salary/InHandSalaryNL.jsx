"use client";
// Netherlands take-home pay — Box 1 combined tax less the general and
// employed-person's credits. See lib/tax/nl.js for figures and Belastingdienst sources.

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

export default function InHandSalaryNL() {
  const [amount, setAmount] = useState(48000);
  const [pensionPct, setPensionPct] = useState(0);

  const r = useMemo(() => computeNlTakeHome({ amount, pensionPct }), [amount, pensionPct]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross salary" hint="Your yearly gross pay, including 8% holiday allowance."
          prefix={sym} value={amount} onChange={setAmount}
          min={15000} max={250000} step={1000}
        />
        <NumberInput
          label="Pension contribution" hint="Your own pension, as a % of salary. Deducted before tax."
          suffix="%" value={pensionPct} onChange={setPensionPct}
          min={0} max={30} step={1}
        />

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home" value={fmt(r.netAnnual)} />
          {r.pension > 0 && <SumRow label="Pension (from gross)" value={fmt(r.pension)} />}
          <SumRow label="Box 1 tax (incl. national insurance)" value={fmt(r.grossTax)} />
          <SumRow label="Less general credit" value={`− ${fmt(r.ahk)}`} />
          <SumRow label="Less employment credit" value={`− ${fmt(r.ark)}`} />
          <SumRow label="Tax payable" value={fmt(r.netTax)} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimate for {NL_TAX_YEAR.year} for a working-age employee (below AOW/state-pension age). The Box 1 rate already includes national insurance (AOW, Anw, Wlz); the general (algemene heffingskorting) and employment (arbeidskorting) credits are then deducted. The Zvw healthcare contribution (6.10%) is paid by your employer and is not withheld from your net pay. Assumes the figure entered includes 8% holiday pay. Excludes the working-parent credit (IACK), 30% ruling and mortgage relief. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          Dutch take-home is your salary minus Box 1 tax — a single rate that
          bundles income tax and national insurance — reduced by two tax credits.
          Your employer pays the health contribution separately.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${NL_TAX_YEAR.year}`}
        />
        <RailStat
          label="Tax payable" tone="loss"
          value={fmt(r.netTax)}
          sub={`${r.effectiveRate.toFixed(1)}% of salary, after credits`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Gross − (Box 1 tax − credits)</>}
          note="Bracket tax on the wage, less the general and employment credits (floored at zero)."
        />
      </CalcRail>
    </>
  );
}
