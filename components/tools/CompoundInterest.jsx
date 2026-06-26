"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SumRows, SumRow,
  RailNote, RailStat, RailFormula, Field, SplitBar, Legend,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange, MONEY_BASE } from "@/lib/locales";

const FREQ = { Annually: 1, "Half-yearly": 2, Quarterly: 4, Monthly: 12 };

export default function CompoundInterest() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(MONEY_BASE.lumpsum, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [principal, setPrincipal] = useState(range.default);
  const [rate, setRate] = useState(8);
  const [years, setYears] = useState(5);
  const [freq, setFreq] = useState("Annually");

  useEffect(() => { setPrincipal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const r = useMemo(() => {
    const nfreq = FREQ[freq];
    const amount = principal * Math.pow(1 + rate / 100 / nfreq, nfreq * years);
    const interest = amount - principal;
    const pPct = amount > 0 ? (principal / amount) * 100 : 0;
    const iPct = amount > 0 ? (interest / amount) * 100 : 0;
    const series = Array.from(
      { length: years + 1 },
      (_, i) => principal * Math.pow(1 + rate / 100 / nfreq, nfreq * i)
    );
    return { amount, interest, pPct, iPct, series };
  }, [principal, rate, years, freq]);

  const yearsLabel = `${years} ${years === 1 ? "year" : "years"}`;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Principal amount" hint="The lump sum you invest today."
          prefix={sym} value={principal} onChange={setPrincipal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Interest rate (p.a.)" hint="Annual rate of return."
          suffix="%" value={rate} onChange={setRate}
          min={0.5} max={30} step={0.5}
        />
        <NumberInput
          label="Time period" hint="How long the money stays invested."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />
        <Field label="Compounding frequency">
          <select className="inp" value={freq} onChange={(e) => setFreq(e.target.value)}>
            {Object.keys(FREQ).map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </Field>

        <ResultStatement>
          After {yearsLabel}, {fmt(principal)} grows to <span className="pop">{fmt(r.amount)}</span>.
        </ResultStatement>

        <MiniChart
          series={r.series}
          format={fmtCompact}
          caption="Value over time"
        />

        <SplitBar a={r.pPct} b={r.iPct} />
        <Legend
          left={{ k: "Principal", v: fmt(principal) }}
          right={{ k: `Interest · ${Math.round(r.iPct)}%`, v: fmt(r.interest) }}
        />

        <SumRows>
          <SumRow label="Principal invested" value={fmt(principal)} />
          <SumRow label="Interest earned" value={fmt(r.interest)} />
          <SumRow label="Maturity value" value={fmt(r.amount)} />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="The power of compounding">
          Interest earns interest, so your money grows faster the longer it stays invested.
        </RailNote>
        <RailStat
          label="Maturity value" tone="data"
          value={fmt(r.amount)}
          sub={`after ${yearsLabel} at ${rate}% p.a.`}
        />
        <RailStat
          label="Interest earned" tone="data"
          value={fmt(r.interest)}
          sub={`${Math.round(r.iPct)}% of the maturity value`}
        />
        <RailFormula
          label="The calculation"
          formula={<>A = P × (1 + r/n)<sup>n·t</sup></>}
          note="Amount = principal × (1 + rate/freq) ^ (freq × years)"
        />
      </CalcRail>
    </CalcGrid>
  );
}
