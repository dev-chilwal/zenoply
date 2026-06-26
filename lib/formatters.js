// Currency/number formatting driven by a region's locale + ISO 4217 code.
// Replaces the per-tool hardcoded `"₹" + n.toLocaleString("en-IN")` functions.
//
// Intl.NumberFormat handles symbol, placement, decimal/grouping separators
// (incl. India's 2-digit grouping) and minor-unit digits automatically, so a
// single utility covers every currency. Constructors are expensive, so we
// memoize one instance per (locale, currency, options) combination.

const cache = new Map();

function getFormatter(locale, currency, opts) {
  const key = `${locale}|${currency}|${JSON.stringify(opts)}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, { style: "currency", currency, ...opts });
    cache.set(key, f);
  }
  return f;
}

/** Whole-currency amount (no decimals) — e.g. ₹25,000 / $1,500 / ¥3,000. */
export function formatMoney(value, region, opts = {}) {
  const { locale, currency } = region;
  return getFormatter(locale, currency, { maximumFractionDigits: 0, ...opts }).format(value || 0);
}

/** Precise amount with the currency's natural minor units — e.g. $1,234.56, ¥3000. */
export function formatMoneyPrecise(value, region, opts = {}) {
  const { locale, currency } = region;
  return getFormatter(locale, currency, opts).format(value || 0);
}

/** Just the currency symbol for a region (for input prefixes). */
export function currencySymbol(region) {
  const parts = getFormatter(region.locale, region.currency, { maximumFractionDigits: 0 })
    .formatToParts(0);
  return parts.find((p) => p.type === "currency")?.value ?? region.currency;
}
