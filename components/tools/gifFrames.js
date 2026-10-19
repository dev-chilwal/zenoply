// Pure helpers for the GIF maker: frame layout, timing and per-frame encoding.
// Kept free of DOM so it can be tested in node. Named gifFrames.js, not
// gifMaker.js, so it cannot collide with GifMaker.jsx on a case-insensitive disk.

// GIF delays are stored in hundredths of a second. Browsers treat a delay of
// 0 or 1 (and Chrome/Firefox anything under 2) as "too fast" and slow it to
// 100 ms, so 2 cs is the shortest delay that plays as written.
export const MIN_DELAY_CS = 2;
export const MAX_DELAY_CS = 65535;

export function delayCs(seconds) {
  const cs = Math.round(Number(seconds) * 100);
  if (!Number.isFinite(cs)) return 50;
  return Math.min(MAX_DELAY_CS, Math.max(MIN_DELAY_CS, cs));
}

// Output canvas size: the chosen width, with the height following the first
// frame's aspect ratio. GIF dimensions are 16-bit.
export function outputSize(firstW, firstH, width) {
  const w = Math.min(65535, Math.max(1, Math.round(width)));
  const h = Math.min(65535, Math.max(1, Math.round((w * firstH) / firstW)));
  return { w, h };
}

// Where to draw a source image on the output canvas.
// "contain" letterboxes the whole picture; "cover" fills and crops the overflow.
export function placeRect(srcW, srcH, outW, outH, fit) {
  const s = fit === "cover" ? Math.max(outW / srcW, outH / srcH) : Math.min(outW / srcW, outH / srcH);
  const dw = srcW * s;
  const dh = srcH * s;
  return { dx: (outW - dw) / 2, dy: (outH - dh) / 2, dw, dh };
}

// UI loop choice -> gifenc's `repeat`: 0 = forever (NETSCAPE loop count 0),
// -1 = no NETSCAPE block at all (plays once), n = n extra plays. "Play 3 times"
// therefore needs repeat 2.
export function loopToRepeat(mode, times) {
  if (mode === "forever") return 0;
  const n = Math.max(1, Math.min(65536, Math.round(Number(times) || 1)));
  return n <= 1 ? -1 : n - 1;
}

// Encode one RGBA frame into an open gifenc stream.
// lib = the gifenc module ({ quantize, applyPalette }), passed in so the
// component can keep it lazy-loaded.
export function writeGifFrame(gif, lib, rgba, w, h, { colors, delay, repeat, transparent }) {
  const format = transparent ? "rgba4444" : "rgb565";
  // A frame that already fits in the palette is stored exactly. gifenc's
  // quantizer bins colours at 5-6 bits a channel and averages each bin, so
  // even a flat graphic with a handful of colours would come out shifted
  // (pure blue as 11,11,255).
  let palette, index;
  const exact = exactPalette(rgba, transparent ? colors - 1 : colors);
  if (exact) {
    ({ palette, index } = exact);
  } else {
    // One slot is held back in transparent mode for the transparent entry.
    palette = lib.quantize(rgba, transparent ? colors - 1 : colors, transparent ? { format, oneBitAlpha: true } : { format });
    index = lib.applyPalette(rgba, palette, format);
  }
  const opts = { palette, delay: delay * 10, repeat };
  if (transparent) {
    // Every frame is cleared before the next one is drawn (disposal 2), or an
    // opaque frame would show through the clear areas of the frame after it.
    // Every frame also declares a transparent index, even a fully opaque one:
    // decoders such as ffmpeg clear to the transparent colour only when the
    // frame being disposed has one, and to the opaque background otherwise.
    let t = palette.findIndex((c) => c[3] === 0);
    if (t < 0) {
      t = palette.length;
      palette.push([0, 0, 0, 0]);
    }
    opts.dispose = 2;
    opts.transparent = true;
    opts.transparentIndex = t;
  }
  gif.writeFrame(index, w, h, opts);
}

// The frame's own colours as a palette plus index, or null when it has more
// than max of them. Alpha is either 255 or (after hardenAlpha) 0 here, so a
// colour is its RGB plus one bit for "clear".
export function exactPalette(rgba, max) {
  const seen = new Map();
  const palette = [];
  const index = new Uint8Array(rgba.length / 4);
  for (let i = 0, p = 0; i < rgba.length; i += 4, p++) {
    const clear = rgba[i + 3] === 0;
    const key = clear ? -1 : (rgba[i] << 16) | (rgba[i + 1] << 8) | rgba[i + 2];
    let k = seen.get(key);
    if (k === undefined) {
      if (palette.length >= max) return null;
      k = palette.length;
      seen.set(key, k);
      palette.push(clear ? [0, 0, 0, 0] : [rgba[i], rgba[i + 1], rgba[i + 2], 255]);
    }
    index[p] = k;
  }
  return { palette, index };
}

// Flatten partially transparent pixels: in transparent mode a pixel is either
// kept (alpha >= 128, made fully opaque) or dropped, since GIF has 1-bit alpha.
// Dropped pixels are zeroed so they all match the one transparent palette entry.
export function hardenAlpha(rgba) {
  for (let i = 0; i < rgba.length; i += 4) {
    if (rgba[i + 3] >= 128) rgba[i + 3] = 255;
    else rgba[i] = rgba[i + 1] = rgba[i + 2] = rgba[i + 3] = 0;
  }
  return rgba;
}
