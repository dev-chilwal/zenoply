// United Arab Emirates — no personal income tax. GPSSA pension and gratuity
// checked against GPSSA's and MOHRE's published worked figures.
import {
  aeIncomeTax, gpssaEmployeeMonthly, iloeMonthly, aeGratuity, computeAeTakeHome,
} from "../../lib/tax/ae.js";

export const label = "United Arab Emirates (2026)";

export function run(check) {
  // No income tax, at any level.
  check("income tax always 0", aeIncomeTax(), 0);

  // GPSSA employee deduction (Law 57/2023, private, 11%).
  check("GPSSA AED 2,000 -> floor 3,000 @11%", gpssaEmployeeMonthly(2000, "law57"), 330);
  check("GPSSA AED 15,000 @11%", gpssaEmployeeMonthly(15000, "law57"), 1650);
  check("GPSSA AED 20,000 @11%", gpssaEmployeeMonthly(20000, "law57"), 2200);
  check("GPSSA AED 50,000 @11%", gpssaEmployeeMonthly(50000, "law57"), 5500);
  check("GPSSA AED 90,000 -> cap 70,000 @11%", gpssaEmployeeMonthly(90000, "law57"), 7700);
  // Law 7/1999 (5%, cap 50,000).
  check("GPSSA law7 AED 15,000 @5%", gpssaEmployeeMonthly(15000, "law7"), 750);
  check("GPSSA law7 AED 60,000 -> cap 50,000 @5%", gpssaEmployeeMonthly(60000, "law7"), 2500);

  // ILOE premium (on basic salary).
  check("ILOE basic 15,000 -> Cat A 5.25", iloeMonthly(15000), 5.25);
  check("ILOE basic 18,000 -> Cat B 10.50", iloeMonthly(18000), 10.50);

  // End-of-service gratuity (basic 10,000/mo).
  check("gratuity 11 months -> 0", aeGratuity(10000, 11 / 12), 0);
  check("gratuity 1 year", aeGratuity(10000, 1), 7000);
  check("gratuity 5 years", aeGratuity(10000, 5), 35000);
  check("gratuity 7 years", aeGratuity(10000, 7), 55000);
  check("gratuity 30 years -> 2-year cap", aeGratuity(10000, 30), 240000);

  // End-to-end. GPSSA pension is the material deduction and is checked exactly;
  // the ILOE tier uses monthly gross as a basic-salary proxy (disclosed).
  const expat = computeAeTakeHome({ amount: 25000 * 12, national: false });
  check("expat income tax 0", expat.incomeTax, 0);
  check("expat pension 0", expat.pension, 0);
  check("expat net = gross - ILOE", expat.netAnnual, 25000 * 12 - iloeMonthly(25000) * 12, 0.01);

  // Law 57 at AED 25,000/mo: basic in the worked example (18,000) is also > 16,000,
  // so its net (22,239.50) matches even under the gross-proxy ILOE.
  const national = computeAeTakeHome({ amount: 25000 * 12, national: true, regime: "law57" });
  check("Emirati Law 57 pension 11%", national.pension, 2750 * 12, 0.01);
  check("Emirati Law 57 net monthly", national.monthly, 22239.50, 0.01);

  const legacy = computeAeTakeHome({ amount: 25000 * 12, national: true, regime: "law7" });
  check("Emirati Law 7 pension 5%", legacy.pension, 1250 * 12, 0.01);
}
