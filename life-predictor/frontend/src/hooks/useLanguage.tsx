import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import type { Language } from "../types";
import zh from "../i18n/zh";
import en from "../i18n/en";

const translations = { zh, en };

interface LanguageContextType {
  language: Language;
  t: typeof zh;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "zh",
  t: zh,
  setLanguage: () => {},
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved === "zh" || saved === "en") ? saved : "zh";
  });

  const t = translations[language];

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "zh" ? "en" : "zh");
  }, [language, setLanguage]);

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
