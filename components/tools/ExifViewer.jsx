"use client";
import { useState } from "react";
import ImageDropzone, { fmtBytes } from "./ImageDropzone";
import { downloadBytes } from "./PdfDropzone";
import { stripMetadata, sniffFormat, webpExifBlock } from "./stripMeta";

// exifr is ~50KB and only this page needs it, so it is fetched on first use and
// then kept — the same lazy-import shape the OCR tools use for tesseract.
let exifrPromise = null;
const loadExifr = () => (exifrPromise ||= import("exifr").then((m) => m.default || m));

// exifr's blocks, in the order they are worth reading. `xmp` and `iptc` are the
// editorial ones: captions, credits and keywords written by editing software.
const BLOCKS = [
  ["gps", "Location"],
  ["ifd0", "Camera & image"],
  ["exif", "Capture settings"],
  ["iptc", "IPTC (caption, credit, keywords)"],
  ["xmp", "XMP (editing software)"],
  ["icc", "Colour profile"],
];

// Tags surfaced in the summary, in reading order, with how to render each one.
const asIs = (v) => String(v);
const NOTABLE = [
  ["Make", "Camera make", asIs],
  ["Model", "Camera model", asIs],
  ["LensModel", "Lens", asIs],
  ["BodySerialNumber", "Camera serial number", asIs],
  ["SerialNumber", "Serial number", asIs],
  ["DateTimeOriginal", "Taken on", asIs],
  ["CreateDate", "Created", asIs],
  ["ModifyDate", "Last modified", asIs],
  ["ExposureTime", "Shutter speed", (v) => (typeof v === "number" && v > 0 && v < 1 ? `1/${Math.round(1 / v)} s` : `${v} s`)],
  ["FNumber", "Aperture", (v) => `f/${v}`],
  ["ISO", "ISO", asIs],
  ["FocalLength", "Focal length", (v) => `${v} mm`],
  ["Software", "Software", asIs],
  ["Artist", "Artist", asIs],
  ["Copyright", "Copyright", asIs],
  ["OwnerName", "Owner name", asIs],
  ["HostComputer", "Computer", asIs],
];

// exifr builds Date objects from the local-time components in the file, so
// reading them back with the local getters returns the camera's wall clock —
// which is what the photo actually records. Exif stores no time zone.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n) => String(n).padStart(2, "0");
function fmtValue(v) {
  if (v === null || v === undefined) return "";
  if (v instanceof Date) {
    if (Number.isNaN(v.getTime())) return "";
    return `${v.getDate()} ${MONTHS[v.getMonth()]} ${v.getFullYear()}, ${pad(v.getHours())}:${pad(v.getMinutes())}:${pad(v.getSeconds())}`;
  }
  if (Array.isArray(v)) return v.map(fmtValue).join(", ");
  if (v instanceof Uint8Array) return `${v.length} bytes of binary data`;
  if (typeof v === "object") return Object.entries(v).map(([k, x]) => `${k}: ${fmtValue(x)}`).join(", ");
  if (typeof v === "number") return String(Math.round(v * 1e6) / 1e6);
  return String(v).trim();
}

// Decimal degrees to the degrees/minutes/seconds form maps apps show.
const dms = (deg, pos, neg) => {
  const dir = deg < 0 ? neg : pos;
  const a = Math.abs(deg);
  const d = Math.floor(a);
  const m = Math.floor((a - d) * 60);
  const s = ((a - d) * 60 - m) * 60;
  return `${d}° ${m}' ${s.toFixed(1)}" ${dir}`;
};

