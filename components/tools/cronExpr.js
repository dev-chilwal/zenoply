// Cron expression parsing, plain-English description and next-run computation,
// kept out of the component so it can be exercised in node against real
// schedulers (cron-parser, cronstrue) rather than against a second copy of the
// same guess. Same reasoning as rupeesWords.js, jsonYaml.js, xmlFormat.js and
// escapeString.js.
//
// Five things drive the design, and only the first is obvious:
//
//  1. "Cron" is not one language. A crontab takes five fields, node-cron and
//     Spring take six, Quartz takes six or seven and renumbers the days of the
//     week so that 1 is Sunday rather than Monday. The same six characters mean
//     different days in different schedulers, so the dialect is an input, not
//     something to be guessed at silently.
//  2. Day-of-month and day-of-week are OR'd, not AND'd. crontab(5) says it
//     plainly - "if both fields are restricted, the command will be run when
//     either field matches" - and it is the single most surprising thing in
//     cron. Vixie decides "restricted" by looking at whether the field text
//     *starts with* a `*`, so `*/2` is unrestricted and `1-31` is not, even
//     though they cover the same days. That literal test is reproduced here.
//  3. The search runs on wall-clock fields, then converts. Cron matches the
//     server's local clock, so the fields are searched in local time and only
//     the answer is turned into an instant. That is also the only way to notice
//     that a wall-clock time does not exist, or happens twice, on a DST day.
//  4. Some expressions never run. `0 0 30 2 *` is perfectly well-formed and
//     will never fire. A next-run search has to be able to give up and say so
//     rather than spin.
//  5. Steps, ranges and names are expanded before the day-of-week renumbering,
//     not after. `5-7` in a crontab means Fri, Sat, Sun; mapping 7 to 0 first
//     turns it into the empty-looking range 5-0.

const pad = (n) => String(n).padStart(2, "0");

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const MONTH_FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const NTH_WORD = ["", "first", "second", "third", "fourth", "fifth"];

export const DIALECTS = [
  { value: "standard", label: "Standard crontab (5 fields)", fields: 5 },
  { value: "seconds", label: "6-field with seconds (node-cron, Spring)", fields: 6 },
  { value: "quartz", label: "Quartz / AWS (6 or 7 fields)", fields: 6 },
];

// ---------------------------------------------------------------------------
// Field specifications per dialect
// ---------------------------------------------------------------------------

// `raw` is the number space the text is written in; `map` moves a raw value
// into the internal space. Only day-of-week ever needs a map, and it needs one
// because Vixie writes Sunday as both 0 and 7 while Quartz writes it as 1.
function specsFor(dialect) {
  const second = { key: "second", name: "Seconds", min: 0, max: 59, unit: "second" };
  const minute = { key: "minute", name: "Minutes", min: 0, max: 59, unit: "minute" };
  const hour = { key: "hour", name: "Hours", min: 0, max: 23, unit: "hour" };
  const dom = { key: "dom", name: "Day of month", min: 1, max: 31, unit: "day of the month", dayField: true };
  const month = { key: "month", name: "Month", min: 1, max: 12, unit: "month", names: MONTH_NAMES, nameBase: 1 };

  if (dialect === "quartz") {
    const dow = {
      key: "dow", name: "Day of week", min: 1, max: 7, unit: "day of the week",
      names: DOW_NAMES, nameBase: 1, map: (v) => v - 1, size: 7, dayField: true,
    };
    const year = { key: "year", name: "Year", min: 1970, max: 2199, unit: "year", optional: true };
    return { list: [second, minute, hour, dom, month, dow, year], question: true, quartzExt: true };
  }

  // Vixie and the six-field schedulers that copy it: 0 and 7 are both Sunday.
  const dow = {
    key: "dow", name: "Day of week", min: 0, max: 7, unit: "day of the week",
    names: DOW_NAMES, nameBase: 0, map: (v) => v % 7, size: 7, dayField: true,
  };
  const list = dialect === "seconds"
    ? [second, minute, hour, dom, month, dow]
    : [minute, hour, dom, month, dow];
  return { list, question: false, quartzExt: false };
}

const NICKNAMES = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};

// ---------------------------------------------------------------------------
// Calendar helpers (plain UTC arithmetic on wall-clock fields; no zone here)
// ---------------------------------------------------------------------------

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const MDAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const daysInMonth = (y, m) => (m === 2 && isLeap(y) ? 29 : MDAYS[m - 1]);
export const dowOf = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();

function lastWeekdayOf(y, m) {
  let d = daysInMonth(y, m);
  while (dowOf(y, m, d) === 0 || dowOf(y, m, d) === 6) d--;
  return d;
}

// Quartz `15W`: the weekday nearest the 15th, never crossing into another
// month - so the 1st on a Saturday moves forward to Monday the 3rd rather than
// back into the previous month.
function nearestWeekdayTo(y, m, target) {
  const dim = daysInMonth(y, m);
  const d = Math.min(target, dim);
  const w = dowOf(y, m, d);
  if (w === 6) return d - 1 >= 1 ? d - 1 : d + 2;
  if (w === 0) return d + 1 <= dim ? d + 1 : d - 2;
  return d;
}

