// Full cost of a mortgage: the loan itself plus what owning the home costs
// alongside it. Pure, so it is checked in node against a worked example.
//
// - Down payment is a % of the price; the loan is the rest.
// - Property tax is a yearly % of the purchase price; insurance a yearly
//   amount; HOA / maintenance a monthly amount. All three are paid every month
//   of the loan, spread evenly.
// - PMI only applies when the down payment is under 20% (LTV above 80%). It is
//   a yearly % of the ORIGINAL loan, charged monthly, and stops once the
//   balance reaches 78% of the purchase price — the US Homeowners Protection
//   Act automatic-termination point. Extra payments get there sooner.
// - One-time costs (closing costs; stamp duty and registration in India) are a
//   % of the price, paid upfront with the down payment.
import { amortize } from "@/lib/amortization";

export const PMI_LTV_FREE = 0.8;  // no PMI at or below 80% loan-to-value
export const PMI_LTV_STOP = 0.78; // automatic termination point

export function mortgageCost({
  price, downPct, rate, years, compounding = 12, extraMonthly = 0,
  taxPct = 0, insuranceYear = 0, pmiPct = 0, hoaMonthly = 0, oneTimePct = 0,
}) {
  const down = price * Math.min(100, Math.max(0, downPct)) / 100;
  const loan = Math.max(0, price - down);
  const n = years * 12;
  // Effective monthly rate — Canada compounds semi-annually.
  const i = Math.pow(1 + rate / 100 / compounding, compounding / 12) - 1;

  const pmiApplies = pmiPct > 0 && price > 0 && loan / price > PMI_LTV_FREE;
  const threshold = price * PMI_LTV_STOP;
  const base = amortize({ principal: loan, monthlyRate: i, termMonths: n, extraMonthly: 0 });
  const plan = amortize({ principal: loan, monthlyRate: i, termMonths: n, extraMonthly, threshold });

  const tax = price * taxPct / 100 / 12;
  const ins = insuranceYear / 12;
  const hoa = hoaMonthly;
  const pmi = pmiApplies ? loan * pmiPct / 100 / 12 : 0;
  const pmiMonths = pmiApplies ? plan.crossMonth : 0;
  const ownership = tax + ins + hoa;          // every month, PMI aside
  const monthly = plan.payment + ownership + pmi;   // first month
  const monthlyAfterPmi = plan.payment + ownership;

  const months = plan.payoffMonths;
  const oneTime = price * oneTimePct / 100;
  const pmiTotal = pmi * pmiMonths;
  const ownershipTotal = ownership * months;
  const upfront = down + oneTime;
  const allIn = upfront + plan.totalPaid + pmiTotal + ownershipTotal;

  return {
    down, loan, emi: base.emi, base, plan,
    tax, ins, hoa, pmi, pmiMonths, pmiApplies,
    monthly, monthlyAfterPmi, hasCosts: ownership > 0 || pmi > 0,
    oneTime, upfront, pmiTotal, ownershipTotal, allIn,
    interestSaved: Math.max(0, base.totalInterest - plan.totalInterest),
    monthsSaved: Math.max(0, n - months),
  };
}
