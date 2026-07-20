"use client";

// Shared tesseract.js plumbing for the OCR tools. Everything is loaded from our
// own origin (scripts/copy-tesseract-assets.mjs keeps public/ in step with the
// installed packages) — the default tesseract.js paths pull the worker, WASM
// core and language data from jsdelivr, which both breaks offline use and puts a
// third party in the path of a tool that promises files never leave the browser.

let tesseractPromise = null;

export function loadTesseract() {
  tesseractPromise ||= import("tesseract.js");
  return tesseractPromise;
}

// Self-hosted asset paths (see scripts/copy-tesseract-assets.mjs).
const WORKER_PATH = "/tesseract/worker.min.js";
const CORE_PATH = "/tesseract/tesseract-core-simd-lstm.wasm.js";
const LANG_PATH = "/tessdata";

// OCR Engine Mode 1 = LSTM only. This is tesseract.js's default, and we keep it:
// the legacy/combined modes would pull a 10-20MB core and language file instead
// of the ~3.7MB core + ~1-3MB `_best_int` language files we ship. Every language
// offered here must have its `.traineddata.gz` copied into public/tessdata by the
// asset script, or the worker will 404 at runtime.
const OEM_LSTM_ONLY = 1;

export const OCR_LANGS = [
  { value: "eng", label: "English" },
  { value: "hin", label: "Hindi — हिन्दी" },
  { value: "eng+hin", label: "English + Hindi" },
];

// Create one OCR worker for `langs` (e.g. "eng" or "eng+hin"). The first call for
// a language downloads the core (browser-cached) and language data (IndexedDB-
// cached by tesseract.js), so later runs are fast. onProgress(status, fraction)
// receives the library's own 0..1 progress for loading and recognition.
// The caller owns the worker and must terminate() it.
export async function createOcrWorker(langs, onProgress) {
  const Tesseract = await loadTesseract();
  return Tesseract.createWorker(langs, OEM_LSTM_ONLY, {
    workerPath: WORKER_PATH,
    corePath: CORE_PATH,
    langPath: LANG_PATH,
    logger: (m) => {
      if (onProgress && typeof m.progress === "number") onProgress(m.status, m.progress);
    },
  });
}

// A friendlier label for the progress statuses tesseract.js emits.
export function ocrStatusLabel(status) {
  if (!status) return "";
  if (status.includes("loading tesseract core")) return "Loading OCR engine…";
  if (status.includes("initializing")) return "Starting OCR engine…";
  if (status.includes("loading language")) return "Loading language data…";
  if (status.includes("recognizing")) return "Reading text…";
  return status.charAt(0).toUpperCase() + status.slice(1) + "…";
}
