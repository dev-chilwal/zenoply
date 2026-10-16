// Loan prepayment (part-payment) simulator. One lump sum after `afterMonth`
// EMIs, optionally repeated every 12 months, applied under one of two
// strategies a lender offers after a part payment:
//
//   "tenure" — the EMI stays the same and the loan ends early;
//   "emi"    — the original end date stays and the EMI is re-worked on the
//              new balance over the months that remain.
//
// The prepayment lands straight after that month's EMI, so month `afterMonth`
// is charged interest on the old balance and month afterMonth + 1 on the new.
// `monthlyRate` is the plain monthly rate (annual / 12), as banks quote it.

function annuity(balance, i, months) {
  if (months <= 0) return balance;
  return i === 0 ? balance / months : (balance * i) / (1 - Math.pow(1 + i, -months));
}

export function simulate({ principal, monthlyRate, termMonths, prepay = 0, afterMonth = 12, repeatYearly = false, strategy = "tenure" }) {
  const i = monthlyRate;
  const n = termMonths;
  const firstEmi = annuity(principal, i, n);
  let emi = firstEmi;
  let bal = principal;
  let month = 0;
  let totalInterest = 0;
  let totalPrepaid = 0;
  let prepayments = 0;
  let emiAfterFirst = null;          // the EMI the first prepayment leads to
  const yearly = [];               // { year, principalPaid, interestPaid, balance }
  const balanceSeries = [principal];
  let yp = 0, yi = 0;

  while (bal > 0.005 && month < n) {
    month++;
    const interest = bal * i;
    let part = emi - interest;
    if (part > bal) part = bal;
    bal -= part;
    totalInterest += interest;
    yp += part;
    yi += interest;

    const due = prepay > 0 && month >= afterMonth && month < n &&
      (month === afterMonth || (repeatYearly && (month - afterMonth) % 12 === 0));
    if (due && bal > 0.005) {
      const paid = Math.min(prepay, bal);
      bal -= paid;
      totalPrepaid += paid;
      yp += paid;
      prepayments++;
      if (strategy === "emi" && bal > 0.005) emi = annuity(bal, i, n - month);
      if (emiAfterFirst === null) emiAfterFirst = bal > 0.005 ? emi : 0;
    }

    if (bal <= 0.005) bal = 0;
    if (month % 12 === 0 || bal === 0) {
      yearly.push({ year: Math.ceil(month / 12), principalPaid: yp, interestPaid: yi, balance: bal });
      balanceSeries.push(bal);
      yp = 0;
      yi = 0;
    }
  }

  return {
    firstEmi,
    finalEmi: emi,
    emiAfterFirst: emiAfterFirst ?? emi,
    payoffMonths: month,
    totalInterest,
    totalPrepaid,
    prepayments,
    yearly,
    balanceSeries,
  };
}

/** Baseline plus both strategies, with savings measured against the baseline. */
export function comparePrepayment(opts) {
  const base = simulate({ ...opts, prepay: 0 });
  const tenure = simulate({ ...opts, strategy: "tenure" });
  const emi = simulate({ ...opts, strategy: "emi" });
  const saved = (p) => ({
    interestSaved: Math.max(0, base.totalInterest - p.totalInterest),
    monthsSaved: Math.max(0, base.payoffMonths - p.payoffMonths),
  });
  return { base, tenure: { ...tenure, ...saved(tenure) }, emi: { ...emi, ...saved(emi) } };
}
