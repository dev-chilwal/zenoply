"use client";
import { useMemo, useRef, useState } from "react";
import { Segmented, Field, Rows, Row } from "@/components/calc/Calc";

/*
 * Boards and universities do not share one CGPA-to-percentage rule, so every
 * preset here names the formula it applies (visible in the dropdown label and
 * echoed in the working) rather than hiding it behind an institution name.
 * Anything not listed is served by the custom multiplier instead of a guess.
 */
const FORMULAS = [
  {
    id: "cbse",
    label: "CBSE / CISCE — CGPA x 9.5",
    expr: "Percentage = CGPA x 9.5",
    reverse: "CGPA = Percentage / 9.5",
    toPct: (c) => c * 9.5,
    toCgpa: (p) => p / 9.5,
    note:
      "CBSE derived the 9.5 multiplier from the average marks of students in its top grade band (91-100), whose grade point is 10. A perfect 10.0 therefore maps to 95%, not 100%.",
  },
  {
    id: "x10",
    label: "Standard 10-point — CGPA x 10",
    expr: "Percentage = CGPA x 10",
    reverse: "CGPA = Percentage / 10",
    toPct: (c) => c * 10,
    toCgpa: (p) => p / 10,
    note:
      "The plain multiplier used by many 10-point universities and autonomous colleges: the CGPA maps straight onto 0-100.",
  },
  {
    id: "vtu",
    label: "VTU — (CGPA - 0.75) x 10",
    expr: "Percentage = (CGPA - 0.75) x 10",
    reverse: "CGPA = (Percentage / 10) + 0.75",
    toPct: (c) => (c - 0.75) * 10,
    toCgpa: (p) => p / 10 + 0.75,
    note:
      "VTU subtracts a 0.75 offset before scaling, so a 10.0 CGPA maps to 92.5% and a CGPA below 0.75 has no meaningful percentage.",
  },
  {
    id: "custom",
    label: "Custom multiplier",
    note:
      "Use the multiplier printed on your own marksheet or in your university's grading regulations. On a 4-point scale the equivalent multiplier is 25.",
  },
];

const DEFAULT_ROWS = [
  { name: "Subject 1", gp: 9, cr: 4 },
  { name: "Subject 2", gp: 8, cr: 4 },
  { name: "Subject 3", gp: 7, cr: 3 },
  { name: "Subject 4", gp: 9, cr: 2 },
  { name: "Subject 5", gp: 10, cr: 2 },
];

const n2 = (n) => (Number.isFinite(n) ? n.toFixed(2) : "—");
// Grade points and credits are entered freely, so treat "" and junk as skipped
// rather than as zero — a blank row must not drag the weighted average down.
const num = (v) => {
  const n = Number(String(v).trim());
  return String(v).trim() === "" || !Number.isFinite(n) ? NaN : n;
};

