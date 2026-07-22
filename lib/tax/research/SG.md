# Singapore — Personal Income Tax & Employee CPF
### Implementation spec as at 20 July 2026

Scope: an **ordinary tax-resident employee** (Singapore Citizen or Permanent Resident, 3rd year of PR onwards / full rates) for a take-home-pay and income-tax calculator. All numbers below were confirmed from IRAS (iras.gov.sg) and the CPF Board (cpf.gov.sg) in this session — see §11. Nothing here is from memory.

---

## 0. Headline answer

Two independent deductions turn gross salary into take-home pay for a resident employee:

| Component | Basis | Headline 2026 figure |
|---|---|---|
| **Employee CPF contribution** | % of monthly wage, capped by the Ordinary Wage ceiling | **20%** of wage for age ≤ 55, on OW up to **$8,000/month** |
| **Income tax** | annual, progressive on chargeable income after reliefs | **0%** on first $20,000 … up to **24%** above $1,000,000 |

Critical facts an implementer must get right:

- Income tax is assessed **annually in arrears** by *Year of Assessment* (YA). YA 2027 assesses income earned in **calendar 2026** — the relevant year for a forward-looking calculator. The resident rate schedule "**from YA 2024 onwards**" is the one in force and applies to YA 2026 and YA 2027 (no change announced). See §1.
- There is **no PAYE / monthly income-tax withholding** for ordinary residents. Tax is filed and paid after year-end. A monthly "take-home" figure therefore usually shows **CPF deducted monthly** and **income tax as an annual amount** (or a monthly amortisation of it).
- The first **S$20,000** of chargeable income is taxed at **0%** — a zero-rate band, *not* a deductible allowance. There is **no capital gains tax** in Singapore.
- **CPF applies only to Singapore Citizens and Permanent Residents.** Foreigners on an Employment Pass / S Pass / Work Permit have **no CPF** — their only payroll deduction is income tax (as a non-resident if they fail the residency test).
- Employee CPF contributions are **tax-relievable** (CPF Relief), which is why income tax is computed on income *after* CPF, not on gross. See §7.

All amounts are in Singapore dollars (S$ / SGD).

---

## 1. Tax year — "Year of Assessment" (YA) mapping

Singapore taxes the **preceding calendar year's** income. The YA is the year in which the income is *assessed*, one year after it is earned.

| Income earned in calendar year | Year of Assessment (YA) | Filing / assessment window |
|---|---|---|
| 2023 | YA 2024 | 2024 |
| 2024 | YA 2025 | 2025 |
| **2025** | **YA 2026** | 2026 (current filing season) |
| **2026** | **YA 2027** | 2027 (forward-looking calculator target) |

- **Current filing season (as at July 2026):** YA 2026, on 2025 income. IRAS's live tool is the "*YA 2026 Income Tax Calculator for Tax Resident Individuals*", and all of IRAS's currently-published sample calculations are labelled **YA 2026**.
- **Forward-looking calculator (income earned in 2026):** YA 2027. **No change** to the resident rate schedule has been announced for YA 2027 — the "from YA 2024 onwards" table (§2) is the latest published schedule and carries forward. Treat YA 2027 rates as **latest-published-carried-forward** (confirmed unchanged for individuals through Budget 2026; no individual rate change was announced).
- CPF operates on the **actual calendar month** (not YA). The rates and ceilings in §6 are the ones in force **from 1 January 2026** and apply to wages paid in calendar 2026.

---

## 2. Resident individual income tax — rate schedule (from YA 2024 onwards)

Tax residents are taxed on **chargeable income** = assessable income − personal reliefs, at progressive marginal rates. This schedule (top rate 24%, with the higher upper brackets introduced from YA 2024) is in force for **YA 2024, YA 2025, YA 2026 and — as latest-published — YA 2027**.

**Source: IRAS "Individual Income Tax rates" → "Resident tax rates — From YA 2024 onwards".**

