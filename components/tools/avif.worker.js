// Encodes AVIF off the main thread. libaom is slow — a 12-megapixel photo at
// the default speed takes several seconds even on a fast laptop — and running
// it on the page would freeze the tab for the duration.
//
// The single-threaded emscripten build is imported directly rather than
// through @jsquash/avif's encode.js: that entry feature-detects wasm threads
// and switches to avif_enc_mt, which needs SharedArrayBuffer and therefore
// COOP/COEP headers this static site does not send. Importing the factory
// straight also keeps wasm-feature-detect and the 3.5 MB threaded wasm out of
// the build. webpack emits avif_enc.wasm (3.4 MB, ~1.1 MB gzipped) as a hashed
// same-origin asset from the glue's own `new URL(..., import.meta.url)`, so it
// is only downloaded when someone actually converts an image.
import factory from "@jsquash/avif/codec/enc/avif_enc.js";

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
