# France — Personal income tax & employee payroll deductions
## Implementation spec as at 20 July 2026

All figures below were fetched from source in this session (July 2026). Sources listed at the end.

---

## 0. Which year is in effect on 20 July 2026?

France is a **calendar-year** jurisdiction. Two different "years" are live simultaneously and a
calculator must not conflate them:

| Thing | Year in effect on 20 Jul 2026 | Period |
|---|---|---|
| **Impôt sur le revenu (annual liability, barème)** | **Impôt 2026 on 2025 income** — declared spring 2026, assessed summer 2026 | income earned 1 Jan 2025 – 31 Dec 2025 |
| **Social contributions on salary (payslip)** | **2026 rates**, PASS 2026 | 1 Jan 2026 – 31 Dec 2026 |
| **Prélèvement à la source (PAS) default-rate grid** | **grid applicable from 1 May 2026** | 1 May 2026 – 30 Apr 2027 |

Legal basis for the 2026 barème: **loi n° 2026-103 du 19 février 2026 de finances pour 2026, art. 4**,
which indexed the bracket limits by **+0,9 %** for taxation of 2025 income.

For a take-home-pay calculator the pragmatic model is: apply **2026 social contribution rates** to
gross salary, and apply the **barème 2026 (revenus 2025)** to the resulting net imposable. The
barème for 2026 income is not yet published (it will be set by the loi de finances pour 2027 in
Dec 2026) — see caveats.

---

## 1. Barème progressif — impôt 2026 sur les revenus 2025

Applied to **R/N** = revenu net imposable ÷ number of parts (quotient familial).

| Fraction of income **per part** | Rate |
|---|---|
| ≤ 11 600 € | 0 % |
| 11 601 € – 29 579 € | 11 % |
| 29 580 € – 84 577 € | 30 % |
| 84 578 € – 181 917 € | 41 % |
| > 181 917 € | 45 % |

### 1.1 Official linear ("tableau de calcul") form — use this, it is exact

Let `R` = revenu net imposable (whole household), `N` = number of parts, `Q = R/N`.

| If Q is in… | Impôt brut = |
|---|---|
| 0 – 11 600 € | 0 |
| 11 601 – 29 579 € | `R × 0,11 − 1 276,00 × N` |
| 29 580 – 84 577 € | `R × 0,30 − 6 896,01 × N` |
| 84 578 – 181 917 € | `R × 0,41 − 16 199,48 × N` |
| > 181 917 € | `R × 0,45 − 23 476,16 × N` |

(Internal check: 11 600×0,11 = 1 276,00; 1 276 + 29 579×0,19 = 6 896,01;
6 896,01 + 84 577×0,11 = 16 199,48; 16 199,48 + 181 917×0,04 = 23 476,16.)

### 1.2 Rounding (CGI art. 193 and 1657-1)

Taxable base and tax are rounded **to the nearest euro**. < 0,50 € dropped; = 0,50 € and > 0,50 €
rounded up. Do the rounding at the end, not per bracket.

### 1.3 Recovery threshold

If the final income tax is **< 61 €**, nothing is collected (seuil de mise en recouvrement).

---

## 2. From gross salary to revenu net imposable

### 2.1 Order of operations

```
salaire brut annuel
  − employee social contributions that are deductible for IR
      (vieillesse plafonnée + déplafonnée, AGIRC-ARRCO points T1/T2, CEG T1/T2, CET, APEC,
       Alsace-Moselle maladie, mandatory prévoyance/mutuelle employee share)
  − CSG déductible (6,80 %)
  = net imposable (this is what appears as "net imposable" on the payslip and is pre-filled in box 1AJ)
      NB: CSG non déductible (2,40 %) and CRDS (0,50 %) are NOT deducted — they are borne out of
      net pay but remain in the taxable base. The employer's share of a mandatory
      complémentaire santé (mutuelle) is also added back into net imposable.
  − déduction forfaitaire 10 % pour frais professionnels  (or frais réels on option)
  = revenu net catégorial (traitements et salaires)
  … + other categories, − charges déductibles (e.g. pension alimentaire, PER)
  = revenu net global → − abattements spéciaux → REVENU NET IMPOSABLE (R)
```

### 2.2 Déduction forfaitaire de 10 % — revenus 2025

* Rate: **10 %** of net imposable salary.
* **Floor: 509 €** per household member with salary income.
* **Ceiling: 14 555 €** per household member.
* Applied **per person**, not per household.
* Taxpayer may instead elect **frais réels** (actual expenses), per person.

