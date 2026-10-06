// Runs oxipng off the main thread. Level 4 on a large screenshot takes
// seconds, and doing that on the page would freeze the tab for the duration.
//
// The single-threaded codec is imported directly rather than through
// @jsquash/oxipng's optimise.js: that entry feature-detects wasm threads and,
// inside a worker, switches to the rayon build, which needs SharedArrayBuffer
// and therefore COOP/COEP headers this static site does not send. Importing the
// glue straight also keeps wasm-feature-detect and the 236 KB parallel wasm out
// of the bundle. webpack emits squoosh_oxipng_bg.wasm (164 KB) as a hashed
// asset from the glue's own `new URL(..., import.meta.url)`, so it is served
// from this origin and only fetched when the worker starts.
import init, { optimise } from "@jsquash/oxipng/codec/pkg/squoosh_oxipng.js";

let ready = null;

self.onmessage = async ({ data }) => {
  const { id, bytes, level, optimiseAlpha } = data;
  try {
    ready ||= init();
    await ready;
    const out = optimise(new Uint8Array(bytes), level, false, optimiseAlpha);
    self.postMessage({ id, out }, [out.buffer]);
  } catch (err) {
    // A Rust panic surfaces here. The caller terminates this worker after any
    // error, because a panicked wasm-bindgen instance is not safe to reuse.
    self.postMessage({ id, error: String((err && err.message) || err) });
  }
};
