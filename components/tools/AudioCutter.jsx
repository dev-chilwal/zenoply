"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import PdfDropzone, { fmtBytes, downloadBytes } from "./PdfDropzone";
import { Segmented, Field } from "@/components/calc/Calc";
import {
  scanMp3,
  cutMp3,
  frameRange,
  wavSampleRate,
  encodeWav,
  computePeaks,
  parseTime,
  formatTime,
} from "./audioCut";

// The frame scanning, the lossless MP3 cut and the WAV writer live in
// audioCut.js (node-tested against ffmpeg fixtures); this file is the
// waveform, the handles and playback.
//
// The browser decodes the file once, for the waveform and the preview. For an
// MP3 that decode is never written out — the cut copies the original frames —
// so it only has to be good enough to look at and listen to.

const ACCEPT = "audio/*,video/mp4,video/webm,.mp3,.wav,.m4a,.aac,.ogg,.oga,.opus,.flac,.webm,.mp4";
const BUCKETS = 1600;
const MIN_LEN = 0.05; // seconds — the shortest selection the handles allow

const FORMAT_OPTIONS = [
  { value: "mp3", label: "MP3 (lossless)" },
  { value: "wav", label: "WAV" },
];

function themeColors() {
  const cs = getComputedStyle(document.documentElement);
  const v = (name, fb) => cs.getPropertyValue(name).trim() || fb;
  return {
    accent: v("--accent", "#b5471f"),
    dim: v("--muted-2", "#8b8378"),
    line: v("--line", "#ddd6c7"),
    soft: v("--accent-soft-bg", "#fbeee9"),
    fg: v("--fg", "#211d18"),
  };
}

const baseName = (name) => name.replace(/\.[^.]+$/, "") || "audio";