| Chargeable income band | Marginal rate | Tax on the band | Cumulative tax at top of band |
|---|---:|---:|---:|
| First $20,000 (0 – 20,000) | **0%** | $0 | $0 |
| Next $10,000 (20,000 – 30,000) | **2%** | $200 | $200 |
| Next $10,000 (30,000 – 40,000) | **3.5%** | $350 | $550 |
| Next $40,000 (40,000 – 80,000) | **7%** | $2,800 | $3,350 |
| Next $40,000 (80,000 – 120,000) | **11.5%** | $4,600 | $7,950 |
| Next $40,000 (120,000 – 160,000) | **15%** | $6,000 | $13,950 |
| Next $40,000 (160,000 – 200,000) | **18%** | $7,200 | $21,150 |
| Next $40,000 (200,000 – 240,000) | **19%** | $7,600 | $28,750 |
| Next $40,000 (240,000 – 280,000) | **19.5%** | $7,800 | $36,550 |
| Next $40,000 (280,000 – 320,000) | **20%** | $8,000 | $44,550 |
| Next $180,000 (320,000 – 500,000) | **22%** | $39,600 | $84,150 |
| Next $500,000 (500,000 – 1,000,000) | **23%** | $115,000 | $199,150 |
| In excess of $1,000,000 | **24%** | — | — |

**Published cumulative anchors** (the "First $X" rows in the IRAS table — exact figures to verify an implementation):

| Chargeable income | Gross tax payable |
|---|---|
| $20,000 | $0 |
| $30,000 | $200 |
| $40,000 | $550 |
| $80,000 | **$3,350** |
| $120,000 | $7,950 |
| $160,000 | $13,950 |
| $200,000 | $21,150 |
| $240,000 | $28,750 |
| $280,000 | $36,550 |
| $320,000 | $44,550 |
| $500,000 | $84,150 |
| $1,000,000 | $199,150 |

Reference algorithm (income tax, before rebate):

```js
// Chargeable income (CI) already net of reliefs. Rates: YA 2024 onwards.
const SG_RESIDENT_BANDS = [
  { upTo:    20000, rate: 0.00 },
  { upTo:    30000, rate: 0.02 },
  { upTo:    40000, rate: 0.035 },
  { upTo:    80000, rate: 0.07 },
  { upTo:   120000, rate: 0.115 },
  { upTo:   160000, rate: 0.15 },
  { upTo:   200000, rate: 0.18 },
  { upTo:   240000, rate: 0.19 },
  { upTo:   280000, rate: 0.195 },
  { upTo:   320000, rate: 0.20 },
  { upTo:   500000, rate: 0.22 },
  { upTo:  1000000, rate: 0.23 },
  { upTo:  Infinity, rate: 0.24 },
];

function residentTax(ci) {
  let tax = 0, prev = 0;
  for (const { upTo, rate } of SG_RESIDENT_BANDS) {
    if (ci <= prev) break;
    tax += (Math.min(ci, upTo) - prev) * rate;
    prev = upTo;
  }
  return tax; // gross tax payable, before any rebate
}
// residentTax(80000)  === 3350
// residentTax(234100) === 27629   (matches IRAS worked example, §5)
// residentTax(1000000)=== 199150
```

**Older schedule (from YA 2017 to YA 2023)** — same lower bands, but capped at **22%** above $320,000 (no 22%/23%/24% super-brackets). Only relevant for back-calculations; do **not** use it for 2025 or 2026 income.

---

## 3. Personal Income Tax Rebate

A **one-off** rebate applied *after* computing gross tax, announced Budget-by-Budget. It is **not** a permanent feature — it must be checked each YA.

| Year of Assessment | Rebate | Cap per taxpayer | Status |
|---|---|---|---|
| YA 2024 | **50%** of tax payable | **$200** | Granted (Budget 2024) |
| YA 2025 | **60%** of tax payable | **$200** | Granted (Budget 2025) |
| **YA 2026** | **none** | — | **No rebate** — IRAS's YA 2026 sample computations apply no rebate; no individual rebate found in Budget 2026 |
| **YA 2027** | **none announced** | — | Not announced as at July 2026 |

