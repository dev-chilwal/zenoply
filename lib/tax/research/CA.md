# Canada — Federal personal income tax & employee payroll deductions
## Tax year 2026 (in effect on 20 July 2026)

**Jurisdiction:** Canada, federal only (provincial/territorial researched separately).
**Tax year:** Calendar year — 1 January 2026 to 31 December 2026. Filed in spring 2027.
**Payroll formula edition in force on 20 July 2026:** CRA Guide **T4127, 123rd edition, effective 1 July 2026** (T4127(E) Rev. 26 (26/06)). It supersedes the 122nd edition (1 Jan 2026) but makes **no federal changes** — only BC, NL and PE provincial changes. All federal figures below are identical in both editions.

**Indexation factor for 2026: 2.0%** (CRA, Indexation adjustment page).

---

## 1. Federal income tax brackets — 2026

Marginal, applied to *taxable income* (Canadian tax is fully progressive; each rate applies only to its slice).

| Bracket | Taxable income from | up to | Rate |
|---|---|---|---|
| 1 | $0 | $58,523 | **14.0%** |
| 2 | $58,523.01 | $117,045 | **20.5%** |
| 3 | $117,045.01 | $181,440 | **26.0%** |
| 4 | $181,440.01 | $258,482 | **29.0%** |
| 5 | $258,482.01 | unlimited | **33.0%** |

### CRA "R and K" flat-formula form (T4127 Table 8.1)
CRA's own payroll engine computes basic federal tax as `T3 = (R × A) − K − credits`, where A = annual taxable income:

| A ≥ | R | K |
|---|---|---|
| 0 | 0.1400 | 0 |
| 58,523 | 0.2050 | 3,804 |
| 117,045 | 0.2600 | 10,241 |
| 181,440 | 0.2900 | 15,685 |
| 258,482 | 0.3300 | 26,024 |

K is the "tax overcharged" constant. Implementers may use either the slice method or the R/K method; **CRA's published worked examples use R/K, so match R/K if you want to reproduce them to the cent.** (Note K for bracket 4 is 15,685, i.e. CRA rounds 15,684.20 **up**; do not recompute it.)

**No federal surtax exists.** (Ontario has a provincial surtax; that is out of scope here.)

Non-residents: federal tax plus a 48% federal surtax in lieu of provincial tax (`T1 = T3 + 0.48 × T3`) for income earned outside Canada / beyond provincial limits. Quebec residents get a **16.5% federal abatement**: `T1 = T3 − 0.165 × T3`.

---

## 2. Basic personal amount (BPA) and its taper — 2026

The BPA is a **non-refundable tax credit**, not a zero-rate band. Credit value = BPA × 14%.

**BPAF formula (T4127, Chapter 2), where NI = net income:**

```
NI ≤ $181,440                 →  BPAF = $16,452
$181,440 < NI < $258,482      →  BPAF = $16,452 − (NI − $181,440) × ($1,623 / $77,042)
NI ≥ $258,482                 →  BPAF = $14,829
```

- Maximum BPA: **$16,452** (2025: $16,129)
- Minimum/base BPA: **$14,829** (2025: $14,538)
- Enhanced portion being tapered: **$1,623**
- Taper width: $258,482 − $181,440 = **$77,042**; taper rate = 1,623/77,042 = **2.10666...%**. **Do not round this division** (CRA explicitly says so).
- Round the resulting BPAF to 2 decimals, half-up on the 3rd decimal.

Maximum federal BPA credit = 16,452 × 0.14 = **$2,303.28**. Minimum = 14,829 × 0.14 = **$2,076.06**.

For payroll, in the absence of a TD1 the employer uses the BPAF formula for TC. Federal claim-code chart (Table 8.9) steps by **$2,833** per code from the max BPAF.

---

## 3. Other federal credits materially affecting an employee — 2026

All are non-refundable and multiplied by the **lowest federal rate, 14%**, unless noted.

