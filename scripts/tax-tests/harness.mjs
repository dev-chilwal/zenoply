// Shared assertion harness for the per-jurisdiction tax checks.
// Each jurisdiction module exports `run(check)` and uses `check(name, got, want)`.

export function makeChecker(label) {
  const state = { pass: 0, fail: 0, label };
  function check(name, got, want, tol = 0.01) {
    const ok = Math.abs(got - want) <= tol;
    ok ? state.pass++ : state.fail++;
    console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`);
    if (!ok) console.log(`          got ${got}  want ${want}`);
  }
  return { check, state };
}
