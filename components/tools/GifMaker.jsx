"use client";
import { useState, useRef, useEffect } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented } from "@/components/calc/Calc";
import { delayCs, outputSize, placeRect, loopToRepeat, writeGifFrame, hardenAlpha, MIN_DELAY_CS } from "./gifFrames";

const MAX_FRAMES = 150;
const MAX_WIDTH = 1000;
const DEFAULT_WIDTH = 480;

const FIT_OPTIONS = [
  { value: "contain", label: "Fit whole image" },
  { value: "cover", label: "Fill and crop" },
];
const LOOP_OPTIONS = [
  { value: "forever", label: "Loop forever" },
  { value: "count", label: "Play a set number of times" },
];
const COLOR_OPTIONS = [256, 128, 64, 32].map((n) => ({ value: n, label: String(n) }));

let nextId = 1;

export default function GifMaker() {
  const [frames, setFrames] = useState([]); // [{ id, name, size, bmp, thumb }]
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [widthTouched, setWidthTouched] = useState(false);
  const [fit, setFit] = useState("contain");
  const [bg, setBg] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [seconds, setSeconds] = useState("0.5");
  const [loop, setLoop] = useState("forever");
  const [times, setTimes] = useState(3);
  const [colors, setColors] = useState(256);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { url, bytes, w, h, n, cs, sig }
  const framesRef = useRef(frames);
  const resultRef = useRef(result);
  framesRef.current = frames;
  resultRef.current = result;

  // Release decoded bitmaps and object URLs when the tool unmounts.
  useEffect(
    () => () => {
      framesRef.current.forEach(releaseFrame);
      if (resultRef.current) URL.revokeObjectURL(resultRef.current.url);
    },
    []
  );

  const first = frames[0];
  const size = first ? outputSize(first.bmp.width, first.bmp.height, clampWidth(width)) : null;
  const cs = delayCs(seconds);
  // A result is shown only while it still matches the current frames and settings.
  const sig = JSON.stringify([frames.map((f) => f.id), size, fit, transparent ? "t" : bg, cs, loop, times, colors]);
  const current = result && result.sig === sig ? result : null;

  const addFiles = async (incoming) => {
    setError("");
    const room = MAX_FRAMES - framesRef.current.length;
    if (room <= 0) {
      setError(`A GIF here can have up to ${MAX_FRAMES} frames.`);
      return;
    }
    const added = [];
    const failed = [];
    for (const file of incoming.slice(0, room)) {
      try {
        const bmp = await createImageBitmap(file);
        added.push({ id: nextId++, name: file.name, size: file.size, bmp, thumb: URL.createObjectURL(file) });
      } catch {
        failed.push(file.name);
      }
    }
    const msgs = [];
    if (failed.length) msgs.push(`Couldn't read ${failed.join(", ")} — use PNG, JPG, WebP or GIF (HEIC photos need converting first).`);
    if (incoming.length > room) msgs.push(`Only the first ${room} file${room === 1 ? "" : "s"} were added; the limit is ${MAX_FRAMES} frames.`);
    if (msgs.length) setError(msgs.join(" "));
    if (!added.length) return;
    if (!framesRef.current.length && !widthTouched) setWidth(Math.min(added[0].bmp.width, DEFAULT_WIDTH));
    setFrames((prev) => [...prev, ...added]);
  };

  const move = (i, dir) =>
    setFrames((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const remove = (i) =>
    setFrames((prev) => {
      releaseFrame(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  const clearAll = () => {
    frames.forEach(releaseFrame);
    setFrames([]);
    setError("");
    setWidthTouched(false);
    setWidth(DEFAULT_WIDTH);
  };

  const build = async () => {
    if (!frames.length || !size) return;
    setError("");
    setBusy(true);
    try {
      const lib = await import("gifenc");
      const { w, h } = size;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      ctx.imageSmoothingQuality = "high";
      const gif = lib.GIFEncoder();
      const repeat = loopToRepeat(loop, times);
      for (let i = 0; i < frames.length; i++) {
        setProgress(`Encoding frame ${i + 1} of ${frames.length}…`);
        // Yield so the progress line paints between frames.
        await new Promise((r) => setTimeout(r, 0));
        const { bmp } = frames[i];
        ctx.clearRect(0, 0, w, h);
        if (!transparent) {
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, w, h);
        }
        const r = placeRect(bmp.width, bmp.height, w, h, fit);
        ctx.drawImage(bmp, r.dx, r.dy, r.dw, r.dh);
        const rgba = ctx.getImageData(0, 0, w, h).data;
        writeGifFrame(gif, lib, transparent ? hardenAlpha(rgba) : rgba, w, h, { colors, delay: cs, repeat, transparent });
      }
      gif.finish();
      const bytes = gif.bytes();
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/gif" }));
      if (result) URL.revokeObjectURL(result.url);
      setResult({ url, bytes, w, h, n: frames.length, cs, sig });
    } catch {
      setError("Couldn't build the GIF. Try a smaller width or fewer frames.");
    } finally {
      setBusy(false);
      setProgress("");
    }
  };

  const totalSeconds = (frames.length * cs) / 100;

  return (
    <div>
      <PdfDropzone
        onFiles={addFiles}
        accept="image/*"
        multiple
        label="Drop images here, or click to choose"
        hint="Each image becomes one frame, in the order shown below. Processed in your browser — never uploaded."
      />
      {frames.length > 0 && (
        <>
          <ul className="file-list gif-frames">
            {frames.map((f, i) => (
              <li className="file-item" key={f.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="file-thumb" src={f.thumb} alt="" />
                <span className="file-name">{i + 1}. {f.name}</span>
                <span className="file-meta">{f.bmp.width}×{f.bmp.height}</span>
                <span className="file-ctrl">
                  <button className="btn-sm" onClick={() => move(i, -1)} disabled={busy || i === 0} aria-label={`Move frame ${i + 1} earlier`}>Up</button>
                  <button className="btn-sm" onClick={() => move(i, 1)} disabled={busy || i === frames.length - 1} aria-label={`Move frame ${i + 1} later`}>Down</button>
                  <button className="btn-sm" onClick={() => remove(i)} disabled={busy} aria-label={`Remove frame ${i + 1}`}>Remove</button>
                </span>
              </li>
            ))}
          </ul>

          <div className="field-row" style={{ marginTop: "1rem" }}>
            <label className="field">
              <span className="field-label">Seconds per frame</span>
              <input className="inp" type="number" min={MIN_DELAY_CS / 100} max={655} step={0.05} value={seconds} onChange={(e) => setSeconds(e.target.value)} />
            </label>
            <label className="field">
              <span className="field-label">Width (px, max {MAX_WIDTH})</span>
              <input
                className="inp"
                type="number"
                min={1}
                max={MAX_WIDTH}
                step={1}
                value={width}
                onChange={(e) => {
                  setWidthTouched(true);
                  setWidth(e.target.value);
                }}
              />
            </label>
          </div>
          <p className="muted small">
            {size.w} × {size.h} px (height follows the first frame) · {frames.length} frame{frames.length === 1 ? "" : "s"} · {fmtSeconds(cs / 100)} each, {fmtSeconds(totalSeconds)} per loop
            {String(cs / 100) !== String(Number(seconds)) ? ` — GIF timing is in hundredths of a second, so ${seconds || "that"} becomes ${fmtSeconds(cs / 100)}` : ""}.
          </p>

          <div className="field">
            <span className="field-label">Frames of a different shape</span>
            <Segmented ariaLabel="How frames of a different shape fit" value={fit} onChange={setFit} options={FIT_OPTIONS} />
          </div>

          <label className="check-row">
            <input type="checkbox" checked={transparent} onChange={(e) => setTransparent(e.target.checked)} />
            Keep transparent background (PNG/WebP with transparency)
          </label>
          {transparent ? (
            <p className="muted small">GIF transparency is on or off per pixel, so soft edges become hard ones. Fully see-through pixels stay clear; mostly solid ones become solid.</p>
          ) : (
            <div className="field-row">
              <label className="field">
                <span className="field-label">Background colour</span>
                <input className="inp" type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
              </label>
            </div>
          )}

          <div className="field">
            <span className="field-label">Looping</span>
            <Segmented ariaLabel="Looping" value={loop} onChange={setLoop} options={LOOP_OPTIONS} />
          </div>
          {loop === "count" && (
            <div className="field-row">
              <label className="field">
                <span className="field-label">Play this many times</span>
                <input className="inp" type="number" min={1} max={100} step={1} value={times} onChange={(e) => setTimes(e.target.value)} />
              </label>
            </div>
          )}

          <div className="field">
            <span className="field-label">Colours per frame</span>
            <Segmented ariaLabel="Colours per frame" value={colors} onChange={setColors} options={COLOR_OPTIONS} />
          </div>
          <p className="muted small">Each frame gets its own palette of up to this many colours. Fewer colours make a smaller file but band smooth gradients.</p>
        </>
      )}

      {error && <p className="error">{error}</p>}

      {frames.length > 0 && (
        <div className="btn-row">
          <button className="btn" onClick={build} disabled={busy}>
            {busy ? progress || "Building…" : "Make GIF"}
          </button>
          <button className="btn btn-ghost" onClick={clearAll} disabled={busy}>Clear all</button>
        </div>
      )}

      {current && (
        <>
          <div className="svg-stage svg-stage-alpha">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={current.url} alt="Preview of the animated GIF" />
          </div>
          <p className="muted small">
            {current.w} × {current.h} px · {current.n} frame{current.n === 1 ? "" : "s"} · {fmtBytes(current.bytes.length)}
          </p>
          <div className="btn-row">
            <button className="btn" onClick={() => downloadBytes(current.bytes, "animation.gif", "image/gif")}>Download GIF</button>
          </div>
        </>
      )}
    </div>
  );
}

function releaseFrame(f) {
  if (!f) return;
  f.bmp.close?.();
  URL.revokeObjectURL(f.thumb);
}

function clampWidth(v) {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(MAX_WIDTH, n);
}

function fmtSeconds(s) {
  return `${Number(s.toFixed(2))} s`;
}