export default function AudioCutter() {
  const [file, setFile] = useState(null); // { name, size }
  const [audio, setAudio] = useState(null); // { buffer, bytes, scan, peaks }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sel, setSel] = useState({ start: 0, end: 0 });
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [format, setFormat] = useState("wav");
  const [fadeIn, setFadeIn] = useState("0");
  const [fadeOut, setFadeOut] = useState("0");
  const [result, setResult] = useState(null); // { bytes, name, mime, start, end, url }
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(null);
  const [theme, setTheme] = useState(0);

  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const dragRef = useRef(null); // "start" | "end" while dragging
  const ctxRef = useRef(null); // AudioContext for preview
  const srcRef = useRef(null);
  const rafRef = useRef(0);
  const intakeRef = useRef(0);

  const duration = audio ? audio.buffer.duration : 0;

  const stop = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (srcRef.current) {
      srcRef.current.onended = null;
      try { srcRef.current.stop(); } catch {}
      srcRef.current = null;
    }
    setPlaying(false);
    setPlayhead(null);
  }, []);

  useEffect(() => () => { stop(); ctxRef.current?.close?.(); }, [stop]);
  useEffect(() => () => { if (result?.url) URL.revokeObjectURL(result.url); }, [result]);

  // Redraw on theme switch: the canvas colours come from CSS tokens.
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme((t) => t + 1));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const bump = () => setTheme((t) => t + 1);
    mq?.addEventListener?.("change", bump);
    return () => { obs.disconnect(); mq?.removeEventListener?.("change", bump); };
  }, []);

  const applySel = useCallback((start, end) => {
    setSel({ start, end });
    setStartText(formatTime(start));
    setEndText(formatTime(end));
    setResult(null);
  }, []);

  const onFiles = useCallback(async (files) => {
    const f = files[0];
    if (!f) return;
    const intake = ++intakeRef.current;
    stop();
    // Clear the previous file's output now, not in an effect, so nothing
    // renders the old result against the new file.
    setResult(null);
    setAudio(null);
    setError("");
    setFile({ name: f.name, size: f.size });
    setBusy(true);
    try {
      const bytes = new Uint8Array(await f.arrayBuffer());
      const scan = scanMp3(bytes);
      // Decode at the file's own rate where we can read it, so a 48 kHz WAV
      // comes out at 48 kHz rather than resampled.
      const rate = Math.min(96000, Math.max(8000, scan?.sampleRate || wavSampleRate(bytes) || 44100));
      const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      const ctx = new Offline(1, 1, rate);
      const buffer = await ctx.decodeAudioData(bytes.slice().buffer);
      if (intakeRef.current !== intake) return;
      const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));
      const peaks = computePeaks(channels, BUCKETS);
      setAudio({ buffer, bytes, scan, peaks });
      setFormat(scan ? "mp3" : "wav");
      applySel(0, buffer.duration);
    } catch (err) {
      if (intakeRef.current !== intake) return;
      console.error(err);
      setError(
        "Your browser could not decode this file. MP3, WAV, M4A/AAC, OGG and FLAC work in every current browser; Opus and WebM need Chrome, Edge or Firefox. If it is a video, try one saved as MP4."
      );
    } finally {
      if (intakeRef.current === intake) setBusy(false);
    }
  }, [stop, applySel]);

  // ---------- waveform drawing ----------
  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap || !audio) return;
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = wrap.clientWidth, h = 140;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + "px";
      const g = canvas.getContext("2d");
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = themeColors();
      g.clearRect(0, 0, w, h);
      const xs = (sel.start / duration) * w, xe = (sel.end / duration) * w;
      g.fillStyle = c.soft;
      g.fillRect(xs, 0, xe - xs, h);
      const { min, max } = audio.peaks;
      const mid = h / 2, amp = h / 2 - 6;
      for (let x = 0; x < w; x++) {
        const a = Math.floor((x / w) * BUCKETS), z = Math.max(a + 1, Math.floor(((x + 1) / w) * BUCKETS));
        let lo = 0, hi = 0;
        for (let k = a; k < z && k < BUCKETS; k++) { if (min[k] < lo) lo = min[k]; if (max[k] > hi) hi = max[k]; }
        g.fillStyle = x >= xs && x <= xe ? c.accent : c.dim;
        const top = mid - hi * amp, bot = mid - lo * amp;
        g.fillRect(x, top, 1, Math.max(1, bot - top));
      }
      g.fillStyle = c.fg;
      for (const x of [xs, xe]) {
        g.fillRect(Math.round(x) - 1, 0, 2, h);
        g.fillRect(Math.round(x) - 5, 0, 10, 8);
      }
      if (playhead != null) {
        g.fillStyle = c.accent;
        g.fillRect(Math.round((playhead / duration) * w), 0, 1, h);
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [audio, sel, playhead, duration, theme]);

  // ---------- handle dragging ----------
  const timeAt = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(duration, ((e.clientX - r.left) / r.width) * duration));
  };
  const moveHandle = (which, t) => {
    if (which === "start") applySel(Math.min(t, sel.end - MIN_LEN), sel.end);
    else applySel(sel.start, Math.max(t, sel.start + MIN_LEN));
  };
  const onPointerDown = (e) => {
    if (!audio) return;
    const t = timeAt(e);
    const which = Math.abs(t - sel.start) <= Math.abs(t - sel.end) ? "start" : "end";
    dragRef.current = which;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveHandle(which, t);
  };
  const onPointerMove = (e) => {
    if (dragRef.current) moveHandle(dragRef.current, timeAt(e));
  };
  const onPointerUp = () => { dragRef.current = null; };

  const commitText = (which) => {
    const t = parseTime(which === "start" ? startText : endText);
    if (t == null) { applySel(sel.start, sel.end); return; }
    if (which === "start") applySel(Math.max(0, Math.min(t, sel.end - MIN_LEN)), sel.end);
    else applySel(sel.start, Math.min(duration, Math.max(t, sel.start + MIN_LEN)));
  };

  // ---------- preview ----------
  const play = async () => {
    if (!audio) return;
    stop();
    if (!ctxRef.current) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new AC();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") await ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = audio.buffer;
    src.connect(ctx.destination);
    const t0 = ctx.currentTime, from = sel.start, len = sel.end - sel.start;
    src.start(0, from, len);
    src.onended = () => stop();
    srcRef.current = src;
    setPlaying(true);
    const tick = () => {
      setPlayhead(Math.min(from + (ctx.currentTime - t0), from + len));
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  // ---------- output ----------
  const atEnd = sel.end >= duration - 1e-3;
  const snapped = audio?.scan && format === "mp3" ? frameRange(audio.scan, sel.start, atEnd ? Infinity : sel.end) : null;
  const fadeInS = Math.max(0, Number(fadeIn) || 0), fadeOutS = Math.max(0, Number(fadeOut) || 0);

  const cut = () => {
    if (!audio) return;
    stop();
    const stem = baseName(file.name) + "-cut";
    let out;
    if (format === "mp3" && audio.scan) {
      const r = cutMp3(audio.bytes, audio.scan, sel.start, atEnd ? Infinity : sel.end);
      out = { bytes: r.bytes, name: stem + ".mp3", mime: "audio/mpeg", start: r.start, end: Math.min(r.end, duration) };
    } else {
      const b = audio.buffer, sr = b.sampleRate;
      const channels = Array.from({ length: b.numberOfChannels }, (_, c) => b.getChannelData(c));
      const from = Math.round(sel.start * sr), to = Math.min(b.length, Math.round(sel.end * sr));
      const bytes = encodeWav(channels, sr, from, to, {
        fadeIn: Math.round(fadeInS * sr),
        fadeOut: Math.round(fadeOutS * sr),
      });
      out = { bytes, name: stem + ".wav", mime: "audio/wav", start: from / sr, end: to / sr };
    }
    out.url = URL.createObjectURL(new Blob([out.bytes], { type: out.mime }));
    setResult(out);
  };

  const selLen = sel.end - sel.start;
  const wavEstimate = audio ? Math.round(selLen * audio.buffer.sampleRate) * audio.buffer.numberOfChannels * 2 + 44 : 0;

  return (
    <div>
      <PdfDropzone
        onFiles={onFiles}
        accept={ACCEPT}
        multiple={false}
        label="Drop an audio file here, or click to choose"
        hint="MP3, WAV, M4A, AAC, OGG, FLAC — read and cut in your browser, never uploaded."
      />

      {file && (
        <ul className="file-list">
          <li className="file-item">
            <span className="file-name">{file.name}</span>
            <span className="file-meta">
              {fmtBytes(file.size)}
              {audio && ` · ${formatTime(duration)}`}
              {audio && ` · ${audio.buffer.numberOfChannels === 1 ? "mono" : audio.buffer.numberOfChannels === 2 ? "stereo" : audio.buffer.numberOfChannels + " ch"}`}
            </span>
          </li>
        </ul>
      )}
      {busy && <p className="muted small">Decoding…</p>}
      {error && <p className="error">{error}</p>}

      {audio && (
        <>
          <div
            ref={wrapRef}
            style={{ position: "relative", width: "100%", margin: "1rem 0 .5rem", border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden", background: "var(--surface)" }}
          >
            <canvas
              ref={canvasRef}
              style={{ display: "block", width: "100%", touchAction: "none", cursor: "ew-resize" }}
              role="img"
              aria-label={`Waveform, selection ${formatTime(sel.start)} to ${formatTime(sel.end)}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            />
          </div>
          <p className="muted small" style={{ marginTop: 0 }}>
            Drag on the waveform to move the nearest edge, or type exact times below.
          </p>

          <div className="field-row">
            <Field label="Start (m:ss.ss)">
              <input
                className="inp mono"
                inputMode="decimal"
                value={startText}
                onChange={(e) => setStartText(e.target.value)}
                onBlur={() => commitText("start")}
                onKeyDown={(e) => { if (e.key === "Enter") commitText("start"); }}
              />
            </Field>
            <Field label="End (m:ss.ss)">
              <input
                className="inp mono"
                inputMode="decimal"
                value={endText}
                onChange={(e) => setEndText(e.target.value)}
                onBlur={() => commitText("end")}
                onKeyDown={(e) => { if (e.key === "Enter") commitText("end"); }}
              />
            </Field>
          </div>
          <p className="muted small">Selection: {formatTime(selLen)} of {formatTime(duration)}.</p>

          <div className="btn-row">
            {!playing ? (
              <button className="btn btn-ghost" onClick={play}>Play selection</button>
            ) : (
              <button className="btn btn-ghost" onClick={stop}>Stop</button>
            )}
          </div>

          {audio.scan ? (
            <Field label="Save as">
              <Segmented ariaLabel="Output format" value={format} onChange={(v) => { setFormat(v); setResult(null); }} options={FORMAT_OPTIONS} />
            </Field>
          ) : (
            <p className="muted small">Saved as WAV (16-bit PCM) — the one format a browser can write without an encoder add-on.</p>
          )}

          {format === "mp3" && snapped && (
            <p className="muted small">
              The original MP3 frames are copied as they are — no re-encoding, so no quality loss and the same bitrate.
              MP3 cuts land on frame boundaries ({Math.round(audio.scan.frameDuration * 1000)} ms apart), so the cut runs{" "}
              <strong>{formatTime(snapped.start)}</strong> to <strong>{formatTime(Math.min(snapped.end, duration))}</strong>, just
              outside your selection. Fades need re-encoding; choose WAV for those.
            </p>
          )}

          {format === "wav" && (
            <>
              <div className="field-row">
                <Field label="Fade in (seconds)">
                  <input className="inp" type="number" min="0" max="30" step="0.5" value={fadeIn} onChange={(e) => { setFadeIn(e.target.value); setResult(null); }} />
                </Field>
                <Field label="Fade out (seconds)">
                  <input className="inp" type="number" min="0" max="30" step="0.5" value={fadeOut} onChange={(e) => { setFadeOut(e.target.value); setResult(null); }} />
                </Field>
              </div>
              <p className="muted small">
                WAV is uncompressed: this selection will be about {fmtBytes(wavEstimate)}
                {audio.scan ? ", several times the MP3 cut." : "."} Sample-accurate, at {audio.buffer.sampleRate.toLocaleString()} Hz.
              </p>
            </>
          )}

          <div className="btn-row">
            <button className="btn" onClick={cut}>Cut audio</button>
          </div>

          {result && (
            <div style={{ marginTop: "1.25rem" }}>
              <div className="result-row result-row-hl">
                <span className="result-label">{result.name}</span>
                <span className="result-val">
                  {formatTime(result.start)}–{formatTime(result.end)} · {formatTime(result.end - result.start)} · {fmtBytes(result.bytes.length)}
                </span>
                <button className="btn-sm" onClick={() => downloadBytes(result.bytes, result.name, result.mime)}>Download</button>
              </div>
              <audio controls src={result.url} style={{ width: "100%", marginTop: ".75rem" }} />
            </div>
          )}
        </>
      )}

      <p className="muted small" style={{ marginTop: "1.5rem" }}>
        Nothing is uploaded: the file is decoded by your own browser, and the cut is assembled on your device.
        To shrink an image instead, try the <a href="/image/image-compressor">image compressor</a>; to bundle several cuts
        into one download, <a href="/dev/zip-files">zip them</a>.
      </p>
    </div>
  );
}
