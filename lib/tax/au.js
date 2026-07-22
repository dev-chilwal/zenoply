// Australia take-home pay engine — FY 2026-27 (1 July 2026 – 30 June 2027).
//
// Every figure below was read from ato.gov.au in July 2026 and checked against
// the ATO's own worked examples (see scripts/verify-au-tax.mjs).
// UPDATE THESE FIGURES EACH FINANCIAL YEAR — sources are cited per constant.
//
// Scope/limitations (deliberately simple, disclosed in the UI):
//  - Australian resident for tax purposes, full tax-free threshold, full year.
//  - Excludes the Medicare levy surcharge, private health rebate, SAPTO,
//    salary sacrifice, fringe benefits and work-related deductions.
//  - Assumes repayment income == taxable income for study-loan purposes
//    (i.e. no reportable fringe benefits or investment losses).

export const AU_TAX_YEAR = { fy: "2026-27" };

// Resident rates. The 16% rate dropped to 15% from 1 July 2026 under the
// 2025-26 Budget cuts (now law).
// https://www.ato.gov.au/about-ato/new-legislation/in-detail/individuals/personal-income-tax-new-tax-cuts-for-every-australian-taxpayer
export const AU_BRACKETS = [
  { to: 18200, rate: 0 },
  { to: 45000, rate: 15 },
  { to: 135000, rate: 30 },
  { to: 190000, rate: 37 },
  { to: Infinity, rate: 45 },
];

// Medicare levy: 2% of taxable income, shaded in at 10c per $1 above the lower
// threshold so it reaches the full 2% at the upper threshold.
// Thresholds are indexed annually; the 2026-27 values are not published yet, so
// these are the latest published (2025-26) figures — disclosed in the UI.
// https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy/medicare-levy-reduction/medicare-levy-reduction-for-low-income-earners
export const AU_MEDICARE = {
  rate: 0.02,
  lowerThreshold: 28011,
  upperThreshold: 35013,
  shadeInRate: 0.10,
  thresholdYear: "2025-26",
};

// Low income tax offset — non-refundable, reduces income tax only (never the
// Medicare levy) and cannot take tax below zero.
// https://www.ato.gov.au/individuals-and-families/income-deductions-offsets-and-records/tax-offsets/low-income-tax-offset
export const AU_LITO = {
  max: 700,
  fullTo: 37500,
  taper1To: 45000,
  taper1Rate: 0.05,
  taper2From: 325,
  taper2Rate: 0.015,
  cutOut: 66667,
};

// Super guarantee: 12.00% for 2026-27. Employers need not pay SG on earnings
// above the maximum contribution base (annual from 1 July 2026 under Payday Super).
// https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds/super-guarantee
export const AU_SUPER = { rate: 0.12, maxContributionBase: 270830 };

// Study and training loan (HELP/VSL/SFSS/SSL/AASL) compulsory repayments.
// Marginal from 2025-26 — EXCEPT the top tier, which is a flat 10% of the
// WHOLE repayment income, not a marginal slice. That cliff is intentional.
// https://www.ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-rates-and-repayment-thresholds
export const AU_HELP = {
  threshold: 69528,
  tiers: [
    { to: 129717, base: 0, rate: 0.15, over: 69528 },
    { to: 186050, base: 9028, rate: 0.17, over: 129717 },
  ],
  topTierFrom: 186050,
  topTierRate: 0.10,
};

/** Progressive tax across bracket bands. */
function bracketTax(income, brackets) {
  let tax = 0;
  let lower = 0;
  for (const b of brackets) {
    if (income <= lower) break;
    tax += (Math.min(income, b.to) - lower) * (b.rate / 100);
    lower = b.to;
  }
  return tax;
}

/** Income tax before offsets and before the Medicare levy. */
export function auIncomeTax(taxableIncome) {
  return bracketTax(Math.max(0, taxableIncome), AU_BRACKETS);
}

