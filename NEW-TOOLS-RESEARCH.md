# New Tools Research — candidate backlog

Research run 2026-08-03, four parallel angles: competitor catalog sweep (13 sites
fetched), client-side library feasibility (npm registry + bundlephobia, verified
same day), search-demand analysis (Google Autocomplete API queried live + SERP
proxies — **no fabricated volumes**; autocomplete presence is a floor, not a
magnitude), and dev/text/convert gap analysis (incl. it-tools' 80-tool registry).

Constraint unchanged: static export, everything client-side, no uploads, no paid
APIs, permissive licenses, heavy assets lazy-loaded + self-hosted.

## Headline findings

1. **FreeFormatter.com is shutting down** (farewell notice live as of Aug 2026).
   Its staples — XML formatter, string escapers (JSON/Java/XML/CSV), cron tools,
   HMAC, regex tester — are high-intent keywords about to lose their dominant
   result. Cheapest keyword-inheritance opportunity found.
2. **The "constraint-modifier long-tail" is the structural win.** Autocomplete
   shows 10+ size-target variants per seed ("compress pdf to 100kb/200kb/500kb",
   "image compress to 50kb", "resize image to 20kb"); the SERPs are tiny sites
   (pi7.org, 11zon.com, EMDs). Maps 1:1 onto tools Zenoply already has —
   programmatic pages over one template. Largely India-driven (form upload caps).
3. **India exam photo/signature resizer — verdict upgraded.** PDF-IMAGE-ROADMAP
   called this "feasible, unproven demand, incumbent entrenched" (ExamMint).
   New evidence: deep autocomplete ladders ("signature resize for ssc cgl",
   "signature resize 300x80 online", "photo resize for indian passport free")
   and a SERP of exclusively tiny Indian sites. Highest winnability of any
   candidate in the study. Demand signal is autocomplete+SERP proxy, still not
   absolute volume.
4. **LLM token counter is the newest open dev niche** — model-specific
   autocomplete ladder (claude/openai/gemini/deepseek), current rankers are
   GitHub Pages micro-sites. Rising 2025–26; absolute volume unknown.
5. **Head terms stay unwinnable** — password generator (password-manager brands),
   diff checker (diffchecker.com), regex tester (regex101), age calculator
   (calculator.net), typing/speed test, invoice generator head. Only niche
   variants are worth building; don't chase these as primary bets.

## Tier A — build next (high demand × small effort × clean licenses)

| Tool | Demand evidence | Implementation | Effort |
|---|---|---|---|
| ~~Exam photo + signature resizer (India)~~ **SHIPPED 14 Aug 2026** (`/image/exam-photo-resizer`) | Autocomplete ladders, tiny-site SERP — highest winnability found | Zero new deps — existing Canvas stack. The distinguishing requirement is the one every compressor ignores: exam forms set a **minimum** file size as well as a maximum, so the search targets a *band*. It probes full quality first (the opposite of `CompressImageToSize`, which probes the floor) because exam dimensions are small, making a full-quality encode cheap and usually already under the ceiling — and the largest fitting encode is also the one most likely to clear the floor; the same log-space interpolation then refines under the ceiling. Which end binds flips with pixel count, and that drove the design: at IBPS's 200×230 (46,000 px) a 20–50 KB band is only a 2.7:1–6.7:1 ask, so files land *under* the floor (measured 14,055 B at q=1.0 on a soft source), whereas SSC's 413×531 at the same band buys 1.87 bits/px and binds on the ceiling (49,579 B, 96.8% of budget, 7 passes). Under-floor is fixed by **enlarging the pixel dimensions** — legitimate because portals word dimensions as "preferred" while enforcing the KB range (IBPS says exactly that) — verified taking a soft 200×230 to 241×278 / 23,565 B in band. **Byte-padding deliberately not implemented**: it is what the incumbent Indian resizer sites do, and it produces a file claiming to hold information it does not; the shortfall is reported instead. Signature presets switch to contain-fit with white padding plus an optional luma-threshold background clean (which shrinks the file, so it needs the enlarge path more often). Presets only where published specs agree — bank figures verified against IBPS's official scanning/uploading PDF (photo 200×230 20–50 KB, signature 140×60 10–20 KB, LTI 140×60 20–50 KB); SSC, NTA and UPSC included with their sources named; handwritten-declaration omitted because the official doc's single dimension bullet covers three documents and is ambiguous. Every field is user-overridable and the UI says to confirm against the current notification | M |
| ~~EXIF viewer + remover~~ **SHIPPED 4 Aug 2026** (`/image/exif-viewer`) | Both in top-10 autocomplete; small-site SERP; perfect privacy-positioning fit | Built with `exifr` (MIT) for parsing, lazily imported. `piexifjs` proved unnecessary — the strip is a zero-dep container walk in `components/tools/stripMeta.js` covering JPEG segments, PNG chunks and WebP RIFF chunks, lossless for all three. WebP needs a shim: exifr does not speak RIFF, so the EXIF chunk's raw TIFF payload is passed to it directly | S |
| ~~QR code generator~~ **SHIPPED 5 Aug 2026** (`/dev/qr-code-generator`) | UPI QR base 670M→780M YoY; winnable angle: "qr code generator free no expiration" (×2 in autocomplete) — client-side static QRs literally never expire | Built on `uqr` (MIT, zero-dep, lazy-imported). Six payload types incl. Wi-Fi (with `;,:\"` escaping) and UPI. One run-length SVG path shared by the preview, the SVG download and the canvas PNG, so all three are the same geometry; PNG scale snaps to whole pixels per module. Warns on inverted colours, sub-3:1 contrast and a quiet zone under 4 modules. Verified by re-decoding every payload type × all four ECC levels with jsQR | S |
| ~~HEIC to JPG/PNG~~ **SHIPPED 15 Aug 2026** (`/image/heic-to-jpg`) | Top suggestion for bare "heic"; 4 competitors carry it; no giant owns the free-converter tail | Built on `heic-to` 1.5.2 (LGPL-3.0), **not bundled**: `scripts/copy-heic-assets.mjs` copies it to `public/heic/` next to its licence text and `components/tools/heic.js` loads it with a `webpackIgnore`d dynamic import. That is the licence requirement (a separate, replaceable shared library) and it also keeps 3 MB of base64-inlined wasm out of the webpack graph — upstream inlines the wasm, so there is **no separate .wasm to copy**, contrary to the plan above. The **CSP build** is the one shipped: its libheif is compiled with `DYNAMIC_EXECUTION=0`, so no eval in the decode path, same API and 1 KB smaller. Nothing is fetched until a file is actually converted. Verified in a real browser against the exact shipped bytes (sha256 match): a 64x48 HEIC decodes to PNG within **0.02/255** mean RGB of macOS's own decode of the same file and to JPG within 1.1/255 — the residual is JPEG quantisation, the decode is right. libheif **applies the `irot` flag**, confirmed by patching a fixture to `irot=1` and getting 48x64 back from a 64x48 file, so portrait iPhone photos land upright with no extra work; that is the bug that gives free HEIC converters their sideways-photo reputation. WebP output and the garbage-input path checked too. Batch conversion is **sequential** — a decoded 12 MP photo is ~50 MB of raw pixels — and the decoder loads before the loop so a network failure is not misreported as a bad photo. Canvas output carries no EXIF, which is a privacy win worth stating and is cross-linked to the EXIF tool | M |
| ~~Compress-to-size variants~~ **BOTH SHIPPED** — image 10 Aug 2026 (`/image/compress-image-to-size`), PDF 11 Aug 2026 (`/pdf/compress-pdf-to-size`) | 10+ autocomplete variants each for PDF and image | Zero new deps — `browser-image-compression` proved unnecessary, canvas `toBlob` does the whole job. Shipped **one page with a target input plus presets** (20/50/100/200/500 KB, 1 MB) rather than programmatic per-KB pages: same keyword coverage from the guide, no thin-content risk. The search is the interesting part — encoding costs the same at every quality and scales with pixel count, so it spends as few encodes as possible: two probes to bracket the answer, then guesses interpolated in **log-size space** (file size grows roughly geometrically with quality) rather than blind bisection, stopping once a result lands within 5% under budget. When even quality 0.05 is too big it shrinks the canvas by `sqrt(budget/floor)` clamped to 0.5–0.9 per round and searches again, up to 8 rounds. Files already under target are returned untouched — re-encoding an already-small JPG only loses detail and at a generous target can come out *larger*. Verified on the production build against a 2.42 MB 2400x1800 source: 50 KB → 51,065 B (99.7% of budget, no resize), 20 KB → 19,304 B with auto-resize to 1604x1203, WebP 50 KB → 51,082 B, and an unreachable 2 KB target with resizing off reports the shortfall and still offers the smallest result. **PDF variant (11 Aug)** reuses the same log-space search but over a whole document at one shared quality. Pages are rasterised once through the shared pdf.js loader and cached so the search never re-renders; the render scale adapts to page count to hold the cache inside a pixel budget (REF_MAX 1.6 = 115 DPI — rendering higher only makes probes costlier, since a document that could pay for more pixels is already under its limit and never rasterised), with a hard ceiling that names a too-long document instead of failing. Two PDF-specific wins: rounds that already dropped resolution bracket against q=0.6 instead of the ceiling, because a round that shrank until the *lowest* quality fits proves the highest cannot — that alone took a 100 KB run from 62 to 22 encode passes; and the container's structural overhead is measured from a real build rather than trusted from an estimate, so the file genuinely fits. Page boxes are written from the document's own point sizes, not the raster dimensions, so a page stays A4 at any DPI (verified: MediaBox `0 0 595 842` preserved — note `CompressPdf` gets this wrong and emits pages scaled by its render factor). Verified on the production build against synthetic 3-page/2.78 MB and 10-page/9.25 MB scans: every reachable target landed 97.8–99.3% of budget and never over (100 KB → 101,375 B in 7 passes, 200 KB → 203,459 B in 5, 500 KB/10pp → 501,513 B in 3, 30 KB → 30,030 B in 9). Structural overhead measured at ~329 bytes/page (3pp 1,606 B, 10pp 3,911 B) | S–M |
| ~~CGPA ↔ percentage calculator~~ **SHIPPED 6 Aug 2026** (`/convert/cgpa-to-percentage`) | Rich ladder incl. per-university formulas (VTU, GTU, SPPU, Mumbai) + "cgpa to gpa 4.0" | Pure math, zero new deps. Three modes: CGPA→%, %→CGPA, and grades→CGPA (credit-weighted, so the same engine serves SGPA and semester-weighted CGPA). Shipped only the three conversion rules that are actually documented — CBSE/CISCE ×9.5, standard 10-point ×10, VTU (CGPA−0.75)×10 — with a **custom multiplier** for everything else rather than hard-coding GTU/SPPU/Mumbai formulas that could not be verified; each preset names its formula in the dropdown label so the user can check it against their marksheet. All three round-trip exactly. 4.0-scale readout suppressed unless the CGPA is on a 10-point scale, since a custom multiplier may describe a 4-point one | S |
| ~~Number to Words — Indian rupees / cheque variant~~ **SHIPPED 7 Aug 2026** (`/convert/rupees-in-words`) | "number to words indian rupees / hindi / indian format" ladder | Zero new deps. Indian lakh/crore grouping done by recursing on the crore count, which is what makes 10^9 read "one hundred crore" and 10^12 "one lakh crore" instead of inventing scale words; international short scale behind a toggle. Three wordings per amount (cheque line / lower-case invoice line / bare number). Paise rounded on the digit string, not via floats, so 99.999 carries to One Hundred exactly. Conversion sits in a plain `rupeesWords.js` module so it is testable in node — verified against a table of known cases. **Hindi/Devanagari output deliberately not shipped**: 1–99 are all irregular words, and a hand-built table risks being confidently wrong — revisit only with a verifiable source | S |
| ~~LLM token counter~~ **SHIPPED 9 Aug 2026** (`/dev/token-counter`) | Model-specific ladder, micro-site SERP, rising | Built on `gpt-tokenizer` (MIT), **pinned to 3.4.0** because the per-token view uses `bytePairEncodingCoreProcessor.tryDecodeToken` — an internal — with a documented fallback. One encoding imported at a time so the 0.5–2.2 MB BPE tables each land in their own lazy chunk (o200k 2.1 MB, cl100k 960 KB, p50k/r50k 512 KB) and never touch the shared bundle. Shipped one page with an encoding selector rather than per-model pages: the encoding is the durable fact, model names churn. The chip view is 1:1 with the ids via one `TextDecoder` fed token by token — `decodeGenerator` merges tokens (24 in, 21 out on a ZWJ emoji) and `decode()` carries streaming state between calls, so neither is safe to count. Claude/Gemini/Llama/Mistral/DeepSeek are labelled "estimate only" with the characters÷4 basis named, the o200k count shown as a reference, and a pointer to each vendor's counting endpoint. Context window and price-per-1M are inputs, not baked-in tables, so neither goes stale. `<\|endoftext\|>` counts as the literal tokens it spells (`encode()` throws on it by default). Verified against node and against tiktoken's documented `[83, 1609, 5963, 374, 2294, 0]` | S–M |

## Tier B — market-standard PDF gaps (4+ competitors carry them; reuse existing stack)

| Tool | Competitors | Implementation | Effort |
|---|---|---|---|
| ~~Protect PDF (add password)~~ **SHIPPED 16 Aug 2026** (`/pdf/protect-pdf`) | 7 — glaring gap: we have Unlock but not Lock | Zero new deps — reuses the `@neslinesli93/qpdf-wasm` asset the password gate already self-hosts. Uses the **modern flag form** `--encrypt --user-password=X --owner-password=Y --bits=256 --`, not the positional `--encrypt user owner 256 --` above, so a password starting with `-` cannot be parsed as an option (verified: `--bits=40` as the literal password still yields AESv3). The same password is set as **both** user and owner, deliberately: PDF's owner password only gates permission flags, which are advisory bits any reader may ignore and any tool can strip — including our own Unlock PDF — and qpdf **hard-refuses** the empty-owner alternative at 256-bit ("insecure as it can be opened without a password") unless `--allow-insecure` is passed. So permission checkboxes were **not shipped** rather than shipped as decoration; the tool copy and guide both say why. UI is dropzone + password + confirm + reveal toggle + length-weighted strength hint + an unrecoverable-password warning; `autoComplete="new-password"` so browsers don't offer to save a one-off document password. Deliberately does **not** import pdf-lib (qpdf does the whole job) so no second PDF library enters the route chunk for a cosmetic page count. Free bonus from the gate: dropping an already-encrypted PDF prompts for the old password on intake, making this a change-the-password flow in one pass. Verified in a real browser against the deployed `qpdf.wasm` with the Emscripten glue **sha256-pinned to node_modules before it was executed**: encrypt rc 0, R = 6, AESv3 for stream/string/file; locked file refuses even `--show-npages`; wrong password rejected with the exact "invalid password" string the gate's regex keys on; page count and page text identical through `--qdf` round trip; non-ASCII (Devanagari + emoji) and leading-dash passwords round-trip. Output then fed through the **live** Unlock PDF gate end to end: detected, wrong password refused, correct password accepted | S |
| Crop PDF | 6 | pdf-lib CropBox + pdf.js drag-select preview | M |
| PDF form filler + flatten | 4 (flatten is a near-free byproduct: `form.flatten()`) | pdf-lib's full AcroForm API | M |
| Extract images from PDF | 4 | pdf.js operator-list scan → canvas → PNG; zip via fflate | M |
| Resize/scale PDF pages (A4↔Letter) | 4 | pdf-lib `embedPage` + scale | M |
| PDF to PNG | 3 | existing PDF-to-JPG pipeline, PNG output — new SEO page | S |
| PDF to Text (.txt) | 2 | repackage PDF-to-Word extraction | S |
| ~~PDF metadata viewer/editor/remover~~ **SHIPPED 19 Aug 2026** (`/pdf/pdf-metadata`) | 2 | Zero new deps — pdf-lib only. Two non-obvious behaviours shaped it. **pdf-lib re-stamps its own Producer and a fresh ModDate on every save** unless loaded with `updateMetadata:false`, so the naive build of this tool hands back a file carrying brand new metadata — and advertising the remover. **Deleting a `/Metadata` entry only unlinks the object**: the XMP packet stays in the saved bytes and `strings file.pdf` still prints it, verified (the author name survived a delete-only strip). Each block is therefore overwritten with an empty stream *before* its reference is dropped. Scope is the 8 info-dictionary fields plus the three places no reader displays — document XMP, per-page XMP and PieceInfo. The **edit** path also drops XMP rather than rewriting it, because some readers prefer XMP over the info dictionary and a stale packet would override the field the user just set; serialising correct XMP was judged worse than removing it. Keywords round-trip exactly via a single-element array (`setKeywords` joins on space); an untouched date keeps its seconds rather than being truncated by the minute-resolution `datetime-local` input; clearing a box deletes the key instead of writing an empty string. Logic sits in `components/tools/pdfMeta.js` so it runs in node (the `rupeesWords.js` pattern) — **41 assertions** over a synthetic fixture (document XMP + per-page XMP + PieceInfo), a **real macOS Quartz PDF** whose Producer names the OS version and build, the edit path (non-ASCII, exact keywords, cleared field, date-seconds) and a bare PDF: no source string survives the clean, no pdf-lib stamp, page count and content preserved. Live browser verification was **not** possible (dev servers are blocked in scheduled runs) — the tool uses no pdf.js, only pdf-lib plus the existing wasm password gate | S |

## Tier C — dev/text/convert pair completions (all S, mostly zero-dep)

Cheapest wins first — each completes an existing cluster and cross-links:

- **JSON to YAML** (reverse of existing YAML to JSON; `js-yaml` `dump()`)
- **HTML Beautifier** (reverse of HTML Minifier; `js-beautify`, MIT)
- **XML to JSON + JSON to XML** (`fast-xml-parser`, MIT) — completes the
  data-format matrix with the existing JSON↔CSV / YAML→JSON
- **XML Formatter** (`xml-formatter`, MIT) — FreeFormatter's flagship, inheritable
- **String escapers** (JSON/JS/XML/CSV, pure JS) — FreeFormatter's second flagship
- **Cron expression explainer** (`cronstrue` MIT ~6KB gz + `cron-parser` for next runs)
- **HMAC generator** (WebCrypto `crypto.subtle.sign`, zero-dep) + **CRC32/file
  checksum** (`crc-32` Apache-2.0 or `hash-wasm` per-algorithm) — bolt onto Hash Generator
- **Sort lines / alphabetizer + whitespace remover + HTML tag stripper** — pure
  JS, complete the Remove Duplicate Lines / Remove Line Breaks cluster
- **HTML entity encoder/decoder** (zero-dep via DOM) — sibling of URL Encoder/Base64
- **Number base converter** (bin/oct/dec/hex, pure JS + BigInt) + **text↔binary**
- **Markdown ↔ HTML** (`marked` + `dompurify` one way, `turndown` the other —
  self-completing pair from day one)
- **Roman numerals** (clones Number to Words template)
- **Image ↔ Base64** (FileReader; bridges image + dev clusters)
- **JSON to TypeScript interface** (`json-to-ts`, MIT) — transform.tools' niche
- **SVG to PNG/JPG** (native: SVG blob → canvas; 4 competitors)
- **Age calculator + date difference** (pure Date math; huge volume, contested
  head — worth having for the cluster, not as a primary bet)

## Tier D — viable with caveats

- **Favicon generator** — hand-rolled ICO writer (~60 lines; modern ICO embeds
  PNG) + fflate zip of all sizes + manifest. No maintained browser encoder
  exists and none is needed. Caveat: realfavicongenerator/favicon.io are
  entrenched dev brands → low-medium winnability despite S–M effort.
- **GIF maker (images → GIF)** — `gifenc` (MIT, tiny) or `modern-gif` (MIT,
  active, also decodes → bonus GIF-splitter). Skip `gif.js` (dead since 2016).
- **Image to SVG vectorizer** — `imagetracerjs` (Unlicense) is the ONLY
  permissive option; posterized color tracing, manage quality expectations.
  Every potrace derivative is GPL — do not ship.
- **Zip / unzip** — `fflate` (MIT, 12KB gz, worker-parallel). Also upgrades
  every existing multi-file tool with "download all as zip". Highest-leverage
  infra pick even before the standalone tool.
- **Color palette extractor** — `extract-colors` (MIT, ~5KB); extends color cluster.
- **Rent receipt generator (India)** — ClearTax/NoBroker own the head; winnable
  tail only (revenue stamp, bulk 12-month PDF). Fits finance cluster, Jan–Mar
  seasonal. Medium.
- **Unit converter family** — 4 competitors, pure math, huge long-tail (page per
  pair) but calculator.net/RapidTables entrenched — programmatic play, medium.
- **Pixelate/blur-region, circle crop, border, grayscale, Instagram grid
  splitter** — trivial Canvas one-offs from the TinyWow catalog; batch as filler.
- **Invoice generator (GST)** — strong finance-cluster synergy, but
  invoice-generator.com/Zoho/Canva own the head; India-GST angle only. M.
- **Audio trim** — native OfflineAudioContext + hand-rolled WAV writer is
  zero-dep; skip MP3 export (lamejs is LGPL + dormant).

## Skip list (with reasons)

- **potrace / esm-potrace-wasm** — GPL. **lamejs** — LGPL + dormant.
- **Password generator, diff checker, regex tester as primary bets** — real
  demand, but head SERPs owned by entrenched single-brand incumbents; build only
  as cheap cluster-fillers, expect little traffic.
- **IFSC lookup** — feasible as static RBI data but ~170k thin programmatic
  pages = thin-content risk for a young domain.
- **PAN/Aadhaar validators** — checksum is client-side feasible but search
  intent is navigational to govt portals.
- **Speech-to-text via Web Speech API** — Chrome proxies audio to Google
  servers; contradicts the privacy promise.
- **Internet speed test / typing test** — infra or engagement-product plays.
- **PDF to EPUB** — feasible but poor output on layout-heavy PDFs.
- **Redact PDF** — only safe as rasterize-and-flatten; true content-stream
  redaction is dangerous to get slightly wrong. Revisit deliberately, not as a
  quick win.
- Previously ruled out and still ruled out: background removal (AGPL + ~100MB),
  Office→PDF (LibreOffice server), HTML-to-image, ffmpeg.wasm video (except
  stream-copy trim).

## Suggested integration

Feed Tier A + Tier B into the daily-ship feature slot ahead of the existing
Tier 4/5 items (they beat @jsquash and sign-pdf on demand evidence). Tier C
items are half-day fillers that also generate guide topics. Before heavy
investment in any single bet (e.g. per-exam programmatic pages), sanity-check
with 2–3 weeks of GSC data once the first pages index.