| Credit | 2026 amount | Credit value @14% |
|---|---|---|
| **Canada employment amount (CEA)** — auto for anyone with employment income | lesser of employment income and **$1,501** | up to $210.14 |
| CPP **base** contributions (see §4 — only the base 4.95% slice is creditable) | up to $3,519.45 | up to $492.72 |
| EI employee premiums | up to $1,123.07 | up to $157.23 |
| QPP base contributions (Quebec) | up to $3,768.30 | up to $527.56 |
| QPIP employee premiums (Quebec) | up to $442.90 | up to $62.01 |
| Age amount (65+) | $9,208, reduced by 15% of net income over **$46,432** | — |
| Spouse/common-law partner amount | max $16,452 (min $14,829), reduced by spouse's net income | — |
| Amount for an eligible dependant | max $16,452 (min $14,829) | — |
| Canada caregiver (child <18 / dependent spouse / eligible dependant) | $2,740 | — |
| Canada caregiver, other infirm dependants 18+ | max $8,773, reduced above net income $20,601 | — |
| Disability amount | $10,341 (+ $6,032 child supplement) | — |
| Medical expense credit floor | lesser of 3% of net income and **$2,890** | — |
| Labour-sponsored funds credit (LCF) | 15% of purchase, max **$750/yr** | direct reduction of tax |

**Critical CPP nuance:** only the **base** CPP is a *credit*. The **first additional (1.00%) and second additional (CPP2, 4%)** contributions are an **above-the-line deduction from taxable income**, not a credit. See §4.

### Refundable — Canada Workers Benefit (CWB), 2026
Delivered on the return (with quarterly advance payments), not through payroll:

| | Single, no children | Families |
|---|---|---|
| Minimum working income threshold | $3,000 | $3,000 |
| Maximum benefit | **$1,665** | **$2,869** |
| Phase-out begins (adjusted net income) | $27,392 | $31,251 |
| Secondary earner exemption | — | $16,714 |

CWB disability supplement: max **$860**; min working income $1,150; phase-out from $38,495 (single) / $50,377 (family).
Alberta, Quebec and Nunavut have CWB reconfiguration agreements with different parameters.

### Canada Groceries and Essentials Benefit (formerly GST/HST credit), 2026
Increased 25% for five years starting **July 2026**: adult max **$445**, child max **$234**, single supplement **$234** (phase-in threshold $11,564); phase-out from family net income **$46,432**. Indexation resumes 2027.

**OAS clawback threshold 2026: $95,323** (recovery tax 15% of income above; retirees only).

---

## 4. Canada Pension Plan (CPP) — 2026 (all provinces except Quebec)

