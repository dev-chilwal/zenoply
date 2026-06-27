// Reducing-balance amortization with an optional extra monthly principal
// payment. `monthlyRate` is the EFFECTIVE monthly rate — the caller derives it
// (e.g. a mortgage with semi-annual compounding passes its adjusted rate), so
// this stays a pure schedule generator shared by the EMI and mortgage tools.
//
// Returns the contractual EMI plus a payoff summary, a year-by-year schedule,
// and a year-end balance series for charting. With extraMonthly > 0 the loan
// clears early; payoffMonths and totalInterest reflect that.
export function amortize({ principal, monthlyRate, termMonths, extraMonthly = 0 }) {
  const i = monthlyRate;
  const n = termMonths;
  const emi = i === 0 ? principal / n : (principal * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  const payment = emi + Math.max(0, extraMonthly);

  let bal = principal;
  let month = 0;
  let totalInterest = 0;
  const yearly = [];               // { year, principalPaid, interestPaid, balance }
  const balanceSeries = [principal];
  let yp = 0, yi = 0;
  const CAP = n + 1200;            // guard against a payment that never amortizes

  while (bal > 0.005 && month < CAP) {
    month++;
    const interest = bal * i;
    let principalPart = payment - interest;
    if (principalPart <= 0) break; // payment doesn't even cover interest
    if (principalPart > bal) principalPart = bal;
    bal -= principalPart;
    totalInterest += interest;
    yp += principalPart;
    yi += interest;
    if (month % 12 === 0 || bal <= 0.005) {
      yearly.push({ year: Math.ceil(month / 12), principalPaid: yp, interestPaid: yi, balance: Math.max(0, bal) });
      balanceSeries.push(Math.max(0, bal));
      yp = 0;
      yi = 0;
    }
  }

  return {
    emi,
    payment,
    payoffMonths: month,
    totalInterest,
    totalPaid: principal + totalInterest,
    yearly,
    balanceSeries,
  };
}

/** Format a month count as "8y 4m" / "5 years" / "7 months". */
export function monthsToLabel(m) {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  if (y === 0) return `${mo} ${mo === 1 ? "month" : "months"}`;
  if (mo === 0) return `${y} ${y === 1 ? "year" : "years"}`;
  return `${y}y ${mo}m`;
}
