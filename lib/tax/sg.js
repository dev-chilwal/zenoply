// Singapore take-home pay engine — income year 2026 (Year of Assessment 2027).
//
// Resident progressive income tax (schedule "from YA 2024 onwards", top rate
// 24%) plus employee CPF. The resident schedule is verified against IRAS's
// published sample computations (chargeable income $234,100 -> $27,629); CPF
// rates/ceilings are from the CPF Board's "Contribution Rate Table from
// 1 January 2026". See scripts/tax-tests/sg.mjs.
// UPDATE EACH YEAR — CPF senior-worker rates rise again on 1 Jan 2027; re-check
// the resident schedule and any Budget rebate.
//
// Scope/limitations (disclosed in the UI):
//  - Tax-RESIDENT employee. CPF applies only to Citizens and PRs (3rd year on);
//    foreigners (Employment Pass etc.) have zero CPF.
//  - Applies CPF Relief and Earned Income Relief automatically; other reliefs
//    (child, spouse, parent, SRS…) are user-specific and excluded.
//  - No rebate for YA 2026/2027. Bonuses (Additional Wages) are not modelled.

export const SG_TAX_YEAR = { year: "2026", ya: "2027" };

// Resident income tax bands — chargeable income, YA 2024 onwards.
export const SG_RESIDENT_BANDS = [
  { upTo: 20000, rate: 0.00 },
  { upTo: 30000, rate: 0.02 },
  { upTo: 40000, rate: 0.035 },
  { upTo: 80000, rate: 0.07 },
  { upTo: 120000, rate: 0.115 },
  { upTo: 160000, rate: 0.15 },
  { upTo: 200000, rate: 0.18 },
  { upTo: 240000, rate: 0.19 },
  { upTo: 280000, rate: 0.195 },
  { upTo: 320000, rate: 0.20 },
  { upTo: 500000, rate: 0.22 },
  { upTo: 1000000, rate: 0.23 },
  { upTo: Infinity, rate: 0.24 },
];

// CPF (from 1 January 2026): employee/total contribution rates by age band,
// on Ordinary Wages up to the OW ceiling. Employee share rounds DOWN; total
// rounds to the nearest dollar.
export const SG_CPF = {
  owCeilingMonthly: 8000,
  annualSalaryCeiling: 102000, // for the AW ceiling / annual limit
  bands: [
    { maxAge: 55, employee: 0.20, total: 0.37 },
    { maxAge: 60, employee: 0.18, total: 0.34 },
    { maxAge: 65, employee: 0.125, total: 0.25 },
    { maxAge: 70, employee: 0.075, total: 0.165 },
    { maxAge: Infinity, employee: 0.05, total: 0.125 },
  ],
};

// Overall personal income-tax relief cap per YA.
export const SG_RELIEF_CAP = 80000;

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Gross resident income tax on chargeable income (before any rebate). */
export function sgResidentTax(chargeableIncome) {
  const ci = Math.max(0, chargeableIncome);
  let tax = 0, prev = 0;
  for (const { upTo, rate } of SG_RESIDENT_BANDS) {
    if (ci <= prev) break;
    tax += (Math.min(ci, upTo) - prev) * rate;
    prev = upTo;
  }
  return r2(tax);
}

function cpfBand(age) {
  return SG_CPF.bands.find((b) => age <= b.maxAge) || SG_CPF.bands[SG_CPF.bands.length - 1];
}

/** Monthly CPF on Ordinary Wages (official rounding: total nearest, employee down). */
export function sgMonthlyCpf(ow, age) {
  const owForCpf = Math.min(Math.max(0, ow), SG_CPF.owCeilingMonthly);
  const band = cpfBand(age);
  const total = Math.round(owForCpf * band.total);
  const employee = Math.floor(owForCpf * band.employee);
  return { owForCpf, total, employee, employer: total - employee };
}

/** Annual employee CPF for a salary paid as 12 equal monthly Ordinary Wages. */
export function sgCpfAnnual(annualSalary, age) {
  const m = sgMonthlyCpf(annualSalary / 12, age);
  return { employee: m.employee * 12, employer: m.employer * 12, total: m.total * 12 };
}

/** Standard Earned Income Relief by age. */
export function sgEarnedIncomeRelief(age) {
  return age < 55 ? 1000 : age < 60 ? 6000 : 8000;
}

/**
 * Full annual take-home for a Singapore resident employee.
 *
 * @param {number}  amount        Annual gross salary (Ordinary Wages).
 * @param {number}  age           Age in years (sets CPF rate and reliefs).
 * @param {boolean} isCitizenOrPR Citizen/PR (CPF applies) vs foreigner (no CPF).
 */
export function computeSgTakeHome({ amount, age = 40, isCitizenOrPR = true }) {
  const gross = Math.max(0, amount);
  const cpf = isCitizenOrPR ? sgCpfAnnual(gross, age) : { employee: 0, employer: 0, total: 0 };

  // CPF Relief (compulsory employee CPF) + Earned Income Relief, capped overall.
  const reliefs = Math.min(cpf.employee + sgEarnedIncomeRelief(age), SG_RELIEF_CAP);
  const chargeable = Math.max(0, gross - reliefs);
  const incomeTax = sgResidentTax(chargeable); // no rebate for YA 2026/2027

  const netAnnual = r2(Math.max(0, gross - cpf.employee - incomeTax));
  return {
    gross, cpfEmployee: cpf.employee, cpfEmployer: cpf.employer,
    reliefs, chargeable, incomeTax,
    netAnnual, monthly: netAnnual / 12,
    effectiveRate: gross > 0 ? ((cpf.employee + incomeTax) / gross) * 100 : 0,
  };
}
