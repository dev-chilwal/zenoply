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

  // ---------------------------------------------------------------- GST
  {
    slug: "how-is-gst-calculated",
    title: "How Is GST Calculated?",
    h1: "How Is GST Calculated? Add, Remove and Split GST",
    desc: "How is GST calculated in India? Learn the GST formula to add GST to a base price, remove GST from an inclusive price, and split tax into CGST and SGST, with worked examples.",
    category: "finance",
    tool: { slug: "gst-calculator", title: "GST Calculator" },
    updated: "2026-06-24",
    body: [
      { t: "p", s: "GST, or Goods and Services Tax, is the single indirect tax applied to most goods and services sold in India. Whether you are a business issuing an invoice or a buyer checking a bill, the same simple arithmetic decides how much tax is involved. This guide shows you how to add GST to a base price, how to work backwards and remove GST from a tax-inclusive amount, how the tax splits into CGST and SGST, and which rate slab applies." },

      { t: "h2", s: "The GST formula" },
      { t: "p", s: "Adding GST to a price is straightforward multiplication:" },
      { t: "p", s: "GST amount = Base price x (GST rate / 100)" },
      { t: "p", s: "Total price = Base price + GST amount" },
      { t: "p", s: "So at an 18% rate, a base price of 1,000 carries 1,000 x 0.18 = 180 in GST, and the customer pays 1,180 in total. The [GST Calculator](/finance/gst-calculator) does this in one step, but the formula is worth knowing so you can sanity-check any invoice." },

      { t: "h2", s: "How to remove GST from an inclusive price" },
      { t: "p", s: "Often a price already includes GST and you need to find the base amount and the tax inside it - for example to fill in an invoice or claim input credit. You cannot simply subtract the percentage; you divide by one plus the rate:" },
      { t: "ul", items: [
        "Base price = Total / (1 + rate)",
        "GST amount = Total - Base price",
      ]},
      { t: "p", s: "If a bill shows 1,180 inclusive of 18% GST, the base price is 1,180 / 1.18 = 1,000, and the GST inside it is 1,180 - 1,000 = 180. A common mistake is to take 18% of 1,180 (which gives 212.40) - that is wrong, because the 18% was charged on the base of 1,000, not on the tax-inclusive total." },

      { t: "h2", s: "CGST and SGST: how the tax splits" },
      { t: "p", s: "For a sale within a single state (an intra-state supply), GST is split equally into two halves:" },
      { t: "ul", items: [
        "CGST (Central GST) - collected by the central government.",
        "SGST (State GST) - collected by the state government.",
      ]},
      { t: "p", s: "On the 180 of GST above, CGST is 90 and SGST is 90. For a sale between two states (an inter-state supply), the whole amount is instead charged as a single IGST (Integrated GST) of 180. The total tax is identical either way - only the labelling and which government receives it change." },

      { t: "h2", s: "The GST rate slabs" },
      { t: "p", s: "India uses a small set of standard GST rates, and the correct one depends on the product or service:" },
      { t: "ul", items: [
        "0% - essential items such as fresh produce and unbranded staples.",
        "5% - common household goods, packaged food and economy transport.",
        "12% - processed food, business-class air travel and some electronics.",
        "18% - the most common slab, covering most services, electronics and restaurant bills.",
        "28% - luxury and 'sin' goods such as cars, tobacco and aerated drinks.",
      ]},
      { t: "p", s: "Because the slab varies by item, always confirm the correct rate for what you are selling or buying before applying the formula. When in doubt, the HSN or SAC code on an invoice maps to a specific rate." },

      { t: "h2", s: "A worked invoice example" },
      { t: "p", s: "Suppose a shop in the same state sells a gadget with a base price of 1,000 at the 18% slab. The invoice reads: base 1,000, CGST at 9% = 90, SGST at 9% = 90, total payable 1,180. The two 9% halves add up to the single 18% rate, which is why an intra-state bill always shows two 9% lines rather than one 18% line. If the same gadget were shipped to a buyer in another state, the invoice would instead show IGST at 18% = 180 and the same 1,180 total." },

      { t: "h2", s: "Why removing GST matters for businesses" },
      { t: "p", s: "Registered businesses care about the base-and-tax split because they can claim input tax credit - the GST they paid on purchases offsets the GST they collect on sales. To do that accurately they must separate the tax portion from every inclusive price, which is exactly the 'remove GST' calculation above. Getting this right keeps returns accurate and avoids paying tax twice on the same value." },

      { t: "p", s: "The arithmetic is simple once you have seen it, but for quick day-to-day work - adding GST to a quote or extracting the tax from an inclusive bill - the fastest route is to enter the figures in the [GST Calculator](/finance/gst-calculator) and read the breakup instantly." },
    ],
    faqs: [
      { q: "How do I calculate GST on an amount?", a: "Multiply the base price by the rate: GST = base x (rate / 100). For 18% on a base of 1,000, GST is 180 and the total is 1,180." },
      { q: "How do I remove GST from a price that already includes it?", a: "Divide the inclusive total by (1 + rate). For 18% GST, base = total / 1.18. From an inclusive 1,180 the base is 1,000 and the GST inside is 180. Do not take 18% of the inclusive amount - that overstates the tax." },
      { q: "What is the difference between CGST, SGST and IGST?", a: "For a sale within one state, GST splits equally into CGST (central) and SGST (state) - so 18% becomes 9% plus 9%. For a sale between states, the full rate is charged as a single IGST. The total tax is the same either way." },
    ],
  },

  // ---------------------------------------------------------------- SIP
  {
    slug: "how-does-sip-investment-work",
    title: "How Does SIP Investment Work?",
    h1: "How Does a SIP Work? Returns, Compounding and the Formula",
    desc: "How does a SIP work? Understand systematic investment plans, the SIP return formula, rupee-cost averaging and the power of compounding, with a clear worked example.",
    category: "finance",
    tool: { slug: "sip-calculator", title: "SIP Calculator" },
    updated: "2026-06-24",
    body: [
      { t: "p", s: "A SIP, or Systematic Investment Plan, is a way of investing a fixed amount in a mutual fund at regular intervals - usually a set sum every month - rather than putting in one lump sum. It is the most popular way Indians invest in equity mutual funds, because it turns investing into a disciplined habit and smooths out the ups and downs of the market. This guide explains how a SIP grows your money, the formula behind the returns, and the two forces that do the heavy lifting: rupee-cost averaging and compounding." },

      { t: "h2", s: "How a SIP actually works" },
      { t: "p", s: "Each month a fixed amount is automatically debited from your bank account and used to buy units of a mutual fund at that day's price (the net asset value, or NAV). When the market is down, your fixed amount buys more units; when it is up, it buys fewer. Over time you accumulate units bought at many different prices, and the value of your holding is the total units multiplied by the current NAV." },

      { t: "h2", s: "The SIP return formula" },
      { t: "p", s: "The future value of a SIP is the future value of a series of regular investments, each compounding for the time it stays invested:" },
      { t: "p", s: "FV = P x [((1 + i)^n - 1) / i] x (1 + i)" },
      { t: "p", s: "Where:" },
      { t: "ul", items: [
        "P is the monthly investment amount.",
        "i is the monthly rate of return - the expected annual return divided by 12. A 12% annual return is 0.12 / 12 = 0.01 per month.",
        "n is the total number of monthly instalments. Ten years is 10 x 12 = 120 instalments.",
      ]},
      { t: "p", s: "The final (1 + i) reflects investing at the start of each month. You never need to compute this by hand - the [SIP Calculator](/finance/sip-calculator) does it instantly - but seeing the formula makes clear why time matters so much." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you invest 10,000 a month for 10 years at an expected annual return of 12%." },
      { t: "ul", items: [
        "P = 10,000",
        "i = 0.12 / 12 = 0.01",
        "n = 10 x 12 = 120",
      ]},
      { t: "p", s: "Putting these into the formula gives a maturity value of about 23,23,000. Over those ten years you actually invested 10,000 x 120 = 12,00,000 of your own money - so roughly 11,23,000 of the final amount is growth. More than half the ending value came from returns rather than your contributions, and that gap widens dramatically the longer you stay invested." },

      { t: "h2", s: "Rupee-cost averaging" },
      { t: "p", s: "Because you invest the same amount every month regardless of price, you automatically buy more units when the market is low and fewer when it is high. This is called rupee-cost averaging, and it pulls your average purchase price below the simple average of the prices you saw. It also removes the impossible task of 'timing the market' - you no longer have to guess whether today is a good day to invest, because you are investing on a schedule through every phase of the market." },

      { t: "h2", s: "The power of compounding" },
      { t: "p", s: "The real engine behind a SIP is compounding: your returns earn returns of their own. The units you buy early have the longest time to grow, so they contribute far more to the final value than the units you buy near the end. This is why starting early matters more than investing large amounts." },
      { t: "ul", items: [
        "10,000 a month at 12% for 10 years grows to about 23.2 lakh (invested 12 lakh).",
        "The same 10,000 a month for 20 years grows to about 99.9 lakh (invested 24 lakh).",
        "For 30 years it grows to about 3.5 crore (invested 36 lakh).",
      ]},
      { t: "p", s: "Doubling the time from 10 to 20 years far more than doubles the result, and tripling it to 30 years multiplies the maturity value many times over - even though your monthly outgo never changed. That accelerating curve is compounding at work, and it is the single strongest argument for starting a SIP as early as you can." },

      { t: "h2", s: "Are SIP returns guaranteed?" },
      { t: "p", s: "No. SIPs in equity mutual funds are market-linked, so the actual return varies year to year and can be negative in a bad year. The percentage you enter in a calculator is an expected average, not a promise - long-run equity averages are often used as a guide, but the real path is bumpy. A SIP reduces the risk of investing everything at a market peak, but it does not remove market risk altogether. Treat the projected figure as a reasonable estimate for planning, not a guaranteed outcome." },

      { t: "h2", s: "SIP vs lump sum" },
      { t: "p", s: "A lump-sum investment puts all your money to work immediately, which wins when the market rises steadily from the day you invest. A SIP spreads entry across many months, which protects you when prices are volatile or falling and is far easier to sustain from a monthly salary. For most salaried investors a SIP fits cash flow naturally and removes the pressure to find the perfect entry point - and you can always add an occasional lump sum on top when you have spare funds." },

      { t: "p", s: "The best way to feel how powerful regular investing is over time is to try different amounts and durations: change the monthly figure, the return and the number of years in the [SIP Calculator](/finance/sip-calculator) and watch how much of the maturity value comes from growth rather than your own contributions." },
    ],
    faqs: [
      { q: "How is SIP return calculated?", a: "A SIP uses the future value of a regular investment series: FV = P x [((1 + i)^n - 1) / i] x (1 + i), where P is the monthly amount, i is the monthly return (annual rate divided by 12) and n is the number of instalments. Each instalment compounds for the time it stays invested." },
      { q: "Is a SIP return guaranteed?", a: "No. SIPs in equity mutual funds are market-linked, so returns vary year to year and can be negative in a bad year. The rate you enter in a calculator is an expected estimate for planning, not a guaranteed outcome." },
      { q: "Why does starting a SIP early make such a big difference?", a: "Because of compounding - your returns earn further returns. Units bought early have the longest time to grow, so a SIP started earlier can end up far larger than one started later, even with the same monthly amount." },
    ],
  },
  // ---------------------------------------------------------------- BASE64-ENCODER
  {
    slug: "what-is-base64-encoding",
    title: "What Is Base64 Encoding?",
    h1: "What Is Base64 Encoding (and When to Use It)?",
    desc: "What is Base64 and when should you use it? Learn how Base64 encoding works, why it makes data 33% larger, why it is not encryption, and the URL-safe variant.",
    category: "dev",
    tool: { slug: "base64-encoder", title: "Base64 Encoder / Decoder" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "Base64 is a way to represent any binary data - an image, a file, raw bytes - using only plain text characters that are safe to send through systems built for text. It is one of the most common encodings on the web, quietly powering data URIs, email attachments, JWTs, and HTTP Basic auth headers. This guide explains what Base64 actually is, how the 3-bytes-to-4-characters conversion works, why the output is about 33% larger than the input, the most common places you will run into it, and one point worth being clear about: Base64 is not encryption and provides no security at all." },
      { t: "h2", s: "What is Base64?" },
      { t: "p", s: "Base64 is a binary-to-text encoding. Computers store everything - text, images, sound, executables - as bytes, and a byte can hold any of 256 values. Many older or text-only channels, such as email bodies, URLs, or JSON strings, were designed to carry a limited set of printable characters and can corrupt or strip out arbitrary bytes. Base64 solves this by re-expressing raw bytes using just 64 printable ASCII characters that survive transit safely. You can run any text or file through the [Base64 Encoder / Decoder](/dev/base64-encoder) to see this conversion happen in both directions." },
      { t: "h2", s: "How Base64 works" },
      { t: "p", s: "The core idea is a regrouping of bits. Base64 takes the input 3 bytes at a time. Three bytes are 24 bits, and 24 splits evenly into four groups of 6 bits. Each 6-bit group is a number from 0 to 63, and each of those 64 values maps to one character in the Base64 alphabet. So every 3 bytes of input become exactly 4 output characters." },
      { t: "p", s: "The standard alphabet, in order of value 0 to 63, is:" },
      { t: "ul", items: [
        "A to Z for values 0 to 25",
        "a to z for values 26 to 51",
        "0 to 9 for values 52 to 61",
        "+ for value 62 and / for value 63",
      ]},
      { t: "p", s: "When the input length is not a multiple of 3, the final group is padded. The = character fills the leftover slots so the output length is always a multiple of 4. One = means the last group encoded a single byte; two == means it encoded two bytes." },
      { t: "h2", s: "Why Base64 is about 33% larger" },
      { t: "p", s: "Because 3 bytes of input always produce 4 characters of output, the encoded data is 4/3 the size of the original - an increase of roughly 33%. Each output character is itself a byte of ASCII text, so 3 bytes in become 4 bytes out. This overhead is the price you pay for text-safety, and it is the main reason you embed small assets in Base64 but generally do not encode large files this way without a good reason." },
      { t: "h2", s: "A short worked example" },
      { t: "p", s: "Take the two-character text \"Hi\". As bytes, that is 0x48 (H) and 0x69 (i), or in binary 01001000 01101001. Concatenate the bits and regroup into 6-bit chunks: 010010, 000110, 1001 - and because we only have 2 bytes (16 bits), the last chunk is padded to 6 bits as 100100. That gives the values 18, 6, and 36, which map to S, G, and k. We started with 2 bytes (not a multiple of 3), so one = is appended. The result is \"SGk=\". Decoding \"SGk=\" with the [Base64 Encoder / Decoder](/dev/base64-encoder) returns \"Hi\" exactly." },
      { t: "h2", s: "Common uses" },
      { t: "p", s: "Base64 shows up wherever binary data needs to ride inside a text-only container:" },
      { t: "ul", items: [
        "Data URIs - embedding a small image or font directly in HTML or CSS, e.g. src=\"data:image/png;base64,iVBORw0...\", so the browser needs no separate request.",
        "Email attachments - MIME encodes attachments in Base64 so binary files survive mail servers that expect text.",
        "Binary inside JSON or XML - JSON has no native binary type, so byte data like a file or a cryptographic key is carried as a Base64 string.",
        "HTTP Basic authentication - the Authorization header sends \"username:password\" as Base64, e.g. Authorization: Basic dXNlcjpwYXNz.",
        "JSON Web Tokens (JWTs) - the header and payload sections are Base64URL-encoded JSON, separated by dots.",
      ]},
      { t: "p", s: "If you also need to make text safe for a query string or URL path, that is a different job handled by percent-encoding; see the [URL Encoder / Decoder](/dev/url-encoder)." },
      { t: "h2", s: "Base64 is NOT encryption" },
      { t: "p", s: "This is the single most important thing to understand. Base64 is an encoding, not encryption and not compression. It is fully reversible by anyone, with no key and no secret - decoding is a mechanical, public operation. It provides zero confidentiality: a Base64 string is just your original data wearing a thin text costume. Anyone who sees \"dXNlcjpwYXNz\" can decode it back to \"user:pass\" in seconds. And because it expands data by about a third rather than shrinking it, it is the opposite of compression. Never use Base64 to protect passwords, tokens, or any sensitive value - reach for real encryption (and HTTPS) for that." },
      { t: "h2", s: "URL-safe Base64" },
      { t: "p", s: "Two characters in the standard alphabet, + and /, have special meanings in URLs and filenames, so they can break when used there. The URL-safe variant of Base64 fixes this by swapping them out:" },
      { t: "ul", items: [
        "+ becomes -",
        "/ becomes _",
      ]},
      { t: "p", s: "Padding with = is also often omitted in URL contexts because = is reserved in query strings. This URL-safe variant is what JWTs use (commonly called Base64URL), which is why JWT segments contain - and _ but never + or /. The encoding scheme is otherwise identical; only those two characters differ." },
      { t: "h2", s: "When should you use Base64?" },
      { t: "p", s: "Use Base64 when you need to move binary data through a text-only pipe and the roughly 33% size cost is acceptable - small embedded images, inline fonts, byte fields in JSON, or constructing an auth header. Avoid it for large files (the overhead and lost compression add up), and never treat it as a security measure. When you just need to encode or decode a value quickly and check the result, paste it into the [Base64 Encoder / Decoder](/dev/base64-encoder) - it handles both standard and URL-safe encoding entirely in your browser, so your data never leaves your machine." },
    ],
    faqs: [
      { q: "Is Base64 encoding the same as encryption?", a: "No. Base64 is a reversible text encoding with no key and no secret, so anyone can decode it instantly. It provides no confidentiality and should never be used to protect passwords or sensitive data - use real encryption and HTTPS for that." },
      { q: "Why does Base64 make data larger?", a: "Base64 turns every 3 bytes of input into 4 printable characters, so the output is 4/3 the size of the input - an increase of about 33%. This overhead is the cost of making binary data safe to send through text-only channels." },
      { q: "What is URL-safe Base64?", a: "URL-safe Base64 is a variant that replaces the + character with - and the / character with _, since + and / have special meanings in URLs and filenames. It is used in JSON Web Tokens (JWTs), where padding = is also usually dropped." },
    ],
  },

  // ---------------------------------------------------------------- JWT-DECODER
  {
    slug: "what-is-inside-a-jwt",
    title: "What Is Inside a JWT?",
    h1: "What's Inside a JWT? Header, Payload and Signature Explained",
    desc: "What is inside a JWT? Learn the three parts of a JSON Web Token - header, payload and signature - and why decoding a token is not the same as verifying it.",
    category: "dev",
    tool: { slug: "jwt-decoder", title: "JWT Decoder" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "A JWT, or JSON Web Token, is a compact string used to carry identity and claims between systems - most commonly to keep a user logged in after they sign in. At a glance it looks like one long jumble of characters, but it is really three separate pieces glued together with dots. This guide breaks a JWT into its three parts - the header, the payload and the signature - explains what each one holds, and makes one critical point clear: a JWT is encoded, not encrypted, so anyone can read the payload. You will also learn the difference between decoding a token and verifying it." },
      { t: "h2", s: "The three parts of a JWT" },
      { t: "p", s: "Every JWT has exactly three parts, separated by dots, in this order:" },
      { t: "p", s: "header.payload.signature" },
      { t: "p", s: "A real token looks like eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c - three blocks split by two dots. Each of the first two blocks is a JSON object that has been Base64URL-encoded, and the third is the signature, also Base64URL-encoded. Base64URL is a URL-safe variant of Base64 that swaps a couple of characters so the token can travel safely in a URL or HTTP header. You can paste any token into the [JWT Decoder](/dev/jwt-decoder) to see the three parts split out and decoded for you." },
      { t: "h2", s: "The header" },
      { t: "p", s: "The first part is the header. It is a small JSON object that describes how the token was signed. Decoded, a typical header looks like this:" },
      { t: "p", s: "{ \"alg\": \"HS256\", \"typ\": \"JWT\" }" },
      { t: "ul", items: [
        "alg is the signing algorithm. Common values are HS256 (HMAC with SHA-256, using a shared secret) and RS256 (RSA with SHA-256, using a private/public key pair).",
        "typ is the token type, almost always the literal string JWT.",
      ]},
      { t: "p", s: "The header tells the receiving system which algorithm to use when it checks the signature. It is purely descriptive metadata - it carries no user data and, like the payload, it is only encoded, never encrypted." },
      { t: "h2", s: "The payload and its claims" },
      { t: "p", s: "The second part is the payload, where the actual data lives. Each piece of data is called a claim. A decoded payload might look like this:" },
      { t: "p", s: "{ \"sub\": \"1234567890\", \"name\": \"Ada Lovelace\", \"iat\": 1718000000, \"exp\": 1718003600 }" },
      { t: "p", s: "Claims fall into two groups. Registered claims are standard, reserved names with agreed meanings:" },
      { t: "ul", items: [
        "iss - the issuer, who created the token.",
        "sub - the subject, usually the user the token is about.",
        "aud - the audience, who the token is intended for.",
        "exp - the expiry time, after which the token is no longer valid.",
        "iat - the issued-at time, when the token was created.",
        "nbf - not-before, the earliest time the token may be used.",
      ]},
      { t: "p", s: "Importantly, exp, iat and nbf are numeric Unix timestamps - the number of seconds since 1 January 1970, not a human-readable date. A value like 1718003600 has to be converted to read it. Alongside these, you can add your own custom (private) claims such as name, role or email to carry whatever your application needs." },
      { t: "h2", s: "The signature" },
      { t: "p", s: "The third part is the signature, and it is what makes a JWT trustworthy. It is created by taking the encoded header and the encoded payload, joining them with a dot, and signing that string. In formula terms, the signed input is base64url(header) + \".\" + base64url(payload). How it is signed depends on the algorithm:" },
      { t: "ul", items: [
        "For HMAC algorithms such as HS256, the input is signed with a shared secret. The same secret is used to sign and to verify.",
        "For RSA or ECDSA algorithms such as RS256, the input is signed with a private key, and anyone can verify it with the matching public key.",
      ]},
      { t: "p", s: "The signature provides integrity and authenticity: if anyone changes a single character of the header or payload, the signature no longer matches and verification fails, which proves the token has not been tampered with and that it came from a holder of the signing key. What the signature does not provide is confidentiality - it protects the token from being altered, not from being read." },
      { t: "h2", s: "Decoding is NOT verifying (and the payload is NOT encrypted)" },
      { t: "p", s: "This is the single most important thing to understand about JWTs, and the place most beginners go wrong. The payload is encoded, not encrypted. Base64URL is a reversible transformation that anyone can undo - it scrambles the text for safe transport, but it provides zero secrecy. That means anyone who holds the token can decode it and read every claim inside, no secret or key required." },
      { t: "p", s: "Because of this, you must never put passwords, API keys, card numbers or any other secret in a JWT payload. Assume the contents are fully public to anyone who ever sees the token." },
      { t: "p", s: "Decoding and verifying are two different actions:" },
      { t: "ul", items: [
        "Decoding just reverses the Base64URL encoding to read the header and payload. It needs no key and tells you nothing about whether the token is genuine.",
        "Verifying recomputes the signature using the secret (for HMAC) or the public key (for RSA/ECDSA) and checks that it matches the signature in the token. Only verification proves a token is authentic and untampered.",
      ]},
      { t: "p", s: "A tool like the [JWT Decoder](/dev/jwt-decoder) decodes a token so you can read it - it does not, and cannot, prove the token is valid without the signing key. Your server is the place that must verify the signature before trusting any claim." },
      { t: "h2", s: "How to inspect a token safely" },
      { t: "p", s: "When you need to look inside a JWT - for example, while debugging why a login or API call failed - follow a few sensible habits:" },
      { t: "ol", items: [
        "Use a decoder that runs in your browser and does not send the token anywhere. Treat any token as a live credential.",
        "Never paste a production access token into a random website. Anyone who captures it can act as that user until it expires.",
        "Check the exp claim first. Convert the Unix timestamp to a date and confirm the token has not already expired - an expired token is the most common cause of sudden authentication failures.",
        "Compare the alg in the header against what your server expects. A mismatch can point to a misconfigured or even malicious token.",
        "Remember that reading the payload is not proof of validity. Only your server, holding the signing key, can confirm the signature is genuine.",
      ]},
      { t: "h2", s: "Where JWTs fit alongside encoding and hashing" },
      { t: "p", s: "It helps to place JWTs next to two related ideas. Base64URL, used throughout a JWT, is the same family of encoding used to move binary-safe text around the web - the guide on [What Is Base64 Encoding?](/guides/what-is-base64-encoding) shows how that transformation works in both directions. Hashing is different: a hash is a one-way fingerprint that cannot be reversed, which is how passwords should be stored on a server rather than inside a token. You can experiment with one-way hashes using the [Hash Generator](/dev/hash-generator). A JWT borrows from both - reversible encoding for the header and payload, and a cryptographic signature derived from a key for the third part." },
      { t: "p", s: "Once you can see the three parts clearly, JWTs stop feeling mysterious. The fastest way to build that intuition is to paste a sample token into the [JWT Decoder](/dev/jwt-decoder), read the header and payload side by side, and watch the claims - especially exp and iat - decode into something you can understand." },
    ],
    faqs: [
      { q: "Is the payload of a JWT encrypted?", a: "No. The payload is only Base64URL-encoded, which is fully reversible, so anyone holding the token can decode and read every claim. Never store passwords or secrets in a JWT payload." },
      { q: "What is the difference between decoding and verifying a JWT?", a: "Decoding just reverses the encoding to read the header and payload, and needs no key. Verifying recomputes the signature with the secret (HMAC) or public key (RSA/ECDSA) and checks it matches - only verifying proves the token is authentic and untampered." },
      { q: "What are the three parts of a JWT?", a: "A JWT has three dot-separated parts: the header (which states the algorithm, such as HS256 or RS256), the payload (which holds the claims), and the signature (which proves integrity and authenticity). Each part is Base64URL-encoded." },
    ],
  },

  // ---------------------------------------------------------------- HASH-GENERATOR
  {
    slug: "md5-vs-sha256-hashing-explained",
    title: "MD5 vs SHA-256: How Hashing Works",
    h1: "MD5 vs SHA-256: How Hashing Works (and Why MD5 Is Broken)",
    desc: "MD5 vs SHA-256 explained: how cryptographic hash functions work, why MD5 and SHA-1 are broken, when to use SHA-256, and why you should never hash passwords.",
    category: "dev",
    tool: { slug: "hash-generator", title: "Hash Generator" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "A cryptographic hash function turns any input - a password, a file, a whole disk image - into a short, fixed-length string of characters called a digest. The same input always gives the same digest, but you cannot work backwards from the digest to the original. This guide explains how hashing works, why the popular MD5 and SHA-1 algorithms are now considered broken, when SHA-256 is the right choice, and the one mistake almost everyone makes: hashing passwords with a plain, fast hash. You can try any of these algorithms on real text in the [Hash Generator](/dev/hash-generator)." },
      { t: "h2", s: "What is a hash function?" },
      { t: "p", s: "A cryptographic hash function takes data of any size and produces a digest of a fixed length. MD5 always outputs 128 bits (32 hex characters); SHA-256 always outputs 256 bits (64 hex characters), no matter whether you feed it one letter or a gigabyte. Good hash functions share four properties:" },
      { t: "ul", items: [
        "One-way (irreversible): given a digest, there is no practical way to recover the input.",
        "Deterministic: the same input always produces the same digest, every time, on every machine.",
        "Fixed-length: the output size is constant regardless of input size.",
        "Avalanche effect: changing a single bit of the input changes roughly half the output bits, so the new digest looks completely unrelated.",
      ]},
      { t: "p", s: "They are also fast to compute - which is excellent for checking files but, as we will see, a serious problem for passwords." },
      { t: "h2", s: "The avalanche effect in action" },
      { t: "p", s: "The avalanche effect is what makes a hash useful for spotting tampering. Hashing the word \"hello\" with SHA-256 gives 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824. Hashing \"Hello\" - just one capital letter different - gives 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969. There is no resemblance between the two outputs. That is why even a tiny change to a downloaded file produces a totally different checksum, instantly revealing corruption or interference." },
      { t: "h2", s: "Hashing is not encryption" },
      { t: "p", s: "This is the most common confusion. Encryption is a two-way process: you encrypt plaintext with a key, and someone with the right key can decrypt it back to the original. Hashing has no key and no reverse operation. There is no \"unhash\" function and no secret that turns a digest back into its input - the information needed to reconstruct the original is simply gone. So if a tool claims to \"decrypt\" an MD5 hash, it is not reversing anything; it is guessing inputs, hashing each one, and checking for a match. Hash when you need to verify or fingerprint data; encrypt when you need to get the original back later." },
      { t: "h2", s: "Why MD5 and SHA-1 are broken" },
      { t: "p", s: "A hash function's core security promise is collision resistance: it should be infeasible to find two different inputs that produce the same digest. Both MD5 (128-bit) and SHA-1 (160-bit) have failed this test, and not just in theory." },
      { t: "ul", items: [
        "MD5 collisions can be generated in seconds on an ordinary laptop. Attackers have used this to forge digital certificates and craft malicious files that share a hash with a benign one.",
        "SHA-1 was broken in practice in 2017, when researchers produced two different PDF files with the same SHA-1 digest (the \"SHAttered\" attack), and cheaper attacks have followed.",
      ]},
      { t: "p", s: "Because of this, MD5 and SHA-1 must never be used for anything security-related: digital signatures, TLS certificates, code signing, or verifying that a file came from a trusted source. They remain acceptable only as non-security checksums - for example, detecting accidental disk or network corruption, or as fast keys for deduplication, where no attacker is trying to engineer a collision." },
      { t: "h2", s: "SHA-256 and the SHA-2 family" },
      { t: "p", s: "SHA-256 is part of the SHA-2 family (which also includes SHA-224, SHA-384 and SHA-512) and produces a 256-bit digest. It has no known practical collision or preimage attacks and is currently considered secure for general cryptographic use. You will find SHA-256 working quietly everywhere: in TLS certificates that secure HTTPS connections, in software and code signing, in Git's newer object format, in the proof-of-work that underpins Bitcoin, and in trustworthy file-integrity checks. When you need a hash for security in 2026, SHA-256 (or SHA-512 for extra margin) is the sensible default. You can compare MD5, SHA-1 and SHA-256 outputs side by side for the same input in the [Hash Generator](/dev/hash-generator)." },
      { t: "h2", s: "Common uses for hashing" },
      { t: "p", s: "Outside of passwords, cryptographic hashes solve a handful of everyday problems:" },
      { t: "ul", items: [
        "File integrity and checksums: a download site publishes the SHA-256 of a file; you hash your copy and compare. If the digests match, the file is intact and unaltered.",
        "Deduplication: storage systems hash each chunk of data and store identical chunks only once, since matching digests mean matching content.",
        "Digital signatures: rather than sign a large document directly, software signs its hash. This is exactly why the underlying hash must be collision-resistant - if two documents share a digest, one signature would validate both.",
        "Content addressing: systems like Git name objects by their hash, so the identifier itself proves the content has not changed.",
      ]},
      { t: "h2", s: "Why you should not hash passwords with a plain hash" },
      { t: "p", s: "Here is the critical point. The very things that make SHA-256 great for file checks - it is fast and, used plainly, has no salt - make it dangerous for storing passwords. Speed is the enemy: a modern GPU can compute billions of SHA-256 hashes per second, so an attacker who steals your database can brute-force common and weak passwords almost instantly. And because plain hashing involves no salt, identical passwords produce identical digests, which lets attackers use precomputed rainbow tables to look up common inputs without any guessing at all. Remember, you can never \"reverse\" a hash - but you do not have to when guessing is this cheap." },
      { t: "p", s: "The fix is to use a slow, salted key-derivation function (KDF) built specifically for passwords:" },
      { t: "ul", items: [
        "bcrypt, scrypt, or Argon2 - all are deliberately slow and have a tunable work factor, so you can make each guess cost real time and memory.",
        "A unique random salt per password - stored alongside the hash - so two users with the same password get completely different stored values, which defeats rainbow tables entirely.",
        "Argon2 (specifically Argon2id) is the current recommended choice for new systems; bcrypt remains a solid, widely supported option.",
      ]},
      { t: "p", s: "In short: never store passwords as plain SHA-256 or MD5. Use Argon2, bcrypt or scrypt with a per-user salt." },
      { t: "h2", s: "Quick decision guide" },
      { t: "p", s: "To pick the right tool: use SHA-256 for file integrity, digital signatures and any security check; treat MD5 and SHA-1 as non-security checksums only, never for signatures or certificates; and use Argon2, bcrypt or scrypt with a salt for passwords. If you just need to fingerprint some text or verify a file, paste it into the [Hash Generator](/dev/hash-generator) to see its MD5, SHA-1 and SHA-256 digests instantly - and if you instead need to convert data to and from a transport-safe text format, that is encoding, not hashing, which is what the [Base64 Encoder / Decoder](/dev/base64-encoder) is for." },
    ],
    faqs: [
      { q: "Is hashing the same as encryption?", a: "No. Encryption uses a key and is reversible - the right key turns ciphertext back into the original. Hashing has no key and is one-way, so there is no way to recover the input from a digest. Use hashing to verify or fingerprint data, and encryption when you need the original back." },
      { q: "Is MD5 still safe to use?", a: "Only as a non-security checksum, such as detecting accidental file corruption. MD5 is cryptographically broken - collisions can be generated in seconds - so it must never be used for digital signatures, certificates, code signing, or password storage. Use SHA-256 for anything security-related." },
      { q: "Can I use SHA-256 to store passwords?", a: "No, not on its own. SHA-256 is fast and, used plainly, involves no salt, so attackers can brute-force stolen hashes or use rainbow tables. Store passwords with a slow, salted key-derivation function such as Argon2, bcrypt or scrypt, using a unique salt per password." },
    ],
  },

  // ---------------------------------------------------------------- JSON-FORMATTER
  {
    slug: "what-is-json",
    title: "What Is JSON?",
    h1: "What Is JSON? Syntax, Data Types and Common Errors",
    desc: "What is JSON? Learn JSON syntax and data types, the rules that make it valid, common errors like trailing commas, plus how to format or minify it.",
    category: "dev",
    tool: { slug: "json-formatter", title: "JSON Formatter" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "JSON stands for JavaScript Object Notation, a lightweight, text-based format for storing and exchanging data. It is everywhere in modern software: web APIs send responses in JSON, config files use it, and databases store it. Despite the name, JSON is language-independent - almost every programming language can read and write it. This guide explains what JSON is, the six value types it supports, the syntax rules that make a document valid, the most common errors people hit (trailing commas, single quotes, missing commas), and the difference between formatting and minifying so you know when to use each." },
      { t: "h2", s: "What is JSON?" },
      { t: "p", s: "JSON is a plain-text format for representing structured data as a string. Because it is just text, it travels easily over a network and can be saved to a file, logged, or pasted into a chat. It grew out of JavaScript syntax but is now an independent standard that any language can parse, which is why it became the default way for web services to talk to each other. When an app fetches data from an API, what comes back over the wire is almost always a JSON string that the app then parses into objects it can work with. If you ever want to inspect that raw string, paste it into the [JSON Formatter](/dev/json-formatter) to see its structure clearly." },
      { t: "h2", s: "JSON data types" },
      { t: "p", s: "JSON has exactly six value types. Every piece of data in a JSON document is one of these:" },
      { t: "ul", items: [
        "Object: an unordered collection of key/value pairs wrapped in curly braces, for example {\"name\": \"Ada\"}. Keys must be double-quoted strings.",
        "Array: an ordered list of values wrapped in square brackets, for example [1, 2, 3].",
        "String: text wrapped in double quotes, for example \"hello\".",
        "Number: an integer or decimal such as 42 or 3.14. No quotes, and no leading zeros.",
        "Boolean: the literal true or false (lowercase, unquoted).",
        "Null: the literal null, used to mean 'no value'.",
      ]},
      { t: "p", s: "Note what is missing: there is no date type (dates are usually stored as strings), and the special values undefined, NaN, and Infinity are not valid JSON. Objects and arrays can nest inside each other freely, which is how JSON represents complex, tree-shaped data." },
      { t: "h2", s: "JSON syntax rules" },
      { t: "p", s: "The rules are strict and worth memorising, because most 'broken JSON' comes from breaking one of them:" },
      { t: "ul", items: [
        "Object keys must be strings in double quotes. {\"id\": 1} is valid; {id: 1} is not.",
        "Strings use double quotes only. 'single quotes' are not allowed, even though they are fine in JavaScript.",
        "Commas separate items inside objects and arrays, but there must be no trailing comma after the last item.",
        "Comments are not allowed - neither // nor /* */.",
        "Whitespace between tokens (spaces, tabs, newlines) is insignificant and ignored by parsers.",
      ]},
      { t: "p", s: "Here is a small valid example that uses every data type:" },
      { t: "p", s: "{\"name\": \"Ada\", \"age\": 36, \"active\": true, \"nickname\": null, \"skills\": [\"math\", \"logic\"], \"address\": {\"city\": \"London\"}}" },
      { t: "h2", s: "Common JSON errors" },
      { t: "p", s: "Almost every parse failure traces back to a handful of mistakes. The three most frequent are a trailing comma, single quotes, and a missing comma between items:" },
      { t: "ul", items: [
        "Trailing comma: {\"a\": 1, \"b\": 2,} - the comma after 2 is invalid. Remove it.",
        "Single quotes: {'a': 1} - keys and strings must use double quotes, so it becomes {\"a\": 1}.",
        "Unquoted keys: {a: 1} - the key needs quotes: {\"a\": 1}.",
        "Missing comma: {\"a\": 1 \"b\": 2} - there must be a comma between the two pairs.",
        "Unescaped characters: a double quote or newline inside a string must be escaped as \\\" or \\n. {\"text\": \"she said \"hi\"\"} breaks the string and needs {\"text\": \"she said \\\"hi\\\"\"}.",
      ]},
      { t: "p", s: "When a parser reports an error, it usually points to a line and column. Start there and check for one of the issues above - a stray comma or the wrong quote character is the culprit far more often than anything exotic. Pasting the text into the [JSON Formatter](/dev/json-formatter) will pinpoint the exact spot where parsing fails." },
      { t: "h2", s: "Formatting vs minifying" },
      { t: "p", s: "Because whitespace is insignificant, you can add or remove it freely without changing the data at all. That gives you two useful operations. Formatting (also called beautifying or pretty-printing) adds indentation and line breaks so the structure is easy to read while you debug. Minifying strips every optional space and newline to make the document as small as possible, which matters when you are sending it over a network or storing it at scale." },
      { t: "p", s: "For example, the minified value {\"a\":1,\"b\":[2,3]} and its formatted version - with each key on its own indented line - are exactly the same data to a parser. Use formatting when a human needs to read it; use minifying when a machine needs to transfer it efficiently." },
      { t: "h2", s: "How to validate and fix JSON" },
      { t: "p", s: "Validating JSON means checking that it follows every syntax rule so a parser will accept it. The practical workflow is straightforward:" },
      { t: "ol", items: [
        "Paste the JSON into a validator or formatter and let it parse the text.",
        "If it reports an error, jump to the line and column it names.",
        "Fix the usual suspects: remove trailing commas, replace single quotes with double quotes, quote any bare keys, and add any missing commas.",
        "Re-run until it parses cleanly, then format it to confirm the structure reads as you expect.",
      ]},
      { t: "p", s: "Once your JSON is valid, you can convert it to other formats - for instance turn an array of objects into a spreadsheet with [JSON to CSV](/convert/json-to-csv), or go the other way with [CSV to JSON](/convert/csv-to-json)." },
      { t: "h2", s: "Try it yourself" },
      { t: "p", s: "The fastest way to understand JSON is to work with it directly. Paste any snippet into the [JSON Formatter](/dev/json-formatter) to validate it, see exactly where a trailing comma or single quote breaks it, and switch between a readable formatted view and a compact minified one in a click." },
    ],
    faqs: [
      { q: "What does JSON stand for?", a: "JSON stands for JavaScript Object Notation. It is a lightweight, text-based, language-independent format for storing and exchanging data, and it is widely used by web APIs and config files." },
      { q: "Why is my JSON invalid?", a: "The most common causes are a trailing comma after the last item, using single quotes instead of double quotes, unquoted object keys, or a missing comma between items. Comments and the values undefined, NaN, and Infinity are also not allowed in JSON." },
      { q: "What is the difference between formatting and minifying JSON?", a: "Both only change whitespace, so the underlying data stays identical. Formatting (pretty-printing) adds indentation to make JSON easy to read, while minifying removes all optional whitespace to shrink it for faster transfer or storage." },
    ],
  },

  // ---------------------------------------------------------------- MERGE-PDF
  {
    slug: "how-to-merge-pdf-files",
    title: "How to Merge PDF Files",
    h1: "How to Merge PDF Files Online (Free, No Upload)",
    desc: "How to merge PDF files into one online for free. Combine and reorder multiple PDFs in your browser with no upload, plus tips on splitting and compressing.",
    category: "pdf",
    tool: { slug: "merge-pdf", title: "Merge PDF" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "Merging PDFs means taking several separate PDF files and combining them into one document, with the pages kept in the order you choose. It is one of the most common everyday PDF jobs - stitching scanned pages back together, joining a contract with its annexures, or bundling a set of invoices into a single file to send. This guide explains exactly what merging does, walks you step by step through combining files online, shows how to reorder them first, and covers what to do if the merged file ends up too large or you later need to pull pages back out." },
      { t: "h2", s: "What merging a PDF means" },
      { t: "p", s: "Merging joins two or more PDF files end to end into a single new PDF. If you merge a 3-page file and a 5-page file, you get one 8-page document. The original files are untouched - merging creates a fresh combined file rather than editing the source documents. The only thing you control is the order in which the files are stacked, which is why arranging them correctly before you merge matters. The [Merge PDF](/pdf/merge-pdf) tool handles this for you and keeps every page in the sequence you set." },
      { t: "h2", s: "How to merge PDF files" },
      { t: "p", s: "Combining files takes well under a minute. Here is the full process from start to finish:" },
      { t: "ol", items: [
        "Open the [Merge PDF](/pdf/merge-pdf) tool in your browser.",
        "Add the PDFs you want to combine - drag them onto the page or click to select them from your device. You can add several at once.",
        "Arrange the files into the order you want using the Up and Down buttons next to each one. The file at the top of the list becomes the first set of pages.",
        "Click the merge button to combine them into a single PDF.",
        "Download the merged file and check that the pages are in the right order before you send or save it.",
      ]},
      { t: "p", s: "There is no account, no sign-up and no watermark - you select your files, set the order, merge and download." },
      { t: "h2", s: "Reordering files before you merge" },
      { t: "p", s: "Order is the single most important thing to get right, because a merged PDF simply lays the files out one after another in the sequence you give. If you add a cover letter, a report and an appendix but they land in the wrong order, the document reads out of sequence. Before clicking merge, use the move up and move down buttons beside each file so the top of the list is what you want on page one and the bottom is what you want last. You can also remove a file from the list if you added it by mistake. It is far quicker to reorder up front than to merge, notice the mistake, and start again. If you only need a few pages from a larger file, split that file first (covered below) and then merge the part you actually want." },
      { t: "h2", s: "Is it private and safe?" },
      { t: "p", s: "Yes. The [Merge PDF](/pdf/merge-pdf) tool runs entirely in your browser - it is built on the pdf-lib library and does all the work on your own device. Your files are never uploaded to a server, which is a genuine privacy benefit when you are combining sensitive material such as contracts, ID scans, medical records or financial statements. Because nothing leaves your machine, there is no copy of your documents sitting on someone else's infrastructure. Once the page has loaded, the merge and download steps run locally, so they still work even if your connection drops." },
      { t: "h2", s: "Common reasons to merge PDFs" },
      { t: "p", s: "Merging comes up constantly in everyday work and admin. A few typical cases:" },
      { t: "ul", items: [
        "Combining a batch of invoices or receipts into one file for an expense claim or your records.",
        "Joining scanned pages that came out as separate files into a single readable document.",
        "Attaching annexures, schedules or appendices to the end of a contract or agreement.",
        "Bundling a multi-part report, proposal or application into one file that is easy to email.",
        "Merging a signed cover page with the rest of a document so everything stays together.",
      ]},
      { t: "h2", s: "What to do if the merged file is too large" },
      { t: "p", s: "Merging joins files but does not shrink them - the combined PDF is roughly the sum of the parts, so if your sources are image-heavy or contain high-resolution scans, the result can be large. Email services often cap attachments at around 25 MB, and a stack of scanned pages can easily exceed that. If your merged file is too big to send, run it through [Compress PDF](/pdf/compress-pdf) to reduce the file size while keeping it readable. Compress after merging, not before, so the whole document is optimised in one pass." },
      { t: "h2", s: "What to do if you need pages back out" },
      { t: "p", s: "Sometimes you merge a document and later realise you need only part of it, or you want to send one section without the rest. You do not have to recreate anything from scratch - use [Split PDF](/pdf/split-pdf) to pull out specific pages or break the file into separate documents. Splitting and merging are complementary: split a large file down to the pages you want, then merge those with other documents into a clean final PDF. Both run in your browser, so the same privacy benefit applies throughout." },
      { t: "h2", s: "Merge your PDFs now" },
      { t: "p", s: "Combining PDFs is quick once you know the flow: add your files, set the order with the Up and Down buttons, merge and download. Because everything happens in your browser, even confidential documents stay on your device. Open the [Merge PDF](/pdf/merge-pdf) tool to combine your files into one, and reach for [Compress PDF](/pdf/compress-pdf) if the result needs slimming down before you send it." },
    ],
    faqs: [
      { q: "Does merging PDFs change the original files?", a: "No. Merging creates a brand new combined PDF and leaves your source files untouched. You can re-run the merge with a different order or different files at any time." },
      { q: "Are my files uploaded when I merge them online?", a: "No. The Merge PDF tool runs entirely in your browser using pdf-lib, so your files are processed on your own device and never sent to a server. This makes it safe for confidential documents." },
      { q: "Why is my merged PDF so large, and how do I make it smaller?", a: "Merging adds files together without compressing them, so an image-heavy or scan-heavy result can be big. Run the merged file through Compress PDF to reduce the size while keeping it readable." },
    ],
  },

  // ---------------------------------------------------------------- SPLIT-PDF
  {
    slug: "how-to-split-a-pdf",
    title: "How to Split a PDF",
    h1: "How to Split a PDF into Separate Pages or Ranges",
    desc: "How to split a PDF online for free - extract single pages or page ranges into a new file in your browser with no upload. The steps, syntax, and related tools.",
    category: "pdf",
    tool: { slug: "split-pdf", title: "Split PDF" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "Splitting a PDF means pulling chosen pages or page ranges out of a larger file and saving them as a new, smaller PDF. It is one of the most common everyday PDF tasks - you might need only one chapter from a long report, want to drop a few blank scans, or have to share just a section of a contract without sending the whole document. This guide explains what splitting actually does, walks through the exact steps using [Split PDF](/pdf/split-pdf), shows how page-range syntax works, covers privacy, lists common reasons to split, and points to related tools for putting files back together or shrinking the result." },
      { t: "h2", s: "What splitting a PDF means" },
      { t: "p", s: "Splitting a PDF extracts the pages you select - either single pages, a continuous range, or a mix of both - and writes them into a brand new file. The original document is left untouched, and the content of every extracted page stays exactly the same. Text, images, formatting, and layout are copied across unchanged; splitting only chooses which pages travel into the new file, it never edits what is on them. So if you extract pages 5 to 10 of a 40-page manual, you get a clean 6-page PDF that looks identical to those pages in the original." },
      { t: "h2", s: "How to split a PDF" },
      { t: "p", s: "The process takes under a minute and needs no software install. Using the [Split PDF](/pdf/split-pdf) tool, the steps are:" },
      { t: "ol", items: [
        "Open the Split PDF tool in your browser.",
        "Load your PDF by dragging the file in or clicking to choose it from your device.",
        "Enter the pages or ranges you want to keep, such as a single page like 5 or a range like 2-8.",
        "Run the split to extract those pages into a new PDF.",
        "Download the new file to your device.",
      ]},
      { t: "p", s: "Because there is nothing to sign up for, you can repeat the process as many times as you like - for example, extracting several different sections from the same source file one after another." },
      { t: "h2", s: "Single pages vs page ranges" },
      { t: "p", s: "Page selection is usually written as a list of individual pages and ranges separated by commas. A single number means one page; two numbers joined by a hyphen mean a continuous range that includes both ends. For example, 1-3, 5, 8-10 means: take pages 1, 2, and 3, then page 5, then pages 8, 9, and 10 - seven pages in total. You can combine them freely." },
      { t: "ul", items: [
        "A single page: 7 extracts only page 7.",
        "A continuous range: 4-9 extracts pages 4 through 9 inclusive.",
        "A mixed selection: 1, 3, 6-8 extracts pages 1, 3, 6, 7, and 8.",
        "Pages always count from 1, matching the page order of the original document, not any printed page numbers inside it.",
      ]},
      { t: "p", s: "The printed number on a page (for instance, a report that starts its body on a page labelled '1' but is the third sheet of the file) can differ from its position in the PDF. When in doubt, count from the very first sheet of the document." },
      { t: "h2", s: "Is splitting a PDF private?" },
      { t: "p", s: "Yes. The [Split PDF](/pdf/split-pdf) tool runs entirely in your browser using a JavaScript PDF library (pdf-lib), so your file is never uploaded to a server. The PDF is read, the selected pages are extracted, and the new file is created all on your own device. Nothing leaves your computer, which makes it safe to use for sensitive material like statements, contracts, medical records, or internal documents. Once you close the tab, no copy of your file remains anywhere online." },
      { t: "h2", s: "Common reasons to split a PDF" },
      { t: "p", s: "Splitting solves a wide range of practical problems where you need part of a document rather than the whole thing:" },
      { t: "ul", items: [
        "Pull out one chapter or section from a long report, manual, or e-book so you can read or send just that part.",
        "Remove unwanted pages, such as blank sheets, duplicate scans, cover pages, or advertising inserts.",
        "Separate a scanned batch where several documents were scanned into one file, so each becomes its own PDF.",
        "Share only part of a document - for example, sending a client a single appendix instead of an entire 100-page agreement.",
        "Break a large file into smaller pieces that are easier to email or upload where size limits apply.",
      ]},
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you have a 20-page scanned bundle: pages 1 to 4 are an invoice, pages 5 to 12 are a delivery note with two blank pages at 9 and 10, and pages 13 to 20 are a separate warranty card. To get a clean invoice file, you would load the bundle and enter 1-4, then download. To get the delivery note without the blanks, you would split the same source again with 5-8, 11, 12. That second selection skips pages 9 and 10 entirely. The original 20-page file stays intact, and you end up with two tidy new PDFs." },
      { t: "h2", s: "Related tools" },
      { t: "p", s: "Splitting often goes hand in hand with other PDF tasks. If you have several PDFs and want to combine them into one ordered file - for instance, after extracting and rearranging sections - use [Merge PDF](/pdf/merge-pdf). If the file you produce is still large, for example because it contains high-resolution scans, run it through [Compress PDF](/pdf/compress-pdf) to reduce its size before emailing or uploading. Like the splitter, both of these tools run in your browser with no upload." },
      { t: "h2", s: "Start splitting your PDF" },
      { t: "p", s: "Splitting a PDF is quick, private, and reversible since your original file is never changed. Decide which pages or ranges you need, enter them using the simple comma-and-hyphen syntax, and download a clean new file in seconds. Open [Split PDF](/pdf/split-pdf) to extract the pages you want right now, with no upload and no sign-up." },
    ],
    faqs: [
      { q: "Does splitting a PDF change the extracted pages?", a: "No. Splitting only chooses which pages go into the new file; the text, images, and layout of each extracted page stay exactly as they were in the original. Your source document is also left untouched." },
      { q: "How do I write a page range when splitting?", a: "Use individual page numbers and ranges separated by commas, for example 1-3, 5, 8-10. A single number takes one page, and two numbers joined by a hyphen take every page in that range inclusive. Pages count from the first sheet of the file." },
      { q: "Is my file uploaded when I split a PDF?", a: "No. Zenoply's Split PDF tool runs entirely in your browser using pdf-lib, so the file never leaves your device. That makes it safe for sensitive documents, and nothing is stored online after you close the tab." },
    ],
  },

  // ---------------------------------------------------------------- COMPRESS-PDF
  {
    slug: "how-to-compress-a-pdf",
    title: "How to Compress a PDF",
    h1: "How to Compress a PDF and Reduce File Size",
    desc: "How to compress a PDF to reduce file size for free. Learn why PDFs get large, how compression works, the quality trade-off, and when it will not help.",
    category: "pdf",
    tool: { slug: "compress-pdf", title: "Compress PDF" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "PDFs that started as a quick scan or a slide export can balloon to tens of megabytes, which makes them painful to email or upload. Compressing a PDF shrinks the file so it transfers faster and fits within size limits, usually without you noticing any difference on screen. This guide explains why PDFs get large in the first place, how compression actually works under the hood, the trade-off between quality and size, and the step-by-step process to compress a PDF in your browser for free. It also covers when compression will save you a lot, and when a file is already as small as it is going to get." },
      { t: "h2", s: "Why PDFs get large" },
      { t: "p", s: "A PDF is a container. The text and layout instructions inside it are tiny, so a plain text document of many pages might only be a few hundred kilobytes. The size almost always comes from images. The biggest culprits are:" },
      { t: "ul", items: [
        "Embedded high-resolution photos or graphics, which can each be several megabytes before they are placed in the document.",
        "Scanned pages, where every page is really a full-page image of paper rather than selectable text - this is why a scanned contract can be far larger than the same contract typed out.",
        "Embedded fonts and duplicated resources, which add overhead, though usually much less than images do.",
      ]},
      { t: "p", s: "So the rule of thumb is simple: if a PDF is large, look at its images. A 20 MB file is almost never 20 MB of text." },
      { t: "h2", s: "How PDF compression works" },
      { t: "p", s: "Compression tackles the parts that take up the most space. It does two main things: it re-encodes images using more efficient settings, and it downsamples them - reducing the stored resolution to something closer to what a screen or printer actually needs. It also strips out redundant or duplicated data inside the file. Because images dominate the size, image-heavy and scanned PDFs can shrink dramatically, often by half or more. A text-only PDF, by contrast, has very little to compress, so the savings are small. The amount you save depends almost entirely on how much image data the file contains." },
      { t: "p", s: "It is worth knowing that aggressive image compression is lossy. That means some image detail is permanently discarded to make the file smaller - the saved-out image is an approximation of the original. For most documents this is invisible at normal viewing sizes, but it is a real trade-off rather than a free lunch." },
      { t: "h2", s: "How to compress a PDF" },
      { t: "p", s: "Using the [Compress PDF](/pdf/compress-pdf) tool takes under a minute. Here is the full process:" },
      { t: "ol", items: [
        "Open the [Compress PDF](/pdf/compress-pdf) tool in your browser.",
        "Load the PDF you want to shrink by selecting it or dragging it onto the page.",
        "Pick a quality or compression level - a higher level squeezes harder and produces a smaller file, while a lower level keeps more image detail.",
        "Run the compression and let the tool re-encode the images.",
        "Compare the result: the tool shows the original size, the new size, and how much you saved.",
        "Download the compressed PDF. If the savings or quality are not what you want, try a different level and compress again.",
      ]},
      { t: "h2", s: "The quality versus size trade-off" },
      { t: "p", s: "Compression levels exist because there is no single right answer. A document you only need to read on screen or email can tolerate heavy compression - the text stays crisp because it is not an image, and photos look fine at screen size. A document destined for print, or one with fine diagrams and small text inside images, deserves a lighter touch so those details survive. As a practical example, a 12 MB scanned report might drop to around 3 MB at a medium level with no visible difference, or to under 1 MB at the most aggressive level where you might start to notice softer images. Try a medium level first, check the result, and only push harder if you still need a smaller file." },
      { t: "h2", s: "Is it private?" },
      { t: "p", s: "Yes. The [Compress PDF](/pdf/compress-pdf) tool runs entirely in your browser. Your file is processed on your own device and is not uploaded to a server, so a confidential contract, ID scan or financial statement never leaves your computer. This also means compression works even if your connection drops after the page has loaded, and there is no file waiting on someone else's server afterward." },
      { t: "h2", s: "When compression will not help much" },
      { t: "p", s: "Compression is not magic - it can only remove what is removable. A few situations give little or no benefit:" },
      { t: "ul", items: [
        "A small, text-only PDF is already compact because there are no large images to shrink. A 200 KB text document might only drop by a few kilobytes.",
        "A PDF that was already compressed once has little slack left. Running it through again often saves almost nothing and may degrade image quality further.",
        "Files where every byte is meaningful, such as vector-only diagrams, since vectors are already compact and do not downsample like photos.",
      ]},
      { t: "p", s: "If a file barely changes after compression, that is usually a sign it was already efficient - not a sign the tool failed." },
      { t: "h2", s: "Related tools" },
      { t: "p", s: "Compression often comes up alongside other PDF housekeeping. If you need to combine several files into one before sending, use [Merge PDF](/pdf/merge-pdf). If a document is too long and you only need certain pages, [Split PDF](/pdf/split-pdf) lets you pull them out - and a smaller page range is naturally a smaller file. These tools, like compression, run in your browser with no upload." },
      { t: "h2", s: "Compress your PDF now" },
      { t: "p", s: "To shrink a file for email, upload or storage, open the [Compress PDF](/pdf/compress-pdf) tool, load your document, choose a level, and compare the size you saved before downloading. It is free, runs entirely in your browser, and your file never leaves your device." },
    ],
    faqs: [
      { q: "Will compressing a PDF reduce the quality?", a: "It can, because aggressive image compression is lossy and permanently discards some image detail. At a light or medium level the change is usually invisible at normal viewing sizes, while the most aggressive levels may make images look slightly softer. Text stays sharp because it is not stored as an image." },
      { q: "Why did my PDF barely get smaller after compression?", a: "Compression mainly shrinks images, so a file with little image data has little to remove. A small, text-only PDF is already compact, and a file that was compressed once before has almost no slack left to recover." },
      { q: "Is it safe to compress a confidential PDF online?", a: "With the Zenoply Compress PDF tool, yes - it runs entirely in your browser and does not upload your file to any server. The document is processed on your own device, so a private contract or ID scan never leaves your computer." },
    ],
  },

  // ---------------------------------------------------------------- COMPOUND-INTEREST-CALCULATOR
  {
    slug: "what-is-compound-interest",
    title: "What Is Compound Interest?",
    h1: "What Is Compound Interest? The Formula, Explained",
    desc: "What is compound interest? Learn the formula A = P(1 + r/n)^(nt), how it differs from simple interest, a worked example, and the Rule of 72.",
    category: "finance",
    tool: { slug: "compound-interest-calculator", title: "Compound Interest Calculator" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "Compound interest is interest you earn not only on your original money but also on the interest that money has already earned. That second layer - interest on interest - is what makes savings, fixed deposits and long-term investments grow faster the longer you leave them alone. This guide explains what compound interest is, how it differs from simple interest, and the standard formula A = P(1 + r/n)^(nt). It walks through a worked example with real numbers, shows why compounding frequency matters, covers the Rule of 72 shortcut for doubling your money, and points out where compounding helps you - and where it works against you." },
      { t: "h2", s: "Compound interest vs simple interest" },
      { t: "p", s: "The cleanest way to understand compounding is to compare it with simple interest. Simple interest is calculated only on the original amount you deposit or borrow, called the principal. The formula is I = P x r x t, where P is the principal, r is the annual rate as a decimal and t is the number of years. The principal never changes, so you earn the same amount every year." },
      { t: "p", s: "Compound interest is different. After each period, the interest you earned is added to the principal, and the next period's interest is calculated on this larger balance. So the base keeps growing, and your interest grows with it. Over one or two years the gap is small, but over a decade or more it becomes large." },
      { t: "ul", items: [
        "Simple interest: earned on the original principal only, so the yearly amount is flat.",
        "Compound interest: earned on principal plus all previously accumulated interest, so it speeds up over time.",
        "On a loan or credit card, the same effect works against you - unpaid interest gets added to what you owe.",
      ]},
      { t: "h2", s: "The compound interest formula" },
      { t: "p", s: "The standard formula for the final amount under compounding is:" },
      { t: "p", s: "A = P(1 + r/n)^(nt)" },
      { t: "p", s: "Where:" },
      { t: "ul", items: [
        "A is the final amount, also called the maturity value - what you end up with.",
        "P is the principal - the amount you start with.",
        "r is the annual interest rate written as a decimal, so 8% becomes 0.08.",
        "n is the number of times interest is compounded per year (1 for annually, 4 for quarterly, 12 for monthly).",
        "t is the time in years.",
      ]},
      { t: "p", s: "The interest you actually earn is simply the final amount minus what you put in: compound interest = A - P. You never need to compute the powers by hand - the [Compound Interest Calculator](/finance/compound-interest-calculator) does it instantly - but knowing each part helps you see what is driving the result." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you deposit 1,00,000 at 8% annual interest for 10 years, compounded once a year. Here P = 1,00,000, r = 0.08, n = 1 and t = 10." },
      { t: "ol", items: [
        "Work out 1 + r/n = 1 + 0.08/1 = 1.08.",
        "Raise it to the power nt = 1 x 10 = 10, so 1.08^10 = 2.158925.",
        "Multiply by the principal: A = 1,00,000 x 2.158925, which is about 2,15,892.",
        "Subtract the principal to get the interest: 2,15,892 - 1,00,000 = about 1,15,892.",
      ]},
      { t: "p", s: "So your 1,00,000 more than doubles, and the interest earned (about 1,15,892) is larger than the original deposit. With simple interest at the same 8% for 10 years you would earn only 1,00,000 x 0.08 x 10 = 80,000. The extra 35,892 is the value compounding adds - interest that itself earned interest." },
      { t: "h2", s: "How compounding frequency matters" },
      { t: "p", s: "The n in the formula is how often interest is added during the year. At the same nominal annual rate, compounding more often gives a slightly higher final amount, because interest starts earning interest sooner. Using the same 1,00,000 at 8% for 10 years:" },
      { t: "ul", items: [
        "Compounded annually (n = 1): A is about 2,15,892.",
        "Compounded quarterly (n = 4): A is about 2,20,804.",
        "Compounded monthly (n = 12): A is about 2,21,964.",
      ]},
      { t: "p", s: "Moving from annual to monthly compounding adds about 6,072 over the decade on the same headline rate. The difference is real but modest, and it shrinks as the rate falls. This is why it pays to check not just the advertised rate but how often interest is compounded when comparing two deposits." },
      { t: "h2", s: "The power of time and the Rule of 72" },
      { t: "p", s: "Time is the strongest force in compounding. Because each year's growth builds on a bigger base, the curve gets steeper the longer you wait, and most of the gains in a long investment come in the final years. A quick mental shortcut for this is the Rule of 72: divide 72 by the annual interest rate (written as a percent) to estimate how many years it takes your money to double." },
      { t: "p", s: "At 8%, that is 72 / 8 = about 9 years to double. At 6% it is 72 / 6 = 12 years; at 12% it is 72 / 12 = 6 years. The rule is an approximation, not an exact figure, but it is close enough for fast comparisons and shows why even a couple of extra percentage points - or a few extra years - can make a big difference to the end result." },
      { t: "h2", s: "Where compound interest shows up" },
      { t: "p", s: "Compounding is everywhere in personal finance, working both for you and against you. It is worth recognising which side you are on." },
      { t: "ul", items: [
        "Savings accounts and fixed deposits, where interest is added periodically and grows on itself - see the [FD Calculator](/finance/fd-calculator).",
        "Mutual funds and equity investments, where reinvested returns compound over years; a regular plan is modelled in the [SIP Calculator](/finance/sip-calculator).",
        "Loans, credit cards and EMIs, where unpaid interest is added to your balance - here compounding increases what you owe, so carrying a credit-card balance is expensive.",
      ]},
      { t: "p", s: "The lesson is simple: let compounding run for you by investing early and staying invested, and avoid letting it run against you by clearing high-interest debt quickly." },
      { t: "h2", s: "Try it yourself" },
      { t: "p", s: "The fastest way to build intuition is to change the numbers and watch the result move. Enter a principal, a rate, a number of years and a compounding frequency in the [Compound Interest Calculator](/finance/compound-interest-calculator), and see how much of your final amount comes from growth rather than your own deposit - then try stretching the time period to feel just how much later years contribute." },
    ],
    faqs: [
      { q: "What is the compound interest formula?", a: "The formula is A = P(1 + r/n)^(nt), where A is the final amount, P is the principal, r is the annual rate as a decimal, n is the number of compounding periods per year and t is the time in years. The interest earned is A minus P." },
      { q: "How is compound interest different from simple interest?", a: "Simple interest is calculated only on the original principal, so the yearly amount stays flat. Compound interest is calculated on the principal plus all previously earned interest, so the balance - and the interest - grows faster over time." },
      { q: "How long does it take to double my money?", a: "Use the Rule of 72: divide 72 by the annual interest rate written as a percent. At 8% that is 72 / 8, or about 9 years. It is an approximation, but it is accurate enough for quick comparisons." },
    ],
  },

  // ---------------------------------------------------------------- FD-CALCULATOR
  {
    slug: "how-is-fd-interest-calculated",
    title: "How Is FD Interest Calculated?",
    h1: "How Is FD Interest Calculated? Quarterly Compounding, Explained",
    desc: "How is FD interest calculated? Learn how Indian banks use quarterly compounding, the formula M = P(1 + r/4)^(4t), and a clear worked example.",
    category: "finance",
    tool: { slug: "fd-calculator", title: "FD Calculator" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "How is FD interest calculated? This guide explains exactly how a fixed deposit grows, using the method most Indian banks follow: quarterly compounding. You will learn what a fixed deposit is, the maturity formula M = P(1 + r/4)^(4t), and how to read each part of it. We work through a full numeric example - 1,00,000 invested at 7% for 5 years - and show why compounding beats simple interest. We also cover cumulative versus non-cumulative deposits, a brief note on tax and TDS, and senior-citizen rates. Use the figures here to sanity-check what a bank quotes you." },
      { t: "h2", s: "What is a fixed deposit?" },
      { t: "p", s: "A fixed deposit (FD) is a lump sum you place with a bank or NBFC for a fixed tenure at a fixed interest rate agreed at the start. In return for locking the money away - anywhere from 7 days to 10 years - you earn a higher rate than a regular savings account. Because the rate is fixed when you open the FD, your return is predictable and does not move with later rate changes. You can usually withdraw early, but banks often apply a penalty and pay a slightly lower rate on premature closure." },
      { t: "h2", s: "How banks calculate FD interest" },
      { t: "p", s: "Most Indian banks compound FD interest quarterly. Compounding means each quarter's interest is added to the balance, and the next quarter earns interest on the larger amount. The standard maturity formula for a cumulative FD is:" },
      { t: "p", s: "M = P(1 + r/4)^(4t)" },
      { t: "ul", items: [
        "M is the maturity amount (what you receive at the end).",
        "P is the principal (the amount you deposit).",
        "r is the annual interest rate written as a decimal, so 7% is 0.07.",
        "t is the tenure in years.",
        "Dividing r by 4 gives the quarterly rate, and 4t is the number of quarters.",
      ]},
      { t: "p", s: "The interest you actually earn is simply M - P. You can run any combination of amount, rate, and tenure through the [FD Calculator](/finance/fd-calculator) instead of doing the powers by hand." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you deposit P = 1,00,000 at an annual rate of 7% for t = 5 years, compounded quarterly. Work through the formula step by step:" },
      { t: "ol", items: [
        "Convert the rate: r = 7% = 0.07, so the quarterly rate r/4 = 0.0175.",
        "Count the periods: 4t = 4 x 5 = 20 quarters.",
        "Raise the growth factor to that power: (1.0175)^20 is about 1.41478.",
        "Multiply by the principal: M = 1,00,000 x 1.41478, which is about 1,41,478.",
        "Subtract to find the interest: 1,41,478 - 1,00,000 = about 41,478.",
      ]},
      { t: "p", s: "So the deposit grows to roughly 1,41,478, and you earn about 41,478 in interest over five years. Exact paise can differ slightly by bank depending on day-count conventions and rounding." },
      { t: "h2", s: "Why quarterly compounding beats simple interest" },
      { t: "p", s: "With simple interest at the same 7% for 5 years, you would earn 1,00,000 x 0.07 x 5 = 35,000, giving a maturity of 1,35,000. Quarterly compounding instead returns about 1,41,478 - roughly 6,478 more on the same deposit. The gap comes from interest earning interest each quarter. The longer the tenure and the higher the rate, the wider this gap grows, which is why the compounding frequency matters as much as the headline rate." },
      { t: "h2", s: "Cumulative vs non-cumulative FDs" },
      { t: "p", s: "FDs come in two payout styles, and they grow differently:" },
      { t: "ul", items: [
        "Cumulative FD: interest is reinvested every quarter and paid out as one lump sum at maturity. Because nothing is withdrawn, the full balance keeps compounding - this is the case the formula above describes.",
        "Non-cumulative FD: interest is paid out periodically (monthly, quarterly, half-yearly, or yearly) as income. Since the interest leaves the account, it does not compound, so the total return is lower than a cumulative FD of the same rate and tenure.",
      ]},
      { t: "p", s: "Choose cumulative if you want maximum growth and do not need the cash meanwhile; choose non-cumulative if you want a regular income stream from the deposit." },
      { t: "h2", s: "Taxes and TDS" },
      { t: "p", s: "FD interest is fully taxable as income and is added to your total income for the year at your applicable slab rate. Banks also deduct TDS (tax deducted at source) once your interest from that bank crosses a yearly threshold. TDS is only an advance deduction - it is adjusted against your final tax liability when you file your return, so it is not an extra charge. This is general information, not personal tax advice; rules and thresholds change, so confirm the current ones for your situation." },
      { t: "h2", s: "Senior-citizen rates" },
      { t: "p", s: "Banks usually offer senior citizens a slightly higher FD rate than the standard rate - often around 0.25% to 0.50% more, though it varies by bank and scheme. On a long tenure, even a small rate bump adds up through compounding. To compare a standard rate against a senior rate, plug both into the [FD Calculator](/finance/fd-calculator) and read off the difference in maturity value." },
      { t: "h2", s: "Check your own numbers" },
      { t: "p", s: "Now that you know how is FD interest calculated, you can verify any quote before signing. Enter your principal, rate, and tenure in the [FD Calculator](/finance/fd-calculator) to see the maturity amount and interest instantly, and explore how compounding works more generally with the [Compound Interest Calculator](/finance/compound-interest-calculator). Remember that exact bank methods can vary slightly, so treat the result as a close, reliable estimate." },
    ],
    faqs: [
      { q: "How is FD interest calculated in India?", a: "Most Indian banks compound FD interest quarterly using M = P(1 + r/4)^(4t), where P is the principal, r is the annual rate as a decimal, and t is the tenure in years. The interest earned is M minus P." },
      { q: "What is the difference between cumulative and non-cumulative FDs?", a: "A cumulative FD reinvests interest every quarter and pays the whole amount at maturity, so it compounds. A non-cumulative FD pays interest out periodically, so that interest does not compound and the total return is lower." },
      { q: "Is FD interest taxable?", a: "Yes, FD interest is taxable as income at your slab rate, and banks deduct TDS once interest crosses a yearly threshold. TDS is adjusted against your final tax when you file your return, so it is not an additional charge." },
    ],
  },

  // ---------------------------------------------------------------- IMAGE-CONVERTER
  {
    slug: "png-vs-jpg-vs-webp",
    title: "PNG vs JPG vs WebP",
    h1: "PNG vs JPG vs WebP: Which Image Format Should You Use?",
    desc: "PNG vs JPG vs WebP compared: lossy vs lossless, transparency, file size, and browser support - with a simple guide to choosing the right image format.",
    category: "image",
    tool: { slug: "image-converter", title: "Image Converter" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "PNG, JPG, and WebP are the three image formats you will meet most often on the web, and each one is good at a different job. JPG keeps photographs small, PNG keeps logos and screenshots crisp with transparent backgrounds, and WebP is a newer format that tries to give you the best of both at a smaller file size. This guide explains how the three differ in compression, transparency, file size, and browser support, walks through a quick decision list, and shows what happens when you convert an image from one format to another." },
      { t: "h2", s: "JPG / JPEG: best for photographs" },
      { t: "p", s: "JPG (also written JPEG) uses lossy compression, which means it throws away some image detail in exchange for a much smaller file. For photographs - skies, faces, landscapes, anything with smooth gradients and millions of subtle color shifts - this trade-off is almost invisible to the eye, and the file savings are large. That is why nearly every camera and phone saves photos as JPG by default." },
      { t: "ul", items: [
        "Compression: lossy. Quality drops slightly each time the file is re-saved.",
        "Strength: small files for full-color photographs.",
        "Weakness: no transparency support - the background is always a solid color.",
        "Watch out for: blocky 'artifacts' and fuzzy halos around sharp edges when you compress too hard or push the quality slider too low.",
      ]},
      { t: "p", s: "Because JPG has no transparency and struggles with sharp lines and flat color, it is a poor choice for logos, icons, screenshots, or any image containing text." },
      { t: "h2", s: "PNG: best for graphics, logos, and transparency" },
      { t: "p", s: "PNG uses lossless compression, so it preserves every pixel exactly - nothing is discarded, and re-saving never degrades the image. It also supports an alpha channel, which means parts of the image can be fully or partly transparent. That combination makes PNG ideal for logos that sit on a colored background, icons, app screenshots, and any image with sharp text or fine lines that must stay crisp." },
      { t: "ul", items: [
        "Compression: lossless. Pixel-perfect, no quality loss on re-save.",
        "Strength: transparency (alpha) and razor-sharp edges, text, and flat color.",
        "Weakness: files are usually much larger than JPG for the same photograph.",
        "Best for: logos, icons, screenshots, diagrams, and graphics with hard edges.",
      ]},
      { t: "p", s: "The downside is size. A detailed photo saved as PNG can be several times larger than the same photo as JPG, which is why PNG is the wrong tool for a page full of photographs." },
      { t: "h2", s: "WebP: the modern all-rounder" },
      { t: "p", s: "WebP is a format developed by Google that aims to replace both JPG and PNG. It is unusual because it supports a lossy mode (like JPG) and a lossless mode (like PNG) in the same format. It also handles transparency and even animation. At comparable visual quality, WebP files are typically around 25 to 35 percent smaller than the equivalent JPG or PNG, which can meaningfully speed up a web page." },
      { t: "ul", items: [
        "Compression: both lossy and lossless modes available.",
        "Strength: smaller files than JPG or PNG at similar quality, plus transparency and animation.",
        "Support: now works in all major modern browsers.",
        "Use it when: page speed matters and your audience is on up-to-date browsers.",
      ]},
      { t: "p", s: "As a worked example, imagine a product photo that is 850 KB as a high-quality JPG. The same image saved as WebP at comparable quality might land around 550 to 640 KB - roughly a quarter to a third smaller - with no obvious difference to the eye. Across a whole gallery of images, those savings add up fast." },
      { t: "h2", s: "A quick word on GIF" },
      { t: "p", s: "GIF is an older format still seen mainly for short looping animations. It is limited to a palette of just 256 colors, so it handles photographs poorly and produces large files for what it offers. For animation, WebP (or a short video file) is smaller and far better quality, and for everything else PNG or JPG is the better choice. In short, GIF has largely been superseded." },
      { t: "h2", s: "Which format should you use?" },
      { t: "p", s: "You can decide in seconds by asking two questions: is it a photograph, and does it need a transparent background?" },
      { t: "ul", items: [
        "Photographs with no transparency: use JPG, or WebP for smaller files.",
        "Graphics, logos, icons, or anything needing transparency: use PNG, or WebP.",
        "Smallest possible files on modern browsers: use WebP.",
        "Maximum compatibility (email, old software, anywhere): stick with JPG or PNG.",
      ]},
      { t: "p", s: "When in doubt, JPG for photos and PNG for graphics is a safe default that works everywhere; switch to WebP once you have confirmed page speed is a priority. You can try any of these conversions in the [Image Converter](/image/image-converter) and compare the resulting file sizes yourself." },
      { t: "h2", s: "Converting between formats" },
      { t: "p", s: "Switching formats is easy, but two facts matter. First, converting an image to JPG removes any transparency - the see-through areas get filled in, usually with white - so a logo that looked clean on a colored background will suddenly have a white box around it. If you need transparency, convert to PNG or WebP instead. Second, converting a JPG that has already lost detail into a lossless format like PNG does not bring that detail back; the PNG simply preserves the already-degraded image at a larger size. Lossless conversion protects quality from here on, but it cannot recover what was thrown away earlier." },
      { t: "ol", items: [
        "Open the [Image Converter](/image/image-converter) and upload your file.",
        "Pick the target format based on the decision list above.",
        "Download the result and compare the file size and how it looks against the original.",
      ]},
      { t: "p", s: "If your goal is purely a smaller file rather than a different format, reach for the [Image Compressor](/image/image-compressor), and use the [Image Resizer](/image/image-resizer) when the dimensions are the problem." },
      { t: "h2", s: "The bottom line" },
      { t: "p", s: "There is no single best image format - only the right format for the job. JPG keeps photos small, PNG keeps graphics sharp and supports transparency, and WebP offers smaller files than both at similar quality on modern browsers. Match the format to the content, keep an original copy before any lossy conversion, and when you are ready to switch, run it through the [Image Converter](/image/image-converter) to get the format and file size you need." },
    ],
    faqs: [
      { q: "Is WebP better than JPG and PNG?", a: "WebP usually produces smaller files than JPG or PNG at similar quality - often 25 to 35 percent smaller - and it supports both transparency and animation. It is an excellent default for modern websites, though JPG and PNG still win when you need maximum compatibility with older software." },
      { q: "Does converting an image to JPG remove transparency?", a: "Yes. JPG does not support transparency, so any transparent areas are filled in with a solid color, typically white, during conversion. If you need to keep a transparent background, convert to PNG or WebP instead." },
      { q: "Can I restore quality by converting a JPG to PNG?", a: "No. JPG is a lossy format, so detail discarded during earlier compression is gone for good. Converting to PNG preserves the image exactly as it currently looks but cannot recover lost detail, and it will produce a larger file." },
    ],
  },
  // ---------------------------------------------------------------- UUID-GENERATOR
  {
    slug: "what-is-a-uuid",
    title: "What Is a UUID?",
    h1: "What Is a UUID? Versions, Format and When to Use v4",
    desc: "What is a UUID? Learn the 128-bit UUID format, how version 4 (random) UUIDs work, why collisions are nearly impossible, and when to use them as identifiers.",
    category: "dev",
    tool: { slug: "uuid-generator", title: "UUID Generator" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "A UUID is a Universally Unique Identifier - a 128-bit value used as an ID without any central coordination. This guide explains what a UUID is, how to read the canonical 8-4-4-4-12 format, and what the different versions (v1, v3, v4, v5 and v7) actually mean. It focuses on version 4, the random variety used most often as a general-purpose identifier, and shows why two of them practically never collide. It also covers when a UUID is the right choice over a plain auto-increment integer, the trade-offs involved, and how to generate them in bulk for seeding databases or testing." },
      { t: "h2", s: "What is a UUID?" },
      { t: "p", s: "A UUID (Universally Unique Identifier, sometimes called a GUID on Microsoft platforms) is a 128-bit number designed to be unique across space and time. The key idea is that any machine can generate one independently and trust that it will not clash with a UUID generated anywhere else, without asking a central server or database for the next available value. That property makes UUIDs ideal as identifiers in distributed systems, where coordinating a single shared counter would be slow or impossible." },
      { t: "h2", s: "The UUID format" },
      { t: "p", s: "A UUID is written as 32 hexadecimal digits split into five groups in an 8-4-4-4-12 pattern, separated by four hyphens. Including those hyphens, the canonical text form is 36 characters long. Here is a concrete example:" },
      { t: "ul", items: [
        "550e8400-e29b-41d4-a716-446655440000",
        "Group sizes: 8 digits, then 4, then 4, then 4, then 12 hex digits",
        "Each hex digit encodes 4 bits, so 32 digits = 128 bits total",
        "Lowercase is conventional, but UUIDs are case-insensitive",
      ]},
      { t: "p", s: "Two positions inside the string carry meaning rather than data. The first hex digit of the third group (the 13th hex digit overall) is the version number. The first hex digit of the fourth group is the variant, which for the common layout is typically 8, 9, a, or b. In the example above, the 13th digit is 4 and the fourth group starts with a, so this is a version 4 UUID." },
      { t: "h2", s: "UUID versions" },
      { t: "p", s: "The version digit tells you how the UUID was generated. Each version has a different source of uniqueness:" },
      { t: "ul", items: [
        "v1: based on a timestamp plus a node identifier, traditionally the machine's MAC address.",
        "v3: name-based, hashing a namespace and a name with MD5 to produce a deterministic UUID.",
        "v5: name-based like v3, but using SHA-1 instead of MD5.",
        "v4: random - almost all of the bits are filled from a random source.",
        "v7: a newer version that is ordered by Unix time, combining a timestamp prefix with random bits so the values sort by creation order.",
      ]},
      { t: "p", s: "The name-based versions (v3 and v5) are deterministic: the same namespace and name always produce the same UUID, which is handy for generating stable IDs from existing keys. If you want to experiment with the underlying digests those versions rely on, see the [Hash Generator](/dev/hash-generator)." },
      { t: "h2", s: "How version 4 works and why collisions are nearly impossible" },
      { t: "p", s: "A version 4 UUID is essentially random. After the version and variant bits are fixed in place, 122 bits remain and are filled from a random source. That leaves an enormous space of possible values. The chance that two independently generated v4 UUIDs happen to be identical is negligible for any realistic workload." },
      { t: "p", s: "To put the scale in perspective: you would need to generate on the order of 2.71 quintillion v4 UUIDs before there was even a 50 percent chance of a single collision among them. For an application creating thousands or millions of IDs, the practical collision risk rounds to zero, which is why v4 is the default choice when you just need a unique identifier and do not care about ordering." },
      { t: "h2", s: "When to use a UUID" },
      { t: "p", s: "UUIDs shine wherever you cannot or do not want to rely on a central authority to hand out IDs. Common situations include:" },
      { t: "ul", items: [
        "Distributed systems where multiple services or nodes each mint their own IDs.",
        "Primary keys generated on the client before a row is ever sent to the database.",
        "Merging datasets from separate sources without ID collisions between them.",
        "Public-facing identifiers in URLs or APIs that do not leak how many records exist, unlike sequential integers that reveal counts and order.",
      ]},
      { t: "h2", s: "Trade-offs versus auto-increment integers" },
      { t: "p", s: "UUIDs are not free. Compared with a plain auto-increment integer, they cost more storage and can hurt database performance in specific ways:" },
      { t: "ul", items: [
        "Size: a UUID is 16 bytes, larger than a typical 4- or 8-byte integer, which adds up across big tables and every index that references the key.",
        "Ordering: a v4 UUID is random, so it is not naturally sortable by creation time the way an incrementing integer is.",
        "Index locality: because new v4 values land in random positions, inserts cause more scattered index access rather than appending neatly at the end.",
      ]},
      { t: "p", s: "If creation-time ordering and index locality matter to you, a time-ordered version such as v7 narrows the gap while keeping the no-coordination benefit. For many applications, though, the simplicity and independence of v4 outweigh the costs." },
      { t: "h2", s: "How to generate UUIDs in bulk" },
      { t: "p", s: "When you need many IDs at once - for seeding a database, generating test fixtures, or filling a spreadsheet column - generating them one at a time is tedious. The Zenoply [UUID Generator](/dev/uuid-generator) produces version 4 UUIDs in bulk, and it runs locally in your browser so the values never leave your machine." },
      { t: "ol", items: [
        "Open the [UUID Generator](/dev/uuid-generator).",
        "Enter how many UUIDs you want to create.",
        "Generate the batch - each one is a fresh random v4 value.",
        "Copy the list and paste it wherever you need the identifiers.",
      ]},
      { t: "p", s: "That covers what a UUID is, how to read its format, what the versions mean, and when v4 is the right tool. When you are ready to create some, head to the [UUID Generator](/dev/uuid-generator) and produce as many v4 UUIDs as you need, instantly and privately in the browser." },
    ],
    faqs: [
      { q: "What is the difference between a UUID and a GUID?", a: "They are the same 128-bit identifier concept; GUID (Globally Unique Identifier) is the name Microsoft platforms use for it. The format and the goal of uniqueness without central coordination are identical." },
      { q: "Which UUID version should I use?", a: "Use version 4 (random) when you just need a unique identifier and do not care about ordering, which covers most cases. Choose v3 or v5 when you need a deterministic ID derived from a name, or v7 when you want IDs that sort by creation time." },
      { q: "Can two version 4 UUIDs ever be the same?", a: "In theory yes, but in practice no. A v4 UUID has 122 random bits, and you would need around 2.71 quintillion of them before there was even a 50 percent chance of a single collision, so the risk is negligible for any real application." },
    ],
  },

  // ---------------------------------------------------------------- URL-ENCODER
  {
    slug: "what-is-url-encoding",
    title: "What Is URL Encoding?",
    h1: "URL Encoding Explained: What Percent-Encoding Does",
    desc: "What is URL encoding? Learn how percent-encoding escapes spaces and special characters in URLs, which characters are reserved, and when to encode.",
    category: "dev",
    tool: { slug: "url-encoder", title: "URL Encoder / Decoder" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "URL encoding, also called percent-encoding, is the standard way to safely place text inside a web address. URLs can only contain a limited set of ASCII characters, and several characters such as / ? # and & already carry special structural meaning. This guide explains what URL encoding is, why URLs need it, how percent-encoding turns each unsafe byte into a %XX sequence, which characters are reserved versus unreserved, the difference between %20 and a plus sign, when to use encodeURIComponent versus encodeURI, and the common pitfalls like double-encoding. You can test any string with the [URL Encoder / Decoder](/dev/url-encoder) as you read." },
      { t: "h2", s: "What is URL encoding?" },
      { t: "p", s: "URL encoding is a method of escaping characters so that arbitrary text can be carried inside a URL without breaking it. When a character is not allowed in a particular part of a URL - or when it would be misread as part of the URL's structure - it is replaced with a percent sign followed by two hexadecimal digits. For example, a space is not allowed directly in a URL, so it is written as %20. The process is fully reversible: decoding turns %20 back into a space. Importantly, URL encoding is not encryption. Anyone can decode it, so it provides no secrecy or security - it only makes text safe to transmit." },
      { t: "h2", s: "Why URLs need encoding" },
      { t: "p", s: "A URL is parsed by browsers, servers, and proxies that all rely on a small, agreed-upon set of ASCII characters. Two problems arise without encoding. First, many characters - spaces, accented letters, emoji, and most non-English text - are simply not part of the allowed URL character set. Second, certain ASCII characters are reserved because they delimit parts of the URL: a ? starts the query string, a # starts the fragment, an & separates query parameters, and a / separates path segments. If you want one of those characters to be literal data rather than a delimiter, you must encode it so the parser does not act on its special meaning." },
      { t: "h2", s: "How percent-encoding works" },
      { t: "p", s: "Percent-encoding operates on bytes, not on characters directly. Each byte that needs escaping is written as %XX, where XX is that byte's value in hexadecimal. For plain ASCII the byte maps to one character, so a space (byte 0x20) becomes %20 and an at-sign (byte 0x40) becomes %40. For non-ASCII text, the character is first converted to its UTF-8 byte sequence, and then each of those bytes is written as its own %XX. For example, the euro currency name character is three UTF-8 bytes, so it appears as three percent groups in a row. This is why a single accented letter can expand into two or more %XX sequences." },
      { t: "h2", s: "Reserved vs unreserved characters" },
      { t: "p", s: "Characters fall into two groups. Unreserved characters are always safe and are never encoded; reserved characters have structural meaning and must be encoded when you want them treated as literal data." },
      { t: "ul", items: [
        "Unreserved (never encoded): A-Z, a-z, 0-9, hyphen ( - ), underscore ( _ ), period ( . ), and tilde ( ~ ).",
        "Reserved (encode when used as literal data): : / ? # [ ] @ ! $ & ' ( ) * + , ; =",
        "A reserved character left unencoded is interpreted as part of the URL structure - for instance, a literal & inside a value would split it into two parameters.",
      ]},
      { t: "h2", s: "Spaces: %20 vs plus" },
      { t: "p", s: "Spaces are a frequent source of confusion because they have two valid encodings depending on context. In a URL path or a generic component, a space becomes %20. In query data submitted as a form - the application/x-www-form-urlencoded format used by HTML forms - a space is commonly written as a plus sign ( + ) instead. Both represent a space, but they are not interchangeable in every position. A literal plus sign in form-encoded data must itself be encoded as %2B so it is not mistaken for a space. When in doubt, %20 is the safer, more universal choice." },
      { t: "h2", s: "How to encode a value the right way" },
      { t: "p", s: "JavaScript provides two functions, and choosing the wrong one is a common mistake. Use encodeURIComponent for a single piece of data, such as one query parameter value or one path segment; it encodes aggressively, escaping reserved characters like / ? # & = so the value cannot disturb the surrounding URL. Use encodeURI only when you have an entire, already-structured URL and just need to escape stray illegal characters; it deliberately leaves reserved structural characters unescaped so the URL still works. The reliable workflow is short:" },
      { t: "ol", items: [
        "Identify the single value you need to insert, such as a search term or a path segment.",
        "Run that value through encodeURIComponent (or paste it into the URL Encoder / Decoder) to escape every reserved character.",
        "Build the rest of the URL as plain text, keeping the structural :, /, ?, #, and & intact.",
        "Drop the encoded value into place, and decode it once to confirm the round trip returns your original text.",
      ]},
      { t: "h2", s: "Common pitfalls" },
      { t: "p", s: "Two mistakes account for most broken links. Double-encoding happens when you encode text that was already encoded, turning a percent sign into %25 and producing values like %2520 where you meant %20. The fix is to encode each value exactly once, at the point where you build the URL. The second pitfall is encoding a whole URL when you only meant to encode one parameter value - this escapes the :, /, ?, and & that the URL needs to function, leaving a string that no longer points anywhere. Encode the individual value, then place it into the otherwise plain URL." },
      { t: "h2", s: "Try it yourself" },
      { t: "p", s: "The quickest way to understand percent-encoding is to experiment. Paste a string with spaces, ampersands, or non-English text into the [URL Encoder / Decoder](/dev/url-encoder) and watch each character convert to its %XX form, then decode it back to confirm the round trip. If you also work with data that needs to travel as text but is not encryption, see [What Is Base64 Encoding?](/guides/what-is-base64-encoding) for a related transformation. Bookmark the [URL Encoder / Decoder](/dev/url-encoder) for the next time a link breaks on a stray special character." },
    ],
    faqs: [
      { q: "Is URL encoding the same as encryption?", a: "No. URL encoding is a reversible transformation that anyone can decode, so it provides no secrecy or security. It only makes text safe to place inside a URL." },
      { q: "Why does a space sometimes appear as %20 and sometimes as a plus sign?", a: "In a URL path or generic component a space is encoded as %20, while in form-encoded query data (application/x-www-form-urlencoded) a space is commonly written as a plus sign. Both mean a space, but %20 is the more universal choice." },
      { q: "Should I use encodeURIComponent or encodeURI?", a: "Use encodeURIComponent for a single value such as one query parameter or path segment, since it escapes reserved characters too. Use encodeURI only for an entire, already-structured URL where you want the reserved characters left intact." },
    ],
  },

  // ---------------------------------------------------------------- PASSPORT-PHOTO-MAKER
  {
    slug: "how-to-make-a-passport-photo-at-home",
    title: "How to Make a Passport Photo at Home",
    h1: "How to Make a Passport Photo at Home (Free)",
    desc: "How to make a passport photo at home for free. Take the right photo, crop it to your country size at 300 DPI, then print or upload it and meet the rules.",
    category: "image",
    tool: { slug: "passport-photo-maker", title: "Passport Photo Maker" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "Making a passport photo at home is straightforward once you understand the two things that matter: the exact print SIZE your country requires, and the composition rules around background, lighting, expression and head position. This guide walks you through both. You will take a good source photo with your phone or camera, then use the free [Passport Photo Maker](/image/passport-photo-maker) to crop and size it to the right country preset at 300 DPI print quality. Finally, you will either print the result on photo paper or upload the file to an online application. By the end you will have a correctly sized photo ready to submit." },
      { t: "h2", s: "What makes a passport photo valid" },
      { t: "p", s: "A compliant passport or visa photo has to satisfy two separate requirements, and it is easy to nail one while failing the other. The first is the SIZE: every country specifies an exact dimension, such as 2x2 in for the US or 35x45 mm for India, the UK and the Schengen area. The second is composition: rules about the background, your expression, your eyes, whether you can wear glasses or a hat, and how much of the frame your head should fill." },
      { t: "p", s: "The Passport Photo Maker handles the SIZE part for you by cropping to country presets and exporting at print resolution. The composition rules, however, depend on the source photo you take - so it is worth getting that right before you crop." },
      { t: "h2", s: "Step 1 - Take a good source photo" },
      { t: "p", s: "Use a phone or camera and aim for a clean, well-lit shot. A second person taking the photo usually beats a selfie, because it keeps the camera level and at a natural distance. Follow these points:" },
      { t: "ul", items: [
        "Stand in front of a plain, light or white wall with no patterns, posters or shadows behind you.",
        "Use even, front-facing lighting so there are no harsh shadows on your face or the wall.",
        "Keep a neutral expression with your mouth closed - no big smile.",
        "Keep both eyes open and look straight at the camera.",
        "Face the camera squarely with your head level, not tilted or turned.",
        "Remove hats and head coverings unless worn for religious reasons, and ideally remove glasses (many countries now require this).",
        "Fill the frame with your head and the top of your shoulders, leaving a little space above your hair.",
      ]},
      { t: "p", s: "Take a few versions and pick the sharpest, most evenly lit one. A clean source photo makes the next step much easier and gives you a result you can actually submit." },
      { t: "h2", s: "Step 2 - Crop it to the right size with the tool" },
      { t: "p", s: "Once you have a good photo, the [Passport Photo Maker](/image/passport-photo-maker) does the precise cropping and sizing. Here is the process:" },
      { t: "ol", items: [
        "Open the Passport Photo Maker and upload your source photo.",
        "Pick your country or visa preset, for example US 2x2 in or India 35x45 mm.",
        "Position and zoom your face within the on-screen frame so your head sits where the guide indicates.",
        "Confirm the crop - the tool outputs the image at 300 DPI, which is print quality for passport photos.",
        "Download the finished file to print or upload.",
      ]},
      { t: "p", s: "Because the output is locked to the preset dimensions and resolution, you do not have to do any math on pixels or DPI yourself. You simply frame your face and download." },
      { t: "h2", s: "Common sizes at a glance" },
      { t: "p", s: "Passport and visa dimensions vary by country. These are the sizes available as presets in the tool:" },
      { t: "ul", items: [
        "US passport/visa: 2x2 in (51x51 mm)",
        "India: 35x45 mm",
        "UK: 35x45 mm",
        "Schengen / EU: 35x45 mm",
        "Canada: 50x70 mm",
        "China: 33x48 mm",
      ]},
      { t: "p", s: "If your country is not listed or has a special visa format, check its official requirements before you submit, since dimensions and head-height rules can differ even when the overall size looks the same." },
      { t: "h2", s: "Composition rules you must meet yourself" },
      { t: "p", s: "This is the important caveat: the tool sizes and crops your photo, but it does not check or enforce your background, lighting, expression, glasses or how much of the frame your head fills. Those parts are on you, and the exact thresholds vary by country. For example, the US specifies a head height range measured from chin to crown, while the UK and Schengen countries measure the visible face height differently." },
      { t: "p", s: "Typical composition rules across countries include a plain light background, a neutral expression with eyes open, facing the camera, even lighting with no shadows, usually no hat, and increasingly no glasses. Treat the list in Step 1 as your checklist, and verify the specifics against your country's official guidance before you rely on the photo." },
      { t: "h2", s: "Printing vs uploading" },
      { t: "p", s: "Once you have the downloaded file, you have two paths. To get physical prints, print on photo paper - many people fit several copies onto a single 4x6 print at a photo kiosk or home printer to save paper. For online applications, you usually just upload the file directly." },
      { t: "p", s: "Some online portals enforce a maximum file size or specific dimensions for uploads. If your file is too large, run it through the [Image Compressor](/image/image-compressor) to reduce the file size, or use the [Image Resizer](/image/image-resizer) if you need different pixel dimensions for a particular form. Keep the original full-quality download in case you need to reprint later." },
      { t: "h2", s: "An important note before you submit" },
      { t: "p", s: "The Passport Photo Maker is a free helper for cropping and sizing - it is not an official government service and does not guarantee acceptance. Requirements change and differ between countries and between passport, visa and ID documents. Always confirm the current, exact specifications on your country's official passport or visa website before submitting. When you are ready to size your photo, open the [Passport Photo Maker](/image/passport-photo-maker), pick your preset, frame your face and download a 300 DPI photo in seconds - then print it or upload it with confidence." },
    ],
    faqs: [
      { q: "Does the Passport Photo Maker check my background and expression?", a: "No. The tool crops and sizes your photo to the country preset and outputs at 300 DPI, but it does not evaluate your background, lighting, expression, glasses or head proportion. You are responsible for meeting those composition rules in your source photo, and they vary by country." },
      { q: "What size should a passport photo be?", a: "It depends on the country. Common sizes include US 2x2 in (51x51 mm), India, UK and Schengen/EU at 35x45 mm, Canada at 50x70 mm, and China at 33x48 mm. Pick the matching preset in the tool, or check your country's official requirements." },
      { q: "Can I use this photo for an official passport application?", a: "You can use the output as your photo, but this is not an official service and does not guarantee acceptance. Always confirm the exact, current requirements on your country's official passport or visa website before you submit." },
    ],
  },

  // ---------------------------------------------------------------- JPG-TO-PDF
  {
    slug: "how-to-convert-jpg-to-pdf",
    title: "How to Convert JPG to PDF",
    h1: "How to Convert JPG to PDF (Free, No Upload)",
    desc: "How to convert JPG to PDF online for free. Combine JPG or PNG images into one PDF, set the page order and fit, then download - all in your browser, no upload.",
    category: "pdf",
    tool: { slug: "jpg-to-pdf", title: "JPG to PDF" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "This guide explains how to convert JPG to PDF online for free, turning one or many images into a single shareable PDF document. You will learn why a PDF is often a better way to send images than a loose set of files, how to add and reorder your pictures, and how the fit option changes the way each image sits on the page. The whole process runs in your browser using the [JPG to PDF](/pdf/jpg-to-pdf) tool, so nothing is uploaded to a server. It works with JPG and PNG images and produces one combined PDF you can download in a few seconds." },
      { t: "h2", s: "Why convert images to PDF" },
      { t: "p", s: "A PDF wraps your images into one file with a fixed layout, which makes it easier to share and harder to scramble. Instead of attaching five separate photos to an email, you send one document where the pages stay in the order you set. PDFs also open the same way on almost any device, so the recipient sees what you intended without needing an image viewer." },
      { t: "p", s: "Common reasons people convert images to PDF include:" },
      { t: "ul", items: [
        "Receipts and invoices you want to file or submit as a single document",
        "Scanned pages or photos of paperwork that belong together",
        "Photos of an ID, passport, or card for an application",
        "A set of product or property photos sent as one tidy file",
      ]},
      { t: "h2", s: "How to convert JPG to PDF" },
      { t: "p", s: "The conversion takes only a few steps. Follow this order to add your images, arrange the pages, and download the finished PDF:" },
      { t: "ol", items: [
        "Open the [JPG to PDF](/pdf/jpg-to-pdf) tool in your browser.",
        "Add your images - select one or more JPG or PNG files from your device.",
        "Reorder them using the Up and Down buttons until the pages are in the order you want.",
        "Choose the fit option: Fit to A4 page, or match each image's own dimensions.",
        "Click convert to build the combined PDF.",
        "Download the PDF and save it to your device.",
      ]},
      { t: "p", s: "If you picked the wrong file or want a different sequence, you can adjust the list before converting - there is no need to start over." },
      { t: "h2", s: "Each image becomes a page" },
      { t: "p", s: "Every image you add becomes one page in the output PDF, and the order shown in the tool is the page order. The first image in the list is page one, the second image is page two, and so on. So if you are scanning a two-page letter as two photos, make sure the page you want first sits at the top of the list before you convert." },
      { t: "h2", s: "Fit to A4 vs match the image" },
      { t: "p", s: "The fit toggle controls how each image is placed on its page, and the right choice depends on what you are making." },
      { t: "ul", items: [
        "Fit to A4 page centres each image on an A4-size page. This keeps every page the same standard size, which is ideal for documents you might print or for a consistent-looking set of receipts and scans.",
        "Match the image makes each page exactly the image's own dimensions. The page is sized to the picture, with no surrounding margin, which suits photo sets or single images where you do not want extra whitespace.",
      ]},
      { t: "p", s: "As a concrete example, a tall phone photo placed with Fit to A4 will sit centred on an upright A4 page with white space on the sides, while the match-the-image option produces a page shaped like the photo itself." },
      { t: "h2", s: "Reordering and removing images before converting" },
      { t: "p", s: "Before you convert, the tool shows your images as a list so you can fine-tune the result. Use the Up and Down buttons to move an image earlier or later in the sequence - that position becomes its page number in the PDF. If you added a file by mistake, or you only want some of the images, you can remove an image from the list so it is left out of the final document. Get the list exactly right first, then convert, and the PDF will match what you see." },
      { t: "h2", s: "Privacy: nothing is uploaded" },
      { t: "p", s: "The conversion runs entirely in your browser. Your images are read and assembled into a PDF on your own device, and nothing is uploaded to a server during the process. That makes the tool a good fit for sensitive material such as IDs, passports, and personal scans, because the files never leave your computer or phone. When you close the tab, there is no copy left behind on a remote service." },
      { t: "h2", s: "Related tools" },
      { t: "p", s: "If you need to go the other way and pull images out of a PDF, use [PDF to JPG](/pdf/pdf-to-jpg) to save each page as a picture. If you already have several PDF files and want to join them into one, [Merge PDF](/pdf/merge-pdf) combines them while keeping your chosen order. These pair well with image-to-PDF conversion when you are assembling a complete document set." },
      { t: "h2", s: "Convert your images now" },
      { t: "p", s: "Converting JPG to PDF takes under a minute: add your JPG or PNG images, arrange the pages with the Up and Down buttons, pick Fit to A4 or match the image, then download. Open the free [JPG to PDF](/pdf/jpg-to-pdf) tool to combine your images into a single PDF in your browser, with no upload and no sign-up required." },
    ],
    faqs: [
      { q: "Can I combine multiple JPG images into one PDF?", a: "Yes. Add all the images you want and the tool turns each one into a page of a single PDF. The order shown in the list is the order of the pages, which you can adjust with the Up and Down buttons before converting." },
      { q: "Does converting JPG to PDF upload my files anywhere?", a: "No. The conversion runs entirely in your browser, so your images are assembled into a PDF on your own device and nothing is uploaded to a server. That makes it safe for IDs and other personal scans." },
      { q: "What is the difference between Fit to A4 and matching the image?", a: "Fit to A4 page centres each image on a standard A4-size page, which is good for printing and consistent documents. The match option makes each page exactly the image's own dimensions, with no surrounding margin, which suits photo sets." },
    ],
  },

  // ---------------------------------------------------------------- PDF-TO-JPG
  {
    slug: "how-to-convert-pdf-to-jpg",
    title: "How to Convert PDF to JPG",
    h1: "How to Convert PDF to JPG (or PNG)",
    desc: "How to convert PDF to JPG online for free: turn each PDF page into a high-quality JPG or PNG image right in your browser, pick the resolution, and download.",
    category: "pdf",
    tool: { slug: "pdf-to-jpg", title: "PDF to JPG" },
    updated: "2026-06-25",
    body: [
      { t: "p", s: "This guide explains how to convert a PDF into image files - one JPG or PNG per page - using the free [PDF to JPG](/pdf/pdf-to-jpg) tool. It covers why you might want images instead of a PDF, the practical difference between JPG and PNG output, how the resolution or scale setting affects sharpness and file size, and the exact steps to run a conversion. It also explains that each page becomes its own image and that everything happens in your browser, so your file is never uploaded. By the end you will know which format and resolution to pick for printing, sharing, or embedding a page somewhere else." },
      { t: "h2", s: "Why convert a PDF to images" },
      { t: "p", s: "A PDF is great for documents, but sometimes a plain image is more useful. Converting a page to a JPG or PNG lets you drop it almost anywhere without needing a PDF reader at all." },
      { t: "ul", items: [
        "Embed a single page inside a Word document, slide deck, or web page where a PDF would not display inline.",
        "Share one page with anyone - an image opens instantly on any phone or computer, no PDF app required.",
        "Create thumbnails or previews of a document for a gallery, listing, or social post.",
        "Pull out a chart, diagram, or signature page as a standalone picture you can crop or annotate.",
      ]},
      { t: "h2", s: "JPG vs PNG output" },
      { t: "p", s: "The tool can render each page as either a JPG (JPEG) or a PNG, and the right choice depends on what is on the page. JPG is smaller because it uses lossy compression, which works well for photographic or color-rich pages but can add faint smudging around sharp text and thin lines. PNG is lossless, so it keeps text crisp and edges clean, and it supports transparency - but the files are larger than the equivalent JPG. The difference is most visible on tables and small fonts, where lossy compression tends to soften the strokes." },
      { t: "ul", items: [
        "Choose JPG for pages that are mostly photos, scans, or full-color artwork, and when you want the smallest files.",
        "Choose PNG for pages with text, tables, line drawings, screenshots, or anything where sharp edges matter, or when you need a transparent background.",
      ]},
      { t: "p", s: "As a rule of thumb: text-heavy page, pick PNG; photo-heavy page, pick JPG. If you are unsure which format fits a given image overall, the [PNG vs JPG vs WebP](/guides/png-vs-jpg-vs-webp) guide walks through the trade-offs in more detail." },
      { t: "h2", s: "Resolution and scale" },
      { t: "p", s: "The scale (or resolution) setting controls how large and detailed each rendered image is. A higher scale renders each page with more pixels, so it looks sharper when printed or zoomed, but it also produces a bigger file. A lower scale is fine for quick on-screen previews and thumbnails. The default is around 2x, which is a good balance for most uses. If a page looks blurry after exporting, raise the scale and convert again rather than enlarging the saved image afterward, since scaling up a finished JPG or PNG only stretches the existing pixels." },
      { t: "ul", items: [
        "Use the default (around 2x) for general sharing and embedding.",
        "Increase the scale when you plan to print the page or zoom in closely and want crisp detail.",
        "Decrease the scale for lightweight thumbnails or when you need many small files quickly.",
      ]},
      { t: "h2", s: "How to convert PDF to JPG" },
      { t: "p", s: "The whole process takes a few clicks. Here is the step-by-step:" },
      { t: "ol", items: [
        "Open the [PDF to JPG](/pdf/pdf-to-jpg) tool in your browser.",
        "Load your PDF by selecting it from your device.",
        "Choose your output format - JPG for smaller, photo-friendly files, or PNG for crisp text and transparency.",
        "Set the resolution or scale (leave it near 2x, or raise it for printing and zooming).",
        "Click convert and let the tool render each page to an image.",
        "Download the resulting page images - one file per page - to your device.",
      ]},
      { t: "h2", s: "Each page becomes its own image" },
      { t: "p", s: "The tool processes a PDF page by page, so a five-page document produces five separate image files rather than one combined picture. For example, a three-page report exported as PNG gives you three PNG files, one for each page, which you can then place individually wherever you need them. This also means you can keep only the pages you actually want and discard the rest. If you later want to recombine images into a single document, the [JPG to PDF](/pdf/jpg-to-pdf) tool does the reverse - it bundles multiple images back into one PDF." },
      { t: "h2", s: "Privacy: it runs in your browser" },
      { t: "p", s: "The conversion happens entirely on your own device. The tool renders each PDF page to an image locally in the browser, so your file is never uploaded to a server. That makes it a safe choice for contracts, statements, IDs, and any other document you would rather not send across the internet. Because nothing leaves your machine, the only limit on size or page count is your device's own memory and speed." },
      { t: "h2", s: "Convert your PDF now" },
      { t: "p", s: "Pick the format that matches your page - JPG for photos, PNG for text and line art - choose a resolution, and let the tool turn every page into a ready-to-use image. Open the [PDF to JPG](/pdf/pdf-to-jpg) tool to convert your PDF to JPG or PNG in seconds, right in your browser and with no upload." },
    ],
    faqs: [
      { q: "Should I choose JPG or PNG?", a: "Choose JPG for photographic or color-rich pages where you want smaller files, since it uses lossy compression. Choose PNG for pages with text, tables, or sharp lines because it is lossless and keeps edges crisp, and it also supports transparency." },
      { q: "Does converting a PDF to JPG upload my file?", a: "No. The tool renders each page to an image directly in your browser using your device, so the PDF is never uploaded to a server. This keeps sensitive documents private." },
      { q: "Will a multi-page PDF become one image or several?", a: "Each page becomes its own image file. A five-page PDF produces five separate images, so you can use or share individual pages. To combine images back into a single document, use the JPG to PDF tool." },
    ],
  },

  // ---------------------------------------------------------------- EPOCH-CONVERTER
  {
    slug: "what-is-a-unix-timestamp",
    title: "What Is a Unix Timestamp?",
    h1: "What Is a Unix Timestamp? Epoch Time Explained",
    desc: "What is a Unix timestamp? Learn how epoch time counts seconds from 1 January 1970 UTC, why timestamps are in UTC, seconds vs milliseconds, and the Year 2038 problem.",
    category: "convert",
    tool: { slug: "epoch-converter", title: "Unix Timestamp Converter" },
    updated: "2026-06-26",
    body: [
      { t: "p", s: "A Unix timestamp is a single number that represents a moment in time as the count of seconds that have elapsed since a fixed starting point. That starting point - midnight on 1 January 1970, in Coordinated Universal Time (UTC) - is called the Unix epoch, which is why the value is also known as epoch time or POSIX time. Instead of juggling years, months, days, hours and timezones, a computer can store any instant as one plain integer. This guide explains what a Unix timestamp is, why it is so widely used, the difference between seconds and milliseconds, why it is always in UTC, and the famous Year 2038 problem." },

      { t: "h2", s: "The Unix epoch: zero seconds" },
      { t: "p", s: "By definition, the timestamp 0 is exactly midnight (00:00:00) UTC on 1 January 1970. Every moment after that is a positive number of seconds, and every moment before it is a negative number. So a timestamp of 60 is one minute past the epoch, 3600 is one hour past it, and 86400 - the number of seconds in a day - is midnight on 2 January 1970. This single, agreed reference point is what lets two machines anywhere in the world describe the same instant with the same number." },

      { t: "h2", s: "Why computers count time this way" },
      { t: "p", s: "Storing time as one integer is enormously convenient. Comparing two moments becomes simple arithmetic - the later instant is just the larger number - and finding the gap between two events is a subtraction. There are no month lengths, leap-year rules or timezone offsets to reason about while doing the maths. Timestamps sort naturally, take very little space, and are unambiguous, which is why they appear throughout computing:" },
      { t: "ul", items: [
        "Databases store created-at and updated-at columns as timestamps.",
        "Log files and events are stamped with epoch time so they sort in order.",
        "JSON Web Tokens (JWTs) express their iat (issued-at) and exp (expiry) claims as Unix timestamps - see [What's Inside a JWT?](/guides/what-is-inside-a-jwt).",
        "File systems, version control and APIs use them to record exactly when something happened.",
      ]},

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take the timestamp 1700000000. To read it, you work out how far it is from the epoch. That value lands on Tuesday, 14 November 2023 at 22:13:20 UTC. You can confirm it instantly by pasting 1700000000 into the [Unix Timestamp Converter](/convert/epoch-converter), which shows the moment in UTC, your own local time, and the ISO 8601 format all at once." },
      { t: "p", s: "The conversion the other way works just as well: give the converter a date and it returns the matching integer. Because the number is just a count of seconds, adding 86400 to any timestamp moves it forward exactly one day, and subtracting 3600 moves it back one hour - no calendar logic required." },

      { t: "h2", s: "Seconds vs milliseconds" },
      { t: "p", s: "Here is the detail that trips people up most often. The classic Unix timestamp counts seconds, but many programming environments - JavaScript most notably - count milliseconds (thousandths of a second) instead. The same instant therefore has two common representations:" },
      { t: "ul", items: [
        "In seconds: 1700000000",
        "In milliseconds: 1700000000000",
      ]},
      { t: "p", s: "The millisecond value is simply the second value multiplied by 1,000, so it has three extra digits. If a timestamp ever decodes to a date far in the distant future - thousands of years away - you have almost certainly fed a milliseconds value into something expecting seconds, or vice versa. A quick way to tell them apart today: a seconds timestamp for a recent date has 10 digits, while a milliseconds timestamp has 13. The [Unix Timestamp Converter](/convert/epoch-converter) detects which unit you have entered from its size, so you do not have to guess." },

      { t: "h2", s: "Unix time is always UTC" },
      { t: "p", s: "A Unix timestamp has no timezone of its own - it always refers to UTC. This is a feature, not a limitation. The number 1700000000 means the very same instant whether it is read in Tokyo, London or New York; only the human-readable wall-clock time differs once you apply a local timezone offset. That is exactly why systems store the timestamp and convert to local time only for display: it removes any ambiguity about which moment is meant. When you see a timestamp turned into a date, the conversion to your local time happens at the moment of display, not in the stored value itself." },
      { t: "p", s: "It is worth noting that Unix time also ignores leap seconds - the occasional one-second adjustments made to civil time. It assumes every day is exactly 86,400 seconds long, which keeps the arithmetic clean at the cost of not tracking those rare corrections precisely. For almost all everyday purposes this simplification is invisible and harmless." },

      { t: "h2", s: "The Year 2038 problem" },
      { t: "p", s: "Many older systems store Unix timestamps in a signed 32-bit integer, which can hold a maximum value of 2,147,483,647. Count that many seconds from the epoch and you arrive at 03:14:07 UTC on 19 January 2038. One second later, the counter overflows and wraps around to a large negative number, which those systems would interpret as a date back in December 1901. This is the Year 2038 problem - the modern echo of the Year 2000 bug." },
      { t: "p", s: "The fix is already widespread: moving to 64-bit integers for time, which pushes the overflow point hundreds of billions of years into the future - far longer than the age of the universe. Most current operating systems, languages and databases have made this switch, so the risk now sits mainly with old embedded devices and legacy code that still use 32-bit time and have not been updated." },

      { t: "h2", s: "Negative timestamps and dates before 1970" },
      { t: "p", s: "Because the epoch is a fixed midpoint rather than the beginning of time, dates before 1 January 1970 are perfectly valid - they are simply negative timestamps. A value of -86400 is one day before the epoch, 31 December 1969, and larger negative numbers reach further back. Not every tool or language supports negative timestamps equally well, so historical dates are sometimes handled by other means, but conceptually the number line of Unix time extends in both directions from zero." },

      { t: "h2", s: "Reading and creating timestamps" },
      { t: "p", s: "Whenever you meet a bare number where a date should be - in a log line, an API response, a database row or a decoded token - the quickest way to make sense of it is to convert it. Drop the value into the [Unix Timestamp Converter](/convert/epoch-converter) to see the UTC time, your local time and the ISO 8601 string side by side, and use the same tool in reverse to turn a calendar date into the integer a system expects. Once you are comfortable that it is just a count of seconds from a fixed point, epoch time stops looking cryptic and becomes one of the simplest, most reliable ways to handle time in software." },
    ],
    faqs: [
      { q: "What is a Unix timestamp?", a: "A Unix timestamp is the number of seconds that have elapsed since the Unix epoch - midnight UTC on 1 January 1970. It represents any moment in time as a single integer, which makes comparing and storing times simple and unambiguous." },
      { q: "Why is my Unix timestamp in milliseconds?", a: "Some environments, notably JavaScript, count milliseconds instead of seconds, so the value is 1,000 times larger and has three extra digits (13 digits rather than 10 for a recent date). Divide a milliseconds value by 1,000 to get the standard seconds timestamp." },
      { q: "What is the Year 2038 problem?", a: "Systems that store Unix time in a signed 32-bit integer can only count up to 03:14:07 UTC on 19 January 2038, after which the value overflows into a negative number and the date is misread. The fix is to use 64-bit integers, which most modern systems already do." },
    ],
  },
  {
    slug: "how-is-ppf-interest-calculated",
    title: "How Is PPF Interest Calculated?",
    h1: "How Is PPF Interest Calculated? The Formula, Rules and a Worked Example",
    desc: "How is PPF interest calculated? Understand the Public Provident Fund annual compounding formula, the monthly-balance rule, the 15-year tenure and tax benefits, with a worked example.",
    category: "finance",
    tool: { slug: "ppf-calculator", title: "PPF Calculator" },
    updated: "2026-06-27",
    body: [
      { t: "p", s: "The Public Provident Fund (PPF) is one of India's most popular long-term savings schemes - a government-backed account that pays a fixed, tax-free rate of interest and locks your money away for 15 years. Its appeal is simple: guaranteed returns, complete safety of capital, and a tax treatment that few other instruments can match. But the way the interest is actually worked out trips a lot of people up, because it depends not just on how much you put in but on when in the month you put it in. This guide explains exactly how PPF interest is calculated, walks through a full worked example, and shows how the [PPF Calculator](/finance/ppf-calculator) does the arithmetic for you." },
      { t: "h2", s: "The basic PPF formula" },
      { t: "p", s: "If you deposit the same amount at the start of every financial year and let the interest compound annually, the maturity value follows the standard annuity-due formula:" },
      { t: "p", s: "M = P x [((1 + i)^n - 1) / i] x (1 + i)" },
      { t: "p", s: "Where:" },
      { t: "ul", items: [
        "P is the amount you deposit each year.",
        "i is the annual interest rate as a decimal - 7.1% is 0.071.",
        "n is the number of years - the base PPF tenure is 15.",
      ] },
      { t: "p", s: "The trailing (1 + i) is there because each year's deposit is made at the start of the year, so it earns a full year of interest. PPF interest is compounded annually and credited to your account on 31 March each year." },
      { t: "h2", s: "The monthly-balance rule that catches people out" },
      { t: "p", s: "Although interest is credited only once a year, it is calculated every month on the lowest balance in the account between the 5th and the last day of that month. This single rule has a big practical consequence: a deposit that lands on or before the 5th of the month earns interest for that whole month, while the same deposit made on the 6th earns nothing until the following month." },
      { t: "p", s: "That is why the conventional advice is to deposit before the 5th of April if you are making one lump sum for the year - doing so secures interest on the full amount for all twelve months. If you contribute monthly instead, aim to get each instalment in before the 5th. The simple annual formula above assumes exactly this best case: a deposit at the very start of the period earning a complete year of interest." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you deposit 50,000 at the start of every financial year for the full 15-year tenure, and the rate stays at 7.1%." },
      { t: "ul", items: [
        "P = 50,000",
        "i = 0.071",
        "n = 15",
      ] },
      { t: "p", s: "First work out (1 + i)^n = (1.071)^15, which is about 2.798. Subtracting 1 gives 1.798, and dividing by i (0.071) gives roughly 25.32. Multiplying by P and then by (1 + i) gives a maturity value of about 13,56,070. Over those 15 years you deposited 50,000 x 15 = 7,50,000 of your own money, so around 6,06,070 of the final balance is interest - your contributions have very nearly doubled, entirely tax-free." },
      { t: "p", s: "If instead you deposit the annual maximum of 1,50,000 every year for 15 years at 7.1%, the same formula gives a maturity value of about 40,68,000 on total contributions of 22,50,000 - roughly 18,18,000 of tax-free interest. You never need to grind through these powers by hand; enter your numbers into the [PPF Calculator](/finance/ppf-calculator) and it returns the maturity value, total deposited and interest earned instantly." },
      { t: "h2", s: "Deposit limits, tenure and extensions" },
      { t: "p", s: "A PPF account has firm rules set by the government:" },
      { t: "ul", items: [
        "You must deposit at least 500 in a financial year to keep the account active, and no more than 1,50,000.",
        "The base tenure is 15 financial years, counted from the end of the year in which you opened the account.",
        "On maturity you can withdraw the full balance, or extend in blocks of 5 years - either with fresh contributions or by leaving the balance to keep earning interest.",
        "Partial withdrawals are allowed from the 7th year, and a loan can be taken between the 3rd and 6th years.",
      ] },
      { t: "p", s: "The interest rate is reviewed by the government every quarter, so the 7.1% used here is the current figure rather than a rate locked for the whole tenure. When you model a long horizon, treat the result as an estimate based on today's rate." },
      { t: "h2", s: "Why PPF interest compounds so effectively" },
      { t: "p", s: "Two features make PPF a quietly powerful wealth-builder. First, the interest is genuinely compounded - each year's credited interest is added to the balance and earns interest itself in every later year, which is why more than 40% of the final balance in the examples above is growth rather than contributions. Second, PPF enjoys 'EEE' tax status: your deposits qualify for deduction under Section 80C, the interest accrues tax-free, and the maturity amount is exempt too. A taxable deposit would need a noticeably higher headline rate to match PPF's after-tax return, so the effective yield is better than the 7.1% suggests." },
      { t: "p", s: "To plan around all of this, change one input at a time in the [PPF Calculator](/finance/ppf-calculator) - the yearly deposit, the rate or the number of years - and watch how the maturity value moves. Seeing the interest portion swell as the tenure lengthens is the clearest illustration of why PPF rewards patience." },
    ],
    faqs: [
      { q: "How is PPF interest calculated?", a: "Interest is calculated every month on the lowest balance in the account between the 5th and the end of the month, then compounded and credited once a year on 31 March. For a deposit made at the start of each year, the maturity value follows M = P x [((1 + i)^n - 1) / i] x (1 + i), where P is the yearly deposit, i the annual rate and n the number of years." },
      { q: "Why should I deposit in PPF before the 5th of the month?", a: "Because interest each month is based on the lowest balance between the 5th and the last day, a deposit made on or before the 5th earns interest for that whole month, while the same deposit on the 6th earns nothing until the next month. Depositing before 5 April secures a full year of interest on a yearly lump sum." },
      { q: "Is PPF interest taxable?", a: "No. PPF has EEE (exempt-exempt-exempt) status: contributions qualify for a Section 80C deduction, the interest accrues tax-free, and the maturity amount is also exempt from tax. This makes the effective after-tax return higher than the headline rate." },
    ],
  },

  // ---------------------------------------------------------------- INCOME TAX
  {
    slug: "old-vs-new-tax-regime",
    title: "Old vs New Tax Regime: Which Saves More?",
    h1: "Old vs New Tax Regime: Which One Should You Choose?",
    desc: "Old vs new tax regime for FY 2025-26 (AY 2026-27): compare the slab rates, the standard deduction, the 12 lakh tax-free limit and a worked example to see which regime gives you lower tax.",
    category: "finance",
    tool: { slug: "income-tax-calculator", title: "Income Tax Calculator" },
    updated: "2026-06-28",
    body: [
      { t: "p", s: "Since the new tax regime became the default option, every salaried taxpayer in India faces the same yearly question: stick with the old regime and its long list of deductions, or switch to the new regime with its lower slab rates? There is no universal answer - the right choice depends entirely on how much you can legitimately deduct. This guide lays out the slab rates for both regimes for FY 2025-26 (assessment year 2026-27), walks through a worked example, and shows you exactly how to decide." },

      { t: "h2", s: "The two regimes at a glance" },
      { t: "p", s: "The old regime charges higher tax rates but lets you reduce your taxable income with a wide range of deductions and exemptions - Section 80C investments, 80D health insurance, house rent allowance, home-loan interest and more. The new regime does almost the opposite: it offers lower slab rates and a larger standard deduction, but strips away nearly every other deduction. In short, the old regime rewards people who invest and claim heavily, while the new regime rewards simplicity. The only way to know which wins for your numbers is to compute the tax both ways, which is exactly what the [Income Tax Calculator](/finance/income-tax-calculator) does." },

      { t: "h2", s: "New regime slabs (FY 2025-26)" },
      { t: "p", s: "After the Budget 2025 changes, the new regime slabs for an individual below 60 are:" },
      { t: "ul", items: [
        "Up to 4,00,000: nil",
        "4,00,001 to 8,00,000: 5%",
        "8,00,001 to 12,00,000: 10%",
        "12,00,001 to 16,00,000: 15%",
        "16,00,001 to 20,00,000: 20%",
        "20,00,001 to 24,00,000: 25%",
        "Above 24,00,000: 30%",
      ]},
      { t: "p", s: "A salaried person also gets a standard deduction of 75,000, and a Section 87A rebate makes the tax zero for a taxable income up to 12,00,000. A 4% health and education cess is added on top of the tax in every case." },

      { t: "h2", s: "Old regime slabs and deductions" },
      { t: "p", s: "The old regime keeps the long-standing slabs for an individual below 60:" },
      { t: "ul", items: [
        "Up to 2,50,000: nil",
        "2,50,001 to 5,00,000: 5%",
        "5,00,001 to 10,00,000: 20%",
        "Above 10,00,000: 30%",
      ]},
      { t: "p", s: "Its standard deduction is smaller at 50,000, and the 87A rebate only covers taxable income up to 5,00,000. What makes the old regime competitive is the deductions: up to 1,50,000 under Section 80C (provident fund, ELSS, life insurance, principal repayment), another 50,000 for NPS under 80CCD(1B), up to 2,00,000 of home-loan interest under Section 24(b), plus 80D health-insurance premiums and HRA. Claim enough of these and your taxable income can fall by several lakh." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take a salaried person earning 15,00,000 a year and compare both regimes." },
      { t: "p", s: "Under the new regime, the standard deduction of 75,000 brings taxable income to 14,25,000. The slab tax works out to 20,000 (in the 5% band) plus 40,000 (10% band) plus 33,750 (15% band on the slice from 12 to 14.25 lakh), a total of 93,750. Adding 4% cess of 3,750 gives a final tax of 97,500." },
      { t: "p", s: "Under the old regime, suppose the same person claims the 50,000 standard deduction, a full 1,50,000 under 80C and 25,000 under 80D - total deductions of 2,25,000, bringing taxable income to 12,75,000. The slab tax is 12,500 (5% band) plus 1,00,000 (20% band) plus 82,500 (30% band on the slice above 10 lakh), a total of 1,95,000. With 4% cess of 7,800, the tax is 2,02,800." },
      { t: "p", s: "Here the new regime wins comfortably - 97,500 against 2,02,800, a saving of over a lakh - because the old regime's higher 20% and 30% rates outweigh even sizeable deductions. The picture only flips when deductions are very large (for example, a big home-loan interest claim on top of 80C and NPS). That is precisely the kind of comparison the [Income Tax Calculator](/finance/income-tax-calculator) settles in seconds." },

      { t: "h2", s: "The 12 lakh tax-free threshold and marginal relief" },
      { t: "p", s: "The headline feature of the new regime is that the 87A rebate makes tax zero for a taxable income up to 12,00,000. Because of the 75,000 standard deduction, a salaried person earning up to 12,75,000 pays no tax at all. Just above the threshold, marginal relief steps in so that a small increase in income does not trigger a disproportionate tax bill. For instance, at a taxable income of 12,10,000 the slab tax would be 61,500, but marginal relief caps the tax at the amount of income above 12,00,000 - so you pay roughly 10,400 (including cess), not 64,000." },

      { t: "h2", s: "How to decide which regime fits you" },
      { t: "p", s: "A useful rule of thumb: the more you can legitimately deduct, the more attractive the old regime becomes. As a rough break-even, if your total deductions (beyond the standard deduction) comfortably exceed about 3.75 to 4 lakh, the old regime often wins; below that, the new regime's lower rates usually come out ahead. People who pay rent and claim HRA, repay a home loan, and maximise 80C and NPS are the strongest candidates for the old regime." },
      { t: "p", s: "But rules of thumb only get you close. Income level, the exact mix of deductions and HRA all shift the answer, so the safest approach is to compute both. Enter your salary and the deductions you actually claim into the [Income Tax Calculator](/finance/income-tax-calculator) - it computes the tax under each regime side by side and tells you which one leaves more money in your pocket." },

      { t: "h2", s: "A few caveats" },
      { t: "p", s: "The figures above are for an individual below 60; senior citizens get higher exemption limits under the old regime. The calculation also excludes surcharge, which applies once income crosses 50 lakh, and special-rate income such as capital gains. Slab rates, the standard deduction and the 87A rebate are revised in most Union Budgets, so always confirm you are using the figures for the correct financial year before you file." },
    ],
    faqs: [
      { q: "Which tax regime is better, old or new?", a: "It depends on your deductions. The new regime has lower slab rates and a 75,000 standard deduction but allows almost no other deductions, while the old regime has higher rates but lets you claim 80C, 80D, HRA and home-loan interest. As a rough guide, if your deductions beyond the standard deduction exceed about 3.75 to 4 lakh the old regime often wins; otherwise the new regime usually does. Compute both to be sure." },
      { q: "Is income up to 12 lakh really tax-free under the new regime?", a: "Yes, for FY 2025-26 the Section 87A rebate makes tax zero for a taxable income up to 12,00,000. Because a salaried person also gets a 75,000 standard deduction, a salary of up to 12,75,000 attracts no tax. Marginal relief applies just above the threshold so income slightly over 12 lakh is not taxed disproportionately." },
      { q: "Can I switch between the old and new regime every year?", a: "Salaried individuals without business income can choose their regime afresh each financial year when filing their return. Those with business or professional income face tighter rules and can generally opt back to the old regime only once. The new regime is the default, so you must actively choose the old one if it benefits you." },
    ],
  },

  // ---------------------------------------------------------------- HRA
  {
    slug: "how-is-hra-exemption-calculated",
    title: "How Is HRA Exemption Calculated?",
    h1: "How Is HRA Exemption Calculated Under Section 10(13A)?",
    desc: "How HRA exemption is calculated under Section 10(13A): the 3-way rule, metro vs non-metro limits, a worked example, and the documents you need to claim it under the old tax regime.",
    category: "finance",
    tool: { slug: "hra-calculator", title: "HRA Calculator" },
    updated: "2026-06-29",
    body: [
      { t: "p", s: "If you are a salaried employee who pays rent, House Rent Allowance (HRA) is one of the most valuable tax breaks available to you - but only a part of it is tax-free, and exactly how much depends on three separate figures. Many people assume the whole HRA on their payslip is exempt; in reality the exemption is capped by a statutory formula under Section 10(13A) of the Income Tax Act. This guide explains the rule, walks through a worked example, and shows where the [HRA Calculator](/finance/hra-calculator) does the arithmetic for you." },

      { t: "h2", s: "What HRA exemption actually is" },
      { t: "p", s: "HRA is a component of your salary meant to cover rented accommodation. Under Section 10(13A), the portion you spend on rent (subject to limits) is exempt from income tax, and only the leftover is added to your taxable salary. The catch is that the exemption is not simply \"rent paid\" or \"HRA received\" - it is the smallest of three calculated limits. Whichever limit is lowest becomes your tax-exempt HRA, and the rest of the HRA you received is taxed at your slab rate." },

      { t: "h2", s: "The three-way rule" },
      { t: "p", s: "Your exempt HRA is the minimum of these three amounts (all on an annual basis):" },
      { t: "ol", items: [
        "The actual HRA you received during the year.",
        "50% of (Basic salary + Dearness Allowance) if you live in a metro city, or 40% if you live anywhere else.",
        "The rent you actually paid, minus 10% of (Basic + DA).",
      ]},
      { t: "p", s: "In formula form: Exempt HRA = min(actual HRA, 50% or 40% of Basic+DA, rent paid − 10% of Basic+DA). The third limit is the one that catches most people out: because you must first subtract 10% of your basic pay from the rent, paying very little rent (or none) can shrink or wipe out the exemption entirely. Note that \"salary\" here means Basic plus Dearness Allowance (and any commission as a fixed percentage of turnover) - not your gross CTC." },

      { t: "h2", s: "Metro vs non-metro" },
      { t: "p", s: "Only four cities count as metros for HRA purposes: Delhi, Mumbai, Kolkata and Chennai. Living in one of these lets you use the more generous 50% limit on the second figure. Every other city - including high-cost ones like Bengaluru, Hyderabad, Pune and Gurugram - uses the 40% limit. This is purely a tax definition and has nothing to do with how expensive the city actually is, which is why the rule occasionally feels unfair to people renting in non-metro tech hubs." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose Priya works in Mumbai (a metro) and her annual figures are: Basic + DA of 6,00,000, HRA received of 3,00,000, and rent paid of 3,00,000 (25,000 a month). The three limits work out as follows:" },
      { t: "ul", items: [
        "Actual HRA received: 3,00,000.",
        "50% of Basic + DA: 50% × 6,00,000 = 3,00,000.",
        "Rent paid − 10% of Basic + DA: 3,00,000 − 60,000 = 2,40,000.",
      ]},
      { t: "p", s: "The smallest of the three is 2,40,000, so that is Priya's tax-exempt HRA. The remaining 60,000 (3,00,000 received − 2,40,000 exempt) is added to her taxable income. In this case the rent-based limit is the binding one - which is typical, because the 10%-of-basic deduction usually pulls the third figure below the other two. If Priya lived in a non-metro city, her second limit would drop to 40% × 6,00,000 = 2,40,000, but the exempt amount would stay 2,40,000 because the third limit is already the lowest. You can reproduce all of this instantly in the [HRA Calculator](/finance/hra-calculator) by entering the annual figures and toggling the metro / non-metro switch." },

      { t: "h2", s: "HRA and the old vs new tax regime" },
      { t: "p", s: "This is the part people most often get wrong: HRA exemption is available only under the old tax regime. If you opt for the new regime - now the default - you cannot claim it at all, along with most other deductions. So before you bank on the HRA break, check whether the old regime actually leaves you better off overall. For many renters with a home loan and decent 80C investments it does, but not always. Our guide on the [old vs new tax regime](/guides/old-vs-new-tax-regime) walks through that comparison, and the underlying numbers feed into the [Income Tax Calculator](/finance/income-tax-calculator)." },

      { t: "h2", s: "What you need to claim it" },
      { t: "p", s: "To claim HRA exemption you should keep rent receipts and, where rent exceeds 1,00,000 a year, your landlord's PAN. Rent paid to family is allowed if it is genuine - real payments, a real rental arrangement and the landlord declaring the rent as income - but tax authorities scrutinise such claims, so keep clean records. You can claim HRA and a home-loan interest deduction together if, for example, you rent in your work city while owning a home elsewhere (or a let-out property), but claiming HRA on a home you live in and own does not work." },

      { t: "h2", s: "Common mistakes to avoid" },
      { t: "p", s: "Three errors recur. First, using gross salary instead of Basic + DA inflates the second and third limits and overstates the exemption. Second, forgetting the \"minus 10% of basic\" step in the third limit - it is easy to assume the full rent is exempt. Third, claiming HRA under the new regime, where it simply does not apply. Run your real numbers through the [HRA Calculator](/finance/hra-calculator) to see the exempt and taxable split, then confirm the old regime is the right choice for your overall tax before you rely on it." },
    ],
    faqs: [
      { q: "Is the entire HRA I receive tax-free?", a: "No. Only the least of three amounts is exempt: the actual HRA received, 50% of Basic+DA for metro cities (40% otherwise), and the rent paid minus 10% of Basic+DA. The smallest of these is your tax-exempt HRA, and any HRA you receive above that figure is added to your taxable salary." },
      { q: "Can I claim HRA exemption under the new tax regime?", a: "No. HRA exemption under Section 10(13A) is available only under the old tax regime. Since the new regime is now the default and removes almost all exemptions and deductions, you must actively choose the old regime to claim HRA - and only if the old regime leaves you better off overall." },
      { q: "Can I claim HRA if I pay rent to my parents?", a: "Yes, provided the arrangement is genuine: you actually pay the rent, there is a real landlord-tenant relationship, and your parent declares the rent as income in their own return. Keep rent receipts and bank transfer records, and provide the landlord's PAN if the annual rent exceeds 1,00,000, since such claims are closely scrutinised." },
    ],
  },
  {
    slug: "how-is-in-hand-salary-calculated-from-ctc",
    title: "How Is In-Hand Salary Calculated From CTC?",
    h1: "How Is In-Hand Salary Calculated From CTC?",
    desc: "Why your take-home pay is far below your CTC: how employer PF, gratuity, your own PF, professional tax and income tax are deducted, with a full worked example for FY 2025-26.",
    category: "finance",
    tool: { slug: "in-hand-salary-calculator", title: "In-Hand Salary Calculator" },
    updated: "2026-06-30",
    body: [
      { t: "p", s: "The single most common shock for a new joiner in India is the gap between the CTC on the offer letter and the amount that actually lands in the bank each month. A 12 lakh CTC does not mean a one-lakh monthly salary - after the various deductions, take-home is usually 15-30% lower. This guide explains exactly where the money goes, step by step, and walks through a full worked example you can reproduce in the [In-Hand Salary Calculator](/finance/in-hand-salary-calculator)." },

      { t: "h2", s: "What CTC actually includes" },
      { t: "p", s: "CTC, or Cost to Company, is the total annual amount your employer spends on you - not the amount you receive. It bundles together things that never reach your hands directly: the employer's own contribution to your Provident Fund, a gratuity provision, sometimes group insurance premiums, and occasionally a notional value for benefits like meal cards or a cab. Because these are employer costs rather than payments to you, the first step in finding your real salary is to strip them out of CTC." },

      { t: "h2", s: "The deductions, in order" },
      { t: "p", s: "There are two layers between CTC and your bank account. The first layer converts CTC into your gross salary by removing employer-side costs. The second layer converts gross salary into in-hand pay by removing your own statutory deductions." },
      { t: "ol", items: [
        "Employer PF - typically 12% of your Basic pay, paid by the company into your EPF account. It is part of CTC but not part of your gross salary.",
        "Gratuity provision - about 4.81% of Basic, set aside by the employer. You only receive it after five years of service, so it is removed from gross too.",
        "Employee PF - another 12% of Basic, this time deducted from your gross salary and added to the same EPF account.",
        "Professional tax - a small state-level levy, capped at 2,500 a year (commonly 200 a month), in states that charge it.",
        "Income tax (TDS) - deducted monthly against your projected annual tax under whichever regime you have chosen.",
      ]},
      { t: "p", s: "So: Gross = CTC − employer PF − gratuity, and In-hand = Gross − employee PF − professional tax − income tax. The [In-Hand Salary Calculator](/finance/in-hand-salary-calculator) applies exactly this chain once you enter your CTC and the Basic percentage." },

      { t: "h2", s: "Why the Basic percentage matters" },
      { t: "p", s: "Almost every deduction above is pegged to Basic pay, not to total CTC, so the split between Basic and allowances quietly drives your take-home. A higher Basic means larger PF contributions on both sides - which lowers your immediate in-hand pay but builds a bigger retirement corpus, and (under the old regime) raises your HRA exemption. A lower Basic does the opposite: more cash now, less forced saving. Indian employers usually set Basic at 40-50% of CTC. The calculator lets you slide this between 30% and 60% so you can see the trade-off for your own structure." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take a 12,00,000 CTC with Basic at 50%, professional tax of 200 a month, under the new tax regime (the calculator's defaults). Basic is 6,00,000, so:" },
      { t: "ul", items: [
        "Employer PF = 12% × 6,00,000 = 72,000, and gratuity ≈ 4.81% × 6,00,000 = 28,860.",
        "Gross salary = 12,00,000 − 72,000 − 28,860 = 10,99,140.",
        "Employee PF = 12% × 6,00,000 = 72,000.",
        "Taxable income = gross − 75,000 standard deduction = 10,24,140. Because this is under 12,00,000, the Section 87A rebate wipes the tax out entirely, so income tax = 0.",
        "Professional tax = 200 × 12 = 2,400.",
      ]},
      { t: "p", s: "Annual in-hand = 10,99,140 − 72,000 − 2,400 − 0 = 10,24,740, which is about 85,395 a month. Note what happened: nearly 17% of the headline CTC disappeared into PF and gratuity before tax even entered the picture, yet the new-regime rebate meant zero income tax. This is why salaries up to roughly a 12 lakh CTC often pay little or no tax under the new regime - the rebate, not the deductions, is doing the heavy lifting." },

      { t: "h2", s: "Old regime vs new regime" },
      { t: "p", s: "Switch the same example to the old regime and the picture changes. The old regime gives a smaller 50,000 standard deduction and steeper slabs, so on the same gross the calculator estimates about 1,32,332 of annual tax, dropping monthly in-hand to roughly 74,367. But there is an important caveat: the calculator computes old-regime tax on gross minus the standard deduction only - it does not assume any 80C investments or HRA exemption. In reality, if you invest 1,50,000 under 80C and claim HRA, your old-regime tax falls substantially and the two regimes move much closer. To compare them properly with your actual deductions, use the dedicated [Income Tax Calculator](/finance/income-tax-calculator) and our [old vs new tax regime](/guides/old-vs-new-tax-regime) guide." },

      { t: "h2", s: "Why your payslip may still differ" },
      { t: "p", s: "This is an estimate, and real payslips vary for a few reasons. Many employers cap PF at the statutory wage ceiling of 15,000 a month rather than 12% of full Basic, which raises your in-hand pay. Variable pay, joining bonuses and reimbursements are often excluded from monthly salary and paid separately. Components like LTA, NPS or a meal allowance can be structured to reduce taxable income. And TDS is spread across the year based on projections, so individual months can differ from the annual average. Treat the calculator's figure as a close planning estimate, then reconcile it against your first actual payslip or a detailed salary breakup from HR." },
    ],
    faqs: [
      { q: "Why is my in-hand salary so much lower than my CTC?", a: "Because CTC includes money you never receive directly - the employer's 12% PF contribution and a roughly 4.81% gratuity provision - plus your own deductions: a further 12% PF, professional tax and income tax. Together these commonly take 15-30% off the headline CTC, which is why a 12 lakh CTC translates to a take-home well below one lakh a month." },
      { q: "Does a higher Basic pay increase or decrease my take-home?", a: "A higher Basic lowers your immediate take-home, because both your PF and the employer's PF are calculated as 12% of Basic, so more is diverted into your EPF account. The upside is a larger retirement corpus and, under the old regime, a bigger HRA exemption. A lower Basic gives you more cash now but less forced saving." },
      { q: "Should I pick the old or new regime to maximise take-home?", a: "It depends on your deductions. The new regime has lower slabs and a generous Section 87A rebate, so it usually wins if you claim few deductions. The old regime can beat it once you fully use 80C, HRA and a home-loan interest deduction. Run both through the Income Tax Calculator with your real numbers before deciding." },
    ],
  },
  {
    slug: "how-is-gratuity-calculated",
    title: "How Is Gratuity Calculated?",
    h1: "How Is Gratuity Calculated Under the Payment of Gratuity Act?",
    desc: "How gratuity is calculated in India under the Payment of Gratuity Act: the 15/26 formula, the 5-year eligibility rule, how part-years are rounded, the tax-free limit, and a worked example.",
    category: "finance",
    tool: { slug: "gratuity-calculator", title: "Gratuity Calculator" },
    updated: "2026-07-01",
    body: [
      { t: "p", s: "Gratuity is a lump sum your employer pays you as a thank-you for long service, and for most salaried employees in India it is governed by the Payment of Gratuity Act, 1972. The amount is not arbitrary - it follows a fixed statutory formula built around a curious \"15 days for every year\" rule and a 26-day month. This guide explains where that formula comes from, who qualifies, how part-years are rounded, how much of the payout is tax-free, and walks through a worked example you can reproduce in the [Gratuity Calculator](/finance/gratuity-calculator)." },

      { t: "h2", s: "Who is eligible for gratuity" },
      { t: "p", s: "The Payment of Gratuity Act applies to factories, mines, shops and establishments that employ 10 or more people. If you work for such an employer, you become eligible for gratuity after completing five years of continuous service with the same organisation. The five-year condition is waived only if service ends because of the employee's death or disablement - in those cases gratuity is payable regardless of tenure. Gratuity is triggered by resignation, retirement, superannuation, death or disablement; it is not paid while you simply continue working." },

      { t: "h2", s: "The 15/26 formula" },
      { t: "p", s: "For employees covered by the Act, gratuity is calculated as:" },
      { t: "ul", items: [
        "Gratuity = (15 × last drawn salary × completed years of service) / 26",
      ]},
      { t: "p", s: "Here \"last drawn salary\" means your last monthly Basic pay plus Dearness Allowance (DA) - not gross salary, and not CTC. Allowances such as HRA, bonuses and reimbursements are excluded. The formula credits you 15 days of wages for every completed year of service, and it divides by 26 rather than 30 because a working month under the Act is treated as 26 days: the four Sundays are excluded as paid weekly off-days. So one day's wage equals monthly Basic+DA ÷ 26, and 15 such days are paid per year of service." },

      { t: "h2", s: "How part-years are rounded" },
      { t: "p", s: "Service is counted in completed years, with the final part-year rounded to the nearest whole year using a six-month rule. If the leftover months in your last year exceed six, the year rounds up; if they are six months or fewer, the year is dropped. So 12 years 8 months counts as 13 years, while 12 years 4 months counts as 12 years. This single rounding step can swing the payout by a full year's worth of gratuity, which is why the exact months of service matter near a year boundary." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose Ravi resigns after 12 years and 8 months of service, with a last drawn Basic + DA of 60,000 a month. First, round the service: 8 months is more than six, so it becomes 13 completed years. Then apply the formula:" },
      { t: "ul", items: [
        "One day's wage = 60,000 ÷ 26 = 2,307.69.",
        "15 days per year = 15 × 2,307.69 = 34,615.38.",
        "Gratuity = 34,615.38 × 13 years = 4,50,000.",
      ]},
      { t: "p", s: "So Ravi receives 4,50,000. Had he left just four months earlier, at 12 years 4 months, the service would round down to 12 years and the gratuity would fall to about 4,15,385 - roughly 34,600 less for the same job. You can test both scenarios instantly in the [Gratuity Calculator](/finance/gratuity-calculator) by entering Basic+DA and the exact years and months of service." },

      { t: "h2", s: "How much gratuity is tax-free" },
      { t: "p", s: "Gratuity enjoys a generous tax exemption under Section 10(10) of the Income Tax Act. For employees covered by the Payment of Gratuity Act, the exempt amount is the least of three figures: the actual gratuity received, the amount given by the 15/26 formula, and a lifetime ceiling of 20,00,000. Because the formula amount is itself one of the three limits, gratuity calculated strictly by the formula is fully exempt up to that 20 lakh cap. Ravi's 4,50,000 is therefore entirely tax-free. Anything an employer pays over and above the formula (ex-gratia gratuity) or beyond the 20 lakh lifetime limit is taxable as salary income." },

      { t: "h2", s: "Employees not covered by the Act" },
      { t: "p", s: "A minority of employees work for establishments outside the Act's scope. For them, gratuity is often computed as (15 × average last 10 months' salary × completed years) / 30 - note the divisor of 30 instead of 26, and no rounding up of the final part-year. The tax exemption rules also differ slightly. The Gratuity Calculator models the far more common covered-employee case using the 15/26 formula, so if your employer is outside the Act, treat the figure as an approximation and confirm your entitlement with HR." },

      { t: "h2", s: "Where gratuity fits in your pay" },
      { t: "p", s: "Employers frequently show a gratuity provision - about 4.81% of Basic per year - inside your CTC, even though you only receive it after five years. That is one reason your take-home pay is well below your headline CTC; our [In-Hand Salary Calculator](/finance/in-hand-salary-calculator) and its guide break down where the rest goes. When you do receive gratuity, it is a meaningful lump sum, so it is worth planning what to do with it - parking it in an [FD](/finance/fd-calculator) or investing it. Run your own numbers through the [Gratuity Calculator](/finance/gratuity-calculator) as you approach a service milestone so you know roughly what to expect." },
    ],
    faqs: [
      { q: "Why is gratuity divided by 26 and not 30?", a: "Under the Payment of Gratuity Act a working month is treated as 26 days, because the four Sundays are excluded as paid weekly off-days. So one day's wage is the monthly Basic+DA divided by 26, and 15 such days are credited for every completed year of service, giving the (15 × salary × years) / 26 formula." },
      { q: "Do I get gratuity if I leave before five years?", a: "Generally no. You must complete five years of continuous service with the same employer to be eligible under the Act. The only exceptions are when service ends due to the employee's death or disablement, in which case gratuity is payable regardless of how long they had worked." },
      { q: "Is gratuity taxable?", a: "For employees covered by the Payment of Gratuity Act, gratuity is exempt up to the least of the actual amount received, the amount given by the 15/26 formula, and a lifetime limit of 20,00,000. Gratuity paid strictly by the formula is therefore fully tax-free up to that ceiling; any amount paid above the formula or beyond 20 lakh is taxed as salary." },
    ],
  },
  {
    slug: "how-is-nps-corpus-and-pension-calculated",
    title: "How Is Your NPS Corpus and Pension Calculated?",
    h1: "How Is Your NPS Corpus and Pension Calculated?",
    desc: "How the National Pension System builds a retirement corpus from monthly contributions, why at least 40% must buy an annuity, how the monthly pension is worked out, and the tax rules - with a full worked example.",
    category: "finance",
    tool: { slug: "nps-calculator", title: "NPS Calculator" },
    updated: "2026-07-02",
    body: [
      { t: "p", s: "The National Pension System (NPS) is a government-backed, market-linked retirement scheme regulated by the PFRDA. You contribute a small amount every month for decades, the money grows in a mix of equity and debt funds, and at 60 it turns into a lump sum plus a lifelong monthly pension. Because the payout depends on how long you invest, the return your funds earn and the annuity you buy at the end, the final numbers can look surprising. This guide breaks down exactly how the corpus and pension are calculated, step by step, so you can reproduce and stress-test the figures in the [NPS Calculator](/finance/nps-calculator)." },

      { t: "h2", s: "How the corpus is built" },
      { t: "p", s: "During your working years, every monthly contribution is invested and left to compound. NPS is a defined-contribution scheme, so there is no guaranteed pension - what you get out depends entirely on what you put in and how it grows. The accumulation phase is just a monthly compounding calculation: a fixed contribution paid at the start of each month, growing at an assumed annual return until you retire." },
      { t: "p", s: "Mathematically it is a future value of an annuity-due:" },
      { t: "ul", items: [
        "Corpus = C × [ ((1 + i)^n − 1) / i ] × (1 + i)",
        "where C is the monthly contribution, i is the monthly return (annual rate ÷ 12, as a decimal), and n is the number of months until retirement.",
      ]},
      { t: "p", s: "The two levers that matter most are time and return. Because compounding is exponential, starting a few years earlier or nudging the return up by a percentage point changes the final corpus dramatically - far more than a modest increase in the monthly contribution. That is why NPS rewards people who start young and stay invested." },

      { t: "h2", s: "The 40% annuity rule" },
      { t: "p", s: "At retirement you cannot simply withdraw the whole corpus. Under current NPS rules, at least 40% of the accumulated corpus must be used to buy an annuity - an insurance product that pays you a regular pension for life. The remaining balance, up to 60%, can be taken as a lump sum. You are free to annuitise more than 40% if you want a larger pension and a smaller lump sum, and the [NPS Calculator](/finance/nps-calculator) lets you slide the annuity share anywhere from 40% up to 100% to see the trade-off." },
      { t: "p", s: "So the corpus splits into two parts: Annuitised amount = Corpus × annuity share, and Lump sum = Corpus − annuitised amount. The bigger the annuity share, the higher your guaranteed monthly pension but the less cash you receive up front." },

      { t: "h2", s: "How the monthly pension is estimated" },
      { t: "p", s: "The annuitised portion is handed to an insurer, who pays you a pension based on the annuity rate on offer at that time. A simple estimate treats the annuity like a perpetuity: multiply the annuitised amount by the annual annuity rate, then divide by 12 for a monthly figure." },
      { t: "ul", items: [
        "Monthly pension ≈ Annuitised amount × annuity rate ÷ 12",
      ]},
      { t: "p", s: "Annuity rates typically sit around 6-7% and vary by insurer, annuity type and your age. A plain lifetime annuity pays more each month but stops when you die; a return-of-purchase-price annuity pays less but returns the capital to your nominee. The calculator uses a single annuity rate so you can compare scenarios; the real pension is whatever your chosen insurer quotes at retirement." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take the calculator's defaults: 10,000 a month, invested from age 30 to 60 (that is 360 months), an assumed 10% annual return, a 40% annuity share and a 6% annuity rate. Working through the formula:" },
      { t: "ul", items: [
        "Total invested = 10,000 × 360 = 36,00,000.",
        "Corpus ≈ 2,27,93,253 - so roughly 1,91,93,000 of that is pure growth, dwarfing the 36 lakh you actually paid in.",
        "Annuitised (40%) = 2,27,93,253 × 0.40 = 91,17,301.",
        "Lump sum (60%) = 2,27,93,253 − 91,17,301 = 1,36,75,952, taken tax-free.",
        "Monthly pension = 91,17,301 × 6% ÷ 12 ≈ 45,587.",
      ]},
      { t: "p", s: "So a 10,000 monthly habit becomes a 2.28 crore corpus, a 1.37 crore tax-free lump sum and a 45,587 monthly pension - the clearest illustration of why a 30-year runway and equity-led growth matter so much. Raise the annuity share to 60% and the pension jumps to about 68,000 a month, but the lump sum shrinks to roughly 91 lakh. Run your own numbers in the [NPS Calculator](/finance/nps-calculator) to see how sensitive the outcome is to your start age and expected return." },

      { t: "h2", s: "The tax rules" },
      { t: "p", s: "NPS is one of the most tax-efficient investments available, at three stages. On the way in, your own contributions qualify for a deduction under Section 80CCD(1) within the overall 1.5 lakh limit of 80C, plus an exclusive extra 50,000 under Section 80CCD(1B) - and any employer contribution is separately deductible under 80CCD(2). At maturity, the up-to-60% lump sum is entirely tax-free. The one catch is the annuity: the monthly pension you receive is taxed as ordinary income at your slab rate in the year you receive it. So NPS defers tax on the pension portion rather than removing it, while making the lump sum genuinely tax-exempt." },

      { t: "h2", s: "What the estimate does not capture" },
      { t: "p", s: "The calculator makes deliberately simple assumptions, so treat its output as a planning estimate, not a promise. Real returns are not a smooth fixed percentage - NPS funds move with markets, and PFRDA's lifecycle options automatically shift you from equity toward debt as you age, which usually lowers returns in the final years. Contributions rarely stay flat either; most people step them up over a career, which builds a far larger corpus than a fixed amount. And the annuity rate at retirement is unknown today. For the pure accumulation side you can cross-check against a plain [SIP Calculator](/finance/sip-calculator), and compare NPS with the guaranteed, tax-free but lower-return [PPF](/finance/ppf-calculator) using its [PPF guide](/guides/how-is-ppf-interest-calculated). Revisit your NPS projection every few years and adjust the contribution and return assumptions to match reality." },
    ],
    faqs: [
      { q: "How much of my NPS corpus can I withdraw as a lump sum?", a: "Up to 60% of the accumulated corpus can be taken as a lump sum at retirement, and that portion is completely tax-free. The remaining at least 40% must be used to purchase an annuity that pays your monthly pension. You can choose to annuitise more than 40% for a bigger pension, but you can never withdraw more than 60% as cash." },
      { q: "Is the NPS pension tax-free?", a: "No. While the up-to-60% lump sum is tax-free, the monthly pension you receive from the annuity is taxable as ordinary income at your slab rate in the year you receive it. NPS gives you deductions on the way in (under 80CCD(1), 80CCD(1B) and 80CCD(2)) and a tax-free lump sum, but it only defers - rather than removes - tax on the pension stream." },
      { q: "Why is my projected NPS corpus so much larger than what I contributed?", a: "Because of compounding over a long horizon. In the default example, 36 lakh of contributions grows into a corpus of about 2.28 crore over 30 years at a 10% return - so roughly 1.9 crore is investment growth. The longer you stay invested and the higher the equity-led return, the more the growth dominates your own contributions, which is why starting early matters far more than contributing a little extra each month." },
    ],
  },
  {
    slug: "how-is-rd-interest-calculated",
    title: "How Is Recurring Deposit (RD) Interest Calculated?",
    h1: "How Is Recurring Deposit (RD) Interest Calculated?",
    desc: "How Indian banks work out recurring deposit maturity with quarterly compounding, why the tenure runs in multiples of 3 months, how RD differs from an FD and an SIP, plus a full worked example and the tax rules.",
    category: "finance",
    tool: { slug: "rd-calculator", title: "RD Calculator" },
    updated: "2026-07-03",
    body: [
      { t: "p", s: "A recurring deposit (RD) is one of the simplest ways to save: you commit to putting a fixed amount into the bank every month for a set period, and at the end you get back everything you paid in plus interest. It suits people who want the safety and guaranteed return of a fixed deposit but do not have a lump sum to lock away up front. The tricky part is the maths - because each monthly instalment is deposited at a different time, each one earns interest for a different length of time, and Indian banks compound that interest quarterly. This guide explains exactly how the maturity value is calculated so you can reproduce and check the figures in the [RD Calculator](/finance/rd-calculator)." },

      { t: "h2", s: "The RD maturity formula" },
      { t: "p", s: "An RD is really a series of deposits, each compounding until the same maturity date. The first instalment earns interest for the full tenure, the second for one month less, and so on down to the final instalment, which earns interest for just one month. Rather than adding up every instalment separately, banks use a closed-form formula based on quarterly compounding:" },
      { t: "ul", items: [
        "M = P × [ (1 + i)^n − 1 ] ÷ [ 1 − (1 + i)^(−1/3) ]",
        "where P is the monthly deposit, i is the quarterly interest rate (annual rate ÷ 400, as a decimal), and n is the number of quarters (tenure in months ÷ 3).",
      ]},
      { t: "p", s: "The (1 + i)^(−1/3) term in the denominator is what handles the monthly instalments inside each quarter - it spreads the quarterly compounding across the three months so that each deposit is credited interest fairly. This is why RD tenures are always entered in multiples of 3 months: the standard bank formula works in whole quarters. The total you actually pay in is simply P × months, and the interest earned is the maturity value minus that total." },

      { t: "h2", s: "Why quarterly compounding matters" },
      { t: "p", s: "Compounding frequency quietly changes your return. Indian banks credit and compound RD interest every quarter, so interest earned in one quarter starts earning its own interest in the next. If interest were compounded only once a year, your maturity value would be slightly lower for the same headline rate; compounded monthly, it would be slightly higher. Quarterly is the market standard, and it is what the [RD Calculator](/finance/rd-calculator) assumes so its output matches the passbook figure your bank will show. The effect is small over a short tenure but grows with time - which is why a longer RD earns proportionally more interest than a short one at the same rate." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take the calculator's defaults: a 5,000 monthly deposit at 7.2% per annum for 24 months. First convert the inputs:" },
      { t: "ul", items: [
        "Quarterly rate i = 7.2 ÷ 400 = 0.018.",
        "Number of quarters n = 24 ÷ 3 = 8.",
        "Total invested = 5,000 × 24 = 1,20,000.",
      ]},
      { t: "p", s: "Now plug into the formula. The numerator (1.018)^8 − 1 = 1.153406 − 1 = 0.153406. The denominator 1 − (1.018)^(−1/3) = 1 − 0.994071 = 0.005929. Dividing gives 0.153406 ÷ 0.005929 ≈ 25.874, and multiplying by the 5,000 monthly deposit:" },
      { t: "ul", items: [
        "Maturity M = 5,000 × 25.874 ≈ 1,29,369.",
        "Interest earned = 1,29,369 − 1,20,000 = 9,369.",
      ]},
      { t: "p", s: "So two years of disciplined 5,000-a-month saving turns 1,20,000 of your own money into about 1,29,369 - roughly 9,369 of guaranteed interest. Stretch the same 3,000-a-month habit over five years at 6.7% and you deposit 1,80,000 and mature at about 2,14,097, earning 34,097 in interest. The longer horizon lets quarterly compounding do far more of the work. Try your own numbers in the [RD Calculator](/finance/rd-calculator) to see how the tenure and rate move the result." },

      { t: "h2", s: "RD vs FD vs SIP" },
      { t: "p", s: "It is easy to confuse these three. A fixed deposit (FD) takes a single lump sum today and locks it for the whole term, so every rupee earns interest for the full period - an FD of the same total will always mature slightly higher than an RD, because the RD's money trickles in over time. An RD suits a monthly saving habit rather than a windfall. A systematic investment plan (SIP), by contrast, is not a deposit at all: it invests a fixed monthly amount into mutual funds, so the return is market-linked and not guaranteed. RD gives certainty and capital safety; SIP offers higher potential returns with real risk. If you are weighing the two, compare the guaranteed RD figure here against a market projection in the [SIP Calculator](/finance/sip-calculator), and use the [FD Calculator](/finance/fd-calculator) for the lump-sum equivalent." },

      { t: "h2", s: "The tax rules on RD interest" },
      { t: "p", s: "RD interest is fully taxable. Unlike a PPF or the tax-free portion of some other schemes, the interest you earn on a recurring deposit is added to your income and taxed at your slab rate in the year it accrues. Banks also deduct TDS (tax deducted at source) at 10% if your total interest from RDs and FDs with that bank crosses the annual threshold in a financial year - you can submit Form 15G or 15H to avoid TDS if your total income is below the taxable limit. Note that TDS is not the final tax: if your slab rate is higher than 10% you owe the difference, and if it is lower you can claim a refund. Factor this in when comparing an RD's headline rate against tax-advantaged options like the [PPF](/finance/ppf-calculator)." },

      { t: "h2", s: "What the estimate assumes" },
      { t: "p", s: "The calculator gives the standard-formula maturity value, but a few real-world details can nudge it. It assumes every instalment is paid on time - a missed or late deposit reduces your interest and some banks levy a small penalty. It assumes the rate stays fixed for the whole tenure, which is how RDs work once opened, but the rate on offer changes between banks and over time, so shop around before you commit. Premature withdrawal usually attracts a penalty of around 0.5-1% on the applicable rate, so an RD is best treated as money you can leave untouched until maturity. Treat the output as an accurate estimate of the guaranteed maturity, and revisit the [RD Calculator](/finance/rd-calculator) whenever your bank revises its rate." },
    ],
    faqs: [
      { q: "Why is my RD tenure entered in multiples of 3 months?", a: "Because Indian banks compound recurring deposit interest quarterly, and the standard maturity formula works in whole quarters. A quarter is three months, so tenures are set in multiples of 3 - typically anywhere from 6 months up to 10 years. Entering a tenure that is not a multiple of 3 would not align with how the bank credits interest." },
      { q: "Will an RD earn the same as an FD for the same amount?", a: "No. A fixed deposit invests a lump sum on day one, so every rupee earns interest for the full term. An RD's money is deposited gradually over the tenure, so on average each rupee earns interest for less time. For the same total contribution and rate, an FD will always mature a little higher than an RD. The trade-off is that an RD only needs a small monthly amount rather than a lump sum up front." },
      { q: "Is the interest on a recurring deposit taxable?", a: "Yes. RD interest is added to your income and taxed at your slab rate. Banks deduct TDS at 10% once your combined RD and FD interest with that bank crosses the annual threshold in a financial year. You can file Form 15G or 15H to avoid TDS if your income is below the taxable limit, and TDS is adjusted against your final tax liability - so you pay the balance if your slab is higher, or claim a refund if it is lower." },
    ],
  },
];

export const allGuides = () => GUIDES;
export const getGuide = (slug) => GUIDES.find((g) => g.slug === slug);

// Stable, URL-safe anchor id for a heading string (used for the in-page TOC).
export const headingId = (s) =>
  s
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

// Rough reading time in minutes from a guide's body blocks (~200 wpm).
export const readingTime = (guide) => {
  const words = (guide.body || []).reduce((n, b) => {
    if (b.s) return n + b.s.split(/\s+/).length;
    if (b.items) return n + b.items.join(" ").split(/\s+/).length;
    return n;
  }, 0);
  return Math.max(1, Math.round(words / 200));
};

// The h2 headings of a guide, as { id, text } — the table of contents.
export const guideToc = (guide) =>
  (guide.body || [])
    .filter((b) => b.t === "h2")
    .map((b) => ({ id: headingId(b.s), text: b.s }));

// Display metadata per guide category (label + icon key for CategoryIcon).
export const GUIDE_CATEGORIES = [
  { slug: "finance", label: "Finance & money", icon: "finance" },
  { slug: "dev", label: "Developer & encoding", icon: "dev" },
  { slug: "convert", label: "Converters", icon: "convert" },
  { slug: "pdf", label: "PDF tools", icon: "pdf" },
  { slug: "image", label: "Image tools", icon: "image" },
];

// Guides grouped by category, in GUIDE_CATEGORIES order, skipping empty groups.
export const guidesByCategory = () =>
  GUIDE_CATEGORIES.map((c) => ({
    ...c,
    guides: GUIDES.filter((g) => g.category === c.slug),
  })).filter((c) => c.guides.length > 0);
