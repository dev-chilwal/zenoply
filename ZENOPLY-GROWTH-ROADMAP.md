# Zenoply — Post-Launch Growth Roadmap

_Goal: grow organic search traffic. Last updated: 13 July 2026 (Phase 1 complete; Phase 2 complete — 59 tools live, 0 stubs remaining; Phase 3 advancing — 40 guides live; full SEO audit run 5 Jul — see below)._

The site is live at zenoply.com on Cloudflare Pages with git auto-deploy (`dev-chilwal/zenoply` → push to `main` rebuilds). The sitemap is verified and read successfully in Google Search Console (under the `zenoply.team@gmail.com` account). The growth model for a utility-tool site is simple: **every live tool and every guide is a separate page that can rank for its own search query.** More quality pages + clean on-page SEO + indexing = more traffic. This roadmap is ordered by impact-per-effort.

---

## Current state (updated 27 Jun 2026)

**58 tools now built and live in code, across 6 categories** (up from 9 at launch, 23 on 10 Jun, 43 on 25 Jun). Each has an h1, meta description, FAQ block (feeds FAQ structured data), and is in the sitemap automatically. **40 guides are also live** under `/guides`. **No `coming soon` stubs remain — the catalog is fully live.**

- **Text (8):** Word Counter, Case Converter, Remove Line Breaks, Remove Duplicate Lines, Find & Replace, Lorem Ipsum Generator, Slug Generator, Text Reverser
- **Dev (8):** JSON Formatter, Base64 Encoder/Decoder, URL Encoder/Decoder, UUID Generator, Hash Generator (MD5/SHA-1/256/512), JWT Decoder, SQL Formatter, HTML Minifier
- **Convert (8):** Hex to RGB, RGB to Hex, Color Converter (HEX/RGB/HSL/CMYK), Unix Timestamp Converter, JSON to CSV, CSV to JSON, YAML to JSON, Number to Words
- **Finance (20):** SIP, EMI, GST, FD, Compound Interest, Mortgage, Percentage, Simple Interest, RD, PPF, NPS, Gratuity, HRA, Income Tax, In-Hand Salary, Lumpsum, SWP, CAGR, ROI, Inflation
- **PDF (10) — category added since launch:** Merge, Split, Compress, PDF to JPG, JPG to PDF, Rotate, Unlock, Watermark, PDF to Word, PDF to Excel
- **Image (4):** Image Resizer, Image Converter (PNG/JPG/WebP), Image Compressor, Passport Photo Maker

**No stubs remain.** The three previously deferred finance tools — Income Tax Calculator, In-Hand Salary Calculator, PPF Calculator — shipped 26 Jun (FY2025-26), alongside a Tier-1/Tier-2 finance expansion (Simple Interest, RD, NPS, Gratuity, HRA, Lumpsum, SWP, CAGR, ROI, Inflation) via PRs #4–#6. Tax-logic tools carry a "last updated / FY" note and need a yearly maintenance pass.

**Guides live (40):** Each is linked to/from its tool (bidirectional internal linking).
- _Text (3):_ Word Count, Character Count and Reading Time Explained · Text Case Formats Explained (UPPERCASE/Title/camel/snake) · What Is Lorem Ipsum? Meaning, History and When to Use It
- _Finance (20):_ How Does SIP Investment Work? · How Is EMI Calculated? · How Is GST Calculated? · Mortgage Principal vs Interest, Explained · How to Calculate Percentage Increase · What Is Compound Interest? · How Is FD Interest Calculated? · How Is PPF Interest Calculated? · plus Old vs New Tax Regime, HRA, In-Hand Salary, Gratuity, NPS, RD, Lumpsum, SWP, CAGR, ROI, Simple Interest, Inflation
- _Dev (6):_ What Is Base64 Encoding? · What's Inside a JWT? · MD5 vs SHA-256: How Hashing Works · What Is JSON? · What Is a UUID? · What Is URL Encoding?
- _Convert (2):_ What Is a Unix Timestamp? · How to Convert JSON to CSV
- _PDF (7):_ How to Merge PDF Files · How to Split a PDF · How to Compress a PDF · How to Convert JPG to PDF · How to Convert PDF to JPG · How to Convert PDF to Word · How to Extract Tables from a PDF to Excel
- _Image (2):_ PNG vs JPG vs WebP · How to Make a Passport Photo at Home

