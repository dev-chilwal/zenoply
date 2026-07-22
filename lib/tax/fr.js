// France take-home pay engine — income tax barème 2026 (on 2025 income) plus
// 2026 employee social contributions.
//
// French income tax cannot be computed from income alone: the barème is applied
// to income divided by the number of "parts" (quotient familial), so household
// composition is a required input. The barème + quotient familial + plafonnement
// + décote are verified exactly against the DGFiP Brochure IR 2026 lookup tables
// (see scripts/tax-tests/fr.mjs). Social-contribution rates are 2026 URSSAF /
// AGIRC-ARRCO figures; the composite net matches the researched worked example.
// UPDATE EACH YEAR — the 2026-income barème is set by the loi de finances 2027.
//
// Scope (disclosed in the UI): private-sector employee, métropole, single or
// married/PACS, dependent children. Excludes résidence alternée, Alsace-Moselle,
// cadre APEC, company mutuelle, DOM, CDHR and the frais réels option.

export const FR_TAX_YEAR = { year: "2026", incomeYear: "2025" };

// Barème progressif (impôt 2026 sur revenus 2025), official linear form:
// for R (household taxable income) and N parts, with Q = R/N choosing the band,
// impôt = R × rate − constant × N.
export const FR_BAREME = [
  { qCeiling: 11600, rate: 0, sub: 0 },
  { qCeiling: 29579, rate: 0.11, sub: 1276.00 },
  { qCeiling: 84577, rate: 0.30, sub: 6896.01 },
  { qCeiling: 181917, rate: 0.41, sub: 16199.48 },
  { qCeiling: Infinity, rate: 0.45, sub: 23476.16 },
];

export const FR_QF = { capPerHalfPart: 1807, caseTFirstTwoHalfParts: 4262 };
export const FR_DECOTE = { single: { threshold: 1982, base: 897 }, married: { threshold: 3277, base: 1483 }, rate: 0.4525 };
export const FR_RECOVERY_THRESHOLD = 61; // tax below this is not collected

// Déduction forfaitaire de 10% for professional expenses (per person).
export const FR_ABATEMENT = { rate: 0.10, floor: 509, ceiling: 14555 };

// 2026 Plafond de la Sécurité sociale and multiples.
export const FR_PASS = { annual: 48060, fourPass: 192240, eightPass: 384480 };

// Employee social contributions on salary, 2026 (private sector, métropole).
export const FR_SOCIAL = {
  vieillessePlafonnee: 0.069,   // up to 1 PASS
  vieillesseDeplafonnee: 0.004, // total gross
  agircArrcoT1: 0.0315, agircArrcoT2: 0.0864,
  cegT1: 0.0086, cegT2: 0.0108,
  cet: 0.0014,                  // T1+T2 if pay exceeds T1
  csgDeductible: 0.068, csgNonDeductible: 0.024, crds: 0.005,
  csgBaseFactor: 0.9825,        // CSG/CRDS on 98.25% of gross, within 4 PASS
};

// Contribution exceptionnelle sur les hauts revenus (CEHR), on RFR.
export const FR_CEHR = {
  single: [{ to: 500000, rate: 0.03, over: 250000 }, { to: Infinity, rate: 0.04, over: 500000 }],
  married: [{ to: 1000000, rate: 0.03, over: 500000 }, { to: Infinity, rate: 0.04, over: 1000000 }],
};

const rEuro = (n) => Math.round(n); // CGI art. 193: round tax to nearest euro
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Number of parts (quotient familial) for a household. */
export function frParts({ married = false, children = 0, singleParent = false }) {
  const base = married ? 2 : 1;
  const c = Math.max(0, children);
  const majoration = c <= 2 ? 0.5 * c : c - 1; // first two dependants +0.5, then +1
  const caseT = !married && singleParent && c > 0 ? 0.5 : 0;
  return base + majoration + caseT;
}

/** Barème tax for taxable income R across N parts (impôt before plafonnement). */
export function frBareme(R, N) {
  const income = Math.max(0, R);
  const q = income / N;
  for (const b of FR_BAREME) {
    if (q <= b.qCeiling) return Math.max(0, income * b.rate - b.sub * N);
  }
  return 0;
}

/** Impôt brut with the quotient-familial advantage capped (plafonnement). */
export function frPlafonnement(R, N, { married = false, singleParent = false } = {}) {
  const nRef = married ? 2 : 1;
  if (N <= nRef) return frBareme(R, N);
  const halfParts = Math.round((N - nRef) * 2);
  const taxRef = frBareme(R, nRef);
  const taxQF = frBareme(R, N);
  const advantage = taxRef - taxQF;
  // Case T (single parent) gives a larger combined cap on the first two half-parts.
  let cap;
  if (singleParent && !married) {
    cap = FR_QF.caseTFirstTwoHalfParts + FR_QF.capPerHalfPart * Math.max(0, halfParts - 2);
  } else {
    cap = FR_QF.capPerHalfPart * halfParts;
  }
  return advantage <= cap ? taxQF : taxRef - cap;
}

