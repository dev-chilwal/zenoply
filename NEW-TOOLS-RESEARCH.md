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
| ~~Crop PDF~~ **SHIPPED 22 Aug 2026** (`/pdf/crop-pdf`) | 6 | Zero new deps — pdf-lib for the boxes, the shared pdf.js loader for the drag-select preview, reusing the existing `.crop-stage` / `.crop-box` styles and pointer-capture drag from `CropImage`. Cropped **in place**: only the page boxes are rewritten and no drawing instruction is touched, which is at once why text stays vector-sharp, why links/bookmarks/form fields/comments survive unmoved (their coordinates are absolute page-space and the origin does not move), why it is instant on a long document, and why the file size barely moves. **Both** CropBox and MediaBox are written — CropBox alone is what the spec calls a crop, but print pipelines lay out from the MediaBox and would ignore it, so the trim would appear to silently fail on the one machine that mattered; Bleed/Trim/Art are clipped into the new page rather than dropped. Geometry sits in `components/tools/pdfCrop.js` so it runs in node (the `rupeesWords.js` pattern). Three things had to be right: the drag box is in **display** space (origin top-left, y down, after /Rotate) while the boxes are unrotated page space, so on a /Rotate 90 page trimming the displayed top trims the stored *left* — /Rotate is left untouched; a PDF rect is "any two diagonally opposite corners" so a legal MediaBox may be written upper-left first and pdf-lib's `asRectangle()` returns a **negative width**, which every box is normalised against first (pdf.js normalises internally, which is exactly why such a file renders fine while the maths around it does not — note `pdfResize.js` still carries this latent issue); and the MediaBox origin is not always (0,0) and the CropBox may already be smaller, so the crop is taken against CropBox-clipped-to-MediaBox. The crop is carried as **fractions of the displayed page**, not absolute points: that is what the drag produces, it keeps "top" meaning top on a page whose /Rotate differs from its neighbours, and it cannot go degenerate on a mixed-size document the way a fixed 20 mm trim can (which would have to be silently clamped into some other crop than the one drawn). Auto-trim measures where the ink stops, and the interesting part is the noise rule: ink alone is not enough because one speck of scanner dust holds the whole margin open, so a pixel counts only once its 3x3 neighbourhood holds 3 inked pixels. That connectedness test deliberately replaced a per-row/per-column count, which **reports a page blank when its only content is a 1px vertical hairline** — every row holds a single inked pixel and none clears an axis threshold. Blank pages return null and are skipped rather than read as full-bleed; long documents are sampled evenly and the number sampled is reported rather than silently capped. Verified: **178 node assertions** (geometry, all four rotations, offset origins, reversed rects, despeckle incl. the hairline and speck/pair/trio cut-offs, Bleed/Trim/Art clipping, partial-range crops) plus **672 cross-checks against real pdf.js 4.10.38** — `displayToPage` matches `convertToPdfPoint` at 25 points across 11 page configurations, the cropped viewport equals the size the UI promised, /Rotate and links survive. Then in a **real browser** against pdf.js hash-pinned to `node_modules` and zenoply's **own deployed worker**: render → `getImageData` → auto-trim landed within **1.27pt (one raster pixel)** of analytic truth on both an unrotated and a /Rotate 90 page, where ignoring rotation would have been **357.7pt** wrong. The hidden-tab rAF stall reproduced live and the shipped MessageChannel scheduler in `pdfjs.js` fixed it — that workaround is load-bearing for this tool. The copy and guide both say a crop **hides rather than deletes**, verified in both directions: pdf.js drops the off-crop glyphs when extracting text (so a crop can pass a text-extraction check and look redacted), while the content stream still holds every word and restoring the page box returns them. Dev-server verification of the React component itself was not possible (blocked in scheduled runs); checked on the live site after deploy | M |
| ~~PDF form filler + flatten~~ **SHIPPED 23 Aug 2026** (`/pdf/fill-pdf-form`) | 4 | Zero new deps — pdf-lib only, no pdf.js, so this is node-verifiable end to end. Logic lives in `components/tools/pdfForm.js` (the `rupeesWords.js` pattern) — **107 assertions**, including cross-checks against real pdf.js 4.10.38. `form.flatten()` was **not** usable as-is; three pdf-lib behaviours are load-bearing. (1) `flatten()` and `removeField()` both resolve a widget's appearance ref, which throws "Unexpected N type: undefined" for any widget with no /AP /N — and `PDFSignature.needsAppearancesUpdate()` returns **false**, so nothing ever generates one. An ordinary form ending in a signature box therefore cannot be flattened at all by stock pdf-lib (asserted in the suite: pdf-lib's own `flatten()` throws on the fixture this tool handles). Every bare widget is given an empty form XObject first. (2) `removeField()` un-links annotations by their **appearance** ref rather than the widget ref, so on a form whose fields and widgets are separate objects — radio groups always, and most real forms — flatten deletes the widget objects but leaves dangling references in `/Annots`; those are pruned and the emptied AcroForm dropped, so a flattened file is genuinely non-interactive rather than merely field-less. (3) Appearances are redrawn with a WinAnsi Helvetica, so Devanagari, CJK, emoji **and the rupee sign U+20B9** throw at save with a message naming only the codepoint. Appearances are therefore generated **one field at a time**, so a single bad value cannot sink the document: the value is still written, `NeedAppearances` is set so a real reader draws it, and only *flattening* is refused — flattening would bake in an appearance that does not exist and lose the answer. The UI warns per field while typing, naming the exact characters, using pdf-lib's own encoder rather than a hand-rolled WinAnsi table, with pdf-lib's `cleanText()` pre-strip set (tab, the newline family, NEL/LS/PS) excluded — those never reach the font and reporting them would flag every multiline field. Read-only fields are shown with their value but never written; signature fields are listed and left alone rather than faked, since no browser tool holds your certificate; XFA forms are detected by name, as their fields are not in the AcroForm at all. Labels prefer `/TU` — the tooltip, which on a well-made form holds the real question while `/T` holds a database key. Loaded with `updateMetadata:false`, so filling does not re-stamp Producer/ModDate (asserted). Verified: flattened values are painted into the page — pdf.js extracts them from **page text**, where the same file unflattened yields none but reports them as **field values** — page count, read-only values and pre-existing values all preserved, no dangling refs, and the drop-and-download-untouched path round-trips every field kind unchanged. Live browser verification of the React component was **not** possible (dev servers are blocked in scheduled runs); the component compiles into the production build and its initial render is in the static HTML, and it uses no pdf.js — only pdf-lib plus the existing wasm password gate | M |
| ~~Extract images from PDF~~ **SHIPPED 24 Aug 2026** (`/pdf/extract-images-from-pdf`) | 4 | Zero new deps — `fflate` proved unnecessary. Every file this packs is already compressed (PNG carries a deflate stream, JPEG its own entropy coding), so a **store-only ZIP writer** in `components/tools/zip.js` (~90 lines incl. a CRC-32 table) does the whole job and runs in node, which is where it is tested. The plan above was pdf.js → canvas → PNG for everything; the shipped tool does better than that. **"Original" hands back the photographer’s own JPEG byte for byte** — most PDFs store an embedded photo as the untouched source file, so pdf-lib reads the raw stream and it is handed over with no decode/re-encode round trip at all (asserted: sha256 of the extracted bytes equals the source .jpg). That is only safe when the stored bytes would open correctly alone, so a pass-through requires `/Filter` to be exactly `/DCTDecode`, no `/Decode`, `/SMask`, `/Mask` or `/DecodeParms` (which may carry ColorTransform, deciding whether three components are YCbCr or already RGB), a grey/RGB colour space (Device, Cal, or ICCBased with matching `/N`), **and** the JPEG’s own SOF header agreeing on the component count — a 1-component JPEG under an Indexed space is palette indices, not grey. CMYK, indexed, inverted and soft-masked images fall through to pdf.js, which understands all of it. Three pdf.js behaviours are load-bearing. (1) **Dedup must key on the PDF object reference, not the pdf.js object id**: the second page to draw a shared image gets a *different* id (`g_d0_img_p1_1` vs `img_p0_1`) routed through `commonObjs`, but both resolve to the same `ref` string (`"4R"`, from `dict.objId = ref.toString()` — a string in the browser too, not a cloned Ref object). Keying on the id saves a logo once per page. (2) **Pages are never `cleanup()`ed during the sweep**: for a shared image the worker asks the *main thread* to `CopyLocalImage` out of an earlier page’s store, and a cleared store makes that lookup fail — at which point nothing ever resolves the callback, so the resolve is also given a timeout rather than being allowed to hang. (3) `objs.get()` can resolve to **null** for an image that failed to decode. Masks (`paintImageMaskXObject*`, `paintSolidColorImageMask`) and pdf.js’s inlined postage-stamp images are counted but not extracted — they are one-colour stencils and dither tiles, not photographs — and the count is what lets the empty state say “this PDF’s graphics are vector art” instead of just “nothing found”. Canvas detail: `putImageData` **overwrites alpha rather than blending**, so a white rectangle painted underneath is simply erased; JPG output composites onto white in JS (`flattenOntoWhite`) instead. Verified: **109 node assertions** (66 pure + 43 against real pdf.js 4.10.38, incl. a hand-built PDF wrapped around known sample bytes so every pixel of the RGB and 1-bit conversions is checked against what went in, row padding included), the zip validated with Info-ZIP `unzip` and Python `zipfile` (sha256-identical entries, UTF-8 names, timestamps) — real `unzip` caught a genuine bug, an EOCD reporting the central directory 12 bytes too long because `pos` had already advanced into the record. Canvas encoding verified in a **real browser** (dev servers are blocked in scheduled runs): PNG round-trips opaque pixels bit for bit and alpha exactly, JPG composites to within 1/255, and the **ImageBitmap** path browsers take for JPEGs gives identical pixels to the raw-data path. Measured across all 256 alpha values, the single inexactness is the colour *under* a partly transparent pixel, which canvas stores premultiplied (error ≈ 255/2a) — the copy says so rather than claiming PNG is exact everywhere. **Follow-up worth considering:** a hand-rolled PNG encoder over `CompressionStream("deflate")` would remove even that, and the CRC-32 it needs already exists in `zip.js` |
| ~~Resize/scale PDF pages (A4↔Letter)~~ **SHIPPED 21 Aug 2026** (`/pdf/resize-pdf-pages`) | 4 | Zero new deps — pdf-lib only, no pdf.js. Built **in place**, not with the `embedPage` + `drawPage` plan above: re-drawing a page as a form XObject flattens it, so links, form fields, comments and outlines are all lost — the one thing worth having over the incumbents. Keeping the page costs three things pdf-lib will not do for you, and all three are load-bearing. `setSize()` **only follows the CropBox when it already equals the MediaBox**, so a cropped page would keep its old, now-wrong crop (both boxes are written explicitly; Bleed/Trim/Art squared up when present). The **MediaBox origin is not always (0,0)** and content coordinates are relative to it, so it is subtracted out or the page lands offset — verified against a `[9 9 621 801]` fixture. And `scaleAnnotations()` scales annotation rects about the origin but **cannot translate them**, so centring the content would strand every link; the full affine transform is applied to Rect/QuadPoints/Vertices/L/CL/InkList instead, with RD scaled only because it holds inset differences rather than points. **/Rotate is left untouched** and handled by swapping the *stored* box: a page displayed landscape because it carries /Rotate 90 is stored portrait, so the target is swapped back before writing, and fitting happens entirely in unrotated space — valid because rotation is rigid and cannot change how much of the box the content fills. Orientation defaults to keep-each-page's, so a landscape chart in a portrait report becomes landscape A4 rather than being turned on its side. Operator order is asserted, not assumed: `scaleContent` wraps first and `translateContent` wraps that, giving `[translate][scale][original]`, so the effective transform is translate(scale(p)). Geometry sits in `components/tools/pdfResize.js` so it runs in node (the `rupeesWords.js` pattern) — **428 assertions**: 101 pure-geometry, 102 round-trips against **real pdf.js** text-item transforms, viewport sizes after /Rotate, annotation rects and the content-stream operators, and 225 against genuine third-party PDFs (macOS 26.6.2 and Mac OS X 10.13.4 Quartz) confirming every glyph lands at scale*src + offset, text is preserved and nothing falls outside the page, plus blank-page and degenerate-CropBox cases. Then verified **end to end on the production build in a real browser**: four documents resized through the shipped bundle, the exact output bytes carried back into node and re-checked (27 more assertions) — A6→A4 lands at exactly 2x, and file size moves <1%, which is the tool's own copy point that resizing is not compressing | M |
| ~~PDF to PNG~~ **ALREADY COVERED — do not build** | 3 | Checked against the code on 20 Aug 2026: `PdfToJpg` already ships a JPG/PNG `Segmented` toggle and writes `page-N.png`, so a separate tool would be a functional duplicate of a live tool, not a new capability. The only thing a `/pdf/pdf-to-png` page would add is the URL, and a second page whose tool is identical is a thin-content risk rather than a free keyword. If the "pdf to png" query is worth chasing later, the honest way is a guide or a section on the existing tool page, not a cloned tool | — |
| ~~PDF to Text (.txt)~~ **SHIPPED 20 Aug 2026** (`/pdf/pdf-to-text`) | 2 | Zero new deps. Not a repackaging of PDF to Word but a split of it: the text-recovery logic moved out of `PdfToWord` into `components/tools/pdfText.js`, so both tools read a page identically and the rules run in node (the `rupeesWords.js` pattern). The differentiator over every download-only converter is that the text lands in an **editable box on the page** — the actual intent behind "pdf to text" is usually to copy, not to acquire a file — plus a page range and optional page markers, neither of which PDF to Word has. Two behaviours are worth recording. Real pdf.js does not hand back clean items: it emits **empty-string items** at line starts and, between two separately-positioned words, **its own zero-height `" "` item** — so the height fallback (`transform[3]` when `height` is 0) and the already-ends-in-space check are load-bearing, and without them "Invoice Total" comes out doubled or joined. And a page yielding no text must not leave a hole: `assembleText()` collapses runs of 3+ newlines, while the page marker still records that the page exists, which is how a reader tells "this page held no text" from "this page is missing". The .txt carries a **UTF-8 BOM** so Notepad on Windows stops falling back to the system code page on accents and non-Latin scripts. Verified: 22 node assertions over synthetic items — incl. explicit **parity with the pre-refactor `PdfToWord` code paths**, so the split cannot have changed Word output — plus 7 over **genuine pdf.js 4.10.38 text items** for a real 3-page PDF (wrapped paragraph + address block, positioned-word pair, deliberately blank page 3), generated and extracted in a real browser against **our own deployed worker**, sha256-matched to `node_modules`. Items were carried back into node so the assertions ran against the file on disk rather than a retyped copy | S |
| ~~PDF metadata viewer/editor/remover~~ **SHIPPED 19 Aug 2026** (`/pdf/pdf-metadata`) | 2 | Zero new deps — pdf-lib only. Two non-obvious behaviours shaped it. **pdf-lib re-stamps its own Producer and a fresh ModDate on every save** unless loaded with `updateMetadata:false`, so the naive build of this tool hands back a file carrying brand new metadata — and advertising the remover. **Deleting a `/Metadata` entry only unlinks the object**: the XMP packet stays in the saved bytes and `strings file.pdf` still prints it, verified (the author name survived a delete-only strip). Each block is therefore overwritten with an empty stream *before* its reference is dropped. Scope is the 8 info-dictionary fields plus the three places no reader displays — document XMP, per-page XMP and PieceInfo. The **edit** path also drops XMP rather than rewriting it, because some readers prefer XMP over the info dictionary and a stale packet would override the field the user just set; serialising correct XMP was judged worse than removing it. Keywords round-trip exactly via a single-element array (`setKeywords` joins on space); an untouched date keeps its seconds rather than being truncated by the minute-resolution `datetime-local` input; clearing a box deletes the key instead of writing an empty string. Logic sits in `components/tools/pdfMeta.js` so it runs in node (the `rupeesWords.js` pattern) — **41 assertions** over a synthetic fixture (document XMP + per-page XMP + PieceInfo), a **real macOS Quartz PDF** whose Producer names the OS version and build, the edit path (non-ASCII, exact keywords, cleared field, date-seconds) and a bare PDF: no source string survives the clean, no pdf-lib stamp, page count and content preserved. Live browser verification was **not** possible (dev servers are blocked in scheduled runs) — the tool uses no pdf.js, only pdf-lib plus the existing wasm password gate | S |

