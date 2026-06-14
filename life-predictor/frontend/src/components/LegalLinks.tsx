import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";

interface Props {
  align?: "left" | "center" | "right";
  compact?: boolean;
}

const copy = {
  zh: {
    howItWorks: "如何计算",
    privacy: "隐私政策",
    disclaimer: "免责声明",
    advertising: "推荐与广告说明",
  },
  en: {
    howItWorks: "How it works",
    privacy: "Privacy",
    disclaimer: "Disclaimer",
    advertising: "Recommendations & Ads",
  },
};

export default function LegalLinks({ align = "center", compact = false }: Props) {
  const { language } = useLanguage();
  const text = copy[language];
  const alignment =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  return (
    <nav
      className={`flex flex-wrap ${alignment} gap-x-4 gap-y-2 text-xs text-ink-faint`}
      aria-label={language === "zh" ? "信任与合规链接" : "Trust and policy links"}
    >
      <Link className="hover:text-primary-800" to="/how-it-works">
        {text.howItWorks}
      </Link>
      <Link className="hover:text-primary-800" to="/privacy">
        {text.privacy}
      </Link>
      <Link className="hover:text-primary-800" to="/disclaimer">
        {text.disclaimer}
      </Link>
      <Link className="hover:text-primary-800" to="/advertising">
        {text.advertising}
      </Link>
      {!compact && <span className="text-ink-faint">LifeScore</span>}
    </nav>
  );
}
