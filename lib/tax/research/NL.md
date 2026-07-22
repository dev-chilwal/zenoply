# Netherlands — Personal Income Tax & Employee Payroll Deductions
## Tax year 2026 (calendar year: 1 January 2026 – 31 December 2026)

**Status on 20 July 2026:** the Netherlands uses the calendar year. The year in effect is **2026**.
All figures below are taken from Belastingdienst primary sources published for 2026, principally:

- **Cijferbijlage 2026** — *Tarieven, bedragen en percentages loonheffingen vanaf 1 januari 2026*,
  Bijlage bij de Nieuwsbrief Loonheffingen 2026, **Uitgave 3, 3 maart 2026** (LH 209 – 1B63FD).
- **Rekenvoorschriften voor de geautomatiseerde loonadministratie 2026**, uitgave januari 2026, **versie 2**
  (LH 991 – 1Z62FD). This is the *official algorithm* — formulas, symbols and rounding rules.
- **Witte Maandloon-tabel 2026** (uitgave januari 2026) — used below as cent-exact verification data.

> Note on the Cijferbijlage: editions 1 and 2 contained errors. Edition 2 corrected the arbeidskorting
> full-phase-out point from €132.290 to **€132.920**, and clarified that the algemene heffingskorting base
> amount applies to wage *up to and including* €29.736 (not "up to"). Use edition 3 (or the
> Rekenvoorschriften) only.

---

## 1. Box 1 tax brackets (combined loonbelasting + premie volksverzekeringen)

Box 1 = income from work and home ownership. The headline rate is a **combined** rate: income tax
proper plus national insurance contributions (volksverzekeringen: AOW state pension, Anw survivors,
Wlz long-term care). There is no separate employee line for these — they are inside the bracket rate.

### 1a. Below AOW age for the whole of 2026

| Bracket | Taxable income (more than → up to and including) | Rate |
|---|---|---|
| 1 | €0 – €38.883 | **35,75 %** |
| 2 | €38.883 – €78.426 | **37,56 %** |
| 3 | above €78.426 | **49,50 %** |

### 1b. AOW age or older, **born 1946 or later**

| Bracket | Taxable income | Rate |
|---|---|---|
| 1 | €0 – €38.883 | **17,85 %** |
| 2a | €38.883 – €78.426 | **37,56 %** |
| 3 | above €78.426 | **49,50 %** |

### 1c. AOW age or older, **born 1945 or earlier** (wider first bracket — legacy cohort)

| Bracket | Taxable income | Rate |
|---|---|---|
| 1 | €0 – €41.123 | **17,85 %** |
| 2b | €41.123 – €78.426 | **37,56 %** |
| 3 | above €78.426 | **49,50 %** |

### 1d. Composition of the bracket rates

| Component | Below AOW age | AOW age and older |
|---|---|---|
| premie AOW (state pension) | 17,90 % | – (not levied) |
| premie Anw (survivors) | 0,10 % | 0,10 % |
| premie Wlz (long-term care) | 9,65 % | 9,65 % |
| loonbelasting (income tax) | 8,10 % | 8,10 % |
| **total bracket 1** | **35,75 %** | **17,85 %** |
| bracket 2a / 2b — loonbelasting only | 37,56 % | 37,56 % |
| bracket 3 — loonbelasting only | 49,50 % | 49,50 % |

So the "social contribution" portion an employee pays is **27,65 %** (AOW+Anw+Wlz) on the first
€38.883 only; it is capped by the bracket-1 ceiling, not by a separate contribution ceiling.
Above AOW age the premie portion is **9,75 %**.

**AOW age in 2026 = 67 years** (unchanged in 2027; rises to 67 y 3 m from 2028). Source: SVB.

### 1e. Rounding rule (critical — from Rekenvoorschriften)

**The tax in each bracket is computed and then rounded DOWN to whole euros, per bracket, before summing.**
This is what makes the official tables reproduce exactly. Do not round only at the end.

```
taxBracket1 = floor(min(L, b1Ceiling) * rate1)
taxBracket2 = floor(max(0, min(L, b2Ceiling) - b1Ceiling) * rate2)
taxBracket3 = floor(max(0, L - b2Ceiling) * rate3)
grossTax    = taxBracket1 + taxBracket2 + taxBracket3
```

