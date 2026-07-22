"use client";
// Canada take-home pay — FEDERAL income tax + CPP/CPP2 + EI. Provincial tax is
// NOT included. See lib/tax/ca.js.

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

export default function InHandSalaryCA() {
  const [amount, setAmount] = useState(75000);
  const [rrsp, setRrsp] = useState(0);

  const r = useMemo(() => computeCaTakeHome({ amount, rrsp }), [amount, rrsp]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross salary" hint="Your yearly pay, before deductions."
          prefix={sym} value={amount} onChange={setAmount}
          min={15000} max={400000} step={1000}
        />
        <NumberInput
          label="RRSP / pension (at source)" hint="Pre-tax contribution deducted from your pay."
          prefix={sym} value={rrsp} onChange={setRrsp}
          min={0} max={50000} step={500}
        />

        <ResultStatement>
          Your monthly federal take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home (federal)" value={fmt(r.netAnnual)} />
          <SumRow label="Per two weeks" value={fmt(r.biweekly)} />
          {r.rrsp > 0 && <SumRow label="RRSP / pension" value={fmt(r.rrsp)} />}
          <SumRow label="Federal income tax" value={fmt(r.federalTax)} />
          <SumRow label="CPP + CPP2" value={fmt(r.cppCash)} />
          <SumRow label="Employment Insurance" value={fmt(r.ei)} />
          <SumRow label="Total federal deductions" value={fmt(r.totalWithheld)} />
        </SumRows>

        <p className="calc-disclaimer">
          <strong>Federal only.</strong> This estimate for {CA_TAX_YEAR.year} covers federal income tax (with the basic personal amount and Canada employment amount), CPP (5.95% to $74,600) plus CPP2 (4% to $85,000), and EI (1.63% to $68,900). It does <strong>not</strong> include provincial or territorial income tax, Ontario surtax or health premium, which every province except none adds on top. Quebec (QPP/QPIP) is not modelled. Uses the annual method, so figures can differ by a few cents from CRA&apos;s per-pay-period tables. Figures in C$.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Federal take-home">
          This is your pay after federal income tax, CPP and EI. Your province
          adds its own income tax (and, in Ontario, a surtax and health premium)
          on top — add that separately.
        </RailNote>
        <RailStat
          label="Annual take-home (federal)" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${CA_TAX_YEAR.year}`}
        />
        <RailStat
          label="Federal deductions" tone="loss"
          value={fmt(r.totalWithheld)}
          sub={`${r.effectiveRate.toFixed(1)}% of salary · excl. provincial tax`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Salary − federal tax − CPP − EI</>}
          note="Federal tax after the basic personal amount and employment credits."
        />
      </CalcRail>
    </>
  );
}