export default function ExifViewer() {
  const [file, setFile] = useState(null);
  const [raw, setRaw] = useState(null);
  const [meta, setMeta] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [cleaned, setCleaned] = useState(null);

  const onImage = async (_img, f) => {
    setBusy(true);
    setError("");
    setMeta(null);
    setCleaned(null);
    setShowAll(false);
    setFile(f);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      setRaw(bytes);
      const exifr = await loadExifr();
      // WebP keeps Exif in a RIFF chunk exifr does not read; hand it the bare
      // TIFF block from inside instead, which it does.
      const input = sniffFormat(bytes) === "webp" ? webpExifBlock(bytes) : bytes;
      const parsed = input
        ? await exifr
            .parse(input, {
              mergeOutput: false,
              tiff: true,
              ifd0: true,
              exif: true,
              gps: true,
              iptc: true,
              xmp: true,
              icc: true,
              interop: true,
              translateKeys: true,
              translateValues: true,
              reviveValues: true,
            })
            .catch(() => null)
        : null;
      setMeta(parsed || {});
    } catch {
      setError("Couldn't read that file. Try a JPG, PNG or WebP saved straight from your camera or phone.");
    } finally {
      setBusy(false);
    }
  };

  const clean = () => {
    if (!raw || !file) return;
    const res = stripMetadata(raw);
    if (!res) {
      setError("This format can't be cleaned without re-encoding it. Convert it to JPG or PNG first, then run it through here.");
      return;
    }
    const base = file.name.replace(/\.[^.]+$/, "");
    const ext = res.format === "jpeg" ? "jpg" : res.format;
    const mime = res.format === "jpeg" ? "image/jpeg" : `image/${res.format}`;
    downloadBytes(res.bytes, `${base}-clean.${ext}`, mime);
    setCleaned(res);
  };

  // Every tag exifr found, flattened to rows, minus the structural headers.
  const groups = BLOCKS.map(([key, label]) => {
    const block = meta?.[key];
    if (!block || typeof block !== "object") return null;
    const rows = Object.entries(block)
      .filter(([k, v]) => v !== undefined && v !== null && v !== "" && !(key === "gps" && (k === "latitude" || k === "longitude")))
      .map(([k, v]) => ({ k, v: fmtValue(v) }))
      .filter((r) => r.v !== "");
    return rows.length ? { key, label, rows } : null;
  }).filter(Boolean);

  const tagCount = groups.reduce((n, g) => n + g.rows.length, 0);
  const lat = meta?.gps?.latitude;
  const lon = meta?.gps?.longitude;
  const hasGps = typeof lat === "number" && typeof lon === "number";

  const flat = { ...(meta?.ifd0 || {}), ...(meta?.exif || {}) };
  const summary = NOTABLE.map(([k, label, fmt]) => {
    const v = flat[k];
    if (v === undefined || v === null || v === "") return null;
    // The per-tag formatters below all take a number; anything else goes
    // through the generic renderer.
    const text = typeof v === "number" ? fmt(v) : fmtValue(v);
    return text ? { k, label, text } : null;
  }).filter(Boolean);

  const scanned = !busy && meta !== null;
  const canClean = raw ? !!sniffFormat(raw) : false;

  return (
    <div>
      <ImageDropzone
        onImage={onImage}
        hint="JPG, PNG or WebP. Read in your browser — the photo is never uploaded."
      />

      {busy && <p className="muted small">Reading metadata…</p>}
      {error && <p className="error">{error}</p>}

      {scanned && (
        <>
          <div className="result-list">
            <div className="result-row">
              <span className="result-label">File</span>
              <span className="result-val">
                {file?.name} — {fmtBytes(raw?.length || 0)}
              </span>
            </div>
          </div>

          {tagCount === 0 ? (
            <p className="muted small" style={{ marginTop: "1rem" }}>
              No Exif, GPS, IPTC or XMP was found. Either it was never written, or something has already stripped it —
              social networks and messaging apps usually do. A clean copy is still worth taking: it also drops comment
              blocks and text chunks that this list doesn&apos;t cover.
            </p>
          ) : (
            <>
              <p className="muted small" style={{ marginTop: "1rem" }}>
                Found <strong>{tagCount}</strong> metadata {tagCount === 1 ? "tag" : "tags"} in this image.
              </p>

              {hasGps && (
                <div className="result-list">
                  <div className="result-row result-row-hl">
                    <span className="result-label">Location</span>
                    <span className="result-val">
                      {lat.toFixed(6)}, {lon.toFixed(6)}
                    </span>
                  </div>
                  <div className="result-row">
                    <span className="result-label">In degrees</span>
                    <span className="result-val">
                      {dms(lat, "N", "S")}, {dms(lon, "E", "W")}
                    </span>
                  </div>
                </div>
              )}
              {hasGps && (
                <p className="muted small">
                  These coordinates pinpoint where the photo was taken, usually to within a few metres. Paste them into
                  a map to see the spot — we deliberately don&apos;t send them anywhere for you.
                </p>
              )}

              {summary.length > 0 && (
                <div className="result-list">
                  {summary.map((s) => (
                    <div className="result-row" key={s.k}>
                      <span className="result-label">{s.label}</span>
                      <span className="result-val">{s.text}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="btn-row">
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Hide full list" : `Show all ${tagCount} tags`}
                </button>
              </div>

              {showAll &&
                groups.map((g) => (
                  <div key={g.key} style={{ marginTop: "1rem" }}>
                    <span className="field-label">{g.label}</span>
                    <div className="result-list">
                      {g.rows.map((r) => (
                        <div className="result-row" key={g.key + r.k}>
                          <span className="result-label">{r.k}</span>
                          <span className="result-val">{r.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </>
          )}

          <div className="btn-row">
            <button className="btn" onClick={clean} disabled={!canClean}>
              Download clean copy
            </button>
          </div>
          {canClean ? (
            <p className="muted small">
              Removes Exif, GPS, XMP and IPTC by rewriting the file&apos;s container. The compressed image data is
              copied across untouched, so the picture is not re-encoded and loses no quality. The colour profile stays
              in, so it still looks right.
            </p>
          ) : (
            <p className="muted small">
              Clean copies are available for JPG, PNG and WebP. Convert this file first with the{" "}
              <a href="/image/image-converter">Image Converter</a>, then bring it back here.
            </p>
          )}
          {cleaned && (
            <p className="muted small">
              Saved {fmtBytes(cleaned.removed)} smaller — {fmtBytes(raw.length)} → {fmtBytes(cleaned.bytes.length)}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
