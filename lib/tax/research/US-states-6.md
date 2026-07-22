# US-states-6 — 2026 State Income Tax Spec
### South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia, Wisconsin, Wyoming

**Research date: 20 July 2026. Tax year in effect: calendar year 2026 (1 Jan 2026 – 31 Dec 2026).**
All ten states are calendar-year. Returns for TY2026 are filed in early 2027; TY2025 returns were due 15 April 2026.

**All figures below are STATE tax only.** Federal income tax, FICA (Social Security 6.2% / Medicare 1.45% + 0.9% additional) apply on top in every state and are out of scope.

---

## Summary table

| State | 2026 personal income tax | Top rate | Local income tax |
|---|---|---|---|
| South Dakota | **NONE** | — | None |
| Tennessee | **NONE** | — | None |
| Texas | **NONE** | — | None |
| Utah | Flat | **4.45%** (cut from 4.5%) | None |
| Vermont | Progressive, 4 brackets | 8.75% | None |
| Virginia | Progressive, 4 brackets | 5.75% | None |
| Washington | **NONE** (on wages) | — | None, but 2 mandatory employee payroll premiums |
| West Virginia | Progressive, 5 brackets | **4.58%** (cut 5% for 2026) | None (flat municipal service fees only) |
| Wisconsin | Progressive, 4 brackets | 7.65% | None |
| Wyoming | **NONE** | — | None |

**Rates that CHANGED for 2026 — a stale implementation gets these wrong:**
1. **Utah 4.5% → 4.45%** (S.B. 60, signed 23 Mar 2026, retroactive to 1 Jan 2026).
2. **West Virginia — every bracket cut ~5%** (top 4.82% → 4.58%), effective 12 Jun 2026, retroactive to 1 Jan 2026.
3. **Wisconsin** — brackets and standard deduction inflation-indexed for 2026 (new numbers below).
4. **Vermont** — brackets inflation-indexed for 2026.
5. **Virginia — NO change for 2026.** The widely-reported $9,200/$18,400 standard deduction takes effect **TY2027, not TY2026**. See the Virginia trap below.

---

# 1. South Dakota — NO INCOME TAX

South Dakota levies **no individual income tax**. No brackets, no withholding, no state return.

> South Dakota Department of Revenue: "South Dakota is one of seven states that does not impose a state income tax."

Employee take-home = gross − federal tax − FICA. No state payroll deductions on employees. (State revenue comes from sales tax, 4.2% state rate, plus property tax.)

---

# 2. Tennessee — NO INCOME TAX

Tennessee levies **no individual income tax on wages, salaries, or any other income**.

The **Hall Income Tax** (formerly 6% on interest and dividends only — never on wages) was phased out 1% per year and **fully repealed effective tax years beginning 1 Jan 2021**. The TN Department of Revenue now lists Hall Income Tax under **"Archived Taxes"**, alongside gift tax and inheritance tax.

No state return, no state withholding, no local income tax. Employees have zero state deduction from pay.

---

# 3. Texas — NO INCOME TAX

Texas levies **no individual income tax**. Prohibited without a statewide referendum — Texas Constitution Art. VIII §24-a (added by Proposition 4, approved Nov 2019) bars the legislature from imposing a net income tax on individuals.

No state return, no state withholding, no local income tax. The Texas franchise tax is a business margin tax and does not touch employee wages.

---

# 4. Utah — FLAT 4.45%

## Rate
**4.45% (.0445) of Utah taxable income**, all income levels, all filing statuses.

Confirmed from the **enrolled text of S.B. 60 (2026 General Session)**, which amends Utah Code §59-10-104:
```
(2) For purposes of Subsection (1), for a taxable year, the tax is an amount equal to the
    product of:
    (a) the resident individual's state taxable income for that taxable year; and
    (b) 4.45%.
    [(b) 4.5%.]          <- bracketed = repealed text
...
This bill has retrospective operation for a taxable year beginning on or after January 1, 2026.
```
Signed by the Governor **23 March 2026**. Corporate rate cut identically 4.5% → 4.45%.

**WARNING:** As of 20 July 2026 the Tax Commission's own rate page (incometax.utah.gov/paying/tax-rates) is still the TY2025 site and shows "January 1, 2025 – current: 4.5%". **That page is stale.** The statute controls. Rate history: 2018–2021 4.95%, 2022 4.85%, 2023 4.65%, 2024 4.55%, 2025 4.50%, **2026 4.45%**.

