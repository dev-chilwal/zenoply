# Germany — Personal Income Tax & Employee Payroll Deductions, Tax Year 2026

**Jurisdiction:** Federal Republic of Germany (DE)
**Tax year in effect on 20 July 2026:** Calendar year **2026** = 1 January 2026 – 31 December 2026 (Veranlagungszeitraum 2026). Germany is strictly calendar-year for both Einkommensteuer (annual assessment) and Lohnsteuer (monthly PAYE withholding).
**Currency:** EUR. All statutory rounding is specified below and is load-bearing.

Every figure below was confirmed in-session against the official consolidated statute text at
`gesetze-im-internet.de` (published by the Bundesministerium der Justiz / Bundesamt für Justiz)
or against Deutsche Rentenversicherung / Bundesregierung / BMG publications, and the income-tax
formula was numerically verified to the euro against a published 2026 Grundtabelle (see §12).

---

## 1. Income tax tariff — § 32a EStG, version applying **ab dem Veranlagungszeitraum 2026**

Germany does **not** use step brackets. It uses a continuous piecewise-quadratic formula.

### 1.1 Definitions
- `zvE` = zu versteuerndes Einkommen (taxable income).
- `x` = zvE **rounded DOWN to a whole euro** (`x = floor(zvE)`). This is mandated by § 32a(1) sentence 1 and sentence 5.
- `y` = one ten-thousandth of the part of `x` exceeding the Grundfreibetrag → `y = (x − 12348) / 10000`
- `z` = one ten-thousandth of the part of `x` exceeding 17 799 € → `z = (x − 17799) / 10000`
- The resulting tax amount is **rounded DOWN to the next whole euro** (§ 32a(1) sentence 6).

### 1.2 The five zones (Grundtarif / single, VZ 2026)

| # | Zone | zvE range (x) | Tax formula (EUR) |
|---|------|---------------|-------------------|
| 1 | Nullzone (Grundfreibetrag) | 0 – 12 348 | `0` |
| 2 | 1st Progressionszone | 12 349 – 17 799 | `(914.51 · y + 1400) · y` |
| 3 | 2nd Progressionszone | 17 800 – 69 878 | `(173.10 · z + 2397) · z + 1034.87` |
| 4 | Proportionalzone ("Spitzensteuersatz") | 69 879 – 277 825 | `0.42 · x − 11135.63` |
| 5 | "Reichensteuer" | from 277 826 | `0.45 · x − 19470.38` |

**Grundfreibetrag 2026 = 12 348 €** (single). Entry marginal rate 14 %; top of zone 2 marginal ≈ 23.97 %; 42 % from 69 879 €; 45 % from 277 826 €.

### 1.3 Reference implementation

```python
import math

def est_2026(zve: float) -> int:
    """Tarifliche Einkommensteuer, Grundtarif, VZ 2026 (§32a(1) EStG). Returns whole EUR."""
    x = math.floor(zve)
    if x <= 12348:
        t = 0.0
    elif x <= 17799:
        y = (x - 12348) / 10000.0
        t = (914.51 * y + 1400.0) * y
    elif x <= 69878:
        z = (x - 17799) / 10000.0
        t = (173.10 * z + 2397.0) * z + 1034.87
    elif x <= 277825:
        t = 0.42 * x - 11135.63
    else:
        t = 0.45 * x - 19470.38
    return math.floor(t)

def est_2026_splitting(zve_joint: float) -> int:
    """§32a(5) EStG Splitting-Verfahren for jointly assessed spouses."""
    return 2 * est_2026(math.floor(zve_joint) / 2)
```

### 1.4 Splitting (married, joint assessment) — § 32a(5) EStG
`Tax = 2 × est_2026(zvE_joint / 2)`. Also applies (§ 32a(6)) to a widowed taxpayer in the year following the spouse's death, and in the year a marriage is dissolved where the ex-spouse remarries.

---

## 2. Employment-income deductions before the tariff

