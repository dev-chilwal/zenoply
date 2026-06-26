// Currency formatting helpers, all driven by Intl.NumberFormat so each region's
// symbol, grouping and decimal conventions come for free. `region` is the active
// config from useRegion() (it carries `locale` and `currency`).

// Whole-currency amount, e.g. "₹1,00,000" or "$10,000". Use for slider read-outs
// and result figures where sub-unit precision is noise.
export function formatMoney(value, region, opts) {
  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
    maximumFractionDigits: 0,
    ...opts,
  }).format(Number.isFinite(value) ? value : 0);
}

// Two-decimal amount, e.g. "₹1,180.00". Use where sub-units matter (tax splits).
export function formatMoneyPrecise(value, region) {
  return formatMoney(value, region, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Just the currency symbol for the active region, e.g. "₹", "$", "€", "AED".
// Used as the affix on bare number inputs.
export function currencySymbol(region) {
  const parts = new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
  }).formatToParts(0);
  const part = parts.find((p) => p.type === "currency");
  return part ? part.value : region.currency;
}
