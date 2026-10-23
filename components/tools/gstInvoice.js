// GST tax invoice: GSTIN checks, tax maths and the PDF writer. Kept out of the
// component so it runs in node (the rentReceipts.js pattern). Money is handled
// in whole paise wherever it is summed, so totals never drift by a paisa.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { fmtRupees, amountInWords, normaliseText, unsupportedChars, wrapText } from "./rentReceipts";

// GST state codes — the first two digits of every GSTIN. 25 (Daman & Diu) was
// merged into 26 in 2020 and 28 is pre-2014 Andhra Pradesh, so neither is
// offered for new invoices.
export const STATES = [
  ["01", "Jammu and Kashmir"], ["02", "Himachal Pradesh"], ["03", "Punjab"],
  ["04", "Chandigarh"], ["05", "Uttarakhand"], ["06", "Haryana"], ["07", "Delhi"],
  ["08", "Rajasthan"], ["09", "Uttar Pradesh"], ["10", "Bihar"], ["11", "Sikkim"],
  ["12", "Arunachal Pradesh"], ["13", "Nagaland"], ["14", "Manipur"], ["15", "Mizoram"],
  ["16", "Tripura"], ["17", "Meghalaya"], ["18", "Assam"], ["19", "West Bengal"],
  ["20", "Jharkhand"], ["21", "Odisha"], ["22", "Chhattisgarh"], ["23", "Madhya Pradesh"],
  ["24", "Gujarat"], ["26", "Dadra and Nagar Haveli and Daman and Diu"],
  ["27", "Maharashtra"], ["29", "Karnataka"], ["30", "Goa"], ["31", "Lakshadweep"],
  ["32", "Kerala"], ["33", "Tamil Nadu"], ["34", "Puducherry"],
  ["35", "Andaman and Nicobar Islands"], ["36", "Telangana"], ["37", "Andhra Pradesh"],
  ["38", "Ladakh"], ["97", "Other Territory"],
];
export const stateName = (code) => STATES.find(([c]) => c === code)?.[1] || "";

// Union territories without a legislature levy UTGST in place of SGST on a
// supply within the territory (UTGST Act 2017, s. 1(2)). Delhi, Puducherry and
// J&K have legislatures, so they charge SGST.
export const UTGST_CODES = new Set(["04", "26", "31", "35", "38"]);

// Slabs in force since 22 Sep 2025 (GST 2.0) — same list as the GST calculator.
export const GST_RATES = [0, 0.25, 3, 5, 18, 40];

export const MAX_ITEMS = 40;

const B36 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** The 15th GSTIN character: a Luhn mod-36 check over the first 14. */
export function gstinCheckChar(first14) {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const p = B36.indexOf(first14[i]) * (i % 2 ? 2 : 1);
    sum += Math.floor(p / 36) + (p % 36);
  }
  return B36[(36 - (sum % 36)) % 36];
}

export const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

/** Returns "" when valid, else a sentence saying what is wrong. */
export function gstinProblem(g) {
  if (g.length !== 15) return `A GSTIN is 15 characters; this one has ${g.length}.`;
  if (!GSTIN_RE.test(g)) return "That is not the GSTIN pattern: 2-digit state code, 10-character PAN, entity number, Z, check character.";
  if (!stateName(g.slice(0, 2))) return `${g.slice(0, 2)} is not a GST state code.`;
  const want = gstinCheckChar(g);
  if (g[14] !== want) return `The last character should be ${want} — one of the 15 characters is probably mistyped.`;
  return "";
}

// Rule 46(b): a consecutive serial number of up to 16 characters, using only
// letters, digits, hyphen and slash, unique within the financial year.
export const INVOICE_NO_RE = /^[A-Za-z0-9/-]{1,16}$/;

const paise = (x) => Math.round(x * 100);

/** Qty × rate in paise. Qty may carry 3 decimals (kg, litres). */
export function lineTaxable(qty, rate) {
  return Math.round(paise(rate) * Math.round(qty * 1000) / 1000);
}

