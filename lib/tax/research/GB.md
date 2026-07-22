# United Kingdom — Personal Income Tax & Employee Payroll Deductions
## Tax year 2026-27 (6 April 2026 → 5 April 2027) — in effect on 20 July 2026

All figures confirmed against HMRC / gov.uk / gov.scot in this session (July 2026).

---

## 0. Tax year & jurisdiction model

- UK tax year runs **6 April to 5 April**. The year in effect on 20 July 2026 is **2026-27 = 6 April 2026 to 5 April 2027**. (gov.uk/income-tax-rates: "The current tax year is from 6 April 2026 to 5 April 2027.")
- Income tax on **non-savings, non-dividend (NSND) earned income** is devolved in part:
  - **Scotland** — Scottish Parliament sets all rates and bands. 6 bands.
  - **Wales** — Welsh Rates of Income Tax (WRIT). UK rates are reduced 10p in each band and Wales adds back 10p. For 2026-27 Wales set 10p in every band, so **Welsh rates are identical to England/NI**.
  - **England & Northern Ireland** — UK rates.
- The **Personal Allowance is UK-wide** (reserved to Westminster), £12,570, and applies identically in Scotland.
- **National Insurance and student loans are UK-wide** — not devolved. Same everywhere.
- Residence for Scottish/Welsh rates is determined by where the taxpayer's **main place of residence** is, not where they work. HMRC flags this with an **S** or **C** prefix on the tax code (e.g. `S1257L`, `C1257L`).

---

## 1. Personal Allowance

| Item | 2026-27 |
|---|---|
| Personal Allowance (PA) | **£12,570** |
| PA taper threshold (adjusted net income) | **£100,000** |
| Taper rate | **£1 lost for every £2** above £100,000 |
| PA fully extinguished at | **£125,140** |
| Marriage Allowance (transferable) | **£1,260** (10% of PA) |
| Blind Person's Allowance | **£3,250** (up from £3,130 in 2025-26) |
| Personal Savings Allowance — basic rate | £1,000 |
| Personal Savings Allowance — higher rate | £500 |
| Personal Savings Allowance — additional rate | £0 |
| Starting rate for savings | £5,000 @ 0% |
| Dividend Allowance | £500 |
| Trading allowance / Property allowance | £1,000 each |

**Taper formula:**
```
PA(ANI) = 12570                          if ANI <= 100000
        = max(0, 12570 - (ANI - 100000)/2)  if ANI > 100000
        = 0                              if ANI >= 125140
```

The PA and the basic rate limit are **frozen at these values through 2027-28** (confirmed by HMRC policy paper on thresholds 6 Apr 2026 → 5 Apr 2028), with CPI indexation expected to resume after.

### Marriage Allowance mechanics
- Transferor must have income ≤ £12,570 (below PA); recipient must be a **basic-rate** taxpayer (Scotland: starter, basic or intermediate rate).
- Transferor's PA reduces by £1,260 → £11,310. Recipient gets a **tax reducer of £1,260 × 20% = £252**. Not an increase in the recipient's allowance.
- Scotland: the reducer is still **20%** (£252), not the Scottish band rate.

---

## 2. Income tax — England, Wales & Northern Ireland ("rUK")

Applied to **taxable income = gross income − Personal Allowance**.

| Band | Rate | Taxable income slice | Equivalent gross income (std PA) |
|---|---|---|---|
| Personal Allowance | 0% | £0 – £12,570 (of gross) | £0 – £12,570 |
| Basic rate | **20%** | £0 – £37,700 | £12,571 – £50,270 |
| Higher rate | **40%** | £37,701 – £125,140 | £50,271 – £125,140 |
| Additional rate | **45%** | over £125,140 | over £125,140 |

**Note the band boundary quirk:** the additional-rate threshold is defined on **gross** income at £125,140, not on taxable income. In taxable-income terms with a full PA the 40% band runs £37,700 → £112,570 wide. Because PA is fully tapered away by £125,140, gross £125,140 = taxable £125,140. Implement as:

```
taxable = max(0, gross - PA(gross))
tax = 0.20 * min(taxable, 37700)
    + 0.40 * max(0, min(taxable, 112570) - 37700)
    + 0.45 * max(0, taxable - 112570)
```
This is exact for all incomes including the taper zone.

