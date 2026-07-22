# Tax research specs — UNVERIFIED source material

These are implementation-ready research specs for per-country tax engines,
produced by a fan-out research workflow (July 2026). Each cites the national
revenue authority's own pages and, where possible, that authority's published
worked examples.

## Status — read before building from these

**These specs are NOT verified.** The workflow's adversarial-verification and
adjudication pass did not complete (the account hit its usage limit partway
through), so every figure here is from a **single research pass** and carries
the authoring agent's self-reported confidence only.

A spec becomes trustworthy only once its numbers are encoded as an engine in
`lib/tax/<code>.js` **and** that engine passes the authority's published worked
examples in `scripts/verify-tax.mjs`. That harness — not these documents — is
the source of truth for what has actually been verified.

| Region | Spec | Engine built? | Verified in harness? |
|---|---|---|---|
| AU | (pre-workflow) | ✅ `au.js` | ✅ 27 checks |
| IE | `IE.md` | ✅ `ie.js` | ✅ 26 checks (Revenue USC + DSP PRSI) |
| GB | `GB.md` | ✅ `gb.js` | ✅ 30 checks (gov.scot + HMRC, incl. Scottish bands) |
| NL | `NL.md` | ✅ `nl.js` | ✅ 19 checks (Witte Maandloon-tabel) |
| DE | `DE.md` | ✅ `de.js` | ✅ 35 checks (tax core: §32a Grundtabelle + Soli + church, exact). **Income tax calculator LIVE; take-home HELD** — the gross→net composite uses the statutory Vorsorgepauschale with no BMF worked example to check it. See `SALARY_MODEL_REGIONS` vs `INCOME_TAX_MODEL_REGIONS` in coverage.js. To ship DE take-home, verify against the BMF calculator then add "DE" to `SALARY_MODEL_REGIONS`. |
| FR | `FR.md` | ✅ `fr.js` | ✅ 29 checks (DGFiP Brochure IR lookup tables — barème + quotient familial + plafonnement + décote, exact). Both tools LIVE. Composite net matches the researched worked example. |
| AE | `AE.md` | ✅ `ae.js` | ✅ 21 checks (no income tax; GPSSA pension + gratuity vs GPSSA/MOHRE figures). Both tools live. |
| US | `US.md` (+ unused `US-states-*.md`) | ✅ `us.js` | ✅ 27 checks (Rev. Proc. 2025-32 brackets/FICA/CTC, worked examples exact). **Federal only** — state tax disclosed-excluded. Both tools live. |
| CA | `CA.md` (federal) | ✅ `ca.js` | ✅ 18 checks (CRA T4032-ON worked examples A & B exact; CPP/CPP2/EI/BPA from T4127). **Federal only** — provincial tax disclosed-excluded; Quebec out of scope. Both tools live. |
| IN | `IN.md` | `incometax.js` (FY2026-27) | ✅ 9 checks. Relabelled to FY2026-27 (AY2027-28) under the Income-tax Act 2025; Budget 2026 retained the Budget 2025 slabs/SD/rebate (verified against 2026 sources), so figures unchanged. |
| SG | `SG.md` | ✅ `sg.js` | ✅ 27 checks (IRAS resident schedule + worked example $234,100→$27,629 exact; CPF 2026 table from CPF Board PDF). Both tools live; CPF citizen/PR-only. |
| CA | `CA.md` + `CA-provinces-1.md` | ❌ | ❌ |
| DE | `DE.md` | ❌ | ❌ |
| FR | `FR.md` | ❌ | ❌ |
| NL | `NL.md` | ❌ | ❌ |
| AE | `AE.md` | ❌ | ❌ |
| SG | (research did not complete) | ❌ | ❌ |

## Research gaps (workflow stopped early)

- **Singapore** — national spec never produced.
- **US states batch 5** — NC, ND, OH, OK, OR, PA, RI, SC missing.
- **Canada provinces batches 2 & 3** — NT, NS, NU, ON, PE, QC, SK, YT missing
  (Ontario and Quebec are the two most important and are absent).

## Key finding — India may be a year stale

`IN.md` reports that India's FY 2026-27 (began 1 April 2026) kept every rate,
slab, standard deduction and Section 87A rebate **unchanged** from FY 2025-26
(Budget 2026 changed no numbers) — so `lib/incometax.js` is arithmetically
still correct, but its **labels, statute citations and year naming are wrong**:
the Income-tax Act, 2025 replaced the 1961 Act on 1 April 2026, and the labour
codes' "50% rule" now inflates the EPF/gratuity base. This needs confirming
against the enacted Finance Act 2026 before relabelling.

## When building an engine from a spec

1. Read the spec's caveats section first — several figures are flagged
   medium/low confidence or "not re-verified this session."
2. Encode the authority's **published** worked examples as harness checks.
   Ignore examples the spec says it *derived* itself — those prove only internal
   consistency, not correctness.
3. Re-verify every figure the spec marks low-confidence against the primary
   source before shipping.
4. Re-run the whole adversarial verification for the jurisdiction once account
   capacity allows — this single-pass research is a starting point, not a
   substitute for it.
