// Single source of truth for locale/region behaviour shared by the finance
// calculators. Each region drives currency formatting (locale + currency),
// consumption-tax labelling/rates, sensible default money amounts (scale), and
// the compounding conventions used by the FD and mortgage calculators.
//
// Fields per region:
//   label              short display name for the header chooser (plain ASCII)
//   locale             BCP-47 tag used by Intl.NumberFormat
//   currency           ISO 4217 code used by Intl.NumberFormat
//   scale              multiplier applied to the INR-baseline default money
//                      amounts (IN = 1). Picks round demo numbers per currency,
//                      not an FX rate.
//   taxName            what the consumption tax is called ("GST" / "VAT" /
//                      "Sales Tax" / "GST/HST")
//   taxRates           selectable rate slabs (%), ascending, for the dropdown
//   taxStandardRate    the rate selected by default / on region change
//   taxInclusiveDefault  true  -> prices usually quoted tax-inclusive
//                        (GST calculator opens in "remove" mode)
//                        false -> quoted tax-exclusive ("add" mode)
//   fdCompounding        times per year a fixed deposit compounds
//   mortgageCompounding  times per year mortgage interest compounds
//                        (Canada compounds semi-annually = 2; most others 12)

// Baseline default money amount (in the IN scale=1 currency unit). Other
// defaults across the calculators are expressed relative to this and scaled by
// the region's `scale` via moneyRange().
export const MONEY_BASE = 1000;

export const REGIONS = {
  IN: {
    label: "India",
    locale: "en-IN",
    currency: "INR",
    scale: 1,
    taxName: "GST",
    taxRates: [0, 3, 5, 12, 18, 28],
    taxStandardRate: 18,
    taxInclusiveDefault: false,
    fdCompounding: 4, // most Indian banks compound FD interest quarterly
    mortgageCompounding: 12,
  },
  US: {
    label: "USA",
    locale: "en-US",
    currency: "USD",
    scale: 0.1,
    taxName: "Sales Tax",
    taxRates: [0, 4, 6, 7.25, 8.25, 10],
    taxStandardRate: 7.25,
    taxInclusiveDefault: false,
    fdCompounding: 12,
    mortgageCompounding: 12,
  },
  GB: {
    label: "UK",
    locale: "en-GB",
    currency: "GBP",
    scale: 0.1,
    taxName: "VAT",
    taxRates: [0, 5, 20],
    taxStandardRate: 20,
    taxInclusiveDefault: true,
    fdCompounding: 1,
    mortgageCompounding: 12,
  },
  EU: {
    label: "Eurozone",
    locale: "en-IE",
    currency: "EUR",
    scale: 0.1,
    taxName: "VAT",
    taxRates: [0, 9, 19, 21],
    taxStandardRate: 21,
    taxInclusiveDefault: true,
    fdCompounding: 1,
    mortgageCompounding: 12,
  },
  AU: {
    label: "Australia",
    locale: "en-AU",
    currency: "AUD",
    scale: 0.1,
    taxName: "GST",
    taxRates: [0, 10],
    taxStandardRate: 10,
    taxInclusiveDefault: true,
    fdCompounding: 4,
    mortgageCompounding: 12,
  },
  CA: {
    label: "Canada",
    locale: "en-CA",
    currency: "CAD",
    scale: 0.1,
    taxName: "GST/HST",
    taxRates: [0, 5, 13, 15],
    taxStandardRate: 13,
    taxInclusiveDefault: false,
    fdCompounding: 2,
    mortgageCompounding: 2, // Canadian mortgages compound semi-annually
  },
  SG: {
    label: "Singapore",
    locale: "en-SG",
    currency: "SGD",
    scale: 0.1,
    taxName: "GST",
    taxRates: [0, 9],
    taxStandardRate: 9,
    taxInclusiveDefault: true,
    fdCompounding: 4,
    mortgageCompounding: 12,
  },
  AE: {
    label: "UAE",
    locale: "en-AE",
    currency: "AED",
    scale: 0.1,
    taxName: "VAT",
    taxRates: [0, 5],
    taxStandardRate: 5,
    taxInclusiveDefault: false,
    fdCompounding: 4,
    mortgageCompounding: 12,
  },
};

export const DEFAULT_REGION = "IN";

// Adjective label for a "times per year" compounding frequency, e.g. for
// "Assumes <label> compounding." (used by the FD and mortgage calculators).
export function compoundingLabel(n) {
  return { 1: "annual", 2: "semi-annual", 4: "quarterly", 12: "monthly", 365: "daily" }[n] || `${n}x-per-year`;
}

// Round n to a "nice" 1 / 2 / 5 x 10^k value so scaled slider steps and bounds
// stay tidy across currencies.
function niceNumber(n) {
  if (!(n > 0)) return 0;
  const mag = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / mag;
  const nice = f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10;
  return nice * mag;
}

// Scale a base money range to a region. `base` holds amounts in the IN baseline
// (scale = 1): any of { min, max, step, default }. Returns the same shape scaled
// by `scale`, with a tidy step and the other values snapped to whole steps so
// sliders behave. Omitted fields are omitted from the result.
export function moneyRange(base, scale) {
  const step = Math.max(1, niceNumber((base.step ?? 1) * scale));
  const snap = (v) => Math.round((v * scale) / step) * step;
  const out = { step };
  if (base.min != null) out.min = base.min > 0 ? Math.max(step, snap(base.min)) : 0;
  if (base.max != null) out.max = snap(base.max);
  if (base.default != null) {
    let d = snap(base.default);
    if (out.min != null) d = Math.max(out.min, d);
    if (out.max != null) d = Math.min(out.max, d);
    out.default = d;
  }
  return out;
}
