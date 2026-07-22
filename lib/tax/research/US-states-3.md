# US State Income Tax 2026 — KY, LA, ME, MD, MA, MI, MN, MS

**Code:** US-states-3
**Research date:** 20 July 2026
**Tax year in effect:** Calendar year 2026 (1 Jan 2026 – 31 Dec 2026) for all eight states. All eight are calendar-year filers; the 2026 return is filed in early 2027.

All eight states levy a personal income tax. None of them is a no-income-tax state.

Scope note: state-level tax only. Federal income tax, FICA (Social Security 6.2% / Medicare 1.45% + 0.9% additional), and federal standard deduction are handled elsewhere. State unemployment insurance is employer-paid in all eight of these states (no employee SUTA), and none of these eight has a state disability tax. Massachusetts is the only one of the eight with a mandatory employee payroll contribution beyond income tax (PFML).

---

## 1. KENTUCKY (KY)

**Levies income tax:** Yes — flat.

### Rate
| Tax year | Rate |
|---|---|
| 2025 | 4.0% |
| **2026** | **3.5%** |

Kentucky is on a statutory phase-down (KRS 141.020). **The 2026 rate is 3.5%, not the 2025 rate of 4.0%.** Confirmed in the DOR's own 2026 Withholding Tax Formula (form 42A003 (TCF)(10-2025)).

### Standard deduction (there is no personal exemption)
| Tax year | Standard deduction |
|---|---|
| 2025 | $3,270 |
| **2026** | **$3,360** |

Single amount; Kentucky's standard deduction is per-return and the same for all filing statuses (married filing jointly gets one $3,360; married filing separately each get $3,360 on their own returns). Indexed annually under KRS 141.081(2)(a).

### Computation (employee, resident)
```
KY taxable income = KY AGI - (standard deduction 3360 OR itemized deductions)
KY tax before credits = KY taxable income * 0.035
KY tax = tax before credits * (1 - family_size_credit_pct)
```

### Family Size Tax Credit
A percentage credit against tax (not a deduction) for taxpayers with Modified Gross Income up to 133% of the federal poverty level, scaled by family size (1–4+). Credit percentages run 100%, 90%, 80%, 70%, 60%, 50%, 40%, 30%, 20%, 10% down to 0 as MGI rises through the threshold band. Published examples: family size 2 with MGI $22,650 → 80% credit; family size 4 with MGI $33,000 → 90% credit (2025 table). The exact 2026 MGI bands are on Schedule ITC for 2026.

### Other employee-relevant items
- Pension/retirement income exclusion: 100% of taxable retirement benefits up to **$31,110** per taxpayer (2025 figure; check Schedule P for 2026).
- No state EITC.

### Local income tax — MATERIAL
Kentucky cities, counties and school districts levy **occupational license fees** on gross wages, withheld by the employer at source. These are levied under KRS 68.197 / 91.200 and are **not administered by the Kentucky DOR** — each jurisdiction sets and collects its own. Rates commonly fall in the **0.5%–2.5%** range of gross wages, some with an annual wage cap, and some counties and cities stack (an employee can owe both a city and a county fee). Louisville/Jefferson County and Lexington-Fayette are the two largest. An implementer must source the rate per jurisdiction; there is no single state table.

### Worked example (KY DOR, 2026 Withholding Tax Formula)
1. Monthly payroll, wages $3,270/month:
   - Annual wages = 3,270 × 12 = $39,240
   - KY taxable wages = 39,240 − 3,360 = $35,880
   - Gross annual KY tax = 35,880 × 3.5% = **$1,255.80**
   - Monthly withholding = 1,255.80 ÷ 12 = **$104.65**
2. Bi-weekly payroll, wages $1,500/period:
   - Annual wages = 1,500 × 26 = $39,000
   - KY taxable wages = 39,000 − 3,360 = $35,640
   - Gross annual KY tax = 35,640 × 3.5% = **$1,247.40** (the published PDF has a typo showing "$35,730" in this line; $1,247.40 is arithmetically correct from $35,640)
   - Bi-weekly withholding = 1,247.40 ÷ 26 = **$47** (47.98 exact; DOR rounds)

---

## 2. LOUISIANA (LA)

**Levies income tax:** Yes — flat since 2025.

### Rate
**Flat 3.0%** of Louisiana taxable income, for all filing statuses, for taxable periods beginning on or after 1 January 2025 — so 2026 is 3.0%. The old graduated brackets (1.85% / 3.5% / 4.25%) are repealed. Confirmed on LDR's rate FAQ.

