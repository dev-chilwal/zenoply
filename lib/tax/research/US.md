# United States — Federal Personal Income Tax & Employee Payroll Deductions
## Tax year in effect on 20 July 2026: **calendar year 2026 (1 Jan 2026 – 31 Dec 2026)**

The US federal system is calendar-year. On 20 July 2026 an employee is *earning* into
tax year 2026 (return filed ~15 April 2027) and has just *filed* tax year 2025. A
take-home-pay calculator should use the **2026** figures below.

Primary source for nearly every number: **IRS Revenue Procedure 2025-32** (the 2026
inflation-adjustment Rev. Proc., which explicitly incorporates the One Big Beautiful
Bill Act amendments), plus **Form 1040-ES (2026)**, **Schedule 1-A (Form 1040)**,
**IRS Notice 2025-69**, **IRS Topic 751**, and **IRS Notice 2025-67**.

---

## 1. What OBBBA changed for 2026 vs 2025 (the "stale implementation" trap)

The One, Big, Beautiful Bill Act (P.L. 119-21, enacted 4 July 2025) is the single
biggest source of error for any calculator written before mid-2025.

| Item | Pre-OBBBA expectation | Actual 2026 |
|---|---|---|
| TCJA rates/brackets | Expired after 2025; reverting to 10/15/25/28/33/35/39.6% | **Made PERMANENT.** 2026 rates stay 10/12/22/24/32/35/37% |
| Standard deduction | Would have halved in 2026 | **Permanent at the elevated level**; 2026 = $32,200 MFJ / $16,100 single |
| Personal exemption | Would have returned (~$5,300) | **Permanently repealed ($0)** |
| Bracket indexation | Uniform ~2.3% | OBBBA gave the **10% and 12% brackets an extra year of indexing** → bottom two brackets rose ~4%, upper brackets ~2.3% |
| Senior deduction | n/a | **NEW $6,000/person, 65+, 2025–2028** |
| Tips deduction | n/a | **NEW up to $25,000, 2025–2028** |
| Overtime deduction | n/a | **NEW up to $12,500 / $25,000 MFJ, 2025–2028** |
| Car-loan interest deduction | n/a | **NEW up to $10,000, 2025–2028** |
| SALT cap | $10,000 | **$40,400 for 2026** (was $40,000 in 2025), phasing down above $505,000 AGI |
| Child tax credit | $2,000, dropping to $1,000 in 2026 | **$2,200 for 2026, permanent and indexed** |
| Charitable deduction for non-itemizers | none | **NEW $1,000 / $2,000 MFJ, permanent, first applies in 2026** |
| Pease limitation on itemized deductions | Suspended | **Replaced by a new 5.4% haircut, first applies 2026** |
| Charitable floor for itemizers | none | **NEW 0.5% of AGI floor, first applies 2026** |
| Misc. itemized deductions / moving expenses | Suspension expiring | **Permanently repealed** (moving: Armed Forces + intelligence community only) |

**Items that are 2026-only (not present in 2025) and will break a 2025-calibrated calculator:**
non-itemizer charitable deduction, the 0.5% charitable floor, the 5.4% itemized-deduction
haircut, the 90% gambling-loss cap, and the enhanced child & dependent care credit rate (50%).

---

## 2. Income tax rate schedules — tax year 2026
(Rev. Proc. 2025-32 §4.01. Applied to **taxable income** = AGI − standard-or-itemized
deduction − Schedule 1-A deductions − QBI deduction.)

### 2.1 Single (unmarried, not surviving spouse or HoH) — §1(j)(2)(C)

| Taxable income over | but not over | Tax |
|---|---|---|
| $0 | $12,400 | 10% of taxable income |
| $12,400 | $50,400 | $1,240 + 12% of excess over $12,400 |
| $50,400 | $105,700 | $5,800 + 22% of excess over $50,400 |
| $105,700 | $201,775 | $17,966 + 24% of excess over $105,700 |
| $201,775 | $256,225 | $41,024 + 32% of excess over $201,775 |
| $256,225 | $640,600 | $58,448 + 35% of excess over $256,225 |
| $640,600 | — | $192,979.25 + 37% of excess over $640,600 |

### 2.2 Married filing jointly / surviving spouse — §1(j)(2)(A)

| Taxable income over | but not over | Tax |
|---|---|---|
| $0 | $24,800 | 10% of taxable income |
| $24,800 | $100,800 | $2,480 + 12% of excess over $24,800 |
| $100,800 | $211,400 | $11,600 + 22% of excess over $100,800 |
| $211,400 | $403,550 | $35,932 + 24% of excess over $211,400 |
| $403,550 | $512,450 | $82,048 + 32% of excess over $403,550 |
| $512,450 | $768,700 | $116,896 + 35% of excess over $512,450 |
| $768,700 | — | $206,583.50 + 37% of excess over $768,700 |

