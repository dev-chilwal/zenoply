"use client";
// Shared building blocks so every calculator/tool matches the "SIP demo" card.
// Presentation only — all math/state stays in the individual tool components.
import { useState } from "react";
import { scheduleCsv } from "@/lib/scheduleCsv";

/** Labelled range slider with a live value read-out (the SIP-demo field). */
export function Slider({ label, display, value, min, max, step, onChange }) {
  return (
    <div className="fin-field">
      <div className="fin-field-top">
        <span className="lbl">{label}</span>
        <span className="val">{display}</span>
      </div>
      <input
        className="fin-range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

/** Wrapper that stacks slider fields with consistent spacing. */
export function Fields({ children }) {
  return <div className="fin-fields">{children}</div>;
}

/** Segmented mode toggle. options: [{ value, label }]. */
export function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="seg" role="tablist" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          className={"seg-btn" + (value === o.value ? " active" : "")}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Labelled field wrapper for selects / custom inputs. */
export function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  );
}

/** Number input with optional currency/unit affix. */
export function NumberField({ label, value, onChange, prefix, suffix, min, max, step }) {
  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="input-affix">
        {prefix && <span className="affix">{prefix}</span>}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-label={label}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
        {suffix && <span className="affix">{suffix}</span>}
      </div>
    </div>
  );
}

/** Result block container (border-top + the big number live here). */
export function Result({ children }) {
  return <div className="fin-result">{children}</div>;
}

/** Headline result: small label + big gradient number. */
export function ResultHero({ label, value }) {
  return (
    <>
      <div className="fin-result-label">{label}</div>
      <div className="fin-total">{value}</div>
    </>
  );
}

/** Two-segment proportion bar. a = muted part %, b = accent part %. */
export function SplitBar({ a, b }) {
  return (
    <div className="fin-bar">
      <div className="bar-muted" style={{ width: `${a}%` }} />
      <div className="bar-accent" style={{ width: `${b}%` }} />
    </div>
  );
}

/** Two-column legend beneath the split bar. left/right: { k, v }. */
export function Legend({ left, right }) {
  return (
    <div className="fin-legend">
      <div>
        <div className="k">{left.k}</div>
        <div className="v">{left.v}</div>
      </div>
      <div className="right">
        <div className="k k-accent">{right.k}</div>
        <div className="v v-accent">{right.v}</div>
      </div>
    </div>
  );
}

/** Secondary key/value rows (for breakdowns under the hero result). */
export function Rows({ children }) {
  return <div className="result-list">{children}</div>;
}
export function Row({ label, val, highlight }) {
  return (
    <div className={"result-row" + (highlight ? " result-row-hl" : "")}>
      <span className="result-label">{label}</span>
      <code className="result-val">{val}</code>
    </div>
  );
}

/* ============================================================
   Editorial calculator building blocks (.calc-page layout).
   Editable number input as the PRIMARY control, with an optional
   slider beneath as a secondary adjuster (never the only control).
   ============================================================ */

/** Editable number field + optional secondary slider. */
export function NumberInput({
  label, hint, prefix, suffix, value, onChange,
  min, max, step, slider = true,
}) {
  return (
    <div className="cfield">
      <div className="cfield-head">
        <div>
          <label>{label}</label>
          {hint && <div className="hint">{hint}</div>}
        </div>
        <div className="cinput">
          {prefix && <span className="affix">{prefix}</span>}
          <input
            type="number" value={value} min={min} max={max} step={step}
            inputMode="decimal" aria-label={label}
            onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          />
          {suffix && <span className="affix suffix">{suffix}</span>}
        </div>
      </div>
      {slider && (
        <input
          className="fin-range" type="range"
          min={min} max={max} step={step} value={value}
          aria-label={`${label} slider`}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      )}
    </div>
  );
}

/** Inner two-column grid: inputs/result (main) | summary rail. */
export function CalcGrid({ children }) { return <div className="calc-grid">{children}</div>; }
export function CalcMain({ children }) { return <div className="calc-main">{children}</div>; }
export function CalcRail({ children }) { return <aside className="calc-rail">{children}</aside>; }