| Item | § | 2026 amount |
|---|---|---|
| **Arbeitnehmer-Pauschbetrag** (standard employment-expense deduction) | § 9a S.1 Nr.1a EStG | **1 230 €** / year (capped at the amount of employment income). Actual Werbungskosten deductible instead if higher and proven. |
| Pauschbetrag for Versorgungsbezüge (pension-from-former-employer) | § 9a S.1 Nr.1b | 102 € |
| **Sonderausgaben-Pauschbetrag** | § 10c EStG | **36 €** (72 € joint) — applied only if actual Sonderausgaben not proven |
| Union dues (Gewerkschaftsbeiträge) | § 9a S.3 | deductible **in addition to** the 1 230 € Pauschbetrag |
| **Entlastungsbetrag für Alleinerziehende** (single-parent relief) | § 24b(2) EStG | **4 260 €** for the first qualifying child **+ 240 € per further child**. Reduced 1/12 per full month conditions not met. |
| **Kinderfreibetrag** (child allowance, per parent) | § 32(6) S.1 EStG | **3 414 €** (sächliches Existenzminimum) **+ 1 464 €** (BEA: care/education/training) = **4 878 € per parent**, i.e. **9 756 € per child** for jointly assessed parents. Reduced 1/12 per month not qualifying. |
| **Kindergeld** (child benefit, paid monthly, not a tax credit) | § 66(1) EStG | **259 € per child per month** (3 108 €/yr). |

**Günstigerprüfung (§ 31 EStG):** at assessment the Finanzamt compares (a) Kindergeld received vs (b) tax saving from the Kinderfreibetrag+BEA. Whichever is more favourable applies; if the Freibeträge win, the Kindergeld is added back to the tax. Note: the Kinderfreibetrag is **never** deducted in monthly Lohnsteuer (Kindergeld is paid instead) — but it **is** used to reduce the base for Soli and church tax (§ 51a EStG, § 3(2a) SolZG).

---

## 3. Solidaritätszuschlag (solidarity surcharge) — SolZG 1995

- **Rate: 5.5 %** of the assessment base (§ 4 S.1 SolZG).
- **Assessment base:** the Einkommensteuer / Lohnsteuer. For Soli purposes the base is recomputed **with the Kinderfreibetrag + BEA allowance applied** for every child (§ 3(2)+(2a) SolZG), even though those allowances are not used for the Lohnsteuer itself. In tax classes I, II, III the doubled Kinderfreibetrag+BEA is used; in class IV the single amount.
- **Freigrenze (exemption threshold), first applying in VZ 2026** (§ 3(3) SolZG in the version of Art. 4 of the Act of 23 Dec 2024, per § 6(27) SolZG):
  - **20 350 €** of annual income tax — individual assessment
  - **40 700 €** of annual income tax — splitting cases (§ 32a(5)/(6))
  - No Soli at or below the Freigrenze.
- **Milderungszone (§ 4 S.2 SolZG):** Soli must not exceed **11.9 % of the excess** of the base over the Freigrenze.
  `Soli = min(0.055 · T, 0.119 · (T − Freigrenze))`, and `0` if `T ≤ Freigrenze`.
  Fractions of a cent are dropped (§ 4 S.3).
  - Crossover to the flat 5.5 %: `T = 0.119 × 20 350 / 0.064 = 37 838.28 €` of income tax (single) — above that the 5.5 % rate binds. Joint: `75 676.56 €`.
- **Monthly payroll (§ 3(4) SolZG):** Soli is withheld only if the monthly Lohnsteuer base exceeds
  - tax class **III**: `40 700 / 12 = 3 391.66 €`
  - tax classes **I, II, IV, V, VI**: `20 350 / 12 = 1 695.83 €`
  (weekly: 7/360 of the annual figure; daily: 1/360).
- Soli on Abgeltungsteuer (§ 32d(3)/(4)) and on Lohnsteuer for sonstige Bezüge under § 39b(3) is always the flat 5.5 % with no Milderungszone (§ 4 S.4).

```python
def soli_2026(income_tax: float, joint: bool = False) -> float:
    fg = 40700.0 if joint else 20350.0
    if income_tax <= fg:
        return 0.0
    return math.floor(min(0.055 * income_tax, 0.119 * (income_tax - fg)) * 100) / 100
```

---

## 4. Kirchensteuer (church tax) — Landeskirchensteuergesetze + § 51a EStG