### 2.3 Head of household — §1(j)(2)(B)

| Taxable income over | but not over | Tax |
|---|---|---|
| $0 | $17,700 | 10% of taxable income |
| $17,700 | $67,450 | $1,770 + 12% of excess over $17,700 |
| $67,450 | $105,700 | $7,740 + 22% of excess over $67,450 |
| $105,700 | $201,750 | $16,155 + 24% of excess over $105,700 |
| $201,750 | $256,200 | $39,207 + 32% of excess over $201,750 |
| $256,200 | $640,600 | $56,631 + 35% of excess over $256,200 |
| $640,600 | — | $191,171 + 37% of excess over $640,600 |

> Note the HoH 24%/32% breakpoints ($201,750 / $256,200) are $25 different from the
> single schedule ($201,775 / $256,225). This is real, not a typo.

### 2.4 Married filing separately — §1(j)(2)(D)

| Taxable income over | but not over | Tax |
|---|---|---|
| $0 | $12,400 | 10% |
| $12,400 | $50,400 | $1,240 + 12% |
| $50,400 | $105,700 | $5,800 + 22% |
| $105,700 | $201,775 | $17,966 + 24% |
| $201,775 | $256,225 | $41,024 + 32% |
| $256,225 | $384,350 | $58,448 + 35% |
| $384,350 | — | $103,291.75 + 37% |

### 2.5 Estates and trusts — §1(j)(2)(E)
$0–$3,300 @10%; $3,300–$11,700: $330 + 24%; $11,700–$16,000: $2,346 + 35%;
over $16,000: $3,851 + 37%.

---

## 3. Standard deduction — 2026 (Rev. Proc. 2025-32 §4.14)

| Filing status | Standard deduction |
|---|---|
| Married filing jointly / surviving spouse | **$32,200** |
| Head of household | **$24,150** |
| Single | **$16,100** |
| Married filing separately | **$16,100** |

(For reference, 2025: $31,500 / $23,625 / $15,750 / $15,750.)

**Personal exemption: $0** — permanently repealed by OBBBA.

### 3.1 Additional standard deduction for age 65+ / blind (§63(f))
Per qualifying condition (a person 65+ AND blind gets it twice):
- **$1,650** per condition if married (jointly or separately) or a surviving spouse
- **$2,050** per condition if unmarried (single or head of household)

Form 1040-ES (2026) restates this as totals:
- Unmarried: 65 or blind → $2,050; 65 and blind → $4,100
- Married/QSS: 65 or blind → $1,650; 65 and blind → $3,300; both spouses 65+ → $3,300 (MFJ only); both 65+ and blind → $6,600 (MFJ only)

### 3.2 Dependent's standard deduction (§63(c)(5))
Greater of **$1,350**, or **earned income + $450**, capped at the normal standard
deduction for the filing status.

### 3.3 Standard deduction is zero
If your spouse itemizes on a separate return, or you are a dual-status alien not
electing resident treatment.

---

## 4. The four new OBBBA "above-the-line-ish" deductions (Schedule 1-A, Form 1040)

Key structural fact for implementers: these are claimed on **Schedule 1-A** and enter on
**Form 1040 line 13b**, i.e. they are subtracted **after** AGI, and are available to
**both itemizers and standard-deduction takers**. They do **not** reduce AGI or MAGI,
and they do **not** reduce FICA wages. Effective **tax years 2025–2028 only**.

MAGI for all four = AGI + amounts excluded under §911 (foreign earned income), §931,
§933 (Puerto Rico / possessions).

All four require a valid SSN, and **married taxpayers must file jointly** to claim them
(MFS is ineligible).

### 4.1 Qualified tips deduction (§224)
```
tips_allowed = min(qualified_tips, 25_000)
excess       = max(0, MAGI - (300_000 if MFJ else 150_000))
steps        = floor(excess / 1_000)            # FLOOR — round DOWN
reduction    = steps * 100
deduction    = max(0, tips_allowed - reduction)
```
- The $25,000 cap is **per return**, not per spouse.
- Fully phased out at MAGI = $150,000 + $250,000 = **$400,000** (single) /
  $300,000 + $250,000 = **$550,000** (MFJ).
- Tips must be received in an occupation on the IRS published list at
  IRS.gov/TippedOccupations (Treasury list of occupations that customarily and
  regularly received tips on or before 31 Dec 2024).
- Employee tips are reported in **Form W-2 box 7** (plus box 12 code "TP" per 2026
  reporting), or Form 4137.
- Tips remain **fully subject to Social Security and Medicare tax** — this deduction is
  income-tax only. Critical for a take-home calculator.