function lastDowOf(y, m, dow) {
  let d = daysInMonth(y, m);
  while (dowOf(y, m, d) !== dow) d--;
  return d;
}

function nthDowOf(y, m, dow, n) {
  const first = 1 + ((dow - dowOf(y, m, 1) + 7) % 7);
  const d = first + 7 * (n - 1);
  return d <= daysInMonth(y, m) ? d : null;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

class CronError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

// The complete set of shapes Quartz allows in each day field beyond the ordinary
// number/name grammar. Anchored, so WED, JUL and SAT fall straight through.
const DAY_EXT_RE = {
  dom: /^(L|LW|L-\d+|\d+W)$/i,
  dow: /^(L|(?:\d+|[A-Za-z]{3})L|(?:\d+|[A-Za-z]{3})#[1-5])$/i,
};

function resolveToken(tok, spec) {
  if (spec.names) {
    const i = spec.names.indexOf(tok.toUpperCase());
    if (i >= 0) return i + spec.nameBase;
  }
  if (!/^\d+$/.test(tok)) {
    throw new CronError(
      `"${tok}" is not a valid ${spec.name.toLowerCase()} value.` +
        (spec.names ? ` Use a number from ${spec.min} to ${spec.max}, or a name like ${spec.names[0]}.` : ` Use a number from ${spec.min} to ${spec.max}.`),
      spec.key
    );
  }
  const n = Number(tok);
  if (n < spec.min || n > spec.max) {
    throw new CronError(`${n} is out of range for ${spec.name.toLowerCase()} — it must be between ${spec.min} and ${spec.max}.`, spec.key);
  }
  return n;
}

// One comma-separated part -> a segment plus the raw values it covers.
function parsePart(part, spec, ctx) {
  const seg = { text: part };
  const out = [];

  // Quartz day extensions, matched by exact shape rather than by looking for an
  // L, W or # anywhere in the text. A loose search misreads WED as a W form and
  // JUL as a name with an L on the end; every shape below is anchored, and none
  // of them can match a bare three-letter name.
  if (spec.dayField && DAY_EXT_RE[spec.key].test(part)) {
    if (!ctx.quartzExt) {
      throw new CronError(
        `"${part}" uses L, W or # — those are Quartz extensions. The crontab on Linux and macOS does not understand them; switch the dialect to Quartz, or write the days out.`,
        spec.key
      );
    }
    const P = part.toUpperCase();
    if (spec.key === "dom") {
      if (P === "L") { seg.kind = "lastDom"; seg.offset = 0; ctx.lastDom.push(0); return { seg, values: [] }; }
      if (P === "LW") { seg.kind = "lastWeekday"; ctx.lastWeekday = true; return { seg, values: [] }; }
      let m = /^L-(\d+)$/.exec(P);
      if (m) {
        const off = Number(m[1]);
        if (off > 30) throw new CronError(`L-${off} is more than a month before the last day.`, spec.key);
        seg.kind = "lastDom"; seg.offset = off; ctx.lastDom.push(off); return { seg, values: [] };
      }
      m = /^(\d+)W$/.exec(P);
      if (m) {
        const d = resolveToken(m[1], spec);
        seg.kind = "nearestWeekday"; seg.day = d; ctx.nearest.push(d); return { seg, values: [] };
      }
      throw new CronError(`"${part}" is not a valid day-of-month value. Quartz allows L, L-3, LW and 15W.`, spec.key);
    }
    // day of week
    const P2 = part.toUpperCase();
    if (P2 === "L") { seg.kind = "lastDow"; seg.dow = 6; ctx.lastDow.push(6); return { seg, values: [] }; }
    let m = /^(\d+|[A-Z]{3})L$/.exec(P2);
    if (m) {
      const raw = resolveToken(m[1], spec);
      const dow = spec.map ? spec.map(raw) : raw;
      seg.kind = "lastDow"; seg.dow = dow; ctx.lastDow.push(dow); return { seg, values: [] };
    }
    m = /^(\d+|[A-Z]{3})#([1-5])$/.exec(P2);
    if (m) {
      const raw = resolveToken(m[1], spec);
      const dow = spec.map ? spec.map(raw) : raw;
      const n = Number(m[2]);
      seg.kind = "nth"; seg.dow = dow; seg.n = n; ctx.nth.push({ dow, n }); return { seg, values: [] };
    }
    throw new CronError(`"${part}" is not a valid day-of-week value. Quartz allows 6L (last Friday) and 6#3 (third Friday).`, spec.key);
  }

  const slash = part.split("/");
  if (slash.length > 2) throw new CronError(`"${part}" has more than one / in it.`, spec.key);
  const base = slash[0];
  let step = 1;
  if (slash.length === 2) {
    if (!/^\d+$/.test(slash[1])) throw new CronError(`"${slash[1]}" is not a valid step in "${part}".`, spec.key);
    step = Number(slash[1]);
    if (step === 0) throw new CronError(`A step of 0 in "${part}" would never advance.`, spec.key);
    if (step > spec.max - spec.min + 1) {
      ctx.warnings.push(`In ${spec.name.toLowerCase()}, the step in "${part}" is larger than the whole field, so only the first value is ever matched.`);
    }
  }

  let lo, hi, kind;
  if (base === "*") {
    lo = spec.min; hi = spec.max; kind = slash.length === 2 ? "stepAll" : "all";
  } else if (base === "?") {
    if (!ctx.question) throw new CronError(`? is a Quartz extension. In a crontab, write * instead.`, spec.key);
    lo = spec.min; hi = spec.max; kind = "question";
  } else if (base.includes("-")) {
    const bits = base.split("-");
    if (bits.length !== 2) throw new CronError(`"${base}" is not a valid range.`, spec.key);
    lo = resolveToken(bits[0], spec);
    hi = resolveToken(bits[1], spec);
    kind = slash.length === 2 ? "stepRange" : "range";
  } else {
    lo = resolveToken(base, spec);
    if (slash.length === 2) {
      // `5/15` is not in the original Vixie grammar, but cronie, Quartz,
      // croniter and every JS parser read it as 5 to the top of the field.
      hi = spec.max; kind = "stepFrom";
      ctx.warnings.push(`In ${spec.name.toLowerCase()}, "${part}" is read as ${lo} to ${spec.max} in steps of ${step}. Classic Vixie cron wants a full range here — write ${lo}-${spec.max}/${step} if the target is a plain crontab.`);
    } else {
      hi = lo; kind = "single";
    }
  }

  const span = spec.max - spec.min + 1;
  if (hi < lo) {
    // Quartz and several schedulers wrap NOV-FEB round the end of the field;
    // Vixie rejects it outright, so it is accepted and flagged rather than
    // silently doing something a crontab would refuse to load.
    ctx.warnings.push(`In ${spec.name.toLowerCase()}, "${part}" runs backwards and wraps past the end of the field. Quartz allows that; Vixie cron rejects a reversed range — write it as two parts instead.`);
    seg.wrapped = true;
    for (let v = lo; v <= spec.max; v += step) out.push(v);
    const startAgain = spec.min + ((step - ((spec.max - lo + 1) % step)) % step);
    for (let v = startAgain; v <= hi; v += step) out.push(v);
  } else {
    for (let v = lo; v <= hi; v += step) out.push(v);
  }

  seg.kind = kind;
  seg.lo = lo;
  seg.hi = hi;
  seg.step = step;
  seg.span = span;
  return { seg, values: out };
}

function parseField(text, spec, ctxOuter) {
  const ctx = {
    question: ctxOuter.question,
    quartzExt: ctxOuter.quartzExt,
    warnings: ctxOuter.warnings,
    lastDom: [], lastWeekday: false, nearest: [], lastDow: [], nth: [],
  };
  const parts = text.split(",");
  const segs = [];
  const raw = new Set();
  for (const p of parts) {
    if (p === "") throw new CronError(`"${text}" has an empty item in its list.`, spec.key);
    const { seg, values } = parsePart(p, spec, ctx);
    segs.push(seg);
    for (const v of values) raw.add(v);
  }

  const mapped = new Set();
  for (const v of raw) mapped.add(spec.map ? spec.map(v) : v);

  const size = spec.size || spec.max - spec.min + 1;
  const values = [...mapped].sort((a, b) => a - b);
  const hasSpecial = ctx.lastDom.length > 0 || ctx.lastWeekday || ctx.nearest.length > 0 || ctx.lastDow.length > 0 || ctx.nth.length > 0;

  return {
    key: spec.key, name: spec.name, unit: spec.unit, text,
    min: spec.map ? 0 : spec.min,
    max: spec.map ? size - 1 : spec.max,
    values,
    set: mapped,
    segs,
    all: !hasSpecial && values.length === size,
    // Vixie's own test for "is this field restricted" is a literal look at the
    // first character, which is why 1-31 counts as restricted and */2 does not.
    star: text[0] === "*" || text[0] === "?",
    question: text[0] === "?",
    lastDom: ctx.lastDom,
    lastWeekday: ctx.lastWeekday,
    nearest: ctx.nearest,
    lastDow: ctx.lastDow,
    nth: ctx.nth,
    hasSpecial,
  };
}

export function parseCron(expression, dialect = "standard") {
  const warnings = [];
  const notes = [];
  let expr = (expression || "").trim();
  if (!expr) return { ok: false, error: "Enter a cron expression." };

  let nickname = null;
  if (expr[0] === "@") {
    const key = expr.toLowerCase();
    if (key === "@reboot") {
      return {
        ok: true,
        cron: { reboot: true, dialect, expression: expr, fields: [], warnings, notes },
      };
    }
    if (!NICKNAMES[key]) {
      return {
        ok: false,
        error: `"${expr}" is not a cron nickname. The ones cron understands are @yearly, @annually, @monthly, @weekly, @daily, @midnight, @hourly and @reboot.`,
      };
    }
    nickname = key;
    expr = NICKNAMES[key];
    dialect = "standard";
    notes.push(`${key} is crontab shorthand for ${expr}.`);
  }

  const spec = specsFor(dialect);
  const tokens = expr.split(/\s+/);
  const required = spec.list.filter((s) => !s.optional).length;
  const allowed = spec.list.length;

  if (tokens.length < required || tokens.length > allowed) {
    const want = required === allowed ? `${required}` : `${required} or ${allowed}`;
    const other = tokens.length === 5 ? "Standard crontab (5 fields)"
      : tokens.length === 6 ? "6-field with seconds, or Quartz"
      : tokens.length === 7 ? "Quartz (7 fields, with a year)"
      : null;
    return {
      ok: false,
      error:
        `This has ${tokens.length} field${tokens.length === 1 ? "" : "s"}, but the ${DIALECTS.find((d) => d.value === dialect).label} takes ${want}.` +
        (other ? ` A ${tokens.length}-field expression belongs to: ${other}.` : ""),
    };
  }

  const fields = {};
  const order = [];
  try {
    tokens.forEach((tok, i) => {
      const s = spec.list[i];
      const f = parseField(tok, s, { ...spec, warnings });
      fields[s.key] = f;
      order.push(f);
    });
  } catch (e) {
    if (e instanceof CronError) return { ok: false, error: e.message, field: e.field };
    throw e;
  }

  const dom = fields.dom;
  const dow = fields.dow;

  if (dialect === "quartz") {
    if (dom.question && dow.question) {
      return { ok: false, error: "Quartz needs exactly one of day-of-month and day-of-week to be ?, not both. Put * in the one you want to run on every value." };
    }
    if (!dom.question && !dow.question) {
      return {
        ok: false,
        error: "Quartz needs a ? in either day-of-month or day-of-week, because it will not schedule on both at once. If you meant every day of the month, write: " +
          [fields.second.text, fields.minute.text, fields.hour.text, dom.text, fields.month.text, "?"].join(" "),
      };
    }
  }

  // The OR rule. Vixie: if neither day field starts with *, either one matching
  // is enough. Quartz always has a ? in one of them, so it is always an AND.
  const orMode = !dom.star && !dow.star;
  if (orMode) {
    notes.push(
      "Both day-of-month and day-of-week are restricted, so this runs when EITHER matches, not both. That is what crontab(5) specifies, and it is the most common cron surprise."
    );
  }

  if (dialect !== "quartz" && dow.text.includes("7")) {
    notes.push("In a crontab both 0 and 7 mean Sunday, so a 7 here is the same day as a 0.");
  }
  if (dialect === "quartz") {
    notes.push("Quartz numbers the days of the week from 1 = Sunday, so 2 is Monday and 6 is Friday — one higher than a crontab.");
  }

  const cron = {
    dialect, expression: expr, original: expression.trim(), nickname,
    fields, order, orMode, warnings, notes,
    hasSeconds: !!fields.second,
    hasYear: !!fields.year,
    reboot: false,
  };

  const never = neverRunsReason(cron);
  if (never) cron.never = never;

  return { ok: true, cron };
}

// A month/day pair that can never coexist is worth naming up front rather than
// letting the search grind through a decade before giving up.
function neverRunsReason(cron) {
  const dom = cron.fields.dom;
  const month = cron.fields.month;
  if (cron.orMode || dom.hasSpecial || dom.all) return null;
  // The smallest day asked for has to fit in the longest month allowed; if even
  // that fails there is no date left for any of the others either.
  const minDay = Math.min(...dom.values);
  const longest = Math.max(...[...month.set].map((m) => (m === 2 ? 29 : MDAYS[m - 1])));
  if (minDay > longest) {
    const names = [...month.set].map((m) => MONTH_FULL[m - 1]).join(", ");
    return `Day ${minDay} does not exist in ${names}, so this expression can never run.`;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

function domMatches(cron, y, m, d) {
  const f = cron.fields.dom;
  if (f.question) return true;
  if (f.set.has(d)) return true;
  const dim = daysInMonth(y, m);
  for (const off of f.lastDom) if (d === dim - off) return true;
  if (f.lastWeekday && d === lastWeekdayOf(y, m)) return true;
  for (const t of f.nearest) if (d === nearestWeekdayTo(y, m, t)) return true;
  return false;
}

function dowMatches(cron, y, m, d) {
  const f = cron.fields.dow;
  if (f.question) return true;
  const w = dowOf(y, m, d);
  if (f.set.has(w)) return true;
  for (const t of f.lastDow) if (w === t && d === lastDowOf(y, m, t)) return true;
  for (const t of f.nth) if (w === t.dow && d === nthDowOf(y, m, t.dow, t.n)) return true;
  return false;
}

export function dayMatches(cron, y, m, d) {
  const a = domMatches(cron, y, m, d);
  const b = dowMatches(cron, y, m, d);
  return cron.orMode ? a || b : a && b;
}

export function matches(cron, w) {
  if (cron.reboot) return false;
  const f = cron.fields;
  if (f.year && !f.year.set.has(w.y)) return false;
  if (!f.month.set.has(w.mo)) return false;
  if (!dayMatches(cron, w.y, w.mo, w.d)) return false;
  if (!f.hour.set.has(w.h)) return false;
  if (!f.minute.set.has(w.mi)) return false;
  if (f.second && !f.second.set.has(w.s)) return false;
  if (!f.second && w.s !== 0) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Wall-clock search
// ---------------------------------------------------------------------------

// Far enough that a legitimately rare schedule - 29 February is the extreme,
// and can skip eight years - produces a full list rather than a short one, but
// still bounded so an expression that can never fire terminates.
const HORIZON_YEARS = 50;

// Advance field by field, resetting everything finer whenever a coarser field
// moves. Returns null once the horizon is passed, which is how an expression
// that can never fire terminates.
function nextWall(cron, start, horizonYear) {
  const f = cron.fields;
  let { y, mo, d, h, mi, s } = start;

  for (let guard = 0; guard < 500000; guard++) {
    if (y > horizonYear) return null;
    if (f.year && !f.year.set.has(y)) {
      if (y > f.year.max) return null;
      y++; mo = 1; d = 1; h = 0; mi = 0; s = 0; continue;
    }
    if (mo > 12) { y++; mo = 1; d = 1; h = 0; mi = 0; s = 0; continue; }
    if (!f.month.set.has(mo)) { mo++; d = 1; h = 0; mi = 0; s = 0; continue; }
    if (d > daysInMonth(y, mo)) { mo++; d = 1; h = 0; mi = 0; s = 0; continue; }
    if (!dayMatches(cron, y, mo, d)) { d++; h = 0; mi = 0; s = 0; continue; }
    if (h > 23) { d++; h = 0; mi = 0; s = 0; continue; }
    if (!f.hour.set.has(h)) { h++; mi = 0; s = 0; continue; }
    if (mi > 59) { h++; mi = 0; s = 0; continue; }
    if (!f.minute.set.has(mi)) { mi++; s = 0; continue; }
    if (s > 59) { mi++; s = 0; continue; }
    if (f.second) {
      if (!f.second.set.has(s)) { s++; continue; }
    } else if (s !== 0) { mi++; s = 0; continue; }
    return { y, mo, d, h, mi, s };
  }
  return null;
}

function bumpWall(w, unit) {
  const n = { ...w };
  if (unit === "second") n.s += 1; else { n.mi += 1; n.s = 0; }
  return n;
}

// ---------------------------------------------------------------------------
// Time zones
// ---------------------------------------------------------------------------

const dtfCache = new Map();
function dtf(tz) {
  let f = dtfCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    dtfCache.set(tz, f);
  }
  return f;
}

export function wallOf(ts, tz) {
  const p = {};
  for (const part of dtf(tz).formatToParts(new Date(ts))) {
    if (part.type !== "literal") p[part.type] = Number(part.value);
  }
  return { y: p.year, mo: p.month, d: p.day, h: p.hour, mi: p.minute, s: p.second };
}

const wallToUTC = (w) => Date.UTC(w.y, w.mo - 1, w.d, w.h, w.mi, w.s);

// Offset of `tz` at instant ts, in ms, as (wall clock read as UTC) - ts.
// The instant is floored to the second first: a wall clock only has second
// resolution, so without the floor a ts carrying milliseconds reports an offset
// short by that fraction, and no two offsets ever compare equal. That silently
// broke the transition search below, which is the only caller that ever passes
// an instant that is not already second-aligned.
function tzOffset(ts, tz) {
  const t = Math.floor(ts / 1000) * 1000;
  return wallToUTC(wallOf(t, tz)) - t;
}

// Every instant whose wall clock in `tz` is exactly `w`. Zero of them means the
// clock skipped that time (spring forward); two means it happened twice
// (autumn). Only offsets a day either side can apply, so those are the only
// two candidates worth testing, and each is kept only if it round-trips.
export function instantsFor(w, tz) {
  const asUTC = wallToUTC(w);
  const offs = new Set([tzOffset(asUTC - 86400000, tz), tzOffset(asUTC + 86400000, tz)]);
  const out = [];
  for (const o of offs) {
    const ts = asUTC - o;
    if (tzOffset(ts, tz) === o) out.push(ts);
  }
  return out.sort((a, b) => a - b);
}

// The instant the clock jumps, bracketed between the offset before and after.
// Used for a run time that landed inside a spring-forward gap: crontab(5) says
// jobs skipped by a forward change are run soon after it.
function transitionAfter(w, tz) {
  const asUTC = wallToUTC(w);
  let lo = asUTC - 86400000;
  let hi = asUTC + 86400000;
  const target = tzOffset(hi, tz);
  if (tzOffset(lo, tz) === target) return null;
  while (hi - lo > 1000) {
    const mid = Math.floor((lo + hi) / 2000) * 1000;
    if (mid <= lo || mid >= hi) break;
    if (tzOffset(mid, tz) === target) hi = mid; else lo = mid;
  }
  return hi;
}

export function localTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// ---------------------------------------------------------------------------
// Next runs
// ---------------------------------------------------------------------------

export function nextRuns(cron, { from = Date.now(), tz = "UTC", count = 5 } = {}) {
  if (cron.reboot) return { runs: [], exhausted: false, reboot: true };
  const unit = cron.hasSeconds ? "second" : "minute";
  const startWall = wallOf(from, tz);
  const horizonYear = startWall.y + HORIZON_YEARS;

  let cursor = bumpWall({ ...startWall, s: cron.hasSeconds ? startWall.s : 0 }, unit);
  const runs = [];
  let last = -Infinity;

  for (let i = 0; i < count * 4 && runs.length < count; i++) {
    const w = nextWall(cron, cursor, horizonYear);
    if (!w) return { runs, exhausted: true };

    const cands = instantsFor(w, tz);
    let ts;
    let note = null;
    if (cands.length === 1) {
      ts = cands[0];
    } else if (cands.length > 1) {
      // Listed once, on the first pass. crontab(5) is explicit that a job set
      // for a particular time is not re-run in a repeated interval; schedulers
      // that simply follow the wall clock, which is most JS and Java libraries,
      // do run it in both hours. The note says so rather than the list quietly
      // picking a side.
      ts = cands[0];
      note = "This local time happens twice — the clock goes back an hour. Linux cron will not re-run a fixed-time job in the repeated hour, so it is listed once; a scheduler that just follows the wall clock runs it in both.";
    } else {
      ts = transitionAfter(w, tz);
      note = `${pad(w.h)}:${pad(w.mi)} does not exist on this date — the clock jumps forward. crontab(5) says a job skipped by a forward change is run soon after it, which is the time shown.`;
      if (ts == null) ts = wallToUTC(w);
    }

    if (ts > last) {
      runs.push({ ts, wall: w, note });
      last = ts;
    }
    cursor = bumpWall(w, unit);
  }
  return { runs, exhausted: false };
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON_ABBR = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function clockText(h, mi, s, hour12) {
  const tail = s == null ? "" : ":" + pad(s);
  if (!hour12) return `${pad(h)}:${pad(mi)}${tail}`;
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${pad(mi)}${tail} ${suffix}`;
}

// Deterministic and locale-independent, so the same string comes out in node
// and in every browser.
export function formatRun(run, { seconds = false, hour12 = false } = {}) {
  const w = run.wall;
  const dow = DAY_ABBR[dowOf(w.y, w.mo, w.d)];
  return `${dow} ${w.d} ${MON_ABBR[w.mo - 1]} ${w.y}, ${clockText(w.h, w.mi, seconds ? w.s : null, hour12)}`;
}

export function relativeText(ts, now) {
  let ms = ts - now;
  const ahead = ms >= 0;
  ms = Math.abs(ms);
  const mins = Math.round(ms / 60000);
  let out;
  if (mins < 1) out = "less than a minute";
  else if (mins < 60) out = `${mins} minute${mins === 1 ? "" : "s"}`;
  else if (mins < 60 * 48) {
    const h = Math.round(mins / 60);
    out = `${h} hour${h === 1 ? "" : "s"}`;
  } else {
    const d = Math.round(mins / 1440);
    out = `${d} day${d === 1 ? "" : "s"}`;
  }
  return ahead ? `in ${out}` : `${out} ago`;
}

// ---------------------------------------------------------------------------
// Description
// ---------------------------------------------------------------------------

const ordinal = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

function joinList(items) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
}

const onlyValue = (f) => (f && !f.hasSpecial && f.values.length === 1 ? f.values[0] : null);

// A field written as one plain `*/n`, which is what makes "every 5 minutes"
// truthful rather than an approximation of an arbitrary list.
function simpleStep(f) {
  if (!f || f.segs.length !== 1) return null;
  // A step wider than the field matches exactly one value, so `*/90` in minutes
  // is not "every 90 minutes" - it is minute 0, once an hour. Describing it by
  // its step would restate the mistake the warning is trying to point out.
  if (f.values.length < 2) return null;
  const s = f.segs[0];
  if (s.kind === "stepAll" && s.step > 1) return { step: s.step, full: true, lo: s.lo, hi: s.hi };
  if ((s.kind === "stepRange" || s.kind === "stepFrom") && s.step > 1) return { step: s.step, full: false, lo: s.lo, hi: s.hi };
  return null;
}

function contiguousRange(f) {
  if (!f || f.hasSpecial || f.values.length < 2) return null;
  const v = f.values;
  for (let i = 1; i < v.length; i++) if (v[i] !== v[i - 1] + 1) return null;
  return { lo: v[0], hi: v[v.length - 1] };
}

function secondPhrase(f) {
  if (!f) return null;
  const one = onlyValue(f);
  if (one === 0) return null;
  if (f.all) return "every second";
  const st = simpleStep(f);
  if (st) return st.full ? `every ${st.step} seconds` : `every ${st.step} seconds from second ${st.lo} through ${st.hi}`;
  if (one != null) return `at second ${one}`;
  const r = contiguousRange(f);
  if (r) return `every second from ${r.lo} through ${r.hi}`;
  return `at seconds ${joinList(f.values.map(String))}`;
}

function minutePhrase(f, hourAll) {
  const past = hourAll ? "past every hour" : "past the hour";
  if (f.all) return "every minute";
  const st = simpleStep(f);
  if (st) return st.full ? `every ${st.step} minutes` : `every ${st.step} minutes from minute ${st.lo} through ${st.hi}`;
  const one = onlyValue(f);
  if (one != null) return `at minute ${one} ${past}`;
  const r = contiguousRange(f);
  if (r) return `every minute from ${r.lo} through ${r.hi} ${past}`;
  return `at minutes ${joinList(f.values.map(String))} ${past}`;
}

function hourPhrase(f, hour12) {
  if (f.all) return null;
  const st = simpleStep(f);
  if (st) {
    return st.full
      ? `every ${st.step} hours`
      : `every ${st.step} hours from ${clockText(st.lo, 0, null, hour12)} through ${clockText(st.hi, 59, null, hour12)}`;
  }
  const one = onlyValue(f);
  if (one != null) return `between ${clockText(one, 0, null, hour12)} and ${clockText(one, 59, null, hour12)}`;
  const r = contiguousRange(f);
  if (r) return `between ${clockText(r.lo, 0, null, hour12)} and ${clockText(r.hi, 59, null, hour12)}`;
  return `during hours ${joinList(f.values.map(pad))}`;
}

function timePhrase(cron, hour12) {
  const { second, minute, hour } = cron.fields;
  const sv = second ? onlyValue(second) : null;
  const mv = onlyValue(minute);
  const hv = onlyValue(hour);
  const secOut = second ? (sv == null ? undefined : sv) : null;

  if (mv != null && hv != null && (!second || sv != null)) {
    return "At " + clockText(hv, mv, secOut, hour12);
  }
  if (mv != null && (!second || sv != null) && !hour.all && !hour.hasSpecial && hour.values.length <= 6) {
    return "At " + joinList(hour.values.map((h) => clockText(h, mv, secOut, hour12)));
  }

  const bits = [];
  const sp = secondPhrase(second);
  if (sp && minute.all) {
    // "Every 30 seconds, every minute" says the same thing twice; the minute
    // field is already implied by a seconds frequency.
    bits.push(sp.startsWith("every") ? sp : `${sp} of every minute`);
  } else {
    if (sp) bits.push(sp);
    bits.push(minutePhrase(minute, hour.all));
  }
  const hp = hourPhrase(hour, hour12);
  if (hp) bits.push(hp);
  return bits.join(", ").replace(/^./, (c) => c.toUpperCase());
}

function domPhrase(f) {
  const bits = [];
  if (f.values.length) {
    const st = simpleStep(f);
    if (f.all) {
      // handled by the caller
    } else if (st) {
      bits.push(st.full ? `every ${ordinal(st.step)} day of the month` : `every ${ordinal(st.step)} day of the month from the ${ordinal(st.lo)} to the ${ordinal(st.hi)}`);
    } else {
      const r = contiguousRange(f);
      if (r) bits.push(`on days ${r.lo} through ${r.hi} of the month`);
      else if (f.values.length === 1) bits.push(`on day ${f.values[0]} of the month`);
      else bits.push(`on days ${joinList(f.values.map(String))} of the month`);
    }
  }
  for (const off of f.lastDom) bits.push(off === 0 ? "on the last day of the month" : `${off} day${off === 1 ? "" : "s"} before the last day of the month`);
  if (f.lastWeekday) bits.push("on the last weekday of the month");
  for (const d of f.nearest) bits.push(`on the weekday nearest the ${ordinal(d)}`);
  return joinList(bits);
}

function dowPhrase(f) {
  const bits = [];
  if (f.values.length && !f.all) {
    const r = contiguousRange(f);
    if (r && f.values.length >= 3) bits.push(`${DOW_FULL[r.lo]} through ${DOW_FULL[r.hi]}`);
    else bits.push(`on ${joinList(f.values.map((v) => DOW_FULL[v]))}`);
  }
  for (const d of f.lastDow) bits.push(`on the last ${DOW_FULL[d]} of the month`);
  for (const t of f.nth) bits.push(`on the ${NTH_WORD[t.n]} ${DOW_FULL[t.dow]} of the month`);
  return joinList(bits);
}

function dayPhrase(cron) {
  const dom = cron.fields.dom;
  const dow = cron.fields.dow;
  const domFree = dom.question || (dom.all && !dom.hasSpecial);
  const dowFree = dow.question || (dow.all && !dow.hasSpecial);
  if (domFree && dowFree) return null;
  if (dowFree) return domPhrase(dom);
  if (domFree) return dowPhrase(dow);
  const a = domPhrase(dom);
  const b = dowPhrase(dow);
  return cron.orMode ? `${a} or ${b}` : `${a}, but only if it falls ${b.replace(/^on /, "on ")}`;
}

function monthPhrase(f) {
  if (f.all) return null;
  const st = simpleStep(f);
  if (st) return st.full ? `every ${ordinal(st.step)} month` : `every ${ordinal(st.step)} month from ${MONTH_FULL[st.lo - 1]} through ${MONTH_FULL[st.hi - 1]}`;
  const r = contiguousRange(f);
  if (r) return `from ${MONTH_FULL[r.lo - 1]} through ${MONTH_FULL[r.hi - 1]}`;
  return `in ${joinList(f.values.map((v) => MONTH_FULL[v - 1]))}`;
}

function yearPhrase(f) {
  if (!f || f.all) return null;
  const st = simpleStep(f);
  if (st) return `every ${ordinal(st.step)} year from ${st.lo} through ${st.hi}`;
  const r = contiguousRange(f);
  if (r) return `from ${r.lo} through ${r.hi}`;
  return `in ${joinList(f.values.map(String))}`;
}

export function describe(cron, { hour12 = false } = {}) {
  if (cron.reboot) return "Once at system startup. @reboot has no clock schedule at all, so there is nothing to predict.";
  const bits = [timePhrase(cron, hour12)];
  const day = dayPhrase(cron);
  if (day) bits.push(day);
  const mon = monthPhrase(cron.fields.month);
  if (mon) bits.push(mon);
  const yr = yearPhrase(cron.fields.year);
  if (yr) bits.push(yr);
  return bits.join(", ") + ".";
}

// ---------------------------------------------------------------------------
// Field-by-field breakdown
// ---------------------------------------------------------------------------

function valueList(f) {
  if (f.key === "dow") return f.values.map((v) => DOW_FULL[v]).join(", ");
  if (f.key === "month") return f.values.map((v) => MONTH_FULL[v - 1]).join(", ");
  if (f.values.length > 24) return `${f.values.length} values, ${f.values[0]} to ${f.values[f.values.length - 1]}`;
  return f.values.join(", ");
}

export function fieldTable(cron) {
  if (cron.reboot) return [];
  return cron.order.map((f) => {
    const parts = [];
    if (f.question) parts.push("Left to the other day field");
    else if (f.all) parts.push(f.key === "dow" ? "Every day of the week" : f.key === "dom" ? "Every day of the month" : `Every ${f.unit}`);
    else if (f.values.length) parts.push(valueList(f));
    for (const off of f.lastDom) parts.push(off === 0 ? "Last day of the month" : `${off} day${off === 1 ? "" : "s"} before the last day`);
    if (f.lastWeekday) parts.push("Last weekday of the month");
    for (const d of f.nearest) parts.push(`Weekday nearest the ${ordinal(d)}`);
    for (const d of f.lastDow) parts.push(`Last ${DOW_FULL[d]} of the month`);
    for (const t of f.nth) parts.push(`${NTH_WORD[t.n][0].toUpperCase() + NTH_WORD[t.n].slice(1)} ${DOW_FULL[t.dow]} of the month`);
    return { name: f.name, text: f.text, meaning: parts.join("; ") || "—" };
  });
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export function buildExpression(b, dialect) {
  const secondsField = dialect === "standard" ? null : "0";
  const q = dialect === "quartz";
  let minute = "0", hour = "0", dom = "*", month = "*", dow = q ? "?" : "*";

  switch (b.frequency) {
    case "minute":
      minute = "*"; hour = "*";
      break;
    case "everyNMinutes":
      minute = `*/${b.everyMinutes}`; hour = "*";
      break;
    case "hourly":
      minute = String(b.minute); hour = "*";
      break;
    case "everyNHours":
      minute = String(b.minute); hour = `*/${b.everyHours}`;
      break;
    case "daily":
      minute = String(b.minute); hour = String(b.hour);
      break;
    case "weekly":
      minute = String(b.minute); hour = String(b.hour);
      dow = b.weekdays.length ? b.weekdays.map((d) => (q ? d + 1 : d)).join(",") : (q ? "1" : "0");
      dom = q ? "?" : "*";
      break;
    case "monthly":
      minute = String(b.minute); hour = String(b.hour); dom = String(b.day);
      dow = q ? "?" : "*";
      break;
    case "yearly":
      minute = String(b.minute); hour = String(b.hour); dom = String(b.day); month = String(b.month);
      dow = q ? "?" : "*";
      break;
    default:
      break;
  }

  const out = [minute, hour, dom, month, dow];
  if (secondsField) out.unshift(secondsField);
  return out.join(" ");
}

export const PRESETS = [
  { expr: "* * * * *", label: "Every minute" },
  { expr: "*/5 * * * *", label: "Every 5 minutes" },
  { expr: "*/15 * * * *", label: "Every 15 minutes" },
  { expr: "0 * * * *", label: "Every hour, on the hour" },
  { expr: "0 */6 * * *", label: "Every 6 hours" },
  { expr: "0 0 * * *", label: "Every day at midnight" },
  { expr: "30 2 * * *", label: "Every day at 02:30" },
  { expr: "0 9 * * 1-5", label: "Weekdays at 09:00" },
  { expr: "0 0 * * 0", label: "Every Sunday at midnight" },
  { expr: "0 0 1 * *", label: "First of the month" },
  { expr: "0 0 1 1 *", label: "Once a year, 1 January" },
  { expr: "15 14 1 * *", label: "14:15 on the 1st" },
];
