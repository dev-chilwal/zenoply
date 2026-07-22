// United States (federal) — checked against worked examples computed on the
// IRS Rev. Proc. 2025-32 schedules and Topic 751 FICA rates.
import {
  usIncomeTax, usFica, usChildTaxCredit, computeUsTakeHome,
} from "../../lib/tax/us.js";

export const label = "United States — federal (2026)";

export function run(check) {
  // Income tax by filing status (taxable-income boundaries + interiors).
  check("single $43,900 -> $5,020", usIncomeTax(43900, "single"), 5020);
  check("single $83,900 -> $13,170", usIncomeTax(83900, "single"), 13170);
  check("single $233,900 -> $51,304", usIncomeTax(233900, "single"), 51304);
  check("mfj $117,800 -> $15,340", usIncomeTax(117800, "mfj"), 15340);
  check("mfj $800,000 -> $218,164.50", usIncomeTax(800000, "mfj"), 218164.50);
  check("single $0 -> $0", usIncomeTax(0, "single"), 0);
  check("single at 10% cap $12,400", usIncomeTax(12400, "single"), 1240);

  // FICA — Social Security cap and the Additional Medicare Tax.
  const f60 = usFica(60000, "single");
  check("SS $60k", f60.socialSecurity, 3720);
  check("Medicare $60k", f60.medicare, 870);
  check("FICA total $60k", f60.total, 4590);
  const f250 = usFica(250000, "single");
  check("SS capped at $184,500", f250.socialSecurity, 11439);
  check("Medicare $250k", f250.medicare, 3625);
  check("Additional Medicare $250k single", f250.additionalMedicare, 450);
  check("FICA total $250k single", f250.total, 15514);

  // Child Tax Credit.
  check("CTC 2 children, MAGI $150k MFJ", usChildTaxCredit(2, 150000, "mfj"), 4400);
  check("CTC phases out above threshold", usChildTaxCredit(2, 410000, "mfj"), 4400 - 50 * 10);
  check("CTC 0 children -> 0", usChildTaxCredit(0, 50000, "single"), 0);

  // End-to-end worked examples (A-D).
  const a = computeUsTakeHome({ amount: 60000, status: "single" });
  check("A: single $60k income tax", a.incomeTax, 5020);
  check("A: single $60k FICA", a.fica.total, 4590);
  check("A: single $60k net", a.netAnnual, 50390);

  const b = computeUsTakeHome({ amount: 100000, status: "single" });
  check("B: single $100k net", b.netAnnual, 79180);

  const c = computeUsTakeHome({ amount: 150000, status: "mfj", children: 2 });
  check("C: MFJ $150k income tax after CTC", c.incomeTax, 10940);
  check("C: MFJ $150k FICA", c.fica.total, 11475);
  check("C: MFJ $150k net", c.netAnnual, 127585);

  const d = computeUsTakeHome({ amount: 250000, status: "single" });
  check("D: single $250k net", d.netAnnual, 183182);

  // 401(k) reduces income tax but not FICA.
  const k = computeUsTakeHome({ amount: 100000, status: "single", pretax401k: 10000 });
  check("401k cuts taxable income", k.taxable, 100000 - 10000 - 16100);
  check("401k does NOT cut FICA", k.fica.total, usFica(100000, "single").total);
}