```
abattement = min(14555, max(509, 0.10 * salaireNetImposable))
# floor cannot exceed the salary itself
abattement = min(abattement, salaireNetImposable)
```

### 2.3 Abattement spécial personnes âgées / invalides (CGI art. 157 bis), revenus 2025

Applies if the taxpayer (or spouse/PACS partner) is **> 65 on 31.12.2025** (born before 1.1.1961)
**or** invalid at any age. Deducted from revenu net global:

* **2 822 €** if revenu net global ≤ **17 670 €**
* **1 411 €** if 17 670 € < revenu net global ≤ **28 430 €**
* **0** above 28 430 €
* **Doubled** if both spouses qualify.

### 2.4 Abattement enfants mariés rattachés

**6 855 €** per attached person (married child, or single child with own family) — CGI art. 196 B al. 2.

---

## 3. Quotient familial — UNAVOIDABLE for accuracy

**This is not optional.** French income tax cannot be computed from income alone. The barème is
applied to income **divided by the number of parts N**, then multiplied back by N. Household
composition changes liability by thousands of euros. Any FR calculator must collect:
marital status, number of dependent children, whether children are in shared residence
(résidence alternée), single-parent status (case T), and disability/veteran status.

### 3.1 Number of parts (Tableau 1, brochure IR 2026)

| Situation | 0 dep. | 1 dep. | 2 dep. | 3 dep. | 4 dep. | 5 dep. | each further dep. |
|---|---|---|---|---|---|---|---|
| **Marié / pacsé** | 2 | 2,5 | 3 | 4 | 5 | 6 | +1 |
| **Veuf** | 1 | 2,5 | 3 | 4 | 5 | 6 | +1 |
| **Célibataire, séparé, divorcé** | 1 | 1,5 | 2 | 3 | 4 | 5 | +1 |

Pattern: first two dependants give **+0,5 part each**; the third and each subsequent dependant
gives **+1 part**. Note the widow(er) anomaly: 1 part with no dependants but **2,5** with one.

Additional half-parts ("cas particuliers", giving 1,5 for a single person or 2,5/3 for a couple):
* +0,5 for each dependant holding a disability card (cases G or R).
* +0,5 if the taxpayer or spouse is invalid, or is over 74 with a carte du combattant; +1 part if
  **both** are invalid.
* +0,5 for a single person living alone who has declared at least one dependant (case T).
* +0,5 (case L) for a person living alone who raised a child alone for ≥ 5 years, where that child
  is now taxed separately.
* If the spouse/PACS partner died in 2025, the household follows the **"mariés"** regime for 2025.

### 3.2 Résidence alternée (shared custody)

Increments are **halved** for children in shared residence:

Case **T ticked** (single parent):

| Exclusive children ↓ / shared children → | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 1 | 1,25 | 1,75 | 2,25 | 2,75 |
| 2 | 2,00 | 2,50 | 3,00 | 3,50 |
| 3 | 3,00 | 3,50 | 4,00 | 4,50 |

Case **T not ticked**:

| Exclusive children ↓ / shared children → | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| 1 | 0,75 | 1,25 | 1,75 | 2,25 |
| 2 | 1,50 | 2,00 | 2,50 | 3,00 |
| 3 | 2,50 | 3,00 | 3,50 | 4,00 |

(These tables give the **majoration**, i.e. the parts to add to the base 1 or 2.)
If living alone with **only** children in résidence alternée, a **0,25 part** majoration under case T
is granted for each of the first 2 children.

### 3.3 Plafonnement du quotient familial — revenus 2025

The tax **advantage** produced by parts beyond the reference number is capped.

**Algorithm:**

```
N_ref = 2 for married/PACS (and widow(er) whose spouse died in the tax year)
      = 1 for single / divorced / separated / widowed
halfParts = (N - N_ref) * 2          # number of half-parts above the reference
taxRef    = bareme(R, N_ref)         # tax computed with the reference parts
taxQF     = bareme(R, N)             # tax with the actual parts
advantage = taxRef - taxQF
cap       = 1807 * halfParts         # general cap, with the exceptions in 3.4
impotBrut = (advantage <= cap) ? taxQF : (taxRef - cap)
```

**General cap: 1 807 € per half-part** exceeding:
* 1 part — single, divorced or separated persons *not* raising children alone and not living alone
  with a dependent invalid;
* 1 part — widowed persons, with or without dependants; and single/divorced/separated persons
  living alone with no dependent children but with dependent invalids;
* 2 parts — married or PACS couples.

