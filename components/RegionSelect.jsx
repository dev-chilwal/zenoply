"use client";
// Header control to switch the active region/currency for the calculators.
import { useRegion } from "./LocaleContext";
import { REGIONS } from "@/lib/locales";

export default function RegionSelect() {
  const { code, choose } = useRegion();
  return (
    <select
      className="region-select"
      value={code}
      onChange={(e) => choose(e.target.value)}
      aria-label="Region and currency"
      title="Region and currency"
      suppressHydrationWarning
    >
      {Object.entries(REGIONS).map(([c, r]) => (
        <option key={c} value={c}>
          {r.label} · {r.currency}
        </option>
      ))}
    </select>
  );
}