### Standard deduction (combined personal exemption + standard deduction)
| Filing status | 2025 | **2026** |
|---|---|---|
| Single / Married Filing Separately | $12,500 | **$12,875** |
| Married Filing Jointly / Qualifying Surviving Spouse / Head of Household | $25,000 | **$25,750** |

The 2026 amounts are from the official 2026 Form IT-540ES(i) estimated tax worksheet. The deduction is CPI-indexed annually under R.S. 47:294(B).

Taxpayers age 65+: the standard deduction is doubled for each individual 65 or over (constitutional amendment). The old additional $1,000 deductions for blind / age 65+ / dependents are **repealed**. Annual retirement income exemption for persons 65+ is $12,000.

### Computation
```
LA taxable income = LA AGI - standard deduction (12,875 single / 25,750 joint) - other allowed deductions
LA tax = LA taxable income * 0.03
```
(Per the official IT-540ES worksheet: line 4 = income less the estimated standard deduction, line 5 = line 4 × .03.)

### Withholding
The employer computer formula (Form R-1306) uses a **3.09%** withholding rate (a deliberate over-withholding buffer against the 3.0% liability rate):
- No standard deduction claimed: `W = S × 0.0309`
- Single / Married-Separate (claim "1"): `W = (S − 12,500/N) × 0.0309`
- Married-Joint / QSS / Head of Household (claim "2"): `W = (S − 25,000/N) × 0.0309`

where S = salary per pay period, N = pay periods per year (365 daily / 52 weekly / 26 bi-weekly / 24 semi-monthly / 12 monthly / 1 annual). Note the R-1306 on the LDR site is the 1/2025 edition using $12,500/$25,000; the annual CPI update to $12,875/$25,750 in the withholding tables was subject to a proposed regulation. **Use $12,875/$25,750 for the annual liability calculation regardless.**

### Local income tax
**None.** Louisiana parishes and municipalities do not levy income or occupational wage taxes.

---

## 3. MAINE (ME)

**Levies income tax:** Yes — progressive, 4 brackets in 2026 (3 rates plus a new 2% surcharge tier).

### 2026 rate schedules (Maine Revenue Services, "State of Maine 2026 Individual Income Tax Rates", revised 5 May 2026)

**Single**
| Maine taxable income | Tax |
|---|---|
| < $27,400 | 5.8% of taxable income |
| $27,400 – $64,850 | $1,589 + 6.75% of excess over $27,400 |
| $64,850 – $1,000,000 | $4,117 + 7.15% of excess over $64,850 |
| ≥ $1,000,000 | $70,980 + **9.15%** of excess over $1,000,000 |

**Married Filing Jointly / Surviving Spouse**
| Maine taxable income | Tax |
|---|---|
| < $54,850 | 5.8% of taxable income |
| $54,850 – $129,750 | $3,181 + 6.75% of excess over $54,850 |
| $129,750 – $1,500,000 | $8,237 + 7.15% of excess over $129,750 |
| ≥ $1,500,000 | $106,210 + **9.15%** of excess over $1,500,000 |

**Head of Household**
| Maine taxable income | Tax |
|---|---|
| < $41,100 | 5.8% of taxable income |
| $41,100 – $97,300 | $2,384 + 6.75% of excess over $41,100 |
| $97,300 – $1,500,000 | $6,178 + 7.15% of excess over $97,300 |
| ≥ $1,500,000 | $106,471 + **9.15%** of excess over $1,500,000 |

**Married Filing Separately**
| Maine taxable income | Tax |
|---|---|
| < $27,400 | 5.8% of taxable income |
| $27,400 – $64,850 | $1,589 + 6.75% of excess over $27,400 |
| $64,850 – $750,000 | $4,117 + 7.15% of excess over $64,850 |
| ≥ $750,000 | $53,105 + **9.15%** of excess over $750,000 |

### NEW FOR 2026 — 2% millionaire surcharge
For tax years beginning on or after 1 January 2026, a **2% surcharge** applies to the portion of Maine taxable income over **$1,000,000 (single)**, **$1,500,000 (MFJ and HoH)**, **$750,000 (MFS)**. This is why the top tier reads 9.15% (7.15% + 2.00%). The thresholds are **not** inflation-indexed for 2026; indexing begins 2027. **A 2025-based implementation will be wrong at the top end.**