Notable build notes:
- **Image tools** run entirely in-browser via the Canvas API — no uploads, no new npm dependencies, so the original 99 PageSpeed score is preserved. Passport Photo Maker has 36 country presets (grouped dropdown) at 300 DPI and **drag-to-position** (mouse + touch) plus zoom.
- **PDF tools** also run client-side (no uploads) but introduced the first heavy dependencies: `pdf-lib` (^1.17.1) and `pdfjs-dist` (^4.4.168). **Action: re-run a PageSpeed audit** to confirm these didn't dent the 99 score — they're lazy-loaded per-tool, but worth verifying since they're the first non-trivial bundles.
- **PDF to Word / PDF to Excel** (added 5 Jul) reuse `pdfjs-dist` for text extraction and add **zero new npm dependencies**: real `.docx`/`.xlsx` files are written by a tiny hand-rolled ZIP+OOXML builder (`components/tools/officeExport.js`, ~250 lines) instead of a heavy library like `docx` or SheetJS. Table detection (`components/tools/pdfTable.js`) reconstructs rows/columns from text coordinates via whitespace-band analysis. Both keep the light-bundle story intact.
- All formulas/crop math verified numerically; all components parse clean.

> **Deployment note:** changes are committed via `git push` to `dev-chilwal/zenoply`; Cloudflare auto-rebuilds. The production build can't run in the sandbox (the local dev server locks `.next`/`out`, and the file mount serves stale copies of recently-edited files) — verify via the Read tool + `npm run dev` locally, then push and let Cloudflare build. Confirm the live tool count after each push.

---

## SEO audit (5 Jul 2026) — verdict: technical SEO is done; the levers left are content, backlinks and time

A full codebase audit found **no critical technical SEO gaps**: all ~94 pages have unique titles/descriptions/canonicals, JSON-LD (SoftwareApplication, Article, BreadcrumbList, FAQPage) everywhere, verified sitemap, clean internal linking, 99 PageSpeed. Stop optimizing the tech. What actually moves rankings from here:

1. **Ride out the new-domain cold-start.** ~1 month into Google's evaluation period; expect 3–6+ months before meaningful rankings regardless of quality. The best signal during this window is a **steady publishing cadence** — don't pause the guide-per-day rhythm.
2. **Close the guide gap, GSC-ordered** (Phase 3). 27 tools still lack guides; write them in the order GSC impressions suggest, not alphabetically.
3. **Target long-tail question queries, not head terms** (Phase 3). "SIP calculator" is owned by Groww/ClearTax/ET Money — a new domain won't crack it soon. Question-shaped queries ("is gratuity taxable after 5 years", "PPF vs FD which is better", "how much SIP for 1 crore in 15 years") are winnable now and funnel to the calculators. Add comparison/scenario guides, not just formula explainers.
4. **Backlinks — the completely untouched lever** (Phase 5). A technically perfect site with zero referring domains stays in the sandbox longer. This is now the biggest gap.
5. **Weekly GSC feedback loop** (rhythm table). Impressions-without-guides → next guide; guides ranking positions 8–20 → expand/refresh (small gains there move to page 1). Bump the guide's `updated` date on real revisions — the sitemap reports true lastmod, so Google recrawls.
6. **Housekeeping:** GSC last showed 48 discovered pages; the site has ~94 now — re-check/resubmit the sitemap count.

Minor/optional from the audit: per-page OG images (social nicety, not a ranking factor); a table of contents on long guides (H2 ids already exist); Organization schema at the site root.

---

## Phase 1 — Confirm the foundation ✅ COMPLETE (9 Jun 2026)

All foundation checks passed. Results:

1. **Analytics — DONE.** Cloudflare Web Analytics enabled (zero-code, since the site is proxied through Cloudflare). Privacy-friendly, no cookie banner. Already showing first hits (mostly bots/crawlers at this stage — real users follow indexing; watch top pages + referrers, not raw country counts).
2. **Google Search Console — VERIFIED.** Property verified as a Domain property under `zenoply.team@gmail.com`. Sitemap (`https://www.zenoply.com/sitemap.xml`) status **Success**, **48 pages discovered** (the sitemap now covers more — re-check the discovered count). Page Indexing and Performance reports were still "processing data" on 9 Jun (normal for a property crawled the day before) with **no errors**.
   - **Multi-account gotcha:** Dev has several Google accounts signed in; zenoply.team is NOT the default. Use `/u/1/` style GSC URLs (e.g. `https://search.google.com/u/1/search-console/index?resource_id=sc-domain:zenoply.com`); plain URLs bounce to the wrong account.
