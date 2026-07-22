# CA-provinces-1 — 2026 Canadian Provincial Income Tax
## Alberta, British Columbia, Manitoba, New Brunswick, Newfoundland & Labrador (+ Quebec)

**Research date: 20 July 2026. Tax year in effect: 2026 calendar year (1 Jan 2026 – 31 Dec 2026).**
Canada is a calendar-year jurisdiction. The 2026 return is filed by 30 April 2027.

---

## 0. CRITICAL — TWO MID-YEAR 2026 CHANGES

Two provinces changed parameters **after** the January payroll tables were published. An
implementation built from January 2026 data, or from pre-2026 memory, will be wrong.

### 0.1 British Columbia — lowest rate raised
Announced **17 February 2026**. For 2026 and subsequent years the lowest BC personal
income tax rate rose **5.06% → 5.60%**.

Because employers withheld at the old rate for the first six months, CRA prescribes a
**prorated withholding rate of 6.14%** for the lowest bracket from the first payroll in
July 2026 through December 2026.

- **Annual/return rate (use for annual tax liability): 5.60%**
- **Payroll withholding rate Jul–Dec 2026 only: 6.14%**
- Check: (5.06 + 6.14) / 2 = 5.60 ✓

### 0.2 Newfoundland & Labrador — basic personal amount raised
Announced **29 April 2026** (Budget 2026). NL BPA for 2026 rose from the indexed
**$11,188** to **$13,094**, effective 1 January 2026.

CRA prescribes a **prorated BPA of $15,000** for payroll withholding from the first
payroll in July 2026 to year end.

- **Annual/return BPA (use for annual tax liability): $13,094**
- **Payroll withholding BPA Jul–Dec 2026 only: $15,000**
- Check: (11,188 + 15,000) / 2 = 13,094 ✓

> NL Budget 2026 headline says "increasing the basic personal amount to $15,000". The
> $15,000 is the *payroll-table* figure for H2 2026 (and the trajectory figure); the
> **annual 2026 BPA on the tax return is $13,094**, confirmed on the NL Dept. of Finance
> personal income tax page. See caveats.

### 0.3 Other 2026 indexation factors (confirmed, CRA)
| Jurisdiction | 2026 indexing factor |
|---|---|
| Federal | 2.0% |
| Alberta | 2.0% |
| British Columbia | 2.2% |
| Manitoba | **not indexed** (frozen) |
| New Brunswick | 2.0% |
| Newfoundland & Labrador | 1.1% |

Also confirmed: **BC bracket indexation is paused for 2027–2030**, resuming 2031.
No 2026 change for AB, MB, NB (structural), NT, NS, NU, ON, SK, YT.

---

## 1. ALBERTA — 2026

Source: alberta.ca personal income tax page (provincial authority), corroborated by CRA.

### Brackets (annual taxable income)
| Rate | 2026 threshold |
|---|---|
| 8%  | $0 – $61,200 |
| 10% | $61,200.01 – $154,259 |
| 12% | $154,259.01 – $185,111 |
| 13% | $185,111.01 – $246,813 |
| 14% | $246,813.01 – $370,220 |
| 15% | over $370,220 |

The 8% first bracket was introduced for 2025; from 2026 the $60,000 base is indexed like
the other thresholds (→ $61,200), and the legislated 8% rate applies to it.

### Basic personal amount
**$22,769** (2025: $22,323; ×1.02 = $22,769). Highest BPA of any province.
Credit value = 22,769 × 8% = **$1,821.52**.

### Other
- **No provincial surtax.**
- **No provincial low-income tax reduction.**
- **No health premium.** Alberta Health Care Insurance Plan premiums were eliminated in 2009.
- BPA does **not** phase out at high income.

---

## 2. BRITISH COLUMBIA — 2026

Source: gov.bc.ca personal income tax rates (provincial authority), corroborated by CRA + taxtips.ca.

### Brackets (annual taxable income)
| Rate | 2026 threshold |
|---|---|
| **5.60%** | $0 – $50,363 |
| 7.70%  | $50,363.01 – $100,728 |
| 10.50% | $100,728.01 – $115,648 |
| 12.29% | $115,648.01 – $140,430 |
| 14.70% | $140,430.01 – $190,405 |
| 16.80% | $190,405.01 – $265,545 |
| 20.50% | over $265,545 |

