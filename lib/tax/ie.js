// Ireland take-home pay engine — tax year 2026 (1 Jan – 31 Dec 2026).
//
// Three independent charges on the same gross pay: PAYE income tax (bands +
// non-refundable credits), USC (its own progressive bands), and PRSI (Class A,
// per-period). Figures read from Revenue and the Dept. of Social Protection in
// July 2026 and checked against their published worked examples
// (see scripts/verify-au-tax.mjs — the harness covers every jurisdiction).
// UPDATE THESE FIGURES EACH YEAR — sources cited per block.
//
// Scope/limitations (disclosed in the UI):
//  - Resident, full year, PAYE employee, cumulative basis.
//  - Single, married sole-earner, or one-parent (SPCCC). Two-earner band
//    splitting is a per-person calculation a single-salary tool can't express.
//  - Pension relief reduces income tax only (never USC or PRSI).
//  - Excludes age-65+ exemption limits, BIK, and the self-assessed USC surcharge.

export const IE_TAX_YEAR = { year: "2026" };

// Income tax: two rates, unchanged for 2026 (Revenue Budget 2026 Summary).
// https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx
export const IE_INCOME_TAX = {
  standardRate: 0.20,
  higherRate: 0.40,
  // Standard-rate cut-off point and the typical employee credit total, by status.
  status: {
    single:        { srcop: 44000, credits: 2000 + 2000 },          // personal + PAYE
    marriedSingle: { srcop: 53000, credits: 4000 + 2000 },          // sole-earner couple
    oneParent:     { srcop: 48000, credits: 2000 + 2000 + 1900 },   // + SPCCC
  },
};

// USC: charged on gross before pension, its own bands. The 2% band ceiling rose
// from €27,382 (2025) to €28,700 (2026) — independently confirmed against
// revenue.ie/.../usc/standard-rates-thresholds.aspx (published 1 Jan 2026).
export const IE_USC = {
  exemptionThreshold: 13000, // cliff: total income <= this => no USC at all
  reducedRateIncomeLimit: 60000, // 70+ or full medical card, and income <= this
  bands: [
    { width: 12012, rate: 0.005 },
    { width: 16688, rate: 0.02 },  // to 28,700
    { width: 41344, rate: 0.03 },  // to 70,044
    { width: Infinity, rate: 0.08 },
  ],
  reducedBands: [
    { width: 12012, rate: 0.005 },
    { width: Infinity, rate: 0.02 },
  ],
};

// PRSI Class A employee. Two rate periods in 2026 under the PRSI Roadmap:
// 4.20% to 30 Sep, 4.35% from 1 Oct. No ceiling; charged on gross before pension.
// Nil at or below €352/week; above it the rate applies from the first euro, with
// a low-earnings credit (max €12/wk) tapering out by €424/week.
// https://assets.gov.ie/.../SW_14_..._January_2026_.pdf-web.pdf
export const IE_PRSI = {
  rateJanSep: 0.042,
  rateOctDec: 0.0435,
  weeksJanSep: 39,
  weeksOctDec: 13,
  weeklyExemptThreshold: 352, // employee pays nil at or below this
  credit: { max: 12, from: 352.01, to: 424, taperDivisor: 6 },
};

// Employer PRSI — conventionally quoted as part of employment cost, like super.
// Higher rate applies above €552/week (raised from €527 in 2026).
export const IE_EMPLOYER_PRSI = {
  weeklyThreshold: 552,
  lowRateJanSep: 0.09, highRateJanSep: 0.1125,
  lowRateOctDec: 0.0915, highRateOctDec: 0.114,
};

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Income tax after non-refundable credits (floored at zero). */
export function ieIncomeTax(taxableIncome, { srcop, credits }) {
  const ti = Math.max(0, taxableIncome);
  const t = IE_INCOME_TAX;
  const gross = t.standardRate * Math.min(ti, srcop) + t.higherRate * Math.max(0, ti - srcop);
  return r2(Math.max(0, gross - credits));
}

