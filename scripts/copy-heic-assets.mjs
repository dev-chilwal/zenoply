// Copies the heic-to bundle out of node_modules into public/ so the HEIC
// converter loads it from our own origin (same reasoning as the pdf.js worker
// and qpdf.wasm: no CDN in the path of a tool that promises files never leave
// the browser), and — importantly here — so it stays a separate, replaceable
// file rather than being folded into our webpack output.
//
// That separation is a licence requirement, not a preference. heic-to bundles
// libheif and is LGPL-3.0, while the rest of the site is not; shipping it as a
// standalone script that the page loads at runtime keeps the combination in
// LGPL 3 §4's "use a suitable shared library mechanism" territory, and lets
// anyone swap in their own build of the library by replacing this one file.
// The LICENCE text ships next to it so the terms travel with the code.
//
// The CSP build is the one we ship: it wraps libheif compiled with Emscripten's
// DYNAMIC_EXECUTION=0, so nothing in the decode path needs eval/new Function.
// Same API and same decoder as the default build, one kilobyte smaller.
//
// The wasm is base64-inlined inside this single 3 MB file by upstream — there
// is no separate .wasm to copy. It is fetched only when someone actually
// converts a HEIC (see components/tools/heic.js), never on page load.
//
// The copy is committed so a deploy that runs `next build` directly, without
// the npm lifecycle hooks, still ships the library.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// heic-to's "exports" map does not expose ./package.json, so the package root
// is derived from the resolved entry point (<root>/dist/heic-to.js) and the
// manifest is read off disk rather than imported.
const pkgDir = dirname(dirname(require.resolve("heic-to")));
const pkg = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
const outDir = join(root, "public", "heic");

mkdirSync(outDir, { recursive: true });

const bundle = join(outDir, "heic-to.js");
copyFileSync(join(pkgDir, "dist", "csp", "heic-to.js"), bundle);
copyFileSync(join(pkgDir, "LICENSE"), join(outDir, "LICENSE.txt"));

console.log(`heic-to ${pkg.version} (csp build) → public/heic/ (${readFileSync(bundle).length} bytes + LICENSE)`);
