// United Kingdom — checked against gov.scot's published rUK-vs-Scotland
// comparison (the £40 / £24 / £396 figures) and HMRC-derived examples.
import {
  gbIncomeTax, gbNationalInsurance, gbStudentLoan, gbPersonalAllowance,
  computeGbTakeHome,
} from "../../lib/tax/gb.js";

export const label = "United Kingdom (tax year 2026-27)";

export function run(check) {
  // Personal Allowance taper.
  check("PA at £100,000 -> full", gbPersonalAllowance(100000), 12570);
  check("PA at £110,000 -> £7,570", gbPersonalAllowance(110000), 7570);
  check("PA at £125,140 -> £0", gbPersonalAllowance(125140), 0);

  // rUK income tax (HMRC-derived worked examples).
  check("rUK tax £30,000", gbIncomeTax(30000, 30000), 3486.00);
  check("rUK tax £45,000", gbIncomeTax(45000, 45000), 6486.00);
  check("rUK tax £60,000", gbIncomeTax(60000, 60000), 11432.00);
  check("rUK tax £110,000 (in taper)", gbIncomeTax(110000, 110000), 33432.00);
  check("rUK tax £150,000", gbIncomeTax(150000, 150000), 54331.50);

  // Scottish income tax — reconciles to gov.scot's published differences.
  check("Scot tax £25,782 (gov.scot: £40 better)", gbIncomeTax(25782, 25782, "scotland"), 2602.73);
  check("Scot tax £31,136 (gov.scot: £24 better)", gbIncomeTax(31136, 31136, "scotland"), 3689.63);
  check("Scot tax £45,000 (gov.scot: £396 worse)", gbIncomeTax(45000, 45000, "scotland"), 6882.05);
  check("Scot tax £60,000", gbIncomeTax(60000, 60000, "scotland"), 13182.05);
  check("Scot tax £150,000", gbIncomeTax(150000, 150000, "scotland"), 60011.45);
  // gov.scot differences reproduce to the penny.
  check("Scot-rUK diff at £45k = +£396.05",
    gbIncomeTax(45000, 45000, "scotland") - gbIncomeTax(45000, 45000), 396.05);

  // Employee NI.
  check("NI £30,000", gbNationalInsurance(30000), 1394.40);
  check("NI £45,000", gbNationalInsurance(45000), 2594.40);
  check("NI £60,000 (into 2% band)", gbNationalInsurance(60000), 3210.60);
  check("NI £150,000", gbNationalInsurance(150000), 5010.60);
  check("NI at PT -> nil", gbNationalInsurance(12570), 0);

  // Student loans (per-period method, floored to pound).
  check("Plan 2 £45,000 -> £1,404/yr", gbStudentLoan(45000, "plan2"), 1404);
  check("Postgrad £45,000 -> £1,440/yr", gbStudentLoan(45000, "postgrad"), 1440);
  check("Plan 2 below threshold -> 0", gbStudentLoan(25000, "plan2"), 0);

  // End-to-end (gov.scot / HMRC net-pay figures).
  const r = computeGbTakeHome({ amount: 60000, region: "ruk" });
  check("£60k rUK net", r.netAnnual, 60000 - 11432 - 3210.60);
  check("£60k rUK income tax", r.incomeTax, 11432);
  check("£60k rUK NI", r.ni, 3210.60);

  const s = computeGbTakeHome({ amount: 45000, region: "scotland" });
  check("£45k Scotland net", s.netAnnual, 45000 - 6882.05 - 2594.40);

  // Full stack: £45k, Plan 2, 5% net-pay pension (HMRC worked example E).
  const full = computeGbTakeHome({ amount: 45000, region: "ruk", studentPlan: "plan2", pensionPct: 5 });
  check("£45k full-stack pension", full.pension, 2250); // 5% of 45,000 (gross basis)
  check("£45k full-stack NI on full gross", full.ni, 2594.40);
  check("£45k full-stack student loan", full.studentLoan, 1404);

  // Over state pension age -> no employee NI.
  const p = computeGbTakeHome({ amount: 45000, statePensionAge: true });
  check("state pension age -> NI nil", p.ni, 0);
}
