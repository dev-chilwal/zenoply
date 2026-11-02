// Rasterise public/icon.svg into the site's favicon set. Run by hand after
// changing the mark (needs librsvg's `rsvg-convert` on PATH); the outputs are
// committed, so the build does not depend on it.
//
//   public/favicon.ico          16 + 32 + 48 (tab strip, Windows, Google SERP)
//   public/apple-touch-icon.png 180, full bleed: iOS rounds the corners itself
//   public/icon-512.png         512, the Organization logo in the homepage JSON-LD
//
// Rasters use the light palette only: a PNG cannot follow prefers-color-scheme,
// and an ink square with a cream glyph reads on both light and dark tab strips.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { buildIco } from "../components/tools/favicon.js";

const root = new URL("../public/", import.meta.url);
const svg = readFileSync(new URL("icon.svg", root), "utf8");
const light = svg.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*\s*\}/, "");
const fullBleed = light.replace(' rx="9"', "");

const dir = mkdtempSync(join(tmpdir(), "zenoply-icons-"));
function png(source, size) {
  const src = join(dir, `src-${size}.svg`);
  writeFileSync(src, source);
  return new Uint8Array(execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), src]));
}

writeFileSync(
  new URL("favicon.ico", root),
  buildIco([16, 32, 48].map((size) => ({ size, png: png(light, size) })))
);
writeFileSync(new URL("apple-touch-icon.png", root), png(fullBleed, 180));
writeFileSync(new URL("icon-512.png", root), png(light, 512));
console.log("Wrote favicon.ico, apple-touch-icon.png, icon-512.png");