## Utah taxable income
Utah starts from **federal adjusted gross income**, then applies state additions/subtractions. Utah has **no state standard deduction and no personal exemption** — instead it uses the **Taxpayer Tax Credit**, a non-refundable credit that phases out with income.

## Taxpayer Tax Credit — algorithm (TC-40 lines 15–20)
```
L15 = federal standard-or-itemized deduction + Utah personal exemptions
L16 initial_credit   = L15 × 0.06
L17 base_phaseout    = per filing status (see table)
L18 income_subject   = max(0, state_income - base_phaseout)
L19 phaseout_amount  = L18 × 0.013
L20 credit           = max(0, L16 - L19)
L22 utah_tax         = max(0, (taxable_income × 0.0445) - L20)
```

Base phase-out amounts — **these are the TY2025 published values; TY2026 indexed values not yet published as of 20 Jul 2026**:

| Filing status | Base phase-out amount (TY2025) |
|---|---|
| Single | $18,213 |
| Married filing jointly | $36,426 |
| Married filing separately | $18,213 |
| Head of household | $27,320 |
| Qualifying surviving spouse | $36,426 |

**Qualified exempt taxpayers:** if federal AGI ≤ federal standard deduction, the taxpayer is exempt from Utah income tax — enter $0.

## Local
**No local or municipal income tax anywhere in Utah.**

---

# 5. Vermont — PROGRESSIVE, 3.35% / 6.60% / 7.60% / 8.75%

## 2026 rate schedules

**Schedule X — Single**

| VT taxable income over | But not over | Base tax | + rate | of amount over |
|---|---|---|---|---|
| $0 | $50,750 | $0.00 | 3.35% | $0 |
| $50,750 | $122,850 | $1,700.13 | 6.60% | $50,750 |
| $122,850 | $256,300 | $6,458.73 | 7.60% | $122,850 |
| $256,300 | — | $16,600.93 | 8.75% | $256,300 |

**Schedule Y-1 — Married Filing Jointly / Qualifying Surviving Spouse / Civil Union Filing Jointly**

| VT taxable income over | But not over | Base tax | + rate | of amount over |
|---|---|---|---|---|
| $0 | $84,700 | $0.00 | 3.35% | $0 |
| $84,700 | $204,750 | $2,837.45 | 6.60% | $84,700 |
| $204,750 | $312,050 | $10,760.75 | 7.60% | $204,750 |
| $312,050 | — | $18,915.55 | 8.75% | $312,050 |

**Derivation note (important, read before trusting):** Vermont's website currently serves the **wrong PDF** at the "2026 VT Rate Schedules" link (`RateSched-2026.pdf` returns the 2026 wage-bracket withholding charts, not the rate schedules). The bracket figures above are derived from the **official 2026 GB-1210 ANNUAL PAYROLLS percentage-method table** by subtracting the zero-band threshold, a method **validated exactly against TY2025** where both documents exist:

| 2025 check | Withholding annual band top | − zero band | = derived | Official 2025 schedule |
|---|---|---|---|---|
| Single b1 | 53,225 | 3,825 | 49,400 | **49,400** ✓ |
| Single b2 | 123,525 | 3,825 | 119,700 | **119,700** ✓ |
| Single b3 | 253,525 | 3,825 | 249,700 | **249,700** ✓ |
| MFJ b1 | 93,975 | 11,475 | 82,500 | **82,500** ✓ |
| MFJ b2 | 210,925 | 11,475 | 199,450 | **199,450** ✓ |
| MFJ b3 | 315,475 | 11,475 | 304,000 | **304,000** ✓ |

Base-tax amounts also reconcile to the cent (2025 official $1,655.00 vs withholding $1,654.90; $6,295.00 vs $6,294.70; $16,175.00 vs $16,174.70 — the official schedule rounds to whole dollars). The 2026 base amounts above are likewise internally consistent: 50,750 × 3.35% = 1,700.125 ✓; 1,700.13 + 72,100 × 6.6% = 6,458.73 ✓; 6,458.73 + 133,450 × 7.6% = 16,600.93 ✓.

**2026 zero-band offsets used:** Single $3,925, Married $11,775. One 2026 withholding allowance = **$5,400** (2025: $5,300).

## Standard deduction and personal exemption

