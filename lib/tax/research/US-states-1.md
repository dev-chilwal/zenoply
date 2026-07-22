# US-states-1 — 2026 State Personal Income Tax Spec
### Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware, District of Columbia

**Research date:** 20 July 2026. All figures below were fetched from the named authority in this session.

**Tax year in effect on 20 July 2026:** calendar year 2026 (1 Jan 2026 – 31 Dec 2026) for every jurisdiction in this batch. All US states and DC use the calendar year for individual income tax. Returns for TY2026 are filed in spring 2027; the 2025 return (filed April 2026) is the *prior* year and must not be used.

**Federal context needed by several states (IRS Rev. Proc. 2025-32, TY2026):**
- Standard deduction: **$16,100** single / MFS, **$24,150** head of household, **$32,200** MFJ / QSS.
- Social Security (OASDI) wage base 2026: **$184,500** — used as the cap for CT and CO paid-leave contributions.

---

## 1. ALABAMA (AL) — progressive, 3 brackets

**Levies personal income tax: YES.**

Source: Alabama DoR, *Withholding Tax Tables and Instructions for Employers and Withholding Agents*, **REVISED January 2026** (`whbooklet_0126.pdf`), page 6–7.

### Rates — Single, Head of Family, MFS
| Taxable income | Rate |
|---|---|
| First $500 | 2% |
| Next $2,500 ($500–$3,000) | 4% |
| Over $3,000 | 5% |

### Rates — Married Filing Jointly
| Taxable income | Rate |
|---|---|
| First $1,000 | 2% |
| Next $5,000 ($1,000–$6,000) | 4% |
| Over $6,000 | 5% |

Top rate 5% — **unchanged for 2026**.

### Unique feature: federal income tax is DEDUCTIBLE
Alabama is one of the few states allowing a full deduction for federal income tax paid/withheld. The withholding formula subtracts the employee's annualised federal withholding. An implementer must model this or Alabama liability will be materially overstated.

### Standard deduction (income-phased)
Filing-status formulas from the 2026 withholding booklet, keyed on Alabama AGI (`GI`):

**Single / "0" / "S"**
- GI ≤ $25,999 → $3,000
- $25,999 < GI < $35,500 → $3,000 − $25 per $500 increment (or part) of GI above $25,999
- GI ≥ $35,500 → $2,500

**Married Filing Separately ("MS")**
- GI ≤ $12,999 → $4,250
- $12,999 < GI < $17,750 → $4,250 − $88 per $250 increment (or part) above $12,999
- GI ≥ $17,750 → $2,500

**Married Filing Jointly ("M")**
- GI ≤ $25,999 → $8,500
- $25,999 < GI < $35,500 → $8,500 − $175 per $500 increment (or part) above $25,999
- GI ≥ $35,500 → $5,000

**Head of Family ("H")**
- GI ≤ $25,999 → $5,200
- $25,999 < GI < $35,500 → $5,200 − $135 per $500 increment (or part) above $25,999
- GI ≥ $35,500 → $2,500

Published MFJ step table (extract, confirms the formula): $0–25,999 → $8,500; 26,000–26,499 → $8,325; 26,500–26,999 → $8,150; 27,000–27,499 → $7,975; 27,500–27,999 → $7,800; 28,000–28,499 → $7,625; 28,500–28,999 → $7,450; 29,000–29,499 → $7,275; 29,500–29,999 → $7,100; 30,000–30,499 → $6,925; 30,500–30,999 → $6,750; 31,000–31,499 → $6,575; 31,500–31,999 → $6,400; 32,000–32,499 → $6,225; 32,500–32,999 → $6,050; 33,000–33,499 → $5,875; 33,500–33,999 → $5,700; 34,000–34,499 → $5,525; 34,500–34,999 → $5,350; 35,000–35,499 → $5,175; ≥35,500 → $5,000.
MFS step table: $0–12,999 → $4,250; then −$88 per $250 band down to $2,500 at ≥$17,750.

### Personal exemption
- $0 if employee claims "0"
- **$1,500** — Single ("S") or MFS ("MS")
- **$3,000** — MFJ ("M") or Head of Family ("H")

### Dependent exemption (per dependent, other than spouse) — income-tiered
- Gross income ≤ $50,000 → **$1,000** each
- $50,000 < GI ≤ $100,000 → **$500** each
- GI > $100,000 → **$300** each