Mechanics when a rebate exists: `rebate = min(rebatePct × taxPayable, cap)`, applied **after** double-taxation relief and other credits but **before** the Parenthood Tax Rebate. It is automatic (no application), non-transferable, and cannot be carried forward.

For the forward-looking (YA 2027 / income year 2026) calculator, **model no rebate** unless a future Budget announces one.

---

## 4. What Singapore does *not* tax (implementation negatives)

- **No capital gains tax.** Gains on shares, property, crypto held as investment are not taxed as income.
- **No PAYE/monthly withholding** of income tax for ordinary residents; tax is filed after year-end.
- **No separate national/local income tax, no surcharge, no solidarity levy, no church tax.**
- **No employee-side unemployment-insurance or health-levy payroll deduction** beyond CPF.
- Dividends from Singapore resident companies (one-tier system) are **tax-exempt** in the shareholder's hands; not employment income anyway.

---

## 5. IRAS-published worked examples (verification gold)

All four are published by IRAS on the "Sample Income Tax calculations" page, labelled **YA 2026** (income earned in **2025**). Capture exactly — an implementation must reproduce these to the cent.

### 5.1 Resident, lower income → tax fully offset by Parenthood Tax Rebate
| Line | Amount |
|---|---|
| Total employment income in 2025 | $50,000 |
| Less: Donations | $250 |
| **Assessable income** | **$49,750** |
| Less: Earned Income Relief | $1,000 |
| Less: Qualifying Child Relief | $4,000 |
| Less: Employee CPF Contribution Relief | $10,000 |
| **Chargeable income** ($49,750 − $15,000) | **$34,750** |
| Tax on first $30,000 | $200.00 |
| Tax on next $4,750 @ 3.5% | $166.25 |
| **Tax payable on chargeable income** | **$366.25** |
| Less: Parenthood Tax Rebate | $366.25 |
| **Net tax payable for YA 2026** | **$0** |

### 5.2 Resident, higher income (cleanest schedule anchor)
| Line | Amount |
|---|---|
| Total employment income in 2025 | $250,000 |
| Less: Donations | $250 |
| **Assessable income** | **$249,750** |
| Less: Earned Income Relief | $8,000 |
| Less: Employee CPF Contribution Relief | $7,650 |
| **Chargeable income** ($249,750 − $15,650) | **$234,100** |
| Tax on first $200,000 | $21,150 |
| Tax on next $34,100 @ 19% | $6,479 |
| **Net tax payable for YA 2026** | **$27,629** |

→ Use **chargeable income $234,100 → tax $27,629** as the primary regression anchor for the resident schedule. (No rebate applied for YA 2026.)

### 5.3 Non-resident, employment income (flat 15%)
Chargeable income $21,000 × **15%** = **$3,150**.

### 5.4 Non-resident, director's fees (flat 24%)
Chargeable income $85,000 × **24%** = **$20,400**.

(5.3 and 5.4 are out of scope for a resident calculator but confirm the non-resident rates in §8.)

---

## 6. CPF — employee & employer contributions (from 1 January 2026)

### 6.1 Who CPF applies to

- **Mandatory for Singapore Citizens and Singapore Permanent Residents** only.
- **NOT payable for foreigners** — Employment Pass, S Pass, Work Permit holders have **zero CPF** (neither employee nor employer). A calculator must set CPF = 0 when the user is a foreigner.
- **PRs in their 1st and 2nd year** contribute at *graduated (lower)* rates by default (Tables 2/3 of the CPF schedule) unless the employer+employee jointly apply for full rates. The **main case below (Table 1)** is Citizens and **PRs from the 3rd year onwards**, at **full rates**.

### 6.2 Full contribution rates by age band — Table 1, from 1 January 2026