/**
 * items: [{ qty, rate, gst }] with numbers already parsed.
 * Tax is worked out on the total taxable value at each rate (the summary the
 * invoice prints), and CGST and SGST are each rounded to the paisa, so the two
 * halves always match. Returns paise everywhere.
 */
export function computeInvoice(items, { sellerState, posState, roundOff = true }) {
  const intra = sellerState === posState;
  const groups = new Map();
  const lines = items.map((it) => {
    const taxable = lineTaxable(it.qty, it.rate);
    groups.set(it.gst, (groups.get(it.gst) || 0) + taxable);
    return { ...it, taxable };
  });
  const summary = [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([gst, taxable]) => {
    const half = Math.round(taxable * gst / 200);
    const igst = Math.round(taxable * gst / 100);
    return intra
      ? { gst, taxable, cgst: half, sgst: half, igst: 0 }
      : { gst, taxable, cgst: 0, sgst: 0, igst };
  });
  const sum = (k) => summary.reduce((s, r) => s + r[k], 0);
  const taxable = sum("taxable"), cgst = sum("cgst"), sgst = sum("sgst"), igst = sum("igst");
  const exact = taxable + cgst + sgst + igst;
  const total = roundOff ? Math.round(exact / 100) * 100 : exact;
  return {
    intra,
    stateTax: intra && UTGST_CODES.has(posState) ? "UTGST" : "SGST",
    lines, summary, taxable, cgst, sgst, igst,
    roundOff: total - exact, total,
  };
}

/** Paise → "1,23,456.70" (always two decimals, as an invoice prints). */
export function fmtPaise(p) {
  const neg = p < 0;
  const a = Math.abs(p);
  const s = fmtRupees(Math.floor(a / 100)) + "." + String(a % 100).padStart(2, "0");
  return neg ? "-" + s : s;
}

export const fmtQty = (q) => String(Math.round(q * 1000) / 1000);
export const fmtRate = (r) => (r === 0.25 ? "0.25" : String(r)) + "%";

const A4 = [595.28, 841.89];

/**
 * f: { seller: {name, address, gstin, state}, buyer: {name, address, gstin, state},
 *      shipTo, invoiceNo, date, posState, reverseCharge, notes, items: [{desc, hsn, qty, unit, rate, gst}] }
 * with strings already normalised. calc is computeInvoice's result.
 * Returns { bytes } or { error }.
 */