/** Décote, reducing tax for lower liabilities. */
export function frDecote(impot, married) {
  const cfg = married ? FR_DECOTE.married : FR_DECOTE.single;
  if (impot >= cfg.threshold) return 0;
  return Math.max(0, cfg.base - FR_DECOTE.rate * impot);
}

/** Full income tax on a household taxable income R (rounded to the euro). */
export function frIncomeTax(R, { married = false, children = 0, singleParent = false } = {}) {
  const N = frParts({ married, children, singleParent });
  // Impôt brut is rounded to the euro before the décote is applied — this is
  // what makes the non-taxation thresholds land exactly (e.g. married 2 parts:
  // R=32,486 -> 0, R=32,487 -> 1).
  const brut = rEuro(frPlafonnement(R, N, { married, singleParent }));
  const afterDecote = Math.max(0, brut - frDecote(brut, married));
  return rEuro(afterDecote);
}

/** CEHR surtax on the revenu fiscal de référence. */
export function frCehr(rfr, married = false) {
  const bands = married ? FR_CEHR.married : FR_CEHR.single;
  let tax = 0;
  for (const b of bands) {
    if (rfr > b.over) tax += (Math.min(rfr, b.to) - b.over) * b.rate;
  }
  return rEuro(Math.max(0, tax));
}

/** Employee social contributions on annual gross salary. */
export function frSocialContributions(gross) {
  const g = Math.max(0, gross);
  const s = FR_SOCIAL;
  const t1 = Math.min(g, FR_PASS.annual);
  const t2 = Math.max(0, Math.min(g, FR_PASS.eightPass) - FR_PASS.annual);
  const csgBase = Math.min(g, FR_PASS.fourPass) * s.csgBaseFactor + Math.max(0, g - FR_PASS.fourPass);

  const vieillessePl = s.vieillessePlafonnee * t1;
  const vieillesseDepl = s.vieillesseDeplafonnee * g;
  const agircArrco = s.agircArrcoT1 * t1 + s.agircArrcoT2 * t2;
  const ceg = s.cegT1 * t1 + s.cegT2 * t2;
  const cet = g > FR_PASS.annual ? s.cet * Math.min(g, FR_PASS.eightPass) : 0;
  const csgDeductible = s.csgDeductible * csgBase;
  const csgNonDeductible = s.csgNonDeductible * csgBase;
  const crds = s.crds * csgBase;

  // Deductible for income tax (reduce net imposable): pension + CSG déductible.
  const deductible = vieillessePl + vieillesseDepl + agircArrco + ceg + cet + csgDeductible;
  const total = deductible + csgNonDeductible + crds;
  return {
    vieillessePl, vieillesseDepl, agircArrco, ceg, cet,
    csgDeductible, csgNonDeductible, crds,
    deductible, total: r2(total),
    netAvantImpot: r2(g - total),
  };
}

/**
 * Full annual take-home for a French employee.
 *
 * @param {number}  amount        Annual gross salary.
 * @param {boolean} married       Married / PACS, joint assessment.
 * @param {number}  children      Number of dependent children.
 * @param {boolean} singleParent  Living alone with dependants (case T).
 */
export function computeFrTakeHome({ amount, married = false, children = 0, singleParent = false }) {
  const gross = Math.max(0, amount);
  const social = frSocialContributions(gross);

  // Net imposable = gross − IR-deductible contributions, then − 10% abattement.
  const netImposable = gross - social.deductible;
  const abatement = Math.min(
    FR_ABATEMENT.ceiling,
    Math.max(FR_ABATEMENT.floor, FR_ABATEMENT.rate * netImposable),
    netImposable
  );
  const R = rEuro(netImposable - abatement);

  const computedTax = frIncomeTax(R, { married, children, singleParent });
  const incomeTax = computedTax < FR_RECOVERY_THRESHOLD ? 0 : computedTax;

  const netAnnual = r2(social.netAvantImpot - incomeTax);
  return {
    gross, social, netImposable: R, abatement: rEuro(abatement),
    incomeTax, parts: frParts({ married, children, singleParent }),
    socialTotal: social.total, netAvantImpot: social.netAvantImpot,
    netAnnual, monthly: netAnnual / 12,
    effectiveRate: gross > 0 ? ((social.total + incomeTax) / gross) * 100 : 0,
  };
}