### Standard deduction and personal exemption (2026)
| Item | Amount |
|---|---|
| Personal exemption | **$5,300** per taxpayer (and spouse if MFJ) |
| Standard deduction — Single | **$15,700** |
| Standard deduction — MFJ / QSS | **$31,400** |
| Standard deduction — Head of Household | **$23,550** |
| Standard deduction — MFS | **$15,700** |
| Additional for age 65+/blind — married or QSS | $1,650 each ($3,300 if one spouse both 65+ and blind; $3,300 if both 65+; $6,600 if both 65+ and blind) |
| Additional for age 65+/blind — single or HoH | $2,050 ($4,100 if both 65+ and blind) |
| Max itemized deductions (other than medical/dental) | $37,100 + medical/dental included in federal itemized |

⚠️ **Conflict to be aware of:** the October-2025 Maine withholding tables booklet states 2026 basic standard deductions of **$15,300 single / $30,600 MFJ**; the May-2026 revised rate schedule states **$15,700 / $31,400 / $23,550**. Use the revised (later) figures for annual liability. The $15,700 figure is also internally consistent with the stated 1.279 COLA factor in the same document. The withholding booklet separately uses **$12,450 (single) / $27,750 (married)** as the *withholding-only* standard deduction proxy.

### Standard/itemized deduction phaseout (2026)
Applies if Maine AGI exceeds **$102,250** (single or MFS), **$153,400** (HoH), **$204,550** (MFJ/QSS).
```
excess       = MaineAGI - threshold(102,250 / 153,400 / 204,550)
phaseRange   = 75,000 (single/MFS) | 112,500 (HoH) | 150,000 (MFJ/QSS)
ratio        = min(excess / phaseRange, 1.0000)          # 4 dp
reduction    = deduction * ratio
allowed      = deduction - reduction                      # fully phased out at ratio = 1
```
Personal exemption is disallowed on a similar high-income phaseout (36 M.R.S. §5126-A).

### Local income tax
**None.** No Maine municipality levies an income tax.

### 2026 COLA factors (from the rate schedule)
- 1.303 applied to the lowest dollar amounts of the bracket tables (§5111 sub-§§1-F, 2-F, 3-F)
- 1.298 applied to the highest dollar amounts of those tables
- 1.279 applied to the standard deduction (§5124-C(1-B)(A)(1)) and personal exemption (§5126-A(1))

---

## 4. MARYLAND (MD)

**Levies income tax:** Yes — progressive state tax **plus a mandatory county/Baltimore City local income tax**. Maryland's local tax is the single biggest local-tax factor in these eight states.

### 2026 State brackets — Schedule I: Single, Married Filing Separately, Dependent taxpayer
| Taxable net income over | But not over | Maryland tax |
|---|---|---|
| $1 | $1,000 | 2.00% of the amount |
| $1,001 | $2,000 | $20 + 3.00% of excess over $1,000 |
| $2,001 | $3,000 | $50 + 4.00% of excess over $2,000 |
| $3,001 | $100,000 | $90 + 4.75% of excess over $3,000 |
| $100,001 | $125,000 | $4,697.50 + 5.00% of excess over $100,000 |
| $125,001 | $150,000 | $5,947.50 + 5.25% of excess over $125,000 |
| $150,001 | $250,000 | $7,260.00 + 5.50% of excess over $150,000 |
| $250,001 | $500,000 | $12,760.00 + 5.75% of excess over $250,000 |
| $500,001 | $1,000,000 | $27,135.00 + **6.25%** of excess over $500,000 |
| $1,000,001 | — | $58,385.00 + **6.50%** of excess over $1,000,000 |

### 2026 State brackets — Schedule II: MFJ, Head of Household, Qualifying Surviving Spouse
| Taxable net income over | But not over | Maryland tax |
|---|---|---|
| $1 | $1,000 | 2.00% of the amount |
| $1,001 | $2,000 | $20 + 3.00% of excess over $1,000 |
| $2,001 | $3,000 | $50 + 4.00% of excess over $2,000 |
| $3,001 | $150,000 | $90 + 4.75% of excess over $3,000 |
| $150,001 | $175,000 | $7,072.50 + 5.00% of excess over $150,000 |
| $175,001 | $225,000 | $8,322.50 + 5.25% of excess over $175,000 |
| $225,001 | $300,000 | $10,947.50 + 5.50% of excess over $225,000 |
| $300,001 | $600,000 | $15,072.50 + 5.75% of excess over $300,000 |
| $600,001 | $1,200,000 | $32,322.50 + **6.25%** of excess over $600,000 |
| $1,200,001 | — | $69,822.50 + **6.50%** of excess over $1,200,000 |