## Tier C — dev/text/convert pair completions (all S, mostly zero-dep)

Cheapest wins first — each completes an existing cluster and cross-links:

- ~~**JSON to YAML**~~ **SHIPPED 26 Aug 2026** (`/convert/json-to-yaml`) — zero
  new deps; `js-yaml` was **not** used, and the plan's `dump()` would have been
  wrong twice over. (1) **`JSON.parse` is lossy for exactly the values people
  check.** It rounds `12345678901234567890` to `12345678901234567000` and
  rewrites `1.50` as `1.5` — a config file's IDs and version pins. So
  `components/tools/jsonYaml.js` hand-rolls a JSON parser that keeps every
  number as its **original literal text** and only ever re-emits that text. The
  one deliberate rewrite is exponents: `1e5` is written `1.0e+5`, because the
  YAML 1.1 resolver's float regex demands both a `.` in the mantissa **and** a
  signed exponent, so a bare `1e5` loads as a *string* under Psych/PyYAML while
  being a float under 1.2. (2) **YAML types unquoted scalars by shape**, so
  `isPlainSafe` quotes the **union** of the 1.1 and 1.2 resolvers rather than
  either alone — `NO` (Norway), `yes`/`no`/`on`/`off`/`y`/`n`, `1_000`, `017`,
  `0x1F`, `0b101`, `1:30`, `.inf`, `2026-08-25`, `<<` — because you rarely know
  which loader reads the file at the other end. Keys get a *stricter* rule
  still (any bare `:` quotes the key), since a re-typed key is as damaging as a
  re-typed value. Multi-line strings become **literal block scalars** with the
  right chomping indicator, falling back to double-quoted — exact, because
  YAML's double-quoted style is a superset of a JSON string — where a block
  cannot be faithful: a space-led or empty first line (indentation would be
  mis-detected), a trailing space on any line (silently dropped), 2+ trailing
  newlines (depends on blank lines at the end of the block surviving), or any
  tab. Nested sequences pad the dash to the child column (`-   - 1` at a
  4-space indent), which a naive `- ` emitter gets wrong for any indent != 2.
  Duplicate keys resolve last-wins (matching `JSON.parse`) and the **count is
  surfaced in the UI** rather than silently dropped, since YAML cannot express
  a duplicate key at all. Verified by round-tripping **45 cases through Ruby's
  Psych 5.3.1** — a real YAML 1.1 loader — at *both* 2- and 4-space indents,
  with the loaded tree walked so any non-JSON-native result (Date, Integer key,
  Symbol, Infinity) becomes a marker string: without that, a date-typed value
  would serialise straight back to the string it started as and the test would
  pass while the bug shipped. Then driven end to end in a **real browser
  against the production build** (`next build` + static serve of `out/`, since
  dev servers are blocked in scheduled runs) — conversion, both indents, the
  error path, the duplicate notice and literal preservation all checked on the
  shipped bundle, console clean. PyYAML was not installed on the host; Psych is
  the same YAML 1.1 schema and was used instead
