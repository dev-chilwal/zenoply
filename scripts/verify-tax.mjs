// Multi-jurisdiction tax verification. Each engine in lib/tax/ is checked
// against its national revenue authority's own published worked examples.
// Run: npm run verify-tax
//
// Re-verify every year — tax years roll over on different dates (UK 6 Apr,
// India 1 Apr, Australia/Ireland vary), so a "stale but plausible" rate is the
// most likely error. A failing check here means an engine has drifted.
import { makeChecker } from "./tax-tests/harness.mjs";
import * as au from "./tax-tests/au.mjs";
import * as ie from "./tax-tests/ie.mjs";
import * as gb from "./tax-tests/gb.mjs";
import * as nl from "./tax-tests/nl.mjs";
import * as de from "./tax-tests/de.mjs";
import * as fr from "./tax-tests/fr.mjs";
import * as ae from "./tax-tests/ae.mjs";
import * as us from "./tax-tests/us.mjs";
import * as ca from "./tax-tests/ca.mjs";
import * as inIndia from "./tax-tests/in.mjs";
import * as sg from "./tax-tests/sg.mjs";

const MODULES = [inIndia, au, ie, gb, nl, de, fr, ae, us, ca, sg];

let totalPass = 0, totalFail = 0;
for (const mod of MODULES) {
  console.log(`\n== ${mod.label} ==`);
  const { check, state } = makeChecker(mod.label);
  mod.run(check);
  totalPass += state.pass;
  totalFail += state.fail;
  console.log(`   ${state.pass} passed, ${state.fail} failed`);
}

console.log(`\n${"=".repeat(40)}\nTOTAL: ${totalPass} passed, ${totalFail} failed\n`);
process.exit(totalFail ? 1 : 0);