---

## 2. Algemene heffingskorting (AHK) — general tax credit

Base amount, tapered away linearly. **In the income tax assessment the income concept is
`verzamelinkomen`** (aggregate of box 1 + 2 + 3), not box-1 taxable income. In payroll withholding
the concept is the annualised wage `L`. For a plain employee with only wage income the two coincide.

Official formula (Rekenvoorschriften §2.2.3.1):

```
if   L <= ahkg1            →  AHK = ahkm1
elif L <= ahkg2            →  AHK = ahkm1 - (L - ahkg1) * ahka1     [round UP to whole euros, floor 0]
else (L > ahkg2)           →  AHK = 0
```

| Symbol | Meaning | Below AOW age | AOW age and older |
|---|---|---|---|
| `ahkm1` | base (maximum) amount | **€3.115** | **€1.556** |
| `ahkg1` | taper start (income *up to and including* this = full amount) | **€29.736** | €29.736 |
| `ahkg2` | taper end (credit is €0 at and above this) | **€78.426** | €78.426 |
| `ahka1` | taper factor | **0,06398** (6,398 %) | **0,03195** (3,195 %) |

- Rounding: the **annual** AHK amount is rounded **UP** to whole euros when tapering applies.
- Check: (78.426 − 29.736) × 0,06398 = €3.115,18 → fully phased out exactly at €78.426. ✔
- The Rekenvoorschriften warn that just below L = €78.426 there may be an "inhaalafbouw"
  (catch-up taper step) in the table so the credit is exactly €0 at the boundary.

---

## 3. Arbeidskorting (ARK) — employed person's tax credit

Applies only to **income from current employment** (`loon uit tegenwoordige dienstbetrekking` /
`arbeidsinkomen`), and only when the payroll tax credit (`loonheffingskorting`) is applied
(white table only, not the green/pension table).

Four segments: three build-up phases and one taper.

Official formula (Rekenvoorschriften §2.2.3.4):

```
if L > arkg4:  ARK = 0
else:
    p1 = round5(arko1 * L)                      ; capped at arkm1
    p2 = round5(arko2 * max(0, L - arkg1))      ; p1+p2 capped at arkm2
    p3 = round5(arko3 * max(0, L - arkg2))      ; p1+p2+p3 capped at arkm3
    p4 = round5(arka1 * max(0, L - arkg3))
    ARK = max(0, ceil(p1 + p2 + p3 - p4))       ; annual amount rounded UP to whole euros
```
`round5` = arithmetic (half-up) rounding to 5 decimals of each product, per the Rekenvoorschriften.
Note the caps `arkm1`/`arkm2`/`arkm3` are **cumulative** running maxima, not per-phase increments.

| Symbol | Meaning | Below AOW age | AOW age and older |
|---|---|---|---|
| `arko1` | 1st build-up rate (from L = €0) | **0,08324** (8,324 %) | 0,04156 |
| `arko2` | 2nd build-up rate (above `arkg1`) | **0,31009** (31,009 %) | 0,15483 |
| `arko3` | 3rd build-up rate (above `arkg2`) | **0,01950** (1,950 %) | 0,00974 |
| `arka1` | taper rate (above `arkg3`) | **0,06510** (6,510 %) | 0,03250 |
| `arkg1` | 1st income threshold | **€11.965** | €11.965 |
| `arkg2` | 2nd income threshold | **€25.845** | €25.845 |
| `arkg3` | 3rd income threshold — taper begins above this | **€45.592** | €45.592 |
| `arkg4` | credit fully phased out at | **€132.920** | €132.920 |
| `arkm1` | cumulative max after phase 1 | **€996** | €498 |
| `arkm2` | cumulative max after phase 2 | **€5.300** | €2.647 |
| `arkm3` | cumulative max after phase 3 = absolute maximum | **€5.685** | €2.840 |

