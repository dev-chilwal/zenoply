"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SplitBar, Legend,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE, COMPOUND_LABEL } from "@/lib/locales";

export default function FdCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.lumpsum, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(5);

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    // Compounding frequency varies by country/bank convention (see lib/locales).
    const n = reg.fdCompounding || 4;
    const amount = principal * Math.pow(1 + rate / 100 / n, n * years);
    const interest = amount - principal;
    const pPct = amount > 0 ? (principal / amount) * 100 : 0;
    const iPct = amount > 0 ? (interest / amount) * 100 : 0;
    const series = Array.from(
      { length: Math.max(1, Math.round(years)) + 1 },
      (_, i) => principal * Math.pow(1 + rate / 100 / n, n * i)
    );
    return { amount, interest, pPct, iPct, series };
  }, [principal, rate, years, reg.fdCompounding]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;
  const freqLabel = COMPOUND_LABEL[reg.fdCompounding] || "quarterly";

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Total investment" hint="The lump sum you deposit today."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Annual interest rate offered."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={15} step={0.1}
        />
        <NumberInput
          label="Time period" hint="How long the deposit stays invested."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={20} step={1}
        />

        <ResultStatement>
          After {yearsLabel}, your deposit grows to <span className="pop">{fmt(r.amount)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Maturity value per year"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend left={{ k: "Invested", v: fmt(principal) }} right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }} />

        <p className="muted small" style={{ marginTop: ".75rem" }}>
          Assumes {freqLabel} compounding{reg.code === "IN" ? ", as used by most Indian banks" : ""}.
        </p>
      </CalcMain>

      <CalcRail>
        <RailNote title="How your deposit grows">
          A fixed deposit earns compound interest at a guaranteed rate until maturity.
        </RailNote>
        <RailStat
          label="Maturity value" tone="data"
          value={fmt(r.amount)}
          sub={`after ${yearsLabel}`}
        />
        <RailStat
          label="Interest earned" tone="data"
          value={fmt(r.interest)}
          sub={`${Math.round(r.iPct)}% of the maturity value`}
        />
        <RailFormula
          label="The calculation"
          formula={<>A = P × (1 + r/n)<sup>n·t</sup></>}
          note="Maturity = principal × (1 + rate/freq) ^ (freq × years)"
        />
      </CalcRail>
    </CalcGrid>
  );
}
