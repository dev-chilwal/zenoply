"use client";
import { useEffect, useState } from "react";
import { Rows, Row } from "@/components/calc/Calc";
import { downloadBytes } from "./PdfDropzone";
import { MONTHS } from "./rentReceipts";
import {
  STATES, GST_RATES, MAX_ITEMS, stateName, gstinProblem, INVOICE_NO_RE,
  computeInvoice, lineTaxable, fmtPaise, fmtRate, normaliseText, buildInvoicePdf,
} from "./gstInvoice";

const num = (s) => {
  const n = Number(String(s).replace(/[,\s₹]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};
const blankItem = () => ({ desc: "", hsn: "", qty: "1", unit: "", rate: "", gst: 18 });
const fmtIso = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? `${String(d).padStart(2, "0")} ${MONTHS[m - 1].slice(0, 3)} ${y}` : "";
};

function StateSelect({ label, value, onChange }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <select className="inp" value={value} onChange={(e) => onChange(e.target.value)}>
        {STATES.map(([c, n]) => <option key={c} value={c}>{n} ({c})</option>)}
      </select>
    </label>
  );
}

function Party({ title, p, set, optionalGstin }) {
  const g = p.gstin.trim().toUpperCase();
  const problem = g ? gstinProblem(g) : "";
  const onGstin = (v) => {
    const up = v.toUpperCase().replace(/\s/g, "");
    // The state is the GSTIN's first two digits, so follow it once they are typed.
    const code = up.slice(0, 2);
    set({ ...p, gstin: up, state: stateName(code) ? code : p.state });
  };
  return (
    <fieldset className="inv-party">
      <legend>{title}</legend>
      <div className="field-row">
        <label className="field">
          <span className="field-label">Name</span>
          <input className="inp" value={p.name} maxLength={100} autoComplete="off"
            onChange={(e) => set({ ...p, name: e.target.value })} />
        </label>
        <label className="field">
          <span className="field-label">GSTIN {optionalGstin && <span className="muted">(blank if unregistered)</span>}</span>
          <input className="inp mono" value={p.gstin} maxLength={15} placeholder="29ABCDE1234F1Z5" autoComplete="off"
            onChange={(e) => onGstin(e.target.value)} />
        </label>
      </div>
      {problem && <p className="error">{problem}</p>}
      <label className="field">
        <span className="field-label">Address</span>
        <textarea className="ta" rows={2} value={p.address} maxLength={240}
          onChange={(e) => set({ ...p, address: e.target.value })} />
      </label>
      <StateSelect label="State" value={p.state} onChange={(v) => set({ ...p, state: v })} />
      {g && !problem && g.slice(0, 2) !== p.state && (
        <p className="muted small">The GSTIN belongs to {stateName(g.slice(0, 2))} — check the state.</p>
      )}
    </fieldset>
  );
}

