"use client";
// UAE take-home pay — no income tax; only GPSSA pension (nationals) and the
// ILOE premium are deducted. See lib/tax/ae.js.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import { AE_TAX_YEAR, computeAeTakeHome } from "@/lib/tax/ae";

const fmt = (n) => formatMoney(n, REGIONS.AE);
const sym = currencySymbol(REGIONS.AE);

export default function InHandSalaryAE() {
  const [amount, setAmount] = useState(300000);
  const [national, setNational] = useState(false);
  const [regime, setRegime] = useState("law57");

  const r = useMemo(
    () => computeAeTakeHome({ amount, national, regime }),
    [amount, national, regime]
  );

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Annual gross salary" hint="Your yearly package, in dirhams."
          prefix={sym} value={amount} onChange={setAmount}
          min={30000} max={3000000} step={10000}
        />
        <Segmented
          ariaLabel="Employee type"
          value={national ? "national" : "expat"}
          onChange={(v) => setNational(v === "national")}
          options={[
            { value: "expat", label: "Expatriate" },
            { value: "national", label: "UAE national" },
          ]}
        />
        {national && (
          <Segmented
            ariaLabel="Pension regime"
            value={regime}
            onChange={setRegime}
            options={[
              { value: "law57", label: "New joiner (Law 57/2023)" },
              { value: "law7", label: "Legacy (Law 7/1999)" },
            ]}
          />
        )}

        <ResultStatement>
          Your monthly take-home pay is <span className="pop">{fmt(r.monthly)}</span> — with no income tax.
        </ResultStatement>

        <SumRows>
          <SumRow label="Annual take-home" value={fmt(r.netAnnual)} />
          <SumRow label="Income tax" value={fmt(0)} />
          {r.national && <SumRow label="GPSSA pension (employee)" value={fmt(r.pension)} />}
          <SumRow label="ILOE unemployment insurance" value={fmt(r.iloe)} />
        </SumRows>

        <p className="calc-disclaimer">
          The UAE levies no personal income tax on salaries for {AE_TAX_YEAR.year}, so your take-home is your salary less only the ILOE unemployment-insurance premium and — for UAE nationals — the GPSSA pension contribution (11% new joiners, 5% legacy, on a capped contribution salary). The ILOE tier is set by basic salary; this uses gross as an approximation (the difference is at most AED 63/year). Excludes GCC-national home-state pensions, the Abu Dhabi Pension Fund and emirate housing fees. Figures in AED.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="No income tax">
          The UAE has no personal income tax — federal or emirate. Take-home
          equals your salary minus the small ILOE premium, plus GPSSA pension
          for UAE nationals. Expatriates instead accrue an end-of-service
          gratuity, funded by the employer.
        </RailNote>
        <RailStat
          label="Annual take-home" tone="data"
          value={fmt(r.netAnnual)}
          sub={`${fmt(r.monthly)} per month · ${AE_TAX_YEAR.year}`}
        />
        <RailStat
          label="Income tax"
          value={fmt(0)}
          sub="no personal income tax in the UAE"
        />
        <RailFormula
          label="The calculation"
          formula={<>Net = Gross − pension − ILOE</>}
          note="No tax line; pension applies to UAE nationals only."
        />
      </CalcRail>
    </>
  );
}
