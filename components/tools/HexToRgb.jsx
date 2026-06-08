"use client";
import { useState } from "react";

function hexToRgb(hex) {
  let h = hex.replace(/^#/, "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export default function HexToRgb() {
  const [hex, setHex] = useState("#3b82f6");
  const rgb = hexToRgb(hex);
  const rgbStr = rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "";

  return (
    <div>
      <div className="input-row">
        <input className="inp mono" value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#aabbcc" aria-label="Hex color" />
        <div className="swatch" style={{ background: rgb ? rgbStr : "transparent" }} aria-hidden />
      </div>
      {rgb ? (
        <div className="result-list">
          <Row label="RGB" val={rgbStr} />
          <Row label="R" val={String(rgb.r)} />
          <Row label="G" val={String(rgb.g)} />
          <Row label="B" val={String(rgb.b)} />
        </div>
      ) : (
        <p className="error">Enter a valid hex code (e.g. #3b82f6 or abc).</p>
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
