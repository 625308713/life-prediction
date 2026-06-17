import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSwitch from "../components/LanguageSwitch";
import LegalLinks from "../components/LegalLinks";
import { setPageSeo } from "../utils/seo";
import { getShareSummary } from "../utils/api";
import { track, trackOncePerSession } from "../utils/analytics";
import type { Language, PredictionShare } from "../types";

type ShareTypeKey =
  | "steady"
  | "movement"
  | "recovery"
  | "metabolic"
  | "prevention"
  | "environment"
  | "substance";

type ArchetypeCopy = {
  name: string;
  tagline: string;
  focus: string;
};

type ChallengeItem = {
  label: string;
  title: string;
  body: string;
};

const riskGroups: Record<Exclude<ShareTypeKey, "steady">, string[]> = {
  movement: [
    "low_activity",
    "no_exercise",
    "no_strength_training",
    "sedentary_above_8h",
    "sedentary_4_8h",
    "slow_walking_pace",
    "poor_stair_climb",
    "poor_vo2max",
    "weak_grip",
  ],
  recovery: [
    "insufficient_sleep",
    "poor_sleep_quality",
    "untreated_sleep_apnea",
    "excessive_sleep",
    "pre_sleep_screen",
    "chronic_stress",
    "depression_tendency",
    "social_isolation",
    "low_happiness",
  ],
  metabolic: [
    "bmi_overweight",
    "bmi_obese_class1",
    "bmi_obese_class2",
    "waist_risk",
    "elevated_bp",
    "stage1_hypertension",
    "stage2_hypertension",
    "prediabetes",
    "diabetes",
    "high_ldl",
    "very_high_ldl",
    "unhealthy_diet",
    "processed_food_high",
    "low_fruit_veg",
  ],
  prevention: [
    "screening_not_up_to_date",
    "hospital_distance",
    "frequent_illness",
    "chronic_diseases",
    "cancer_history",
    "autoimmune_disease",
    "chronic_inflammation",
    "unintended_weight_loss",
  ],
  environment: [
    "high_air_pollution",
    "secondhand_smoke",
    "high_risk_occupation",
    "overwork",
    "noise_exposure",
    "high_risk_behaviors",
  ],
  substance: [
    "current_light_smoker",
    "current_heavy_smoker",
    "quit_smoking_short",
    "heavy_alcohol",
  ],
};

const copy: Record<
  Language,
  {
    navHome: string;
    loading: string;
    error: string;
    shared: string;
    title: string;
    subtitle: string;
    scoreLabel: string;
    confidence: string;
    percentile: string;
    potential: string;
    years: string;
    healthAgeLabel: string;
    healthAgeYounger: string;
    healthAgeOlder: string;
    healthAgeSame: string;
    strength: string;
    priority: string;
    challengeEyebrow: string;
    challengeTitle: string;
    challengeSubtitle: string;
    challengeMove: string;
    challengeProof: string;
    challengeProtect: string;
    challengeProofTitle: string;
    challengeProtectFallback: string;
    copyChallenge: string;
    challengeCopied: string;
    acceptChallenge: string;
    hiddenTitle: string;
    hiddenItems: string[];
    takeQuiz: string;
    howItWorks: string;
    copyLink: string;
    copied: string;
    noSignal: string;
    privacyNote: string;
    archetypes: Record<ShareTypeKey, ArchetypeCopy>;
  }
