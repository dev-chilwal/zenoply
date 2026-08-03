# PDF & Image Tools Roadmap

Research-backed plan to expand the PDF and image categories, keeping the
static-export, no-login, privacy-first architecture (everything runs
client-side; no backend, no paid APIs).

Provenance: deep-research run 2026-07-16 (24 sources, 25 claims adversarially
verified, 18 confirmed / 7 refuted). ✓ = 3-vote confirmed.
Competitors referenced: Stirling-PDF, iLovePDF, Smallpdf, PDF24, Sejda, Xodo,
iLoveIMG, ExamMint.

## Read this first — what the research could NOT establish

The research was asked to prioritise by **search demand vs build effort**. It
returned **zero verified search-volume data**. Every demand-adjacent claim was
refuted: ExamMint's self-reported "8.5 lakh users" (unaudited vendor marketing,
0-3) and the assertion that "signature resizer" / "signature compressor 20kb"
are the clearest keyword gaps (never evidenced with volume, 0-3).

**So the tiers below rank on build-effort, licensing risk and confirmed feature
gaps — NOT on demand.** Do not present or defend this ordering as
demand-driven. Before committing to anything past Tier 1, pull real volumes
from Ahrefs/Semrush/GSC, India-segmented.

Two more corrections worth carrying:

- We have **10** PDF tools, not 11. Earlier counts were wrong.
- **"Competitor ships it" is not feasibility evidence.** This trap recurred
  across nearly every claim. Stirling-PDF is a Java/Spring Docker server
  orchestrating LibreOffice, Tesseract and QPDF. Each candidate below is
  justified against a *specific client-side library*, or it is ruled out.

## Beliefs the verification killed — don't repeat these

- ~~"iLoveIMG processes server-side"~~ **REFUTED 0-3.** Their processing
  location was never established. Our "your file never leaves your device"
  line may be **parity, not a differentiator**, against the image market
  leader. Don't lean on that positioning in image-tool copy without fresh
  evidence. (It remains true and worth stating as a *fact*; just don't claim
  it beats iLoveIMG.)
- ~~"Stirling advertises 50+ PDF tools"~~ **REFUTED 0-3.** The docs say 50+
  *format conversions*. Never quote 50+ as a tool count.
- ~~"COOP/COEP cross-origin isolation would break our ad/analytics embeds"~~
  **REFUTED 0-3.** Not a blocker.
- ~~"Ezgif offers free background removal"~~ **REFUTED 0-3.**

## BLOCKER — pdf.js `page.render()` hung forever — RESOLVED 2026-07-18

Found 2026-07-16 while verifying Tier 1; fixed in commit "Fix pdf.js canvas
render hanging forever in background tabs" (branch
`claude/serene-taussig-de5347`), integrated 2026-07-18.