Thresholds indexed +2.2% from 2025. **Use 6.14% instead of 5.60% only for Jul–Dec 2026
payroll withholding** (see §0.1).

### Basic personal amount
**$13,216** (2025: $12,932; ×1.022 = $13,216).
Credit value = 13,216 × 5.60% = **$740.10**.

### BC Tax Reduction (non-refundable, materially affects low earners)
Revised for 2026 alongside the rate change:
- **Maximum reduction: $575**
- Full $575 for net income **≤ $25,570**
- Partial reduction for net income **$25,570 – $41,722**
- **Zero at net income ≥ $41,722**
- Phase-out rate: **3.56%** of net income above $25,570
  (derived: 575 / (41,722 − 25,570) = 575 / 16,152 = 3.560%)

Formula:
```
if NI <= 25570:  reduction = 575
elif NI < 41722: reduction = max(0, 575 - 0.0356 * (NI - 25570))
else:            reduction = 0
BC_tax = max(0, BC_tax_after_credits - reduction)   # cannot go below zero
```

### Other
- **No provincial surtax.**
- **No employee-paid health premium.** BC MSP premiums were eliminated 1 January 2020.
- **BC Employer Health Tax (EHT)** — payroll tax paid **by the employer only**. It does
  not reduce employee net pay. Employer cost, tiered on BC payroll, with a small-employer
  exemption. 2026 rates/thresholds not verified in this session — see caveats.

---

## 3. MANITOBA — 2026

Source: manitoba.ca Finance (provincial authority), corroborated by CRA + taxtips.ca.

### Brackets (annual taxable income)
| Rate | 2026 threshold |
|---|---|
| 10.80% | $0 – $47,000 |
| 12.75% | $47,000.01 – $100,000 |
| 17.40% | over $100,000 |

**Thresholds are FROZEN.** Manitoba announced 20 March 2025 that, for 2025 and subsequent
tax years, both the BPA and the bracket thresholds are **not indexed**. They sit at 2024
levels and are unchanged for 2026.

### Basic personal amount — WITH HIGH-INCOME PHASE-OUT
**Maximum $15,780** (unchanged from 2025; not indexed).

Phase-out over net income **$200,000 → $400,000** (2025 and subsequent years):
```
if NI <= 200000:  BPA = 15780
elif NI >= 400000: BPA = 0
else:              BPA = 15780 * (1 - (NI - 200000) / 200000)
                   # equivalently 15780 - 0.0789 * (NI - 200000)
```
Reduction rate = 15,780 / 200,000 = **7.89%** of net income over $200,000.
Credit value at full BPA = 15,780 × 10.80% = **$1,704.24**.

TD1MB instruction: net income < $200,000 → claim $15,780; ≥ $400,000 → claim $0;
otherwise use Worksheet TD1MB-WS.

### Other
- **No provincial surtax.**
- **No health premium** paid by employees.
- Manitoba levies a **Health and Post Secondary Education Tax Levy ("payroll tax")** on
  employers with Manitoba payroll above an exemption — employer cost only, does not affect
  employee net pay. 2026 figures not verified this session.
- Non-net-pay credits for 2026: Renters Affordability Tax Credit up to **$625**; seniors
  top-up up to **$357**. These are refundable credits claimed on the return, not withheld.

---

## 4. NEW BRUNSWICK — 2026

Source: taxtips.ca (brackets), CRA (BPA $13,664 — matches). gnb.ca blocked this session.

### Brackets (annual taxable income)
| Rate | 2026 threshold |
|---|---|
| 9.40%  | $0 – $52,333 |
| 14.00% | $52,333.01 – $104,666 |
| 16.00% | $104,666.01 – $193,861 |
| 19.50% | over $193,861 |

Indexed +2.0% from 2025 (2025 first threshold $51,306 × 1.02 = $52,332 ✓).
Note the second threshold is exactly 2× the first.

