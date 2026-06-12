"use client";
import { useState, useMemo } from "react";
import OutputBox from "@/components/OutputBox";

// Base64url decode (RFC 7515), UTF-8 safe. Returns null on failure.
function b64UrlDecode(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad === 1) return null;
  if (pad) s += "=".repeat(4 - pad);
  try {
    return decodeURIComponent(escape(atob(s)));
  } catch {
    return null;
  }
}

function decodeJwt(token) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return { error: "A JWT has three dot-separated parts (header.payload.signature). This input has " + parts.length + "." };
  }
  const headerStr = b64UrlDecode(parts[0]);
  const payloadStr = b64UrlDecode(parts[1]);
  if (headerStr === null || payloadStr === null) {
    return { error: "Could not Base64-decode the token. Check it was copied completely, with no missing characters." };
  }
  let header, payload;
  try {
    header = JSON.parse(headerStr);
  } catch {
    return { error: "The token header is not valid JSON." };
  }
  try {
    payload = JSON.parse(payloadStr);
  } catch {
    return { error: "The token payload is not valid JSON." };
  }
  return { header, payload };
}

function fmtClaimDate(seconds) {
  const d = new Date(seconds * 1000);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleString() + " (" + d.toISOString() + ")";
}

export default function JwtDecoder() {
  const [input, setInput] = useState("");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    return decodeJwt(input);
  }, [input]);

  const timeRows = [];
  if (result && !result.error) {
    const p = result.payload;
    const now = Date.now() / 1000;
    if (typeof p.iat === "number") {
      const v = fmtClaimDate(p.iat);
      if (v) timeRows.push({ label: "Issued (iat)", val: v });
    }
    if (typeof p.nbf === "number") {
      const v = fmtClaimDate(p.nbf);
      if (v) timeRows.push({ label: "Not before (nbf)", val: v });
    }
    if (typeof p.exp === "number") {
      const v = fmtClaimDate(p.exp);
      if (v) {
        timeRows.push({
          label: "Expires (exp)",
          val: v + (p.exp < now ? " - EXPIRED" : ""),
        });
      }
    }
  }

  return (
    <div>
      <label className="field">
        <span className="field-label">JWT token</span>
        <textarea
          className="inp mono"
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste a JWT (eyJhbGciOi...)"
        />
      </label>
      <p className="muted small">
        Decoding happens entirely in your browser and the signature is not verified.
        Avoid pasting production tokens that grant access to live systems.
      </p>
      {result && result.error && <p className="error">{result.error}</p>}
      {result && !result.error && (
        <div>
          <p className="field-label">Header</p>
          <OutputBox value={JSON.stringify(result.header, null, 2)} />
          <p className="field-label" style={{ marginTop: "1rem" }}>Payload</p>
          <OutputBox value={JSON.stringify(result.payload, null, 2)} />
          {timeRows.length > 0 && (
            <div className="result-list">
              {timeRows.map((r) => (
                <div className="result-row" key={r.label}>
                  <span className="result-label">{r.label}</span>
                  <code className="result-val">{r.val}</code>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