/** USC on annual income. `reducedRate` = aged 70+ or full medical card. */
export function ieUsc(income, { reducedRate = false } = {}) {
  const ti = Math.max(0, income);
  const u = IE_USC;
  if (ti <= u.exemptionThreshold) return 0; // cliff-edge exemption
  const bands = reducedRate && ti <= u.reducedRateIncomeLimit ? u.reducedBands : u.bands;
  let total = 0, remaining = ti;
  for (const b of bands) {
    if (remaining <= 0) break;
    total += Math.min(remaining, b.width) * b.rate;
    remaining -= b.width;
  }
  return r2(total);
}

/** Weekly PRSI credit taper: €12 max, less one-sixth of earnings over €352.01. */
export function iePrsiCreditWeekly(grossWeekly) {
  const c = IE_PRSI.credit;
  if (grossWeekly < c.from || grossWeekly > c.to) return 0;
  return r2(Math.max(0, c.max - r2((grossWeekly - c.from) / c.taperDivisor)));
}

/** Class A employee PRSI for one week at a given rate (DSP rounding). */
export function iePrsiWeekly(grossWeekly, rate) {
  const p = IE_PRSI;
  if (grossWeekly <= p.weeklyExemptThreshold) return 0;
  return r2(Math.max(0, r2(grossWeekly * rate) - iePrsiCreditWeekly(grossWeekly)));
}

/**
 * Annual PRSI for a salaried employee, blending the two 2026 rate periods
 * (39 weeks at 4.20% + 13 weeks at 4.35%) using the DSP weekly method so the
 * low-earnings credit is applied correctly.
 */
export function iePrsiAnnual(annualGross) {
  const p = IE_PRSI;
  const weekly = annualGross / 52;
  return r2(
    iePrsiWeekly(weekly, p.rateJanSep) * p.weeksJanSep +
    iePrsiWeekly(weekly, p.rateOctDec) * p.weeksOctDec
  );
}

/** Employer PRSI for the year (context only — not part of take-home). */
export function ieEmployerPrsiAnnual(annualGross) {
  const e = IE_EMPLOYER_PRSI;
  const weekly = annualGross / 52;
  const rate = (lo, hi) => (weekly > e.weeklyThreshold ? hi : lo);
  return r2(
    weekly * rate(e.lowRateJanSep, e.highRateJanSep) * IE_PRSI.weeksJanSep +
    weekly * rate(e.lowRateOctDec, e.highRateOctDec) * IE_PRSI.weeksOctDec
  );
}

/**
 * Full annual take-home for a PAYE employee.
 *
 * @param {number}  amount           Annual gross salary.
 * @param {string}  status           single | marriedSingle | oneParent.
 * @param {number}  pensionPct        Employee pension as % of gross (income-tax relief only).
 * @param {boolean} reducedUsc        70+ or full medical card (reduced USC rates).
 */
export function computeIeTakeHome({ amount, status = "single", pensionPct = 0, reducedUsc = false }) {
  const gross = Math.max(0, amount);
  const cfg = IE_INCOME_TAX.status[status] || IE_INCOME_TAX.status.single;
  const pension = r2(gross * (Math.max(0, pensionPct) / 100));

  const incomeTax = ieIncomeTax(gross - pension, cfg); // pension relieved
  const usc = ieUsc(gross, { reducedRate: reducedUsc }); // pension NOT relieved
  const prsi = iePrsiAnnual(gross); // pension NOT relieved
  const employerPrsi = ieEmployerPrsiAnnual(gross);

  const totalWithheld = r2(incomeTax + usc + prsi);
  const netAnnual = r2(Math.max(0, gross - pension - totalWithheld));

  return {
    gross, pension, incomeTax, usc, prsi, employerPrsi,
    srcop: cfg.srcop, credits: cfg.credits,
    totalWithheld,
    netAnnual,
    monthly: netAnnual / 12,
    fortnightly: netAnnual / 26,
    // Share of gross lost to tax, USC and PRSI (pension excluded — it's saved, not lost).
    effectiveRate: gross > 0 ? (totalWithheld / gross) * 100 : 0,
  };
}
