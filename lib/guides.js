// Single source of truth for Phase 3 guides (long-tail "how/what/why" content).
// Each guide is a separate indexable page that links to/from its related tool.
//
// Body is an array of typed blocks so the page can render them as real JSX
// (and so source stays plain data, mirroring lib/site.js):
//   { t: "h2",  s: "Heading text" }
//   { t: "h3",  s: "Subheading text" }
//   { t: "p",   s: "Paragraph. Use [label](/path) for an inline link." }
//   { t: "ul",  items: ["First point", "Second point with [a link](/x)"] }
//   { t: "ol",  items: ["Step one", "Step two"] }
// Inline links use a tiny [text](href) syntax parsed in components/GuidePage.jsx.

export const GUIDES = [
  // ---------------------------------------------------------------- EMI
  {
    slug: "how-is-emi-calculated",
    title: "How Is EMI Calculated?",
    h1: "How Is EMI Calculated? The Formula, Explained",
    desc: "How is EMI calculated? Learn the EMI formula, see a worked example for a home, car and personal loan, and understand how rate and tenure change your monthly payment.",
    category: "finance",
    tool: { slug: "emi-calculator", title: "EMI Calculator" },
    updated: "2026-06-23",
    body: [
      { t: "p", s: "EMI stands for Equated Monthly Instalment - the fixed amount you pay your lender every month until a loan is fully repaid. Each instalment covers part of the interest you owe and part of the original amount you borrowed, and because the figure is fixed it makes budgeting simple. This guide explains exactly how EMI is calculated, walks through a real example, and shows how the interest rate and loan tenure pull your monthly payment up or down." },

      { t: "h2", s: "The EMI formula" },
      { t: "p", s: "Every bank, whether for a home loan, car loan or personal loan, uses the same standard reducing-balance formula:" },
      { t: "p", s: "EMI = [P x R x (1 + R)^N] / [(1 + R)^N - 1]" },
      { t: "p", s: "Where:" },
      { t: "ul", items: [
        "P is the principal - the amount you actually borrow.",
        "R is the monthly interest rate. Banks quote an annual rate, so you divide it by 12 and by 100. A 9% annual rate becomes 0.09 / 12 = 0.0075 per month.",
        "N is the tenure in months. A 20-year loan is 20 x 12 = 240 months.",
      ]},
      { t: "p", s: "The formula looks intimidating, but it is just compound interest rearranged to find the level payment that clears the loan in exactly N months. You never have to compute it by hand - the [EMI Calculator](/finance/emi-calculator) does it instantly - but understanding the moving parts helps you make better borrowing decisions." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you take a home loan of 30,00,000 at 9% annual interest for 20 years." },
      { t: "ul", items: [
        "P = 3,000,000",
        "R = 0.09 / 12 = 0.0075",
        "N = 20 x 12 = 240 months",
      ]},
      { t: "p", s: "Plugging these in, (1 + 0.0075)^240 works out to about 6.009. The formula gives EMI = [3,000,000 x 0.0075 x 6.009] / [6.009 - 1], which is approximately 26,992 per month. Over 240 months you repay roughly 64.78 lakh in total - meaning about 34.78 lakh of that is interest, more than the amount you originally borrowed. That single fact surprises most first-time borrowers and is the best argument for comparing rates and tenures carefully." },

      { t: "h2", s: "How the interest rate affects your EMI" },
      { t: "p", s: "The interest rate is the single biggest lever on your monthly payment. Using the same 30 lakh loan over 20 years:" },
      { t: "ul", items: [
        "At 8.5%, the EMI is about 26,035.",
        "At 9.0%, the EMI is about 26,992.",
        "At 9.5%, the EMI is about 27,964.",
      ]},
      { t: "p", s: "A half-percent difference is roughly 950-1,000 a month - around 2.3 lakh over the full 20 years. This is why it pays to negotiate your rate or refinance when rates fall, even by what looks like a small amount." },

      { t: "h2", s: "How the loan tenure affects your EMI" },
      { t: "p", s: "Tenure works in the opposite direction to what many people expect. A longer tenure lowers your monthly EMI - which feels like a win - but increases the total interest you pay, because your money is borrowed for longer." },
      { t: "ul", items: [
        "30 lakh at 9% over 10 years: EMI about 38,003, total interest about 15.6 lakh.",
        "30 lakh at 9% over 20 years: EMI about 26,992, total interest about 34.78 lakh.",
        "30 lakh at 9% over 30 years: EMI about 24,140, total interest about 56.9 lakh.",
      ]},
      { t: "p", s: "Stretching from 20 to 30 years drops the EMI by about 2,850 a month, but adds over 22 lakh in interest. The right tenure balances a monthly payment you can comfortably afford against the total cost of the loan - shorter is cheaper if your budget allows it." },

      { t: "h2", s: "Principal vs interest over time" },
      { t: "p", s: "Although your EMI stays constant, its split between principal and interest changes every month. Early on, most of each payment is interest, because interest is charged on a large outstanding balance. As the balance shrinks, more of each EMI goes toward principal. This is called amortisation, and it is why prepaying in the early years of a loan saves dramatically more interest than prepaying near the end." },

      { t: "h2", s: "Fixed vs reducing balance" },
      { t: "p", s: "Always check whether a lender quotes a reducing-balance rate or a flat rate. The EMI formula above assumes reducing balance, where interest is recalculated on the outstanding amount. A flat rate charges interest on the full original principal for the whole tenure, which makes the effective cost far higher than the headline number suggests - a 'flat 6%' can equal an effective reducing rate of 11% or more. Reputable home and car loans use reducing balance; be cautious with any flat-rate offer." },

      { t: "h2", s: "What is not included in your EMI" },
      { t: "p", s: "The EMI formula covers only principal and interest. Real loans carry extra costs that do not appear in the monthly figure: a one-time processing fee (often 0.5% to 1% of the loan), documentation and legal charges on a home loan, and in some cases a loan insurance premium. Prepayment or foreclosure may also carry a charge on certain loan types, though floating-rate home loans in many markets cannot levy one. Factor these in when comparing two offers, because a loan with a slightly lower EMI but a high processing fee can cost more overall." },

      { t: "h2", s: "How to lower your EMI burden" },
      { t: "p", s: "If an EMI stretches your budget, you have a few practical levers. A larger down payment cuts the principal directly, lowering both the EMI and the total interest. A longer tenure reduces the monthly figure (at the cost of more total interest), so use it deliberately rather than by default. Refinancing or requesting a rate reduction when market rates fall can shave a meaningful amount off a long loan. And making occasional part-prepayments early in the tenure attacks the principal while interest is at its heaviest, which is where prepayment saves the most." },

      { t: "p", s: "Once you understand the formula, the fastest way to compare scenarios is to try them: change the rate and tenure in the [EMI Calculator](/finance/emi-calculator) and watch the monthly payment and total interest update instantly." },
    ],
    faqs: [
      { q: "What does EMI stand for?", a: "EMI stands for Equated Monthly Instalment - a fixed monthly payment that covers part interest and part principal until the loan is fully repaid." },
      { q: "Does a longer loan tenure reduce my EMI?", a: "Yes. A longer tenure lowers the monthly EMI because the repayment is spread over more months, but it increases the total interest you pay over the life of the loan." },
      { q: "Is EMI calculated on a flat or reducing balance?", a: "Standard home, car and personal loans use a reducing-balance method, where interest is charged only on the outstanding principal. Flat-rate loans charge interest on the full original amount throughout and are effectively far more expensive." },
    ],
  },

  // ---------------------------------------------------------------- PERCENTAGE
  {
    slug: "how-to-calculate-percentage-increase",
    title: "How to Calculate Percentage Increase",
    h1: "How to Calculate Percentage Increase (and Decrease)",
    desc: "How to calculate percentage increase and decrease with a simple formula and worked examples. Learn the difference between percentage change and percentage points.",
    category: "finance",
    tool: { slug: "percentage-calculator", title: "Percentage Calculator" },
    updated: "2026-06-23",
    body: [
      { t: "p", s: "Percentage increase tells you how much a value has grown relative to where it started, expressed as a percentage. It is one of the most useful everyday calculations - you reach for it to work out a pay rise, a price hike, investment growth, or how much traffic a website gained month over month. This guide gives you the formula, several worked examples, and the one distinction that trips most people up: percentage change versus percentage points." },

      { t: "h2", s: "The percentage increase formula" },
      { t: "p", s: "To find the percentage increase between an old (starting) value and a new value:" },
      { t: "p", s: "Percentage increase = ((New value - Old value) / Old value) x 100" },
      { t: "p", s: "The steps are: subtract the old value from the new value to get the change, divide that change by the old value, then multiply by 100 to turn the decimal into a percentage. The key is that you always divide by the original value, not the new one - the starting point is your basis for comparison." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Say a product's price rose from 80 to 100." },
      { t: "ul", items: [
        "Change = 100 - 80 = 20",
        "Divide by the old value = 20 / 80 = 0.25",
        "Multiply by 100 = 25%",
      ]},
      { t: "p", s: "So the price increased by 25%. Notice that the same absolute change measured against a different starting value gives a different percentage: a rise from 80 to 100 is a 25% increase, but a rise from 100 to 120 - also a change of 20 - is only a 20% increase, because the basis is larger." },

      { t: "h2", s: "How to calculate percentage decrease" },
      { t: "p", s: "Percentage decrease uses the same formula; the result simply comes out negative when the new value is smaller. To express it as a positive 'decrease', take the absolute value of the change:" },
      { t: "p", s: "Percentage decrease = ((Old value - New value) / Old value) x 100" },
      { t: "p", s: "For example, if a stock falls from 250 to 200: (250 - 200) / 250 x 100 = 50 / 250 x 100 = 20%. The stock dropped 20%." },

      { t: "h2", s: "A common trap: increase then decrease" },
      { t: "p", s: "Percentages do not cancel out the way you might expect. If a 100 item goes up 20% to 120, then drops 20%, you do not return to 100 - you land at 96. That is because the second 20% is calculated on the larger 120, not the original 100. This is exactly why a stock that falls 50% then rises 50% is still down 25% overall, and it is worth keeping in mind whenever you chain percentage changes together." },

      { t: "h2", s: "Percentage change vs percentage points" },
      { t: "p", s: "This is the distinction that causes the most confusion, especially in news headlines. Suppose an interest rate rises from 4% to 6%." },
      { t: "ul", items: [
        "The change is 2 percentage points (6 minus 4).",
        "But the percentage increase is (6 - 4) / 4 x 100 = 50%.",
      ]},
      { t: "p", s: "Both statements are correct, but they mean very different things. Saying the rate 'rose 2 points' and saying it 'rose 50%' describe the same event. When you read that something changed by a percentage, always check whether the source means a relative change or an absolute change in percentage points - the difference can be enormous." },

      { t: "h2", s: "Three ways people use percentages" },
      { t: "p", s: "Beyond increase and decrease, two related calculations come up constantly, and the [Percentage Calculator](/finance/percentage-calculator) handles all three:" },
      { t: "ul", items: [
        "What is X% of Y? Multiply: 15% of 200 is 0.15 x 200 = 30.",
        "X is what percent of Y? Divide: 30 is what percent of 200? 30 / 200 x 100 = 15%.",
        "Percentage increase or decrease, as covered above.",
      ]},

      { t: "h2", s: "How to reverse a percentage change" },
      { t: "p", s: "A frequent real-world need is working backwards from a final figure. If a price already includes a 20% increase and you want the original, do not subtract 20% - that gives the wrong answer. Instead divide by 1.20. A price of 120 that already includes a 20% markup came from 120 / 1.20 = 100. The same logic applies to discounts: a sale price of 80 after a 20% discount started at 80 / 0.80 = 100. Reversing a percentage means dividing by the growth factor, not subtracting the percentage." },

      { t: "h2", s: "Everyday places this shows up" },
      { t: "p", s: "Percentage increase and decrease quietly run through daily life. A salary that rises from 50,000 to 55,000 is a 10% raise. A 25% off coupon turns a 60 item into 45. An investment that grows from 1,000 to 1,150 has returned 15%. Tracking website visits, exam marks, body weight or electricity bills month to month all use the same single formula. Once you can run it confidently, you can sanity-check the percentage claims you meet in adverts, news and spreadsheets rather than taking them at face value." },

      { t: "p", s: "Once the formula clicks, the arithmetic is quick - but for pay rises, discounts and investment returns where the numbers are awkward, the fastest route is to drop them straight into the [Percentage Calculator](/finance/percentage-calculator) and read the answer." },
    ],
    faqs: [
      { q: "What is the formula for percentage increase?", a: "Percentage increase = ((new value - old value) / old value) x 100. Always divide the change by the original starting value, then multiply by 100." },
      { q: "What is the difference between percentage change and percentage points?", a: "Percentage points measure the absolute gap between two percentages (4% to 6% is 2 points), while percentage change measures the relative growth (4% to 6% is a 50% increase). They describe the same event in different ways." },
      { q: "Why doesn't a 20% increase then a 20% decrease return to the original value?", a: "Because the decrease is calculated on the new, larger value rather than the original. A 100 item up 20% is 120, and 20% off 120 is 96 - not 100." },
    ],
  },

  // ---------------------------------------------------------------- MORTGAGE
  {
    slug: "mortgage-principal-vs-interest",
    title: "Mortgage Principal vs Interest, Explained",
    h1: "Mortgage Principal vs Interest: Where Your Payment Goes",
    desc: "Understand mortgage principal vs interest: how amortisation splits your monthly payment, why early payments are mostly interest, and how extra payments save you money.",
    category: "finance",
    tool: { slug: "mortgage-calculator", title: "Mortgage Calculator" },
    updated: "2026-06-23",
    body: [
      { t: "p", s: "When you make a mortgage payment, it splits into two parts: principal, which is the money you borrowed and are paying back, and interest, which is the lender's charge for lending it. Your monthly payment usually stays the same for the whole loan, but the split between principal and interest shifts dramatically over time. Understanding that shift - called amortisation - explains why your loan balance barely moves in the early years and why an extra payment now is worth far more than the same payment later." },

      { t: "h2", s: "What principal and interest mean" },
      { t: "ul", items: [
        "Principal is the outstanding loan balance - the actual debt. Every dollar of principal you pay permanently reduces what you owe.",
        "Interest is calculated on that outstanding balance, usually monthly. Because the balance is highest at the start, interest is highest at the start too.",
      ]},
      { t: "p", s: "Your fixed monthly payment (principal and interest, or 'P&I') is set so that the loan reaches exactly zero at the end of the term. The [Mortgage Calculator](/finance/mortgage-calculator) computes that payment from your loan amount, rate and term." },

      { t: "h2", s: "How amortisation splits each payment" },
      { t: "p", s: "Here is the part that surprises people. Take a 300,000 mortgage at 6% over 30 years, with a monthly payment of about 1,799." },
      { t: "ul", items: [
        "Month 1: interest is 300,000 x (0.06 / 12) = 1,500. Only about 299 of your 1,799 payment goes to principal.",
        "Year 10 (around month 120): interest has fallen to roughly 1,258 and principal has risen to about 541.",
        "Final year: almost the entire payment is principal, with only a few dollars of interest.",
      ]},
      { t: "p", s: "In the first month, more than 83% of your payment is pure interest. The balance drops by less than 300 even though you paid nearly 1,800. This is not a trick by the lender - it is simply that interest is charged on a very large balance early on. As the balance falls, the interest portion falls with it and the principal portion grows, slowly at first and then faster toward the end." },

      { t: "h2", s: "Why early payments are mostly interest" },
      { t: "p", s: "Because interest is always calculated on the remaining balance, the largest balance produces the largest interest charge. At the start, you owe the full amount, so interest dominates. Over a 30-year loan, this front-loading means you can be several years in before principal and interest are even roughly equal in a single payment. It also means that on a typical 30-year loan you may pay nearly as much in total interest as the original amount you borrowed." },

      { t: "h2", s: "The power of extra payments" },
      { t: "p", s: "Any extra amount you put toward a mortgage goes straight to principal, which permanently shrinks the balance that all future interest is calculated on. Because the effect compounds over the remaining term, extra payments made early are far more powerful than the same payments made late." },
      { t: "p", s: "On the 300,000 loan above, paying just 150 extra each month can shorten a 30-year mortgage by roughly five years and save tens of thousands in interest. The earlier you start, the bigger the saving, because each early dollar of principal avoids many years of future interest. If your loan has no prepayment penalty, this is one of the highest-return, lowest-risk uses of spare cash." },

      { t: "h2", s: "How the loan term changes the split" },
      { t: "p", s: "A shorter term does not just clear the debt sooner - it changes the whole principal-interest balance in your favour. On the same 300,000 loan at 6%, a 15-year mortgage has a payment of about 2,532 a month, noticeably higher than the 30-year's 1,799. But because the balance falls so much faster, the 15-year loan costs roughly 156,000 in total interest, against about 347,000 over 30 years. You pay more each month but less than half the interest overall. If the higher payment fits your budget, a shorter term is one of the cleanest ways to cut the lifetime cost of a home." },

      { t: "h2", s: "What the payment does not include" },
      { t: "p", s: "The principal-and-interest figure is only part of a typical monthly housing cost. Lenders often collect property taxes and homeowner's insurance in the same payment through an escrow account, and loans with a small down payment may add private mortgage insurance (PMI). A standard mortgage calculator shows principal and interest; remember to budget separately for taxes, insurance and any PMI to know your true monthly outlay." },

      { t: "h2", s: "Putting it together" },
      { t: "p", s: "The single most useful habit is to look at an amortisation schedule before you sign. It shows, month by month, how your balance falls and how the principal-interest split shifts - and it makes the cost of a longer term, or the benefit of a slightly lower rate, concrete. Plug your numbers into the [Mortgage Calculator](/finance/mortgage-calculator) to see your monthly payment and total interest, then experiment with the rate, term and extra payments to find the balance that fits your budget." },
    ],
    faqs: [
      { q: "Why is most of my early mortgage payment going to interest?", a: "Interest is charged on the outstanding balance, which is largest at the start of the loan. So early payments are mostly interest, and the principal portion grows steadily as the balance falls - a process called amortisation." },
      { q: "Do extra mortgage payments go toward principal?", a: "Yes. Extra payments (beyond your scheduled amount) typically reduce the principal directly, which lowers the balance all future interest is calculated on. Extra payments made early save the most interest." },
      { q: "Does a mortgage calculator include taxes and insurance?", a: "Most mortgage calculators show principal and interest only. Property tax, homeowner's insurance and PMI vary by location and lender, so budget for them separately to find your true monthly cost." },
    ],
  },
];

export const allGuides = () => GUIDES;
export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug);