The 6.25% and 6.50% brackets are **new** (Budget Reconciliation and Financing Act of 2025, Ch. 604, effective for tax years beginning after 31 Dec 2024). The 5.75% bracket is now capped.

### Standard deduction (2026)
The 2025 Act replaced Maryland's old 15%-of-AGI-with-min/max standard deduction with **flat, COLA-indexed amounts** and eliminated the income-based phase-in.
| Filing status | TY2025 | **TY2026** |
|---|---|---|
| Single / MFS / Dependent | $3,350 | **$3,400** |
| MFJ / HoH / QSS | $6,700 | **$6,800** (derived: statutorily double the single amount; $3,400 confirmed directly) |

$3,400 is stated explicitly in the 2026 Maryland Employer Withholding Guide and the 2026 Form MW507.

### Personal exemption (2026)
Base value **$3,200** per exemption (taxpayer, spouse, dependents), with a federal-AGI phaseout:
| Federal AGI | Single / MFS exemption | MFJ / HoH / QSS exemption |
|---|---|---|
| ≤ $100,000 | $3,200 | $3,200 |
| $100,001 – $125,000 | $1,600 | $3,200 |
| $125,001 – $150,000 | $800 | $3,200 |
| $150,001 – $175,000 | $0 | $1,600 |
| $175,001 – $200,000 | $0 | $800 |
| > $200,000 | $0 | $0 |

Additional $1,000 exemption for taxpayer and/or spouse age 65+ and/or blind.

### Itemized deduction phaseout (2025 onwards)
If federal AGI > $200,000 ($100,000 if MFS), reduce otherwise-allowable Maryland itemized deductions by **7.5% of FAGI in excess of $200,000 ($100,000 MFS)**.
Published examples: single, FAGI $250,000 → reduction $3,750, breakeven itemized $7,100. MFJ, FAGI $400,000 → reduction $15,000, breakeven $21,700; $50,000 of itemized deductions is reduced to $35,000.

### LOCAL INCOME TAX — mandatory, applies to every Maryland resident
Local tax is computed on **Maryland taxable income**, not on the state tax. Maximum permitted rate is **3.30%** for tax years beginning after 31 Dec 2025.

**2026 local rates (all 23 counties + Baltimore City):**
| Jurisdiction | 2026 rate | Jurisdiction | 2026 rate |
|---|---|---|---|
| Allegany | 3.20% (was 3.03%) | Howard | 3.20% |
| Anne Arundel | progressive, see below | Kent | 3.30% (was 3.20%) |
| Baltimore County | 3.20% | Montgomery | 3.20% |
| Baltimore City | 3.20% | Prince George's | 3.20% |
| Calvert | 3.20% | Queen Anne's | 3.20% |
| Caroline | 3.20% | St. Mary's | 3.20% |
| Carroll | 3.03% | Somerset | 3.20% |
| Cecil | 2.74% | Talbot | 2.40% |
| Charles | 3.03% | Washington | 2.95% |
| Dorchester | 3.30% | Wicomico | 3.20% |
| Frederick | progressive, see below | Worcester | 2.25% |
| Garrett | 2.65% | | |
| Harford | 3.06% | | |

**Allegany and Kent changed for 2026** — do not carry 2025 rates forward.

**Anne Arundel County (progressive):**
- Single/MFS/dependent: 2.70% on $1–$50,000; 2.94% on $50,001–$400,000; 3.20% over $400,000
- MFJ/HoH/QSS: 2.70% on $1–$75,000; 2.94% on $75,001–$480,000; 3.20% over $480,000

**Frederick County (progressive):**
- Single/MFS/dependent: 2.25% on $1–$25,000; 2.75% on $25,001–$50,000; 2.96% on $50,001–$150,000; 3.20% on $150,001+
- MFJ/HoH/QSS: 2.25% on $1–$25,000; 2.75% on $25,001–$100,000; 2.96% on $100,001–$250,000; 3.20% on $250,001+

**Withholding defaults:** an employee who files no MW507 is defaulted to the highest local rate, **3.30%** for 2026. Nonresidents: **7.0%** combined (4.75% state minimum plus the **2.25% special nonresident rate**; no local tax). Maryland law forbids using a rate below 4.75% for state withholding purposes.