### The 60% effective-rate trap (£100,000 – £125,140)
Between £100,000 and £125,140 each extra £1 of income costs 40p tax on the pound itself plus 40p on the 50p of allowance lost = **60% marginal income tax**, plus 2% NI = **62% marginal deduction rate**. A take-home calculator must show this correctly.

---

## 3. Income tax — Scotland (6 bands)

Applied to **taxable income = gross income − Personal Allowance** (PA still £12,570, UK-set, with the same £100k taper).

| Band | Rate | Taxable income slice | Gross income range (std PA) |
|---|---|---|---|
| Personal Allowance | 0% | — | £0 – £12,570 |
| **Starter** | **19%** | £0 – £3,967 | £12,571 – £16,537 |
| **Basic** | **20%** | £3,968 – £16,956 | £16,538 – £29,526 |
| **Intermediate** | **21%** | £16,957 – £31,092 | £29,527 – £43,662 |
| **Higher** | **42%** | £31,093 – £62,430 | £43,663 – £75,000 |
| **Advanced** | **45%** | £62,431 – £112,570 | £75,001 – £125,140 |
| **Top** | **48%** | over £112,570 | over £125,140 |

**2026-27 changes vs 2025-26:** the Starter and Basic band limits were uprated by 7.4% (starter top £16,537 from £15,397; basic top £29,526 from £27,491). The Higher (£43,662), Advanced (£75,000) and Top (£125,140) thresholds are **frozen** — unchanged from 2025-26. An implementation carrying over 2025-26 Scottish numbers will be wrong for everyone earning above ~£15,400.

```
taxable = max(0, gross - PA(gross))
cuts  = [3967, 16956, 31092, 62430, 112570]
rates = [0.19, 0.20, 0.21, 0.42, 0.45, 0.48]
tax = sum over slices
```

### Scottish marginal-rate ladder (income tax + NI, employee)
| Gross band | Income tax | Employee NI | Combined marginal |
|---|---|---|---|
| £12,571 – £16,537 | 19% | 8% | 27% |
| £16,538 – £29,526 | 20% | 8% | 28% |
| £29,527 – £43,662 | 21% | 8% | 29% |
| £43,663 – £50,270 | 42% | 8% | **50%** |
| £50,271 – £75,000 | 42% | 2% | 44% |
| £75,001 – £100,000 | 45% | 2% | 47% |
| £100,001 – £125,140 | 45% + PA taper = **67.5%** | 2% | **69.5%** |
| over £125,140 | 48% | 2% | 50% |

The £43,663 – £50,270 zone is Scotland-specific: the Scottish higher rate (42%) starts at £43,662 but the UK-wide NI Upper Earnings Limit is still £50,270, so 8% NI overlaps with 42% tax. A calculator that assumes NI drops to 2% at the higher-rate threshold will be wrong for Scots.

### rUK ↔ Scotland comparison (verified)
| Gross | rUK tax | Scottish tax | Scot difference |
|---|---|---|---|
| £20,000 | £1,486.00 | £1,446.33 | −£39.67 |
| £25,782 | £2,642.40 | £2,602.73 | −£39.67 |
| £30,000 | £3,486.00 | £3,451.07 | −£34.93 |
| £31,136 | £3,713.20 | £3,689.63 | −£23.57 |
| £45,000 | £6,486.00 | £6,882.05 | +£396.05 |
| £50,270 | £7,540.00 | £9,095.45 | +£1,555.45 |
| £60,000 | £11,432.00 | £13,182.05 | +£1,750.05 |
| £100,000 | £27,432.00 | £30,732.05 | +£3,300.05 |
| £125,140 | £43,144.50 | £48,078.65 | +£4,934.15 |
| £150,000 | £54,331.50 | £60,011.45 | +£5,679.95 |

The £25,782, £31,136 and £45,000 rows correspond exactly to gov.scot's own published comparison figures (£40 better off, £24 better off, £396 worse off) — see Worked Examples.

---

## 4. Employee National Insurance — Class 1 (UK-wide)

### Thresholds 2026-27