Consistency checks (all exact):
- 11.965 × 0,08324 = €996,0 ✔ (`arkm1`)
- 13.880 × 0,31009 = €4.304,0 ; 996 + 4.304 = €5.300 ✔ (`arkm2`)
- 19.747 × 0,01950 = €385,1 ; 5.300 + 385 = €5.685 ✔ (`arkm3`), maximum reached at L = €45.592
- 87.328 × 0,06510 = €5.685,0 ✔ → fully phased out at €132.920

> **Common implementation error:** the Cijferbijlage table lists €4.304 and €385 as *phase increments*,
> while the Rekenvoorschriften list €5.300 and €5.685 as *cumulative caps*. Use the cumulative form.

---

## 4. Other heffingskortingen relevant to an employee

| Credit | Below AOW age | AOW age and older | Rule |
|---|---|---|---|
| **Jonggehandicaptenkorting** (young disabled) | €923 | €462 | Flat; requires Wajong entitlement. Not in the wage tax tables. |
| **Ouderenkorting** (elderly) | – | €2.067 | Full up to income of €46.002; taper **15,000 %** on excess above €46.002; €0 at €59.782 |
| **Alleenstaande-ouderenkorting** (single elderly) | – | €540 | Flat; requires single AOW benefit |

### Inkomensafhankelijke combinatiekorting (IACK) — working-parent credit
Not part of the wage-tax tables (claimed in the annual assessment / provisional assessment).
Requires a child under 12 in the household and single-parent or lower-earning-partner status.

| Arbeidsinkomen | Below AOW age | AOW age all year |
|---|---|---|
| ≤ €6.239 | €0 | €0 |
| €6.240 – €32.710 | 11,450 % × (arbeidsinkomen − €6.239) | 5,72 % × (arbeidsinkomen − €6.239) |
| ≥ €32.711 | €3.032 (maximum) | €1.513 (maximum) |

> IACK is being phased out under enacted legislation (restricted to children born before 1 January 2025,
> abolished entirely from 2027). Verify eligibility logic before relying on it for new claimants.

---

## 5. Zvw — income-dependent healthcare contribution

Two mutually exclusive variants. Both are capped at the same **maximum contribution income of
€79.409 per year** (2025: €75.864).

| Variant | Rate 2026 | Who pays | Appears on payslip as |
|---|---|---|---|
| **Werkgeversheffing Zvw** | **6,10 %** | **Employer**, on top of gross salary | Employer cost, *not* deducted from net pay |
| **Bijdrage Zvw (inhouding)** | **4,85 %** (2025: 5,26 %) | Employee / recipient | Withheld from net pay |
| Seafarers (incl. share-fishermen) | 0,00 % | – | – |

**For an ordinary employee in regular employment the employer pays the 6,10 % werkgeversheffing and
NOTHING is deducted from the employee's net pay for Zvw.** The 4,85 % `inhouding` applies to
pensions, most benefits, director-major-shareholder (DGA) income, and other income where no
werkgeversheffing is due. A take-home calculator for a salaried employee must **not** deduct 4,85 %.

Period ceilings (identical for Zvw and employee-insurance contributions):

| Day | Week | 4 weeks | Month | Quarter | Year |
|---|---|---|---|---|---|
| €305,41 | €1.527,09 | €6.108,38 | €6.617,41 | €19.852,25 | **€79.409,00** |

---

## 6. Werknemersverzekeringen (employee insurance) — **100 % employer-paid**

These are **not** deducted from employee net pay in the Netherlands. Included because they are part
of the total employer cost of the package. Base = wage up to €79.409/yr (same ceiling as Zvw).

| Contribution | Rate 2026 |
|---|---|
| **AWf laag** (unemployment; permanent written contract, no on-call) | **2,74 %** |
| **AWf hoog** (unemployment; fixed-term / flexible contracts) | **7,74 %** |
| **Aof laag** (disability; small employers) | **6,27 %** |
| **Aof hoog** (disability; medium/large employers) | **7,63 %** |
| **Opslag Wko** (childcare surcharge) | **0,50 %** |
| **Ufo-premie** (government bodies) | **0,68 %** |
| **Gedifferentieerde premie Whk** | Per employer decision; small employers use sector rates (range 2026: **0,76 %** sector 39 Verzekeringswezen → **6,63 %** sector 52 Uitzendbedrijven) |