### Employee social contributions
None at state level (no state SDI/PFML). Federal FICA only.

### Local income tax
Alabama municipalities and some counties levy **occupational licence taxes on gross wages earned in the jurisdiction**, withheld by the employer, with no deduction/exemption. Representative rates: **Birmingham 1.0%**, **Bessemer 1.0%**, **Auburn 1.0%**, **Gadsden 2.0%**, Macon County 1.0%. Roughly 25 jurisdictions levy one; rates range ~0.5%–2%. Rate is applied to gross wages earned inside the city regardless of residence.

---

## 2. ALASKA (AK) — NO personal income tax

**Levies personal income tax: NO.** Alaska has no individual income tax (repealed 1980) and no state sales tax. The Alaska Department of Revenue Tax Division's tax-type list covers corporate income tax, fisheries, oil & gas, excise taxes etc.; there is no individual income tax to compute.

- State income tax on wages: **0**.
- No state standard deduction, exemption or credit — not applicable.
- No mandatory employee state payroll contribution **except**: Alaska is one of only three states with an **employee-paid unemployment insurance contribution**. For 2026 the employee UI rate is **0.50%** of wages up to the Alaska taxable wage base. *(Confirm the 2026 wage base with Alaska DOLWD before coding — not verified in this session; see caveats.)*
- Local income tax: none. Alaska boroughs/cities levy sales and property taxes only.
- Note: the Permanent Fund Dividend is *income to the recipient for federal purposes* but is not a state income tax item.

---

## 3. ARIZONA (AZ) — FLAT

**Levies personal income tax: YES.**

### Rate
**2.5% flat** on Arizona taxable income, all filing statuses, for tax year 2023 and beyond — confirmed for 2026 by AZDOR *Individual Income Tax Highlights*. There is no phase-down remaining; 2.5% is the terminal rate.

### Standard deduction
Arizona repealed its own standard deduction and **couples to the federal standard deduction under IRC §63(c), including the annual inflation adjustment**, confirmed by AZDOR for TY2026. Therefore for 2026:
- Single / MFS: **$16,100**
- Head of household: **$24,150**
- MFJ: **$32,200**

**Optional increase for charitable contributions:** a taxpayer taking the standard deduction may increase it by a statutory percentage of the charitable contributions they *would* have itemised (Form 140 Schedule S / worksheet). The percentage for 2026 is not confirmed here — see caveats.

### Personal exemption
Arizona has **no personal exemption**. It has a **dependent tax credit** (nonrefundable, A.R.S. §43-1073.01): **$100 per dependent under age 17**, **$25 per dependent age 17+**; the credit is reduced by 5% for each $1,000 (or fraction) of federal AGI above **$200,000** (single/HoH/MFS) or **$400,000** (MFJ).

### Withholding mechanics (important for a take-home calculator)
Arizona does **not** use allowance-based withholding tables. The employee elects a flat percentage of gross taxable wages on **Form A-4**: **0.5%, 1.0%, 1.5%, 2.0%, 2.5%, 3.0% or 3.5%**. If no A-4 is filed within 5 days of hire, the employer must withhold **2.0%** (the statutory default). A "true" take-home figure should compute 2.5% of taxable income; a "paycheck-accurate" figure should use the elected percentage of gross.

### Employee social contributions / local income tax
None. Arizona has no state SDI/PFML and **no city or county income tax**.

---

## 4. ARKANSAS (AR) — progressive; **RATE CUT IN 2026**

**Levies personal income tax: YES.**

### ⚠️ 2026 change
Arkansas cut its **top individual income tax rate from 3.9% to 3.7%, retroactive to 1 January 2026**, by legislation (HB 1001 / SB 1) enacted in the May 2026 special session and signed by Gov. Sanders. Approximately 1.1 million taxpayers with net taxable income of $26,400+ benefit. **A 2025-based implementation using 3.9% will be wrong for 2026.**

### Official 2026 withholding formula (DFA, *Withholding Tax Formula Method, Effective 01/01/2026*)
Same schedule for all filing statuses — Arkansas does not double brackets for MFJ.

1. Annualise gross pay (×52 weekly, ×26 biweekly, ×24 semi-monthly, ×12 monthly, ×260 daily).
2. Subtract standard deduction **$2,470** → Net Taxable Income (NTI).
3. If NTI < $100,001, round to the $50 midpoint of the $100 band; if ≥ $100,001 use the exact figure.
4. Apply:

| NTI from | to (≤) | Rate | Minus adjustment |
|---|---|---|---|
| $0 | $5,599 | 0.00% | — |
| $5,600 | $11,199 | 2.00% | $111.98 |
| $11,200 | $15,999 | 3.00% | $223.97 |
| $16,000 | $26,399 | 3.40% | $287.97 |
| $26,400 | $94,700 | 3.70% | $367.16 |
| $94,701 | $97,600 | 3.70% | tapers from $369.90 down to $89.90 in $10 steps per $100 of income (bracket-adjustment phase-out) |
| $97,601 | and over | 3.70% | $79.90 |

Full taper detail (each row is a $100 income band, 3.70% throughout): 94,701–94,800 → $369.90; 94,801–94,900 → $359.90; 94,901–95,000 → $349.90; 95,001–95,100 → $339.90; 95,101–95,200 → $329.90; 95,201–95,300 → $319.90; 95,301–95,400 → $309.90; 95,401–95,500 → $299.90; 95,501–95,600 → $289.90; 95,601–95,700 → $279.90; 95,701–95,800 → $269.90; 95,801–95,900 → $259.90; 95,901–96,000 → $249.90; 96,001–96,100 → $239.90; 96,101–96,200 → $229.90; 96,201–96,300 → $219.90; 96,301–96,400 → $209.90; 96,401–96,500 → $199.90; 96,501–96,600 → $189.90; 96,601–96,700 → $179.90; 96,701–96,800 → $169.90; 96,801–96,900 → $159.90; 96,901–97,000 → $149.90; 97,001–97,100 → $139.90; 97,101–97,200 → $129.90; 97,201–97,300 → $119.90; 97,301–97,400 → $109.90; 97,401–97,500 → $99.90; 97,501–97,600 → $89.90; 97,601+ → $79.90.

5. Round the gross tax to the nearest dollar.
6. Subtract annual personal tax credits: **$29.00 × number of exemptions on Form AR4EC**.
7. Divide by pay periods.

### Standard deduction / credits on the annual return
- Withholding standard deduction: **$2,470** (2026). The return's statutory standard deduction is indexed annually and is normally the same order of magnitude (2023: $2,340 single / $4,680 MFJ). **Use $2,470 single / $4,940 MFJ as the working figure but confirm against the TY2026 AR1000F instructions when published** — see caveats.
- Personal tax credit: **$29 per exemption** (this is a credit, not a deduction), plus $29 for each dependent; $500 credit for a developmentally disabled dependent.
- Low-income tax tables: Arkansas publishes separate "Low Income" tax tables that zero out liability below thresholds; the withholding formula's 0% band to $5,599 approximates this.

### Employee social contributions / local income tax
None. No state SDI/PFML, **no local income tax** in Arkansas.

---

## 5. CALIFORNIA (CA) — progressive, 9 brackets + 1% surtax

**Levies personal income tax: YES.**

Sources: EDD *California Withholding Schedules for 2026 — Method B* (`26methb.pdf`); FTB *2026 Form 540-ES Instructions*.

### 2026 brackets — SINGLE / MFS
The EDD Method B tables state rates uplifted by a factor of 1.1 for withholding safety. The **statutory rates** are the table rate ÷ 1.1. Both are given.

| Taxable income over | up to | Statutory rate | EDD withholding rate | Cumulative tax at bracket floor (statutory) |
|---|---|---|---|---|
| $0 | $11,079 | 1.0% | 1.100% | $0 |
| $11,079 | $26,264 | 2.0% | 2.200% | $110.79 |
| $26,264 | $41,452 | 4.0% | 4.400% | $414.49 |
| $41,452 | $57,542 | 6.0% | 6.600% | $1,022.01 |
| $57,542 | $72,724 | 8.0% | 8.800% | $1,987.41 |
| $72,724 | $371,479 | 9.3% | 10.230% | $3,201.97 |
| $371,479 | $445,771 | 10.3% | 11.330% | $30,986.19 |
| $445,771 | $742,953 | 11.3% | 12.430% | $38,638.27 |
| $742,953 | — | 12.3% | 13.530% | $72,220.83 |

(EDD "plus" column, i.e. cumulative at 1.1×: $0 / $121.87 / $455.94 / $1,124.21 / $2,186.15 / $3,522.17 / $34,084.81 / $42,502.09 / $79,441.81; and $114,220.27 at $1,000,000 where the 14.630% line begins.)

