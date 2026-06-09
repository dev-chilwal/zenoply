# Zenoply — Post-Launch Growth Roadmap

_Goal: grow organic search traffic. Last updated: 9 June 2026 (Phase 1 complete)._

The site is live at zenoply.com on Cloudflare Pages with git auto-deploy (`dev-chilwal/zenoply` → push to `main` rebuilds). The sitemap is verified and read successfully in Google Search Console (under the `zenoply.team@gmail.com` account). The growth model for a utility-tool site is simple: **every live tool and every guide is a separate page that can rank for its own search query.** More quality pages + clean on-page SEO + indexing = more traffic. This roadmap is ordered by impact-per-effort.

---

## Done in this session

Four new tools were built, wired in, and verified (formulas checked numerically; code parses clean):

- **Percentage Calculator** (`/finance/percentage-calculator`) — three modes: X% of Y, X is what % of Y, % increase/decrease. Very high global search volume.
- **Mortgage Calculator** (`/finance/mortgage-calculator`) — monthly payment, total interest, total paid. Verified at $1,896.20/mo for the standard $300k / 6.5% / 30yr case.
- **Base64 Encoder / Decoder** (`/dev/base64-encoder`) — UTF-8 safe, evergreen developer query.
- **Remove Line Breaks** (`/text/remove-line-breaks`) — evergreen text utility.

Each has an h1, meta description, FAQ block (which feeds FAQ structured data), and is in the sitemap automatically. **Live tool count: 9 → 13.**

> Note: the production build couldn't be run in the sandbox because the local dev server locks `.next`/`out`. Run `npm run build` locally (or just let the Cloudflare push build it) to confirm, then commit and push.

---

## Phase 1 — Confirm the foundation ✅ COMPLETE (9 Jun 2026)

All foundation checks passed. Results:

1. **Analytics — DONE.** Cloudflare Web Analytics enabled (zero-code, since the site is proxied through Cloudflare). Privacy-friendly, no cookie banner. Already showing first hits (mostly bots/crawlers at this stage — real users follow indexing; watch top pages + referrers, not raw country counts).
2. **Google Search Console — VERIFIED.** Property verified as a Domain property under `zenoply.team@gmail.com`. Sitemap (`https://www.zenoply.com/sitemap.xml`) status **Success**, **48 pages discovered**. Page Indexing and Performance reports were still "processing data" on 9 Jun (normal for a property crawled the day before) with **no errors**. A scheduled check-in runs Fri 12 Jun to report first indexed counts + impressions.
   - **Multi-account gotcha:** Dev has several Google accounts signed in; zenoply.team is NOT the default. Use `/u/1/` style GSC URLs (e.g. `https://search.google.com/u/1/search-console/index?resource_id=sc-domain:zenoply.com`); plain URLs bounce to the wrong account.
3. **Bing Webmaster Tools — handoff.** Import from GSC at bing.com/webmasters (carries over verification + sitemap automatically). ~2 min, self-serve. (Bing's site is blocked from the browser automation tool, so Dev does this one manually.)
4. **Core Web Vitals — EXCELLENT.** PageSpeed mobile: **Performance 99, Accessibility 98, Best Practices 100, SEO 100.** FCP 1.5s, LCP 1.8s, CLS **0**, TBT **0ms**, Speed Index 2.5s. Brotli compression confirmed active (`content-encoding: br`). The "document request latency" insight was an unscored lab artifact — safe to ignore.

**robots.txt & sitemap** also validated: both live and valid; sitemap referenced in robots.txt. Note: AI-training crawlers (GPTBot, ClaudeBot, Google-Extended, etc.) are blocked via Cloudflare's managed rules — this is fine and does NOT affect search indexing (`search=yes`).

### Performance backlog (de-prioritized — all optional, ~16 KiB total savings)
PageSpeed flagged these minor "insights" at score 99; none worth acting on now, recorded for completeness:
- Efficient cache lifetimes (~5 KiB) — static assets already immutably cached.
- Render-blocking CSS — single stylesheet; FCP already 1.5s.
- Legacy JavaScript (~11 KiB) — framework-controlled transpilation; trivial.

## Phase 2 — Ship tools on a steady cadence (ongoing — the main growth engine)

The catalog already has ~35 stubbed tools marked `coming soon`. Each one you make live is a new indexable page. **Target: 2–4 new tools per week.** Prioritize by search volume and ease (most are pure client-side JS, fast to build):

**Highest-value next batch (broad, non-region-specific — widest reach):**
- Percentage of total / fraction-to-percent variations
- URL Encoder / Decoder (`/dev/url-encoder`)
- UUID Generator (`/dev/uuid-generator`)
- Hash Generator — MD5/SHA (`/dev/hash-generator`)
- Unix Timestamp Converter (`/convert/epoch-converter`)
- Lorem Ipsum Generator (`/text/lorem-ipsum-generator`)
- Remove Duplicate Lines, Find & Replace, Slug Generator (text — trivial to build)
- RGB to Hex, Color Converter (`/convert`)

**High-value India batch (your finance suite is already strong here):**
- Income Tax Calculator, In-Hand Salary Calculator, PPF Calculator — high volume, but tax logic changes yearly so they need maintenance.

**Higher-effort, higher-payoff later:**
- PDF tools (merge/split/compress) — these have huge search volume but need a client-side PDF library (pdf-lib). Worth a dedicated push once the easy wins are done.

## Phase 3 — Content / guides for long-tail and authority (ongoing)

Tools win the "[thing] calculator" query; **guides win the "how/what/why" queries** and build topical authority that lifts the whole domain. A `/guides` section pairs naturally with the calculators (the old app even had guides like "what is GST", "SIP vs lumpsum" — that pattern works).

For each major calculator, write one 800–1,200 word guide and link it to/from the tool:
- "How is EMI calculated?" → links to EMI Calculator
- "How to calculate percentage increase" → Percentage Calculator
- "Mortgage: principal vs interest explained" → Mortgage Calculator
- "What is Base64 and when to use it" → Base64 tool

Internal linking between guides ↔ tools is the cheap SEO multiplier most sites skip.

## Phase 4 — On-page SEO polish (one focused pass)

The architecture already does most of this well (per-tool titles, canonical URLs, OpenGraph, SoftwareApplication + BreadcrumbList + FAQPage JSON-LD). Tighten:
- **Unique, keyword-led meta descriptions** per tool (a few currently read generically — make each one match how people actually search).
- **OG image.** Add a default share image so links to zenoply.com look good when shared (currently `twitter: summary` with no image).
- **Homepage copy.** Make the H1 and intro target "free online tools" + the categories, so the homepage itself ranks.
- **Related-tools internal linking** is already present (good) — make sure every new tool has 2+ FAQs so it qualifies for FAQ rich results.

## Phase 5 — Off-site / distribution (lower priority, do after 20+ tools live)

- Submit standout tools to directories (AlternativeTo, ToolFinder, relevant subreddits, Hacker News "Show HN" if there's a unique angle).
- A few quality backlinks from dev/finance communities move the needle more than volume.

---

## Suggested rhythm

| Cadence | Action |
|---|---|
| Each session | Build 2–4 tools, push, confirm they index in GSC |
| Weekly | Check GSC Performance — which queries are appearing? Build more in winning categories |
| Monthly | Write 2–3 guides for the top-trafficked tools; refresh any stale meta descriptions |
| Quarterly | PageSpeed audit; review which `coming soon` stubs to promote based on data |

**The one habit that matters most:** ship pages consistently and watch Search Console. Traffic on a tools site compounds — 13 pages today, 50 in two months, each one earning its own trickle of search traffic that adds up.