### 4.2 Qualified overtime compensation deduction (§225)
```
ot_allowed = min(qualified_overtime, 25_000 if MFJ else 12_500)
excess     = max(0, MAGI - (300_000 if MFJ else 150_000))
steps      = floor(excess / 1_000)              # FLOOR
reduction  = steps * 100
deduction  = max(0, ot_allowed - reduction)
```
- **"Qualified overtime compensation" is only the PREMIUM portion** — the amount paid
  under 29 U.S.C. §207 (FLSA) **in excess of the regular rate**. For classic
  time-and-a-half, only the extra "half" counts, not the whole 1.5×. State-law-only
  overtime and contractual overtime above the FLSA requirement do **not** qualify.
- Reported for 2026 on **Form W-2 box 12 code "TT"**, Form 1099-MISC box 14, or
  Form 1099-NEC box 1d.
- Also fully subject to FICA.
- Fully phased out at MAGI $275,000 (single, $12,500/100 = 125 steps → $150,000+$125,000)
  / $550,000 (MFJ, $25,000 → 250 steps → $300,000+$250,000).

### 4.3 Enhanced deduction for seniors (§63(f) add-on)
```
excess    = max(0, MAGI - (150_000 if MFJ else 75_000))
per_head  = max(0, 6_000 - 0.06 * excess)       # CONTINUOUS 6%, not stepped
deduction = per_head * (number of taxpayers on the return born before 2 Jan 1961
                        who have a valid SSN)   # 0, 1, or 2
```
- Max $6,000 per eligible person, **$12,000** on a joint return where both spouses are 65+.
- "65 by the end of 2026" is operationalised as **born before 2 January 1961**.
- Note the phaseout is applied to the **per-person $6,000**, then multiplied by the
  number of eligible people — so a 2-senior MFJ return loses $0.12 per dollar of MAGI.
- Fully phased out at MAGI **$175,000** (single) / **$250,000** (MFJ).
- This is **in addition to** the §63(f) $1,650/$2,050 aged additional standard deduction,
  which continues to exist independently.

### 4.4 Qualified passenger vehicle loan interest (§163(h) carve-out)
```
qpvli_allowed = min(interest_paid, 10_000)
excess        = max(0, MAGI - (200_000 if MFJ else 100_000))
steps         = ceil(excess / 1_000)             # CEILING — round UP (differs from tips/OT!)
reduction     = steps * 200
deduction     = max(0, qpvli_allowed - reduction)
```
- Vehicle must have final assembly in the US; loan originated after 31 Dec 2024;
  loan secured by the vehicle; new (not used) personal-use vehicle. VIN must be reported.
- Fully phased out at MAGI $150,000 (single) / $250,000 (MFJ).

---

## 5. Employee payroll taxes (FICA) — 2026
Source: IRS Topic No. 751; Form 1040-ES (2026); SSA.

| Component | Employee rate | Employer rate | 2026 wage base |
|---|---|---|---|
| Social Security (OASDI) | **6.20%** | 6.20% | **$184,500** (2025: $176,100) |
| Medicare (HI) | **1.45%** | 1.45% | no limit |
| Additional Medicare Tax | **0.90%** | none (no employer match) | see below |
| **Total employee FICA below the SS cap** | **7.65%** | 7.65% | |

- Maximum employee Social Security tax in 2026 = 184,500 × 0.062 = **$11,439.00**
  (employer pays the same; combined $22,878.00).
- The SS wage base resets per employer; an employee with two employers can over-withhold
  and claims the excess as a refundable credit on Form 1040.
- There is **no floor / no tax-free allowance** for FICA — it applies from the first dollar
  of wages.
- Pre-tax §125 cafeteria-plan contributions (health premiums, FSA, HSA via cafeteria plan)
  reduce **both** income-tax wages and FICA wages. Traditional 401(k)/403(b) elective
  deferrals reduce income-tax wages but **NOT** FICA wages. This is the most common
  take-home-calculator bug.

### 5.1 Additional Medicare Tax (§3101(b)(2) / §1401(b)(2)) — thresholds NOT indexed

| Filing status | Threshold (on the return) |
|---|---|
| Married filing jointly | **$250,000** |
| Married filing separately | **$125,000** |
| Single | **$200,000** |
| Head of household | **$200,000** |
| Qualifying surviving spouse | **$200,000** |

- **Employer withholding rule:** the employer must withhold 0.9% on wages it pays to an
  individual in excess of **$200,000** in a calendar year, **regardless of filing status**,
  with no regard for the spouse's wages. Reconciled on Form 8959.
- So a single filer earning $250,000 has: SS 11,439.00 + Medicare 3,625.00 + AddlMed
  (250,000−200,000)×0.009 = 450.00 → total employee FICA $15,514.00.

### 5.2 Employer-side cost (for "total package" display)
Employer pays 6.2% OASDI up to $184,500 + 1.45% Medicare unlimited = **7.65%** matching.
Plus FUTA: 6.0% on the first $7,000 of wages, reduced to an effective **0.6%** ($42/employee)
in states with full credit. There is **no mandatory federal employer pension contribution**
(no US equivalent of Australian superannuation) — 401(k) employer matching is voluntary.