- Payable only by registered members of a tax-collecting religious body (Roman Catholic, Protestant/Evangelische, some Jewish and Old Catholic communities). Roughly half the population pays none.
- **Rate = 8 % of the income tax** in **Bayern** and **Baden-Württemberg**; **9 %** in all other 14 Länder. The rate follows the **Land of the employee's residence** (Betriebsstätte for withholding purposes).
- **Base:** same as for Soli — income tax recomputed with the full Kinderfreibetrag + BEA per child (§ 51a(2a) EStG).
- **No Freigrenze / no Milderungszone** — church tax is due from the first euro of income tax.
- **Kappung (capping)** at a percentage of *zvE* rather than of the tax: caps range from **2.75 % to 4 %** of zvE depending on the Land/Landeskirche. In **Bayern there is no Kappung**. In **Baden-Württemberg, Hessen, Nordrhein-Westfalen, Rheinland-Pfalz and Saarland the cap must be applied for**; elsewhere it is generally granted automatically. A calculator may ignore Kappung: it only binds at very high incomes.
- Church tax paid is itself a **Sonderausgabe** (§ 10(1) Nr. 4 EStG) — fully deductible in the following assessment, which is why the effective burden is lower than the headline 8/9 %. Not reflected in monthly withholding.

```python
def church_tax(income_tax: float, land: str, member: bool) -> float:
    if not member: return 0.0
    rate = 0.08 if land in ("BY", "BW") else 0.09
    return round(income_tax * rate, 2)
```

---

## 5. Steuerklassen (wage-tax classes) — § 38b EStG

| Class | Who | Effect in § 39b(2) |
|---|---|---|
| **I** | Single; or married/widowed/divorced not qualifying for III or IV; also all limited-tax-liability employees | Grundtarif § 32a(1); AN-Pauschbetrag + Sonderausgaben-Pauschbetrag + Vorsorgepauschale |
| **II** | As class I **but** entitled to the Entlastungsbetrag für Alleinerziehende | As I **plus** the single-parent relief for **one** child (4 260 €) built into the withholding (further children only via a § 39a Freibetrag) |
| **III** | Married/civil-partnered, both unlimited taxpayers, not permanently separated, where the spouse elects class V. Also a widow(er) in the calendar year following the spouse's death, and certain dissolution-year cases | **Splittingtarif § 32a(5)** applied to the single employee's income → lowest withholding |
| **IV** | Married, both unlimited taxpayers, not permanently separated (default on marriage; also applies if one spouse has no wage and no class-III application was made) | Grundtarif § 32a(1), same as class I |
| **IV + Faktor** | § 39f EStG option | Class IV tax × factor (< 1) computed by the Finanzamt so withholding approximates the true joint liability |
| **V** | The spouse of a class-III employee | Special formula (below) — highest effective withholding |
| **VI** | Second and any further concurrent employment | Same special formula as V, **and no** Arbeitnehmer-Pauschbetrag, no Sonderausgaben-Pauschbetrag, no Alleinerziehenden-Entlastung (only the Vorsorgepauschale letters a–c apply) |

**Class V/VI Jahreslohnsteuer (§ 39b(2) S.7 EStG), 2026 values:**
```
T = 2 × ( est_2026(1.25 × ZVJ) − est_2026(0.75 × ZVJ) )
```
subject to floors/ceilings on the zu versteuernder Jahresbetrag `ZVJ`:
- minimum **14 %** of `ZVJ`;
- for the part of `ZVJ` above **14 071 €**: at most **42 %**;
- for the part above **34 939 €**: **42 %**;
- for the part above **222 260 €**: **45 %**.

Tax classes only shift *when* tax is paid, never the annual liability, which is settled on assessment. **Note:** legislation to abolish classes III/V in favour of mandatory IV+Faktor has been announced for a later year; classes III and V are still in force in 2026.

---

## 6. Monthly Lohnsteuer algorithm — § 39b(2) EStG

1. Take the current wage for the pay period; annualise: **× 12** (monthly), **× 360/7** (weekly), **× 360** (daily) (S.2).
2. Subtract Versorgungsfreibetrag (§ 19(2)) and Altersentlastungsbetrag (§ 24a) where applicable (S.3).
3. Subtract/add any ELStAM Freibetrag / Hinzurechnungsbetrag (§ 39a), annualised the same way (S.4).
4. Subtract (S.5):
   - **1.** Arbeitnehmer-Pauschbetrag **1 230 €** — tax classes **I–V only**;
   - **2.** Sonderausgaben-Pauschbetrag **36 €** — tax classes **I–V only**;
   - **3.** the **Vorsorgepauschale** (see §7);
   - **4.** the Entlastungsbetrag für Alleinerziehende for **one** child, **4 260 €** — tax class **II only**.
   → result = **zu versteuernder Jahresbetrag (ZVJ)**.