- ~~**HTML Beautifier**~~ **SHIPPED 4 Sep 2026** (`/dev/html-beautifier`) — zero
  new deps; `js-beautify` was **not** used. Parser and emitter are hand-rolled
  in `components/tools/htmlFormat.js` (the `xmlFormat.js` pattern) so they run
  in node, which is where they are tested, and so the whitespace contract could
  be chosen rather than inherited. The contract: **the output differs from the
  input only in whitespace, and only where CSS does not render it.** That is
  stronger than what a beautifier normally promises, and it is the tool's whole
  point, because HTML is the format where pretty-printing is not free: **a
  newline collapses to a space, not to nothing.** Splitting
  `<span>a</span><span>b</span>` across two lines renders "a b" instead of
  "ab" — a one-space layout shift that breaks a pill row or an icon sitting
  flush against its label, shows up in a diff as pure whitespace, and is what
  essentially every other beautifier does. So a line is only ever broken next to
  a **block-level** boundary, where the whitespace-processing model drops it;
  anything holding text or inline tags stays on one line with its character data
  copied byte for byte. Four more things drove the design. (1) **Every token is
  emitted as a raw source slice**, so attribute order, quoting (double, single
  or none), bare booleans and tag-name case survive untouched and no tag is ever
  added or removed — lower-casing `<MyComponent>` breaks a Vue build and adding
  a `</li>` changes what a framework parses. Optional end tags (a bare `<li>`,
  `<p>`, `<tr>`, `<td>`) are resolved for *indentation only*, and the count is
  reported rather than filled in. (2) **An unknown tag is `display: inline`**,
  which is what a browser does with a custom element, so web components are
  inline by default; the override is a checkbox, off by default, and is the one
  option that can change rendering. (3) `<svg>` is **block-like inside and
  inline outside** — it is a replaced inline box in HTML flow, so its insides
  are laid out freely while a break beside it is not taken unless it is alone in
  its parent. (4) **Script and style are shifted, never rewritten**, and the
  shift is skipped when the block holds a template literal or a
  backslash-continued string, where a line's leading spaces are part of a value;
  `pre`/`textarea` are verbatim, with no newline after `<pre>` (the parser eats
  it), and an inline `style="white-space: pre"` is honoured. Verified against
  **parse5**, the reference HTML5 tree builder, installed outside the project so
  nothing enters the bundle. Four invariants per document: non-whitespace bytes
  identical, parse5 tree identical after whitespace normalisation, the rendered
  text of every block box identical under an **independently written** model of
  CSS whitespace processing, and idempotence. **627 checks over 46 documents x
  12 option combinations**, plus **700 over the site's own 175 built pages**,
  plus negative controls proving each invariant fires — then the whole suite
  re-run against a **terser-minified build**, so the bytes that ship are the
  bytes tested. The invariants earned their keep, catching three real bugs: an
  implicitly-closed element's source range ran past the tag that closed it and
  emitted that tag twice; `<svg>` was classified block-level when it is inline
  in HTML flow; and a whitespace-only line was left where an omitted end tag
  would have gone. A fourth finding was a design one — a `trimText` switch
  copied over from the XML formatter was **removed**, because in HTML the
  whitespace at a block element's content edges is never rendered, so making the
  trim optional bought nothing and made formatting non-idempotent. Browser
  verification was **not** possible this run: dev servers and browser navigation
  are both blocked in scheduled runs, so the minified-bundle suite stands in
  for it