---

## 6. Credits that materially change an ordinary employee's liability — 2026

### 6.1 Child Tax Credit (§24)
- **$2,200** per qualifying child under 17 at year end (OBBBA made it permanent and indexed;
  2026 is the first indexed year and it stayed at $2,200 after rounding).
- Refundable portion (ACTC): up to **$1,700** per child.
- ACTC formula: 15% of earned income above **$2,500**, capped at $1,700 × children.
- Phaseout: begins at MAGI **$200,000** ($400,000 MFJ), reduced by **$50 for each $1,000**
  (or fraction) of MAGI above the threshold. (Thresholds are statutory and not indexed.)
- SSN rule (OBBBA-tightened): the **child** needs an SSN valid for employment; the
  **taxpayer** needs an SSN valid for employment issued by the return due date. On a joint
  return only one spouse needs a valid SSN; the other needs an SSN or ITIN.
- Credit for other dependents: **$500** (nonrefundable).

### 6.2 Earned Income Tax Credit (§32) — Rev. Proc. 2025-32 §4.06

| | 1 child | 2 children | 3+ children | No children |
|---|---|---|---|---|
| Earned income amount (credit maxes at) | $13,020 | $18,290 | $18,290 | $8,680 |
| **Maximum credit** | **$4,427** | **$7,316** | **$8,231** | **$664** |
| Phaseout begins — MFJ | $31,160 | $31,160 | $31,160 | $18,140 |
| Fully phased out — MFJ | $58,863 | $65,899 | $70,244 | $26,820 |
| Phaseout begins — all other statuses | $23,890 | $23,890 | $23,890 | $10,860 |
| Fully phased out — all other statuses | $51,593 | $58,629 | $62,974 | $19,540 |

Implied credit rates (statutory, unchanged): phase-in 7.65% / 34% / 40% / 45% for
0/1/2/3+ children; phase-out 7.65% / 15.98% / 21.06% / 21.06%.
Investment income disqualification limit for 2026: **$12,200**.

### 6.3 Child and dependent care credit (§21) — enhanced for 2026
Qualifying expense cap unchanged at **$3,000** (one qualifying individual) /
**$6,000** (two or more), but the **maximum credit rate rose from 35% to 50%** for 2026.
Nonrefundable.

### 6.4 Other 2026 amounts
- Adoption credit: max **$17,670**; refundable portion up to **$5,120**.
- Foreign earned income exclusion: **$132,900**.
- Annual gift tax exclusion: **$19,000**. Estate basic exclusion: **$15,000,000**.
- Educator expense above-the-line deduction: **$350** (and, new for 2026, educators may
  also claim a related itemized deduction on Schedule A).
- Kiddie tax: unearned income offset **$1,350**; AMT exemption for such a child =
  earned income + **$9,750**.
- Saver's credit AGI limit (§25B), student loan interest deduction phaseout: not
  extracted here; not material to a basic take-home calculator.

**Credits that EXPIRED and are gone in 2026:** new clean vehicle credit, previously-owned
clean vehicle credit, commercial clean vehicle credit, energy efficient home improvement
credit, residential clean energy credit. The alternative refuelling property credit expires
for property placed in service after **30 June 2026**.

---

## 7. Itemized deductions — 2026 changes that matter

### 7.1 SALT cap (§164(b)(6), as amended)
- 2026 limit: **$40,400** ($20,200 MFS). (2025 was $40,000 / $20,000.)
- Phases down when **MAGI exceeds $505,000** ($252,500 MFS) — the phase-down reduces the
  cap by **30% of the excess**, but **never below $10,000** ($5,000 MFS).
- Cap and threshold rise **1% per year** through 2029; the cap reverts to $10,000 after 2029.
- The IRS issued an explicit correction because the printed 2026 Form 1040-ES showed the
  old $40,000/$500,000 figures — use **$40,400 / $505,000**.

### 7.2 New overall limitation on itemized deductions (§68, OBBBA replacement for Pease)
First applies in **2026**:
```
threshold = 768_700 (MFJ/QSS) | 640_600 (Single/HoH) | 384_350 (MFS)
reduction = 0.054 * min(total_itemized_deductions,
                        max(0, taxable_income - threshold))
```
Applied **after** all other limitations; does **not** apply to the QBI deduction.
Mechanically this caps the benefit of itemized deductions at 35% rather than 37%
(0.37 − 0.054 ≈ 0.316 ... expressed by IRS as a 5.4% haircut of the lesser amount).

### 7.3 Charitable contributions
- **Non-itemizers (new for 2026, permanent):** deduct cash contributions up to
  **$1,000** ($2,000 MFJ). Reported on Form 1040 directly; for estimated-tax purposes
  1040-ES says "standard deduction plus up to $1,000 ($2,000 MFJ)".
- **Itemizers (new for 2026):** only contributions **exceeding 0.5% of AGI** are
  deductible. Disallowed amounts carry forward.

