// Germany — income tax (§32a), solidarity surcharge (§4 SolZG) and church tax
// checked EXACTLY against the published 2026 Grundtabelle (see DE.md §12).
// Note: the composite net take-home (which adds social insurance and the
// Vorsorgepauschale) has no BMF-published worked example; it is browser-checked
// against the official BMF calculator instead. This module verifies the tax core.
import {
  deIncomeTax, deSoli, deChurchTax, deSocialInsurance, DE_SV,
} from "../../lib/tax/de.js";

export const label = "Germany (tax year 2026)";

export function run(check) {
  // §32a income tax — exact Grundtabelle values.
  const est = [
    [12348, 0], [15000, 435], [17799, 1034], [17800, 1035], [20000, 1570],
    [30000, 4217], [40000, 7209], [50000, 10548], [60000, 14233],
    [69878, 18213], [69879, 18213], [80000, 22464], [100000, 30864],
    [120000, 39264], [277825, 105550], [277826, 105551], [300000, 115529],
  ];
  for (const [zve, tax] of est) check(`ESt €${zve} -> €${tax}`, deIncomeTax(zve), tax);

  // Zone continuity boundaries.
  check("ESt €12,349 floors to 0", deIncomeTax(12349), 0);

  // Solidarity surcharge — Freigrenze, Milderungszone and flat-rate zone.
  check("Soli €50,000 zvE -> 0 (below Freigrenze)", deSoli(deIncomeTax(50000)), 0);
  check("Soli €80,000 zvE (Milderungszone)", deSoli(deIncomeTax(80000)), 251.57);
  check("Soli €83,000 zvE", deSoli(deIncomeTax(83000)), 401.51);
  check("Soli €90,000 zvE", deSoli(deIncomeTax(90000)), 751.37);
  check("Soli €120,000 zvE (flat 5.5%)", deSoli(deIncomeTax(120000)), 2159.52);
  check("Soli €300,000 zvE", deSoli(deIncomeTax(300000)), 6354.09);

  // Church tax 8% / 9% of income tax.
  check("KiSt 8% €30,000 zvE", deChurchTax(deIncomeTax(30000), { member: true, rate: 0.08 }), 337.36);
  check("KiSt 9% €30,000 zvE", deChurchTax(deIncomeTax(30000), { member: true, rate: 0.09 }), 379.53);
  check("KiSt 9% €60,000 zvE", deChurchTax(deIncomeTax(60000), { member: true, rate: 0.09 }), 1280.97);
  check("KiSt none if not a member", deChurchTax(deIncomeTax(60000), { member: false }), 0);

  // Social insurance — arithmetic against the 2026 ceilings.
  const sv = deSocialInsurance(60000);
  check("RV 9.3% of €60,000", sv.rv, 5580);
  check("AV 1.3% of €60,000", sv.av, 780);
  check("KV 8.75% of €60,000 (under ceiling)", sv.kv, 5250);
  check("PV 1.8% of €60,000", sv.pv, 1080);
  // Ceilings bite above the thresholds.
  const svHigh = deSocialInsurance(120000);
  check("RV capped at €101,400 base", svHigh.rv, 9430.20);
  check("KV capped at €69,750 base", svHigh.kv, DE_SV.kvpvCeiling * 0.0875);
  check("childless care surcharge", deSocialInsurance(60000, { childlessOver23: true }).pv, 60000 * 0.024);
}