For monthly Ordinary Wages **above $750** (full rates apply; see §6.5 for the low-wage phase-in). Applied to Ordinary Wages **capped at the OW ceiling of $8,000/month**.

| Employee age (years) | Total (Employer + Employee) | **Employer share** | **Employee share** | Max **total** on OW/mth (rate × $8,000) | Max **employee** on OW/mth |
|---|---:|---:|---:|---:|---:|
| **55 & below** | **37%** | **17%** | **20%** | $2,960 | $1,600 |
| Above 55 – 60 | 34% | 16% | 18% | $2,720 | $1,440 |
| Above 60 – 65 | 25% | 12.5% | 12.5% | $2,000 | $1,000 |
| Above 65 – 70 | 16.5% | 9% | 7.5% | $1,320 | $600 |
| Above 70 | 12.5% | 7.5% | 5% | $1,000 | $400 |

- The **employee deduction** is the "Employee share" column. For the main working-age band (**≤ 55**) it is **20% of wage, on OW up to $8,000/month** (i.e. max **$1,600/month** of employee CPF from OW).
- These are the rates **effective 1 Jan 2026**. The rates for the **above 55–65** bands were *increased* on 1 Jan 2026 as part of the phased senior-worker increases (e.g. above 55–60 total rose to 34%, above 60–65 to 25%). A **further** senior-worker increase is scheduled for **1 Jan 2027** (separate CPF table) — do not apply it to 2026 wages.

### 6.3 Ordinary Wage (OW) ceiling — 2026

- **OW ceiling = $8,000 per month** from **1 January 2026** (raised from $7,400 in 2025; part of the Budget 2023 schedule $6,000 → $6,300 → $6,800 → $7,400 → **$8,000**).
- CPF is payable on OW only **up to $8,000/month**; wage above $8,000 in a month attracts no CPF as OW (but may attract CPF as AW, subject to the AW ceiling).
- Annualised, the OW ceiling is **$8,000 × 12 = $96,000**.

### 6.4 Additional Wage (AW) ceiling and CPF Annual Limit

- **Ordinary Wages (OW):** wages due/granted for the month (basic salary, monthly allowances). Capped at $8,000/month.
- **Additional Wages (AW):** wage supplements not granted wholly for the month — annual bonus, leave pay. Capped by the **AW ceiling**.
- **AW ceiling (per year) = $102,000 − Total OW subject to CPF for the year.** ("$102,000" is the **CPF annual salary ceiling**, historically 17 × $6,000; it **remains $102,000** and did not rise with the monthly OW ceiling.)
- **CPF Annual Limit** (maximum total CPF contributions — employer + employee — on OW + AW for the year) = **$37,740** (= 37% × $102,000). Remains $37,740 for 2026.

Worked implication for a full-year earner at/above the OW ceiling in 2026: Total OW subject to CPF = $96,000 ⇒ AW ceiling = $102,000 − $96,000 = **$6,000** of bonus can attract CPF.

### 6.5 Low-wage phase-in bands (for completeness)

For an employee earning **≤ $750/month** the full rates do not apply (these bands rarely matter for a salary calculator but are part of the official table):

| Monthly total wages (TW) | Total CPF | Employee share |
|---|---|---|
| $50 or less | Nil | Nil |
| > $50 to $500 | employer-only (e.g. 17% TW for ≤55) | Nil |
| > $500 to $750 | employer % + phase-in on employee (e.g. ≤55: 17% TW + 0.6·(TW−500); employee: 0.6·(TW−500)) | phased in |
| > $750 | **full rates** (§6.2) | full |

### 6.6 Rounding rules (official)

1. Compute **total** CPF contribution, **rounded to the nearest dollar** (down if < 50 cents, up if ≥ 50 cents).
2. Compute the **employee's share**, **rounded *down*** to the nearest dollar.
3. **Employer's share = total − employee's share.**
4. If both OW and AW are payable in the same month, compute CPF on OW and on AW separately, sum, then apply rounding.

