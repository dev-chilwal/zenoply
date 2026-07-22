"use client";
// Germany take-home pay — income tax (§32a), solidarity surcharge, optional
// church tax, and employee social insurance. See lib/tax/de.js for figures/sources.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { DE_TAX_YEAR, DE_CHURCH, computeDeTakeHome } from "@/lib/tax/de";

const fmt = (n) => formatMoney(n, REGIONS.DE);
const sym = currencySymbol(REGIONS.DE);

export default function InHandSalaryDE() {
  const [amount, setAmount] = useState(60000);
  const [married, setMarried] = useState(false);
  const [church, setChurch] = useState("none");

  const r = useMemo(() => computeDeTakeHome({
    amount,
    married,
    church: church !== "none",
    churchRate: church === "by" ? DE_CHURCH.rateBYBW : DE_CHURCH.rateOther,
  }), [amount, married, church]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross salary" hint="Your yearly gross pay, before tax and social insurance."
          prefix={sym} value={amount} onChange={setAmount}
          min={15000} max={250000} step={1000}
        />
        <Segmented
          ariaLabel="Tax class"
          value={married ? "married" : "single"}
          onChange={(v) => setMarried(v === "married")}
          options={[
            { value: "single", label: "Single (class I)" },
            { value: "married", label: "Married sole earner (III)" },
          ]}
        />
        <Segmented
          ariaLabel="Church tax"
          value={church}
          onChange={setChurch}
          options={[
            { value: "none", label: "No church tax" },
            { value: "other", label: "Church 9%" },
            { value: "by", label: "BY/BW 8%" },
          ]}
        />

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home" value={fmt(r.netAnnual)} />
          <SumRow label="Income tax (Lohnsteuer)" value={fmt(r.incomeTax)} />
          {r.soli > 0 && <SumRow label="Solidarity surcharge" value={fmt(r.soli)} />}
          {r.churchTax > 0 && <SumRow label="Church tax" value={fmt(r.churchTax)} />}
          <SumRow label="Pension (9.3%)" value={fmt(r.sv.rv)} />
          <SumRow label="Health (8.75%)" value={fmt(r.sv.kv)} />
          <SumRow label="Long-term care (1.8%)" value={fmt(r.sv.pv)} />
          <SumRow label="Unemployment (1.3%)" value={fmt(r.sv.av)} />
          <SumRow label="Total deductions" value={fmt(r.totalWithheld)} />
        </SumRows>

        <p className="calc-disclaimer">
          Estimate for {DE_TAX_YEAR.year}, tax class {married ? "III (married, sole earner)" : "I (single)"}, statutory health insurance with the average 2.9% Zusatzbeitrag, non-Saxony, with children. The income tax (§32a), solidarity surcharge and church tax are computed from the statutory formula (verified against the official Grundtabelle); withholding uses the statutory Vorsorgepauschale. Social insurance is capped at the 2026 ceilings (€101,400 pension/unemployment, €69,750 health/care). For a payslip-exact figure use the BMF calculator. Excludes tax classes II/V/VI and private insurance. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What lands in your account">
          German take-home is your salary minus income tax (plus solidarity
          surcharge and any church tax) and four social-insurance contributions —
          pension, health, long-term care and unemployment.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${DE_TAX_YEAR.year}`}
        />
        <RailStat
          label="Total deductions" tone="loss"
          value={fmt(r.totalWithheld)}
          sub={`${r.effectiveRate.toFixed(1)}% of gross (tax + social insurance)`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Gross − tax − Soli − social insurance</>}
          note="§32a income tax on the wage after the Vorsorgepauschale; social insurance at the 2026 rates."
        />
      </CalcRail>
    </>
  );
}
