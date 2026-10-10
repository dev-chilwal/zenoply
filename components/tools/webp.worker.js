// Encodes WebP off the main thread with libwebp compiled to WebAssembly.
//
// The browser's own canvas.toBlob("image/webp") is not enough for this tool:
// Safari ignores the type and hands back a PNG, and no browser exposes
// libwebp's lossless mode through it. The baseline (non-SIMD) emscripten build
// is imported directly rather than through @jsquash/webp's encode.js, which
// would pull in wasm-feature-detect to pick between two builds. webpack emits
// webp_enc.wasm (~280 KB) as a hashed same-origin asset from the glue's own
// `new URL(..., import.meta.url)`, so it is only downloaded on first Convert.
import factory from "@jsquash/webp/codec/enc/webp_enc.js";

let modulePromise = null;

self.onmessage = async ({ data }) => {
  const { id, rgba, width, height, options } = data;
  try {
    modulePromise ||= factory({ noInitialRun: true });
    const mod = await modulePromise;
    const out = mod.encode(new Uint8Array(rgba), width, height, options);
    if (!out) throw new Error("Encoding error.");
    // The returned view points into the wasm heap; copy it out before the next
    // encode reuses that memory.
    const bytes = out.slice();
    self.postMessage({ id, out: bytes }, [bytes.buffer]);
  } catch (err) {
    // The caller terminates this worker after any error: an aborted
    // emscripten instance is not safe to call again.
    self.postMessage({ id, error: String((err && err.message) || err) });
  }
};