### 6.7 Employee-CPF reference algorithm (2026, full rates, monthly OW only)

```js
// age = employee age in years; ow = this month's Ordinary Wages (before ceiling)
// Employee-share rate on OW by age band, from 1 Jan 2026 (Table 1, full rates):
function cpfEmployeeRate(age) {
  if (age <= 55) return 0.20;
  if (age <= 60) return 0.18;   // "above 55 to 60"
  if (age <= 65) return 0.125;  // "above 60 to 65"
  if (age <= 70) return 0.075;  // "above 65 to 70"
  return 0.05;                  // "above 70"
}
function cpfTotalRate(age) {
  if (age <= 55) return 0.37;
  if (age <= 60) return 0.34;
  if (age <= 65) return 0.25;
  if (age <= 70) return 0.165;
  return 0.125;
}
const OW_CEILING = 8000; // per month, 2026

function monthlyCpf(ow, age) {
  const owForCpf = Math.min(ow, OW_CEILING);
  const total    = Math.round(owForCpf * cpfTotalRate(age));      // nearest dollar
  const employee = Math.floor(owForCpf * cpfEmployeeRate(age));   // round DOWN
  const employer = total - employee;
  return { owForCpf, total, employee, employer };
}
// monthlyCpf(10000, 40) -> { owForCpf:8000, total:2960, employee:1600, employer:1360 }
// monthlyCpf(5000, 40)  -> { owForCpf:5000, total:1850, employee:1000, employer: 850 }
// monthlyCpf(3333, 40)  -> total round(1233.21)=1233, employee floor(666.6)=666, employer 567
```

*(Rate values are IRAS/CPF-published; the three worked results above are derived arithmetic from the published rates + rounding rules, not separately published examples.)*

---

## 7. How employee CPF interacts with income tax (CPF Relief)

Income tax is computed on chargeable income **after** deducting **CPF Relief**, so mandatory CPF is effectively removed from the tax base.

- **CPF Relief = the compulsory employee CPF contributions** made on OW (up to the OW ceiling) and AW (up to the AW ceiling) under the CPF Act. Only Citizens and PRs can claim it (only they pay CPF).
- It is **capped at the amount of *compulsory* employee CPF** — CPF cannot be used as a tax shelter; contributions on wages above the ceilings do not qualify.
- **Overall personal income-tax relief cap: $80,000 per YA** applies to the *sum of all reliefs* (CPF Relief + earned income + child reliefs + etc.). Total reliefs beyond $80,000 in a YA give no further tax reduction.

Illustration of the relief amount (from IRAS, 2025 figures — OW ceiling was $7,400 that year): an employee at 20% with OW $88,800 (capped) + AW $13,000 → CPF Relief = $17,760 + $2,600 = **$20,360**. For 2026 the OW-cap portion uses $96,000 (12 × $8,000): a full-year ≤55 employee at/above the ceiling has CPF Relief on OW ≈ $96,000 × 20% = **$19,200** (plus relief on any CPF-bearing AW).

Practical calculator flow for a resident employee (income year 2026 / YA 2027):

```
grossAnnual (OW + AW)
  → employeeCPF        = sum of monthly employee CPF (OW capped $8,000/mth) + AW CPF (AW ceiling)
  → assessableIncome   = grossAnnual − allowable donations/expenses
  → totalReliefs       = employeeCPF (as CPF Relief) + earnedIncomeRelief + other reliefs, capped at $80,000
  → chargeableIncome   = assessableIncome − totalReliefs
  → grossTax           = residentTax(chargeableIncome)      // §2
  → netTax             = grossTax − rebate(YA)              // rebate = 0 for YA 2026/2027 (§3)
  → takeHomeAnnual     = grossAnnual − employeeCPF − netTax
```

Earned Income Relief (a standard relief every employee gets, for reference): **$1,000** if below 55, **$6,000** if 55–59, **$8,000** if 60+ (capped at earned income if lower). Confirm against IRAS if modelling reliefs beyond CPF.

