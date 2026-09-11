"use client";
import { useMemo, useState } from "react";
import { Segmented, Field, Rows, Row } from "@/components/calc/Calc";
import {
  DATE_ORDERS,
  DATE_SEPARATORS,
  MAX_STANDARD,
  MAX_VALUE,
  OVERLINE,
  SYMBOLS,
  dateToRoman,
  parseRomanInput,
  readRomanDate,
  readingExpression,
  segmentsToPlain,
  segmentsToText,
  toRoman,
} from "@/components/tools/romanConvert";

// All of the conversion lives in romanConvert.js, where every value from 1 to
// 3,999,999 is round-tripped in node; this file is only the form around it.

const fmt = (n) => n.toLocaleString("en-US");

/**
 * A numeral on screen. A barred group is drawn with a CSS overline rather than
 * with the combining character, because the combining overline lands a pixel or
 * two off in several common UI fonts and vanishes entirely in a few. The copied
 * text uses the combining character, since that is the only form that survives
 * being pasted somewhere else.
 */
function Numeral({ segments }) {
  return (
    <>
      {segments.map((s, i) =>
        s.bars ? (
          <span key={i} style={{ textDecoration: "overline" }}>{s.text}</span>
        ) : (
          <span key={i}>{s.text}</span>
        )
      )}
    </>
  );
}

function BigOutput({ children, copyValue, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return (
    <div className="output-block">
      <div className="output-actions">
        <button className="btn-sm" onClick={copy} aria-label={`Copy ${label}`}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <div
        className="output mono"
        style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.4rem)", letterSpacing: ".05em", lineHeight: 1.35 }}
      >
        {children}
      </div>
    </div>
  );
}