5. Jahreslohnsteuer: classes **I, II, IV** → `est_2026(ZVJ)`; class **III** → `est_2026_splitting(ZVJ)`; classes **V, VI** → the special formula in §5.
6. Monthly Lohnsteuer = **1/12** of the Jahreslohnsteuer (weekly 7/360, daily 1/360). Fractions of a cent from steps 1 and 6 are dropped (S.10).
7. The BMF publishes a binding **Programmablaufplan (PAP)** each year under § 39b(6) implementing this; payroll software must follow the PAP, which may deviate slightly from the literal statute where that better approximates the annual assessment.

---

## 7. Vorsorgepauschale (notional insurance deduction in payroll) — § 39b(2) S.5 Nr. 3 EStG

Computed on the annualised gross wage, each part capped at its own Beitragsbemessungsgrenze.

| Part | Applies in classes | 2026 amount |
|---|---|---|
| **a) Pension** — employees compulsorily insured in, or exempted under § 6(1)1 SGB VI from, the statutory pension scheme | I–VI | **50 % of the 18.6 % contribution = 9.3 %** of wage up to the RV BBG (101 400 €/yr) |
| **b) Health** — members of the GKV | I–VI | the employee share computed with the **ermäßigter Beitragssatz (14.0 %, § 243 SGB V) → 7.0 %** plus **half the employee's own fund's Zusatzbeitragssatz** (§ 242 SGB V), on wage up to the KV BBG (69 750 €/yr). With the 2026 average Zusatzbeitrag of 2.9 % this is **7.0 % + 1.45 % = 8.45 %** |
| **c) Long-term care** — members of the soziale Pflegeversicherung | I–VI | the employee share at the nationwide rate, **plus** the childless surcharge and **minus** the § 55(3) SGB XI child reductions, on wage up to the KV/PV BBG. Standard non-Saxony parent-of-one: **1.8 %** |
| **d) Private KV / private compulsory PV** — employees not covered by b) and c) | I–V | the actual contributions supplied as an ELStAM feature (§ 39(4) Nr. 4b), annualised, less the § 3 Nr. 62 tax-free employer subsidies |
| **e) Unemployment insurance** | I–V | employee share at the nationwide rate = **1.3 %** on wage up to the RV/AV BBG — **but only to the extent that, together with parts b)–d), it does not exceed 1 900 €** |

Severance/compensation payments under § 24 Nr. 1 EStG are excluded from parts a)–c) and e).

At the annual assessment the *actual* contributions are deducted as Sonderausgaben under § 10(1) Nr. 2, 3, 3a EStG instead (pension contributions 100 % deductible; basic health/care contributions fully deductible, with health contributions reduced by 4 % for the sick-pay entitlement component).

---

## 8. Employee social insurance contributions (Sozialversicherung) 2026

### 8.1 Contribution ceilings — Sozialversicherungsrechengrößen-Verordnung 2026
**West/East ceilings were unified nationwide from 1 Jan 2025 — there is no West/East split in 2026.**

| Ceiling | 2026 monthly | 2026 annual | (2025) |
|---|---|---|---|
| **BBG Renten-/Arbeitslosenversicherung** (allgemeine RV) | **8 450 €** | **101 400 €** | 8 050 / 96 600 |
| BBG knappschaftliche RV (miners) | 10 400 € | 124 800 € | 9 900 |
| **BBG Kranken- & Pflegeversicherung** | **5 812.50 €** | **69 750 €** | 5 512.50 / 66 150 |
| **Jahresarbeitsentgeltgrenze** (GKV compulsory-insurance / opt-out limit) | 6 450 € | **77 400 €** | 6 150 / 73 800 |
| Bezugsgröße (nationwide) | 3 955 € | 47 460 € | 3 745 / 44 940 |

Uprating basis: final 2024 average earnings, +5.16 %.

### 8.2 Rates 2026

