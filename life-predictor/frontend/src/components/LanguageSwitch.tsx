import { useLanguage } from "../hooks/useLanguage";

export default function LanguageSwitch() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium
                 bg-white border border-gray-300 hover:bg-gray-50 transition-colors
                 shadow-sm"
      aria-label="Switch language"
    >
      <span className={language === "zh" ? "text-primary-600 font-bold" : "text-gray-400"}>
        中
      </span>
      <span className="text-gray-300">/</span>
      <span className={language === "en" ? "text-primary-600 font-bold" : "text-gray-400"}>
        EN
      </span>
    </button>
  );
}
