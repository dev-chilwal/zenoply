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
- [x] Rotate / flip image (`rotate-image`) — shipped 26 Sep 2026. Quarter
      turns, 180°, horizontal/vertical flips and a free angle (slider plus a
      0.1° number field) with a corner choice: grow the canvas and fill the
      corners (transparent/white/custom), or crop to the largest upright
      rectangle inside the tilted picture (the two-regime max-area formula,
      floored so no background sliver shows). Flips act on what you see — a
      flip after a turn negates the angle — and flip pairs simplify to 180°.
      Right-angle turns switch smoothing off, so they are a lossless pixel
      shuffle. **Verified on the production build**: a 12-step rotate/flip
      sequence on an odd-sized 5x3 PNG with a unique colour per pixel matched
      an independent reference implementation pixel for pixel at every step;
      400x300 at 30° gives 496x460 expanded / 300x173 cropped with no fill
      pixel on the crop border; JPG default for JPG input. Geometry is in
      `imageRotate.js` (not `rotateImage.js` — case collision with the
      component) and node-tested.
- [x] Watermark image (`watermark-image`) — shipped 3 Oct 2026. Text or logo
      mark; a single mark at one of nine anchors (the *rotated* bounding box is
      kept inside the margin, so a tilted corner mark never pokes off the edge)
      or a tiled brick pattern rotated about the centre over a square as wide as
      the image diagonal, so it reaches every corner at any angle. Size, margin
      and spacing are fractions of the image, so the preview is the export
      pipeline at reduced scale. Geometry in `watermarkLayout.js` (case
      collision again) and node-tested: 20k random points inside the diagonal
      circle, 0 uncovered. **Verified on the production build**: single mark
      120px wide on a 400x300 (30%) with its right edge exactly at the 9px (3%)
      margin; tiled pattern hits all 48 50px cells; a red logo at 25% composites
      to exactly (102,76,115) over #336699; PNG and JPG downloads at original
      size; no overflow at 375px; console clean.
