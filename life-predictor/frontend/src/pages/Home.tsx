import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { useQuestionnaire } from "../hooks/useQuestionnaire";
import LanguageSwitch from "../components/LanguageSwitch";
import LegalLinks from "../components/LegalLinks";
import ProgressBar from "../components/ProgressBar";
import { setPageSeo } from "../utils/seo";
import { getPublicStats, submitPrediction } from "../utils/api";
import { track, trackOncePerSession } from "../utils/analytics";
import {
  BoosterBiomarkersStep,
  BoosterEnvironmentStep,
  BoosterFamilyStep,
  BoosterFunctionStep,
  BoosterPreventionStep,
  CoreActivityStep,
  CoreHealthSignalsStep,
  CoreMindStep,
  CoreProfileStep,
  CoreRecoveryStep,
  CoreSubstancesStep,
} from "../components/QuestionnaireForm/V2Steps";
import type { Language, QuestionnaireData } from "../types";

const TOTAL_STEPS = 11;
const REQUIRED_STEPS = 6;

const stepComponents = [
  CoreProfileStep,
  CoreHealthSignalsStep,
  CoreActivityStep,
  CoreSubstancesStep,
  CoreRecoveryStep,
  CoreMindStep,
  BoosterBiomarkersStep,
  BoosterFunctionStep,
  BoosterFamilyStep,
  BoosterPreventionStep,
  BoosterEnvironmentStep,
];

const quizStepTitles: Record<Language, string[]> = {
  zh: [
    "基础画像",
    "健康信号",
    "运动与久坐",
    "烟酒习惯",
    "睡眠与饮食",
    "压力与连接",
    "化验与临床数字",
    "功能体能",
    "家族风险",
    "筛查与医疗可及性",
    "环境与安全",
  ],
  en: [
    "Baseline Profile",
    "Health Signals",
    "Movement & Sitting",
    "Smoking & Alcohol",
    "Sleep & Food",
    "Stress & Connection",
    "Clinical Numbers",
    "Functional Fitness",
    "Family Risk",
    "Screening & Access",
    "Environment & Safety",
  ],
};

