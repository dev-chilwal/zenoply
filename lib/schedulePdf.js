// Year-by-year loan schedule as a printable PDF, for the "Download PDF" button
// under the amortization table (EMI, mortgage, loan prepayment). Loaded with
// import() on click, so pdf-lib never ships in a calculator's first load.
//
// Same rounded figures as the CSV (scheduleCents), so the two exports agree to
// the cent. The standard Helvetica font is WinAnsi-only — it cannot draw ₹ or
// the U+202F narrow no-break space fr-FR groups thousands with — so amounts
// carry the ISO code instead of a symbol and every string goes through `safe`.
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { scheduleCents } from "./scheduleCsv";

const A4 = [595.28, 841.89];
const M = 50; // page margin
const ROW = 17;
const INK = rgb(0.1, 0.1, 0.1);
const MUTED = rgb(0.42, 0.42, 0.42);
const LINE = rgb(0.82, 0.82, 0.82);
const ZEBRA = rgb(0.955, 0.955, 0.955);

/**
 * yearly: amortize()'s yearly rows; currency: ISO 4217 code; locale: BCP 47
 * tag for digit grouping; title: document heading; summary: [label, value]
 * pairs where a number value is an amount (formatted with the code) and a
 * string is drawn as-is; date: the "generated" date (injectable for tests).
 * Returns the PDF bytes.
 */
export async function schedulePdf({ yearly, currency, locale, title, summary = [], date = new Date() }) {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setCreator("zenoply.com");
  doc.setProducer("zenoply.com");
  doc.setCreationDate(date);
  doc.setModificationDate(date);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const drawable = new Set(font.getCharacterSet());
  const safe = (s) => String(s)
    .replace(/[    ]/g, " ")
    .replace(/[−]/g, "-")
    .split("").map((ch) => (drawable.has(ch.codePointAt(0)) ? ch : "?")).join("");

  const nf = new Intl.NumberFormat(locale || "en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = (cents) => safe(nf.format(cents / 100));
  const amount = (n) => safe(`${currency} ${nf.format(Math.round(n * 100) / 100)}`);
  const dateText = safe(new Intl.DateTimeFormat(locale || "en-US", { dateStyle: "long" }).format(date));

  const s = scheduleCents(yearly);
  const W = A4[0] - 2 * M;
  // Year column, then three right-aligned money columns sharing the rest.
  const yearW = 60;
  const colW = (W - yearW) / 3;
  const rights = [M + yearW + colW, M + yearW + 2 * colW, M + W];
  const headers = [`Principal paid (${currency})`, `Interest paid (${currency})`, `Balance at year end (${currency})`];

  const pages = [];
  let page, y;
  const text = (str, x, yy, { f = font, size = 10, color = INK, align = "left" } = {}) => {
    const t = safe(str);
    const w = f.widthOfTextAtSize(t, size);
    page.drawText(t, { x: align === "right" ? x - w : x, y: yy, size, font: f, color });
  };
  const newPage = () => {
    page = doc.addPage(A4);
    pages.push(page);
    y = A4[1] - M;
  };
  const tableHead = () => {
    text("Year", M + 4, y - 12, { f: bold, size: 9 });
    headers.forEach((h, i) => text(h, rights[i] - 4, y - 12, { f: bold, size: 9, align: "right" }));
    y -= ROW + 2;
    page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.8, color: INK });
  };

  newPage();
  text(title, M, y - 18, { f: bold, size: 18 });
  y -= 36;
  text(`Year-by-year schedule · generated ${dateText} · zenoply.com`, M, y, { size: 9, color: MUTED });
  y -= 24;

  if (summary.length) {
    for (const [label, value] of summary) {
      text(label, M, y, { size: 10, color: MUTED });
      text(typeof value === "number" ? amount(value) : value, M + W, y, { f: bold, size: 10, align: "right" });
      y -= 4;
      page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.4, color: LINE });
      y -= 13;
    }
    y -= 14;
  }

  tableHead();
  s.rows.forEach((r, i) => {
    if (y - ROW < M + 30) { newPage(); tableHead(); }
    if (i % 2 === 1) page.drawRectangle({ x: M, y: y - ROW, width: W, height: ROW, color: ZEBRA });
    const yy = y - 12;
    text(String(r.year), M + 4, yy);
    [r.principal, r.interest, r.balance].forEach((c, k) => text(num(c), rights[k] - 4, yy, { align: "right" }));
    y -= ROW;
  });
  if (y - ROW < M + 30) { newPage(); tableHead(); }
  page.drawLine({ start: { x: M, y }, end: { x: M + W, y }, thickness: 0.8, color: INK });
  text("Total", M + 4, y - 12, { f: bold });
  text(num(s.principal), rights[0] - 4, y - 12, { f: bold, align: "right" });
  text(num(s.interest), rights[1] - 4, y - 12, { f: bold, align: "right" });

  const note = "Estimates for planning only. Your lender's statement is the authority on what you owe.";
  pages.forEach((p, i) => {
    page = p;
    text(note, M, M - 20, { size: 8, color: MUTED });
    text(`Page ${i + 1} of ${pages.length}`, M + W, M - 20, { size: 8, color: MUTED, align: "right" });
  });

  return doc.save();
}
