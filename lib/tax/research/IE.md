# Ireland — Personal Income Tax & Employee Payroll Deductions
## Tax year 2026 (in effect on 20 July 2026)

**Tax year:** Calendar year. **1 January 2026 – 31 December 2026.**
Ireland uses a calendar tax year. The 2026 year is the one in effect on 20 July 2026.

**System:** PAYE (Pay As You Earn), operated on a **cumulative** basis by default via
Revenue Payroll Notifications (RPNs). Three separate mandatory deductions from an
employee's pay:
1. **Income Tax (PAYE)** — bands + non-refundable tax credits
2. **USC** (Universal Social Charge) — separate progressive charge, credits do NOT apply
3. **PRSI** (Pay Related Social Insurance) — Class A for ordinary employees, strictly
   non-cumulative and assessed per pay period

Plus **employer PRSI**, conventionally quoted as part of employment cost.

---

## 1. INCOME TAX — RATES AND STANDARD RATE CUT-OFF POINT (SRCOP)

Two rates only. **No changes to rates or bands for 2026** (Revenue Budget 2026 Summary,
p.1: *"There are no changes to tax rates and tax bands for 2026."*).

| Rate | Applies to |
|---|---|
| **20%** (standard) | income up to the SRCOP |
| **40%** (higher) | balance above the SRCOP |

### Standard Rate Cut-Off Point, 2026

| Personal circumstances | SRCOP (20% band) | 2025 (unchanged) |
|---|---|---|
| Single / widowed / surviving civil partner, **without** qualifying child | **€44,000** | €44,000 |
| Single / widowed / surviving civil partner, **qualifying for SPCCC** (one-parent) | **€48,000** | €48,000 |
| Married / civil partnership, **one income** | **€53,000** | €53,000 |
| Married / civil partnership, **both incomes** | **€53,000** with an increase of up to **€35,000** max → combined maximum **€88,000** | same |

**Married / civil partners, two incomes — the band-split rule:**
- Base band is €53,000, transferable/allocatable between the couple.
- It may be increased by up to €35,000, but the increase is **limited to the amount of
  the lower earner's income**. Combined maximum is therefore €88,000.
- No single spouse may hold more than €53,000 of the 20% band.
- Practical allocation for a couple with incomes `A ≥ B`:
  - `bandB = min(B, 35000)` — capped also at €53,000 in principle, but €35,000 binds first
  - `bandA = min(A, 53000)`
  - Combined 20% band = `min(bandA + bandB, 88000)`
- Single assessment / separate assessment: each spouse is treated on the single-person
  €44,000 band with own credits (unused portions transferable at year end under joint
  assessment only).

**Note (2026 married two-income arithmetic):** €53,000 + €35,000 = €88,000. If the lower
earner earns €20,000, the couple's 20% band is €53,000 + €20,000 = €73,000, allocated
€53,000 / €20,000.

---

## 2. TAX CREDITS, 2026

**No changes to tax credits for 2026** (Revenue Budget 2026 Summary, p.1).

Tax credits are **non-refundable** and are deducted from the income tax computed at
20%/40%. They **do not** reduce USC or PRSI. Total tax after credits is floored at **€0**
(no refund of excess credits).

### Core credits (relevant to an ordinary employee)

| Credit | 2026 | 2025 |
|---|---|---|
| **Single person** | **€2,000** | €2,000 |
| **Married person / civil partnership** (jointly assessed) | **€4,000** | €4,000 |
| **Employee Tax Credit (PAYE Credit)** | **€2,000** | €2,000 |
| **Earned Income Tax Credit** (self-employed / proprietary directors) | **€2,000** | €2,000 |
| Widowed person / surviving civil partner (without qualifying child) | €2,540 | €2,540 |
| Single Person Child Carer Credit (SPCCC) | €1,900 | €1,900 |
| Incapacitated Child Credit | €3,800 | €3,800 |
| Home Carer Tax Credit (max) | €1,950 | €1,950 |
| Dependent Relative Credit | €305 | €305 |
| Age Tax Credit — single / widowed / surviving CP (65+) | €245 | €245 |
| Age Tax Credit — married / civil partnership (65+) | €490 | €490 |
| Blind Tax Credit — single, or one spouse blind | €1,950 | €1,950 |
| Blind Tax Credit — both spouses/civil partners blind | €3,900 | €3,900 |
| Rent Tax Credit — single (max) | €1,000 | €1,000 |
| Rent Tax Credit — married / jointly assessed (max) | €2,000 | €2,000 |
| Mortgage Interest Tax Credit (max) | €1,250 | €1,250 |

