import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSwitch from "../components/LanguageSwitch";
import LegalLinks from "../components/LegalLinks";
import ResultReport from "../components/ResultReport";
import { setPageSeo } from "../utils/seo";
import { getPrediction } from "../utils/api";
import { trackOncePerSession } from "../utils/analytics";
import type { PredictionResult } from "../types";

export default function Result() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<PredictionResult | null>(
    (location.state as { result?: PredictionResult })?.result ?? null
  );
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPageSeo({
      title: language === "zh" ? "LifeScore 结果卡" : "LifeScore Result",
      description:
        language === "zh"
          ? "查看你的 LifeScore 完整结果、优势、优先风险和行动建议。"
          : "View your full LifeScore result, strengths, priority risks, and next-step guidance.",
      path: id ? `/result/${id}` : "/result",
      robots: "noindex, nofollow",
    });
  }, [id, language]);

  useEffect(() => {
    if (id) trackOncePerSession("result_view", id);
  }, [id]);

  useEffect(() => {
    if (result || !id) return;

    const fetchResult = async () => {
      try {
        const data = await getPrediction(id);
        setResult({
          id: data.id,
          baselineLifeExpectancy: data.baselineLifeExpectancy,
          adjustedLifeExpectancy: data.adjustedLifeExpectancy,
          baseLifeExpectancy: data.baseLifeExpectancy,
          adjustedMin: data.adjustedMin,
          adjustedMax: data.adjustedMax,
          healthLifespan: data.healthLifespan,
          dimensionScores: data.dimensionScores,
          topRisks: data.topRisks,
          topStrengths: data.topStrengths,
          potentialGain: data.potentialGain,
          confidenceLevel: data.confidenceLevel,
          percentile: data.percentile,
          totalAdjustment: data.totalAdjustment,
          lifeScore: data.lifeScore,
          age: data.age,
          healthAge: data.healthAge,
          healthAgeDelta: data.healthAgeDelta,
          aiReportEnabled: data.aiReportEnabled,
        });
      } catch {
        setError(t.app.error);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, result, t.app.error]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t.app.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || t.app.error}</p>
          <button onClick={() => navigate("/")} className="btn-primary">{t.nav.home}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="bg-surface/90 backdrop-blur border-b border-line px-4 py-3 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-black text-ink">
            {language === "zh" ? "LifeScore 结果卡" : "LifeScore Result"}
          </h1>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="btn-secondary text-sm py-1.5 px-3">
              {t.result.newPrediction}
            </button>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        {id && <ResultReport result={result} predictionId={id} />}
      </main>
      <footer className="px-4 pb-6">
        <LegalLinks />
      </footer>
    </div>
  );
}
