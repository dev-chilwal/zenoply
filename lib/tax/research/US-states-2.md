# US-states-2 — 2026 State Income Tax Spec (FL, GA, HI, ID, IL, IN, IA, KS)

Research date: 20 July 2026. All eight states are **calendar-year**: the tax year in
effect on 20 July 2026 is **TY2026 = 1 Jan 2026 – 31 Dec 2026**.

Scope: resident employees. Federal tax, FICA (6.2% OASDI to the federal wage base +
1.45% Medicare + 0.9% Additional Medicare over $200k/$250k) is *federal* and applies in
all eight states — it is out of scope here except as a reminder that none of these states
levies its own employee-side social contribution **except Hawaii** (see HI §7).

---

## 1. FLORIDA

**Levies a personal income tax on wages? NO.**

- Florida has **no state individual income tax** on wages, salaries or any other personal
  income. The Florida Constitution, Art. VII §5(a), forbids the state from levying a tax
  "upon income" of natural persons without a constitutional amendment.
- Florida DOR's tax list contains **Corporate Income/Franchise Tax** but no individual
  income tax line — the state administers sales/use, reemployment (unemployment),
  documentary stamp, corporate income, etc.
- **No local/city income tax anywhere in Florida.**
- **Employee payroll deductions:** none at state level. Florida's reemployment
  (unemployment) tax is **100% employer-paid**; employees contribute nothing.
- Employer-side (for package-quoting only): reemployment tax, 2026 taxable wage base
  **$7,000** per employee, new-employer rate 2.7%.

**Implementation:** `stateTax(FL) = 0` for all filers, all income levels.

---

## 2. GEORGIA

**Flat tax. 2026 rate = 4.99%.** (Down from 5.19% in 2025.)

### Statutory change for 2026
HB 463, signed by Gov. Kemp **11 May 2026**, retroactive to taxable years beginning on or
after **1 Jan 2026**. Per the Georgia DOR *2026 Employer's Tax Guide* (updated June 2026):

> "The income tax rate has been reduced from a flat rate of 5.19% to a flat rate of 4.99%.
> Note: Employers must continue to withhold at the rate of 5.19% before the effective date
> of the change and can begin withholding at the new rate of 4.99%, starting May 11, 2026."

**A stale implementation using 5.19% will be wrong for the whole of TY2026.** The annual
liability is computed at 4.99% for the entire year; only *withholding* was allowed to lag
until 11 May 2026.

### 2026 rate
| Filing status | Rate |
|---|---|
| All (Single, MFJ, MFS, HOH) | **4.99%** flat on Georgia taxable income |

### 2026 standard deduction (raised by HB 463)
| Filing status | 2025 | **2026** |
|---|---|---|
| Married Filing Jointly | $24,000 | **$30,000** |
| Single | $12,000 | **$15,000** |
| Head of Household | $12,000 | **$15,000** |
| Married Filing Separately | $12,000 | **$15,000** |

### Dependent deduction
- **$5,000 per dependent** for 2026 (raised from $4,000).
- **Personal exemptions: $0** — abolished for individuals by HB 1437 (2022) when Georgia
  moved to a flat tax. Do not code a personal exemption.

### Formula
```
GA taxable income = GA AGI − standard deduction (or itemized) − ($5,000 × dependents)
GA tax = max(0, GA taxable income) × 0.0499
```

### Other 2026 items materially affecting employees
- **Tips exclusion:** up to **$1,750** of cash tips excludable, through TY2028.
- **Overtime exclusion:** up to **$1,750** of overtime pay excludable, through TY2028.
- **Retirement income exclusion:** $35,000 (age 62–64) / $65,000 (65+) per taxpayer;
  HB 463 raises the 65+ figure to $70,000 **beginning 2027** (not 2026).
- **Phase-down schedule:** HB 463 accelerates future cuts to **0.125 pp per year** (was
  0.10 pp) toward a **3.99% floor**, subject to revenue triggers. Expect 4.865% in 2027 if
  triggers are met — do not hard-code future years.
- Georgia decoupled from the federal SALT cap increase (stays at $10,000).

### Local income tax
**None.** No Georgia county or municipality levies an income/wage tax.

### Employee payroll contributions
**None.** Georgia UI tax is entirely employer-paid (2026 taxable wage base $9,500).

### Official worked example (GA DOR 2026 Employer's Tax Guide, Table E / percentage method)
Married, semi-monthly pay of $2,000.00, spouse not working, claiming 1 dependent:
| Step | Amount |
|---|---|
| Total taxable wages | $2,000.00 |
| Less standard deduction (Table E col. 1, semi-monthly MFJ) | −$1,250.00 |
| Less dependent allowance (Table E col. 4, semi-monthly) × 1 | −$208.33 |
| Wages subject to withholding | $541.67 |
| × 0.0499 | **$27.03** |