Quarter-parts (résidence alternée) are capped at **1 807 € / 2 = 903,50 €** each.

### 3.4 Special caps and complementary reductions (revenus 2025)

| Case | Amount |
|---|---|
| General cap per half-part | **1 807 €** |
| Cap per quarter-part (résidence alternée) | **1 807 € / 2** |
| Single/divorced/separated raising child(ren) **alone** (case T): combined cap for the **first two extra half-parts** | **4 262 €** (not 2 × 1 807) |
| Same, per quarter-part version for the first two children in résidence alternée | **4 262 € / 2** |
| Case **L** (living alone, raised a child ≥ 5 years, child now taxed separately): cap for that half-part | **1 079 €** |
| **Complementary reduction** when the 1 807 € cap is reached for the extra half-part granted to invalids, war veterans, war widows | up to **1 801 €** (deducted from tax) |
| Same, quarter-part version | **1 801 € / 2** |
| **Complementary reduction** for widowed taxpayers with ≥ 1 dependant when the cap is reached on the first two extra half-parts (3 614 €) | up to **2 011 €** |

### 3.5 Non-taxation thresholds (Tableau 6 — revenu net imposable at which tax starts)

| Parts | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4 | 4,5 | 5 | 5,5 | 6 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Single | 17 214 | 23 014 | 28 814 | 34 614 | 40 414 | 46 214 | 52 014 | 57 814 | 63 614 | 69 414 | 75 214 |
| Married/PACS | – | – | 32 487 | 38 287 | 44 087 | 49 887 | 55 687 | 61 487 | 67 287 | 73 087 | 78 887 |

Recovery thresholds (Tableau 7 — below which tax < 61 € so nothing is collected):

| Parts | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4 | 4,5 | 5 | 5,5 | 6 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Single | 17 596 | 23 396 | 29 196 | 34 996 | 40 796 | 46 596 | 52 396 | 58 196 | 63 996 | 69 796 | 75 596 |
| Married/PACS | – | – | 32 869 | 38 669 | 44 469 | 50 269 | 56 069 | 62 869 | 67 669 | 73 469 | 79 269 |

---

## 4. Décote — revenus 2025

Applied **after** the barème and the plafonnement du quotient familial, **before** réductions d'impôt.
Independent of the number of parts.

```
if single/divorced/widowed and impot < 1982:
    decote = 897 - 0.4525 * impot
elif married/PACS (joint) and impot < 3277:
    decote = 1483 - 0.4525 * impot
else:
    decote = 0
impotApresDecote = max(0, impot - decote)
```

| | Threshold (impôt below which décote applies) | Décote formula |
|---|---|---|
| Célibataire / divorcé / veuf | **1 982 €** | `897 € − 45,25 % × impôt` |
| Marié / pacsé (imposition commune) | **3 277 €** | `1 483 € − 45,25 % × impôt` |

(Thresholds are exactly 897/0,4525 and 1 483/0,4525.)

**Authority worked example:** married couple, tax before décote = 2 140 €.
Décote = 1 483 − (2 140 × 45,25 %) = 1 483 − 968 = 515 €. Tax after décote = **1 625 €**.

---

## 5. Order of computation (official "fiche de calcul" order)

1. Compute revenu net imposable **R** and parts **N**.
2. Impôt from the barème on R/N × N.
3. **Plafonnement du quotient familial** (§3.3–3.4) → impôt brut.
4. Subtract the complementary reductions of §3.4 (1 801 € / 2 011 €) where applicable.
5. **DOM abattement** (§8) — applied on the barème tax after plafonnement, before décote.
6. **Décote** (§4).
7. Réductions d'impôt (dons, emploi à domicile, etc.).
8. Crédits d'impôt; then **CEHR** and **CDHR** are added on top (§6, §7).
9. If result < **61 €**, no tax is collected.

---

## 6. Contribution exceptionnelle sur les hauts revenus (CEHR) — CGI art. 223 sexies

An additional surtax on **revenu fiscal de référence (RFR)**, added to income tax. Not affected by
the quotient familial. Still in force for 2025 income.

| RFR band | Single / widowed / separated / divorced | Married / PACS (joint) |
|---|---|---|
| 3 % | 250 000 € – 500 000 € | 500 000 € – 1 000 000 € |
| 4 % | > 500 000 € | > 1 000 000 € |

**Authority worked example:** single, RFR = 550 000 € →
(500 000 − 250 000) × 3 % + (550 000 − 500 000) × 4 % = 7 500 + 2 000 = **9 500 €**.