> = {
  zh: {
    navHome: "返回首页",
    loading: "正在打开分享卡...",
    error: "这张分享卡暂时无法打开",
    shared: "公开分享卡",
    title: "朋友分享了一张 LifeScore 结果卡",
    subtitle:
      "这是轻量分享页，只展示结果亮点，不展示完整问卷、维度画像或 AI 分析。",
    scoreLabel: "LifeScore",
    confidence: "可信度",
    percentile: "同类参照",
    potential: "优先级空间",
    years: "年",
    healthAgeLabel: "健康年龄",
    healthAgeYounger: "比实际年轻 {n} 岁",
    healthAgeOlder: "比实际大 {n} 岁",
    healthAgeSame: "与实际持平",
    strength: "当前优势",
    priority: "优先关注",
    challengeEyebrow: "朋友的 7 天小挑战",
    challengeTitle: "这张卡不只给分数，也给一个能跟着做的小动作",
    challengeSubtitle:
      "公开分享页不会展示完整问卷，只把结果转成一个轻量挑战。你可以复制给朋友，或者自己也测一张。",
    challengeMove: "核心动作",
    challengeProof: "打卡方式",
    challengeProtect: "保留优势",
    challengeProofTitle: "每天一行记录",
    challengeProtectFallback: "保留已经有效的健康习惯，不要被激进改变打乱。",
    copyChallenge: "复制挑战文案",
    challengeCopied: "挑战已复制",
    acceptChallenge: "我也接受挑战",
    hiddenTitle: "这个页面刻意隐藏了什么",
    hiddenItems: [
      "完整问卷答案和原始健康信息",
      "详细维度雷达图和 AI 个性化分析",
      "更敏感的结果区间和健康寿命估算",
    ],
    takeQuiz: "测测我的 LifeScore",
    howItWorks: "LifeScore 如何计算",
    copyLink: "复制分享链接",
    copied: "已复制",
    noSignal: "暂未显示",
    privacyNote: "LifeScore 用于健康教育和自我观察，不是医学诊断。",
    archetypes: {
      steady: {
        name: "稳态建造型",
        tagline: "整体基础不错，重点是把已有优势继续稳定下来。",
        focus: "继续保留一个已经有效的习惯。",
      },
      movement: {
        name: "运动解锁型",
        tagline: "活动量、久坐或力量训练是最值得先看的线索。",
        focus: "从每天 10-15 分钟快走开始。",
      },
      recovery: {
        name: "恢复优先型",
        tagline: "睡眠、压力和恢复质量可能正在影响整体状态。",
        focus: "先把上床时间提前 20 分钟。",
      },
      metabolic: {
        name: "代谢调优型",
        tagline: "体重、腰围、血压、血糖或饮食结构值得优先关注。",
        focus: "先做 7 天饭后散步和饮食记录。",
      },
      prevention: {
        name: "预防补课型",
        tagline: "体检、筛查或健康信号确认度是关键。",
        focus: "预约下一项该做的体检或筛查。",
      },
      environment: {
        name: "环境减压型",
        tagline: "工作节奏、空气、噪声或暴露正在叠加压力。",
        focus: "先减少一个每天重复出现的环境暴露。",
      },
      substance: {
        name: "戒断重启型",
        tagline: "烟草或酒精是当前最值得优先处理的杠杆。",
        focus: "设一个减量目标，并考虑戒烟门诊或替代方案。",
      },
    },
  },
  en: {
    navHome: "Back home",
    loading: "Opening shared card...",
    error: "This shared card cannot be opened right now",
    shared: "Public share card",
    title: "Someone shared a LifeScore result card",
    subtitle:
      "This lightweight share page shows highlights only. It hides the full questionnaire, dimension profile, and AI analysis.",
    scoreLabel: "LifeScore",
    confidence: "Confidence",
    percentile: "Peer reference",
    potential: "Priority space",
    years: "years",
    healthAgeLabel: "Health age",
    healthAgeYounger: "{n} yrs younger than actual",
    healthAgeOlder: "{n} yrs older than actual",
    healthAgeSame: "Same as actual age",
    strength: "Current strength",
    priority: "First priority",
    challengeEyebrow: "A friend's 7-day challenge",
    challengeTitle: "This card gives more than a score. It turns the result into one small move.",
    challengeSubtitle:
      "The public page keeps the full questionnaire private and turns the highlights into a light challenge you can copy or try yourself.",
    challengeMove: "Core move",
    challengeProof: "Proof",
    challengeProtect: "Protect",
    challengeProofTitle: "One-line daily log",
    challengeProtectFallback: "Protect the health habit that is already working instead of disrupting it with drastic change.",
    copyChallenge: "Copy challenge text",
    challengeCopied: "Challenge copied",
    acceptChallenge: "Accept the challenge",
    hiddenTitle: "What this page deliberately hides",
    hiddenItems: [
      "Full questionnaire answers and raw health information",
      "Detailed dimension chart and AI personalized analysis",
      "More sensitive range and health-span estimates",
    ],
    takeQuiz: "Check my LifeScore",
    howItWorks: "How LifeScore works",
    copyLink: "Copy share link",
    copied: "Copied",
    noSignal: "Not shown",
    privacyNote:
      "LifeScore is for health education and self-reflection, not medical diagnosis.",
    archetypes: {
      steady: {
        name: "Steady Builder",
        tagline: "The overall base looks solid. Keep the useful strengths stable.",
        focus: "Protect one habit that is already working.",
      },
      movement: {
        name: "Movement Unlock",
        tagline: "Activity, sitting, or strength is the first signal to watch.",
        focus: "Start with a 10-15 minute brisk walk.",
      },
      recovery: {
        name: "Recovery First",
        tagline: "Sleep, stress, and recovery quality may be shaping the profile.",
        focus: "Move bedtime 20 minutes earlier first.",
      },
      metabolic: {
        name: "Metabolic Tune-Up",
        tagline: "Weight, waist, pressure, glucose, or food structure deserves attention.",
        focus: "Try 7 days of post-meal walks and food notes.",
      },
      prevention: {
        name: "Prevention Catch-Up",
        tagline: "Checkups, screening, or signal confirmation is the key.",
        focus: "Book the next checkup or screening item.",
      },
      environment: {
        name: "Environment Reset",
        tagline: "Work rhythm, air, noise, or exposure is adding background load.",
        focus: "Reduce one repeated environmental exposure.",
      },
      substance: {
        name: "Substance Reset",
        tagline: "Tobacco or alcohol is the highest-priority lever right now.",
        focus: "Set a reduction target and consider a cessation clinic or support.",
      },
    },
  },
};

