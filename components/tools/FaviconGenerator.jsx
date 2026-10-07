"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { resolveSvgSize, normalizeSvg } from "./svgRaster";
import { buildZip } from "./zip";
import { Segmented } from "@/components/calc/Calc";
import { ICO_SIZES, PNG_OUTPUTS, fitRect, buildIco, buildManifest, buildHeadSnippet } from "./favicon";

// An SVG is rasterised once at this size and then treated like any other
// image: big enough that even the 512px icon is a downscale.
const SVG_MASTER = 1024;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // decode() before resolving, so the caller can revoke the blob URL at once.
    img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(img));
    img.onerror = () => reject(new Error("decode"));
    img.src = url;
  });
}

function canvasToBytes(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(async (b) => {
      if (!b) return reject(new Error("encode"));
      resolve(new Uint8Array(await b.arrayBuffer()));
    }, "image/png");
  });
}

// One drawImage from a 2000px photo straight down to 16px samples a handful of
// source pixels and aliases badly, whatever imageSmoothingQuality says. Halving
// repeatedly until within 2× of the target averages every pixel on the way down.
function stepDown(source, sw, sh, target) {
  let cur = source;
  let w = sw;
  let h = sh;
  let first = true;
  while (Math.max(w, h) / 2 >= target) {
    const nw = Math.max(1, Math.round(w / 2));
    const nh = Math.max(1, Math.round(h / 2));
    const c = document.createElement("canvas");
    c.width = nw;
    c.height = nh;
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(cur, 0, 0, w, h, 0, 0, nw, nh);
    if (!first && cur.width) { cur.width = 0; cur.height = 0; }
    cur = c;
    w = nw;
    h = nh;
    first = false;
  }
  return { img: cur, w, h };
}

function renderIcon(src, srcW, srcH, size, { mode, padding, fill }) {
  const r = fitRect(srcW, srcH, size, mode, padding);
  // Crop first (at full resolution), then step down the cropped region.
  const crop = document.createElement("canvas");
  crop.width = Math.max(1, Math.round(r.sw));
  crop.height = Math.max(1, Math.round(r.sh));
  crop.getContext("2d").drawImage(src, r.sx, r.sy, r.sw, r.sh, 0, 0, crop.width, crop.height);
  const scaled = stepDown(crop, crop.width, crop.height, Math.max(r.dw, r.dh));

  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const ctx = out.getContext("2d");
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(scaled.img, 0, 0, scaled.w, scaled.h, r.dx, r.dy, r.dw, r.dh);
  return out;
}