*(A quotient/lissage mechanism exists for taxpayers newly crossing the threshold; out of scope for an
ordinary-employee calculator.)*

---

## 7. Contribution différentielle sur les hauts revenus (CDHR)

Created by LF 2025 art. 10 for 2024 income; **extended by LF 2026 art. 2** so that it applies to
2025 income **and continues** until the tax year for which the loi de règlement records a general
budget deficit below **3 % of GDP**. The instalment (acompte, due in December) and the associated
penalties are also carried over.

Mechanism: guarantees a **minimum average tax rate of 20 %** of the "revenu de référence" for
households whose revenu de référence exceeds **250 000 € (single)** / **500 000 € (joint)**. The
20 % floor is measured against income tax + CEHR + certain liberatory withholdings; the CDHR is the
difference. A smoothing (décote) mechanism applies just above the thresholds.

Practically irrelevant for an ordinary salaried employee — implement as an optional add-on or omit.
**The exact smoothing formula and the per-dependant majorations were not verified in this session
(see caveats).**

---

## 8. DOM abattement on income tax

Applied to the barème tax (after plafonnement QF, before décote), based on address at 31 December
of the income year:

* **Guadeloupe, Martinique, La Réunion: −30 %, capped at 2 450 €**
* **Guyane, Mayotte: −40 %, capped at 4 050 €**

---

## 9. Employee social contributions on salary — 2026 rates

### 9.1 Plafond de la Sécurité sociale (PASS) 2026

| | Amount |
|---|---|
| **PASS annuel 2026** | **48 060 €** |
| **PMSS mensuel 2026** | **4 005 €** |
| Plafond journalier | 220 € |
| 4 PASS (CSG/CRDS abatement ceiling, APEC ceiling, chômage ceiling) | **192 240 €** |
| 8 PASS (AGIRC-ARRCO tranche 2 ceiling) | **384 480 €** |
| (2025 reference) | 47 100 € / 3 925 € |

### 9.2 URSSAF employee contributions (secteur privé, 2026)

| Contribution | Rate | Base | IR-deductible? |
|---|---|---|---|
| **Assurance vieillesse plafonnée** | **6,90 %** | gross up to 1 PASS (48 060 €) | Yes |
| **Assurance vieillesse déplafonnée** | **0,40 %** | total gross | Yes |
| **CSG déductible** ("CSG non imposable") | **6,80 %** | 98,25 % of gross up to 192 240 €; 100 % of the excess | **Yes — deducted from taxable income** |
| **CSG non déductible** ("CSG imposable") | **2,40 %** | same base | No |
| **CRDS** | **0,50 %** | same base | No |
| **Assurance maladie (salarié)** | **0 %** | — | — |
| **Assurance maladie supplémentaire — Bas-Rhin, Haut-Rhin, Moselle** | **1,30 %** | total gross | Yes |
| **Assurance chômage (salarié)** | **0 %** (abolished 2018) | — | — |

Total CSG = **9,20 %** on salary. **Important 2026 change:** LFSS 2026 art. 12 raised CSG from 9,2 %
to **10,6 % only on revenus du patrimoine and produits de placement** — **salary CSG stays at 9,2 %**
and CSG déductible stays at 6,8 %. Do not apply 10,6 % to wages.

The 1,75 % assiette abatement (i.e. the 98,25 % factor) applies only within 4 PASS and only to
salary/unemployment-type income.

### 9.3 Retraite complémentaire AGIRC-ARRCO — 2026

Tranche 1 = 0 → 1 PASS (0 – 48 060 €). Tranche 2 = 1 → 8 PASS (48 060 – 384 480 €).

