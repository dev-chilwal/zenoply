// Australia — checked against the ATO's published worked examples.
import {
  auIncomeTax, auMedicareLevy, auLito, auHelpRepayment,
  auSuper, auSalaryFromPackage, computeAuTakeHome, AU_SUPER,
} from "../../lib/tax/au.js";

export const label = "Australia (FY 2026-27)";

export function run(check) {
  // Medicare levy (ATO example: Angie $29,000 -> $98.90) + shade-in continuity.
  check("Medicare €29,000 -> $98.90 (ATO: Angie)", auMedicareLevy(29000), 98.90);
  check("Medicare at lower threshold -> nil", auMedicareLevy(28011), 0);
  check("Medicare below threshold -> nil", auMedicareLevy(20000), 0);
  check("Medicare upper $35,013 (lesser of shade/2%)", auMedicareLevy(35013), 700.20);
  check("Medicare just above upper -> 2%", auMedicareLevy(36000), 720);
  check("Medicare $90,000 -> 2%", auMedicareLevy(90000), 1800);

  // HELP repayments (ATO examples 1-3, 2026-27).
  check("HELP $86,380 (ATO: Christina)", auHelpRepayment(86380), 2527.80);
  check("HELP $137,064 (ATO: Barry)", auHelpRepayment(137064), 10276.99);
  check("HELP $254,780 (ATO: Priya)", auHelpRepayment(254780), 25478);
  check("HELP at threshold -> nil", auHelpRepayment(69528), 0);
  check("HELP tier1/tier2 continuity", auHelpRepayment(129717), 9028, 0.5);

  // Income tax brackets (FY2026-27, 15% bracket).
  check("Tax $18,200 tax-free", auIncomeTax(18200), 0);
  check("Tax $45,000", auIncomeTax(45000), 4020);
  check("Tax $135,000", auIncomeTax(135000), 31020);
  check("Tax $190,000", auIncomeTax(190000), 51370);
  check("Tax $250,000", auIncomeTax(250000), 78370);

  // LITO.
  check("LITO $37,500 -> max", auLito(37500), 700);
  check("LITO $45,000 -> 325", auLito(45000), 325);
  check("LITO $66,667 -> ~0", auLito(66667), 0, 0.02);
  check("LITO $80,000 -> 0", auLito(80000), 0);

  // Super guarantee.
  check("Super $100,000 @12%", auSuper(100000), 12000);
  check("Super capped at max base", auSuper(400000), AU_SUPER.maxContributionBase * 0.12);
  check("Package round-trip $112,000", auSalaryFromPackage(112000), 100000);

  // End-to-end.
  const r = computeAuTakeHome({ amount: 100000 });
  check("$100k income tax", r.incomeTax, 20520);
  check("$100k medicare", r.medicare, 2000);
  check("$100k net", r.netAnnual, 100000 - 20520 - 2000);
  check("$100k super on top", r.superAmount, 12000);
}