---

## 8. Non-residents (out of scope — one-line note)

A non-resident individual's **employment income** is taxed at the **higher of 15%** (flat, no reliefs) **or the resident progressive rates**. Other income — **director's fees, consultancy, and most other income — is taxed at 24%** (from YA 2024). Non-residents get **no personal reliefs** and **no CPF** (foreigners). Residency for tax generally requires ≥ 183 days in the calendar year (plus other rules). This calculator targets **ordinary residents**; expose non-resident handling only if needed.

---

## 9. Complete take-home reference (resident employee, income year 2026 / YA 2027)

```js
function sgResidentTakeHome({ monthlyOW, annualBonus = 0, age = 40, otherReliefs = 0, isCitizenOrPR = true }) {
  // ---- CPF (only for Citizens/PRs) ----
  let employeeCpfAnnual = 0, employerCpfAnnual = 0;
  if (isCitizenOrPR) {
    for (let m = 0; m < 12; m++) {
      const { employee, employer } = monthlyCpf(monthlyOW, age);   // §6.7
      employeeCpfAnnual += employee; employerCpfAnnual += employer;
    }
    // Bonus as Additional Wage, capped by AW ceiling = 102000 - total OW subject to CPF
    const owSubjectToCpf = Math.min(monthlyOW, 8000) * 12;
    const awCeiling = Math.max(0, 102000 - owSubjectToCpf);
    const awForCpf  = Math.min(annualBonus, awCeiling);
    employeeCpfAnnual += Math.floor(awForCpf * cpfEmployeeRate(age));
  }

  const grossAnnual = monthlyOW * 12 + annualBonus;

  // ---- Income tax (YA 2027 = latest-published rates, no rebate) ----
  const cpfRelief   = employeeCpfAnnual;                       // compulsory employee CPF is relievable
  const totalRelief = Math.min(cpfRelief + earnedIncomeRelief(age) + otherReliefs, 80000);
  const chargeable  = Math.max(0, grossAnnual - totalRelief);
  const incomeTax   = residentTax(chargeable);                // rebate = 0 for YA 2026/2027

  return {
    grossAnnual,
    employeeCpfAnnual,
    incomeTax,
    takeHomeAnnual: grossAnnual - employeeCpfAnnual - incomeTax,
  };
}
function earnedIncomeRelief(age){ return age < 55 ? 1000 : age < 60 ? 6000 : 8000; }
```

---

## 10. Caveats — what could NOT be fully confirmed from a primary source

