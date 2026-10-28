// Year-by-year loan schedule as CSV, for the "Download CSV" button under the
// amortization table (EMI, mortgage, loan prepayment).
//
// Figures are plain numbers to 2 dp with no currency symbol or grouping
// separators, so Excel / Sheets read them as numbers in any locale; the
// currency code goes in the header instead.

// Each year's principal and interest in cents, as the difference of the
// *running totals* rounded to cents, not the year's own figure rounded: rows
// then sum exactly to the totals, and the totals are the true totals rounded
// (a 10,00,000 loan repays 1000000.00, not the 999999.99 that five
// independently rounded rows can add up to). Shared with the PDF export.
export function scheduleCents(yearly) {
  const rows = [];
  let rawP = 0, rawI = 0, cp = 0, ci = 0;
  for (const y of yearly) {
    rawP += y.principalPaid;
    rawI += y.interestPaid;
    const np = Math.round(rawP * 100), ni = Math.round(rawI * 100);
    rows.push({
      year: y.year,
      principal: Math.max(0, np - cp),
      interest: Math.max(0, ni - ci),
      balance: Math.max(0, Math.round(y.balance * 100)),
    });
    cp = np;
    ci = ni;
  }
  return { rows, principal: Math.max(0, cp), interest: Math.max(0, ci) };
}

export function scheduleCsv(yearly, currency) {
  const money = (c) => (c / 100).toFixed(2);
  const unit = currency ? ` (${currency})` : "";
  const lines = [`Year,Principal paid${unit},Interest paid${unit},Balance at year end${unit}`];
  const s = scheduleCents(yearly);
  for (const r of s.rows) lines.push([r.year, money(r.principal), money(r.interest), money(r.balance)].join(","));
  lines.push(["Total", money(s.principal), money(s.interest), ""].join(","));
  return lines.join("\r\n") + "\r\n";
}
