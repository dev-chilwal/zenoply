"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { REGIONS, DEFAULT_REGION } from "@/lib/locales";

const LocaleContext = createContext(null);

/** Region config for the active locale, plus `code` and `choose(code)`. */
export function useRegion() {
  const ctx = useContext(LocaleContext);
  // Fallback keeps tools usable even if a consumer renders outside the provider.
  if (!ctx) return { ...REGIONS[DEFAULT_REGION], code: DEFAULT_REGION, choose: () => {} };
  return ctx;
}

export function LocaleProvider({ children }) {
  // Start from the default so server-render and first client paint agree
  // (no hydration mismatch). Detection runs after mount and may switch it.
  const [code, setCode] = useState(DEFAULT_REGION);

  useEffect(() => {
    // Detection fallback chain (browser-only — navigator/localStorage are
    // unavailable during static prerender):
    //   1. saved choice  →  2. browser language  →  3. default
    // IP geolocation is intentionally NOT auto-called: a language-based guess
    // needs no network and sidesteps the ePrivacy/GDPR consent trigger. To add
    // it, fetch https://get.geojs.io/v1/ip/country.json here as an opt-in step.
    try {
      const saved = localStorage.getItem("region");
      if (saved && REGIONS[saved]) {
        setCode(saved);
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

  const value = { ...REGIONS[code], code, choose };
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
