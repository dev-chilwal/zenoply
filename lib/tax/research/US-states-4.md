# US-states-4 — 2026 State Personal Income Tax Spec
### Missouri · Montana · Nebraska · Nevada · New Hampshire · New Jersey · New Mexico · New York

**Tax year in effect on 20 July 2026:** calendar year **2026** (1 January 2026 – 31 December 2026) for every state below. All eight states are calendar-year filers; returns are due 15 April 2027. Withholding for 2026 payrolls is already published by every state that levies a tax, and that is the primary source used here.

**Common structure.** Every taxing state here starts from a federal figure:
- Missouri, Montana, Nebraska, New Mexico, New York → start from **federal AGI** (Montana: federal taxable income), then apply a state standard deduction.
- New Jersey → completely independent base; **no standard deduction**, personal exemptions instead.

**Federal 2026 standard deduction** (needed by MO, MT, NM because they conform):
| Status | 2026 federal standard deduction |
|---|---|
| Single / MFS | **$16,100** |
| Married filing jointly / QSS | **$32,200** |
| Head of household | **$24,150** |
(Confirmed from Missouri's 2026 withholding formula, which restates the federal amounts.)

---

## 1. MISSOURI — progressive, top rate 4.70%

**Levies a personal income tax: YES.**

### 1.1 2026 rate schedule (both filing statuses — Missouri uses ONE table for all filing statuses)
Missouri does **not** have separate single/MFJ brackets. The same bracket table applies to every filing status; the filing status only changes the standard deduction. Brackets are indexed annually; 2026 step = **$1,348**.

| Missouri taxable income (annual) | Rate |
|---|---|
| $0 – $1,348 | 0.00% |
| $1,348.01 – $2,696 | 2.00% |
| $2,696.01 – $4,044 | 2.50% |
| $4,044.01 – $5,392 | 3.00% |
| $5,392.01 – $6,740 | 3.50% |
| $6,740.01 – $8,088 | 4.00% |
| $8,088.01 – $9,436 | 4.50% |
| over $9,436 | **4.70%** |

Cumulative tax at top of each bracket (Missouri's own published accumulation):
`0.00, 27.00, 34.00, 40.00, 47.00, 54.00, 61.00` → **$263.00 at $9,436**, then 4.70% of the excess.

Implementable closed form: `tax = 263 + 0.047 × (MOtaxable − 9,436)` for income over $9,436.

> **2026 vs 2025:** the top rate is **unchanged at 4.70%** (2025 top bracket started at $9,191; 2026 starts at $9,436 — inflation indexation only). Missouri's statutory phase-down to 4.5% has **not** triggered for 2026. Do not assume a cut.

### 1.2 Standard deduction (2026, = federal)
| Status | Amount |
|---|---|
| Single | $16,100 |
| Married filing separately | $16,100 |
| Married, spouse works (MO W-4 box unchecked) | $16,100 |
| Married, spouse does NOT work (MO W-4 line 1 box checked) | $32,200 |
| Head of household | $24,150 |

Note: "Married and spouse does not work" is **not** a filing status; it is a withholding-only election on Form MO W-4 that applies the full $32,200.

### 1.3 Personal exemption / credits
- **No** Missouri personal exemption (repealed 2019).
- Missouri allows a deduction for a portion of **federal income tax paid** (phased out; $5,000 single / $10,000 MFJ cap, reduced to 0 above $125,000 MO AGI) — materially affects liability for mid/high earners.
- 100% **capital gains subtraction** from Missouri AGI (effective from tax year 2025) — out of scope for wages but affects total liability.
- Property Tax Credit ("circuit breaker") up to $750/$1,100 for elderly/disabled.

### 1.4 Employee payroll contributions
None at state level. Missouri has **no** employee-paid UI, SDI or PFL contribution.

### 1.5 Local income tax (material)
- **Kansas City, MO**: 1% earnings tax on residents (worldwide earnings) and non-residents (KC-source earnings).
- **St. Louis City**: **1%** earnings tax on residents regardless of employer location, and on non-residents working in the city. (St. Louis Collector of Revenue: "The one percent earnings tax is collected from" residents and those working in the city.)
- No other Missouri municipality levies an earnings tax.

### 1.6 Supplemental wages
Flat **4.7%** if paid separately from regular wages (Missouri's stated option).

---

## 2. MONTANA — two brackets, top rate CUT to 5.65% for 2026

**Levies a personal income tax: YES.**

Montana starts from **federal taxable income** (i.e. federal AGI minus the *federal* standard or itemized deduction — the standard deduction amount is "the same as the federal amount"), then applies Montana additions/subtractions.

### 2.1 2026 ordinary income tax rates (HB 337, Laws 2025)

| Filing status | 4.7% applies to | 5.65% applies to |
|---|---|---|
| **Single**, married filing separately, estates & trusts | $0 – $47,500 | over $47,500 |
| **Married filing jointly** / qualifying surviving spouse | $0 – $95,000 | over $95,000 |
| Head of household | $0 – $71,250 | over $71,250 |

> **2026 vs 2025 — this is a real change.** 2025 was 4.7% / **5.9%** with a much narrower lower bracket (~$21,100 single / $42,200 MFJ). For 2026 the top rate falls to **5.65%** and the 4.7% band more than doubles. A 2025 implementation will be materially wrong.
>
> **2027 preview** (for forward planning only): 4.7% up to $65,000 / $130,000 / $97,500, top rate **5.4%**.

Closed form, single 2026: `tax = 0.047 × min(TI, 47500) + 0.0565 × max(0, TI − 47500)`.

### 2.2 Standard deduction (2026)
Equal to the **federal** standard deduction: **$16,100** single/MFS, **$32,200** MFJ/QSS, **$24,150** HOH. Montana has no separate state standard deduction table since the 2024 reform. You must use the same type (standard vs itemized) as on the federal return.

### 2.3 Personal exemption / credits
- **No** Montana personal exemption (eliminated in the 2024 restructure).
- **Montana Earned Income Tax Credit: 20% of the federal EITC**, refundable — **doubled from 10% beginning tax year 2026** (HB 337). This is a material change for low earners.
- Montana Child Tax Credit, Elderly Homeowner/Renter Credit, Adoption Credit also available.

### 2.4 Long-term capital gains (one-line note, out of primary scope)
Taxed at **3.0%** and **4.1%** using the same bracket boundaries; ordinary income fills the lower bracket first.

### 2.5 Withholding mechanics change for 2026
Montana wage withholding now mirrors the federal method: **Montana-specific allowances/personal exemptions are gone**; withholding relies on the **federal standard deduction for the employee's federal filing status**. Form MW-4 was reissued for 2026.

### 2.6 Employee payroll contributions
None employee-paid at state level (Montana UI is employer-paid).

### 2.7 Local income tax
**None.** No Montana municipality levies an income or earnings tax.

---

## 3. NEBRASKA — progressive, rates CUT for 2026

**Levies a personal income tax: YES.**

### 3.1 2026 rate schedule (official 2026 Nebraska Estimated Income Tax Rate Schedule, per Neb. Rev. Stat. § 77-2715.03(2)(c)(v))

**Single (and Married Filing Separately, identical):**
| Nebraska taxable income | Tax |
|---|---|
| $0 – $4,130 | 2.46% of income |
| $4,130 – $24,760 | $101.60 + 3.51% of excess over $4,130 |
| $24,760 – $39,900 | $825.71 + **4.55%** of excess over $24,760 |
| over $39,900 | $1,514.58 + **4.55%** of excess over $39,900 |

**Married Filing Jointly / Surviving Spouse:**
| Nebraska taxable income | Tax |
|---|---|
| $0 – $8,250 | 2.46% of income |
| $8,250 – $49,530 | $202.95 + 3.51% of excess over $8,250 |
| $49,530 – $79,800 | $1,651.88 + **4.55%** of excess over $49,530 |
| over $79,800 | $3,029.16 + **4.55%** of excess over $79,800 |

**Head of Household:**
| Nebraska taxable income | Tax |
|---|---|
| $0 – $7,700 | 2.46% of income |
| $7,700 – $39,620 | $189.42 + 3.51% of excess over $7,700 |
| $39,620 – $59,160 | $1,309.81 + **4.55%** of excess over $39,620 |
| over $59,160 | $2,198.88 + **4.55%** of excess over $59,160 |

Because brackets 3 and 4 carry the same rate for 2026, the schedule collapses to **three effective brackets: 2.46% / 3.51% / 4.55%**.

> **2026 vs 2025 — real change.** The top rate falls from **5.20% (2025) to 4.55% (2026)** under LB754's phase-down, and drops again to **3.99% in 2027**. Do not carry the 2025 rate forward.

### 3.2 Standard deduction (2026)
| Status | Amount |
|---|---|
| Single | $8,850 |
| Married filing jointly / QSS | $17,700 |
| Head of household | $12,950 |
| Married filing separately | $8,850 |

Additional standard deduction, 2026 (elderly and/or blind):
- Unmarried (single/HOH): +$2,050 if 65+ **or** blind; +$4,100 if 65+ **and** blind.
- Married (jointly or separately) or QSS: +$1,700 per condition; +$3,400 for two conditions; +$5,100 for three; +$6,800 if both spouses 65+ *and* both blind.

Nebraska taxpayers take the **greater of** the Nebraska standard deduction or Nebraska itemized deductions (= federal itemized minus state/local income taxes).

### 3.3 Personal exemption credit
**$176 per exemption** for 2026, a **nonrefundable credit** (not a deduction). Applied after tax is computed.

### 3.4 Other employee-relevant credits
- Nebraska **EITC = 10% of the federal EITC**, refundable.
- Child/Dependent Care Credit (refundable below $29,000 AGI).
- Nebraska Property Tax Incentive Act credits (school district / community college property taxes).

### 3.5 Withholding specifics (2026)
- Value of one withholding allowance, **annual: $2,440** (monthly $203.33; biweekly $93.85; weekly $46.92; semimonthly $101.67; quarterly $610.00; semiannual $1,220.00; daily $9.38).
- Withholding percentage-method top marginal rate is **4.60%** (withholding tables are deliberately slightly above the 4.55% statutory rate). Annual single table: 0 to $3,430 nil; then 2.26% / 3.22% / 4.21% / 4.35% / 4.48% / 4.60% at $3,430 / $6,710 / $21,810 / $31,610 / $40,130 / $75,370. Annual married table breakpoints: $8,190 / $13,010 / $32,400 / $50,400 / $62,530 / $82,920.
- **Special 1.5% floor:** employers with more than 24 employees must withhold **at least 1.5%** of each employee's taxable wages unless the employee documents a lower amount.

### 3.6 Employee payroll contributions
None. Nebraska UI is employer-paid; no state SDI/PFL.

### 3.7 Local income tax
**None.**

---

## 4. NEVADA — NO personal income tax

**Levies a personal income tax: NO — and it is constitutionally prohibited.**

Nevada Constitution, Article 10, Section 1(9): *"No income tax shall be levied upon the wages or personal income of natural persons."* Business income may still be taxed (Commerce Tax on gross revenue over $4,000,000, paid by businesses only).

- State income tax on wages: **0%**. No brackets, no standard deduction, no credits.
- **No local/municipal income tax** anywhere in Nevada.
- **No employee-paid** state payroll contribution: UI is employer-paid; Nevada's Modified Business Tax (payroll tax) is levied on **employers** (1.17% general / 1.554% financial institutions & mining, on quarterly gross wages above the exemption threshold) and is not withheld from employees.

Implementation: state tax = 0 for all Nevada residents/workers. Only federal tax + FICA apply.

---

## 5. NEW HAMPSHIRE — NO personal income tax

**Levies a personal income tax: NO.**

- New Hampshire has **never** taxed W-2 wages.
- The only individual income tax it had — the **Interest & Dividends Tax (RSA 77)** — is **fully repealed**. NH RSA Chapter 77 "Taxation of Incomes": *"Chapter 77 Repealed – Entire Chapter was repealed [Repealed by 2021, 91:189, II, eff. Jan. 1, 2025.]"*
- Rate history for reference: 5% through periods ending before 31 Dec 2023 → 4% for periods ending on/after 31 Dec 2023 → 3% for periods ending on/after 31 Dec 2024 → **repealed from 1 Jan 2025**. Thresholds were $2,400 individual / $4,800 joint.
- **For tax year 2026 there is no New Hampshire personal income tax of any kind.** State tax = 0.
- **No local income tax.** No employee-paid state payroll contribution (NH Paid Family & Medical Leave is a voluntary, opt-in insurance product, not a mandatory payroll deduction).

---

## 6. NEW JERSEY — progressive, top rate 10.75%

**Levies a personal income tax: YES.**

### 6.1 2026 rate schedules
New Jersey's Gross Income Tax rate schedules have been **unchanged since 2020** and were still in force for tax year 2025 (published in the 2025 NJ-1040 instructions). No 2026 change has been enacted; use these for 2026.

**Table A — Single, and Married/CU partner filing separately:**
| Taxable income | Rate | Subtract |
|---|---|---|
| $0 – $20,000 | 1.400% | $0 |
| $20,000 – $35,000 | 1.750% | $70.00 |
| $35,000 – $40,000 | 3.500% | $682.50 |
| $40,000 – $75,000 | 5.525% | $1,492.50 |
| $75,000 – $500,000 | 6.370% | $2,126.25 |
| $500,000 – $1,000,000 | 8.970% | $15,126.25 |
| over $1,000,000 | **10.750%** | $32,926.25 |

**Table B — Married/CU couple filing jointly, Head of household, Qualifying surviving spouse:**
| Taxable income | Rate | Subtract |
|---|---|---|
| $0 – $20,000 | 1.400% | $0 |
| $20,000 – $50,000 | 1.750% | $70.00 |
| $50,000 – $70,000 | 2.450% | $420.00 |
| $70,000 – $80,000 | 3.500% | $1,154.50 |
| $80,000 – $150,000 | 5.525% | $2,775.00 |
| $150,000 – $500,000 | 6.370% | $4,042.50 |
| $500,000 – $1,000,000 | 8.970% | $17,042.50 |
| over $1,000,000 | **10.750%** | $34,842.50 |

**Algorithm (New Jersey's own 3-step method):** `tax = (taxable income × rate) − subtraction`. Note this is a "rate-times-full-income minus constant" form, not a marginal-accumulation form — it is mathematically identical but implement it exactly this way to match NJ's published cents.

Taxpayers with NJ taxable income **below $100,000** are directed to the NJ tax **table** (rounded to $50 income bands); $100,000 or more must use the rate schedules above. A calculator should use the schedules throughout and note ±$1–2 rounding vs the table.

### 6.2 No standard deduction — exemptions instead
New Jersey has **no standard deduction**. Instead, personal exemptions (deducted from gross income):
| Exemption | Amount |
|---|---|
| Self (regular) | $1,000 |
| Spouse/CU partner | $1,000 |
| Age 65 or older (each) | $1,000 |
| Blind or disabled (each) | $1,000 |
| Each qualifying child | $1,500 |
| Each other dependent | $1,500 |
| Dependent attending college (additional, each) | $1,000 |
| Veteran (each qualifying veteran) | $6,000 |

Other deductions available: medical expenses above 2% of NJ gross income, property tax deduction (up to $15,000) **or** property tax credit ($50), alimony paid, qualified conservation contributions, health enterprise zone deduction.

### 6.3 Filing thresholds
NJ gross income tax is not owed if NJ gross income is at or below **$10,000** (single, MFS) or **$20,000** (MFJ, HOH, QSS).

### 6.4 Credits
- **NJ Earned Income Tax Credit = 40% of the federal EITC**, refundable (age 18+ eligible).
- Child Tax Credit (up to $1,000/child under 6 for NJ taxable income ≤ $30,000, tapering out at $80,000).
- Child and Dependent Care Credit.

### 6.5 Employee payroll contributions — 2026 (MATERIAL to take-home pay)
| Contribution | Employee rate 2026 | Wage base 2026 | Max employee cost 2026 |
|---|---|---|---|
| Unemployment Insurance (U.I.) | **0.3825%** | $44,800 | $171.36 |
| Workforce Development / Supplemental Workforce (W.F./S.W.F.) | **0.0425%** | $44,800 | $19.04 |
| Temporary Disability Insurance (D.I.) | **0.19%** | $171,100 | $325.09 |
| Family Leave Insurance (F.L.I.) | **0.23%** | $171,100 | **$393.53** |
| **Total maximum employee payroll contribution** | | | **$909.02** |

(Workers of governmental reimbursable employers pay U.I. at 0.0825% instead of 0.3825%; other rates identical.)

> **2026 vs 2025:** D.I. fell from 0.23% → **0.19%**; F.L.I. fell from 0.33% → **0.23%**; U.I./W.F. rates unchanged; UI wage base rose $43,300 → **$44,800**; TDI/FLI wage base rose $165,400 → **$171,100**.

Employer side (for package quoting): employer UI rate per experience rating (Table C in force for FY 2025-26), employer W.F./S.W.F. 0.1175%, employer Health Care Subsidy 0.0%, employer D.I. experience-rated, employer F.L.I. $0 (employee-funded).

### 6.6 Local income tax
**None.** No New Jersey municipality levies an income or earnings tax. (New Jersey residents commuting to Philadelphia pay Philadelphia wage tax and claim NJ's credit for taxes paid to other jurisdictions.)

---

## 7. NEW MEXICO — progressive, top rate 5.90%

**Levies a personal income tax: YES.**

### 7.1 2026 rate schedule
Brackets are set by statute (HB 252, Laws 2024 ch. 67, effective from tax year 2025) and are **not inflation-indexed** — the 2026 brackets are identical to 2025. Derived from the official FYI-104 annual withholding table (Rev. 11/2025, effective 1 January 2026) by removing the embedded zero-bracket.

**Single:**
| NM taxable income | Rate |
|---|---|
| $0 – $5,500 | 1.5% |
| $5,500 – $16,500 | 3.2% |
| $16,500 – $33,500 | 4.3% |
| $33,500 – $66,500 | 4.7% |
| $66,500 – $210,000 | 4.9% |
| over $210,000 | **5.9%** |

**Married filing jointly / Surviving spouse / Head of household** (New Mexico uses the same table for MFJ and HOH):
| NM taxable income | Rate |
|---|---|
| $0 – $8,000 | 1.5% |
| $8,000 – $25,000 | 3.2% |
| $25,000 – $50,000 | 4.3% |
| $50,000 – $100,000 | 4.7% |
| $100,000 – $315,000 | 4.9% |
| over $315,000 | **5.9%** |

**Married filing separately:** thresholds are half the MFJ figures ($4,000 / $12,500 / $25,000 / $50,000 / $157,500).

> **2026 vs 2025:** no change. The 1.5% bottom rate and the 4.3% middle bracket were new in **2025** (previously 1.7% bottom, no 4.3% bracket). If your implementation still uses pre-2025 New Mexico brackets it is wrong; if it uses 2025 brackets it is correct for 2026.

### 7.2 Standard deduction
New Mexico allows the **federal standard deduction** (or federal itemized deductions, less state/local income tax). 2026: **$16,100 / $32,200 / $24,150**.

### 7.3 Personal exemption
None as such; instead New Mexico has a **$4,000 deduction per dependent** (excluding one, i.e. beyond the first dependent) and various targeted exemptions (e.g. $8,000 low-income 65+ exemption, 100% Social Security exemption below $100,000/$150,000 AGI, armed forces retirement exemption).

### 7.4 Credits and rebates (material to employees)
- **Working Families Tax Credit = 25% of the federal EITC**, refundable.
- **Low Income Comprehensive Tax Rebate (LICTR)** — refundable, for modified gross income ≤ $36,000.
- **New Mexico Child Income Tax Credit** — refundable, $75–$600 per child depending on income.
- 2026 income eligibility figures appearing in the PIT-1 instructions: rebate income caps of **$36,667** (single), **$55,000** (MFJ/QSS/HOH), **$27,500** (MFS); phase-out base amounts $20,000 / $30,000 / $30,000 / $15,000 with phase-out rates 0.15 / 0.10 / 0.10 / 0.20 respectively.

### 7.5 Withholding note (implementation gotcha)
FYI-104's 2026 **annual** withholding tables use a zero-bracket of **$8,050 single / $16,100 married / $12,075 HOH** — exactly **half** the 2026 federal standard deduction. Withholding therefore systematically over-withholds relative to the annual return computation, which uses the **full** federal standard deduction. Use the full standard deduction for the annual liability calculation; use FYI-104 only if you are replicating paycheck withholding.

Annual withholding table, SINGLE (for withholding replication only):
0 to $8,050 → $0; $8,050–$13,550 → 1.5%; $13,550–$20,550 → $82.50 + 3.2%; $20,550–$24,550 → $306.50 + 3.2%; $24,550–$33,550 → $434.50 + 4.3%; $33,550–$41,550 → $821.50 + 4.3%; $41,550–$58,550 → $1,165.50 + 4.7%; $58,550–$74,550 → $1,964.50 + 4.7%; $74,550–$218,050 → $2,716.50 + 4.9%; over $218,050 → $9,748.00 + 5.9%.

Annual withholding table, MARRIED: 0 to $16,100 → $0; $16,100–$24,100 → 1.5%; $24,100–$32,100 → $120.00 + 3.2%; $32,100–$41,100 → $376.00 + 3.2%; $41,100–$57,100 → $664.00 + 4.3%; $57,100–$66,100 → $1,352.00 + 4.3%; $66,100–$102,100 → $1,739.00 + 4.7%; $102,100–$116,100 → $3,431.00 + 4.7%; $116,100–$331,100 → $4,089.00 + 4.9%; over $331,100 → $14,624.00 + 5.9%.

### 7.6 Employee payroll contributions
- **Workers' Compensation Administration fee:** employee **$2.00–$2.50 per quarter** (fee schedule steps up through 2033); employer $2.30–$2.80 per quarter. Trivial but it is a genuine employee deduction.
- No state SDI or PFL employee contribution in 2026 (New Mexico's Paid Family & Medical Leave bill did not become law).
- UI is employer-paid.

### 7.7 Local income tax
**None.** (New Mexico's Gross Receipts Tax is a business/sales-side tax, not an employee income tax.)

---

## 8. NEW YORK — progressive, top rate 10.90%, plus NYC / Yonkers

**Levies a personal income tax: YES.**

### 8.1 2026 New York State rate schedules (official, Form IT-2105-I (2026))

**Single and Married Filing Separately:**
| NY taxable income | Tax |
|---|---|
| $0 – $8,500 | 3.90% of income |
| $8,500 – $11,700 | $332 + 4.40% of excess over $8,500 |
| $11,700 – $13,900 | $473 + 5.15% of excess over $11,700 |
| $13,900 – $80,650 | $586 + **5.40%** of excess over $13,900 |
| $80,650 – $215,400 | $4,191 + **5.90%** of excess over $80,650 |
| $215,400 – $1,077,550 | $12,141 + 6.85% of excess over $215,400 |
| $1,077,550 – $5,000,000 | $71,198 + 9.65% of excess over $1,077,550 |
| $5,000,000 – $25,000,000 | $449,714 + 10.30% of excess over $5,000,000 |
| over $25,000,000 | $2,509,714 + **10.90%** of excess over $25,000,000 |

**Married Filing Jointly and Qualifying Surviving Spouse:**
| NY taxable income | Tax |
|---|---|
| $0 – $17,150 | 3.90% of income |
| $17,150 – $23,600 | $669 + 4.40% of excess over $17,150 |
| $23,600 – $27,900 | $953 + 5.15% of excess over $23,600 |
| $27,900 – $161,550 | $1,174 + **5.40%** of excess over $27,900 |
| $161,550 – $323,200 | $8,391 + **5.90%** of excess over $161,550 |
| $323,200 – $2,155,350 | $17,928 + 6.85% of excess over $323,200 |
| $2,155,350 – $5,000,000 | $143,430 + 9.65% of excess over $2,155,350 |
| $5,000,000 – $25,000,000 | $417,939 + 10.30% of excess over $5,000,000 |
| over $25,000,000 | $2,477,939 + **10.90%** of excess over $25,000,000 |

**Head of Household:**
| NY taxable income | Tax |
|---|---|
| $0 – $12,800 | 3.90% of income |
| $12,800 – $17,650 | $499 + 4.40% of excess over $12,800 |
| $17,650 – $20,900 | $712 + 5.15% of excess over $17,650 |
| $20,900 – $107,650 | $879 + **5.40%** of excess over $20,900 |
| $107,650 – $269,300 | $5,564 + **5.90%** of excess over $107,650 |
| $269,300 – $1,616,450 | $15,101 + 6.85% of excess over $269,300 |
| $1,616,450 – $5,000,000 | $107,381 + 9.65% of excess over $1,616,450 |
| $5,000,000 – $25,000,000 | $433,894 + 10.30% of excess over $5,000,000 |
| over $25,000,000 | $2,493,894 + **10.90%** of excess over $25,000,000 |

> **2026 vs 2025 — real change.** Chapter 59, Laws of 2025 (Part A) cut the two middle rates: **5.50% → 5.40%** and **6.00% → 5.90%** for tax year 2026, with a further 0.1 pp cut in 2027 (to 5.30% / 5.80%) making the full 0.2 pp reduction permanent thereafter. It applies to taxpayers with taxable income up to $215,400 single / $323,200 joint. The 3.90% / 4.40% / 5.15% lowest three rates are unchanged. Withholding tables changed for payrolls on or after 1 January 2026.

### 8.2 The "benefit recapture" (critical — do not omit)
New York claws back the benefit of the lower brackets for high earners. The rate table alone is **wrong** for anyone with NYAGI over $107,650. Eleven separate tax computation worksheets apply:

- **NYAGI $107,650 – $157,650** and taxable income at/below $215,400 (single) or $161,550 (MFJ): phase-in toward a **flat** 5.90% (single) / 5.40% (MFJ) of *all* taxable income.
  `tax = table_tax + (flat_tax − table_tax) × (NYAGI − 107,650) / 50,000`
  where `flat_tax = 0.059 × TI` (single/MFS/HOH) or `0.054 × TI` (MFJ/QSS).
- **NYAGI ≥ $157,650** with those taxable incomes: the flat amount applies in full.
- Above each subsequent bracket threshold, a **Recapture Base amount** plus an **Incremental Benefit amount** phased in over the next $50,000 of NYAGI:
  `tax = table_tax + recapture_base + incremental_benefit × min(NYAGI − threshold, 50,000)/50,000`

Published 2026 recapture base / incremental benefit constants:

| Filing status | NYAGI threshold | Recapture base | Incremental benefit |
|---|---|---|---|
| MFJ/QSS | $161,550 | $333 | $807 |
| MFJ/QSS | $323,200 | $1,140 | $3,071 |
| MFJ/QSS | $2,155,350 | $4,211 | $60,350 |
| MFJ/QSS | $5,000,000 | $64,561 | $32,500 |
| Single/MFS | $215,400 | $567 | $2,047 |
| Single/MFS | $1,077,550 | $2,614 | $30,172 |
| Single/MFS | $5,000,000 | (worksheet 10) | (worksheet 10) |
| Any | NYAGI > $25,000,000 | flat **10.9%** of all taxable income | — |

(Head-of-household constants follow the same pattern at HOH thresholds; take from IT-2105-I worksheets if HOH support is needed.)

### 8.3 New York State standard deduction (2026)
| Status | Amount |
|---|---|
| Single, claimable as a dependent elsewhere | $3,100 |
| Single, not claimable as a dependent | **$8,000** |
| Married filing jointly | **$16,050** |
| Married filing separately | $8,000 |
| Head of household (with qualifying person) | $11,200 |
| Qualifying surviving spouse | $16,050 |

New York has **no personal exemption for the taxpayer/spouse**, but allows a **$1,000 dependent exemption per dependent**.

### 8.4 State credits (material)
- **Household credit** — small, income-tested, up to $75 single / $90 + $15 per exemption for joint filers.
- **NY Earned Income Credit = 30% of the federal EITC** (less any household credit), refundable.
- **Empire State Child Credit** — expanded for 2025–2026 (up to $1,000 per child under 4, $500 per child 4–16).
- Child and Dependent Care Credit; College Tuition Credit; Real Property Tax Credit.

### 8.5 New York City resident income tax (2026)
Applies to NYC residents on top of state tax. Same taxable-income base.

**Single and Married Filing Separately:**
| City taxable income | Tax |
|---|---|
| $0 – $12,000 | 3.078% of income |
| $12,000 – $25,000 | $369 + 3.762% of excess over $12,000 |
| $25,000 – $50,000 | $858 + 3.819% of excess over $25,000 |
| over $50,000 | $1,813 + **3.876%** of excess over $50,000 |

**Married Filing Jointly / QSS:**
| City taxable income | Tax |
|---|---|
| $0 – $21,600 | 3.078% of income |
| $21,600 – $45,000 | $665 + 3.762% of excess over $21,600 |
| $45,000 – $90,000 | $1,545 + 3.819% of excess over $45,000 |
| over $90,000 | $3,264 + **3.876%** of excess over $90,000 |

**Head of Household:**
| City taxable income | Tax |
|---|---|
| $0 – $14,400 | 3.078% of income |
| $14,400 – $30,000 | $443 + 3.762% of excess over $14,400 |
| $30,000 – $60,000 | $1,030 + 3.819% of excess over $30,000 |
| over $60,000 | $2,176 + **3.876%** of excess over $60,000 |

**NYC School Tax Credit (rate reduction amount)** — subtract from NYC tax; zero if income > $500,000:
- MFJ/QSS: 0.171% of city taxable income up to $21,600; above that, $37 + 0.228% of the excess over $21,600 (up to $500,000).
- Single/MFS: 0.171% up to $12,000; above that, $21 + 0.228% of the excess over $12,000 (up to $500,000).
- **NYC School Tax Credit (fixed amount):** **$125** for MFJ/QSS, **$63** for all others, where income (federal AGI less IRA distributions) is $250,000 or less.
- Also: NYC household credit, NYC EITC, NYC income tax elimination credit for very low incomes.

**Non-residents working in NYC pay no NYC income tax** (the commuter tax was repealed in 1999).

### 8.6 Yonkers
- **Yonkers residents:** surcharge = **16.75%** of the taxpayer's net New York State tax liability (IT-2105-I, line 22a, "The current rate for Yonkers is 16.75% (.1675)").
- **Yonkers non-residents** working in Yonkers: **Yonkers nonresident earnings tax = 0.50%** of Yonkers-source wages/net earnings (Form Y-203; "multiply the amount on line 5 by the rate of 0.5% (0.005)").
- No other New York municipality levies an income tax.

### 8.7 Employee payroll contributions — New York 2026
| Contribution | Employee rate 2026 | Cap |
|---|---|---|
| **NY Paid Family Leave (PFL)** | **0.432%** of gross wages | Annual max **$411.91**; capped at NYSAWW of **$1,833.63**/week (i.e. wages above ~$95,300/yr contribute nothing further) |
| **NY State Disability (DBL)** | 0.5% of wages | **$0.60 per week** ($31.20/yr) — see caveats |

- **MCTMT (Metropolitan Commuter Transportation Mobility Tax)** on **wages is paid by the EMPLOYER**, not withheld from employees. Rates for employers in the MCTD: Zone 1 (NYC counties) up to **0.60%** of payroll, Zone 2 (suburban counties) up to **0.34%**. Self-employed individuals pay it directly at 0.60% / 0.34% on net earnings over $150,000 per zone. **Do not deduct MCTMT from an employee's take-home pay.**
- UI is employer-paid.

---

## Quick reference — 2026 top marginal state rate

| State | Personal income tax? | 2026 top rate | Changed for 2026? |
|---|---|---|---|
| Missouri | Yes | 4.70% | No (brackets indexed only) |
| Montana | Yes | 5.65% | **Yes — down from 5.90%, bracket widened** |
| Nebraska | Yes | 4.55% | **Yes — down from 5.20%** |
| Nevada | **No** (constitutionally barred) | 0% | — |
| New Hampshire | **No** (I&D tax repealed 1 Jan 2025) | 0% | — |
| New Jersey | Yes | 10.75% | No (rates unchanged since 2020); **payroll contribution rates fell** |
| New Mexico | Yes | 5.90% | No (2025 HB 252 brackets carry into 2026) |
| New York | Yes | 10.90% | **Yes — middle rates 5.50%→5.40% and 6.00%→5.90%** |

---

## Non-resident note (one line, as scoped)
All five taxing states tax non-residents only on state-source income (wages for services performed in the state), generally by apportioning the resident-basis tax. New York additionally applies a "convenience of the employer" rule to remote workers of New York employers; Nebraska applies a 7-day threshold plus a $5,000 conference/training de minimis from tax year 2025.
