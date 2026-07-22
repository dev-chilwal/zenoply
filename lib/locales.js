// Region config — single source of truth for currency, locale, and the few
// finance rules that genuinely differ by country. Add a country by adding a row.
//
// `scale` is a rough "INR per unit" anchor used only to derive sensible slider
// ranges from the India-based MONEY_BASE below. It is NOT a live exchange rate
// and never converts a user's entered value — it only picks nice slider bounds,
// so FX drift is irrelevant.

export const REGIONS = {
  IN: { name: "India (₹)", locale: "en-IN", currency: "INR", scale: 1,
        taxName: "GST", taxRates: [0, 3, 5, 12, 18, 28], taxStandard: 18, taxInclusiveDefault: false,
        fdCompounding: 4, mortgageCompounding: 12 },
  US: { name: "United States ($)", locale: "en-US", currency: "USD", scale: 83,
        taxName: "Sales Tax", taxRates: [0, 4, 7, 8.25, 10], taxStandard: 7, taxInclusiveDefault: false,
        fdCompounding: 12, mortgageCompounding: 12 },
  GB: { name: "United Kingdom (£)", locale: "en-GB", currency: "GBP", scale: 105,
        taxName: "VAT", taxRates: [0, 5, 20], taxStandard: 20, taxInclusiveDefault: true,
        fdCompounding: 12, mortgageCompounding: 12 },
  // The eurozone shares a currency, not a tax code — VAT rates, income tax and
  // deposit conventions all differ by member state, so each is its own region.
  // Retail prices are quoted VAT-inclusive EU-wide (Price Indication Directive
  // 98/6/EC). Term deposits conventionally credit interest annually in all four.
  DE: { name: "Germany (€)", locale: "de-DE", currency: "EUR", scale: 110,
        taxName: "VAT", taxRates: [0, 7, 19], taxStandard: 19, taxInclusiveDefault: true,
        fdCompounding: 1, mortgageCompounding: 12 },
  FR: { name: "France (€)", locale: "fr-FR", currency: "EUR", scale: 110,
        taxName: "VAT", taxRates: [0, 2.1, 5.5, 10, 20], taxStandard: 20, taxInclusiveDefault: true,
        fdCompounding: 1, mortgageCompounding: 12 },
  NL: { name: "Netherlands (€)", locale: "nl-NL", currency: "EUR", scale: 110,
        taxName: "VAT", taxRates: [0, 9, 21], taxStandard: 21, taxInclusiveDefault: true,
        fdCompounding: 1, mortgageCompounding: 12 },
  // Ireland's 9% second-reduced rate covers restaurant/catering/hot takeaway
  // food from 1 July 2026.
  IE: { name: "Ireland (€)", locale: "en-IE", currency: "EUR", scale: 110,
        taxName: "VAT", taxRates: [0, 4.8, 9, 13.5, 23], taxStandard: 23, taxInclusiveDefault: true,
        fdCompounding: 1, mortgageCompounding: 12 },
  CA: { name: "Canada ($)", locale: "en-CA", currency: "CAD", scale: 61,
        taxName: "GST/HST", taxRates: [5, 13, 15], taxStandard: 13, taxInclusiveDefault: false,
        fdCompounding: 2, mortgageCompounding: 2 /* federally regulated semi-annual */ },
  AU: { name: "Australia ($)", locale: "en-AU", currency: "AUD", scale: 55,
        taxName: "GST", taxRates: [0, 10], taxStandard: 10, taxInclusiveDefault: true,
        fdCompounding: 4, mortgageCompounding: 12 },
  AE: { name: "UAE (د.إ)", locale: "en-AE", currency: "AED", scale: 23,
        taxName: "VAT", taxRates: [0, 5], taxStandard: 5, taxInclusiveDefault: true,
        fdCompounding: 4, mortgageCompounding: 12 },
  SG: { name: "Singapore ($)", locale: "en-SG", currency: "SGD", scale: 62,
        taxName: "GST", taxRates: [0, 9], taxStandard: 9, taxInclusiveDefault: true,
        fdCompounding: 4, mortgageCompounding: 12 },
};

export const DEFAULT_REGION = "IN";

// Slider ranges expressed in INR; other currencies are derived via `scale`.
export const MONEY_BASE = {
  sipMonthly: { min: 500, max: 100000, step: 500, default: 25000 },
  lumpsum: { min: 1000, max: 10000000, step: 10000, default: 100000 },
  loan: { min: 50000, max: 10000000, step: 50000, default: 1000000 },
  mortgage: { min: 1000000, max: 150000000, step: 1000000, default: 25000000 },
  price: { min: 0, max: 1000000, step: 100, default: 1000 },
};

export const COMPOUND_LABEL = { 1: "annual", 2: "half-yearly", 4: "quarterly", 12: "monthly" };

// Round a value to a "nice" 1/2/5/10 × 10ⁿ figure so derived slider bounds stay tidy.
function niceNum(x) {
  if (x <= 0) return 0;
  const exp = Math.floor(Math.log10(x));
  const f = x / Math.pow(10, exp);
  const nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  return nf * Math.pow(10, exp);
}

// Derive a slider range for the given region's currency scale from an INR base.
// India (scale 1) passes through unchanged so existing tools are pixel-identical.
export function moneyRange(base, scale) {
  if (!scale || scale === 1) return { ...base };
  const d = (v) => niceNum(v / scale);
  let step = d(base.step) || d(base.max) / 100;
  return { min: d(base.min), max: d(base.max), step, default: d(base.default) };
}