Employer-size classification for Aof and Whk (based on 2024 payroll; average premium wage per
employee for 2026 = €43.300):
- Small: ≤ 25 × average = **≤ €1.082.500**
- Medium: ≤ 100 × average = **≤ €4.330.000**
- Large: > **€4.330.000**

**Typical total employer on-cost** for a small employer, permanent contract:
2,74 % (AWf laag) + 6,27 % (Aof laag) + 0,50 % (Wko) + ~1,3 % (Whk sector avg) + 6,10 % (Zvw)
≈ **16,9 %** of gross wage up to €79.409.

---

## 7. Employer pension (aanvullend pensioen)

Not statutory-universal, but conventionally quoted as part of a Dutch package and set by CAO /
pension scheme. Statutory parameters for 2026:

| Item | 2026 |
|---|---|
| **Maximaal pensioengevend loon** (pensionable salary cap) | **€137.800,00** |
| **Franchise** (AOW offset — the slice of salary not pensionable) | **€19.172,00** |

Pension base = min(gross salary, €137.800) − €19.172. The employee share of the premium is
**deductible from box 1 taxable wage** — i.e. it reduces the taxable base *before* the bracket
calculation. Contribution split varies by scheme (commonly employer ~⅔, employee ~⅓).

---

## 8. Expatregeling (the "30 % ruling") — status in 2026

**In 2026 the tax-free reimbursement remains at the maximum of 30 %.** It drops to **27 % from
1 January 2027** (with a higher salary threshold from 2027).

| Parameter | 2026 |
|---|---|
| Maximum tax-free percentage | **30,00 %** |
| Salary norm — employee with specific expertise | **€48.013,00** taxable salary (excl. the exempt allowance) |
| Salary norm — employee with specific expertise, under 30 with a Dutch master's | **€36.497,00** |
| Cap (aftopping) — WNT norm | **€262.000,00** |
| ⇒ Maximum tax-free allowance in 2026 | **€78.600** (30 % of €262.000, full year) |
| Maximum duration | 5 years |

**How to model it:** if `grossSalary` is the total package including the allowance, then
`taxFree = min(grossSalary, 262.000) × 0,30` and `taxableWage = grossSalary − taxFree`. The employee
must still meet the salary norm on the *remaining taxable* salary (€48.013 / €36.497), so the ruling
is only fully usable when taxable salary after the deduction ≥ the norm. Practically, for a package
`P`: usable if `0,70 × P ≥ 48.013`, i.e. `P ≥ €68.590` (approximately; the cap interacts above
€262.000). Transitional rules apply to rulings granted before 2024 — do not assume the current
parameters apply to existing beneficiaries.

---

## 9. Deductions and allowances an employee may have

The Netherlands has **no general standard deduction** for employees. There is no deduction for
commuting (the employer may reimburse tax-free instead). The main items that reduce box-1 taxable
income for an ordinary employee:

| Item | 2026 |
|---|---|
| Employee pension contribution | Fully deductible from taxable wage (pre-tax) |
| Mortgage interest (eigen woning) | Deductible against box 1; **eigenwoningforfait** added back |
| **Tariefsaanpassing aftrekposten** — deductions in bracket 3 are only relieved at a capped rate | Capped at **37,56 %** (so a top-rate taxpayer loses 49,50 − 37,56 = 11,94 pp of relief) |

Tax-free employer reimbursements (gerichte vrijstellingen — reduce gross taxable wage if used):

| Item | 2026 |
|---|---|
| Kilometer allowance (travel) | **€0,23** per km |
| Working-from-home allowance | **€2,45** per day |
| Relocation allowance | **€7.750,00** |
| Werkkostenregeling vrije ruimte | **2,00 %** of total fiscal wage up to €400.000; **1,18 %** above |
| Meals (added to wage) | €4,05 per breakfast/lunch/dinner |
| Housing/board (added to wage) | €7,00 per day |

---

## 10. Minimum wage

The statutory minimum is set as an **hourly** rate (since 2024), revised every 1 January and 1 July.

