"use client";
import { useEffect, useMemo, useState } from "react";
import { Field, Rows, Row, Segmented } from "@/components/calc/Calc";
import {
  addDays,
  addMonths,
  dayNumber,
  describeYMD,
  diffYMD,
  formatISO,
  longDate,
  nextAnniversary,
  parseDate,
  spanStats,
  today,
  weekdayName,
} from "@/components/tools/dateCalc";

// All of the calendar arithmetic lives in dateCalc.js, where it is asserted in
// node over every day from 1800 to 2200; this file is only the form around it.

const fmt = (n) => n.toLocaleString("en-US");

const UNITS = [
  { id: "days", label: "days" },
  { id: "weeks", label: "weeks" },
  { id: "months", label: "months" },
  { id: "years", label: "years" },
];

function BigOutput({ children }) {
  return (
    <div className="output-block">
      <div
        className="output"
        style={{ fontSize: "clamp(1.25rem, 4.6vw, 2rem)", lineHeight: 1.3, fontWeight: 600 }}
      >
        {children}
      </div>
    </div>
  );
}

/** A date input that reports the parsed record, not the string. */
function DateField({ label, hint, value, onChange, ariaLabel }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input
        className="inp mono"
        type="date"
        value={value}
        min="0001-01-01"
        max="9999-12-31"
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel || label}
      />
      {hint && <span className="muted small">{hint}</span>}
    </label>
  );
}