### Table E — 2026 withholding deduction constants (Georgia DOR)
| Payroll period | (1) MFJ | (2) Single/HOH | (3) MFS | (4) Per dependent |
|---|---|---|---|---|
| Weekly | 576.92 | 288.46 | 288.46 | 96.15 |
| Bi-weekly | 1,153.85 | 576.92 | 576.92 | 192.31 |
| Semi-monthly | 1,250.00 | 625.00 | 625.00 | 208.33 |
| Monthly | 2,500.00 | 1,250.00 | 1,250.00 | 416.67 |
| Quarterly | 7,500.00 | 3,750.00 | 3,750.00 | 1,250.00 |
| Semi-annual | 15,000.00 | 7,500.00 | 7,500.00 | 2,500.00 |
| Annual | 30,000.00 | 15,000.00 | 15,000.00 | 5,000.00 |
| Daily (misc.) | 82.19 | 41.10 | 41.10 | 13.70 |

Note: "Married couples, both having income, should use the standard deduction allowed in
column (3)."

---

## 3. HAWAII

**Progressive, 12 brackets, 1.40% – 11.00%.**

### What changed for 2026
Act 46, SLH 2024 ("Green Affordability Plan II"). Per DOTAX Announcement **2025-07**
(1 Dec 2025):

> "Act 46 increased the standard deduction amounts for tax year 2024, and amended the
> income tax brackets by increasing the income limits in each bracket for tax year 2025.
> **Act 46 additionally increases the standard deduction amounts for tax year 2026.**"

