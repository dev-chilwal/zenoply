// Pure helpers for the audio cutter, kept free of DOM/Web Audio so they run in
// node against ffmpeg-made fixtures.
//
// Two output paths:
//   - MP3 in, MP3 out: a lossless cut. An MP3 is a run of self-contained
//     frames (1152 samples each for MPEG-1 Layer III, ~26 ms at 44.1 kHz), so
//     the selection is snapped outward to frame boundaries and those frames are
//     copied byte-for-byte. Nothing is decoded or re-encoded, so there is no
//     generation loss and the bitrate is unchanged.
//   - anything else (or MP3 with fades): the browser decodes it and the
//     selected samples are written as 16-bit PCM WAV by encodeWav.

// ---------- timecodes ----------

// "75", "1:15", "1:15.5", "0:01:15.25" -> seconds. null when unreadable.
export function parseTime(text) {
  const s = String(text ?? "").trim().replace(",", ".");
  if (!s) return null;
  if (!/^\d+(?:\.\d*)?$|^\d+(?::\d{1,2}(?:\.\d*)?){1,2}$/.test(s)) return null;
  const parts = s.split(":").map(Number);
  let secs = 0;
  for (const p of parts) secs = secs * 60 + p;
  if (parts.length > 1 && parts.slice(1).some((p) => p >= 60)) return null;
  return Number.isFinite(secs) ? secs : null;
}