| Period | Minimum hourly wage (21 and older) |
|---|---|
| From 1 January 2026 | €14,71 |
| **From 1 July 2026 (in force on 20 July 2026)** | **€14,99** |

Youth minimum wages (ages 15–20) are fixed percentages of this and rose by the same percentage on
1 July 2026. Monthly equivalent depends on the contractual week (36/38/40 h) — there is no statutory
monthly amount.

---

## 11. Other numbers that may matter

| Item | 2026 |
|---|---|
| Anoniementarief (no valid ID / no BSN supplied) | **52,00 %**, no credits, no ceilings |
| Minimum gebruikelijk loon for a DGA (≥5 % shareholder) | €58.000,00 |
| Company car — general bijtelling, first registered on/after 1-1-2017 | 22 % of list price |
| Company car — zero-emission, first registered 2026 | 22 % − 4 % = **18 %** up to a CAP of €30.000, 22 % above |
| Company car — registered before 1-1-2017 | 25 %; over 16 years old 35 % |
| Volunteer allowance (untaxed) | €2.200/yr, €220/month, €5,75/hr (21+), €3,40/hr (<21) |
| Box 3 tax rate (out of scope, for reference) | 36 %; heffingsvrij vermogen €59.357 |

---

## 12. Reference algorithm (below AOW age, ordinary employee, calendar 2026)

```
INPUT: grossAnnualWage G (after any pension deduction and after any 30%-ruling exemption)

# 1. Taxable box-1 wage
L = G

# 2. Gross combined tax (floor per bracket)
t1 = floor(min(L, 38883) * 0.3575)
t2 = floor(max(0, min(L, 78426) - 38883) * 0.3756)
t3 = floor(max(0, L - 78426) * 0.4950)
grossTax = t1 + t2 + t3

# 3. Algemene heffingskorting
if   L <= 29736: AHK = 3115
elif L <= 78426: AHK = max(0, ceil(3115 - (L - 29736) * 0.06398))
else:            AHK = 0

# 4. Arbeidskorting
if L > 132920:
    ARK = 0
else:
    p1 = min(round5(0.08324 * L), 996)
    p12 = min(p1 + round5(0.31009 * max(0, L - 11965)), 5300)
    p123 = min(p12 + round5(0.01950 * max(0, L - 25845)), 5685)
    p4 = round5(0.06510 * max(0, L - 45592))
    ARK = max(0, ceil(p123 - p4))

# 5. Net tax and take-home
netTax   = max(0, grossTax - AHK - ARK)
takeHome = G - netTax          # NO Zvw deduction for a regular employee
monthly  = takeHome / 12

# Employer on-cost (not deducted from employee):
zvwEmployer = min(G, 79409) * 0.0610
```

`round5(x)` = arithmetic half-up rounding to 5 decimal places.
`floor` = round down to whole euros. `ceil` = round up to whole euros.

**Holiday allowance:** Dutch employees normally receive 8 % vakantiegeld, usually paid in May. If the
calculator takes "gross including 8 % holiday pay", the annual figures above apply unchanged; if it
takes "gross excluding", multiply by 1,08 first. Holiday pay is taxed via the *tabel bijzondere
beloningen* in-year (a flat percentage), but the annual liability is exactly the same — a yearly
calculator should ignore the special table.

---

## 13. Verification — cent-exact worked examples

Values below are read directly from the **Witte Maandloon-tabel 2026 (uitgave januari 2026)**,
Belastingdienst. These are the authority's own numbers. The algorithm in §12 reproduces every one
of them exactly.

### Example A — monthly table wage €4.000,50, below AOW age
Annual L = 4.000,50 × 12 = **€48.006**

| Step | Calculation | Result |
|---|---|---|
| Bracket 1 | floor(38.883 × 0,3575) = floor(13.900,6725) | €13.900 |
| Bracket 2 | floor(9.123 × 0,3756) = floor(3.426,5988) | €3.426 |
| Gross tax | | **€17.326** → /12 = **€1.443,83** |
| AHK | ceil(3.115 − 18.270 × 0,06398) = ceil(1.946,0854) | **€1.947** |
| ARK | p1=996, p12=5.300, p123=5.685; p4 = 0,0651 × 2.414 = 157,1514; ceil(5.527,8486) | **€5.528** → /12 = **€460,67** |
| Net tax | 17.326 − 1.947 − 5.528 = 9.851 | /12 = **€820,92** |

