// Rent receipt schedule + PDF writer. Kept out of the component so it runs in
// node (the rupeesWords.js pattern). All dates are plain {y, m, d} integers —
// no Date objects in the schedule, so there is no timezone to drift across.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { integerToWords, titleCase, groupIndian } from "./rupeesWords";

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MAX_MONTHS = 24;
// CBDT Circular 8/2013: an employer must collect the landlord's PAN before
// allowing HRA exemption once rent paid exceeds Rs 1 lakh in the year.
export const PAN_THRESHOLD = 100000;
// Indian Stamp Act, Schedule I, Art. 53: a receipt for more than Rs 5,000
// carries a Re 1 revenue stamp. Cheque/electronic payments are the usual
// exemption in practice, so the box is offered by default only for cash.
export const STAMP_THRESHOLD = 5000;

export const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

/** Months from (y1, m1) to (y2, m2) inclusive; m is 0-based. 0 if reversed. */
export function monthSpan(y1, m1, y2, m2) {
  const n = (y2 - y1) * 12 + (m2 - m1) + 1;
  return n > 0 ? n : 0;
}

/** Indian financial year (April–March) containing the given month. */
export function financialYearOf(y, m) {
  const start = m >= 3 ? y : y - 1;
  return { fromY: start, fromM: 3, toY: start + 1, toM: 2 };
}

const addMonths = (y, m, k) => {
  const t = y * 12 + m + k;
  return { y: Math.floor(t / 12), m: t % 12 };
};

/**
 * One entry per receipt. `every` is 1 (monthly), 3 (quarterly) or 0 (one
 * receipt for the whole period). A short final group (e.g. 2 months left in a
 * quarterly run) gets its own receipt for just those months. The receipt is
 * dated `payDay` of the group's first month — rent in India is normally paid
 * in advance — clamped to the length of that month.
 */
export function buildSchedule({ fromY, fromM, toY, toM, rent, every = 1, payDay = 1, startNo = 1 }) {
  const total = monthSpan(fromY, fromM, toY, toM);
  if (total === 0) return { error: "The end month is before the start month." };
  if (total > MAX_MONTHS) return { error: `Pick a period of at most ${MAX_MONTHS} months.` };
  if (!Number.isFinite(rent) || rent <= 0) return { error: "Enter the monthly rent." };
  const size = every > 0 ? every : total;
  const receipts = [];
  for (let i = 0; i < total; i += size) {
    const months = Math.min(size, total - i);
    const a = addMonths(fromY, fromM, i);
    const b = addMonths(fromY, fromM, i + months - 1);
    receipts.push({
      no: startNo + receipts.length,
      date: { y: a.y, m: a.m, d: Math.min(Math.max(1, payDay), daysInMonth(a.y, a.m)) },
      from: { y: a.y, m: a.m, d: 1 },
      to: { y: b.y, m: b.m, d: daysInMonth(b.y, b.m) },
      months,
      amount: Math.round(rent * months * 100) / 100,
    });
  }
  const totalPaid = Math.round(receipts.reduce((s, r) => s + r.amount, 0) * 100) / 100;
  return { receipts, totalMonths: total, totalPaid };
}

const pad2 = (n) => String(n).padStart(2, "0");
export const fmtDate = ({ y, m, d }) => `${pad2(d)} ${MONTHS[m].slice(0, 3)} ${y}`;
export const fmtPeriod = (r) => r.months === 1
  ? `${MONTHS[r.from.m]} ${r.from.y}`
  : `${fmtDate(r.from)} to ${fmtDate(r.to)}`;

/** "12,500" / "12,500.50" in Indian grouping. */
export function fmtRupees(amount) {
  const paise = Math.round(amount * 100);
  const whole = String(Math.floor(paise / 100));
  const frac = paise % 100;
  return groupIndian(whole) + (frac ? "." + pad2(frac) : "");
}

export function amountInWords(amount) {
  const paise = Math.round(amount * 100);
  const words = titleCase(integerToWords(String(Math.floor(paise / 100))));
  const p = paise % 100;
  return p
    ? `Rupees ${words} and ${titleCase(integerToWords(String(p)))} Paise Only`
    : `Rupees ${words} Only`;
}

export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** The sentence printed on each receipt — shared by the preview and the PDF. */
export function receiptSentence(r, f) {
  const mode = f.mode === "Cash" ? "in cash" : `by ${f.mode}`;
  return `Received with thanks from ${f.tenant} the sum of Rs. ${fmtRupees(r.amount)} ` +
    `(${amountInWords(r.amount)}) ${mode} towards the rent of the property at ` +
    `${f.address} for the period ${fmtPeriod(r)}.`;
}

// The standard PDF fonts only carry WinAnsi (Latin-1 plus a few extras). The
// rupee sign is mapped to "Rs." and typographic quotes/dashes are already in
// WinAnsi; anything else (Devanagari, etc.) is reported instead of crashing
// the save.
export function normaliseText(s) {
  return String(s ?? "")
    .replace(/₹\s*/g, "Rs. ")
    .replace(/[   ]/g, " ")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/ {2,}/g, " ")
    .trim();
}