export default function GstInvoiceGenerator() {
  const [seller, setSeller] = useState({ name: "", gstin: "", address: "", state: "29" });
  const [buyer, setBuyer] = useState({ name: "", gstin: "", address: "", state: "29" });
  const [shipOn, setShipOn] = useState(false);
  const [shipTo, setShipTo] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("INV-001");
  // Fixed until mount so the prerendered HTML and hydration agree.
  const [date, setDate] = useState("2026-04-01");
  const [posOverride, setPosOverride] = useState(null);
  const [reverseCharge, setReverseCharge] = useState(false);
  const [roundOff, setRoundOff] = useState(true);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([blankItem()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const d = new Date();
    setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
  }, []);

  const posState = posOverride ?? buyer.state;
  const parsed = items.map((it) => ({ ...it, qty: num(it.qty), rate: num(it.rate) }));
  const usable = parsed.filter((it) => it.qty > 0 && it.rate >= 0);
  const calc = computeInvoice(usable, { sellerState: seller.state, posState, roundOff });

  const setItem = (i, patch) => setItems(items.map((it, k) => (k === i ? { ...it, ...patch } : it)));
  const hsnOdd = items.some((it) => it.hsn.trim() && !/^\d{4}(\d{2}(\d{2})?)?$/.test(it.hsn.trim()));
  const buyerUnreg = !buyer.gstin.trim();

  const download = async () => {
    setError("");
    const sg = seller.gstin.trim(), bg = buyer.gstin.trim();
    if (!seller.name.trim() || !seller.address.trim()) return setError("Fill in your business name and address.");
    if (!sg) return setError("A tax invoice must carry your GSTIN. Unregistered sellers cannot charge GST and issue a plain bill instead.");
    if (gstinProblem(sg)) return setError("Your GSTIN: " + gstinProblem(sg));
    if (!buyer.name.trim()) return setError("Fill in the buyer's name.");
    if (bg && gstinProblem(bg)) return setError("Buyer's GSTIN: " + gstinProblem(bg));
    if (!INVOICE_NO_RE.test(invoiceNo.trim())) return setError("The invoice number can be up to 16 characters: letters, digits, - and / only.");
    if (!fmtIso(date)) return setError("Pick the invoice date.");
    const bad = parsed.findIndex((it) => !it.desc.trim() || !(it.qty > 0) || !(it.rate >= 0));
    if (bad >= 0) return setError(`Line ${bad + 1} needs a description, a quantity above zero and a rate.`);

    setBusy(true);
    try {
      const f = {
        seller: { name: normaliseText(seller.name), address: normaliseText(seller.address), gstin: sg, state: seller.state },
        buyer: { name: normaliseText(buyer.name), address: normaliseText(buyer.address), gstin: bg, state: buyer.state },
        shipTo: shipOn ? normaliseText(shipTo) : "",
        invoiceNo: invoiceNo.trim(),
        date: fmtIso(date),
        posState,
        reverseCharge,
        notes: normaliseText(notes),
        items: parsed.map((it) => ({ ...it, desc: normaliseText(it.desc), hsn: it.hsn.trim(), unit: normaliseText(it.unit) })),
      };
      const out = await buildInvoicePdf(f, computeInvoice(parsed, { sellerState: seller.state, posState, roundOff }));
      if (out.error) return setError(out.error);
      downloadBytes(out.bytes, `invoice-${invoiceNo.trim().replace(/\//g, "-")}.pdf`);
    } catch (e) {
      setError("Could not build the PDF: " + (e?.message || e));
    } finally {
      setBusy(false);
    }
  };

  const st = calc.stateTax;

  return (
    <div>
      <Party title="Your business (seller)" p={seller} set={setSeller} />
      <Party title="Bill to (buyer)" p={buyer} set={setBuyer} optionalGstin />
      <label className="check-row">
        <input type="checkbox" checked={shipOn} onChange={(e) => setShipOn(e.target.checked)} />
        <span>Goods are delivered to a different address</span>
      </label>
      {shipOn && (
        <label className="field">
          <span className="field-label">Ship to</span>
          <textarea className="ta" rows={2} value={shipTo} maxLength={240} onChange={(e) => setShipTo(e.target.value)} />
        </label>
      )}

      <div className="field-row">
        <label className="field">
          <span className="field-label">Invoice number</span>
          <input className="inp mono" value={invoiceNo} maxLength={16} onChange={(e) => setInvoiceNo(e.target.value)} autoComplete="off" />
        </label>
        <label className="field">
          <span className="field-label">Invoice date</span>
          <input className="inp" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
      </div>
      {invoiceNo && !INVOICE_NO_RE.test(invoiceNo.trim()) && (
        <p className="error">Up to 16 characters, using only letters, digits, hyphen (-) and slash (/).</p>
      )}
      <StateSelect label="Place of supply" value={posState} onChange={(v) => setPosOverride(v === buyer.state ? null : v)} />
      <p className="muted small">
        {calc.intra
          ? `Same state as you, so GST is split into CGST + ${st} (half each).`
          : `A different state from yours (${stateName(seller.state)}), so the whole GST is charged as IGST.`}
        {" "}Follows the buyer&rsquo;s state unless you change it.
      </p>

      <span className="field-label" style={{ marginTop: "1rem" }}>Items</span>
      <div className="inv-items">
        <div className="inv-item inv-head" aria-hidden="true">
          <span>Description</span><span>HSN/SAC</span><span>Qty</span><span>Unit</span>
          <span>Rate (₹)</span><span>GST</span><span className="inv-amt">Amount</span><span />
        </div>
        {items.map((it, i) => {
          const p = parsed[i];
          const amt = p.qty > 0 && p.rate >= 0 ? fmtPaise(lineTaxable(p.qty, p.rate)) : "—";
          return (
            <div className="inv-item" key={i}>
              <label className="inv-desc"><span className="inv-lab">Description</span>
                <input className="inp" value={it.desc} maxLength={160} aria-label={`Line ${i + 1} description`}
                  onChange={(e) => setItem(i, { desc: e.target.value })} /></label>
              <label><span className="inv-lab">HSN/SAC</span>
                <input className="inp mono" value={it.hsn} maxLength={8} inputMode="numeric" aria-label={`Line ${i + 1} HSN or SAC code`}
                  onChange={(e) => setItem(i, { hsn: e.target.value.replace(/\D/g, "") })} /></label>
              <label><span className="inv-lab">Qty</span>
                <input className="inp" value={it.qty} inputMode="decimal" aria-label={`Line ${i + 1} quantity`}
                  onChange={(e) => setItem(i, { qty: e.target.value })} /></label>
              <label><span className="inv-lab">Unit</span>
                <input className="inp" value={it.unit} maxLength={8} placeholder="Nos" aria-label={`Line ${i + 1} unit`}
                  onChange={(e) => setItem(i, { unit: e.target.value })} /></label>
              <label><span className="inv-lab">Rate (₹)</span>
                <input className="inp" value={it.rate} inputMode="decimal" aria-label={`Line ${i + 1} rate per unit before GST`}
                  onChange={(e) => setItem(i, { rate: e.target.value })} /></label>
              <label><span className="inv-lab">GST</span>
                <select className="inp" value={it.gst} aria-label={`Line ${i + 1} GST rate`}
                  onChange={(e) => setItem(i, { gst: Number(e.target.value) })}>
                  {GST_RATES.map((r) => <option key={r} value={r}>{fmtRate(r)}</option>)}
                </select></label>
              <span className="inv-amt mono"><span className="inv-lab">Amount</span>{amt}</span>
              <button type="button" className="btn-sm btn-ghost" aria-label={`Remove line ${i + 1}`}
                disabled={items.length === 1} onClick={() => setItems(items.filter((_, k) => k !== i))}>×</button>
            </div>
          );
        })}
      </div>
      <div className="btn-row">
        <button type="button" className="btn-sm btn-ghost" disabled={items.length >= MAX_ITEMS}
          onClick={() => setItems([...items, blankItem()])}>+ Add item</button>
      </div>
      <p className="muted small">
        Rates are per unit <strong>before</strong> GST. HSN for goods, SAC (starts 99) for services: at least 4 digits
        up to ₹5 crore turnover, 6 digits above it.
        {hsnOdd && " One of the codes is not 4, 6 or 8 digits — check it."}
      </p>

      <label className="check-row">
        <input type="checkbox" checked={reverseCharge} onChange={(e) => setReverseCharge(e.target.checked)} />
        <span>Tax payable on reverse charge</span>
      </label>
      <label className="check-row">
        <input type="checkbox" checked={roundOff} onChange={(e) => setRoundOff(e.target.checked)} />
        <span>Round the total to the nearest rupee</span>
      </label>
      <label className="field">
        <span className="field-label">Notes <span className="muted">(optional — bank details, payment terms)</span></span>
        <textarea className="ta" rows={2} value={notes} maxLength={400} onChange={(e) => setNotes(e.target.value)} />
      </label>

      {usable.length > 0 && (
        <Rows>
          <Row label="Taxable value" val={`₹${fmtPaise(calc.taxable)}`} />
          {calc.intra ? (
            <>
              <Row label="CGST" val={`₹${fmtPaise(calc.cgst)}`} />
              <Row label={st} val={`₹${fmtPaise(calc.sgst)}`} />
            </>
          ) : (
            <Row label="IGST" val={`₹${fmtPaise(calc.igst)}`} />
          )}
          {calc.roundOff !== 0 && <Row label="Round off" val={`${calc.roundOff > 0 ? "+" : ""}${fmtPaise(calc.roundOff)}`} />}
          <Row label="Invoice total" val={`₹${fmtPaise(calc.total)}`} highlight />
        </Rows>
      )}
      {buyerUnreg && calc.taxable >= 5000000 && (
        <p className="muted small">
          A taxable value of ₹50,000 or more to an unregistered buyer: the invoice must carry the buyer&rsquo;s name, address and state —
          make sure the address above is complete.
        </p>
      )}

      <div className="btn-row">
        <button className="btn" onClick={download} disabled={busy}>
          {busy ? "Building…" : "Download invoice (PDF)"}
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      <p className="muted small" style={{ marginTop: "1rem" }}>
        Prints as an A4 tax invoice with the fields Rule 46 of the CGST Rules asks for. Not an e-invoice: if your
        turnover is above ₹5 crore, B2B invoices must also be registered on the IRP for an IRN and QR code. Everything
        is built in your browser — nothing you type is uploaded.
      </p>
    </div>
  );
}
