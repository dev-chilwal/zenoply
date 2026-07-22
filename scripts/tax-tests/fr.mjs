// France — income tax (barème + quotient familial + plafonnement + décote)
// checked against the DGFiP Brochure pratique IR 2026 lookup tables and worked
// examples, plus service-public and the CEHR worked example.
import {
  frBareme, frPlafonnement, frIncomeTax, frDecote, frCehr, frParts,
  frSocialContributions, computeFrTakeHome,
} from "../../lib/tax/fr.js";

export const label = "France (impôt 2026 / revenus 2025)";

export function run(check) {
  // Parts (quotient familial).
  check("parts single, 0 children", frParts({ married: false, children: 0 }), 1);
  check("parts married, 2 children", frParts({ married: true, children: 2 }), 3);
  check("parts single, 3 children", frParts({ married: false, children: 3 }), 3);
  check("parts single parent, 1 child (case T)", frParts({ married: false, children: 1, singleParent: true }), 2);

  // Authority worked examples.
  check("brut: married 3 parts, R=54,000 (Brochure p.371)", frPlafonnement(54000, 3, { married: true }), 2112, 0.01);
  check("single 1 part, R=30,000 (service-public)", frIncomeTax(30000, { married: false }), 2104);
  check("décote: married, tax 2,140 -> 515", frDecote(2140, true), 515, 0.5);

  // DGFiP married lookup table (incl. plafonnement + décote) — exact.
  const M = (R, children) => frIncomeTax(R, { married: true, children });
  check("married 2 parts R=38,000 -> 882", M(38000, 0), 882);
  check("married 2 parts R=38,500 -> 962", M(38500, 0), 962);
  check("married 2 parts R=40,000 -> 1,201", M(40000, 0), 1201);
  check("married 2 parts R=88,000 -> 12,608", M(88000, 0), 12608);
  check("married 2 parts R=100,000 -> 16,208", M(100000, 0), 16208);
  check("married 2 parts R=125,000 -> 23,708", M(125000, 0), 23708);
  // Plafonnement binds for extra parts.
  check("married 3 parts R=100,000 -> 12,594", M(100000, 2), 12594);
  check("married 5 parts R=100,000 -> 5,366", M(100000, 4), 5366);
  check("married 2.5 parts R=90,000 -> 11,401", frIncomeTax(90000, { married: true, children: 1 }), 11401);
  check("married 3 parts R=90,000 -> 9,594", M(90000, 2), 9594);
  check("married 4 parts R=120,000 -> 14,980", M(120000, 3), 14980);

  // Non-taxation and recovery thresholds.
  check("married 2 parts R=32,486 -> 0", M(32486, 0), 0);
  check("married 2 parts R=32,487 -> 1", M(32487, 0), 1);

  // CEHR.
  check("CEHR single RFR 550,000 -> 9,500", frCehr(550000, false), 9500);
  check("CEHR below threshold -> 0", frCehr(200000, false), 0);

  // Social contributions + end-to-end (researched worked example, 40,000 single).
  const s = frSocialContributions(40000);
  check("vieillesse plafonnée 6.9%", s.vieillessePl, 2760);
  check("AGIRC-ARRCO T1 3.15%", s.agircArrco, 1260);
  check("CSG déductible 6.8% of 98.25%", s.csgDeductible, 2672.40);
  check("net avant impôt (40k single)", s.netAvantImpot, 31663.90, 0.05);

  const r = computeFrTakeHome({ amount: 40000, married: false, children: 0 });
  check("revenu net imposable R (40k)", r.netImposable, 29523);
  check("income tax (40k single)", r.incomeTax, 1967);
  check("take-home after tax (40k single)", r.netAnnual, 29696.90, 0.05);
}