**Official table row (€4.000,50, jonger dan de AOW-leeftijd):**
zonder loonheffingskorting **1.443,83** ✔ | met loonheffingskorting **820,92** ✔ | verrekende arbeidskorting **460,67** ✔

### Example B — monthly table wage €6.502,50, below AOW age
Annual L = **€78.030**

| Step | Result |
|---|---|
| Bracket 1 | floor(13.900,6725) = €13.900 |
| Bracket 2 | floor(39.147 × 0,3756) = floor(14.703,6132) = €14.703 |
| Gross tax | €28.603 → /12 = **€2.383,58** |
| AHK | ceil(3.115 − 48.294 × 0,06398) = ceil(25,1499) = **€26** |
| ARK | ceil(5.685 − 0,0651 × 32.438) = ceil(3.573,2862) = **€3.574** → /12 = **€297,83** |
| Net tax | 28.603 − 26 − 3.574 = 25.003 → /12 = **€2.083,58** |

**Official table row (€6.502,50):** 2.383,58 ✔ | 2.083,58 ✔ | 297,83 ✔

### Example C — monthly table wage €4.000,50, AOW age, born 1946 or later
Annual L = **€48.006**

| Step | Result |
|---|---|
| Bracket 1 | floor(38.883 × 0,1785) = floor(6.940,6155) = €6.940 |
| Bracket 2 | floor(9.123 × 0,3756) = €3.426 |
| Gross tax | €10.366 → /12 = **€863,83** |
| AHK (AOW) | ceil(1.556 − 18.270 × 0,03195) = ceil(972,2735) = **€973** |
| ARK (AOW) | ceil(2.840 − 0,0325 × 2.414) = ceil(2.761,545) = **€2.762** → /12 = **€230,17** |
| Ouderenkorting | ceil(2.067 − 0,15 × 2.004) = ceil(1.766,40) = **€1.767** |
| Net tax excl. alleenstaande-ouderenkorting | 10.366 − 973 − 2.762 − 1.767 = 4.864 → /12 = **€405,33** |
| Net tax incl. alleenstaande-ouderenkorting (−€540) | 4.324 → /12 = **€360,33** |

**Official table row (€4.000,50, geboren in 1946 of later):**
zonder lhk **863,83** ✔ | met lhk excl. AOK **405,33** ✔ | met lhk incl. AOK **360,33** ✔ | verrekende arbeidskorting **230,17** ✔

### Further official rows for regression testing (monthly, below AOW age)

| Table wage | zonder lhk | met lhk | verrekende arbeidskorting |
|---|---|---|---|
| €2.700,00 | 965,25 | 267,50 | 452,33 |
| €3.001,50 | 1.073,00 | 388,58 | 458,25 |
| €4.000,50 | 1.443,83 | 820,92 | 460,67 |
| €6.502,50 | 2.383,58 | 2.083,58 | 297,83 |
| €8.001,00 | 3.121,42 | 2.921,17 | 200,25 |
| €11.002,50 | 4.607,08 | 4.602,25 | 4,83 |

And the corresponding AOW-age (born 1946 or later) columns:

| Table wage | zonder lhk | met lhk excl. AOK | met lhk incl. AOK | verrekende arbeidskorting |
|---|---|---|---|---|
| €2.700,00 | 481,92 | 0,00 | 0,00 | 187,08 |
| €3.001,50 | 535,75 | 21,58 | 0,00 | 228,92 |
| €4.000,50 | 863,83 | 405,33 | 360,33 | 230,17 |
| €6.502,50 | 1.803,58 | 1.653,58 | 1.608,58 | 148,83 |
| €8.001,00 | 2.541,42 | 2.441,25 | 2.396,25 | 100,17 |
| €11.002,50 | 4.027,08 | 4.024,50 | 3.979,50 | 2,58 |

