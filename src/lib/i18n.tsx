import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getUiTranslations } from "./i18n.functions";
import { UI_STRINGS, type UiKey } from "./i18n-strings";

const LOCALE_KEY = "nuru.ui.locale";
const RTL_LOCALES = new Set(["ar", "ary", "arz", "ha-arab"]);

type I18nValue = {
  locale: string;
  machine: boolean;
  setLocale: (locale: string) => void;
  t: (key: UiKey) => string;
};

const I18nContext = createContext<I18nValue>({
  locale: "en",
  machine: false,
  setLocale: () => {},
  t: (key) => UI_STRINGS[key],
});

export function useI18n() {
  return useContext(I18nContext);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState("en");
  const [strings, setStrings] = useState<Record<string, string>>({ ...UI_STRINGS });
  const [machine, setMachine] = useState(false);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(LOCALE_KEY) : null;
    if (stored && stored !== "en") setLocaleState(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (locale === "en") {
      setStrings({ ...UI_STRINGS });
      setMachine(false);
    } else {
      getUiTranslations({ data: { locale } })
        .then((result) => {
          if (cancelled) return;
          setStrings(result.strings);
          setMachine(result.machine);
        })
        .catch(() => {
          if (!cancelled) setStrings({ ...UI_STRINGS });
        });
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
      document.documentElement.dir = RTL_LOCALES.has(locale) ? "rtl" : "ltr";
    }

    return () => {
      cancelled = true;
    };
  }, [locale]);

  const setLocale = useCallback((next: string) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(LOCALE_KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      machine,
      setLocale,
      t: (key) => strings[key] ?? UI_STRINGS[key],
    }),
    [locale, machine, setLocale, strings],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
