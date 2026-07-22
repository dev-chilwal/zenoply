// United Kingdom take-home pay engine — tax year 2026-27 (6 Apr 2026 – 5 Apr 2027).
//
// Income tax (rUK bands, or the six Scottish bands), employee Class 1 National
// Insurance, and student-loan repayments. Figures read from gov.uk / gov.scot
// in July 2026; the Scottish figures are checked against gov.scot's own
// published rUK-vs-Scotland comparison (see scripts/tax-tests/gb.mjs).
// UPDATE EACH APRIL — sources cited per block.
//
// Scope/limitations (disclosed in the UI):
//  - England/Wales/NI ("rUK") or Scotland. Welsh rates == rUK for 2026-27.
//  - Category A NI (standard); an over-state-pension-age option gives 0% NI.
//  - Assumes even earnings across the year (NI and student loans are really
//    assessed per pay period, not cumulatively).
//  - Pension modelled as a net-pay arrangement (reduces income tax, not NI).
//  - Excludes the HICBC, dividend/savings income and benefits in kind.

export const GB_TAX_YEAR = { year: "2026-27" };

// Personal Allowance is UK-wide (incl. Scotland), tapered above £100k.
export const GB_PERSONAL_ALLOWANCE = { amount: 12570, taperFrom: 100000, taperRate: 0.5 };

// Income tax on taxable income (gross − Personal Allowance).
// rUK: 20/40/45. Scotland: 19/20/21/42/45/48 (six bands).
export const GB_INCOME_TAX = {
  ruk: [
    { width: 37700, rate: 0.20 },
    { width: 112570 - 37700, rate: 0.40 },
    { width: Infinity, rate: 0.45 },
  ],
  scotland: [
    { width: 3967, rate: 0.19 },   // starter
    { width: 16956 - 3967, rate: 0.20 },   // basic
    { width: 31092 - 16956, rate: 0.21 },  // intermediate
    { width: 62430 - 31092, rate: 0.42 },  // higher
    { width: 112570 - 62430, rate: 0.45 }, // advanced
    { width: Infinity, rate: 0.48 },       // top
  ],
};

// Employee Class 1 NI (category A). Annual thresholds are published directly by
// HMRC (do NOT derive from weekly ×52). No cap; 2% above the UEL is uncapped.
export const GB_NI = { primaryThreshold: 12570, upperEarningsLimit: 50270, mainRate: 0.08, upperRate: 0.02 };

// Employer NI — quoted as part of employment cost.
export const GB_EMPLOYER_NI = { secondaryThreshold: 5000, rate: 0.15 };

// Student & postgraduate loans. Per-period, non-cumulative, floored to the pound;
// postgraduate is charged on top of any undergraduate plan.
export const GB_STUDENT_LOANS = {
  plan1: { threshold: 26900, rate: 0.09 },
  plan2: { threshold: 29385, rate: 0.09 },
  plan4: { threshold: 33795, rate: 0.09 }, // Scotland
  plan5: { threshold: 25000, rate: 0.09 },
  postgrad: { threshold: 21000, rate: 0.06 },
};

// Auto-enrolment qualifying-earnings band (employee 5%, employer 3% minimum).
export const GB_PENSION = { lower: 6240, upper: 50270, employeeRate: 0.05, employerRate: 0.03 };

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const floorPound = (n) => Math.floor(n + 1e-9);
const floorPenny = (n) => Math.floor((n + 1e-9) * 100) / 100;

/** Personal Allowance for an adjusted net income, with the £100k taper. */
export function gbPersonalAllowance(adjustedNetIncome) {
  const p = GB_PERSONAL_ALLOWANCE;
  if (adjustedNetIncome <= p.taperFrom) return p.amount;
  return Math.max(0, p.amount - (adjustedNetIncome - p.taperFrom) * p.taperRate);
}

function bandTax(taxable, bands) {
  let tax = 0, remaining = Math.max(0, taxable);
  for (const b of bands) {
    if (remaining <= 0) break;
    tax += Math.min(remaining, b.width) * b.rate;
    remaining -= b.width;
  }
  return tax;
}

/**
 * Income tax. `incomeForAllowance` is the income that sets the PA taper
 * (gross less any net-pay pension); `taxableBase` is what tax is charged on.
 */
export function gbIncomeTax(taxableBase, incomeForAllowance, region = "ruk") {
  const pa = gbPersonalAllowance(incomeForAllowance);
  const taxable = Math.max(0, taxableBase - pa);
  const bands = region === "scotland" ? GB_INCOME_TAX.scotland : GB_INCOME_TAX.ruk;
  return r2(bandTax(taxable, bands));
}

/** Employee Class 1 NI on annual pay (even-earnings assumption). */
export function gbNationalInsurance(pay) {
  const n = GB_NI;
  return r2(
    n.mainRate * Math.max(0, Math.min(pay, n.upperEarningsLimit) - n.primaryThreshold) +
    n.upperRate * Math.max(0, pay - n.upperEarningsLimit)
  );
}

/** Employer Class 1 NI (context only — not part of take-home). */
export function gbEmployerNi(pay) {
  const e = GB_EMPLOYER_NI;
  return r2(e.rate * Math.max(0, pay - e.secondaryThreshold));
}

/**
 * Annual student-loan repayment, computed monthly (HMRC method: threshold ÷ 12
 * floored to the penny, deduction floored to the pound) then ×12.
 */
export function gbStudentLoan(annualPay, plan) {
  const cfg = GB_STUDENT_LOANS[plan];
  if (!cfg) return 0;
  const monthlyPay = annualPay / 12;
  const pt = floorPenny(cfg.threshold / 12);
  if (monthlyPay <= pt) return 0;
  return floorPound((monthlyPay - pt) * cfg.rate) * 12;
}

/**
 * Full annual take-home for a UK employee.
 *
 * @param {number}  amount        Annual gross salary.
 * @param {string}  region        "ruk" (England/Wales/NI) | "scotland".
 * @param {string}  studentPlan   none | plan1 | plan2 | plan4 | plan5.
 * @param {boolean} postgrad      Also has a postgraduate loan (charged on top).
 * @param {number}  pensionPct    Employee pension % (net-pay: cuts tax, not NI).
 * @param {boolean} statePensionAge  NI category C — 0% employee NI.
 */
export function computeGbTakeHome({
  amount, region = "ruk", studentPlan = "none", postgrad = false,
  pensionPct = 0, statePensionAge = false,
}) {
  const gross = Math.max(0, amount);
  const pension = r2(gross * (Math.max(0, pensionPct) / 100));
  const afterPension = gross - pension;

  const incomeTax = gbIncomeTax(afterPension, afterPension, region);
  const ni = statePensionAge ? 0 : gbNationalInsurance(gross); // pension not sacrificed
  let studentLoan = gbStudentLoan(gross, studentPlan);
  if (postgrad) studentLoan += gbStudentLoan(gross, "postgrad");

  const employerNi = gbEmployerNi(gross);
  const totalWithheld = r2(incomeTax + ni + studentLoan);
  const netAnnual = r2(Math.max(0, gross - pension - totalWithheld));

  return {
    gross, pension, incomeTax, ni, studentLoan, employerNi,
    personalAllowance: gbPersonalAllowance(afterPension),
    totalWithheld, netAnnual,
    monthly: netAnnual / 12,
    weekly: netAnnual / 52,
    effectiveRate: gross > 0 ? (totalWithheld / gross) * 100 : 0,
  };
}