- ~~**XML to JSON**~~ **SHIPPED 6 Sep 2026** (`/convert/xml-to-json`) — zero
  new deps; `fast-xml-parser` was **not** needed, because `xmlFormat.js`
  already parses XML into a tree with attributes, CDATA and entities intact, so
  the converter is an emitter over that tree. Logic lives in
  `components/tools/xmlJson.js` (the `jsonYaml.js` pattern) so it runs in node,
  which is where it is tested. There is no canonical XML→JSON mapping — XML has
  attributes, ordered mixed content, comments and namespaces and JSON has none
  of them — so every design decision here is about making a loss **loud rather
  than silent**, and each one is surfaced in the UI as a warning. Four things
  drove it. (1) **Entities must be decoded, which is the one thing
  `xmlFormat.js` deliberately does not do** — JSON has no entity syntax, so
  leaving `&amp;` in a string is simply wrong. Decoding means enforcing what a
  parser enforces: a numeric reference outside XML's legal Char range (`&#0;`,
  `&#xD800;`, `&#xFFFE;`) is an **error, not a character**, and an undeclared
  named entity — `&nbsp;` is the usual one, it is HTML's, not XML's — is
  reported and left literal rather than guessed at from HTML's table. (2)
  **Attribute-value normalisation and line-ending normalisation are real and
  are usually skipped.** A parser turns a literal tab or newline inside an
  attribute value into a space and CRLF into LF everywhere *before* the
  application sees the value, while `&#9;` and `&#13;` survive — a converter
  that ignores this disagrees with every XML parser on any document containing
  either. (3) **A repeated element is an array and a single one is not**, which
  is the bug that outlives the conversion: the output *shape* is decided by the
  data rather than the schema, so `items.item.map()` breaks on the first record
  whose list holds one entry. It cannot be fixed silently (both shapes are what
  people ask for), so it is an option — "Always arrays" — and, whenever
  repeat-counting actually decided a key's shape, a warning. (4) **Values stay
  strings unless asked otherwise**, and type conversion only emits a number when
  `String(Number(s)) === s`, so `007`, `1.50`, `+1` and anything past 2^53 stay
  text where a `parseFloat` converter damages all four. Attributes get a `@`
  prefix by default because an attribute and a child element may legally share a
  name (`<book id="1"><id>2</id></book>`), and with an empty prefix the
  collision is *reported* rather than silently resolved. Namespace stripping
  also drops the now-meaningless `xmlns` declarations and reports names that
  collide once their prefixes are gone. **Verified in three layers.** 336 node
  assertions on the source, of which **234 are cross-checks against expat** via
  `python3` — an independently written mapper consuming expat's event stream,
  over 26 documents × 9 option sets, compared key-order-sensitively, so expat
  rather than a second copy of the same guess decides what the entities,
  attribute values and line endings resolve to. Four deliberate defects
  (dropping attribute normalisation, CRLF folding, whitespace-run dropping, the
  CDATA trim guard) each fail 8–12 assertions, so the suite demonstrably has
  teeth. Then **638 assertions against the shipped minified bytes**, pulled out
  of the built chunk with a webpack-runtime shim and driven through the *real*
  component with stubbed hooks — so the path exercised is state → options →
  conversion → OutputBox, not a re-import of the source — of which 624 compare
  against expat. Finally the same shipped bytes run in a **real browser engine**
  over all 624 cases with zero mismatches and zero throws. Worth recording for
  future runs: `preview_start` is now blocked outright in scheduled runs (not
  just `next dev`), so the static-server route noted below no longer works;
  the browser check was done by inlining the two chunk modules into a
  standalone page opened over `file://`. Two constraints there — the pane
  converts the file to a `data:` URL, which is an **opaque origin and therefore
  not a secure context, so `crypto.subtle` is undefined** (compare per-case
  hashes with a plain JS function instead), and anything over roughly half a
  megabyte fails to open at all. **JSON to XML remains unbuilt** and stays in
  this bullet's cluster
