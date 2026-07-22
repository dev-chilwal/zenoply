// Canada (federal) — the federal tax assembly checked against CRA's published
// T4032-ON worked examples (A & B), plus CPP/EI/BPA figures from T4127.
import {
  caFederalTax, caBpaf, caCpp, caEi, computeCaTakeHome,
} from "../../lib/tax/ca.js";

export const label = "Canada — federal (2026)";

export function run(check) {
  // CRA worked Example A: A = $62,798.84 -> annual federal tax $5,957.85.
  check("CRA Example A federal tax", caFederalTax(62798.84, {
    cppBaseCreditable: 3173.04, eiPremium: 1101.88, employmentIncome: 67600,
  }), 5957.85);

  // CRA worked Example B: A = $79,872 -> annual federal tax $9,406.39.
  check("CRA Example B federal tax", caFederalTax(79872, {
    cppBaseCreditable: 3519.45, eiPremium: 1123.07, employmentIncome: 83200,
  }), 9406.39);

  // Basic personal amount taper.
  check("BPA full below taper", caBpaf(62798.84), 16452);
  check("BPA min above taper", caBpaf(258482), 14829);
  check("BPA mid-taper $200,000", caBpaf(200000), 16452 - (200000 - 181440) * (1623 / 77042), 0.01);

  // CPP / CPP2 / EI maximums and splits.
  const cpp = caCpp(80000);
  check("CPP total at max", cpp.total, 4230.45);
  check("CPP base (creditable) at max", cpp.base, 3519.45);
  check("CPP first-additional at max", cpp.firstAdditional, 711.00);
  check("CPP2 at $80k (5,400 band)", cpp.cpp2, 216.00);
  check("CPP2 max at $85k+", caCpp(85000).cpp2, 416.00);
  check("EI at max", caEi(68900), 1123.07);
  check("EI below cap 14.9%... rate", caEi(50000), 815.00);
  check("CPP nil below exemption", caCpp(3500).total, 0);

  // Bracket R/K correctness (bracket 3 interior; BPA + CEA credits only).
  check("federal tax $150k (BPA+CEA)", caFederalTax(150000, { employmentIncome: 150000 }), r2Ref(150000));

  // End-to-end (annual method; federal + CPP/EI only).
  const r = computeCaTakeHome({ amount: 80000 });
  check("$80k CPP cash (total + CPP2)", r.cppCash, 4230.45 + 216.00);
  check("$80k EI", r.ei, 1123.07);
  check("$80k net = gross - tax - CPP - EI", r.netAnnual, 80000 - r.federalTax - r.cppCash - r.ei);
  check("$80k federal tax reasonable", r.federalTax > 8000 && r.federalTax < 11000 ? 1 : 0, 1);
}

// Reference: bracket-3 R/K with full BPA + CEA credits, no CPP/EI creditable.
function r2Ref(A) {
  const R = 0.26, K = 10241;
  const basic = R * A - K;
  const k1 = 0.14 * 16452;
  const k4 = 0.14 * 1501;
  return Math.round((Math.max(0, basic - k1 - k4)) * 100) / 100;
}
