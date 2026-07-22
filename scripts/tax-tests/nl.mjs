// Netherlands — checked against the Belastingdienst Witte Maandloon-tabel 2026
// (below AOW age). Official rows are monthly; annual = monthly × 12.
import { nlBox1Tax, nlAhk, nlArk, computeNlTakeHome } from "../../lib/tax/nl.js";

export const label = "Netherlands (tax year 2026)";

export function run(check) {
  // Example A — table wage €4,000.50/mo -> annual €48,006.
  check("Box1 tax €48,006 (table A)", nlBox1Tax(48006), 17326);
  check("AHK €48,006 (table A)", nlAhk(48006), 1947);
  check("ARK €48,006 (table A)", nlArk(48006), 5528);

  // Example B — table wage €6,502.50/mo -> annual €78,030.
  check("Box1 tax €78,030 (table B)", nlBox1Tax(78030), 28603);
  check("AHK €78,030 (table B)", nlAhk(78030), 26);
  check("ARK €78,030 (table B)", nlArk(78030), 3574);

  // Official regression rows (net tax = zonder − credits), annual = monthly × 12.
  const netTax = (annual) => nlBox1Tax(annual) - nlAhk(annual) - nlArk(annual);
  check("net tax €32,400 (€2,700/mo)", netTax(32400), 267.50 * 12);
  check("net tax €36,018 (€3,001.50/mo)", netTax(36018), 388.58 * 12, 0.5);
  check("net tax €48,006 (€4,000.50/mo)", netTax(48006), 820.92 * 12, 0.5);
  check("net tax €78,030 (€6,502.50/mo)", netTax(78030), 2083.58 * 12, 0.5);
  check("net tax €96,012 (€8,001/mo)", netTax(96012), 2921.17 * 12, 0.5);
  check("net tax €132,030 (€11,002.50/mo)", netTax(132030), 4602.25 * 12, 0.5);

  // Credit boundaries.
  check("AHK full below taper start", nlAhk(29736), 3115);
  check("AHK zero at taper end", nlAhk(78426), 0);
  check("ARK zero above phase-out", nlArk(132920), 0);
  check("ARK max at €45,592", nlArk(45592), 5685);

  // End-to-end: no Zvw deducted from a regular employee.
  const r = computeNlTakeHome({ amount: 48006 });
  check("€48,006 net tax", r.netTax, 9851);
  check("€48,006 take-home = gross − net tax", r.netAnnual, 48006 - 9851);
  check("employer Zvw not in take-home", r.netAnnual, 48006 - r.netTax);
}
