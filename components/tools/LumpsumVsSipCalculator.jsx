"use client";
import { useState, useMemo, useEffect } from "react";
import {
  NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, MiniChart, SumRows, SumRow,
  RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";
import { useRegion } from "@/components/LocaleContext";
import { formatMoney, currencySymbol } from "@/lib/formatters";
import { moneyRange } from "@/lib/locales";
import { compare } from "./lumpsumSip";

// 12 lakh = 10,000 a month for 10 years, so the SIP instalment reads round.
const TOTAL_BASE = { min: 10000, max: 10000000, step: 10000, default: 1200000 };

export default function LumpsumVsSipCalculator() {
  const reg = useRegion();
  const range = useMemo(() => moneyRange(TOTAL_BASE, reg.scale), [reg.scale]);
  const sym = currencySymbol(reg);
  const fmt = (n) => formatMoney(n, reg);
  const fmtCompact = (n) => formatMoney(n, reg, { notation: "compact" });

  const [total, setTotal] = useState(range.default);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [park, setPark] = useState(3);

  useEffect(() => { setTotal(range.default); }, [reg.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const yrs = Math.max(1, Math.round(years));
  const c = useMemo(() => compare(total, rate, yrs, park), [total, rate, yrs, park]);
  const yearsLabel = `${yrs} ${yrs === 1 ? "year" : "years"}`;
  const gap = Math.abs(c.diff);
  const gapPct = Math.min(c.lump.value, c.sip.value) > 0
    ? (gap / Math.min(c.lump.value, c.sip.value)) * 100 : 0;

  return (
    <CalcGrid>
      <CalcMain>
        <NumberInput
          label="Amount to invest" hint="The total sum you have — invested all at once, or spread over the period as a monthly SIP."
          prefix={sym} value={total} onChange={setTotal}
          min={range.min} max={range.max} step={range.step}
        />
        <NumberInput
          label="Expected return (p.a.)" hint="Annual return of the fund, applied to both routes."
          suffix="%" value={rate} onChange={setRate}
          min={1} max={30} step={0.5}
        />
        <NumberInput
          label="Time period" hint="The SIP runs for this long; both routes are valued at the end of it."
          suffix="yrs" value={years} onChange={setYears}
          min={1} max={40} step={1}
        />
        <NumberInput
          label="Waiting money earns (p.a.)" hint="Where the SIP route keeps the cash it has not invested yet — about 3% in a savings account, 6–7% in a liquid fund, 0 if it sits idle."
          suffix="%" value={park} onChange={setPark}
          min={0} max={10} step={0.5}
        />

        <ResultStatement>
          {c.winner === "tie" ? (
            <>Over {yearsLabel}, both routes end level at <span className="pop">{fmt(c.lump.value)}</span>.</>
          ) : c.winner === "lumpsum" ? (
            <>Investing it all now ends <span className="pop">{fmt(gap)}</span> ahead of the SIP after {yearsLabel}.</>
          ) : (
            <>The SIP route ends <span className="pop">{fmt(gap)}</span> ahead of investing it all now after {yearsLabel}.</>
          )}
        </ResultStatement>

        <MiniChart
          series={c.lump.series}
          series2={c.sip.series}
          format={fmtCompact}
          caption="Value per year"
        />
        <div className="chart-key" aria-hidden="true">
          <span>Lumpsum</span>
          <span className="k2">SIP + waiting cash</span>
        </div>

        <SumRows>
          <SumRow label="Lumpsum — final value" value={fmt(c.lump.value)} />
          <SumRow label="SIP route — final value" value={fmt(c.sip.value)} />
          <SumRow label={`SIP instalment · ${yrs * 12} months`} value={`${fmt(c.sip.monthly)}/mo`} />
          {park > 0 && (
            <SumRow label="…including interest earned by waiting cash" value={fmt(c.sip.parked)} />
          )}
          <SumRow
            label={c.winner === "tie" ? "Difference" : `${c.winner === "sip" ? "SIP" : "Lumpsum"} ahead by · ${gapPct.toFixed(1)}%`}
            value={fmt(gap)}
          />
        </SumRows>
      </CalcMain>

      <CalcRail>
        <RailNote title="Why the lumpsum usually wins here">
          With a steady return, money invested earlier simply compounds for longer:
          an SIP spread over the whole period keeps half the sum out of the market
          on average. What an SIP buys is protection from bad timing — if the market
          falls soon after you invest, the later instalments buy in cheaper. This
          calculator assumes a steady return, so it shows the cost of that insurance,
          not its payoff.
        </RailNote>
        {c.breakEven != null && (
          <RailStat
            label="Break-even for the SIP" tone="data"
            value={`${c.breakEven.toFixed(1)}% p.a.`}
            sub={`the return the SIP route would need to match the lumpsum's ${rate}%`}
          />
        )}
        <RailStat
          label="Monthly SIP" tone="loss"
          value={fmt(c.sip.monthly)}
          sub={`${fmt(total)} ÷ ${yrs * 12} months`}
        />
        <RailFormula
          label="The calculation"
          formula={<>Lumpsum = P × (1 + r)<sup>n</sup></>}
          note="The SIP invests P ÷ 12n at the start of each month, compounding at (1 + r)^(1/12) − 1 a month — the same yearly rate, so neither route gets a head start. Uninvested cash earns the waiting rate."
        />
      </CalcRail>
    </CalcGrid>
  );
}