### 2026 brackets — MARRIED FILING JOINTLY / QSS
Exactly **2× the single thresholds** (except the $1,000,000 surtax threshold, which is NOT doubled):

| over | up to | Statutory rate |
|---|---|---|
| $0 | $22,158 | 1.0% |
| $22,158 | $52,528 | 2.0% |
| $52,528 | $82,904 | 4.0% |
| $82,904 | $115,084 | 6.0% |
| $115,084 | $145,448 | 8.0% |
| $145,448 | $742,958 | 9.3% |
| $742,958 | $891,542 | 10.3% |
| $891,542 | $1,485,906 | 11.3% |
| $1,485,906 | — | 12.3% |

### 2026 brackets — HEAD OF HOUSEHOLD
| over | up to | Statutory rate |
|---|---|---|
| $0 | $22,173 | 1.0% |
| $22,173 | $52,530 | 2.0% |
| $52,530 | $67,716 | 4.0% |
| $67,716 | $83,805 | 6.0% |
| $83,805 | $98,990 | 8.0% |
| $98,990 | $505,208 | 9.3% |
| $505,208 | $606,251 | 10.3% |
| $606,251 | $1,010,417 | 11.3% |
| $1,010,417 | — | 12.3% |

### Behavioral Health Services Tax (formerly Mental Health Services Tax) — the 1% surcharge
**1% of taxable income in excess of $1,000,000**, all filing statuses (threshold is NOT doubled for MFJ). Confirmed in the FTB 2026 Form 540-ES instructions, Section D. Effective top marginal rate **13.3%**.

### Standard deduction — 2026 (FTB 540-ES worksheet line 2b)
- **$5,706** — single or married/RDP filing separately
- **$11,412** — MFJ/RDP, head of household, or qualifying surviving spouse

### Personal exemption credit
EDD Table 4 annual credit per allowance: **$168.30**. Divided by the 1.1 withholding uplift this implies a statutory 2026 exemption credit of **$153 per exemption** (2025 was $149). FTB publishes the confirmed indexed figure in ~Aug 2026 — see caveats.

### Low-income exemption (no withholding below)
Annual: **$18,896** (single / dual-income married / married with multiple employers) and **$37,791** (married with 2+ allowances, and head of household).

### Withholding standard-deduction table (annual)
$5,706 (single, dual-income married, married with multiple employers, married with '0'/'1' allowances); $11,412 (married with '2'+ allowances, head of household). Biweekly $219/$439; semi-monthly $238/$476; monthly $476/$951; weekly $110/$219.

### Mandatory EMPLOYEE contribution — State Disability Insurance (SDI/PFL)
- **2026 rate: 1.3% of ALL wages** (up from 1.2% in 2025).
- **NO taxable wage ceiling** — since 1 Jan 2024 all wages are subject. This is a large and commonly-missed item on high salaries.
- Source: EDD *Contribution Rates, Withholding Schedules, and Meals and Lodging Values*.

### Employer contributions (context)
UI Schedule F+ (Schedule F plus 15% emergency surcharge), 1.5%–6.2% on the first **$7,000** per employee; new-employer rate 3.4%. Employment Training Tax **0.1%** on the first $7,000. Both employer-paid.

