// Year-by-year loan schedule as CSV, for the "Download CSV" button under the
// amortization table (EMI, mortgage, loan prepayment).
//
// Figures are plain numbers to 2 dp with no currency symbol or grouping
// separators, so Excel / Sheets read them as numbers in any locale; the
// currency code goes in the header instead. Each year's principal and interest
// is the difference of the *running totals* rounded to cents, not the year's
// own figure rounded: rows then sum exactly to the Total row, and the totals
// are the true totals rounded (a 10,00,000 loan repays 1000000.00, not the
// 999999.99 that five independently rounded rows can add up to).
export function scheduleCsv(yearly, currency) {
  const money = (c) => (Math.max(0, c) / 100).toFixed(2);
  const unit = currency ? ` (${currency})` : "";
  const lines = [`Year,Principal paid${unit},Interest paid${unit},Balance at year end${unit}`];
  let rawP = 0, rawI = 0, cp = 0, ci = 0;
  for (const y of yearly) {
    rawP += y.principalPaid;
    rawI += y.interestPaid;
    const np = Math.round(rawP * 100), ni = Math.round(rawI * 100);
    lines.push([y.year, money(np - cp), money(ni - ci), money(Math.round(y.balance * 100))].join(","));
    cp = np;
    ci = ni;
  }
  lines.push(["Total", money(cp), money(ci), ""].join(","));
  return lines.join("\r\n") + "\r\n";
}
