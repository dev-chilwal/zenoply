"use client";
import { useState, useEffect, useMemo } from "react";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  ALGOS,
  INPUT_ENCODINGS,
  OUTPUT_ENCODINGS,
  algoById,
  algosForLength,
  decodeInput,
  diagnose,
  encodeDigest,
  hmac,
  parseSignature,
  sameBytes,
} from "@/components/tools/hmac";

// The construction, the codecs and the mismatch sweep all live in hmac.js so
// they can be run in node against OpenSSL and the RFC 4231 / 2202 vectors;
// this file is only the form around them.

const ALGO_OPTIONS = ALGOS.map((a) => ({ value: a.id, label: a.id }));

const PLACEHOLDER = {
  text: "your-signing-secret",
  hex: "4a3f9c1e7b2d8a05",
  base64: "Sj+cHnstigU=",
};

const bytesLabel = (n) => `${n} ${n === 1 ? "byte" : "bytes"}`;

export default function HmacGenerator() {
  const [algo, setAlgo] = useState("SHA-256");
  const [keyText, setKeyText] = useState("");
  const [keyEnc, setKeyEnc] = useState("text");
  const [msgText, setMsgText] = useState("");
  const [msgEnc, setMsgEnc] = useState("text");
  const [expected, setExpected] = useState("");

  const [mac, setMac] = useState(null);
  const [copied, setCopied] = useState("");
  const [report, setReport] = useState(null);

  const key = useMemo(() => decodeInput(keyText, keyEnc), [keyText, keyEnc]);
  const msg = useMemo(() => decodeInput(msgText, msgEnc), [msgText, msgEnc]);
  const sig = useMemo(() => parseSignature(expected), [expected]);
  const hasInput = keyText.length > 0 || msgText.length > 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasInput || !key.ok || !msg.ok) { setMac(null); return; }
      const out = await hmac(algo, key.bytes, msg.bytes);
      if (!cancelled) setMac(out);
    })();
    return () => { cancelled = true; };
  }, [algo, key, msg, hasInput]);

  const matched = mac && sig && sig.readings.some((r) => sameBytes(r.bytes, mac));

  // The sweep only runs when there is something to explain — a signature that
  // is present, readable and does not already match what is on screen.
  useEffect(() => {
    let cancelled = false;
    if (!sig || !sig.readings.length || matched || !hasInput) { setReport(null); return; }
    (async () => {
      const r = await diagnose({ keyText, msgText, msgEncoding: msgEnc, signature: expected });
      if (!cancelled) setReport(r);
    })();
    return () => { cancelled = true; };
  }, [sig, matched, hasInput, keyText, msgText, msgEnc, expected]);

  const copy = async (value, tag) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(tag);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  };

  const sigAlgos = sig && sig.readings.length ? algosForLength(sig.readings[0].bytes.length) : [];

  return (
    <div>
      <Field label="Algorithm">
        <Segmented options={ALGO_OPTIONS} value={algo} onChange={setAlgo} ariaLabel="Hash algorithm" />
      </Field>

      <Field label="Secret key">
        <Segmented
          options={INPUT_ENCODINGS}
          value={keyEnc}
          onChange={setKeyEnc}
          ariaLabel="How the secret key is written"
        />
        <input
          className="inp mono"
          value={keyText}
          onChange={(e) => setKeyText(e.target.value)}
          placeholder={PLACEHOLDER[keyEnc]}
          spellCheck={false}
          autoComplete="off"
          style={{ marginTop: ".5rem" }}
        />
      </Field>
      {keyText && !key.ok && <p className="error">{key.error}</p>}
      {keyText && key.ok && (
        <p className="muted small">
          Read as {bytesLabel(key.bytes.length)}.{" "}
          {keyEnc === "text"
            ? "Every character of what you typed is signed as itself. If the far end stores this secret as hex or Base64, switch the tab above — the same secret read a different way is a different key, and gives a completely different MAC."
            : "The secret is decoded to raw bytes first, which is what an API means when it hands you a key in this format."}
        </p>
      )}

      <Field label="Message">
        <Segmented
          options={INPUT_ENCODINGS}
          value={msgEnc}
          onChange={setMsgEnc}
          ariaLabel="How the message is written"
        />
        <textarea
          className="inp mono"
          rows={5}
          value={msgText}
          onChange={(e) => setMsgText(e.target.value)}
          placeholder={'{"event":"payment.succeeded","amount":2000}'}
          spellCheck={false}
          style={{ marginTop: ".5rem" }}
        />
      </Field>
      {msgText && !msg.ok && <p className="error">{msg.error}</p>}
      {msgText && msg.ok && (
        <p className="muted small">
          Signing {bytesLabel(msg.bytes.length)}. A webhook body is signed exactly as it arrived on the
          wire, so a re-formatted or re-serialised copy of the same JSON will not match.
        </p>
      )}

      {!hasInput && (
        <p className="muted">Enter a secret and a message to see the HMAC.</p>
      )}

      {mac && (
        <>
          <p className="field-label" style={{ marginTop: "1.25rem" }}>
            {algoById(algo).label}
          </p>
          <div className="result-list">
            {OUTPUT_ENCODINGS.map((enc) => {
              const value = encodeDigest(mac, enc.value);
              return (
                <div key={enc.value} className="result-row">
                  <span className="result-label">{enc.label}</span>
                  <code className="result-val">{value}</code>
                  <button className="btn-sm" onClick={() => copy(value, enc.value)}>
                    {copied === enc.value ? "Copied" : "Copy"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="muted small">
            {bytesLabel(mac.length)} — the same MAC in four ways of writing it down. Upper- and
            lower-case hex are the same value, and so are Base64 and Base64url, so a signature that
            differs from yours only in case or in <code>+/</code> versus <code>-_</code> is a match.
          </p>
        </>
      )}

      <Field label="Compare with a signature you were sent">
        <input
          className="inp mono"
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder="sha256=… or t=…,v1=… or a bare hex / Base64 digest"
          spellCheck={false}
          autoComplete="off"
        />
      </Field>

      {sig && !sig.readings.length && (
        <p className="error">
          That is neither hex nor Base64. A signature header is usually one of those, sometimes
          behind a prefix like <code>sha256=</code>.
        </p>
      )}

      {sig && sig.readings.length > 0 && (
        <>
          <p className="muted small">
            {sig.scheme && <>Prefix <code>{sig.scheme}=</code> removed. </>}
            Read as {sig.readings[0].label}, {bytesLabel(sig.readings[0].bytes.length)}
            {sigAlgos.length
              ? <> — a digest that length can only be {sigAlgos.map((a) => a.label).join(" or ")}.</>
              : <> — no HMAC produces a digest that length, so it is likely truncated or not a digest at all.</>}
          </p>

          {matched ? (
            <div className="result-list">
              <div className="result-row result-row-hl">
                <span className="result-label">Match</span>
                <span className="result-val">
                  The signature is {algoById(algo).label} of this message with this key.
                </span>
              </div>
            </div>
          ) : mac ? (
            <>
              <p className="error">
                No match with the settings above.
                {report && !report.matches.length && " Nothing else tried here matched either."}
              </p>
              {report && report.matches.length > 0 && (
                <div className="result-list">
                  {report.matches.map((m, i) => (
                    <div key={i} className="result-row result-row-hl">
                      <span className="result-label">Found it</span>
                      <span className="result-val">
                        {m.algoLabel}, with the secret read as {m.keyLabel.toLowerCase()} and the
                        message {m.msgLabel}.
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {report && (
                <p className="muted small">
                  {report.matches.length > 0
                    ? "Every reading of your secret, every algorithm and the handful of ways a message changes in transit were tried against the signature; the settings above are the ones that reproduce it."
                    : "Every algorithm, every reading of the secret (text, hex, Base64) and the usual transit changes — a trailing newline gained or lost, CRLF line endings, surrounding whitespace — were tried. None reproduced this signature, so either the secret is wrong or the sender signs something other than the exact bytes in the box above."}
                </p>
              )}
            </>
          ) : null}
        </>
      )}

      <p className="muted small" style={{ marginTop: "1.5rem" }}>
        <strong>HMAC is not the hash of your secret joined to your message.</strong> It runs the hash
        twice over two different paddings of the key, and that structure is what stops a
        length-extension attack: with a plain <code>SHA256(secret + message)</code> an attacker who
        never learns the secret can still append to your message and produce a valid digest for the
        longer one. That is the whole reason HMAC exists.
      </p>
      <p className="muted small">
        When you check a signature in your own code, compare it with a constant-time function —
        <code> crypto.timingSafeEqual</code> in Node, <code>hmac.compare_digest</code> in Python,
        <code> hash_equals</code> in PHP — not with <code>===</code>. An ordinary comparison returns
        as soon as two bytes differ, and that timing difference is enough to recover a valid
        signature one byte at a time.
      </p>
      <p className="muted small">
        Everything here runs in your browser — SHA-1 through SHA-512 on the built-in Web Crypto API,
        MD5 in JavaScript because Web Crypto deliberately dropped it — and nothing is uploaded. Even so, a production signing key is worth rotating rather than
        pasting anywhere; use a throwaway value if you only need to check the shape of a signature.
      </p>
    </div>
  );
}
