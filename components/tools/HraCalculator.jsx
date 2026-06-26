"use client";
import { useState, useMemo, useEffect } from "react";
import { Fields, Slider, Segmented, Result, ResultHero, SplitBar, Legend, Rows, Row } from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";

const BASIC_BASE = { min: 0, max: 10000000, step: 10000, default: 600000 };
const HRA_BASE = { min: 0, max: 10000000, step: 10000, default: 300000 };
const RENT_BASE = { min: 0, max: 10000000, step: 10000, default: 240000 };

export default function HraCalculator() {
  const reg = useRegion();
  const basicRange = useMemo(() => moneyRange(BASIC_BASE, reg.scale), [reg.scale]);
  const hraRange = useMemo(() => moneyRange(HRA_BASE, reg.scale), [reg.scale]);
  const rentRange = useMemo(() => moneyRange(RENT_BASE, reg.scale), [reg.scale]);
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
    <div>
      <Fields>
        <Slider label="Basic salary + DA (annual)" display={fmt(basic)} value={basic} min={basicRange.min} max={basicRange.max} step={basicRange.step} onChange={setBasic} />
        <Slider label="HRA received (annual)" display={fmt(hra)} value={hra} min={hraRange.min} max={hraRange.max} step={hraRange.step} onChange={setHra} />
        <Slider label="Rent paid (annual)" display={fmt(rent)} value={rent} min={rentRange.min} max={rentRange.max} step={rentRange.step} onChange={setRent} />
        <Segmented
          ariaLabel="City type"
          value={city}
          onChange={setCity}
          options={[{ value: "metro", label: "Metro city" }, { value: "non", label: "Non-metro" }]}
        />
      </Fields>
      <Result>
        <ResultHero label="Exempt HRA" value={fmt(r.exempt)} />
        <SplitBar a={r.exemptPct} b={r.taxablePct} />
        <Legend left={{ k: "Exempt", v: fmt(r.exempt) }} right={{ k: `Taxable · ${Math.round(r.taxablePct)}%`, v: fmt(r.taxable) }} />
      </Result>
      <Rows>
        <Row label="Actual HRA received" val={fmt(r.limit1)} />
        <Row label={`${city === "metro" ? "50%" : "40%"} of Basic + DA`} val={fmt(r.limit2)} />
        <Row label="Rent paid − 10% of Basic + DA" val={fmt(r.limit3)} />
      </Rows>
      <p className="muted small" style={{ marginTop: ".75rem" }}>
        Enter all amounts annually. Exempt HRA under Section 10(13A) is the least of the three limits above. Metro = Delhi, Mumbai, Kolkata, Chennai (50%); all other cities use 40%. Exemption applies only under the old tax regime.
      </p>
    </div>
  );
}
