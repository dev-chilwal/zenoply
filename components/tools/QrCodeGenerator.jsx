"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import { downloadCanvas } from "./ImageDropzone";
import { downloadBytes } from "./PdfDropzone";

// uqr is small but every tool page shares one bundle, so it is fetched on first
// render of this page and then kept — the same lazy-import shape ExifViewer uses.
let uqrPromise = null;
const loadUqr = () => (uqrPromise ||= import("uqr"));

const TYPES = [
  { key: "text", label: "Text or URL" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "upi", label: "UPI payment" },
  { key: "email", label: "Email" },
  { key: "sms", label: "SMS" },
  { key: "phone", label: "Phone" },
];

const ECC_LEVELS = [
  { key: "L", label: "L - 7%" },
  { key: "M", label: "M - 15%" },
  { key: "Q", label: "Q - 25%" },
  { key: "H", label: "H - 30%" },
];

// In the WIFI: payload these five characters carry structure, so a literal one
// inside an SSID or password has to be backslash-escaped or the phone reads the
// field as finished early.
const escWifi = (s) => s.replace(/([\\;,:"])/g, "\\$1");

// Builds the string that actually gets encoded. Every branch returns "" when the
// required field is blank so the preview waits rather than encoding a stub.
function buildPayload(type, f) {
  if (type === "text") return f.text.trim();

  if (type === "wifi") {
    if (!f.ssid.trim()) return "";
    const parts = [`T:${f.auth}`, `S:${escWifi(f.ssid.trim())}`];
    if (f.auth !== "nopass") parts.push(`P:${escWifi(f.wifiPass)}`);
    if (f.hidden) parts.push("H:true");
    return `WIFI:${parts.join(";")};;`;
  }

  if (type === "upi") {
    if (!f.vpa.trim()) return "";
    const q = [`pa=${encodeURIComponent(f.vpa.trim())}`];
    if (f.payee.trim()) q.push(`pn=${encodeURIComponent(f.payee.trim())}`);
    const amt = parseFloat(f.amount);
    if (Number.isFinite(amt) && amt > 0) q.push(`am=${amt.toFixed(2)}`);
    q.push("cu=INR");
    if (f.note.trim()) q.push(`tn=${encodeURIComponent(f.note.trim())}`);
    return `upi://pay?${q.join("&")}`;
  }

  if (type === "email") {
    if (!f.to.trim()) return "";
    const q = [];
    if (f.subject.trim()) q.push(`subject=${encodeURIComponent(f.subject.trim())}`);
    if (f.bodyText.trim()) q.push(`body=${encodeURIComponent(f.bodyText.trim())}`);
    return `mailto:${f.to.trim()}${q.length ? "?" + q.join("&") : ""}`;
  }

  if (type === "sms") {
    if (!f.phone.trim()) return "";
    const n = f.phone.trim();
    return f.message.trim() ? `SMSTO:${n}:${f.message.trim()}` : `SMSTO:${n}:`;
  }

  if (type === "phone") return f.phone.trim() ? `tel:${f.phone.trim()}` : "";
  return "";
}

function hexToRgb(hex) {
  let h = hex.replace(/^#/, "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

// WCAG relative luminance, used only to warn about colour pairs a phone camera
// will struggle to separate. Scanners need real contrast, not just a visible one.
const chan = (c) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4);
const lum = ({ r, g, b }) => 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);

// One SVG path for the whole code: dark modules merged into horizontal runs, so
// the file stays small and the PNG and SVG come from the same geometry.
function matrixPath(matrix) {
  const out = [];
  for (let y = 0; y < matrix.length; y++) {
    const row = matrix[y];
    let x = 0;
    while (x < row.length) {
      if (!row[x]) { x++; continue; }
      let run = 1;
      while (x + run < row.length && row[x + run]) run++;
      out.push(`M${x},${y}h${run}v1h-${run}z`);
      x += run;
    }
  }
  return out.join("");
}

export default function QrCodeGenerator() {
  const [type, setType] = useState("text");
  const [fields, setFields] = useState({
    text: "https://zenoply.com",
    ssid: "", wifiPass: "", auth: "WPA", hidden: false,
    vpa: "", payee: "", amount: "", note: "",
    to: "", subject: "", bodyText: "",
    phone: "", message: "",
  });
  const [ecc, setEcc] = useState("M");
  const [margin, setMargin] = useState(4);
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const [target, setTarget] = useState(512);

  const [qr, setQr] = useState(null);
  const [error, setError] = useState("");

  const set = (key, val) => setFields((f) => ({ ...f, [key]: val }));

  const payload = useMemo(() => buildPayload(type, fields), [type, fields]);

  useEffect(() => {
    if (!payload) { setQr(null); setError(""); return; }
    let cancelled = false;
    loadUqr().then(({ encode }) => {
      if (cancelled) return;
      try {
        setQr(encode(payload, { ecc, border: margin }));
        setError("");
      } catch (e) {
        setQr(null);
        setError(
          /too long/i.test(e?.message || "")
            ? "That is more data than a QR code can hold. Shorten the text, or drop the error correction level to L."
            : "Could not build a QR code from that input."
        );
      }
    });
    return () => { cancelled = true; };
  }, [payload, ecc, margin]);

  const path = useMemo(() => (qr ? matrixPath(qr.data) : ""), [qr]);

  const darkRgb = hexToRgb(dark);
  const lightRgb = hexToRgb(light);
  const contrast = useMemo(() => {
    if (!darkRgb || !lightRgb) return null;
    const a = lum(darkRgb);
    const b = lum(lightRgb);
    return { ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), inverted: a > b };
  }, [dark, light]); // eslint-disable-line react-hooks/exhaustive-deps

  // Snap to a whole number of pixels per module so every module lands on exact
  // pixel boundaries — a fractional scale softens the edges and costs scans.
  const scale = qr ? Math.max(1, Math.round(target / qr.size)) : 1;
  const pngSize = qr ? scale * qr.size : 0;

  const downloadPng = useCallback(() => {
    if (!qr) return;
    const canvas = document.createElement("canvas");
    canvas.width = pngSize;
    canvas.height = pngSize;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, pngSize, pngSize);
    ctx.fillStyle = dark;
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.data[y][x]) ctx.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    downloadCanvas(canvas, `qr-code-${pngSize}px.png`, "image/png");
  }, [qr, pngSize, scale, dark, light]);

  const downloadSvg = useCallback(() => {
    if (!qr) return;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${pngSize}" height="${pngSize}" ` +
      `viewBox="0 0 ${qr.size} ${qr.size}" shape-rendering="crispEdges">` +
      `<rect width="${qr.size}" height="${qr.size}" fill="${light}"/>` +
      `<path d="${path}" fill="${dark}"/></svg>`;
    downloadBytes(svg, "qr-code.svg", "image/svg+xml");
  }, [qr, path, pngSize, dark, light]);

  const f = fields;

  return (
    <div>
      <div className="field">
        <span className="field-label">What should the QR code do?</span>
        <div className="chip-row">
          {TYPES.map((t) => (
            <button
              key={t.key}
              className={"btn btn-sm " + (t.key === type ? "" : "btn-ghost")}
              onClick={() => setType(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {type === "text" && (
        <label className="field">
          <span className="field-label">Text or link</span>
          <textarea
            className="ta"
            rows={3}
            value={f.text}
            onChange={(e) => set("text", e.target.value)}
            placeholder="https://example.com or any text"
          />
        </label>
      )}

      {type === "wifi" && (
        <>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Network name (SSID)</span>
              <input className="inp" value={f.ssid} onChange={(e) => set("ssid", e.target.value)} placeholder="Home WiFi" />
            </label>
            <label className="field">
              <span className="field-label">Security</span>
              <select className="inp" value={f.auth} onChange={(e) => set("auth", e.target.value)}>
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP (older routers)</option>
                <option value="nopass">Open - no password</option>
              </select>
            </label>
          </div>
          {f.auth !== "nopass" && (
            <label className="field">
              <span className="field-label">Password</span>
              <input className="inp" value={f.wifiPass} onChange={(e) => set("wifiPass", e.target.value)} placeholder="Wi-Fi password" />
            </label>
          )}
          <label className="check-row">
            <input type="checkbox" checked={f.hidden} onChange={(e) => set("hidden", e.target.checked)} />
            <span>Hidden network (SSID is not broadcast)</span>
          </label>
        </>
      )}

      {type === "upi" && (
        <>
          <div className="field-row">
            <label className="field">
              <span className="field-label">UPI ID (VPA)</span>
              <input className="inp" value={f.vpa} onChange={(e) => set("vpa", e.target.value)} placeholder="name@okhdfcbank" />
            </label>
            <label className="field">
              <span className="field-label">Payee name</span>
              <input className="inp" value={f.payee} onChange={(e) => set("payee", e.target.value)} placeholder="Shop or person" />
            </label>
          </div>
          <div className="field-row">
            <label className="field">
              <span className="field-label">Amount (optional)</span>
              <input className="inp" type="number" min={0} step="0.01" value={f.amount} onChange={(e) => set("amount", e.target.value)} placeholder="Leave blank to let the payer type it" />
            </label>
            <label className="field">
              <span className="field-label">Note (optional)</span>
              <input className="inp" value={f.note} onChange={(e) => set("note", e.target.value)} placeholder="Invoice 42" />
            </label>
          </div>
          <p className="muted small">Use your own UPI ID. Anyone who scans this is shown your payee name in their app before they confirm - the code only requests a payment, it can never take one.</p>
        </>
      )}

      {type === "email" && (
        <>
          <label className="field">
            <span className="field-label">To</span>
            <input className="inp" value={f.to} onChange={(e) => set("to", e.target.value)} placeholder="hello@example.com" />
          </label>
          <label className="field">
            <span className="field-label">Subject (optional)</span>
            <input className="inp" value={f.subject} onChange={(e) => set("subject", e.target.value)} placeholder="Enquiry" />
          </label>
          <label className="field">
            <span className="field-label">Message (optional)</span>
            <textarea className="ta" rows={3} value={f.bodyText} onChange={(e) => set("bodyText", e.target.value)} />
          </label>
        </>
      )}

      {(type === "sms" || type === "phone") && (
        <label className="field">
          <span className="field-label">Phone number</span>
          <input className="inp" value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
        </label>
      )}

      {type === "sms" && (
        <label className="field">
          <span className="field-label">Message (optional)</span>
          <textarea className="ta" rows={2} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="Pre-filled text" />
        </label>
      )}

      <div className="qr-stage">
        {qr ? (
          <svg viewBox={`0 0 ${qr.size} ${qr.size}`} shapeRendering="crispEdges" role="img" aria-label="QR code preview">
            <rect width={qr.size} height={qr.size} fill={light} />
            <path d={path} fill={dark} />
          </svg>
        ) : (
          <p className="muted small center">{error ? "" : "Fill in the fields above and your QR code appears here."}</p>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      {qr && (
        <>
          <div className="stat-grid">
            <div className="stat">
              <span className="stat-num">{qr.version}</span>
              <span className="stat-label">QR version</span>
            </div>
            <div className="stat">
              <span className="stat-num">{qr.size - margin * 2}</span>
              <span className="stat-label">Modules per side</span>
            </div>
            <div className="stat">
              <span className="stat-num">{new TextEncoder().encode(payload).length}</span>
              <span className="stat-label">Bytes encoded</span>
            </div>
            <div className="stat">
              <span className="stat-num">{pngSize}</span>
              <span className="stat-label">PNG size (px)</span>
            </div>
          </div>

          <div className="output-block">
            <span className="field-label">Encoded data</span>
            <div className="output mono">{payload}</div>
          </div>
        </>
      )}

      <div className="field-row" style={{ marginTop: "1.25rem" }}>
        <label className="field">
          <span className="field-label">Error correction</span>
          <select className="inp" value={ecc} onChange={(e) => setEcc(e.target.value)}>
            {ECC_LEVELS.map((l) => (
              <option key={l.key} value={l.key}>{l.label}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="field-label">Quiet zone (modules)</span>
          <input className="inp" type="number" min={0} max={16} value={margin} onChange={(e) => setMargin(Math.min(Math.max(parseInt(e.target.value, 10) || 0, 0), 16))} />
        </label>
        <label className="field">
          <span className="field-label">Download size</span>
          <select className="inp" value={target} onChange={(e) => setTarget(parseInt(e.target.value, 10))}>
            <option value={256}>Small - about 256px</option>
            <option value={512}>Medium - about 512px</option>
            <option value={1024}>Large - about 1024px</option>
            <option value={2048}>Print - about 2048px</option>
          </select>
        </label>
      </div>

      <div className="field-row">
        <label className="field">
          <span className="field-label">Dark modules</span>
          <div className="input-row">
            <input className="qr-color" type="color" value={darkRgb ? dark : "#000000"} onChange={(e) => setDark(e.target.value)} aria-label="Dark module colour" />
            <input className="inp mono" value={dark} onChange={(e) => setDark(e.target.value)} />
          </div>
        </label>
        <label className="field">
          <span className="field-label">Background</span>
          <div className="input-row">
            <input className="qr-color" type="color" value={lightRgb ? light : "#ffffff"} onChange={(e) => setLight(e.target.value)} aria-label="Background colour" />
            <input className="inp mono" value={light} onChange={(e) => setLight(e.target.value)} />
          </div>
        </label>
      </div>

      {margin < 4 && (
        <p className="muted small">A quiet zone below 4 modules breaks the border the standard requires. Some scanners cope; many will not.</p>
      )}
      {contrast && contrast.inverted && (
        <p className="error">Your dark colour is lighter than the background. Most scanners refuse inverted codes - swap the two colours.</p>
      )}
      {contrast && !contrast.inverted && contrast.ratio < 3 && (
        <p className="error">These two colours are only {contrast.ratio.toFixed(1)}:1 apart. Phone cameras need roughly 3:1 or more - pick a darker foreground or a lighter background.</p>
      )}

      <div className="btn-row">
        <button className="btn" onClick={downloadPng} disabled={!qr}>Download PNG</button>
        <button className="btn btn-ghost" onClick={downloadSvg} disabled={!qr}>Download SVG</button>
      </div>
      <p className="muted small">Generated in your browser. The code is a plain static image with no redirect service behind it, so it keeps working for as long as whatever it points to does - there is nothing to expire and no scan limit.</p>
    </div>
  );
}
