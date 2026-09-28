// Lumpsum vs SIP comparison maths (pure, node-testable).
//
// The question people actually ask is "I have this sum — invest it all now,
// or spread it as a monthly SIP?", so both routes deploy the SAME total:
//   lumpsum: all of `total` on day one;
//   SIP:     total / (12 × years) at the start of every month, with the
//            not-yet-invested cash parked at `parkRate` (0 = idle cash).
//
// Both routes compound at the same EFFECTIVE annual rate. The SIP converts it
// to the equivalent monthly rate (1 + r)^(1/12) − 1 rather than the common
// r / 12 shortcut, because r / 12 compounds to more than r a year (12% → 12.68%)
// and would tilt the comparison towards SIP by itself.

const monthly = (annualPct) => Math.pow(1 + annualPct / 100, 1 / 12) - 1;

/**
 * Simulate the SIP route month by month.
 * Returns { value, invested, sipValue, parked, series } where `series` holds
 * the combined value (SIP pot + parked cash) at the end of each year.
 */
export function sipRoute(total, ratePct, years, parkRatePct = 0) {
  const n = Math.round(years) * 12;
  const i = monthly(ratePct);
  const j = monthly(parkRatePct);
  const m = n > 0 ? total / n : 0;
  let pot = 0, parked = total;
  const series = [total];
  for (let k = 1; k <= n; k++) {
    // Annuity due: the instalment leaves the parking account and is invested
    // at the start of the month, then both balances earn the month's return.
    parked -= m;
    pot += m;
    pot *= 1 + i;
    parked *= 1 + j;
    if (k % 12 === 0) series.push(pot + parked);
  }
  // Float drift can leave parked at ±1e-9 when parkRate is 0.
  if (Math.abs(parked) < 1e-6) parked = 0;
  return { value: pot + parked, invested: total, sipValue: pot, parked, monthly: m, series };
}

export function lumpsumRoute(total, ratePct, years) {
  const y = Math.round(years);
  const g = 1 + ratePct / 100;
  const series = Array.from({ length: y + 1 }, (_, k) => total * Math.pow(g, k));
  return { value: series[y], invested: total, series };
}

/**
 * The market return the SIP route would need to finish level with the
 * lumpsum (parking rate held fixed). Returns null when no rate in
 * [-50%, 200%] closes the gap, e.g. when the SIP route already wins.
 */
export function breakEvenSipRate(total, ratePct, years, parkRatePct = 0) {
  const target = lumpsumRoute(total, ratePct, years).value;
  const f = (r) => sipRoute(total, r, years, parkRatePct).value - target;
  let lo = ratePct, hi = 200;
  if (f(lo) >= 0) return null;
  if (f(hi) < 0) return null;
  for (let k = 0; k < 100; k++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

export function compare(total, ratePct, years, parkRatePct = 0) {
  const lump = lumpsumRoute(total, ratePct, years);
  const sip = sipRoute(total, ratePct, years, parkRatePct);
  const diff = lump.value - sip.value;
  const tie = Math.abs(diff) < Math.max(1, total * 1e-9);
  return {
    lump, sip, diff,
    winner: tie ? "tie" : diff > 0 ? "lumpsum" : "sip",
    breakEven: diff > 0 && !tie ? breakEvenSipRate(total, ratePct, years, parkRatePct) : null,
  };
}