| Threshold | Weekly | Monthly | Annual |
|---|---|---|---|
| Lower Earnings Limit (LEL) | £129 | £559 | £6,708 |
| **Primary Threshold (PT)** | **£242** | **£1,048** | **£12,570** |
| Secondary Threshold (ST, employer) | £96 | £417 | **£5,000** |
| **Upper Earnings Limit (UEL)** | **£967** | **£4,189** | **£50,270** |
| Upper Secondary Threshold (UST / AUST / VUST) | £967 | £4,189 | £50,270 |

⚠️ **Do not derive annual thresholds by multiplying weekly × 52.** That gives PT £12,584 and UEL £50,384 — both wrong. HMRC's published annual figures are PT £12,570 and UEL £50,270 (aligned to the PA and higher-rate threshold). The weekly/monthly figures are separately rounded.

### Employee (primary) rates — category A (standard)

| Slice of earnings | Rate |
|---|---|
| Up to PT (£242/wk, £1,048/mth, £12,570/yr) | **0%** |
| PT → UEL | **8%** |
| Above UEL | **2%** |

```
NI_employee = 0.08 * max(0, min(pay, UEL) - PT)
            + 0.02 * max(0, pay - UEL)
```

Employee NI is **not** reduced by the PA taper, and there is **no annual cap** — the 2% above UEL is uncapped.

### NI category letters (employee rate PT→UEL / above UEL)

| Letter | Who | Employee PT→UEL | Employee >UEL | Employer |
|---|---|---|---|---|
| **A** | Standard — all employees not in another group | 8% | 2% | 15% above ST |
| **B** | Married women / widows with a valid reduced-rate election | **1.85%** | 2% | 15% above ST |
| **C** | Over State Pension age | **0%** | 0% | 15% above ST |
| **H** | Apprentice under 25 | 8% | 2% | 0% up to AUST, 15% above |
| **J** | Deferment (has another job) | **2%** | 2% | 15% above ST |
| **M** | Under 21 | 8% | 2% | 0% up to UST, 15% above |
| **V** | Veteran in first civilian job post-service | 8% | 2% | 0% up to VUST, 15% above |
| **Z** | Under 21 with deferment | **2%** | 2% | 0% up to UST, 15% above |
| **X** | Exempt (e.g. under 16) | 0% | 0% | 0% |
| F, I, L, S | Freeport special tax site equivalents of A, B, M, Z | as base letter | as base | 0% up to £25,000 FUST |
| N, E, D, K | Investment Zone special tax site equivalents | as base letter | as base | 0% up to £25,000 FUST |

For an ordinary take-home calculator, **category A is the default**; offer C (state pension age) and M (under 21) as options since they materially change the answer. Category C means zero employee NI — significant for working pensioners.

### Earnings-period basis
NI is calculated **per pay period, not cumulatively** (unlike PAYE income tax, which is cumulative). A monthly-paid employee's NI for each month uses the monthly thresholds independently. This means irregular income (bonuses) attracts more NI than an annualised calculation suggests. A simple annual calculator should state that it assumes **even earnings across the year**.

**Directors** are the exception — they use an annual (cumulative) earnings period.

### Rounding (HMRC exact percentage method, CWG2 2026-27)
> "In all cases the resulting figures should be calculated to the nearest penny. Amounts of £0.005 or less should be disregarded."

i.e. round half up to the penny, with exactly £0.005 rounded **down**.

---

## 5. Employer National Insurance (quoted as part of package cost)

| Item | 2026-27 |
|---|---|
| Employer (secondary) Class 1 rate | **15%** |
| Secondary Threshold (ST) | **£5,000/yr** (£96/wk, £417/mth) |
| Employment Allowance | **£10,500** per eligible business per year (offsets employer NI; not available to single-director companies with no other employees) |
| Class 1A / 1B (benefits in kind) | 15% |
| Apprenticeship Levy | 0.5% of pay bill, with a £15,000 annual allowance (only bites above £3m pay bill) |

```
NI_employer = 0.15 * max(0, pay - ST)
```
For M/H/V/Freeport/IZ categories the 0% applies up to UST/AUST/VUST (£50,270) or FUST (£25,000) respectively.

---

## 6. Workplace pension — auto-enrolment (2026-27)