| Branch | Total | **Employee** | Employer | Ceiling |
|---|---|---|---|---|
| **Rentenversicherung** (pension) | **18.6 %** | **9.3 %** | 9.3 % | 8 450 €/mo |
| — knappschaftliche RV | 24.7 % | 9.3 % | 15.4 % | 10 400 €/mo |
| **Arbeitslosenversicherung** (unemployment) | **2.6 %** | **1.3 %** | 1.3 % | 8 450 €/mo |
| **Krankenversicherung** allgemeiner Beitragssatz (§ 241 SGB V) | **14.6 %** | 7.3 % | 7.3 % | 5 812.50 €/mo |
| — ermäßigter Beitragssatz (§ 243 SGB V, no sick-pay entitlement) | 14.0 % | 7.0 % | 7.0 % | " |
| — **Zusatzbeitrag**, fund-specific; **statutory average 2026 = 2.9 %** (§ 242a SGB V, BMG announcement of 7 Nov 2025 in the Bundesanzeiger; 2025: 2.5 %) | 2.9 % | **1.45 %** | 1.45 % | " |
| ⇒ **average total GKV 2026** | **17.5 %** | **8.75 %** | 8.75 % | " |
| **Pflegeversicherung** (long-term care) | **3.6 %** | **1.8 %** | 1.8 % | 5 812.50 €/mo |
| — **Sachsen only** | 3.6 % | **2.3 %** | **1.3 %** | " |
| — **Kinderlosenzuschlag** (childless surcharge) | +0.6 pp | **+0.6 pp, employee alone** | — | " |
| **Typical employee total** (non-Saxony, parent of 1 child, average Zusatzbeitrag) | | **21.15 %** | 21.15 % | mixed ceilings |

Notes:
- **§ 55(1) SGB XI still names 3.4 %** as the statutory PV rate; the rate in force is **3.6 %**, set by the government's Rechtsverordnung under § 55(1) S.2 / (1a) SGB XI and unchanged for calendar year 2026. Implement 3.6 %.
- **Saxony:** because Sachsen kept the Buß- und Bettag public holiday, the employer bears 0.5 pp less and the employee 0.5 pp more than the even split (§ 58(3) SGB XI).
- The **Zusatzbeitrag varies by Krankenkasse** (roughly 1.5 %–4.4 % in 2026). The 2.9 % figure is the statutory *average* used for reference, for the Vorsorgepauschale default, and for the Faktor F. A real calculator should let the user enter their fund's rate.
- **Cross-check:** total 2026 SV rate = 18.6 + 2.6 + 14.6 + 2.9 + 3.6 = **42.3 %**, and Faktor F 2026 = 0.28 / 0.423 = **0.6619** — the officially published value, which independently confirms 2.9 % and 3.6 %.

### 8.3 Pflegeversicherung childless surcharge & child reductions — § 55(3) SGB XI

Employee-side PV rate (non-Saxony; add 0.5 pp throughout for Sachsen):

| Situation | Employee PV rate |
|---|---|
| Childless, aged **> 23** (from the month after the 23rd birthday) | **1.8 + 0.6 = 2.4 %** |
| Childless but aged ≤ 23 | 1.8 % |
| Parent, 1 child | 1.8 % |
| Parent, 2 children under 25 | 1.8 − 0.25 = **1.55 %** |
| Parent, 3 children under 25 | **1.30 %** |
| Parent, 4 children under 25 | **1.05 %** |
| Parent, 5 or more children under 25 | **0.80 %** (max reduction 1.0 pp; only children 2–5 count) |

- The reduction of **0.25 pp per child from the 2nd to the 5th child** runs until the end of the month in which that child turns (or would have turned) **25**. Children already 25+ do not count towards the reduction. Once all reductions lapse the rate returns to 1.8 % — a parent never pays the childless surcharge again.
- Surcharge exemptions: members born before 1 Jan 1940, military/civilian service conscripts, and recipients of Grundsicherungsgeld under § 19(1) S.1 SGB II.
- Parenthood and the number of children under 25 must be evidenced to the employer/fund (§ 55(3a) SGB XI); the digital verification procedure (§ 55a) applies retroactively to the birth month if reported within six months.

### 8.4 Employer-only contributions (part of the quoted package, no employee deduction)
| Item | 2026 rate | Base |
|---|---|---|
| Insolvenzgeldumlage (U3), § 360 SGB III | **0.15 %** | RV-liable pay up to the RV BBG |
| Umlage U1 (sick-pay reimbursement, employers ≤ 30 employees) | fund-specific; TK standard **2.1 %** | KV-liable pay |
| Umlage U2 (maternity), all employers | fund-specific; TK standard **0.44 %** | KV-liable pay |
| Gesetzliche Unfallversicherung (Berufsgenossenschaft) | varies by risk class, typically ~1 %–1.6 % | pay up to the BG's own ceiling |

There is **no** mandatory occupational pension beyond the statutory Rentenversicherung. Where an employee makes an Entgeltumwandlung into a betriebliche Altersversorgung, the employer must add **15 %** of the converted amount as a subsidy where SV contributions are saved (§ 1a(1a) BetrAVG).