| Contribution | Tranche | Total | Employer | **Employee** |
|---|---|---|---|---|
| Cotisation de retraite (taux d'appel 127 %) | T1 | 7,87 % | 4,72 % | **3,15 %** |
| Cotisation de retraite (taux d'appel 127 %) | T2 | 21,59 % | 12,95 % | **8,64 %** |
| **CEG** (contribution d'équilibre général) | T1 | 2,15 % | 1,29 % | **0,86 %** |
| **CEG** | T2 | 2,70 % | 1,62 % | **1,08 %** |
| **CET** (contribution d'équilibre technique) — only if pay exceeds T1 | T1 + T2 | 0,35 % | 0,21 % | **0,14 %** |
| **APEC** (cadres only) | up to 4 PASS | 0,060 % | 0,036 % | **0,024 %** |

The underlying **taux de calcul des points** (used for pension rights, not for cash deduction) are
6,20 % T1 (3,72 / 2,48) and 17,00 % T2 (10,20 / 6,80). The cash deduction uses the 127 % taux d'appel
figures above.

### 9.4 Effective employee rates (derived — implementer's summary)

Non-cadre, métropole, no supplementary schemes:

| Slice of gross | Employee % |
|---|---|
| 0 → 48 060 € (T1) | 6,90 (vieillesse pl.) + 0,40 (déplaf.) + 3,15 (AGIRC-ARRCO) + 0,86 (CEG) + 9,20 × 0,9825 (CSG) + 0,50 × 0,9825 (CRDS) = **≈ 21,04 %** |
| 48 060 → 192 240 € (T2, within 4 PASS) | 0,40 + 8,64 + 1,08 + 0,14 (CET) + 9,70 × 0,9825 = **≈ 19,79 %** |
| 192 240 → 384 480 € (T2, above 4 PASS) | 0,40 + 8,64 + 1,08 + 0,14 + 9,70 (no 1,75 % abatement) = **≈ 19,96 %** |
| > 384 480 € | 0,40 + 9,70 = **≈ 10,10 %** |

Add **1,30 %** on total gross for Alsace-Moselle, **0,024 %** APEC (up to 4 PASS) for cadres, and the
employee share of any mandatory company mutuelle / prévoyance (rate is company-specific, typically
0,5–1,5 % of gross; the employer's share of the mutuelle must be **added back** into net imposable).

---

## 10. Employer contributions (2026) — quoted for total-cost display

| Contribution | Rate | Base |
|---|---|---|
| Assurance maladie, maternité, invalidité, décès | **7 %** reduced / **13 %** full | total gross (reduced rate applies below 2,25 SMIC) |
| Contribution solidarité autonomie (CSA) | 0,30 % | total gross |
| Assurance vieillesse | **8,55 %** up to PASS + **2,11 %** on total | |
| Allocations familiales | **3,45 %** reduced / **5,25 %** full | total gross (reduced below 3,3 SMIC) |
| Contribution au dialogue social | 0,016 % | total gross |
| Assurance chômage | **4,00 %** | up to 192 240 € |
| AGS | 0,25 % (0,03 % for temp-work agencies) | up to 192 240 € |
| FNAL | 0,10 % up to PASS (< 50 employees) / 0,50 % on total (≥ 50) | |
| Formation professionnelle + taxe d'apprentissage | 0,55 % (< 11 salariés) / 1 % (≥ 11) | total gross |
| CPF-CDD | 1 % | CDD gross |
| Taxe d'apprentissage | 0,59 % principal + 0,09 % solde (Alsace-Moselle: 0,44 %, no solde) | total gross |
| Accident du travail | rate notified by the Carsat | total gross |
| AGIRC-ARRCO retraite | 4,72 % T1 / 12,95 % T2 | |
| AGIRC-ARRCO CEG | 1,29 % T1 / 1,62 % T2 | |
| AGIRC-ARRCO CET | 0,21 % | T1+T2 if pay > T1 |
| APEC (cadres) | 0,036 % | up to 4 PASS |

A **réduction générale dégressive** (ex-Fillon) substantially reduces employer contributions on pay
below ~1,6 SMIC; it does not affect the employee's take-home and is out of scope here.

---

## 11. Prélèvement à la source (PAS) — monthly withholding

PAS is a **withholding on account**, reconciled against the annual liability. Two rate types:

* **Taux personnalisé**: `taux = (impôt sur le revenu du foyer / revenus soumis au PAS)`, computed by
  the DGFiP and transmitted to the employer. Rounded to one decimal.
* **Taux non personnalisé / "taux neutre" (taux par défaut)**: used for new employees or on
  taxpayer request. Grid below.

### 11.1 Grille de taux par défaut — métropole, applicable from 1 May 2026

Applied to the **monthly net taxable salary**.

| Monthly net taxable base | Rate |
|---|---|
| < 1 635 € | 0 % |
| 1 635 – 1 698 € | 0,5 % |
| 1 698 – 1 807 € | 1,3 % |
| 1 807 – 1 928 € | 2,1 % |
| 1 928 – 2 060 € | 2,9 % |
| 2 060 – 2 170 € | 3,5 % |
| 2 170 – 2 315 € | 4,1 % |
| 2 315 – 2 738 € | 5,3 % |
| 2 738 – 3 135 € | 7,5 % |
| 3 135 – 3 571 € | 9,9 % |
| 3 571 – 4 019 € | 11,9 % |
| 4 019 – 4 690 € | 13,8 % |
| 4 690 – 5 624 € | 15,8 % |
| 5 624 – 7 037 € | 17,9 % |
| 7 037 – 8 789 € | 20 % |
| 8 789 – 12 200 € | 24 % |
| 12 200 – 16 523 € | 28 % |
| 16 523 – 25 937 € | 33 % |
| 25 937 – 55 558 € | 38 % |
| ≥ 55 558 € | 43 % |

Separate (lower-threshold) grids exist for Guadeloupe/Réunion/Martinique and for
Guyane/Mayotte — not reproduced here.

**Short-contract abatement:** for contracts ≤ 2 months, an abatement of **748 €** per month
(= half the monthly net taxable SMIC of 1 495,04 € at 1.1.2026) is applied before the grid.

---

## 12. Reference values 2026

| Item | Value |
|---|---|
| SMIC horaire brut, 1 Jan 2026 | 12,02 € |
| SMIC mensuel brut (35 h), 1 Jan 2026 | 1 823,03 € |
| SMIC horaire brut, 1 Jun 2026 | 12,31 € |
| SMIC mensuel brut, 1 Jun 2026 | 1 867,02 € |
| SMIC mensuel **net imposable**, 1 Jan 2026 | 1 495,04 € |
| PASS 2026 | 48 060 € / 4 005 € per month |

---

## 13. Worked examples

### 13.1 Authority — barème + quotient familial
> Married couple, 2 dependent children (**3 parts**), revenu net imposable **54 000 €**.
> Income per part = 54 000 / 3 = 18 000 € → 11 % bracket.
> 54 000 × 0,11 = 5 940 €; deduct 1 276 × 3 = 3 828 €. **Impôt brut = 2 112 €.**
> *(Source: Brochure pratique IR 2026, p. 371.)*

### 13.2 Authority — décote
> Married, tax before décote **2 140 €** → décote = 1 483 − (2 140 × 45,25 %) = 1 483 − 968 = **515 €**
> → tax after décote = **1 625 €**.
> *(Source: Brochure pratique IR 2026, p. 371.)*

### 13.3 Authority — barème, single person
> Single person, taxable income **30 000 €** (1 part):
> 0 % on first 11 600 → 0; 11 % on 17 979 → 1 977,69 €; 30 % on 421 → 126,30 €.
> **Total = 2 103,99 €**, effective rate 7,01 %. (2 104 € > décote threshold 1 982 €, so no décote.)
> *(Source: service-public.gouv.fr A18045.)*

### 13.4 Authority — CEHR
> Single, RFR 550 000 € → (500 000 − 250 000) × 3 % + (550 000 − 500 000) × 4 % = **9 500 €**.

### 13.5 Authority lookup-table test vectors (Brochure IR 2026, pp. 372+)

These are direct-read tables **including** plafonnement QF and décote — ideal unit tests.

**Mariés ou pacsés**, revenu net imposable → impôt:

| RNI | 2 parts | 2,5 | 3 | 3,5 | 4 | 4,5 | 5 |
|---|---|---|---|---|---|---|---|
| 32 486 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| 32 487 | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| 38 000 | 882 | 0 | 0 | 0 | 0 | 0 | 0 |
| 38 500 | 962 | 35 | 0 | 0 | 0 | 0 | 0 |
| 40 000 | 1 201 | 275 | 0 | 0 | 0 | 0 | 0 |
| 88 000 | 12 608 | 10 801 | 8 994 | 7 187 | 5 380 | 3 938 | 3 300 |
| 90 000 | 13 208 | 11 401 | 9 594 | 7 787 | 5 980 | 4 173 | 3 520 |
| 100 000 | 16 208 | 14 401 | 12 594 | 10 787 | 8 980 | 7 173 | 5 366 |
| 110 000 | 19 208 | 17 401 | 15 594 | 13 787 | 11 980 | 10 173 | 8 366 |
| 120 000 | 22 208 | 20 401 | 18 594 | 16 787 | 14 980 | 13 173 | 11 366 |
| 125 000 | 23 708 | 21 901 | 20 094 | 18 287 | 16 480 | 14 673 | 12 866 |

**Verification of the algorithm against these** (all reproduce exactly):
* Married, 3 parts, RNI 100 000: taxQF = 100 000×0,30 − 6 896,01×3 = 9 311,97;
  taxRef(2 parts) = 100 000×0,30 − 6 896,01×2 = 16 207,98; advantage = 6 896,01 > cap 2×1 807 = 3 614
  → impôt = 16 207,98 − 3 614 = 12 593,98 → **12 594** ✓
* Married, 5 parts, RNI 100 000: cap = 6 × 1 807 = 10 842 → 16 207,98 − 10 842 = **5 366** ✓
* Married, 2 parts, RNI 38 000: 38 000×0,11 − 1 276×2 = 1 628; décote = 1 483 − 0,4525×1 628 = 746,33
  → 881,67 → **882** ✓
* Married, 2 parts, RNI 38 500: 4 235 − 2 552 = 1 683; décote = 1 483 − 761,55 = 721,45
  → 961,55 → **962** ✓

**Personnes seules / célibataires vivant seuls (case L, 1,5 part)** — extract:

| RNI | Impôt (1,5 part) |
|---|---|
| ≤ 23 013 | 0 |
| 23 014 | 1 |
| 30 000 | 1 116 |
| 40 000 | 4 025 |
| 50 000 | *(see brochure)* |
| 75 000 | 14 525 |
| 100 000 | 23 722 |

**Célibataires/divorcés en concubinage avec ≥ 1 enfant à charge** (2,5–5 parts) — extract:

| RNI | 2,5 | 3 | 3,5 | 4 | 4,5 | 5 |
|---|---|---|---|---|---|---|
| 34 613 | 0 | 0 | 0 | 0 | 0 | 0 |
| 34 614 | 1 | 0 | 0 | 0 | 0 | 0 |
| 40 000 | 861 | 0 | 0 | 0 | 0 | 0 |
| 100 000 | 17 369 | 15 562 | 13 755 | 11 948 | 10 141 | 8 334 |

### 13.6 Derived end-to-end take-home example (not authority-published — my own computation)

Single, no children, non-cadre, métropole, gross annual salary **40 000 €** (2026 rates), no mutuelle:

| Item | Amount |
|---|---|
| Gross | 40 000,00 |
| Vieillesse plafonnée 6,90 % (all below 48 060) | −2 760,00 |
| Vieillesse déplafonnée 0,40 % | −160,00 |
| AGIRC-ARRCO T1 3,15 % | −1 260,00 |
| CEG T1 0,86 % | −344,00 |
| CSG déductible 6,80 % × 39 300 (= 40 000 × 98,25 %) | −2 672,40 |
| CSG non déductible 2,40 % × 39 300 | −943,20 |
| CRDS 0,50 % × 39 300 | −196,50 |
| **Net à payer avant impôt** | **31 663,90** |
| **Net imposable** = 40 000 − 2 760 − 160 − 1 260 − 344 − 2 672,40 | **32 803,60** |
| − abattement 10 % (3 280,36; between 509 and 14 555) | −3 280,36 |
| **Revenu net imposable R** | **29 523** (rounded) |
| Impôt: R/N = 29 523 ≤ 29 579 → 11 % bracket: 29 523 × 0,11 − 1 276 × 1 | 1 971,53 → **1 972** |
| Décote: 1 972 < 1 982 → 897 − 0,4525 × 1 972 = 897 − 892,33 = 4,67 | −5 |
| **Impôt sur le revenu** | **1 967** |
| **Take-home after tax** | 31 663,90 − 1 967 = **29 696,90** |

*(Verify against the DGFiP simulator at simulateur-ir-ifi.impots.gouv.fr before shipping.)*

---

## 14. Non-residents (one line)

Non-residents are taxed only on French-source income, at a minimum rate of 20 % (up to
€ 29 315-ish threshold for 2024 income; 30 % above) unless they prove a lower average worldwide
rate. Different withholding schedule (retenue à la source, CGI art. 182 A). Out of scope.

---

## 15. Sources

1. BOFiP **ACTU-2026-00022** — *IR - Indexation du barème… au titre de l'imposition des revenus de
   l'année 2025 (loi n° 2026-103 du 19 février 2026 de finances pour 2026, art. 4)* —
   https://bofip.impots.gouv.fr/bofip/14954-PGP.html/ACTU-2026-00022
2. BOFiP **BOI-IR-LIQ-20-10** (version 07/04/2026) — barème table —
   https://bofip.impots.gouv.fr/bofip/2491-PGP.html/identifiant=BOI-IR-LIQ-20-10-20260407
3. **Brochure pratique IR 2026 (revenus 2025), DGFiP**, "Calcul de l'impôt", pp. 369–382 —
   https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/21-calcul_impot_369a382.pdf
   (parts, plafonnement, décote, DOM, exemption thresholds, lookup tables, worked examples)
4. **Brochure pratique IR 2026, "Principales nouveautés revenus 2025 / 2026"** —
   https://www.impots.gouv.fr/www2/fichiers/documentation/brochure/ir_2026/pdf_som/nouveautes.pdf
5. service-public.gouv.fr **A18045** — *Impôt sur le revenu : tranches et taux d'imposition 2026* —
   https://www.service-public.gouv.fr/particuliers/actualites/A18045
6. service-public.gouv.fr **F1419** — barème —
   https://www.service-public.gouv.fr/particuliers/vosdroits/F1419
7. economie.gouv.fr — *Pouvez-vous bénéficier de la décote de l'impôt sur le revenu ?*
8. DGFiP simulateur IR 2026, aide "frais professionnels" (10 % floor/ceiling for revenus 2025) —
   https://simulateur-ir-ifi.impots.gouv.fr/calcul_impot/2026/aides/frais.htm
9. **URSSAF — Taux de cotisations, secteur privé** (2026 employer and employee rates, 4 PASS
   ceiling 192 240 €) —
   https://www.urssaf.fr/accueil/outils-documentation/taux-baremes/taux-cotisations-secteur-prive.html
10. **Arrêté du 22 décembre 2025** fixing the plafond de la sécurité sociale for 2026 (48 060 €) —
    https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000053143451 ; URSSAF/BOSS confirmation.
11. **Agirc-Arrco — Cotisations au régime Agirc-Arrco en 2026** —
    https://reglementation.agirc-arrco.fr/home/baremes/listes-area/baremes-1/cotisations-au-regime-agirc-arrco-en-2026.html
12. BOFiP **BOI-BAREME-000037** (version 07/04/2026) — PAS default-rate grids from 1 May 2026 —
    https://bofip.impots.gouv.fr/bofip/11255-PGP.html/identifiant=BOI-BAREME-000037-20260407
13. BOFiP **ACTU-2025-00206** — adjustment of PAS default grids + 748 € short-contract abatement.
14. service-public.gouv.fr **F31130** — CEHR.
15. BOFiP **ACTU-2026-00104** — CDHR created by LF 2025 art. 10, extended by LF 2026 art. 2.
16. travail-emploi.gouv.fr / URSSAF — SMIC 1 Jan 2026 and 1 Jun 2026.

---

## 16. Caveats

1. **Two years in play.** The barème confirmed here taxes **2025 income**. The barème for **2026
   income** (payable 2027) has *not* been published — it will be set by the loi de finances pour 2027
   in December 2026. Do not extrapolate. A 2026 take-home calculator therefore mixes 2026 social
   contribution rates with the 2025-income barème; label this clearly in the UI.
2. **Quotient familial is mandatory input.** Household composition (marital status, dependants,
   shared custody, single-parent status, disability) changes the result by thousands of euros. A
   FR calculator that asks only for income will be materially wrong for anyone who is not single
   and childless.
3. **CDHR smoothing formula not verified.** I confirmed the CDHR exists, applies to 2025 income, its
   RFR thresholds (250 000 / 500 000 €) and the 20 % minimum-rate principle, but the exact décote /
   lissage formula and per-dependant majorations were not retrieved from an authority page in this
   session. Treat as unimplemented or low-confidence.
4. **CEHR lissage (quotient) mechanism** for taxpayers newly crossing the threshold not detailed here.
5. **Mutuelle / prévoyance.** The employee share of the mandatory complémentaire santé is
   company-specific (no national rate) and the employer share is added back into net imposable.
   Any net-pay figure ignoring it will be slightly optimistic.
6. **Réduction générale des cotisations patronales** (ex-Fillon) and the reduced employer maladie /
   allocations familiales rates depend on SMIC multiples; the exact 2026 thresholds and formula were
   not fetched. Employer-cost figures below ~2,25 SMIC will be overstated.
7. **DOM PAS grids** (Guadeloupe/Réunion/Martinique; Guyane/Mayotte) exist with different bands and
   were not reproduced.
8. **Lookup-table extracts in §13.5** are partial transcriptions from a PDF text layer. The four
   spot-checks reproduce exactly via the algorithm, which is strong evidence the algorithm is right,
   but re-read the PDF before hard-coding a large fixture set.
9. **Frais réels** option, pensions/retirement income (different abattement: 10 % with its own
   floor/ceiling), and unemployment benefit taxation are not covered.
10. The **service-public F1419 / A18045 pages** are secondary to BOFiP but the brackets match
    BOI-IR-LIQ-20-10 exactly, so the barème is high confidence.
