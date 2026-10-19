"use client";
import { useEffect, useMemo, useState } from "react";
import { Field, Segmented, Rows, Row } from "@/components/calc/Calc";
import { downloadBytes } from "./PdfDropzone";
import {
  MONTHS, MAX_MONTHS, PAN_THRESHOLD, STAMP_THRESHOLD, PAN_RE,
  buildSchedule, financialYearOf, fmtDate, fmtRupees, receiptSentence,
  normaliseText, buildReceiptPdf,
} from "./rentReceipts";

const MODES = [
  { value: "Cash", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "bank transfer", label: "Bank transfer" },
  { value: "cheque", label: "Cheque" },
];
const EVERY = [
  { value: 1, label: "Monthly" },
  { value: 3, label: "Quarterly" },
  { value: 0, label: "One for the period" },
];

function MonthPicker({ label, y, m, onChange, years }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="month-pick">
        <select className="inp" value={m} aria-label={`${label} month`}
          onChange={(e) => onChange(y, Number(e.target.value))}>
          {MONTHS.map((name, i) => <option key={name} value={i}>{name}</option>)}
        </select>
        <select className="inp" value={y} aria-label={`${label} year`}
          onChange={(e) => onChange(Number(e.target.value), m)}>
          {years.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
        </select>
      </span>
    </label>
  );
}