| Item | 2026-27 |
|---|---|
| Earnings trigger for auto-enrolment | **£10,000/yr** (£833/mth, £192/wk, £768 per 4 weeks) |
| Qualifying earnings — lower limit | **£6,240/yr** (£520/mth, £120/wk, £480 per 4 weeks) |
| Qualifying earnings — upper limit | **£50,270/yr** (£4,189/mth, £967/wk) |
| Minimum total contribution | **8%** of qualifying earnings |
| Minimum **employer** contribution | **3%** |
| Minimum **employee** contribution | **5%** (of which 1 percentage point is basic-rate tax relief) |

All three thresholds are **unchanged from 2025-26** (DWP review confirmed retention).

```
qualifying_earnings = max(0, min(pay, 50270) - 6240)
employee_pension = 0.05 * qualifying_earnings
employer_pension = 0.03 * qualifying_earnings
```

Many employers instead use **qualifying earnings = full basic pay** or **total pay** (certification tiers), so make the basis configurable.

### Pension tax relief
- **Net pay arrangement** (most occupational schemes): contribution deducted from **gross pay before income tax** → full relief at the employee's marginal rate automatically. NI is still charged on the full amount.
- **Relief at source** (most personal/group personal pensions): employee pays from **net pay**, provider reclaims 20% basic-rate relief. Higher/additional-rate taxpayers claim the extra via self-assessment. Scottish starter-rate (19%) taxpayers keep the 20% relief.
- **Salary sacrifice**: contribution comes off gross pay before **both** income tax and NI → saves the employee 8% or 2% NI as well, and saves the employer 15%. A £1 sacrifice reduces take-home by less than £1.
  - ⚠️ Announced at Budget 2025: from **April 2029** salary-sacrificed pension contributions above **£2,000/yr** will be subject to employee and employer NI. **No effect in 2026-27.**

### Annual allowance (relevant for high earners)
- Standard annual allowance **£60,000**.
- Tapers down by £1 for every £2 of adjusted income above **£260,000**, to a minimum of **£10,000** at adjusted income £360,000+. Threshold income floor **£200,000**.
- Money Purchase Annual Allowance £10,000.

---

## 7. Student loan repayments (UK-wide, deducted through payroll)

Confirmed from HMRC's payroll technical specification *Collection of student loans from 6 April 2026*.

| Plan | Code | Annual threshold | Monthly | Weekly | Rate |
|---|---|---|---|---|---|
| **Plan 1** | SL1 | **£26,900** | £2,241.66 | £517.30 | **9%** |
| **Plan 2** | SL2 | **£29,385** | £2,448.75 | £565.09 | **9%** |
| **Plan 4** (Scotland) | SL4 | **£33,795** | £2,816.25 | £649.90 | **9%** |
| **Plan 5** | SL5 | **£25,000** | £2,083.33 | £480.76 | **9%** |
| **Postgraduate Loan** | PGL | **£21,000** | £1,750.00 | £403.84 | **6%** |

**Which plan applies:**
- **Plan 1** — England/Wales undergrad starting before 1 Sep 2012; all Northern Ireland undergrads.
- **Plan 2** — England/Wales undergrad starting 1 Sep 2012 – 31 Jul 2023.
- **Plan 4** — Scottish students (SAAS), any start date.
- **Plan 5** — England undergrad starting **on or after 1 Aug 2023**.
- **Postgraduate Loan** — Master's/Doctoral loans (England & Wales). **Charged in addition to** any undergraduate plan.

**Calculation rules (HMRC spec, exact wording):**
- Periodic threshold: `PT = AT ÷ NP`, **rounded DOWN to the penny** (NP = number of pay periods in the year: 12 monthly, 52 weekly, 26 fortnightly, 13 four-weekly).
- Deduction: `where E > PT, LD = (E − PT) × R`, **rounded DOWN to the whole pound**.
- Calculated **per pay period, non-cumulative** — same as NI.
- Deductions are based on **NIable gross earnings**, not taxable pay. Salary sacrifice reduces the base; net-pay pension contributions do not.
- Where both a plan loan and PGL apply, **allocate to the postgraduate loan first** (higher interest rate).

```
def student_loan(period_pay, annual_threshold, rate, periods_per_year):
    pt = floor_to_penny(annual_threshold / periods_per_year)
    if period_pay <= pt: return 0
    return floor_to_pound((period_pay - pt) * rate)
```

