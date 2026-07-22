// India income-tax engine — FY 2026-27 (AY 2027-28).
// From 1 April 2026 the Income-tax Act, 2025 replaces the 1961 Act (the old
// "assessment year" is now a single "tax year"). Budget 2026 (Feb 2026) RETAINED
// the Budget 2025 new-regime slabs, the ₹75,000 standard deduction and the
// ₹60,000 rebate to ₹12L unchanged — verified against multiple 2026 sources.
// So the figures below carry over from FY 2025-26; only the year and statute
// basis moved on. UPDATE THESE FIGURES EACH FINANCIAL YEAR.
//
// Scope/limitations (kept deliberately simple, disclosed in the UI):
//  - Individuals below 60 (no senior-citizen higher exemptions).
//  - Excludes surcharge (income over ₹50 lakh) and special-rate income
//    such as capital gains.

export const TAX_YEAR = { fy: "2026-27", ay: "2027-28" };

export const NEW_REGIME = {
  standardDeduction: 75000,
  slabs: [
    { to: 400000, rate: 0 },
    { to: 800000, rate: 5 },
    { to: 1200000, rate: 10 },
    { to: 1600000, rate: 15 },
    { to: 2000000, rate: 20 },
    { to: 2400000, rate: 25 },
    { to: Infinity, rate: 30 },
  ],
  // 100% rebate up to ₹12L taxable income, capped at ₹60,000, with marginal
  // relief just above the threshold (Budget 2025, retained for FY 2026-27; the
  // Section 87A rebate is carried into the Income-tax Act, 2025).
  rebate: { maxTaxableIncome: 1200000, maxAmount: 60000, marginalReliefThreshold: 1200000 },
  cess: 0.04,
};

export const OLD_REGIME = {
  standardDeduction: 50000,
  slabs: [
    { to: 250000, rate: 0 },
    { to: 500000, rate: 5 },
    { to: 1000000, rate: 20 },
    { to: Infinity, rate: 30 },
  ],
  rebate: { maxTaxableIncome: 500000, maxAmount: 12500 },
  cess: 0.04,
};

// Statutory caps on the common old-regime deductions.
export const DEDUCTION_CAPS = { c80: 150000, nps80ccd1b: 50000, homeLoan24b: 200000 };

function slabTax(income, slabs) {
  let tax = 0, lower = 0;
  for (const s of slabs) {
    if (income > lower) {
      tax += (Math.min(income, s.to) - lower) * (s.rate / 100);
      lower = s.to;
    } else break;
  }
  return tax;
}

/**
 * Compute tax for a taxable income (after standard deduction and any
 * old-regime deductions). Returns the slab tax, post-rebate tax, cess and
 * rounded total.
 */
export function computeTax(taxableIncome, regime) {
  const ti = Math.max(0, taxableIncome);
  const base = slabTax(ti, regime.slabs);
  let tax = base;
  const reb = regime.rebate;
  if (ti <= reb.maxTaxableIncome) {
    tax = Math.max(0, tax - reb.maxAmount); // full 87A rebate
  } else if (reb.marginalReliefThreshold) {
    // Marginal relief: tax (pre-cess) limited to the income above the threshold.
    tax = Math.min(tax, ti - reb.marginalReliefThreshold);
  }
  const cess = tax * regime.cess;
  return { base, tax, cess, total: Math.round(tax + cess) };
}