So for TY2026:
- **Brackets are UNCHANGED from 2025** (the bracket table applies to "any taxable year
  beginning after December 31, 2024"; the next bracket widening is "after December 31,
  2026", i.e. TY2027).
- **The standard deduction roughly doubles for 2026.** A stale implementation carrying the
  2025 standard deduction ($8,800 MFJ / $4,400 single) will be wrong.

### 2026 standard deduction — HRS §235-2.4(a)(2)(F), "for taxable years beginning after December 31, 2025"
| Filing status | 2025 | **2026** |
|---|---|---|
| MFJ / Qualifying surviving spouse | $8,800 | **$16,000** |
| Head of household | $6,424 | **$12,000** |
| Single | $4,400 | **$8,000** |
| Married filing separately | $4,400 | **$8,000** |
| Dependent's limited SD | greater of $500 or earned income | same |

(Next step-up: $18,000 / $13,500 / $9,000 for TY2028.)

### 2026 personal exemption — HRS §235-54
- **$1,144 per exemption.** Plus **one additional $1,144 exemption** for taxpayer and/or
  spouse aged 65+ during the taxable year. Exemption is $0 for an individual claimed as a
  dependent on another return.
- Hawaii does **not** index this; it has been $1,144 since 1985.

### 2026 tax rate schedules — HRS §235-51, table "after December 31, 2024"

**(A) Single, and married filing separately** — HRS §235-51(c)
| Taxable income | Tax |
|---|---|
| Not over $9,600 | 1.40% of taxable income |
| $9,600 – $14,400 | $134.00 + 3.20% over $9,600 |
| $14,400 – $19,200 | $288.00 + 5.50% over $14,400 |
| $19,200 – $24,000 | $552.00 + 6.40% over $19,200 |
| $24,000 – $36,000 | $859.00 + 6.80% over $24,000 |
| $36,000 – $48,000 | $1,675.00 + 7.20% over $36,000 |
| $48,000 – $125,000 | $2,539.00 + 7.60% over $48,000 |
| $125,000 – $175,000 | $8,391.00 + 7.90% over $125,000 |
| $175,000 – $225,000 | $12,341.00 + 8.25% over $175,000 |
| $225,000 – $275,000 | $16,466.00 + 9.00% over $225,000 |
| $275,000 – $325,000 | $20,966.00 + 10.00% over $275,000 |
| Over $325,000 | $25,966.00 + 11.00% over $325,000 |

**(B) Married filing jointly / surviving spouse** — HRS §235-51(a) (exactly 2× the single thresholds)
| Taxable income | Tax |
|---|---|
| Not over $19,200 | 1.40% of taxable income |
| $19,200 – $28,800 | $269.00 + 3.20% over $19,200 |
| $28,800 – $38,400 | $576.00 + 5.50% over $28,800 |
| $38,400 – $48,000 | $1,104.00 + 6.40% over $38,400 |
| $48,000 – $72,000 | $1,718.00 + 6.80% over $48,000 |
| $72,000 – $96,000 | $3,350.00 + 7.20% over $72,000 |
| $96,000 – $250,000 | $5,078.00 + 7.60% over $96,000 |
| $250,000 – $350,000 | $16,782.00 + 7.90% over $250,000 |
| $350,000 – $450,000 | $24,682.00 + 8.25% over $350,000 |
| $450,000 – $550,000 | $32,932.00 + 9.00% over $450,000 |
| $550,000 – $650,000 | $41,932.00 + 10.00% over $550,000 |
| Over $650,000 | $51,932.00 + 11.00% over $650,000 |

**(C) Head of household** — HRS §235-51(b) (1.5× single)
| Taxable income | Tax |
|---|---|
| Not over $14,400 | 1.40% of taxable income |
| $14,400 – $21,600 | $202.00 + 3.20% over $14,400 |
| $21,600 – $28,800 | $432.00 + 5.50% over $21,600 |
| $28,800 – $36,000 | $828.00 + 6.40% over $28,800 |
| $36,000 – $54,000 | $1,289.00 + 6.80% over $36,000 |
| $54,000 – $72,000 | $2,513.00 + 7.20% over $54,000 |
| $72,000 – $187,500 | $3,809.00 + 7.60% over $72,000 |
| $187,500 – $262,500 | $12,587.00 + 7.90% over $187,500 |
| $262,500 – $337,500 | $18,512.00 + 8.25% over $262,500 |
| $337,500 – $412,500 | $24,699.00 + 9.00% over $337,500 |
| $412,500 – $487,500 | $31,449.00 + 10.00% over $412,500 |
| Over $487,500 | $38,949.00 + 11.00% over $487,500 |

**Do not use the 2027 tables by mistake.** For reference, the TY2027 single table starts
"Not over $14,400 → 1.40%" and the TY2027 MFJ table starts "Not over $28,800 → 1.40%".

### 2026 withholding (Booklet A, effective 5 Dec 2025 for wages paid from 1 Jan 2026)
The withholding tables truncate at 7.90% (they do not carry the 8.25–11% brackets).
Annual payroll period, **single/unmarried HOH**:

| Wages after allowances | Withhold |
|---|---|
| $0 – $9,600 | 1.40% of excess over $0 |
| $9,600 – $14,400 | $134.00 + 3.20% over $9,600 |
| $14,400 – $19,200 | $288.00 + 5.50% over $14,400 |
| $19,200 – $24,000 | $552.00 + 6.40% over $19,200 |
| $24,000 – $36,000 | $859.00 + 6.80% over $24,000 |
| $36,000 – $48,000 | $1,675.00 + 7.20% over $36,000 |
| $48,000 – $125,000 | $2,539.00 + 7.60% over $48,000 |
| Over $125,000 | $8,391.00 + 7.90% over $125,000 |

Annual, **married**: $0–19,200 @1.40%; 19,200–28,800 $269+3.20%; 28,800–38,400 $576+5.50%;
38,400–48,000 $1,104+6.40%; 48,000–72,000 $1,718+6.80%; 72,000–96,000 $3,350+7.20%;
96,000–250,000 $5,078+7.60%; over $250,000 $16,782+7.90%.

Withholding allowance values 2026: **annual $1,144** per allowance; weekly $22.00,
biweekly $44.00, semi-monthly $47.67. Extra lump-sum withholding allowance: annual
$4,350 (single); weekly $83.65, biweekly $167.31, semi-monthly $181.25.

### Official worked example (Booklet A 2026, Part 1)
Single employee, one job, $500/week, 3 withholding allowances:
| Step | Amount |
|---|---|
| Annual wage $500 × 52 | $26,000.00 |
| Less 3 allowances × $1,144 | −$3,432.00 |
| Less extra lump-sum allowance | −$4,350.00 |
| Amount subject to withholding | $18,218.00 |
| Tax on first $14,400 | $288.00 |
| Tax on remaining $3,818 @ 5.5% | $209.99 |
| Annual withholding | $497.99 |
| Weekly ($497.99 ÷ 52) | **$9.58** |

### Local income tax
**None.** Hawaii has no county or city income tax.

### Employee-paid mandatory contributions (Hawaii is the exception among these eight)
- **Temporary Disability Insurance (TDI):** the employer may require the employee to
  contribute up to **0.5% of the employee's weekly wages**, capped at a **maximum weekly
  deduction** set annually by the DLIR Disability Compensation Division. Employer may also
  pay the whole cost. (The 2026 maximum weekly deduction figure could not be retrieved
  from an official page in this session — see caveats.)
- **Prepaid Health Care Act:** employee premium share capped at **1.5% of gross monthly
  wages** (employer must pay the rest of the single-coverage premium).
- **Unemployment insurance: employer-only**, no employee contribution.

---

## 4. IDAHO

**Flat tax on Idaho taxable income above a zero-bracket threshold. 2026 rate = 5.3%.**

- HB 40 (signed 6 Mar 2025) cut the rate from 5.695% to **5.3%**, retroactive to 1 Jan 2025.
- **No further rate cut was enacted in Idaho's 2026 session.** The 2026 session's main
  income-tax bill was **HB 559** (signed 11 Feb 2026), which conforms Idaho to the federal
  One Big Beautiful Bill Act — adopting most federal provisions including the no-tax-on-tips
  and no-tax-on-overtime deductions. It did **not** change the rate.
- 5.3% therefore applies for TY2026.

### Structure
Idaho starts from **federal taxable income** (Idaho standard deduction = federal standard
deduction; Idaho has no separate standard deduction and **no personal exemption**), then
applies a zero-bracket: income up to an indexed threshold is taxed at 0%, everything above
at 5.3%.

| Filing status | 2025 zero-bracket ceiling | Rate above |
|---|---|---|
| Single / MFS | $1 – $4,811 taxed at 0.0% | 5.3% |
| MFJ / HOH | $1 – $9,622 taxed at 0.0% | 5.3% |

**2026 thresholds are not yet published** by the Idaho State Tax Commission (its rate
schedule page still stops at TY2025, last updated 29 Dec 2025). They are inflation-indexed
and will rise modestly. See caveats.

### Formula
```
ID taxable income = federal taxable income ± Idaho additions/subtractions
ID tax = max(0, ID taxable income − zeroBracketCeiling) × 0.053
```

### 2026 withholding (Idaho percentage-computation method, EPB00744)
The currently published table (rev. 04-28-2025, still the live version) uses:
| Payroll period | Single threshold | Married threshold | Rate above |
|---|---|---|---|
| Annual | $15,000 | $30,000 | 5.3% |
| Monthly | $1,250 | $2,500 | 5.3% |
| Semi-monthly | $625 | $1,250 | 5.3% |
| Bi-weekly | $577 | $1,154 | 5.3% |
| Weekly | $288 | $577 | 5.3% |
| Daily | $58 | (2× single) | 5.3% |

(These thresholds equal the 2025 federal standard deduction. Idaho had not republished
these for 2026 as of 20 Jul 2026 — see caveats.)

### Credits materially affecting an employee
- **Grocery credit:** a per-person refundable credit for Idaho residents, claimed on the
  return (**$155 per person** under HB 231 of 2023, with an additional $20 for residents
  aged 65+; verify the 2026 amount).
- Child tax credit $205 per qualifying child (non-refundable).

### Local income tax
**None.** No Idaho city or county levies an income tax.

### Employee payroll contributions
**None.** Idaho UI is employer-only.

---

## 5. ILLINOIS

**Flat tax. 2026 rate = 4.95%** — unchanged. Illinois' constitution (Art. IX §3(a))
requires a non-graduated income tax, so no bracket table exists for any filer.

Confirmed by IL DOR **2026 Booklet IL-700-T** (R-12/25), effective 1 Jan 2026:
> "Tax rate 4.95%" … "The income tax rate is 4.95 percent and the exemption allowance is $2,925."

### What changed for 2026
The **exemption allowance rose from $2,850 (2025) to $2,925 (2026)** — it is
inflation-indexed annually. This is the only number a stale implementation is likely to get
wrong for Illinois.

| Item | 2025 | **2026** |
|---|---|---|
| Rate | 4.95% | **4.95%** |
| Personal exemption allowance (per person) | $2,850 | **$2,925** |

### Exemptions
- **$2,925 per person** — taxpayer, spouse, and each dependent. (MFJ with 2 children =
  4 × $2,925 = $11,700.)
- **Additional $1,000** exemption for each of: taxpayer 65+, spouse 65+, taxpayer legally
  blind, spouse legally blind. (Form IL-1040 Line 10b: "Multiply the number of boxes checked
  by $1,000.")
- **Income cut-off:** the exemption allowance is **not available** if federal AGI exceeds
  **$500,000 (MFJ)** or **$250,000 (all other filing statuses)**. Same cut-off applies to
  the property tax credit and the K-12 education expense credit.
- Illinois has **no standard deduction**.

### Formula
```
IL base income = federal AGI + additions − subtractions (Sched. M)
   [Illinois does NOT tax retirement income: 401(k)/IRA distributions, pensions,
    Social Security and railroad retirement are subtracted]
IL net income = IL base income − exemption allowance
                (exemption allowance = 0 if federal AGI > $250k single / $500k MFJ)
IL tax = max(0, IL net income) × 0.0495
```

### 2026 withholding
Employer method: subtract the employee's IL-W-4 allowances (each worth $2,925/yr basic and
$1,000/yr additional, prorated per pay period) from wages, multiply by 4.95%.

### Credits materially affecting an employee
- **Illinois EITC** — a percentage of the federal EITC (20% for recent years; see caveats),
  refundable; also available to filers who did not qualify federally.
- **Child Tax Credit** — **40% of the taxpayer's Illinois EITC**, for filers with at least
  one dependent child under 12. (2025 figure per FY 2026-15; confirm for 2026.)
- **Property tax credit** — 5% of Illinois property tax paid on your principal residence,
  non-refundable, subject to the $250k/$500k AGI cut-off.
- **K-12 education expense credit** — 25% of qualified expenses over $250, max $750,
  subject to the same AGI cut-off.

### Local income tax
**None.** No Illinois municipality (including Chicago) levies an income or wage tax on
employees. Chicago's "head tax" on employers was abolished in 2014.

### Reciprocity (affects withholding, not liability)
Illinois has reciprocal agreements with **Iowa, Kentucky, Michigan and Wisconsin**: wages
of residents of those states earned in Illinois are not taxed by Illinois, and Illinois
residents working in those states are taxed by Illinois only.

### Employee payroll contributions
**None.** Illinois UI is employer-only.

---

## 6. INDIANA

**Flat tax. 2026 state rate = 2.95%** (down from 3.00% in 2025), **plus a mandatory county
income tax**.

Confirmed by Indiana DOR **Departmental Notice #1, effective Jan. 1, 2026 (R46 / 01-26)**:
> "For 2026, the state adjusted gross income tax rate for individuals is 2.95%."

### Phase-down (SEA 1 of 2022, as amended)
3.23% (2022) → 3.15% (2023–24) → 3.05% (2025 statutory, DOR notice uses 3.00%) →
**2.95% (2026)** → 2.90% (2027 and after). **A stale implementation using 3.00% or 3.05%
will be wrong for 2026.**

### County income tax (LIT) — mandatory, all 92 counties
Rate is set by the county of **residence as of 1 January** of the tax year (or, for
non-Indiana residents, the county of principal work as of 1 January). 2026 rates range from
**0.5% (Porter) to 3.00% (Randolph)**. Full 2026 table (Departmental Notice #1):

| County | Rate | County | Rate |
|---|---|---|---|
| Adams | 1.60% | Lawrence | 1.75% |
| Allen | 1.59% | Madison | 2.25% |
| Bartholomew | 1.75% | Marion (Indianapolis) | **2.02%** |
| Benton | 1.79% | Marshall | 1.25% |
| Blackford | 2.50% | Martin | 2.50% |
| Boone | 1.70% | Miami | 2.54% |
| Brown | 2.5234% | Monroe | 2.14% |
| Carroll | 2.4733% | Montgomery | 2.65% |
| Cass | 2.95% | Morgan | 2.72% |
| Clark | 2.00% | Newton | 1.00% |
| Clay | 2.35% | Noble | 1.75% |
| Clinton | 2.65% | Ohio | 2.00% |
| Crawford | 1.65% | Orange | 1.75% |
| Daviess | 1.50% | Owen | 2.50% |
| Dearborn | 1.40% | Parke | 2.65% |
| Decatur | 2.45% | Perry | 1.40% |
| DeKalb | 2.13% | Pike | 1.20% |
| Delaware | 1.50% | Porter | **0.50%** (lowest) |
| Dubois | 1.20% | Posey | 1.45% |
| Elkhart | 2.00% | Pulaski | 2.85% |
| Fayette | 2.82% | Putnam | 2.30% |
| Floyd | 1.89% | Randolph | **3.00%** (highest) |
| Fountain | 2.10% | Ripley | 2.38% |
| Franklin | 1.70% | Rush | 2.15% |
| Fulton | 2.88% | St. Joseph | 1.75% |
| Gibson | 1.30% | Scott | 2.16% |
| Grant | 2.75% | Shelby | 1.70% |
| Greene | 2.35% | Spencer | 0.80% |
| Hamilton | 1.10% | Starke | 1.71% |
| Hancock | 1.94% | Steuben | 1.99% |
| Harrison | 1.00% | Sullivan | 1.70% |
| Hendricks | 1.70% | Switzerland | 1.45% |
| Henry | 2.02% | Tippecanoe | 1.28% |
| Howard | 2.35% | Tipton | 2.60% |
| Huntington | 1.95% | Union | 2.75% |
| Jackson | 2.10% | Vanderburgh | 1.25% |
| Jasper | 2.864% | Vermillion | 1.50% |
| Jay | 2.50% | Vigo | 2.00% |
| Jefferson | 1.03% | Wabash | 2.90% |
| Jennings | 2.50% | Warren | 2.12% |
| Johnson | 1.40% | Warrick | 1.00% |
| Knox | 1.70% | Washington | 2.00% |
| Kosciusko | 1.00% | Wayne | 1.25% |
| LaGrange | 1.65% | Wells | 2.10% |
| Lake | 1.50% | White | 2.32% |
| LaPorte | 1.45% | Whitley | 1.6829% |

Combined 2026 state + county burden therefore runs **3.45% – 5.95%**.

### Exemptions (Indiana has NO standard deduction)
| Item | Annual amount |
|---|---|
| Personal exemption (taxpayer, spouse) | **$1,000** each |
| Additional exemption, taxpayer/spouse 65+ and/or blind | **$1,000** each |
| Dependent exemption | **$1,500** each |
| Supplemental first-time dependent exemption (first year claimed) | **$1,500** each |
| Adopted-child dependent exemption | **$3,000** each |

### Formula
```
IN AGI = federal AGI + Indiana add-backs − Indiana deductions
IN taxable income = IN AGI − total exemptions (above)
state tax  = max(0, IN taxable income) × 0.0295
county tax = max(0, IN taxable income) × countyRate(county of residence on 1 Jan)
total      = state tax + county tax
```

### 2026 withholding deduction constants (Departmental Notice #1)
Table A ($1,000/exemption): Daily 2.74 / Weekly 19.23 / Bi-weekly 38.46 / Semi-monthly 41.67 / Monthly 83.33 (per exemption).
Table B ($1,500/dependent): Daily 4.11 / Weekly 28.85 / Bi-weekly 57.69 / Semi-monthly 62.50 / Monthly 125.00 (per dependent).
Table C ($3,000/adopted child): Daily 8.22 / Weekly 57.69 / Bi-weekly 115.38 / Semi-monthly 125.00 / Monthly 250.00 (per child).

### Official worked example (Departmental Notice #1, 2026)
Employee paid **$800 weekly**, county rate 0.01, claiming 5 personal exemptions,
3 additional dependent exemptions, 1 first-time additional dependent exemption and
2 adopted-child dependent exemptions:
| Step | Amount |
|---|---|
| Table A constant (5 exemptions, weekly) | $96.15 |
| Table B constant (3 additional dependents) | +$86.54 |
| Table B constant (1 first-time dependent) | +$28.85 |
| Table C constant (2 adopted children) | +$115.38 |
| Total deduction constant | $326.92 |
| Taxable income for the period ($800.00 − $326.92) | **$473.08** |
| State tax @ 2.95% | $13.96 |
| County tax @ 1.00% | $4.73 |

### 30-day rule
For withholding on or after 1 Jan 2024, an employer need not withhold Indiana state or
county tax for an employee who will work in Indiana **30 days or fewer** in the taxable year.

### Employee payroll contributions
**None.** Indiana UI is employer-only.

---

## 7. IOWA

**Flat tax. 2026 rate = 3.8%** — unchanged from 2025.

Confirmed by IDR press release "IDR Announces 2026 Individual Income Tax and Interest
Rates" (21 Oct 2025) and by the **2026 IA 1040ES** instructions
(form 45-009a, 08/29/2025), line 4: *"Multiply line 3 by 3.8% (.038)."*

Under SF 2442 (May 2024) the phase-down finished: 6.00% (2023) → 4.82% (2024) → **3.80%
(2025 and thereafter)**. There are no brackets and no filer-status distinction.

### Base — this is the unusual part
Iowa starts from **federal taxable income**, i.e. *after* the federal standard or itemized
deduction, then applies Iowa modifications. 2026 IA 1040ES traditional worksheet:
```
1. Federal taxable income
2. Iowa modifications to federal taxable income
3. Iowa taxable income = 1 + 2
4. Tax = line 3 × 3.8%
5. + Iowa lump-sum tax
6. = total tax
7. − credits (personal & dependent exemption credits, tuition & textbook credit,
     firefighter/EMS/reserve peace officer credit)
```
**Implication:** Iowa's effective "standard deduction" is the **federal** standard deduction
(2026: roughly $16,100 single / $32,200 MFJ under OBBBA indexing — take the federal figure
from your federal module, do not hard-code an Iowa-specific one).

### Exemption credits
Credits (subtracted from tax, not income): **$40 per personal exemption** ($40 single /
$80 MFJ), **$40 per dependent**, plus additional $20 credits for 65+/blind.
*(Medium confidence — see caveats.)*

### Low-income exemption from tax (2026, IA 1040ES)
| Situation | Fully exempt if Iowa taxable income ≤ |
|---|---|
| Under 65, single or MFS | **$9,000** (and not claimed as a dependent) |
| Under 65, any other status | **$13,500** combined |
| 65 or older, single | **$24,000** |
| 65 or older, any other status | **$32,000** combined |

Only one spouse need be 65+. MFS filers: if combined income exceeds $13,500 neither
qualifies. Standard/itemized deduction, NOL carryover, QBI deduction and lump-sum
distributions must be **added back** when testing eligibility.

### 2026 withholding formula (IDR, effective 1 Jan 2026, released Nov 2025)
Revised for 2026 to reflect the OBBBA-driven change to the standard/itemized deductions.
Four steps: T1 = G − D, then apply the rate table, then subtract allowance credits.

**Deduction amounts D (for a 2024/2025/2026 IA W-4):**
| Payroll period | (A) Other, or MFJ w/ spouse earning | (B) Head of household | (C) MFJ, spouse not earning / QSS |
|---|---|---|---|
| Daily | $50.00 | $75.00 | $100.00 |
| Weekly | $250.00 | $375.00 | $500.00 |
| Bi-weekly | $500.00 | $750.00 | $1,000.00 |
| Semi-monthly | $541.67 | $812.50 | $1,083.33 |
| Monthly | $1,083.33 | $1,625.00 | $2,166.67 |
| **Annual** | **$13,000.00** | **$19,500.00** | **$26,000.00** |

For an IA W-4 dated 2023 or earlier: Single $13,000 annual, Married $26,000 annual (same
per-period values as columns A and C).

Note the withholding deduction is **not** the federal standard deduction — IDR says so
explicitly: *"the deduction amount in this calculation step is not the same as the federal
standard deduction amount."*

### Official worked example (2026 IA 1040ES)
> "The taxable income of a single taxpayer is $24,000. The calculation = $24,000 × 3.8%
> (.038). The result = **$912.00**."

### Local income tax — Iowa DOES have one
- **School district surtax:** most Iowa school districts levy a surtax expressed as a
  **percentage of state income tax liability**, commonly **0% – 20%** depending on the
  district of residence on 31 December. It is collected on the IA 1040, not withheld.
- **Emergency Medical Services (EMS) income surtax:** a small number of counties levy an
  additional surtax on state tax liability, on the same basis.
- Practical modelling: `localTax = stateTax × surtaxRate(schoolDistrict)`, default 0% and
  allow the user to enter a district rate up to ~20%.

### Employee payroll contributions
**None.** Iowa UI is employer-only.

---

## 8. KANSAS

**Progressive, two brackets: 5.20% and 5.58%.** Unchanged for 2026.

Set by **Senate Bill 1 of the 2024 Special Legislative Session** (June 2024), which
collapsed the old three-bracket schedule (3.1% / 5.25% / 5.7%) into two brackets, raised
the standard deduction and sharply raised the personal exemption — retroactive to TY2024
and "all tax years thereafter". No further rate change has been enacted for 2026.

### 2026 tax computation schedule
**Single, Head of Household, or Married Filing Separately**
| Kansas taxable income | Tax |
|---|---|
| $0 – $23,000 | 5.20% of taxable income |
| $23,001 and over | (taxable income × 5.58%) − **$87** |

**Married Filing Jointly**
| Kansas taxable income | Tax |
|---|---|
| $0 – $46,000 | 5.20% of taxable income |
| $46,001 and over | (taxable income × 5.58%) − **$175** |

(The subtraction constants are Kansas' own formulation and give exactly the same result as
a marginal computation: $23,000 × (5.58% − 5.20%) = $87.40 ≈ $87;
$46,000 × 0.38% = $174.80 ≈ $175. Use Kansas' rounded constants to match the state's
worksheet to the cent.)

### Standard deduction
| Filing status | Amount |
|---|---|
| Single | **$3,605** |
| Married Filing Jointly | **$8,240** |
| Head of Household | **$6,180** |
| Married Filing Separately | **$4,120** |

Additional amounts apply for taxpayers 65 or older and/or blind (K-40 worksheet).
These are the amounts published for TY2025; SB 1 provides an annual cost-of-living
adjustment, and Kansas had not yet published a TY2026 figure as of 20 Jul 2026 — see caveats.

### Personal exemption allowance
| Filing status | Amount |
|---|---|
| Married Filing Jointly | **$18,320** (2 × $9,160) |
| Single / HOH / MFS | **$9,160** |
| Additional HOH allowance | **+$2,320** |
| Each dependent | **+$2,320** |
| Each child born in the tax year (additional) | **+$2,320** |
| Stillbirth in the tax year | **+$2,320** |
| Each qualified disabled veteran | **+$2,320** |

### Formula
```
KS AGI            = federal AGI ± Kansas modifications
KS taxable income = KS AGI − standard deduction (or itemized) − total exemption allowance
KS tax            = per the two-bracket schedule above
                    less: credit for taxes paid to other states, child & dependent care
                          credit, other non-refundable credits
                    less: Kansas EITC (17% of the federal EITC, refundable)
```

### Filing thresholds (TY2025 basis)
Single under 65: $12,765 · Single 65+ or blind: $13,615 · Single 65+ and blind: $14,465 ·
MFJ both under 65: $26,560 · MFJ one spouse 65+ or blind: $27,260 · MFJ both 65+ or blind:
$27,960 · MFJ both 65+ and blind: $29,360.

### 2026 withholding — percentage formula (KW-100, Rev. 10-24, still current)
Withholding allowance amount = personal exemption ÷ number of pay periods.
Semi-monthly rate tables:
| Single/HOH, wages after allowance | Withhold |
|---|---|
| $0 – $150 | $0 |
| $150 – $1,109 | 5.2% of excess over $150 |
| Over $1,109 | $49.83 + 5.58% of excess over $1,109 |

| Married, wages after allowance | Withhold |
|---|---|
| $0 – $343 | $0 |
| $343 – $2,260 | 5.2% of excess over $343 |
| Over $2,260 | $99.67 + 5.58% of excess over $2,260 |

Annual equivalents: Single $0–$3,605 → $0; $3,605–$26,605 → 5.2% over $3,605;
over $26,605 → $1,196.00 + 5.58% over $26,605.
Married $0–$8,240 → $0; $8,240–$54,240 → 5.2% over $8,240;
over $54,240 → $2,392.00 + 5.58% over $54,240.
(These confirm SD $3,605/$8,240 and bracket break $23,000/$46,000.)

### Official worked example (KW-100)
Esmeralda Espinoza, paid **$2,000 semi-monthly**, married, one dependent, spouse has no
income, K-4 claiming three withholding allowances:
| Step | Amount |
|---|---|
| Allowances: $9,160 + $9,160 + $2,320 (dependent) | $20,640 |
| ÷ 24 pay periods | $860.00 |
| Net payment: $2,000 − $860 | $1,140.00 |
| Less bracket floor $343 | $797.00 |
| × 5.2% | **$41.44** (may be rounded to $41) |

### Local income tax
**No local wage/income tax.** Kansas counties may levy a **local intangibles tax** (up to
3%) on interest and dividend income only — it does **not** touch wages and can be ignored
in a take-home-pay calculator.

### Employee payroll contributions
**None.** Kansas UI is employer-only.

---

## 9. Quick reference — implementer's cheat sheet

| State | Type | 2026 rate(s) | Standard deduction (S / MFJ) | Personal exemption | Local income tax |
|---|---|---|---|---|---|
| **FL** | none | 0 | n/a | n/a | none |
| **GA** | flat | **4.99%** (was 5.19%) | $15,000 / $30,000 | none; $5,000/dependent | none |
| **HI** | 12 brackets | 1.40%–11.00% | **$8,000 / $16,000** (doubled) | $1,144/exemption | none |
| **ID** | flat + zero bracket | **5.3%** | = federal SD | none | none |
| **IL** | flat | **4.95%** | none | **$2,925**/person (was $2,850) | none |
| **IN** | flat + county | **2.95%** (was 3.00%) + county 0.50%–3.00% | none | $1,000 / $1,500 dep. | **county LIT, all 92** |
| **IA** | flat | **3.8%** | = federal SD (starts from federal taxable income) | $40 credit | **school-district surtax, ≈0–20% of state tax** |
| **KS** | 2 brackets | **5.20% / 5.58%** at $23k (S) / $46k (MFJ) | $3,605 / $8,240 | **$9,160 / $18,320**, +$2,320/dep | none |

### The five numbers most likely to be stale in an existing implementation
1. **GA 5.19% → 4.99%** (HB 463, retroactive to 1 Jan 2026).
2. **IN 3.00% → 2.95%** (statutory phase-down).
3. **HI standard deduction $4,400/$8,800 → $8,000/$16,000** (Act 46 step for 2026).
4. **IL exemption $2,850 → $2,925** (annual indexation).
5. **IN county LIT rates** — six counties changed for 2026 (asterisked in DN#1: Carroll,
   Grant, Greene, Howard, Shelby, Union).

### Non-resident note (one line per the brief)
All seven taxing states here tax non-residents only on state-source income, apportioned by
an Iowa/Idaho/Hawaii/Kansas-style Iowa-source or Idaho-source percentage; Illinois exempts
wages of IA/KY/MI/WI residents under reciprocity, and Indiana exempts employees present
30 days or fewer.