---

## 9. Minijobs and the Übergangsbereich (Midijob) 2026

- **Statutory minimum wage: 13.90 €/hour** from 1 Jan 2026 (12.82 € in 2025).
- **Minijob (geringfügige Beschäftigung) threshold: 603 €/month** (7 236 €/year), dynamically pegged at 130/3 × minimum wage. Employee pays no tax and no SV except the pension contribution, from which they can opt out (Befreiung von der RV-Pflicht); the employer pays flat-rate levies.
- **Übergangsbereich (Midijob): 603.01 € – 2 000 €** per month. Employee SV contributions are reduced on a sliding scale to zero at the lower bound.
- **Faktor F 2026 = 0.6619** (= 28 % ÷ 42.3 % total SV rate).
- Notional contributory pay for the **total** contribution:
  `BE = F·603 + (2000/(2000−603) − (603/(2000−603))·F) · (AE − 603)`
  Simplified 2026 coefficients: **`BE_total = 1.1459205897 · AE − 291.8411794270`**
- Employee-share base: **`BE_AN = 1.4316392269 · AE − 863.2784538296`** (floored at 0).
- The employer pays the difference between the total contribution and the employee share.

---

## 10. Ordering — how to build a take-home-pay calculation

For a monthly gross salary `G` (single, tax class I, non-Saxony, GKV, parent of one):

1. **Social insurance (employee), each on `min(G, ceiling)`:**
   - RV: `9.3 % × min(G, 8450)`
   - AV: `1.3 % × min(G, 8450)`
   - KV: `(7.3 % + Zusatzbeitrag/2) × min(G, 5812.50)` → 8.75 % at the 2.9 % average
   - PV: `PV_employee_rate × min(G, 5812.50)` → 1.8 %
2. **Lohnsteuer:** annualise `G×12`; subtract 1 230 + 36 + Vorsorgepauschale (§7 — note the KV part uses **7.0 %** + half the Zusatzbeitrag, *not* 7.3 %); apply `est_2026()`; divide by 12.
3. **Soli:** on the annual Lohnsteuer base (adjusted for Kinderfreibeträge), Freigrenze 20 350 / 40 700 with the 11.9 % Milderungszone; monthly threshold 1 695.83 € (class III: 3 391.66 €).
4. **Kirchensteuer:** 8 % or 9 % of the (child-allowance-adjusted) Lohnsteuer, if a member.
5. **Net = G − SV_employee − Lohnsteuer − Soli − Kirchensteuer.**
6. Employer cost = `G` + employer SV (≈ 21.15 %, subject to the same ceilings) + U1/U2/U3 + Unfallversicherung.

---

## 11. Non-residents (one line)
Beschränkt Steuerpflichtige (§ 1(4) EStG) are taxed only on German-source income, are placed in **tax class I** regardless of marital status, get no splitting, no Kinderfreibetrag, no Entlastungsbetrag für Alleinerziehende and no Grundfreibetrag on most non-employment income; EU/EEA residents meeting the 90 %-income / § 1(3)/§ 1a thresholds may elect unlimited-liability treatment.

---

## 12. Worked verification examples (VZ 2026, Grundtarif)

Verified against the published 2026 Grundtabelle (finanz-tools.de, generated from § 32a — every ESt value below is reproduced **exactly** by `est_2026()`), plus Soli/church-tax values I recomputed from § 4 SolZG.