- ~~**XML Formatter**~~ **SHIPPED 27 Aug 2026** (`/dev/xml-formatter`) — zero
  new deps; `xml-formatter` was **not** used. The parser and emitter are
  hand-rolled in `components/tools/xmlFormat.js` (the `jsonYaml.js` pattern) so
  they run in node, which is where they are tested, and so the whitespace
  contract could be chosen rather than inherited. That contract is the whole
  tool: **character data is never altered, only markup is normalised.** It is
  what makes an element holding real text — mixed content, `<p>Hello
  <b>world</b>!</p>` — stay on **one line**, because indenting its children
  turns the string `Hello ` into a newline plus indentation. That is not a
  hypothetical: it is what every child-per-line beautifier does, it renders
  wrong in a browser and fails a signature check, and it is invisible until
  something downstream complains. Only elements whose content is entirely other
  elements are indented. Whitespace **around** a text value is the boundary
  case — trimming `<name>\n  Bob\n</name>` to `<name>Bob</name>` is what
  everyone wants *and* is strictly an edit — so it is a switch (default on)
  that `xml:space="preserve"` overrides in both directions, and entities are
  passed through as written rather than decoded (re-encoding `&#233;` would
  change the bytes of a document that may be signed). Doubles as a validator:
  mismatched/unclosed tags, the bare `&`, `<` in an attribute value, unquoted
  or duplicated attributes, text outside the root, unterminated comment/CDATA,
  `--` inside a comment and a misplaced XML declaration, each with a line and
  column. **Verified with 350 node assertions.** The strong ones are the
  cross-checks: 15 real-world documents (RSS, POM, SOAP, SVG, XHTML, sitemap,
  Android layout, DOCTYPE with an internal subset, Devanagari) formatted in 5
  option combinations, each output re-parsed by **expat** via `python3` and its
  canonicalised parse tree compared against the input's — so any change to
  character data fails the test — and re-validated with **xmllint**; plus
  idempotence and `beautify(minify(x)) === beautify(x)` on every document, and
  **verdict agreement with xmllint on 27 malformed and 27 well-formed
  documents**, which is what caught three real divergences: a whitespace-only
  element emitting `<a>\n</a>`, `<!DOCTYPE a <a/>` being accepted because the
  scan for `>` found the root element's, and an over-strict reserved-target
  rule that would have rejected `<?xmlfoo?>` (libxml2 warns and accepts). The
  one deliberate divergence — a multi-root **fragment** is a warning here and
  an error to a real parser, since people paste fragments — is asserted in both
  directions so it cannot drift. Then driven end to end in a real browser
  against the **production build** (dev servers are blocked in scheduled runs):
  all three indents, both modes, both switches, the error path and the fragment
  warning, console clean, no mobile overflow