### Other 2026 rates driven by the top-rate change
- PTE tax: 8.75% (individual/fiduciary members), 8.25% (entity members)
- Nonresident real-property sale withholding: 8.75% individuals, 8.25% entities
- Gambling winnings withholding: 9.5% residents, 8.75% nonresidents
- Additional **2% tax on net capital gains** where federal AGI > $350,000 (out of scope for wage earners, but note it exists)

### Credits
Maryland EITC: up to 50% of the federal EITC (with a refundable component), plus a local EITC in most counties. 2025 federal eligibility income limits circulated to employers: $61,555 ($68,675 MFJ) with 3+ children; $57,310 ($64,430) with 2; $50,434 ($57,554) with 1; $19,104 ($26,214) with none.

---

## 5. MASSACHUSETTS (MA)

**Levies income tax:** Yes — flat 5% plus a 4% surtax on very high income.

### Rates (2026)
| Income type | Rate |
|---|---|
| Part B income: wages, salaries, most earned income, interest, pensions | **5.0%** |
| Short-term capital gains / long-term gains on collectibles | 8.5% / 12% (out of scope) |
| **4% surtax** on the portion of total taxable income above the threshold | **+4.0%** |

**2026 surtax threshold: $1,107,750** (2025: $1,083,150). Indexed annually. Effective top marginal rate on wage income above the threshold is **9.0%**.

The surtax applies to combined taxable income from all sources, above the threshold, and is computed on the return (not a separate bracket table).

### Personal exemptions
| Filing status | Personal exemption |
|---|---|
| Single / Married Filing Separately | $4,400 |
| Head of Household | $6,800 |
| Married Filing Jointly | $8,800 |

Massachusetts has **no standard deduction**. Additional exemptions: $1,000 each for age 65+ and for blindness (per qualifying taxpayer/spouse), and $1,000 per dependent (dependent exemption).

### Employee deduction that materially reduces liability
**FICA/Medicare deduction:** up to **$2,000 per taxpayer** of amounts paid to Social Security, Medicare, Railroad Retirement, and Massachusetts/US retirement systems is deductible from Massachusetts gross income. For a two-earner joint return this is up to $4,000. This is a real, common reduction for ordinary employees — do not omit it.

### Computation sketch
```
MA gross income (Part B)
  - FICA/Medicare deduction (max 2,000 per taxpayer)
  - other Part B deductions (commuter, rent deduction 50% of rent up to 4,000, student loan interest, etc.)
  = Part B AGI
  - personal exemption (4,400 / 6,800 / 8,800) + age/blind/dependent exemptions
  = Part B taxable income
tax = Part B taxable income * 0.05
    + 0.04 * max(0, total taxable income - 1,107,750)
```

### Mandatory EMPLOYEE payroll contribution — PFML (2026)
Massachusetts Paid Family and Medical Leave, on eligible wages capped at the Social Security taxable maximum:
| Employer size | Total rate | Employee share | Employer share |
|---|---|---|---|
| 25+ covered individuals | 0.88% | **0.46%** (0.18% family + 0.28% medical) | 0.42% (60% of the medical portion) |
| < 25 covered individuals | 0.46% | **0.46%** (0.18% family + 0.28% medical) | 0% |

Up to 100% of the family-leave contribution (0.18%) and up to 40% of the medical-leave contribution (0.28%) may be withheld from the employee. Note: Chapter 101 of the Acts of 2026 shifts employer contributions from medical to family leave **effective 1 January 2027** — not 2026.

### Local income tax
**None.** No Massachusetts city or town levies an income tax.

---

## 6. MICHIGAN (MI)

**Levies income tax:** Yes — flat, **plus city income taxes in 24 cities**.

### Rate
| Tax year | Rate |
|---|---|
| 2025 | 4.25% |
| **2026** | **4.25%** |

Michigan's rate can drop below 4.25% under the MCL 206.51(1)(c) revenue trigger. Treasury determined on 15 April 2026 (based on fiscal-year data ending 30 Sept 2025) that the rate **remains 4.25% for the 2026 tax year**. It does not drop.

### Personal exemption (no standard deduction)
| Tax year | Exemption per person |
|---|---|
| 2025 | $5,800 |
| **2026** | **$5,900** |

Claimed for the taxpayer, spouse and each dependent. Michigan has **no standard deduction**.

### Computation
```
MI taxable income = MI AGI - (5,900 * number_of_exemptions) - allowed subtractions
MI tax = MI taxable income * 0.0425
```
Withholding: `withholding = (gross compensation for period - (5,900 / pay periods) * exemptions) * 0.0425`.