### 7.4 Other 2026 itemized rules
- Gambling losses: deduction limited to **90% of gambling winnings** (down from 100%).
- Moving expenses: deductible only by Armed Forces and, new for 2026, the intelligence community.
- Miscellaneous itemized deductions subject to the 2%-of-AGI floor: permanently repealed.

---

## 8. Alternative Minimum Tax — 2026 (Rev. Proc. 2025-32 §4.10)

| Filing status | Exemption | Phaseout starts | Fully phased out |
|---|---|---|---|
| MFJ / surviving spouse | $140,200 | $1,000,000 | $1,280,400 |
| Unmarried (single/HoH) | $90,100 | $500,000 | $680,200 |
| Married filing separately | $70,100 | $500,000 | $640,200 |
| Estates and trusts | $31,400 | $104,800 | $167,600 |

- **Phaseout rate is 50%** of AMTI over the threshold (OBBBA raised it from 25%);
  verifiable: 90,100 / 0.50 = 180,200; 500,000 + 180,200 = 680,200. ✓
- AMT rates: **26%** on AMTI (after exemption) up to **$244,500** ($122,250 MFS);
  **28%** above.
- OBBBA reset the AMT phaseout thresholds to $500,000/$1,000,000 (indexed from 2026)
  rather than letting the higher TCJA thresholds continue.
- Very few ordinary wage employees hit AMT post-TCJA; a basic calculator may omit it, but
  should not silently return a too-low number for high earners with large SALT.

---

## 9. Pre-tax payroll items an employee calculator should offer — 2026 limits

| Item | 2026 limit | Reduces income tax wages | Reduces FICA wages |
|---|---|---|---|
| 401(k)/403(b)/457(b) elective deferral | **$24,500** | Yes (traditional) | **No** |
| Catch-up, age 50+ | **$8,000** | Yes | No |
| "Super" catch-up, ages 60–63 | **$11,250** | Yes | No |
| IRA contribution | **$7,500** | Yes (if deductible) | n/a (not payroll) |
| Health FSA (§125) | **$3,400** (carryover $680) | Yes | **Yes** |
| HSA — self-only | **$4,400** | Yes | Yes if via §125 cafeteria plan |
| HSA — family | **$8,750** | Yes | Yes if via §125 |
| HSA catch-up, 55+ | **+$1,000** | Yes | Yes if via §125 |
| Qualified transportation (transit or parking) | **$340/month each** | Yes | Yes |

Note: high-earner Roth catch-up mandate (SECURE 2.0 §603) applies from 2026 for employees
with prior-year FICA wages above the indexed threshold — such catch-ups must be Roth and
therefore do **not** reduce taxable wages.

---

## 10. Reference implementation