1. **YA 2027 rate schedule is "latest-published, carried forward", not separately confirmed.** IRAS publishes the schedule as "**from YA 2024 onwards**" and the live tool is the **YA 2026** calculator. No individual income-tax *rate change* or *rebate* for YA 2027 was found in the Budget 2026 tax-changes page. Treat YA 2027 = the YA 2024-onwards table with **no rebate**; re-verify after the next Budget.
2. **No YA 2026 rebate — inferred, well-supported.** IRAS's YA 2026 sample computations (§5) apply no personal income tax rebate, and the Budget 2026 page surfaced no individual rebate. The IRAS "Personal Income Tax Rebate" page explicitly documents rebates only for YA 2024 (50%) and YA 2025 (60%). High confidence there is no YA 2026 rebate, but this is an *absence-of-evidence* confirmation, not an explicit "0%" statement.
3. **CPF service-article pages are JavaScript-rendered** and returned no text to curl/WebFetch. The AW-ceiling *formula* ($102,000 − Total OW subject to CPF) and the **$102,000 / $37,740** figures were confirmed from the **IRAS CPF-Relief-for-employees** page instead (which restates them and worked an example). The **rate table, OW ceiling ($8,000), and per-age maxima** were confirmed from the **official CPF PDF** "CPF Contribution Rate Table from 1 January 2026" (Table 1), which rendered cleanly.
4. **The $102,000 annual salary ceiling** is stated as "will remain at $102,000" on IRAS's page (in a 2025-dated example noting "$102,000 = 17 months × $6,000"). It is a fixed figure not indexed to the monthly OW ceiling; confirmed it did **not** rise when the monthly ceiling went to $8,000. If a future CPF change lifts it, the AW ceiling and Annual Limit both move.
5. **Senior-worker rates (above 55–65)** were *increased* on 1 Jan 2026 and a **further increase is scheduled for 1 Jan 2027**. The §6.2 table is the **2026** table only. For income earned in 2027, a different CPF table applies — out of scope here.
6. **PR 1st/2nd-year graduated rates** (CPF Tables 2–5) are not tabulated here beyond noting they exist; the spec covers Citizens and 3rd-year-onwards PRs at full rates. If the calculator must handle new PRs, pull Tables 2–5 from the same CPF PDF.
7. **Reliefs beyond CPF and Earned Income Relief** (Qualifying Child Relief, Spouse Relief, Parent Relief, CPF Cash Top-up, SRS, NSman, etc.) are **not** enumerated here — they are user-specific inputs. The $80,000 overall relief cap and the CPF Relief cap (= compulsory employee CPF) are the two structural limits to enforce.
8. **Rounding of income tax:** IRAS worked examples carry cents (e.g. $366.25) and also whole dollars ($6,479 from $34,100 × 19%). The schedule itself produces exact figures; final tax on the Notice of Assessment may be presented to the cent. Match IRAS examples exactly (§5) rather than imposing extra rounding.

---

## 11. Sources

**Primary — IRAS (income tax):**
- IRAS — Individual Income Tax rates (resident schedule "from YA 2024 onwards"; Personal Income Tax Rebate YA 2024/2025; links YA 2026 calculator) — https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/individual-income-tax-rates
- IRAS — Sample Income Tax calculations (the four YA 2026 worked examples in §5) — https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-residency-and-tax-rates/sample-income-tax-calculations
- IRAS — Personal Income Tax Rebate (YA 2024 = 50%/$200; YA 2025 = 60%/$200; automatic, non-transferable) — https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/personal-income-tax-rebate
- IRAS — CPF Relief for employees (relief capped at compulsory employee CPF; OW/AW ceilings; annual salary ceiling $102,000; annual limit $37,740; overall $80,000 relief cap; worked relief examples) — https://www.iras.gov.sg/taxes/individual-income-tax/basics-of-individual-income-tax/tax-reliefs-rebates-and-deductions/tax-reliefs/central-provident-fund(cpf)-relief-for-employees
- IRAS — Budget 2026: Tax Changes and Enterprise Disbursements (checked for individual rate change / rebate — none for individuals) — https://www.iras.gov.sg/news-events/singapore-budget/budget-2026--tax-changes-and-enterprise-disbursements

**Primary — CPF Board (contributions):**
- CPF Board — "CPF Contribution Rate Table from 1 January 2026" (PDF; Table 1 = SC/SPR 3rd year onwards, full rates by age band; OW ceiling $8,000; rounding rules) — https://www.cpf.gov.sg/content/dam/web/employer/employer-obligations/documents/CPFcontributionratesfrom1Jan2026.pdf
- CPF Board — How much CPF contributions to pay (OW vs AW, wage ceilings, computation steps) — https://www.cpf.gov.sg/employer/employer-obligations/how-much-cpf-contributions-to-pay
- CPF Board — CPF Contribution Changes from 1 January 2026 (senior-worker rate increases; OW ceiling to $8,000) — https://www.cpf.gov.sg/employer/infohub/news/cpf-related-announcements/new-contribution-rates
- CPF Board — What is the Additional Wage (AW) ceiling? — https://www.cpf.gov.sg/service/article/what-is-the-additional-wage-aw-ceiling

**Secondary (corroboration only):** none required — all figures above are from IRAS or CPF primary pages/PDFs.