### Other employee-relevant items
- Retirement/pension subtraction is in a multi-year phase-in restoring pre-2012 treatment; by 2026 taxpayers may generally elect the full pre-2012 style deduction. Verify the 2026 election amounts on Schedule 1 / Form 4884 before implementing.
- Michigan EITC is **30% of the federal EITC** (raised from 6% by 2023 legislation).

### CITY INCOME TAX — material
**24 Michigan cities** levy a city income tax on wages, withheld by employers. The near-universal structure is: a resident rate, a nonresident rate at exactly half the resident rate, and a flat per-exemption deduction.

**Detroit (largest, administered by Michigan Treasury):**
- Resident rate: **2.4%** (× 0.024)
- Nonresident rate: **1.2%** (× 0.012) — nonresidents taxed only on the portion of compensation earned in the city
- Exemption value: **$600 per exemption per year**
- Withholding formula: `(gross for period − exemptions × $600/pay periods) × 0.024 or 0.012`

Other cities are in the 1.0%/0.5% band (e.g. most small cities at 1% resident / 0.5% nonresident) up to Detroit's 2.4%/1.2%; Grand Rapids and Highland Park sit between. Note: the Michigan Treasury takes over administration of **City of Flint** returns effective 1 Jan 2027 (affecting the 2026 tax year onward).

---

## 7. MINNESOTA (MN)

**Levies income tax:** Yes — progressive, 4 brackets.

### 2026 brackets (Minnesota Department of Revenue, released 16 Dec 2025)
Brackets adjusted **+2.369%** from 2025, rounded to the nearest $10.

**Single**
| Taxable income | Rate |
|---|---|
| $0 – $33,310 | 5.35% |
| $33,311 – $109,430 | 6.80% |
| $109,431 – $203,150 | 7.85% |
| over $203,150 | 9.85% |

**Married Filing Jointly / Surviving Spouse**
| Taxable income | Rate |
|---|---|
| $0 – $48,700 | 5.35% |
| $48,701 – $193,480 | 6.80% |
| $193,481 – $337,930 | 7.85% |
| over $337,930 | 9.85% |

**Married Filing Separately**
| Taxable income | Rate |
|---|---|
| $0 – $24,350 | 5.35% |
| $24,351 – $96,740 | 6.80% |
| $96,741 – $168,965 | 7.85% |
| over $168,965 | 9.85% |

**Head of Household**
| Taxable income | Rate |
|---|---|
| $0 – $41,010 | 5.35% |
| $41,011 – $164,800 | 6.80% |
| $164,801 – $270,060 | 7.85% |
| over $270,060 | 9.85% |

### Standard deduction (2026)
| Filing status | Amount |
|---|---|
| MFJ / Surviving Spouse | **$30,600** |
| Head of Household | **$23,000** |
| Single / Married Filing Separately | **$15,300** |
| Additional — married or surviving spouse, aged/blind | $1,600 each |
| Additional — single or HoH, aged/blind | $2,000 each |
| Dependents — minimum deduction | $1,300 |
| Dependents — additional over earned income | $350 |

### Dependent exemption (2026)
**$5,300** per dependent. Phased out ("Disallowed Exemption Amount") starting at income of $366,700 MFJ/QSS, $305,600 HoH, $244,500 single, $183,350 MFS.

### Standard/itemized deduction limitation (2026)
Two-stage phase-down. 1st phase-out threshold **$244,400** ($122,200 MFS); 2nd phase-out threshold **$337,800** ($168,900 MFS); 80% limitation cap at **$1,107,750**. Both the itemized deduction limitation (§290.0122 subd.2) and the standard deduction limitation (§290.0123 subd.5) use the same figures.

### Credits materially affecting employees (2026)
| Credit | 2026 amount |
|---|---|
| **Child Credit** (§290.0661) — maximum | **$1,800** per child |
| Child Credit + Working Family Credit phase-out threshold | $38,770 MFJ / $32,680 all others |
| Working Family Credit — earned income for max credit | $9,690 |
| WFC additional: 1 / 2 / 3+ qualifying older children | $1,020 / $2,330 / $2,770 |
| Dependent Care Credit phase-out threshold | $65,610 |
| K-12 Education Credit phase-out threshold | $77,550 |
| §529 Plan Credit phase-out thresholds | $98,410 / $177,140 |
| Renter's Credit | full 2026 schedule published; ineligible at household income ≥ $79,330 |