| Parameter | 2026 |
|---|---|
| YMPE (Year's Maximum Pensionable Earnings) | **$74,600.00** (unrounded $74,696.54) |
| Basic exemption | **$3,500.00** |
| YMCE (max contributory earnings) | **$71,100.00** |
| YAMPE (Year's Additional Max Pensionable Earnings) | **$85,000.00** |
| CPP2 earnings band | $74,600.00 → $85,000.00 = **$10,400.00** |

### Rates (employee; employer matches exactly 1:1)

| Component | Rate | Base | Max employee (and employer) |
|---|---|---|---|
| **Total CPP (base + first additional)** | **5.95%** | earnings $3,500 → $74,600 | **$4,230.45** |
| — of which **base** | 4.95% | same | $3,519.45 |
| — of which **first additional** | 1.00% | same | $711.00 |
| **CPP2 (second additional)** | **4.00%** | earnings $74,600 → $85,000 | **$416.00** |
| **Combined employee maximum** | | | **$4,646.45** |

Employer maximum is identical: $4,646.45. Self-employed pay both halves (11.90% / 8.00%, max $9,292.90).

### Tax treatment (this is where most implementations get it wrong)
- **Base CPP (4.95% slice, max $3,519.45)** → non-refundable **tax credit** at 14%.
- **First additional (1.00% slice, max $711.00) + all CPP2 (max $416.00)** → **deduction from taxable income** (reduces income before applying rates). In T4127 this is factor `F5 = C × (0.0100/0.0595) + C2`.
- Split from a total contribution C: base = `C × (0.0495/0.0595)`, first-additional = `C × (0.0100/0.0595)`.

### Per-pay-period formulas (T4127 Chapter 6), round each result to $0.01
```
C  = lesser of:  (i)  $4,230.45 × (PM/12) − D
                 (ii) 0.0595 × [PI − ($3,500 / P)]
     If negative, C = 0.

C2 = lesser of:  (i)  $416.00 × (PM/12) − D2
                 (ii) (PIYTD + PI − W) × 0.04
     where W = greater of (PIYTD) and (YMPE × PM/12)
     If negative, C2 = 0.
```
`P` = pay periods in year; `PI` = pensionable earnings this period; `D`/`D2` = YTD CPP / CPP2 with this employer; `PM` = months in year contributions are required (12 normally).

**Basic exemption per pay period (Table 6.1):** annual 3,500.00 · semi-annual 1,750.00 · quarterly 875.00 · monthly 291.66 · semi-monthly 145.83 · biweekly(26) 134.61 · biweekly(27) 129.62 · weekly(52) **67.30** · weekly(53) 66.03 · 22 periods 159.09 · 13 periods 269.23 · 10 periods 350.00 · daily(240) 14.58 · hourly(2000) 1.75.

Notes: exemption is *not* given on a standalone bonus payment. Each employer applies the full annual max independently (no aggregation across employers; over-contribution is refunded on the return). Contributions start the month after turning 18 and stop after the month of turning 70; a CPT30 election can stop/restart at 65+.

### Announced future change (do NOT apply to 2026)
On **28 April 2026** the Government announced its intention to cut the **base** CPP rate from 9.90% to 9.50% combined (employee 4.95% → **4.75%**) **effective 1 January 2027**. First-additional and second-additional rates unchanged. This has no 2026 effect.

---

## 5. Quebec Pension Plan (QPP) — 2026 (Quebec-resident employees only)

Same ceilings as CPP, different rate.

| Parameter | 2026 |
|---|---|
| YMPE | $74,600.00 (basic exemption $3,500, YMCE $71,100) |
| **Total QPP employee rate** | **6.30%** — max **$4,479.30** |
| — base | **5.30%** — max **$3,768.30** (creditable) |
| — first additional | 1.00% — max $711.00 (deductible) |
| **QPP2** | 4.00% on $74,600 → $85,000, max **$416.00** (deductible) |
| **Combined employee maximum** | **$4,895.30** |

Employer matches 1:1. Base/total split ratio for the credit: `C × (0.0530/0.0630)`.

### QPIP — Quebec Parental Insurance Plan (2026)
| | Employee | Employer |
|---|---|---|
| Max annual insurable earnings | $103,000.00 | $103,000.00 |
| Rate | **0.430%** | **0.602%** |
| Max annual premium | **$442.90** | **$620.06** |

QPIP employee premiums are creditable at 14% federally.

---

## 6. Employment Insurance (EI) — 2026

| | Canada except Quebec | Quebec |
|---|---|---|
| Maximum annual insurable earnings (MIE) | **$68,900.00** | **$68,900.00** |
| **Employee rate** | **1.63%** ($1.63 per $100) | **1.30%** ($1.30 per $100) |
| **Max annual employee premium** | **$1,123.07** | **$895.70** |
| Employer rate | 2.282% (= 1.4 × employee) | 1.820% (= 1.4 × employee) |
| Max annual employer premium | **$1,572.30** | **$1,253.98** |

Quebec's lower EI rate exists because Quebec administers QPIP, so the federal EI parental-benefit component is carved out. A Quebec employee's *total* EI+QPIP employee cost at/above the ceilings is $895.70 + $442.90 = **$1,338.60**, vs $1,123.07 elsewhere.

**No basic exemption for EI** — premiums apply from the first dollar of insurable earnings.

### Per-pay-period formula (T4127 Chapter 7)
```
EI = lesser of  (i)  $1,123.07 − D1        [Quebec: $895.70 − D1]
                (ii) 0.0163 × IE           [Quebec: 0.0130 × IE, round to $0.01]
```
`IE` = insurable earnings this period (includes bonuses, retro pay, insurable taxable benefits); `D1` = YTD EI premiums with this employer.

**Province change mid-year, same employer:** the maximum is based on where the first $68,900 of insurable earnings is paid. CRA's own example: $30,000 in Ontario × 1.63% = $489.00, then $38,900 in Quebec × 1.30% = $505.70, total insurable $68,900, total premium **$994.70**.

Employer EI is 1.4× the employee premium (reducible under the EI Premium Reduction Program for employers with a qualifying wage-loss plan — out of scope for a take-home calculator).

---

## 7. No other federal levies

There is **no** federal social-security levy beyond CPP/QPP and EI/QPIP, **no** federal health levy, **no** federal surtax, and **no** solidarity/Medicare-style contribution for employees. (Ontario Health Premium and BC/QC health-adjacent levies are provincial.)

**Employer package contributions** conventionally quoted: CPP employer 5.95% + CPP2 4% (max $4,646.45), EI employer 2.282% (max $1,572.30). Both are federal statutory. Employer pension contributions beyond CPP are voluntary/plan-specific. There is no federal superannuation mandate.

---

## 8. Complete calculation algorithm (CRA Option 1, T4127)

For an ordinary salaried employee, per pay period, `P` periods per year:

```
1. C   = CPP contribution this period            (§4)
   C2  = CPP2 contribution this period           (§4)
   EI  = EI premium this period                  (§6)
   F5  = C × (0.0100/0.0595) + C2                [Quebec: C × (0.0100/0.0630) + C2]
         (if C = 0 and C2 = 0 then F5 = 0)

2. A   = P × (I − F − F2 − F5A − U1) − HD − F1
         I  = gross pay for the period incl. taxable benefits
         F  = RPP / RRSP / PRPP / RCA deducted at source
         F5A= F5 attributable to periodic income
         U1 = union dues
         HD = northern-residents deduction; F1 = authorised annual deductions
         If A < 0 → total tax T = L (extra tax requested only).

3. Look up R and K for A                          (§1)

4. TC   = total claim from Form TD1, else BPAF(NI) where NI = A + HD   (§2)
   K1   = 0.14 × TC
   K2   = 0.14 × min(P × C × (0.0495/0.0595), $3,519.45 × PM/12)
        + 0.14 × min(P × EI, $1,123.07)
        [Quebec K2Q = 0.14 × min(P × C × (0.0530/0.0630), $3,768.30 × PM/12)
                    + 0.14 × min(P × EI, $895.70)
                    + 0.14 × min(P × IE × 0.0043, $442.90)]
   K3   = other authorised credits
   K4   = min(0.14 × employment income, 0.14 × $1,501)

5. T3 = (R × A) − K − K1 − K2 − K3 − K4      floor at $0

6. T1 = T3 − (P × LCF)                        floor at $0
   Quebec:            T1 = (T3 − P×LCF) − 0.165 × T3
   Outside Canada:    T1 = T3 + 0.48 × T3 − P×LCF

7. T (this period, federal only) = T1 / P
```

Optional YTD-accurate variant for K2: replace `P × C × (0.0495/0.0595)` with the lesser of `$3,519.45 × PM/12` and `(D × 0.0495/0.0595) + (PR × C × 0.0495/0.0595)`; replace `P × EI` with the lesser of `$1,123.07` and `D1 + PR × EI`. `PR` = pay periods remaining incl. current.

**Take-home pay = gross − federal tax − provincial tax − C − C2 − EI (− QPIP in Quebec) − other voluntary deductions.**

---

## 9. Worked examples published by CRA

All from **T4032-ON, Payroll Deductions Tables, Ontario, effective 1 January 2026**, "Step-by-step calculation of tax deductions". Federal lines are jurisdiction-independent; the Ontario lines are shown for completeness but are out of scope.

### Example A — "Annual Pensionable Income Below YMPE"
Weekly pay $1,300, P=52, $80/week RRSP deducted at source, claim code 1 (BPA only), Ontario.

| Step | Value |
|---|---|
| CPP: 0.0595 × (1,300 − 3,500/52) | **$73.35** |
| EI: 0.0163 × 1,300 | **$21.19** |
| CPP first-additional deduction: 73.35 × (0.0100/0.0595) | $12.33 |
| RRSP | $80.00 |
| Net remuneration for the period | $1,207.67 |
| **A** = 1,207.67 × 52 | **$62,798.84** |
| Basic federal tax 62,798.84 × 0.205 | $12,873.76 |
| less K | −$3,804.00 |
| Federal tax before credits | $9,069.76 |
| Credits base: TC 16,452.00 + CPP base (73.35 × 0.0495/0.0595 × 52 = 3,173.04) + EI (21.19 × 52 = 1,101.88) + CEA 1,501.00 | $22,227.92 |
| × 0.14 | −$3,111.91 |
| **Annual federal tax (T1)** | **$5,957.85** |
| Ontario annual tax (for reference) | $3,264.26 |
| Total annual tax | $9,222.11 |
| **Tax deduction per weekly pay period** | **$177.35** |

### Example B — "Pensionable Income Above YMPE"
Weekly pay $1,600, P=52, claim code 1, Ontario. CPP max $4,230.45 and EI max $1,123.07 already reached; CPP2 YTD (D2) = $24.00; YTD pensionable income $75,200.

| Step | Value |
|---|---|
| CPP2: lesser of (416.00 − 24.00 = 392.00) and ((75,200 + 1,600 − 75,200) × 0.04 = 64.00), W = max(75,200; 74,600) = 75,200 | **$64.00** |
| Net remuneration 1,600 − 64 | $1,536.00 |
| **A** = 1,536 × 52 | **$79,872.00** |
| 79,872.00 × 0.205 | $16,373.76 |
| less K | −$3,804.00 |
| Federal tax before credits | $12,569.76 |
| Credits base: 16,452.00 + 3,519.45 + 1,123.07 + 1,501.00 | $22,595.52 |
| × 0.14 | −$3,163.37 |
| **Annual federal tax (T1)** | **$9,406.39** |
| Ontario annual tax (for reference) | $4,957.90 |
| Total annual tax | $14,364.29 |
| **Tax deduction per weekly pay period** | **$276.24** |

### Example C — EI province change (T4127 Chapter 7)
$30,000 insurable in Ontario @1.63% = $489.00; then $38,900 with same employer in Quebec @1.30% = $505.70. Total insurable $68,900 → **$994.70**.

### Example D — Table-lookup cross-check (T4032-ON)
Ontario employee "Sara", $615/week in 2026, federal claim code 1, provincial claim code 1 → federal tax deduction **$31.95**/week, Ontario **$22.05**/week, total **$54.00**/week.

**Also available for live verification:** CRA's Payroll Deductions Online Calculator (PDOC) at canada.ca/pdoc. CRA notes the T4127 formulas are *more precise* than PDOC, so treat PDOC as corroboration, not ground truth.

---

## 10. What changed for 2026 vs 2025 (a stale implementation will get these wrong)

1. **Lowest bracket is 14% for the full year.** The rate cut from 15% took effect **1 July 2025**, so 2025 used a blended **14.5%** effective rate for the year and a prorated 13.5% in H2 payroll. For 2026 it is a clean **14.00%** everywhere, including as the non-refundable-credit rate (`K1 = 0.14 × TC`, previously 0.15/0.145).
2. **All brackets indexed +2.0%** (2025 was +2.7%): 57,375→58,523; 114,750→117,045; 177,882→181,440; 253,414→258,482.
3. **BPA:** max 16,129 → **16,452**; min 14,538 → **14,829**; enhanced portion 1,591 → **1,623**; taper window moved to 181,440–258,482.
4. **CPP:** YMPE 71,300 → **74,600**; YAMPE 81,200 → **85,000**; max total contribution 4,034.10 → **4,230.45**; max CPP2 396.00 → **416.00**; max base (creditable) 3,356.10 → **3,519.45**. Rates unchanged (5.95% / 4.00%).
5. **QPP employee rate cut: 6.40% → 6.30%** (base 5.40% → **5.30%**). Max QPP 4,339.20 → **4,479.30**; max base 3,661.20 → **3,768.30**. This is a real rate change, not just indexation.
6. **EI:** MIE 65,700 → **$68,900**; non-Quebec rate 1.64% → **1.63%**, max 1,077.48 → **$1,123.07**; Quebec rate 1.31% → **1.30%**, max 860.67 → **$895.70**. Employer rates 2.296% → 2.282% and 1.834% → 1.820%.
7. **CEA:** 1,471 → **$1,501**.
8. **Canada Groceries and Essentials Benefit** replaces the GST/HST credit name and is **25% higher from July 2026** (adult $349 → $445).
9. **T4127 123rd edition (1 July 2026)** exists but changes **nothing federal** — only BC (lowest rate 5.06% → 5.60%, prorated 6.14% for H2), NL (BPA 11,188 → 13,094, prorated 15,000 for H2) and PE (new 20% bracket over $200,000, prorated 21% for H2). A federal-only calculator needs no mid-year switch.

---

## 11. Non-residents (one line)

Non-residents are taxed only on Canadian-source employment income at the same federal rates, get **TC = $0** (no BPA in payroll unless ≥90% of world income is Canadian-source and Form TD1 is filed), and pay a **48% federal surtax in lieu of provincial tax** on income not earned in a province.

---

## 12. Caveats

1. All federal 2026 figures above are confirmed from CRA primary sources fetched 20 July 2026 — no extrapolation. Confidence **high**.
2. The **CWB phase-out *rates*** (percentage reduction above the phase-out thresholds) are not stated on the CRA indexation page and were not confirmed in this session; only the maximums and threshold amounts above are verified. An implementer needs the Income Tax Act s.122.7 rate (historically 15%) confirmed separately before coding CWB.
3. Likewise the **age-amount and Canada-caregiver reduction rates** (historically 15% of income over the threshold) were not re-confirmed from a fetched source; the *amounts* and *thresholds* are confirmed.
4. The **CPP base-rate cut to 4.75% effective 1 Jan 2027** was announced 28 April 2026 and is stated in T4127 as an intention. Do not apply it to 2026, and treat 2027 as not yet legislated.
5. PE's 5th-bracket line in T4127 Table 8.1 (122nd ed.) carries an "*Updated May 2026*" footnote — a reminder that CRA amends these tables mid-year. Re-check Table 8.1 before each release. (Federal rows were not affected.)
6. Provincial/territorial tax, surtaxes (Ontario), health premiums (Ontario), and provincial tax reductions (ON/BC) are **excluded by scope** but are required for an actual take-home figure. Quebec residents file a separate provincial return with Revenu Québec and receive the 16.5% federal abatement.
7. Quebec figures here (QPP, QPIP, Quebec EI) are given because they are federal-payroll-relevant; Quebec *provincial income tax* is administered by Revenu Québec and is not in CRA's tables.
8. Employer EI at 1.4× can be reduced under the EI Premium Reduction Program; the 2.282%/1.820% figures are the unreduced standard rates.

---

## Sources (all fetched 20 July 2026)

**Primary — Canada Revenue Agency / Government of Canada:**
- T4127, Payroll Deductions Formulas, **123rd edition, effective 1 July 2026** — https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jul/t4127-jul-payroll-deductions-formulas.html
- T4127, Payroll Deductions Formulas, **122nd edition, effective 1 January 2026** (Tables 8.1–8.9, BPAF formula, Chapters 6 & 7) — https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4127-payroll-deductions-formulas/t4127-jan/t4127-jan-payroll-deductions-formulas-computer-programs.html
- T4032-ON, Payroll Deductions Tables, Ontario, January 2026 — general information & step-by-step worked examples — https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032on-jan/t4032on-january-general-information.html
- Current year tax rates and income brackets (2026) — https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html
- Indexation adjustment for personal income tax and benefit amounts — https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/adjustment-personal-income-tax-benefit-amounts.html
- CPP contribution rates, maximums and exemptions — https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html
- EI premium rates and maximums — https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html
- ESDC — Canada Employment Insurance Commission sets the 2026 EI premium rate — https://www.canada.ca/en/employment-social-development/news/2025/09/canada-employment-insurance-commission-sets-the-2026-employment-insurance-premium-rate.html
- ESDC — Important notice about maximum insurable earnings for 2026 — https://www.canada.ca/en/employment-social-development/programs/ei/ei-list/ei-employers/premium-reduction-program/2026-maximum-insurable-earnings.html
- CRA Payroll Deductions Online Calculator (PDOC) — https://www.canada.ca/en/revenue-agency/services/e-services/digital-services-businesses/payroll-deductions-online-calculator.html

**Method note:** WebFetch and plain curl both returned HTTP 403 against canada.ca. All figures were read from the live rendered CRA pages via the browser tool, plus WebSearch restricted to `canada.ca` for corroboration of the EI and CPP headline numbers.