export function unsupportedChars(font, strings) {
  const ok = new Set(font.getCharacterSet());
  const bad = new Set();
  for (const s of strings) for (const ch of s) if (!ok.has(ch.codePointAt(0))) bad.add(ch);
  return [...bad];
}

/** Greedy word wrap against real glyph widths; over-long words are split. */
export function wrapText(font, size, text, width) {
  const lines = [];
  let line = "";
  for (const word of text.split(" ")) {
    const tryLine = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(tryLine, size) <= width) { line = tryLine; continue; }
    if (line) lines.push(line);
    let w = word;
    while (font.widthOfTextAtSize(w, size) > width) {
      let k = w.length - 1;
      while (k > 1 && font.widthOfTextAtSize(w.slice(0, k), size) > width) k--;
      lines.push(w.slice(0, k));
      w = w.slice(k);
    }
    line = w;
  }
  if (line) lines.push(line);
  return lines;
}

const A4 = [595.28, 841.89];
export const PER_PAGE = 3;

/**
 * f: { tenant, landlord, address, pan, mode, stamp } — already normalised.
 * Three receipts per A4 page with dashed cut lines between them.
 * Returns { bytes } or { error }.
 */
export async function buildReceiptPdf(receipts, f) {
  const doc = await PDFDocument.create();
  const reg = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const sentences = receipts.map((r) => receiptSentence(r, f));
  const bad = unsupportedChars(reg, [...sentences, f.landlord, f.pan || ""]);
  if (bad.length) {
    return { error: `These characters cannot be printed with the PDF's built-in font: ${bad.join(" ")} — please type names and the address in English letters.` };
  }
  doc.setTitle("Rent receipts");
  doc.setCreator("Zenoply Rent Receipt Generator");

  const [W, H] = A4;
  const margin = 36;
  const slotH = (H - margin * 2) / PER_PAGE;
  const ink = rgb(0.1, 0.1, 0.1);
  const soft = rgb(0.4, 0.4, 0.4);
  let page;

  receipts.forEach((r, i) => {
    const slot = i % PER_PAGE;
    if (slot === 0) page = doc.addPage(A4);
    const top = H - margin - slot * slotH;
    const boxTop = top - 10;
    const boxBottom = top - slotH + 10;
    const x0 = margin, x1 = W - margin;

    if (slot > 0) {
      page.drawLine({
        start: { x: margin, y: top }, end: { x: W - margin, y: top },
        thickness: 0.5, color: soft, dashArray: [4, 3],
      });
    }
    page.drawRectangle({
      x: x0, y: boxBottom, width: x1 - x0, height: boxTop - boxBottom,
      borderWidth: 0.8, borderColor: ink,
    });

    const pad = 16;
    let y = boxTop - pad - 12;
    page.drawText("RENT RECEIPT", { x: x0 + pad, y, size: 13, font: bold, color: ink });
    const no = `Receipt No. ${r.no}`;
    page.drawText(no, { x: x1 - pad - reg.widthOfTextAtSize(no, 9.5), y: y + 1.5, size: 9.5, font: reg, color: ink });
    y -= 15;
    const dt = `Date: ${fmtDate(r.date)}`;
    page.drawText(dt, { x: x1 - pad - reg.widthOfTextAtSize(dt, 9.5), y, size: 9.5, font: reg, color: ink });
    y -= 20;

    for (const line of wrapText(reg, 10.5, sentences[i], x1 - x0 - pad * 2)) {
      page.drawText(line, { x: x0 + pad, y, size: 10.5, font: reg, color: ink });
      y -= 15;
    }

    // Signature block, bottom right; landlord details bottom left.
    const baseY = boxBottom + pad + 4;
    const sigW = 170;
    const sigX = x1 - pad - sigW;
    page.drawLine({ start: { x: sigX, y: baseY + 12 }, end: { x: x1 - pad, y: baseY + 12 }, thickness: 0.6, color: ink });
    page.drawText("Signature of landlord", { x: sigX, y: baseY, size: 8.5, font: reg, color: soft });

    const s = 46;
    const sx = sigX - s - 18;
    if (f.stamp) {
      const sy = baseY + 2;
      page.drawRectangle({ x: sx, y: sy, width: s, height: s, borderWidth: 0.6, borderColor: soft, borderDashArray: [2, 2] });
      for (const [k, t] of ["Revenue", "stamp", "Re 1"].entries()) {
        page.drawText(t, { x: sx + (s - reg.widthOfTextAtSize(t, 7)) / 2, y: sy + s - 14 - k * 9, size: 7, font: reg, color: soft });
      }
    }

    // Shrink a long landlord name to fit beside the stamp/signature block.
    const room = (f.stamp ? sx : sigX) - 12 - (x0 + pad);
    const fit = (font, t) => Math.max(6, Math.min(9.5, (9.5 * room) / font.widthOfTextAtSize(t, 9.5)));
    let ly = baseY;
    if (f.pan) {
      const t = `Landlord PAN: ${f.pan}`;
      page.drawText(t, { x: x0 + pad, y: baseY, size: fit(reg, t), font: reg, color: ink });
      ly = baseY + 14;
    }
    const lt = `Landlord: ${f.landlord}`;
    page.drawText(lt, { x: x0 + pad, y: ly, size: fit(bold, lt), font: bold, color: ink });
  });

  return { bytes: await doc.save() };
}