```python
from math import floor, ceil

BRACKETS_2026 = {
    "single": [(12_400, 0.10, 0), (50_400, 0.12, 1_240), (105_700, 0.22, 5_800),
               (201_775, 0.24, 17_966), (256_225, 0.32, 41_024),
               (640_600, 0.35, 58_448), (float("inf"), 0.37, 192_979.25)],
    "mfj":    [(24_800, 0.10, 0), (100_800, 0.12, 2_480), (211_400, 0.22, 11_600),
               (403_550, 0.24, 35_932), (512_450, 0.32, 82_048),
               (768_700, 0.35, 116_896), (float("inf"), 0.37, 206_583.50)],
    "hoh":    [(17_700, 0.10, 0), (67_450, 0.12, 1_770), (105_700, 0.22, 7_740),
               (201_750, 0.24, 16_155), (256_200, 0.32, 39_207),
               (640_600, 0.35, 56_631), (float("inf"), 0.37, 191_171)],
    "mfs":    [(12_400, 0.10, 0), (50_400, 0.12, 1_240), (105_700, 0.22, 5_800),
               (201_775, 0.24, 17_966), (256_225, 0.32, 41_024),
               (384_350, 0.35, 58_448), (float("inf"), 0.37, 103_291.75)],
}
STD_DED_2026 = {"single": 16_100, "mfj": 32_200, "hoh": 24_150, "mfs": 16_100}
ADDL_STD_2026 = {"single": 2_050, "hoh": 2_050, "mfj": 1_650, "mfs": 1_650}

SS_RATE, SS_WAGE_BASE_2026 = 0.062, 184_500
MEDICARE_RATE, ADDL_MED_RATE = 0.0145, 0.009
ADDL_MED_THRESHOLD = {"single": 200_000, "hoh": 200_000, "qss": 200_000,
                      "mfj": 250_000, "mfs": 125_000}
EMPLOYER_WITHHOLD_ADDL_MED_AT = 200_000   # per employer, ignores filing status


def income_tax_2026(taxable_income, status):
    ti = max(0.0, taxable_income)
    lower = 0.0
    for upper, rate, base in BRACKETS_2026[status]:
        if ti <= upper:
            return base + rate * (ti - lower)
        lower = upper
    raise AssertionError


def tips_deduction_2026(qualified_tips, magi, status):
    if status == "mfs":
        return 0.0
    cap = min(qualified_tips, 25_000)
    thr = 300_000 if status == "mfj" else 150_000
    return max(0.0, cap - floor(max(0.0, magi - thr) / 1_000) * 100)


def overtime_deduction_2026(qualified_ot_premium, magi, status):
    if status == "mfs":
        return 0.0
    cap = min(qualified_ot_premium, 25_000 if status == "mfj" else 12_500)
    thr = 300_000 if status == "mfj" else 150_000
    return max(0.0, cap - floor(max(0.0, magi - thr) / 1_000) * 100)


def senior_deduction_2026(magi, status, n_seniors):
    """n_seniors = 0, 1 or 2 taxpayers on the return born before 2 Jan 1961."""
    if status == "mfs":
        return 0.0
    thr = 150_000 if status == "mfj" else 75_000
    per_head = max(0.0, 6_000 - 0.06 * max(0.0, magi - thr))
    return per_head * n_seniors


def car_loan_interest_deduction_2026(interest, magi, status):
    if status == "mfs":
        return 0.0
    cap = min(interest, 10_000)
    thr = 200_000 if status == "mfj" else 100_000
    return max(0.0, cap - ceil(max(0.0, magi - thr) / 1_000) * 200)


def salt_cap_2026(magi, status):
    base, thr, floor_ = ((20_200, 252_500, 5_000) if status == "mfs"
                         else (40_400, 505_000, 10_000))
    return max(float(floor_), base - 0.30 * max(0.0, magi - thr))


def itemized_haircut_2026(total_itemized, taxable_income_before, status):
    thr = {"mfj": 768_700, "qss": 768_700, "single": 640_600,
           "hoh": 640_600, "mfs": 384_350}[status]
    return 0.054 * min(total_itemized, max(0.0, taxable_income_before - thr))


def employee_fica_2026(wages, status="single", other_spouse_wages=0.0):
    """`wages` = Medicare wages (Box 5): gross less §125 pre-tax, NOT less 401(k)."""
    ss = SS_RATE * min(wages, SS_WAGE_BASE_2026)
    med = MEDICARE_RATE * wages
    combined = wages + other_spouse_wages
    addl = ADDL_MED_RATE * max(0.0, combined - ADDL_MED_THRESHOLD[status])
    return {"social_security": ss, "medicare": med,
            "additional_medicare": addl, "total": ss + med + addl}


def employer_withheld_addl_medicare_2026(wages_from_this_employer):
    return ADDL_MED_RATE * max(0.0, wages_from_this_employer
                               - EMPLOYER_WITHHOLD_ADDL_MED_AT)


def child_tax_credit_2026(n_children_under_17, magi, status):
    gross = 2_200 * n_children_under_17
    thr = 400_000 if status == "mfj" else 200_000
    excess = max(0.0, magi - thr)
    return max(0.0, gross - 50 * ceil(excess / 1_000))


def take_home_2026(gross_wages, status="single", *, sec125=0.0, deferral_401k=0.0,
                   qualified_tips=0.0, qualified_ot_premium=0.0,
                   n_seniors=0, n_children=0, itemized=0.0,
                   n_addl_std_conditions=0):
    fica_wages = gross_wages - sec125                  # 401(k) does NOT reduce this
    fica = employee_fica_2026(fica_wages, status)
    agi = gross_wages - sec125 - deferral_401k
    magi = agi                                          # no §911/931/933 assumed

    below_line = max(itemized, STD_DED_2026[status]
                     + ADDL_STD_2026[status] * n_addl_std_conditions)
    sched_1a = (tips_deduction_2026(qualified_tips, magi, status)
                + overtime_deduction_2026(qualified_ot_premium, magi, status)
                + senior_deduction_2026(magi, status, n_seniors))

    taxable = max(0.0, agi - below_line - sched_1a)
    tax = income_tax_2026(taxable, status)
    tax = max(0.0, tax - child_tax_credit_2026(n_children, magi, status))

    return {"agi": agi, "taxable_income": taxable, "federal_income_tax": tax,
            "fica": fica, "net": gross_wages - sec125 - deferral_401k
                                 - tax - fica["total"]}
```

---

## 11. Worked examples (verifiable to the cent)

All derived directly from the published Rev. Proc. 2025-32 tables and IRS Topic 751 rates.
The IRS does not publish per-taxpayer worked examples inside the Rev. Proc. itself; the
following are exact arithmetic on the authority's own schedules (a "gold" tie-out is the
2026 Form 1040 Tax Computation Worksheet, published with the 2026 Form 1040 instructions
in late 2026).

