"use client";
import { useState, useMemo } from "react";
import {
  Segmented, NumberInput, CalcGrid, CalcMain, CalcRail,
  ResultStatement, RailNote, RailStat, RailFormula,
} from "@/components/calc/Calc";

const round = (n) => Math.round(n * 10000) / 10000;
const show = (n) =>
  Number.isFinite(n) ? round(n).toLocaleString("en-US", { maximumFractionDigits: 4 }) : "—";

export default function PercentageCalculator() {
  const [mode, setMode] = useState("of"); // of | isWhat | change

  // mode "of": what is A% of B
  const [a, setA] = useState(15);
  const [b, setB] = useState(200);
  // mode "isWhat": X is what % of Y
  const [x, setX] = useState(30);
  const [y, setY] = useState(200);
  // mode "change": from V1 to V2
  const [v1, setV1] = useState(100);
  const [v2, setV2] = useState(125);

  const result = useMemo(() => {
    if (mode === "of") {
      return { label: `${show(a)}% of ${show(b)}`, val: show((a / 100) * b) };
    }
    if (mode === "isWhat") {
      return { label: `${show(x)} is this % of ${show(y)}`, val: y === 0 ? "—" : show((x / y) * 100) + "%" };
    }
    const pct = v1 === 0 ? NaN : ((v2 - v1) / Math.abs(v1)) * 100;
    return {
      label: `Change from ${show(v1)} to ${show(v2)}`,
      val: Number.isFinite(pct) ? (pct >= 0 ? "+" : "") + show(pct) + "%" : "—",
    };
  }, [mode, a, b, x, y, v1, v2]);

  return (
    <CalcGrid>
      <CalcMain>
        <Segmented
          ariaLabel="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: "of", label: "% of a number" },
            { value: "isWhat", label: "X is what % of Y" },
            { value: "change", label: "% increase / decrease" },
          ]}
        />

        {mode === "of" && (
          <>
            <NumberInput
              label="Percentage" hint="The percentage to take."
              suffix="%" value={a} onChange={setA} step={1} slider={false}
            />
            <NumberInput
              label="Of value" hint="The number to take the percentage of."
              value={b} onChange={setB} step={1} slider={false}
            />
          </>
        )}
        {mode === "isWhat" && (
          <>
            <NumberInput
              label="Value (X)" hint="The part you have."
              value={x} onChange={setX} step={1} slider={false}
            />
            <NumberInput
              label="Total (Y)" hint="The whole it belongs to."
              value={y} onChange={setY} step={1} slider={false}
            />
          </>
        )}
        {mode === "change" && (
          <>
            <NumberInput
              label="Original value" hint="The starting number."
              value={v1} onChange={setV1} step={1} slider={false}
            />
            <NumberInput
              label="New value" hint="The number after the change."
              value={v2} onChange={setV2} step={1} slider={false}
            />
          </>
        )}

        <ResultStatement>
          {result.label} is <span className="pop">{result.val}</span>.
        </ResultStatement>
      </CalcMain>

      <CalcRail>
        <RailNote title="What this answers">
          Three everyday percentage questions in one place — share, ratio, and change.
        </RailNote>
        <RailStat
          label={result.label} tone="data"
          value={result.val}
        />
        <RailFormula
          label="The calculation"
          formula={
            mode === "of" ? (
              <>result = a ÷ 100 × b</>
            ) : mode === "isWhat" ? (
              <>result = x ÷ y × 100</>
            ) : (
              <>result = (v₂ − v₁) ÷ |v₁| × 100</>
            )
          }
          note={
            mode === "of"
              ? "Percentage of a value"
              : mode === "isWhat"
              ? "What share X is of Y"
              : "Percent increase or decrease"
          }
        />
      </CalcRail>
    </CalcGrid>
  );
}