const copy = {
  zh: {
    brand: "LifeScore",
    eyebrow: "核心 6 步，3-5 分钟生成结果卡",
    headline: "测测你的 LifeScore：看见优势、风险和下一步。",
    subhead:
      "不是算命，也不是诊断。LifeScore 把高信号健康问题整理成一张轻量、有趣、可分享的健康寿命结果卡。",
    start: "开始核心 6 步",
    resume: "继续测评",
    time: "核心 3-5 分钟",
    privacy: "不知道化验值也可以跳过",
    scoreLabel: "结果卡预览",
    scoreMeta: "完成后会生成你的真实分数、类型和行动建议",
    trustChips: ["不卖数据给广告商", "进阶问题可选", "非医学诊断"],
    pillars: ["LifeScore 分数", "结果类型", "Top3 优势", "Top3 风险", "分享卡"],
    previewType: "运动解锁型",
    previewSignal: "关键线索",
    previewSignalBody: "活动量、久坐或力量训练是优先杠杆",
    previewFocus: "本周重点",
    previewFocusBody: "每天 10-15 分钟快走，先追求连续",
    previewShare: "可下载分享卡",
    route: ["核心问卷", "准确度增强", "结果解读", "分享卡片"],
    routeStatus: ["快速", "可选", "行动", "传播"],
    optionalHint: "想让结果更细一点？继续填写进阶问题。",
    optionalBody: "睡眠、医疗资源和体能指标会提升报告的可信度，但不是必填。",
    stepHint: "先完成核心 6 步即可生成结果；后面的进阶问题用于让结果更细。",
    whyTitle: "为什么问这些",
    stepWhy: [
      "年龄、体型和地区用于建立基础参照，避免把不同人群粗暴放在一起比较。",
      "已知疾病、血压和血糖是结果里权重最高的健康信号之一。",
      "运动时间、力量训练和久坐会直接影响心肺、代谢和功能体能。",
      "烟草和过量饮酒是最明确、也最值得优先识别的可改变风险。",
      "睡眠恢复和饮食结构会影响精力、血糖、体重和长期稳定性。",
      "压力、社会连接和目标感会影响习惯能不能长期坚持。",
      "真实化验数字能让血压、血糖、血脂相关判断更细。",
      "爬楼、步速和力量感能补充日常体能画像。",
      "家族史不是命运，但会改变某些风险的优先级。",
      "筛查和医疗可及性影响早发现、早处理的机会。",
      "空气、噪声、工时和安全暴露会补全生活环境风险。",
    ],
    coreCompleteTitle: "核心画像已经够生成结果了",
    coreCompleteBody:
      "你可以现在生成 LifeScore 结果卡，也可以继续填写进阶问题，让可信度和行动建议更细。",
    generateNow: "现在生成结果卡",
    continueBoosters: "继续提高准确度",
    boosterNote: "进阶问题可跳过，不会影响你拿到结果。",
    trusted: "轻量测评，不制造焦虑",
    consentPrefix: "我已阅读",
    consentPrivacy: "隐私政策",
    consentAnd: "和",
    consentDisclaimer: "免责声明",
    consentSuffix: "，同意提交答案用于生成我的 LifeScore 结果（含 AI 解读）。",
    consentRequired: "请先勾选同意，再生成结果。",
    stepIncomplete: "这一步还有未回答的问题。不确定的可以选“不知道”，但需要明确选一下。",
    coreIncomplete: "核心 6 步还有未完成的问题，已带你回到对应步骤。",
    trustCount: "已有 {n} 人完成测评",
    retestTitle: "距离上次测评已 {n} 天",
    retestBody: "习惯坚持得怎么样？复测一次，看看分数和健康年龄的变化。",
    retestCta: "开始复测",
  },
  en: {
    brand: "LifeScore",
    eyebrow: "6 core steps, a result card in 3-5 minutes",
    headline: "Check your LifeScore: strengths, risks, and next steps.",
    subhead:
      "Not fortune-telling, not a diagnosis. LifeScore turns high-signal health questions into a light, useful, shareable health-span card.",
    start: "Start 6 core steps",
    resume: "Continue quiz",
    time: "Core: 3-5 min",
    privacy: "Unknown lab values can be skipped",
    scoreLabel: "Result card preview",
    scoreMeta: "Your real result includes a score, type, and next-step guidance",
    trustChips: ["Data is not sold to advertisers", "Boosters optional", "Not a diagnosis"],
    pillars: ["LifeScore", "Result type", "Top 3 strengths", "Top 3 risks", "Share card"],
    previewType: "Movement Unlock",
    previewSignal: "Key signal",
    previewSignalBody: "Activity, sitting, or strength is the first lever",
    previewFocus: "This week's focus",
    previewFocusBody: "Walk briskly 10-15 minutes daily; consistency first",
    previewShare: "Downloadable share card",
    route: ["Core quiz", "Boosters", "Result readout", "Share card"],
    routeStatus: ["fast", "optional", "action", "viral"],
    optionalHint: "Want a sharper profile? Continue with advanced questions.",
    optionalBody:
      "Sleep, healthcare access, and fitness signals improve confidence, but they are optional.",
    stepHint:
      "Finish the 6 core steps for a result; optional boosters make the profile sharper.",
    whyTitle: "Why we ask this",
    stepWhy: [
      "Age, body metrics, and region set the baseline so different groups are not compared too crudely.",
      "Known conditions, blood pressure, and glucose are among the highest-signal health inputs.",
      "Activity, strength, and sitting time affect cardio fitness, metabolism, and daily function.",
      "Tobacco and excess alcohol are clear, changeable risks worth identifying early.",
      "Sleep recovery and food structure influence energy, glucose, weight, and long-term stability.",
      "Stress, connection, and purpose shape whether healthy routines can actually last.",
      "Real lab numbers make blood pressure, glucose, and lipid signals sharper.",
      "Stairs, walking pace, and strength add a practical functional-fitness view.",
      "Family history is not destiny, but it changes which risks deserve attention first.",
      "Screening and access affect the chance to find and act on issues earlier.",
      "Air, noise, work hours, and safety exposure complete the environment picture.",
    ],
    coreCompleteTitle: "Your core profile is ready",
    coreCompleteBody:
      "You can generate your LifeScore result card now, or continue with boosters for a sharper confidence level and next-step guidance.",
    generateNow: "Generate result now",
    continueBoosters: "Improve accuracy",
    boosterNote: "Boosters are skippable and do not block your result.",
    trusted: "A lighter quiz, not a fear machine",
    consentPrefix: "I have read the ",
    consentPrivacy: "Privacy Policy",
    consentAnd: " and ",
    consentDisclaimer: "Disclaimer",
    consentSuffix:
      ", and I agree to submit my answers to generate my LifeScore result (including the AI interpretation).",
    consentRequired: "Please check the consent box before generating your result.",
    stepIncomplete:
      'Some questions on this step are unanswered. "Not sure" is a valid answer, but please pick one.',
    coreIncomplete:
      "Some core questions are still unanswered — we brought you back to that step.",
    trustCount: "{n} people have completed the quiz",
    retestTitle: "It has been {n} days since your last check",
    retestBody: "How are the habits holding up? Retest to see how your score and health age moved.",
    retestCta: "Retest now",
  },
};

