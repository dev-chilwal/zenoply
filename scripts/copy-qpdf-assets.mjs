// Copies the qpdf wasm binary out of node_modules into public/ so the PDF
// password gate can load it from our own origin (same reasoning as the pdf.js
// worker: no CDN in the path of tools that promise files never leave the
// browser, and the copy stays locked to the installed package version).
//
// The JS glue is bundled by webpack via the normal import; only the .wasm is
// fetched at runtime, from the URL pdfCrypto.js passes to locateFile.
//
// The copy is committed so a deploy that runs `next build` directly, without
// the npm lifecycle hooks, still ships the binary.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const pkg = require("@neslinesli93/qpdf-wasm/package.json");
const source = join(dirname(require.resolve("@neslinesli93/qpdf-wasm/package.json")), "dist", "qpdf.wasm");
const target = join(root, "public", "qpdf.wasm");

mkdirSync(join(root, "public"), { recursive: true });
copyFileSync(source, target);

console.log(`qpdf.wasm ${pkg.version} → public/ (${readFileSync(target).length} bytes)`);