/** Medicare levy, including the low-income shade-in band. */
export function auMedicareLevy(taxableIncome) {
  const ti = Math.max(0, taxableIncome);
  const m = AU_MEDICARE;
  if (ti <= m.lowerThreshold) return 0;
  // The published upper threshold is rounded down ($28,011 x 1.25 = $35,013.75,
  // published as $35,013), so taking the shade-in and the full rate literally
  // leaves a 6c step at the boundary. Charging the lesser keeps it continuous
  // and never over-collects.
  return Math.min((ti - m.lowerThreshold) * m.shadeInRate, ti * m.rate);
}

/** Low income tax offset for a taxable income. */
export function auLito(taxableIncome) {
  const ti = Math.max(0, taxableIncome);
  const o = AU_LITO;
  if (ti <= o.fullTo) return o.max;
  if (ti <= o.taper1To) return o.max - (ti - o.fullTo) * o.taper1Rate;
  if (ti <= o.cutOut) return Math.max(0, o.taper2From - (ti - o.taper1To) * o.taper2Rate);
  return 0;
}

/** Compulsory study/training loan repayment for a repayment income. */
export function auHelpRepayment(repaymentIncome) {
  const ri = Math.max(0, repaymentIncome);
  const h = AU_HELP;
  if (ri <= h.threshold) return 0;
  // Top tier is a flat percentage of total repayment income, not marginal.
  if (ri > h.topTierFrom) return ri * h.topTierRate;
  for (const t of h.tiers) {
    if (ri <= t.to) return t.base + (ri - t.over) * t.rate;
  }
  return 0;
}

/**
 * Super guarantee payable on a base (pre-super) salary, respecting the
 * maximum contribution base.
 */
export function auSuper(baseSalary) {
  const s = AU_SUPER;
    return Math.max(0, Math.min(baseSalary, s.maxContributionBase)) * s.rate;
}

/**
 * Split a total package (salary + super) back into its base salary.
 * Below the maximum contribution base this is just total / (1 + rate); above
 * it, super stops growing so the remainder is all salary.
 */
export function auSalaryFromPackage(total) {
  const s = AU_SUPER;
  const naive = total / (1 + s.rate);
  if (naive <= s.maxContributionBase) return naive;
  return total - s.maxContributionBase * s.rate;
}

/**
 * Full take-home calculation.
 *
 * @param {number} amount        Salary figure the user typed.
 * @param {boolean} includesSuper Whether `amount` is a total package (incl. super).
 * @param {boolean} hasStudyLoan  Whether to deduct a compulsory HELP repayment.
 */
export function computeAuTakeHome({ amount, includesSuper = false, hasStudyLoan = false }) {
  const gross = Math.max(0, amount);
  const baseSalary = includesSuper ? auSalaryFromPackage(gross) : gross;
  const superAmount = auSuper(baseSalary);
  const packageTotal = baseSalary + superAmount;

  // Employer super is not taxable income to the employee.
  const taxable = baseSalary;
  const incomeTax = auIncomeTax(taxable);
  const lito = auLito(taxable);
  const taxAfterOffset = Math.max(0, incomeTax - lito);
  const medicare = auMedicareLevy(taxable);
  const help = hasStudyLoan ? auHelpRepayment(taxable) : 0;

  const totalWithheld = taxAfterOffset + medicare + help;
  const netAnnual = Math.max(0, baseSalary - totalWithheld);

  return {
    baseSalary,
    superAmount,
    packageTotal,
    taxable,
    incomeTax,
    lito,
    taxAfterOffset,
    medicare,
    help,
    totalWithheld,
    netAnnual,
    monthly: netAnnual / 12,
    fortnightly: netAnnual / 26,
    // Share of base salary lost to tax, levy and loan repayments.
    effectiveRate: baseSalary > 0 ? (totalWithheld / baseSalary) * 100 : 0,
  };
}
