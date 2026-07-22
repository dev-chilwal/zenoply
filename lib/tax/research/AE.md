# United Arab Emirates — Personal Income Tax & Employee Payroll Deductions
### Implementation spec as at 20 July 2026

---

## 0. Headline answer

**There is no personal income tax in the United Arab Emirates on employment income — federal or emirate level — as at 20 July 2026.** Gross salary = taxable-income-free. The only mandatory recurring payroll deductions from an employee's pay are:

| Deduction | Who pays it | Applies to |
|---|---|---|
| GPSSA / emirate pension-fund contribution | UAE nationals (and GCC nationals via reciprocal rules) | 5% or 11% of contribution salary |
| ILOE unemployment-insurance premium | **All** employees, Emirati and expatriate (with exemptions) | AED 5 or AED 10 per month + 5% VAT |

**Expatriates (non-GCC nationals) pay zero income tax and zero pension contribution.** Their only mandatory deduction is the ILOE premium (AED 5.25 or AED 10.50/month inc. VAT). Their deferred compensation is the **end-of-service gratuity**, funded entirely by the employer and paid as a lump sum at termination.

---

## 1. Tax year

- The UAE has **no personal income tax**, therefore **no personal tax year, no tax return, no registration, no withholding, no PAYE equivalent**.
- For the taxes that do exist (Corporate Tax, VAT), the relevant period is the taxpayer's own **financial year**; the default calendar year runs 1 January – 31 December.
- The period in effect on 20 July 2026 for any payroll-adjacent obligation is therefore simply **calendar year 2026 (1 Jan 2026 – 31 Dec 2026)**.

---

## 2. Income tax — the definitive negative

> "There is currently no personal income tax in the United Arab Emirates."
> — PwC Worldwide Tax Summaries, UAE Individual — Taxes on personal income, **last reviewed 12 March 2026**

Implementation consequences:

- `incomeTax = 0` for **every** income level. No brackets, no bands, no marginal rates.
- **No** tax-free allowance, personal allowance, standard deduction, or zero-rate band — these concepts do not exist because there is no tax to relieve.
- **No** tax credits, offsets, rebates, or reliefs.
- **No** surcharges, solidarity levies, local/municipal income taxes, health levies, church tax, or education cess on wages.
- **No** withholding at source on salaries. Payroll gross-to-net has no tax line.
- **No** taxation of benefits in kind — housing allowance, transport allowance, school fees, flights, car, and bonuses are all untaxed.
- **No** wealth tax, no inheritance/estate duty, no gift tax.
- Non-resident note: non-residents likewise pay no UAE tax on UAE employment income; there is no non-resident regime for wages.

### 2.1 Corporate Tax (9%) does NOT apply to employment income

- Federal Decree-Law No. 47 of 2022 introduced Corporate Tax at **9%** on taxable income **above AED 375,000**, with **0%** on the first AED 375,000. It applies to juridical persons and to **natural persons only in respect of a Business or Business Activity** conducted in the UAE.
- Cabinet Decision No. 49 of 2023 sets the natural-person threshold: a natural person is within Corporate Tax only where **turnover from businesses exceeds AED 1,000,000 in a Gregorian calendar year**, and expressly excludes from that turnover test **wages, personal investment income, and real estate investment income**.
- Therefore **salary/employment income is categorically outside Corporate Tax**. An employee with no business activity is never a Corporate Tax subject, at any salary level.
- Implementation: never apply 9% to any part of an employee's salary. There is no salary threshold at which corporate tax begins.

### 2.2 The 15% Domestic Minimum Top-up Tax (DMTT) does NOT apply to salaries

- Ministry of Finance: the UAE DMTT applies to "Constituent Entities that are members of Multinational Enterprises (MNEs) operating in the UAE with annual global revenues of **€750 million or more**", for **financial years starting on or after 1 January 2025**.
- It is the UAE's OECD Pillar Two implementation — an entity-level top-up on MNE group profits. It has **no application to individuals or to wages whatsoever**.
- Implementation: 15% never appears in a take-home-pay calculation.

