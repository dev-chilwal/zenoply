// Unit conversion on exact rationals (BigInt numerator / denominator).
//
// Every modern unit is *defined* as an exact decimal multiple of an SI unit —
// the inch is 0.0254 m by the 1959 international agreement, the pound is
// 0.45359237 kg, the US gallon is 231 cubic inches — so a conversion between
// them is an exact fraction. Doing it in floating point instead is what makes
// converters print 0.30479999999999996 for a foot in metres or round a mile to
// 1.60934 km while calling it exact. Here the arithmetic stays exact and the
// only rounding is the one shown to the user, marked with ≈.

const gcd = (a, b) => {
  if (a < 0n) a = -a;
  if (b < 0n) b = -b;
  while (b) [a, b] = [b, a % b];
  return a;
};

export function rat(n, d = 1n) {
  if (d === 0n) throw new Error("zero denominator");
  if (d < 0n) { n = -n; d = -d; }
  const g = gcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}

export const add = (a, b) => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a, b) => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a, b) => rat(a.n * b.n, a.d * b.d);
export const div = (a, b) => rat(a.n * b.d, a.d * b.n);

/** Exact rational from a decimal literal such as "0.0254", "-1.5e3" or ".5". */
export function dec(s) {
  const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(String(s).trim());
  if (!m || (m[2] === "" && (m[3] === undefined || m[3] === ""))) return null;
  const frac = m[3] || "";
  let n = BigInt((m[2] || "0") + frac);
  let d = 10n ** BigInt(frac.length);
  const e = m[4] ? Number(m[4]) : 0;
  if (Math.abs(e) > 400) return null;
  if (e > 0) n *= 10n ** BigInt(e);
  if (e < 0) d *= 10n ** BigInt(-e);
  if (m[1] === "-") n = -n;
  return rat(n, d);
}

const r = (s) => dec(s);
const q = (a, b) => div(r(a), r(b));

