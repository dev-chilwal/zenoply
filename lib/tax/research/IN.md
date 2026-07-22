# India — Personal Income Tax & Employee Payroll Deductions
## Implementation spec for a take-home-pay calculator, as at 20 July 2026

---

## 0. THE HEADLINE FOR AN IMPLEMENTER

Two things changed on 1 April 2026 and a stale FY 2025-26 implementation will get them wrong:

1. **A brand-new statute.** The **Income-tax Act, 2025 (Act No. 30 of 2025)** came into force on
   **1 April 2026** and replaces the Income-tax Act, 1961 for FY 2026-27 onwards. All section
   numbers changed. "Previous year"/"Assessment year" are replaced by a single **"tax year"**.
   The 1961 Act still governs AY 2026-27 (income earned up to 31 March 2026).
2. **The numbers did NOT change.** The Union Budget presented 1 February 2026 (Finance Bill, 2026 /
   Bill No. 3 of 2026) made **no change** to the slabs, the standard deduction, the rebate, the
   surcharge thresholds or the cess. Rates for tax year 2026-27 are identical to FY 2025-26.

So: **keep the arithmetic, change the labels.**

| Concept | Old section (IT Act 1961) | New section (IT Act 2025) |
|---|---|---|
| New (default) regime slabs | 115BAC(1A) | **s.202(1)** |
| Rebate ("87A") | 87A | **s.156** |
| Standard deduction / salary deductions | 16(ia), 16(iii) | **s.19(1) Table** |
| 80C | 80C | **s.123 + Schedule XV** |
| 80CCD(1B) / 80CCD(2) | 80CCD | **s.124(3) / s.124(1)–(2)** |
| 80D | 80D | **s.126** |
| 80TTA / 80TTB | 80TTA / 80TTB | **s.153(2)(a) / s.153(2)(b)** |
| 80U (disability) | 80U | **s.154** |
| HRA exemption | 10(13A) | **Schedule III, Table Sl. No. 11** |

---

## 1. TAX YEAR IN EFFECT ON 20 JULY 2026

- **Tax year 2026-27 = 1 April 2026 → 31 March 2027.** This is the year currently being *earned*
  and against which TDS is being deducted from salary today. Under the new Act there is no
  separate "assessment year"; the old-style label would be AY 2027-28.
- Returns being **filed** in July 2026 are for FY 2025-26 (AY 2026-27), governed by the 1961 Act.
  A take-home calculator should default to **tax year 2026-27**.
- Statutory authority: **Finance Act, 2026 s.3(1)** — "for the tax year commencing on the 1st day
  of April, 2026, income-tax shall be charged under the provisions of the Income-tax Act, 2025 …
  at the rates specified in Part I-B of the First Schedule".

---

## 2. NEW TAX REGIME (DEFAULT) — s.202(1), IT Act 2025

Applies automatically to every individual, HUF, AOP, BOI and artificial juridical person unless
they opt out under s.202(4).

| # | Total income (₹) | Rate |
|---|---|---|
| 1 | Up to 4,00,000 | Nil |
| 2 | 4,00,001 – 8,00,000 | 5% |
| 3 | 8,00,001 – 12,00,000 | 10% |
| 4 | 12,00,001 – 16,00,000 | 15% |
| 5 | 16,00,001 – 20,00,000 | 20% |
| 6 | 20,00,001 – 24,00,000 | 25% |
| 7 | Above 24,00,000 | 30% |

**No age-based variation.** Senior and super-senior citizens get the same ₹4,00,000 threshold.

Cumulative tax at band edges (before rebate/cess):

```
400000  →        0
800000  →    20000
1200000 →    60000
1600000 →   120000
2000000 →   200000
2400000 →   300000
```

Formula (piecewise):
```js
const NEW_SLABS = [
  [400000, 0.00],[800000, 0.05],[1200000, 0.10],[1600000, 0.15],
  [2000000, 0.20],[2400000, 0.25],[Infinity, 0.30]
];
```

