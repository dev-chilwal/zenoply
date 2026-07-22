// Canada take-home pay engine — federal, tax year 2026 (calendar year).
//
// Federal income tax (CRA R/K formula), the basic personal amount and its taper,
// the Canada employment amount, CPP/CPP2 and EI. Figures from CRA Guide T4127
// (123rd ed., 1 Jul 2026); the federal tax assembly is verified against CRA's
// published T4032-ON worked examples (see scripts/tax-tests/ca.mjs).
// UPDATE EACH YEAR — the lowest rate is a clean 14.00% for 2026.
//
// Scope/limitations (disclosed in the UI):
//  - FEDERAL ONLY. Provincial/territorial income tax, surtaxes (Ontario) and
//    health premiums are NOT included and materially change take-home. Quebec
//    (QPP/QPIP, 16.5% abatement) is out of scope.
//  - Annual method: CRA's per-pay-period rounding can differ by a few cents.
//  - CPP base contribution is a tax credit; the first-additional and CPP2
//    portions are a deduction from taxable income.

export const CA_TAX_YEAR = { year: "2026" };

// Federal tax via CRA's R (rate) / K (constant) form: tax = R × A − K.
export const CA_FEDERAL_RK = [
  { from: 0, R: 0.14, K: 0 },
  { from: 58523, R: 0.205, K: 3804 },
  { from: 117045, R: 0.26, K: 10241 },
  { from: 181440, R: 0.29, K: 15685 },
  { from: 258482, R: 0.33, K: 26024 },
];

export const CA_LOWEST_RATE = 0.14; // also the non-refundable credit rate

// Basic personal amount, tapered for high net income.
export const CA_BPA = { max: 16452, min: 14829, enhanced: 1623, taperFrom: 181440, taperTo: 258482 };

// Canada employment amount — a credit on the lesser of employment income and this.
export const CA_CEA = 1501;

// CPP 2026 (outside Quebec). Base (4.95%) is creditable; first-additional (1%)
// and CPP2 (4%) are deductible from taxable income.
export const CA_CPP = {
  ympe: 74600, basicExemption: 3500, yampe: 85000,
  totalRate: 0.0595, baseRate: 0.0495, firstAdditionalRate: 0.01, cpp2Rate: 0.04,
  maxTotal: 4230.45, maxBaseCreditable: 3519.45, maxCpp2: 416.00,
};

// EI 2026 (outside Quebec).
export const CA_EI = { rate: 0.0163, maxInsurable: 68900, maxPremium: 1123.07 };

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** CPP and CPP2 contributions on annual gross (annual method). */
export function caCpp(gross) {
  const c = CA_CPP;
  const contributory = Math.max(0, Math.min(gross, c.ympe) - c.basicExemption);
  const total = Math.min(r2(contributory * c.totalRate), c.maxTotal);
  const base = Math.min(r2(total * (c.baseRate / c.totalRate)), c.maxBaseCreditable);
  const firstAdditional = r2(total - base);
  const cpp2Band = Math.max(0, Math.min(gross, c.yampe) - c.ympe);
  const cpp2 = Math.min(r2(cpp2Band * c.cpp2Rate), c.maxCpp2);
  return { total, base, firstAdditional, cpp2, cash: r2(total + cpp2) };
}

/** EI premium on annual gross. */
export function caEi(gross) {
  const e = CA_EI;
  return Math.min(r2(Math.min(gross, e.maxInsurable) * e.rate), e.maxPremium);
}

/** Basic personal amount for a net income, with the high-income taper. */
export function caBpaf(netIncome) {
  const b = CA_BPA;
  if (netIncome <= b.taperFrom) return b.max;
  if (netIncome >= b.taperTo) return b.min;
  return r2(b.max - (netIncome - b.taperFrom) * (b.enhanced / (b.taperTo - b.taperFrom)));
}

function rkFor(A) {
  let row = CA_FEDERAL_RK[0];
  for (const r of CA_FEDERAL_RK) if (A >= r.from) row = r;
  return row;
}

/**
 * Federal income tax on taxable income A, given the creditable CPP-base and EI
 * amounts and the employment income (for the Canada employment amount).
 * Reproduces CRA's T3 = R×A − K − K1 − K2 − K4 assembly.
 */
export function caFederalTax(A, { cppBaseCreditable = 0, eiPremium = 0, employmentIncome = 0 } = {}) {
  const ti = Math.max(0, A);
  const { R, K } = rkFor(ti);
  const basic = R * ti - K;
  const k1 = CA_LOWEST_RATE * caBpaf(ti); // BPA credit (NI ≈ taxable income)
  const k2 = CA_LOWEST_RATE * (Math.min(cppBaseCreditable, CA_CPP.maxBaseCreditable) + Math.min(eiPremium, CA_EI.maxPremium));
  const k4 = CA_LOWEST_RATE * Math.min(employmentIncome, CA_CEA);
  return r2(Math.max(0, basic - k1 - k2 - k4));
}

/**
 * Full annual take-home for a Canadian employee (federal + CPP/EI only).
 *
 * @param {number} amount  Annual gross salary.
 * @param {number} rrsp    Employee RRSP/pension deducted at source (pre-tax).
 */
export function computeCaTakeHome({ amount, rrsp = 0 }) {
  const gross = Math.max(0, amount);
  const contribRrsp = Math.max(0, rrsp);
  const cpp = caCpp(gross);
  const ei = caEi(gross);

  // First-additional CPP + CPP2 are deductions from taxable income.
  const cppDeduction = r2(cpp.firstAdditional + cpp.cpp2);
  const taxable = Math.max(0, gross - contribRrsp - cppDeduction);
  const federalTax = caFederalTax(taxable, {
    cppBaseCreditable: cpp.base, eiPremium: ei, employmentIncome: gross,
  });

  const totalWithheld = r2(federalTax + cpp.cash + ei);
  const netAnnual = r2(Math.max(0, gross - contribRrsp - totalWithheld));
  return {
    gross, rrsp: contribRrsp, taxable, federalTax,
    cpp: cpp.total, cpp2: cpp.cpp2, cppCash: cpp.cash, ei,
    totalWithheld, netAnnual,
    monthly: netAnnual / 12,
    biweekly: netAnnual / 26,
    effectiveRate: gross > 0 ? (totalWithheld / gross) * 100 : 0,
  };
}