- [x] Meme generator (`meme-generator`) — shipped 4 Oct 2026. Bring-your-own
      picture (no template library, so no image licensing): classic top/bottom
      text in Impact with a black outline (all strokes drawn before all fills,
      so a line's outline never cuts into the line above), or a white caption
      bar above the picture that grows with the caption. Captions greedy-wrap
      (hard Enter breaks kept, over-long words broken by code point so emoji
      never split) and shrink in 4% steps until they fit — a third of the
      height per caption in classic mode, so top and bottom never meet — with
      a 2.5%-of-width floor and an on-page note when a caption can't fit.
      Missing Impact (Android/Linux/ChromeOS) is detected by width comparison
      and stated. Layout in `memeLayout.js` (case collision again), **2,505
      node assertions** incl. scale invariance of preview vs export.
      **Verified on the production build**: 800x600 JPG → top caption in rows
      43–114, bottom in 481–552, middle band untouched; overflow note fires on
      a 400-word caption; caption-bar download 800x825 PNG with the picture
      intact below the bar; JPG download 800x600 at q 0.92; no overflow at
      375px; console clean. **Tier 3 is now closed.**

## Tier 4 — format conversion via @jsquash (lowest-risk image expansion)

All 8 packages verified Apache-2.0 against the npm registry API, all
repackaged from Squoosh, all built for browser + Web Worker ✓.

- [x] WebP convert — shipped 10 Oct 2026 as `/image/webp-converter`
      (JPG/PNG/GIF/BMP/AVIF → WebP, lossy or lossless; WebP → PNG/JPG stays
      with Image Converter, since every browser decodes WebP natively).
      `@jsquash/webp` 1.5.0 (Apache-2.0): baseline `codec/enc/webp_enc.js`
      imported straight into a module worker like AVIF (skips encode.js's
      wasm-feature-detect); webpack self-hosts the 281 KB wasm, fetched on
      first Convert only. The reason to bundle an encoder at all: Safari's
      `toBlob("image/webp")` returns a PNG, and no browser exposes lossless.
      Lossless finding: libwebp keeps every pixel with alpha > 0 exactly
      (node round-trip, partial alpha included) and only rewrites colour
      under alpha 0; in the browser, opaque pixels are bit-exact but partly
      transparent ones come back ≤1 premultiplied level off because the
      canvas decode stores them premultiplied — the copy says so rather than
      claiming "every pixel". Verified on the production build: 2000×1054
      JPG 515.5 KB → 92.2/127.9/270.2 KB at q50/75/90, 1.49 MB lossless;
      logo PNG 19.8 → 4.6 KB lossless with alpha; no 375px overflow.
- [x] AVIF convert — shipped 9 Oct 2026 as `/image/avif-converter`
      (JPG/PNG/WebP/GIF/BMP → AVIF; AVIF → JPG/PNG stays with Image Converter,
      since every current browser decodes AVIF natively). `@jsquash/avif`
      2.1.1: `codec/enc/avif_enc.js` factory imported straight into a module
      worker (encode.js would pick the threaded build → needs COOP/COEP);
      webpack self-hosts the 3.4 MB wasm (~1.1 MB gz), fetched on first
      Convert only. Two findings: quality 100 is only exactly lossless at
      4:4:4 (4:2:0 changed pixels by up to 206), so subsample switches to 3
      there; and an effort control was dropped after measuring a real photo —
      speed 8 doubled the file, 4–5 cost 4.5–7.5× the time for 0–2%, so speed
      is fixed at 6. Verified on the production build (static server):
      batch, alpha kept, lossless pixel-exact, HEIC message, 375px.
- [x] PNG optimiser — shipped 6 Oct 2026 as `/image/compress-png` (slug
      chosen for the bigger keyword). `@jsquash/oxipng` 2.3.0, single-threaded
      codec imported directly into a module worker (the package's optimise.js
      switches to the rayon build inside a worker, which needs COOP/COEP);
      webpack emits the 164 KB wasm as a hashed same-origin asset. Lossless
      only — Fast/Better/Best = levels 2/3/4. Squoosh's build keeps every
      chunk, so metadata stripping (tEXt/zTXt/iTXt/tIME/eXIf; colour chunks
      always kept) is done in JS in `pngChunks.js`, which also pre-validates
      input because a Rust panic poisons the wasm instance (worker is replaced
      after any error) and refuses APNG. Verified on the production build:
      decoded pixels identical on 3 inputs, chunk lists checked in node, ZIP
      contents, no 375px overflow.
- Note: WebP↔PNG is already covered by Image Converter (canvas), so a
  separate `webp-to-png` page would duplicate a live tool; only AVIF remained
  genuinely new in this tier, and it shipped 9 Oct 2026 — Tier 4 is complete.

Caveats ✓: lazy-load/code-split codecs per format or the WASM bloats first
load (<100KB gzip initial is achievable). AVIF **encode** is CPU-heavy and slow
on mobile — decode is fine; prefer MozJPEG/WebP on speed-sensitive paths.
`@jsquash/oxipng` last published 2024-06-18 (~2yrs stale, though OxiPNG is
mature).

## Tier 5 — e-sign, but only half of it

Split confirmed ✓:

- [x] Sign PDF (`sign-pdf`) — shipped 5 Oct 2026. Draw (pointer-capture
      pad, midpoint-quadratic smoothing, undo/clear), type (Dancing Script /
      Great Vibes / Caveat self-hosted via next/font with preload off, and an
      explicit `document.fonts.load` before drawing — canvas silently falls back
      otherwise) or upload (paper made transparent by a luma threshold with a
      40-step alpha ramp so stroke edges do not fringe white). Every signature is
      trimmed to its ink. Placements are display-space fractions over a pdf.js
      preview — drag to move, corner to resize with the shape locked, "Add to
      every page" for initials — mapped through pdfCrop's `displayToPage` and
      drawn with `rotate = /Rotate`, so they land upright on rotated pages and
      on offset/cropped boxes. Warns when the file already has a certificate
      signature (`/ByteRange`), since pdf-lib's full re-save breaks it. Copy says
      plainly it is visual-only. Geometry in `pdfSign.js` (case collision
      again). **Verified**: 72 rotation x box x placement cases checked against
      real pdf.js operator lists (439 assertions; three mutations each fail
      104-192); on the production build, a mouse-drawn signature placed, moved
      and resized by real drags (fractions exact to the pixel), copied to a
      /Rotate 90 page with an offset MediaBox, and the downloaded bytes re-read in
      pdf.js matched the on-screen boxes on both pages, upright; typed (all three
      faces load) and uploaded (300x60 ink -> 312x72 with the paper alpha 0)
      paths checked; no overflow at 375px; console clean. Limitation: one
      signature image per pass (initials + full signature = two passes; the guide
      says so).
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