### 2.1 What is NOT allowed under the new regime — s.202(2)
Disallowed: HRA exemption (Sch III Sl. No. 11), leave travel concession (Sl. No. 5/6/7/8),
most special allowances (Sl. No. 12/13, except prescribed ones), s.144, **s.19(1) Table Sl. No. 1
(professional tax deduction)**, house-property interest on let-out set-off against other heads,
and **the whole of Chapter VIII (all the 80-series deductions) EXCEPT s.124(1), s.124(2)
(employer NPS), s.125(2) (Agniveer), and s.146 (80JJAA)**.
Also: no set-off of brought-forward loss/depreciation attributable to those deductions, and
**no set-off of house-property loss against any other head**.

Allowed under the new regime: the **₹75,000 standard deduction** (s.19(1) Table Sl. No. 2(a)),
**employer NPS contribution up to 14% of salary** (s.124(2)), employer EPF contribution
(not income in the employee's hands within limits), gratuity/leave-encashment exemptions,
and prescribed conveyance/tour allowances.

---

## 3. OLD REGIME — First Schedule, Part I-B, Paragraph A (Finance Act, 2026)

Available only by exercising the option under s.202(4). Unchanged for tax year 2026-27.

**(I) Individual under 60 (and HUF/AOP/BOI/AJP)**

| Total income (₹) | Tax |
|---|---|
| Up to 2,50,000 | Nil |
| 2,50,001 – 5,00,000 | 5% of excess over 2,50,000 |
| 5,00,001 – 10,00,000 | ₹12,500 + 20% of excess over 5,00,000 |
| Above 10,00,000 | ₹1,12,500 + 30% of excess over 10,00,000 |

**(II) Resident individual aged 60–79 ("senior citizen")**

| Total income (₹) | Tax |
|---|---|
| Up to 3,00,000 | Nil |
| 3,00,001 – 5,00,000 | 5% of excess over 3,00,000 |
| 5,00,001 – 10,00,000 | ₹10,000 + 20% of excess over 5,00,000 |
| Above 10,00,000 | ₹1,10,000 + 30% of excess over 10,00,000 |

**(III) Resident individual aged 80+ ("super senior citizen")**

| Total income (₹) | Tax |
|---|---|
| Up to 5,00,000 | Nil |
| 5,00,001 – 10,00,000 | 20% of excess over 5,00,000 |
| Above 10,00,000 | ₹1,00,000 + 30% of excess over 10,00,000 |

---

## 4. STANDARD DEDUCTION & OTHER SALARY DEDUCTIONS — s.19(1) Table

| Sl. | Deduction | Amount |
|---|---|---|
| 1 | Professional tax / tax on employment (Art. 276(2)) | Entire amount actually paid. **Not allowed under the new regime** (s.202(2)(a)(iv)). |
| 2 | **Standard deduction** | **(a) ₹75,000** (or salary if lower) where tax is computed under s.202(1) — i.e. the new regime; **(b) ₹50,000** (or salary if lower) in any other case — i.e. the old regime. |
| 3 | Death-cum-retirement gratuity | Entire amount (subject to Schedule limits) |
| 4 | Retiring gratuity under Pension Code (defence) | Entire amount |

Consequence: **zero-tax salary under the new regime = ₹12,75,000 gross**
(₹12,75,000 − ₹75,000 = ₹12,00,000 → rebate wipes out the tax).
Confirmed in the Finance Minister's own words (PIB): "no income tax payable upto income of
Rs. 12 lakh … This limit will be Rs. 12.75 lakh for salaried tax payers, due to standard
deduction of Rs. 75,000."

---

## 5. REBATE — s.156, IT Act 2025 (successor to s.87A)

### 5.1 Old regime — s.156(1)
Resident individual, total income ≤ **₹5,00,000** → rebate = **min(tax, ₹12,500)**.

### 5.2 New regime — s.156(2)
Resident individual whose income is charged under s.202(1):

- **s.156(2)(a)** — total income ≤ **₹12,00,000** → rebate = **min(tax payable, ₹60,000)**.
- **s.156(2)(b) — MARGINAL RELIEF.** Where total income **exceeds ₹12,00,000** and the tax payable
  exceeds the amount by which income exceeds ₹12,00,000, the rebate =
  `tax_payable − (total_income − 12,00,000)`.
- **s.156(3)** — the s.156(2) rebate cannot exceed tax computed at s.202(1) rates (i.e. it does
  not shelter special-rate income such as capital gains).

Marginal relief in code:
```js
function rebateNew(totalIncome, taxBeforeRebate) {
  if (totalIncome <= 1200000) return Math.min(taxBeforeRebate, 60000);
  const excess = totalIncome - 1200000;
  if (taxBeforeRebate > excess) return taxBeforeRebate - excess;   // s.156(2)(b)
  return 0;
}
```
Effect: the new regime's marginal-relief band runs from ₹12,00,000 up to about
**₹12,75,000** of *total* income, where 15% slab tax finally equals the excess.
(At ₹12,75,000: tax = 60,000 + 15%×75,000 = 71,250; excess = 75,000 → 71,250 < 75,000, so
relief = 0 and full tax is payable. The break-even is ₹12,70,588 approx.; below it relief applies.)

**Important:** rebate is available only to **residents**. Non-residents get no s.156 rebate.

---

## 6. SURCHARGE

Levied on the income-tax *before* cess, on **total income** (not on tax).

### 6.1 New regime (s.202) — Finance Act 2026 s.3(4), Table Sl. No. 10
**Maximum 25%. The 37% band does NOT apply.**

| Total income (₹) | Surcharge |
|---|---|
| ≤ 50,00,000 | Nil |
| > 50,00,000 ≤ 1,00,00,000 | 10% |
| > 1,00,00,000 ≤ 2,00,00,000 | 15% |
| > 2,00,00,000 | **25%** |

(Surcharge on the portion of income that is dividend or capital gains under ss.196/197/198
is capped at 15%.)

### 6.2 Old regime — First Schedule Part I-B, Paragraph F, Table 1, Sl. No. 1
**Maximum 37%.**

| Total income (₹) | Surcharge |
|---|---|
| ≤ 50,00,000 | Nil |
| > 50,00,000 ≤ 1,00,00,000 | 10% |
| > 1,00,00,000 ≤ 2,00,00,000 | 15% |
| > 2,00,00,000 ≤ 5,00,00,000 | 25% |
| > 5,00,00,000 | 37% |

(Excluding dividend/capital-gains income for the 25% and 37% bands; on that part surcharge is
capped at 15%.)

### 6.3 Surcharge marginal relief — Finance Act 2026 s.3(5) (new regime) and
### First Schedule Part I-B Paragraph F Table 2 (old regime)

Statutory formula, verbatim: `Wn = Un + Vn` where
- `Wn` = the cap on total (income-tax + surcharge)
- `Un` = income-tax + surcharge payable on the **threshold** amount (column C)
- `Vn` = total income − threshold amount

```js
function applyMarginalReliefSurcharge(totalIncome, taxPlusSur, thresholds, calcTaxPlusSur) {
  for (const T of thresholds) {           // [5000000, 10000000, 20000000, (50000000 old only)]
    if (totalIncome > T) {
      const cap = calcTaxPlusSur(T) + (totalIncome - T);
      if (taxPlusSur > cap) taxPlusSur = cap;
    }
  }
  return taxPlusSur;
}
```
Thresholds: **new regime** ₹50,00,000 / ₹1,00,00,000 / ₹2,00,00,000.
**Old regime** ₹50,00,000 / ₹1,00,00,000 / ₹2,00,00,000 / ₹5,00,00,000.

---

## 7. HEALTH AND EDUCATION CESS

**4%** of (income-tax + surcharge), after rebate and after surcharge marginal relief.
Authority: Finance Act, 2026 s.3(15) and s.3(16) — "…an additional surcharge … to be called the
'Health and Education Cess on income-tax', calculated at the rate of 4% of such income-tax and
surcharge…". No exemption, no ceiling, applies to every taxpayer including the lowest slab.

---

## 8. FULL COMPUTATION ORDER (implement exactly in this sequence)

```
1.  Gross salary (basic + DA + HRA + allowances + perquisites + bonus)
2.  Less exempt allowances:
      NEW: only prescribed ones (conveyance for disabled, tour/transfer, daily allowance)
      OLD: HRA (Sch III Sl.11), LTC, children education (₹100/mo/child, max 2),
           hostel (₹300/mo/child, max 2), transport allowance
3.  Less standard deduction: 75,000 (new) / 50,000 (old)
4.  Less professional tax actually paid          [OLD REGIME ONLY]
5.  Less entertainment allowance (govt employees only, old regime)
    => Income under head "Salaries"
6.  Add other income; less house-property interest
      NEW: self-occupied interest NOT deductible; let-out loss not set off vs salary
      OLD: self-occupied up to ₹2,00,000; set-off vs other heads capped at ₹2,00,000/yr
7.  Less Chapter VIII deductions
      NEW: only s.124(2) employer NPS ≤14% of salary, s.125(2), s.146
      OLD: s.123 (₹1,50,000), s.124(3) (₹50,000), s.126, s.153, s.154, etc.
    => TOTAL INCOME  (round down to nearest ₹10 — s.394-equivalent rounding)
8.  Tax at slab rates (s.202(1) new / Part I-B Para A old)
9.  Less rebate s.156
10. Add surcharge (on tax after rebate), then apply surcharge marginal relief
11. Add 4% Health & Education Cess
12. Round total tax to nearest ₹10
```

---

## 9. OLD-REGIME DEDUCTION LIMITS (the ones that matter for an employee)

| Item | New Act s. | Limit (₹) |
|---|---|---|
| s.80C basket (EPF employee share, PPF, ELSS, life insurance, principal on home loan, tuition fees, NSC, 5-yr FD…) — **Schedule XV** | **123** | **1,50,000** |
| Employer contribution to NPS | **124(1)/(2)** | 10% of salary (old regime); **14% of salary (new regime, s.124(2))**; 14% if employer is Central/State Govt |
| Employee's own NPS (Tier-I) — "80CCD(1B)" | **124(3)/(4)** | **50,000** (over and above the 1,50,000) |
| Health insurance — self/family | **126(2)(a)** | **25,000** (₹50,000 if the insured is a senior citizen — s.126(8)(a)) |
| Health insurance — parents | **126(2)(b)** | **25,000** (₹50,000 if parent is a senior citizen) |
| Preventive health check-up (within the above) | **126(3)** | **5,000** |
| Medical expenditure on senior citizen (no insurance in force) | **126(2)(c)/(d)** | **50,000**; overall cap per limb **50,000** (s.126(4)) |
| Savings-account interest ("80TTA") | **153(2)(a)** | **10,000** |
| Senior-citizen deposit interest ("80TTB") | **153(2)(b)** | **50,000** (all deposits incl. time deposits) |
| Disability — self | **154(1)** | **75,000**; **1,25,000** for severe disability |
| Home-loan interest, self-occupied | 22/21 | **2,00,000** |

### HRA exemption (old regime only) — Schedule III, Table Sl. No. 11
Exempt = **least of**:
1. Actual HRA received;
2. Rent paid − 10% of (basic + DA);
3. **50%** of (basic + DA) if the accommodation is in Delhi, Mumbai, Kolkata or Chennai;
   otherwise **40%**.
The Act itself says "to such extent as may be prescribed having regard to the area or place"
(s. Sch III Sl. 11(b)); the 50/40 split is in the Rules.

---

## 10. EMPLOYEE PAYROLL DEDUCTIONS

### 10.1 EPF — Employees' Provident Fund

Now governed by the **Code on Social Security, 2020**, in force from **21 November 2025**
(it subsumes the EPF & MP Act, 1952).

| Item | Value |
|---|---|
| **Wage ceiling** | **₹15,000 per month** — retained by Ministry of Labour & Employment notification dated **29 May 2026** under the Code on Social Security, 2020. Unions had asked for ₹25,000; the government said no. Unchanged since 1 Sept 2014. |
| **Employee contribution** | **12%** of (basic + DA + retaining allowance). Mandatory only on the first ₹15,000/month → **₹1,800/month** minimum-statutory. Most employers deduct 12% of *full* basic; both practices exist and a calculator should let the user choose. |
| **Employer contribution** | **12%**, split: **8.33% to EPS** (capped at ₹15,000 → **₹1,250/month max**) + **3.67% to EPF** (the balance). |
| **EDLI (employer)** | **0.50%** of EPS wages (capped at ₹15,000 → **₹75/month**), min ₹200/month/establishment. |
| **EPF administrative charges (employer)** | **0.50%** of EPF wages, **minimum ₹500/month** per establishment. |
| **EDLI administrative charges** | **Nil** (waived since 1 April 2017). |
| Mandatory coverage | Establishments with 20+ employees; employees drawing basic+DA ≤ ₹15,000 must join. Above ₹15,000 → "excluded employee", voluntary (but almost universally continued in practice). |
| Reduced rate | 10% instead of 12% for certain sick/notified establishments and those with <20 employees. |

**Total employer statutory outgo on EPF ≈ 13.00% of EPF wages** (12% + 0.5% EDLI + 0.5% admin),
which is why CTC sheets quote ~13%.

Tax treatment:
- Employee's 12% share → deductible under s.123 (₹1.5 lakh basket), **old regime only**.
- Employer's contribution → exempt up to the aggregate ₹7,50,000/year cap on employer
  contributions to EPF + NPS + superannuation combined; excess is a taxable perquisite,
  plus accretion thereon.
- Interest on the **employee's own** contribution above **₹2,50,000 in a year** is taxable
  (₹5,00,000 where the employer makes no contribution).

### 10.2 EPS — Employees' Pension Scheme
Funded entirely by the employer's 8.33% (capped ₹1,250/month) plus a 1.16% Central Government
contribution on wages up to ₹15,000. **No employee deduction.**

### 10.3 ESI — Employees' State Insurance

| Item | Value |
|---|---|
| **Employee contribution** | **0.75%** of gross wages |
| **Employer contribution** | **3.25%** of gross wages |
| **Total** | **4.00%** |
| **Wage ceiling (coverage)** | **₹21,000/month gross** (**₹25,000** for persons with disability) |
| Exemption | Employees with average daily wage ≤ **₹176** pay **no employee share**; the employer still pays 3.25%. |
| Applicability | Establishments with 10+ employees (20+ in some states) in notified areas. |
| Contribution periods | Apr–Sep and Oct–Mar; benefit periods Jan–Jun and Jul–Dec. Once covered at the start of a period, coverage continues to the end of that period even if wages cross ₹21,000. |
| Rates last changed | 1 July 2019 (from 6.5% total). **Unchanged in 2026.** |

For an ordinary salaried calculator, ESI applies only to gross ≤ ₹21,000/month, so most
white-collar users will have ₹0 here.

### 10.4 Gratuity

| Item | Value |
|---|---|
| **Formula** | `Last drawn wages (basic + DA) × 15 / 26 × completed years of service` (part-year > 6 months rounds up) |
| **CTC accrual convention** | **4.81% of basic+DA** — this is exactly `(15 ÷ 26) ÷ 12 = 0.048077`. Employers book this monthly in CTC. It is an **employer cost, not an employee deduction**, and is not received monthly. |
| **Eligibility** | 5 years' continuous service; waived on death or permanent disablement. **Fixed-term employees now qualify pro-rata after 1 year** under the Code on Social Security, 2020 (from 21 Nov 2025). |
| **Statutory max payable** | ₹20,00,000 |
| **Income-tax exemption (private sector)** | **₹20,00,000** lifetime (notified limit). Government employees: fully exempt. |
| Non-covered establishments | Formula uses ÷30 instead of ÷26 and half-month's average salary of last 10 months. |

### 10.5 Professional tax (state "tax on employment")

Levied by **states**, not the Centre. **Constitutional ceiling ₹2,500 per person per year**
(Article 276(2)). Deducted monthly by the employer. **Deductible from salary income under
s.19(1) Table Sl. No. 1 — old regime only.**

| State | Monthly slabs (gross/monthly salary) |
|---|---|
| **Maharashtra** | Men: ≤ ₹7,500 nil; ₹7,501–₹10,000 → ₹175; > ₹10,000 → ₹200/mo (**₹300 in February**). Women: nil up to ₹25,000. Annual ₹2,500. |
| **Karnataka** | ≤ ₹24,999 nil; ≥ ₹25,000 → ₹200/mo (₹300 in February) = ₹2,500/yr |
| **West Bengal** | ≤ ₹10,000 nil; 10,001–15,000 → ₹110; 15,001–25,000 → ₹130; 25,001–40,000 → ₹150; > 40,000 → ₹200 |
| **Tamil Nadu** (half-yearly, Greater Chennai) | ≤ ₹3,500 nil; 3,501–5,000 → ₹22.50; 5,001–7,500 → ₹52.50; 7,501–10,000 → ₹115; 10,001–12,500 → ₹171; > 12,500 → ₹208 |
| **Telangana** | ≤ ₹15,000 nil; 15,001–20,000 → ₹150; > 20,000 → ₹200 |
| **Andhra Pradesh** | ≤ ₹15,000 nil; 15,001–20,000 → ₹150; > 20,000 → ₹200 |
| **Gujarat** | ≤ ₹12,000 nil; > ₹12,000 → ₹200 |
| **Madhya Pradesh** | ≤ ₹18,750 nil; 18,751–25,000 → ₹125; 25,001–33,333 → ₹167; > 33,333 → ₹208 (₹212 in the last month) |
| **Odisha** | ≤ ₹13,304 nil; 13,305–25,000 → ₹125; > 25,000 → ₹200 (₹300 in February) |
| **Kerala** (half-yearly, by local body) | Slabs up to ₹1,250 per half-year |
| **Assam** | ≤ ₹10,000 nil; 10,001–15,000 → ₹150; 15,001–25,000 → ₹180; > 25,000 → ₹208 |
| **Bihar / Jharkhand / Meghalaya / Sikkim / Tripura / Nagaland / Manipur / Mizoram / Puducherry** | Levied; slabs vary; all capped at ₹2,500/yr |

**No professional tax at all:** Delhi, Haryana, Punjab, Rajasthan, Uttar Pradesh, Uttarakhand,
Himachal Pradesh, Goa, Chandigarh, Jammu & Kashmir, Ladakh, Andaman & Nicobar, Arunachal Pradesh.

A pragmatic implementation: a per-state lookup with a `null` = "not levied", plus a flat
₹2,500/yr fallback with a warning, since the cap makes the maximum error ~₹2,500 of deduction
(worth ≤ ₹780 of tax at 30% + cess, and **zero** under the new regime where it is not deductible).

### 10.6 What the employee does NOT pay
There is **no separate national social-security, unemployment-insurance or health-levy
deduction** in India beyond EPF and (below ₹21,000) ESI. There is **no employee gratuity
deduction**. Labour Welfare Fund exists in some states but is trivial (₹6–₹36 per half-year).

---

## 11. THE NEW LABOUR CODES — the thing that actually changed take-home in 2026

The four labour codes (Code on Wages 2019; Industrial Relations Code 2020; **Code on Social
Security 2020**; OSH Code 2020) came into force **21 November 2025**.

**The 50% rule.** "Wages" = basic pay + dearness allowance + retaining allowance. Excluded
components (HRA, conveyance, overtime, bonus, employer PF contribution, etc.) **must not exceed
50% of total remuneration**; any excess is deemed to be wages.

Consequence for a calculator: for a fixed CTC, `basic + DA ≥ 50% of CTC`. That inflates the
EPF and gratuity base and therefore **reduces take-home by roughly 2–5%** for employees whose
basic was previously 30–40% of CTC.

Worked illustration (from industry guidance, ₹10 lakh CTC):

| Component | Pre-code | Post-code |
|---|---|---|
| Basic + DA | ₹3,50,000 (35%) | ₹5,00,000 (50%) |
| Allowances | ₹6,50,000 (65%) | ₹5,00,000 (50%) |
| Employee EPF @12% of basic/mo | 12% × ₹29,167 = **₹3,500** | 12% × ₹41,667 = **₹5,000** |
| Extra annual PF | — | **+₹18,000** |

Note the tension with §10.1: the **statutory** EPF obligation is still capped at ₹15,000/month
of wages, so an employer may lawfully cap contributions at ₹1,800/month. In practice most
formal-sector employers contribute on full basic. **Make this a user toggle.**

---

## 12. WORKED EXAMPLES

### 12.1 Authority-stated (PIB / Finance Minister, Budget speech)
- Total income **₹12,00,000** under the new regime → **tax = ₹0** (rebate).
- **Salaried** gross **₹12,75,000** under the new regime → **tax = ₹0**
  (₹75,000 standard deduction brings total income to ₹12,00,000).

### 12.2 Derived directly from s.202(1) + s.156 + 4% cess (arithmetic on the statutory table)

| Total income (₹) | Slab tax | Rebate s.156 | Tax after rebate | Cess 4% | **Total tax** |
|---|---|---|---|---|---|
| 4,00,000 | 0 | 0 | 0 | 0 | **0** |
| 8,00,000 | 20,000 | 20,000 | 0 | 0 | **0** |
| 10,00,000 | 40,000 | 40,000 | 0 | 0 | **0** |
| 12,00,000 | 60,000 | 60,000 | 0 | 0 | **0** |
| 12,10,000 | 61,500 | 51,500 (marg. relief) | 10,000 | 400 | **10,400** |
| 12,50,000 | 67,500 | 17,500 (marg. relief) | 50,000 | 2,000 | **52,000** |
| 12,75,000 | 71,250 | 0 | 71,250 | 2,850 | **74,100** |
| 16,00,000 | 1,20,000 | 0 | 1,20,000 | 4,800 | **1,24,800** |
| 20,00,000 | 2,00,000 | 0 | 2,00,000 | 8,000 | **2,08,000** |
| 24,00,000 | 3,00,000 | 0 | 3,00,000 | 12,000 | **3,12,000** |
| 50,00,000 | 10,80,000 | 0 | 10,80,000 | 43,200 | **11,23,200** |

Check ₹12,10,000: excess over 12L = 10,000; slab tax = 60,000 + 15%×10,000 = 61,500;
61,500 > 10,000 → rebate = 61,500 − 10,000 = 51,500; tax = 10,000; +4% = ₹10,400. ✔

Check ₹50,00,000: 3,00,000 + 30%×26,00,000 = 3,00,000 + 7,80,000 = 10,80,000. No surcharge
(income does not *exceed* 50 lakh). +4% = ₹11,23,200. ✔

### 12.3 Surcharge + marginal relief, new regime, ₹51,00,000 total income
```
Slab tax   = 300000 + 0.30 × (5100000 − 2400000) = 300000 + 810000 = 11,10,000
Surcharge  = 10% × 11,10,000 = 1,11,000
Tax+sur    = 12,21,000
Marginal relief cap (threshold ₹50,00,000):
   tax at 50,00,000 = 10,80,000, surcharge 0 → Un = 10,80,000
   Vn = 51,00,000 − 50,00,000 = 1,00,000
   Wn = 11,80,000  → cap applies (12,21,000 > 11,80,000)
Tax+sur after relief = 11,80,000
Cess 4%              = 47,200
TOTAL                = 12,27,200
```

### 12.4 End-to-end salaried example, tax year 2026-27, new regime
Employee in Bengaluru, gross CTC ₹18,00,000; basic+DA = 50% = ₹9,00,000
(₹75,000/mo); employer EPF on full basic.

```
Gross salary paid (CTC − employer EPF 12% − gratuity 4.81%)
   Employer EPF        = 12% × 900000            = 1,08,000
   Gratuity accrual    = 4.81% × 900000          =   43,290
   Gross salary        = 1800000 − 108000 − 43290 = 16,48,710
Employee EPF (12% of basic)                       = 1,08,000  (payroll deduction)
Professional tax (Karnataka, ₹200 × 11 + ₹300)    =    2,500  (payroll deduction,
                                                              NOT deductible in new regime)
Total income = 16,48,710 − 75,000 (std ded)       = 15,73,710
   → round down to ₹10                            = 15,73,710
Slab tax = 120000 + ... no: 15,73,710 is in the 12–16L band
         = 60,000 + 15% × (1573710 − 1200000)
         = 60,000 + 56,057 (15% × 373710 = 56,056.5)
         = 1,16,057  (→ 1,16,056.50, round at the end)
Rebate   = 0
Surcharge= 0
Cess 4%  = 4,642
Total tax= 1,20,699 → round to nearest ₹10 = ₹1,20,700
Monthly TDS ≈ 1,20,700 / 12 = ₹10,058

Monthly take-home = 16,48,710/12 − 1,08,000/12 − 2,500/12 − 10,058
                  = 1,37,393 − 9,000 − 208 − 10,058
                  ≈ ₹1,18,127
```
(This example is my own arithmetic from the statutory tables, not an authority publication.)

### 12.5 Old-regime comparison for the same person
```
Gross salary                          16,48,710
− standard deduction                     50,000
− professional tax                        2,500
− s.123 (EPF 1,08,000, capped)         1,50,000
− s.124(3) NPS (assume nil)                   0
Total income                          14,46,210 → 14,46,210
Slab tax = 1,12,500 + 30% × (1446210 − 1000000)
         = 1,12,500 + 1,33,863 = 2,46,363
Cess 4%  =    9,855
Total    = 2,56,218 → ₹2,56,220
```
New regime wins by ~₹1.35 lakh. This is typical: with only 80C used, the new regime beats the
old at essentially every salary level for tax year 2026-27.

---

## 13. ROUNDING RULES
- **Total income** rounded down to the nearest **₹10** before applying rates.
- **Tax payable / refund** rounded to the nearest **₹10**.
- Surcharge and cess computed on unrounded intermediate figures, rounded only at the end.

---

## 14. NON-RESIDENTS (one line, as scoped)
Non-residents are taxed only on India-sourced income; they get the **same slab rates and the
same ₹75,000 standard deduction** but **no s.156 rebate**, no ₹3,00,000/₹5,00,000 senior-citizen
basic exemption, and no s.153 interest deductions.

---

## 15. QUICK REFERENCE CONSTANTS (tax year 2026-27)

```js
const IN_TY_2026_27 = {
  taxYear: "2026-27",           // 1 Apr 2026 – 31 Mar 2027
  act: "Income-tax Act, 2025 (30 of 2025), as amended by Finance Act, 2026",
  newRegime: {
    slabs: [[400000,0],[800000,0.05],[1200000,0.10],[1600000,0.15],
            [2000000,0.20],[2400000,0.25],[Infinity,0.30]],
    standardDeduction: 75000,
    rebateLimitIncome: 1200000,
    rebateMax: 60000,
    rebateMarginalRelief: true,
    surcharge: [[5000000,0],[10000000,0.10],[20000000,0.15],[Infinity,0.25]],
    surchargeMarginalReliefThresholds: [5000000,10000000,20000000],
    employerNpsLimitPctOfSalary: 0.14,
    professionalTaxDeductible: false
  },
  oldRegime: {
    slabsUnder60: [[250000,0],[500000,0.05],[1000000,0.20],[Infinity,0.30]],
    slabs60to79:  [[300000,0],[500000,0.05],[1000000,0.20],[Infinity,0.30]],
    slabs80plus:  [[500000,0],[1000000,0.20],[Infinity,0.30]],
    standardDeduction: 50000,
    rebateLimitIncome: 500000,
    rebateMax: 12500,
    rebateMarginalRelief: false,
    surcharge: [[5000000,0],[10000000,0.10],[20000000,0.15],[50000000,0.25],[Infinity,0.37]],
    surchargeMarginalReliefThresholds: [5000000,10000000,20000000,50000000],
    employerNpsLimitPctOfSalary: 0.10,
    professionalTaxDeductible: true,
    section123Limit: 150000, npsSelfLimit: 50000,
    healthInsSelf: 25000, healthInsSelfSenior: 50000,
    healthInsParents: 25000, healthInsParentsSenior: 50000,
    savingsInterest80TTA: 10000, seniorInterest80TTB: 50000,
    homeLoanInterestSelfOccupied: 200000
  },
  cess: 0.04,
  epf: { employeePct: 0.12, employerPct: 0.12, epsPct: 0.0833, epfEmployerBalPct: 0.0367,
         wageCeilingMonthly: 15000, epsCapMonthly: 1250,
         edliPct: 0.005, edliCapMonthly: 75, adminPct: 0.005, adminMinMonthly: 500 },
  esi:  { employeePct: 0.0075, employerPct: 0.0325,
          wageCeilingMonthly: 21000, disabledCeilingMonthly: 25000,
          dailyWageExemptionThreshold: 176 },
  gratuity: { ctcAccrualPct: 0.0481, formulaDaysNumerator: 15, formulaDaysDenominator: 26,
              eligibilityYears: 5, fixedTermEligibilityYears: 1,
              statutoryMax: 2000000, taxExemptMaxPrivate: 2000000 },
  professionalTaxAnnualCap: 2500,
  rounding: { totalIncomeToNearest: 10, taxToNearest: 10 }
};
```