function getShareType(result: PredictionShare, lifeScore: number): ShareTypeKey {
  // #1 risk dominates so the headline issue drives the type (mirrors ResultReport).
  const indexWeights = [5, 2, 1];
  const riskWeights = result.topRisks.reduce<Record<string, number>>(
    (acc, risk, index) => {
      acc[risk] = indexWeights[index] ?? 1;
      return acc;
    },
    {}
  );

  const scores = Object.entries(riskGroups).map(([key, signals]) => ({
    key: key as Exclude<ShareTypeKey, "steady">,
    score: signals.reduce((sum, signal) => sum + (riskWeights[signal] || 0), 0),
  }));
  scores.sort((a, b) => b.score - a.score);

  const top = scores[0];
  if (!top || top.score === 0) return "steady";
  if (lifeScore >= 82 && top.score < 3) return "steady";
  return top.key;
}

export default function Share() {
  const { id } = useParams<{ id: string }>();
  const { language, t } = useLanguage();
  const text = copy[language];
  const [share, setShare] = useState<PredictionShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    getShareSummary(id)
      .then((data) => {
        if (cancelled) return;
        setShare(data);
        trackOncePerSession("share_view", data.id);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const lifeScore = share ? share.lifeScore : 0;
  const shareType = useMemo(
    () => (share ? getShareType(share, lifeScore) : "steady"),
    [lifeScore, share]
  );
  const archetype = text.archetypes[shareType];

  useEffect(() => {
    const title = share
      ? language === "zh"
        ? `${lifeScore} 分 LifeScore 分享卡 | ${archetype.name}`
        : `${lifeScore} LifeScore Share Card | ${archetype.name}`
      : language === "zh"
      ? "LifeScore 分享卡 | 健康寿命评分"
      : "LifeScore Share Card | Health-Span Score";
    const description = share
      ? language === "zh"
        ? `一张轻量 LifeScore 分享卡：${archetype.tagline}`
        : `A lightweight LifeScore share card: ${archetype.tagline}`
      : text.subtitle;

    setPageSeo({
      title,
      description,
      path: id ? `/share/${id}` : "/share",
      robots: "noindex, follow",
    });
  }, [archetype.name, archetype.tagline, id, language, lifeScore, share, text.subtitle]);

  const riskName = (key?: string) =>
    key ? t.riskNames[key as keyof typeof t.riskNames] || key : text.noSignal;
  const strengthName = (key?: string) =>
    key ? t.strengthNames[key as keyof typeof t.strengthNames] || key : text.noSignal;

  const primaryRisk = share?.topRisks[0];
  const primaryStrength = share?.topStrengths[0];
  const challengePlan: ChallengeItem[] = [
    {
      label: text.challengeMove,
      title: archetype.name,
      body: archetype.focus,
    },
    {
      label: text.challengeProof,
      title: text.challengeProofTitle,
      body:
        language === "zh"
          ? `连续 7 天记录一次：今天有没有完成「${archetype.focus}」？优先观察「${riskName(
              primaryRisk
            )}」。`
          : `For 7 days, note once a day: did you finish "${archetype.focus}"? Watch "${riskName(
              primaryRisk
            )}" first.`,
    },
    {
      label: text.challengeProtect,
      title: strengthName(primaryStrength),
      body:
        primaryStrength && language === "zh"
          ? `继续保留「${strengthName(primaryStrength)}」，不要为了新改变打乱已有优势。`
          : primaryStrength
          ? `Keep "${strengthName(primaryStrength)}" stable while adding the new move.`
          : text.challengeProtectFallback,
    },
  ];

  const copyShareLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      track("share_copy", id);
      window.setTimeout(() => setCopied(false), 1800);
    });
  };

  const copyChallenge = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const message =
      language === "zh"
        ? `朋友的 LifeScore 是 ${lifeScore}，类型是「${archetype.name}」。TA 的 7 天小挑战：${challengePlan[0].body}。你也来测测自己的 LifeScore：${url}`
        : `A friend's LifeScore is ${lifeScore}, ${archetype.name}. Their 7-day challenge: ${challengePlan[0].body}. Try your LifeScore: ${url}`;

    navigator.clipboard.writeText(message).then(() => {
      setChallengeCopied(true);
      track("challenge_copy", id);
      window.setTimeout(() => setChallengeCopied(false), 1800);
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-primary-200 border-t-primary-700 animate-spin" />
          <p className="text-sm font-semibold text-ink-soft">{text.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface px-4">
        <div className="max-w-md rounded-lg border border-line bg-white p-6 text-center">
          <p className="text-xl font-black text-ink">{text.error}</p>
          <Link to="/" className="btn-primary mt-5 inline-flex">
            {text.takeQuiz}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="border-b border-line bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800 text-sm font-black text-white">
              LS
            </span>
            <span className="text-sm font-black">LifeScore</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-secondary px-3 py-1.5 text-sm">
              {text.navHome}
            </Link>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
        <section className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-stretch">
          <div className="card-dark animate-fade-up p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-200">
              {text.shared}
            </p>
            <h1 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              {text.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/70">
              {text.subtitle}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {share.healthAgeDelta !== undefined && (
                <div className="rounded-lg border border-accent-300/30 bg-accent-400/15 p-4">
                  <p className="text-xs text-accent-200">{text.healthAgeLabel}</p>
                  <p className="mt-1 text-xl font-black leading-tight text-accent-100">
                    {share.healthAgeDelta < 0
                      ? text.healthAgeYounger.replace(
                          "{n}",
                          String(Math.abs(share.healthAgeDelta))
                        )
                      : share.healthAgeDelta > 0
                      ? text.healthAgeOlder.replace("{n}", String(share.healthAgeDelta))
                      : text.healthAgeSame}
                  </p>
                </div>
              )}
              <div className="rounded-lg bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10">
                <p className="text-[11px] uppercase tracking-wider text-white/45">{text.confidence}</p>
                <p className="num mt-1.5 text-2xl font-semibold text-white">{share.confidenceLevel}%</p>
              </div>
              <div className="rounded-lg bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10">
                <p className="text-[11px] uppercase tracking-wider text-white/45">{text.percentile}</p>
                <p className="num mt-1.5 text-2xl font-semibold text-primary-300">{share.percentile}%</p>
              </div>
              <div className="rounded-lg bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10">
                <p className="text-[11px] uppercase tracking-wider text-white/45">{text.potential}</p>
                <p className="num mt-1.5 text-2xl font-semibold text-white">
                  {share.potentialGain}
                  <span className="ml-1 text-sm font-normal text-white/50">{text.years}</span>
                </p>
              </div>
            </div>
          </div>

          <aside className="rounded-card border border-line bg-white p-5 shadow-lift">
            <div className="card-dark p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary-300/90">
                {text.scoreLabel}
              </p>
              <div className="mt-3 flex items-end gap-4">
                <p className="num text-8xl font-bold leading-[0.85] text-white">
                  {lifeScore}
                </p>
                <div className="pb-3">
                  <p className="text-sm font-bold text-white/80">{archetype.name}</p>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full animate-bar-fill rounded-full bg-gradient-to-r from-primary-400 to-primary-200"
                  style={{ width: `${lifeScore}%` }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
              <p className="text-2xl font-black leading-tight">{archetype.name}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-primary-800">
                {archetype.tagline}
              </p>
            </div>
          </aside>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
              {text.strength}
            </p>
            <p className="mt-3 text-2xl font-black">
              {strengthName(share.topStrengths[0])}
            </p>
          </article>
          <article className="rounded-lg border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-700">
              {text.priority}
            </p>
            <p className="mt-3 text-2xl font-black text-accent-900">
              {riskName(share.topRisks[0])}
            </p>
          </article>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="rounded-lg border border-line bg-white p-5">
            <h2 className="text-xl font-black">{text.hiddenTitle}</h2>
            <div className="mt-4 space-y-3">
              {text.hiddenItems.map((item) => (
                <p key={item} className="rounded-lg bg-surface px-4 py-3 text-sm leading-6 text-ink-soft">
                  {item}
                </p>
              ))}
            </div>
          </div>

          <div className="card-dark p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-200">
              {text.challengeEyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-black leading-tight">{text.challengeTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-white/70">
              {text.challengeSubtitle}
            </p>
            <div className="mt-5 grid gap-3">
              {challengePlan.map((item) => (
                <article key={item.label} className="rounded-lg bg-white/10 p-4">
                  <p className="text-xs font-bold text-accent-300">{item.label}</p>
                  <p className="mt-2 text-sm font-black">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-white/75">{item.body}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={copyChallenge}
                className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-black text-ink hover:bg-primary-50"
              >
                {challengeCopied ? text.challengeCopied : text.copyChallenge}
              </button>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
              >
                {text.acceptChallenge}
              </Link>
              <Link
                to="/how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
              >
                {text.howItWorks}
              </Link>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/50">{text.privacyNote}</p>
          </div>
        </section>

        <div className="mt-6 rounded-lg border border-dashed border-line bg-white/60 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <LegalLinks align="left" />
            <button onClick={copyShareLink} className="btn-secondary">
              {copied ? text.copied : text.copyLink}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