| Item | 2025 (official) | 2026 (derived — see note) |
|---|---|---|
| Standard deduction — Single / MFS | $7,650 | **$7,850** |
| Standard deduction — MFJ / QSS | $15,300 | **$15,700** |
| Standard deduction — Head of Household | $11,450 | *not confirmed (~$11,750)* |
| Additional, age 65+ and/or blind (each) | $1,250 | *not confirmed (~$1,300)* |
| Personal exemption (per person) | $5,300 | **$5,400** |

2026 personal exemption = the 2026 withholding allowance, $5,400 (stated in GB-1210-2026). 2026 standard deduction derived from the withholding zero-band, which equals exactly half the single standard deduction (2025: 3,825 × 2 = 7,650 ✓; MFJ 15,300 − 3,825 = 11,475 ✓). Applying to 2026: 3,925 × 2 = **$7,850** single; 11,775 + 3,925 = **$15,700** MFJ. HoH and age/blind additions are **not derivable** from the withholding tables — treat as unconfirmed.

**VT taxable income = federal taxable income** (i.e. federal AGI less federal deductions), with Vermont additions/subtractions, then less the *excess* of VT standard deduction + personal exemptions over the federal amounts. In practice VT starts from federal taxable income on Form IN-111.

## Minimum tax on high AGI
For **adjusted gross income exceeding $150,000**, Vermont tax is the **greater of**:
1. 3% of AGI less interest from U.S. obligations, or
2. the rate-schedule calculation.

(Stated verbatim on the official rate-schedule sheet. Assumed to carry into 2026 — statutory, not indexed.)

## Tax tables
For **VT taxable income under $75,000**, Vermont directs filers to the **tax tables** (income bracketed in $50 steps) rather than the rate schedule. A calculator using the rate schedule will be within ~$1–2 of the table result. For exact-to-the-cent parity with a filed return under $75,000, the tax tables must be used.

## Local
**No local income tax in Vermont.**

---

# 6. Virginia — PROGRESSIVE, 2% / 3% / 5% / 5.75%

## 2026 tax rate schedule
**Identical for ALL filing statuses** — single, married filing jointly, married filing separately, head of household. Virginia does not widen brackets for joint filers.

| VA taxable income over | But not over | Tax is | + rate | of excess over |
|---|---|---|---|---|
| $0 | $3,000 | — | 2% | $0 |
| $3,000 | $5,000 | $60 | 3% | $3,000 |
| $5,000 | $17,000 | $120 | 5% | $5,000 |
| $17,000 | — | $720 | 5.75% | $17,000 |

Source: official **Form 760ES (2026)**, Section III Tax Rate Schedule. These thresholds are **not indexed** and have been unchanged for decades.

## Standard deduction — 2026

| Filing status | TY2026 |
|---|---|
| Single | **$8,750** |
| Married filing jointly | **$17,500** |
| Married filing separately | **$8,750** |

## ⚠ THE VIRGINIA TRAP
Many secondary sources (and an initial reading of the 2026 Legislative Summary) report **$9,200 / $18,400 for 2026. This is WRONG for TY2026.** The official 2026 Legislative Summary states verbatim:

> "increases the standard deduction from $8,750 to $9,200 for single filers and from $17,500 to $18,400 for married filers filing jointly, **effective for taxable years beginning on and after January 1, 2027, but before January 1, 2028**."

Full statutory schedule (§58.1-322.03):
- **TY2026: $8,750 / $17,500**
- TY2027: $9,200 / $18,400
- TY2028–TY2029: $9,300 / $18,600
- TY2030 onward (sunset): reverts to **$3,000 / $6,000**

## Personal exemptions
- **$930 per personal exemption** (taxpayer, spouse, each dependent)
- **$800 additional** for each "65 or older" and each "blind" exemption

Source: Form 760ES (2026) worksheet line 4: *"Personal exemptions X $930. Exemptions for '65 or older' & 'Blind' X $800."*

## Credit for Low-Income Individuals (CLI)
Non-refundable. Extended by 2026 legislation. Either $300 per personal exemption (for filers with family Virginia AGI below federal poverty guidelines), **or** 20% of the federal EITC — taxpayer takes the greater. Materially affects low-wage employees.

## Local
**No local income tax in Virginia.** Virginia cities and counties raise revenue from property, sales and BPOL business licence taxes — none of which touch employee wages.

## Non-resident note
Virginia residents who pay income tax to another state as a non-resident may claim a credit — **except** for Arizona, California, Oregon and the District of Columbia, which are handled under reverse-credit rules.