Someone with Plan 2 + PGL pays **15%** of earnings above the respective thresholds.

---

## 8. Other charges affecting an employee's liability

### High Income Child Benefit Charge (HICBC)
| Item | 2026-27 |
|---|---|
| Threshold (adjusted net income of the higher earner) | **£60,000** |
| Full clawback at | **£80,000** |
| Charge rate | **1% of Child Benefit received for every £200** of ANI over £60,000 |

Child Benefit rates 2026-27: **£27.75/wk** eldest child, **£18.35/wk** each additional child (uprated April 2026).

```
if ANI <= 60000: charge = 0
elif ANI >= 80000: charge = full child benefit received
else: charge = CB * floor((ANI - 60000) / 200) / 100
```
From 2026-27 employed taxpayers can opt to pay HICBC through their **PAYE tax code** rather than self-assessment.

### Dividend rates (changed for 2026-27 — a stale implementation will get this wrong)
| Band | 2026-27 | 2025-26 |
|---|---|---|
| Ordinary (basic) | **10.75%** | 8.75% |
| Upper (higher) | **35.75%** | 33.75% |
| Additional | 39.35% | 39.35% |

Both non-additional dividend rates rose by **2 percentage points** from 6 April 2026. Dividend rates are **UK-wide** — Scotland does not set them.

### Savings income rates
0% starting rate (£5,000), then 20% / 40% / 45% — **UK-wide**, Scotland does not set these either. Only NSND earned income uses Scottish bands.

### Things NOT charged on employment income
- No separate social security beyond NI. No health levy, no solidarity surcharge, no local/municipal income tax.
- No standard deduction. Employment expenses are only deductible if "wholly, exclusively and necessarily" incurred (flat-rate expense allowances exist for some trades).

---

## 9. PAYE mechanics (for payslip-accurate output)

- **Tax codes**: `1257L` is the standard code (PA £12,570 ÷ 10). Prefix **S** = Scottish rates, **C** = Welsh rates. Suffix `L` = standard PA, `M`/`N` = marriage allowance recipient/transferor, `T` = other adjustments, `K` prefix = negative allowance (benefits exceed allowances). `BR` = all at basic rate, `D0` = all at higher, `D1` = all at additional (`SD0`/`SD1`/`SD2` in Scotland for 42%/45%/48%).
- **Emergency codes 2026-27**: `1257L W1`, `1257L M1`, `1257L X`.
- **P9X 2026**: carry forward existing codes unchanged for 2026-27 — no general uplift, because the PA is frozen.
- **PAYE threshold**: £242/week, £1,048/month.
- **Income tax is cumulative** — each period recalculates year-to-date tax due and deducts what has already been paid. NI and student loans are **not** cumulative.
- A simple annual take-home calculator should divide the annual result by 12, and note that real payslips vary period to period.

### Net pay formula (England/Wales/NI, category A, no pension)
```
PA        = 12570 if gross <= 100000 else max(0, 12570 - (gross-100000)/2)
taxable   = max(0, gross - PA)
tax       = 0.20*min(taxable,37700)
          + 0.40*max(0, min(taxable,112570) - 37700)
          + 0.45*max(0, taxable - 112570)
ni        = 0.08*max(0, min(gross,50270) - 12570) + 0.02*max(0, gross - 50270)
net       = gross - tax - ni - student_loan - pension
```

---

## 10. Worked examples

### A. Authority-published (gov.scot, Scottish Income Tax 2026-27 factsheet)
These are published as **differences vs the rest of the UK** and reconcile to the penny with the band tables above — the strongest available verification.

| Scenario | gov.scot published | Computed from spec | Match |
|---|---|---|---|
| Real Living Wage, £25,782 | "£40 better off" than rUK | Scot £2,602.73 vs rUK £2,642.40 = **−£39.67** | ✓ |
| Scottish median income, £31,136 | "£24 better off" than rUK | Scot £3,689.63 vs rUK £3,713.20 = **−£23.57** | ✓ |
| £45,000 | "£396 worse off" than rUK | Scot £6,882.05 vs rUK £6,486.00 = **+£396.05** | ✓ |

### B. Derived, England/Wales/NI, category A, no pension, no student loan

