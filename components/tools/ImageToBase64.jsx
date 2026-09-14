"use client";
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import OutputBox from "@/components/OutputBox";
import { Segmented } from "@/components/calc/Calc";
import {
  bytesToBase64, decodeImageInput, sniffImage, svgOptimize,
  svgPercentDataUri, WRAPPERS, wrapDataUri,
} from "./imageBase64";

// A data URI has to be held in memory as bytes, as a Base64 string and as the
// wrapped output all at once, so the ceiling is well below what the file
// inputs would otherwise accept. Anything near it is the wrong thing to inline
// in the first place, which the tool says rather than grinding to a halt.
const MAX_BYTES = 10 * 1024 * 1024;

// Past roughly this size a data URI costs more than the request it saves: it
// cannot be cached on its own, and it inflates every page that carries it.
// The figure is deliberately lower than the one folklore inherited from
// HTTP/1.1, where six connections per host made a request genuinely expensive.
// Over HTTP/2 and HTTP/3 an extra request on an open connection is cheap, so
// the size at which inlining stops paying came down with it.
const INLINE_BUDGET = 4 * 1024;

async function gzipSize(data) {
  if (typeof CompressionStream !== "function") return null;
  const src = typeof data === "string" ? new TextEncoder().encode(data) : data;
  try {
    const stream = new Blob([src]).stream().pipeThrough(new CompressionStream("gzip"));
    return (await new Response(stream).arrayBuffer()).byteLength;
  } catch {
    return null;
  }
}

const pct = (a, b) => (b ? ((a / b) * 100 - 100).toFixed(1) : "0");

