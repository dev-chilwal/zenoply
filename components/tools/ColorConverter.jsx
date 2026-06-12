"use client";
import { useState } from "react";

function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToCmyk(r, g, b) {
  const k = 1 - Math.max(r, g, b) / 255;
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  const f = (v) => Math.round(((1 - v / 255 - k) / (1 - k)) * 100);
  return { c: f(r), m: f(g), y: f(b), k: Math.round(k * 100) };
}

function rgbToHexStr(r, g, b) {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// Accepts hex (#abc, #aabbcc), rgb(r, g, b) or a bare "r, g, b" triplet,
// and hsl(h, s%, l%). Returns {r, g, b} or null.
function parseColor(input) {
  const s = input.trim().toLowerCase();
  let m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const num = parseInt(h, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  m = s.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*[\),]/) ||
      s.match(/^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/);
  if (m) {
    const r = +m[1], g = +m[2], b = +m[3];
    if (r > 255 || g > 255 || b > 255) return null;
    return { r, g, b };
  }
  m = s.match(/^hsla?\(\s*(\d{1,3})(?:deg)?\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*[\),]/);
  if (m) {
    const h = +m[1], sl = +m[2], l = +m[3];
    if (h > 360 || sl > 100 || l > 100) return null;
    return hslToRgb(h % 360, sl, l);
  }
  return null;
}

export default function ColorConverter() {
  const [input, setInput] = useState("#3b82f6");
  const [copied, setCopied] = useState("");
  const rgb = parseColor(input);

  const copy = (val, key) => {
    navigator.clipboard?.writeText(val);
    setCopied(key);
    setTimeout(() => setCopied(""), 1200);
  };

  let rows = [];
  let css = "transparent";
  if (rgb) {
    const { r, g, b } = rgb;
    const hsl = rgbToHsl(r, g, b);
    const cmyk = rgbToCmyk(r, g, b);
    css = `rgb(${r}, ${g}, ${b})`;
    rows = [
      ["HEX", rgbToHexStr(r, g, b)],
      ["RGB", css],
      ["HSL", `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`],
      ["CMYK", `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`],
    ];
  }

  return (
    <div>
      <div className="input-row">
        <input
          className="inp mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#3b82f6, rgb(59, 130, 246) or hsl(217, 91%, 60%)"
          aria-label="Color value"
        />
        <div className="swatch" style={{ background: css }} aria-hidden />
      </div>
      <p className="muted small">Enter a HEX code, RGB or HSL value. The format is detected automatically.</p>
      {rgb ? (
        <div className="result-list">
          {rows.map(([label, val]) => (
            <div key={label} className="result-row">
              <span className="result-label">{label}</span>
              <code className="result-val">{val}</code>
              <button className="btn-sm" onClick={() => copy(val, label)}>
                {copied === label ? "Copied" : "Copy"}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="error">Enter a valid color, e.g. #3b82f6, rgb(59, 130, 246) or hsl(217, 91%, 60%).</p>
      )}
    </div>
  );
}