**A. Single, $60,000 gross wages, standard deduction, no dependents, no pre-tax**
- Taxable income = 60,000 − 16,100 = **43,900**
- Income tax = 1,240 + 0.12 × (43,900 − 12,400) = 1,240 + 3,780 = **$5,020.00**
- Social Security = 60,000 × 0.062 = **$3,720.00**
- Medicare = 60,000 × 0.0145 = **$870.00**
- Total FICA = **$4,590.00**; net = 60,000 − 5,020 − 4,590 = **$50,390.00**
- Effective federal income tax rate 8.37%; marginal 12%.

**B. Single, $100,000 gross wages, standard deduction**
- Taxable = 100,000 − 16,100 = **83,900**
- Income tax = 5,800 + 0.22 × (83,900 − 50,400) = 5,800 + 7,370 = **$13,170.00**
- FICA = 6,200 + 1,450 = **$7,650.00**; net = **$79,180.00**

**C. MFJ, $150,000 combined wages, standard deduction, 2 children under 17**
- Taxable = 150,000 − 32,200 = **117,800**
- Income tax = 11,600 + 0.22 × (117,800 − 100,800) = 11,600 + 3,740 = **$15,340.00**
- CTC = 2 × 2,200 = 4,400 (MAGI $150,000 < $400,000, no phaseout) → tax = **$10,940.00**
- FICA (split evenly, both below the SS cap) = 150,000 × 0.0765 = **$11,475.00**
- Net = 150,000 − 10,940 − 11,475 = **$127,585.00**

**D. Single, $250,000 gross wages, standard deduction — Additional Medicare Tax**
- Taxable = 250,000 − 16,100 = **233,900**
- Income tax = 41,024 + 0.32 × (233,900 − 201,775) = 41,024 + 10,280 = **$51,304.00**
- SS = min(250,000, 184,500) × 0.062 = **$11,439.00** (capped)
- Medicare = 250,000 × 0.0145 = **$3,625.00**
- Additional Medicare = (250,000 − 200,000) × 0.009 = **$450.00**
- Total FICA = **$15,514.00**; net = **$183,182.00**

**E. MFJ, $800,000 taxable income — top bracket sanity check**
- Income tax = 206,583.50 + 0.37 × (800,000 − 768,700) = 206,583.50 + 11,581.00 = **$218,164.50**

**F. Tips deduction phaseout — single, MAGI $172,400, $25,000 qualified tips**
- Excess = 172,400 − 150,000 = 22,400 → floor(22,400/1,000) = 22 steps
- Reduction = 22 × 100 = 2,200 → deduction = 25,000 − 2,200 = **$22,800**
- (Note the floor: MAGI $172,999 gives the identical 22 steps.)

**G. Overtime deduction — MFJ, MAGI $310,500, $30,000 of FLSA premium overtime**
- Cap = min(30,000, 25,000) = 25,000
- Excess = 10,500 → floor = 10 steps → reduction 1,000 → deduction = **$24,000**

**H. Senior deduction — MFJ, both spouses 67, MAGI $180,000**
- Excess = 180,000 − 150,000 = 30,000; per head = 6,000 − 0.06 × 30,000 = 6,000 − 1,800 = 4,200
- Deduction = 4,200 × 2 = **$8,400**
- Full stack for this couple: 32,200 std + 1,650 × 2 aged additional + 8,400 senior = **$43,900**

**I. Car loan interest — single, MAGI $104,200, $9,000 interest**
- Excess = 4,200 → **ceil**(4,200/1,000) = 5 steps → reduction = 5 × 200 = 1,000
- Deduction = min(9,000, 10,000) − 1,000 = **$8,000**
- (Contrast with tips/OT which floor. This asymmetry is real — Schedule 1-A line 28 says
  "increase to the next higher whole number", line 11/19 say "decrease to the next lower".)

**J. SALT phase-down — single, MAGI $560,000**
- Cap = 40,400 − 0.30 × (560,000 − 505,000) = 40,400 − 16,500 = **$23,900**
- Floor of $10,000 reached at MAGI = 505,000 + (30,400/0.30) = $606,333.33.

**K. AMT exemption phaseout — single, AMTI $600,000**
- Exemption = 90,100 − 0.50 × (600,000 − 500,000) = 90,100 − 50,000 = **$40,100**

---

## 12. Non-residents (one line, per scope)
Nonresident aliens file Form 1040-NR, are generally taxed on US-source income only, may
not use the standard deduction (India treaty students excepted), cannot use MFJ or HoH
rates, and are taxed at 30% (or a treaty rate) on FDAP income. Nonresident aliens on
F/J/M/Q visas are generally **exempt from FICA** on services performed within the visa's
purpose. Out of scope for this calculator.