### Widowed Parent Tax Credit (5-year tapering, by year of bereavement)

| Bereaved in | 2026 credit | 2025 credit |
|---|---|---|
| 2025 | **€3,600** | — |
| 2024 | **€3,150** | €3,600 |
| 2023 | **€2,700** | €3,150 |
| 2022 | **€2,250** | €2,700 |
| 2021 | **€1,800** | €2,250 |

### Important credit interaction rules
- **Employee (PAYE) Credit + Earned Income Credit are jointly capped at €2,000** for any
  one individual. An employee with a PAYE job and a side trade cannot claim €4,000.
- **Employee Tax Credit is per individual**, not per job. A jointly assessed couple where
  both are employees gets 2 × €2,000 = €4,000 of PAYE credit plus the €4,000 married
  personal credit.
- **SPCCC (€1,900)** carries the enhanced €48,000 SRCOP; it is only available to the
  primary claimant (the parent with whom the child resides for most of the year), and is
  not available to a person who is married/cohabiting.
- **Rent Tax Credit** extended to 2026, 2027 and 2028 with all conditions and values
  unchanged. Value is the **lower of** €1,000 (€2,000 jointly assessed) **or 20% of rent
  paid** in the year.
- **Mortgage Interest Tax Credit** for 2026: relief is **50% of the increase in interest
  paid in 2026 over interest paid in 2022**, given at the **standard rate (20%)**, capped
  at €1,250.

### Typical employee credit total (implementer default)
- Single employee: €2,000 (personal) + €2,000 (PAYE) = **€4,000**
- Married one-income employee: €4,000 (personal) + €2,000 (PAYE) = **€6,000**
- Married two-income, both employees: €4,000 + €2,000 + €2,000 = **€8,000**
- One-parent employee: €2,000 + €2,000 + €1,900 (SPCCC) = **€5,900**

---

## 3. USC — UNIVERSAL SOCIAL CHARGE, 2026

USC is charged on **gross income before pension contributions** (unlike income tax).
It is charged on **"relevant income"**. Tax credits do NOT reduce USC.

### Standard rates and bands, 2026

| Band | Width | Cumulative ceiling | Rate |
|---|---|---|---|
| Income up to €12,012.00 | €12,012 | €12,012.00 | **0.5%** |
| €12,012.01 – €28,700.00 | €16,688 | €28,700.00 | **2%** |
| €28,700.01 – €70,044.00 | €41,344 | €70,044.00 | **3%** |
| Above €70,044.00 | — | — | **8%** |

**2026 change (the only personal-tax change in Budget 2026):** the 2% band ceiling rose
from **€27,382 (2025) → €28,700 (2026)**, a €1,318 widening. The 3% band consequently
narrowed from €42,662 wide to €41,344 wide. The €12,012 and €70,044 boundaries are
unchanged. This was done so the national minimum wage rise to €14.15/hour from
1 January 2026 would not push full-time workers into the 3% band.

**2025 comparison (for a stale-implementation check):** 0.5% to €12,012; 2% €12,012.01–
€27,382; 3% €27,382.01–€70,044; 8% above €70,044.

### USC exemption threshold, 2026
- **€13,000.** If total income for the year is **€13,000 or less**, the individual is
  **exempt from USC entirely**.
- If income **exceeds €13,000**, USC is charged on the **full income from €0**, not just
  the excess. There is no marginal relief — it is a cliff-edge exemption.
- Cliff arithmetic: at exactly €13,000 → €0 USC. At €13,000.01 → USC = 0.5% × 12,012 +
  2% × 988.01 = €60.06 + €19.76 = **€79.82**. A €0.01 income rise creates a €79.82 charge.

### Reduced rates of USC, 2026
Apply where **aggregate income for the year is €60,000 or less** AND either:
- the individual is **aged 70 or over** at any point in the year; **or**
- the individual holds a **full medical card** (under 70) at any point in the year.

