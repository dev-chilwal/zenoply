"use client";
import { useState } from "react";
import { Segmented } from "@/components/calc/Calc";

// Accepts seconds or milliseconds (auto-detected by magnitude).
function epochToDate(raw) {
  const n = Number(String(raw).trim());
  if (!raw || !Number.isFinite(n)) return null;
  const ms = Math.abs(n) >= 1e12 ? n : n * 1000;
  const d = new Date(ms);
  if (isNaN(d.getTime())) return null;
  return d;
}

// datetime-local value (no timezone) -> treated as local time.
function dateToEpoch(local) {
  if (!local) return null;
  const d = new Date(local);
  if (isNaN(d.getTime())) return null;
  return d;
}

function fmtRows(d) {
  return [
    ["Unix (seconds)", String(Math.floor(d.getTime() / 1000))],
    ["Unix (milliseconds)", String(d.getTime())],
    ["Local time", d.toLocaleString()],
    ["UTC", d.toUTCString()],
    ["ISO 8601", d.toISOString()],
  ];
}

export default function EpochConverter() {
  const [mode, setMode] = useState("toDate");
  const [epoch, setEpoch] = useState(String(Math.floor(Date.now() / 1000)));
  const [local, setLocal] = useState("");

  const d = mode === "toDate" ? epochToDate(epoch) : dateToEpoch(local);

  return (
    <div>
      <Segmented ariaLabel="Mode" value={mode} onChange={setMode}
        options={[{ value: "toDate", label: "Timestamp → Date" }, { value: "toEpoch", label: "Date → Timestamp" }]} />

      {mode === "toDate" ? (
        <label className="field">
          <span className="field-label">Unix timestamp (seconds or milliseconds)</span>
          <input className="inp mono" value={epoch} onChange={(e) => setEpoch(e.target.value)} placeholder="1700000000" />
        </label>
      ) : (
        <label className="field">
          <span className="field-label">Date &amp; time (your local timezone)</span>
          <input className="inp mono" type="datetime-local" step="1" value={local} onChange={(e) => setLocal(e.target.value)} />
        </label>
      )}

      {d ? (
        <div className="result-list">
          {fmtRows(d).map(([label, val]) => (
            <div className="result-row" key={label}>
              <span className="result-label">{label}</span>
              <code className="result-val">{val}</code>
            </div>
          ))}
        </div>
      ) : (
        <p className="error">
          {mode === "toDate" ? "Enter a valid Unix timestamp (a number)." : "Pick a valid date and time."}
        </p>
      )}
    </div>
  );
}