// seconds -> "m:ss.ss" (or "h:mm:ss.ss" past an hour).
export function formatTime(sec, decimals = 2) {
  const t = Math.max(0, sec);
  const scale = 10 ** decimals;
  const r = Math.round(t * scale) / scale;
  const h = Math.floor(r / 3600);
  const m = Math.floor((r % 3600) / 60);
  const s = r - h * 3600 - m * 60;
  const ss = s.toFixed(decimals).padStart(decimals ? decimals + 3 : 2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

// ---------- MP3 frame scanning ----------

const BITRATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BITRATES_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const RATES = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

// Decode a 4-byte Layer III frame header at i, or null. Free-format (bitrate
// index 0) is rejected: its frame length is not in the header, and almost
// nothing writes it.
export function readHeader(b, i) {
  if (i + 4 > b.length || b[i] !== 0xff || (b[i + 1] & 0xe0) !== 0xe0) return null;
  const version = (b[i + 1] >> 3) & 3; // 3 = MPEG-1, 2 = MPEG-2, 0 = MPEG-2.5
  const layer = (b[i + 1] >> 1) & 3; // 1 = Layer III
  if (version === 1 || layer !== 1) return null;
  const brIdx = b[i + 2] >> 4;
  const srIdx = (b[i + 2] >> 2) & 3;
  if (brIdx === 0 || brIdx === 15 || srIdx === 3) return null;
  const v1 = version === 3;
  const bitrate = (v1 ? BITRATES_V1 : BITRATES_V2)[brIdx];
  const sampleRate = RATES[version][srIdx];
  const padding = (b[i + 2] >> 1) & 1;
  const mono = (b[i + 3] >> 6) === 3;
  const length = Math.floor(((v1 ? 144000 : 72000) * bitrate) / sampleRate) + padding;
  return {
    version, brIdx, bitrate, sampleRate, padding, mono, length,
    crc: (b[i + 1] & 1) === 0,
    samples: v1 ? 1152 : 576,
    sideInfo: v1 ? (mono ? 17 : 32) : mono ? 9 : 17,
  };
}

const sameStream = (a, b) => a && b && a.version === b.version && a.sampleRate === b.sampleRate;

function id3v2Size(b) {
  if (b.length < 10 || b[0] !== 0x49 || b[1] !== 0x44 || b[2] !== 0x33) return 0;
  const size = ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f);
  return 10 + size + (b[5] & 0x10 ? 10 : 0);
}

const tagAt = (b, i, tag) => i + tag.length <= b.length && [...tag].every((c, k) => b[i + k] === c.charCodeAt(0));

// A header only counts when the frame after it is also a header of the same
// stream — a lone 0xFFE match inside cover art or audio data is common.
function confirmedAt(b, i, ref) {
  const h = readHeader(b, i);
  if (!h || (ref && !sameStream(h, ref))) return null;
  const next = i + h.length;
  if (next === b.length || tagAt(b, next, "TAG")) return h;
  return sameStream(readHeader(b, next), h) ? h : null;
}

// Walk an MP3 into its frames. Returns null when the bytes are not a Layer III
// stream we can cut losslessly (the caller falls back to decode + WAV).
//   { headEnd, frames: [{ offset, length, brIdx }], sampleRate, samplesPerFrame,
//     frameDuration, tail: Uint8Array|null, vbrTag: "Xing"|"Info"|"VBRI"|null }
export function scanMp3(bytes) {
  const b = bytes;
  const headEnd = Math.min(id3v2Size(b), b.length);
  let i = headEnd;
  let first = null;
  while (i < b.length - 4 && !(first = confirmedAt(b, i, null))) i++;
  if (!first) return null;

  // ID3v1 is the last 128 bytes; frames stop before it.
  const end = b.length >= 128 && tagAt(b, b.length - 128, "TAG") ? b.length - 128 : b.length;
  const tail = end < b.length ? b.subarray(end) : null;

  const frames = [];
  while (i + 4 <= end) {
    const h = readHeader(b, i);
    if (h && sameStream(h, first) && i + h.length <= end) {
      frames.push({ offset: i, length: h.length, brIdx: h.brIdx });
      i += h.length;
      continue;
    }
    // Lost sync (a stray APE tag, a damaged byte run): look for the next
    // confirmed frame of the same stream, or stop.
    let j = i + 1;
    while (j < end - 4 && !confirmedAt(b, j, first)) j++;
    if (j >= end - 4) break;
    i = j;
  }
  if (!frames.length) return null;

  // The first frame may be a silent Xing/Info/VBRI header frame carrying the
  // old frame count; it describes the whole file, so it is dropped here and a
  // fresh one written for the cut when needed.
  let vbrTag = null;
  const f0 = frames[0];
  const h0 = readHeader(b, f0.offset);
  const xingAt = f0.offset + 4 + (h0.crc ? 2 : 0) + h0.sideInfo;
  if (tagAt(b, xingAt, "Xing")) vbrTag = "Xing";
  else if (tagAt(b, xingAt, "Info")) vbrTag = "Info";
  else if (tagAt(b, f0.offset + 36, "VBRI")) vbrTag = "VBRI";
  if (vbrTag) frames.shift();
  if (!frames.length) return null;

  return {
    headEnd,
    frames,
    sampleRate: first.sampleRate,
    samplesPerFrame: first.samples,
    frameDuration: first.samples / first.sampleRate,
    tail,
    vbrTag,
  };
}

// The frame range a [start, end) second selection snaps out to. Rounding
// outward means nothing inside the selection is lost.
export function frameRange(scan, start, end) {
  const n = scan.frames.length;
  const fd = scan.frameDuration;
  const a = Math.max(0, Math.min(n - 1, Math.floor(start / fd + 1e-9)));
  const z = Math.max(a + 1, Math.min(n, Math.ceil(end / fd - 1e-9)));
  return { first: a, last: z, start: a * fd, end: z * fd };
}

// A silent frame holding a Xing tag with the cut's frame and byte counts, so
// players show the right duration and seek sensibly on a VBR cut. Side info is
// all zeros (main_data_begin 0, no granule data), which decodes as silence and
// is what LAME writes.
function xingFrame(bytes, model, frameCount, audioBytes) {
  const b0 = bytes[model.offset], b1 = bytes[model.offset + 1] | 1; // no CRC
  const b3 = bytes[model.offset + 3];
  let h, b2;
  for (let idx = readHeader(bytes, model.offset).brIdx; idx < 15; idx++) {
    b2 = (bytes[model.offset + 2] & 0x0d) | (idx << 4); // padding off
    h = readHeader(Uint8Array.of(b0, b1, b2, b3), 0);
    if (h.length >= 4 + h.sideInfo + 16) break;
  }
  const f = new Uint8Array(h.length);
  f.set([b0, b1, b2, b3]);
  const at = 4 + h.sideInfo;
  f.set([0x58, 0x69, 0x6e, 0x67], at); // "Xing"
  const dv = new DataView(f.buffer);
  dv.setUint32(at + 4, 0x3); // frames + bytes fields present
  dv.setUint32(at + 8, frameCount);
  dv.setUint32(at + 12, audioBytes + f.length);
  return f;
}

// Copy the frames covering [start, end) into a new MP3. ID3v2 (title, artist,
// cover) and ID3v1 tags are carried over. A Xing frame is added only when the
// kept frames vary in bitrate — for constant bitrate, players already compute
// the duration from the file size.
export function cutMp3(bytes, scan, start, end) {
  const r = frameRange(scan, start, end);
  const kept = scan.frames.slice(r.first, r.last);
  const audioBytes = kept.reduce((s, f) => s + f.length, 0);
  const vbr = kept.some((f) => f.brIdx !== kept[0].brIdx);
  const xing = vbr ? xingFrame(bytes, kept[0], kept.length, audioBytes) : null;
  const head = bytes.subarray(0, scan.headEnd);
  const total = head.length + (xing ? xing.length : 0) + audioBytes + (scan.tail ? scan.tail.length : 0);
  const out = new Uint8Array(total);
  let o = 0;
  out.set(head, o); o += head.length;
  if (xing) { out.set(xing, o); o += xing.length; }
  // Frames are contiguous on disk unless the scan skipped junk between them,
  // so copy runs rather than one frame at a time.
  let runStart = kept[0].offset, runEnd = runStart;
  for (const f of kept) {
    if (f.offset !== runEnd) {
      out.set(bytes.subarray(runStart, runEnd), o); o += runEnd - runStart;
      runStart = f.offset;
    }
    runEnd = f.offset + f.length;
  }
  out.set(bytes.subarray(runStart, runEnd), o); o += runEnd - runStart;
  if (scan.tail) out.set(scan.tail, o);
  return { bytes: out, start: r.start, end: r.end, frames: kept.length, vbr };
}

// ---------- WAV ----------

// The sample rate in a WAV header, so the browser can decode at the file's own
// rate instead of resampling. null when it is not a RIFF/WAVE file.
export function wavSampleRate(b) {
  if (!tagAt(b, 0, "RIFF") || !tagAt(b, 8, "WAVE")) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 12; i + 8 <= b.length; ) {
    const size = dv.getUint32(i + 4, true);
    if (tagAt(b, i, "fmt ") && i + 16 <= b.length) return dv.getUint32(i + 12, true);
    i += 8 + size + (size & 1);
  }
  return null;
}

