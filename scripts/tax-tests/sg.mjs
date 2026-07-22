// Singapore — the resident schedule checked against IRAS's published sample
// computations and cumulative anchors; CPF against the CPF Board 2026 table.
import {
  sgResidentTax, sgMonthlyCpf, sgCpfAnnual, computeSgTakeHome, SG_TAX_YEAR,
} from "../../lib/tax/sg.js";

export const label = `Singapore (income year ${SG_TAX_YEAR.year} / YA ${SG_TAX_YEAR.ya})`;

export function run(check) {
  // Resident schedule — IRAS published cumulative anchors.
  check("tax $20,000 -> $0", sgResidentTax(20000), 0);
  check("tax $30,000 -> $200", sgResidentTax(30000), 200);
  check("tax $40,000 -> $550", sgResidentTax(40000), 550);
  check("tax $80,000 -> $3,350 (IRAS)", sgResidentTax(80000), 3350);
  check("tax $120,000 -> $7,950", sgResidentTax(120000), 7950);
  check("tax $160,000 -> $13,950", sgResidentTax(160000), 13950);
  check("tax $200,000 -> $21,150", sgResidentTax(200000), 21150);
  check("tax $234,100 -> $27,629 (IRAS worked example 5.2)", sgResidentTax(234100), 27629);
  check("tax $320,000 -> $44,550", sgResidentTax(320000), 44550);
  check("tax $500,000 -> $84,150", sgResidentTax(500000), 84150);
  check("tax $1,000,000 -> $199,150 (IRAS)", sgResidentTax(1000000), 199150);
  // IRAS example 5.1 partial: tax on chargeable $34,750.
  check("tax $34,750 -> $366.25 (IRAS 5.1)", sgResidentTax(34750), 366.25);

  // CPF monthly (CPF Board rounding: total nearest, employee down).
  const c8k = sgMonthlyCpf(10000, 40);
  check("CPF $10k/mo capped: employee $1,600", c8k.employee, 1600);
  check("CPF $10k/mo capped: total $2,960", c8k.total, 2960);
  check("CPF $10k/mo capped: employer $1,360", c8k.employer, 1360);
  const c5k = sgMonthlyCpf(5000, 40);
  check("CPF $5k/mo: employee $1,000", c5k.employee, 1000);
  check("CPF $5k/mo: total $1,850", c5k.total, 1850);
  const c3333 = sgMonthlyCpf(3333, 40);
  check("CPF $3,333/mo: total round to $1,233", c3333.total, 1233);
  check("CPF $3,333/mo: employee floor to $666", c3333.employee, 666);
  // Age bands.
  check("CPF age 58 employee 18%", sgMonthlyCpf(5000, 58).employee, Math.floor(5000 * 0.18));
  check("CPF age 62 employee 12.5%", sgMonthlyCpf(5000, 62).employee, Math.floor(5000 * 0.125));

  // End-to-end.
  const citizen = computeSgTakeHome({ amount: 60000, age: 40, isCitizenOrPR: true });
  // OW $5,000/mo -> employee CPF $1,000/mo -> $12,000/yr. EIR $1,000.
  check("citizen $60k CPF", citizen.cpfEmployee, 12000);
  check("citizen $60k chargeable", citizen.chargeable, 60000 - 12000 - 1000);
  check("citizen $60k income tax", citizen.incomeTax, sgResidentTax(47000));
  check("citizen $60k net", citizen.netAnnual, 60000 - 12000 - sgResidentTax(47000));

  // Foreigner (Employment Pass): no CPF.
  const foreigner = computeSgTakeHome({ amount: 60000, age: 40, isCitizenOrPR: false });
  check("foreigner has no CPF", foreigner.cpfEmployee, 0);
  check("foreigner chargeable = gross - EIR", foreigner.chargeable, 60000 - 1000);
}
