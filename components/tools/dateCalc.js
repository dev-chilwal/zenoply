// Calendar arithmetic for the age / date-difference calculator, kept out of the
// component so every rule can be asserted in node — the same reasoning as
// romanConvert.js and rupeesWords.js.
//
// Three decisions shape this file:
//
//  1. **No Date object is used for arithmetic.** `new Date("2000-01-01")` is
//     parsed as *UTC midnight* by the ISO branch of the spec, so reading
//     `getDate()` off it returns the 31st of December for anyone west of
//     Greenwich — the classic off-by-one that makes an age calculator disagree
//     with itself depending on who is looking. Dates here are plain
//     `{y, m, d}` records and everything runs on a day number produced by
//     Howard Hinnant's `days_from_civil`, which is exact integer arithmetic
//     over the proleptic Gregorian calendar. The only place a real Date is
//     touched is reading today's date off the clock, and that uses the local
//     getters rather than toISOString for the same reason.
//  2. **Months are counted by anniversary, not by borrowing.** The usual
//     implementation subtracts the day-of-month fields and borrows the length
//     of the preceding month when the result goes negative, which is what
//     java.time.Period does. It is not monotone across a month end: for
//     someone born on 31 January it reports "28 days" on 28 February and then
//     jumps straight to "1 month 1 day" on 1 March, so "1 month" is a figure
//     that never appears. This file instead defines the month count as the
//     number of monthly anniversaries that have passed — the largest k with
//     `addMonths(start, k) <= end` — which is both monotone and the thing the
//     word "month" means in an age. It costs one extra comparison.
//  3. **A short month clamps, and the clamp is reported.** 31 January plus one
//     month has no correct answer; it has a convention. The convention here is
//     the end of the short month (28 or 29 February), which is what every
//     mainstream date library does, but `diffYMD` returns a `clamped` flag so
//     the tool can say out loud that it happened rather than leaving the user
//     to wonder why their monthly anniversary moved.

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// 0 = Sunday, matching the day-number formula below.
export const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const MIN_YEAR = 1;
export const MAX_YEAR = 9999;

export const isLeapYear = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export function daysInMonth(y, m) {
  if (m === 2) return isLeapYear(y) ? 29 : 28;
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
}

/** "YYYY-MM-DD" -> {y,m,d}, or null if it is not a real calendar date. */
export function parseDate(s) {
  const match = /^(\d{1,4})-(\d{2})-(\d{2})$/.exec(String(s || "").trim());
  if (!match) return null;
  const y = Number(match[1]), m = Number(match[2]), d = Number(match[3]);
  if (y < MIN_YEAR || y > MAX_YEAR) return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > daysInMonth(y, m)) return null;
  return { y, m, d };
}

const pad = (n, w = 2) => String(n).padStart(w, "0");

export const formatISO = ({ y, m, d }) => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

export const longDate = ({ y, m, d }) => `${d} ${MONTH_NAMES[m - 1]} ${y}`;

/** Today, read from the local clock — never via toISOString, which is UTC. */
export function today() {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
}

/** Days since 1970-01-01 (days_from_civil). Exact for every year in range. */
export function dayNumber({ y, m, d }) {
  const yy = y - (m <= 2 ? 1 : 0);
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** The inverse (civil_from_days). */
export function fromDayNumber(n) {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365
  );
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return { y: y + (m <= 2 ? 1 : 0), m, d };
}

/** 0 = Sunday. 1970-01-01 (day 0) was a Thursday, hence the +4. */
export const weekdayOf = (date) => ((((dayNumber(date) + 4) % 7) + 7) % 7);

export const weekdayName = (date) => WEEKDAY_NAMES[weekdayOf(date)];

/** Whole months added, with the day clamped to the end of a shorter month. */
export function addMonths(date, n) {
  const t = date.y * 12 + (date.m - 1) + n;
  const y = Math.floor(t / 12);
  const m = ((t % 12) + 12) % 12 + 1;
  const last = daysInMonth(y, m);
  return { y, m, d: Math.min(date.d, last), clamped: date.d > last };
}

export const addDays = (date, n) => fromDayNumber(dayNumber(date) + n);

/**
 * Calendar difference as years / months / days, counting monthly anniversaries
 * (see note 2 at the top). `a` must not be after `b`.
 */
export function diffYMD(a, b) {
  let totalMonths = (b.y * 12 + b.m) - (a.y * 12 + a.m);
  let anchor = addMonths(a, totalMonths);
  if (dayNumber(anchor) > dayNumber(b)) {
    totalMonths -= 1;
    anchor = addMonths(a, totalMonths);
  }
  const days = dayNumber(b) - dayNumber(anchor);
  return {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
    days,
    totalMonths,
    anchor: { y: anchor.y, m: anchor.m, d: anchor.d },
    clamped: anchor.clamped,
  };
}

/**
 * How many days with each weekday fall in the inclusive range starting at
 * `startDayNum` and running `n` days. Index 0 = Sunday.
 */
export function weekdayCounts(startDayNum, n) {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  if (n <= 0) return counts;
  const startDow = (((startDayNum + 4) % 7) + 7) % 7;
  for (let w = 0; w < 7; w++) {
    const offset = (w - startDow + 7) % 7;
    counts[w] = offset >= n ? 0 : Math.floor((n - offset - 1) / 7) + 1;
  }
  return counts;
}

/** Every total a span can be expressed in. `a` must not be after `b`. */
export function spanStats(a, b) {
  const start = dayNumber(a);
  const totalDays = dayNumber(b) - start;
  const ymd = diffYMD(a, b);
  const counts = weekdayCounts(start, totalDays + 1); // inclusive of both dates
  const weekend = counts[0] + counts[6];
  return {
    ...ymd,
    totalDays,
    inclusiveDays: totalDays + 1,
    weeks: Math.floor(totalDays / 7),
    remainderDays: totalDays % 7,
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 1440,
    totalSeconds: totalDays * 86400,
    weekdayCounts: counts,
    workingDays: counts[1] + counts[2] + counts[3] + counts[4] + counts[5],
    weekendDays: weekend,
  };
}

/**
 * The next time the day and month of `from` comes round, strictly after `on`.
 * A 29 February date is clamped to 28 February in a common year — the same
 * convention as everything else here — and `alternative` carries the 1 March
 * reading, because which of the two counts is a matter of local law rather
 * than of arithmetic and the tool should show both.
 */
export function nextAnniversary(from, on) {
  const onNum = dayNumber(on);
  let year = on.y;
  let next = clampToYear(from, year);
  if (dayNumber(next) <= onNum) {
    year += 1;
    next = clampToYear(from, year);
  }
  const leapDay = from.m === 2 && from.d === 29;
  const clamped = leapDay && !isLeapYear(year);
  return {
    date: next,
    year,
    daysUntil: dayNumber(next) - onNum,
    ordinal: year - from.y,
    clamped,
    alternative: clamped ? { y: year, m: 3, d: 1 } : null,
  };
}

function clampToYear(date, y) {
  const last = daysInMonth(y, date.m);
  return { y, m: date.m, d: Math.min(date.d, last) };
}

/** "2 years, 1 month and 3 days", skipping any zero part. */
export function describeYMD({ years, months, days }) {
  const parts = [];
  const unit = (n, word) => `${n.toLocaleString("en-US")} ${word}${n === 1 ? "" : "s"}`;
  if (years) parts.push(unit(years, "year"));
  if (months) parts.push(unit(months, "month"));
  if (days || parts.length === 0) parts.push(unit(days, "day"));
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}
