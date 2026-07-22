"use client";
// Germany income tax — §32a formula, solidarity surcharge and optional church
// tax on a taxable income (zu versteuerndes Einkommen). See lib/tax/de.js.

import { useState, useMemo } from "react";
import {
  NumberInput, Segmented, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { REGIONS } from "@/lib/locales";
import {
  DE_TAX_YEAR, DE_CHURCH, deIncomeTax, deIncomeTaxSplitting, deSoli, deChurchTax,
} from "@/lib/tax/de";

const fmt = (n) => formatMoney(n, REGIONS.DE);
const sym = currencySymbol(REGIONS.DE);

export default function IncomeTaxDE() {
  const [zve, setZve] = useState(45000);
  const [married, setMarried] = useState(false);
  const [church, setChurch] = useState("none");

  const r = useMemo(() => {
    const incomeTax = married ? deIncomeTaxSplitting(zve) : deIncomeTax(zve);
    const soli = deSoli(incomeTax, married);
    const rate = church === "by" ? DE_CHURCH.rateBYBW : DE_CHURCH.rateOther;
    const churchTax = deChurchTax(incomeTax, { member: church !== "none", rate });
    const total = incomeTax + soli + churchTax;
    return { incomeTax, soli, churchTax, total, net: Math.max(0, zve - total) };
  }, [zve, married, church]);

  return (
    <>
      <CalcMain>
        <NumberInput
          label="Taxable income (zvE)" hint="Zu versteuerndes Einkommen — income after deductions."
          prefix={sym} value={zve} onChange={setZve}
          min={0} max={350000} step={1000}
        />
        <Segmented
          ariaLabel="Assessment"
          value={married ? "married" : "single"}
          onChange={(v) => setMarried(v === "married")}
          options={[
            { value: "single", label: "Single (Grundtarif)" },
            { value: "married", label: "Married (Splitting)" },
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
          Your total tax for {DE_TAX_YEAR.year} is <span className="pop">{fmt(r.total)}</span>.
        </ResultStatement>

        <SumRows>
          <SumRow label="Income tax (§32a)" value={fmt(r.incomeTax)} />
          {r.soli > 0 && <SumRow label="Solidarity surcharge (5.5%)" value={fmt(r.soli)} />}
          {r.churchTax > 0 && <SumRow label="Church tax" value={fmt(r.churchTax)} />}
          <SumRow label="Total payable" value={fmt(r.total)} />
          <SumRow label="Income after tax" value={fmt(r.net)} />
        </SumRows>

        <p className="calc-disclaimer">
          Based on §32a EStG for tax year {DE_TAX_YEAR.year} on your taxable income (zu versteuerndes Einkommen). Married uses the splitting procedure. The solidarity surcharge applies above its Freigrenze (€20,350 single / €40,700 joint) with the 11.9% Milderungszone; church tax is 9% (8% in Bavaria/Baden-Württemberg) of the income tax. Verified against the official 2026 Grundtabelle. This is tax on taxable income — it does not include social insurance. Figures in €.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="A formula, not brackets">
          German income tax rises continuously with income under the §32a formula —
          from 14% at the tax-free threshold (€12,348) up to 45%. The solidarity
          surcharge and any church tax are added on top.
        </RailNote>
        <RailStat
          label="Total tax payable" tone="loss"
          value={fmt(r.total)}
          sub={`for ${DE_TAX_YEAR.year}`}
        />
        <RailStat
          label="Income after tax" tone="data"
          value={fmt(r.net)}
          sub={`on €${zve.toLocaleString()} taxable income`}
        />
        <RailFormula
          label="The calculation"
          formula={<>tax = §32a(zvE) + Soli + church</>}
          note="Continuous formula on taxable income, plus 5.5% Soli and optional church tax."
        />
      </CalcRail>
    </>
  );
}
