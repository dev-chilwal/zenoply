"use client";
// Singapore resident income tax — on income after CPF Relief and Earned Income
// Relief. See lib/tax/sg.js.

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

export default function IncomeTaxSG() {
  const [gross, setGross] = useState(72000);
  const [age, setAge] = useState(40);
  const [isCitizenOrPR, setIsCitizenOrPR] = useState(true);

  const r = useMemo(
    () => computeSgTakeHome({ amount: gross, age, isCitizenOrPR }),
    [gross, age, isCitizenOrPR]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross income" hint="Your yearly employment income."
          prefix={sym} value={gross} onChange={setGross}
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
          label="Age" hint="Sets your CPF Relief."
          suffix="yrs" value={age} onChange={(v) => setAge(Math.round(v))}
          min={20} max={75} step={1}
        />

        <ResultStatement>
          Your income tax for YA {SG_TAX_YEAR.ya} is <span className="pop">{fmt(r.incomeTax)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Income tax" value={fmt(r.incomeTax)} />
          <SumRow label="Chargeable income" value={fmt(r.chargeable)} />
          <SumRow label="Reliefs applied (CPF + earned income)" value={fmt(r.reliefs)} />
          <SumRow label="Income after tax" value={fmt(r.gross - r.incomeTax)} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on the resident income tax schedule (YA 2024 onwards, top rate 24%) for income earned in {SG_TAX_YEAR.year} (YA {SG_TAX_YEAR.ya}). The first $20,000 is taxed at 0%. {isCitizenOrPR ? "CPF Relief" : "Earned Income Relief"} is applied automatically; other reliefs (child, spouse, parent, SRS…) are personal and excluded, so your actual tax may be lower. No rebate applies for YA {SG_TAX_YEAR.ya}. Singapore has no capital gains tax. Figures in S$.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="Progressive, filed yearly">
          Singapore taxes chargeable income in rising bands (0% to 24%), assessed
          after year-end — there is no monthly withholding. The first $20,000 is
          tax-free.
        </RailNote>
        <RailStat
          label="Income tax" tone="loss"
          value={fmt(r.incomeTax)}
          sub={`for YA ${SG_TAX_YEAR.ya}`}
        />
        <RailStat
          label="Income after tax" tone="data"
          value={fmt(r.gross - r.incomeTax)}
          sub={`${r.effectiveRate.toFixed(1)}% CPF + tax`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = bands × chargeable income</>}
          note="Chargeable income = salary − CPF Relief − Earned Income Relief."
        />
      </CalcRail>
    </>
  );
}