// Interleave channels[from..to) into 16-bit PCM WAV. fadeIn / fadeOut are in
// samples; the gain ramps linearly from 0 (in) and to 0 (out).
export function encodeWav(channels, sampleRate, from, to, { fadeIn = 0, fadeOut = 0 } = {}) {
  const nch = channels.length;
  const n = Math.max(0, to - from);
  const dataBytes = n * nch * 2;
  const out = new Uint8Array(44 + dataBytes);
  const dv = new DataView(out.buffer);
  const str = (o, s) => { for (let k = 0; k < s.length; k++) out[o + k] = s.charCodeAt(k); };
  str(0, "RIFF"); dv.setUint32(4, 36 + dataBytes, true); str(8, "WAVE");
  str(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, nch, true);
  dv.setUint32(24, sampleRate, true); dv.setUint32(28, sampleRate * nch * 2, true);
  dv.setUint16(32, nch * 2, true); dv.setUint16(34, 16, true);
  str(36, "data"); dv.setUint32(40, dataBytes, true);
  const fi = Math.min(fadeIn, n), fo = Math.min(fadeOut, n);
  let o = 44;
  for (let i = 0; i < n; i++) {
    let g = 1;
    if (i < fi) g = i / fi;
    if (n - 1 - i < fo) g = Math.min(g, (n - 1 - i) / fo);
    for (let c = 0; c < nch; c++) {
      let s = channels[c][from + i] * g;
      s = s > 1 ? 1 : s < -1 ? -1 : s;
      dv.setInt16(o, s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7fff), true);
      o += 2;
    }
  }
  return out;
}

// ---------- waveform ----------

// Min/max per bucket across all channels, for drawing. Strided so a long file
// does not cost a full pass per redraw — this runs once per file.
export function computePeaks(channels, buckets) {
  const len = channels[0].length;
  const min = new Float32Array(buckets), max = new Float32Array(buckets);
  const per = len / buckets;
  const stride = Math.max(1, Math.floor(per / 256));
  for (let k = 0; k < buckets; k++) {
    const a = Math.floor(k * per), z = Math.min(len, Math.floor((k + 1) * per));
    let lo = 0, hi = 0;
    for (const ch of channels) {
      for (let i = a; i < z; i += stride) {
        const v = ch[i];
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
    min[k] = lo; max[k] = hi;
  }
  return { min, max };
}