/** Prose result statement — wrap the emphasised value in <span className="pop">. */
export function ResultStatement({ children }) {
  return <p className="result-statement">{children}</p>;
}

/** Summary rows beneath the chart. */
export function SumRows({ children }) { return <div className="sum-rows">{children}</div>; }
export function SumRow({ label, value }) {
  return (
    <div className="sum-row">
      <span>{label}</span>
      <span className="v">{value}</span>
    </div>
  );
}

/** Right-rail pieces. tone: "data" (accent) | "loss" (accent-loss) | undefined. */
export function RailNote({ title, children }) {
  return (
    <div className="rail-block">
      <h3 className="rail-h">{title}</h3>
      <p className="rail-p">{children}</p>
    </div>
  );
}
export function RailStat({ label, value, sub, tone }) {
  const cls = "rail-stat-num" + (tone ? ` is-${tone}` : "");
  return (
    <div className="rail-block">
      <div className="rail-label">{label}</div>
      <div className={cls}>{value}</div>
      {sub && <div className="rail-sub">{sub}</div>}
    </div>
  );
}
export function RailFormula({ label, formula, note }) {
  return (
    <div className="rail-block">
      {label && <div className="rail-label" style={{ marginBottom: ".5rem" }}>{label}</div>}
      <div className="rail-formula">{formula}</div>
      {note && <div className="rail-sub" style={{ marginTop: ".5rem" }}>{note}</div>}
    </div>
  );
}

/** Rail button for useShareLink(): copies a link that reopens this result. */
export function ShareLink({ share }) {
  const label = share.status === "copied" ? "Link copied"
    : share.status === "address" ? "Link is in the address bar"
    : "Copy link to this result";
  return (
    <div className="rail-block">
      <button type="button" className="btn-sm" onClick={share.copy} aria-live="polite">{label}</button>
      <div className="rail-sub">Your inputs are saved in the link itself, not on a server.</div>
    </div>
  );
}

/**
 * Year-by-year amortization schedule table. rows: pre-formatted
 * { year, principal, interest, balance } strings. Scrolls when long.
 */