---

# 7. Washington — NO INCOME TAX (but two mandatory employee payroll premiums)

## Income tax
**Washington levies no individual income tax.**

> Washington Department of Revenue: "No income tax in Washington state. Washington state does not have an individual or corporate income tax."

A **7% capital gains excise tax** applies to long-term gains above an annual standard deduction (~$270k, indexed). It does **not** apply to wages, salaries or ordinary employee income and is out of scope for a take-home calculator.

## Mandatory EMPLOYEE payroll deductions — these DO reduce take-home
Washington has no income tax but two statewide programs deduct from employee pay. **Do not model Washington as a zero-deduction state.**

1. **WA Cares Fund** (long-term care) — employee-paid premium on **all wages, no wage cap**. The statutory rate since inception is **0.58%**. Employer pays nothing.
2. **Paid Family & Medical Leave (PFML)** — total premium split employer/employee, employee share capped at a share of the total; premium applies up to the **Social Security wage base**.

**⚠ CAVEAT:** I could **not** retrieve the 2026 PFML premium rate or the 2026 WA Cares rate from the authorities' own sites (paidleave.wa.gov and wacaresfund.wa.gov are JavaScript-rendered and the 2026 rate pages returned 404 / empty to both WebFetch and curl; the WebSearch budget was exhausted before I could corroborate). **The 0.58% WA Cares figure and the PFML split must be re-verified against ESD's 2026 rate notice before shipping.** Treat these two numbers as LOW confidence; every income-tax figure elsewhere in this document is independent of them.

