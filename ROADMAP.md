# Finance Tools Roadmap

Research-backed plan to make the finance calculators more useful and capture
more organic search traffic, while keeping the static-export, no-login,
privacy-first architecture (everything runs client-side; no backend, no paid
APIs). Prioritised quick-wins first.

Provenance: deep-research run (23 sources, 25 claims adversarially verified).
✓ = 3-vote confirmed. Competitors referenced: Groww, ClearTax, Bankrate,
Calculator.net, emicalculator.net.

## Strategic note

The biggest SEO lever is **breadth + internal linking**, not polish: top
competitors rank with 30+ calculators; we have 7. Each calculator variant is
its own URL targeting its own keyword. Dedicated pages for high-volume variants
(e.g. step-up SIP) beat a toggle buried inside an existing tool.

FAQ and HowTo rich results are fully deprecated by Google (FAQ removed for all
sites May 7, 2026) ✓ — keep the markup (harmless, may aid AI Overviews) but
don't invest there. `SoftwareApplication` JSON-LD is the live structured-data
opportunity ✓.

## Tier 1 — new calculators (quick wins, simple client-side math) — DONE

Each is a new URL/keyword, reuses the existing `Calc.jsx` primitives + locale
formatter, and auto-joins the finance related-tools cluster. All formulas were
adversarially verified (RD quarterly compounding, PPF annuity-due, SWP corpus
depletion all confirmed against a worked example).

- [x] Recurring Deposit (RD) calculator
- [x] PPF calculator
- [x] Simple Interest calculator
- [x] CAGR calculator
- [x] Lumpsum investment calculator
- [x] SWP (Systematic Withdrawal Plan) calculator
- [x] Inflation calculator
- [x] ROI calculator

## Tier 2 — high-demand, more logic / yearly maintenance

- [ ] NPS / Retirement corpus calculator
- [ ] Gratuity calculator
- [ ] HRA exemption calculator (3-way formula)
- [ ] Income Tax calculator — old vs new regime, section-wise deductions
      (80C, 80CCD(1B), 80D, 80G, 80E, 80TTA/TTB), current AY slabs ✓ (deferred:
      heavy + needs yearly updates)
- [ ] In-Hand Salary calculator — CTC → net pay (Basic, HRA, LTA, EPF)

## Deepen existing calculators

- [ ] Step-up / top-up SIP — as its own page (Groww runs a dedicated one) ✓
- [ ] SIP / FD / CI inflation-adjusted ("real") returns
- [ ] Lumpsum-vs-SIP comparison
- [ ] EMI prepayment / part-payment modes (monthly, quarterly, yearly, one-time) ✓
- [ ] EMI / mortgage full amortization schedule + chart ✓
- [ ] Mortgage full-cost inputs: property tax, insurance, PMI, down payment,
      maintenance, one-time (stamp duty / registration) ✓
- [ ] FD / RD post-tax returns (TDS on interest)
- [ ] GST CGST/SGST/IGST split (India) ✓

## Cross-cutting UX (all backend-free)

- [ ] Year-by-year breakdown tables (Groww-standard) ✓
- [ ] Charts: growth line + donut breakdown (dwell-time boost)
- [ ] Internal-linking calculator clusters (strongest verified SEO pattern) ✓
      — partly automatic via same-category related tools
- [ ] Shareable result URLs (encode inputs in query params via
      `encodeURIComponent`, rehydrate on load) ✓
- [ ] PDF / CSV / print export (jsPDF / html2pdf, fully client-side) ✓
- [ ] `SoftwareApplication` JSON-LD on every tool page ✓