### Basic personal amount
**$13,664** — confirmed directly by CRA.
Credit value = 13,664 × 9.40% = **$1,284.42**.

### NB Low-Income Tax Reduction
Exists (introduced 2001), reduces NB tax payable to as low as zero, based on family net
income. **2026 parameters not obtained in this session** — see caveats. Implementers must
pull these from CRA Form NB428 / T4127 Table before shipping.

### Other
- **No provincial surtax.**
- **No health premium.**
- BPA does not phase out.

---

## 5. NEWFOUNDLAND & LABRADOR — 2026

Source: gov.nl.ca Dept. of Finance personal income tax page (provincial authority) + CRA.
NL has the most brackets of any province (8).

### Brackets (annual taxable income)
| Rate | 2026 threshold |
|---|---|
| 8.70%  | $0 – $44,678 |
| 14.50% | $44,678.01 – $89,354 |
| 15.80% | $89,354.01 – $159,528 |
| 17.80% | $159,528.01 – $223,340 |
| 19.80% | $223,340.01 – $285,319 |
| 20.80% | $285,319.01 – $570,638 |
| 21.30% | $570,638.01 – $1,141,275 |
| 21.80% | over $1,141,275 |

Indexed +1.1% (NL CPI). Verified against 2025 values:
44,192×1.011=44,678 ✓ · 88,382×1.011=89,354 ✓ · 157,792×1.011=159,528 ✓ ·
220,910×1.011=223,340 ✓. (The NL page renders "$44,192" in one spot for the first
bracket — that is the stale 2025 figure; the 2026 value consistent with the second
bracket's start and the 1.1% factor is **$44,678**. Flagged in caveats.)

### Basic personal amount
- **Annual / tax return 2026: $13,094**
- Payroll withholding Jul–Dec 2026 only: **$15,000** (see §0.2)
- Pre-budget indexed figure, now superseded: $11,188

Credit value = 13,094 × 8.70% = **$1,139.18**.

### NL Low Income Tax Reduction (LITR)
Eliminates NL provincial tax entirely below the thresholds; indexed annually by NL CPI.
**2026 thresholds not yet published** on gov.nl.ca. Latest published:
| Year | Individual net income | Family net income |
|---|---|---|
| 2024 | $23,390 | $39,551 |
| **2025** | **$23,928** | **$40,460** |

Do **not** extrapolate. Pull 2026 values from CRA Form NL428 / T4127 before shipping.
(For reference only, 1.1% indexation would imply ≈$24,191 / ≈$40,905 — unconfirmed.)

### Other
- **No provincial surtax.** (NL's temporary deficit reduction levy was repealed years ago.)
- **No health premium.**

---

## 6. FEDERAL PAYROLL CONTRIBUTIONS — 2026 (apply in all provinces)

### CPP (all provinces except Quebec)
| Parameter | 2026 |
|---|---|
| YMPE (first ceiling) | **$74,600** |
| Basic exemption | **$3,500** |
| Employee rate (base 4.95% + enhancement 1.00%) | **5.95%** |
| Employer rate | 5.95% (matched) |
| Max employee contribution | **$4,230.45** = (74,600 − 3,500) × 5.95% |
| YAMPE (second ceiling) | **$85,000** |
| CPP2 employee rate | **4.00%** on earnings 74,600 → 85,000 |
| Max CPP2 employee contribution | **$416.00** = 10,400 × 4% ✓ (CRA-published) |
| **Total max employee CPP + CPP2** | **$4,646.45** |

Total combined (employee+employer) rate on the first ceiling is 11.9% (9.9% base + 2.0% enhancement).

### EI (outside Quebec)
| Parameter | 2026 |
|---|---|
| Maximum insurable earnings (MIE) | **$68,900** (2025: $65,700) |
| Employee rate | **1.63%** ($1.63 per $100) |
| Max employee premium | **$1,123.07** ✓ (CRA-published; = 68,900 × 1.63%) |
| Employer rate | **2.28%** (1.4 × employee) |
| Max employer premium | **$1,572.30** ✓ |

### EI (Quebec residents — reduced, because QPIP covers parental benefits)
| Parameter | 2026 |
|---|---|
| MIE | **$68,900** |
| Employee rate | **1.30%** |
| Max employee premium | **$895.70** ✓ |
| Employer rate | **1.82%** |
| Max employer premium | **$1,253.98** ✓ |

### Employer pension
There is **no mandatory employer superannuation-style contribution** in Canada beyond the
matched CPP/QPP and 1.4× EI shown above. Workplace RPP/RRSP matching is voluntary.

---

## 7. QUEBEC — 2026 (out of this shard's five, included per brief)

Quebec files a **separate provincial return (TP-1)** with Revenu Québec, uses **QPP**
instead of CPP, adds **QPIP**, and gets the **federal abatement**.

### Brackets (annual taxable income) — 4 brackets
| Rate | 2026 threshold |
|---|---|
| 14.00% | $0 – $54,345 |
| 19.00% | $54,345.01 – $108,680 |
| 24.00% | $108,680.01 – $132,245 |
| 25.75% | over $132,245 |

### Basic personal amount
**$18,952** (credit at 14% = **$2,653.28**). Highest-value BPA credit structure in Canada
after Alberta's dollar amount.

### Quebec abatement of federal tax
**16.5% of basic federal tax** is abated for Quebec residents, because Quebec administers
programs the federal government runs elsewhere.
```
federal_tax_payable_QC = basic_federal_tax * (1 - 0.165)
```
Apply **after** federal non-refundable credits, **before** adding Quebec provincial tax.

### QPP — 2026
| Parameter | 2026 |
|---|---|
| MPE (first ceiling) | **$74,600** (same as CPP YMPE) |
| Basic exemption | **$3,500** |
| Employee base plan rate | **5.30%** |
| Employee additional plan rate | **1.00%** |
| **Employee total rate** | **6.30%** |
| Max employee contribution | **$4,479.30** = (74,600 − 3,500) × 6.30% |
| Additional ceiling (QPP2) | **$85,000** (114% of MPE) |
| QPP2 employee rate | **4.00%** on 74,600 → 85,000 |
| Max QPP2 employee contribution | **$416.00** |
| **Total max employee QPP** | **$4,895.30** |
| Employer | matches employee |

> The QPP employee rate of **6.30%** (base 5.30% + additional 1.00%; 10.6% + 2% combined)
> is what Retraite Québec and Revenu Québec state for 2026. This is **lower** than the
> 6.40% (5.40% + 1.00%) that applied in prior years — a genuine 2026 change. Medium
> confidence: see caveats.

### QPIP (Quebec Parental Insurance Plan) — 2026, rates DECREASED
| Parameter | 2025 | **2026** |
|---|---|---|
| Maximum insurable earnings | $98,000 | **$103,000** |
| Employee premium rate | 0.494% | **0.430%** |
| Employer premium rate | 0.692% | **0.602%** |
| Max employee premium | — | **$442.90** = 103,000 × 0.430% |
| Max employer premium | — | **$620.06** = 103,000 × 0.602% |

### Quebec EI
Reduced rate **1.30%** employee / 1.82% employer on MIE $68,900 — see §6.

### Quebec employee net-pay stack
```
QPP (6.30% over $3,500, cap $74,600) + QPP2 (4% on 74,600–85,000)
+ QPIP (0.430%, cap $103,000)
+ EI (1.30%, cap $68,900)
+ Quebec provincial tax (TP-1)
+ Federal tax × (1 − 0.165)
```

---

## 8. IMPLEMENTATION NOTES

- **Provincial tax is computed on the same federally-defined taxable income** as federal
  tax, in every province except Quebec. So one taxable-income figure feeds both.
- Order of operations per province: gross → taxable income → apply bracket table →
  subtract non-refundable credits (BPA × lowest provincial rate, CPP/EI credits, Canada
  employment amount is federal only) → apply provincial reduction (BC/NB/NL) → floor at 0.
- **Surtaxes: none in any of the five provinces in this shard.** Only Ontario (20% over
  $5,710 + 36% over $7,307, 2025 figures) and PEI have provincial surtaxes; PEI's was
  eliminated effective 2025. Neither is in scope here.
- **Health premiums affecting employee net pay: none in these five.** Only Ontario has an
  employee-paid Ontario Health Premium. BC's MSP (employee) is gone since 2020; BC EHT and
  Manitoba's HE Levy are employer-side payroll taxes.
- **Non-residents**: subject to provincial/territorial tax only on Canadian-source
  employment income earned in that province; otherwise a federal surtax applies in lieu.
  Out of scope for an ordinary-employee calculator.

---

## 9. CAVEATS / UNVERIFIED

1. **NB Low-Income Tax Reduction 2026 parameters not obtained.** gnb.ca returned HTTP 403
   and CRA pages were blocked. Must be sourced from CRA Form NB428 or T4127 Table 8.x
   before shipping. This materially affects NB employees under roughly $22–40k.
2. **NL Low Income Tax Reduction 2026 thresholds not published** on gov.nl.ca as of
   20 Jul 2026. Latest published are 2025: $23,928 individual / $40,460 family. Do not
   extrapolate; pull from Form NL428.
3. **NL first bracket ceiling $44,678 is derived, not directly quoted.** The gov.nl.ca page
   showed a stale "$44,192" (the 2025 value) for the first bracket while showing $89,354
   for the second. $44,678 = 44,192 × 1.011 and is consistent with every other 2026 NL
   threshold. Worth one confirmation against Form NL428.
4. **Quebec QPP employee rate 6.30%** (base 5.30%) — stated by two Revenu Québec /
   Retraite Québec pages via search snippets, but I could not fetch the primary page
   directly (403). It differs from the long-standing 6.40%. Confirm before shipping; if
   wrong, the correct value is 6.40% and max contribution $4,550.40.
5. **BC Tax Reduction phase-out rate 3.56% is derived** from the published max ($575) and
   the published endpoints ($25,570 / $41,722), not quoted verbatim.
6. **BC Employer Health Tax and Manitoba HE Levy 2026 thresholds/rates not verified.**
   Both are employer-side and do not affect employee net pay, so they are non-blocking for
   a take-home calculator.
7. **Federal 2026 brackets and BPA not confirmed in this session** (out of this shard's
   scope). Confirmed only: lowest federal rate is **14%** for 2026 and subsequent years,
   and the federal indexing factor is **2.0%**. Get the rest from the federal shard.
8. **No CRA-published worked examples were obtainable.** canada.ca returned HTTP 403 to
   WebFetch on every path tried (HTML and PDF), and the sandbox had no outbound network
   for curl. The verification points in §10 are exact arithmetic identities against
   CRA-published maximums, which is the strongest available substitute. T4127 Chapter 6
   contains full worked payroll examples — retrieve when canada.ca is reachable.
9. Provincial *government* sites (alberta.ca, gov.bc.ca, gov.nl.ca, manitoba.ca) were
   reachable and are co-authoritative for provincial rates; those numbers are high
   confidence. NB brackets rest on a secondary source (taxtips.ca) whose BPA figure
   independently matched CRA's $13,664, which raises confidence but is not primary.

---

## 10. VERIFICATION POINTS (exact, from authority-published figures)

| # | Input | Expected | Source |
|---|---|---|---|
| 1 | CPP2 max employee contribution 2026 | **$416.00** = (85,000 − 74,600) × 4% | CRA, published |
| 2 | EI max employee premium 2026, outside QC | **$1,123.07** = 68,900 × 1.63% | CRA/ESDC, published |
| 3 | EI max employer premium 2026, outside QC | **$1,572.30** = 1,123.07 × 1.4 | CRA/ESDC, published |
| 4 | EI max employee premium 2026, Quebec | **$895.70** = 68,900 × 1.30% | CRA/ESDC, published |
| 5 | EI max employer premium 2026, Quebec | **$1,253.98** | CRA/ESDC, published |
| 6 | CPP max employee contribution 2026 | **$4,230.45** = (74,600 − 3,500) × 5.95% | derived from CRA ceilings |
| 7 | BC lowest-rate proration check | (5.06 + 6.14) / 2 = **5.60** | CRA proration rule |
| 8 | NL BPA proration check | (11,188 + 15,000) / 2 = **13,094** | CRA proration rule |
| 9 | AB BPA indexation | 22,323 × 1.02 = **22,769** | AB 2% factor |
| 10 | BC BPA indexation | 12,932 × 1.022 = **13,216** | BC 2.2% factor |
| 11 | BC first threshold indexation | 49,279 × 1.022 = **50,363** | BC 2.2% factor |
| 12 | NB first threshold indexation | 51,306 × 1.02 = **52,332 ≈ 52,333** | NB 2.0% factor |
| 13 | NL second threshold indexation | 88,382 × 1.011 = **89,354** | NL 1.1% factor |
| 14 | MB BPA phase-out at NI $300,000 | **$7,890** = 15,780 × (1 − 100,000/200,000) | MB phase-out rule |
| 15 | BC Tax Reduction at NI $30,000 | **$417.47** = 575 − 0.0356 × 4,430 | derived from BC endpoints |
| 16 | QPIP max employee premium 2026 | **$442.90** = 103,000 × 0.430% | Revenu Québec |

---

## 11. SOURCES

Primary (fetched successfully this session):
- gov.bc.ca — Personal income tax rates: https://www2.gov.bc.ca/gov/content/taxes/income-taxes/personal/tax-rates
- alberta.ca — Personal income tax: https://www.alberta.ca/personal-income-tax
- gov.nl.ca — Personal Income Tax: https://www.gov.nl.ca/fin/tax-programs-incentives/personal/personalincometax/
- gov.nl.ca — Low Income Tax Reduction: https://www.gov.nl.ca/fin/tax-programs-incentives/personal/lowincometaxreduction/
- gov.nl.ca — Budget 2026, A Plan for Lower Taxes: https://www.gov.nl.ca/budget/2026/what-you-need-to-know/a-plan-for-lower-taxes/

Primary (via search snippets only; direct fetch returned HTTP 403):
- CRA T4127 Payroll Deductions Formulas, 123rd ed., effective 1 July 2026: https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jul/t4127-jul-payroll-deductions-formulas.html
- CRA T4127, 122nd ed., effective 1 January 2026: https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html
- CRA — Current year tax rates and income brackets (2026): https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html
- CRA — Income tax rates and income thresholds (payroll): https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/income-tax/reducing-remuneration-subject-income-tax.html
- CRA — CPP contribution rates, maximums and exemptions: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html
- CRA — Second additional CPP (CPP2) rates and maximums: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/calculating-deductions/making-deductions/second-additional-cpp-contribution-rates-maximums.html
- ESDC — Canada EI Commission sets the 2026 EI premium rate: https://www.canada.ca/en/employment-social-development/news/2025/09/canada-employment-insurance-commission-sets-the-2026-employment-insurance-premium-rate.html
- ESDC — EI maximum insurable earnings for 2026: https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/ei-employers/premium-reduction-program/2026-maximum-insurable-earnings.html
- manitoba.ca Finance — Personal Income Taxes: https://www.gov.mb.ca/finance/personal/ptaxes.html
- Revenu Québec — MPE and QPP contribution rate: https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/calculating-source-deductions-and-contributions/qpp-contributions/maximum-pensionable-earnings-and-contribution-rate/
- Revenu Québec — QPIP maximum insurable earnings and premium rate: https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/calculating-source-deductions-and-contributions/qpip-premiums/maximum-insurable-earnings-and-premium-rate/
- Revenu Québec — Employers: Principal Changes for 2026: https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/employers-kit/principal-changes-for-2026-employers-kit/
- Retraite Québec — Work and contributions: https://www.retraitequebec.gouv.qc.ca/en/programs/quebec-pension-plan/work-contributions

Secondary (corroboration; sole basis only for NB brackets and QC brackets):
- taxtips.ca — NB: https://www.taxtips.ca/taxrates/nb.htm
- taxtips.ca — MB: https://www.taxtips.ca/taxrates/mb.htm
- taxtips.ca — BC: https://www.taxtips.ca/taxrates/bc.htm
- taxtips.ca — QC: https://www.taxtips.ca/taxrates/qc.htm
