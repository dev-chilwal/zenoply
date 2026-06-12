"use client";
import { useState } from "react";

function parseChannel(s) {
  if (s.trim() === "" || !/^\d+$/.test(s.trim())) return null;
  const n = parseInt(s.trim(), 10);
  return n >= 0 && n <= 255 ? n : null;
}

function toHex(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

export default function RgbToHex() {
  const [r, setR] = useState("59");
  const [g, setG] = useState("130");
  const [b, setB] = useState("246");

  const rv = parseChannel(r);
  const gv = parseChannel(g);
  const bv = parseChannel(b);
  const valid = rv !== null && gv !== null && bv !== null;
  const hex = valid ? toHex(rv, gv, bv) : null;
  const rgbStr = valid ? `rgb(${rv}, ${gv}, ${bv})` : "";

  return (
    <div>
      <div className="field-row">
        <label className="field">
          <span className="field-label">Red (0-255)</span>
          <input className="inp mono" inputMode="numeric" value={r} onChange={(e) => setR(e.target.value)} aria-label="Red" />
        </label>
        <label className="field">
          <span className="field-label">Green (0-255)</span>
          <input className="inp mono" inputMode="numeric" value={g} onChange={(e) => setG(e.target.value)} aria-label="Green" />
        </label>
        <label className="field">
          <span className="field-label">Blue (0-255)</span>
          <input className="inp mono" inputMode="numeric" value={b} onChange={(e) => setB(e.target.value)} aria-label="Blue" />
        </label>
      </div>
      {valid ? (
        <div>
          <div className="input-row">
            <div className="swatch" style={{ background: hex }} aria-hidden />
            <p className="muted small">Live preview of {hex}</p>
          </div>
          <div className="result-list">
            <Row label="HEX" val={hex} />
            <Row label="CSS rgb()" val={rgbStr} />
          </div>
        </div>
      ) : (
        <p className="error">Each channel must be a whole number from 0 to 255.</p>
      )}
    </div>
  );
}

function Row({ label, val }) {
  return (
    <div className="result-row">
      <span className="result-label">{label}</span>
      <code className="result-val">{val}</code>
    </div>
  );
}
