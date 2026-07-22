"use client";
// Honest states for tools whose maths is country-specific.
//
// The currency selector is global, so without these a user in an unsupported
// country silently gets another country's tax rules in their own currency —
// numbers that look authoritative and are wrong.

import { REGIONS } from "@/lib/locales";
import { useRegion } from "@/components/LocaleContext";

/** "Australia ($)" -> "Australia" for use in prose. */
export function regionLabel(code) {
  return (REGIONS[code]?.name ?? code).replace(/\s*\(.*\)\s*$/, "");
}

/**
 * Shown when the active region has no model for this tool, with one-tap
 * switches to the regions that do.
 */
export function RegionUnsupported({ tool, supported }) {
  const { code, choose } = useRegion();
  return (
    <div className="calc-empty">
      <h3 className="calc-empty-h">Not available for {regionLabel(code)} yet</h3>
      <p className="calc-empty-p">
        The {tool} works off national tax rules, so it only runs for countries
        whose rules have been researched and verified. {regionLabel(code)} isn&apos;t
        covered yet — rather than show you another country&apos;s tax rules in
        {" "}{REGIONS[code]?.currency}, here&apos;s what is available:
      </p>
      <div className="calc-empty-actions">
        {supported.map((c) => (
          <button key={c} type="button" className="seg-btn" onClick={() => choose(c)}>
            {regionLabel(c)}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Badge for tools that encode one country's statute and have no foreign
 * equivalent at all (HRA, gratuity) — these ignore the currency selector.
 */
export function RegionPinned({ code, reason }) {
  return (
    <p className="calc-pinned">
      <span className="calc-pinned-tag">{regionLabel(code)} only</span>
      {reason}
    </p>
  );
}
