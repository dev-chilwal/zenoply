// Germany take-home pay engine — tax year 2026 (calendar year).
//
// Income tax uses §32a EStG's continuous piecewise formula (not brackets),
// verified exactly against the published 2026 Grundtabelle. Solidarity surcharge
// (§4 SolZG) and church tax are verified against the same table. Social-insurance
// contributions use the 2026 Sozialversicherungsrechengrößen. The payroll
// withholding base uses the statutory Vorsorgepauschale (§39b) — see the note on
// verification in scripts/tax-tests/de.mjs.
// UPDATE EACH JANUARY — sources: gesetze-im-internet.de (§32a/§39b EStG, SolZG),
// Deutsche Rentenversicherung SV-Rechengrößen 2026.
//
// Scope (disclosed in the UI): single (class I) or married one-earner (class III
// splitting), GKV member, non-Saxony. Excludes tax classes II/V/VI, Kappung,
// child allowances in withholding, and private insurance.

export const DE_TAX_YEAR = { year: "2026" };

// §32a EStG tariff, ab VZ 2026. Grundfreibetrag €12,348.
export const DE_GRUNDFREIBETRAG = 12348;

// Social-insurance rates and ceilings (employee share), 2026.
export const DE_SV = {
  rvRate: 0.093, rvavCeiling: 101400,           // pension
  avRate: 0.013,                                 // unemployment (same ceiling)
  kvRate: 0.073, zusatzHalf: 0.0145,             // health: 7.3% + half of avg 2.9% Zusatzbeitrag
  kvpvCeiling: 69750,                            // health & care ceiling
  pvRate: 0.018, pvChildlessSurcharge: 0.006,    // long-term care (+0.6pp childless >23)
};

// Solidarity surcharge (§4 SolZG): 5.5% of income tax, with a Freigrenze and an
// 11.9%-of-excess Milderungszone. First applies at these thresholds in VZ 2026.
export const DE_SOLI = { rate: 0.055, freigrenzeSingle: 20350, freigrenzeJoint: 40700, milderung: 0.119 };

// Church tax: 8% in Bavaria & Baden-Württemberg, 9% elsewhere.
export const DE_CHURCH = { rateBYBW: 0.08, rateOther: 0.09 };

// Payroll standard deductions before the tariff (§9a, §10c EStG).
export const DE_PAUSCHBETRAG = { arbeitnehmer: 1230, sonderausgaben: 36 };

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
// Soli rounds to the nearest cent with ties going DOWN (§4 S.3 SolZG drops
// fractions of a cent): e.g. €6354.095 -> €6354.09, but €251.566 -> €251.57.
const roundHalfDown = (n) => Math.ceil(n * 100 - 0.5) / 100;

/** §32a(1) EStG income tax for a taxable income (zvE), Grundtarif. Whole euros. */
export function deIncomeTax(zve) {
  const x = Math.floor(Math.max(0, zve));
  let t;
  if (x <= 12348) t = 0;
  else if (x <= 17799) { const y = (x - 12348) / 10000; t = (914.51 * y + 1400) * y; }
  else if (x <= 69878) { const z = (x - 17799) / 10000; t = (173.10 * z + 2397) * z + 1034.87; }
  else if (x <= 277825) t = 0.42 * x - 11135.63;
  else t = 0.45 * x - 19470.38;
  return Math.floor(t);
}

/** §32a(5) splitting for jointly assessed spouses (class III). */
export function deIncomeTaxSplitting(zveJoint) {
  return 2 * deIncomeTax(Math.floor(zveJoint) / 2);
}

/** Solidarity surcharge on an income-tax amount. */
export function deSoli(incomeTax, joint = false) {
  const fg = joint ? DE_SOLI.freigrenzeJoint : DE_SOLI.freigrenzeSingle;
  if (incomeTax <= fg) return 0;
  return roundHalfDown(Math.min(DE_SOLI.rate * incomeTax, DE_SOLI.milderung * (incomeTax - fg)));
}

/** Church tax on an income-tax amount (0 if not a member). */
export function deChurchTax(incomeTax, { member = false, rate = DE_CHURCH.rateOther } = {}) {
  if (!member) return 0;
  return r2(incomeTax * rate);
}

/** Employee social-insurance contributions on annual gross. */
export function deSocialInsurance(grossAnnual, { childlessOver23 = false } = {}) {
  const s = DE_SV;
  const g = Math.max(0, grossAnnual);
  const rvavBase = Math.min(g, s.rvavCeiling);
  const kvpvBase = Math.min(g, s.kvpvCeiling);
  const rv = r2(s.rvRate * rvavBase);
  const av = r2(s.avRate * rvavBase);
  const kv = r2((s.kvRate + s.zusatzHalf) * kvpvBase);
  const pv = r2((s.pvRate + (childlessOver23 ? s.pvChildlessSurcharge : 0)) * kvpvBase);
  return { rv, av, kv, pv, total: r2(rv + av + kv + pv) };
}

/**
 * Vorsorgepauschale (§39b(2) S.5 Nr.3) — notional insurance deduction used to
 * set the Lohnsteuer base. Pension (9.3%) + health (7.0% ermäßigt + half
 * Zusatzbeitrag) + care, each capped at its ceiling. Unemployment part is nil
 * for normal full-time wages (health+care already exceed the €1,900 floor).
 */
export function deVorsorgepauschale(grossAnnual, { childlessOver23 = false } = {}) {
  const s = DE_SV;
  const g = Math.max(0, grossAnnual);
  const pension = s.rvRate * Math.min(g, s.rvavCeiling);
  const health = (0.070 + s.zusatzHalf) * Math.min(g, s.kvpvCeiling); // 7.0% ermäßigt
  const care = (s.pvRate + (childlessOver23 ? s.pvChildlessSurcharge : 0)) * Math.min(g, s.kvpvCeiling);
  return pension + health + care;
}

/**
 * Full annual take-home for a German employee.
 *
 * @param {number}  amount          Annual gross salary.
 * @param {boolean} married         Class III splitting (one-earner couple) vs class I.
 * @param {boolean} church          Church-tax member.
 * @param {number}  churchRate      0.08 (BY/BW) or 0.09.
 * @param {boolean} childlessOver23 Higher care contribution / Vorsorge.
 */
export function computeDeTakeHome({
  amount, married = false, church = false, churchRate = DE_CHURCH.rateOther, childlessOver23 = false,
}) {
  const gross = Math.max(0, amount);
  const sv = deSocialInsurance(gross, { childlessOver23 });

  const vsp = deVorsorgepauschale(gross, { childlessOver23 });
  const lohnsteuerBase = Math.max(0, gross - DE_PAUSCHBETRAG.arbeitnehmer - DE_PAUSCHBETRAG.sonderausgaben - vsp);
  const incomeTax = married ? deIncomeTaxSplitting(lohnsteuerBase) : deIncomeTax(lohnsteuerBase);
  const soli = deSoli(incomeTax, married);
  const churchTax = deChurchTax(incomeTax, { member: church, rate: churchRate });

  const totalTax = r2(incomeTax + soli + churchTax);
  const totalWithheld = r2(totalTax + sv.total);
  const netAnnual = r2(Math.max(0, gross - totalWithheld));

  return {
    gross, sv, incomeTax, soli, churchTax, totalTax, socialTotal: sv.total,
    totalWithheld, netAnnual,
    monthly: netAnnual / 12,
    effectiveRate: gross > 0 ? (totalWithheld / gross) * 100 : 0,
  };
}