### 2.3 Other taxes an employee meets (consumption-side, not payroll)

- **VAT: 5%** standard rate on goods and services. Not a payroll deduction. It does appear as a 5% add-on to the ILOE premium (see §4).
- **Excise tax**: 100% on tobacco, e-cigarettes, energy drinks; 50% on carbonated and sweetened drinks. Not payroll.
- **Municipality / housing fee**: charged by some emirates on residential leases via the utility bill — e.g. Dubai housing fee at **5% of annual rental value** billed monthly through DEWA; Abu Dhabi levies a similar fee on expatriate tenants. This is a property-occupancy charge, not an income tax and not a payroll deduction. Optional to model; if modelled, it is emirate-specific and rent-based.

---

## 3. GPSSA pension — UAE nationals only

Governed by **Federal Law No. 7 of 1999** (old law) and **Federal Decree-Law No. 57 of 2023** (new law). Administered by the General Pension and Social Security Authority (GPSSA).

**Which law applies is determined by when the Emirati first joined the workforce.** Existing insured persons stay on Law 7/1999; those first joining employment on/after the 2023 law's effective date fall under Law 57/2023.

### 3.1 Law 7 of 1999 — legacy insured (joined before the 2023 law)

Direct from GPSSA:

> "contributions are due from the insured at a rate of **20%** of the contribution account salary, out of which the insured bears **5%**, the employer in the government and private sector bears **15%** and the government pays **2.5%** of the rate on behalf of the employer in the private sector as a form of supporting Emiratisation in the private sector."

| Party | Government sector | Private sector |
|---|---|---|
| Insured (employee) | **5%** | **5%** |
| Employer | **15%** | **12.5%** (15% less the 2.5% government share) |
| Government subsidy | — | **2.5%** |
| **Total** | **20%** | **20%** |

*(GPSSA's own FAQ "What is the distribution of contributions due from insured individuals?" states the private-sector employer figure as 12.5% with the government bearing 2.5% of the 15%.)*

**Contribution Calculation Salary — Law 7/1999**

- **Government sector**: basic monthly salary + social allowance of a UAE national + children's allowance + cost-of-living allowance + housing allowance. Ceiling **AED 300,000/month** (a Minister's contribution salary).
- **Private sector**: the salary stipulated in the employment contract, including basic salary, bonuses and regular monthly allowances.
  - **Minimum AED 1,000/month**
  - **Maximum AED 50,000/month**

### 3.2 Federal Decree-Law No. 57 of 2023 — new joiners

Direct from GPSSA:

> "Contributions are paid on behalf of the insured at a rate of **26%** of the contribution account salary in the private sector … whereby the insured bears a percentage of (**11%**), the employer pays a percentage of (**15%**) and the government bears (**2.5%**) of the percentage for employees in the private sector whose contribution account salaries are **less than AED 20,000**."

| Party | Private sector, contribution salary **< AED 20,000** | Private sector, contribution salary **≥ AED 20,000** |
|---|---|---|
| Insured (employee) | **11%** | **11%** |
| Employer | **12.5%** (15% less 2.5% subsidy) | **15%** |
| Government subsidy | **2.5%** | **0%** |
| **Total remitted** | **26%** | **26%** |

Note the arithmetic: 11 + 15 = 26. The 2.5% government share is carved **out of the employer's 15%**, not added on top — total remitted to GPSSA is 26% either way; only the employer's cash cost changes (12.5% vs 15%). **The employee always pays 11%; the AED 20,000 test never changes the employee deduction.**

**Contribution Calculation Salary — Law 57/2023**

- **Government sector**: basic salary + cost-of-living allowance + social allowance for children and for the insured + housing allowance. Ceiling **AED 100,000/month** (raised from AED 50,000).
- **Private sector**: the salary determined in the employment contract.
  - **Minimum AED 3,000/month**
  - **Maximum AED 70,000/month**
- **Regional/international missions and foreign political missions**: basic salary in the contract plus benefits/bonus/allowance, using the private-sector contribution-salary conditions.

