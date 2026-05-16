import { useState, useEffect } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ReactMarkdown from "react-markdown";
import { useLanguage } from "../hooks/useLanguage";
import type { PredictionResult, PredictionDetail } from "../types";

interface Props {
  result: PredictionResult;
  predictionId: string;
}

export default function ResultReport({ result, predictionId }: Props) {
  const { t, language } = useLanguage();
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Poll for AI report
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max

    const poll = async () => {
      try {
        const res = await fetch(`/api/predictions/${predictionId}`);
        if (!res.ok) throw new Error("Failed");
        const data: PredictionDetail = await res.json();
        if (!cancelled) {
          if (data.aiReport) {
            setAiReport(data.aiReport);
            setAiLoading(false);
            return;
          }
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000);
          } else {
            setAiError(true);
            setAiLoading(false);
          }
        }
      } catch {
        if (!cancelled) {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000);
          } else {
            setAiError(true);
            setAiLoading(false);
          }
        }
      }
    };

    poll();
    return () => { cancelled = true; };
  }, [predictionId]);

  const radarData = Object.entries(result.dimensionScores).map(
    ([name, score]) => ({
      dimension: t.dimensionNames[name as keyof typeof t.dimensionNames] || name,
      score: Math.max(-10, Math.min(10, Number(score))),
    })
  );

  const copyLink = () => {
    const url = `${window.location.origin}/result/${predictionId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const riskName = (key: string) => t.riskNames[key as keyof typeof t.riskNames] || key;
  const strengthName = (key: string) => t.strengthNames[key as keyof typeof t.strengthNames] || key;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="card text-center py-10 bg-gradient-to-br from-primary-50 to-white">
        <p className="text-gray-500 text-sm mb-2">{t.result.title}</p>
        <div className="text-6xl font-bold text-primary-600 my-4">
          {result.adjustedMin}
          <span className="text-2xl text-gray-400 mx-2">{t.result.rangeBetween}</span>
          {result.adjustedMax}
          <span className="text-2xl text-gray-500 ml-1">{t.result.years}</span>
        </div>
        <div className="flex justify-center gap-8 mt-4">
          <div>
            <p className="text-3xl font-bold text-accent-600">{result.healthLifespan}</p>
            <p className="text-xs text-gray-500">{t.result.healthLifespan}</p>
            <p className="text-xs text-gray-400">{t.result.healthLifespanDesc}</p>
          </div>
          <div className="border-l border-gray-200" />
          <div>
            <p className="text-3xl font-bold text-primary-600">{result.percentile}%</p>
            <p className="text-xs text-gray-500">{t.result.percentile}</p>
            <p className="text-xs text-gray-400">{t.result.percentileSuffix}</p>
          </div>
        </div>
        <div className="mt-4 text-sm">
          <span className="text-gray-500">{t.result.confidence}: </span>
          <span className="font-bold text-primary-600">{result.confidenceLevel}%</span>
        </div>
      </div>

      {/* Potential Gain */}
      {result.potentialGain > 0 && (
        <div className="card bg-gradient-to-r from-accent-50 to-white border-accent-200 text-center">
          <p className="text-lg text-accent-700">
            {t.result.potentialGain}{" "}
            <span className="font-bold text-2xl">{result.potentialGain}</span>{" "}
            {t.result.potentialGainSuffix}
          </p>
        </div>
      )}

      {/* Strengths & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card border-l-4 border-l-green-500">
          <h3 className="text-lg font-bold text-green-700 mb-3">{t.result.topStrengths}</h3>
          <ul className="space-y-2">
            {result.topStrengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{strengthName(s)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card border-l-4 border-l-red-500">
          <h3 className="text-lg font-bold text-red-700 mb-3">{t.result.topRisks}</h3>
          <ul className="space-y-2">
            {result.topRisks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-red-500 mt-0.5">!</span>
                <span>{riskName(r)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t.result.dimensionRadar}</h3>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid strokeDasharray="3 3" />
            <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <PolarRadiusAxis angle={90} domain={[-10, 10]} tick={{ fontSize: 10 }} />
            <Radar
              name="得分"
              dataKey="score"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Report */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{t.result.aiReport}</h3>
        {aiLoading && (
          <div className="flex flex-col items-center py-8">
            <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">{t.result.aiReportLoading}</p>
          </div>
        )}
        {aiError && (
          <div className="text-center py-8 text-red-500 text-sm">{t.result.aiReportFailed}</div>
        )}
        {aiReport && (
          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown>{aiReport}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Share */}
      <div className="card text-center">
        <p className="text-sm font-medium text-gray-700 mb-2">{t.result.shareTitle}</p>
        <p className="text-xs text-gray-400 mb-3">{t.result.shareDesc}</p>
        <button onClick={copyLink} className="btn-secondary text-sm">
          {copied ? t.result.copied : t.result.copyLink}
        </button>
      </div>
    </div>
  );
}