export function ScheduleTable({ rows, caption, csv, pdf }) {
  // csv: optional { yearly, currency, filename } — the unformatted schedule
  // behind `rows`, offered as a spreadsheet download.
  // pdf: optional { locale, title, summary, filename } — the same schedule as a
  // printable PDF (data from `csv`); pdf-lib loads only when it is clicked.
  const [busy, setBusy] = useState(false);
  const save = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const download = () => {
    save(new Blob([scheduleCsv(csv.yearly, csv.currency)], { type: "text/csv" }), csv.filename);
  };
  const downloadPdf = async () => {
    setBusy(true);
    try {
      const { schedulePdf } = await import("@/lib/schedulePdf");
      const bytes = await schedulePdf({ yearly: csv.yearly, currency: csv.currency, ...pdf });
      save(new Blob([bytes], { type: "application/pdf" }), pdf.filename);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="sched-block">
      {(caption || csv) && (
        <div className="sched-head">
          {caption && <p className="chart-caption">{caption}</p>}
          {csv && rows.length > 0 && (
            <span className="sched-actions">
              <button type="button" className="btn-sm" onClick={download}>Download CSV</button>
              {pdf && (
                <button type="button" className="btn-sm" onClick={downloadPdf} disabled={busy}>
                  {busy ? "Preparing…" : "Download PDF"}
                </button>
              )}
            </span>
          )}
        </div>
      )}
      <div className="sched-wrap">
        <table className="sched">
          <thead>
            <tr>
              <th>Year</th>
              <th className="r">Principal</th>
              <th className="r">Interest</th>
              <th className="r">Balance</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.year}>
                <td>{row.year}</td>
                <td className="r">{row.principal}</td>
                <td className="r">{row.interest}</td>
                <td className="r">{row.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Flat SVG line chart, themed via CSS (.mini-chart classes).
 * series: array of numbers (one per x step, starting at index 0).
 * format: fn(number) -> label string for the y-axis.
 * series2: optional second series of the same length, drawn dashed.
 */
export function MiniChart({ series, series2, format = (n) => n, caption }) {
  const W = 640, H = 300, pad = { l: 56, r: 16, t: 16, b: 34 };
  const n = series.length - 1;
  const max = Math.max(...series, ...(series2 || [])) * 1.05 || 1;
  const x = (i) => pad.l + (n ? (i / n) : 0) * (W - pad.l - pad.r);
  const y = (v) => H - pad.b - (v / max) * (H - pad.t - pad.b);

  const grid = [], yLabels = [], xLabels = [];
  for (let g = 0; g <= 4; g++) {
    const val = (max / 1.05) * (g / 4);
    const yy = y(val);
    grid.push(<line key={`g${g}`} className="grid" x1={pad.l} y1={yy} x2={W - pad.r} y2={yy} />);
    yLabels.push(<text key={`yl${g}`} className="axis" x={pad.l - 10} y={yy + 4} textAnchor="end" fontSize="11">{format(val)}</text>);
  }
  const stepX = n <= 10 ? 1 : Math.ceil(n / 8);
  for (let i = 0; i <= n; i += stepX) {
    xLabels.push(<text key={`xl${i}`} className="axis" x={x(i)} y={H - 12} textAnchor="middle" fontSize="11">{i}</text>);
  }
  const points = series.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const dots = series.map((v, i) => <circle key={`d${i}`} className="dot" cx={x(i)} cy={y(v)} r="3.5" />);

  return (
    <>
      {caption && <p className="chart-caption">{caption}</p>}
      <svg className="mini-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={caption || "Chart"}>
        {grid}{yLabels}{xLabels}
        {series2 && (
          <polyline className="line2" points={series2.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
        )}
        <polyline className="line" points={points} />
        {dots}
      </svg>
    </>
  );
}

/**
 * Donut breakdown for results with three or more parts, where a SplitBar
 * cannot show the shares. parts: [{ label, value }] — the first is the hero
 * part (accent), the rest step down in ink. Zero parts are dropped; shares
 * are of the parts' own sum. center: { value, label } short text inside the
 * ring; total: { label, value } closing legend row.
 */
export function Donut({ parts, format = (n) => n, caption, center, total }) {
  const shown = parts.filter((p) => p.value > 0);
  const sum = shown.reduce((s, p) => s + p.value, 0);
  if (shown.length < 2 || !(sum > 0)) return null;

  // pathLength=100 makes the dash units percentages of the ring.
  const gap = 0.6;
  let start = 0;
  const arcs = shown.map((p, i) => {
    const pct = (p.value / sum) * 100;
    const len = Math.max(pct - gap, 0.2);
    const arc = (
      <circle
        key={i} className={`donut-seg s${Math.min(i, 5)}`}
        cx="60" cy="60" r="48" pathLength="100"
        strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-start}
      />
    );
    start += pct;
    return arc;
  });
  const share = (v) => {
    const pct = (v / sum) * 100;
    return pct > 0 && pct < 1 ? "<1%" : `${Math.round(pct)}%`;
  };
  const label = shown.map((p) => `${p.label} ${share(p.value)}`).join(", ");

  return (
    <div className="donut-block">
      {caption && <p className="chart-caption">{caption}</p>}
      <div className="donut-wrap">
        <svg className="donut" viewBox="0 0 120 120" role="img" aria-label={`${caption || "Breakdown"}: ${label}`}>
          <circle className="donut-track" cx="60" cy="60" r="48" />
          <g transform="rotate(-90 60 60)">{arcs}</g>
          {center && (
            <>
              <text className="donut-num" x="60" y="60" textAnchor="middle">{center.value}</text>
              <text className="donut-sub" x="60" y="76" textAnchor="middle">{center.label}</text>
            </>
          )}
        </svg>
        <ul className="donut-key">
          {shown.map((p, i) => (
            <li key={i}>
              <span className={`sw s${Math.min(i, 5)}`} aria-hidden="true" />
              <span className="lbl">{p.label}</span>
              <span className="pct">{share(p.value)}</span>
              <span className="v">{format(p.value)}</span>
            </li>
          ))}
          {total && (
            <li className="tot">
              <span className="lbl">{total.label}</span>
              <span className="v">{total.value}</span>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
