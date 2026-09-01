"use client";
import { useState, useMemo, useEffect } from "react";
import OutputBox from "@/components/OutputBox";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  DIALECTS,
  PRESETS,
  parseCron,
  describe,
  fieldTable,
  nextRuns,
  formatRun,
  relativeText,
  buildExpression,
  localTimeZone,
} from "@/components/tools/cronExpr";

// Every rule - the grammar, the day-of-month/day-of-week OR, the Quartz
// extensions, the wall-clock search and the DST edge cases - lives in
// cronExpr.js so it can be run in node against real schedulers. This file is
// only the form around it.

const MODES = [
  { value: "explain", label: "Explain" },
  { value: "build", label: "Build" },
];

const FREQUENCIES = [
  { value: "minute", label: "Every minute" },
  { value: "everyNMinutes", label: "Every N minutes" },
  { value: "hourly", label: "Every hour" },
  { value: "everyNHours", label: "Every N hours" },
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" },
  { value: "yearly", label: "Every year" },
];

const WEEKDAYS = [
  { v: 1, label: "Mon" }, { v: 2, label: "Tue" }, { v: 3, label: "Wed" },
  { v: 4, label: "Thu" }, { v: 5, label: "Fri" }, { v: 6, label: "Sat" },
  { v: 0, label: "Sun" },
];

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

// The full IANA list where the browser exposes it, so the answer can be given
// in the zone the server actually runs in rather than a curated shortlist.
function zoneOptions() {
  try {
    const all = Intl.supportedValuesOf("timeZone");
    if (all?.length) return all;
  } catch {}
  return ["UTC", "Europe/London", "Europe/Berlin", "America/New_York", "America/Chicago",
    "America/Los_Angeles", "America/Sao_Paulo", "Asia/Kolkata", "Asia/Dubai",
    "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"];
}