// Each unit: id, singular name, plural name, symbol, and `f` — the value of one
// unit in the category's base unit, as an exact rational. Temperature is affine
// and carries `a` and `b` instead (kelvin = value × a + b).
export const CATEGORIES = [
  {
    id: "length", label: "Length", base: "m",
    units: [
      { id: "mm", name: "millimetre", plural: "millimetres", sym: "mm", f: r("0.001") },
      { id: "cm", name: "centimetre", plural: "centimetres", sym: "cm", f: r("0.01") },
      { id: "m", name: "metre", plural: "metres", sym: "m", f: r("1") },
      { id: "km", name: "kilometre", plural: "kilometres", sym: "km", f: r("1000") },
      { id: "in", name: "inch", plural: "inches", sym: "in", f: r("0.0254") },
      { id: "ft", name: "foot", plural: "feet", sym: "ft", f: r("0.3048") },
      { id: "yd", name: "yard", plural: "yards", sym: "yd", f: r("0.9144") },
      { id: "mi", name: "mile", plural: "miles", sym: "mi", f: r("1609.344") },
      { id: "nmi", name: "nautical mile", plural: "nautical miles", sym: "nmi", f: r("1852") },
      { id: "um", name: "micrometre", plural: "micrometres", sym: "µm", f: r("1e-6") },
    ],
  },
  {
    id: "weight", label: "Weight", base: "kg",
    units: [
      { id: "mg", name: "milligram", plural: "milligrams", sym: "mg", f: r("1e-6") },
      { id: "g", name: "gram", plural: "grams", sym: "g", f: r("0.001") },
      { id: "kg", name: "kilogram", plural: "kilograms", sym: "kg", f: r("1") },
      { id: "t", name: "tonne", plural: "tonnes", sym: "t", f: r("1000") },
      { id: "oz", name: "ounce", plural: "ounces", sym: "oz", f: r("0.028349523125") },
      { id: "lb", name: "pound", plural: "pounds", sym: "lb", f: r("0.45359237") },
      { id: "st", name: "stone", plural: "stone", sym: "st", f: r("6.35029318") },
      { id: "ton", name: "US ton", plural: "US tons", sym: "US ton", f: r("907.18474") },
      { id: "lton", name: "UK ton", plural: "UK tons", sym: "UK ton", f: r("1016.0469088") },
      { id: "ct", name: "carat", plural: "carats", sym: "ct", f: r("0.0002") },
    ],
  },
  {
    id: "temperature", label: "Temperature", base: "K", affine: true,
    units: [
      { id: "c", name: "degree Celsius", plural: "degrees Celsius", sym: "°C", a: r("1"), b: r("273.15") },
      { id: "f", name: "degree Fahrenheit", plural: "degrees Fahrenheit", sym: "°F", a: q("5", "9"), b: q("45967", "180") },
      { id: "k", name: "kelvin", plural: "kelvin", sym: "K", a: r("1"), b: r("0") },
      { id: "r", name: "degree Rankine", plural: "degrees Rankine", sym: "°R", a: q("5", "9"), b: r("0") },
    ],
  },
  {
    id: "volume", label: "Volume", base: "L",
    units: [
      { id: "ml", name: "millilitre", plural: "millilitres", sym: "mL", f: r("0.001") },
      { id: "l", name: "litre", plural: "litres", sym: "L", f: r("1") },
      { id: "m3", name: "cubic metre", plural: "cubic metres", sym: "m³", f: r("1000") },
      { id: "tsp", name: "US teaspoon", plural: "US teaspoons", sym: "tsp", f: r("0.00492892159375") },
      { id: "tbsp", name: "US tablespoon", plural: "US tablespoons", sym: "tbsp", f: r("0.01478676478125") },
      { id: "floz", name: "US fluid ounce", plural: "US fluid ounces", sym: "US fl oz", f: r("0.0295735295625") },
      { id: "cup", name: "US cup", plural: "US cups", sym: "cup", f: r("0.2365882365") },
      { id: "pt", name: "US pint", plural: "US pints", sym: "US pt", f: r("0.473176473") },
      { id: "qt", name: "US quart", plural: "US quarts", sym: "US qt", f: r("0.946352946") },
      { id: "gal", name: "US gallon", plural: "US gallons", sym: "US gal", f: r("3.785411784") },
      { id: "ukfloz", name: "UK fluid ounce", plural: "UK fluid ounces", sym: "UK fl oz", f: r("0.0284130625") },
      { id: "ukpt", name: "UK pint", plural: "UK pints", sym: "UK pt", f: r("0.56826125") },
      { id: "ukgal", name: "UK gallon", plural: "UK gallons", sym: "UK gal", f: r("4.54609") },
      { id: "in3", name: "cubic inch", plural: "cubic inches", sym: "in³", f: r("0.016387064") },
      { id: "ft3", name: "cubic foot", plural: "cubic feet", sym: "ft³", f: r("28.316846592") },
    ],
  },
  {
    id: "area", label: "Area", base: "m²",
    units: [
      { id: "cm2", name: "square centimetre", plural: "square centimetres", sym: "cm²", f: r("0.0001") },
      { id: "m2", name: "square metre", plural: "square metres", sym: "m²", f: r("1") },
      { id: "ha", name: "hectare", plural: "hectares", sym: "ha", f: r("10000") },
      { id: "km2", name: "square kilometre", plural: "square kilometres", sym: "km²", f: r("1000000") },
      { id: "in2", name: "square inch", plural: "square inches", sym: "in²", f: r("0.00064516") },
      { id: "ft2", name: "square foot", plural: "square feet", sym: "sq ft", f: r("0.09290304") },
      { id: "yd2", name: "square yard", plural: "square yards", sym: "sq yd", f: r("0.83612736") },
      { id: "ac", name: "acre", plural: "acres", sym: "ac", f: r("4046.8564224") },
      { id: "mi2", name: "square mile", plural: "square miles", sym: "mi²", f: r("2589988.110336") },
      // 1 cent = 1/100 acre = 435.6 sq ft; 1 guntha = 1/40 acre = 1,089 sq ft.
      // Both are fixed fractions of the acre, unlike the bigha, which changes
      // from state to state and is therefore left out.
      { id: "cent", name: "cent", plural: "cents", sym: "cent", f: r("40.468564224") },
      { id: "guntha", name: "guntha", plural: "gunthas", sym: "guntha", f: r("101.17141056") },
    ],
  },
  {
    id: "speed", label: "Speed", base: "m/s",
    units: [
      { id: "mps", name: "metre per second", plural: "metres per second", sym: "m/s", f: r("1") },
      { id: "kmh", name: "kilometre per hour", plural: "kilometres per hour", sym: "km/h", f: q("1000", "3600") },
      { id: "mph", name: "mile per hour", plural: "miles per hour", sym: "mph", f: r("0.44704") },
      { id: "kn", name: "knot", plural: "knots", sym: "kn", f: q("1852", "3600") },
      { id: "fps", name: "foot per second", plural: "feet per second", sym: "ft/s", f: r("0.3048") },
    ],
  },
  {
    id: "time", label: "Time", base: "s",
    units: [
      { id: "ms", name: "millisecond", plural: "milliseconds", sym: "ms", f: r("0.001") },
      { id: "s", name: "second", plural: "seconds", sym: "s", f: r("1") },
      { id: "min", name: "minute", plural: "minutes", sym: "min", f: r("60") },
      { id: "h", name: "hour", plural: "hours", sym: "h", f: r("3600") },
      { id: "d", name: "day", plural: "days", sym: "d", f: r("86400") },
      { id: "wk", name: "week", plural: "weeks", sym: "wk", f: r("604800") },
      // The Julian year (365.25 days) — the astronomer's year and the average
      // length of a calendar year over a leap cycle.
      { id: "yr", name: "year (365.25 days)", plural: "years (365.25 days)", sym: "yr", f: r("31557600") },
    ],
  },
  {
    id: "data", label: "Data", base: "B",
    units: [
      { id: "bit", name: "bit", plural: "bits", sym: "bit", f: q("1", "8") },
      { id: "B", name: "byte", plural: "bytes", sym: "B", f: r("1") },
      { id: "kB", name: "kilobyte", plural: "kilobytes", sym: "kB", f: r("1e3") },
      { id: "MB", name: "megabyte", plural: "megabytes", sym: "MB", f: r("1e6") },
      { id: "GB", name: "gigabyte", plural: "gigabytes", sym: "GB", f: r("1e9") },
      { id: "TB", name: "terabyte", plural: "terabytes", sym: "TB", f: r("1e12") },
      { id: "KiB", name: "kibibyte", plural: "kibibytes", sym: "KiB", f: r("1024") },
      { id: "MiB", name: "mebibyte", plural: "mebibytes", sym: "MiB", f: rat(1024n ** 2n) },
      { id: "GiB", name: "gibibyte", plural: "gibibytes", sym: "GiB", f: rat(1024n ** 3n) },
      { id: "TiB", name: "tebibyte", plural: "tebibytes", sym: "TiB", f: rat(1024n ** 4n) },
      { id: "Mbit", name: "megabit", plural: "megabits", sym: "Mbit", f: r("125000") },
      { id: "Gbit", name: "gigabit", plural: "gigabits", sym: "Gbit", f: r("125000000") },
    ],
  },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);
