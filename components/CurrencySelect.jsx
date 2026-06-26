"use client";
import { REGIONS } from "@/lib/locales";
import { useRegion } from "./LocaleContext";

export default function CurrencySelect() {
  const { code, choose } = useRegion();
  return (
    <select
      className="currency-select"
      value={code}
      onChange={(e) => choose(e.target.value)}
      aria-label="Currency and region"
      title="Currency and region"
    >
      {Object.entries(REGIONS).map(([k, r]) => (
        <option key={k} value={k}>
          {r.name}
        </option>
      ))}
    </select>
  );
}
