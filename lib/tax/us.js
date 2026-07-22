// United States take-home pay engine — federal, tax year 2026 (calendar year).
//
// Federal income tax by filing status, FICA (Social Security + Medicare +
// Additional Medicare Tax), and the Child Tax Credit. Figures from IRS Rev.
// Proc. 2025-32 (which incorporates the OBBBA amendments) and IRS Topic 751;
// verified against worked examples on the IRS schedules (see scripts/tax-tests/us.mjs).
// The 2026 brackets/standard deduction are OBBBA-PERMANENT — a pre-2025 engine
// that reverts them to the old TCJA-sunset figures is wrong. UPDATE EACH YEAR.
//
// Scope/limitations (disclosed in the UI):
//  - FEDERAL ONLY. State and local income taxes, and state payroll levies (CA
//    SDI, PFML, etc.), are NOT included and materially change take-home.
//  - Standard deduction only (no itemizing); the four new Schedule 1-A
//    deductions (tips/overtime/senior/car-loan) are out of scope.
//  - Traditional 401(k) reduces income-tax wages but NOT FICA wages.

export const US_TAX_YEAR = { year: "2026" };

// Rate schedules — [upper, rate, baseTaxAtLower], from Rev. Proc. 2025-32.
export const US_BRACKETS = {
  single: [
    [12400, 0.10, 0], [50400, 0.12, 1240], [105700, 0.22, 5800],
    [201775, 0.24, 17966], [256225, 0.32, 41024], [640600, 0.35, 58448],
    [Infinity, 0.37, 192979.25],
  ],
  mfj: [
    [24800, 0.10, 0], [100800, 0.12, 2480], [211400, 0.22, 11600],
    [403550, 0.24, 35932], [512450, 0.32, 82048], [768700, 0.35, 116896],
    [Infinity, 0.37, 206583.50],
  ],
  hoh: [
    [17700, 0.10, 0], [67450, 0.12, 1770], [105700, 0.22, 7740],
    [201750, 0.24, 16155], [256200, 0.32, 39207], [640600, 0.35, 56631],
    [Infinity, 0.37, 191171],
  ],
  mfs: [
    [12400, 0.10, 0], [50400, 0.12, 1240], [105700, 0.22, 5800],
    [201775, 0.24, 17966], [256225, 0.32, 41024], [384350, 0.35, 58448],
    [Infinity, 0.37, 103291.75],
  ],
};

export const US_STANDARD_DEDUCTION = { single: 16100, mfj: 32200, hoh: 24150, mfs: 16100 };

// FICA 2026.
export const US_FICA = {
  ssRate: 0.062, ssWageBase: 184500,
  medicareRate: 0.0145,
  addlMedicareRate: 0.009,
  addlMedicareThreshold: { single: 200000, hoh: 200000, mfj: 250000, mfs: 125000 },
};

// Child Tax Credit 2026: $2,200/child under 17, phasing out above the threshold.
export const US_CTC = { perChild: 2200, phaseoutThreshold: { single: 200000, hoh: 200000, mfs: 200000, mfj: 400000 }, reductionPer1000: 50 };

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Federal income tax on taxable income for a filing status. */
export function usIncomeTax(taxableIncome, status = "single") {
  const ti = Math.max(0, taxableIncome);
  const brackets = US_BRACKETS[status] || US_BRACKETS.single;
  let lower = 0;
  for (const [upper, rate, base] of brackets) {
    if (ti <= upper) return r2(base + rate * (ti - lower));
    lower = upper;
  }
  return 0;
}

/** Employee FICA. `medicareWages` = gross less §125 pre-tax (not less 401k). */
export function usFica(medicareWages, status = "single") {
  const f = US_FICA;
  const w = Math.max(0, medicareWages);
  const ss = f.ssRate * Math.min(w, f.ssWageBase);
  const medicare = f.medicareRate * w;
  const threshold = f.addlMedicareThreshold[status] ?? 200000;
  const addlMedicare = f.addlMedicareRate * Math.max(0, w - threshold);
  return {
    socialSecurity: r2(ss), medicare: r2(medicare),
    additionalMedicare: r2(addlMedicare), total: r2(ss + medicare + addlMedicare),
  };
}

/** Child Tax Credit (nonrefundable portion used to offset tax). */
export function usChildTaxCredit(children, magi, status = "single") {
  if (children <= 0) return 0;
  const gross = US_CTC.perChild * children;
  const threshold = US_CTC.phaseoutThreshold[status] ?? 200000;
  const excess = Math.max(0, magi - threshold);
  const reduction = US_CTC.reductionPer1000 * Math.ceil(excess / 1000);
  return Math.max(0, gross - reduction);
}

/**
 * Full annual take-home for a US employee (federal + FICA only).
 *
 * @param {number}  amount     Annual gross wages.
 * @param {string}  status     single | mfj | hoh | mfs.
 * @param {number}  children   Qualifying children under 17 (for the CTC).
 * @param {number}  pretax401k Traditional 401(k) — cuts income tax, not FICA.
 */
export function computeUsTakeHome({ amount, status = "single", children = 0, pretax401k = 0 }) {
  const gross = Math.max(0, amount);
  const deferral = Math.max(0, pretax401k);
  const agi = Math.max(0, gross - deferral);

  const stdDeduction = US_STANDARD_DEDUCTION[status] ?? US_STANDARD_DEDUCTION.single;
  const taxable = Math.max(0, agi - stdDeduction);
  const incomeTaxBeforeCredits = usIncomeTax(taxable, status);
  const ctc = usChildTaxCredit(children, agi, status);
  const incomeTax = r2(Math.max(0, incomeTaxBeforeCredits - ctc));

  const fica = usFica(gross, status); // no §125 modelled; 401k doesn't reduce FICA
  const totalWithheld = r2(incomeTax + fica.total);
  const netAnnual = r2(Math.max(0, gross - deferral - totalWithheld));

  return {
    gross, deferral, agi, taxable, stdDeduction,
    incomeTaxBeforeCredits, ctc, incomeTax, fica,
    totalWithheld, netAnnual,
    monthly: netAnnual / 12,
    biweekly: netAnnual / 26,
    effectiveRate: gross > 0 ? (totalWithheld / gross) * 100 : 0,
  };
}
