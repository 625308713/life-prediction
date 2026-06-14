import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { setPageSeo } from "../utils/seo";

const copy = {
  zh: {
    eyebrow: "404",
    title: "这个页面不存在",
    body: "链接可能已失效，或者地址输错了。你的测评结果不受影响——结果链接仍然有效。",
    home: "回到首页",
    how: "了解 LifeScore 怎么算",
  },
  en: {
    eyebrow: "404",
    title: "This page does not exist",
    body: "The link may be outdated or mistyped. Your result is unaffected — result links keep working.",
    home: "Back home",
    how: "How LifeScore works",
  },
};

export default function NotFound() {
  const { language } = useLanguage();
  const text = copy[language];

  useEffect(() => {
    setPageSeo({
      title: language === "zh" ? "页面不存在 | LifeScore" : "Page Not Found | LifeScore",
      description: text.body,
      robots: "noindex, follow",
    });
  }, [language, text.body]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card max-w-md animate-fade-up text-center">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-primary-600">
          {text.eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-black text-ink">{text.title}</h1>
        <p className="mt-4 text-sm leading-7 text-ink-soft">{text.body}</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/" className="btn-primary">
            {text.home}
          </Link>
          <Link to="/how-it-works" className="btn-secondary">
            {text.how}
          </Link>
        </div>
      </div>
    </div>
  );
}
