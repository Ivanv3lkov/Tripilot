import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import bg from "./bg";
import en from "./en";

const STORAGE_KEY = "tripilot.language";
const DICTIONARIES = { en, bg };
const LOCALES = { en: "en-GB", bg: "bg-BG" };

export const LANGUAGES = [
  { value: "en", label: "EN", name: "English" },
  { value: "bg", label: "BG", name: "Български" },
];

function getDeviceLanguage() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale ?? "";
    return locale.toLowerCase().startsWith("bg") ? "bg" : "en";
  } catch {
    return "en";
  }
}

function lookup(dictionary, key) {
  return key.split(".").reduce((node, part) => node?.[part], dictionary);
}

// t("trips.count", { count: 3 }) picks the "one"/"other" form and fills {{count}}.
// Missing Bulgarian texts fall back to English, then to the key itself.
export function translate(language, key, params) {
  let value = lookup(DICTIONARIES[language], key) ?? lookup(en, key);
  if (value && typeof value === "object" && params?.count !== undefined) {
    value = params.count === 1 ? value.one : value.other;
  }
  if (typeof value !== "string") return key;
  if (!params) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (match, name) =>
    params[name] === undefined ? match : String(params[name]),
  );
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(getDeviceLanguage);
  const [isReady, setIsReady] = useState(false);

  // The saved choice wins over the device language.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved && DICTIONARIES[saved]) setLanguageState(saved);
      })
      .catch(() => {})
      .finally(() => setIsReady(true));
  }, []);

  const setLanguage = useCallback((next) => {
    if (!DICTIONARIES[next]) return;
    setLanguageState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      language,
      locale: LOCALES[language],
      setLanguage,
      t: (key, params) => translate(language, key, params),
    }),
    [language, setLanguage],
  );

  // Wait for the saved language so the first screen does not switch languages.
  if (!isReady) return null;

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
