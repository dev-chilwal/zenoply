"use client";
// Holds the active region for the finance calculators. The choice is purely
// client-side (localStorage) — the site is a static export, so there is no
// server-side locale. Initial render uses DEFAULT_REGION on both server and
// client, then an effect upgrades to the saved choice after mount (mirrors the
// no-flash pattern in ThemeToggle), so hydration always matches.
import { createContext, useContext, useEffect, useState } from "react";
import { REGIONS, DEFAULT_REGION } from "@/lib/locales";

const STORAGE_KEY = "region";
const RegionContext = createContext(null);

export function LocaleProvider({ children }) {
  const [code, setCode] = useState(DEFAULT_REGION);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && REGIONS[saved]) setCode(saved);
    } catch {}
  }, []);

  const choose = (next) => {
    if (!REGIONS[next]) return;
    setCode(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  // Flatten the active region config and expose the code + setter alongside it.
  const value = { ...REGIONS[code], code, choose };
  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const ctx = useContext(RegionContext);
  if (!ctx) throw new Error("useRegion must be used within a LocaleProvider");
  return ctx;
}