> The monthly table advances in steps of €4,50 (= €54/year ÷ 12), so the "table wage" is the wage
> rounded **down** to the nearest €4,50 step for monthly periods. A pure annual calculator can skip
> this quantisation; a payslip-accurate one cannot.

---

## 14. Non-residents (one line, as scoped)

Non-resident employees are taxed on Dutch-source box-1 income only and are generally **not** entitled
to the tax portion of the heffingskortingen. Residents of the EU/EEA, Switzerland, Liechtenstein,
Bonaire, Sint Eustatius or Saba who earn ≥90 % of worldwide income in the Netherlands may qualify
as "kwalificerende buitenlandse belastingplichtige" and claim resident-equivalent treatment.

---

## 15. Sources

1. Belastingdienst — *Tarieven, bedragen en percentages loonheffingen vanaf 1 januari 2026* (Cijferbijlage bij Nieuwsbrief Loonheffingen 2026, uitgave 3, 3 maart 2026)
   https://download.belastingdienst.nl/belastingdienst/docs/bijlage-nieuwsbrief-loonheffingen-2026-lh2091b63fd.pdf
2. Belastingdienst — *Rekenvoorschriften voor de geautomatiseerde loonadministratie 2026*, uitgave januari 2026, versie 2
   https://download.belastingdienst.nl/belastingdienst/docs/rekenvoorschriften_voor_geautomatiseerde_loonadministratie_lh991z62fd.pdf
3. Belastingdienst — *Witte Maandloon-tabel loonbelasting/premie volksverzekeringen; Nederland, Standaard (uitgave januari 2026)*
   https://download.belastingdienst.nl/belastingdienst/dl/rekenhulpen/loonheffing/2026/v01/pdf/wit_mnd_nl_std_20260101.pdf
4. Belastingdienst — *Tabel algemene heffingskorting 2026*
   https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/algemene_heffingskorting/tabel-algemene-heffingskorting-2026
5. Belastingdienst — *Tabel arbeidskorting 2026*
   https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/arbeidskorting/tabel-arbeidskorting-2026
6. Belastingdienst — *Tabel inkomensafhankelijke combinatiekorting 2026*
   https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/inkomstenbelasting/heffingskortingen_boxen_tarieven/heffingskortingen/inkomensafhankelijke_combikorting/inkomensafhankelijke-combinatiekorting-2026
7. Belastingdienst — *Belastingschijven en tarieven* (box 1, 2026)
   https://www.belastingdienst.nl/wps/wcm/connect/nl/werk-en-inkomen/content/hoeveel-inkomstenbelasting-betalen
8. Belastingdienst — *Percentages inkomensafhankelijke bijdrage Zvw*
   https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/veranderingen-bijdrage-zvw/percentages-zvw
9. Belastingdienst — *Werkgeversheffing Zvw of bijdrage Zvw?*
   https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/werk_en_inkomen/zorgverzekeringswet/bijdrage_zorgverzekeringswet/tabel_werkgeversheffing_zvw_of_bijdrage_zvw/tabel_werkgeversheffing_zvw_of_bijdrage_zvw
10. Belastingdienst — *Inhoud van de expatregeling* (30 %-regeling)
    https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/internationaal/personeel/u_bent_niet_in_nederland_gevestigd_loonheffingen_inhouden/als_u_loonheffingen_gaat_inhouden/extraterritoriale_kosten_en_de_30procentregeling/inhoud_van_de_regeling/inhoud_van_de_regeling
11. Rijksoverheid — *Expatregeling hoogopgeleide buitenlandse werknemers*
    https://www.rijksoverheid.nl/themas/werk/inkomstenbelasting/belastingvoordeel-buitenlandse-werknemers
12. Rijksoverheid — *Bedragen minimumloon 2026* and *Ministeriële regeling ter indexatie van het wettelijk minimumloon per 1 juli 2026*
    https://www.rijksoverheid.nl/themas/werk/minimumloon/bedragen-minimumloon/bedragen-minimumloon-2026
13. SVB — *AOW-leeftijd*
    https://www.svb.nl/nl/aow/aow-leeftijd/uw-aow-leeftijd