### 3.3 Employee-deduction algorithm (UAE nationals, private sector)

```js
// contractSalary = monthly salary per employment contract (basic + regular allowances + bonuses)
// regime = 'law7' (joined before the 2023 law) | 'law57' (new joiner)

function gpssaEmployee(contractSalary, regime) {
  let floor, cap, empRate;
  if (regime === 'law57') { floor = 3000; cap = 70000; empRate = 0.11; }
  else                    { floor = 1000; cap = 50000; empRate = 0.05; }

  const cs = Math.min(Math.max(contractSalary, floor), cap); // contribution account salary
  return { contributionSalary: cs, employee: cs * empRate };
}

function gpssaEmployer(contractSalary, regime) {
  const { contributionSalary: cs } = gpssaEmployee(contractSalary, regime);
  // government bears 2.5% only in the private sector; under law57 only if cs < 20000
  const subsidised = (regime === 'law7') || (cs < 20000);
  return {
    employer: cs * (subsidised ? 0.125 : 0.15),
    government: cs * (subsidised ? 0.025 : 0),
    total: cs * (regime === 'law57' ? 0.26 : 0.20)
  };
}
```

Worked figures (private sector, Law 57/2023):

| Contract salary | Contribution salary | Employee 11% | Employer | Gov | Total |
|---|---|---|---|---|---|
| AED 2,000 | 3,000 (floor) | 330.00 | 375.00 (12.5%) | 75.00 | 780.00 |
| AED 15,000 | 15,000 | 1,650.00 | 1,875.00 (12.5%) | 375.00 | 3,900.00 |
| AED 19,999 | 19,999 | 2,199.89 | 2,499.88 (12.5%) | 499.98 | 5,199.74 |
| AED 20,000 | 20,000 | 2,200.00 | 3,000.00 (15%) | 0.00 | 5,200.00 |
| AED 50,000 | 50,000 | 5,500.00 | 7,500.00 (15%) | 0.00 | 13,000.00 |
| AED 90,000 | 70,000 (cap) | 7,700.00 | 10,500.00 (15%) | 0.00 | 18,200.00 |

Same under Law 7/1999 (private, 5% / 12.5% / 2.5%, cap 50,000):

| Contract salary | Contribution salary | Employee 5% | Employer 12.5% | Gov 2.5% | Total 20% |
|---|---|---|---|---|---|
| AED 15,000 | 15,000 | 750.00 | 1,875.00 | 375.00 | 3,000.00 |
| AED 60,000 | 50,000 (cap) | 2,500.00 | 6,250.00 | 1,250.00 | 10,000.00 |

### 3.4 Mechanics

- Contributions are **monthly**. The employer must remit between the **1st and 15th day of each month**; late payment attracts penalties.
- **Part-months**: GPSSA — "Contributions are paid to the GPSSA in the private sector for the **entire month by which the service begins** and are **not due for the part of the month by which it ends**." So the joining month is charged in full, the leaving month is not charged.
- The private-sector contribution account salary is fixed by reference to the salary in the contract and is generally reset annually (January) rather than fluctuating month to month with variable pay.
- An employer that deducts a **higher** percentage from the insured than the law allows is in breach; an employer that overpays GPSSA may reclaim within **two years** of payment.

### 3.5 Other UAE pension funds (emirate-level)

- **Abu Dhabi Pension Fund (ADPF)** covers Emiratis employed by Abu Dhabi government entities and certain Abu Dhabi-based employers. Commonly quoted split: **employee 5%, employer 15%, government 6% = 26%**. Use GPSSA rates as the default in a general calculator and expose ADPF as an option.
- **Sharjah Social Security Fund** covers certain Sharjah government employees.
- Free zones (DIFC, ADGM) do **not** create pension obligations for Emiratis distinct from GPSSA; DIFC's DEWS scheme replaces **gratuity**, not pension (see §5.3).

### 3.6 GCC nationals working in the UAE