export const getUnit = (cat, id) => cat.units.find((u) => u.id === id);

export const toBase = (v, u) => (u.a ? add(mul(v, u.a), u.b) : mul(v, u.f));
export const fromBase = (v, u) => (u.a ? div(sub(v, u.b), u.a) : div(v, u.f));
export const convert = (v, from, to) => fromBase(toBase(v, from), to);

const FT_IN =
  /^\s*(\d+(?:\.\d+)?)\s*(?:'|′|’|ft\.?|feet|foot)\s*(?:(\d+(?:\.\d+)?)\s*(?:"|″|”|''|′′|in\.?|inch|inches)?)?\s*$/i;

/**
 * Read the input box. Returns { ok, value, ftIn? } where value is an exact
 * rational. Commas, spaces and underscores used as digit grouping are ignored.
 * A height written as 5'7", 5 ft 7 in or 5ft 7 is recognised and returned in
 * inches, with ftIn set so the caller can say how it was read.
 */
export function parseInput(text) {
  const s = String(text).trim();
  if (s === "") return { ok: false, empty: true };
  const h = FT_IN.exec(s);
  if (h && !/^\s*[\d.]+\s*$/.test(s)) {
    const ft = dec(h[1]);
    const inch = h[2] ? dec(h[2]) : rat(0n);
    return { ok: true, value: add(mul(ft, rat(12n)), inch), ftIn: { ft: h[1], inch: h[2] || "0" } };
  }
  const cleaned = s.replace(/[,_\s]/g, "").replace(/^−/, "-").replace(/×10\^?/i, "e");
  const v = dec(cleaned);
  if (!v) return { ok: false, error: "Enter a number, for example 12.5, 1,500 or 3e8." };
  return { ok: true, value: v };
}

const pow10 = (k) => 10n ** BigInt(k);
const absR = (x) => (x.n < 0n ? { n: -x.n, d: x.d } : x);

/** floor(log10(|x|)) for a non-zero rational, exactly. */
function exponent(x) {
  const { n, d } = absR(x);
  let e = n.toString().length - d.toString().length;
  // Now 10^(e-1) < n/d < 10^(e+1); settle which side.
  const cmp = (k) => (k >= 0 ? n >= d * pow10(k) : n * pow10(-k) >= d);
  while (!cmp(e)) e--;
  while (cmp(e + 1)) e++;
  return e;
}

/** Number of decimal places needed to write x exactly, or -1 if it repeats. */
function terminatingPlaces(x) {
  let d = x.d, twos = 0, fives = 0;
  while (d % 2n === 0n) { d /= 2n; twos++; }
  while (d % 5n === 0n) { d /= 5n; fives++; }
  return d === 1n ? Math.max(twos, fives) : -1;
}

const MAX_EXACT_DIGITS = 15;

/**
 * Write a rational for display. Returns { exact, mantissa, exp, plain } where
 * `plain` is set when the number reads naturally without an exponent:
 *   - exact: the shown digits are the whole value (no rounding happened);
 *   - otherwise it is rounded half-away-from-zero to `sig` significant figures.
 * Trailing zeros after the point are dropped, since ≈ already says it rounded.
 */
export function formatRational(x, sig = 6) {
  if (x.n === 0n) return { exact: true, digits: "0", exp: 0, negative: false, plain: "0" };
  const negative = x.n < 0n;
  const a = absR(x);
  let e = exponent(a);
  const places = terminatingPlaces(a);
  let digits;
  let exact = false;
  if (places >= 0) {
    const all = (a.n * pow10(places) / a.d).toString().replace(/0+$/, "");
    if (all.length <= MAX_EXACT_DIGITS) { digits = all; exact = true; }
  }
  if (!exact) {
    // digits = round(a × 10^(sig-1-e))
    const k = sig - 1 - e;
    const num = k >= 0 ? a.n * pow10(k) : a.n;
    const den = k >= 0 ? a.d : a.d * pow10(-k);
    let qd = num / den;
    if ((num % den) * 2n >= den) qd += 1n;
    if (qd >= pow10(sig)) { e += 1; qd /= 10n; }
    digits = qd.toString().replace(/0+$/, "") || "0";
  }
  const out = { exact, digits, exp: e, negative };
  if (e >= -6 && e < 16) out.plain = placePoint(digits, e);
  return out;
}

function placePoint(digits, e) {
  if (e < 0) return "0." + "0".repeat(-e - 1) + digits;
  if (digits.length <= e + 1) return digits + "0".repeat(e + 1 - digits.length);
  return digits.slice(0, e + 1) + "." + digits.slice(e + 1);
}

const group = (intPart) => intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

/** Display string: grouped thousands, or scientific with ×10 for extremes. */
export function toDisplay(f, { grouped = true } = {}) {
  const sign = f.negative ? "-" : "";
  if (f.plain !== undefined) {
    const [i, frac] = f.plain.split(".");
    return sign + (grouped ? group(i) : i) + (frac ? "." + frac : "");
  }
  const m = f.digits.length > 1 ? f.digits[0] + "." + f.digits.slice(1) : f.digits;
  return { sign, mantissa: m, exp: f.exp };
}

/** Plain-text, spreadsheet-pasteable form (no grouping, e-notation for extremes). */
export function toCopyText(f) {
  const sign = f.negative ? "-" : "";
  if (f.plain !== undefined) return sign + f.plain;
  const m = f.digits.length > 1 ? f.digits[0] + "." + f.digits.slice(1) : f.digits;
  return `${sign}${m}e${f.exp}`;
}

/**
 * A length in metres written as feet and inches, to the nearest tenth of an
 * inch and to the nearest whole inch (the way a height is usually quoted).
 * Rounding happens on the total inches first, so 5 ft 11.96 in becomes 6 ft 0 in
 * rather than 5 ft 12 in.
 */
export function feetInches(metres) {
  if (metres.n < 0n) return null;
  const totalIn = div(metres, r("0.0254"));
  const roundTo = (x, scale) => {
    const num = x.n * scale;
    let v = num / x.d;
    if ((num % x.d) * 2n >= x.d) v += 1n;
    return v;
  };
  const tenths = roundTo(totalIn, 10n);
  const whole = roundTo(totalIn, 1n);
  const t = tenths % 120n;
  return {
    ft: tenths / 120n,
    inch: t % 10n === 0n ? (t / 10n).toString() : `${t / 10n}.${t % 10n}`,
    wholeFt: whole / 12n,
    wholeIn: whole % 12n,
  };
}

const KELVIN_ZERO = rat(0n);
export const belowAbsoluteZero = (kelvin) => kelvin.n < KELVIN_ZERO.n;
