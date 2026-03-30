"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import type { Language } from "@/types";

const FADE_MS = 75;

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  fading: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  fading: false,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [fading, setFading] = useState(true); // start hidden until language resolves
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function isValid(v: string | null): v is Language {
      return v === "en" || v === "zh";
    }

    const stored = localStorage.getItem("lang");
    const urlParam = new URLSearchParams(window.location.search).get("lang");
    const sysLang = (
      navigator.languages?.[0] ?? navigator.language ?? ""
    ).toLowerCase();
    const systemDefault: Language = sysLang.startsWith("zh") ? "zh" : "en";

    const resolved = isValid(stored)
      ? stored
      : isValid(urlParam)
      ? urlParam
      : systemDefault;

    setLangState(resolved);
    // Fade in after language is resolved
    requestAnimationFrame(() => setFading(false));
  }, []);

  const setLang = useCallback((l: Language) => {
    setLangState((prev) => {
      if (prev === l) return prev;
      if (timerRef.current) clearTimeout(timerRef.current);

      // Fade out, swap lang at midpoint, fade in
      setFading(true);
      timerRef.current = setTimeout(() => {
        setLangState(l);
        timerRef.current = setTimeout(() => {
          setFading(false);
          timerRef.current = null;
        }, FADE_MS);
      }, FADE_MS);

      return prev; // keep old lang during fade-out
    });

    localStorage.setItem("lang", l);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", l);
    window.history.replaceState({}, "", url.toString());
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, fading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
