"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { resolveSvgSize, normalizeSvg, SIZE_SOURCE_LABEL } from "./svgRaster";
import { Segmented } from "@/components/calc/Calc";

const FORMATS = [
  { value: "image/png", label: "PNG", ext: "png" },
  { value: "image/jpeg", label: "JPG", ext: "jpg" },
  { value: "image/webp", label: "WebP", ext: "webp" },
];

const SCALES = [1, 2, 3, 4, 8];

// Chrome refuses a canvas wider or taller than 65,535px and caps the total area
// at 16,384^2; Safari is stricter still. Staying well inside both means a
// mistyped width fails here, with an explanation, rather than as a blank file.
const MAX_SIDE = 16384;
const MAX_AREA = 40e6;

export default function SvgToPng() {
  const [source, setSource] = useState(null); // { text, name, size }
  const [info, setInfo] = useState(null); // resolveSvgSize() result
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [format, setFormat] = useState("image/png");
  const [quality, setQuality] = useState(0.92);
  const [bg, setBg] = useState("transparent"); // transparent | white | custom
  const [bgColor, setBgColor] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { url, blob, w, h }
  const [error, setError] = useState("");
  const urlRef = useRef("");

  const release = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = "";
  }, []);

  useEffect(() => release, [release]);

  const reset = useCallback(() => {
    release();
    setResult(null);
  }, [release]);

  // A new file, a new size or a new format invalidates whatever was rendered.
  useEffect(() => { reset(); }, [source, w, h, format, quality, bg, bgColor, reset]);

  const onFiles = async (files) => {
    const file = files[0];
    if (!file) return;
    setError("");
    // Drop the previous render synchronously. Relying on the invalidation
    // effect is one render too late: it runs after a render in which source
    // is already null but the old result is still on screen.
    release();
    setResult(null);
    setSource(null);
    setInfo(null);
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      let text;
      // .svgz is a gzipped .svg — Inkscape writes it by default on some
      // platforms, and it is otherwise indistinguishable to the user.
      if (buf[0] === 0x1f && buf[1] === 0x8b) {
        if (typeof DecompressionStream !== "function") {
          setError("This is a gzipped SVG (.svgz) and this browser can't unpack it. Save it as a plain .svg and try again.");
          return;
        }
        const ds = new DecompressionStream("gzip");
        text = await new Response(new Blob([buf]).stream().pipeThrough(ds)).text();
      } else {
        text = new TextDecoder("utf-8").decode(buf);
      }
      const resolved = resolveSvgSize(text);
      if (!resolved) {
        setError("That file doesn't contain an <svg> element. Check you picked an SVG and not a PNG or PDF.");
        return;
      }
      setSource({ text, name: (file.name || "image").replace(/\.svgz?$/i, ""), size: file.size });
      setInfo(resolved);
      setW(Math.max(1, Math.round(resolved.width)));
      setH(Math.max(1, Math.round(resolved.height)));
      setLock(true);
    } catch {
      setError("Couldn't read that file. It may be damaged.");
    }
  };

  const ratio = info ? info.ratio : 1;
  const setWidth = (val) => {
    const nw = Math.max(1, Math.round(Number(val) || 0));
    setW(nw);
    if (lock) setH(Math.max(1, Math.round(nw / ratio)));
  };
  const setHeight = (val) => {
    const nh = Math.max(1, Math.round(Number(val) || 0));
    setH(nh);
    if (lock) setW(Math.max(1, Math.round(nh * ratio)));
  };
  const applyScale = (s) => {
    if (!info) return;
    setLock(true);
    setW(Math.max(1, Math.round(info.width * s)));
    setH(Math.max(1, Math.round(info.height * s)));
  };

  const fmt = FORMATS.find((f) => f.value === format) || FORMATS[0];
  const isLossy = format !== "image/png";
  // JPG has no alpha channel at all, so "transparent" is not on offer there.
  const opaque = format === "image/jpeg" || bg !== "transparent";
  const fillColor = bg === "custom" ? bgColor : "#ffffff";
  const tooBig = w > MAX_SIDE || h > MAX_SIDE || w * h > MAX_AREA;
  // The source ratio is only meaningful when the file actually declared one.
  const ratioDrift = info && Math.abs(w / h - ratio) / ratio > 0.005;

  const render = async () => {
    if (!source || !info || tooBig) return;
    setBusy(true);
    setError("");
    release();
    setResult(null);
    let url = "";
    try {
      // Rasterise from an SVG rewritten to declare exactly the target pixel
      // size. Drawing a differently-sized SVG and letting drawImage scale it
      // would rasterise at the intrinsic size first and then resample, which
      // is the blur every naive converter produces on an upscale.
      const normalized = normalizeSvg(source.text, w, h);
      const blob = new Blob([normalized], { type: "image/svg+xml;charset=utf-8" });
      url = URL.createObjectURL(blob);
      const img = new Image();
      img.decoding = "sync";
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("decode"));
        img.src = url;
      });
      if (typeof img.decode === "function") await img.decode().catch(() => {});

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (opaque) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.drawImage(img, 0, 0, w, h);

      const out = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), format, isLossy ? quality : undefined);
      });
      const outUrl = URL.createObjectURL(out);
      urlRef.current = outUrl;
      setResult({ url: outUrl, blob: out, w, h });
    } catch (err) {
      setError(
        err?.message === "encode"
          ? `This browser couldn't encode ${fmt.label}. Try PNG.`
          : "Couldn't render that SVG. If it is valid, it may reference a font or image the browser won't load inside an <img>."
      );
    } finally {
      if (url) URL.revokeObjectURL(url);
      setBusy(false);
    }
  };

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        accept=".svg,.svgz,image/svg+xml"
        multiple={false}
        label="Drop an SVG here, or click to choose"
        hint="SVG or SVGZ. Rendered in your browser — never uploaded."
      />

      {error && <p className="error">{error}</p>}

      {source && info && (
        <>
          <p className="muted small">
            {source.name}.svg — {fmtBytes(source.size)}. Detected size{" "}
            <strong>{Math.round(info.width)}×{Math.round(info.height)}px</strong> ({SIZE_SOURCE_LABEL[info.source]}).
          </p>
          {info.source === "viewbox" && (
            <p className="muted small">
              A browser showing this file directly would size it 150px tall, because an SVG with no width or height has
              no intrinsic size. The viewBox units are the size it was drawn at, so that is what 1× means here.
            </p>
          )}
          {info.source === "default" && (
            <p className="muted small">
              This file declares no width, height or viewBox, so there is no size to read from it — 300×150 is the
              fallback every browser uses. Set the width you want below.
            </p>
          )}
          {!info.viewBox && (
            <p className="muted small">
              It has no viewBox either, so a viewBox is added before rendering. Without one the drawing stays its
              original size inside a bigger canvas instead of scaling up.
            </p>
          )}

          <div className="chip-row" style={{ flexWrap: "wrap" }}>
            {SCALES.map((s) => (
              <button key={s} className="btn btn-ghost btn-sm" onClick={() => applyScale(s)}>
                {s}× — {Math.round(info.width * s)}×{Math.round(info.height * s)}
              </button>
            ))}
          </div>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Width (px)</span>
              <input className="inp" type="number" min={1} value={w} onChange={(e) => setWidth(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Height (px)</span>
              <input className="inp" type="number" min={1} value={h} onChange={(e) => setHeight(e.target.value)} />
            </label>
          </div>
          <label className="check-row">
            <input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} />
            <span>Lock aspect ratio</span>
          </label>
          {ratioDrift && (
            <p className="muted small">
              That is a different shape from the source, so the drawing is centred inside it and the spare space is
              filled with the background — it is padded, not stretched.
            </p>
          )}
          {tooBig && (
            <p className="error">
              {w}×{h} is past what browsers will allocate for a canvas. Keep each side under {MAX_SIDE.toLocaleString()}px
              and the total under {(MAX_AREA / 1e6).toFixed(0)} megapixels.
            </p>
          )}

          <Segmented
            ariaLabel="Output format"
            value={format}
            onChange={setFormat}
            options={FORMATS.map((f) => ({ value: f.value, label: f.label }))}
          />

          <div className="field-row">
            <label className="field">
              <span className="field-label">Background</span>
              <select
                className="inp"
                value={format === "image/jpeg" && bg === "transparent" ? "white" : bg}
                onChange={(e) => setBg(e.target.value)}
              >
                {format !== "image/jpeg" && <option value="transparent">Transparent</option>}
                <option value="white">White</option>
                <option value="custom">Custom colour</option>
              </select>
            </label>
            {bg === "custom" && (
              <label className="field">
                <span className="field-label">Colour</span>
                <input className="qr-color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
              </label>
            )}
          </div>
          {format === "image/jpeg" && (
            <p className="muted small">JPG has no transparency, so transparent areas are filled with the background colour.</p>
          )}

          {isLossy && (
            <label className="field">
              <span className="field-label">Quality: {Math.round(quality * 100)}%</span>
              <input
                type="range"
                min={0.3}
                max={1}
                step={0.01}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </label>
          )}

          <div className="btn-row">
            <button className="btn" onClick={render} disabled={busy || tooBig}>
              {busy ? "Rendering…" : `Convert to ${fmt.label}`}
            </button>
          </div>
        </>
      )}

      {result && source && (
        <>
          <div className={"svg-stage" + (opaque ? "" : " svg-stage-alpha")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.url} alt={`${source.name} as ${fmt.label}`} />
          </div>
          <p className="muted small">
            {result.w}×{result.h}px {fmt.label} — {fmtBytes(result.blob.size)}
          </p>
          <div className="btn-row">
            <button className="btn" onClick={() => downloadBytes(result.blob, `${source.name}.${fmt.ext}`, format)}>
              Download {fmt.label}
            </button>
          </div>
        </>
      )}

      <p className="muted small">
        Text is drawn with the fonts already on your device: a browser will not fetch a webfont for an SVG loaded as an
        image, so convert text to outlines in your editor if the lettering has to match exactly. For the same reason,
        images and stylesheets linked by URL from inside the SVG are not loaded — embedded (data URI) ones are. To go
        the other way and shrink a raster file, use the <a href="/image/image-compressor">image compressor</a>.
      </p>
    </div>
  );
}
