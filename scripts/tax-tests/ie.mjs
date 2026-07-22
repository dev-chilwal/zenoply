// Ireland — checked against Revenue's published USC worked examples and the
// Dept. of Social Protection's SW14 PRSI-credit example and taper table.
import {
  ieIncomeTax, ieUsc, iePrsiWeekly, iePrsiCreditWeekly, iePrsiAnnual,
  computeIeTakeHome, IE_INCOME_TAX, IE_PRSI,
} from "../../lib/tax/ie.js";

export const label = "Ireland (tax year 2026)";

export function run(check) {
  // USC — Revenue's four published examples (Calculating your USC).
  check("USC €25,000 (Revenue: Jacob)", ieUsc(25000), 319.82);
  check("USC €50,000 (Revenue: Sadhbh)", ieUsc(50000), 1032.82);
  check("USC €50,000 reduced (Revenue: Donnchadh)", ieUsc(50000, { reducedRate: true }), 819.82);
  check("USC €75,000 (Revenue: Cian, >60k => standard)", ieUsc(75000), 2030.62);
  check("USC €13,000 -> exempt", ieUsc(13000), 0);
  check("USC €13,000.01 -> cliff charge", ieUsc(13000.01), 79.82);
  // Band boundaries are continuous and land on the published ceilings.
  check("USC 2% ceiling at €28,700", ieUsc(28700), 0.005 * 12012 + 0.02 * 16688);

  // PRSI weekly — DSP SW14 example and taper endpoints (Jan–Sep, 4.2%).
  check("PRSI €377/wk (DSP SW14)", iePrsiWeekly(377, IE_PRSI.rateJanSep), 8.00);
  check("PRSI credit €377/wk (DSP SW14)", iePrsiCreditWeekly(377), 7.83);
  check("PRSI €352/wk -> nil (threshold)", iePrsiWeekly(352, IE_PRSI.rateJanSep), 0);
  check("PRSI €352.01/wk -> €2.78 (cliff, credited)", iePrsiWeekly(352.01, IE_PRSI.rateJanSep), 2.78);
  check("PRSI €424/wk -> €17.80 (credit exhausted)", iePrsiWeekly(424, IE_PRSI.rateJanSep), 17.80);
  check("PRSI €400/wk -> €12.80 (SW14 taper table)", iePrsiWeekly(400, IE_PRSI.rateJanSep), 12.80);
  check("PRSI €500/wk @4.35% from 1 Oct", iePrsiWeekly(500, IE_PRSI.rateOctDec), 21.75);

  // Income tax — bands + non-refundable credits.
  check("Income tax €35,000 single", ieIncomeTax(35000, IE_INCOME_TAX.status.single), 3000);
  check("Income tax €60,000 single (into 40% band)", ieIncomeTax(60000, IE_INCOME_TAX.status.single),
    0.2 * 44000 + 0.4 * 16000 - 4000);
  check("Income tax €60,000 married sole earner", ieIncomeTax(60000, IE_INCOME_TAX.status.marriedSingle),
    0.2 * 53000 + 0.4 * 7000 - 6000);
  check("Income tax below credits -> floored at 0", ieIncomeTax(15000, IE_INCOME_TAX.status.single), 0);

  // End-to-end: components authority-backed; PRSI blends the two 2026 periods.
  const r = computeIeTakeHome({ amount: 60000, status: "single" });
  check("€60k income tax component", r.incomeTax, 11200);
  check("€60k USC component", r.usc, 1332.82);
  // PRSI: weekly 1153.85, no credit; 39wk@4.2% + 13wk@4.35%.
  const wk = 60000 / 52;
  check("€60k PRSI (blended 2026 rates)", r.prsi,
    iePrsiWeekly(wk, 0.042) * 39 + iePrsiWeekly(wk, 0.0435) * 13);
  check("€60k net = gross - withheld", r.netAnnual, 60000 - r.totalWithheld);
  check("€60k pension excluded when 0", r.pension, 0);

  // Pension relief reduces income tax only, never USC/PRSI.
  const rp = computeIeTakeHome({ amount: 60000, status: "single", pensionPct: 10 });
  check("pension cuts income tax", rp.incomeTax, ieIncomeTax(54000, IE_INCOME_TAX.status.single));
  check("pension does NOT cut USC", rp.usc, r.usc);
  check("pension does NOT cut PRSI", rp.prsi, r.prsi);
}
