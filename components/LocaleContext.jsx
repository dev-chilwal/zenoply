"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { REGIONS, DEFAULT_REGION } from "@/lib/locales";

const LocaleContext = createContext(null);

/** Region config for the active locale, plus `code` and `choose(code)`. */
export function useRegion() {
  const ctx = useContext(LocaleContext);
  // Fallback keeps tools usable even if a consumer renders outside the provider.
  if (!ctx) return { ...REGIONS[DEFAULT_REGION], code: DEFAULT_REGION, ready: true, choose: () => {} };
  return ctx;
}

export function LocaleProvider({ children }) {
  // Start from the default so server-render and first client paint agree
  // (no hydration mismatch). Detection runs after mount and may switch it.
  const [code, setCode] = useState(DEFAULT_REGION);
  // `ready` flips true in the same render as the detected region, so a tool
  // can apply inputs from a shared link after its own region-reset effect has
  // run (see components/calc/useShareLink.js) instead of being clobbered by it.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    // Detection fallback chain (browser-only — navigator/localStorage are
    // unavailable during static prerender):
    //   0. ?region= in a shared result link (applied, not saved)
    //   1. saved choice  →  2. browser language  →  3. default
    try {
      const linked = new URLSearchParams(window.location.search).get("region");
      if (linked && REGIONS[linked]) {
        setCode(linked);
        return;
      }
    } catch {}
    // IP geolocation is intentionally NOT auto-called: a language-based guess
    // needs no network and sidesteps the ePrivacy/GDPR consent trigger. To add
    // it, fetch https://get.geojs.io/v1/ip/country.json here as an opt-in step.
    try {
      const saved = localStorage.getItem("region");
      // "EU" was a single eurozone row before the per-country split. Migrate it
      // to Ireland (it used the en-IE locale) rather than silently dropping
      // these users back to the default region.
      const migrated = saved === "EU" ? "IE" : saved;
      if (migrated && REGIONS[migrated]) {
        if (migrated !== saved) {
          try { localStorage.setItem("region", migrated); } catch {}
        }
        setCode(migrated);
        return;
      }
    } catch {}
    const cc = (navigator.language || "").split("-")[1]?.toUpperCase();
    if (cc && REGIONS[cc]) setCode(cc);
  }, []);

  const choose = (next) => {
    if (!REGIONS[next]) return;
    setCode(next);
    try {
      localStorage.setItem("region", next);
    } catch {}
  };

  const value = { ...REGIONS[code], code, ready, choose };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