export default function CronExpressionGenerator() {
  const [mode, setMode] = useState("explain");
  const [dialect, setDialect] = useState("standard");
  const [input, setInput] = useState("0 9 * * 1-5");
  const [hour12, setHour12] = useState(false);
  const [count, setCount] = useState(5);

  // Both the zone and "now" are client facts. Reading them during render would
  // make the server HTML disagree with the first client render, so the run list
  // waits for the effect below and the description renders either way.
  const [tz, setTz] = useState("UTC");
  const [now, setNow] = useState(null);
  const [zones, setZones] = useState(["UTC"]);

  const [freq, setFreq] = useState("daily");
  const [bMinute, setBMinute] = useState(0);
  const [bHour, setBHour] = useState(9);
  const [bEveryMinutes, setBEveryMinutes] = useState(5);
  const [bEveryHours, setBEveryHours] = useState(6);
  const [bWeekdays, setBWeekdays] = useState([1]);
  const [bDay, setBDay] = useState(1);
  const [bMonth, setBMonth] = useState(1);

  useEffect(() => {
    setZones(zoneOptions());
    setTz(localTimeZone());
    setNow(Date.now());
  }, []);

  const built = useMemo(
    () => buildExpression(
      { frequency: freq, minute: bMinute, hour: bHour, everyMinutes: bEveryMinutes,
        everyHours: bEveryHours, weekdays: bWeekdays, day: bDay, month: bMonth },
      dialect
    ),
    [freq, bMinute, bHour, bEveryMinutes, bEveryHours, bWeekdays, bDay, bMonth, dialect]
  );

  const expression = mode === "build" ? built : input;
  const parsed = useMemo(() => parseCron(expression, dialect), [expression, dialect]);
  const cron = parsed.ok ? parsed.cron : null;

  const text = useMemo(() => (cron ? describe(cron, { hour12 }) : ""), [cron, hour12]);
  const table = useMemo(() => (cron ? fieldTable(cron) : []), [cron]);
  const runs = useMemo(() => {
    if (!cron || now == null || cron.reboot) return null;
    return nextRuns(cron, { from: now, tz, count });
  }, [cron, now, tz, count]);

  const toggleWeekday = (v) =>
    setBWeekdays((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v].sort()));

  const needs = (...keys) => keys.includes(freq);

  return (
    <div>
      <Segmented options={MODES} value={mode} onChange={setMode} ariaLabel="Mode" />

      <div className="field-row">
        <Field label="Cron flavour">
          <select className="inp" value={dialect} onChange={(e) => setDialect(e.target.value)}>
            {DIALECTS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Time zone of the server">
          <select className="inp" value={tz} onChange={(e) => setTz(e.target.value)}>
            {(zones.includes(tz) ? zones : [tz, ...zones]).map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </Field>
      </div>

      {mode === "explain" ? (
        <>
          <label className="field">
            <span className="field-label">Cron expression</span>
            <input
              className="inp mono"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={dialect === "quartz" ? "0 0 12 ? * MON-FRI" : "0 9 * * 1-5"}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
            />
          </label>
          {dialect === "standard" && (
            <>
              <p className="muted small" style={{ marginBottom: ".4rem" }}>Or start from a common one:</p>
              <div className="chip-row">
                {PRESETS.map((p) => (
                  <button
                    key={p.expr}
                    type="button"
                    className="btn-sm"
                    onClick={() => setInput(p.expr)}
                    title={p.expr}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="field-row">
            <Field label="How often">
              <select className="inp" value={freq} onChange={(e) => setFreq(e.target.value)}>
                {FREQUENCIES.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </Field>
            {needs("everyNMinutes") && (
              <Field label="Every … minutes">
                <input className="inp" type="number" min="1" max="59" value={bEveryMinutes}
                  onChange={(e) => setBEveryMinutes(Math.min(59, Math.max(1, Number(e.target.value) || 1)))} />
              </Field>
            )}
            {needs("everyNHours") && (
              <Field label="Every … hours">
                <input className="inp" type="number" min="1" max="23" value={bEveryHours}
                  onChange={(e) => setBEveryHours(Math.min(23, Math.max(1, Number(e.target.value) || 1)))} />
              </Field>
            )}
            {needs("hourly", "everyNHours", "daily", "weekly", "monthly", "yearly") && (
              <Field label="Minute">
                <input className="inp" type="number" min="0" max="59" value={bMinute}
                  onChange={(e) => setBMinute(Math.min(59, Math.max(0, Number(e.target.value) || 0)))} />
              </Field>
            )}
            {needs("daily", "weekly", "monthly", "yearly") && (
              <Field label="Hour (0–23)">
                <input className="inp" type="number" min="0" max="23" value={bHour}
                  onChange={(e) => setBHour(Math.min(23, Math.max(0, Number(e.target.value) || 0)))} />
              </Field>
            )}
            {needs("monthly", "yearly") && (
              <Field label="Day of month">
                <input className="inp" type="number" min="1" max="31" value={bDay}
                  onChange={(e) => setBDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))} />
              </Field>
            )}
            {needs("yearly") && (
              <Field label="Month">
                <select className="inp" value={bMonth} onChange={(e) => setBMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          {needs("weekly") && (
            <>
              <p className="muted small" style={{ marginBottom: ".4rem" }}>Days of the week</p>
              <div className="chip-row">
                {WEEKDAYS.map((d) => (
                  <button
                    key={d.v}
                    type="button"
                    className="btn-sm"
                    aria-pressed={bWeekdays.includes(d.v)}
                    onClick={() => toggleWeekday(d.v)}
                    style={bWeekdays.includes(d.v)
                      ? { borderColor: "var(--accent)", color: "var(--accent)", fontWeight: 700 }
                      : undefined}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </>
          )}

          <OutputBox value={built} />
        </>
      )}

      <label className="check-row">
        <input type="checkbox" checked={hour12} onChange={(e) => setHour12(e.target.checked)} />
        <span>12-hour clock</span>
      </label>

      {!parsed.ok ? (
        <p className="error">{parsed.error}</p>
      ) : (
        <>
          <p className="result-statement" style={{ fontSize: "clamp(1.25rem, 2.6vw, 1.75rem)", margin: "1.4rem 0 .4rem" }}>
            {text}
          </p>

          {cron.never && <p className="error">{cron.never}</p>}
          {cron.notes.map((n) => (
            <p className="muted small" key={n}>{n}</p>
          ))}
          {cron.warnings.map((w) => (
            <p className="muted small" key={w}>⚠ {w}</p>
          ))}

          {table.length > 0 && (
            <div className="tbl-wrap">
              <table className="tbl-preview" style={{ width: "100%", whiteSpace: "normal" }}>
                <tbody>
                  <tr>
                    <td>Field</td>
                    <td>Value</td>
                    <td>Meaning</td>
                  </tr>
                  {table.map((row) => (
                    <tr key={row.name}>
                      <td>{row.name}</td>
                      <td className="mono">{row.text}</td>
                      <td>{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cron.reboot ? (
            <p className="muted small" style={{ marginTop: "1rem" }}>
              @reboot runs once when cron itself starts, which on most systems means at boot. It has
              no clock schedule, so there is nothing to predict. Note that it is a Vixie extension:
              systemd timers, Kubernetes CronJob and most hosted schedulers do not accept it.
            </p>
          ) : (
            <>
              <div className="field-row" style={{ marginTop: "1.5rem" }}>
                <Field label="Next runs to show">
                  <select className="inp" value={count} onChange={(e) => setCount(Number(e.target.value))}>
                    {[5, 10, 20].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {runs == null ? (
                <p className="muted small">Working out the next runs…</p>
              ) : runs.runs.length === 0 ? (
                <p className="muted small">
                  This expression is valid but has no matching date in the next 50 years.
                </p>
              ) : (
                <>
                  <div className="result-list">
                    {runs.runs.map((r) => (
                      <div className="result-row" key={r.ts}>
                        <span className="result-val" style={{ wordBreak: "normal" }}>
                          {formatRun(r, { seconds: cron.hasSeconds, hour12 })}
                        </span>
                        <span className="muted small" style={{ flex: "none" }}>
                          {relativeText(r.ts, now)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {runs.runs.filter((r) => r.note).map((r) => (
                    <p className="muted small" key={"n" + r.ts}>
                      ⚠ {formatRun(r, { seconds: cron.hasSeconds, hour12 })} — {r.note}
                    </p>
                  ))}
                  <p className="muted small">
                    Times are the wall clock in {tz}. Cron reads the machine&apos;s own clock, so
                    pick the zone your server runs in, not yours — a container is very often on UTC
                    while you are not.
                  </p>
                  {runs.exhausted && (
                    <p className="muted small">
                      The search stopped after 50 years, so this list may be short.
                    </p>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