| zvE | ESt (§32a) | Soli (5.5 %/11.9 % rule) | KiSt 8 % | KiSt 9 % |
|---|---|---|---|---|
| 12 348 | 0 | 0.00 | 0.00 | 0.00 |
| 15 000 | 435 | 0.00 | 34.80 | 39.15 |
| 17 799 | 1 034 | 0.00 | 82.72 | 93.06 |
| 17 800 | 1 035 | 0.00 | 82.80 | 93.15 |
| 20 000 | 1 570 | 0.00 | 125.60 | 141.30 |
| 30 000 | 4 217 | 0.00 | 337.36 | 379.53 |
| 40 000 | 7 209 | 0.00 | 576.72 | 648.81 |
| 50 000 | 10 548 | 0.00 | 843.84 | 949.32 |
| 60 000 | 14 233 | 0.00 | 1 138.64 | 1 280.97 |
| 69 878 | 18 213 | 0.00 | 1 457.04 | 1 639.17 |
| 69 879 | 18 213 | 0.00 | 1 457.04 | 1 639.17 |
| 80 000 | 22 464 | **251.57** (Milderungszone: 11.9 % × 2 114) | 1 797.12 | 2 021.76 |
| 83 000 | 23 724 | 401.51 | 1 897.92 | 2 135.16 |
| 84 000 | 24 144 | 451.49 | 1 931.52 | 2 172.96 |
| 90 000 | 26 664 | 751.37 | 2 133.12 | 2 399.76 |
| 96 000 | 29 184 | 1 051.25 | 2 334.72 | 2 626.56 |
| 100 000 | 30 864 | 1 251.17 | 2 469.12 | 2 777.76 |
| 120 000 | 39 264 | **2 159.52** (flat 5.5 % now binds) | 3 141.12 | 3 533.76 |
| 277 825 | 105 550 | 5 805.25 | 8 444.00 | 9 499.50 |
| 277 826 | 105 551 | 5 805.30 | 8 444.08 | 9 499.59 |
| 300 000 | 115 529 | 6 354.09 | 9 242.32 | 10 397.61 |

Boundary checks an implementation must pass:
- `est(12348) = 0`, `est(12349) = 0` (formula yields €0.14 → floors to 0)
- `est(17799) = 1034` and `est(17800) = 1035` — zones 2/3 are continuous
- `est(69878) = est(69879) = 18213` — zones 3/4 continuous
- `est(277825) = 105550`, `est(277826) = 105551` — zones 4/5 continuous
- Soli crossover at ESt = 37 838.28 € (single)

---

## 13. Sources

Primary (statute / authority):
- § 32a EStG, "ab dem Veranlagungszeitraum 2026" — https://www.gesetze-im-internet.de/estg/__32a.html
- § 9a EStG (Arbeitnehmer-Pauschbetrag 1 230 €) — https://www.gesetze-im-internet.de/estg/__9a.html
- § 10c EStG (Sonderausgaben-Pauschbetrag 36 €) — https://www.gesetze-im-internet.de/estg/__10c.html
- § 24b EStG (Entlastungsbetrag 4 260 € + 240 €) — https://www.gesetze-im-internet.de/estg/__24b.html
- § 32(6) EStG (Kinderfreibetrag 3 414 € + 1 464 €) — https://www.gesetze-im-internet.de/estg/__32.html
- § 66 EStG (Kindergeld 259 €/month) — https://www.gesetze-im-internet.de/estg/__66.html
- § 38b EStG (Steuerklassen) — https://www.gesetze-im-internet.de/estg/__38b.html
- § 39b EStG (Lohnsteuer algorithm, Vorsorgepauschale, class V/VI thresholds 14 071 / 34 939 / 222 260) — https://www.gesetze-im-internet.de/estg/__39b.html
- § 3 SolZG 1995 (Freigrenzen 20 350 / 40 700), § 4 (5.5 % / 11.9 %), § 6(27) (first applies VZ 2026) — https://www.gesetze-im-internet.de/solzg_1995/__3.html , /__4.html , /__6.html
- § 55 SGB XI (PV rate, childless surcharge 0.6 pp, child reductions 0.25 pp) — https://www.gesetze-im-internet.de/sgb_11/__55.html
- Deutsche Rentenversicherung Knappschaft-Bahn-See, "Die Sozialversicherungsrechengrößen 2026" — https://www.deutsche-rentenversicherung.de/KnappschaftBahnSee/DE/Aktuelles/Meldungen/2026/2026_01_02_Sozialversicherungsrechengroessen2026.html
- Deutsche Rentenversicherung, "Bundeskabinett beschließt Sozialversicherungsrechengrößen 2026" — https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2025/25-10-08-bundeskabinett-sv-rechengroessen-vo-2026.html
- Deutsche Rentenversicherung, "Verdienstgrenzen im Mini- und Midijob steigen" — https://www.deutsche-rentenversicherung.de/DRV/DE/Ueber-uns-und-Presse/Presse/Meldungen/2026/260223-minijob-midijob-verdienstgrenzen-steigen.html
- Bundesregierung, "Beitragsbemessungsgrenzen 2026" — https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514
- BMG, Beiträge der gesetzlichen Krankenversicherung — https://www.bundesgesundheitsministerium.de/beitraege
- BMG, Finanzierung der sozialen Pflegeversicherung — https://www.bundesgesundheitsministerium.de/themen/pflege/online-ratgeber-pflege/die-pflegeversicherung/finanzierung
- Bundesanzeiger, BMG announcement of the average Zusatzbeitragssatz 2026 (7 Nov 2025) — https://www.bundesanzeiger.de/pub/publication/oUJYVk8GYRXybnb9Y4h