**Root cause was NOT minification — it was tab visibility.** pdf.js drives its
render loop with `requestAnimationFrame`, which browsers pause while a tab is
hidden. The preview pane renders in a hidden tab, so a render started there
never got a rAF tick — `render().promise` never settled and never threw. My
earlier "production/minification-specific" read was wrong: the real variable was
whether the tab was foregrounded (dev test happened to be; prod tests weren't).
This matches the existing memory note [[pdfjs-render-raf-gotcha]].

The fix (`components/tools/pdfjs.js`, now the canonical loader for all 6 pdf.js
tools):
- Self-hosts the worker from `/public/pdf.worker.min.mjs`
  (`scripts/copy-pdf-worker.mjs` runs on predev/prebuild, keeping it version-
  locked to the installed pdfjs-dist). No more cdnjs — a third party in the path
  contradicts the "files never leave the browser" promise.
- `renderPage(page, params)` swaps `requestAnimationFrame` for a MessageChannel
  scheduler (not `setTimeout` — hidden tabs clamp timers to ~1/sec; postMessage
  isn't throttled) only while a render is in flight, plus a 120s watchdog that
  throws `PdfRenderTimeoutError` so a future stall surfaces as a visible error
  instead of a spinner.

Verified on the **production build** (`next build` + serve `out/`), which is
where the bug reproduced:
- `pdf-to-jpg`: was hung forever → now "Done — 6 images downloaded".
- `organize-pdf`: all 6 thumbnails render in ~1s.
- `remove-blank-pages`: scans in ~1s, correctly flags pages 3 & 5.

Hypotheses tested and REJECTED during diagnosis (kept as a record):
- ~~`willReadFrequently: true`~~ — removing it changed nothing.
- ~~worker fails to load~~ — worker loaded and parsing worked all along.
- ~~minification~~ — the real cause was rAF pause in hidden tabs.

**Lesson, now permanent: verify pdf.js work against `next build` + `out/` with
the preview tab, never `next dev` — dev with a focused tab hides this class of
bug.**

## Tier 1 — PDF page operations (quick wins, pure pdf-lib, no new deps)

Confirmed gap vs Stirling's Page Operations ✓. All are page-tree manipulation
via pdf-lib (MIT), reusing the existing `PdfDropzone` + `parseRanges` pattern.
pdf-lib and pdfjs-dist are already dependencies — these cost zero bundle weight.

- [x] Add page numbers (`add-page-numbers`) — position, start-at, format,
      font size, skip-cover; pdf-lib `drawText`.
      **Verified on the production build**: all 6 pages stamped "Page 1 of 6"
      … "Page 6 of 6", confirmed by reading the output back with pdf.js.
- [x] Remove pages (`remove-pages`) — inverse of split: delete the selected
      pages, keep the rest, with a live "N will remain" counter.
      **Verified on the production build**: removing "2, 4-5" from a 6-page
      file left source pages 1, 3, 6.
- [x] Organize / reorder pages (`organize-pdf`) — thumbnail grid, move
      earlier/later, reverse, remove; pdf-lib `copyPages` in the new order.
      **Verified on the production build**: 6 thumbnails render in ~1s;
      reversed order 6,5,4,3,1,2 and the output PDF's per-page text matched
      exactly.
- [x] Remove blank pages (`remove-blank-pages`) — pdf.js render + ink-ratio
      detection (2% border crop, three sensitivity levels), shows every
      detected page with a thumbnail and a tick so nothing is auto-deleted.
      **Verified on the production build**: scans a 6-page file in ~1s, flags
      exactly the two blank pages, and the output correctly kept pages
      1, 2, 4, 6.

All four are verified end-to-end on the production build and ready to ship —
the pdf.js render blocker that held back organize-pdf and remove-blank-pages
is resolved (see above).

**NOT extract-pages.** `split-pdf` already *is* extract-pages — its button
reads "Extract pages" and its FAQ describes extracting pages/ranges into a new
PDF. The research flagged it as a gap by diffing slug names against Stirling's,
not by reading our tool. Building it would cannibalise our own page.

Stirling's Page Operations category actually holds ~24 tools ✓ — crop, overlay,
booklet imposition, page size/scale, multi-page layout, edit ToC. The four
above are the highest-value slice, not the whole gap.

## Tier 2 — OCR (the single highest-value gap)

Market-standard across **every** major competitor — confirmed n=5 (iLovePDF,
Smallpdf, PDF24, Sejda, Xodo) ✓. And self-inflicted: `lib/guides.js` at lines
1275, 1300 and 1335 already tells readers "you would first need OCR". **We are
actively routing our own traffic away for want of the tool.**

- [x] Image to text / OCR (`image-to-text`) — image category. Upload photo/
      screenshot/scan → editable text, copy or download .txt. English, Hindi,
      or both.
      **Verified on the production build**: OCR of a canvas-drawn image
      returned an exact match including numbers and symbols ("Invoice #4815
      total: $162.30"); language-switch recreates the worker; copy/download work.
- [x] Searchable scanned PDF (`ocr-pdf`) — PDF category. Renders each page,
      OCRs it, and rebuilds a PDF with an invisible, selectable text layer
      (tesseract's own PDF renderer positions the text; pdf-lib merges pages).
      **Verified on the production build**: a 6-page file became a 6-page
      searchable PDF in ~12s; extracting text from the output returned the
      correct words on content pages and nothing on the two blank pages.

Implementation notes (as built):

- **Both constraints honoured.** tesseract.js's `createWorker` already defaults
  to `OEM.LSTM_ONLY` (1), which also selects the LSTM-only core (~3.7MB) and the
  `_best_int` language files — so we never touch the 10-20MB legacy path. On
  worker count: rather than a 4-worker scheduler, each tool uses **one** worker
  processing pages sequentially — one worker is inherently bounded, which is the
  point of the "never spawn unbounded workers" guidance. A scheduler pool is a
  future speed optimisation for `ocr-pdf` on long documents, not a correctness
  need.
- **Everything is self-hosted** (`scripts/copy-tesseract-assets.mjs`,
  `components/tools/tesseract.js`): worker + SIMD-LSTM core + eng/hin
  `.traineddata.gz` copied from node_modules into `/public` on predev/prebuild
  and committed, exactly like the pdf.js worker. Verified: zero external
  requests during OCR (no jsdelivr), so the privacy claim holds for the engine
  and language data too, not just the user's file. ~8MB of committed assets.
- **Languages: English + Hindi** (India focus). Adding more is one line in
  `OCR_LANGS` plus the language in the copy script's asset list.
- Hard boundary ✓ still stands: Tesseract does **text only — no table-structure
  recognition**, so it can't feed `pdf-to-excel`. Not promised anywhere.

Both tools are verified end-to-end and ready to ship.

## Tier 3 — image quick wins

Confirmed gap ✓: iLoveIMG ships 13 image tools to our 4; nine have no Zenoply
equivalent. These four are the cheap end — plain Canvas, no new deps.

- [x] Crop image (`crop-image`) — drag-or-type selection over a live preview:
      eight resize grips plus drag-to-move, X/Y/W/H fields in source pixels
      kept in sync with the box, aspect presets (Free, 1:1, 4:3, 3:2, 16:9,
      3:4, 2:3, 9:16) that fit the largest box of that shape and hold the
      ratio while dragging, PNG or JPG out. Plain Canvas `drawImage` with the
      9-argument source-rect form — no new deps. Drag uses pointer capture
      rather than window listeners added in an effect, so no move is lost
      between pointerdown and the first move.
      **Verified on the production build**: cropping (100,100,40,40) out of a
      400×300 test image returns a 40×40 PNG that is entirely the planted
      black marker, and a crop straddling both quadrant midlines puts the
      boundary exactly between local x=19 and x=20 — no off-by-one. Presets
      fit as expected (1:1 → 300×300 at x=50, 16:9 → 400×225 at y=38,
      9:16 → 169×300 at x=116); an NW-handle drag holds the opposite edges
      ([0,0,220,180] + (50,40) → [50,40,170,140]); the box clamps in bounds.
- [ ] Rotate / flip image (`rotate-image`)
- [ ] Watermark image (`watermark-image`)
- [ ] Meme generator (`meme-generator`)

## Tier 4 — format conversion via @jsquash (lowest-risk image expansion)

All 8 packages verified Apache-2.0 against the npm registry API, all
repackaged from Squoosh, all built for browser + Web Worker ✓.

- [ ] WebP to PNG / PNG to WebP (`webp-to-png`)
- [ ] AVIF convert (`avif-converter`)
- [ ] PNG optimiser (`png-optimizer`) — `@jsquash/oxipng`

Caveats ✓: lazy-load/code-split codecs per format or the WASM bloats first
load (<100KB gzip initial is achievable). AVIF **encode** is CPU-heavy and slow
on mobile — decode is fine; prefer MozJPEG/WebP on speed-sensitive paths.
`@jsquash/oxipng` last published 2024-06-18 (~2yrs stale, though OxiPNG is
mature).

## Tier 5 — e-sign, but only half of it

Split confirmed ✓:

- [ ] Sign PDF (`sign-pdf`) — canvas-drawn / typed / uploaded signature,
      stamped via pdf-lib. **Tractable.**
- [ ] ~~Certificate signing & signature validation~~ — **SKIP.** X.509,
      PKCS#12, AATL/EUTL trust lists, eIDAS, revocation checking. Not
      realistically client-side.

Stirling's docs draw the line for us: visual signatures are "visual only, can
be copied" and "do not provide authentication, tamper protection, or
guaranteed legal standing" ✓. Say so plainly in the copy — don't imply legal
weight we can't deliver.

## Ruled out — with reasons

- **Word/Excel/PPT → PDF.** Real gap, effectively uncloseable ✓. Stirling
  delivers these via a **server-side LibreOffice + unoserver instance pool** —
  precisely the architecture our constraint forbids. Acceptable fidelity needs
  a LibreOffice-grade layout engine.
  - **Exception: `pdf-to-ppt`.** Runs the other direction; needs only PPTX
    OOXML generation, which we already hand-roll for DOCX/XLSX. Worth
    prototyping — fidelity ceiling unknown given pdf.js's synthetic-whitespace
    behaviour.
- **MuPDF / mupdf-wasm and Ghostscript-WASM.** Artifex dual-licenses AGPLv3 or
  paid commercial ✓; npm `mupdf` is AGPL-3.0-or-later across *every* version,
  no permissive period. mupdf.js README: the licence covers "both the
  JavaScript wrapper and the underlying MuPDF WebAssembly binary" ✓.
  **Honest framing: disproportionate to the benefit, not legally impossible** —
  and it rests on an unverified premise that this repo is closed-source. pdf.js
  (Apache 2.0) + pdf-lib (MIT) cover the same ground unencumbered, so nothing
  is lost. If citing this: the artifex.com "server-based application" line is
  the **wrong clause** for a static site — cite the mupdf.js distribution
  trigger instead.
  - Research signal: Stirling V2 ships browser-side **pdfium.wasm** ✓ — worth
    evaluating as a rendering path alongside pdf.js.
- **`@imgly/background-removal`.** The biggest trap on the list ✓. AGPL (grep
  of the 650-line LICENSE.md found zero carve-outs) **and** a real default
  first-run payload measured at byte level from their CDN manifest of
  **~100-111MB** (default `isnet_fp16` = 88.2MB + ONNX runtime 11.8MB). Their
  documented "~80MB" *understates* it.
  - If background removal is ever built: MIT `onnxruntime-web` + Apache-2.0
    U2-Net/MODNet weights. **Explicitly exclude RMBG-1.4 — CC BY-NC**,
    commercial use needs a BRIA agreement.
  - Re-measure before deciding: @imgly moved 1.5.8→1.7.0 two days before the
    check.
- **HTML to image.** Needs a headless-browser render server.
- **ffmpeg.wasm video tools.** 24-25x slower than native single-threaded;
  core-mt only halves it to ~12x while adding a ~32MB payload and documented
  instability ✓. Video-to-GIF and video-compress both re-encode → slow by
  default.
  - **Exception: video trim** — `-ss/-to -c copy` is a stream copy, I/O-bound,
    outside that benchmark.
  - Caveat: the benchmark is 2023-era (Chrome 116); read 24-25x as a current
    order-of-magnitude, not a fresh 2026 measurement. Nothing has shipped since
    Jan 2025.

## India exam-form niche — feasible, but occupied

Feasibility **proven** by a live incumbent (ExamMint), verified at code level
rather than from marketing copy ✓: Astro static build, canvas
`getContext`/`drawImage`/`toBlob` + WASM SIMD with canvas fallback, and **zero**
`fetch`/`XMLHttpRequest`/`FormData`/`sendBeacon` across the image-processing
chunks.

But the same evidence is a **competitive warning, not just validation**: they
ship 100+ exam presets (UPSC/SSC/NEET/JEE/IBPS/KPSC), dedicated per-exam SEO
URLs, signature resizing, and they already run the identical "never leaves your
device" privacy pitch. Both demand claims about this niche were refuted 0-3.

Verdict: **feasible, unproven demand, incumbent entrenched.** Needs real
keyword data before investment.

## Open questions

1. **Actual search volumes** — the core prioritisation question is still
   unanswered. Needed from Ahrefs/Semrush/GSC, India-segmented.
2. **Unevaluated libraries from the brief**, never assessed at all: jsQR /
   qrcode.js, exifr / piexifjs, heic2any / libheif-wasm, ICO encoding,
   browser-image-compression, gif.js, PNG-to-SVG vectorisation
   (imagetracerjs / potrace-wasm). **`heic-to-jpg` looks like an unexamined
   quick win.**
3. **Is this repo closed-source?** The entire AGPL blocker turns on it, and it
   was never established. If we're willing to go AGPL, mupdf-wasm and
   Ghostscript-WASM return to the table.
4. **Is there a materially smaller Apache/MIT segmentation model** than the
   44-88MB isnet tier — and does a lazy-loaded ~40MB first run convert
   acceptably on Indian mobile? Go/no-go needs real conversion data, not just
   the payload number.
5. **pdf-to-ppt fidelity ceiling** given pdf.js synthetic whitespace and
   Tesseract's lack of table recognition. Prototype before committing.