const RETEST_REMINDER_DAYS = 90;
const TRUST_COUNT_MIN = 50;

// Explicit answers required per core step; boosters stay optional.
const requiredFieldsByStep: (keyof QuestionnaireData)[][] = [
  ["gender", "region"],
  ["diagnosedConditions", "bloodPressureKnown", "bloodSugarKnown"],
  ["activityMinutesPerWeek", "muscleStrengthening", "sedentaryHours"],
  ["smokingAmount", "alcoholPattern"],
  [
    "sleepDurationRange",
    "sleepQuality",
    "snoreOrApnea",
    "dietFruitVegDays",
    "processedFoodFrequency",
  ],
  ["stressFrequency", "socialConnection", "purposeLevel"],
];

function isAnswered(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

function isStepComplete(data: QuestionnaireData, step: number): boolean {
  const required = requiredFieldsByStep[step];
  if (!required) return true;
  return required.every((field) => isAnswered(data[field]));
}

function firstIncompleteCoreStep(data: QuestionnaireData): number {
  for (let step = 0; step < REQUIRED_STEPS; step += 1) {
    if (!isStepComplete(data, step)) return step;
  }
  return -1;
}

function hasKnownValue(value: unknown): boolean {
  return (
    value !== undefined &&
    value !== null &&
    value !== "" &&
    value !== "unknown" &&
    value !== "not_sure" &&
    value !== "prefer_not"
  );
}

function getConfidenceLevel(data: QuestionnaireData, currentStep: number): number {
  const coreProgress = Math.min(currentStep + 1, REQUIRED_STEPS);
  let confidence = 52 + coreProgress * 4;

  const coreFields: (keyof QuestionnaireData)[] = [
    "age",
    "gender",
    "heightCm",
    "weightKg",
    "waistCm",
    "diagnosedConditions",
    "bloodPressureKnown",
    "bloodSugarKnown",
    "activityMinutesPerWeek",
    "muscleStrengthening",
    "sedentaryHours",
    "smokingAmount",
    "alcoholPattern",
    "sleepDurationRange",
    "sleepQuality",
    "snoreOrApnea",
    "dietFruitVegDays",
    "processedFoodFrequency",
    "stressFrequency",
    "socialConnection",
    "purposeLevel",
  ];

  const boosterFields: (keyof QuestionnaireData)[] = [
    "bpSystolic",
    "bpDiastolic",
    "a1c",
    "fastingGlucose",
    "ldlCholesterol",
    "restingHeartRate",
    "climbThreeFloors",
    "walkingPace",
    "vo2maxLevel",
    "gripStrength",
    "parentLongevity",
    "familyMemberAbove90",
    "familyHeartDisease",
    "familyCancer",
    "cancerScreeningStatus",
    "dentalCheckup",
    "recentCheckupCount",
    "distanceToHospital",
    "commercialInsurance",
    "hasFamilyDoctor",
    "airPollutionExposure",
    "secondhandSmoke",
    "weeklyWorkHours",
    "highRiskOccupation",
    "longTermNoise",
  ];

  confidence += coreFields.filter((field) => hasKnownValue(data[field])).length * 0.8;
  confidence += boosterFields.filter((field) => hasKnownValue(data[field])).length * 0.7;

  return Math.min(95, Math.round(confidence));
}

export default function Home() {
  const { t, language } = useLanguage();
  const text = copy[language];
  const navigate = useNavigate();
  const { data, currentStep, updateField, nextStep, prevStep, goToStep, clearSaved } =
    useQuestionnaire();
  const [started, setStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [consented, setConsented] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publicCount, setPublicCount] = useState<number | null>(null);
  const [daysSinceLastTest, setDaysSinceLastTest] = useState<number | null>(null);

  useEffect(() => {
    trackOncePerSession("home_view");

    getPublicStats()
      .then((stats) => {
        if (typeof stats.totalCount === "number") {
          setPublicCount(stats.totalCount);
        }
      })
      .catch(() => {});

    try {
      const raw = localStorage.getItem("ls_history");
      const history: { date: number }[] = raw ? JSON.parse(raw) : [];
      const last = history[history.length - 1];
      if (last?.date) {
        setDaysSinceLastTest(
          Math.floor((Date.now() - last.date) / 86400000)
        );
      }
    } catch {
      // history is optional
    }
  }, []);

  const startQuiz = () => {
    track("quiz_start");
    setStarted(true);
  };

  const confidenceLevel = getConfidenceLevel(data, currentStep);
  const StepComponent = stepComponents[currentStep];
  const displayOptional = currentStep >= REQUIRED_STEPS;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const isCoreCompleteStep = currentStep === REQUIRED_STEPS - 1;
  const sampleScore = Math.min(96, Math.max(48, Math.round(70 + confidenceLevel / 5)));

  useEffect(() => {
    setPageSeo({
      title:
        language === "zh"
          ? "LifeScore - 健康寿命评分与行动建议"
          : "LifeScore - Health-Span Scorecard",
      description:
        language === "zh"
          ? "用 3-5 分钟完成 LifeScore 健康寿命测评，了解优势、优先风险和下一步行动建议。"
          : "Take a 3-5 minute LifeScore quiz to understand health-span strengths, priority risks, and next-step guidance.",
      path: "/",
    });
  }, [language]);

  useEffect(() => {
    if (!started) return;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    });
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "auto" });
    }, 80);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [currentStep, started]);

  const handlePrev = () => {
    setError(null);
    if (currentStep === 0) {
      setStarted(false);
      return;
    }
    prevStep();
  };

  const handleNext = () => {
    if (currentStep < REQUIRED_STEPS && !isStepComplete(data, currentStep)) {
      setError(text.stepIncomplete);
      return;
    }
    setError(null);
    nextStep();
  };

  const handleSubmit = async () => {
    const incompleteStep = firstIncompleteCoreStep(data);
    if (incompleteStep >= 0) {
      goToStep(incompleteStep);
      setError(text.coreIncomplete);
      return;
    }
    if (!consented) {
      setError(text.consentRequired);
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitPrediction({ ...data, language });
      track("quiz_submit", result.id);
      clearSaved();
      navigate(`/result/${result.id}`, { state: { result } });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : language === "zh"
          ? "提交失败，请重试"
          : "Submit failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!started) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 right-[-10%] h-[480px] w-[480px] rounded-full bg-primary-200/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[-20%] left-[-8%] h-[420px] w-[420px] rounded-full bg-accent-200/30 blur-3xl"
        />
        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800 text-sm font-black text-white">
                LS
              </div>
              <div>
                <p className="text-sm font-bold text-ink">{text.brand}</p>
                <p className="text-xs text-ink-faint">{text.trusted}</p>
              </div>
            </div>
            <LanguageSwitch />
          </header>

          <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr]">
            <section>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/70 px-3 py-1 text-xs font-semibold text-primary-800">
                <span className="h-2 w-2 rounded-full bg-accent-500" />
                {text.eyebrow}
              </div>
              <h1 className="max-w-3xl animate-fade-up text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl">
                {text.headline}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-ink-soft sm:text-lg">
                {text.subhead}
              </p>

              {daysSinceLastTest !== null && daysSinceLastTest >= RETEST_REMINDER_DAYS && (
                <div className="mt-6 flex flex-col gap-3 rounded-xl border border-accent-200 bg-accent-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-accent-900">
                      {text.retestTitle.replace("{n}", String(daysSinceLastTest))}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-accent-800">{text.retestBody}</p>
                  </div>
                  <button
                    onClick={startQuiz}
                    className="btn-secondary shrink-0 border-accent-300 text-accent-900 hover:bg-accent-100"
                  >
                    {text.retestCta}
                  </button>
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={startQuiz}
                  className="btn-primary px-8 py-4 text-base shadow-lg shadow-primary-900/10"
                >
                  {currentStep > 0 ? text.resume : text.start}
                </button>
                <div className="flex items-center gap-3 rounded-lg border border-line bg-white/70 px-4 py-3 text-sm text-ink-faint">
                  <span className="font-bold text-primary-800">{text.time}</span>
                  <span>{text.privacy}</span>
                </div>
              </div>

              {publicCount !== null && publicCount >= TRUST_COUNT_MIN && (
                <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-faint">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-primary-500" />
                  {text.trustCount.replace("{n}", publicCount.toLocaleString())}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {text.trustChips.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-line bg-white/65 px-3 py-1 text-xs font-bold text-ink-soft"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-5">
                {text.pillars.map((item, index) => (
                  <div
                    key={item}
                    className="rounded-lg border border-line bg-white/70 p-3"
                  >
                    <p className="text-xs font-black text-primary-800">0{index + 1}</p>
                    <p className="mt-1 text-sm font-semibold leading-5 text-ink-soft">{item}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="animate-fade-up">
              <div className="rounded-[1.5rem] border border-line bg-white p-4 shadow-lift">
                <div className="card-dark p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-primary-200">
                        {text.scoreLabel}
                      </p>
                      <p className="mt-3 bg-gradient-to-br from-white via-primary-100 to-primary-300 bg-clip-text text-7xl font-black leading-none tracking-tight text-transparent">
                        {sampleScore}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold">
                      {Math.round(confidenceLevel)}%
                    </div>
                  </div>
                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
                    <div
                      className="h-full animate-bar-fill rounded-full bg-gradient-to-r from-primary-400 to-accent-300"
                      style={{ width: `${sampleScore}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/70">{text.scoreMeta}</p>
                </div>

                <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
                    {language === "zh" ? "你的 LifeScore 类型" : "Your LifeScore type"}
                  </p>
                  <p className="mt-2 text-2xl font-black text-primary-950">
                    {text.previewType}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-white/75 p-3">
                      <p className="text-xs font-bold text-ink-faint">{text.previewSignal}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-ink-soft">
                        {text.previewSignalBody}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/75 p-3">
                      <p className="text-xs font-bold text-ink-faint">{text.previewFocus}</p>
                      <p className="mt-1 text-sm font-semibold leading-6 text-ink-soft">
                        {text.previewFocusBody}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {text.route.map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-black text-primary-800">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-ink-soft">{item}</span>
                      </div>
                      <span className="text-xs text-ink-faint">
                        {text.routeStatus[index]}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-dashed border-line bg-white/70 px-4 py-3 text-sm font-bold text-ink">
                  {text.previewShare}
                </div>
              </div>
            </section>
          </main>
          <footer className="pb-4">
            <LegalLinks />
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-10 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
              {text.brand}
            </p>
            <h1 className="text-base font-black text-ink sm:text-lg">
              {t.questionnaire.title}
            </h1>
          </div>
          <LanguageSwitch />
        </div>
      </header>

      <main className="mx-auto grid max-w-4xl gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
        <section className="min-w-0">
          <div className="mb-4 rounded-lg border border-line bg-white/80 p-4">
            <ProgressBar
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              confidenceLevel={confidenceLevel}
            />
          </div>

          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-ink">
                {quizStepTitles[language][currentStep]}
              </h2>
            </div>
            {displayOptional && (
              <span className="rounded-full bg-accent-100 px-3 py-1 text-xs font-bold text-accent-800">
                {t.questionnaire.optional}
              </span>
            )}
          </div>

          <div className="mb-5 rounded-lg border border-line bg-white/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
              {text.whyTitle}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {text.stepWhy[currentStep]}
            </p>
          </div>

          <div className="card">
            <StepComponent data={data} onChange={updateField} />
          </div>

          {isCoreCompleteStep && (
            <div className="mt-5 rounded-lg border border-primary-200 bg-primary-50 p-4">
              <p className="text-sm font-black text-primary-950">{text.coreCompleteTitle}</p>
              <p className="mt-2 text-sm leading-6 text-primary-700">
                {text.coreCompleteBody}
              </p>
            </div>
          )}

          {(isCoreCompleteStep || isLastStep) && (
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white/80 p-4">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => {
                  setConsented(e.target.checked);
                  if (e.target.checked) setError(null);
                }}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary-800"
              />
              <span className="text-sm leading-6 text-ink-soft">
                {text.consentPrefix}
                <Link to="/privacy" target="_blank" className="font-semibold text-primary-800 underline">
                  {text.consentPrivacy}
                </Link>
                {text.consentAnd}
                <Link to="/disclaimer" target="_blank" className="font-semibold text-primary-800 underline">
                  {text.consentDisclaimer}
                </Link>
                {text.consentSuffix}
              </span>
            </label>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button onClick={handlePrev} className="btn-secondary">
              {currentStep === 0 ? t.nav.home : t.questionnaire.prev}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              {isCoreCompleteStep && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary bg-primary-800 hover:bg-primary-900"
                >
                  {submitting ? t.questionnaire.submitting : text.generateNow}
                </button>
              )}
              {isLastStep ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn-primary bg-primary-800 hover:bg-primary-900"
                >
                  {submitting ? t.questionnaire.submitting : t.questionnaire.submit}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className={
                    isCoreCompleteStep
                      ? "rounded-xl border border-primary-300 bg-white px-6 py-3 font-semibold text-primary-800 shadow-card transition-all duration-200 hover:bg-primary-50 active:bg-primary-100"
                      : "btn-primary"
                  }
                >
                  {isCoreCompleteStep ? text.continueBoosters : t.questionnaire.next}
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-card border border-line bg-white p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
              {t.questionnaire.confidence}
            </p>
            <p className="mt-3 text-4xl font-black text-ink">
              {Math.round(confidenceLevel)}%
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-faint">{text.stepHint}</p>
            {isCoreCompleteStep && (
              <div className="mt-5 rounded-lg bg-primary-50 p-4 text-sm font-semibold leading-6 text-primary-800">
                {text.coreCompleteTitle}
              </div>
            )}
            {displayOptional && !isCoreCompleteStep && (
              <div className="mt-5 rounded-lg bg-primary-50 p-4 text-sm leading-6 text-primary-800">
                {text.boosterNote}
              </div>
            )}
            {isLastStep && (
              <div className="mt-5 rounded-lg bg-accent-50 p-4 text-sm font-semibold text-accent-900">
                {t.questionnaire.submitConfirmDesc}
              </div>
            )}
          </div>
        </aside>
      </main>
      <footer className="mx-auto max-w-4xl px-4 pb-6">
        <LegalLinks compact />
      </footer>
    </div>
  );
}