export default function FaviconGenerator() {
  const srcRef = useRef(null); // { img, w, h }
  const [src, setSrc] = useState(null); // { name, w, h, svg }
  const [mode, setMode] = useState("crop");
  const [padding, setPadding] = useState(0);
  const [bg, setBg] = useState("transparent"); // transparent | white | custom
  const [bgColor, setBgColor] = useState("#ffffff");
  const [appName, setAppName] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null); // { files: [{name,size,bytes,url}], ico, zip }
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const urlsRef = useRef([]);

  const release = useCallback(() => {
    urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    urlsRef.current = [];
  }, []);
  useEffect(() => release, [release]);

  // Any change to the look invalidates the set already generated.
  useEffect(() => { release(); setResult(null); }, [mode, padding, bg, bgColor, release]);

  const onFiles = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setError("");
    release();
    setResult(null);
    setSrc(null);
    srcRef.current = null;
    const name = (file?.name || "icon").replace(/\.[^.]+$/, "");
    try {
      if (file.type === "image/svg+xml" || /\.svg$/i.test(file.name)) {
        // Re-render the SVG at a known large size rather than trusting the
        // <img>'s natural size, which is 300×150 for an icon with only a viewBox.
        // normalizeSvg also adds the xmlns that markup copied out of HTML lacks,
        // without which an <img> refuses to render it at all.
        const text = await file.text();
        const info = resolveSvgSize(text);
        if (!info) throw new Error("svg");
        const scale = SVG_MASTER / Math.max(info.width, info.height);
        const w = Math.max(1, Math.round(info.width * scale));
        const h = Math.max(1, Math.round(info.height * scale));
        const url = URL.createObjectURL(new Blob([normalizeSvg(text, w, h)], { type: "image/svg+xml" }));
        try {
          const master = await loadImage(url);
          srcRef.current = { img: master, w, h };
          setSrc({ name, w: Math.round(info.width), h: Math.round(info.height), svg: true });
        } finally {
          URL.revokeObjectURL(url);
        }
      } else {
        const url = URL.createObjectURL(file);
        try {
          const img = await loadImage(url);
          if (!img.naturalWidth || !img.naturalHeight) throw new Error("decode");
          srcRef.current = { img, w: img.naturalWidth, h: img.naturalHeight };
          setSrc({ name, w: img.naturalWidth, h: img.naturalHeight, svg: false });
        } finally {
          URL.revokeObjectURL(url);
        }
      }
    } catch {
      setError("Couldn't read that image. Use a PNG, JPG, WebP or SVG — HEIC photos need converting first.");
    }
  }, [release]);

  const fill = bg === "transparent" ? null : bg === "white" ? "#ffffff" : bgColor;
  const manifestColor = fill || "#ffffff";

  const generate = async () => {
    const s = srcRef.current;
    if (!s) return;
    setBusy(true);
    setError("");
    release();
    setResult(null);
    try {
      const opts = { mode, padding };
      const files = [];
      for (const out of PNG_OUTPUTS) {
        const canvas = renderIcon(s.img, s.w, s.h, out.size, { ...opts, fill: out.opaque ? manifestColor : fill });
        files.push({ name: out.name, size: out.size, bytes: await canvasToBytes(canvas) });
      }
      const icoImages = [];
      for (const size of ICO_SIZES) {
        const existing = files.find((f) => f.size === size && f.name.startsWith("favicon-"));
        const bytes = existing ? existing.bytes : await canvasToBytes(renderIcon(s.img, s.w, s.h, size, { ...opts, fill }));
        icoImages.push({ size, png: bytes });
      }
      const ico = buildIco(icoImages);
      const withUrls = files.map((f) => {
        const url = URL.createObjectURL(new Blob([f.bytes], { type: "image/png" }));
        urlsRef.current.push(url);
        return { ...f, url };
      });
      const icoUrl = URL.createObjectURL(new Blob([icoImages[0].png], { type: "image/png" }));
      urlsRef.current.push(icoUrl);
      setResult({ files: withUrls, ico, icoUrl });
    } catch (err) {
      setError(err?.message === "encode" ? "This browser couldn't encode PNG at that size." : "Couldn't generate the icons from that image.");
    } finally {
      setBusy(false);
    }
  };

  // Built on click from the current name, so editing the name after generating
  // never needs a re-render of the icons.
  const manifestBytes = () => new TextEncoder().encode(buildManifest({ name: appName, color: manifestColor }));
  const downloadZip = () => {
    if (!result) return;
    const zip = buildZip([
      { name: "favicon.ico", data: result.ico },
      ...result.files.map((f) => ({ name: f.name, data: f.bytes })),
      { name: "site.webmanifest", data: manifestBytes() },
    ]);
    downloadBytes(zip, "favicons.zip", "application/zip");
  };

  const snippet = buildHeadSnippet();
  const copy = () => {
    navigator.clipboard?.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const square = src && src.w === src.h;
  const small = src && !src.svg && Math.min(src.w, src.h) < 512;

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        multiple={false}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,.svg"
        label="Drop your logo here, or click to choose"
        hint="PNG, SVG, JPG or WebP — ideally square and 512px or larger. Processed in your browser, never uploaded."
      />

      {error && <p className="error">{error}</p>}

      {src && (
        <>
          <p className="muted small">
            {src.name} — {src.w}×{src.h}px{src.svg ? " SVG, rendered sharp at every size" : ""}.
            {small && ` It is smaller than 512px, so the largest icons are enlarged and will look soft; a bigger source gives a crisper install icon.`}
          </p>

          {!square && (
            <Segmented
              ariaLabel="How to make it square"
              value={mode}
              onChange={setMode}
              options={[
                { value: "crop", label: "Crop to square" },
                { value: "fit", label: "Fit inside square" },
              ]}
            />
          )}

          <label className="field">
            <span className="field-label">Padding: {Math.round(padding * 100)}% each side</span>
            <input type="range" min={0} max={0.25} step={0.01} value={padding} onChange={(e) => setPadding(Number(e.target.value))} />
          </label>

          <div className="field-row">
            <label className="field">
              <span className="field-label">Background</span>
              <select className="inp" value={bg} onChange={(e) => setBg(e.target.value)}>
                <option value="transparent">Transparent</option>
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
          <p className="muted small">
            The Apple touch icon is always filled with {fill ? "this colour" : "white"}: iOS puts a transparent one on a black square.
          </p>

          <label className="field">
            <span className="field-label">Site name (for the web app manifest, optional)</span>
            <input className="inp" type="text" value={appName} maxLength={60} onChange={(e) => setAppName(e.target.value)} placeholder="My Site" />
          </label>

          <div className="btn-row">
            <button className="btn" onClick={generate} disabled={busy}>
              {busy ? "Generating…" : "Generate favicons"}
            </button>
          </div>
        </>
      )}

      {result && (
        <>
          <div className="fav-tabs">
            {["light", "dark"].map((t) => (
              <div key={t} className={`fav-tab fav-tab-${t}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.icoUrl} width={16} height={16} alt="" />
                <span>{appName.trim() || "Your site"}</span>
              </div>
            ))}
          </div>

          <div className="fav-grid">
            {result.files.map((f) => (
              <div key={f.name} className="fav-cell">
                <div className={"fav-swatch" + (fill || f.name === "apple-touch-icon.png" ? "" : " svg-stage-alpha")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={f.url} alt={f.name} width={Math.min(f.size, 96)} height={Math.min(f.size, 96)} />
                </div>
                <span className="small">{f.name}</span>
                <span className="muted small">{f.size}×{f.size} · {fmtBytes(f.bytes.length)}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => downloadBytes(f.bytes, f.name, "image/png")}>Download</button>
              </div>
            ))}
          </div>

          <p className="muted small">
            favicon.ico holds {ICO_SIZES.join(", ")}px in one file — {fmtBytes(result.ico.length)}.
          </p>
          <div className="btn-row">
            <button className="btn" onClick={downloadZip}>
              Download all (.zip)
            </button>
            <button className="btn btn-ghost" onClick={() => downloadBytes(result.ico, "favicon.ico", "image/x-icon")}>
              favicon.ico
            </button>
            <button className="btn btn-ghost" onClick={() => downloadBytes(manifestBytes(), "site.webmanifest", "application/manifest+json")}>
              site.webmanifest
            </button>
          </div>

          <h3 className="sign-step">Add this to your &lt;head&gt;</h3>
          <textarea className="ta" rows={5} readOnly value={snippet} style={{ width: "100%" }} />
          <div className="btn-row">
            <button className="btn btn-ghost btn-sm" onClick={copy}>{copied ? "Copied" : "Copy HTML"}</button>
          </div>
          <p className="muted small">
            Upload every file to the root of your site so the paths start with a slash. Browsers cache favicons hard, so
            a changed icon can take a hard refresh — or a new private window — to show up.
          </p>
        </>
      )}
    </div>
  );
}