export default function RomanNumerals() {
  const [mode, setMode] = useState("toRoman"); // toRoman | toNumber | date
  const [numberIn, setNumberIn] = useState("1994");
  const [romanIn, setRomanIn] = useState("MCMXCIV");
  const [dateIn, setDateIn] = useState("");
  const [order, setOrder] = useState("dmy");
  const [sep, setSep] = useState("middot");

  // Commas and spaces are stripped so a figure pasted from a spreadsheet or an
  // invoice converts without being retyped.
  const encoded = useMemo(() => {
    const cleaned = numberIn.replace(/[\s,_]/g, "");
    if (cleaned === "") return { ok: false, empty: true };
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
      return { ok: false, error: "Enter a whole number using digits, for example 1994." };
    }
    return toRoman(Number(cleaned));
  }, [numberIn]);

  const read = useMemo(() => parseRomanInput(romanIn), [romanIn]);
  const readParts = read.parts;
  const dateReadings = useMemo(
    () =>
      readParts.length === 3 && readParts.every((p) => p.ok)
        ? readRomanDate(readParts.map((p) => p.value))
        : [],
    [readParts]
  );

  const dated = useMemo(() => dateToRoman(dateIn, order, sep), [dateIn, order, sep]);

  const today = () => {
    // Local date, not toISOString() — that converts to UTC first, so anyone east
    // of Greenwich in the evening would get tomorrow.
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    setDateIn(`${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`);
  };

  return (
    <div>
      <Segmented
        ariaLabel="Conversion direction"
        value={mode}
        onChange={setMode}
        options={[
          { value: "toRoman", label: "Number → Roman" },
          { value: "toNumber", label: "Roman → Number" },
          { value: "date", label: "Date → Roman" },
        ]}
      />

      {mode === "toRoman" && (
        <>
          <label className="field">
            <span className="field-label">Number (1 to {fmt(MAX_VALUE)})</span>
            <input
              className="inp mono"
              value={numberIn}
              onChange={(e) => setNumberIn(e.target.value)}
              placeholder="1994"
              inputMode="numeric"
              spellCheck={false}
              autoComplete="off"
              aria-label="Number to convert to Roman numerals"
            />
          </label>

          {encoded.ok ? (
            <>
              <BigOutput
                copyValue={segmentsToText(encoded.segments)}
                label="the Roman numeral"
              >
                <Numeral segments={encoded.segments} />
              </BigOutput>
              <Rows>
                <Row
                  label="Adds up as"
                  val={encoded.steps
                    .map(
                      (s) =>
                        `${
                          s.bars ? s.text.split("").map((c) => c + OVERLINE).join("") : s.text
                        } (${fmt(s.value)})`
                    )
                    .join(" + ")}
                />
                {!encoded.standard && (
                  <Row
                    label="Without the bar"
                    val={`${segmentsToPlain(encoded.segments)} — the bar over ${
                      encoded.segments[0].text
                    } is what multiplies it by 1,000`}
                  />
                )}
                <Row label="Value" val={fmt(Number(numberIn.replace(/[\s,_]/g, "")))} highlight />
              </Rows>
              {!encoded.standard && (
                <p className="muted small">
                  Above {fmt(MAX_STANDARD)} there is no letter left to repeat, so a bar over a
                  numeral multiplies it by 1,000 — {fmt(4000)} is a barred IV, not MMMM. The
                  copied text carries the bar as a combining character (U+0305), which pastes
                  correctly but is drawn by some fonts better than others; check it where you
                  intend to use it.
                </p>
              )}
            </>
          ) : (
            !encoded.empty && <p className="error">{encoded.error}</p>
          )}
        </>
      )}

      {mode === "toNumber" && (
        <>
          <label className="field">
            <span className="field-label">Roman numeral</span>
            <input
              className="inp mono"
              value={romanIn}
              onChange={(e) => setRomanIn(e.target.value)}
              placeholder="MCMXCIV"
              spellCheck={false}
              autoComplete="off"
              aria-label="Roman numeral to convert to a number"
            />
          </label>

          {readParts.length === 1 && readParts[0].ok && (
            <>
              <BigOutput copyValue={String(readParts[0].value)} label="the number">
                {fmt(readParts[0].value)}
              </BigOutput>
              <Rows>
                <Row label="Reads as" val={readingExpression(readParts[0].runs)} />
                <Row
                  label="Standard form"
                  val={
                    readParts[0].oversize
                      ? "above the range this writes"
                      : readParts[0].isCanonical
                      ? `${readParts[0].canonicalText} — the spelling you typed`
                      : readParts[0].canonicalText
                  }
                  highlight={!readParts[0].isCanonical}
                />
              </Rows>
            </>
          )}

          {readParts.length > 1 && (
            <div className="result-list">
              {readParts.map((p, i) => (
                <div className="result-row" key={i}>
                  <span className="result-label mono">{p.text}</span>
                  <span className="result-val">
                    {p.ok
                      ? fmt(p.value) +
                        (p.isCanonical ? "" : ` (standard form ${p.canonicalText})`)
                      : p.error}
                  </span>
                </div>
              ))}
            </div>
          )}

          {dateReadings.length > 0 && (
            <Rows>
              {dateReadings.map((r) => (
                <Row
                  key={r.order}
                  label={`Read ${r.orderLabel.toLowerCase()}`}
                  val={r.label}
                  highlight={dateReadings.length === 1}
                />
              ))}
            </Rows>
          )}
          {dateReadings.length > 1 && (
            <p className="muted small">
              Three numerals with two of them 12 or under is a genuinely ambiguous date: nothing
              in the numerals says which is the day and which is the month, so both readings are
              shown.
            </p>
          )}

          {readParts.map(
            (p, i) =>
              !p.ok && !p.empty && readParts.length === 1 && (
                <p className="error" key={i}>{p.error}</p>
              )
          )}

          {readParts.length === 1 && readParts[0].ok && readParts[0].issues.length > 0 && (
            <>
              <p className="field-label" style={{ marginTop: "1.2rem" }}>
                Not the standard spelling
              </p>
              {readParts[0].issues.map((issue) => (
                <p className="error" key={issue}>{issue}</p>
              ))}
              <p className="muted small">
                The value above is still what the numeral means — this is about how it is
                written, not whether it can be read. Non-standard spellings are common on
                clock faces (IIII for four), in medieval manuscripts and on film copyright
                lines, so a converter that simply refuses them is not much help.
              </p>
            </>
          )}

          <p className="muted small" style={{ marginTop: "1rem" }}>
            Case does not matter, and a bar over a letter (as a combining overline, U+0305 or
            U+0304) is read as a multiplication by 1,000. Separators are allowed, so a numeral
            date such as XXV&middot;XII&middot;MCMXC can be pasted in whole.
          </p>
        </>
      )}

      {mode === "date" && (
        <>
          <label className="field">
            <span className="field-label">Date</span>
            <input
              className="inp mono"
              type="date"
              value={dateIn}
              onChange={(e) => setDateIn(e.target.value)}
              min="0001-01-01"
              max="3999-12-31"
              aria-label="Date to convert to Roman numerals"
            />
          </label>
          <div className="btn-row">
            <button type="button" className="btn-sm" onClick={today}>
              Use today&rsquo;s date
            </button>
          </div>

          <div className="field-row" style={{ marginTop: "1rem" }}>
            <Field label="Field order">
              <select className="inp" value={order} onChange={(e) => setOrder(e.target.value)}>
                {DATE_ORDERS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Separator">
              <select className="inp" value={sep} onChange={(e) => setSep(e.target.value)}>
                {DATE_SEPARATORS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>

          {dated.ok ? (
            <>
              <BigOutput copyValue={dated.text} label="the numeral date">
                {dated.text}
              </BigOutput>
              <Rows>
                {dated.parts.map((p) => (
                  <Row key={p.key} label={p.label} val={`${p.number} = ${p.text}`} />
                ))}
                <Row label="Date" val={dated.longDate} highlight />
              </Rows>
              <p className="muted small">
                Nothing is padded, because Roman numerals have no leading zero — the fifth of
                the month is V, not 0V. The day is checked against the month and the leap year
                rule, so 29&middot;II&middot;MCM is refused: 1900 was divisible by 100 and not
                by 400, and so was not a leap year.
              </p>
            </>
          ) : (
            <>
              {dated.error && <p className="error">{dated.error}</p>}
              {dated.empty && (
                <p className="muted small" style={{ marginTop: "1rem" }}>
                  Pick a date to see it written in numerals. A date tattoo is usually written
                  day first with middle dots — 25 December 1990 becomes
                  XXV&middot;XII&middot;MCMXC.
                </p>
              )}
            </>
          )}
        </>
      )}

      <p className="field-label" style={{ marginTop: "1.8rem" }}>
        The seven letters
      </p>
      <div className="stat-grid">
        {SYMBOLS.map((s) => (
          <div className="stat" key={s.sym}>
            <span className="stat-num mono">{s.sym}</span>
            <span className="stat-label">{fmt(s.val)}</span>
          </div>
        ))}
      </div>

      <p className="muted small" style={{ marginTop: "1rem" }}>
        Letters are written largest first and added up, except for the six subtractions — IV
        (4), IX (9), XL (40), XC (90), CD (400) and CM (900) — where a smaller letter placed in
        front is taken away instead. I, X, C and M may repeat up to three times; V, L and D
        never repeat. There is no zero and no fraction. Everything here is worked out in your
        browser, and nothing you type is uploaded or stored.
      </p>
    </div>
  );
}