### Retirement-income subtractions (2026)
- **Social Security subtraction (simplified)** phase-out threshold: $110,780 MFJ/QSS; $86,410 single/HoH; $55,390 MFS
- **Social Security subtraction (alternate)** max: $5,840 MFJ/QSS; $4,560 single/HoH; $2,920 MFS; phase-out at $88,630 / $69,250 / $44,315 (not indexed)
- **Public pension subtraction** max: $27,690 MFJ/QSS; $13,850 single/HoH/MFS; phase-out at $110,780 / $86,410 / $55,390

### AMT exemption (2026)
$97,470 MFJ; $73,100 single/HoH; $48,740 MFS.

### Local income tax
**None.** No Minnesota city or county levies an income tax.

---

## 8. MISSISSIPPI (MS)

**Levies income tax:** Yes — flat above a zero-rate band, on a legislated phase-down toward eventual elimination.

### 2026 rates (Mississippi DOR Pub 89-700-25-1, rev. 13 Jan 2026)
| Taxable income (tax year 2026) | Rate |
|---|---|
| First $10,000 | **0%** |
| Remaining balance (excess of $10,000) | **4.0%** |

2025 was 4.4% on the excess over $10,000. **The 2026 rate is 4.0%** — under HB 1 (2025) the rate steps down 4.4% (2025) → 4.0% (2026) → 3.75% (2027) → 3.5% (2028) → 3.0% (2029), with further reductions after that tied to revenue growth triggers. Do not carry the 2025 rate forward.

### Exemptions and standard deduction (2026)
| Filing status | Personal exemption | Standard deduction |
|---|---|---|
| Single | **$6,000** | **$2,300** |
| Head-of-Family | **$9,500** ($8,000 + $1,500) | **$3,400** |
| Married (combined, joint return) | **$12,000** | **$4,600** |

Both are allowed — Mississippi's exemption and standard deduction stack. Married couples may split the $12,000 exemption between spouses. Taxpayers may take itemized deductions instead of the standard deduction if larger.

### Computation
```
MS taxable income = MS gross income - personal exemption - (standard deduction OR itemized)
MS tax = 0                                        if taxable <= 10,000
       = (MS taxable income - 10,000) * 0.04      if taxable > 10,000
```

**Effective zero-tax point:** a single filer pays no Mississippi tax until gross income exceeds $6,000 + $2,300 + $10,000 = **$18,300**. Married joint: $12,000 + $4,600 + $10,000 = **$26,600**.

### Local income tax
**None.** No Mississippi city or county levies an income tax.

---

## Cross-state summary

| State | Type | 2026 headline rate(s) | Std deduction (single) | Personal exemption | Local income tax |
|---|---|---|---|---|---|
| Kentucky | Flat | **3.5%** (down from 4.0%) | $3,360 | none | Yes — occupational fees ~0.5–2.5% |
| Louisiana | Flat | 3.0% | $12,875 | folded into std deduction | None |
| Maine | Progressive | 5.8 / 6.75 / 7.15 / **9.15%** | $15,700 | $5,300 | None |
| Maryland | Progressive | 2.0–6.50% | $3,400 | $3,200 (phased out) | **Yes — 2.25%–3.30%, mandatory** |
| Massachusetts | Flat + surtax | 5.0% (+4% over $1,107,750) | none | $4,400 | None |
| Michigan | Flat | 4.25% | none | $5,900 | Yes — 24 cities; Detroit 2.4%/1.2% |
| Minnesota | Progressive | 5.35 / 6.8 / 7.85 / 9.85% | $15,300 | $5,300 dependent only | None |
| Mississippi | Flat above $10k | 0% then **4.0%** (down from 4.4%) | $2,300 | $6,000 | None |

### What changed for 2026 that a 2025-based implementation would get wrong
1. **Kentucky:** 4.0% → **3.5%**; standard deduction $3,270 → $3,360.
2. **Mississippi:** 4.4% → **4.0%** on the excess over $10,000.
3. **Maine:** brand-new **2% surcharge** creating a 9.15% top tier over $1M/$1.5M/$750k; brackets and deductions re-indexed (COLA 1.303 / 1.298 / 1.279); standard deduction revised upward to $15,700/$31,400/$23,550.
4. **Maryland:** local rate changes — **Allegany 3.03% → 3.20%** and **Kent 3.20% → 3.30%**; maximum permitted local rate now 3.30%; standard deduction indexed $3,350 → $3,400.
5. **Massachusetts:** surtax threshold $1,083,150 → **$1,107,750**.
6. **Michigan:** rate confirmed unchanged at 4.25% by the 15 April 2026 determination (it *could* have dropped); personal exemption $5,800 → **$5,900**.
7. **Minnesota:** all brackets +2.369%; standard deduction, dependent exemption ($5,300) and credit thresholds re-indexed; Child Credit max $1,800.
8. **Louisiana:** standard deduction CPI-indexed $12,500 → **$12,875** (single) and $25,000 → **$25,750** (joint).

