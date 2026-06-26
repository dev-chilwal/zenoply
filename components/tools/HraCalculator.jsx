"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, SumRows, SumRow, Segmented, SplitBar, Legend,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const BASIC_BASE = { min: 0, max: 10000000, step: 10000, default: 600000 };
const HRA_BASE = { min: 0, max: 10000000, step: 10000, default: 300000 };
const RENT_BASE = { min: 0, max: 10000000, step: 10000, default: 240000 };

export default function HraCalculator() {
  const reg = useRegion();
  const basicRange = useMemo(() => moneyRange(BASIC_BASE, reg.scale), [reg.scale]);
  const hraRange = useMemo(() => moneyRange(HRA_BASE, reg.scale), [reg.scale]);
  const rentRange = useMemo(() => moneyRange(RENT_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);

  const [basic, setBasic] = useState(basicRange.default);
  const [hra, setHra] = useState(hraRange.default);
  const [rent, setRent] = useState(rentRange.default);
  const [city, setCity] = useState("metro");

  useEffect(() => {
    setBasic(basicRange.default);
    setHra(hraRange.default);
    setRent(rentRange.default);
  }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Exempt HRA = least of the three statutory limits (Section 10(13A)).
    const cityPct = city === "metro" ? 0.5 : 0.4;
    const limit1 = hra;                              // actual HRA received
    const limit2 = cityPct * basic;                  // 50% (metro) / 40% of Basic+DA
    const limit3 = Math.max(0, rent - 0.1 * basic);  // rent paid − 10% of Basic+DA
    const exempt = Math.min(limit1, limit2, limit3);
    const taxable = Math.max(0, hra - exempt);
    const exemptPct = hra > 0 ? (exempt / hra) * 100 : 0;
    const taxablePct = hra > 0 ? (taxable / hra) * 100 : 0;
    return { limit1, limit2, limit3, exempt, taxable, exemptPct, taxablePct };
  }, [basic, hra, rent, city]);

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Basic salary + DA (annual)" hint="Your annual Basic plus Dearness Allowance."
          prefix={sym} value={basic} onChange={setBasic}
          min={basicRange.min} max={basicRange.max} step={basicRange.step}
        />
        <NumberInput
          label="HRA received (annual)" hint="House Rent Allowance received over the year."
          prefix={sym} value={hra} onChange={setHra}
          min={hraRange.min} max={hraRange.max} step={hraRange.step}
        />
        <NumberInput
          label="Rent paid (annual)" hint="Total rent you actually paid in the year."
          prefix={sym} value={rent} onChange={setRent}
          min={rentRange.min} max={rentRange.max} step={rentRange.step}
        />
        <Segmented
          ariaLabel="City type"
          value={city}
          onChange={setCity}
          options={[{ value: "metro", label: "Metro city" }, { value: "non", label: "Non-metro" }]}
        />

        <ResultStatement>
          Of your {fmt(hra)} HRA, <span className="pop">{fmt(r.exempt)}</span> is exempt from tax.
        </ResultStatement>

        <SplitBar a={r.exemptPct} b={r.taxablePct} />
        <Legend left={{ k: "Exempt", v: fmt(r.exempt) }} right={{ k: `Taxable · ${Math.round(r.taxablePct)}%`, v: fmt(r.taxable) }} />

        <SumRows>
          <SumRow label="Actual HRA received" value={fmt(r.limit1)} />
          <SumRow label={`${city === "metro" ? "50%" : "40%"} of Basic + DA`} value={fmt(r.limit2)} />
          <SumRow label="Rent paid − 10% of Basic + DA" value={fmt(r.limit3)} />
        </SumRows>

        <p className="calc-disclaimer">
          Enter all amounts annually. Exempt HRA under Section 10(13A) is the least of the three limits above. Metro = Delhi, Mumbai, Kolkata, Chennai (50%); all other cities use 40%. Exemption applies only under the old tax regime.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="What you keep tax-free">
          HRA exemption is the least of three statutory limits under Section 10(13A).
        </RailNote>
        <RailStat
          label="Exempt HRA" tone="data"
          value={fmt(r.exempt)}
          sub={`${Math.round(r.exemptPct)}% of the HRA you received`}
        />
        <RailStat
          label="Taxable HRA" tone="loss"
          value={fmt(r.taxable)}
          sub={`${Math.round(r.taxablePct)}% added to taxable income`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Exempt = min(HRA, {city === "metro" ? "50%" : "40%"}×Basic, Rent − 10%×Basic)</>}
          note="Exempt HRA = least of the three limits"
        />
      </CalcRail>
    </CalcGrid>
  );
}