- Under the **GCC Unified Insurance Protection Extension System**, a GCC national employed in the UAE is insured with the **pension authority of their home GCC state**, at **that state's rates and salary definitions**, with GPSSA acting as collection agent.
- The employee share is the **home country's employee rate**; the UAE employer pays the home country's employer rate, and where the home rate exceeds the UAE employer rate the difference is borne by the employer (rules vary by state).
- Implementation: if `nationality ∈ {SA, KW, BH, QA, OM}`, do not use UAE 5%/11% — route to the home-state rate table, or present a manual override field.

### 3.7 Pension benefit (context, not payroll)

- Contribution salary → **average contribution salary**: last **3 years** of service (government sector, ÷36) or last **5 years** (private sector, ÷60).
- Entitlement scale: **15 yrs → 60%**, **20 yrs → 70%**, **25 yrs → 80%**, **30 yrs → 90%**, **35 yrs → 100%**. Increases **2% per year** beyond 15 years, capped at **100%**.
- GPSSA worked example: average contribution salary AED 15,000, 20 years' service → **15,000 × 70% = AED 10,500/month pension**.
- Maximum pension = **100% of the pension calculation salary**, payable after **35 years**.
- Law 57/2023 retirement: minimum age **55** with **30 years** of service; earlier/shorter thresholds for working mothers.

---

## 4. ILOE — mandatory unemployment insurance (ALL employees, including expatriates)

Involuntary Loss of Employment insurance scheme, live since **1 January 2023**. This is the **only** mandatory deduction an expatriate employee faces.

Premiums (from the official scheme operator, iloe.ae):

| Category | Basic salary | Premium | Max monthly claim benefit |
|---|---|---|---|
| **A** | **AED 16,000 or below** | **AED 5 + VAT / month** | **up to AED 10,000/month** |
| **B** | **Above AED 16,000** | **AED 10 + VAT / month** | **up to AED 20,000/month** |

- VAT at 5% ⇒ effective **AED 5.25/month (AED 63.00/year)** and **AED 10.50/month (AED 126.00/year)**.
- Commonly paid annually or in instalments; often paid directly by the employee rather than deducted at source — but it is a mandatory employee-borne cost, so a take-home model should subtract it.
- **Compensation**: "The monthly compensation is **60% of the average basic salary over the most recent 6 months** prior to the Involuntary Loss of Employment", subject to the category cap above, for a maximum of **3 months per claim**.
- Eligibility for a claim typically requires a minimum **12 consecutive months** of subscription.
- **Exempt / not covered**: investors and owners of the businesses they work in, domestic workers, temporary-contract workers, juveniles under 18, and retirees receiving a pension who have taken a new job.

```js
const iloeMonthly = basicSalary <= 16000 ? 5 * 1.05 : 10 * 1.05; // 5.25 or 10.50 AED
```

Note the test is on **basic salary**, not gross package.

---

## 5. End-of-service gratuity — expatriate employees (Federal Decree-Law No. 33 of 2021)

Private sector, MOHRE-regulated. Employer-funded; **no employee deduction**. This is the expatriate's substitute for both a pension and any tax-advantaged saving.

### 5.1 Full-time employees

- **Eligibility**: at least **1 year of continuous service**. Under 1 year ⇒ **nil**.
- **Years 1–5**: **21 days' basic wage per year of service.**
- **Beyond 5 years**: **30 days' basic wage for each year after the first 5.**
- **Cap**: total gratuity **shall not exceed 2 years' wage**.
- **Basis**: the **last basic salary** the worker was entitled to. Excludes housing, transport, utilities, furniture and other allowances.
- **Fractions of a year** after year 1 are paid pro rata.
- **Unpaid absence days are excluded** from the service period.
- **Payment**: within **14 days** of contract termination. The employer may deduct amounts the worker owes.