export default function ImageToBase64() {
  const [mode, setMode] = useState("encode");

  // ---- encode side ----
  const [src, setSrc] = useState(null); // { name, stem, bytes, kind, svg }
  const [wrapper, setWrapper] = useState("uri");
  const [svgEnc, setSvgEnc] = useState("percent");
  const [alt, setAlt] = useState("");
  const [dims, setDims] = useState(null);
  const [gz, setGz] = useState(null); // { file, out }
  const [error, setError] = useState("");

  // ---- decode side ----
  const [paste, setPaste] = useState("");
  const [decoded, setDecoded] = useState(null);
  const decodedUrl = useRef("");

  useEffect(() => () => { if (decodedUrl.current) URL.revokeObjectURL(decodedUrl.current); }, []);

  const onFiles = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    // Cleared here rather than in an effect: an effect runs one render too
    // late, so the previous file's output would paint against the new name.
    setError("");
    setSrc(null);
    setDims(null);
    setGz(null);
    if (file.size > MAX_BYTES) {
      setError(
        fmtBytes(file.size) + " is too large to inline. Base64 would make it " +
        fmtBytes(file.size * 1.37) + " of text in your stylesheet, and a file this size belongs in its own " +
        "cacheable request. Compress it first, or link to it normally."
      );
      return;
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniffImage(bytes);
    if (!kind) {
      setError("That file's first bytes don't match any image format. Base64 works on anything, but this tool checks, so you get a usable data URI rather than one the browser refuses to render.");
      return;
    }
    const stem = (file.name || "image").replace(/\.[^.]+$/, "");
    const svg = kind.ext === "svg" ? svgOptimize(new TextDecoder("utf-8").decode(bytes)) : null;
    setSrc({ name: file.name || "image", stem, bytes, kind, svg });
    setAlt(stem.replace(/[-_]+/g, " ").trim());
    setSvgEnc("percent");
  }, []);

  // Base64 of the raw file. Cheap enough to do synchronously well below the
  // 10 MB ceiling, and it has to exist before anything else can be measured.
  const base64 = useMemo(() => (src ? bytesToBase64(src.bytes) : ""), [src]);

  const usePercent = !!src?.svg && svgEnc === "percent";
  const uri = useMemo(() => {
    if (!src) return "";
    if (usePercent) return svgPercentDataUri(src.svg.svg);
    return "data:" + src.kind.mime + ";base64," + base64;
  }, [src, usePercent, base64]);

  // The alternative encoding, measured rather than asserted: for SVG the two
  // are close enough on raw characters that only the numbers settle it.
  const altUri = useMemo(() => {
    if (!src?.svg) return "";
    return usePercent
      ? "data:" + src.kind.mime + ";base64," + base64
      : svgPercentDataUri(src.svg.svg);
  }, [src, usePercent, base64]);

  const output = useMemo(
    () => (uri ? wrapDataUri(wrapper, uri, { base64, alt, width: dims?.w, height: dims?.h }) : ""),
    [wrapper, uri, base64, alt, dims]
  );

  // Intrinsic size, read back from the data URI itself — which also proves the
  // URI the tool is about to hand over actually decodes in a browser.
  useEffect(() => {
    if (!uri) return;
    let live = true;
    const img = new Image();
    img.onload = () => { if (live) setDims({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { if (live) setDims(null); };
    img.src = uri;
    return () => { live = false; };
  }, [uri]);

  // Gzip is the only comparison that means anything for something destined for
  // a stylesheet, and it is not the 33% everybody quotes.
  useEffect(() => {
    if (!src || !uri) return;
    let live = true;
    (async () => {
      const [file, out] = await Promise.all([gzipSize(src.bytes), gzipSize(uri)]);
      if (live) setGz(file && out ? { file, out } : null);
    })();
    return () => { live = false; };
  }, [src, uri]);

  const runDecode = (text) => {
    setPaste(text);
    if (decodedUrl.current) { URL.revokeObjectURL(decodedUrl.current); decodedUrl.current = ""; }
    if (!text.trim()) { setDecoded(null); return; }
    try {
      const res = decodeImageInput(text);
      if (!res) { setDecoded(null); return; }
      const kind = sniffImage(res.bytes);
      if (!kind) {
        setDecoded({ error: "That decoded cleanly, but the bytes are not an image — the first ones match no known format. It may be Base64 of something else entirely, or only part of the string." });
        return;
      }
      const blob = new Blob([res.bytes], { type: kind.mime });
      const url = URL.createObjectURL(blob);
      decodedUrl.current = url;
      const mismatch =
        res.declaredMime && res.declaredMime !== kind.mime && !(res.declaredMime === "image/jpg" && kind.ext === "jpg");
      setDecoded({ ...res, kind, url, blob, mismatch });
    } catch (e) {
      setDecoded({ error: e.message });
    }
  };

  const overBudget = src && uri.length > INLINE_BUDGET;

  return (
    <div>
      <Segmented
        ariaLabel="Direction"
        value={mode}
        onChange={setMode}
        options={[{ value: "encode", label: "Image to Base64" }, { value: "decode", label: "Base64 to image" }]}
      />

      {mode === "encode" ? (
        <>
          <PdfDropzone
            onFiles={onFiles}
            accept="image/*,.svg"
            multiple={false}
            label="Drop an image here, or click to choose"
            hint="PNG, JPG, GIF, WebP, SVG, AVIF or ICO. Encoded in your browser — never uploaded."
          />
          {error && <p className="error">{error}</p>}

          {src && (
            <>
              <div className="svg-stage svg-stage-alpha">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={uri} alt={alt || src.name} />
              </div>
              <p className="muted small">
                {src.name} — {src.kind.label}
                {dims ? `, ${dims.w}×${dims.h}px` : ""}. Identified from its first bytes, not its extension.
              </p>

              <div className="stat-grid">
                <div className="stat">
                  <span className="stat-num">{fmtBytes(src.bytes.length)}</span>
                  <span className="stat-label">File on disk</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{uri.length.toLocaleString()}</span>
                  <span className="stat-label">Data URI characters</span>
                </div>
                <div className="stat">
                  <span className="stat-num">+{pct(uri.length, src.bytes.length)}%</span>
                  <span className="stat-label">Bigger as text</span>
                </div>
                <div className="stat">
                  <span className="stat-num">{gz ? "+" + pct(gz.out, gz.file) + "%" : "—"}</span>
                  <span className="stat-label">Bigger after gzip</span>
                </div>
              </div>
              {gz && (
                <p className="muted small">
                  Gzipped, the file is {fmtBytes(gz.file)} and the data URI is {fmtBytes(gz.out)}. Base64 only uses 64 of
                  the 256 possible byte values, so compression wins most of the famous 33% back — the real cost of
                  inlining is not the bytes, it is that a data URI cannot be cached on its own and has to be re-sent
                  inside every page or stylesheet that carries it.
                </p>
              )}

              {src.svg && (
                <>
                  <Segmented
                    ariaLabel="SVG encoding"
                    value={svgEnc}
                    onChange={setSvgEnc}
                    options={[
                      { value: "percent", label: "Percent-encoded" },
                      { value: "base64", label: "Base64" },
                    ]}
                  />
                  <p className="muted small">
                    SVG is the one image format that is text, so it does not need Base64 at all. Percent-encoding escapes
                    only the characters it must, stays readable in the stylesheet — you can change a{" "}
                    <code>fill</code> without re-encoding — and compresses like the markup it still is. Here it is{" "}
                    <strong>{uri.length.toLocaleString()}</strong> characters against{" "}
                    <strong>{altUri.length.toLocaleString()}</strong> for the other encoding
                    {gz ? ", and gzipped that gap usually widens further" : ""}.
                    {src.svg.changes.length > 0 && (
                      <> Before encoding it {src.svg.changes.join(", ")} — nothing that changes how the image draws.</>
                    )}
                    {!src.svg.changes.length && src.svg.svg.includes("<text") && (
                      <> It was left exactly as-is: whitespace inside a <code>&lt;text&gt;</code> node is rendered, so it is not safe to collapse.</>
                    )}
                  </p>
                </>
              )}

              {overBudget && (
                <p className="muted small">
                  At {fmtBytes(uri.length)} of text this is past the point where inlining usually pays. A few kilobytes
                  of data URI can still be worth the request it saves, but beyond that you are trading a file the
                  browser could have cached once for weight on every single page load — and over HTTP/2 the request you
                  saved was cheap to begin with. Keep it as a file, or{" "}
                  <a href="/image/compress-image-to-size">compress it to a target size</a> first.
                </p>
              )}

        <Segmented
                ariaLabel="Output format"
                value={usePercent && wrapper === "raw" ? "uri" : wrapper}
                onChange={setWrapper}
                options={usePercent ? WRAPPERS.filter((w) => w.value !== "raw") : WRAPPERS}
              />

              {(wrapper === "html" || wrapper === "md") && (
                <label className="field">
                  <span className="field-label">Alt text</span>
                  <input className="inp" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="What the image shows" />
                </label>
              )}
              {wrapper === "html" && dims && (
                <p className="muted small">
                  The <code>width</code> and <code>height</code> are the image&apos;s real pixel size, read back from the
                  data URI. They are worth keeping: they let the browser reserve the right space before the image
                  decodes, which is what stops the page jumping.
                </p>
              )}
              {wrapper === "raw" && !usePercent && (
                <p className="muted small">
                  Base64 on its own, with no <code>data:</code> header. This is what an API field or a YAML secret
                  wants — a browser needs the header to know what it is being handed.
                </p>
              )}

              <OutputBox
                value={output}
                downloadName={src.stem + (wrapper === "css" ? ".css" : wrapper === "html" ? ".html" : ".txt")}
                mimeType="text/plain"
              />
            </>
          )}
        </>
      ) : (
        <>
          <label className="field">
            <span className="field-label">Base64 or data URI</span>
            <textarea
              className="inp mono"
              rows={6}
              value={paste}
              onChange={(e) => runDecode(e.target.value)}
              placeholder="data:image/png;base64,iVBORw0KGgo…  — or just the Base64, or the whole CSS rule you copied it from"
            />
          </label>
          <p className="muted small">
            Line breaks, missing <code>=</code> padding, the URL-safe alphabet and the{" "}
            <code>url(&quot;…&quot;)</code> or <code>&lt;img src=&quot;…&quot;&gt;</code> it was copied from are all
            handled — each of them makes a plain decoder throw.
          </p>

          {decoded?.error && <p className="error">{decoded.error}</p>}

          {decoded && !decoded.error && (
            <>
              <div className="svg-stage svg-stage-alpha">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={decoded.url} alt="Decoded image" />
              </div>
              <div className="result-list">
                <div className="result-row">
                  <span className="result-label">Format</span>
                  <span className="result-val">{decoded.kind.label} ({decoded.kind.mime})</span>
                </div>
                <div className="result-row">
                  <span className="result-label">Size</span>
                  <span className="result-val">{fmtBytes(decoded.bytes.length)}</span>
                </div>
                {decoded.notes.length > 0 && (
                  <div className="result-row">
                    <span className="result-label">Cleaned up</span>
                    <span className="result-val">{decoded.notes.join(", ")}</span>
                  </div>
                )}
              </div>
              {decoded.mismatch && (
                <p className="muted small">
                  The header claims <code>{decoded.declaredMime}</code>, but the bytes are {decoded.kind.label}. The
                  bytes win — that is what a browser goes by for images too — so the download is named{" "}
                  <code>.{decoded.kind.ext}</code>.
                </p>
              )}
              <div className="btn-row">
                <button className="btn" onClick={() => downloadBytes(decoded.blob, "decoded." + decoded.kind.ext, decoded.kind.mime)}>
                  Download .{decoded.kind.ext}
                </button>
              </div>
            </>
          )}
        </>
      )}

      <p className="muted small">
        Everything here runs in your browser — the file is read with <code>FileReader</code> and encoded in memory, so
        nothing is uploaded and it works offline once the page has loaded. To go the other way and shrink a file before
        inlining it, use the <a href="/image/image-compressor">image compressor</a>; to turn a vector into a raster
        first, use <a href="/image/svg-to-png">SVG to PNG</a>. For text rather than files, there is a plain{" "}
        <a href="/dev/base64-encoder">Base64 encoder</a>.
      </p>
    </div>
  );
}