| Band | Rate |
|---|---|
| Income up to €12,012.00 | **0.5%** |
| Balance above €12,012.00 | **2%** |

- **Extension:** the reduced rate for full medical card holders under 70 was due to expire;
  Budget 2026 extended it to cover **2026 and 2027** (i.e. to 31 December 2027).
- If aggregate income **exceeds €60,000**, standard rates apply in full — no reduced rate
  and no tapering.
- A **"GP visit only" card is NOT a full medical card** for USC purposes.
- Medical card holders must contact Revenue to have the reduced rate applied.
- The reduced rate applies for the **whole year** once the condition is met at any point.

### Income excluded from USC
- **All Department of Social Protection payments** are excluded from "aggregate income"
  for USC (Illness Benefit, Jobseeker's, State Pension, Maternity Benefit, etc.).
- Income already subjected to DIRT.
- Employee pension contributions are **NOT** deductible for USC (they reduce income tax
  only).

### USC surcharge (out of ordinary-employee scope, note only)
An additional **3% USC surcharge** applies to **non-PAYE (self-assessed) income exceeding
€100,000 in a year**, giving a top rate of 11% on that income. It does not apply to PAYE
employment income.

---

## 4. PRSI — CLASS A EMPLOYEE, 2026

Class A is the class for ordinary private-sector and post-6-April-1995 public-sector
employees, aged 16 up to pension age 66 (or 66–70 for a person born on or after
1 January 1958 who has not been awarded the State Pension (Contributory)), with
reckonable pay of €38 or more per week.

### 2026 has TWO rate periods — this is the biggest stale-implementation trap

Under the Government's PRSI Roadmap (not a Budget 2026 measure), **all PRSI rates
increase by a further 0.15 percentage points on 1 October 2026.**

| Period | Employee Class A rate |
|---|---|
| **1 January 2026 – 30 September 2026** | **4.20%** |
| **1 October 2026 – 31 December 2026** | **4.35%** |

(Source: SW14 January 2026, p.2: *"Class A employee PRSI is calculated at 4.2% until
30 September 2026 (4.35% from 1 October 2026) of gross weekly earnings."*)

- Charged on **all** gross weekly earnings — **there is no employee PRSI ceiling**.
- Charged on **gross pay before pension contributions** (pension relief does not reduce
  PRSI).
- **Non-cumulative** — assessed independently in each pay period.
- Class H (Defence Forces): 4.1% until 30 Sep 2026, 4.25% from 1 Oct 2026.

### Class A subclasses and thresholds, 2026 (unchanged all year)

| Subclass | Weekly pay | Fortnightly | Monthly |
|---|---|---|---|
| **A0** | €38 – €352 | €76 – €704 | €165 – €1,525 |
| **AX** | €352.01 – €424 | €704.01 – €848 | €1,525.01 – €1,837 |
| **AL** | €424.01 – €552 | €848.01 – €1,104 | €1,837.01 – €2,392 |
| **A1** | more than €552 | more than €1,104 | more than €2,392 |
| **J0** | up to €37.99 | — | — |

**Employee PRSI is NIL where weekly earnings are €352 or less** (subclass A0). The
employer still pays. Above €352, the employee rate applies to **all** earnings from the
first euro — not just the excess.

**Cliff at €352:** at €352.00 employee PRSI = €0.00. At €352.01 the 4.2% charge is €14.78,
but the €12.00 PRSI Credit reduces it to **€2.78**. The credit exists precisely to smooth
this cliff.

### Full Class A rate table, 2026

**Until 30 September 2026:**

| Subclass | Weekly pay band | Employee | Employer | Combined |
|---|---|---|---|---|
| J0 | up to €37.99 | 0% | 0.70% | 0.70% |
| A0 | €38 – €352 | **Nil** | 9.00% | 9.00% |
| AX | €352.01 – €424 | **4.20%** | 9.00% | 13.20% |
| AL | €424.01 – €552 | **4.20%** | 9.00% | 13.20% |
| A1 | more than €552 | **4.20%** | 11.25% | 15.45% |

**From 1 October 2026:**

| Subclass | Weekly pay band | Employee | Employer | Combined |
|---|---|---|---|---|
| A0 | €38 – €352 | **Nil** | 9.15% | 9.15% |
| AX | €352.01 – €424 | **4.35%** | 9.15% | 13.50% |
| AL | €424.01 – €552 | **4.35%** | 9.15% | 13.50% |
| A1 | more than €552 | **4.35%** | 11.40% | 15.75% |

Community Employment participants use A8 (≤€352, employee nil, employer 0.70%) and
A9 (>€352, employee 4.20%/4.35%, employer 0.70%).

### PRSI Employee Credit (low-earnings tapering) — Class A and Class H

- Applies to gross **weekly** earnings between **€352.01 and €424** (subclass AX).
- **Maximum credit: €12.00 per week**, at gross weekly earnings of €352.01.
- **Taper:** the €12.00 maximum is reduced by **one-sixth of earnings in excess of
  €352.01**.
- Once earnings exceed **€424**, the credit is **zero** and no longer applies.
- The credit reduces the **employee** PRSI charge only; the employer charge is unaffected.
- The PRSI charge after credit cannot go below €0.
- **Unchanged for 2026** (Advance Notice 2026: *"There is no change to the employee PRSI
  Credit."*).
- Class E (Ministers of the Church of Ireland) has a separate €10 credit on €352.01–€412.

**Formula (weekly):**
```
credit = max(0, 12.00 - (grossWeekly - 352.01) / 6)          for 352.01 <= grossWeekly <= 424
credit = 0                                                    otherwise
prsi   = max(0, round2(grossWeekly * rate) - credit)          rate = 0.042 or 0.0435
```

**Taper end-point check:** at €424.00, excess = €71.99, /6 = €11.998… → €12.00 (rounded),
credit = €0.00. The taper is designed to hit exactly zero at €424.

**Pay-frequency scaling:** the credit is defined weekly. For fortnightly pay the band is
€704.01–€848 and for monthly €1,525.01–€1,837; the credit and thresholds scale by the
same multiplier (×2 fortnightly, ×52/12 monthly).

---

## 5. EMPLOYER PRSI (part of the employment package)

| Period | Weekly earnings ≤ €552 | Weekly earnings > €552 |
|---|---|---|
| 1 Jan 2026 – 30 Sep 2026 | **9.00%** | **11.25%** |
| 1 Oct 2026 – 31 Dec 2026 | **9.15%** | **11.40%** |

- **The €552 threshold was raised from €527 (2025) → €552 (2026)** with effect from
  **1 January 2026**, in line with the National Minimum Wage rise to **€14.15 per hour**.
  This threshold change IS a Budget 2026 measure.
- The higher rate applies to **all** earnings once the threshold is crossed, not just the
  excess (a genuine cliff: at €552.00 employer pays €49.68; at €552.01 employer pays
  €62.10 — a €12.42 jump for one cent).
- Employer PRSI is **not chargeable on share-based remuneration**. Employee PRSI may be
  in certain circumstances.
- These rates are inclusive of the **National Training Fund levy** — no separate levy line.
- There is **no employer PRSI ceiling**.

---

## 6. CALCULATION ORDER — implementer's algorithm

The three charges are computed **independently on the same gross pay**. There is no
sequencing between them.

```
1. INCOME TAX
   taxableIncome = gross - allowableDeductions (pension contributions, PHI, etc.)
   grossTax      = 20% × min(taxableIncome, SRCOP)
                 + 40% × max(0, taxableIncome - SRCOP)
   netTax        = max(0, grossTax - totalTaxCredits)

2. USC
   uscIncome = gross                          (NO pension deduction; excludes DSP payments)
   if uscIncome <= 13,000 -> usc = 0
   else if reducedRateEligible and uscIncome <= 60,000
       usc = 0.5% × 12,012 + 2% × (uscIncome - 12,012)
   else
       usc = 0.5% × min(uscIncome, 12,012)
           + 2%   × clamp(uscIncome - 12,012,  0, 16,688)
           + 3%   × clamp(uscIncome - 28,700,  0, 41,344)
           + 8%   × max(uscIncome - 70,044, 0)

3. PRSI  (per pay period, non-cumulative, on gross before pension)
   rate = 0.0420 if payDate <  2026-10-01 else 0.0435
   if grossWeekly <= 352 -> prsi = 0
   else prsi = max(0, round2(grossWeekly × rate) - prsiCredit(grossWeekly))

4. NET PAY = gross - pensionContribution - netTax - usc - prsi
```

### Key traps
- **Pension contributions reduce income tax only.** They do NOT reduce USC or PRSI. This
  is a very common implementation error.
- **Tax credits reduce income tax only.** They do NOT reduce USC or PRSI.
- **No standard deduction / no personal allowance.** Ireland gives credits, not
  allowances. Do not model a tax-free threshold for income tax — the effective tax-free
  point falls out of the credits (€4,000 credits ÷ 20% = €20,000 of income tax-free for a
  single employee, but USC and PRSI still apply above their own thresholds).
- **The €13,000 USC exemption and the €352 PRSI threshold are cliff-edges**, not tapers.
- **The 1 October 2026 PRSI rate change** means an annual 2026 estimate is not a single
  rate. For a full-year salary, either sum 39 weeks at 4.20% + 13 weeks at 4.35%, or use a
  day-weighted blended rate of **4.2378%** (273/365 × 4.20 + 92/365 × 4.35).
- **PAYE is cumulative**; a mid-year joiner or an emergency-basis employee will not match
  a simple annual model.

### Effective marginal rates for a single PAYE employee, 2026 (Jan–Sep)

| Gross income | Income tax | USC | PRSI | Total marginal |
|---|---|---|---|---|
| €0 – €13,000 | 0% (credits) | 0% (exempt) | 0% ≤ €352/wk (€18,304/yr) | **0%** |
| €13,000.01 – €18,304 | 0% (credits) | 0.5%/2% | 0% | ~2% |
| €18,304 – €20,000 | 0% (credits) | 2% | 4.2% | ~6.2% |
| €20,000 – €28,700 | 20% | 2% | 4.2% | **26.2%** |
| €28,700 – €44,000 | 20% | 3% | 4.2% | **27.2%** |
| €44,000 – €70,044 | 40% | 3% | 4.2% | **47.2%** |
| Above €70,044 | 40% | 8% | 4.2% | **52.2%** |

(From 1 October 2026 add 0.15pp to every row where PRSI applies: top marginal becomes
**52.35%**.)

---

## 7. OTHER ITEMS AFFECTING TAKE-HOME PAY

### Income tax exemption limits, age 65+
Budget 2026: *"There are no changes to the Income Tax exemption limits for persons aged
65 and over."* Where total income is below the exemption limit, no income tax is payable;
marginal relief applies just above it at 40% of the excess where that is more favourable
than the normal calculation. **The exact euro limits could not be confirmed from a Revenue
page in this session — see caveats.** Rarely relevant to an ordinary working-age employee
calculator.

### Pension contributions — age-related percentage limits
Employee contributions to an occupational scheme / PRSA / RAC attract income tax relief at
the marginal rate, subject to an age-related percentage of net relevant earnings, capped by
an earnings limit. The percentage bands (15% under 30, rising to 40% at 60+) and the
earnings cap of €115,000 are long-standing but **were not re-verified for 2026 in this
session** — see caveats.

### Benefit-in-Kind, employer-provided vehicles (2026)
- New vehicle category **A1 for zero-emission cars**: BIK 6%–15% of original market value
  depending on business mileage.
- Temporary OMV reduction extended and tapered: **€10,000 for 2026**, €5,000 for 2027,
  €2,500 for 2028 (applies to categories A1, A, B, C, D and all vans; not E).
- Lower mileage limit of the highest mileage band for employer-provided cars remains at
  **48,001 km permanently**.

### Non-residents (one line, per scope)
Non-resident individuals are chargeable on Irish-source income; entitlement to personal
tax credits is generally restricted or apportioned, with full credits available to EU/EEA
nationals whose Irish income is 75%+ of worldwide income. Split-year treatment applies in
year of arrival/departure.

---

## 8. WORKED EXAMPLES PUBLISHED BY REVENUE (USC, 2026)

These are Revenue's own published examples on the "Calculating your USC" page and can be
used to verify an implementation to the cent.

**Example 1 — Jacob, aged 32, income €25,000 (standard rates)**
```
0.5% × 12,012 =   60.06
2%   × 12,988 =  259.76
TOTAL USC     =  319.82
```

**Example 2 — Sadhbh, aged 45, income €50,000 (standard rates)**
```
0.5% × 12,012 =    60.06
2%   × 16,688 =   333.76
3%   × 21,300 =   639.00
TOTAL USC     = 1,032.82
```

**Example 3 — Donnchadh, aged 55, income €50,000, full medical card (reduced rates)**
```
0.5% × 12,012 =   60.06
2%   × 37,988 =  759.76
TOTAL USC     =  819.82
```

**Example 4 — Cian, aged 75, income €75,000 (income > €60,000 → standard rates apply
despite being over 70)**
```
0.5% × 12,012 =    60.06
2%   × 16,688 =   333.76
3%   × 41,344 = 1,240.32
8%   ×  4,956 =   396.48
TOTAL USC     = 2,030.62
```
Example 4 is the most valuable test case: it proves that being 70+ does NOT give reduced
rates once aggregate income exceeds €60,000.

## 9. WORKED EXAMPLE PUBLISHED BY DSP (PRSI Credit, 2026)

From SW14 (January 2026), p.2 — gross weekly earnings of **€377.00**:
```
Maximum PRSI Credit                                    €12.00
Less one-sixth of excess over €352.01
   (377.00 - 352.01 = 24.99 ÷ 6)                       (€4.17)
Reduced PRSI Credit                                     €7.83
PRSI at 4.2% (377.00 × 0.042)                          €15.83
Less reduced PRSI Credit                               (€7.83)
2026 Weekly PRSI Charge                                 €8.00
```

### SW14 full taper table (official, 2026, Jan–Sep at 4.2%)

| Gross weekly | Excess over 352.01 | ÷6 | Credit | PRSI @4.2% | **Charge** |
|---|---|---|---|---|---|
| 352.01 | 0.00 | 0.00 | 12.00 | 14.78 | **2.78** |
| 355.00 | 2.99 | 0.50 | 11.50 | 14.91 | **3.41** |
| 360.00 | 7.99 | 1.33 | 10.67 | 15.12 | **4.45** |
| 365.00 | 12.99 | 2.17 | 9.84 | 15.33 | **5.49** |
| 370.00 | 17.99 | 3.00 | 9.00 | 15.54 | **6.54** |
| 375.00 | 22.99 | 3.83 | 8.17 | 15.75 | **7.58** |
| 380.00 | 27.99 | 4.67 | 7.34 | 15.96 | **8.62** |
| 385.00 | 32.99 | 5.50 | 6.50 | 16.17 | **9.67** |
| 390.00 | 37.99 | 6.33 | 5.67 | 16.38 | **10.71** |
| 395.00 | 42.99 | 7.17 | 4.84 | 16.60 | **11.76** |
| 400.00 | 47.99 | 8.00 | 4.00 | 16.80 | **12.80** |
| 405.00 | 52.99 | 8.83 | 3.17 | 17.01 | **13.84** |
| 410.00 | 57.99 | 9.67 | 2.34 | 17.22 | **14.88** |
| 415.00 | 62.99 | 10.50 | 1.50 | 17.43 | **15.93** |
| 420.00 | 67.99 | 11.33 | 0.67 | 17.64 | **16.97** |
| 424.00 | 71.99 | 12.00 | 0.00 | 17.80 | **17.80** |

**Rounding note:** each intermediate is rounded to 2 decimals *before* the subtraction.
At €395: 42.99/6 = 7.165 → **7.17** (round half up), credit 4.83? — Revenue shows 4.84,
i.e. 12.00 − 7.17 = 4.83 but the table shows 4.84 and PRSI 16.60 − 4.84 = 11.76. Reproduce
by computing the credit as `12 - round2(excess/6)` and the PRSI as `round2(gross × rate)`,
then rounding the final charge; small ±€0.01 divergences against this table are expected
and are within normal payroll tolerance. Match the final charge column, not the
intermediates.

---

## 10. SANITY-CHECK SCENARIOS (derived, single PAYE employee, Jan–Sep 2026 rates)

**€35,000 single employee**
```
Income tax : 20% × 35,000            = 7,000.00
Credits    : 2,000 + 2,000           = (4,000.00)
Net tax                              = 3,000.00
USC        : 0.5%×12,012 =   60.06
             2%×16,688   =  333.76
             3%×6,300    =  189.00   = 582.82
PRSI       : 4.2% × 35,000           = 1,470.00
Total deductions                     = 5,052.82
Net pay                              = 29,947.18   (85.56% of gross)
```

**€60,000 single employee**
```
Income tax : 20%×44,000 = 8,800.00
             40%×16,000 = 6,400.00  = 15,200.00
Credits                             = (4,000.00)
Net tax                             = 11,200.00
USC        : 60.06 + 333.76 + 3%×31,300 (939.00) = 1,332.82
PRSI       : 4.2% × 60,000          = 2,520.00
Total deductions                    = 15,052.82
Net pay                             = 44,947.18   (74.91% of gross)
```

**€100,000 single employee**
```
Income tax : 20%×44,000 =  8,800.00
             40%×56,000 = 22,400.00 = 31,200.00
Credits                             = (4,000.00)
Net tax                             = 27,200.00
USC        : 60.06 + 333.76 + 1,240.32 + 8%×29,956 (2,396.48) = 4,030.62
PRSI       : 4.2% × 100,000         = 4,200.00
Total deductions                    = 35,430.62
Net pay                             = 64,569.38   (64.57% of gross)
```

**€60,000 married, one income, spouse not working**
```
Income tax : 20%×53,000 = 10,600.00
             40%× 7,000 =  2,800.00 = 13,400.00
Credits    : 4,000 (married) + 2,000 (PAYE) = (6,000.00)
Net tax                             = 7,400.00
USC (same as single)                = 1,332.82
PRSI                                = 2,520.00
Net pay                             = 48,747.18
```

**€50,000 one-parent employee (SPCCC)**
```
Income tax : 20%×48,000 = 9,600.00
             40%× 2,000 =   800.00 = 10,400.00
Credits    : 2,000 + 2,000 + 1,900 = (5,900.00)
Net tax                            = 4,500.00
USC                                = 1,032.82   (matches Revenue Example 2)
PRSI       : 4.2% × 50,000         = 2,100.00
Net pay                            = 42,367.18
```

---

## SOURCES

1. Revenue — **Budget 2026 Summary (PDF)**, key tax measures from the Minister for
   Finance's Budget Statement of 07 October 2025.
   https://www.revenue.ie/en/corporate/press-office/budget-information/current-year/budget-summary.pdf
   *(Primary source for: rates/bands unchanged, all credit amounts, USC standard and
   reduced rates 2026 vs 2025, BIK, Rent Tax Credit extension, exemption limits unchanged.)*
2. Revenue — **Tax rates, bands and reliefs**.
   https://www.revenue.ie/en/personal-tax-credits-reliefs-and-exemptions/tax-relief-charts/index.aspx
3. Revenue — **Standard rates and thresholds of USC**.
   https://www.revenue.ie/en/jobs-and-pensions/usc/standard-rates-thresholds.aspx
4. Revenue — **Reduced rates of USC**.
   https://www.revenue.ie/en/jobs-and-pensions/usc/reduced-rates.aspx
5. Revenue — **Calculating your USC** (source of the four official worked examples).
   https://www.revenue.ie/en/jobs-and-pensions/usc/calculating-usc.aspx
6. Dept. of Social Protection — **PRSI Contribution Rates and User Guide SW14,
   January 2026 (PDF)**. Primary source for the 4.2%/4.35% split, the Class A rate tables
   for both halves of 2026, the PRSI Credit formula and the official taper table.
   https://assets.gov.ie/static/documents/cb168977/PRSI_C20260116_Contribution_Rates_and_User_Guide_-_SW_14_-_English_Version_-_January_2026_.pdf-web.pdf
7. Dept. of Social Protection — **Advance Notice for 2026: PRSI changes announced in
   Budget 2026 (PDF)**. Primary source for the €527→€552 employer threshold change, the
   1 October 2026 +0.15% roadmap increase, and subclass boundaries.
   https://assets.gov.ie/static/documents/b9146265/20251008_Advance_Notice_2026_Final.pdf
8. Revenue — **Ready Reckoner, Post Budget 2026 (PDF)** (corroboration of 2026 as the
   current year).
   https://www.revenue.ie/en/corporate/documents/statistics/ready-reckoner.pdf
9. gov.ie — Dept. of Social Protection, **PRSI Class A Rates**.
   https://www.gov.ie/en/department-of-social-protection/publications/prsi-class-a-rates/