```js
// basicMonthly = last monthly BASIC salary; years = completed service in years (fractional)
function gratuity(basicMonthly, years) {
  if (years < 1) return 0;
  const daily = basicMonthly / 30;
  const first = Math.min(years, 5) * 21 * daily;
  const rest  = Math.max(years - 5, 0) * 30 * daily;
  return Math.min(first + rest, basicMonthly * 24); // cap = 2 years' wage
}
```

Worked figures (basic AED 10,000/month ⇒ daily AED 333.33):

| Service | Calculation | Gratuity |
|---|---|---|
| 11 months | below 1 year | **AED 0** |
| 1 year | 21 × 333.33 | **AED 7,000.00** |
| 3 years | 63 × 333.33 | **AED 21,000.00** |
| 5 years | 105 × 333.33 | **AED 35,000.00** |
| 7 years | (105 + 60) × 333.33 | **AED 55,000.00** |
| 10 years | (105 + 150) × 333.33 | **AED 85,000.00** |
| 20 years | (105 + 450) × 333.33 = 185,000 | **AED 185,000.00** (cap is 240,000, not binding) |
| 30 years | (105 + 750) × 333.33 = 285,000 → capped | **AED 240,000.00** (2 years' wage) |

The 2-year cap binds at roughly **26.4 years** of service on these mechanics.

### 5.2 Part-time / non-full-time work models

Gratuity = (contracted annual working hours ÷ full-time annual working hours) × 100, applied as a percentage of the full-time gratuity that would otherwise be due. Temporary contracts under one year attract no benefit.

### 5.3 Alternative End-of-Service Benefits Savings Scheme (voluntary, from 2023)

A MOHRE-supervised defined-contribution alternative to the lump-sum gratuity. Employer contributes monthly to a licensed investment fund:

- **5.83%** of monthly basic salary for employees with **under 5 years** of service (= 21/360)
- **8.33%** of monthly basic salary for employees with **5 years or more** (= 30/360)

Employee receives contributions plus investment returns within **14 days** of termination. Employees may make **voluntary additional contributions** (subscription is optional for the employee even where the employer has joined). Joining the scheme is at the employer's election with MOHRE approval; accrued pre-scheme gratuity remains payable under the old rules.

**DIFC** operates its own mandatory version, **DEWS**, live since **1 February 2020**, with the same 5.83% / 8.33% employer contribution rates on basic salary. **ADGM** has an equivalent regime.

---

## 6. Complete take-home-pay algorithm

```js
function uaeNetPay({ grossMonthly, basicMonthly, nationality, sector, pensionRegime }) {
  const incomeTax = 0;                       // always — no PIT in the UAE
  let pension = 0;

  if (nationality === 'AE') {
    const law57 = pensionRegime === 'law57';
    const floor = law57 ? 3000 : 1000;
    const cap   = sector === 'government'
                    ? (law57 ? 100000 : 300000)
                    : (law57 ? 70000  : 50000);
    const cs = Math.min(Math.max(grossMonthly, floor), cap);
    pension = cs * (law57 ? 0.11 : 0.05);
  } else if (['SA','KW','BH','QA','OM'].includes(nationality)) {
    pension = homeGccRate(nationality) * grossMonthly;   // home-state rules
  }
  // expatriates (non-GCC): pension = 0

  const iloe = basicMonthly <= 16000 ? 5.25 : 10.50;

  return {
    incomeTax,                                // 0
    pension,
    iloe,
    net: grossMonthly - pension - iloe,
    effectiveTaxRate: 0
  };
}
```

**Employer-side cost to display alongside the package:**

| Employee type | Employer monthly cost |
|---|---|
| UAE national, Law 57/2023, contribution salary < 20,000 | 12.5% of contribution salary |
| UAE national, Law 57/2023, contribution salary ≥ 20,000 | 15% of contribution salary |
| UAE national, Law 7/1999, private sector | 12.5% of contribution salary |
| UAE national, government sector | 15% of contribution salary |
| Expatriate | Gratuity accrual: 5.83% of basic (< 5 yrs) / 8.33% (≥ 5 yrs) |

---

## 7. Worked end-to-end examples

**Expatriate, AED 25,000/month gross, AED 15,000 basic, 3 years' service**
- Income tax: **AED 0**
- Pension: **AED 0**
- ILOE: **AED 5.25** (basic ≤ 16,000 ⇒ Category A)
- **Net monthly: AED 24,994.75**. Effective tax rate **0.00%**.
- Gratuity accrued: 3 × 21 × (15,000/30) = **AED 31,500**.

**Emirati, private sector, new joiner (Law 57/2023), AED 25,000/month contract salary, AED 18,000 basic**
- Income tax: **AED 0**
- Contribution salary: 25,000 (within 3,000–70,000)
- Pension employee 11%: **AED 2,750.00**
- ILOE: **AED 10.50** (basic > 16,000 ⇒ Category B)
- **Net monthly: AED 22,239.50**
- Employer: 15% × 25,000 = **AED 3,750** (no government subsidy, cs ≥ 20,000). Total to GPSSA **AED 6,500** (26%).

**Emirati, private sector, legacy insured (Law 7/1999), AED 25,000/month, AED 12,000 basic**
- Pension employee 5%: **AED 1,250.00**; ILOE **AED 5.25**
- **Net monthly: AED 23,744.75**
- Employer 12.5% = AED 3,125; government 2.5% = AED 625; total 20% = AED 5,000.

**Emirati, private sector, Law 57/2023, AED 90,000/month contract salary**
- Contribution salary capped at **AED 70,000**
- Pension employee: 70,000 × 11% = **AED 7,700.00**; ILOE **AED 10.50**
- **Net monthly: AED 82,289.50**

---

## 8. Caveats and open points

1. **Effective date of Federal Decree-Law No. 57 of 2023.** DLA Piper reports the law "came into effect on **2 October 2023**", with contributions payable from **1 January 2024**. Other commentary cites **31 October 2023** (30 days after Official Gazette publication). GPSSA's own page confirming the date could not be retrieved (the site returns HTTP-level rejections to automated fetches on most paths). Treat the boundary as "on or around **October 2023**" and let the user select their regime rather than deriving it from a hire date near that boundary.
2. **GPSSA site blocks automated access.** The rate and cap figures in §3 come from GPSSA's own published pages retrieved with a browser user-agent (the FAQ pages and the 23 February 2025 press release on contribution account salary). The general FAQ index and several news paths returned "Request Rejected". No figure here is taken from memory.
3. **Law 7/1999 private-sector employer split.** GPSSA states the employer bears 15% and the government pays 2.5% "on behalf of the employer in the private sector"; a separate GPSSA FAQ states the private-sector employer pays 12.5% with the government bearing 2.5%. These are the same arrangement described two ways — employer cash cost 12.5%, total 20%. Under Law 57/2023 the same carve-out logic applies (12.5% + 2.5% where cs < 20,000).
4. **The AED 20,000 subsidy test under Law 57/2023** is on the *contribution account salary*, is a strict "less than", and affects only the employer/government split — never the employee's 11%.
5. **Abu Dhabi Pension Fund rates (5% / 15% / 6%)** are corroborated by PwC only; no ADPF primary source was retrieved. Lower confidence. GPSSA rates should be the calculator default.
6. **GCC nationals**: no per-country rate table was retrieved this session. The mechanism (home-state rates via GPSSA) is authoritative; the numbers are not. Implement as an override field, not a hardcoded table.
7. **Resignation and gratuity.** Federal Decree-Law 33/2021 is generally understood to have removed the old Law 8/1980 reductions for resignation (1/3 and 2/3 forfeitures at <3 and 3–5 years). The u.ae end-of-service page retrieved does not restate a resignation reduction, which supports this. Medium confidence — do not apply a resignation haircut.
8. **Daily-rate convention** for gratuity (monthly basic ÷ 30) is market-standard and consistent with the 21/30-day formulation, but is not stated as a divisor in the retrieved u.ae text. A 365/12-day-month convention would give marginally different cents.
9. **Misinformation warning.** At least one aggregator page (visahq.com, dated December 2025) circulates a claim that the UAE introduced a personal income tax in a "2026 regulatory reset". This is contradicted by PwC's UAE individual-tax page **reviewed 12 March 2026**, which still states there is no personal income tax. No UAE government source announcing a personal income tax was found. Do not implement any 2026 UAE income tax.
10. **No worked examples published by a *tax* authority exist**, because there is no personal income tax to illustrate. The worked example in §3.7 (AED 15,000 × 70% = AED 10,500) is GPSSA's own, for pension entitlement. The gratuity and contribution examples in §3.3, §5.1 and §7 are derived arithmetically from the published rates and caps.
11. **Emirate-level municipality/housing fees** (e.g. Dubai's 5% of annual rental value) are excluded from the net-pay model above. If a user wants "true" disposable income they may be relevant, but they are property charges, not payroll.
12. **VAT on the ILOE premium** is 5%; if the scheme operator's pricing is ever quoted VAT-inclusive, avoid double-counting.

---

## 9. Sources

**Primary (UAE government):**
- General Pension and Social Security Authority — "GPSSA: An insured's contribution payment may be extended to the 15th day of each month; the contribution account salary is the salary from which contribution rates are paid", 23 February 2025 — https://gpssa.gov.ae/pages/en/media-center/news/gpssa-insureds-contribution-payment-may-be-extended-15th-day-each-month *(source for all Law 7/1999 and Law 57/2023 rates, salary definitions and caps)*
- GPSSA FAQ — "Are there minimum and maximum limits for Contribution Calculation Salary?" — https://gpssa.gov.ae/pages/en/help/faq/are-there-minimum-and-maximum-limits-contribution-calculation-salary
- GPSSA FAQ — "What is the distribution of contributions due from insured individuals?" — https://gpssa.gov.ae/pages/en/help/faq/what-distribution-contributions-due-insured-individuals
- GPSSA FAQ — "What is meant by the Contribution Calculation Salary by which contributions are deducted?" — https://gpssa.gov.ae/pages/en/help/faq/what-meant-contribution-calculation-salary-which-contributions-are-deducted
- GPSSA FAQ — "How is the monthly pension calculated?" — https://gpssa.gov.ae/pages/en/help/faq/how-monthly-pension-calculated
- GPSSA FAQ — "What is the maximum pension limit?" — https://gpssa.gov.ae/pages/en/help/faq/what-maximum-pension-limit
- GPSSA FAQ — "How are contributions calculated for part of the month at the beginning and end of service?" — https://gpssa.gov.ae/pages/en/help/faq/how-are-contributions-calculated-part-month-beginning-and-end-service
- The Official Portal of the UAE Government (u.ae) — "End of service benefits for employees in the private sector" — https://u.ae/en/information-and-services/jobs/employment-in-the-private-sector/end-of-service-benefits-for-employees-in-the-private-sector
- ILOE (official unemployment insurance scheme operator) — https://www.iloe.ae/ *(premium categories, VAT, 60% compensation, caps)*
- UAE Ministry of Finance — Domestic Minimum Top-up Tax — https://mof.gov.ae/en/public-finance/tax/top-up-tax/
- UAE Ministry of Finance — Corporate Tax — https://mof.gov.ae/corporate-tax/
- Federal Tax Authority — Corporate Tax — https://tax.gov.ae/en/taxes/corporate.tax.aspx
- Federal Decree-Law No. 33 of 2021 on the Regulation of Labour Relations — https://uaelegislation.gov.ae/en/legislations/1541/download

**Secondary (corroboration only):**
- PwC Worldwide Tax Summaries — UAE Individual, Taxes on personal income (reviewed 12 March 2026) — https://taxsummaries.pwc.com/united-arab-emirates/individual/taxes-on-personal-income
- PwC Worldwide Tax Summaries — UAE Individual, Other taxes — https://taxsummaries.pwc.com/united-arab-emirates/individual/other-taxes
- DLA Piper — "New UAE Pensions Law" — https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2024/new-uae-pensions-law.html
