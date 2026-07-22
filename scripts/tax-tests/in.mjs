// India — FY 2026-27 (AY 2027-28). New/old regime slabs, Section 87A rebate,
// marginal relief and 4% cess. Figures retained from Budget 2025 by Budget 2026;
// checked against the statutory slab arithmetic.
import { NEW_REGIME, OLD_REGIME, TAX_YEAR, computeTax } from "../../lib/incometax.js";

export const label = `India (FY ${TAX_YEAR.fy})`;

export function run(check) {
  // New regime: the headline "no tax up to ₹12L taxable" (full 87A rebate).
  check("new regime ₹12,00,000 -> ₹0 (rebate)", computeTax(1200000, NEW_REGIME).total, 0);
  check("new regime ₹8,00,000 -> ₹0 (rebate)", computeTax(800000, NEW_REGIME).total, 0);

  // New regime above the rebate: ₹16,00,000 taxable.
  // slab = 5%×4L + 10%×4L + 15%×4L = 120,000; +4% cess = 124,800.
  check("new regime ₹16,00,000 slab", computeTax(1600000, NEW_REGIME).base, 120000);
  check("new regime ₹16,00,000 total (incl. cess)", computeTax(1600000, NEW_REGIME).total, 124800);

  // Marginal relief just above ₹12L: at ₹12,10,000 the tax cannot exceed the
  // ₹10,000 of income over the threshold (pre-cess), then cess applies.
  check("new regime ₹12,10,000 marginal relief", computeTax(1210000, NEW_REGIME).total, Math.round(10000 * 1.04));

  // Old regime: ₹10,00,000 taxable.
  // slab = 5%×2.5L + 20%×5L = 12,500 + 100,000 = 112,500; +4% cess = 117,000.
  check("old regime ₹10,00,000 slab", computeTax(1000000, OLD_REGIME).base, 112500);
  check("old regime ₹10,00,000 total", computeTax(1000000, OLD_REGIME).total, 117000);

  // Old regime 87A rebate: ₹5,00,000 taxable -> tax fully rebated to ₹0.
  check("old regime ₹5,00,000 -> ₹0 (rebate)", computeTax(500000, OLD_REGIME).total, 0);

  // Year label moved to the current financial year.
  check("tax year is FY 2026-27", TAX_YEAR.fy === "2026-27" ? 1 : 0, 1);
}
