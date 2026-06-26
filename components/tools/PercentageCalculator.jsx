"use client";
import { useState, useMemo } from "react";
import { Segmented, NumberField, Result, ResultHero } from "@/components/calc/Calc";

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
    <div>
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
        <div className="calc-grid">
          <NumberField label="Percentage (%)" value={a} onChange={setA} suffix="%" step={1} />
          <NumberField label="Of value" value={b} onChange={setB} step={1} />
        </div>
      )}
      {mode === "isWhat" && (
        <div className="calc-grid">
          <NumberField label="Value (X)" value={x} onChange={setX} step={1} />
          <NumberField label="Total (Y)" value={y} onChange={setY} step={1} />
        </div>
      )}
      {mode === "change" && (
        <div className="calc-grid">
          <NumberField label="Original value" value={v1} onChange={setV1} step={1} />
          <NumberField label="New value" value={v2} onChange={setV2} step={1} />
        </div>
      )}

      <Result>
        <ResultHero label={result.label} value={result.val} />
      </Result>
    </div>
  );
}
