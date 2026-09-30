// Inflation-adjusted ("real") view of a projected balance. A future amount is
// shown in today's money by dividing out the price rise over the period, and
// the real rate uses the exact Fisher relation (1 + nominal) / (1 + inflation)
// − 1 rather than the nominal − inflation shortcut, which overstates the real
// rate by roughly nominal × inflation (8% at 6% inflation: 1.89%, not 2%).
// Because every cash flow is deflated by the same factor, the Fisher rate is
// also the real rate of a SIP whose nominal flows all earn the same rate.
export function realTerms({ future, years, inflPct, nominalRatePct }) {
  const f = Math.max(inflPct, 0) / 100;
  const deflator = Math.pow(1 + f, years);
  const todayValue = future / deflator;
  const realRate = nominalRatePct == null
    ? null
    : ((1 + nominalRatePct / 100) / (1 + f) - 1) * 100;
  return { todayValue, realRate, deflator };
}