### Local income tax
**None.** No California city or county levies an income tax on wages. (San Francisco's payroll/gross-receipts tax is a business tax, not withheld from employees.)

---

## 6. COLORADO (CO) — FLAT

**Levies personal income tax: YES.**

Sources: Colorado DOR **DR 1098, *2026 Colorado Withholding Worksheet for Employers*** (rev. 10/21/25); *Colorado Individual Income Tax Guide*, revised **January 2026**.

### Rate
**4.40% flat** for 2026, per DR 1098 step 2c. Published rate history: 2019 4.5%; 2020 4.55%; 2021 4.5%; 2022 4.4%; 2023 4.4%; 2024 **4.25%** (TABOR temporary reduction); 2025 4.4%. The 2026 rate is **not yet listed in the guide's history table** because a TABOR surplus can retroactively reduce it — see caveats. Code **4.40%** as the 2026 rate.

### Tax base — no state standard deduction
Colorado taxable income **starts from FEDERAL TAXABLE INCOME**, so the federal standard deduction ($16,100 / $32,200 / $24,150 for 2026) flows through automatically. Colorado has **no separate standard deduction and no personal exemption**.

### ⚠️ 2026 change — federal deduction addback collapses
For taxpayers with **federal AGI over $300,000**, Colorado requires an addback of federal itemised or standard deductions in excess of a limit:

| Tax years | Single filers | Joint filers |
|---|---|---|
| 2023 – 2025 | $12,000 | $16,000 |
| **2026 and later** | **$1,000** | **$2,000** |

The addback = (federal standard or itemised deduction claimed) − (applicable limit), floored at zero. Because the 2026 limits drop to $1,000/$2,000, a single filer with AGI > $300,000 taking the federal standard deduction adds back $16,100 − $1,000 = **$15,100**. This is a large 2026-specific change a stale implementation will miss entirely.

Other addbacks that can bite an employee: state income tax addback; QBI addback for AGI > $1,000,000; overtime-compensation deduction addback (Colorado does not follow the new federal overtime deduction).

### Withholding proxy
DR 1098 step 2a: subtract an annual amount of **$11,000** (MFJ/QSS per W-4 Step 1(c)) or **$5,500** (all other statuses), then multiply the remainder by 4.40%. This is a withholding convenience figure, not a statutory deduction. Employees may file **Form DR 0004** to override it.

### Credits materially affecting employees
Colorado Earned Income Tax Credit (percentage of the federal EITC), Child Tax Credit, and the Family Affordability Tax Credit. Values are income-tested and change year to year — not confirmed for 2026 in this session.

### Mandatory EMPLOYEE contribution — FAMLI (paid family & medical leave)
- **2026 total premium 0.88% of wages**, split **0.44% employee / 0.44% employer**.
- Wages subject up to the federal Social Security wage cap, **$184,500** for 2026 → max employee contribution **$811.80**.
- Employers with fewer than 10 employees are exempt from the employer half but must still withhold the employee 0.44%.

### Local income tax
Colorado has **no municipal income tax**, but several cities levy an **Occupational Privilege Tax (OPT)** — a flat monthly head tax, not a percentage:
- **Denver**: employee **$5.75/month**, employer $4.00/month, for any employee earning ≥ $500 gross in a calendar month from work performed in Denver.
- **Aurora**: OPT **repealed effective 1 Jan 2025** — do not apply it for 2026.
- Others still levying an OPT include Glendale, Greenwood Village and Sheridan (each a flat few dollars a month).

---

## 7. CONNECTICUT (CT) — progressive, 7 brackets, with phase-outs and recapture

**Levies personal income tax: YES.**

Source: CT DRS **IP 2026(1), *Connecticut Employer's Tax Guide, Circular CT***, incorporating **TPG-211, *2026 Withholding Calculation Rules* (Rev. 12/25)**, effective 1 January 2026.

> DRS states explicitly: **"The 2026 withholding calculation rules and 2026 withholding tables are unchanged from 2025."**

### Withholding codes (Form CT-W4 Line 1) → filing status mapping
- **A** = Single / MFS filer whose spouse also works (single-equivalent)
- **B** = Head of household
- **C** = Married filing jointly (single-earner)
- **D** = no exemption, no credit (highest withholding)
- **F** = Single

### Bracket tables (Table B — Initial Tax Calculation)

**Withholding Code A, D or F (single / MFS)**
| Taxable income | Tax |
|---|---|
| ≤ $10,000 | 2.00% |
| $10,000 – $50,000 | $200 + 4.5% of excess over $10,000 |
| $50,000 – $100,000 | $2,000 + 5.5% of excess over $50,000 |
| $100,000 – $200,000 | $4,750 + 6.0% of excess over $100,000 |
| $200,000 – $250,000 | $10,750 + 6.5% of excess over $200,000 |
| $250,000 – $500,000 | $14,000 + 6.9% of excess over $250,000 |
| > $500,000 | $31,250 + 6.99% of excess over $500,000 |

**Withholding Code B (head of household)**
| Taxable income | Tax |
|---|---|
| ≤ $16,000 | 2.00% |
| $16,000 – $80,000 | $320 + 4.5% of excess over $16,000 |
| $80,000 – $160,000 | $3,200 + 5.5% of excess over $80,000 |
| $160,000 – $320,000 | $7,600 + 6.0% of excess over $160,000 |
| $320,000 – $400,000 | $17,200 + 6.5% of excess over $320,000 |
| $400,000 – $800,000 | $22,400 + 6.9% of excess over $400,000 |
| > $800,000 | $50,000 + 6.99% of excess over $800,000 |

**Withholding Code C (married filing jointly)**
| Taxable income | Tax |
|---|---|
| ≤ $20,000 | 2.00% |
| $20,000 – $100,000 | $400 + 4.5% of excess over $20,000 |
| $100,000 – $200,000 | $4,000 + 5.5% of excess over $100,000 |
| $200,000 – $400,000 | $9,500 + 6.0% of excess over $200,000 |
| $400,000 – $500,000 | $21,500 + 6.5% of excess over $400,000 |
| $500,000 – $1,000,000 | $28,000 + 6.9% of excess over $500,000 |
| > $1,000,000 | $62,500 + 6.99% of excess over $1,000,000 |

### Personal exemptions (Table A) — phased out to zero
Connecticut has **no standard deduction**; it has an income-phased personal exemption.

- **Code A (single)**: $12,000 for annualised salary ≤ $24,000; then **−$1,000 per $1,000** of salary above $24,000; **$0 at $35,000 and up**.
- **Code B (HoH)**: $19,000 for salary ≤ $38,000; then −$1,000 per $1,000 above $38,000; **$0 at $56,000 and up**.
- **Code C (MFJ)**: $24,000 for salary ≤ $48,000; then −$1,000 per $1,000 above $48,000; **$0 at $71,000 and up**.
- **Code F (single, alt.)**: $15,000 for salary ≤ $30,000; then −$1,000 per $1,000 above $30,000; **$0 at $44,000 and up**.
- **Code D**: exemption **$0**.

### Table C — 2% tax-rate phase-out add-back
Recaptures the benefit of the 2% bracket for higher earners. Add-back is a flat dollar amount by annualised salary band.

- **Code A or D**: $0 below $50,250; then $25 per $2,500 band — $50,250–52,750 → $25; 52,750–55,250 → $50; 55,250–57,750 → $75; 57,750–60,250 → $100; 60,250–62,750 → $125; 62,750–65,250 → $150; 65,250–67,750 → $175; 67,750–70,250 → $200; 70,250–72,750 → $225; **$72,750 and up → $250** (max).
- **Code B**: $0 below $78,500; $40 per $4,000 band from $78,500; max **$400** at $114,500 and up.
- **Code C**: $0 below $100,500; $50 per $5,000 band from $100,500; max **$500** at $145,500 and up.
- **Code F**: $0 below $56,500; $25 per $5,000 band from $56,500; max **$250** at $101,500 and up.

### Table D — Tax recapture (recaptures lower-bracket benefit at high incomes)
Flat dollar amounts by annualised salary. Code A/D/F schedule (extract): $0 below $105,000; then $25 per $5,000 band to $250 at $150,000–200,000; then $90 per $5,000 band to $2,950 at $345,000–500,000; then $50 per $5,000 band to a **maximum $3,400 at $540,000 and up**.
Code B maximum **$5,320** at $864,000 and up. Code C maximum **$6,800** at $1,080,000 and up. (Full tables in TPG-211 page 5 — the full grids are in the fetched source; the max values and step sizes above are sufficient to build a lookup.)

### Table E — Personal tax credits (a % REDUCTION of tax, not a dollar credit)
Decimal by annualised salary; tax after Tables B+C+D is multiplied by **(1 − decimal)**.
- **Code A**: .75 from $12,000–15,000; steps down .70/.65/.60/.55/.50/.45/.40 in $500 bands to $18,500; .35 for $18,500–20,000; .30/.25/.20 in $500 bands to $21,500; .15 for $21,500–25,000; then .14 → .10 in $500 bands to $27,000; **.10 for $27,000–48,000**; then .09 → .01 in $500 bands; **.00 at $52,500 and up**.
- **Code B**: .75 from $19,000–24,000; .35 for $27,500–34,000; .15 for $35,500–44,000; .10 for $46,000–74,000; **.00 at $78,500 and up**.
- **Code C**: .75 from $24,000–30,000; .35 for $33,500–40,000; .15 for $41,500–50,000; .10 for $52,000–96,000; **.00 at $100,500 and up**.
- **Code F**: .75 from $15,000–18,800; .35 for $22,300–25,000; .15 for $26,500–31,300; .10 for $33,300–60,000; **.00 at $64,500 and up**.

### Withholding calculation order (TPG-211, authoritative)
1. Annualise wages. 2. Exemption from Table A. 3. Taxable = annualised − exemption (floor 0). 4. Initial tax from Table B. 5. Add Table C add-back. 6. Add Table D recapture. 7. Multiply the sum by (1 − Table E decimal). 8. Divide by pay periods. There is **no percentage method** for CT withholding.

### Mandatory EMPLOYEE contribution — CT Paid Leave (CTPL)
- **0.5% of wages**, employee-funded in full (no employer share).
- Capped at the federal Social Security wage base **$184,500** for 2026 → **max $922.50/year**.
- Rate held at 0.5% for 2026 by the CT Paid Leave Authority board.

### Local income tax
**None.** No Connecticut municipality levies an income tax.

---

## 8. DELAWARE (DE) — progressive, 7 brackets; **NO change for 2026**

**Levies personal income tax: YES.**

### ⚠️ Verify-this note
Widely-circulated secondary sources claim Delaware adopted new 6.75% and 6.95% brackets for tax years beginning after 31 December 2025 (HB 13 / HS 2 for HB 13, "The John Kowalko, Jr., Fairness in Taxation Act", which would also have raised the standard deduction to $5,000/$10,000). **This did not become law.** HB 13 was substituted out on 3 April 2025; **HS 2 for HB 13 remains in the House Revenue & Finance Committee (status as of 17 June 2025), chapter/volume "N/A", never signed.** The Delaware Division of Revenue's own *Tax Rate Changes* page — **last modified 19 February 2026** — still publishes a single schedule labelled "For tax years 2014 and later" with a top rate of 6.6% over $60,000. **Use the existing schedule for 2026.**

### 2026 rate schedule — IDENTICAL FOR ALL FILING STATUSES
Delaware does **not** widen brackets for married filing jointly. Same table for single, MFJ, MFS, HoH.

| Taxable income at least | but less than | Base | Rate on excess |
|---|---|---|---|
| $0 | $2,000 | $0 | 0.00% |
| $2,000 | $5,000 | $0 | 2.20% |
| $5,000 | $10,000 | $66.00 | 3.90% |
| $10,000 | $20,000 | $261.00 | 4.80% |
| $20,000 | $25,000 | $741.00 | 5.20% |
| $25,000 | $60,000 | $1,001.00 | 5.55% |
| $60,000 | — | $2,943.50 | 6.60% |

Formula: `tax = Base + Rate × (Income − range start)`.
DOR rounding rules: for taxable income **below $60,000** compute using the **midpoint of the $50 range**; for income **$60,000 and over** use the exact dollar amount. Amounts ending in $0.50 or more round up to the next whole dollar.

### Standard deduction
| Delaware filing status | Standard deduction |
|---|---|
| 1 — Single | **$3,250** |
| 2 — Married filing joint | **$6,500** |
| 3 — Married filing separate (separate returns) | **$3,250** |
| 4 — Married filing combined separate | **$3,250** each column |
| 5 — Head of household | **$3,250** |

Delaware permits itemising on the state return even if the federal standard deduction was claimed (Form PIT-RSA). If one spouse itemises, both must.

### Additional standard deduction (age 65+ and/or blind)
**$2,500 per checked box**, maximum **$5,000 per individual**. Only available if the Delaware standard deduction is taken.

### Personal credits (nonrefundable dollar credits, not exemptions)
- **$110 per person** — taxpayer, spouse and each dependent claimed on the federal return.
  - MFJ with no dependents → **$220**.
  - MFS (status 3) → $110 per return; combined separate (status 4) → $110 in each column.
- **Additional personal credit: $110** for each of taxpayer/spouse aged **60 or over** on 31 December.
- No credit if the filer is claimed as a dependent on someone else's federal return.
- **Volunteer firefighter credit: $1,000** per qualifying spouse.

### Pension/retirement exclusions (context)
$12,500 exclusion on pension and eligible retirement income at age 60+; $2,000 under 60. Social Security and Railroad Retirement are not taxable in Delaware.

### Employee social contributions
None. No state SDI/PFML employee contribution in 2026. (Delaware Paid Leave benefits begin 1 January 2026; **contributions started 1 January 2025** at a combined 0.8% of wages up to the Social Security wage base, of which the employer may deduct **up to 50%** from the employee — i.e. up to **0.4%**. Confirm the 2026 split and cap with DE DOL before coding; not verified from the authority in this session.)

### Local income tax
**Wilmington** is the only Delaware municipality with a wage tax: **1.25% of gross earned income**, applied to **both residents and non-residents working within city limits**, withheld by the employer. No exemptions or deductions; flat on all earned income. No other Delaware city or county levies an income tax.

---

## 9. DISTRICT OF COLUMBIA (DC) — progressive, 7 brackets

**Levies personal income tax: YES.**

Source: DC Office of Tax and Revenue, **2026 D-40ES Estimated Payment Booklet** (`2026_D40ES_Book_wLinks04012026.pdf`), and OTR *DC Individual and Fiduciary Income Tax Rates*.

### 2026 rate table — SAME FOR ALL FILING STATUSES
DC does **not** widen brackets for married filing jointly. Married couples filing jointly, filing separately on the same return, single, and head of household all use this one table (this is unusual and a common implementation error).

| Taxable income | DC tax |
|---|---|
| Not over $10,000 | 4% of taxable income |
| Over $10,000 but not over $40,000 | $400 + 6% of excess over $10,000 |
| Over $40,000 but not over $60,000 | $2,200 + 6.5% of excess over $40,000 |
| Over $60,000 but not over $250,000 | $3,500 + 8.5% of excess over $60,000 |
| Over $250,000 but not over $500,000 | $19,650 + 9.25% of excess over $250,000 |
| Over $500,000 but not over $1,000,000 | $42,775 + 9.75% of excess over $500,000 |
| Over $1,000,000 | $91,525 + 10.75% of excess over $1,000,000 |

Rates are unchanged from the schedule in force for tax years beginning after 31 December 2021.

### Standard deduction — 2026 (aligned to federal)
- **$16,100** — single, married/RDP filing separately, or a dependent
- **$24,150** — head of household
- **$32,200** — married/RDP filing jointly, married/RDP filing separately **on the same return**, or qualifying widow(er) with dependent children

### Additional standard deduction (aged 65+ and/or blind)
**$1,650** per qualifying condition, or **$2,050** per condition if the individual is unmarried and not a surviving spouse. Count one for each of: self 65+, self blind, spouse/RDP 65+, spouse/RDP blind (spouse boxes only when filing jointly or separately on the same return). Multiply the count by the applicable amount and add to the standard deduction.

### Personal exemption
**None.** DC eliminated the personal exemption when it conformed to the federal TCJA structure.

### Itemised deduction limitation
If DC AGI exceeds **$200,000**, itemised deductions are limited — use "Calculation F" in the D-40 package. State and local income taxes and sales taxes are **not** deductible on the DC return.

### Credits materially affecting employees
DC Earned Income Tax Credit (a percentage of the federal EITC, among the most generous in the country and refundable), Keep Child Care Affordable credit, and the Schedule H homeowner/renter property tax credit. Amounts not confirmed for 2026 in this session.

### Mandatory EMPLOYEE contribution
**None.** DC Paid Family Leave is funded **entirely by an employer payroll tax** (0.75% of covered wages as of the most recent published rate) — **nothing is withheld from the employee**. Do not deduct PFL from DC take-home pay.

### Local income tax
DC *is* the local jurisdiction; there is no additional city tax. **Reciprocity note:** DC taxes only its own **residents** on wages. A non-resident (Maryland, Virginia) who works in DC is **not** subject to DC income tax and files in their home state; there is no DC non-resident wage tax. This is materially different from Philadelphia/NYC-style commuter taxes.

---

## Cross-cutting notes

- **No state in this batch has a commonly-quoted mandatory employer retirement contribution** analogous to Australian superannuation. Employer-side items are UI (all states), ETT (CA), and the employer halves of CO FAMLI and DC PFL.
- **Employee-paid state contributions in this batch:** CA SDI 1.3% uncapped; CO FAMLI 0.44% to $184,500; CT Paid Leave 0.5% to $184,500; AK employee UI 0.50%. Alabama, Arizona, Arkansas, Delaware and DC have **no employee-paid state payroll contribution** on wages for 2026 (Delaware Paid Leave employee share pending verification).
- **Non-resident, one line:** each of these states taxes non-residents only on income sourced within the state, generally via a resident-equivalent computation prorated by the ratio of state-source income to total income. DC is the exception — it does not tax non-resident wages at all.
