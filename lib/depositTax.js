// Post-tax view of a deposit (FD / RD). Interest is taxed at the saver's
// marginal rate as it accrues; the tax is assumed to be paid from other
// income, so the deposit itself keeps compounding in full and total tax is
// simply rate × total interest. (If a bank recovers TDS from the deposit
// balance instead, the deducted slice stops compounding and maturity comes
// out marginally lower.)
export function depositAfterTax({ invested, interest, taxPct, effRatePct }) {
  const t = Math.min(Math.max(taxPct, 0), 100) / 100;
  const tax = interest * t;
  const netInterest = interest - tax;
  const net = invested + netInterest;
  // Post-tax rate: each year's interest is taxed as it accrues, so what the
  // saver keeps per year is the effective annual rate × (1 − tax). This is
  // the figure to hold up against a tax-free rate such as PPF's.
  const netYield = effRatePct == null ? null : effRatePct * (1 - t);
  return { tax, netInterest, net, netYield };
}