## 13. State taxes
Not covered here — 41 states plus DC levy an individual income tax, 9 do not
(AK, FL, NV, NH, SD, TN, TX, WY, WA on wages). Some cities and counties (NYC, Yonkers,
much of OH/PA/IN, Kansas City, St. Louis, San Francisco payroll expense) levy local income
taxes. Several states also impose employee-paid payroll levies (CA SDI, NY/NJ/RI/HI TDI,
and paid-family-leave premiums in CA/CO/CT/MA/NJ/NY/OR/RI/WA/DE/MD/MN). These materially
change take-home and must be layered on separately.

---

## 14. Sources (all fetched 20 July 2026)
1. IRS Rev. Proc. 2025-32 — https://www.irs.gov/pub/irs-drop/rp-25-32.pdf (primary; brackets, standard deduction, EITC, AMT, CTC, FSA)
2. IRS newsroom — 2026 inflation adjustments incl. OBBBA — https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
3. IRS Form 1040-ES (2026) — https://www.irs.gov/pub/irs-pdf/f1040es.pdf (SS wage base, aged/blind, itemized haircut, charitable, gambling, CDCC)
4. IRS correction to 2026 Form 1040-ES SALT amount — https://www.irs.gov/forms-pubs/correction-to-state-and-local-income-tax-deduction-amount-in-the-2026-form-1040-es
5. IRS Schedule 1-A (Form 1040) — https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf (exact phaseout algorithms)
6. IRS Notice 2025-69 — https://www.irs.gov/pub/irs-drop/n-25-69.pdf (§224/§225 statutory detail, FLSA premium-only rule)
7. IRS Topic No. 751 — https://www.irs.gov/taxtopics/tc751 (FICA rates, $184,500 base)
8. IRS Q&A Additional Medicare Tax — https://www.irs.gov/businesses/small-businesses-self-employed/questions-and-answers-for-the-additional-medicare-tax
9. IRS — 401(k) limit increases to $24,500 for 2026 — https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500 (Notice 2025-67)
10. IRS — New and enhanced deductions for individuals — https://www.irs.gov/newsroom/new-and-enhanced-deductions-for-individuals
11. IRS — Working Families Tax Cuts, individuals and workers — https://www.irs.gov/newsroom/one-big-beautiful-bill-provisions-individuals-and-workers
12. IRS — Child Tax Credit — https://www.irs.gov/credits-deductions/individuals/child-tax-credit
13. Tax Foundation (corroboration only, for SALT phase-down mechanics and OBBBA framing) — https://taxfoundation.org/research/all/federal/one-big-beautiful-bill-act-tax-changes/

## 15. Caveats
- Every 2026 bracket, standard deduction, EITC, AMT and CTC figure is taken **verbatim from
  Rev. Proc. 2025-32**, downloaded and text-extracted in this session. High confidence.
- The **$25,000 tips / $12,500 overtime / $6,000 senior / $10,000 car-loan caps are NOT
  inflation-indexed for 2026** — they appear nowhere in Rev. Proc. 2025-32, confirming they
  remain at their statutory 2025 levels. (§224(b) indexing begins after 2026 per statute;
  §225 and the senior deduction are not indexed at all through 2028.)
- The **AMT 50% exemption phaseout rate** is inferred arithmetically from the published
  threshold/complete-phaseout pairs, not read as a stated percentage. The arithmetic is
  exact and self-consistent across all four filing statuses.
- The **SALT phase-down rate of 30% of excess** is from statute and secondary corroboration;
  the IRS $40,400 cap / $505,000 threshold / $10,000 floor figures are from the IRS
  correction notice directly. The 30% rate is the one number here resting partly on
  secondary sourcing — medium confidence on that coefficient alone.
- The **CTC $50-per-$1,000 phaseout rate** is long-standing §24(b)(2) statute; the IRS CTC
  page confirms the $200,000/$400,000 thresholds but does not restate the rate. Medium
  confidence on the rate, high on the thresholds.
- Worked examples are exact arithmetic on the authority's own schedules, not
  IRS-published example returns. The 2026 Form 1040 instructions (with the official Tax
  Table and Tax Computation Worksheet) publish around December 2026 — re-verify against
  them once available.
- **Withholding** (Publication 15-T percentage-method tables and the Form W-4 Step 2/3/4
  mechanics) is a separate annualisation algorithm from annual liability. A paycheck
  calculator that wants to match an actual paystub must implement Pub. 15-T, not the
  annual schedules. The 2026 Pub. 15-T percentage-method tables were not extracted here.
- 2026 is the first year the IRS asked employers to report qualified tips (W-2 box 12
  code "TP") and qualified overtime (box 12 code "TT"); 2025 had transition relief with
  no such reporting, so 2025 and 2026 behave differently for these deductions.
- QBI deduction (§199A): permanent at 20%, with a new **$400 minimum deduction** for
  taxpayers with at least $1,000 of active QBI beginning in 2026, and widened phase-in
  ranges. Out of scope for an employee calculator but noted.
- Social Security benefits are **not** exempt from tax despite political framing; OBBBA
  delivered the senior deduction instead. Up to 85% of benefits remain taxable under §86.
