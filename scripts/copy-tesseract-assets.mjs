// Copies the tesseract.js runtime assets out of node_modules into public/ so the
// OCR tools load everything from our own origin: the user's image is processed
// entirely in the browser, and — unlike the default jsdelivr CDN paths — the
// worker, WASM core and language data never involve a third party either.
//
// Runs from predev/prebuild and the copies are committed, so a deploy that runs
// `next build` directly (without the npm lifecycle hooks) still ships them.
// Mirrors scripts/copy-pdf-worker.mjs.
//
// Only the SIMD LSTM core is shipped: every browser we target has WebAssembly
// SIMD in 2026, and staying LSTM-only (OCR engine mode 1) keeps the core at
// ~3.7MB and the language files at their `_best_int` sizes rather than the
// 10-20MB the legacy engine would pull. See PDF-IMAGE-ROADMAP.md, Tier 2.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const resolvePkgDir = (pkg) => dirname(require.resolve(`${pkg}/package.json`));

// [source absolute path, destination relative to public/]
const assets = [
  [join(resolvePkgDir("tesseract.js"), "dist", "worker.min.js"), "tesseract/worker.min.js"],
  [join(resolvePkgDir("tesseract.js-core"), "tesseract-core-simd-lstm.wasm.js"), "tesseract/tesseract-core-simd-lstm.wasm.js"],
  [join(resolvePkgDir("@tesseract.js-data/eng"), "4.0.0_best_int", "eng.traineddata.gz"), "tessdata/eng.traineddata.gz"],
  [join(resolvePkgDir("@tesseract.js-data/hin"), "4.0.0_best_int", "hin.traineddata.gz"), "tessdata/hin.traineddata.gz"],
];

let total = 0;
for (const [source, dest] of assets) {
  const target = join(root, "public", dest);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
  const bytes = readFileSync(target).length;
  total += bytes;
  console.log(`tesseract: ${dest} (${(bytes / 1048576).toFixed(2)} MB)`);
}
console.log(`tesseract assets → public/ (${(total / 1048576).toFixed(2)} MB total)`);