3. **Bing Webmaster Tools — handoff.** Import from GSC at bing.com/webmasters (carries over verification + sitemap automatically). ~2 min, self-serve. (Bing's site is blocked from the browser automation tool, so Dev does this one manually.)
4. **Core Web Vitals — EXCELLENT.** PageSpeed mobile: **Performance 99, Accessibility 98, Best Practices 100, SEO 100.** FCP 1.5s, LCP 1.8s, CLS **0**, TBT **0ms**, Speed Index 2.5s. Brotli compression confirmed active (`content-encoding: br`). The "document request latency" insight was an unscored lab artifact — safe to ignore. _(Re-audit after the PDF deps — see build notes above.)_

**robots.txt & sitemap** also validated: both live and valid; sitemap referenced in robots.txt. Note: AI-training crawlers (GPTBot, ClaudeBot, Google-Extended, etc.) are blocked via Cloudflare's managed rules — this is fine and does NOT affect search indexing (`search=yes`).

### Performance backlog (de-prioritized — all optional, ~16 KiB total savings)
PageSpeed flagged these minor "insights" at score 99; none worth acting on now, recorded for completeness:
- Efficient cache lifetimes (~5 KiB) — static assets already immutably cached.
- Render-blocking CSS — single stylesheet; FCP already 1.5s.
- Legacy JavaScript (~11 KiB) — framework-controlled transpilation; trivial.

## Phase 2 — Ship tools on a steady cadence ✅ EASY/MID BATCH COMPLETE (ongoing for the long tail)

The launch catalog stubbed ~35 tools as `coming soon`. **All of them are now live** — the easy text/dev/convert wins, the full Image category, the whole PDF suite, and the complete finance calculator set including the three previously deferred tax tools. Catalog grew 9 → 23 → 43 → **56**, with 0 stubs remaining.

**✅ Shipped:** all of the text/dev/convert "next batch" (Find & Replace, Slug Generator, Text Reverser, RGB to Hex, Color Converter, JSON↔CSV, YAML to JSON, Number to Words, JWT Decoder, SQL Formatter, HTML Minifier), the **Image Tools** category (Resizer, Converter, Compressor, Passport Photo Maker), and the **PDF Tools** category (Merge, Split, Compress, PDF↔JPG, Rotate, Unlock, Watermark).

**✅ Stubs cleared (26 Jun):** Income Tax Calculator, In-Hand Salary Calculator and PPF Calculator shipped for FY2025-26, plus a Tier-1/Tier-2 finance expansion (Simple Interest, RD, NPS, Gratuity, HRA, Lumpsum, SWP, CAGR, ROI, Inflation). **Maintenance note:** the tax/salary tools need a yearly review when slabs change — add to the quarterly cadence below.

**Future tool ideas (net-new, beyond the original stub list):**
- Image: background remover (the old `E:\utilio` app used `@imgly/background-removal` + onnxruntime — heavy; only add if worth the bundle cost) and image cropper.
- More converters/dev tools by GSC demand — let Search Console queries pick the next batch rather than guessing.

> With the easy backlog cleared, the growth engine shifts from "ship any tool" to **"ship what data says people search for"** (Phase 3 guides + GSC-driven picks).

## Phase 3 — Content / guides for long-tail and authority 🔄 UNDERWAY

Tools win the "[thing] calculator" query; **guides win the "how/what/why" queries** and build topical authority that lifts the whole domain. The `/guides` section is live and pairs each guide with its tool (internal linking both ways — the cheap SEO multiplier most sites skip). Each guide is 850–1,200 words with a worked example where relevant, 3 FAQs (FAQPage JSON-LD), Article schema, and ≥2 links to its tool. Every guide is paired with a `guide:` backlink on the tool entry in `lib/site.js`, so the link is bidirectional.

**✅ Live (25):**
- _Finance:_ SIP → SIP Calculator · EMI → EMI Calculator · GST → GST Calculator · Mortgage Principal vs Interest → Mortgage Calculator · Percentage Increase → Percentage Calculator · What Is Compound Interest? → Compound Interest Calculator · How Is FD Interest Calculated? → FD Calculator · How Is PPF Interest Calculated? → PPF Calculator · Old vs New Tax Regime → Income Tax Calculator · How Is HRA Exemption Calculated? → HRA Calculator · How Is In-Hand Salary Calculated From CTC? → In-Hand Salary Calculator
- _Dev:_ What Is Base64 Encoding? → Base64 Encoder · What's Inside a JWT? → JWT Decoder · MD5 vs SHA-256 → Hash Generator · What Is JSON? → JSON Formatter · What Is a UUID? → UUID Generator · What Is URL Encoding? → URL Encoder
- _Convert:_ What Is a Unix Timestamp? → Unix Timestamp Converter
- _PDF:_ How to Merge PDF Files → Merge PDF · How to Split a PDF → Split PDF · How to Compress a PDF → Compress PDF · How to Convert JPG to PDF → JPG to PDF · How to Convert PDF to JPG → PDF to JPG
- _Image:_ PNG vs JPG vs WebP → Image Converter · How to Make a Passport Photo at Home → Passport Photo Maker

> All 20 guides were drafted and fact-checked via a multi-agent workflow (draft → accuracy + SEO/style verification → revise), then integrated deterministically into `lib/guides.js` + `lib/site.js`. Formulas and worked examples (compound interest 2,15,892; FD 1,41,478) were recomputed and tool UX was checked against the actual components (e.g. JPG-to-PDF reorders via Up/Down buttons, not drag). `npm run build` generated all 20 guide pages cleanly (76 static pages total). Batch 1 (10 guides) and batch 2 (5 guides) shipped 25 Jun.

**Next guides to write (remaining live tools that lack a guide — note each tool can show only one `guide:` backlink, so prioritise tools with none):**
- "RGB, HEX and HSL color codes explained" → Color Converter
- "What Is a Slug (and how to make a URL slug)" → Slug Generator
- "SQL formatting and why it matters" → SQL Formatter
- "How to rotate / unlock / watermark a PDF" → the remaining PDF tools
- Converters (category under-served — 7 tools still lack a guide): ✅ JSON to CSV guide — "How to Convert JSON to CSV (Commas, Nesting and Delimiters Explained)" (which JSON shapes convert: array-of-objects/array-of-arrays + union-of-keys headers + RFC 4180 comma/quote/line-break escaping + nested objects → JSON-in-a-cell + comma/semicolon/tab/pipe delimiters + European decimal-comma note + worked example on Ada/Grace/Alan producing quoted "New York, NY" and an empty missing-field cell) shipped 12 Jul. Remaining: CSV to JSON, YAML to JSON, Hex↔RGB, Color Converter, Number to Words.
- Text & writing (new guide category): ✅ Word Counter guide — "Word Count, Character Count and Reading Time Explained" (whitespace word rule + chars with/without spaces + reading-time estimate at 200–250 wpm + platform limits: X 280 / SMS 160 / meta 150–160 / Instagram 2,200 + words-per-page 500 single / 250 double) shipped 10 Jul. First guide under the new **Text & writing** hub category. ✅ Case Converter guide — "Text Case Formats Explained: UPPERCASE, Title Case, camelCase and snake_case" (exact behaviour of all six formats + title-case rules AP/Chicago don't match + why chaining conversions loses the original + camelCase vs snake_case for code + worked example on "User First Name" + which case to use where) shipped 11 Jul. ✅ Lorem Ipsum guide — "What Is Lorem Ipsum? Meaning, History and When to Use It" (what greeking is + Cicero de Finibus 45 BC origin + 'lorem' = truncated 'dolorem' + Letraset/PageMaker revival + McClintock tracing 'consectetur' + why designers use neutral filler + paragraphs/sentences/words + themed-ipsum caveat + never ship it: SEO/screen-reader/content-first) shipped 13 Jul. Remaining text tools without a guide: Remove Line Breaks, Remove Duplicate Lines, Find & Replace, Slug Generator, Text Reverser.
- High-search-volume finance calculators still lacking a guide: **all finance calculators now have guides.** ✅ Inflation guide (future-cost + purchasing-power formulas + real-return vs headline-return + Rule of 70 halving) shipped 9 Jul. ✅ Simple Interest guide (SI = P × R × T / 100 term-by-term + worked example + rearrangements + simple vs compound) shipped 8 Jul. ✅ PPF guide shipped 27 Jun. ✅ Income Tax guide (old vs new regime) shipped 28 Jun. ✅ HRA exemption guide shipped 29 Jun. ✅ In-Hand Salary guide (CTC → take-home) shipped 30 Jun. ✅ Gratuity guide (15/26 formula) shipped 1 Jul. ✅ NPS guide (corpus + 40% annuity + pension) shipped 2 Jul. ✅ RD guide (quarterly-compounding maturity formula) shipped 3 Jul. ✅ Lumpsum guide (compound-growth formula + Rule of 72 + lumpsum vs SIP) shipped 4 Jul. ✅ SWP guide (month-by-month withdrawal loop + closed-form check + depletion + safe-withdrawal rule) shipped 5 Jul. ✅ CAGR guide (geometric-root formula + why it beats a simple average + CAGR vs total return + Rule of 72) shipped 6 Jul. ✅ ROI guide (net-gain formula + total vs annualized ROI + negative ROI + what ROI leaves out) shipped 7 Jul.

Let GSC Performance data pick the order — write guides for whichever live tools are already drawing impressions.

**Long-tail strategy (from 5 Jul audit):** for finance, don't chase head terms ("SIP calculator") that Groww/ClearTax/ET Money own — write for question-shaped queries a new domain can win now ("is gratuity taxable after 5 years", "PPF vs FD which is better", "how much SIP for 1 crore in 15 years"). Once every tool has its explainer guide, the next content layer is **comparison/scenario guides** (PPF vs FD, lumpsum vs SIP, old vs new regime already exists) that can link to multiple calculators.

## Phase 4 — On-page SEO polish (one focused pass) ⏳ NOT STARTED

The architecture already does most of this well (per-tool titles, canonical URLs, OpenGraph, SoftwareApplication + BreadcrumbList + FAQPage JSON-LD). Tighten:
- **Unique, keyword-led meta descriptions** per tool (a few currently read generically — make each one match how people actually search). Worth a dedicated pass now that there are 56 of them.
- ~~**OG image.**~~ ✅ DONE (9 Jun 2026). Branded 1200×630 `public/og.png` wired into root layout + `lib/seo.js`; `twitter:card` upgraded to `summary_large_image`. Verified live via opengraph.xyz. Source: `public/og.svg` (edit + re-render with sharp/ImageMagick if text changes). Future option: per-page dynamic OG images (Next `ImageResponse`) — nice-to-have, not needed.
- **Homepage copy.** Make the H1 and intro target "free online tools" + the categories, so the homepage itself ranks.
- **Related-tools internal linking** is already present (good) — keep giving every new tool 2+ FAQs. **Expectation check (5 Jul audit):** Google stopped showing FAQ rich results for most non-government/health sites in 2023, so the FAQPage schema won't produce visible SERP snippets — keep it (harmless, and the FAQ *content* still ranks for question queries), but don't invest more expecting rich results.

## Phase 5 — Off-site / distribution (now unblocked — 20+ tools live) ⏳ NOT STARTED — **now the biggest gap (5 Jul audit)**

The "do after 20+ tools live" gate is cleared (56 live). With technical SEO done and content compounding, **zero referring domains is what's left holding the site in the cold-start sandbox.** Concrete channels, cheapest first:
- **Tool directories & aggregators:** AlternativeTo, ToolFinder-style lists, free-tool roundups. Low effort, legitimate links.
- **Product Hunt / Hacker News "Show HN"** for the suite — the PDF suite (client-side, no uploads) and Passport Photo Maker are the strongest angles; even modest traction earns real links.
- **Helpful forum answers:** r/IndiaInvestments, r/personalfinanceindia and similar — link a calculator only where it genuinely answers the question, sparingly and honestly.
- **Dev-facing content:** write dev.to/Hashnode posts about the underlying concepts (JWT internals, Base64, hashing) that naturally reference the tools.
- A few quality backlinks from dev/finance communities move the needle more than volume.

---

## Suggested rhythm

| Cadence | Action |
|---|---|
| Each session | Write 1–2 guides (Phase 3) or polish meta descriptions (Phase 4); easy-tool backlog is now cleared |
| Weekly | 10-min GSC ritual: sort queries by impressions → (a) tools drawing impressions with no guide = next guide to write; (b) guides ranking positions 8–20 = expand/refresh them (small gains there reach page 1); bump `updated` on real revisions |
| Monthly | Write 2–3 guides for top-trafficked tools; refresh any stale meta descriptions; one Phase 5 distribution action (directory submission, forum answer, or a Show HN when ready) |
| Quarterly | PageSpeed audit (next one should confirm the PDF deps are clean); review tool meta descriptions by GSC data |
| Yearly | Refresh the tax/salary calculators (Income Tax, In-Hand Salary) when FY slabs change; update the "last updated" notes |

**The one habit that matters most:** ship pages consistently and watch Search Console. Traffic on a tools site compounds — 59 tools + 39 guides today, each one earning its own trickle of search traffic that adds up. The next lever is **content (guides) and SEO polish**, not more easy tools.