export default function CgpaToPercentage() {
  const [mode, setMode] = useState("toPct"); // toPct | toCgpa | fromGrades
  const [fid, setFid] = useState("cbse");
  const [mult, setMult] = useState("9.5");
  const [cgpaIn, setCgpaIn] = useState("8.2");
  const [pctIn, setPctIn] = useState("77.9");

  const nextId = useRef(DEFAULT_ROWS.length);
  const [rows, setRows] = useState(DEFAULT_ROWS.map((r, i) => ({ ...r, id: i })));

  const setRow = (id, key, value) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  const addRow = () =>
    setRows((rs) =>
      rs.length >= 20 ? rs : [...rs, { id: nextId.current++, name: `Subject ${rs.length + 1}`, gp: "", cr: "" }]
    );
  const removeRow = (id) => setRows((rs) => (rs.length <= 1 ? rs : rs.filter((r) => r.id !== id)));

  const m = num(mult);
  const conv = useMemo(() => {
    if (fid !== "custom") return FORMULAS.find((f) => f.id === fid);
    const ok = Number.isFinite(m) && m > 0;
    const shown = ok ? String(m) : "?";
    return {
      ...FORMULAS.find((f) => f.id === "custom"),
      expr: `Percentage = CGPA x ${shown}`,
      reverse: `CGPA = Percentage / ${shown}`,
      toPct: (c) => (ok ? c * m : NaN),
      toCgpa: (p) => (ok ? p / m : NaN),
    };
  }, [fid, m]);

  // Credit-weighted average: the same arithmetic serves SGPA (grade points per
  // subject in one semester) and CGPA (SGPA per semester weighted by credits).
  const grades = useMemo(() => {
    let pts = 0;
    let credits = 0;
    let counted = 0;
    for (const r of rows) {
      const gp = num(r.gp);
      const cr = num(r.cr);
      if (!Number.isFinite(gp) || !Number.isFinite(cr) || cr <= 0) continue;
      pts += gp * cr;
      credits += cr;
      counted += 1;
    }
    return { pts, credits, counted, cgpa: credits > 0 ? pts / credits : NaN };
  }, [rows]);

  const { cgpa, pct } = useMemo(() => {
    if (mode === "toCgpa") {
      const p = num(pctIn);
      return { cgpa: Number.isFinite(p) ? conv.toCgpa(p) : NaN, pct: p };
    }
    const c = mode === "fromGrades" ? grades.cgpa : num(cgpaIn);
    return { cgpa: c, pct: Number.isFinite(c) ? conv.toPct(c) : NaN };
  }, [mode, cgpaIn, pctIn, conv, grades.cgpa]);

  // Only meaningful when the CGPA is itself on a 10-point scale. A custom
  // multiplier may describe any scale (25 means a 4-point CGPA), so rescaling
  // by /10 there would report a 3.2/4.0 GPA as 1.28.
  const tenPoint = fid !== "custom";
  const gpa4 =
    tenPoint && Number.isFinite(cgpa) && cgpa >= 0 && cgpa <= 10 ? (cgpa / 10) * 4 : NaN;

  const warnings = [];
  if (Number.isFinite(cgpa) && (cgpa < 0 || cgpa > 10))
    warnings.push(`A CGPA of ${n2(cgpa)} sits outside the usual 0-10 scale — check the input and the formula.`);
  if (Number.isFinite(pct) && (pct < 0 || pct > 100))
    warnings.push(`${n2(pct)}% is outside 0-100, which means this formula does not fit the CGPA you entered.`);
  if (fid === "custom" && !(Number.isFinite(m) && m > 0))
    warnings.push("Enter a custom multiplier greater than zero.");
  if (mode === "fromGrades" && grades.counted === 0)
    warnings.push("Add at least one row with a grade point and a credit value above zero.");

  return (
    <div>
      <Segmented
        ariaLabel="Conversion direction"
        value={mode}
        onChange={setMode}
        options={[
          { value: "toPct", label: "CGPA → Percentage" },
          { value: "toCgpa", label: "Percentage → CGPA" },
          { value: "fromGrades", label: "Grades → CGPA" },
        ]}
      />

      <Field label="Conversion formula">
        <select className="inp" value={fid} onChange={(e) => setFid(e.target.value)}>
          {FORMULAS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
      </Field>

      {fid === "custom" && (
        <label className="field">
          <span className="field-label">Multiplier</span>
          <input
            className="inp mono" type="number" inputMode="decimal" step="0.1" min="0"
            value={mult} onChange={(e) => setMult(e.target.value)} placeholder="9.5"
          />
        </label>
      )}

      {mode === "toPct" && (
        <label className="field">
          <span className="field-label">CGPA (0 to 10)</span>
          <input
            className="inp mono" type="number" inputMode="decimal" step="0.01" min="0" max="10"
            value={cgpaIn} onChange={(e) => setCgpaIn(e.target.value)} placeholder="8.2"
          />
        </label>
      )}

      {mode === "toCgpa" && (
        <label className="field">
          <span className="field-label">Percentage (0 to 100)</span>
          <input
            className="inp mono" type="number" inputMode="decimal" step="0.01" min="0" max="100"
            value={pctIn} onChange={(e) => setPctIn(e.target.value)} placeholder="77.9"
          />
        </label>
      )}

      {mode === "fromGrades" && (
        <>
          <p className="muted small" style={{ marginTop: "1rem" }}>
            Enter one row per subject to get an SGPA for a single semester, or one row per
            semester to get the overall CGPA. Grade points come from your grade card&rsquo;s
            letter-to-point table (O = 10, A+ = 9, and so on at most universities).
          </p>
          <div className="gp-rows">
            <div className="gp-head" aria-hidden="true">
              <span>Subject / semester</span>
              <span className="r">Grade point</span>
              <span className="r">Credits</span>
              <span />
            </div>
            {rows.map((r, i) => (
              <div className="gp-row" key={r.id}>
                <input
                  className="inp" value={r.name} aria-label={`Row ${i + 1} name`}
                  onChange={(e) => setRow(r.id, "name", e.target.value)}
                />
                <input
                  className="inp mono r" type="number" inputMode="decimal" step="0.01" min="0" max="10"
                  value={r.gp} aria-label={`Row ${i + 1} grade point`}
                  onChange={(e) => setRow(r.id, "gp", e.target.value)}
                />
                <input
                  className="inp mono r" type="number" inputMode="decimal" step="0.5" min="0"
                  value={r.cr} aria-label={`Row ${i + 1} credits`}
                  onChange={(e) => setRow(r.id, "cr", e.target.value)}
                />
                <button
                  type="button" className="gp-del" onClick={() => removeRow(r.id)}
                  disabled={rows.length <= 1} aria-label={`Remove row ${i + 1}`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="btn-row">
            <button type="button" className="btn-sm" onClick={addRow} disabled={rows.length >= 20}>
              Add row
            </button>
          </div>
        </>
      )}

      <div className="stat-grid" style={{ marginTop: "1.5rem" }}>
        <div className="stat">
          <span className="stat-num">{n2(cgpa)}</span>
          <span className="stat-label">CGPA</span>
        </div>
        <div className="stat">
          <span className="stat-num">{Number.isFinite(pct) ? `${n2(pct)}%` : "—"}</span>
          <span className="stat-label">Percentage</span>
        </div>
        <div className="stat">
          <span className="stat-num">{n2(gpa4)}</span>
          <span className="stat-label">
            {tenPoint ? "GPA (4.0 scale)" : "GPA (needs a 10-point CGPA)"}
          </span>
        </div>
      </div>

      <Rows>
        {mode === "fromGrades" && (
          <>
            <Row label="Grade points x credits" val={n2(grades.pts)} />
            <Row label="Total credits" val={n2(grades.credits)} />
            {/* Keep the working in the label and the value short: .result-val is
                word-break:break-all for long hashes, so a wide label squeezing a
                wide value shreds the expression one character per line. */}
            <Row
              label={`CGPA = ${n2(grades.pts)} / ${n2(grades.credits)}`}
              val={n2(grades.cgpa)}
              highlight
            />
          </>
        )}
        <Row label="Formula applied" val={mode === "toCgpa" ? conv.reverse : conv.expr} />
        <Row
          label="Working"
          val={
            mode === "toCgpa"
              ? `${n2(pct)}% → ${n2(cgpa)} CGPA`
              : `${n2(cgpa)} CGPA → ${n2(pct)}%`
          }
          highlight
        />
      </Rows>

      {warnings.map((w) => (
        <p className="error" key={w}>{w}</p>
      ))}

      <p className="muted small" style={{ marginTop: "1rem" }}>
        {conv.note}
      </p>
      <p className="muted small">
        The 4.0-scale figure is a straight linear map (CGPA / 10 x 4) shown for reference only, and
        only for a 10-point CGPA. Credential evaluators such as WES and individual admissions
        offices apply their own grade tables, so use the number on their conversion, not this one,
        for applications. Conversion
        rules differ by board and university — always check your marksheet or academic regulations
        first, and pick &ldquo;Custom multiplier&rdquo; if yours is not listed.
      </p>
    </div>
  );
}
