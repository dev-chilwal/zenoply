// Copies the pdf.js worker out of node_modules into public/ so the PDF tools can
// load it from our own origin. Runs from predev/prebuild, which keeps the copy
// locked to the installed pdfjs-dist — a stale worker fails loudly at runtime,
// because pdf.js refuses to talk to a worker whose version doesn't match its own.
//
// The copy is committed so a deploy that runs `next build` directly, without the
// npm lifecycle hooks, still ships a worker.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const pkg = require("pdfjs-dist/package.json");
const source = join(dirname(require.resolve("pdfjs-dist/package.json")), "build", "pdf.worker.min.mjs");
const target = join(root, "public", "pdf.worker.min.mjs");

mkdirSync(join(root, "public"), { recursive: true });
copyFileSync(source, target);

console.log(`pdf.worker.min.mjs ${pkg.version} → public/ (${readFileSync(target).length} bytes)`);
