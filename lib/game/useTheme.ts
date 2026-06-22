"use client";

// Koyu/acik tema yonetimi — localStorage'ta saklanir, sistem tercihi yedek.
// FOUC (Flash-of-Unstyled-Content) onlemek icin <head>'de calisan inline
// script `documentElement`a .dark sinifini erken ekler; bu hook ise React
// agacindaki state'i o sinifla senkron tutar.

import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "extreme-sudoku-theme";

/** Tarayicida ilk acilis icin kullanilacak temayi belirler. */
function resolveInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // sessiz gec
  }
  if (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}

/** documentElement.classList'a 'dark' sinifini uygular ya da kaldirir. */
function applyDomTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

export interface UseThemeResult {
  /** Aktif tema. */
  theme: Theme;
  /** Tema acik mi koyu mu kisayolu. */
  isDark: boolean;
  /** Iki tema arasinda gecis yapar. */
  toggle: () => void;
  /** Belirli bir temaya gecer. */
  setTheme: (t: Theme) => void;
}

/**
 * Koyu/acik tema kancasi.
 *
 * - SSR'da "light" doner (sunucu hep light). Client'ta state'i lazy initial
 *   ile localStorage/sistem tercihinden okur; bu sayede etki (effect)
 *   icinde setState yapmaya gerek kalmaz.
 * - Inline FOUC scripti html'e dogru sinifi koymus oldugu icin gorsel
 *   sicrama olmaz; biz sadece React state ile DOM'u senkron tutariz.
 */
export function useTheme(): UseThemeResult {
  // Lazy initial — sunucuda "light", istemcide gercek tema.
  const [theme, setThemeState] = useState<Theme>(() => resolveInitialTheme());

  // DOM ile state'i senkronla (mount + her degisikte). DOM dis sistem,
  // burada setState yok — set-state-in-effect kurali ihlal edilmez.
  useEffect(() => {
    applyDomTheme(theme);
  }, [theme]);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      // sessiz gec
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((cur) => {
      const next: Theme = cur === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // sessiz gec
      }
      return next;
    });
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    toggle,
    setTheme,
  };
}