- ~~**String escapers**~~ **SHIPPED 30 Aug 2026** (`/dev/string-escaper`) — zero
  new deps, and shipped as **eight** targets rather than the four planned:
  JSON, JavaScript/TypeScript, HTML, XML, CSV, SQL, regular expressions and
  POSIX shell, with an Unescape direction on the six that reverse cleanly. All
  rules live in `components/tools/escapeString.js` (the `jsonYaml.js` pattern)
  so they run in node — which is the point, because each one is tested against
  the **real consumer** of its format rather than a second implementation of
  the same guess: `JSON.parse` for JSON (output is byte-identical to
  `JSON.stringify`, incl. ES2019 well-formed escaping of unpaired surrogates),
  `new Function()` for all three JS quote styles, python's `html.entities` name
  by name plus full-string agreement with `html.unescape`, **expat** parsing the
  XML back in both text and attribute position, python's `csv` module reading
  every field, **sqlite3 actually executing `SELECT '<escaped>'`** and returning
  the value, and **bash** passing the quoted argument through `printf`
  unchanged. **1247 assertions**, then the shipped bundle driven end to end in a
  real browser against the production build (dev servers are blocked in
  scheduled runs): all eight formats, every option, both directions, console
  clean, no mobile overflow. Four things the cross-checks forced, none of them
  obvious. (1) **XML normalises a literal carriage return to a line feed**
  before the application sees it, and inside an attribute value turns tab and
  newline into spaces — so those must be written `&#13;`/`&#9;`/`&#10;` or they
  are silently lost; caught by the expat round-trip, which is exactly the class
  of bug a self-consistency test cannot find. (2) Escaping `-` as `\-` is a
  **SyntaxError outside a character class once the `u` or `v` flag is on**, so
  the regex escaper emits `\x2D`, legal in every position and every mode. (3)
  XML 1.0 cannot hold most control characters *at all* — `&#1;` is a parse
  error, not an escape — so they are reported and optionally stripped rather
  than emitted into a document that will not parse. (4) Regex and shell are
  **escape-only**: `\d`, `\b` and `\w` are character classes rather than
  escaped letters, and shell quoting has many equally valid spellings, so
  reversing either would be guessing. Output is built one code point at a time
  rather than by chained replaces, which makes the classic `&`-ordering bug
  (`<` → `&amp;lt;`) structurally impossible and handles astral characters and
  lone surrogates correctly. SQL ships with a prominent note that escaping is
  not a substitute for a parameterised query. **Prerequisite fix shipped in the
  same push:** the three inline `<script type="application/ld+json">` blocks
  serialised with a bare `JSON.stringify`, so the first literal `</script>` in
  any FAQ ended the block and spilled the rest of the graph into the page as
  visible text — this tool's own FAQ was the first content to trigger it.
  `jsonLdScript()` in `lib/seo.js` now escapes `<`, `>`, `&` and U+2028/U+2029