export default function RentReceiptGenerator() {
  const [tenant, setTenant] = useState("");
  const [landlord, setLandlord] = useState("");
  const [address, setAddress] = useState("");
  const [pan, setPan] = useState("");
  const [rent, setRent] = useState("20000");
  const [mode, setMode] = useState("bank transfer");
  const [every, setEvery] = useState(1);
  const [payDay, setPayDay] = useState(1);
  const [startNo, setStartNo] = useState(1);
  // Fixed until mount so the prerendered HTML and hydration agree; the
  // effect below moves it to the financial year the visitor is actually in.
  const [period, setPeriod] = useState({ fromY: 2026, fromM: 3, toY: 2027, toM: 2 });
  const [thisYear, setThisYear] = useState(2026);
  const [stampOverride, setStampOverride] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const now = new Date();
    setThisYear(now.getFullYear());
    setPeriod(financialYearOf(now.getFullYear(), now.getMonth()));
  }, []);

  const years = useMemo(() => {
    const lo = Math.min(thisYear - 3, period.fromY, period.toY);
    const hi = Math.max(thisYear + 2, period.fromY, period.toY);
    return Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  }, [thisYear, period]);

  const rentNum = Number(String(rent).replace(/[,\s₹]/g, ""));
  const sched = useMemo(
    () => buildSchedule({ ...period, rent: rentNum, every, payDay, startNo }),
    [period, rentNum, every, payDay, startNo]
  );

  const largest = sched.receipts ? Math.max(...sched.receipts.map((r) => r.amount)) : 0;
  const stampDefault = mode === "Cash" && largest > STAMP_THRESHOLD;
  const stamp = stampOverride ?? stampDefault;

  const form = {
    tenant: normaliseText(tenant) || "[Tenant name]",
    landlord: normaliseText(landlord) || "[Landlord name]",
    address: normaliseText(address) || "[Rented property address]",
    pan: pan.trim().toUpperCase(),
    mode,
    stamp,
  };
  const annual = rentNum * 12;
  const panBad = form.pan && !PAN_RE.test(form.pan);
  const first = sched.receipts?.[0];

  const download = async () => {
    setError("");
    if (!tenant.trim() || !landlord.trim() || !address.trim()) {
      setError("Fill in the tenant's name, the landlord's name and the property address first.");
      return;
    }
    if (panBad) { setError("That PAN does not look right — it is 5 letters, 4 digits, then 1 letter."); return; }
    setBusy(true);
    try {
      const out = await buildReceiptPdf(sched.receipts, form);
      if (out.error) { setError(out.error); return; }
      const p = period;
      downloadBytes(out.bytes, `rent-receipts-${MONTHS[p.fromM].slice(0, 3).toLowerCase()}${p.fromY}-${MONTHS[p.toM].slice(0, 3).toLowerCase()}${p.toY}.pdf`);
    } catch (e) {
      setError("Could not build the PDF: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="field-row">
        <label className="field">
          <span className="field-label">Tenant name</span>
          <input className="inp" value={tenant} maxLength={80} placeholder="e.g. Priya Sharma"
            onChange={(e) => setTenant(e.target.value)} autoComplete="off" />
        </label>
        <label className="field">
          <span className="field-label">Landlord name</span>
          <input className="inp" value={landlord} maxLength={80} placeholder="e.g. Ramesh Kumar"
            onChange={(e) => setLandlord(e.target.value)} autoComplete="off" />
        </label>
      </div>

      <label className="field">
        <span className="field-label">Rented property address</span>
        <textarea className="ta" rows={2} value={address} maxLength={220}
          placeholder="Flat 402, Sunshine Apartments, Indiranagar, Bengaluru 560038"
          onChange={(e) => setAddress(e.target.value)} />
      </label>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Monthly rent</span>
          <span className="input-affix">
            <span className="affix">₹</span>
            <input value={rent} inputMode="decimal" aria-label="Monthly rent in rupees"
              onChange={(e) => setRent(e.target.value)} />
          </span>
        </label>
        <label className="field">
          <span className="field-label">Landlord PAN <span className="muted">(optional)</span></span>
          <input className="inp mono" value={pan} maxLength={10} placeholder="ABCDE1234F"
            onChange={(e) => setPan(e.target.value.toUpperCase())} autoComplete="off" />
        </label>
      </div>
      {panBad && <p className="error">A PAN is 5 letters, 4 digits, then 1 letter — e.g. ABCDE1234F.</p>}
      {!form.pan && annual > PAN_THRESHOLD && (
        <p className="muted small">
          At ₹{fmtRupees(rentNum)} a month your rent is ₹{fmtRupees(annual)} a year — over ₹1,00,000, so your
          employer will ask for the landlord&rsquo;s PAN before allowing the HRA exemption. If the landlord has
          no PAN, they will need a signed declaration from the landlord saying so instead.
        </p>
      )}

      <Field label="Rent paid by">
        <Segmented options={MODES} value={mode} onChange={(v) => { setMode(v); setStampOverride(null); }} ariaLabel="Payment mode" />
      </Field>

      <div className="field-row">
        <MonthPicker label="From" y={period.fromY} m={period.fromM} years={years}
          onChange={(y, m) => setPeriod({ ...period, fromY: y, fromM: m })} />
        <MonthPicker label="To" y={period.toY} m={period.toM} years={years}
          onChange={(y, m) => setPeriod({ ...period, toY: y, toM: m })} />
      </div>

      <Field label="One receipt per">
        <Segmented options={EVERY} value={every} onChange={setEvery} ariaLabel="Receipt frequency" />
      </Field>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Rent paid on day</span>
          <input className="inp" type="number" min={1} max={31} value={payDay}
            onChange={(e) => setPayDay(Math.min(31, Math.max(1, Math.round(Number(e.target.value)) || 1)))} />
        </label>
        <label className="field">
          <span className="field-label">First receipt number</span>
          <input className="inp" type="number" min={1} value={startNo}
            onChange={(e) => setStartNo(Math.max(1, Math.round(Number(e.target.value)) || 1))} />
        </label>
      </div>

      <label className="check-row">
        <input type="checkbox" checked={stamp} onChange={(e) => setStampOverride(e.target.checked)} />
        <span>Leave a box for a ₹1 revenue stamp</span>
      </label>
      <p className="muted small">
        {stampDefault
          ? `Ticked because rent above ₹${fmtRupees(STAMP_THRESHOLD)} is being paid in cash — the landlord sticks a ₹1 revenue stamp in the box and signs across it.`
          : `A revenue stamp is customary on a cash receipt for more than ₹${fmtRupees(STAMP_THRESHOLD)}; for UPI, bank transfer or cheque the payment record itself is the proof, so the box is off by default.`}
      </p>

      {sched.error && <p className="error">{sched.error}</p>}

      {first && (
        <>
          <Rows>
            <Row label="Receipts" val={`${sched.receipts.length} (${Math.ceil(sched.receipts.length / 3)} A4 page${sched.receipts.length > 3 ? "s" : ""}, 3 per page)`} />
            <Row label="Months covered" val={String(sched.totalMonths)} />
            <Row label="Total rent" val={`₹${fmtRupees(sched.totalPaid)}`} highlight />
          </Rows>

          <span className="field-label" style={{ marginTop: "1.25rem" }}>Preview of receipt {first.no}</span>
          <div className="rent-receipt" aria-label="Receipt preview">
            <div className="rr-head">
              <strong>RENT RECEIPT</strong>
              <span>Receipt No. {first.no}<br />Date: {fmtDate(first.date)}</span>
            </div>
            <p>{receiptSentence(first, form)}</p>
            <div className="rr-foot">
              <span>
                <strong>Landlord: {form.landlord}</strong>
                {form.pan && <><br />Landlord PAN: {form.pan}</>}
              </span>
              {stamp && <span className="rr-stamp">Revenue stamp Re 1</span>}
              <span className="rr-sign">Signature of landlord</span>
            </div>
          </div>

          <div className="btn-row">
            <button className="btn" onClick={download} disabled={busy}>
              {busy ? "Building…" : `Download ${sched.receipts.length} receipt${sched.receipts.length === 1 ? "" : "s"} (PDF)`}
            </button>
          </div>
        </>
      )}
      {error && <p className="error">{error}</p>}

      <p className="muted small" style={{ marginTop: "1rem" }}>
        Print the PDF, have your landlord sign each receipt (and stamp it if paid in cash), then hand copies to
        your employer with your rent declaration. Up to {MAX_MONTHS} months at a time. Everything is built in
        your browser — names, address and PAN are never uploaded.
      </p>
    </div>
  );
}