## Local
**No local income tax.** (Seattle's 2017 attempt at a high-earner income tax was struck down and never took effect.)

---

# 8. West Virginia — PROGRESSIVE, RATES CUT 5% FOR 2026

## The 2026 change
West Virginia enacted a **5% across-the-board income tax cut**, **effective 12 June 2026, retroactive to 1 January 2026**. Every bracket rate was multiplied by 0.95.

| Bracket | 2025 rate | ×0.95 | **2026 rate** |
|---|---|---|---|
| 1 | 2.22% | 2.109 | **2.11%** |
| 2 | 2.96% | 2.812 | **2.81%** |
| 3 | 3.33% | 3.1635 | **3.16%** |
| 4 | 4.44% | 4.218 | **4.22%** |
| 5 | 4.82% | 4.579 | **4.58%** |

## 2026 rate schedule — Single, Married Filing Jointly, Head of Household, Estates & Trusts
West Virginia uses **one schedule for single AND joint filers** — brackets are NOT widened for MFJ. (Only married-filing-*separately* gets a different, halved schedule.)

| Taxable income | Tax |
|---|---|
| Not over $10,000 | 2.11% of taxable income |
| $10,001 – $25,000 | $211.00 + 2.81% of excess over $10,000 |
| $25,001 – $40,000 | $632.50 + 3.16% of excess over $25,000 |
| $40,001 – $60,000 | $1,106.50 + 4.22% of excess over $40,000 |
| Over $60,000 | $1,950.50 + 4.58% of excess over $60,000 |

Bracket arithmetic verifies: 10,000 × 2.11% = 211.00 ✓; 211.00 + 15,000 × 2.81% = 632.50 ✓; 632.50 + 15,000 × 3.16% = 1,106.50 ✓; 1,106.50 + 20,000 × 4.22% = 1,950.50 ✓.

## 2026 rate schedule — Married Filing Separately
All thresholds and base amounts exactly halved.

| Taxable income | Tax |
|---|---|
| Not over $5,000 | 2.11% of taxable income |
| $5,001 – $12,500 | $105.50 + 2.81% of excess over $5,000 |
| $12,501 – $20,000 | $316.25 + 3.16% of excess over $12,500 |
| $20,001 – $30,000 | $553.25 + 4.22% of excess over $20,000 |
| Over $30,000 | $975.25 + 4.58% of excess over $30,000 |

## Standard deduction and exemptions
- **No state standard deduction.** WV taxable income starts from **federal adjusted gross income** with WV additions/subtractions — the federal standard deduction is *not* carried through as a separate WV deduction.
- **Personal exemption: $2,000 per exemption** (taxpayer, spouse, each dependent). If zero exemptions are claimed, the exemption allowance is **$500**.
- **Low-income earned income exclusion / Family Tax Credit** eliminates or reduces liability for low-income households.
- Social Security benefits are fully exempt from WV income tax as of 2026 (final year of a three-year phase-out).

## Local
**No municipal income tax.** Several WV cities (Charleston, Huntington, Parkersburg, Weirton and others) impose a **city service fee** — a flat dollar amount per week worked in the city (typically **$2–$6/week**), withheld by the employer. It is a **flat head fee, not a percentage of income**, so it does not scale with salary. Model as a fixed weekly deduction if city-level precision is required; otherwise ignore.

---

# 9. Wisconsin — PROGRESSIVE, 3.50% / 4.40% / 5.30% / 7.65%

All figures below are from the **official 2026 Form 1-ES instructions (D-101A, R. 1-26)**, Wisconsin DOR — the definitive published 2026 source.

## 2026 Tax Rate Schedules for Full-Year Residents

**Schedule A — Single, Head of Household, Estates and Trusts**

| Taxable income over | But not over | Gross tax | + rate | of amount over |
|---|---|---|---|---|
| $0 | $15,110 | — | 3.5% | $0 |
| $15,110 | $51,950 | $528.85 | 4.4% | $15,110 |
| $51,950 | $332,720 | $2,149.81 | 5.3% | $51,950 |
| $332,720 | — | $17,030.62 | 7.65% | $332,720 |

**Schedule B — Married Filing Jointly**

| Taxable income over | But not over | Gross tax | + rate | of amount over |
|---|---|---|---|---|
| $0 | $20,150 | — | 3.5% | $0 |
| $20,150 | $69,260 | $705.25 | 4.4% | $20,150 |
| $69,260 | $443,630 | $2,866.09 | 5.3% | $69,260 |
| $443,630 | — | $22,707.70 | 7.65% | $443,630 |

**Schedule C — Married Filing Separately**

| Taxable income over | But not over | Gross tax | + rate | of amount over |
|---|---|---|---|---|
| $0 | $10,080 | — | 3.5% | $0 |
| $10,080 | $34,630 | $352.80 | 4.4% | $10,080 |
| $34,630 | $221,820 | $1,433.00 | 5.3% | $34,630 |
| $221,820 | — | $11,354.07 | 7.65% | $221,820 |

Verification: 15,110 × 3.5% = 528.85 ✓; 528.85 + 36,840 × 4.4% = 2,149.81 ✓; 2,149.81 + 280,770 × 5.3% = 17,030.62 ✓. MFJ: 20,150 × 3.5% = 705.25 ✓; 705.25 + 49,110 × 4.4% = 2,866.09 ✓; 2,866.09 + 374,370 × 5.3% = 22,707.70 ✓.

## 2026 Standard Deduction — SLIDING SCALE (phases out with income)
Wisconsin's standard deduction is **not a flat amount** — it phases down as Wisconsin income rises and reaches **zero** at high income. This is the single most commonly mis-implemented part of Wisconsin tax.

**Single**

| WI income over | But not over | Standard deduction |
|---|---|---|
| $0 | $20,119 | $13,960 |
| $20,119 | $136,453 | $13,960 − 12% of amount over $20,120 |
| $136,453 | — | $0 |

**Married Filing Jointly**

| WI income over | But not over | Standard deduction |
|---|---|---|
| $0 | $29,039 | $25,840 |
| $29,039 | $159,690 | $25,840 − 19.778% of amount over $29,040 |
| $159,690 | — | $0 |

**Head of Household** (note the two-stage taper — HoH uses the *single* formula in its upper range)

| WI income over | But not over | Standard deduction |
|---|---|---|
| $0 | $20,119 | $18,030 |
| $20,119 | $58,827 | $18,030 − 22.515% of amount over $20,120 |
| $58,827 | $136,453 | $13,960 − 12% of amount over $20,120 |
| $136,453 | — | $0 |

**Married Filing Separately**

| WI income over | But not over | Standard deduction |
|---|---|---|
| $0 | $13,779 | $12,280 |
| $13,779 | $75,869 | $12,280 − 19.778% of amount over $13,780 |
| $75,869 | — | $0 |

## Exemptions (2026)
- **$700** for yourself
- **$700** for your spouse if filing jointly
- **$700** for each dependent
- **+$250** if you are 65 or older; **+$250** more if filing jointly and your spouse is 65 or older
- **Exception:** if you are claimed as a dependent on someone else's return, you do not qualify for an exemption.

Computation order (Form 1-ES worksheet): `taxable income = WI income − (standard deduction + exemptions)`, then apply the rate schedule, then subtract credits.

## Non-resident / part-year proration (official worked example)
Non-residents and part-year residents **prorate the tax brackets** by the ratio of Wisconsin income to federal AGI. The DOR's own example:

> Single individual, ratio 20%. The first **$3,022** (15,110 × .20) is taxed at 3.5%; the next **$7,368** (36,840 × .20) at 4.4%; the next **$56,154** (280,770 × .20) at 5.3%. Taxable income over **$66,544** (332,720 × .20) is taxed at 7.65%.

The standard deduction is likewise prorated: compute it using **federal AGI** instead of Wisconsin income, then multiply by the WI-income/federal-AGI ratio. Exemptions use the same ratio.

## Estimated-tax safe harbour
No estimated payments required if tax due after withholding is under **$500**. Otherwise prepay 90% of 2026 liability or 100% of 2025 liability, whichever is smaller.

## Local
**No local or municipal income tax in Wisconsin.**

---

# 10. Wyoming — NO INCOME TAX

Wyoming levies **no individual income tax**. No brackets, no withholding, no state return, no local income tax. Wyoming is one of the seven states (with AK, FL, NV, SD, TX, WA) that impose no personal income tax at all. Revenue comes from mineral severance taxes, sales tax and property tax.

---

# Worked examples

## Authority-published

**Vermont — official example (TY2025 schedule, from the official rate-schedule sheet):**
> VT taxable income $85,000, filing status Married Filing Jointly, Schedule Y-1. Base tax $2,764. Subtract $82,500 from $85,000 → $2,500. Multiply by 6.6% → $165. Add to base tax: **$2,929**. Enter on Form IN-111 line 8.

This validates the *algorithm* (base + marginal × excess). Re-run against the 2026 Y-1 thresholds for a 2026 answer.

**Wisconsin — official non-resident proration example (TY2026):** see the Wisconsin section above; gives four exact prorated bracket boundaries ($3,022 / $7,368 / $56,154 / $66,544) at a 20% ratio.

## Derived checks (my computation, NOT authority-published — use to smoke-test an implementation)

**Utah, single, $60,000 Utah taxable income, federal std deduction $15,000 (2026 est.), no dependents:**
`tax = 60,000 × 0.0445 = $2,670.00`
`credit: L15 = 15,000; L16 = 900; L18 = max(0, 60,000 − 18,213) = 41,787; L19 = 543.23; L20 = 356.77`
`Utah tax = 2,670.00 − 356.77 = $2,313.23` *(base phase-out amount is the TY2025 figure — see caveat)*

**West Virginia, single, $75,000 taxable income:**
`1,950.50 + (75,000 − 60,000) × 4.58% = 1,950.50 + 687.00 = $2,637.50`

**Wisconsin, single, $60,000 WI income:**
`std ded = 13,960 − 0.12 × (60,000 − 20,120) = 13,960 − 4,785.60 = 9,174.40`
`exemptions = 700`
`taxable = 60,000 − 9,874.40 = 50,125.60`
`tax = 528.85 + (50,125.60 − 15,110) × 4.4% = 528.85 + 1,540.69 = $2,069.54`

**Virginia, single, $60,000 VA AGI:**
`taxable = 60,000 − 8,750 (std ded) − 930 (exemption) = 50,320`
`tax = 720 + (50,320 − 17,000) × 5.75% = 720 + 1,915.90 = $2,635.90`

**Vermont, single, $60,000 VT taxable income (2026 schedule):**
`tax = 1,700.13 + (60,000 − 50,750) × 6.6% = 1,700.13 + 610.50 = $2,310.63`

---

# Caveats

1. **Vermont 2026 brackets are DERIVED, not read off the rate-schedule PDF.** Vermont's site serves the wrong file at the 2026 rate-schedules link. The derivation method reproduces the 2025 official schedule exactly on all six bracket boundaries, and the 2026 base-tax amounts are internally consistent to the cent — but re-check once VT fixes the PDF.
2. **Vermont 2026 standard deduction ($7,850 / $15,700) is derived** from the withholding zero-band. The **HoH standard deduction and the age-65/blind addition for 2026 are NOT confirmed** — 2025 values were $11,450 and $1,250.
3. **Utah's own rate page is stale** (still shows 4.5% as "current"). The 4.45% figure comes from the enrolled statute, which is authoritative. Utah has also **not yet published 2026-indexed taxpayer-tax-credit phase-out amounts** — the $18,213/$36,426/$27,320 figures are TY2025 and will rise slightly.
4. **Utah withholding tables** had not been reissued for the 4.45% rate at the time the change was announced; employers may still be withholding at 4.5% for part of 2026, producing refunds. Affects withholding accuracy, not annual liability.
5. **Virginia $9,200/$18,400 is TY2027, not TY2026.** Highest-risk trap in this batch. TY2026 is $8,750/$17,500.
6. **Washington's WA Cares (0.58%) and PFML premium rates for 2026 are LOW confidence** — I could not reach the authorities' 2026 rate pages, and the search budget was exhausted. Re-verify with WA ESD before relying on them. Washington's *income tax* status (none) is confirmed from DOR directly.
7. **Tennessee, Texas and Wyoming** could not be confirmed by direct fetch of a rate page (their sites blocked or JS-rendered). Confirmation is indirect but strong: TN's DOR lists the Hall Income Tax under "Archived Taxes"; SD DOR states there are seven no-income-tax states; WA DOR confirms its own status. TX's prohibition is constitutional (Art. VIII §24-a).
8. **Vermont's under-$75,000 tax tables** produce results differing by ~$1–2 from the rate schedule. Use the tables for exact filed-return parity below $75,000.
9. **West Virginia and Virginia do NOT widen brackets for joint filers** — a single schedule serves both. Implementations that assume MFJ brackets are always double will be wrong for both states.
10. Non-resident/part-year rules are noted only for Wisconsin (which has an explicit proration formula). Other states' non-resident apportionment is out of scope.
11. Capital gains, self-employment, business, estate and inheritance taxes are out of scope throughout. Washington's 7% capital gains excise tax is noted only to flag that it does not apply to wages.

---

# Sources

- Utah S.B. 60 (2026 General Session), enrolled — https://le.utah.gov/Session/2026/bills/enrolled/SB0060.pdf
- Utah SB 60 bill page — https://le.utah.gov/~2026/bills/static/SB0060.html
- Utah State Tax Commission, Tax Rates (stale, TY2025) — https://incometax.utah.gov/paying/tax-rates
- Utah TC-40 line-by-line, Taxpayer Tax Credit — https://incometax.utah.gov/credits/taxpayer-tax-credit
- Vermont GB-1210 (2026) Income Tax Withholding Instructions, Tables and Charts — https://tax.vermont.gov/sites/tax/files/documents/GB-1210-2026.pdf
- Vermont 2026 percentage-method withholding tables — https://tax.vermont.gov/sites/tax/files/documents/TaxTables-2026.pdf
- Vermont 2025 Tax Rate Schedules (validation baseline + worked example) — https://tax.vermont.gov/sites/tax/files/documents/TaxRateSched-2025.pdf
- Vermont GB-1210 (2025) — https://tax.vermont.gov/sites/tax/files/documents/GB-1210-2025.pdf
- Vermont Rate Schedules and Tax Tables — https://tax.vermont.gov/individuals/personal-income-tax/rates
- Virginia Form 760ES (2026) — https://www.tax.virginia.gov/sites/default/files/taxforms/individual-income-tax/2026/760es-2026.pdf
- Virginia 2026 Legislative Summary — https://www.tax.virginia.gov/sites/default/files/inline-files/2026-legislative-summary.pdf
- Virginia Tax, Deductions — https://www.tax.virginia.gov/deductions
- West Virginia Tax Division, 2026 Income Tax Rate Cut — https://tax.wv.gov/Individuals/Pages/PersonalIncomeTaxReductionBill.aspx
- Wisconsin DOR, 2026 Form 1-ES instructions (D-101A, R. 1-26) — https://www.revenue.wi.gov/TaxForms2026/2026-Form1-ES-Inst.pdf
- Washington DOR, Income tax — https://dor.wa.gov/taxes-rates/income-tax
- South Dakota DOR, Individuals/Taxes — https://dor.sd.gov/individuals/taxes/
- Tennessee DOR, Taxes (Hall Income Tax listed under Archived Taxes) — https://www.tn.gov/revenue/taxes.html
- EY Tax News, Utah law lowers state income tax rate retroactive to 1 Jan 2026 (corroboration) — https://taxnews.ey.com/news/2026-0913-utah-law-lowers-state-income-tax-rate-retroactive-to-january-1-2026