- ~~**Cron expression explainer**~~ **SHIPPED 1 Sep 2026**
  (`/dev/cron-expression-generator`) — zero new deps, and the plan's two
  libraries were used as *test oracles* rather than shipped: `cronstrue` and
  `cron-parser` were installed outside the project and the whole engine
  cross-checked against them, so nothing enters the bundle. Rules live in
  `components/tools/cronExpr.js` (the `jsonYaml.js` pattern) so they run in
  node, which is where they are tested. Three flavours, because "cron" is not
  one language: standard 5-field crontab, 6-field with seconds (node-cron,
  Spring), and Quartz/EventBridge at 6 or 7 fields with `L`, `LW`, `L-3`,
  `15W`, `6L` and `6#3`. The dialect is an input, not a guess — Quartz numbers
  the week from **1 = Sunday**, so the same digit means a different day than in
  a crontab, and it requires a `?` in exactly one day field. Four things drove
  the design. (1) **Day-of-month and day-of-week are OR'd, not AND'd**, and
  Vixie decides "restricted" by testing whether the field text *starts with*
  a `*` — so `*/2` is unrestricted and `1-31` is not, though they cover the
  same days. That literal test is reproduced, and the OR is flagged whenever it
  applies; it is the tool's headline, since `30 4 1,15 * 5` (crontab(5)'s own
  example) fires six times in September 2026, not zero. (2) The search runs on
  **wall-clock fields and converts only the answer**, which is the only way to
  notice a run landing in a skipped or repeated hour. (3) A step wider than its
  field matches one value, so `*/90` must **not** be described as "every 90
  minutes" — it is minute 0, hourly; describing it by its step would restate
  the user's mistake. (4) Expressions that can never fire (`0 0 30 2 *`) are
  detected analytically rather than by spinning to the horizon. **Verified:**
  9,576 comparisons against cron-parser over 9 zones × 14 start instants ×
  three dialects with **0 non-DST divergences**; 22 brute-force
  minute-by-minute scans of a whole year matching the skip-ahead search exactly
  (an independent implementation of the *search*, which is where the off-by-one
  bugs live); and 13 day-rule checks against dates derived by plain `Date`
  arithmetic rather than by asking the parser. The cross-check earned its keep
  — it caught `tzOffset` comparing offsets at sub-second instants, so the
  DST-transition binary search never converged and returned an arbitrary
  midpoint, and it caught `mon,wed,fri` being rejected because a loose
  `[LW#]` scan read the W in **WED** as a Quartz extension. The 53 remaining
  DST divergences are **two deliberate, documented choices**: a run skipped by
  a forward change is placed at the **transition instant** per crontab(5)
  ("jobs skipped by a forward change are run soon after it") rather than at the
  old offset the way cron-parser does, and a repeated local time is listed
  **once** with a note saying Linux cron does not re-run a fixed-time job there
  while wall-clock schedulers do — a stated limitation rather than a silent
  omission, since a pure wall-clock search structurally cannot emit the second
  pass. Then driven end to end in a real browser against the **production
  build** (dev servers are blocked in scheduled runs): all three flavours, both
  Explain and Build modes, every error path, `Intl.supportedValuesOf` giving
  418 zones, console clean, no mobile overflow
- **HMAC generator** (WebCrypto `crypto.subtle.sign`, zero-dep) + **CRC32/file
  checksum** (`crc-32` Apache-2.0 or `hash-wasm` per-algorithm) — bolt onto Hash Generator
- ~~**Sort lines / alphabetizer**~~ **SHIPPED 4 Sep 2026** (`/text/sort-lines`)
  — zero new deps. The tool's whole reason to exist is that the obvious
  implementation is wrong: `items.sort()` compares UTF-16 code units, so every
  ASCII capital sits below every lowercase letter (`Banana` before `apple`),
  `item10` files before `item9`, and an accented word lands past Z. That is
  what essentially every small online sorter ships, and it is not alphabetical
  order in any language. Alphabetical mode therefore goes through
  **`Intl.Collator`** — the platform's Unicode collation, the same table the OS
  sorts a folder with — with `numeric: true` for natural order and
  `sensitivity: "accent"` so case ties compare equal and, under a stable sort,
  keep input order. A **Language** select is exposed rather than hidden,
  because collation genuinely disagrees between languages: `Ängel/Bok/Zebra`
  sorts A-first under `en` and `de` but Ä-last under `sv`, and picking wrong is
  a silently wrong answer rather than an error. Code-point order survives as
  its **own named mode**, since reproducing a shell `sort` under `LC_ALL=C` or
  a binary `ORDER BY` is a real task — and that mode deliberately ignores the
  case and article options, because anything that quietly rewrote the key would
  defeat the point of asking for it. Three more decisions. (1) **Descending
  negates the comparator instead of reversing the array**: `Array.sort` is
  stable since ES2019, so negating keeps ties in input order, where reversing
  would flip them and two lines differing only in case would swap on a
  direction change. (2) **Options that decide what is *compared* never change
  what is *emitted*** — ignoring case, ignoring a leading `The` (files *The
  Godfather* under G), or reading a number out of a line all build a sort key
  only; the only content changes are trimming, dropping blanks and removing
  duplicates, and each is counted in the UI. Blank-dropping is not cosmetic:
  nearly every pasted list ends in a newline, which code-point order would
  otherwise place as an empty first row. (3) **Lines with no number are held
  out of number mode** and appended in input order rather than given a value of
  zero and scattered through the result. Comma mode exists because a list
  pasted out of a sentence or a spreadsheet cell arrives as `banana, apple,
  cherry`. Comparators live in `components/tools/sortText.js` — **not**
  `sortLines.js`, which resolves to `SortLines.jsx` on a case-insensitive
  filesystem and silently imports the wrong module (caught as a build warning
  plus an `__next_error__` page, which is worth remembering as the failure
  signature) — so they run in node, where **26 assertions** cover them. Also
  driven end to end in a **real browser against the production build**: every
  mode, both directions, comma mode, dedupe counts, the `en`/`sv` collation
  difference, console clean. **Whitespace remover and HTML tag stripper remain
  unbuilt** and stay in this bullet's cluster