**£30,000 gross**
- PA £12,570 → taxable £17,430
- Tax: £17,430 × 20% = **£3,486.00**
- NI: (£30,000 − £12,570) × 8% = £17,430 × 8% = **£1,394.40**
- Net: **£25,119.60**/yr = £2,093.30/mth

**£45,000 gross**
- Taxable £32,430 → all basic rate: £32,430 × 20% = **£6,486.00**
- NI: £32,430 × 8% = **£2,594.40**
- Net: **£35,919.60**

**£60,000 gross**
- Taxable £47,430
- Tax: £37,700 × 20% = £7,540.00; (£47,430 − £37,700) = £9,730 × 40% = £3,892.00 → **£11,432.00**
- NI: (£50,270 − £12,570) × 8% = £3,016.00; (£60,000 − £50,270) × 2% = £194.60 → **£3,210.60**
- Net: **£45,357.40**

**£110,000 gross** (in the taper)
- PA = 12,570 − (110,000−100,000)/2 = £7,570 → taxable £102,430
- Tax: £37,700 × 20% = £7,540.00; (£102,430 − £37,700) = £64,730 × 40% = £25,892.00 → **£33,432.00**
- NI: £3,016.00 + (£110,000 − £50,270) × 2% = £1,194.60 → **£4,210.60**
- Net: **£72,357.40**
- Effective income tax rate 30.4%; marginal rate on the next £1 is 60% + 2% NI.

**£150,000 gross**
- PA £0 → taxable £150,000
- Tax: £37,700 × 20% = £7,540.00; £112,570 − £37,700 = £74,870 × 40% = £29,948.00; £150,000 − £112,570 = £37,430 × 45% = £16,843.50 → **£54,331.50**
- NI: £3,016.00 + (£150,000 − £50,270) × 2% = £1,994.60 → **£5,010.60**
- Net: **£90,657.90**

### C. Derived, Scotland, category A

**£45,000 gross (S code)**
- Taxable £32,430
- Starter £3,967 × 19% = £753.73
- Basic £12,989 × 20% = £2,597.80
- Intermediate (£43,662 − £29,526) = £14,136 × 21% = £2,968.56
- Higher (£45,000 − £43,662) = £1,338 × 42% = £561.96
- **Tax £6,882.05**; NI **£2,594.40**; Net **£35,523.55**
- £396.05 more tax than rUK — matches gov.scot exactly.

**£60,000 gross (S code)**
- Tax **£13,182.05**; NI **£3,210.60**; Net **£43,607.35** (£1,750.05 more tax than rUK)

**£150,000 gross (S code)**
- Tax **£60,011.45**; NI **£5,010.60**; Net **£84,977.95** (£5,679.95 more tax than rUK)

### D. Student loan, monthly
Plan 2, £45,000/yr paid monthly (£3,750/mth):
- PT = floor_penny(29,385 ÷ 12) = **£2,448.75**
- (£3,750.00 − £2,448.75) × 9% = £117.1125 → floor to pound = **£117/mth** (£1,404/yr)

Plan 2 + PGL, same salary:
- PGL PT = floor_penny(21,000 ÷ 12) = £1,750.00 → (£3,750 − £1,750) × 6% = £120.00 → **£120**
- Plan 2 as above → **£117**
- Total **£237/mth**

### E. Full stack — £45,000, England, Plan 2, 5% auto-enrolment (net pay arrangement)
- Qualifying earnings = £45,000 − £6,240 = £38,760 → employee pension 5% = **£1,938.00** (employer 3% = £1,162.80)
- Taxable pay after net-pay pension = £45,000 − £1,938 = £43,062 → minus PA £12,570 = £30,492 → tax 20% = **£6,098.40**
- NI is on the **full** £45,000 (pension not sacrificed): **£2,594.40**
- Student loan on full £45,000 NIable pay: **£1,404.00**
- Net: 45,000 − 1,938.00 − 6,098.40 − 2,594.40 − 1,404.00 = **£32,965.20**/yr = £2,747.10/mth

---

## 11. What changed for 2026-27 (a stale implementation gets these wrong)