export async function buildInvoicePdf(f, calc) {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const texts = [
    f.seller.name, f.seller.address, f.buyer.name, f.buyer.address, f.shipTo, f.notes,
    ...f.items.flatMap((it) => [it.desc, it.hsn, it.unit]),
  ];
  const bad = unsupportedChars(reg, texts);
  if (bad.length) {
    return { error: `These characters cannot be printed with the PDF's built-in font: ${bad.join(" ")} — please type names, addresses and items in English letters.` };
  }
  doc.setTitle(`Tax invoice ${f.invoiceNo}`);
  doc.setCreator("Zenoply GST Invoice Generator");

  const [W, H] = A4;
  const M = 36;
  const ink = rgb(0.1, 0.1, 0.1);
  const soft = rgb(0.4, 0.4, 0.4);
  const rule = rgb(0.75, 0.75, 0.75);
  const shade = rgb(0.94, 0.94, 0.94);
  let page = doc.addPage(A4);
  let y = H - M;

  const text = (t, x, yy, size = 9, font = reg, color = ink) => page.drawText(t, { x, y: yy, size, font, color });
  const right = (t, xr, yy, size = 9, font = reg, color = ink) =>
    text(t, xr - font.widthOfTextAtSize(t, size), yy, size, font, color);
  const hline = (yy, x0 = M, x1 = W - M, color = rule) =>
    page.drawLine({ start: { x: x0, y: yy }, end: { x: x1, y: yy }, thickness: 0.6, color });

  // ---- Title and invoice facts ----
  text("TAX INVOICE", M, y - 16, 16, bold);
  const pos = `${stateName(f.posState)} (${f.posState})`;
  const facts = [
    ["Invoice No.", f.invoiceNo],
    ["Date", f.date],
    ["Place of supply", pos],
    ["Reverse charge", f.reverseCharge ? "Yes" : "No"],
  ];
  let fy = y - 8;
  for (const [k, v] of facts) {
    right(v, W - M, fy, 9, bold);
    right(k + ":", W - M - bold.widthOfTextAtSize(v, 9) - 5, fy, 9, reg, soft);
    fy -= 12;
  }
  y = Math.min(y - 30, fy) - 10;
  hline(y, M, W - M, ink);
  y -= 16;

  // ---- Seller | Buyer blocks ----
  const colW = (W - 2 * M - 20) / 2;
  const party = (label, p, x, extra) => {
    let yy = y;
    text(label, x, yy, 7.5, bold, soft);
    yy -= 13;
    for (const l of wrapText(bold, 10, p.name, colW)) { text(l, x, yy, 10, bold); yy -= 13; }
    for (const l of wrapText(reg, 9, p.address, colW)) { text(l, x, yy, 9); yy -= 11.5; }
    yy -= 2;
    text(p.gstin ? `GSTIN: ${p.gstin}` : "GSTIN: Unregistered", x, yy, 9, p.gstin ? bold : reg);
    yy -= 11.5;
    text(`State: ${stateName(p.state)} (${p.state})`, x, yy, 9);
    yy -= 11.5;
    if (extra) {
      yy -= 4;
      text("Ship to", x, yy, 7.5, bold, soft);
      yy -= 11.5;
      for (const l of wrapText(reg, 9, extra, colW)) { text(l, x, yy, 9); yy -= 11.5; }
    }
    return yy;
  };
  const yA = party("SOLD BY", f.seller, M, "");
  const yB = party("BILL TO", f.buyer, M + colW + 20, f.shipTo);
  y = Math.min(yA, yB) - 8;

  // ---- Items table (continues across pages) ----
  // # | Description | HSN/SAC | Qty | Rate | GST | Taxable value
  const cols = { n: M + 4, desc: M + 22, hsn: 0, qtyR: 0, rateR: 0, gstR: 0, amtR: W - M - 4 };
  cols.gstR = cols.amtR - 78;
  cols.rateR = cols.gstR - 40;
  cols.qtyR = cols.rateR - 70;
  cols.hsn = cols.qtyR - 62 - 52;
  const descW = cols.hsn - cols.desc - 8;
  const head = () => {
    page.drawRectangle({ x: M, y: y - 6, width: W - 2 * M, height: 18, color: shade });
    text("#", cols.n, y, 8, bold);
    text("Description", cols.desc, y, 8, bold);
    text("HSN/SAC", cols.hsn, y, 8, bold);
    right("Qty", cols.qtyR, y, 8, bold);
    right("Rate", cols.rateR, y, 8, bold);
    right("GST", cols.gstR, y, 8, bold);
    right("Taxable value", cols.amtR, y, 8, bold);
    y -= 20;
  };
  const newPage = () => {
    page = doc.addPage(A4);
    y = H - M - 10;
    text(`Tax invoice ${f.invoiceNo} (continued)`, M, y, 9, reg, soft);
    y -= 22;
  };
  head();
  calc.lines.forEach((ln, i) => {
    const it = f.items[i];
    const dl = wrapText(reg, 9, it.desc, descW);
    const h = dl.length * 11 + 6;
    if (y - h < M + 40) { newPage(); head(); }
    text(String(i + 1), cols.n, y, 9);
    dl.forEach((l, k) => text(l, cols.desc, y - k * 11, 9));
    text(it.hsn, cols.hsn, y, 9);
    right(`${fmtQty(it.qty)}${it.unit ? " " + it.unit : ""}`, cols.qtyR, y, 9);
    right(fmtPaise(paise(it.rate)), cols.rateR, y, 9);
    right(fmtRate(it.gst), cols.gstR, y, 9);
    right(fmtPaise(ln.taxable), cols.amtR, y, 9);
    y -= h;
    hline(y + 7);
  });

  // ---- Tax summary by rate + totals ----
  const st = calc.stateTax;
  const sumCols = calc.intra
    ? [["Taxable value", "taxable"], ["CGST", "cgst"], [st, "sgst"]]
    : [["Taxable value", "taxable"], ["IGST", "igst"]];
  const summaryH = 20 + calc.summary.length * 13 + 8;
  const totalsRows = [
    ["Taxable value", calc.taxable],
    ...(calc.intra ? [["CGST", calc.cgst], [st, calc.sgst]] : [["IGST", calc.igst]]),
    ...(calc.roundOff ? [["Round off", calc.roundOff]] : []),
  ];
  const wordsLines = wrapText(reg, 9, amountInWords(calc.total / 100), W - 2 * M);
  const notesLines = f.notes ? wrapText(reg, 8.5, f.notes, W - 2 * M - 200) : [];
  const tailH = summaryH + totalsRows.length * 13 + 30 + wordsLines.length * 12 + 20 + Math.max(70, notesLines.length * 11 + 20);
  if (y - tailH < M) newPage();
  y -= 10;

  const sx = M + 200;
  const colX = (k) => sx + ((W - M - sx) * (k + 1)) / sumCols.length;
  text("Tax summary", M, y, 8, bold);
  text("GST rate", M + 90, y, 8, bold);
  sumCols.forEach(([label], k) => right(label, colX(k) - 4, y, 8, bold));
  y -= 4;
  hline(y);
  y -= 11;
  for (const r of calc.summary) {
    const half = r.gst / 2;
    const label = calc.intra
      ? `${fmtRate(r.gst)} (${fmtRate(half)} + ${fmtRate(half)})`
      : fmtRate(r.gst);
    text(label, M + 90, y, 8.5);
    sumCols.forEach(([, key], k) => right(fmtPaise(r[key]), colX(k) - 4, y, 8.5));
    y -= 13;
  }
  hline(y + 6);
  y -= 12;

  const lx = W - M - 200;
  for (const [k, v] of totalsRows) {
    text(k, lx, y, 9, reg, soft);
    right((v > 0 && k === "Round off" ? "+" : "") + fmtPaise(v), W - M - 4, y, 9);
    y -= 13;
  }
  y -= 4;
  page.drawRectangle({ x: lx - 6, y: y - 7, width: W - M - lx + 6, height: 20, color: shade });
  text("Total (Rs.)", lx, y, 10.5, bold);
  right(fmtPaise(calc.total), W - M - 4, y, 10.5, bold);
  y -= 26;
  text("Amount in words", M, y, 7.5, bold, soft);
  y -= 12;
  for (const l of wordsLines) { text(l, M, y, 9); y -= 12; }
  y -= 14;

  // ---- Notes (left) and signature (right) ----
  const sigTop = y;
  if (notesLines.length) {
    text("Notes", M, y, 7.5, bold, soft);
    y -= 12;
    for (const l of notesLines) { text(l, M, y, 8.5); y -= 11; }
  }
  const sigW = 180;
  const sigX = W - M - sigW;
  const forLines = wrapText(bold, 9, `For ${f.seller.name}`, sigW);
  forLines.forEach((l, k) => text(l, sigX, sigTop - k * 11, 9, bold));
  const sy = sigTop - 58;
  page.drawLine({ start: { x: sigX, y: sy + 12 }, end: { x: W - M, y: sy + 12 }, thickness: 0.6, color: ink });
  text("Authorised signatory", sigX, sy, 8.5, reg, soft);

  const pages = doc.getPages();
  if (pages.length > 1) {
    pages.forEach((pg, i) => {
      const t = `Page ${i + 1} of ${pages.length}`;
      pg.drawText(t, { x: W - M - reg.widthOfTextAtSize(t, 8), y: M - 18, size: 8, font: reg, color: soft });
    });
  }

  return { bytes: await doc.save() };
}

export { normaliseText, amountInWords };