export default function AgeCalculator() {
  const [mode, setMode] = useState("age"); // age | between | shift
  const [dob, setDob] = useState("");
  const [asOn, setAsOn] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [start, setStart] = useState("");
  const [amount, setAmount] = useState("90");
  const [unit, setUnit] = useState("days");
  const [dir, setDir] = useState("add");

  // Today is read after mount, not during render: the pages are statically
  // exported, so a date baked in at build time would be stale for every visitor
  // and would disagree with the client on hydration.
  useEffect(() => {
    const t = formatISO(today());
    setAsOn((v) => v || t);
    setFrom((v) => v || t);
    setStart((v) => v || t);
  }, []);

  const dobDate = parseDate(dob);
  const asOnDate = parseDate(asOn);
  const fromDate = parseDate(from);
  const toDate = parseDate(to);
  const startDate = parseDate(start);

  const age = useMemo(() => {
    if (!dobDate || !asOnDate) return null;
    if (dayNumber(dobDate) > dayNumber(asOnDate)) return { future: true };
    const stats = spanStats(dobDate, asOnDate);
    return { stats, birthday: nextAnniversary(dobDate, asOnDate) };
  }, [dob, asOn]); // eslint-disable-line react-hooks/exhaustive-deps

  const span = useMemo(() => {
    if (!fromDate || !toDate) return null;
    const reversed = dayNumber(fromDate) > dayNumber(toDate);
    const a = reversed ? toDate : fromDate;
    const b = reversed ? fromDate : toDate;
    return { reversed, a, b, stats: spanStats(a, b) };
  }, [from, to]); // eslint-disable-line react-hooks/exhaustive-deps

  const shifted = useMemo(() => {
    if (!startDate) return null;
    const n = Number(String(amount).replace(/[\s,_]/g, ""));
    if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 100000) return { bad: true };
    const signed = dir === "subtract" ? -n : n;
    let result, clamped = false;
    if (unit === "days") result = addDays(startDate, signed);
    else if (unit === "weeks") result = addDays(startDate, signed * 7);
    else {
      const moved = addMonths(startDate, unit === "years" ? signed * 12 : signed);
      clamped = moved.clamped;
      result = { y: moved.y, m: moved.m, d: moved.d };
    }
    return { result, clamped, days: dayNumber(result) - dayNumber(startDate) };
  }, [start, amount, unit, dir]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <Segmented
        ariaLabel="What to calculate"
        value={mode}
        onChange={setMode}
        options={[
          { value: "age", label: "Age" },
          { value: "between", label: "Days between" },
          { value: "shift", label: "Add / subtract" },
        ]}
      />

      {mode === "age" && (
        <>
          <div className="field-row">
            <DateField label="Date of birth" value={dob} onChange={setDob} />
            <DateField
              label="Age on"
              hint="Defaults to today — change it to age someone at a past or future date."
              value={asOn}
              onChange={setAsOn}
              ariaLabel="Date to calculate the age on"
            />
          </div>

          {!dobDate && (
            <p className="muted small" style={{ marginTop: "1rem" }}>
              Pick a date of birth to see an exact age in years, months and days, plus the
              same age counted in months, weeks, days and hours.
            </p>
          )}

          {age?.future && (
            <p className="error">
              That date of birth is after the date you are ageing to. Swap them, or use the
              Days between tab to count forwards to a date in the future.
            </p>
          )}

          {age?.stats && (
            <>
              <BigOutput>{describeYMD(age.stats)}</BigOutput>
              <div className="stat-grid">
                <div className="stat">
                  <span className="stat-num mono">{fmt(age.stats.years)}</span>
                  <span className="stat-label">{age.stats.years === 1 ? "year" : "years"}</span>
                </div>
                <div className="stat">
                  <span className="stat-num mono">{fmt(age.stats.months)}</span>
                  <span className="stat-label">{age.stats.months === 1 ? "month" : "months"}</span>
                </div>
                <div className="stat">
                  <span className="stat-num mono">{fmt(age.stats.days)}</span>
                  <span className="stat-label">{age.stats.days === 1 ? "day" : "days"}</span>
                </div>
              </div>

              <Rows>
                <Row
                  label="Born on"
                  val={`${longDate(dobDate)}, a ${weekdayName(dobDate)}`}
                />
                <Row
                  label="Age in months"
                  val={`${fmt(age.stats.totalMonths)} months and ${fmt(age.stats.days)} days`}
                />
                <Row
                  label="Age in weeks"
                  val={`${fmt(age.stats.weeks)} weeks and ${fmt(age.stats.remainderDays)} days`}
                />
                <Row label="Age in days" val={`${fmt(age.stats.totalDays)} days`} />
                <Row label="Age in hours" val={`${fmt(age.stats.totalHours)} hours`} />
                <Row
                  label="Next birthday"
                  val={`${longDate(age.birthday.date)}, a ${weekdayName(age.birthday.date)} — ${
                    age.birthday.daysUntil === 1
                      ? "tomorrow"
                      : `${fmt(age.birthday.daysUntil)} days away`
                  }, turning ${fmt(age.birthday.ordinal)}`}
                  highlight
                />
              </Rows>

              {age.stats.clamped && (
                <p className="muted small" style={{ marginTop: "1rem" }}>
                  The month this age was measured from is shorter than the day of the month
                  in the date of birth, so the monthly anniversary was taken as{" "}
                  {longDate(age.stats.anchor)} — the last day of that month. There is no
                  arithmetic answer to &ldquo;one month after the 31st&rdquo;; every date
                  library picks a convention, and this is the usual one.
                </p>
              )}

              {dobDate.m === 2 && dobDate.d === 29 && (
                <p className="muted small" style={{ marginTop: "1rem" }}>
                  A 29 February birthday falls in three years out of four on a date that does
                  not exist. This calculator treats 28 February as the birthday in a common
                  year, which is the convention in England, Wales and India; Hong Kong and
                  some US states use 1 March instead, which would make the next one{" "}
                  {age.birthday.alternative
                    ? longDate(age.birthday.alternative)
                    : longDate(age.birthday.date)}
                  .
                </p>
              )}
            </>
          )}
        </>
      )}

      {mode === "between" && (
        <>
          <div className="field-row">
            <DateField label="From" value={from} onChange={setFrom} ariaLabel="Start date" />
            <DateField label="To" value={to} onChange={setTo} ariaLabel="End date" />
          </div>

          {!span && (
            <p className="muted small" style={{ marginTop: "1rem" }}>
              Pick both dates to count the days between them — with the working days and
              weekend days separated, which is what a notice period, a rental period or a
              project deadline usually turns on.
            </p>
          )}

          {span && (
            <>
              <BigOutput>{describeYMD(span.stats)}</BigOutput>
              <div className="stat-grid">
                <div className="stat">
                  <span className="stat-num mono">{fmt(span.stats.totalDays)}</span>
                  <span className="stat-label">days between</span>
                </div>
                <div className="stat">
                  <span className="stat-num mono">{fmt(span.stats.workingDays)}</span>
                  <span className="stat-label">weekdays</span>
                </div>
                <div className="stat">
                  <span className="stat-num mono">{fmt(span.stats.weekendDays)}</span>
                  <span className="stat-label">weekend days</span>
                </div>
              </div>

              <Rows>
                <Row label="From" val={`${longDate(span.a)}, a ${weekdayName(span.a)}`} />
                <Row label="To" val={`${longDate(span.b)}, a ${weekdayName(span.b)}`} />
                <Row label="Days between" val={fmt(span.stats.totalDays)} />
                <Row
                  label="Counting both dates"
                  val={`${fmt(span.stats.inclusiveDays)} days`}
                />
                <Row
                  label="In weeks"
                  val={`${fmt(span.stats.weeks)} weeks and ${fmt(span.stats.remainderDays)} days`}
                />
                <Row
                  label="In months"
                  val={`${fmt(span.stats.totalMonths)} months and ${fmt(span.stats.days)} days`}
                />
                <Row label="In hours" val={`${fmt(span.stats.totalHours)} hours`} />
                <Row label="In minutes" val={`${fmt(span.stats.totalMinutes)} minutes`} />
                <Row
                  label="Working days"
                  val={`${fmt(span.stats.workingDays)} weekdays and ${fmt(
                    span.stats.weekendDays
                  )} weekend days, counting both dates`}
                  highlight
                />
              </Rows>

              {span.reversed && (
                <p className="muted small" style={{ marginTop: "1rem" }}>
                  The second date is earlier than the first, so they were counted the other way
                  round. The answer is the size of the gap either way.
                </p>
              )}
              <p className="muted small" style={{ marginTop: "1rem" }}>
                Two counts are given because contracts mean different things by the same
                phrase: {fmt(span.stats.totalDays)} is the gap between the dates, and{" "}
                {fmt(span.stats.inclusiveDays)} counts both the first and the last day, which
                is how leave, notice periods and hotel stays are usually written. Weekday
                counts are Monday to Friday and take no account of public holidays.
              </p>
            </>
          )}
        </>
      )}

      {mode === "shift" && (
        <>
          <DateField label="Start date" value={start} onChange={setStart} />
          <div className="field-row" style={{ marginTop: "1rem" }}>
            <Field label="Direction">
              <select
                className="inp"
                value={dir}
                onChange={(e) => setDir(e.target.value)}
                aria-label="Add or subtract"
              >
                <option value="add">Add</option>
                <option value="subtract">Subtract</option>
              </select>
            </Field>
            <Field label="Amount">
              <input
                className="inp mono"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="numeric"
                spellCheck={false}
                autoComplete="off"
                aria-label="How many to add or subtract"
              />
            </Field>
            <Field label="Unit">
              <select
                className="inp"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                aria-label="Unit"
              >
                {UNITS.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {shifted?.bad && (
            <p className="error">Enter a whole number of {unit}, for example 90.</p>
          )}

          {shifted?.result && (
            <>
              <BigOutput>
                {longDate(shifted.result)}
                <span style={{ display: "block", fontSize: ".55em", fontWeight: 500, marginTop: ".35rem" }}>
                  a {weekdayName(shifted.result)}
                </span>
              </BigOutput>
              <Rows>
                <Row label="Start date" val={`${longDate(startDate)}, a ${weekdayName(startDate)}`} />
                <Row label="ISO format" val={formatISO(shifted.result)} />
                <Row
                  label="Days moved"
                  val={`${fmt(Math.abs(shifted.days))} days ${
                    shifted.days < 0 ? "backwards" : "forwards"
                  }`}
                  highlight
                />
              </Rows>
              {shifted.clamped && (
                <p className="muted small" style={{ marginTop: "1rem" }}>
                  The target month is shorter than the day you started from, so the date was
                  pulled back to the last day of that month. This is why adding a month twice
                  is not always the same as adding two months: 31 January plus one month twice
                  gives 28 March, while plus two months gives 31 March.
                </p>
              )}
            </>
          )}
        </>
      )}

      <p className="muted small" style={{ marginTop: "1.8rem" }}>
        Everything is worked out from the calendar itself — day counts come from an exact
        integer day number rather than from dividing by 365.25, so leap years, century years
        such as 1900 (not a leap year) and month lengths are all handled properly. Times of
        day and time zones are not involved: these are whole calendar dates, so an answer does
        not shift because of where you are or when daylight saving starts. Nothing you enter
        is uploaded or stored.
      </p>
    </div>
  );
}