1. **Scottish Starter and Basic band limits rose 7.4%** — starter top £15,397 → **£16,537**; basic top £27,491 → **£29,526**. Intermediate/Higher/Advanced/Top thresholds frozen (£43,662 / £75,000 / £125,140).
2. **Dividend ordinary and upper rates rose 2pp** — 8.75% → **10.75%**, 33.75% → **35.75%**. Additional rate unchanged at 39.35%.
3. **Blind Person's Allowance £3,130 → £3,250.**
4. **Student loan thresholds uprated**: Plan 1 £26,065 → **£26,900**; Plan 2 £28,470 → **£29,385**; Plan 4 £32,745 → **£33,795**. Plan 5 (£25,000) and PGL (£21,000) unchanged.
5. **Everything else frozen**: PA £12,570, basic rate limit £37,700, higher-rate threshold £50,270, additional-rate threshold £125,140, NI PT £12,570, UEL £50,270, ST £5,000, employee rates 8%/2%, employer 15%, auto-enrolment thresholds.
6. **Announced but not yet in force**: salary-sacrifice pension NI charge above £2,000 from April 2029; the PA/basic-rate-limit freeze now runs to 2030-31 per Budget 2025.

---

## 12. Non-resident note

Non-UK residents are taxed only on UK-source income. Most are still entitled to the UK Personal Allowance if they are UK/EEA nationals or covered by a double taxation agreement. Non-residents pay Class 1 NI on UK employment earnings unless covered by a social security agreement or an A1/certificate of coverage. Out of scope here.

---

## Sources (all fetched July 2026)

1. HMRC — Income Tax rates and allowances, current and past: https://www.gov.uk/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past
2. HMRC — Rates and thresholds for employers 2026 to 2027: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
3. HMRC — Rates and allowances: National Insurance contributions: https://www.gov.uk/government/publications/rates-and-allowances-national-insurance-contributions/rates-and-allowances-national-insurance-contributions
4. HMRC — Collection of student loans from 6 April 2026 (payroll technical specification): https://www.gov.uk/government/publications/payroll-technical-specifications-student-loans/collection-of-student-loans-from-6-april-2026
5. Scottish Government — Scottish Income Tax: rates and bands 2026 to 2027: https://www.gov.scot/publications/scottish-income-tax-rates-and-bands/pages/2026-to-2027/
6. Scottish Government — Scottish Income Tax 2026 to 2027: technical factsheet: https://www.gov.scot/publications/scottish-income-tax-technical-factsheet/
7. HM Treasury — Budget 2025 Annex A: rates and allowances: https://www.gov.uk/government/publications/budget-2025-overview-of-tax-legislation-and-rates-ootlar/annex-a-rates-and-allowances
8. HMRC — Income Tax Personal Allowance and basic rate limit, and certain NICs thresholds, 6 April 2026 to 5 April 2028: https://www.gov.uk/government/publications/the-personal-allowance-and-basic-rate-limit-for-income-tax-and-certain-national-insurance-contributions-nics-thresholds-from-6-april-2026-to-5-apr/income-tax-personal-allowance-and-the-basic-rate-limit-and-certain-national-insurance-contributions-thresholds-from-6-april-2026-to-5-april-2028
9. HMRC — CWG2 Employer further guide to PAYE and NICs 2026 to 2027: https://www.gov.uk/government/publications/cwg2-further-guide-to-paye-and-national-insurance-contributions/2026-to-2027-employer-further-guide-to-paye-and-national-insurance-contributions
10. HMRC — National Insurance category letters: https://www.gov.uk/national-insurance-rates-letters/category-letters
11. DWP — Review of the Automatic Enrolment Earnings Trigger and Qualifying Earnings Band for 2026/27: https://www.gov.uk/government/publications/review-of-the-automatic-enrolment-earnings-trigger-and-qualifying-earnings-band-for-202627/review-of-the-automatic-enrolment-earnings-trigger-and-qualifying-earnings-band-for-202627
12. HMRC — The High Income Child Benefit Charge threshold: https://www.gov.uk/government/publications/income-tax-increasing-the-high-income-child-benefit-charge-threshold/the-high-income-child-benefit-charge-threshold
13. HMRC — Income Tax rates and Personal Allowances (current year confirmation): https://www.gov.uk/income-tax-rates
14. Welsh Government — Welsh rates of Income Tax ready reckoner 2026 to 2027: https://www.gov.wales/welsh-rates-of-income-tax-ready-reckoner-2026-to-2027