- **HTML entity encoder/decoder** (zero-dep via DOM) — sibling of URL Encoder/Base64
- ~~**Number base converter**~~ **SHIPPED 5 Sep 2026** (`/convert/base-converter`)
  — zero new deps. The whole reason it exists is that the one-line build of it
  is wrong: `parseInt(text, from).toString(to)` routes every value through an
  IEEE-754 double, which is exact for whole numbers only to 2^53, so
  `parseInt("FFFFFFFFFFFFFFFF", 16).toString(2)` answers with a **1 followed by
  64 zeros** where the answer is 64 ones — every bit wrong and one digit too
  long, because the value was rounded up to the next power of two on the way in.
  That range is most of what people actually paste into a base converter (64-bit
  hashes, snowflake IDs, checksums, 128-bit UUIDs), so the integer path is
  BigInt end to end. Fractions are exact rational arithmetic, not floats:
  `(0.1).toString(2)` prints a *terminating* 55-digit number, which is the
  expansion of the nearest double rather than of a tenth, and a tenth has no
  terminating binary form at all — here a fraction is a reduced BigInt
  numerator/denominator expanded by repeated multiplication, with a **repeated
  remainder** (not an iteration count) marking where the cycle starts, so 0.1
  renders `0.0(0011)`. Three smaller calls: a base prefix that disagrees with
  the selected base is an **error rather than a silent override** (`0x1F` at
  base 10 and at base 16 are both defensible readings, and guessing produces a
  wrong answer that looks right); two's complement is offered at 8/16/32/64 bits
  for negative whole numbers with an out-of-range width **reported rather than
  wrapped**; and the `0x` prefix stays lowercase while the digits uppercase,
  since every language prints `0xFF`. Logic lives in
  `components/tools/baseConvert.js` (the `sortText.js` pattern) — **538
  assertions** against Python's arbitrary-precision ints and exact `Fraction`
  arithmetic, each checked by a *different derivation* than the one that
  produced it: integer part vs Python's own int-to-base rendering, the printed
  text **read back as a Fraction** and required to equal the input exactly
  (closed form `(bc-b)/(B^(|b|+|c|) - B^|b|)` for a repeating expansion),
  termination vs the number-theoretic rule, and cycle length vs the
  multiplicative order of the base mod the denominator's base-coprime part. The
  same module then produced **byte-identical output in a real browser**
  (matching SHA-256 over all 538 cases) — dev servers are blocked in scheduled
  runs, so the component is covered by a clean static prerender instead.
  **text↔binary remains unbuilt** and stays in this bullet's cluster
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

**Tier A and Tier B are now fully shipped** (Tier A closed 16 Aug 2026, Tier B
closed 24 Aug 2026 with Extract Images from PDF; PDF to PNG was ruled out as a
duplicate rather than built). The daily-ship feature slot is now working
through **Tier C** — half-day pair completions that also generate guide topics.
JSON to YAML shipped 26 Aug, XML Formatter 27 Aug, the string escapers 30 Aug,
the cron expression explainer 1 Sep and the HTML Beautifier 4 Sep, which
**closes the FreeFormatter inheritance set** — XML formatter, string escapers,
cron tools and the HTML formatter are all now live, and that keyword pool is
the one actively losing its incumbent.
Sort Lines followed on 4 Sep, completing the Remove Duplicate Lines / Remove
Line Breaks cluster.
XML to JSON shipped 6 Sep on exactly that reasoning — `xmlFormat.js`'s tree
made it an emitter rather than a dependency. **JSON to XML is now the cheapest
remaining pair completion** (it needs an escaper and a name-validity check, not
a parser), with the HMAC/CRC32 bolt-on to Hash Generator next after it.
**Verification in scheduled runs, corrected again (6 Sep):** the 5 Sep note
below said a static server over `out/` works. It no longer does — `preview_start`
itself is refused in unattended runs whatever it would launch, so there is no
http origin available. What *does* work is `file://`: open a standalone page in
the Browser pane with the built chunk's modules inlined, and drive them there.
Two constraints, both learned the hard way: the pane rewrites the file into a
`data:` URL, so the page is an opaque origin, **not a secure context, and
`crypto.subtle` is undefined** — hash with a plain JS function; and a page much
over 500 KB will not open at all, so inline per-case hashes rather than a full
expected transcript. Prefer this over minified-bundle-only checks.
Tier D and the PDF-IMAGE-ROADMAP Tier 3–5 remainder sit behind it. Before heavy
investment in any single bet (e.g. per-exam programmatic pages), sanity-check
with 2–3 weeks of GSC data once the first pages index.
