// United Arab Emirates take-home pay engine — 2026.
//
// There is NO personal income tax in the UAE (federal or emirate) on employment
// income — confirmed against PwC's UAE individual-tax page (reviewed 12 Mar 2026)
// and the absence of any UAE government announcement. Corporate Tax (9%) and the
// DMTT (15%) do not touch salaries. So income tax is always zero.
//
// The only mandatory pay deductions are GPSSA pension (UAE nationals only) and
// the ILOE unemployment-insurance premium (all employees). Figures from GPSSA
// and iloe.ae; verified against their worked figures (see scripts/tax-tests/ae.mjs).
//
// Scope (disclosed in the UI): private sector. GCC-national home-state pension
// routing, ADPF, and emirate housing fees are out of scope.

export const AE_TAX_YEAR = { year: "2026" };

// GPSSA pension — UAE nationals, private sector. The employee share never
// changes with the AED 20,000 subsidy test (that only shifts employer/govt).
export const AE_GPSSA = {
  law57: { floor: 3000, cap: 70000, employeeRate: 0.11 }, // new joiners
  law7: { floor: 1000, cap: 50000, employeeRate: 0.05 },  // legacy insured
};

// ILOE unemployment insurance (monthly, incl. 5% VAT). Test is on basic salary.
export const AE_ILOE = { threshold: 16000, lowPremium: 5.25, highPremium: 10.50 };

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Income tax in the UAE is always zero. */
export function aeIncomeTax() {
  return 0;
}

/** GPSSA employee pension deduction for a monthly contract salary. */
export function gpssaEmployeeMonthly(contractSalaryMonthly, regime = "law57") {
  const cfg = AE_GPSSA[regime] || AE_GPSSA.law57;
  const cs = Math.min(Math.max(contractSalaryMonthly, cfg.floor), cfg.cap);
  return r2(cs * cfg.employeeRate);
}

/** ILOE monthly premium, by (monthly) basic salary. */
export function iloeMonthly(basicMonthly) {
  return basicMonthly <= AE_ILOE.threshold ? AE_ILOE.lowPremium : AE_ILOE.highPremium;
}

/**
 * End-of-service gratuity for an expatriate (employer-funded lump sum, not a
 * payroll deduction — provided for completeness). basicMonthly = last basic
 * salary; years = completed service (fractional).
 */
export function aeGratuity(basicMonthly, years) {
  if (years < 1) return 0;
  const daily = basicMonthly / 30;
  const first = Math.min(years, 5) * 21 * daily;
  const rest = Math.max(years - 5, 0) * 30 * daily;
  return r2(Math.min(first + rest, basicMonthly * 24)); // cap = 2 years' wage
}

/**
 * Full annual take-home for a UAE employee.
 *
 * @param {number}  amount       Annual gross salary (AED).
 * @param {boolean} national     UAE national (pays GPSSA pension) vs expatriate.
 * @param {string}  regime       "law57" (new joiner) | "law7" (legacy insured).
 */
export function computeAeTakeHome({ amount, national = false, regime = "law57" }) {
  const gross = Math.max(0, amount);
  const monthly = gross / 12;

  const pensionMonthly = national ? gpssaEmployeeMonthly(monthly, regime) : 0;
  const iloe = iloeMonthly(monthly); // basic ≈ monthly gross (disclosed approximation)

  const pensionAnnual = r2(pensionMonthly * 12);
  const iloeAnnual = r2(iloe * 12);
  const incomeTax = 0;

  const totalDeductions = r2(pensionAnnual + iloeAnnual);
  const netAnnual = r2(Math.max(0, gross - totalDeductions));
  return {
    gross, incomeTax, pension: pensionAnnual, iloe: iloeAnnual, national,
    totalDeductions, netAnnual,
    monthly: netAnnual / 12,
    effectiveRate: gross > 0 ? (totalDeductions / gross) * 100 : 0,
  };
}
