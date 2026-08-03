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

  // ---------------------------------------------------------------- PDF-TO-WORD
  {
    slug: "how-to-convert-pdf-to-word",
    title: "How to Convert PDF to Word",
    h1: "How to Convert a PDF to an Editable Word Document",
    desc: "How to convert PDF to Word for free: extract the text into an editable DOCX right in your browser, choose flowing paragraphs or line-by-line, and open it in Word, Google Docs or Pages.",
    category: "pdf",
    tool: { slug: "pdf-to-word", title: "PDF to Word" },
    updated: "2026-07-05",
    body: [
      { t: "p", s: "You have a PDF and you need to edit the words inside it - fix a typo, reuse a paragraph, or reformat a report. PDFs are built for viewing, not editing, so the answer is to convert the PDF into a Word document you can open and change. This guide explains what a PDF-to-Word conversion can and cannot do, the difference between a digital PDF and a scan, how to choose between flowing paragraphs and line-by-line output, and the exact steps to convert a PDF to Word with the free [PDF to Word](/pdf/pdf-to-word) tool - entirely in your browser, with nothing uploaded." },

      { t: "h2", s: "What 'PDF to Word' really means" },
      { t: "p", s: "A PDF stores text as characters placed at fixed coordinates on a page, often with no notion of paragraphs, columns or reading order the way a word processor understands them. Converting to Word means reading those characters back out and rebuilding them into a normal, editable document - a DOCX file - that opens in Microsoft Word, Google Docs, LibreOffice or Apple Pages. The goal is editable text, not a pixel-perfect clone of the original page. Fonts, exact spacing and complex layouts may shift, but the words themselves come across cleanly so you can edit and reformat them however you like." },

      { t: "h2", s: "Digital PDFs vs scanned PDFs" },
      { t: "p", s: "The single biggest factor in whether a conversion works is where the PDF came from. There are two kinds, and only one can be converted by extracting text." },
      { t: "ul", items: [
        "A digital (text-based) PDF was created by a computer - exported from Word, a browser, an accounting package or a design tool. Its text is real, selectable characters. If you can highlight a sentence in your PDF reader and copy it, it is a digital PDF and will convert well.",
        "A scanned PDF is a photograph or scan of a page. Every page is really just an image, so there are no characters to read - selecting text does nothing. Converting it to Word would need OCR (optical character recognition), which is a different process.",
      ]},
      { t: "p", s: "The [PDF to Word](/pdf/pdf-to-word) tool works on digital PDFs. If you load a scan, it will tell you no selectable text was found rather than produce an empty document. A quick test before you start: open the PDF, try to select a line of text with your cursor. If it highlights, you are good to go." },

      { t: "h2", s: "Flowing paragraphs or line breaks?" },
      { t: "p", s: "When text is lifted off a page, the tool has to decide where one paragraph ends and the next begins. It offers two modes, and the right one depends on your document." },
      { t: "ul", items: [
        "Flowing paragraphs merges the lines of each paragraph back into a single continuous paragraph, starting a new one only where the original had a clear vertical gap. This is best for prose - articles, letters, essays and reports - because the text reflows naturally as you edit and add words.",
        "Keep line breaks preserves every visual line as its own line in Word. This suits addresses, poetry, code listings, tables of short entries, or anything where the exact line structure matters more than smooth paragraphs.",
      ]},
      { t: "p", s: "If you are not sure, start with flowing paragraphs - it produces the most natural, editable document for everyday text. If the result runs sentences together in a way you do not want, convert again with line breaks instead." },

      { t: "h2", s: "How to convert a PDF to Word" },
      { t: "p", s: "The whole process takes a few seconds and a handful of clicks:" },
      { t: "ol", items: [
        "Open the [PDF to Word](/pdf/pdf-to-word) tool in your browser.",
        "Load your PDF by selecting it from your device.",
        "Choose a layout - flowing paragraphs for articles and letters, or keep line breaks for addresses, lists and code.",
        "Click Convert to Word and let the tool read every page.",
        "Download the DOCX file and open it in Word, Google Docs, Pages or LibreOffice to edit.",
      ]},
      { t: "p", s: "Because the file is a standard DOCX, you can edit it anywhere Word documents open - there is no special software required to use the result." },

      { t: "h2", s: "Privacy: it runs in your browser" },
      { t: "p", s: "The conversion happens entirely on your own device. The tool reads the PDF's text and builds the Word file locally in the browser, so your document is never uploaded to a server. That matters for contracts, statements, resumes and anything confidential - the content never leaves your machine, and there is no copy sitting on someone else's cloud. It also means there are no accounts, watermarks or per-file limits; the only constraint is your device's own memory." },

      { t: "h2", s: "Tips for the cleanest result" },
      { t: "p", s: "A few habits make conversions smoother. If a document mixes columns, sidebars and body text, expect the reading order to need a little tidying after conversion, since a flat text stream cannot always guess how a magazine-style layout should flow. Very heavily designed pages - flyers, brochures, infographics - convert their words but not their look, so treat the output as raw text to restyle. And if your file is a scan, run it through an OCR step first; only then will there be real text for a converter to extract." },

      { t: "h2", s: "Convert your PDF now" },
      { t: "p", s: "Pick the layout that matches your document, let the tool lift the text into a clean DOCX, and edit it wherever you like. Open the [PDF to Word](/pdf/pdf-to-word) tool to convert your PDF to an editable Word document in seconds - free, private, and entirely in your browser. If instead you need the numbers out of a table, the [PDF to Excel](/pdf/pdf-to-excel) tool extracts rows and columns into a spreadsheet." },
    ],
    faqs: [
      { q: "Will the Word file look exactly like my PDF?", a: "Not exactly. The conversion extracts editable text rather than cloning the page, so fonts and precise spacing may shift and complex layouts can reflow. The words themselves come across cleanly so you can edit and reformat them - the goal is an editable document, not a pixel-perfect copy." },
      { q: "Can I convert a scanned PDF to Word?", a: "No. A scan is an image of text with no selectable characters, so there is nothing to extract. This tool works on digital PDFs where you can select and copy text. To convert a scan you would first need OCR to turn the image into real text." },
      { q: "Is my PDF uploaded to convert it?", a: "No. The text is extracted and the Word document is built entirely in your browser on your own device, so the file is never uploaded. That keeps contracts, resumes and other sensitive documents private." },
    ],
  },

  // ---------------------------------------------------------------- PDF-TO-EXCEL
  {
    slug: "how-to-extract-tables-from-pdf-to-excel",
    title: "How to Extract Tables from a PDF to Excel",
    h1: "How to Extract Tables from a PDF to Excel or CSV",
    desc: "How to extract table data from a PDF into Excel or CSV for free: detect rows and columns automatically, preview the result, and download an XLSX or CSV - all in your browser, no upload.",
    category: "pdf",
    tool: { slug: "pdf-to-excel", title: "PDF to Excel" },
    updated: "2026-07-05",
    body: [
      { t: "p", s: "Retyping a table out of a PDF is slow and error-prone - and completely unnecessary. If the PDF contains real text, the rows and columns can be detected automatically and dropped straight into a spreadsheet. This guide explains how tables are pulled out of a PDF, why some PDFs work and others do not, when to choose Excel (XLSX) over CSV, and the exact steps to convert a PDF table with the free [PDF to Excel](/pdf/pdf-to-excel) tool - all in your browser, with nothing uploaded." },

      { t: "h2", s: "How table extraction works" },
      { t: "p", s: "There are no gridlines to follow inside a PDF - just text placed at coordinates. The tool reconstructs the table from those positions. First it groups pieces of text that sit at the same height into rows. Then it looks for the vertical lanes of white space that run down the page between one column and the next, and uses them to work out where the columns are. Each piece of text is then dropped into the right row and column, rebuilding the grid. Because it reads position rather than any table markup, it works on ordinary PDFs that were never tagged as containing a table." },

      { t: "h2", s: "Which PDFs work best" },
      { t: "p", s: "Extraction relies on real, selectable text and on the columns being visually separated. That makes some documents ideal and others unsuitable." },
      { t: "ul", items: [
        "Works well: digital PDFs with clearly spaced columns - bank and credit-card statements, invoices, price lists, financial reports, exported data tables and schedules.",
        "Struggles: tables where columns are jammed together with almost no gap, or cells that wrap onto several lines, since the row and column boundaries become ambiguous.",
        "Will not work: scanned PDFs. A scan is an image with no selectable text, so there is nothing to read. You would need OCR first to turn the picture into characters.",
      ]},
      { t: "p", s: "A fast check: open the PDF and try to select a value in the table with your cursor. If it highlights, the [PDF to Excel](/pdf/pdf-to-excel) tool can read it. If nothing selects, the page is an image and extraction will report that no table data was found." },

      { t: "h2", s: "Preview before you download" },
      { t: "p", s: "Automatic detection is not magic, so the tool shows you a live preview of the reconstructed table before you export anything. This is your chance to confirm the rows and columns landed where you expect. If a column looks split in two or two columns look merged into one, that usually means the gaps between columns were unusually narrow or uneven on that particular page - a sign the layout is hard to read automatically. Checking the preview first saves you from importing a messy spreadsheet and having to clean it up afterward." },

      { t: "h2", s: "Excel (XLSX) or CSV?" },
      { t: "p", s: "The tool can export the same table as either an Excel workbook or a CSV file. Both contain identical data; they differ in format and how they open." },
      { t: "ul", items: [
        "Excel (XLSX) opens straight in Excel, Google Sheets or Apple Numbers with formatting intact, and cells that look like numbers are stored as real numbers - so you can sum, sort and chart them immediately. Choose this if the spreadsheet is your destination.",
        "CSV is a plain-text file that almost any program can import - databases, analytics tools, other apps. It has no formatting, just comma-separated values. Choose this for maximum portability or when another system expects a CSV upload.",
      ]},
      { t: "p", s: "With CSV you can also pick the delimiter - comma, semicolon or tab. Semicolon is handy in regions where a comma is the decimal separator, and tab-separated values paste cleanly into a spreadsheet. If you only need the data inside a spreadsheet, XLSX is the simplest choice." },

      { t: "h2", s: "How to extract a table from a PDF" },
      { t: "p", s: "The full process is quick:" },
      { t: "ol", items: [
        "Open the [PDF to Excel](/pdf/pdf-to-excel) tool in your browser.",
        "Load the PDF that contains the table.",
        "Click Extract table and let the tool read every page and rebuild the grid.",
        "Check the preview to confirm the rows and columns look right.",
        "Choose your delimiter if you are exporting CSV, then download the Excel (XLSX) or CSV file.",
        "Open the file in your spreadsheet app and use the data - no retyping required.",
      ]},

      { t: "h2", s: "Privacy: it runs in your browser" },
      { t: "p", s: "Everything happens on your own device. The tool reads the PDF and builds the spreadsheet locally in the browser, so your file is never uploaded to a server. That is especially important for the kinds of documents tables usually live in - bank statements, invoices and financial reports - which you would rather not hand to a third-party website. Because nothing leaves your machine, there are no accounts or upload limits, and the data stays entirely yours." },

      { t: "h2", s: "Extract your table now" },
      { t: "p", s: "Skip the retyping. Load your PDF, let the tool detect the rows and columns, check the preview, and download a ready-to-use spreadsheet. Open the [PDF to Excel](/pdf/pdf-to-excel) tool to pull tables out of a PDF into Excel or CSV in seconds - free, private, and entirely in your browser. If you need the whole document as editable text instead of just a table, the [PDF to Word](/pdf/pdf-to-word) tool converts a PDF into a Word document." },
    ],
    faqs: [
      { q: "How does the tool find the columns without gridlines?", a: "It reads the position of every piece of text, groups text at the same height into rows, and detects columns from the vertical lanes of white space that run down the page between them. Because it works from position rather than any table markup, it handles ordinary PDFs that were never tagged as tables." },
      { q: "Should I download XLSX or CSV?", a: "Both hold the same data. Choose Excel (XLSX) to open directly in Excel, Google Sheets or Numbers with numbers kept as numbers so you can sum and sort them. Choose CSV for a universal plain-text file you can import anywhere, with a choice of comma, semicolon or tab as the delimiter." },
      { q: "Can it extract a table from a scanned PDF?", a: "No. Extraction needs real, selectable text, and a scan is just an image with no characters to read. It works best on digital PDFs such as statements, invoices and reports. To use a scan you would first need OCR to convert the image into text." },
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
  {
    slug: "how-does-a-lumpsum-investment-grow",
    title: "How Does a Lumpsum Investment Grow?",
    h1: "How Does a Lumpsum Investment Grow?",
    desc: "How a one-time lumpsum investment compounds into its maturity value, the formula behind it, how lumpsum differs from an SIP, a full worked example, and the effect of time, rate and tax on your return.",
    category: "finance",
    tool: { slug: "lumpsum-calculator", title: "Lumpsum Calculator" },
    updated: "2026-07-04",
    body: [
      { t: "p", s: "A lumpsum investment is the simplest kind there is: you put a single amount of money to work today and leave it to grow. Unlike a recurring plan where you add a little every month, all of your capital starts compounding from day one - which is exactly why a lumpsum can grow so much over a long horizon. It suits money you already have in hand: a bonus, a maturing deposit, an inheritance or accumulated savings. The question everyone asks is the same: what will it be worth at the end? This guide explains precisely how that maturity value is worked out so you can reproduce and sanity-check the figures in the [Lumpsum Calculator](/finance/lumpsum-calculator)." },

      { t: "h2", s: "The lumpsum growth formula" },
      { t: "p", s: "A lumpsum grows by compound interest - each year's return is added to the balance, and the next year's return is earned on that larger balance. The maturity value is given by a single clean formula:" },
      { t: "ul", items: [
        "Total value = P × (1 + r)^t",
        "where P is the amount you invest today, r is the expected annual return (as a decimal, so 12% = 0.12), and t is the number of years.",
      ]},
      { t: "p", s: "The estimated return - the profit - is simply the total value minus the amount you put in: Returns = Total value − P. The exponent t is what makes compounding powerful: because it sits in the power, doubling the number of years does far more than double the return. Everything the [Lumpsum Calculator](/finance/lumpsum-calculator) shows flows from this one equation." },

      { t: "h2", s: "Why compounding, not simple interest" },
      { t: "p", s: "The reason a lumpsum can multiply so dramatically is that returns compound rather than accumulate in a straight line. With simple interest, a 12% return on 1,00,000 would add a flat 12,000 every year - 1,20,000 of interest over ten years. With compounding, the second year earns 12% not on the original 1,00,000 but on the grown balance, and so on. Each year's gain is bigger than the last. Over ten years that turns the same headline rate into roughly 2,10,000 of interest instead of 1,20,000 - almost double, purely from letting returns earn their own returns. The longer the money stays invested, the wider that gap grows." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take the calculator's defaults: a one-time investment of 1,00,000 at an expected 12% annual return for 10 years. Plug into the formula:" },
      { t: "ul", items: [
        "Growth factor (1 + 0.12)^10 = 1.12^10 ≈ 3.10585.",
        "Total value = 1,00,000 × 3.10585 ≈ 3,10,585.",
        "Estimated returns = 3,10,585 − 1,00,000 = 2,10,585.",
      ]},
      { t: "p", s: "So 1,00,000 left untouched for a decade at 12% grows to about 3,10,585 - more than tripling, with roughly 2,10,585 of that being pure return. Now stretch the horizon: the same 12% over 20 years gives a growth factor of 1.12^20 ≈ 9.6463, so a 2,00,000 lumpsum matures at about 19,29,259, earning around 17,29,259. Doubling the time did not double the return - it grew it many times over, because compounding accelerates. Try your own principal, rate and tenure in the [Lumpsum Calculator](/finance/lumpsum-calculator) to see how each lever moves the result." },

      { t: "h2", s: "The power of time and the Rule of 72" },
      { t: "p", s: "A quick way to feel the effect of compounding without a calculator is the Rule of 72: divide 72 by your annual return to estimate how many years it takes your money to double. At 12%, that is 72 ÷ 12 = 6 years to double, roughly 12 years to quadruple, and 18 years to grow eightfold. This is why starting early matters more than the exact rate - an extra doubling period at the end of a long horizon adds more in absolute rupees than any of the earlier ones. It also shows why small differences in return compound into large differences in outcome over decades." },

      { t: "h2", s: "Lumpsum vs SIP" },
      { t: "p", s: "The main alternative to a lumpsum is a systematic investment plan (SIP), where you invest a fixed amount every month instead of all at once. Neither is simply better - they suit different situations. A lumpsum puts your entire capital to work immediately, so if markets rise it captures the full gain; but it also carries timing risk, because investing everything just before a market dip means the whole amount rides the fall. An SIP spreads your entry across many months, averaging out the purchase price and smoothing the ride, which suits money you earn gradually. If you have a sum in hand today, a lumpsum maximises time in the market; if you are investing from monthly income, an SIP fits naturally. Compare a market-linked SIP projection in the [SIP Calculator](/finance/sip-calculator) against the lumpsum figure here to see the trade-off for your own numbers." },

      { t: "h2", s: "Choosing a realistic rate and the tax angle" },
      { t: "p", s: "The single biggest driver of your result is the return rate you assume - so keep it grounded. Equity mutual funds have historically delivered somewhere around 10-14% over long periods, but returns are not guaranteed and vary year to year; debt funds and fixed-income options return less with less risk. Using an optimistic rate makes the projection look great but sets you up for disappointment, so it is safer to model a conservative figure and treat anything higher as upside. Remember too that the calculator shows the pre-tax maturity value. Real gains on equity funds attract long-term capital gains tax above an annual exemption, and debt fund gains are taxed at your slab rate, so your in-hand return will be a little lower than the headline number. Factor both in before you rely on the estimate." },

      { t: "h2", s: "What the estimate assumes" },
      { t: "p", s: "The formula gives a clean projection, but the real world is bumpier. It assumes a single constant annual return, whereas actual market returns swing above and below that average - the final value is a reasonable expectation, not a promise. It assumes you stay invested for the full term without withdrawing, since pulling money out early cuts short the compounding that does the heavy lifting. It also ignores fund expense ratios and exit loads, which shave a little off real returns. Treat the output as a well-grounded estimate for planning, revisit it if your expected rate changes, and use the [Lumpsum Calculator](/finance/lumpsum-calculator) to compare scenarios rather than to predict an exact future figure." },
    ],
    faqs: [
      { q: "How is the maturity value of a lumpsum calculated?", a: "A lumpsum grows by compound interest: Total value = P × (1 + r)^t, where P is the amount invested, r is the expected annual return as a decimal, and t is the number of years. For example, 1,00,000 at 12% for 10 years grows by a factor of 1.12^10 ≈ 3.10585, giving about 3,10,585. The estimated return is the total value minus the amount invested." },
      { q: "Is a lumpsum or an SIP better?", a: "Neither is universally better - they suit different money. A lumpsum invests your whole capital at once, so it maximises time in the market and captures the full gain if markets rise, but it carries timing risk if you invest just before a dip. An SIP invests a fixed amount monthly, averaging your entry price and smoothing volatility, which suits money earned gradually. Use a lumpsum for a sum you already hold and an SIP for investing from regular income." },
      { q: "Does the calculator account for tax on my returns?", a: "No, the calculator shows the pre-tax maturity value. Real returns are taxed: long-term capital gains on equity funds are taxed above an annual exemption, and debt fund gains are taxed at your income slab rate. Your actual in-hand amount will be somewhat lower than the projected figure, so treat the output as a pre-tax estimate and factor tax in separately when planning." },
    ],
  },
  {
    slug: "how-does-a-systematic-withdrawal-plan-work",
    title: "How Does a Systematic Withdrawal Plan (SWP) Work?",
    h1: "How Does a Systematic Withdrawal Plan (SWP) Work?",
    desc: "How an SWP pays you a fixed amount each month while the rest of your corpus keeps growing, the month-by-month formula behind it, a full worked example, when a corpus runs dry, and how to size a withdrawal that lasts.",
    category: "finance",
    tool: { slug: "swp-calculator", title: "SWP Calculator" },
    updated: "2026-07-05",
    body: [
      { t: "p", s: "A Systematic Withdrawal Plan (SWP) is the mirror image of an SIP. Instead of adding a fixed amount to an investment every month, you take a fixed amount out every month - a self-made pension drawn from a lump sum you already hold. The money you have not yet withdrawn stays invested and keeps earning returns, so the corpus is being pulled in two directions at once: your withdrawals shrink it, and market returns grow it. Whether the balance lasts for decades or runs dry early depends entirely on which force wins. This guide explains exactly how that tug-of-war is resolved month by month, so you can reproduce and sanity-check every figure in the [SWP Calculator](/finance/swp-calculator)." },

      { t: "h2", s: "The month-by-month mechanics" },
      { t: "p", s: "An SWP is not a single formula you plug numbers into - it is a repeating monthly cycle. Each month two things happen in order: the whole remaining balance earns one month of return, and then your fixed withdrawal is taken out. Written as a step:" },
      { t: "ul", items: [
        "New balance = (Previous balance × (1 + i)) − W",
        "where i is the monthly return (annual rate ÷ 12 ÷ 100) and W is your fixed monthly withdrawal.",
      ]},
      { t: "p", s: "That single line is applied over and over - once for every month in your chosen period. Because the withdrawal comes out after the growth, each month you draw from a balance that has just earned a little, and next month's growth is calculated on the slightly smaller balance that remains. This is why an SWP has to be worked out iteratively rather than in one shot, and it is exactly the loop the [SWP Calculator](/finance/swp-calculator) runs internally." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take the calculator's default scenario: a corpus of 10,00,000, a monthly withdrawal of 10,000, an expected return of 8% a year, over 10 years. First find the monthly return: 8 ÷ 12 ÷ 100 = 0.006667. Now walk the first month:" },
      { t: "ul", items: [
        "Month 1 growth: 10,00,000 × 1.006667 ≈ 10,06,667.",
        "Month 1 after withdrawal: 10,06,667 − 10,000 = 9,96,667.",
        "Month 2 growth: 9,96,667 × 1.006667 ≈ 10,03,311, then − 10,000 = 9,93,311.",
      ]},
      { t: "p", s: "Repeat that 120 times and the balance after 10 years lands at about 3,90,180 - and along the way you will have drawn out 10,000 × 120 = 12,00,000. So a 10,00,000 corpus paid you 12,00,000 in income and still left roughly 3,90,180 on the table, because the returns did a large part of the heavy lifting. There is a neat closed-form check for the ending balance: Final = P × (1 + i)^n − W × (((1 + i)^n − 1) ÷ i), where n is the number of months. Plugging in P = 10,00,000, i = 0.006667, n = 120, W = 10,000 gives 3,90,180 - matching the month-by-month result to the rupee. Try your own corpus, withdrawal and rate in the [SWP Calculator](/finance/swp-calculator) to see the ending balance move." },

      { t: "h2", s: "When does the corpus run out?" },
      { t: "p", s: "An SWP does not always end with money left over. If your monthly withdrawal is larger than the return the corpus earns, the balance falls a little every month, and eventually a withdrawal takes it to zero. Keep the same 10,00,000 corpus and 8% return but raise the withdrawal to 15,000 a month: the corpus now depletes in month 89 - about 7 years and 5 months - well short of a 20-year plan. The calculator watches for exactly this and flags roughly when the money runs out, so you are not caught assuming an income that stops early. The lesson is that the headline period you choose is only achievable if the withdrawal is sustainable; otherwise the plan quietly ends sooner." },

      { t: "h2", s: "Sizing a withdrawal that lasts" },
      { t: "p", s: "The pivotal number is the monthly return your corpus earns in rupees. On 10,00,000 at 8% a year, one month of return is about 10,00,000 × 0.006667 ≈ 6,667. If you withdraw less than that, the corpus keeps growing even as it pays you; if you withdraw exactly that, it roughly holds steady; withdraw more, and it erodes. So a rough rule for a corpus you want to preserve indefinitely is to keep the monthly withdrawal at or below the monthly return - here, around 6,667. Drawing 10,000 (above 6,667) is why the default scenario shrinks over the decade rather than growing, yet it still lasts because the gap is small. If you need a specific income, you can work backwards: a higher corpus or a lower withdrawal both push the plan toward lasting longer." },

      { t: "h2", s: "SWP versus a fixed deposit or dividend" },
      { t: "p", s: "People often compare an SWP with simply parking money in a deposit and living off the interest, or holding funds for dividends. The difference is control and tax treatment. With an SWP you decide the exact amount and date of each payout regardless of what the fund distributes, and because each withdrawal is partly your own capital and partly gains, only the gains portion is taxed - often making it more tax-efficient than fully-taxed interest income. A deposit pays a contractually fixed rate with no market risk but no growth beyond it, while an SWP keeps the balance invested for potential growth at the cost of return uncertainty. If you are drawing a regular income from a lump sum and want flexibility with some growth, an SWP is the tool; if you cannot tolerate any fall in the balance, a deposit is safer. You can contrast the growth side of the same money in the [SIP Calculator](/finance/sip-calculator)." },

      { t: "h2", s: "What the estimate assumes" },
      { t: "p", s: "The calculation is precise, but it rests on a few assumptions worth naming. It uses a single constant monthly return, whereas real fund returns swing above and below that average - a bad run of early months hurts an SWP more than a good run helps, because you are withdrawing from a temporarily smaller balance (sequence-of-returns risk). It assumes withdrawals are taken at the end of each month and never change, though in practice you might raise them for inflation, which shortens how long the corpus lasts. It also shows pre-tax figures and ignores fund exit loads and expense ratios. Treat the output as a well-grounded planning estimate rather than a guarantee, revisit it whenever your return expectation or income need changes, and use the [SWP Calculator](/finance/swp-calculator) to compare scenarios rather than to predict an exact future balance." },
    ],
    faqs: [
      { q: "How does an SWP calculator work?", a: "It runs a month-by-month loop. Each month the whole remaining balance earns one month of return - the annual rate divided by 12 - and then your fixed withdrawal is subtracted: New balance = Previous balance × (1 + i) − W. Repeating this for every month in your chosen period gives the balance left at the end, and the calculator flags if the corpus hits zero before the period is over." },
      { q: "Can my corpus run out before the plan ends?", a: "Yes. If your monthly withdrawal is bigger than the return the corpus earns, the balance falls each month and a withdrawal eventually takes it to zero. For example, a 10,00,000 corpus at 8% withdrawing 15,000 a month runs dry in about 7 years 5 months. The safest way to make a corpus last is to keep the monthly withdrawal at or below the monthly return it earns - roughly 6,667 on 10,00,000 at 8%." },
      { q: "Is SWP income taxed?", a: "The calculator shows pre-tax amounts. In reality, each SWP withdrawal is treated as part return-of-capital and part gains, and only the gains portion is taxable, which often makes an SWP more tax-efficient than fully-taxed deposit interest. The exact tax depends on the fund type and how long you have held the units, so treat the calculator's figures as pre-tax and factor your own tax position in separately." },
    ],
  },
  {
    slug: "how-is-cagr-calculated",
    title: "What Is CAGR and How Is It Calculated?",
    h1: "What Is CAGR and How Is It Calculated?",
    desc: "What compound annual growth rate (CAGR) means, the formula behind it, a full worked example, why it beats a simple average return, how it differs from total return, and where it falls short.",
    category: "finance",
    tool: { slug: "cagr-calculator", title: "CAGR Calculator" },
    updated: "2026-07-06",
    body: [
      { t: "p", s: "CAGR - compound annual growth rate - is the single most useful number for describing how fast an investment grew. It answers a deceptively simple question: if this investment had grown at the same steady rate every year, what would that rate have to be to get from where it started to where it ended? Real returns are never that smooth - a fund might jump 30% one year and slip 8% the next - but CAGR strips out all that noise and gives you one clean per-year figure. That is what makes it the standard yardstick for comparing investments held for different lengths of time. This guide explains exactly how CAGR is worked out so you can reproduce and sanity-check every figure in the [CAGR Calculator](/finance/cagr-calculator)." },

      { t: "h2", s: "The CAGR formula" },
      { t: "p", s: "CAGR is calculated from just three inputs: the value you started with, the value you ended with, and how many years passed in between. No interim data is needed. The formula is:" },
      { t: "ul", items: [
        "CAGR = ((Final value / Initial value)^(1 / years) − 1) × 100",
        "where the result is expressed as a percentage per year.",
      ]},
      { t: "p", s: "The logic is the reverse of compounding. Compounding takes a rate and grows a starting amount over time; CAGR takes the start and end amounts and time, and solves for the rate that connects them. The ratio Final / Initial is the total growth factor over the whole period; raising it to the power of 1 / years takes the geometric annual root of that growth; subtracting 1 turns the growth factor into a rate; and multiplying by 100 expresses it as a percentage. Because the exponent is a root rather than a simple division, CAGR correctly accounts for the fact that returns compound on themselves year after year - which is exactly why the [CAGR Calculator](/finance/cagr-calculator) uses this equation rather than dividing total return by the number of years." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you invested 1,00,000 and it grew to 2,50,000 over 5 years. Plug the numbers straight in:" },
      { t: "ul", items: [
        "Growth factor = 2,50,000 / 1,00,000 = 2.5.",
        "Annual root = 2.5^(1 / 5) = 2.5^0.2 ≈ 1.20112.",
        "CAGR = (1.20112 − 1) × 100 ≈ 20.11% per year.",
      ]},
      { t: "p", s: "So the investment compounded at about 20.11% a year. You can verify it runs the other way: 1,00,000 × 1.20112^5 = 1,00,000 × 2.5 = 2,50,000, right back to the final value. Notice how different this is from the headline total return: the money grew 150% in total (from 1,00,000 to 2,50,000), but that total gain spread across five compounding years works out to only about 20.11% per year, not 150% ÷ 5 = 30%. Dividing the total return by the years overstates the annual rate because it ignores compounding. Try your own start value, end value and tenure in the [CAGR Calculator](/finance/cagr-calculator) to see the rate for any investment." },

      { t: "h2", s: "Why CAGR beats a simple average" },
      { t: "p", s: "The temptation is to average a run of yearly returns, but a plain average badly misleads whenever returns swing. Imagine an investment that gains 80% in year one and loses 30% in year two. The naive average is (80 − 30) / 2 = 25% a year, which sounds excellent. But work out what actually happened to 1,00,000: it rises to 1,80,000, then falls 30% to 1,26,000. Feed that into CAGR - start 1,00,000, end 1,26,000, 2 years - and the true compounded rate is about 12.25% a year, less than half the naive average. The gap appears because a percentage loss bites a bigger balance than the earlier gain built, and a simple average is blind to that. CAGR uses the geometric root instead of the arithmetic mean, so it always reflects the money you truly ended up with. This is why fund fact sheets quote CAGR rather than an average of annual returns." },

      { t: "h2", s: "CAGR vs total return" },
      { t: "p", s: "Total return is the overall percentage gain across the whole holding period - in the first example, 150%. It is a perfectly good measure of how much you made, but it says nothing about how long it took, which makes it useless for comparison. A 150% total return earned over 5 years is a very different investment from a 150% return earned over 15 years, yet both share the same total-return figure. CAGR solves this by converting any total return into a per-year rate, putting every investment on the same annual footing regardless of horizon. The 150%-over-5-years case is about 20.11% CAGR; the same 150% stretched over 15 years is only about 6.3% CAGR. Whenever you want to rank investments held for different periods, convert each to CAGR first and compare those." },

      { t: "h2", s: "The power of the horizon" },
      { t: "p", s: "Because years sit in the exponent, the same absolute gain implies a wildly different CAGR depending on how long it took. Doubling your money - 1,00,000 to 2,00,000 - is a fixed 100% total return, but the annual rate needed to achieve it collapses as the horizon lengthens: it takes about 25.99% a year to double in 3 years, but only about 5.95% a year to double in 12 years. A quick mental shortcut is the Rule of 72: divide 72 by a CAGR to estimate the years it takes to double at that rate. At roughly 12.25% CAGR, 72 ÷ 12.25 ≈ 5.9 years to double - a handy sanity check you can run without a calculator. The lesson for planning is that a modest-sounding CAGR sustained over a long horizon quietly doubles and redoubles your money." },

      { t: "h2", s: "Where CAGR falls short" },
      { t: "p", s: "CAGR is a summary, and like any summary it hides detail. Its biggest blind spot is that it only looks at the start and end points, so it completely ignores the ride in between - two investments that both went from 1,00,000 to 2,50,000 in 5 years have identical CAGR even if one climbed smoothly and the other crashed 40% midway before recovering. It therefore tells you nothing about volatility or risk, and it can flatter an investment that happened to end on a high. CAGR also assumes a single lump sum left untouched: it does not account for money you add or withdraw along the way, so for a SIP or any series of cash flows you need a different measure such as XIRR rather than plain CAGR. And, like all such figures, the calculator's output is pre-tax and pre-cost. Treat CAGR as a clean way to compare and describe past growth - use it alongside a look at the volatility and your own cash-flow pattern, and reach for the [CAGR Calculator](/finance/cagr-calculator) whenever you need the annual rate for a start value, end value and period." },
    ],
    faqs: [
      { q: "How is CAGR calculated?", a: "CAGR = ((Final value / Initial value)^(1 / years) − 1) × 100. You take the ratio of the ending to the starting value, raise it to the power of one divided by the number of years, subtract 1, and multiply by 100. For example, 1,00,000 growing to 2,50,000 over 5 years gives (2.5^(1/5) − 1) × 100 ≈ 20.11% per year. It is the constant annual rate that would grow the initial value to the final value with compounding." },
      { q: "Why is CAGR different from the average annual return?", a: "A simple average of yearly returns ignores compounding and overstates the true rate whenever returns fluctuate. If an investment gains 80% then loses 30%, the naive average is 25% a year, but 1,00,000 actually ends at 1,26,000, a CAGR of only about 12.25%. CAGR uses the geometric root rather than the arithmetic mean, so it always reflects the money you genuinely ended up with - which is why fund fact sheets quote CAGR, not an average." },
      { q: "What are the limitations of CAGR?", a: "CAGR only uses the starting and ending values, so it ignores everything in between - it says nothing about volatility, and two investments with very different rides can share the same CAGR. It also assumes a single lump sum with no additions or withdrawals, so for SIPs or irregular cash flows you need XIRR instead. Finally, the figure is pre-tax and pre-cost. Use CAGR to compare and describe growth, but pair it with a look at risk and your own cash-flow pattern." },
    ],
  },
  {
    slug: "how-is-roi-calculated",
    title: "What Is ROI and How Is It Calculated?",
    h1: "What Is ROI and How Is It Calculated?",
    desc: "What return on investment (ROI) means, the simple formula behind it, a full worked example, the difference between total and annualized ROI, and the costs and blind spots the raw number leaves out.",
    category: "finance",
    tool: { slug: "roi-calculator", title: "ROI Calculator" },
    updated: "2026-07-07",
    body: [
      { t: "p", s: "Return on investment - ROI - is the most widely quoted measure of whether something you put money into actually paid off. It answers one plain question: for every unit of money you committed, how much did you get back on top? Because it boils any investment down to a single percentage, ROI lets you line up wildly different things - a stock, a rental flat, a marketing campaign, a course - on the same scale and see which one worked hardest for your money. This guide explains exactly how ROI is worked out, so you can reproduce and sanity-check every figure the [ROI Calculator](/finance/roi-calculator) shows." },
      { t: "h2", s: "The ROI formula" },
      { t: "p", s: "ROI needs only two numbers: what you put in, and what you ended up with. Everything else is arithmetic." },
      { t: "ul", items: [
        "Net gain = Final value − Amount invested",
        "ROI = (Net gain / Amount invested) × 100",
        "which is the same as ROI = ((Final value − Amount invested) / Amount invested) × 100.",
      ] },
      { t: "p", s: "The net gain is the raw profit in currency - simply what you got back minus what you put in. Dividing that gain by the amount invested rescales it relative to the size of the bet, and multiplying by 100 turns the ratio into a percentage. Expressing profit as a percentage of the outlay is the whole point: a 20,000 gain sounds identical whether you risked 40,000 or 4,00,000, but the first is a 50% ROI and the second only 5%. That is why the [ROI Calculator](/finance/roi-calculator) always reports the percentage alongside the raw gain rather than the gain alone." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you invested 1,00,000 and it is now worth 2,50,000. Drop the numbers straight in:" },
      { t: "ul", items: [
        "Net gain = 2,50,000 − 1,00,000 = 1,50,000.",
        "ROI = (1,50,000 / 1,00,000) × 100 = 150%.",
      ] },
      { t: "p", s: "So you more than doubled your money: a 150% return means you got back your original 1,00,000 plus another 1,50,000 in profit. A useful mental check is that a 100% ROI is exactly doubling your money, so anything above 100% means you made more in profit than you originally put in. Enter your own amount invested and final value in the [ROI Calculator](/finance/roi-calculator) to see the return for any investment." },
      { t: "h2", s: "Negative ROI: measuring a loss" },
      { t: "p", s: "ROI is not always positive, and the formula handles losses without any change. If you invested 1,20,000 and the position is now worth 96,000, the net gain is 96,000 − 1,20,000 = −24,000, so ROI = (−24,000 / 1,20,000) × 100 = −20%. The minus sign is the whole story: a negative ROI means you ended with less than you started, and its size tells you how much of your capital was eroded. Note the floor - the worst possible ROI is −100%, which is losing everything; you cannot lose more than you invested, so ROI on a simple long investment never goes below −100%." },
      { t: "h2", s: "Total ROI vs annualized ROI" },
      { t: "p", s: "Plain ROI has one big blind spot: it says nothing about how long the money was tied up. A 150% return is spectacular in three years and mediocre across thirty, yet both show the same 150% ROI. To compare investments held for different lengths of time you need to spread the return across the years it took, and the correct way to do that is not to divide by the number of years - that ignores compounding - but to take the geometric annual rate:" },
      { t: "ul", items: [
        "Annualized ROI = ((Final value / Amount invested)^(1 / years) − 1) × 100",
      ] },
      { t: "p", s: "Take the 1,00,000 growing to 2,50,000, but say it happened over 4 years. The total ROI is still 150%, but the annualized ROI is (2,50,000 / 1,00,000)^(1/4) − 1 = 2.5^0.25 − 1 ≈ 25.74% per year. That per-year figure is what makes different holding periods comparable. To see how much the horizon matters, consider two investments that both returned 50% in total: earned over 2 years that is about 22.47% a year, but stretched over 5 years the same 50% is only about 8.45% a year - less than half the annual rate for an identical headline return. Whenever you enter a holding period, the [ROI Calculator](/finance/roi-calculator) shows this annualized figure next to the total so you can rank investments fairly." },
      { t: "h2", s: "What ROI leaves out" },
      { t: "p", s: "ROI is a clean summary, and like any summary it hides things you should not ignore. First, it is only as honest as the two numbers you feed it: if the amount invested leaves out fees, brokerage, taxes or the value of your own time, the ROI will be flattered. A true final value should also be net of any exit costs. Second, plain ROI ignores time entirely - always reach for the annualized figure when comparing across different periods. Third, it says nothing about risk or volatility: a steady 12% and a white-knuckle ride that happened to end at 12% look identical, so ROI should never be read without some sense of how bumpy the journey was. Finally, for investments where you add or withdraw money over time - a SIP, a drip-fed campaign - a single ROI on the start and end values is misleading, and you need a cash-flow measure such as XIRR instead. Treat ROI as the honest headline it is: quick, comparable and clear, but best read alongside the time taken, the costs involved and the risk you carried. Reach for the [ROI Calculator](/finance/roi-calculator) whenever you need the return for an amount invested and a final value." },
    ],
    faqs: [
      { q: "How is ROI calculated?", a: "ROI = ((Final value − Amount invested) / Amount invested) × 100. You subtract what you put in from what you got back to get the net gain, divide that by the amount invested, and multiply by 100. For example, 1,00,000 growing to 2,50,000 gives a net gain of 1,50,000 and an ROI of (1,50,000 / 1,00,000) × 100 = 150%. Expressing the profit as a percentage of the outlay lets you compare investments of very different sizes on the same scale." },
      { q: "What is the difference between total ROI and annualized ROI?", a: "Total ROI is the overall percentage return across the whole holding period and ignores how long it took, so 150% looks the same over 3 years or 30. Annualized ROI spreads that return across the years using the geometric rate ((Final / Invested)^(1/years) − 1) × 100, giving a per-year figure that makes different periods comparable. For instance, 1,00,000 to 2,50,000 is 150% total, but over 4 years that is about 25.74% a year." },
      { q: "Can ROI be negative?", a: "Yes. If the final value is less than the amount invested, the net gain is negative and so is the ROI. Investing 1,20,000 that falls to 96,000 gives a net loss of 24,000 and an ROI of −20%. The most you can lose on a simple long investment is your whole outlay, so ROI has a floor of −100%, which represents losing everything." },
    ],
  },
  {
    slug: "how-is-simple-interest-calculated",
    title: "What Is Simple Interest and How Is It Calculated?",
    h1: "What Is Simple Interest and How Is It Calculated?",
    desc: "What simple interest means, the SI = P × R × T / 100 formula explained term by term, a full worked example, how to rearrange it to find the rate, time or principal, and how it differs from compound interest.",
    category: "finance",
    tool: { slug: "simple-interest-calculator", title: "Simple Interest Calculator" },
    updated: "2026-07-08",
    body: [
      { t: "p", s: "Simple interest is the most basic way of putting a price on borrowed or lent money. It answers a single question: for a fixed principal, a fixed annual rate and a fixed length of time, how much extra do you pay or earn? The defining feature is that the interest is worked out on the original amount only - it never earns interest on itself. That makes simple interest easy to compute by hand and a natural starting point for understanding car loans, short-term deposits, friend-to-friend lending and the interest clauses in many everyday contracts. This guide walks through the formula term by term so you can reproduce and check every number the [Simple Interest Calculator](/finance/simple-interest-calculator) gives you." },
      { t: "h2", s: "The simple interest formula" },
      { t: "p", s: "Simple interest needs three inputs, and the formula ties them together with nothing more than multiplication and division:" },
      { t: "ul", items: [
        "SI = P × R × T / 100",
        "P is the principal - the original sum borrowed or deposited.",
        "R is the annual interest rate, written as a percentage per year.",
        "T is the time the money is borrowed or invested, in years.",
      ] },
      { t: "p", s: "The total amount you end with is then just the principal plus the interest: Total = P + SI. The division by 100 is only there because R is quoted as a percentage - if you preferred to feed in the rate as a decimal (0.08 rather than 8), you would write SI = P × R × T and drop the 100. The key thing to notice is that P, R and T all sit on the top of the fraction, so the interest scales in a straight line with each of them: double the time and you double the interest, double the rate and you double it again. That linear growth is exactly what separates simple interest from compound interest." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you deposit 2,00,000 in a scheme paying 8% simple interest a year and leave it for 5 years. Put the numbers straight into the formula:" },
      { t: "ul", items: [
        "SI = 2,00,000 × 8 × 5 / 100 = 80,00,000 / 100 = 80,000.",
        "Total = 2,00,000 + 80,000 = 2,80,000.",
      ] },
      { t: "p", s: "So over five years the deposit earns 80,000 in interest and grows to 2,80,000. A quick sanity check: 8% of 2,00,000 is 16,000 a year, and 16,000 across 5 years is 80,000 - the same answer, because simple interest is simply the same yearly amount repeated. Enter your own principal, rate and term in the [Simple Interest Calculator](/finance/simple-interest-calculator) and it does this multiplication for you and splits out the interest from the total." },
      { t: "h2", s: "Handling months and days" },
      { t: "p", s: "The formula assumes T is measured in years, but plenty of real loans and deposits run for months. The fix is to convert the period into a fraction of a year before multiplying: nine months is 9/12 = 0.75 years, and ninety days on a 365-day basis is 90/365 ≈ 0.2466 years. For example, 50,000 lent at 12% for 6 months gives SI = 50,000 × 12 × 0.5 / 100 = 3,000. Keeping the rate annual and expressing the time as a fraction of a year is the reliable way to avoid the most common simple-interest mistake, which is mixing a monthly period with an annual rate." },
      { t: "h2", s: "Rearranging the formula" },
      { t: "p", s: "Because SI = P × R × T / 100 has four quantities, knowing any three lets you solve for the fourth. Rearranging gives three companion formulas:" },
      { t: "ul", items: [
        "Rate: R = SI × 100 / (P × T)",
        "Time: T = SI × 100 / (P × R)",
        "Principal: P = SI × 100 / (R × T)",
      ] },
      { t: "p", s: "These are handy for reverse questions. To find the rate that turns 1,00,000 into 24,000 of interest over 3 years, R = 24,000 × 100 / (1,00,000 × 3) = 8% a year. To find how long 1,50,000 must sit at 5% to earn 30,000 of interest, T = 30,000 × 100 / (1,50,000 × 5) = 4 years. The arithmetic is the same in every direction, which is one of the quiet advantages of simple interest over more complex models." },
      { t: "h2", s: "Simple interest vs compound interest" },
      { t: "p", s: "The crucial contrast is what the interest is charged on. Simple interest is always computed on the original principal, so it grows in a straight line. Compound interest is computed on the principal plus all the interest earned so far, so each period's interest is slightly larger than the last and the balance curves upward. Over short periods the gap is small, but it widens with time. Take the earlier deposit - 2,00,000 at 8% for 5 years. Simple interest earns a flat 80,000. Compounded once a year, the same deposit grows to 2,00,000 × 1.08^5 ≈ 2,93,866, an interest of about 93,866 - roughly 13,866 more, purely because the interest was itself earning interest. When you are the lender or saver, compounding works in your favour; when you are the borrower, simple interest is usually the cheaper deal. To see the compounding side of this comparison, try the compound interest calculator, and use the [Simple Interest Calculator](/finance/simple-interest-calculator) whenever the interest is charged on the principal alone." },
      { t: "h2", s: "Where simple interest actually shows up" },
      { t: "p", s: "Simple interest is not just a textbook exercise. It is the basis of many car and personal loans, most short-term deposits and bonds that pay a flat coupon, the interest on unpaid invoices and late fees, and informal lending between people. Whenever a contract quotes a flat rate on the original amount with no mention of compounding, simple interest is the right model. Just remember its two boundaries: it assumes the rate never changes over the term, and it ignores compounding entirely - so for long-horizon savings or anything that reinvests its earnings, reach for a compound model instead. For the everyday flat-rate case, the [Simple Interest Calculator](/finance/simple-interest-calculator) gives you the interest and the total in one step." },
    ],
    faqs: [
      { q: "What is the simple interest formula?", a: "Simple interest is SI = P × R × T / 100, where P is the principal, R is the annual interest rate as a percentage, and T is the time in years. The total amount you end with is the principal plus the interest, P + SI. For example, 2,00,000 at 8% for 5 years earns 2,00,000 × 8 × 5 / 100 = 80,000 in interest, for a total of 2,80,000. The interest is charged only on the original principal, so it grows in a straight line." },
      { q: "How do I calculate simple interest for a period in months?", a: "Convert the period into a fraction of a year before applying the formula, keeping the rate annual. Six months is 6/12 = 0.5 years, and nine months is 9/12 = 0.75 years. So 50,000 lent at 12% a year for 6 months earns SI = 50,000 × 12 × 0.5 / 100 = 3,000. The most common mistake is pairing a monthly period with an annual rate without converting, which overstates the interest twelvefold." },
      { q: "How is simple interest different from compound interest?", a: "Simple interest is always calculated on the original principal, so it grows linearly and each year adds the same amount. Compound interest is calculated on the principal plus the interest accumulated so far, so it grows faster over time. For 2,00,000 at 8% over 5 years, simple interest earns a flat 80,000, while annual compounding earns about 93,866 - roughly 13,866 more, because the interest itself starts earning interest." },
    ],
  },
  {
    slug: "how-does-inflation-affect-purchasing-power",
    title: "How Inflation Erodes the Value of Money",
    h1: "How Inflation Erodes the Value of Money",
    desc: "What inflation is, the future-cost and purchasing-power formulas explained, a worked example over 10 and 25 years, why real returns matter more than headline returns, and how to plan around rising prices.",
    category: "finance",
    tool: { slug: "inflation-calculator", title: "Inflation Calculator" },
    updated: "2026-07-09",
    body: [
      { t: "p", s: "Inflation is the slow, steady rise in the general level of prices, and its most important consequence is that a fixed sum of money buys less as time passes. The 100 in your pocket today will not command the same basket of goods in ten years, because the price tags on nearly everything - groceries, rent, fuel, services - tend to drift upward. Understanding inflation is not an academic exercise: it decides whether your savings are actually growing, how much you need to retire, and whether a pay rise is a real gain or just running to stand still. This guide explains the two calculations at the heart of inflation - what an amount will cost in future and what today's money will be worth - and shows how to use them with the [Inflation Calculator](/finance/inflation-calculator) to plan realistically." },
      { t: "h2", s: "The future-cost formula" },
      { t: "p", s: "Inflation compounds in exactly the way interest does, just working against you. If prices rise by a steady rate each year, the future cost of something that costs a certain amount today is found by compounding that amount forward:" },
      { t: "ul", items: [
        "Future cost = Present amount × (1 + r)^n",
        "Present amount is what the item or basket costs today.",
        "r is the annual inflation rate, written as a decimal (6% becomes 0.06).",
        "n is the number of years into the future.",
      ] },
      { t: "p", s: "The exponent is what makes inflation deceptively powerful. Because each year's prices rise on top of the previous year's already-raised prices, the cost curve bends upward rather than climbing in a straight line. A rate that sounds modest in a single year - 6%, say - stacks up to a very different number across a decade or a working lifetime." },
      { t: "h2", s: "The purchasing-power formula" },
      { t: "p", s: "The flip side of rising prices is falling purchasing power: what a fixed amount of money can actually buy shrinks over time. To find the future purchasing power of a sum you hold today, you divide instead of multiply:" },
      { t: "ul", items: [
        "Future value of today's money = Present amount / (1 + r)^n",
      ] },
      { t: "p", s: "This tells you what a nominal amount will really be worth once inflation has eaten into it. It is the calculation that matters for anyone holding cash, a fixed pension, or a savings balance that is not keeping pace with prices - the number on the statement stays the same, but the groceries it buys keep shrinking. The [Inflation Calculator](/finance/inflation-calculator) reports both directions at once: the future cost of an amount and what that amount will be worth in tomorrow's money." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose something costs 1,00,000 today and inflation runs at a steady 6% a year. Over 10 years:" },
      { t: "ul", items: [
        "Future cost = 1,00,000 × (1.06)^10 ≈ 1,79,085.",
        "Purchasing power of today's 1,00,000 = 1,00,000 / (1.06)^10 ≈ 55,839.",
      ] },
      { t: "p", s: "So the same item that costs 1,00,000 now will cost about 1,79,085 in a decade - it has risen by almost four-fifths. Read the other way, the 1,00,000 you hold today will buy only about 55,839 worth of goods in ten years' time; more than 44% of its purchasing power has quietly evaporated. Stretch the horizon further and the effect compounds harder: 50,000 held for 25 years at 7% inflation would need to grow to about 2,71,372 just to buy the same things, and left as idle cash it would be worth only about 9,212 in today's terms. Enter your own amount, rate and number of years in the [Inflation Calculator](/finance/inflation-calculator) to see both figures instantly." },
      { t: "h2", s: "Why real returns matter more than headline returns" },
      { t: "p", s: "The most important lesson inflation teaches is to judge an investment by its real return - the growth left over after inflation - rather than its headline, or nominal, return. The relationship is not a simple subtraction. The precise real return is:" },
      { t: "ul", items: [
        "Real return = (1 + nominal rate) / (1 + inflation rate) − 1",
      ] },
      { t: "p", s: "If an investment earns a nominal 10% while inflation is 6%, a quick subtraction suggests a 4% real gain - but the exact figure is (1.10 / 1.06) − 1 ≈ 3.77%. The subtraction shortcut is close enough for rough work and always slightly optimistic, but the point stands: a savings account paying 6% during 6% inflation earns you nothing in real terms, and anything paying below the inflation rate is quietly losing you money even as the balance ticks up. This is why holding large sums as idle cash is rarely a neutral choice - it is a slow, guaranteed erosion." },
      { t: "h2", s: "How much does inflation halve your money?" },
      { t: "p", s: "A useful shortcut for gauging inflation's speed is the Rule of 70: divide 70 by the annual inflation rate to estimate how many years it takes for prices to double - and equivalently for the value of cash to roughly halve. At 6% inflation, 70 / 6 ≈ 11.7 years, which matches the exact figure of about 11.9 years closely enough for planning. At 3% it takes roughly 23 years; at 10%, just 7. The rule turns an abstract percentage into a concrete timeline and is a fast sanity check on any long-range plan, from a retirement target to the future price of a house or a child's education." },
      { t: "h2", s: "Planning around inflation" },
      { t: "p", s: "Because inflation is relentless and compounding, the practical response is to make sure the money you are relying on for the future grows faster than prices. Three habits help. First, set financial goals in future rupees, not today's - if you want the buying power of 50,000 a month in retirement thirty years out, size the target using the future-cost formula, not the sticker figure. Second, favour assets whose long-run returns have historically outpaced inflation over holding large balances in low-yield cash. Third, revisit your assumptions periodically, since inflation rates shift and a plan built on last decade's numbers can drift. Whenever you need to convert between today's money and tomorrow's - or check whether a return is really beating inflation - run the numbers through the [Inflation Calculator](/finance/inflation-calculator) so your plan is anchored to real purchasing power rather than nominal amounts." },
    ],
    faqs: [
      { q: "How do I calculate the future cost of something due to inflation?", a: "Use Future cost = Present amount × (1 + r)^n, where r is the annual inflation rate as a decimal and n is the number of years. For example, an item costing 1,00,000 today with 6% inflation will cost 1,00,000 × (1.06)^10 ≈ 1,79,085 in ten years. Inflation compounds, so each year's prices rise on top of the previous year's, which is why the cost climbs faster than a simple year-times-rate estimate would suggest." },
      { q: "What happens to the purchasing power of my savings under inflation?", a: "Purchasing power falls, because the same money buys fewer goods as prices rise. The future value of today's money is Present amount / (1 + r)^n. At 6% inflation, 1,00,000 held as cash for 10 years will buy only about 55,839 worth of goods in today's terms - a loss of more than 44% of its value - even though the number on the statement never changes." },
      { q: "What is a real return and why does it matter?", a: "A real return is the growth of an investment after inflation, calculated as (1 + nominal rate) / (1 + inflation rate) − 1. A nominal 10% return with 6% inflation gives a real return of about 3.77%, not the 4% a simple subtraction suggests. It matters because only the real return grows your actual buying power - an account paying below the inflation rate is losing you money in real terms even as the balance rises." },
    ],
  },
  {
    slug: "how-does-word-and-character-counting-work",
    title: "Word Count, Character Count and Reading Time Explained",
    h1: "Word Count, Character Count and Reading Time Explained",
    desc: "What actually counts as a word, the difference between characters with and without spaces, how reading time is estimated, the word and character limits that matter for essays, tweets and SEO, and how many words fit on a page.",
    category: "text",
    tool: { slug: "word-counter", title: "Word Counter" },
    updated: "2026-07-10",
    body: [
      { t: "p", s: "Counting words sounds trivial until you have to hit an exact essay limit, fit a message inside a character cap, or estimate how long an article takes to read. The rules are less obvious than they look: what counts as a word, whether spaces count as characters, and how reading time is worked out all depend on conventions that vary between tools. This guide explains how word and character counting actually works, so the numbers in the [Word Counter](/text/word-counter) mean exactly what you expect. Everything runs in your browser as you type, so you can paste a draft and watch the totals update instantly without anything being uploaded." },
      { t: "h2", s: "What actually counts as a word" },
      { t: "p", s: "A word counter splits your text on whitespace - spaces, tabs and line breaks - and counts the non-empty chunks that remain. In practice that means a word is any run of characters bounded by spaces, so \"self-contained\" counts as one word even though it contains a hyphen, and \"e.g.\" counts as one because there is no space inside it. Numbers like \"2026\" and standalone symbols separated by spaces each count as a word too. This whitespace rule is why pasting text with double spaces or trailing blanks does not inflate the total: empty chunks are discarded. It also means the count matches what a human would tally by eye far more often than not, which is exactly why essay and assignment limits are almost always expressed in words rather than characters - words are a stable measure of how much you have actually written, regardless of how long the individual words are." },
      { t: "h2", s: "Characters, with and without spaces" },
      { t: "p", s: "Character counts are where most confusion arises, because there are two legitimate figures and they can differ by a lot. The characters-including-spaces total counts every keystroke: letters, digits, punctuation and the spaces between words. The characters-excluding-spaces total strips out the spaces (and usually line breaks) and counts only the visible marks. For a typical sentence, spaces make up roughly 15 to 18 percent of the total, so the two numbers can be hundreds of characters apart in a long piece. Which one you need depends on the platform. Social networks and SMS count every space against your limit, so you want the including-spaces figure. Some academic and design specs ask for characters excluding spaces. The [Word Counter](/text/word-counter) shows both side by side so you never have to guess which convention a form is using." },
      { t: "h2", s: "Sentences, paragraphs and reading time" },
      { t: "p", s: "Beyond words and characters, a good counter also breaks text into sentences and paragraphs. Sentences are detected by terminal punctuation - full stops, question marks and exclamation marks - while paragraphs are separated by blank lines. These structural counts are useful for checking readability: very long paragraphs and sprawling sentences are the two most common signs that a draft needs tightening. Reading time is estimated from the word count using an average silent reading speed of about 200 to 250 words per minute for an adult. So an 800-word article works out to roughly three to four minutes: 800 divided by 250 is 3.2 minutes, and divided by 200 is 4 minutes. A 1,500-word piece lands near six to seven minutes. The estimate is deliberately a range because reading speed varies with the difficulty of the material, but it is accurate enough to set expectations on a blog post or to size a speech." },
      { t: "h2", s: "The word and character limits that matter" },
      { t: "p", s: "A surprising amount of everyday writing is governed by hard limits. Knowing the common ones lets you write to fit rather than trimming after the fact:" },
      { t: "ul", items: [
        "A post on X (formerly Twitter) is capped at 280 characters, including spaces and links.",
        "A single SMS text message is 160 characters; longer messages are split and billed as multiple parts.",
        "A Google search-result title displays cleanly at about 50 to 60 characters, and a meta description at about 150 to 160 characters before it gets truncated.",
        "An Instagram caption allows up to 2,200 characters, though only the first line or two shows before \"more\".",
        "University essays and job applications are usually set in words - 500, 650 (a common admissions-essay length) or 1,000 are typical.",
        "A LinkedIn headline is limited to 220 characters and a summary to 2,600.",
      ] },
      { t: "p", s: "Because these targets mix words and characters, it helps to keep both totals in view while drafting. Paste your text into the [Word Counter](/text/word-counter) and you can see at a glance whether a tweet is over by twelve characters or whether an essay is a hundred words short, rather than discovering it only when a form rejects your submission." },
      { t: "h2", s: "How many words fit on a page?" },
      { t: "p", s: "\"How long is a page?\" comes up constantly for essays, reports and manuscripts, and the answer depends almost entirely on spacing. Using a standard 12-point serif font with one-inch margins, a single-spaced page holds roughly 500 words, while a double-spaced page - the norm for academic submissions - holds about 250. So a 2,000-word essay is around four double-spaced pages or two single-spaced ones. Font choice shifts this: a wider or larger typeface fits fewer words per page, which is why page-count requirements are far less reliable than word counts and why most institutions have moved to specifying words. If you have been given a page target, converting it to words with these ratios and then writing to that word count is the most dependable way to land in the right place." },
      { t: "h2", s: "How to hit a target word count" },
      { t: "p", s: "When you need to reach an exact figure, work with the live count rather than guessing. Write freely first, then use the running word total to see how far off you are before editing to close the gap - it is far easier to trim a 1,200-word draft to a 1,000-word limit than to pad a thin one, so slightly overwriting is a good tactic. If you are under, look for claims that deserve evidence or examples rather than adding filler, which readers and markers spot easily. If you are over, cut redundant qualifiers, merge overlapping sentences and delete throat-clearing openings. Throughout, keep the [Word Counter](/text/word-counter) open in a tab so every edit updates the totals instantly and you always know exactly where you stand against words, characters and the estimated reading time." },
    ],
    faqs: [
      { q: "How does a word counter decide what counts as a word?", a: "It splits your text on whitespace - spaces, tabs and line breaks - and counts each non-empty chunk that remains. This means a hyphenated term like \"self-contained\" counts as one word, an abbreviation like \"e.g.\" counts as one, and extra or trailing spaces do not inflate the total because empty chunks are discarded. The result closely matches how a person would count by hand, which is why essay and assignment limits are set in words." },
      { q: "What is the difference between characters with and without spaces?", a: "The characters-including-spaces count tallies every keystroke, including the spaces between words; the characters-excluding-spaces count leaves the spaces (and usually line breaks) out and counts only visible marks. Spaces are typically 15 to 18 percent of a text, so the two figures can differ by hundreds of characters in a long piece. Social media and SMS limits count spaces, so use the including-spaces figure there; some academic and design specs ask for the excluding-spaces figure instead." },
      { q: "How is reading time calculated from word count?", a: "Reading time is estimated by dividing the word count by an average adult silent reading speed of about 200 to 250 words per minute. An 800-word article therefore takes roughly three to four minutes (800 ÷ 250 = 3.2, and 800 ÷ 200 = 4), and a 1,500-word piece around six to seven minutes. It is given as a range because reading speed varies with how difficult the material is, but it is accurate enough to set reader expectations on an article or to time a speech." },
    ],
  },
  {
    slug: "uppercase-title-case-and-camelcase-explained",
    title: "Text Case Formats Explained: UPPERCASE, Title Case, camelCase and snake_case",
    h1: "Text Case Formats Explained: UPPERCASE, Title Case, camelCase and snake_case",
    desc: "The six text case formats a case converter produces - UPPERCASE, lowercase, Title Case, Sentence case, camelCase and snake_case - how each transformation works, the title-case rules it does and doesn't apply, and which case to use for headings, prose, code and file names.",
    category: "text",
    tool: { slug: "case-converter", title: "Case Converter" },
    updated: "2026-07-11",
    body: [
      { t: "p", s: "Text rarely arrives in the case you need. A heading pasted from an email comes in ALL CAPS, a spreadsheet column holds words a database wants joined with underscores, and a title typed in a hurry has random capitalisation. Fixing it by hand is slow and easy to get wrong. A case converter takes whatever you give it and rewrites it into a chosen convention in one step. This guide explains the six formats the [Case Converter](/text/case-converter) produces - UPPERCASE, lowercase, Title Case, Sentence case, camelCase and snake_case - how each transformation actually works, and when to reach for each one. Everything runs in your browser, so your text is never uploaded: you paste once and copy whichever version you need." },
      { t: "h2", s: "Uppercase and lowercase" },
      { t: "p", s: "UPPERCASE turns every letter into its capital form and lowercase does the reverse; digits, spaces and punctuation are left untouched. They are the simplest conversions but among the most useful for cleanup - drop a heading someone typed with caps lock on into lowercase, or normalise a reference code to uppercase so it matches a system that treats case as significant. Because the change is purely mechanical, the original capitalisation is not stored anywhere: uppercasing and then lowercasing the same text leaves you with lowercase, not your original mix of capitals. Always convert from your source text rather than chaining one conversion onto another." },
      { t: "h2", s: "Title Case and the rules it does — and doesn't — apply" },
      { t: "p", s: "Title Case capitalises the first letter of every word and lowercases the rest, so \"the great gatsby\" becomes \"The Great Gatsby\". This is the fast, readable style for headings, book and article titles, product names and menu labels. Two details are worth knowing. First, it capitalises every word, including short ones like \"a\", \"the\", \"of\" and \"and\". Strict editorial styles such as AP and Chicago leave those small words lowercase unless they open the title, so if you are following a house style you may want to lowercase a few by hand afterwards. Second, because it lowercases the remainder of each word, an internal capital gets flattened: \"iPhone\" becomes \"Iphone\" and \"McDonald\" becomes \"Mcdonald\". For ordinary prose that is exactly right; for brand names with deliberate capitals, fix those few words after converting." },
      { t: "h2", s: "Sentence case" },
      { t: "p", s: "Sentence case rewrites the whole text in lower case and then capitalises the first letter of each sentence, detecting sentence boundaries at full stops, question marks and exclamation marks. It is the format for turning shouty or inconsistent text back into normal reading prose. Paste \"THE EARTH ORBITS THE SUN. THE MOON ORBITS EARTH.\" and you get \"The earth orbits the sun. The moon orbits earth.\" Because it lowercases everything first, it will not know that a place or a person's name is a proper noun, so those occasionally need a manual capital - but for cleaning up form entries, an imported CSV field or a paragraph that was pasted in caps, it does the bulk of the work instantly." },
      { t: "h2", s: "camelCase and snake_case for code" },
      { t: "p", s: "The last two formats are for programmers, where an identifier cannot contain spaces. camelCase removes the spaces and punctuation, keeps the first word lower case, and capitalises the first letter of every following word, so \"user first name\" becomes \"userFirstName\". It is the standard for variables and functions in JavaScript, Java and C#. snake_case instead joins the words with single underscores and keeps everything lower case, turning the same phrase into \"user_first_name\"; it is the convention for variables in Python and Ruby, for SQL and database column names, and for many configuration keys and file names. Both strip out anything that is not a letter or digit, so a messy label like \"User's First-Name!\" collapses to a clean identifier you can paste straight into code." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "To see all six at once, take the phrase User First Name and run it through the converter. Each format applies its own rule to the same three words:" },
      { t: "ul", items: [
        "UPPERCASE — USER FIRST NAME",
        "lowercase — user first name",
        "Title Case — User First Name",
        "Sentence case — User first name",
        "camelCase — userFirstName",
        "snake_case — user_first_name",
      ] },
      { t: "p", s: "The [Case Converter](/text/case-converter) shows all six results side by side the moment you type, each with its own copy button, so you never have to run one conversion, undo it and try another - the exact version you need is already on screen." },
      { t: "h2", s: "Which case should you use?" },
      { t: "p", s: "The right case depends entirely on where the text is going. A quick guide to the common choices:" },
      { t: "ul", items: [
        "Headings and titles: Title Case for a classic, emphatic look, or Sentence case for a calmer, modern one - both are common on the web, so pick one and stay consistent across a page.",
        "Body text, messages and captions: Sentence case, which is simply normal writing.",
        "Emphasis, tags and buttons: UPPERCASE, used sparingly - it reads as shouting across a paragraph but works for short labels and acronyms.",
        "Code variables and functions: camelCase in JavaScript, Java and C#; snake_case in Python, Ruby and SQL.",
        "File names and web addresses: lowercase with a separator - snake_case for files, and for a URL a hyphenated slug is the norm, which a dedicated tool like the [Slug Generator](/text/slug-generator) will produce.",
      ] },
      { t: "p", s: "Because switching between these conventions by hand is exactly the kind of fiddly, error-prone edit that computers do perfectly, it is worth letting the tool do it. Paste your text, glance across the six versions, and copy the one that fits - then adjust only the handful of proper nouns or small words that a strict style guide requires." },
    ],
    faqs: [
      { q: "What is the difference between Title Case and Sentence case?", a: "Title Case capitalises the first letter of every word - \"The Quick Brown Fox\" - and is used for headings, titles and product names. Sentence case capitalises only the first letter of each sentence and leaves the rest lower case - \"The quick brown fox\" - and is used for ordinary body text and, increasingly, for headings in an understated modern style. Title Case here capitalises even short words like \"a\" and \"of\", so if you follow AP or Chicago style you may lowercase those by hand; Sentence case does not re-capitalise proper nouns, so a name may need a manual capital." },
      { q: "If I convert text to uppercase, can I get the original capitalisation back?", a: "No. Each conversion rewrites the letters by a fixed rule and does not remember what was there before, so switching to UPPERCASE and then to lowercase leaves everything lower case rather than restoring your original mix of capitals. Always convert from your source text rather than chaining one conversion onto another. Because the tool shows all six formats at once, each with its own copy button, you can simply copy the version you want without undoing anything." },
      { q: "When should I use camelCase and when snake_case?", a: "Both write a multi-word identifier without spaces, and the choice is set by the language or system you are in. camelCase - \"firstName\" - is the convention for variables and functions in JavaScript, Java and C#. snake_case - \"first_name\" - is standard for variables in Python and Ruby, for SQL and database column names, and for many file names and configuration keys. Match whichever the surrounding code already uses; mixing the two in one codebase makes names harder to read and to search." },
    ],
  },
  {
    slug: "how-to-convert-json-to-csv",
    title: "How to Convert JSON to CSV",
    h1: "How to Convert JSON to CSV (Commas, Nesting and Delimiters Explained)",
    desc: "How to convert JSON to CSV: which JSON shapes convert cleanly, how commas and quotes are escaped per RFC 4180, what happens to nested objects, and choosing a delimiter, with a worked example.",
    category: "convert",
    tool: { slug: "json-to-csv", title: "JSON to CSV" },
    updated: "2026-07-12",
    body: [
      { t: "p", s: "JSON and CSV are two of the most common ways to move structured data around, and sooner or later you will have data in one when you need it in the other. JSON - JavaScript Object Notation - is the language of APIs, configuration files and web apps, where each record is an object with named fields. CSV - comma-separated values - is the language of spreadsheets, where every row is a record and every column a field. Turning a JSON array into CSV means flattening it into a plain grid that Excel, Google Sheets or a database importer can read. This guide explains which shapes of JSON convert cleanly, how special characters are escaped, how to choose a delimiter, and walks through a worked example you can reproduce in the [JSON to CSV](/convert/json-to-csv) converter." },

      { t: "h2", s: "JSON and CSV are shaped differently" },
      { t: "p", s: "The core challenge is that the two formats do not describe data the same way. JSON is hierarchical: an object can nest other objects and arrays to any depth, and every record carries its own field names. CSV is flat and rectangular - just rows and columns, with a single header line naming the columns once at the top. To go from JSON to CSV you have to decide which JSON values become rows and which become columns, then squeeze any nesting into single cells. That is why not every JSON document converts neatly, and why the converter expects a specific overall shape." },

      { t: "h2", s: "The JSON shapes that convert to CSV" },
      { t: "p", s: "For a clean conversion the top level of your JSON must be an array, because each item in that array becomes one row of the spreadsheet. Within that, two shapes are supported:" },
      { t: "ul", items: [
        "An array of objects - the most common case. Every object is a row, and the object keys become the column headers. The converter scans all the objects and collects the union of their keys in first-seen order, so even if some records carry extra fields, every column still appears.",
        "An array of arrays - where each inner array is already a row of values in order. This maps straight onto CSV rows without any key names, which is useful when your data is positional rather than labelled.",
      ] },
      { t: "p", s: "A bare object or a single value at the top level will not convert, because there is nothing to turn into multiple rows. If your JSON is wrapped - say the array you want sits inside a { \"data\": [ ... ] } envelope - pull out the inner array first. You can tidy and inspect the structure with the [JSON Formatter](/dev/json-formatter) beforehand so you can see exactly which array you need." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take this small array of objects, where one record is missing a field and one value contains a comma:" },
      { t: "ul", items: [
        "{ \"name\": \"Ada Lovelace\", \"role\": \"Engineer\", \"city\": \"London\" }",
        "{ \"name\": \"Grace Hopper\", \"role\": \"Rear Admiral\", \"city\": \"New York, NY\" }",
        "{ \"name\": \"Alan Turing\", \"role\": \"Mathematician\" }",
      ] },
      { t: "p", s: "The converter first collects the union of keys in the order it meets them - name, role, city - and writes them as the header row. Each object then becomes a data row, looking up each column by key. The result is:" },
      { t: "ul", items: [
        "name,role,city",
        "Ada Lovelace,Engineer,London",
        "Grace Hopper,Rear Admiral,\"New York, NY\"",
        "Alan Turing,Mathematician,",
      ] },
      { t: "p", s: "Three things are worth noticing. Grace Hopper's city is wrapped in double quotes because it contains a comma, which would otherwise be mistaken for a column break. Alan Turing has no city field, so his row simply ends with an empty cell rather than shifting the columns out of line. And because every column was discovered up front, the grid stays perfectly rectangular even though the source objects were not identical. Paste the three objects into the [JSON to CSV](/convert/json-to-csv) converter and you get exactly these four lines back." },

      { t: "h2", s: "How commas, quotes and line breaks are escaped" },
      { t: "p", s: "CSV looks trivial until a value contains the very character used to separate columns. The widely followed RFC 4180 convention handles this, and the converter applies it automatically. A field is wrapped in double quotes whenever it contains the delimiter, a double quote, or a line break. Any double quotes inside such a field are then doubled - so a value like 5\" (five inches) is written as \"5\"\"\". This is exactly what Excel and Google Sheets expect, so a file produced this way opens with its columns intact even when the data is messy. Rows are separated with a carriage-return-and-line-feed pair, the line ending CSV readers handle most reliably across Windows, macOS and Linux." },

      { t: "h2", s: "What happens to nested objects and arrays" },
      { t: "p", s: "CSV has no concept of nesting - a cell holds one flat value - so an object or array sitting inside a field cannot be spread across columns. Rather than dropping it, the converter writes the nested value back as compact JSON text inside the single cell. A field whose value is { \"lat\": 51.5, \"lng\": -0.1 } shows up in the spreadsheet cell as the literal text {\"lat\":51.5,\"lng\":-0.1}, quoted in the file so its own commas do not break the row. This keeps the information intact, but if you need those inner values as their own columns you should flatten the JSON before converting - lifting, say, address.city up to a top-level city field." },

      { t: "h2", s: "Choosing the right delimiter" },
      { t: "p", s: "Comma is the default and the safest choice for anything you will import programmatically, but it is not always the best fit. The converter also offers semicolon, tab and pipe:" },
      { t: "ul", items: [
        "Semicolon is the expected separator in many European locales, where the comma is used as the decimal mark. If your spreadsheet splits a number like 1,5 into two columns, switch to semicolon.",
        "Tab produces TSV (tab-separated values), which pastes cleanly straight into a spreadsheet and sidesteps comma clashes entirely.",
        "Pipe ( | ) is common in data pipelines and log formats where commas appear frequently inside the values themselves.",
      ] },
      { t: "p", s: "Whichever you pick, the escaping rules follow it: with a semicolon delimiter, for instance, it is semicolons - not commas - inside a value that trigger quoting. Match the delimiter to whatever will read the file, and the rest takes care of itself." },

      { t: "h2", s: "Headers and missing fields" },
      { t: "p", s: "By default the first line of the output is a header row naming every column, which is what most spreadsheet and import tools expect. You can turn the header off if the receiving system wants raw data only - handy when appending to a file that already has its headers. Either way, records missing a field get an empty cell in that column rather than a shifted row, so the columns always stay aligned even when the source objects are not identical." },

      { t: "h2", s: "Converting cleanly - and going back" },
      { t: "p", s: "The reliable workflow is: make sure your data is a top-level array of objects, flatten any nesting you need as real columns, pick the delimiter your target expects, and paste it into the [JSON to CSV](/convert/json-to-csv) converter. Everything runs in your browser, so even sensitive data never leaves your device, and you can copy the result or download it as a .csv ready for Excel or Sheets. To travel the opposite way - pulling a spreadsheet export back into structured data for an API or script - the [CSV to JSON](/convert/csv-to-json) converter reverses the process, using the header row as the object keys." },
    ],
    faqs: [
      { q: "What JSON do I need to convert to CSV?", a: "The top level must be an array. Each item in the array becomes one row: an array of objects turns the object keys into column headers, while an array of arrays maps each inner array straight onto a row. A single object or plain value at the top level will not convert, so wrap or extract the array you want first." },
      { q: "Why are some values in my CSV wrapped in double quotes?", a: "A field is quoted whenever it contains the delimiter (a comma by default), a double quote, or a line break, following the RFC 4180 CSV standard. This stops those characters being read as column or row boundaries, and any double quotes inside the value are doubled. It is exactly what Excel and Google Sheets expect, so the file opens with its columns intact." },
      { q: "What happens to nested objects in my JSON?", a: "CSV cells hold a single flat value, so a nested object or array is written back into the cell as compact JSON text rather than spread across columns. If you need those inner values as their own columns, flatten the JSON first - for example lifting address.city up to a top-level city field - before converting." },
    ],
  },
  {
    slug: "what-is-lorem-ipsum-and-when-to-use-it",
    title: "What Is Lorem Ipsum? Meaning, History and When to Use It",
    h1: "What Is Lorem Ipsum? Meaning, History and When to Use Placeholder Text",
    desc: "What lorem ipsum is, where the half-Latin came from, why designers use placeholder text, how to generate exactly the amount you need, and when you should never use it.",
    category: "text",
    tool: { slug: "lorem-ipsum-generator", title: "Lorem Ipsum Generator" },
    updated: "2026-07-13",
    body: [
      { t: "p", s: "Open almost any design mockup, website template or word-processor sample and you meet the same block of nonsense Latin: 'Lorem ipsum dolor sit amet...'. It is the most famous placeholder text in the world, and for good reason - it lets designers fill a layout with realistic-looking words long before the real copy is ready. This guide explains what lorem ipsum actually is, where the strange half-Latin came from, why it has survived for five centuries, and when you should reach for it - or deliberately avoid it. You can follow along and produce your own filler with the [Lorem Ipsum Generator](/text/lorem-ipsum-generator)." },

      { t: "h2", s: "What lorem ipsum actually is" },
      { t: "p", s: "Lorem ipsum is scrambled, meaningless text used to stand in for real content while a design is being built. Because it carries no coherent meaning, it does not distract the people reviewing a layout - they look at the shape, spacing and typography instead of reading and reacting to the words. The technique is sometimes called 'greeking', from the old expression 'it's all Greek to me', meaning text you are not meant to read. What makes lorem ipsum better than random letters is that its word lengths, sentence rhythm and letter frequencies roughly mimic ordinary Latin and English prose. So a paragraph of it looks convincingly like a real paragraph from a normal reading distance, without ever saying anything - a neutral grey texture that behaves like body copy." },

      { t: "h2", s: "Where lorem ipsum comes from" },
      { t: "p", s: "The text is far older than the web. Its roots lie in a genuine work of Latin literature: Cicero's 'de Finibus Bonorum et Malorum' ('On the Ends of Good and Evil'), written in 45 BC. A line from section 1.10.32 reads 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet' - roughly 'there is no one who loves pain itself because it is pain'. Sometime in the 1500s an unknown printer scrambled a page of this passage to make a specimen sheet showing off a typeface, and the jumbled version stuck. The famous opening 'Lorem ipsum' is actually the tail of the word 'dolorem', which is why lorem ipsum begins in the middle of a word. It was revived in the 1960s on Letraset dry-transfer sheets, then built into desktop-publishing software such as Aldus PageMaker, which is how it reached modern screens. Its Cicero origin was traced in the 1980s by Richard McClintock, a Latin scholar who recognised the unusual word 'consectetur'." },

      { t: "h2", s: "Why designers use placeholder text" },
      { t: "p", s: "Placeholder text solves a very practical problem: content and design are rarely ready at the same moment. A designer needs to see how a page holds together long before the final words are written, and a client reviewing a draft with real, half-finished copy tends to comment on the writing instead of the design. Filling the space with lorem ipsum keeps everyone focused on hierarchy, line length, white space and how blocks of text sit against images. It also stress-tests a layout: a heading that looks fine with two words may break awkwardly across three lines, and a paragraph field needs realistic bulk to reveal its true line height and measure. Neutral filler makes those problems visible early, while there is still time to fix them cheaply." },

      { t: "h2", s: "Generating exactly what you need" },
      { t: "p", s: "Not every slot needs the same amount of text, so a good generator lets you choose the unit. The [Lorem Ipsum Generator](/text/lorem-ipsum-generator) produces output by paragraphs, sentences or words - paragraphs for body-copy regions, a sentence or two for a card or caption, and a precise word count when you are filling a headline or a fixed-width label. Say you are mocking up a blog card: you might generate one paragraph for the excerpt and a six-word run for the title. Leave the classic-opening option on and the block starts with the familiar 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', which reviewers instantly recognise as placeholder; switch it off for fresh randomised text with no telltale opening. Everything is generated in your browser, so you can copy or download the result and drop it straight into your design tool." },

      { t: "h2", s: "Lorem ipsum versus other placeholder text" },
      { t: "p", s: "Lorem ipsum is not the only filler available. Themed generators swap in words about bacon, cupcakes, corporate buzzwords or a favourite TV show, and they can be a fun way to keep a long design session lively. The catch is that recognisable words pull attention back to meaning - the exact thing placeholder text is meant to avoid - and comedic filler can quietly set the wrong tone in front of a client. Plain lorem ipsum stays deliberately neutral and unreadable, which is why it remains the default for serious design work. Reach for a themed variant only when everyone in the room is in on the joke; reach for classic lorem ipsum when the layout, not the words, is the point." },

      { t: "h2", s: "When not to use lorem ipsum" },
      { t: "p", s: "Placeholder text is a scaffold, not a finish. The biggest rule is never to ship it: lorem ipsum left on a live page looks unprofessional, gives search engines nothing meaningful to index, and - worse - is read aloud, letter by meaningless letter, to anyone using a screen reader. Many teams now prefer a 'content-first' approach, designing with real or realistic copy from the start, because a layout ultimately exists to serve its content and dummy text can hide real problems: an empty state with no message, a title far longer than the design assumed, or a form label that only makes sense once you see its true wording. Use lorem ipsum to explore structure quickly, then replace every word of it before anything goes live." },

      { t: "h2", s: "Related text tools" },
      { t: "p", s: "Once real copy replaces your placeholder, the same set of small utilities helps you polish it. Check length and reading time against a target with the [Word Counter](/text/word-counter), fix inconsistent capitalisation with the [Case Converter](/text/case-converter), or tidy messy pasted text using [Remove Line Breaks](/text/remove-line-breaks). And whenever you need a fresh block of filler for the next mockup, the [Lorem Ipsum Generator](/text/lorem-ipsum-generator) is a click away." },
    ],
    faqs: [
      { q: "Does lorem ipsum have a meaning or translation?", a: "Not really. It began as a genuine passage from Cicero written in 45 BC, but the text was deliberately scrambled - words truncated, reordered and altered - so the modern version does not translate to anything coherent. The Cicero line it grew from is about pain and pleasure, but lorem ipsum as used today is intentional nonsense whose only job is to look like text without carrying meaning." },
      { q: "Is it safe to leave lorem ipsum on a live website?", a: "No. Placeholder text on a published page reads as unfinished, offers search engines nothing useful to index, and is announced letter by letter to screen-reader users, which is a poor accessibility experience. Treat lorem ipsum strictly as a design scaffold and replace every instance with real content before launch." },
      { q: "Why does lorem ipsum start in the middle of a word?", a: "The very first word, 'Lorem', is not a complete Latin word - it is the back half of 'dolorem', meaning 'pain'. When a printer scrambled Cicero's text centuries ago the passage was cut mid-word, and that truncated opening became the conventional starting point, which is why generators traditionally begin with 'Lorem ipsum' rather than a whole word." },
    ],
  },
  // ---------------------------------------------------------------- IMAGE-COMPRESSOR
  {
    slug: "how-to-compress-an-image",
    title: "How to Compress an Image",
    h1: "How to Compress an Image Without Wrecking the Quality",
    desc: "How to compress an image to reduce file size while keeping it looking sharp. Learn lossy vs lossless, the right quality level, and JPG vs WebP.",
    category: "image",
    tool: { slug: "image-compressor", title: "Image Compressor" },
    updated: "2026-07-14",
    body: [
      { t: "p", s: "A photo straight from a phone or camera can easily be three to eight megabytes, which is far more than most web pages, forms, and email inboxes want to handle. Compressing that image shrinks the file - often by 70 to 90 percent - while keeping it looking almost identical to the eye. This guide explains what image compression actually does, the difference between lossy and lossless, how the quality setting trades size for detail, when to pick JPG versus WebP, and why compressing is not the same as resizing. There is a worked example and a short step-by-step so you can do it yourself in seconds with the [Image Compressor](/image/image-compressor)." },
      { t: "h2", s: "What image compression actually does" },
      { t: "p", s: "Compression re-encodes the picture so it describes the same image using fewer bytes. Photographic compression is lossy: the encoder analyses the image and throws away the fine detail your eye is least likely to notice - tiny variations in color and brightness across smooth areas like skies and skin. Because human vision is far more sensitive to broad shapes than to those subtle shifts, a well-chosen compression level removes a large share of the data while leaving the picture looking essentially unchanged. Crucially, the pixel dimensions stay the same; a 4000 by 3000 photo is still 4000 by 3000 after compression, just stored more efficiently." },
      { t: "h2", s: "Why a smaller file matters" },
      { t: "p", s: "Trimming an image's size pays off in several everyday situations:" },
      { t: "ul", items: [
        "Page speed and SEO: images are usually the heaviest part of a web page, and lighter files load faster, which search engines reward.",
        "Upload limits: many forms, job portals, and government sites cap uploads at 1 or 2 MB, and a raw photo often exceeds that.",
        "Email attachments: mailboxes commonly reject messages over 20 to 25 MB, so a few uncompressed photos can bounce.",
        "Storage and mobile data: smaller files mean more images per gigabyte and less bandwidth used by visitors on phones.",
      ]},
      { t: "h2", s: "Lossy vs lossless compression" },
      { t: "p", s: "There are two families of compression. Lossy compression permanently discards some detail to reach a much smaller size, and it is what JPG and the lossy mode of WebP use - ideal for photographs, where the discarded detail is invisible. Lossless compression, used by PNG, packs the data more efficiently without dropping a single pixel, so it is perfect for logos, screenshots, and sharp-edged graphics but produces far larger files for photos. The Image Compressor uses lossy encoding, which is why it is aimed at photographs and full-color images rather than crisp line art. If you mainly want to switch formats rather than shrink a photo, the [PNG vs JPG vs WebP guide](/guides/png-vs-jpg-vs-webp) walks through which format suits which kind of image." },
      { t: "h2", s: "How the quality setting works" },
      { t: "p", s: "The quality slider is the single most important control. It sets how aggressively the encoder discards detail, on a scale from 10 to 100 percent. Higher keeps more detail and a bigger file; lower saves more space but eventually shows visible flaws. As a rough guide:" },
      { t: "ul", items: [
        "90 to 100 percent: near-original quality, but only modest size savings - use it when fidelity matters most.",
        "70 to 80 percent: the sweet spot for photos, typically cutting the file by well over half with no difference most people can see.",
        "40 to 60 percent: noticeably smaller files that start to show blocky 'artifacts' and fuzzy halos around edges and text.",
        "Below 40 percent: heavy compression that is obvious to the eye - only for thumbnails or when size is all that counts.",
      ]},
      { t: "p", s: "A quality of 70 to 80 percent is the safe default for almost every photograph, and the tool starts you at 70 so you can nudge it up or down while watching the size change live." },
      { t: "h2", s: "JPG or WebP: which to compress to" },
      { t: "p", s: "The compressor can save your image as JPG or WebP. JPG is the universally compatible choice that opens everywhere, from old software to email clients. WebP is a newer format that produces smaller files - often 25 to 35 percent smaller than JPG at the same visual quality - and works in every modern browser, making it the better pick for websites where speed matters. One important detail: JPG cannot store transparency, so if your source image has a transparent background, the JPG option fills it with solid white. If you need to keep transparency while still shrinking the file, choose WebP instead." },
      { t: "h2", s: "Compressing is not the same as resizing" },
      { t: "p", s: "These two are easy to confuse because both make files smaller, but they change different things. Compression re-encodes the image at its existing pixel dimensions, discarding detail to save space. Resizing reduces the actual width and height - a 4000-pixel-wide photo becomes, say, 1200 pixels wide. For the web the biggest wins usually come from doing both: first cut the dimensions to what the page actually displays with the [Image Resizer](/image/image-resizer), then run the smaller image through the [Image Compressor](/image/image-compressor). A photo that only ever appears 800 pixels wide gains nothing from being stored at 4000 pixels, so resizing first removes waste that compression alone cannot." },
      { t: "h2", s: "A worked example" },
      { t: "p", s: "Suppose you have a 3.2 MB photo you want to attach to a form that only accepts files under 1 MB. You open the Image Compressor, keep the format on JPG, and leave the quality at 70 percent. The tool re-encodes the picture and reports the new size at roughly 640 KB - a saving of about 80 percent (640 KB is one-fifth of 3.2 MB, so four-fifths of the file is gone). The photo looks the same on screen, but it now sails under the 1 MB limit with room to spare. If 640 KB were still too large, dropping the quality to 55 percent would shrink it further, and switching the format to WebP would trim it more again. Exact results vary with the image - detailed, busy photos compress less than smooth ones - but an 80 percent-plus reduction at a sensible quality is common." },
      { t: "h2", s: "How to compress an image, step by step" },
      { t: "ol", items: [
        "Open the [Image Compressor](/image/image-compressor) and drop in your photo - nothing is uploaded, it all happens in your browser.",
        "Choose the output format: JPG for maximum compatibility, or WebP for the smallest file.",
        "Adjust the quality slider, starting around 70 percent, and watch the compressed size and the 'Saved' percentage update instantly.",
        "When the size and appearance look right, download the compressed image - the original file on your device is left untouched.",
      ]},
      { t: "h2", s: "Tips for the best results" },
      { t: "ul", items: [
        "Always keep the original. Lossy compression is one-way, so save a full-quality copy before you shrink anything.",
        "Do not recompress repeatedly. Each lossy pass discards more detail, so compress once from the best source you have.",
        "Resize before you compress when the image is larger than it needs to be on screen - the two together beat either alone.",
        "Judge quality at the size the image will really appear, not zoomed in to 300 percent where every artifact is magnified.",
      ]},
      { t: "h2", s: "The bottom line" },
      { t: "p", s: "Compressing an image is the quickest way to make a heavy photo light enough for the web, an upload form, or an email, and at a sensible quality the difference is invisible. Pick JPG for compatibility or WebP for the smallest file, start around 70 percent quality, and resize first if the image is bigger than it needs to be. When you are ready, drop your photo into the [Image Compressor](/image/image-compressor) and watch the file size fall in real time - free, private, and entirely in your browser." },
    ],
    faqs: [
      { q: "Does compressing an image reduce its quality?", a: "Compression is lossy, so some detail is discarded, but at a quality of 70 to 80 percent the change is invisible to most people while the file shrinks dramatically. Only at low quality settings, roughly below 50 percent, do you start to see blocky artifacts and fuzzy edges." },
      { q: "What is the difference between compressing and resizing an image?", a: "Compressing re-encodes the image at its existing pixel dimensions to store it in fewer bytes, while resizing actually reduces the width and height. They shrink files in different ways, and for the web the best results usually come from resizing first and then compressing." },
      { q: "Are my images uploaded to a server when I compress them?", a: "No. The Image Compressor runs entirely in your browser using your device's own processing, so your images never leave your computer. That also means there is no fixed file-size limit beyond your device's available memory." },
    ],
  },
  // ---------------------------------------------------------------- COLOR-CONVERTER
  {
    slug: "rgb-hex-hsl-color-codes-explained",
    title: "RGB, HEX and HSL Color Codes Explained",
    h1: "RGB, HEX, HSL and CMYK Color Codes Explained",
    desc: "What HEX, RGB, HSL and CMYK color codes mean, how they relate, and when to use each. Includes a worked example converting one shade across all four formats.",
    category: "convert",
    tool: { slug: "color-converter", title: "Color Converter" },
    updated: "2026-07-15",
    body: [
      { t: "p", s: "Every color you see on a screen or send to a printer can be written down as a short code - but there are several competing ways to write it, and they look nothing alike. #3b82f6, rgb(59, 130, 246), hsl(217, 91%, 60%) and cmyk(76%, 47%, 0%, 4%) all describe exactly the same shade of blue. This guide explains what each of the four common color systems - HEX, RGB, HSL and CMYK - actually means, how they relate to one another, and when to reach for each. You can convert any color between all four instantly with the [Color Converter](/convert/color-converter), and the guide works through the same shade the tool shows by default, so you can follow every number yourself." },

      { t: "h2", s: "Four color systems, and why there are so many" },
      { t: "p", s: "A color code is just a set of numbers that pins down one exact shade so a browser, design tool or printer can reproduce it. The reason there is more than one system is that each was built for a different job. HEX and RGB describe light - the red, green and blue a screen emits - and are effectively two spellings of the same thing. HSL also describes screen color, but arranges it the way a person thinks about color, which makes it easy to adjust by hand. CMYK describes ink on paper, a fundamentally different medium. Knowing which system you are looking at, and how to move between them, saves guesswork." },

      { t: "h2", s: "HEX - six digits, two per channel" },
      { t: "p", s: "A HEX (hexadecimal) code is the format you meet most in web design and CSS: a hash sign followed by six characters, like #3b82f6. Those six characters are three pairs - one each for red, green and blue. Each pair is a base-16 number: hexadecimal uses the digits 0-9 and then a-f for the values ten to fifteen, running from 00 (none of that channel) up to ff (the maximum, which is 255 in ordinary decimal). So #3b82f6 splits into 3b for red, 82 for green and f6 for blue. Converting a pair to decimal is straightforward: 3b means 3x16 + 11 = 59, 82 means 8x16 + 2 = 130, and f6 means 15x16 + 6 = 246. You will also meet three-digit shorthand like #abc; each digit is simply doubled, so #abc is identical to #aabbcc." },

      { t: "h2", s: "RGB - mixing red, green and blue light" },
      { t: "p", s: "RGB writes the same three channels as plain decimal numbers from 0 to 255, usually as rgb(59, 130, 246). It is an additive model: a screen starts black and adds red, green and blue light, and the more of each it adds the brighter the result, until all three at full strength - rgb(255, 255, 255) - make white. Because each HEX pair is just a channel value in disguise, HEX and RGB are interchangeable: #3b82f6 and rgb(59, 130, 246) are the identical color, one written in base-16 and the other in base-10. RGB is handy when you want to reason about the channels numerically or nudge a single one, and it is the format that gains an alpha channel - becoming RGBA - when you need transparency. If you only ever go one direction, the dedicated [Hex to RGB](/convert/hex-to-rgb) and [RGB to Hex](/convert/rgb-to-hex) converters do just that single step." },

      { t: "h2", s: "HSL - hue, saturation and lightness" },
      { t: "p", s: "HSL rearranges the same screen colors into three values that match how people actually describe color, written hsl(217, 91%, 60%). Hue is an angle from 0 to 360 degrees around a color wheel - 0 and 360 are red, 120 is green, 240 is blue - so our example's 217 sits firmly in the blue range. Saturation is how vivid the color is, from 0% (a flat grey) to 100% (fully intense). Lightness runs from 0% (black) through 50% (the pure hue) to 100% (white). The big advantage is intuitive editing: to make a color a little darker you lower the lightness; to mute it you drop the saturation; to shift it towards purple you raise the hue - all without juggling three separate channel numbers. That makes HSL the friendliest format for building consistent palettes, tints and hover states." },

      { t: "h2", s: "CMYK - ink instead of light" },
      { t: "p", s: "CMYK is the odd one out because it describes printing, not screens. Its four channels are cyan, magenta, yellow and key (black), each given as a percentage of ink coverage. Printing is subtractive: paper starts white and every ink subtracts light, so more ink means a darker result - the opposite of RGB's additive light. The black 'key' channel exists because layering the three color inks to make black wastes ink and looks muddy, so printers lay down real black separately. One important caveat: CMYK is device-dependent. The exact shade depends on the printer, inks and paper, so an on-screen CMYK preview is only an approximation - for color-critical print work, match to a physical swatch or a Pantone reference rather than the screen." },

      { t: "h2", s: "A worked example across all four" },
      { t: "p", s: "Take the blue the [Color Converter](/convert/color-converter) shows by default. As a HEX code it is #3b82f6. Splitting that into channels gives red 3b (59), green 82 (130) and blue f6 (246) - which is exactly rgb(59, 130, 246). Feeding those channels through the HSL maths yields hsl(217, 91%, 60%): a hue of 217 degrees (blue), a high 91% saturation and a middling 60% lightness - numbers that immediately tell you it is a fairly bright, vivid blue. The same channels convert to cmyk(76%, 47%, 0%, 4%): heavy cyan, moderate magenta, no yellow at all and a touch of black, roughly how a printer would lay that blue down. All four codes name one identical color; they are just four languages for the same thing. Paste any of them into the converter and you get the other three back." },

      { t: "h2", s: "Which format should you use?" },
      { t: "ul", items: [
        "HEX for the web. It is the most compact and by far the most common format in CSS, design handoffs and style guides - the default for anything on screen.",
        "RGB (or RGBA) when you need the raw channel numbers, want transparency, or are generating colors in code where separate 0-255 values are easier to work with.",
        "HSL for editing and palettes. Its hue, saturation and lightness split makes it the easiest format for tweaking a color by hand or generating tints and shades that feel related.",
        "CMYK only for print. If your work is heading to a physical printer, supply CMYK (or a spot-color reference) - but treat any on-screen preview as approximate.",
      ] },

      { t: "h2", s: "Converting between them" },
      { t: "p", s: "Because all four systems describe the same colors - with CMYK the only one tied to a different medium - you can move between them freely. The [Color Converter](/convert/color-converter) detects whatever you paste, whether a HEX code with or without the hash, an rgb(...) value, a bare 59, 130, 246 triplet, or an hsl(...) value, and shows all four formats at once with a live preview swatch, each ready to copy. Everything runs in your browser, so nothing about your colors is uploaded. When you only need a single hop, the focused [Hex to RGB](/convert/hex-to-rgb) and [RGB to Hex](/convert/rgb-to-hex) tools cover the two most common conversions on their own." },
    ],
    faqs: [
      { q: "Are HEX and RGB the same color?", a: "Yes. They describe identical red, green and blue channels using different number bases. HEX writes each channel as a two-digit base-16 value (00 to ff), while RGB writes it as a decimal number (0 to 255). So #3b82f6 and rgb(59, 130, 246) are exactly the same blue - ff equals 255, 82 equals 130, and so on. Converting between them never changes the color, only how it is written." },
      { q: "What does the K in CMYK stand for?", a: "K stands for 'key', the printing term for the black plate that the other colors are aligned - keyed - to. Black gets its own channel rather than being mixed from cyan, magenta and yellow because layering all three inks to make black wastes ink and produces a muddy, off-black result. A dedicated black plate gives deeper blacks, sharper text and lower ink use." },
      { q: "Why does the same color look different in print than on screen?", a: "Screens create color by adding red, green and blue light (RGB), while printers create it by layering cyan, magenta, yellow and black ink (CMYK), and the two cannot reproduce exactly the same range of colors. Bright, saturated screen colors - vivid blues and greens especially - often fall outside what CMYK ink can achieve, so they shift when printed. CMYK is also device-dependent, so the printer and paper matter. For color-critical work, match to a printed swatch rather than trusting the screen." },
    ],
  },
  // ---------------------------------------------------------------- IMAGE-TO-TEXT
  {
    slug: "how-to-extract-text-from-an-image",
    title: "How to Extract Text from an Image (OCR)",
    h1: "How to Extract Text from an Image (OCR), Explained",
    desc: "How to extract text from an image with OCR. Learn how optical character recognition works, what makes it accurate, and how to turn a photo or screenshot into editable text.",
    category: "image",
    tool: { slug: "image-to-text", title: "Image to Text (OCR)" },
    updated: "2026-07-20",
    body: [
      { t: "p", s: "A photo of a printed page, a screenshot of an error message, a scan of a form - to your computer, every one of them is just a grid of colored pixels. The words are there for your eyes but not for your keyboard: you cannot select, search or paste them. Optical character recognition, almost always shortened to OCR, turns those pixels back into real characters. This guide explains what OCR does, what makes it accurate, how to extract text from an image in seconds with the [Image to Text](/image/image-to-text) tool, and what to do when the result comes back imperfect." },

      { t: "h2", s: "What OCR actually does" },
      { t: "p", s: "OCR runs in stages. The engine first cleans up the picture, converting it to high-contrast black and white and straightening it if the page is tilted. Then comes layout analysis: finding the blocks of text, splitting each into lines, and each line into words. Only then does recognition happen." },
      { t: "p", s: "Early OCR compared each character against a library of stored letter shapes, which is why it fell apart on any font it had not seen. Modern engines work differently: a neural network reads an entire line of pixels left to right and predicts the sequence of characters most likely to have produced it. Judging a whole line in context rather than one isolated glyph handles unfamiliar fonts, uneven spacing and light noise far better. A language model then nudges ambiguous results toward real words - which is why telling the tool what language it is reading matters so much." },

      { t: "h2", s: "When you need it" },
      { t: "p", s: "OCR is one of those tools you rarely think about until you badly need it:" },
      { t: "ul", items: [
        "Retyping avoidance: pulling text out of a scanned letter, invoice or printed report instead of copying it by hand.",
        "Screenshots: lifting an error message or a chunk of code out of an image someone sent you.",
        "Study notes: turning photos of textbook pages, whiteboards or lecture slides into notes you can search and edit.",
        "Forms and records: getting details off a scanned application, bill or ID into a spreadsheet.",
        "Accessibility: producing real text a screen reader can announce, which an image cannot provide.",
      ]},

      { t: "h2", s: "How to extract text from an image" },
      { t: "ol", items: [
        "Open the [Image to Text](/image/image-to-text) tool and drop in a PNG, JPG, WebP or screenshot.",
        "Choose the language in the image - English, Hindi, or both together for a mixed page.",
        "Click Extract text. The first run downloads the OCR engine and language data, a few megabytes, and a progress bar reports each stage.",
        "Read the result in the editable box, fix any stray characters directly there, then copy it or download it as a .txt file.",
      ]},
      { t: "p", s: "Everything happens inside your browser tab, and after the first run the engine is cached, so later extractions start almost immediately." },

      { t: "h2", s: "Choosing the right language" },
      { t: "p", s: "The language setting is not cosmetic - it decides which trained model and dictionary the engine loads, and picking correctly is often the single biggest accuracy win available to you. An English model asked to read Devanagari produces nonsense, because it is forcing every shape into the Latin alphabet it knows. Use the combined English + Hindi option only when a page genuinely mixes both scripts: loading two models makes the engine weigh a far larger set of candidate characters for every shape, which is slower and can introduce cross-script confusion on a page that only needed one." },

      { t: "h2", s: "What makes OCR accurate" },
      { t: "p", s: "Recognition quality depends far more on the image than on the engine. What matters, roughly in order:" },
      { t: "ul", items: [
        "Resolution: text should stay readable when you zoom in - roughly what a 300 DPI scan gives you, around 20 to 30 pixels of height per line of body text. Below that, characters blur together.",
        "Contrast: dark text on a plain light background. Text over a photo, gradient or watermark is much harder.",
        "Straightness: a page shot at an angle, or curving away in a book gutter, distorts letter shapes.",
        "Even lighting: no glare, no hard shadow across half the page.",
        "Print, not handwriting: typed characters are what these models are trained on.",
        "Light compression: a heavily compressed JPG smears the fine edges that distinguish similar characters.",
      ]},
      { t: "p", s: "One counterintuitive point: do not compress or shrink an image before running OCR. Those steps help for sharing, but they destroy the detail recognition depends on. Run OCR on the original, then compress afterwards with the [Image Compressor](/image/image-compressor)." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Say you photograph a printed invoice with a phone held overhead and get a sharp 3000 by 4000 image in daylight. Run it through OCR in English and the body text should come back essentially clean - a typical result on well-shot printed text is upwards of 95 percent of characters correct, so a handful of errors on a page rather than a mess." },
      { t: "p", s: "Where those errors turn up is predictable, which makes checking fast. Digits and letters that share a silhouette get swapped: 0 for O, 1 for l, 5 for S, 8 for B. The numbers on an invoice are what you cannot afford to get wrong, so verify totals, dates and reference numbers by eye. The other common surprise is layout: OCR returns a stream of text lines, so the invoice's neat columns arrive with their alignment gone. The characters are right; the table structure is not preserved." },

      { t: "h2", s: "Where OCR struggles" },
      { t: "ul", items: [
        "Handwriting: cursive and casual writing are a different problem, and these models are not trained for them.",
        "Decorative type: logos, script fonts and heavy display faces are frequently misread.",
        "Tables: the text comes out, but the row and column structure does not survive.",
        "Dense multi-column layouts: newspapers and academic papers can have their reading order scrambled.",
      ]},

      { t: "h2", s: "Images versus scanned PDFs" },
      { t: "p", s: "If your source is a scanned PDF rather than an image, use the [OCR PDF](/pdf/ocr-pdf) tool instead. It runs the same recognition over every page, but rather than handing you a wall of plain text it adds an invisible text layer on top of the original scan - the document looks exactly as it did, but the words underneath become selectable and searchable." },
      { t: "p", s: "One check first: open the PDF and try to select a line of text. If you can, it already contains real text and needs no OCR - reach for [PDF to Word](/pdf/pdf-to-word) instead. OCR is only for image-only pages where selection does nothing." },

      { t: "h2", s: "Why running OCR in your browser matters" },
      { t: "p", s: "The documents people most often want to OCR are the sensitive ones: payslips, bank statements, ID cards, medical letters, contracts. Most free online OCR services upload your file to their server, so a copy sits on infrastructure you cannot see, under a retention policy you did not read. The [Image to Text](/image/image-to-text) tool runs the engine inside your own browser tab instead - the image never leaves your device." },

      { t: "h2", s: "Cleaning up the extracted text" },
      { t: "p", s: "Raw OCR output usually needs a light pass. Line breaks land where the printed line ended rather than where the sentence did, so paragraphs arrive chopped into fragments - [Remove Line Breaks](/text/remove-line-breaks) rejoins them. If the same misreading repeats through a long document, fix every instance at once with [Find and Replace](/text/find-and-replace), and [Word Counter](/text/word-counter) will tell you where you stand against a word limit." },
    ],
    faqs: [
      { q: "Why is my OCR result full of wrong characters?", a: "Almost always the image, not the engine. The usual causes are low resolution (text should stay clearly readable when you zoom in), poor contrast, a page photographed at an angle, glare or shadow, or heavy JPG compression that has smeared the character edges. Check the language setting too - an English model cannot read Hindi script and will return nonsense. Re-shooting the page flat, square on and in even light fixes more errors than any setting you can change." },
      { q: "Can OCR read handwriting?", a: "Not reliably. These engines are trained on printed and typed characters, where letter shapes are consistent and predictable. Handwriting varies enormously between people and even between words from the same person, and cursive joins letters together so there are no clean boundaries to separate. Very neat, well-spaced block capitals sometimes come through partially, but anything cursive or casual will not. Handwriting recognition is a separate problem needing purpose-built models." },
      { q: "Is my image uploaded to a server?", a: "No. The OCR engine is downloaded to your browser on first use and runs entirely on your own device, so the image is read from local memory and never transmitted anywhere. That is also why the first extraction takes a few extra seconds to start - it is fetching the engine and language data, which are then cached for later runs. It means you can safely OCR payslips, ID documents and contracts without handing a copy to a third party." },
    ],
  },
  {
    slug: "how-to-convert-csv-to-json",
    title: "How to Convert CSV to JSON",
    h1: "How to Convert CSV to JSON (Headers, Delimiters and Type Inference Explained)",
    desc: "How to convert CSV to JSON: how the first row becomes object keys, which delimiter to pick, how quoted commas and line breaks are parsed per RFC 4180, and when to keep values as text — with a worked example.",
    category: "convert",
    tool: { slug: "csv-to-json", title: "CSV to JSON" },
    updated: "2026-07-22",
    body: [
      { t: "p", s: "CSV and JSON are the two formats structured data spends most of its life in. CSV - comma-separated values - is what spreadsheets, exports and legacy systems produce: a plain grid of rows and columns. JSON - JavaScript Object Notation - is what APIs, config files and modern web apps expect: named fields, real numbers and booleans, and nesting to any depth. Converting CSV to JSON means turning that flat grid into a list of records a program can consume directly. This guide explains how the [CSV to JSON](/convert/csv-to-json) converter reads your data, how it decides what is a number and what is text, which delimiter to choose, and walks through a worked example you can reproduce." },

      { t: "h2", s: "From a flat grid to a list of records" },
      { t: "p", s: "A CSV file is rectangular: one header line names the columns, and every line below is a row of values in the same order. JSON is happier as a list of self-describing objects, where each record carries its own field names. The converter bridges the two by reading the first row as a set of keys, then pairing those keys with the values on every following row. The result is a JSON array - one object per data row - that you can paste straight into code, hand to an API, or load into a document database." },

      { t: "h2", s: "What the converter gives you" },
      { t: "p", s: "You get an array, and its shape depends on a single toggle: whether the first row is treated as a header." },
      { t: "ul", items: [
        "With \"first row is a header\" on (the default), each following row becomes an object. The header cells are the keys, so a first line of name,age turns every later row into { \"name\": ..., \"age\": ... }. This is what you want almost every time.",
        "With it off, there are no key names to assign, so each row becomes an array of values instead - an array of arrays. Use this when your data is positional rather than labelled, or when the file genuinely has no header and its first line is real data you must not lose.",
      ]},

      { t: "h2", s: "Numbers, booleans and the leading-zero trap" },
      { t: "p", s: "CSV has no types - every cell is just text. JSON does have types, so the converter can optionally read a bare number as a real number and the words true and false as booleans. That is the \"convert numbers and true/false to typed values\" option. It is deliberately strict: only text that is unambiguously a number is converted, which is what keeps your data honest." },
      { t: "p", s: "The consequence worth knowing is leading zeros. A value like 0074 - a SKU, a ZIP code, part of a phone number - is left as the string \"0074\", because turning it into the number 74 would silently corrupt it. A plain 1200, though, becomes the number 1200. That means an identifier column can come out mixed: some values numbers, some strings. When a column holds labels rather than quantities, turn typing off so every value stays text and the column stays consistent. Thousands separators are left alone too - \"1,000\" stays a string, never the number 1000." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take this three-line CSV - a header plus two products, one with a quoted name containing a comma and one missing its price:" },
      { t: "ul", items: [
        "sku,name,price,in_stock",
        "0074,\"Widget, deluxe\",19.99,true",
        "1200,Gadget,,false",
      ]},
      { t: "p", s: "With a comma delimiter, the header option on and typing on, the converter returns a two-object array:" },
      { t: "ul", items: [
        "{ \"sku\": \"0074\", \"name\": \"Widget, deluxe\", \"price\": 19.99, \"in_stock\": true }",
        "{ \"sku\": 1200, \"name\": \"Gadget\", \"price\": \"\", \"in_stock\": false }",
      ]},
      { t: "p", s: "Four things are worth noticing. The quoted name \"Widget, deluxe\" stays a single value - its internal comma is not read as a column break. price 19.99 comes through as a real number and in_stock as real booleans. The missing price becomes an empty string rather than shifting the other columns out of line. And look at the sku column: 0074 kept its leading zero and stayed text, while 1200 became a number - exactly the mixed-type outcome that argues for turning typing off on ID columns. Paste those three lines into the [CSV to JSON](/convert/csv-to-json) converter and you get this array back." },

      { t: "h2", s: "Choosing the right delimiter" },
      { t: "p", s: "\"Comma-separated\" is a loose description - plenty of CSV files separate fields with something else, and picking the wrong delimiter is the most common reason a conversion looks scrambled. The converter offers four:" },
      { t: "ul", items: [
        "Comma - the default and the most common.",
        "Semicolon - standard across much of Europe, where the comma is the decimal separator, so 3,14 is a number and files use ; to divide fields instead.",
        "Tab - tab-separated values (TSV), common in database and spreadsheet exports where individual fields may themselves contain commas.",
        "Pipe - the vertical bar, used in data feeds and log-style records because it rarely appears inside real values.",
      ]},
      { t: "p", s: "If your output crams everything into one field, or splits in the wrong places, the delimiter is almost certainly the culprit - switch it to match the file and the columns fall into place." },

      { t: "h2", s: "Commas, quotes and line breaks inside fields" },
      { t: "p", s: "The parser follows the RFC 4180 conventions that spreadsheets use, so awkward values survive intact. A field wrapped in double quotes can contain the delimiter itself, so \"New York, NY\" is one value rather than two. It can also contain line breaks, so a multi-line address inside quotes stays a single cell. A literal double quote inside a quoted field is written as two quotes, which the parser collapses back to one. Blank lines are skipped rather than turned into empty records. If a conversion fails outright, the usual cause is an unbalanced quote - an opening quote with no closing partner - which leaves the parser reading the rest of the file as one long value." },

      { t: "h2", s: "It all runs in your browser" },
      { t: "p", s: "CSV exports are often the sensitive ones - customer lists, transactions, payroll. The [CSV to JSON](/convert/csv-to-json) converter parses the text entirely inside your browser tab, so nothing is uploaded to a server and you can convert a spreadsheet of personal data without it leaving your machine. When you need the round trip the other way, the [JSON to CSV](/convert/json-to-csv) converter reverses the process, and the [JSON Formatter](/dev/json-formatter) will pretty-print or validate the result before you use it." },
    ],
    faqs: [
      { q: "Should I keep the first row as a header?", a: "Usually yes. If the top line of your CSV names the columns - name, email, age - leaving \"first row is a header\" on turns every following row into a labelled object, which is what most code and APIs expect. Turn it off only when the file has no header and its first line is real data you must not discard, or when you deliberately want positional rows; in that case each row becomes a plain array of values instead of a keyed object." },
      { q: "Why did my ID or ZIP code lose its leading zeros, or why is one column half numbers and half text?", a: "That is the type-inference option working a little too well. With typing on, a value like 0074 is kept as text (dropping the zero would corrupt it) while 1200 is read as a real number, so an identifier column can come out mixed. IDs, ZIP codes, phone numbers and SKUs are labels, not quantities - turn off \"convert numbers and true/false to typed values\" so every cell stays a string and the whole column is consistent." },
      { q: "My converted JSON looks scrambled - what went wrong?", a: "Two causes cover almost every case. First, the wrong delimiter: if the file is semicolon- or tab-separated but the converter is set to comma, whole rows collapse into a single field, so switch the delimiter to match. Second, an unbalanced quote: a stray double quote with no closing partner makes the parser read the rest of the file as one long quoted value. Fix the quoting or the delimiter and the columns line up again." },
    ],
  },

  // ---------------------------------------------------------------- YAML TO JSON
  {
    slug: "how-to-convert-yaml-to-json",
    title: "How to Convert YAML to JSON",
    h1: "How to Convert YAML to JSON (Types, Indentation and Quoting Explained)",
    desc: "How to convert YAML to JSON: how mappings, sequences and indentation map onto objects and arrays, how each value is typed, why unquoted numbers change, and which YAML features aren't supported - with a worked example.",
    category: "convert",
    tool: { slug: "yaml-to-json", title: "YAML to JSON" },
    updated: "2026-07-23",
    body: [
      { t: "p", s: "YAML - \"YAML Ain't Markup Language\" - is the human-friendly format that configuration lives in: Docker Compose files, Kubernetes manifests, CI pipelines and app settings are almost all YAML. It is easy to read and write because structure comes from indentation rather than brackets. JSON - JavaScript Object Notation - is the machine-friendly format that APIs, tooling and JavaScript expect, with explicit braces, real numbers and booleans, and no reliance on whitespace. Converting YAML to JSON means translating that indented, comment-friendly text into the strict, bracketed structure a program can parse directly. This guide explains how the [YAML to JSON](/convert/yaml-to-json) converter maps one onto the other, how it decides the type of each value, and walks through a worked example you can reproduce." },

      { t: "h2", s: "How YAML maps onto JSON" },
      { t: "p", s: "The two formats describe the same three building blocks, just with different punctuation. A YAML mapping - a set of key: value lines - becomes a JSON object. A YAML sequence - a list of dash-prefixed items - becomes a JSON array. And a plain value on the right of a colon becomes a JSON scalar: a string, number, boolean or null. The one thing YAML does that JSON does not is use indentation to show nesting. Where JSON opens a brace or bracket, YAML simply indents the child lines further to the right. The converter reads that indentation, works out which lines belong inside which block, and rebuilds the nesting with the braces and brackets JSON requires." },

      { t: "h2", s: "How values are typed" },
      { t: "p", s: "YAML has no quotes around most values, so the converter has to infer a type from the text of each scalar. It follows the rules people expect:" },
      { t: "ul", items: [
        "A run of digits like 8080 becomes a JSON number, and a value with a decimal point like 19.99 becomes a floating-point number.",
        "The words true and false - in any case, so true, True or TRUE - become JSON booleans.",
        "An empty value, a tilde (~), or the word null becomes JSON null.",
        "Anything else - db.internal, web-server, a whole sentence - stays a string, whether or not it is wrapped in quotes in the source.",
      ]},
      { t: "p", s: "One deliberate choice is worth calling out: only true and false are read as booleans. The words yes, no, on and off stay ordinary strings. That sidesteps the notorious \"Norway problem\", where a naive YAML parser turns the country code NO into the boolean false - here, NO stays the string it looks like." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take this small service configuration in YAML - top-level settings, a dash-prefixed list, and a nested block:" },
      { t: "ul", items: [
        "name: web-server",
        "port: 8080",
        "enabled: true",
        "maintainer: null",
        "tags:",
        "  - production",
        "  - critical",
        "database:",
        "  host: db.internal",
        "  port: 5432",
        "  ports: [5432, 5433]",
      ]},
      { t: "p", s: "Paste it into the [YAML to JSON](/convert/yaml-to-json) converter and you get this JSON back: { \"name\": \"web-server\", \"port\": 8080, \"enabled\": true, \"maintainer\": null, \"tags\": [\"production\", \"critical\"], \"database\": { \"host\": \"db.internal\", \"port\": 5432, \"ports\": [5432, 5433] } }" },
      { t: "p", s: "Walk through what happened. The top-level key: value lines became an object. port 8080 came through as a real number rather than the string \"8080\", and enabled as a real boolean. maintainer: null became JSON null. The dash-prefixed tags list turned into an array of two strings. The indented database block, sitting one level to the right, became a nested object - and inside it, the inline ports: [5432, 5433] shows both writing styles working together in a single file." },

      { t: "h2", s: "Block style and flow style" },
      { t: "p", s: "YAML lets you write collections two ways, and the converter handles both. Block style is the indented, one-item-per-line form used for tags and database above - the readable default for hand-written config. Flow style is the compact, JSON-like form on a single line: an array as [5432, 5433] and an object as {cpu: 2, memory: 512}. Flow style is handy for short lists and pairs, and because it already looks like JSON it converts one-to-one. You can even paste a whole document written in flow style - the converter treats a lone [ ... ] or { ... } as the entire value." },

      { t: "h2", s: "Quoting: when a value must stay a string" },
      { t: "p", s: "Because unquoted numbers are converted to real numbers, a value that only looks like a number can change on you. An identifier such as 0074 is read as the integer 74 - the leading zero is dropped - and a version written as 1.20 becomes 1.2. Whenever a value is really a label rather than a quantity - a ZIP code, a SKU, a phone number, a zero-padded ID, a version string - wrap it in quotes: \"0074\" and \"1.20\" then stay exactly as written. Quoting is also how you keep a value that contains a colon, or one you want to remain the literal text true, from being reinterpreted. When in doubt, quote it: a quoted number you genuinely wanted as a number is easy to spot and fix, but a silently corrupted ID is not." },

      { t: "h2", s: "Common reasons a conversion fails" },
      { t: "p", s: "YAML's reliance on whitespace makes indentation the usual culprit when something breaks." },
      { t: "ul", items: [
        "Use spaces, never tabs. YAML forbids tab characters for indentation, and mixing tabs with spaces is the most common cause of an \"unexpected indentation\" error - set your editor to insert spaces.",
        "Keep each level's indentation consistent. Every key inside the same block must line up in the same column; a stray extra space shifts a line into the wrong block.",
        "Close your quotes. An opening quote with no closing partner leaves the parser reading far past where you intended.",
        "Advanced YAML is out of scope. Anchors and aliases (& and *), explicit tags (!!str, !!int) and multi-line block scalars (| and >) are not supported - the converter targets the common subset real config files use. Simplify those to plain values first.",
      ]},

      { t: "h2", s: "It runs entirely in your browser" },
      { t: "p", s: "Configuration files often hold secrets - connection strings, hostnames, tokens - so where the conversion happens matters. The [YAML to JSON](/convert/yaml-to-json) converter parses everything inside your browser tab; nothing is uploaded to a server, and you can convert a sensitive manifest without it leaving your machine. Once you have JSON, the [JSON Formatter](/dev/json-formatter) will validate and pretty-print it, and the [JSON to CSV](/convert/json-to-csv) converter can flatten a list of records into a spreadsheet if you need it in tabular form." },
    ],
    faqs: [
      { q: "Why did my version number, ZIP code or ID change after converting?", a: "Unquoted values that look like numbers are converted to real numbers, so 0074 becomes 74 (the leading zero is dropped) and 1.20 becomes 1.2. When a value is a label rather than a quantity - a ZIP code, SKU, phone number, zero-padded ID or version string - wrap it in quotes in the YAML, e.g. \"0074\", and it will stay the exact string you typed." },
      { q: "Does it support anchors, tags and multi-line block scalars?", a: "No. The converter covers the common subset of YAML that real config files use - indentation-based mappings and lists, nested blocks, inline (flow) arrays and objects, quoted strings, numbers, booleans and null. Advanced features such as anchors and aliases (& and *), explicit tags (!!str) and block scalars (| and >) are not supported; simplify them to plain values before converting." },
      { q: "Is my YAML uploaded anywhere?", a: "No. The conversion runs entirely in your browser - the YAML you paste never leaves your device, which matters because config files often contain hostnames, connection strings and other secrets." },
    ],
  },
  // ---------------------------------------------------------------- IMAGE-RESIZER
  {
    slug: "how-to-resize-an-image",
    title: "How to Resize an Image",
    h1: "How to Resize an Image Without Stretching It",
    desc: "How to resize an image online: change width and height, keep the aspect ratio, pick the right dimensions for web or Instagram, and why upscaling adds no detail.",
    category: "image",
    tool: { slug: "image-resizer", title: "Image Resizer" },
    updated: "2026-07-24",
    body: [
      { t: "p", s: "A photo straight off a phone is often around 4,000 pixels wide - roughly three times wider than the space it will ever occupy in a blog post, a slide, or a profile picture. Resizing changes the picture's actual pixel dimensions so it matches where it is going: 1200 pixels for a web page, 1080 for an Instagram post, 150 for a thumbnail. This guide covers what resizing changes, why locking the aspect ratio stops photos looking stretched, how resizing differs from cropping and compressing, and why enlarging never brings detail back - with a worked example you can follow in the [Image Resizer](/image/image-resizer)." },

      { t: "h2", s: "What resizing actually changes" },
      { t: "p", s: "An image is a grid of pixels, and its dimensions are simply how many columns and rows that grid has. A typical 12-megapixel phone photo is 4032×3024 - just over 12.1 million pixels. Resizing rebuilds that grid at a new size. Going smaller, groups of neighboring pixels are averaged into single new ones, which is why a downscaled photo still looks sharp; the resizer uses high-quality smoothing so edges stay clean rather than jagged. Nothing else about the picture changes - same framing, same subject, same colors - there are simply fewer pixels describing it, and file size falls roughly in step with the pixel count. That makes resizing the biggest single saving available on an oversized image." },

      { t: "h2", s: "Resizing, cropping and compressing are three different things" },
      { t: "p", s: "All three end up with a smaller file, so they get muddled constantly, but they change different things:" },
      { t: "ul", items: [
        "Resizing changes the width and height. The whole picture is kept, just drawn with fewer pixels.",
        "Cropping cuts away part of the picture. The framing changes, and the pixels that remain are untouched.",
        "Compressing leaves the dimensions alone and re-encodes the image using fewer bytes, discarding fine detail your eye is unlikely to miss.",
      ]},
      { t: "p", s: "For anything heading to the web, the best results come from doing two of them in order: resize down to the size the image will actually be displayed at, then compress. A photo that only ever appears 1200 pixels wide gains nothing from being stored at 4032 pixels, and no compression setting can recover that waste. Run the resized file through the [Image Compressor](/image/image-compressor) - the [guide to compressing an image](/guides/how-to-compress-an-image) covers quality settings in detail." },

      { t: "h2", s: "Aspect ratio, and why the lock matters" },
      { t: "p", s: "Aspect ratio is the relationship between width and height. A 4032×3024 photo is 4:3, because both numbers divide evenly by 1008 to give 4 and 3. Changing it without meaning to is what makes a picture look subtly wrong - people slightly too wide, circles turned into ovals. The Image Resizer ships with 'Lock aspect ratio' switched on: type a width and the height is calculated from the original proportions, and type a height and the width follows. Leave it on unless you need an exact size that does not match the source shape." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take that 4032×3024 phone photo and suppose you want it 1200 pixels wide for a blog post. Drop it into the [Image Resizer](/image/image-resizer) and it reports 'Original: 4032×3024px'. With the lock on, type 1200 into the width box and the height snaps to 900 - because the original ratio is 4032 ÷ 3024 = 1.3333, and 1200 ÷ 1.3333 = 900. The numbers underneath are worth a look. The image is 3.36 times narrower (4032 ÷ 1200), but the pixel count falls from 12,192,768 to 1,080,000 - under 9 percent of the original, a reduction of about 91 percent. Pixel count scales with the square of the linear change, so shrinking each side by 3.36 times cuts the total by roughly 11 times over. On the page it looks identical, because the browser was squeezing those 4032 pixels into a 1200-pixel slot anyway." },

      { t: "h2", s: "Presets, and the one thing to watch" },
      { t: "p", s: "Four presets cover the sizes people ask for most: Instagram square 1080×1080, Instagram portrait 1080×1350, HD 1920×1080, and Thumbnail 150×150. Clicking one sets both numbers at once and deliberately switches the aspect-ratio lock off, since the point of a preset is an exact target size. That is the thing to watch: if your source shape does not match the preset, the image is stretched to fit. Forcing a 4:3 photo into the 1080×1080 square squeezes it horizontally by 25 percent - at that height it naturally wants to be 1440 wide. When the shapes differ, crop the picture to roughly the right proportions first, then apply the preset." },

      { t: "h2", s: "Why enlarging never adds detail" },
      { t: "p", s: "Resizing up is a different proposition. When you shrink an image the resizer chooses which of the existing pixels to keep; when you enlarge it, there is no extra information available, so new pixels have to be invented by interpolating between their neighbors. Take a 400-pixel-wide image up to 1600 and you get sixteen times the pixels and not one extra scrap of real detail - just softer edges and a blurred look. Always resize down from the largest original you have, and never treat an upscale as a way of recovering a low-resolution picture." },

      { t: "h2", s: "Choosing the right dimensions" },
      { t: "p", s: "Some sensible starting points for images viewed on a screen:" },
      { t: "ul", items: [
        "Blog or article images: 1200 to 1600 pixels wide covers high-density displays that render at roughly double resolution.",
        "Full-width hero images: 1920 wide, which is exactly what the HD preset gives you.",
        "Instagram: 1080 wide - square for the feed, or 1080×1350 for the taller portrait format.",
        "Thumbnails, avatars and list icons: 150 to 400 pixels square.",
        "Print is calculated differently - physical size times DPI, not screen pixels. A 4 by 6 inch photo at 300 DPI needs 1200×1800, far more than a web page ever asks for.",
      ]},

      { t: "h2", s: "How to resize an image, step by step" },
      { t: "ol", items: [
        "Open the [Image Resizer](/image/image-resizer) and drop your picture in - the original dimensions appear underneath it.",
        "Leave 'Lock aspect ratio' ticked and type your target width; the height fills itself in to keep the proportions.",
        "Or click a preset for an exact size - this unlocks the ratio, so crop to the right shape first if yours differs.",
        "Download the resized image. The file on your device is untouched, so the original is always still there.",
      ]},

      { t: "h2", s: "Private, and what you get back" },
      { t: "p", s: "The resize happens entirely inside your browser tab - the image is redrawn at its new size on your own device, and nothing is uploaded to a server, so a photo you would rather not hand to a website never leaves your machine. The download arrives as a PNG named after its new dimensions, such as resized-1200x900.png. PNG is lossless, so the save costs no quality, but PNG photographs are large - for a web-ready file, pass the result through the [Image Compressor](/image/image-compressor) for a JPG or WebP, or the [Image Converter](/image/image-converter) to change format only." },

      { t: "h2", s: "The bottom line" },
      { t: "p", s: "Resizing is about pixel dimensions, not file weight, and it is the fix for an image that is simply bigger than the place it is going. Keep the aspect ratio locked so nothing gets stretched, size down rather than up, and compress afterwards if it is bound for the web. Drop your photo into the [Image Resizer](/image/image-resizer), type one number, and download the result." },
    ],
    faqs: [
      { q: "Does resizing an image reduce its quality?", a: "Shrinking an image does not visibly hurt quality - neighboring pixels are averaged together, so a downscaled photo still looks sharp at its new size, and the only detail lost is detail you could not have seen at that size anyway. Enlarging is the opposite: there is no extra information to draw on, so new pixels are interpolated from existing ones and the result looks soft. Always resize down from the largest original you have." },
      { q: "What size should I resize an image to for a website?", a: "For most blog and article images, 1200 to 1600 pixels wide is ample - that covers high-density screens, which render at roughly double resolution. Use 1920 wide for a full-width hero, and 150 to 400 pixels for thumbnails and avatars. Match the width to the space the image actually occupies on the page; anything beyond that is bytes the visitor downloads and never sees." },
      { q: "Are my images uploaded to a server when I resize them?", a: "No. The Image Resizer works entirely in your browser using your own device, so your images never leave your computer. There is no fixed file-size limit beyond your device's available memory, and the resized image downloads as a PNG named after its new dimensions, such as resized-1200x900.png." },
    ],
  },
  {
    slug: "what-is-a-url-slug",
    title: "What Is a URL Slug? How to Create One (and Why It Matters for SEO)",
    h1: "What Is a URL Slug, and How Do You Create a Good One?",
    desc: "A URL slug is the readable, keyword-carrying tail of a web address, like how-to-brew-coffee. Learn what a slug is, what makes a good one, how a title becomes a clean slug, why hyphens beat underscores, and whether you should ever change a slug after publishing.",
    category: "text",
    tool: { slug: "slug-generator", title: "Slug Generator" },
    updated: "2026-07-25",
    body: [
      { t: "p", s: "Every web address has a part a human can actually read - the tail end that names the page. In example.com/blog/how-to-brew-coffee, that final how-to-brew-coffee is the slug. Get it right and the URL is short, memorable, easy to share and gives search engines a clear hint about the page. Get it wrong and you end up with something like /?p=482 or /Blog/My%20First%20Post!!, which is ugly to share and tells nobody anything. This guide explains what a slug is, what makes a good one, and how the [Slug Generator](/text/slug-generator) turns any title into a clean, URL-safe version in one step - all in your browser, with nothing uploaded." },

      { t: "h2", s: "What exactly is a slug?" },
      { t: "p", s: "A slug is the human-readable part of a URL that identifies a specific page, usually derived from the page's title. Break a typical address into its parts and it is easy to spot: in https://example.com/blog/best-pizza-recipe, https is the protocol, example.com is the domain, /blog is the path, and best-pizza-recipe is the slug. The word comes from newspaper publishing, where a \"slug\" was the short nickname editors gave a story while it moved through production - the same idea survives in the content management systems that power most websites today, which build a slug from each post's headline. A slug uses only a limited set of characters: lowercase letters, digits and a single separator. It deliberately leaves out spaces, capital letters, accents and punctuation, because those are either disallowed in a clean URL or have to be percent-encoded into unreadable escape codes." },

      { t: "h2", s: "Why slugs matter" },
      { t: "p", s: "A good slug does three jobs. It is readable: a person glancing at how-to-brew-coffee knows what the page is about before they click, which lifts trust and click-through from search results and shared links. It is a ranking signal: search engines read the words in a URL, and a slug that contains the page's main keywords reinforces what the page is about - not a huge factor on its own, but a free one. And it is shareable and stable: a short, word-based slug survives being pasted into a chat message or read aloud, where a string like /product?id=48721&ref=hp would not. Because the slug shows up in the browser tab, in search snippets and in the link preview on social media, it is one of the most visible pieces of text you never think to design." },

      { t: "h2", s: "What makes a good slug" },
      { t: "ul", items: [
        "Keep it lowercase. The path of a URL is case-sensitive, so /My-Post and /my-post can point to two different pages; sticking to lowercase avoids duplicate-content confusion.",
        "Use hyphens between words - not underscores or spaces (more on this below).",
        "Include the main keywords and drop the filler. best-pizza-recipe is stronger than the-best-pizza-recipe-you-will-ever-make; short words like \"the\", \"a\" and \"of\" add length without meaning.",
        "Keep it short - a handful of words is plenty. Long slugs get truncated in search results and are awkward to share.",
        "Stick to plain ASCII. Strip accents and non-Latin characters to their closest equivalents so the link works everywhere and never turns into percent-encoded gibberish.",
        "Make it stable. Choose a slug you will not need to change, because changing it later breaks every existing link (see the last section).",
      ] },

      { t: "h2", s: "How a title becomes a slug" },
      { t: "p", s: "Turning a headline into a slug is a fixed sequence of transformations, and the [Slug Generator](/text/slug-generator) applies them the moment you type. First it normalises accented and composed characters and removes the accent marks, so \"e\" with an acute accent becomes plain \"e\" and \"n\" with a tilde becomes \"n\". Then, if you leave the lowercase option on, it lower-cases everything. Next it replaces every run of characters that is not a letter or digit - spaces, punctuation, symbols, emoji - with a single separator, collapsing \"Hello   World!!!\" down to one hyphen between the two words rather than several. Finally it trims any separator left dangling at the start or end. The result is guaranteed to contain only letters, digits and your chosen separator." },
      { t: "p", s: "Take the messy title Cafe Rene: A Beginner's Guide (2024 Edition), typed with the proper accents on Cafe and Rene. Run it through with a hyphen separator and lowercasing on, and you get cafe-rene-a-beginners-guide-2024-edition. Notice what happened: the accents were stripped to plain letters, the colon, apostrophe and parentheses were removed, every gap between words became a single hyphen, and the closing bracket did not leave a stray hyphen dangling on the end. That string is now safe to drop straight into any URL." },

      { t: "h2", s: "Hyphens or underscores?" },
      { t: "p", s: "This is the one choice the tool leaves to you, and for web addresses the answer is almost always hyphens. Google has said for years that it treats a hyphen as a word separator but an underscore as a word joiner - so best-pizza-recipe is read as three separate words while best_pizza_recipe is read as the single token \"bestpizzarecipe\". For a URL you want the words seen individually, so use hyphens. The underscore option exists because the same clean-up is useful outside the web: file names, database columns and code identifiers often use snake_case, where underscores are the convention. Pick the separator to match the destination - hyphens for links, underscores for the odd file or variable name. For code naming specifically, the [Case Converter](/text/case-converter) also offers camelCase and snake_case output." },

      { t: "h2", s: "Should you change a slug after publishing?" },
      { t: "p", s: "Avoid it if you can. A page's slug is part of its permanent address, so once a link has been published, shared or indexed by search engines, changing the slug breaks every one of those links - visitors hit a 404, and any search ranking the old URL had earned is lost. If you genuinely must change it, because the title changed substantially or the original slug was bad, set up a 301 redirect from the old slug to the new one so existing links and search equity carry over. The practical lesson is to get the slug right before you publish: decide on a short, keyword-led, lowercase, hyphenated version up front, which is exactly what generating it from your final title produces." },

      { t: "p", s: "A slug is a small piece of a URL that does a surprising amount of work - for readers, for sharing and for search. The rules are simple enough to apply by hand, but doing it consistently across every page is exactly the kind of fiddly job worth automating. Paste your title into the [Slug Generator](/text/slug-generator), choose hyphens for a web address, and copy a clean slug that is ready to use." },
    ],
    faqs: [
      { q: "Are hyphens or underscores better in a URL slug?", a: "Hyphens, for anything that goes in a web address. Search engines treat a hyphen as a space between words, so best-pizza-recipe is understood as three words, while an underscore joins them into the single token bestpizzarecipe. Underscores still have their place in file names, database columns and code identifiers written in snake_case, which is why the tool offers both - but for the slug in a URL, choose the hyphen." },
      { q: "Can a slug contain capital letters, spaces or accents?", a: "Technically a URL can carry them, but you should not. The path of a URL is case-sensitive, so /My-Post and /my-post can be treated as two different pages; spaces must be percent-encoded as %20, which is ugly and error-prone; and accented or non-Latin characters get encoded into long escape sequences that no longer read as words. A good slug sidesteps all of this by using only lowercase letters, digits and hyphens - which is what the generator produces by lowercasing, stripping accents to plain letters, and replacing every space and symbol with a separator." },
      { q: "How long should a URL slug be?", a: "Short - typically three to five words is plenty. A slug only needs to carry the page's main keywords, so drop filler words like the, a, of and and unless they change the meaning. Long slugs get truncated in search results, are harder to read and share, and dilute the keywords that matter. Generate the slug from your title, then trim it back to the few words that actually describe the page." },
    ],
  },

  // ---------------------------------------------------------------- UNLOCK-PDF
  {
    slug: "how-to-unlock-a-pdf",
    title: "How to Unlock a PDF",
    h1: "How to Unlock a PDF: Owner Restrictions vs Open Passwords",
    desc: "How to unlock a PDF and remove printing, copying and editing restrictions for free. Learn the two kinds of PDF password and which one can be removed.",
    category: "pdf",
    tool: { slug: "unlock-pdf", title: "Unlock PDF" },
    updated: "2026-07-26",
    body: [
      { t: "p", s: "You open a PDF, it displays perfectly, and then you try to print it - or copy a paragraph out of it - and the option is greyed out. The document is not asking for a password, it simply refuses to let you do anything with it. That is a restricted PDF. This guide explains the two very different kinds of password a PDF can carry, why one can be lifted in seconds and the other cannot, how to remove printing and copying restrictions for free, and what to do when a file will not open at all." },

      { t: "h2", s: "The two kinds of PDF password" },
      { t: "p", s: "One fact clears up most of the confusion: the PDF format supports two separate passwords, and they do very different jobs. Almost every frustrating experience with a locked PDF comes down to not knowing which one you have." },
      { t: "ul", items: [
        "The user password, also called the document open password. This one controls whether the file can be opened at all. Without it, the reader shows a password prompt and displays nothing - no pages, no preview, no thumbnail.",
        "The owner password, also called the permissions password. This one does not stop the file from opening - anyone can view it normally. It sets flags telling readers to disallow certain actions: printing, copying text, editing, extracting pages, annotating, or filling forms.",
      ]},
      { t: "p", s: "Telling them apart takes seconds. If the document opens straight to page one and only misbehaves when you print or select text, it carries an owner password with restriction flags. If you are stopped at a prompt before seeing anything, it carries a user password. The first case is what the [Unlock PDF](/pdf/unlock-pdf) tool is built for; the second is a genuine wall." },

      { t: "h2", s: "Why owner restrictions come off so easily" },
      { t: "p", s: "When a PDF has only an owner password, the file is still technically encrypted - but with an empty user password. That has to be true, or your reader could not display the pages without asking you for anything. The decryption key is therefore effectively public: every conforming reader knows how to derive it from an empty string." },
      { t: "p", s: "The permissions themselves - no printing, no copying, no editing - are stored as a handful of bits in the file's encryption dictionary. They are not enforced by cryptography. They are a request. A well-behaved reader reads those bits and voluntarily greys out the menu items, which is exactly what Acrobat and your browser's built-in viewer do. Nothing about the content is actually sealed away. So the fix is straightforward: decrypt the document with the empty user password everybody already has, then write out a fresh copy carrying no encryption dictionary at all. The restriction bits have nowhere to live in the new file." },
      { t: "p", s: "The practical consequence is that removing owner restrictions is fast and lossless. Your text stays text - not flattened into images, re-scanned or re-typed. Pages, fonts, form fields and links all survive, because the content was never altered. Only the wrapper changed." },

      { t: "h2", s: "How to unlock a PDF" },
      { t: "p", s: "The whole process takes well under a minute:" },
      { t: "ol", items: [
        "Open the [Unlock PDF](/pdf/unlock-pdf) tool in your browser.",
        "Drag the restricted PDF onto the page, or click to select it.",
        "Check the file name and size that appear, so you know the right document loaded.",
        "Click Unlock and download. The tool decrypts the file with the empty user password and rebuilds it without the encryption dictionary.",
        "Your browser saves the result as unlocked.pdf. Open it and confirm printing and text selection now work.",
      ]},
      { t: "p", s: "A worked example makes it concrete. Say a bank sends a 6-page statement that opens fine but has printing disabled and text selection blocked, so you cannot copy a transaction line into a spreadsheet. Run it through the tool and you get back a 6-page PDF that looks identical, same fonts and layout, but where Ctrl+P works and any line of text can be selected. Nothing was re-rendered - the pages are the originals, minus the permissions wrapper." },

      { t: "h2", s: "What this tool cannot do" },
      { t: "p", s: "It cannot open a PDF that demands a password just to view it. When a user password is set, the encryption key is derived from that password and the page content is genuinely encrypted with it - there is no copy of the key stored in the file for a tool to find. Without the password the bytes making up the pages are unreadable, not merely hidden behind a flag. Modern PDFs use AES-256 for this, the same class of encryption that protects disks and network traffic, and no amount of clever file handling gets around it." },
      { t: "p", s: "If you load such a file, the tool says plainly that it cannot proceed rather than producing broken output. Any service promising otherwise for a strong password is either guessing common passwords or misleading you." },

      { t: "h2", s: "If you have forgotten the open password" },
      { t: "p", s: "When the document is yours and the password is simply lost, the realistic routes are about recovering the password rather than defeating the encryption:" },
      { t: "ul", items: [
        "Check your password manager and browser's saved passwords - work and bank documents are often protected with a credential you already stored.",
        "Look at the covering email or letter. Statements and payslips are frequently locked with a predictable value the sender told you: a date of birth in DDMMYYYY form, the last digits of an account, or a customer reference.",
        "Ask whoever produced the file to re-issue it without a password. For institutional documents this is usually the fastest path.",
      ]},

      { t: "h2", s: "Use it only on documents you are entitled to unlock" },
      { t: "p", s: "That owner restrictions are trivial to remove does not make it appropriate to remove them from anything you happen to have. Removing the flag does not remove the licence terms or copyright sitting behind it. Use unlocking for documents you own or control: your own statements, payslips and invoices, files you locked yourself, or documents a colleague sent with restrictions applied out of habit. If unsure, ask the sender for an unrestricted copy - it usually takes one email." },

      { t: "h2", s: "Is it private?" },
      { t: "p", s: "Yes. The [Unlock PDF](/pdf/unlock-pdf) tool runs entirely in your browser. Your file is read and rebuilt on your own device and never uploaded, which matters here - restricted PDFs are disproportionately bank statements, payslips, medical letters and contracts. Nothing is transmitted or stored, and no copy sits on someone else's machine once you close the tab." },

      { t: "h2", s: "Related tools" },
      { t: "p", s: "Unlocking is usually a first step, because a restricted file is one you were already trying to do something with. Once the restrictions are gone you can [split](/pdf/split-pdf) out the pages you need, [merge](/pdf/merge-pdf) the document with others, [compress](/pdf/compress-pdf) it for email, or [convert it to Word](/pdf/pdf-to-word) now that its text can be extracted. If the document is a scan with no text layer at all, restrictions are not your problem - run it through [OCR PDF](/pdf/ocr-pdf) instead. All of these run in your browser with no upload." },

      { t: "h2", s: "Unlock your PDF now" },
      { t: "p", s: "If a document opens fine but refuses to print or let you copy text, open the [Unlock PDF](/pdf/unlock-pdf) tool, drop the file in, and download an unrestricted copy with its pages, fonts and text intact. It is free, runs entirely in your browser, and your document never leaves your device." },
    ],
    faqs: [
      { q: "Can this open a PDF that asks for a password before it will display?", a: "No. That is a user password, and it is used to derive the key that actually encrypts the page content, so without it the pages are unreadable rather than merely hidden. Modern PDFs use AES-256 for this and it cannot be bypassed. The tool removes owner restrictions - the printing, copying and editing locks on a file that already opens normally." },
      { q: "Why is it so easy to remove printing and copying restrictions?", a: "Because those restrictions are not enforced by encryption. A PDF with only an owner password is encrypted with an empty user password, so every reader can already decrypt it - that is why it opens without prompting you. The permissions are just flags in the file that compliant readers voluntarily honour. Re-saving the document without the encryption dictionary leaves those flags nowhere to live." },
      { q: "Will unlocking a PDF change how the document looks or lower its quality?", a: "No. Nothing is re-rendered, re-scanned or re-compressed. The tool decrypts the file and writes out the same page objects without the permissions wrapper, so fonts, layout, images, links and form fields are unchanged and text stays selectable text rather than becoming an image." },
    ],
  },

  // ------------------------------------------------------------------- OCR-PDF
  {
    slug: "how-to-make-a-scanned-pdf-searchable",
    title: "How to Make a Scanned PDF Searchable",
    h1: "How to Make a Scanned PDF Searchable (OCR Explained)",
    desc: "How to make a scanned PDF searchable for free with OCR. Learn what the invisible text layer is, how to tell if your PDF needs it, and what affects accuracy.",
    category: "pdf",
    tool: { slug: "ocr-pdf", title: "OCR PDF (Make Scanned PDF Searchable)" },
    updated: "2026-07-27",
    body: [
      { t: "p", s: "You scan a contract, and a month later you need the one clause about a notice period. You press Ctrl+F, type the word, and get nothing - even though you can plainly see it on screen. The document looks like text but the file contains none. This guide explains why that happens, how OCR fixes it with an invisible text layer, and how to turn a scan into a PDF you can search, select and copy from." },

      { t: "h2", s: "Why a scanned PDF contains no text" },
      { t: "p", s: "A PDF is a container, and it can hold two very different kinds of page. One exported from Word or a browser stores real text objects: character codes, a font, and coordinates for each glyph. Search works because the file literally contains the letters." },
      { t: "p", s: "A scanned PDF holds none of that. Your scanner or phone camera produced a photograph of the paper, and the PDF wraps that photograph in a page. To your eyes the result is words; to software it is a grid of light and dark pixels. Nothing is broken and nothing is hidden - the text was never encoded in the first place. That is why search finds nothing, why you cannot select a sentence, and why [PDF to Word](/pdf/pdf-to-word) comes back empty on a scan." },

      { t: "h2", s: "How to tell whether your PDF needs OCR" },
      { t: "p", s: "The test takes five seconds. Open the PDF and try to drag-select a line of text:" },
      { t: "ul", items: [
        "If a normal blue text highlight follows the words, the PDF already has a text layer and does not need OCR.",
        "If you get a rectangular marquee - or nothing at all - the page is an image and needs OCR.",
        "Mixed documents are common: a typed report with a signed, scanned page on the end. Only the scanned pages lack text.",
      ]},
      { t: "p", s: "File size is a second clue. Ten pages of real text is often under 200 KB; ten scanned pages is usually several megabytes, because each one is a full-page image." },

      { t: "h2", s: "What OCR adds: the invisible text layer" },
      { t: "p", s: "OCR - optical character recognition - looks at the pixels, works out which shapes are which characters, and reports both the words and the coordinates of the box each one occupies. That second part is what makes a searchable PDF possible." },
      { t: "p", s: "Rather than replacing your scan with retyped text, the [OCR PDF](/pdf/ocr-pdf) tool keeps the original page image and draws the recognised words on top in an invisible font, each positioned over the pixels it came from. This text-layer sandwich has a useful property: the page still looks identical, so its appearance cannot go wrong, but Ctrl+F now finds words and copy-paste yields real characters. If OCR misreads a word, only the hidden copy is wrong - what you see is still the original." },

      { t: "h2", s: "How to make a scanned PDF searchable" },
      { t: "ol", items: [
        "Open the [OCR PDF](/pdf/ocr-pdf) tool and drop your scanned PDF onto the page.",
        "Pick the language in the document - English, Hindi, or English + Hindi for a mixed one.",
        "Click to start. The first run downloads the engine and language data, a few megabytes, then caches it.",
        "Wait while each page is rendered and read in turn. Progress is shown per page, because OCR is CPU-intensive.",
        "Your browser saves the result as your-file-searchable.pdf. Open it and press Ctrl+F to confirm.",
      ]},

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Say you have a 12-page scanned tenancy agreement and need every mention of \"deposit\". Each page is rendered at roughly 144 DPI, so an A4 page - 8.27 by 11.69 inches - becomes an image about 1,191 by 1,684 pixels: enough detail to separate an e from a c at normal type sizes, without images so large the output PDF becomes unwieldy." },
      { t: "p", s: "The pages are read one after another, then reassembled into a new PDF with the text layers attached. Search the result for \"deposit\" and the reader jumps straight to the clauses that mention it, highlighting each in place on the scan. You can copy the amount into an email instead of retyping it - and, just as usefully, [PDF to Word](/pdf/pdf-to-word) or [PDF to Excel](/pdf/pdf-to-excel) will now produce content, because those tools extract a text layer and there is finally one to extract." },

      { t: "h2", s: "What affects accuracy" },
      { t: "p", s: "OCR quality is decided mostly before you upload anything - by how the scan was made:" },
      { t: "ul", items: [
        "Resolution. Scan at 300 DPI where you can. Small print at 150 DPI leaves the engine guessing between similar shapes.",
        "Straightness. A page skewed by even a few degrees hurts noticeably, because line detection assumes roughly horizontal rows. Straighten the paper, not the file.",
        "Contrast. Crisp black on white is ideal. Phone photos with a shadow across the page, or a grey cast, cost accuracy - most scanner apps have a document mode that fixes both.",
        "Typeface. Clean printed type reads best. Handwriting, script fonts and dot-matrix print are far less reliable, and handwriting should not be relied on at all.",
        "Language. Selecting the right language loads its recognition model and character set. Choosing English for a Hindi document returns nonsense.",
      ]},
      { t: "p", s: "OCR is very good but never perfect. For anything consequential - an amount, a date, an account number - read it off the page image before relying on it." },

      { t: "h2", s: "Things worth knowing before you run it" },
      { t: "ul", items: [
        "Only run it on scans. Each page is re-rendered as an image, so a PDF that already has real text would come back rasterised - visually similar but no longer true text. Do the select test first.",
        "Expect it to take a while. Every page is rendered and then read on your own device, so a hundred-page scan is a coffee-break job rather than an instant one.",
        "Output size can grow, because the copy stores a freshly rendered image per page. If it needs to go by email, follow up with [Compress PDF](/pdf/compress-pdf).",
        "Password-protected files must be opened first - remove restrictions with [Unlock PDF](/pdf/unlock-pdf), then try again.",
      ]},

      { t: "h2", s: "Images versus PDFs" },
      { t: "p", s: "If what you have is a photo or screenshot - a receipt, a whiteboard, a page of a book - you probably want the text itself rather than a searchable document, and [extract text from an image](/image/image-to-text) gives you plain text to paste anywhere. Choose [OCR PDF](/pdf/ocr-pdf) when you want the document to stay a document: same pages, same signatures and stamps, but findable." },

      { t: "h2", s: "Why it matters that this runs in your browser" },
      { t: "p", s: "Scanned documents are, by their nature, the sensitive ones: contracts, ID pages, medical letters, bank statements. Most online OCR services upload your file to a server, so a copy sits on someone else's machine under their retention policy. The [OCR PDF](/pdf/ocr-pdf) tool instead does the whole job inside your browser tab - nothing is transmitted or stored, and it keeps working offline once the engine is cached, which is a fair sign no server is involved." },

      { t: "h2", s: "Make your scanned PDF searchable" },
      { t: "p", s: "If Ctrl+F comes up empty on a document you can clearly read, the file simply has no text in it yet. Open the [OCR PDF](/pdf/ocr-pdf) tool, drop the scan in, choose the language, and download a copy that looks identical but can be searched, selected and copied - free, and without the document leaving your device." },
    ],
    faqs: [
      { q: "Will OCR change how my scanned PDF looks?", a: "No. The original page image is kept and the recognised words are drawn on top in an invisible font, positioned over the pixels they came from. The page looks the same as your scan - same layout, signatures and stamps - but the words are now searchable and selectable. If the engine misreads something, only the hidden text copy is affected; what you see on screen is still the original scan." },
      { q: "Why does search still find nothing after I convert a PDF?", a: "Almost always because the PDF is a scan and has no text layer, so there is nothing for search to match. Try to drag-select a line: if you get a rectangular marquee instead of a text highlight, the page is an image and needs OCR. Run it through OCR PDF, then search the downloaded copy rather than the original file." },
      { q: "Can I OCR a PDF that is not in English?", a: "Yes, if the language is offered. The tool supports English, Hindi, and English + Hindi for documents that mix the two, and choosing the right option loads that language's recognition model and character set. Picking English for a Hindi page will return nonsense, so select the language that actually appears in the document." },
    ],
  },

  // ---------------------------------------------------------------- ROTATE-PDF
  {
    slug: "how-to-rotate-a-pdf-and-save-it",
    title: "How to Rotate a PDF and Save It",
    h1: "How to Rotate a PDF and Save It Permanently",
    desc: "How to rotate a PDF and save the rotation for free. Why viewer rotation does not stick, what the page rotation flag does, and which angle to pick.",
    category: "pdf",
    tool: { slug: "rotate-pdf", title: "Rotate PDF" },
    updated: "2026-07-28",
    body: [
      { t: "p", s: "You scan a stack of paper, open the PDF, and every page is lying on its side. You turn it upright in your viewer, read it, close it - and next time the file is sideways again. Or you email it and the recipient sees the original orientation, not the one you fixed. This guide explains why that happens, what rotating a PDF changes inside the file, and how to save a rotation permanently." },

      { t: "h2", s: "Why rotating in your viewer does not stick" },
      { t: "p", s: "Most PDF viewers offer a rotate button, and most of the time it does not do what you assume. There are two quite different operations wearing the same icon:" },
      { t: "ul", items: [
        "View rotation. The viewer turns the page on your screen for your convenience. Nothing is written to the file. Close the document and the setting is gone, and anyone else who opens it sees the original orientation.",
        "Saved rotation. The orientation is recorded inside the PDF itself, so every reader, on every device, and every printer shows the page the new way round.",
      ]},
      { t: "p", s: "Chrome's built-in viewer and many quick-look previews are the first kind - a temporary screen adjustment. That is why a page seems to spring back: it was never changed. To make a rotation permanent you have to write it into the document and save a new copy, which is what the [Rotate PDF](/pdf/rotate-pdf) tool does." },

      { t: "h2", s: "What rotating a PDF actually changes" },
      { t: "p", s: "Every page in a PDF carries a rotation value alongside its contents. It is a single number, it must be a multiple of 90, and it means: turn this page clockwise by this many degrees when displaying or printing it. A page with a rotation of 0 is shown as drawn; one with 180 is shown upside down." },
      { t: "p", s: "The important part is what does not change. Rotating a page does not move, redraw or re-encode anything on it: the text objects, fonts, images and their coordinates stay exactly as they were, and only that one number is updated. This is why rotation is lossless - no re-compression to soften a scan, and no rendering step that could turn selectable text into a picture. A searchable document stays searchable, links keep working, and form fields still accept input." },
      { t: "p", s: "One detail occasionally surprises people: the page's underlying size is not swapped, so a portrait page rotated by 90 degrees is still described internally as portrait, and simply displayed and printed landscape. Every conforming reader honours the flag, so in practice it behaves as landscape everywhere that matters." },

      { t: "h2", s: "How to rotate a PDF and save it" },
      { t: "p", s: "This takes a few seconds:" },
      { t: "ol", items: [
        "Open the [Rotate PDF](/pdf/rotate-pdf) tool in your browser.",
        "Drag your PDF onto the page, or click to choose it.",
        "Check the line that appears - file name, size and page count - so you know the right document loaded.",
        "Pick 90, 180 or 270 degrees clockwise.",
        "Click Rotate and download. Your browser saves the result as rotated.pdf, with the rotation baked in.",
      ]},
      { t: "p", s: "Open the downloaded file to confirm. The orientation now lives in the document, so it looks the same for whoever you send it to and prints the way it appears on screen." },

      { t: "h2", s: "Which angle do you need?" },
      { t: "p", s: "All three options turn the page clockwise, which is enough to reach any orientation. Match your problem to an angle:" },
      { t: "ul", items: [
        "90 degrees clockwise turns the top edge of the page over to the right-hand side.",
        "180 degrees flips the page upside down - the fix for pages fed into a scanner the wrong way up.",
        "270 degrees clockwise is the same thing as 90 degrees anticlockwise. If you need to turn a page counter-clockwise, choose 270 rather than looking for a separate button.",
      ]},
      { t: "h2", s: "A worked example: rotating an already-rotated page" },
      { t: "p", s: "The tool adds your angle to whatever rotation a page already has, rather than replacing it, and the arithmetic wraps around at 360. That is worth understanding, because it makes mistakes cheap to undo." },
      { t: "p", s: "Say you rotated a 12-page scan by 90 degrees yesterday, so every page now carries a rotation of 90 - but you turned it the wrong way. You do not need to hunt down the original. Load the rotated copy and choose 270 degrees clockwise: 90 + 270 = 360, which wraps to 0, so the pages return to exactly where they started. Choose 90 instead and you get 90 + 90 = 180. Nothing degrades however many times you go round, because each pass only rewrites that one number." },

      { t: "h2", s: "Every page gets the same rotation" },
      { t: "p", s: "The tool applies your chosen angle to every page, which is exactly what a sideways scan needs - the whole batch went through the feeder the same way, so it all takes the same correction in one step." },
      { t: "p", s: "It also means a mixed document is not fixed in a single pass. If page 1 is already upright and page 5 is sideways, rotating everything by 270 straightens page 5 but knocks page 1 out of true. The way round it is to [split](/pdf/split-pdf) the file, rotate only the section that needs it, then [merge](/pdf/merge-pdf) the pieces back in order - a couple more steps, each running in the browser in seconds." },

      { t: "h2", s: "Will rotating change the quality or size of my PDF?" },
      { t: "p", s: "No to quality. Nothing is re-rendered or re-compressed, so a rotated scan is exactly as sharp as the original and text stays real text rather than becoming an image. Rotating repeatedly cannot degrade a file the way re-saving a JPG does." },
      { t: "p", s: "Size stays effectively the same, since the only edit is one number per page. If you need the document smaller, rotate first, then run it through [Compress PDF](/pdf/compress-pdf)." },

      { t: "h2", s: "Is it private?" },
      { t: "p", s: "Yes. The [Rotate PDF](/pdf/rotate-pdf) tool runs entirely in your browser: your PDF is read from your disk, modified in memory on your own machine, and handed straight back as a download. It is never uploaded, and no copy exists anywhere else once you close the tab. That matters for the documents that most often arrive sideways - scanned contracts, ID copies, medical letters and bank paperwork." },

      { t: "h2", s: "If the file will not load" },
      { t: "p", s: "A PDF that demands a password before it will display cannot be read, so it cannot be rotated either - its contents are genuinely encrypted. Open it with the password in a reader and save an unprotected copy first. A file that opens normally but blocks printing or editing is a different case, and those restrictions can be cleared with [Unlock PDF](/pdf/unlock-pdf) before rotating." },

      { t: "h2", s: "Related tools" },
      { t: "p", s: "Rotation is usually one step in tidying up a scan. Once the pages face the right way you can [reorder them](/pdf/organize-pdf), [drop the ones you do not need](/pdf/remove-pages), [strip out blank sheets](/pdf/remove-blank-pages) the feeder picked up, [add page numbers](/pdf/add-page-numbers), or run [OCR](/pdf/ocr-pdf) to make the text searchable - best done after rotating, so the recognised text is the right way up." },

      { t: "h2", s: "Rotate your PDF now" },
      { t: "p", s: "If your pages keep reverting to sideways, the rotation was only ever on your screen. Open the [Rotate PDF](/pdf/rotate-pdf) tool, drop the file in, pick 90, 180 or 270 degrees, and download a copy with the orientation saved into the document - free, lossless, and without your file leaving your device." },
    ],
    faqs: [
      { q: "Why does my PDF go back to sideways after I rotate and close it?", a: "Because your viewer only rotated the page on screen without writing anything to the file. Chrome's built-in viewer and many quick previews work this way - it is a temporary display setting, so the change disappears when you close the document and other people never see it. To make a rotation permanent it has to be written into the PDF and saved as a new file, which is what Rotate PDF does." },
      { q: "Can I rotate just one page instead of the whole document?", a: "Not in a single step - the tool applies the same angle to every page, which is what a sideways scan needs. For a mixed document, split the PDF, rotate only the part that is wrong, then merge the pieces back together in order. Both the split and merge tools also run in your browser, so the round trip takes a minute and nothing is uploaded." },
      { q: "Does rotating a PDF reduce its quality or make it bigger?", a: "No. Rotation changes a single orientation value on each page and leaves the text, fonts and images completely untouched, so there is no re-compression and no loss of sharpness - and text stays selectable text rather than turning into an image. File size is essentially unchanged. You can rotate a file as many times as you like without degrading it." },
    ],
  },

  // ------------------------------------------------------------- WATERMARK-PDF
  {
    slug: "how-to-add-a-watermark-to-a-pdf",
    title: "How to Add a Watermark to a PDF",
    h1: "How to Add a Watermark to a PDF",
    desc: "How to add a watermark to a PDF for free. What a watermark really is inside the file, how to pick the opacity and font size, and why it deters rather than protects.",
    category: "pdf",
    tool: { slug: "watermark-pdf", title: "Watermark PDF" },
    updated: "2026-07-29",
    body: [
      { t: "p", s: "You are sending a contract out for review, circulating a report that is not final, or handing a proposal to a client - and you want every page to say so. A watermark does that: faint diagonal text across each sheet, hard to lose in a forward or a printout. This guide covers what a PDF watermark really is, how to pick the opacity and size, and what it does not protect you from." },

      { t: "h2", s: "What a watermark actually is inside a PDF" },
      { t: "p", s: "Despite the name, a watermark is not a property of the file or a security setting you switch on. It is simply more content drawn onto each page - a line of text, angled, in a pale grey, layered over whatever was already there. To the file format it is no different from a heading or a caption." },
      { t: "p", s: "That has two consequences. It sits on top of your content rather than behind it, so at a high setting it genuinely obscures the text underneath - which is why opacity matters. And it is real text, not a picture: crisp at any zoom, almost free in file size, and visible if someone selects the whole page or runs a search." },

      { t: "h2", s: "How to add a watermark to a PDF" },
      { t: "ol", items: [
        "Open the [Watermark PDF](/pdf/watermark-pdf) tool in your browser.",
        "Drag your PDF onto the page. The file name, size and page count appear, so you can confirm the right document loaded.",
        "Type your watermark text. It starts on CONFIDENTIAL - replace it with whatever you need.",
        "Set the opacity and font size with the two sliders.",
        "Click Add watermark and download. Your browser saves the result as watermarked.pdf.",
      ]},
      { t: "p", s: "The text is stamped across the centre of every page, running diagonally up from lower-left to upper-right at 45 degrees in mid-grey bold Helvetica. Your original file is never modified - what you get is a new copy." },

      { t: "h2", s: "Choosing the opacity" },
      { t: "p", s: "The opacity slider runs from 2 to 100 per cent and starts at 20. It sets how strongly the grey shows against the page:" },
      { t: "ul", items: [
        "10-20 per cent is a light tint: the document reads normally and the watermark registers as background texture.",
        "25-40 per cent is unmissable without fighting the body text. The sweet spot for a DRAFT or CONFIDENTIAL stamp.",
        "60 per cent and above competes with the content, and near 100 it is a solid grey band - worth it only for a specimen copy, meant to be looked at but not used.",
      ]},
      { t: "p", s: "If unsure, err light and open the download to check. Each run starts again from the file you loaded, so repeated attempts never stack one watermark on another." },

      { t: "h2", s: "Choosing the font size: a worked example" },
      { t: "p", s: "The size slider runs from 20pt to 120pt, starting at 60pt. Longer wording needs a smaller size: the text is centred and drawn outward, so if it is wider than the page the start of it falls off the edge." },
      { t: "p", s: "Take the default on a standard A4 portrait page, about 595 points wide. In bold Helvetica the word CONFIDENTIAL measures about 7.44 times the font size, so at 60pt it is roughly 447 points wide - comfortably inside 595, and once rotated it sits neatly in the middle of the sheet. At the maximum 120pt it measures about 893 points, far wider than the page, and the first letters are cut off on the left. For that word on A4 the limit is around 80pt." },
      { t: "p", s: "A rough rule for A4 portrait: divide 595 by 0.7 times the number of characters and stay at or below the answer. A five-letter DRAFT tolerates anything the slider offers; a twenty-character phrase like SAMPLE - DO NOT COPY needs about 40pt. Shorter is better regardless - a sentence shrunk to fit reads as clutter, while one or two words at 60pt read as a stamp." },

      { t: "h2", s: "What to write on it" },
      { t: "ul", items: [
        "CONFIDENTIAL - the default, for anything that should not be forwarded on.",
        "DRAFT or NOT FINAL - so last month's version is never mistaken for the signed one.",
        "SPECIMEN or SAMPLE - for templates and example documents.",
        "A recipient's name or company - the standard way to trace a leak, since each copy carries the name of who received it.",
      ]},
      { t: "p", s: "Keep to Latin characters. The watermark uses a font built into the PDF standard, which covers the usual Western European set - accented letters like e-acute and u-umlaut are fine - but it cannot render Devanagari, Chinese or other non-Latin scripts, and asking it to fails with an error rather than producing the wrong glyphs." },

      { t: "h2", s: "A watermark deters, it does not protect" },
      { t: "p", s: "Worth stating plainly, because the word implies more security than it delivers. The watermark is ordinary page content, so anyone with a PDF editor can strip it out. What it does well is signal intent and survive the casual routes by which documents escape - a forwarded email, a printout, a screenshot. All of those carry the stamp." },
      { t: "p", s: "Restricting what people can do with a document is a separate mechanism: an owner password and permission flags, the same ones that can be cleared with [Unlock PDF](/pdf/unlock-pdf). And if the content must not be extractable at all, no watermark achieves that - the answer is not to send the document." },

      { t: "h2", s: "Does it make the file bigger or worse?" },
      { t: "p", s: "Barely, and no. The font is a standard one that need not be embedded, so all that is added is a short drawing instruction per page - a couple of hundred bytes, or about 2.5 KB across ten pages. Quality is untouched, because nothing is re-rendered or re-compressed: scans stay as sharp as they were, existing text stays selectable, and links and form fields keep working." },

      { t: "h2", s: "Is it private?" },
      { t: "p", s: "Yes. [Watermark PDF](/pdf/watermark-pdf) runs entirely in your browser: the file is read from your own disk, the text drawn in memory on your machine, the result handed back as a download. Nothing is uploaded and no copy is left on a server - which matters more here than for most tools, since the documents worth watermarking are the sensitive ones." },

      { t: "h2", s: "If something goes wrong" },
      { t: "ul", items: [
        "The file will not load. A PDF that demands a password before it will even display is genuinely encrypted. Open it with the password, save an unprotected copy, and watermark that.",
        "The watermark is cut off at the edge. The text is too wide for the page at that size - shorten it or pull the font size down.",
        "An error appears instead of a download. Check the text box for non-Latin characters.",
      ]},

      { t: "h2", s: "Related tools" },
      { t: "p", s: "Watermarking is usually the last step before a document goes out. Before it you might [merge](/pdf/merge-pdf) the sections together, [reorder the pages](/pdf/organize-pdf), [drop the ones you do not need](/pdf/remove-pages) or [add page numbers](/pdf/add-page-numbers); afterwards, [compress](/pdf/compress-pdf) it if it is going by email. To stamp only part of a file, [split](/pdf/split-pdf) it first." },

      { t: "h2", s: "Add your watermark now" },
      { t: "p", s: "One or two words at 20-30 per cent opacity are usually all it takes for every page to announce what it is. Open [Watermark PDF](/pdf/watermark-pdf), drop your file in, type the text, set the sliders and download the stamped copy - free, private, and without your document leaving your device." },
    ],
    faqs: [
      { q: "Can I put the watermark behind the page content instead of on top?", a: "No - it is always drawn over the existing content, which is why the opacity slider is the control that matters. At the default 20 per cent the text underneath reads through perfectly clearly, so the practical effect is the same as a background tint. If your watermark is obscuring the document, lower the opacity rather than looking for a layering option." },
      { q: "Can I watermark only certain pages, or change the colour and position?", a: "The watermark goes on every page, in mid-grey, diagonally across the centre - the wording, opacity and font size are what you control. To stamp only part of a document, split the PDF, watermark the section you want, then merge the pieces back together in order. Both of those tools also run in your browser, so the round trip takes about a minute." },
      { q: "Does adding a watermark stop people copying or editing my PDF?", a: "No. A watermark is ordinary page content, so anyone with a PDF editor can remove it, and it places no restriction on copying, printing or editing. It is a deterrent and a label, not a lock - its value is that it survives forwarding, printing and screenshotting, so a leaked copy still says who it was for. Genuine restrictions come from password protection and permission flags, which are a different mechanism." },
    ],
  },

  // ---------------------------------------------------------------- SQL-FORMATTER
  {
    slug: "how-to-format-sql-queries",
    title: "How to Format SQL Queries",
    h1: "How to Format SQL for Readability",
    desc: "How to format SQL queries: one clause per line, indented JOIN conditions, keyword casing and comma style - the conventions, with a full before and after.",
    category: "dev",
    tool: { slug: "sql-formatter", title: "SQL Formatter" },
    updated: "2026-07-31",
    body: [
      { t: "p", s: "A SQL query written as one long line runs exactly as fast as the same query broken across a dozen clean ones - the database strips the whitespace before it does anything else. Formatting is entirely for the humans who read, review and debug the query later, which is why it gets skipped under deadline and why so much production SQL is unreadable. This guide covers the conventions experienced developers actually follow: one clause per line, indented join and filter conditions, keyword casing, and where the commas go. Paste your own query into the free [SQL Formatter](/dev/sql-formatter) as you read." },

      { t: "h2", s: "Why formatting matters when the database ignores it" },
      { t: "p", s: "Whitespace carries no meaning in SQL outside string literals. The parser tokenises your query and throws the line breaks away, so formatting can never make a query faster or slower. What it changes is everything that happens around the query." },
      { t: "ul", items: [
        "Debugging. When a query returns the wrong row count, the fault is almost always one join condition or one predicate. With each on its own line you can comment them out one at a time; on a single line you are counting parentheses.",
        "Version control. A one-line query means every edit rewrites the whole line, so the diff tells you nothing. One clause per line shows only the predicate that changed.",
        "Handover. Analytics SQL outlives the person who wrote it, and formatting is the cheapest documentation there is.",
      ]},

      { t: "h2", s: "The core rule: one clause per line" },
      { t: "p", s: "Nearly every SQL style guide agrees on this: each top-level clause starts a new line at the left margin, and anything continuing that clause is indented one level beneath it. That gives a query a predictable vertical skeleton, so your eye finds the FROM or the WHERE without reading a word. The rules:" },
      { t: "ul", items: [
        "SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT and OFFSET each begin a new line, flush left.",
        "Every JOIN - INNER, LEFT, RIGHT, FULL, CROSS - begins its own line, so the tables read as a vertical stack.",
        "A join's ON condition is indented one level under it, because it belongs to that join rather than being a new step.",
        "AND and OR are indented under the WHERE or ON they extend, and start the line rather than trailing the previous one.",
        "Selected columns go one per line, so adding or removing a column is a one-line diff.",
        "Set operators - UNION, EXCEPT, INTERSECT - sit flush left between the queries they combine.",
      ]},
      { t: "p", s: "The fourth rule is the one people get wrong. When AND leads the line you can read down the left edge and follow the filter logic without reading the values; when it trails, the operator is stranded where nothing lines up." },

      { t: "h2", s: "A worked example" },
      { t: "p", s: "A top-customers report of the kind that gets pasted into chat every day, written as a single line: select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 and u.created_at > '2026-01-01' group by u.id, u.name having count(o.id) > 3 order by orders desc limit 10;" },
      { t: "p", s: "Valid SQL, and completely opaque. Run it through the [SQL Formatter](/dev/sql-formatter) with keyword uppercasing on and it comes back as this, one line per bullet:" },
      // Indented lines use non-breaking spaces: ordinary leading spaces are
      // collapsed by HTML, which would hide the indentation this example is about.
      { t: "ul", items: [
        "SELECT u.id,",
        "\u00a0\u00a0u.name,",
        "\u00a0\u00a0COUNT(o.id) AS orders",
        "FROM users u",
        "LEFT JOIN orders o",
        "\u00a0\u00a0ON o.user_id = u.id",
        "WHERE u.active = 1",
        "\u00a0\u00a0AND u.created_at > '2026-01-01'",
        "GROUP BY u.id,",
        "\u00a0\u00a0u.name",
        "HAVING COUNT(o.id) > 3",
        "ORDER BY orders DESC",
        "LIMIT 10;",
      ]},
      { t: "p", s: "Nothing about the result set has changed - only whitespace and casing. But the shape of the query is now visible: three output columns, one left join, two filters, a grouped aggregate with its own threshold, ten rows. Notice that COUNT(o.id) stays on one line rather than exploding across three - line breaking applies to the top level, and expressions inside parentheses are left intact so a function call still reads as one unit." },

      { t: "h2", s: "Uppercase keywords, or leave them alone?" },
      { t: "p", s: "SQL keywords are case-insensitive, so this is a pure style choice - and the one people argue about most. The long-standing convention is uppercase keywords with lowercase identifiers, and the reason is contrast rather than tradition: when SELECT, FROM and WHERE are visually distinct from table and column names, you separate the language from your schema at a glance. That still helps anywhere there is no syntax highlighting - a review comment, a ticket, a log file. The counter-argument is that editors colour keywords anyway, so shouting them adds noise. Both are defensible; mixing the two across a codebase is not, because then casing signals nothing. Pick one and let a formatter enforce it." },

      { t: "h2", s: "Leading versus trailing commas" },
      { t: "p", s: "In a multi-line column list the comma can sit at the end of each line (trailing, the common default) or at the start of the next (leading). Trailing reads more naturally, since that is where a comma sits in prose. Leading has one concrete advantage: the comma is the first character on the line, so commenting out or deleting a column never leaves a dangling comma before the FROM - the classic syntax error from removing the last item in a list. That is why leading commas persist among analysts who edit long column lists all day. Either is fine; agree a house style and stop revisiting it." },

      { t: "h2", s: "What formatting must never change" },
      { t: "p", s: "A formatter is only trustworthy if it preserves behaviour, which means parts of a query must be left alone. Anything inside a string literal is data - re-casing it would change what the query matches - so quoted text passes through byte for byte. Quoted identifiers are the same story: in PostgreSQL a double-quoted name is case-sensitive, so changing it would point at a different column or break the query. Comments are kept verbatim, because the line explaining why a filter exists is often the most valuable one in the file." },
      { t: "p", s: "So formatting is safe and reversible on SQL you did not write - including SQL you do not yet understand, which is when you most need it readable. Because the [SQL Formatter](/dev/sql-formatter) runs in your browser, that also holds for queries you cannot paste into a third-party service: nothing is uploaded." },

      { t: "h2", s: "Fitting formatting into your workflow" },
      { t: "p", s: "Formatting pays off most when it is habitual rather than occasional:" },
      { t: "ol", items: [
        "Write the query however you think - one line, no capitals, whatever gets the logic down fastest.",
        "Once it returns the right rows, format it before you save or paste it anywhere. This is the step people skip.",
        "Format before every code review, so the diff shows the change rather than a rewrapped line.",
        "Format any query you inherit from a colleague, a ticket or a log before trying to understand it.",
        "Commit the formatted version, not the one-liner, so the next diff is readable too.",
      ]},
      { t: "p", s: "If your team runs a linter in CI, wire the same convention in there so the style is enforced rather than remembered. For ad-hoc work a browser tool is faster than configuring anything." },

      { t: "h2", s: "Related tools" },
      { t: "p", s: "If your query results end up as a data file, [JSON to CSV](/convert/json-to-csv) and [CSV to JSON](/convert/csv-to-json) handle both directions, and [JSON Formatter](/dev/json-formatter) does for API payloads what this does for queries. For epoch-integer timestamp columns, the [Unix Timestamp Converter](/convert/epoch-converter) turns them into readable dates while you debug a date filter." },

      { t: "h2", s: "Format your SQL now" },
      { t: "p", s: "Readable SQL is not a matter of discipline - it is a matter of not doing it by hand. Paste your query into the [SQL Formatter](/dev/sql-formatter), choose whether keywords are uppercased, and copy the result back. Free, and your query never leaves your device." },
    ],
    faqs: [
      { q: "Does formatting a SQL query change how it runs or how fast it is?", a: "No. The database strips whitespace and line breaks while parsing, so a formatted query produces exactly the same execution plan and the same results as the one-line version. Formatting only changes whitespace, line breaks and keyword casing - it is purely for the people reading the query." },
      { q: "Should SQL keywords be uppercase?", a: "It is a style choice, since SQL keywords are case-insensitive. Uppercase keywords with lowercase identifiers is the traditional convention because it separates the language from your schema at a glance, which helps anywhere there is no syntax highlighting. All-lowercase is a perfectly valid alternative. The important thing is consistency across a codebase, not which one you pick." },
      { q: "Will a formatter break my dialect-specific SQL?", a: "It should not. Formatting only adjusts whitespace and the casing of standard keywords, so dialect-specific syntax - PostgreSQL casts, MySQL backticks, SQL Server bracketed names, window functions, CTEs - passes through untouched rather than being rejected. String literals, quoted identifiers and comments are always preserved exactly, because changing any of those would change what the query does." },
    ],
  },
  // ---------------------------------------------------------------- NUMBER-TO-WORDS
  {
    slug: "how-to-write-numbers-in-words",
    title: "How to Write Numbers in Words",
    h1: "How to Write Numbers in Words (Cheques, Contracts and Style Rules)",
    desc: "How to write numbers in words: how a figure breaks into groups of three, writing an amount on a cheque, the hyphen and \"and\" rules, when style guides say to spell a number out, and lakh/crore vs million.",
    category: "convert",
    tool: { slug: "number-to-words", title: "Number to Words" },
    updated: "2026-08-01",
    body: [
      { t: "p", s: "Writing a number in words looks trivial until it lands on something that matters - a cheque, a contract, an invoice - and you stall over whether it is \"forty-five thousand two hundred fifty\" or \"forty five thousand, two hundred and fifty\". Numerals are compact but easy to misread and easy to alter; words are unambiguous and hard to tamper with, which is why banks and lawyers still insist on them. This guide covers how a figure breaks into words, how to write an amount on a cheque, the hyphen and \"and\" rules that trip people up, and when style guides say to spell a number out at all. The [Number to Words](/convert/number-to-words) converter handles the mechanical part instantly, in your browser." },

      { t: "h2", s: "How a number breaks into words" },
      { t: "p", s: "Long numbers are read in groups of three digits, counted from the right - which is precisely what the thousands commas are marking. Each group is spoken as an ordinary three-digit number and then labelled with the name of its group: thousand, million, billion, trillion. The rightmost group carries no label. Once you see that pattern, every number follows the same four rules:" },
      { t: "ul", items: [
        "Split into groups of three from the right. 45,250 is two groups - 45 and 250 - so it reads forty-five thousand two hundred fifty.",
        "Read the hundreds digit first, then the rest: 567 is five hundred sixty-seven.",
        "Numbers from 13 to 19 have their own words (thirteen, fourteen); from 20 up you combine a tens word with a unit word (sixty-seven).",
        "Skip any group that is all zeros. 2,500,000 is two million five hundred thousand - there is no \"zero thousand\" in the middle.",
      ]},

      { t: "h2", s: "A worked example" },
      { t: "p", s: "Take 1,234,567.89. The commas already show the groups: 1 | 234 | 567, plus a decimal part." },
      { t: "ul", items: [
        "1 sits in the millions group, so it is one million.",
        "234 is two hundred thirty-four, and its group label is thousand: two hundred thirty-four thousand.",
        "567 is the final group and takes no label: five hundred sixty-seven.",
        "The decimal part is read digit by digit after the word point: point eight nine.",
      ]},
      { t: "p", s: "Put end to end, that is one million two hundred thirty-four thousand five hundred sixty-seven point eight nine. Type 1234567.89 into the [Number to Words](/convert/number-to-words) converter and you get exactly that. Commas are optional - they are stripped before conversion, so 1,234,567.89 and 1234567.89 give identical output." },

      { t: "h2", s: "Writing an amount on a cheque" },
      { t: "p", s: "A cheque is the most common reason anyone needs this, and it follows conventions a plain conversion does not cover. The amount in words is the controlling figure: where the words and the numerals disagree, standard banking practice in most countries is that the words prevail. That redundancy is the entire point of writing the amount twice." },
      { t: "ol", items: [
        "Write the whole-number part in words. For 45,250.75 that is Forty-five thousand two hundred fifty.",
        "Name the currency after the number, not before: ... fifty rupees, or ... fifty dollars.",
        "Express the fractional part as a whole number of the minor unit rather than as digits after \"point\": and seventy-five paise, or and 75/100 on a US-style cheque.",
        "Finish with the word Only and rule a line through any leftover space. Both conventions exist to stop anything being added after your writing.",
      ]},
      { t: "p", s: "The finished line reads: Forty-five thousand two hundred fifty rupees and seventy-five paise only. The converter supplies the number wording - it returns Forty five thousand two hundred fifty point seven five - and you add the currency and the minor-unit phrasing, because those differ by country and sometimes by bank." },

      { t: "h2", s: "Hyphens, \"and\", and house style" },
      { t: "p", s: "Three formatting details are deliberately left to you, because the right answer depends on the document." },
      { t: "ul", items: [
        "Hyphens. Compound numbers from twenty-one to ninety-nine are hyphenated in standard written English: twenty-one, forty-five, ninety-nine. Larger numbers are not - it is two hundred fifty, never two-hundred-fifty. The converter outputs spaced words (forty five), so add the hyphens yourself for anything formal.",
        "The word \"and\". British English inserts it before the final part of a hundreds number - one hundred and five, two thousand and twenty. American English drops it: one hundred five. Neither is wrong; match whichever convention the rest of your document uses. The converter follows the American style.",
        "Capitalisation. The converter capitalises the first word so the result can stand alone on a cheque line; in running prose, lower-case it unless it starts the sentence.",
      ]},

      { t: "h2", s: "When should you spell a number out?" },
      { t: "p", s: "In ordinary prose, spelling out every number is unreadable, so the major style guides draw a line - just in different places:" },
      { t: "ul", items: [
        "AP style, used by news and most web writing: spell out one through nine, use numerals from 10 upward.",
        "Chicago style, used in books and academic writing: spell out whole numbers from zero through one hundred, plus round multiples such as two hundred or five thousand.",
        "Both agree on one hard rule: never begin a sentence with a numeral. Either rewrite the sentence or spell the number out.",
        "Always keep numerals for dates, page numbers, percentages, measurements, and money in tables - spelling those out hurts rather than helps.",
      ]},
      { t: "p", s: "Outside prose the goal changes: on cheques, contracts and invoices the amount is repeated in words to prevent tampering, not to read more smoothly - so it is spelled out however large it is." },

      { t: "h2", s: "Short scale, long scale, and lakh vs crore" },
      { t: "p", s: "\"Billion\" does not mean the same thing everywhere. The short scale - where a thousand million makes a billion (10^9) - is standard in the US and in modern British usage, and what this converter uses. The older long scale, still current in much of continental Europe, makes a billion a million million (10^12). Across borders, the words can be more ambiguous than the digits." },
      { t: "p", s: "The Indian numbering system groups differently again: above a thousand it counts in lakh (1,00,000 = one hundred thousand) and crore (1,00,00,000 = ten million), placing commas every two digits above the thousands group. The converter always returns short-scale English, so 10,000,000 comes back as ten million rather than one crore - convert with 1 lakh = 100 thousand and 1 crore = 10 million. Indian-style commas in the input are perfectly safe: 1,00,000 and 100000 both return one hundred thousand, since every comma is ignored before conversion." },

      { t: "h2", s: "Edge cases worth knowing" },
      { t: "ul", items: [
        "Negatives. A leading minus sign is read as the word negative, so -1,500 becomes negative one thousand five hundred.",
        "Decimals are read digit by digit. 0.5 is zero point five - not five tenths - and trailing zeros are spoken as typed, so 12.50 returns twelve point five zero.",
        "Very large numbers are named up to 21 digits, ending at quintillion. Past that there are no widely agreed names, so the converter reports an error rather than inventing one.",
        "Scientific notation is not accepted. Type 100000 rather than 1e5.",
      ]},

      { t: "h2", s: "Convert a number now" },
      { t: "p", s: "Paste any figure into the [Number to Words](/convert/number-to-words) converter and the words appear as you type - no sign-up, nothing uploaded, and the number never leaves your browser. If you are spelling out a figure worked out elsewhere, the [EMI Calculator](/finance/emi-calculator) and [GST Calculator](/finance/gst-calculator) produce the amounts that most often land on a cheque or an invoice." },
    ],
    faqs: [
      { q: "How do you write an amount in words on a cheque?", a: "Write the whole-number part in words, then the currency, then the fractional part as a whole number of the minor unit, then the word Only - for example \"Forty-five thousand two hundred fifty rupees and seventy-five paise only\" for 45,250.75. Rule a line through any leftover space so nothing can be added. Note the fraction is written as seventy-five paise (or 75/100), not as \"point seven five\", and that where the words and the numerals disagree, banking practice in most countries treats the words as the controlling amount." },
      { q: "Is it \"one hundred five\" or \"one hundred and five\"?", a: "Both are correct - it is a regional convention rather than a rule. British English inserts \"and\" before the final part of a hundreds number (one hundred and five, two thousand and twenty), while American English leaves it out (one hundred five). Pick whichever matches the rest of your document and stay consistent. The converter follows the American style, so add the \"and\" yourself if you are writing British English." },
      { q: "Why does it say ten million instead of one crore?", a: "The converter outputs short-scale English - thousand, million, billion, trillion - so it never uses lakh or crore. Convert with 1 lakh = 100 thousand and 1 crore = 10 million: 10,000,000 comes back as ten million, which is one crore. You can still type numbers with Indian-style comma grouping, because all commas are ignored before conversion - 1,00,000 and 100000 both return one hundred thousand." },
    ],
  },

  // ---------------------------------------------------------------- ADD-PAGE-NUMBERS
  {
    slug: "how-to-add-page-numbers-to-a-pdf",
    title: "How to Add Page Numbers to a PDF",
    h1: "How to Add Page Numbers to a PDF",
    desc: "How to add page numbers to a PDF for free: choosing the position and format, skipping a cover page, starting at a number other than 1, and setting the margin.",
    category: "pdf",
    tool: { slug: "add-page-numbers", title: "Add Page Numbers to PDF" },
    updated: "2026-08-02",
    body: [
      { t: "p", s: "A PDF does not know what page it is on. Scroll to the fourth sheet of a report and the viewer says 4 of 20, but that number lives in the toolbar, not the document - print it and the number is gone. Anyone reading a stapled stack, citing a paragraph in a meeting or putting a dropped pile back in order needs it on the paper. This guide covers how to put it there, where it should sit, and how to handle a cover page." },

      { t: "h2", s: "Why the numbers are not already there" },
      { t: "p", s: "Word and Google Docs keep page numbers in a header or footer - a running element the program repeats and renumbers as you edit. Exporting to PDF throws that machinery away: whatever the footer showed is flattened into each page as ordinary text at fixed coordinates. If no footer was set up, the pages come out bare, and there is no setting inside the file to switch on." },
      { t: "p", s: "Adding numbers to a finished PDF therefore means drawing new text onto every page. That is what [Add Page Numbers to PDF](/pdf/add-page-numbers) does: it opens the file, measures each page, and stamps a number where you choose, leaving the existing content untouched beneath it." },

      { t: "h2", s: "How to add page numbers to a PDF" },
      { t: "ol", items: [
        "Open the [Add Page Numbers](/pdf/add-page-numbers) tool and drop your PDF onto the page. The file name, size and page count appear, so you can confirm the right document loaded.",
        "Pick a position - one of six, from bottom centre to top left.",
        "Pick a format: a bare number, \"Page 1\", \"1 of 10\" or \"Page 1 of 10\".",
        "Set the starting number, font size and margin, and tick Skip the first page if page 1 is a cover.",
        "Click Add page numbers and download. The result is saved as numbered.pdf.",
      ]},
      { t: "p", s: "A line under the controls previews the first numbered page as you change the settings, so you can check it reads \"Page 1 of 9\" rather than \"Page 2 of 10\" before committing. Your original file is never modified." },

      { t: "h2", s: "Where to put the number" },
      { t: "p", s: "Six positions are offered, and the choice depends less on taste than on what happens to the document afterwards." },
      { t: "ul", items: [
        "Bottom centre, the default, is safest for anything read on screen or printed single-sided. Being symmetrical, it looks the same whichever way the pages are bound.",
        "Bottom right is the convention for reports printed double-sided - the outer edge of a right-hand page is where a thumb finds it while flicking through.",
        "Top right suits documents that live in a binder, since the corner stays visible when pages are clipped together.",
        "Avoid the top positions if your pages carry a running header, and the bottom ones if there is a footer - the number is drawn on top of whatever is there, not around it.",
      ]},

      { t: "h2", s: "Which format to use" },
      { t: "p", s: "The bare number is the least intrusive and the right default for a long document read straight through. \"Page 1\" is mostly useful when the page carries other stray numbers - invoice figures, clause numbers - and the page number needs to be unmistakable." },
      { t: "p", s: "The two \"of\" formats earn their keep on anything printed and handed over: \"1 of 10\" tells a reader that no page is missing, which is why it is standard on contracts, tenders and anything with a page limit. \"Page 1 of 10\" says the same thing and is the widest of the four - worth remembering if your margins are tight." },

      { t: "h2", s: "Covers, and starting at a number other than 1" },
      { t: "p", s: "Two settings handle the cases that trip people up. Skip the first page leaves page 1 unstamped - useful for a cover that should stay clean - and it also renumbers what follows. Take a 10-page report with a cover, set to \"Page 1 of 10\" and skip the first page: the cover comes out bare, the second sheet reads \"Page 1 of 9\", and the last reads \"Page 9 of 9\". The cover drops out of the count as well as the numbering, which is what a reader checking for missing pages expects." },
      { t: "p", s: "Start numbering at handles the opposite case: a file that is one section of something longer. For a 10-page appendix following 4 pages of front matter, set the start to 5 and choose \"1 of 10\" - the first page reads \"5 of 14\" and the last \"14 of 14\". The total describes the whole document, not the file in front of you." },

      { t: "h2", s: "Font size and margin: a worked example" },
      { t: "p", s: "Both sliders work in points, the PDF unit: 72 to the inch, so 28pt is about 9.9mm. The font size runs from 7pt to 24pt and starts at 11pt, roughly body-text size. Drop to 8 or 9pt for something discreet; go past 16pt only for large-format pages." },
      { t: "p", s: "The margin is measured from the page edge to the baseline the digits sit on. At the default 28pt on an A4 page - 595 by 842 points - a bottom-centre number sits 28pt above the bottom edge, comfortably inside the 1-inch margin a Word document typically leaves, so it lands in white space rather than on the last line. The top positions reserve the full line height, putting the baseline margin-plus-font-size from the top edge: 39pt at the defaults." },
      { t: "p", s: "Width only matters on the right-hand positions, and rarely: in 11pt Helvetica \"Page 1 of 10\" is about 62 points wide and even \"Page 247 of 312\" only about 80, so nothing runs off a 595pt-wide page. Do keep the margin at 20pt or more for anything going to print, since at the minimum 8pt the number sits closer to the trim than most printers reproduce." },

      { t: "h2", s: "Does it change the file?" },
      { t: "p", s: "Almost not at all. The number is drawn in Helvetica, which every PDF reader is required to have, so nothing is embedded - each page gains a couple of hundred bytes. Nothing is re-rendered or re-compressed, so scans stay as sharp as they were, existing text stays selectable, and links, bookmarks and form fields keep working." },

      { t: "h2", s: "If something goes wrong" },
      { t: "ul", items: [
        "The file will not load. A PDF that demands a password before it will display is genuinely encrypted - open it with the password, save an unprotected copy, and number that.",
        "The number lands on existing content. Raise the margin, or move it to a corner the page is not already using.",
        "The numbers look inconsistent. Mixed page sizes are each measured separately, so the number keeps the same distance from that page's own edge. Check the run before printing.",
      ]},

      { t: "h2", s: "Related tools" },
      { t: "p", s: "Numbering is a last step. Before it, [merge](/pdf/merge-pdf) the sections into one file, [reorder the pages](/pdf/organize-pdf) and [delete the ones you do not need](/pdf/remove-pages) - do that first, or the numbers will describe an order that no longer exists. Afterwards you might [add a watermark](/pdf/watermark-pdf) or [compress](/pdf/compress-pdf) the file for email." },

      { t: "h2", s: "Number your PDF now" },
      { t: "p", s: "For most documents the defaults are already right: bottom centre, 11pt, a 28pt margin, and Skip the first page ticked if there is a cover. Open [Add Page Numbers to PDF](/pdf/add-page-numbers), drop your file in and download the numbered copy - free, no sign-up, and done entirely in your browser." },
    ],
    faqs: [
      { q: "Can I use roman numerals for the front matter and restart at 1 for the body?", a: "Not in a single pass - the tool numbers with arabic digits and one continuous sequence per run. The workaround is to split the document, number each part separately and merge it back: split off the front matter, number the body starting at 1, then merge the two files again. If you only need the cover left alone, the Skip the first page option does that in one step, and it excludes the cover from the total as well as the numbering." },
      { q: "Will the page numbers cover up my existing footer?", a: "They can, because the number is drawn on top of the page rather than inserted into a reserved footer area - PDFs have no such area. If your pages already carry a footer, put the number somewhere the page is not using: a top corner, or the opposite bottom corner from the footer text. Raising the margin also helps, since it pushes the number further from the edge and away from a footer sitting tight to it." },
      { q: "Are my PDFs uploaded to a server?", a: "No. The file is read from your own disk, the numbers are drawn in memory on your machine, and the finished PDF is handed straight back as a download - nothing is sent anywhere and no copy is left on a server. That also means the tool works offline once the page has loaded, and that file size is limited only by your own device's memory rather than an upload cap." },
    ],
  },

  // ---------------------------------------------------------------- REMOVE-PAGES
  {
    slug: "how-to-delete-pages-from-a-pdf",
    title: "How to Delete Pages from a PDF",
    h1: "How to Delete Pages from a PDF",
    desc: "How to delete pages from a PDF for free: the page-range syntax, a worked example, when to use Split or Organize instead, and what changes inside the file.",
    category: "pdf",
    tool: { slug: "remove-pages", title: "Remove Pages from PDF" },
    updated: "2026-08-03",
    body: [
      { t: "p", s: "Most PDFs arrive with pages nobody asked for. A scanner adds the blank backs of every double-sided sheet, an export tacks a terms-and-conditions page onto an invoice, a downloaded form comes wrapped in four pages of instructions, and a bank statement carries a marketing insert. The content you want is fine; there is simply too much of it. This guide covers how to drop the unwanted pages, how to write the page list without counting twice, when a different tool is the better fit, and what deleting pages does to the file itself." },

      { t: "h2", s: "What deleting pages actually does" },
      { t: "p", s: "Nothing is erased in place. [Remove Pages from PDF](/pdf/remove-pages) reads your file, builds a new PDF, and copies over every page you did not list - in the original order, with the content untouched. Text stays selectable, images keep their resolution, and nothing is re-rendered or re-compressed, so a scan comes out exactly as sharp as it went in." },
      { t: "p", s: "The file on your disk is never modified. The result arrives as a separate download called pages-removed.pdf, so the original is still there if you cut the wrong page and need to start again. There is no undo inside the tool because there does not need to be one - just reload the original and redo the list." },

      { t: "h2", s: "How to delete pages from a PDF" },
      { t: "ol", items: [
        "Open the [Remove Pages](/pdf/remove-pages) tool and drop your PDF onto the page, or click to choose it from your device.",
        "Check the line that appears underneath - it shows the file name, size and total page count, so you know you loaded the right document and how far the numbering runs.",
        "Type the pages to delete in the box, using commas and hyphens: 2, 5-7.",
        "Read the count below the box. It tells you how many pages are being removed and how many will remain, before anything happens.",
        "Click Remove pages and download. The trimmed file saves as pages-removed.pdf.",
      ]},
      { t: "p", s: "Page numbers here mean sheet positions in the file - the first page is 1, whatever the printed folio in the corner says. A report whose body starts at printed page 1 on the third sheet still counts that sheet as 3. If the two are out of step, scroll the document in your reader and use the position it reports, not the number on the paper." },

      { t: "h2", s: "Writing the page list: a worked example" },
      { t: "p", s: "The syntax is the same one used across the PDF tools. A bare number is one page. Two numbers joined by a hyphen are a continuous range, and both ends are included - 5-7 is three pages, not two. Separate the entries with commas and mix the two forms freely." },
      { t: "p", s: "Take a 12-page scanned contract: page 1 is the courier's cover sheet, pages 4 to 6 are an appendix you were not meant to receive, and page 12 is a blank back. Type 1, 4-6, 12. That is five pages - 1, 4, 5, 6 and 12 - so the counter reads seven pages will remain, and the finished file runs 2, 3, 7, 8, 9, 10, 11 in that order." },
      { t: "p", s: "Three details save time on longer lists:" },
      { t: "ul", items: [
        "Overlaps are harmless. 3-7, 5 is still five pages, because a page listed twice is only removed once.",
        "Backwards ranges are accepted. 7-3 is read as 3-7, so a range typed in the wrong order does not cost you a retry.",
        "Out-of-range numbers stop the run rather than being ignored. On a 12-page file, 15 reports that page 15 is outside 1-12 - which usually means you have the wrong file open, so it is worth the interruption.",
      ]},
      { t: "p", s: "One list cannot empty the document: removing all 12 pages of a 12-page file is refused, because a PDF with no pages will not open in most readers." },

      { t: "h2", s: "Remove Pages or Split PDF?" },
      { t: "p", s: "The two tools are opposites, and they produce identical results from opposite lists. [Split PDF](/pdf/split-pdf) keeps the pages you name and discards the rest; Remove Pages discards the pages you name and keeps the rest. Neither is more accurate - pick whichever list is shorter to type and easier to check." },
      { t: "p", s: "On a 40-page report where you need to drop the three-page appendix, removing 38-40 is obviously easier than splitting 1-37. Invert it - you need only the summary on pages 4 and 5 - and splitting 4-5 beats removing 1-3, 6-40. The rule of thumb: if you are deleting less than half the document, use Remove Pages; if you are keeping less than half, use Split." },

      { t: "h2", s: "When a different tool fits better" },
      { t: "ul", items: [
        "You do not know which pages to delete without looking at them. [Organize PDF](/pdf/organize-pdf) shows every page as a thumbnail with a remove button, so you can spot the duplicates and drop them by eye - and reorder what is left in the same pass.",
        "You are cleaning up a scan. [Remove Blank Pages](/pdf/remove-blank-pages) finds the empty sheets for you and lists them with thumbnails to confirm, which beats scrolling a 90-page scan noting down every blank back.",
        "You want the removed pages kept as their own file. Run [Split PDF](/pdf/split-pdf) on those page numbers first to save them separately, then come back and delete them from the original.",
      ]},

      { t: "h2", s: "What changes in the file" },
      { t: "p", s: "The kept pages are copied across with the resources they use - their fonts, images and colour profiles - and anything used only by the deleted pages is left behind. So the file usually does shrink, though rarely in proportion: delete a third of the pages of a text document and the saving may be slight, because all the pages shared the same embedded fonts. If size is the real goal, run [Compress PDF](/pdf/compress-pdf) afterwards." },
      { t: "p", s: "Two things do not survive the rebuild, and both are worth knowing before you send the file on. A bookmark tree - the clickable outline some long PDFs carry in the sidebar - is not carried over. And internal links that pointed at a page you deleted no longer have a destination, so a contents page cross-referencing a removed section will have dead entries. Page content itself, including ordinary web links, is unaffected." },

      { t: "h2", s: "If something goes wrong" },
      { t: "ul", items: [
        "The file will not load. A PDF that demands a password before it displays is genuinely encrypted - open it with the password, save an unprotected copy, and trim that. [Unlock PDF](/pdf/unlock-pdf) handles the copies that only carry a printing or editing restriction.",
        "The wrong pages came out. Almost always an off-by-one from reading printed folios instead of sheet positions. Reload the original, check where page 1 of the file actually is, and redo the list - the original is untouched, so it costs nothing.",
        "You need to renumber afterwards. Deleting pages leaves any stamped page numbers describing the old document. Add fresh ones with [Add Page Numbers](/pdf/add-page-numbers) once the trimming is finished.",
      ]},

      { t: "h2", s: "Delete your pages now" },
      { t: "p", s: "Trimming a PDF is a 20-second job: load the file, type the pages, check the count, download. Open [Remove Pages from PDF](/pdf/remove-pages), drop your document in and get a clean copy - free, no sign-up, and processed entirely in your own browser." },
    ],
    faqs: [
      { q: "Can I get a deleted page back?", a: "Your original file is never modified - the trimmed version is a separate download called pages-removed.pdf, so the pages are still sitting in the file you started with. Open it again and either redo the list, or use Split PDF on the pages you cut to save them as their own document. The one thing to avoid is deleting pages from an already-trimmed file and overwriting as you go, because each round loses the reference copy." },
      { q: "Why is my PDF barely smaller after deleting pages?", a: "Because size follows content, not page count. When the kept pages are copied into the new file they bring their own fonts, images and colour profiles with them, and anything used only by the deleted pages is dropped - so cutting five image-heavy scans saves a lot, while cutting five pages of text that shared the document's embedded fonts saves very little. If shrinking the file is the actual goal, run Compress PDF on the result." },
      { q: "Is my PDF uploaded to a server?", a: "No. The file is read from your own disk, the new PDF is assembled in memory on your machine, and the result is handed straight back as a download - nothing is sent anywhere and no copy is left on a server. That matters for the documents people most often need to trim, which tend to be contracts, statements and scanned ID. It also means the tool keeps working offline once the page has loaded." },
    ],
  },
  {
    slug: "how-to-crop-an-image",
    title: "How to Crop an Image",
    h1: "How to Crop an Image Without Losing Quality",
    desc: "How to crop a photo online: drag the selection or type exact pixels, lock a ratio like 1:1 or 16:9, pick the right crop for a profile picture, and why cropping never softens the pixels you keep.",
    category: "image",
    tool: { slug: "crop-image", title: "Crop Image" },
    updated: "2026-08-03",
    body: [
      { t: "p", s: "A photo is framed for the moment it was taken, not for the box it eventually has to sit in. A profile picture wants a square, a video thumbnail wants 16:9, a product shot wants the subject filling more of the frame. Cropping fixes all three: you choose a rectangle inside the picture and everything outside it is discarded. This guide covers what cropping changes, how ratio locking works, how to crop to exact pixels, and how cropping differs from resizing and compressing - with a worked example you can follow in the [Crop Image](/image/crop-image) tool." },

      { t: "h2", s: "What cropping actually does" },
      { t: "p", s: "An image is a grid of pixels. Cropping copies a smaller rectangle out of that grid and throws the rest away. The pixels you keep come across exactly as they were - same resolution, same colours, same sharpness - so cropping is one of the few edits that cannot soften a photo. That is the difference from resizing, which rebuilds the whole grid and has to average pixels to do it." },
      { t: "p", s: "What does change is the pixel count, and file size follows it roughly in proportion to area. A 12-megapixel phone photo is 4032x3024, or 12,192,768 pixels. Take the largest square out of it and you get 3024x3024 - exactly 75% of the original, because you kept 3024 of the 4032 columns and every row. Framing changes too: cropping in tight makes the subject larger, but no extra detail appears, so a hard crop of a small image looks soft displayed large." },

      { t: "h2", s: "Cropping in the browser, step by step" },
      { t: "ol", items: [
        "Drop a PNG, JPG or WebP onto the [Crop Image](/image/crop-image) tool, or click to choose one. The file is read from your device - nothing is uploaded.",
        "A selection box appears covering 80% of the picture, centred, with a grip on each corner and edge and rule-of-thirds lines inside.",
        "Pick an aspect ratio, or leave it on Free for any shape.",
        "Drag inside the box to move it, or a grip to resize it. The box cannot leave the image.",
        "Check the readout below - it shows the original and the crop size in pixels.",
        "Choose PNG or JPG, then download. Reset puts the box back around the whole image.",
      ]},

      { t: "h2", s: "Locking an aspect ratio" },
      { t: "p", s: "An aspect ratio is the shape of a rectangle expressed as width against height, independent of size: 1:1 is a square, 16:9 a widescreen video, 9:16 a phone screen upright. Anywhere an image must fit a fixed slot, the slot has a ratio, and cropping to it yourself is how you control what gets cut." },
      { t: "p", s: "Choosing a preset fits the largest box of that shape inside your image, centres it, and keeps the shape locked while you drag. On a 4032x3024 photo, 1:1 gives a 3024x3024 box starting 504 pixels from the left, because (4032 - 3024) / 2 = 504. Picking 16:9 gives 4032x2268 sitting 378 pixels down, since 4032 x 9 / 16 = 2268 and (3024 - 2268) / 2 = 378. Picking 4:3 selects the whole image, because 4032x3024 is already 4:3." },
      { t: "p", s: "The presets cover the common shapes: 1:1 for profile pictures, 16:9 for thumbnails and slides, 4:3 and 3:2 for photo prints, 3:4, 2:3 and 9:16 for portrait crops. Anything else - Instagram's 4:5, for instance - is a job for the pixel fields below." },

      { t: "h2", s: "Cropping to exact pixels" },
      { t: "p", s: "Under the picture are four number fields: X, Y, Width and Height, in pixels of the original image. X and Y are measured from the top-left corner, so X 504, Y 0 starts the crop 504 pixels in from the left, flush with the top. Typing into them moves the box and dragging the box updates them - two views of one selection, so you can rough it out by eye then round the numbers by hand." },
      { t: "p", s: "Every value is clamped to stay inside the image, which explains behaviour that looks like a bug: if your box is 320 wide on a 400-wide image, X will not go past 80, because 80 + 320 is the full width. Shrink the width first and X moves further. With a ratio locked, changing one dimension changes the other." },

      { t: "h2", s: "A worked example: a profile picture from a phone photo" },
      { t: "p", s: "Say you have a 4032x3024 landscape photo and need a square avatar. Load it into [Crop Image](/image/crop-image) and click 1:1. The box snaps to 3024x3024 at X 504, Y 0 - the biggest square the photo can give. Your subject is rarely dead centre, so drag the box left or right until the face sits where you want it; only X changes, because a full-height square has nowhere to go vertically." },
      { t: "p", s: "To make the head larger in the frame, pull a corner grip inwards. The box stays square and the readout counts down - stop at, say, 2000x2000. Download as PNG and every pixel is at its original quality." },
      { t: "p", s: "Most avatar slots are far smaller, so the last step is to shrink it: run the square through the [Image Resizer](/image/image-resizer) at 1080x1080. Crop first, then resize - that order lets you choose the framing before any pixels are averaged away. The other way round throws away detail you then have to crop into." },

      { t: "h2", s: "Crop, resize or compress?" },
      { t: "ul", items: [
        "Crop changes what is in the picture. Use it when the framing or the shape is wrong - too much sky, a distracting edge, a landscape photo that needs to be square.",
        "[Resize](/image/image-resizer) changes how many pixels describe the same picture. Use it when the framing is fine but the image is too big or too small for where it is going.",
        "[Compress](/image/image-compressor) changes how efficiently those pixels are stored. Use it when the dimensions are right but the file is too heavy for an upload limit.",
      ]},
      { t: "p", s: "They stack in that order. If what you need is a passport or visa photo, skip the lot and use the [Passport Photo Maker](/image/passport-photo-maker), which crops to official sizes at print resolution." },

      { t: "h2", s: "PNG or JPG on the way out" },
      { t: "p", s: "PNG is lossless and keeps transparency - the right choice for logos, screenshots and diagrams. JPG re-encodes the image into a much smaller file, which suits photographs, but cannot store transparency: transparent areas are filled with white. Crop to PNG if the result will be edited again, to JPG if it is going straight to a website or upload form. To change format afterwards, use the [Image Converter](/image/image-converter)." },

      { t: "h2", s: "If something looks wrong" },
      { t: "ul", items: [
        "The crop is smaller than expected. Trust the readout, not the box - the preview is scaled to fit the page.",
        "The box will not move further. It is clamped to the edge of the image. Reduce the width or height first, then move it.",
        "The result looks soft when enlarged. Cropping cannot add detail - a 300x300 crop shown 900 pixels wide is stretched threefold. Take a larger crop.",
        "Transparency turned white. That is JPG doing what JPG does. Crop again and choose PNG.",
      ]},

      { t: "h2", s: "Crop your image now" },
      { t: "p", s: "Cropping is a ten-second job: load the photo, pick a ratio or drag freely, check the readout, download. Open the [Crop Image](/image/crop-image) tool and take the rectangle you actually want - free, no sign-up, no watermark, processed entirely in your own browser." },
    ],
    faqs: [
      { q: "Does cropping an image reduce its quality?", a: "No. The pixels inside the box are copied across at their original resolution and nothing is resampled, so the part you keep is exactly as sharp as it was. What changes is how many pixels you are left with - crop a 4032x3024 photo down to 600x600 and you have a perfectly sharp 600x600 image, but it will look soft if you then display it a thousand pixels wide. Choosing PNG keeps the result lossless; choosing JPG re-encodes it, which is a small quality cost in exchange for a much smaller file." },
      { q: "How do I crop an image to an exact size in pixels?", a: "Use the X, Y, Width and Height fields under the preview. Width and Height set the size of the crop and X and Y set where it starts, measured from the top-left corner of the original. Set the width and height first, then the position - the values are clamped so the box always stays inside the image, so a box that is already as wide as the space remaining will refuse to move further right until you shrink it. Dragging the box on screen updates the same numbers, so you can rough out the framing by eye and then type exact values." },
      { q: "Are my images uploaded when I crop them online?", a: "No. The image is read straight from your device, the crop is drawn onto a canvas in the page, and the result is handed back as a download - it is never sent to a server and no copy is kept anywhere. That matters for the things people most often crop, which tend to be personal photos, screenshots containing private information and scans of documents. It also means the tool keeps working with no connection once the page has loaded." },
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
  { slug: "text", label: "Text & writing", icon: "text" },
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
