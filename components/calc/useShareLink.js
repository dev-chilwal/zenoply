"use client";
import { useEffect, useRef, useState } from "react";
import { useRegion } from "@/components/LocaleContext";

/**
 * Shareable result links: the calculator's inputs live in the query string
 * (?region=IN&amount=5000&rate=12…), so a result can be bookmarked or sent
 * without anything being stored server-side.
 *
 * fields: { key: { value, set, min, max } }   numeric input, clamped on load
 *         { key: { value, set, options } }    string toggle, whitelisted
 *
 * Call it AFTER the component's `[reg.code]` reset effect. Effects run in
 * declaration order, so on the render where the locale context turns `ready`
 * (the region detected or taken from ?region=) the reset runs first and the
 * linked values are applied on top of it rather than being reset away.
 */
export function useShareLink(fields) {
  const reg = useRegion();
  const applied = useRef(false);
  const [status, setStatus] = useState(null); // null | "copied" | "address"

  useEffect(() => {
    if (!reg.ready || applied.current) return;
    applied.current = true;
    let params;
    try { params = new URLSearchParams(window.location.search); } catch { return; }
    for (const [key, f] of Object.entries(fields)) {
      const raw = params.get(key);
      if (raw == null) continue;
      if (f.options) {
        if (f.options.includes(raw)) f.set(raw);
        continue;
      }
      const n = Number(raw);
      if (raw.trim() === "" || !Number.isFinite(n)) continue;
      // Clamp to the input's own range: an absurd year count would otherwise
      // spin a month-by-month loop.
      f.set(Math.min(f.max, Math.max(f.min, n)));
    }
  }, [reg.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 2500);
    return () => clearTimeout(t);
  }, [status]);

  const copy = async () => {
    const p = new URLSearchParams();
    p.set("region", reg.code);
    for (const [key, f] of Object.entries(fields)) p.set(key, String(f.value));
    const href = `${window.location.origin}${window.location.pathname}?${p}`;
    // The address bar always carries the link, so it can be copied by hand
    // where the clipboard API is unavailable or refused.
    try { window.history.replaceState(window.history.state, "", href); } catch {}
    try {
      await navigator.clipboard.writeText(href);
      setStatus("copied");
    } catch {
      setStatus("address");
    }
  };

  return { copy, status };
}
