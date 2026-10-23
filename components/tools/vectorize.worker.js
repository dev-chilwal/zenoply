// Traces off the main thread: imagetracer is synchronous and takes up to a
// second or so on a 1600px picture, which would freeze the sliders.
import tracer from "imagetracerjs";
import { vectorize } from "./vectorize";

self.onmessage = ({ data }) => {
  const { id, rgba, w, h, opts } = data;
  try {
    const out = vectorize(tracer, new Uint8ClampedArray(rgba), w, h, opts);
    self.postMessage({ id, out });
  } catch (err) {
    self.postMessage({ id, error: String((err && err.message) || err) });
  }
};