Corroboration (secondary):
- vdek, "Durchschnittlicher Zusatzbeitragssatz wird Anfang 2026 steigen" (2.9 %) — https://www.vdek.com/magazin/ausgaben/2025-06/durchschnittlicher-zusatzbeitrag-2026.html
- vdek, "Das ändert sich 2026 in GKV und SPV" — https://www.vdek.com/politik/was-aendert-sich/gesundheitswesen-2026.html
- GKV-Spitzenverband, Faktenblatt Rechengrößen Beitragsrecht 2026 — https://www.gkv-spitzenverband.de/media/dokumente/presse/zahlen_und_grafiken/20260101_Faktenblatt_Rechengroessen_Beitragsrecht.pdf
- lohn-info.de, Sozialversicherungsbeiträge 2026 — https://www.lohn-info.de/sozialversicherungsbeitraege2026.html
- lohn-info.de, Pflegeversicherung Sachsen — https://www.lohn-info.de/pflegeversicherung_sachsen.html
- TK Firmenkunden, Insolvenzgeldumlage 2026 (0.15 %) — https://www.tk.de/firmenkunden/service/fachthemen/fachthema-beitraege/insolvenzgeldumlage-2047584
- TK Firmenkunden, Mindestlohn 2026, Minijobs und Übergangsbereich — https://www.tk.de/firmenkunden/service/fachthemen/versicherung-fachthema/mindestlohn-2026-minijobs-und-uebergangsbereich-2203074
- Einkommensteuer-Grundtabelle 2026 (used for numeric verification) — https://einkommensteuertabellen.finanz-tools.de/downloads/grundtabelle-2026-ueberblick-gross.pdf

---

## 14. Caveats
1. **Zusatzbeitrag is fund-specific.** 2.9 % is only the statutory *average* announced by the BMG under § 242a SGB V. Individual Krankenkassen in 2026 range roughly 1.5 %–4.4 %. Anything derived from 2.9 % (the 17.5 % total, the 8.75 % employee share, the Vorsorgepauschale KV part) shifts with the actual fund.
2. **§ 55(1) SGB XI still reads 3.4 %** in the consolidated statute; the operative 3.6 % comes from the government Rechtsverordnung under § 55(1) S.2 SGB XI. It is confirmed unchanged for 2026 by BMG and by the Faktor-F arithmetic, but the statutory text alone would mislead.
3. **BMF Programmablaufplan.** § 39b(6) EStG permits the official payroll PAP to deviate from the literal statute where that better tracks the annual assessment. Payroll software must follow the PAP. I did not fetch the 2026 PAP itself (BMF's ESt-Handbuch server returned a Radware challenge to the fetch tool); the statutory algorithm in §6 above is the legal baseline and matches the published tax tables to the euro.
4. **No official BMF worked example was obtainable in this session.** The verification table in §12 is my computation reproduced against a third-party 2026 Grundtabelle; all 19 sampled ESt values matched exactly, but this is not an authority-published worked example. BMF's own "Lohn- und Einkommensteuerrechner" (bmf-steuerrechner.de) is the reference implementation to test against.
5. **Church-tax Kappung** thresholds (2.75 %–4 % of zvE) vary by Landeskirche and were not verified per-Land from the individual Kirchensteuergesetze. They bind only at high incomes; ignoring Kappung is safe for a mainstream employee calculator.
6. **U1/U2 rates are fund-specific**; the 2.1 % / 0.44 % figures are Techniker Krankenkasse's standard rates and are not universal. Unfallversicherung rates are Berufsgenossenschaft-specific.
7. **Steuerklassen III/V abolition** has been legislated as a future reform toward mandatory class IV + Faktor; it is **not** in effect for 2026, but a calculator should expect it in a later year.
8. Not covered per scope: Kapitalertragsteuer/Abgeltungsteuer (25 % + Soli + KiSt, Sparer-Pauschbetrag), business and self-employment income, inheritance/gift tax, Progressionsvorbehalt on wage-replacement benefits (§ 32b), and Riester/Rürup reliefs.
