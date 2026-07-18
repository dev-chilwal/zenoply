"use client";

// Shared pdf.js plumbing for the PDF tools. Every tool loads the library, points
// at the worker, and rasterises pages through this module so the behaviour stays
// identical across them.

let pdfjsPromise = null;

// Load pdf.js lazily on the client so the static export stays light and nothing
// runs at build time. The worker is served from our own origin (scripts/copy-pdf-worker.mjs
// keeps public/ in step with the installed pdfjs-dist) rather than from a CDN: a
// CDN copy can drift out of version with the library we bundle, and it would put
// a third party in the path of a tool that promises files never leave the browser.
export function loadPdfjs() {
  pdfjsPromise ||= import("pdfjs-dist").then((pdfjs) => {
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    return pdfjs;
  });
  return pdfjsPromise;
}

// pdf.js drives its render loop with requestAnimationFrame, which browsers stop
// firing while the page is hidden. A conversion started before the user switches
// tab would otherwise stall on "Rendering page 1…" forever — render().promise
// never settles and never throws. While a render is in flight we therefore
// schedule those callbacks ourselves.
//
// MessageChannel rather than setTimeout: hidden tabs clamp timers to roughly one
// callback per second (and far less after a few minutes), which would leave a
// render crawling instead of stalling. postMessage is not throttled. Pacing to
// vsync buys nothing here anyway — these canvases are never in the document.
let channel = null;
let nextHandle = 1;
const pendingCallbacks = new Map();

function schedule(callback) {
  if (!channel) {
    channel = new MessageChannel();
    channel.port1.onmessage = (event) => {
      const pending = pendingCallbacks.get(event.data);
      if (!pending) return;
      pendingCallbacks.delete(event.data);
      pending(performance.now());
    };
    channel.port1.start();
  }
  const handle = nextHandle++;
  pendingCallbacks.set(handle, callback);
  channel.port2.postMessage(handle);
  return handle;
}

// Patch as a pair: pdf.js cancels with the handle we hand out, and rAF handles
// and our handles are separate id spaces, so a native cancel would target an
// unrelated frame callback.
let depth = 0;
let nativeRequest = null;
let nativeCancel = null;

function beginUnthrottledRendering() {
  if (depth++ > 0) return;
  nativeRequest = window.requestAnimationFrame;
  nativeCancel = window.cancelAnimationFrame;
  window.requestAnimationFrame = schedule;
  window.cancelAnimationFrame = (handle) => pendingCallbacks.delete(handle);
}

function endUnthrottledRendering() {
  if (--depth > 0) return;
  window.requestAnimationFrame = nativeRequest;
  window.cancelAnimationFrame = nativeCancel;
  nativeRequest = nativeCancel = null;
}

// Thrown when a render overruns the watchdog below, so tools can tell a stall
// apart from a PDF they simply couldn't read.
export class PdfRenderTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "PdfRenderTimeoutError";
  }
}

// Rasterise a page. Same pixels as page.render() — only the scheduling changes.
// The watchdog is a backstop, not part of normal operation: it exists so that a
// render which somehow stalls again surfaces as an error the tool can show,
// rather than a spinner that never finishes. The ceiling is far above any
// legitimate render, so slow pages on slow devices still complete.
export async function renderPage(page, params, timeoutMs = 120000) {
  beginUnthrottledRendering();
  const task = page.render(params);
  let timer = null;
  try {
    await Promise.race([
      task.promise.finally(() => clearTimeout(timer)),
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          task.cancel();
          reject(new PdfRenderTimeoutError("Timed out rendering a page of this PDF."));
        }, timeoutMs);
      }),
    ]);
  } finally {
    endUnthrottledRendering();
  }
}