---

## Sources (all fetched 20 July 2026)

**Kentucky**
- https://revenue.ky.gov/Forms/2026%20Withholding%20Formula.pdf (42A003 (TCF)(10-2025) — 3.5% rate, $3,360 SD, two worked examples)
- https://revenue.ky.gov/News/Pages/Kentucky-DOR-Announces-2026-Standard-Deduction.aspx
- https://revenue.ky.gov/Forms/740%20Packet%20Instructions%20(2025).pdf (family size credit, pension exclusion)

**Louisiana**
- https://revenue.louisiana.gov/tax-education-and-faqs/faqs/income-tax-reform/what-are-the-individual-income-tax-rates-and-brackets/
- https://dam.ldr.la.gov/taxforms/IT540ESi-2026.pdf (2026 standard deduction $12,875/$25,750; ×.03)
- https://dam.ldr.la.gov/taxforms/1306(1_25).pdf (R-1306 withholding formulas, 3.09%)
- https://revenue.louisiana.gov/tax-education-and-faqs/faqs/income-tax-reform/will-the-standard-deduction-change-each-year-or-stay-the-same/

**Maine**
- https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/ind_tax_rate_sched_2026.pdf (rev. 5 May 2026 — brackets, 2% surcharge, SD/exemption)
- https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/26_wh_tab_instr.pdf
- https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/26_item_stand_%20ded_phaseout_wksht_0.pdf

**Maryland**
- https://www.marylandcomptroller.gov/content/dam/mdcomp/tax/legal-publications/facts/withholding-tax-facts-2026.pdf (2026 Schedules I & II, all county rates)
- https://www.marylandcomptroller.gov/content/dam/mdcomp/md/state-payroll/memos/2026/2026-maryland-state-and-local-withholding-information.pdf
- https://www.marylandcomptroller.gov/content/dam/mdcomp/tax/legal-publications/alerts/tax-alert-changes-to-standard-and-itemized-deductions-and-to-state-and-local-income-tax-rates-from-the-2025-legislative-session.pdf
- https://www.marylandcomptroller.gov/content/dam/mdcomp/tax/instructions/withholding/2026/withholding-guide.pdf
- https://www.marylandcomptroller.gov/content/dam/mdcomp/tax/forms/2026/mw507.pdf (exemption phaseout table)

**Massachusetts**
- https://www.mass.gov/info-details/massachusetts-4-surtax-on-taxable-income (2026 threshold $1,107,750)
- https://www.mass.gov/info-details/massachusetts-tax-rates
- https://www.mass.gov/info-details/massachusetts-personal-income-tax-exemptions
- https://www.mass.gov/info-details/paid-family-and-medical-leave-employer-contribution-rates-and-calculator

**Michigan**
- https://www.michigan.gov/taxes/-/media/Project/Websites/taxes/Forms/SUW/TY2026/446_Withholding-Guide_2026.pdf (4.25%, $5,900)
- https://www.michigan.gov/treasury/reference/taxpayer-notices/2026/04/15/425-income-tax-rate-for-individuals-and-fiduciaries-in-2026-tax-year
- https://www.michigan.gov/taxes/-/media/Project/Websites/taxes/Forms/City-Withholding/TY2025/5469_ty2025.pdf (Detroit 2.4%/1.2%, $600 exemption)

**Minnesota**
- https://www.revenue.state.mn.us/press-release/2025-12-16/minnesota-income-tax-brackets-standard-deduction-and-dependent-exemption
- https://www.revenue.state.mn.us/sites/default/files/2025-12/inflation-adjusted-amounts-2026.pdf

**Mississippi**
- https://www.dor.ms.gov/sites/default/files/tax-forms/business/89700251revised1.13.2026.pdf (Pub 89-700-25-1 rev. 13 Jan 2026 — 0%/4.0%, exemptions, SD)
