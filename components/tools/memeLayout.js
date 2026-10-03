// Caption layout for the meme generator, kept free of the DOM so it can be
// tested in node. Named memeLayout.js rather than memeGenerator.js: a helper
// that only differs from its component (MemeGenerator.jsx) by case collides on
// a case-insensitive filesystem and prerenders a 404 stub.
//
// Text width is measured once at a reference size and scaled: a font's advance
// widths are linear in its pixel size, so `measure(s) * px / REF` is what the
// canvas would report at `px` without re-measuring every candidate size.

export const REF_PX = 100;

// Greedy word wrap of `text` into lines no wider than `maxW` at `px`, where
// `measure(s)` is the width of `s` at REF_PX. Explicit newlines are kept as
// hard breaks. A single word too long for the line is broken by character, so
// a pasted URL or a long German compound never runs off the image.
export function wrapLines(text, maxW, px, measure) {
  const k = px / REF_PX;
  const w = (s) => measure(s) * k;
  const out = [];
  for (const para of String(text).split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      const next = line ? line + " " + word : word;
      if (w(next) <= maxW) {
        line = next;
        continue;
      }
      if (line) out.push(line);
      if (w(word) <= maxW) {
        line = word;
        continue;
      }
      // Break an over-long word across lines, character by character.
      let chunk = "";
      for (const ch of Array.from(word)) {
        if (chunk && w(chunk + ch) > maxW) {
          out.push(chunk);
          chunk = ch;
        } else {
          chunk += ch;
        }
      }
      line = chunk;
    }
    out.push(line);
  }
  // Trailing blank lines from a stray Enter would only push the caption inward.
  while (out.length > 1 && out[out.length - 1] === "") out.pop();
  return out;
}

// Largest font size, at most `startPx`, at which `text` wraps into a block that
// fits `maxW` × `maxH` (line height = px * lineHeight). Steps down 4% at a time
// rather than bisecting, because the line count changes in jumps and a bisection
// can settle on a size that leaves a needless extra line. Never goes below
// `minPx`: past that point the caption is unreadable, so it is allowed to
// overflow its band instead and the caller says so.
export function fitCaption(text, { maxW, maxH, startPx, minPx, lineHeight, measure }) {
  let px = Math.max(minPx, startPx);
  for (;;) {
    const lines = wrapLines(text, maxW, px, measure);
    const height = lines.length * px * lineHeight;
    if (height <= maxH || px <= minPx) {
      return { px, lines, height, fits: height <= maxH };
    }
    px = Math.max(minPx, px * 0.96);
  }
}

// Outline width for the classic white-text, black-edge look. Proportional to the
// font size so a caption looks the same on a 400px thumbnail and a 4000px photo.
export function strokeWidth(px, strength) {
  return (px * strength) / 100;
}
