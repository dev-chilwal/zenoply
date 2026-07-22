// Netherlands take-home pay engine — tax year 2026 (calendar year).
//
// Box 1 combined rate (income tax + national insurance in one bracket rate),
// less two tapered credits: the general credit (algemene heffingskorting) and
// the employed-person's credit (arbeidskorting). Figures and the exact rounding
// rules are from the Belastingdienst Rekenvoorschriften 2026 and verified against
// the official Witte Maandloon-tabel (see scripts/tax-tests/nl.mjs).
// UPDATE EACH JANUARY — sources cited per block.
//
// Scope/limitations (disclosed in the UI):
//  - Working-age employee (below AOW/state-pension age), resident, full year.
//  - Regular employment: the Zvw health contribution is EMPLOYER-paid (6.10%),
//    so NOTHING is deducted from the employee's net pay for it.
//  - Assumes the salary entered is the full annual gross incl. 8% holiday pay.
//  - Excludes the IACK working-parent credit, 30% ruling and mortgage relief.

export const NL_TAX_YEAR = { year: "2026" };

// Box 1 brackets — the rate already includes national insurance (AOW/Anw/Wlz).
// Tax is computed and floored to whole euros PER BRACKET, then summed.
export const NL_BOX1 = [
  { ceiling: 38883, rate: 0.3575 },
  { ceiling: 78426, rate: 0.3756 },
  { ceiling: Infinity, rate: 0.4950 },
];

// Algemene heffingskorting (general credit) — tapered, rounded UP to euros.
export const NL_AHK = { base: 3115, taperFrom: 29736, taperTo: 78426, taperRate: 0.06398 };

// Arbeidskorting (employed-person's credit) — three build-up phases (cumulative
// caps) then a taper. Products rounded to 5 decimals; annual amount rounded UP.
export const NL_ARK = {
  rate1: 0.08324, cap1: 996,
  rate2: 0.31009, threshold1: 11965, cap2: 5300,
  rate3: 0.01950, threshold2: 25845, cap3: 5685,
  taperRate: 0.06510, taperFrom: 45592, taperTo: 132920,
};

// Zvw healthcare — for a regular employee the EMPLOYER pays this; it is not
// withheld from the employee. Shown for package context only.
export const NL_ZVW = { employerRate: 0.0610, contributionCeiling: 79409 };

const round5 = (x) => Math.round(x * 1e5) / 1e5;
const floorEuro = (x) => Math.floor(x + 1e-9);
const ceilEuro = (x) => Math.ceil(x - 1e-9);
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Box 1 gross tax (income tax + national insurance), floored per bracket. */
export function nlBox1Tax(taxableWage) {
  const L = Math.max(0, taxableWage);
  let tax = 0, lower = 0;
  for (const b of NL_BOX1) {
    if (L <= lower) break;
    tax += floorEuro((Math.min(L, b.ceiling) - lower) * b.rate);
    lower = b.ceiling;
  }
  return tax;
}

/** General tax credit (algemene heffingskorting). */
export function nlAhk(income) {
  const L = Math.max(0, income);
  const a = NL_AHK;
  if (L <= a.taperFrom) return a.base;
  if (L >= a.taperTo) return 0;
  return Math.max(0, ceilEuro(a.base - (L - a.taperFrom) * a.taperRate));
}

/** Employed-person's tax credit (arbeidskorting). */
export function nlArk(income) {
  const L = Math.max(0, income);
  const a = NL_ARK;
  if (L > a.taperTo) return 0;
  const p1 = Math.min(round5(a.rate1 * L), a.cap1);
  const p12 = Math.min(p1 + round5(a.rate2 * Math.max(0, L - a.threshold1)), a.cap2);
  const p123 = Math.min(p12 + round5(a.rate3 * Math.max(0, L - a.threshold2)), a.cap3);
  const taper = round5(a.taperRate * Math.max(0, L - a.taperFrom));
  return Math.max(0, ceilEuro(p123 - taper));
}

/** Employer Zvw contribution (context only — not deducted from the employee). */
export function nlEmployerZvw(gross) {
  const z = NL_ZVW;
  return r2(Math.min(gross, z.contributionCeiling) * z.employerRate);
}

/**
 * Full annual take-home for a working-age Dutch employee.
 *
 * @param {number} amount      Annual gross wage (incl. holiday pay).
 * @param {number} pensionPct  Employee pension % (deductible from taxable wage).
 */
export function computeNlTakeHome({ amount, pensionPct = 0 }) {
  const gross = Math.max(0, amount);
  const pension = r2(gross * (Math.max(0, pensionPct) / 100));
  const taxableWage = gross - pension;

  const grossTax = nlBox1Tax(taxableWage);
  const ahk = nlAhk(taxableWage);
  const ark = nlArk(taxableWage);
  const netTax = Math.max(0, grossTax - ahk - ark);
  const employerZvw = nlEmployerZvw(gross);

  const netAnnual = r2(Math.max(0, gross - pension - netTax));
  return {
    gross, pension, grossTax, ahk, ark, netTax, employerZvw,
    netAnnual,
    monthly: netAnnual / 12,
    // Share of gross taken by income tax + national insurance (net of credits).
    effectiveRate: gross > 0 ? (netTax / gross) * 100 : 0,
  };
}
