"use client";
// Shared building blocks so every calculator/tool matches the "SIP demo" card.
// Presentation only — all math/state stays in the individual tool components.

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
