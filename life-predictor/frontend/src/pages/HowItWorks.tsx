import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSwitch from "../components/LanguageSwitch";
import LegalLinks from "../components/LegalLinks";
import { setPageSeo } from "../utils/seo";
import type { Language } from "../types";

type MethodStep = {
  label: string;
  title: string;
  body: string;
};

type Reference = {
  title: string;
  href: string;
};

type PageCopy = {
  navHome: string;
  updated: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  intro: string;
  startQuiz: string;
  snapshotTitle: string;
  snapshot: { label: string; value: string }[];
  methodTitle: string;
  methodIntro: string;
  methodSteps: MethodStep[];
  signalTitle: string;
  signalIntro: string;
  signals: string[];
  scoreTitle: string;
  scoreIntro: string;
  scoreParts: { label: string; body: string; width: string }[];
  limitsTitle: string;
  limits: string[];
  referencesTitle: string;
  referencesIntro: string;
  references: Reference[];
  closingTitle: string;
  closingBody: string;
};

const copy: Record<Language, PageCopy> = {
  zh: {
    navHome: "返回首页",
    updated: "最近更新：2026 年 6 月 7 日",
    metaTitle: "LifeScore 如何计算 | 健康寿命评分说明",
    metaDescription:
      "了解 LifeScore 如何把健康信号、结果区间、可信度和行动优先级整理成一张健康寿命评分卡。",
    eyebrow: "Score Method",
    title: "LifeScore 是怎样计算的？",
    intro:
      "LifeScore 不是算命，也不是诊断。它把你主动填写的健康信号整理成一张轻量的健康寿命画像：看见优势，找到优先风险，再给出下一步行动。",
    startQuiz: "开始测 LifeScore",
    snapshotTitle: "先理解 4 个结果概念",
    snapshot: [
      { label: "LifeScore", value: "综合分数，用来快速理解整体状态" },
      { label: "结果区间", value: "围绕点估计给出的教育性不确定范围" },
      { label: "可信度", value: "答案完整度，不等于医学确定性" },
      { label: "行动优先级", value: "先处理影响更大的可改变信号" },
    ],
    methodTitle: "计算逻辑",
    methodIntro:
      "当前版本使用启发式加权模型。它适合做大众健康教育和自我观察，不适合做临床诊断或保险定价。",
    methodSteps: [
      {
        label: "01",
        title: "建立基础参照",
        body:
          "系统先用性别建立一个简单基线。这个基线只是参照点，后续会逐步加入问卷中的健康信号。",
      },
      {
        label: "02",
        title: "叠加健康信号",
        body:
          "血压、血糖、腰围、运动、睡眠、吸烟、饮酒、压力、社交连接、筛查和环境暴露等信号会增加或减少调整值。",
      },
      {
        label: "03",
        title: "生成区间和可信度",
        body:
          "结果会显示为区间，而不是单一确定数字。知道得越多，报告越具体；不知道的项目不会被当作健康答案处理。",
      },
      {
        label: "04",
        title: "排序优势和风险",
        body:
          "系统会把影响较大的优势和风险排在前面，并把它们转换成更容易记住的 LifeScore 类型和行动建议。",
      },
    ],
    signalTitle: "哪些信号会影响结果",
    signalIntro:
      "问题不是越多越好，而是要覆盖高信号、普通用户能回答、并且有行动价值的维度。",
    signals: [
      "基础画像：年龄、性别、身高、体重、腰围、地区",
      "健康信号：慢性病、血压、血糖、胆固醇、体检和筛查",
      "生活方式：运动、久坐、吸烟、饮酒、睡眠、饮食",
      "恢复与心理社会：压力、社交连接、目标感、睡眠质量",
      "可选增强：化验数字、功能体能、家族史、医疗可及性、环境暴露",
    ],
    scoreTitle: "LifeScore 更像一张优先级地图",
    scoreIntro:
      "我们不希望用户只盯着一个数字。更重要的是知道自己已经做对了什么，以及下一步最值得改什么。",
    scoreParts: [
      {
        label: "健康信号",
        body: "根据问卷输入形成基础风险和保护因素",
        width: "92%",
      },
      {
        label: "同类参照",
        body: "把调整后的结果和简单基线做相对比较",
        width: "72%",
      },
      {
        label: "可信度",
        body: "根据核心问题和可选增强问题的完整度校准解释口径",
        width: "64%",
      },
    ],
    limitsTitle: "重要边界",
    limits: [
      "LifeScore 结果用于健康教育和自我观察，不提供诊断、治疗或用药建议。",
      "当前权重是产品启发式模型，还没有用长期队列数据做正式校准。",
      "地区、年龄、疾病严重程度、用药控制情况、遗传和突发事件都可能影响真实风险。",
      "如果你看到高血压、糖尿病、睡眠呼吸暂停、癌症史、快速体重变化等信号，请优先咨询专业人士。",
    ],
    referencesTitle: "公开健康参考",
    referencesIntro:
      "问卷阈值和解释口径会尽量贴近普通用户能读懂的公共健康资料。",
    references: [
      {
        title: "WHO: Physical activity",
        href: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
      },
      {
        title: "CDC: Sleep and health",
        href: "https://www.cdc.gov/sleep/about/index.html",
      },
      {
        title: "American Heart Association: Blood pressure readings",
        href: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
      },
      {
        title: "CDC: Diabetes testing",
        href: "https://www.cdc.gov/diabetes/diabetes-testing/index.html",
      },
    ],
    closingTitle: "读结果时，先看下一步",
    closingBody:
      "真正有价值的不是预测一个固定终点，而是找到现在最值得投入的一两个动作。LifeScore 的目标是让用户少一点焦虑，多一点可执行的方向。",
  },
  en: {
    navHome: "Back home",
    updated: "Last updated: June 7, 2026",
    metaTitle: "How LifeScore Works | Health-Span Score Method",
    metaDescription:
      "Learn how LifeScore turns health signals, result ranges, confidence, and action priorities into a lightweight health-span scorecard.",
    eyebrow: "Score Method",
    title: "How LifeScore works",
    intro:
      "LifeScore is not fortune-telling and not a diagnosis. It organizes the health signals you choose to answer into a lightweight health-span profile: strengths, priority risks, and practical next steps.",
    startQuiz: "Start LifeScore",
    snapshotTitle: "Four result ideas to know first",
    snapshot: [
      { label: "LifeScore", value: "A summary score for reading the overall profile quickly" },
      { label: "Result range", value: "An educational uncertainty range around the point estimate" },
      { label: "Confidence", value: "Answer completeness, not medical certainty" },
      { label: "Action priority", value: "The changeable signals worth addressing first" },
    ],
    methodTitle: "Calculation logic",
    methodIntro:
      "The current version uses a heuristic weighted model. It is useful for consumer health education and self-reflection, not for diagnosis or insurance pricing.",
    methodSteps: [
      {
        label: "01",
        title: "Set a simple baseline",
        body:
          "The system starts with a simple sex-based baseline. This is only a reference point before questionnaire signals are added.",
      },
      {
        label: "02",
        title: "Add health signals",
        body:
          "Blood pressure, glucose, waist size, activity, sleep, smoking, alcohol, stress, social connection, screening, and exposure signals add or subtract adjustment weight.",
      },
      {
        label: "03",
        title: "Show range and confidence",
        body:
          "Results are shown as a range, not a fixed certainty. More known inputs make the report sharper; unknown answers are not treated as healthy answers.",
      },
      {
        label: "04",
        title: "Rank strengths and risks",
        body:
          "The largest protective and risk signals rise to the top, then become a memorable LifeScore type and action guidance.",
      },
    ],
    signalTitle: "What affects the result",
    signalIntro:
      "The goal is not asking endless questions. The goal is covering signals that are meaningful, answerable, and useful for action.",
    signals: [
      "Profile: age, sex, height, weight, waist, region",
      "Health signals: chronic conditions, blood pressure, glucose, cholesterol, checkups and screening",
      "Lifestyle: activity, sitting, smoking, alcohol, sleep, food pattern",
      "Recovery and social health: stress, connection, purpose, sleep quality",
      "Optional boosters: lab numbers, functional fitness, family history, healthcare access, environment",
    ],
    scoreTitle: "LifeScore is more like a priority map",
    scoreIntro:
      "We do not want users staring at one number. The more useful question is what is already working and what deserves attention next.",
    scoreParts: [
      {
        label: "Health signals",
        body: "Questionnaire inputs become risk and protective factors",
        width: "92%",
      },
      {
        label: "Peer reference",
        body: "Adjusted estimates are compared with a simple baseline",
        width: "72%",
      },
      {
        label: "Confidence",
        body: "Completeness controls how specific the explanation should be",
        width: "64%",
      },
    ],
    limitsTitle: "Important boundaries",
    limits: [
      "LifeScore is for health education and self-reflection. It does not provide diagnosis, treatment, or medication advice.",
      "Current weights are product heuristics and have not been formally calibrated with longitudinal cohort data.",
      "Region, age, disease severity, medication control, genetics, and unexpected events can all change real-world risk.",
      "For signals involving high blood pressure, diabetes, possible sleep apnea, cancer history, rapid weight change, or persistent symptoms, talk with a professional first.",
    ],
    referencesTitle: "Public health references",
    referencesIntro:
      "Question thresholds and explanations aim to stay close to public health sources that everyday users can read.",
    references: [
      {
        title: "WHO: Physical activity",
        href: "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
      },
      {
        title: "CDC: Sleep and health",
        href: "https://www.cdc.gov/sleep/about/index.html",
      },
      {
        title: "American Heart Association: Blood pressure readings",
        href: "https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings",
      },
      {
        title: "CDC: Diabetes testing",
        href: "https://www.cdc.gov/diabetes/diabetes-testing/index.html",
      },
    ],
    closingTitle: "When reading a result, look for the next step",
    closingBody:
      "The value is not predicting a fixed endpoint. It is finding one or two moves worth doing now. LifeScore is meant to reduce anxiety and make the next healthy action easier to see.",
  },
};

export default function HowItWorks() {
  const { language } = useLanguage();
  const text = copy[language];

  useEffect(() => {
    setPageSeo({
      title: text.metaTitle,
      description: text.metaDescription,
      path: "/how-it-works",
    });
  }, [text.metaDescription, text.metaTitle]);

  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-800 text-sm font-semibold text-white">
              LS
            </span>
            <span className="text-sm font-semibold text-ink">LifeScore</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-secondary px-3 py-1.5 text-sm">
              {text.navHome}
            </Link>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-line bg-ink px-4 py-12 text-white sm:py-16">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-100">
                {text.eyebrow}
              </p>
              <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
                {text.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/75">
                {text.intro}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-black/10 hover:bg-primary-50"
                >
                  {text.startQuiz}
                </Link>
                <span className="text-xs font-semibold text-white/50">{text.updated}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {text.snapshot.map((item) => (
                <article
                  key={item.label}
                  className="rounded-lg border border-white/12 bg-white/8 p-4"
                >
                  <p className="text-sm font-semibold text-primary-100">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.value}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
              Method
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">{text.methodTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{text.methodIntro}</p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {text.methodSteps.map((step) => (
              <article key={step.label} className="rounded-lg border border-line bg-white p-5">
                <p className="text-xs font-semibold text-accent-700">{step.label}</p>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink-soft">{step.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-surface px-4 py-10 sm:py-12">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
                Signals
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal">{text.signalTitle}</h2>
              <p className="mt-4 text-sm leading-7 text-ink-soft">{text.signalIntro}</p>
            </div>
            <div className="grid gap-3">
              {text.signals.map((signal, index) => (
                <div
                  key={signal}
                  className="flex gap-4 rounded-lg border border-line bg-white px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-800">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold leading-6 text-ink-soft">{signal}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:py-12 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
              Score
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal">{text.scoreTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-ink-soft">{text.scoreIntro}</p>
          </div>
          <div className="space-y-4">
            {text.scoreParts.map((part) => (
              <article key={part.label} className="rounded-lg border border-line bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold">{part.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-soft">{part.body}</p>
                  </div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary-100">
                  <div className="h-full rounded-full bg-accent-400" style={{ width: part.width }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-line bg-ink px-4 py-10 text-white sm:py-12">
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-100">
                Boundaries
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal">{text.limitsTitle}</h2>
            </div>
            <div className="grid gap-3">
              {text.limits.map((limit) => (
                <p
                  key={limit}
                  className="rounded-lg border border-white/12 bg-white/8 px-4 py-3 text-sm leading-7 text-white/75"
                >
                  {limit}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
                References
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal">
                {text.referencesTitle}
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink-soft">{text.referencesIntro}</p>
            </div>
            <div className="grid gap-3">
              {text.references.map((reference) => (
                <a
                  key={reference.href}
                  href={reference.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-bold text-primary-800 hover:border-primary-300 hover:bg-primary-50"
                >
                  {reference.title}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 rounded-lg border border-line bg-white p-6">
            <h2 className="text-2xl font-semibold">{text.closingTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft">{text.closingBody}</p>
          </div>

          <div className="mt-8 rounded-lg border border-dashed border-line bg-white/60 p-4">
            <LegalLinks />
          </div>
        </section>
      </main>
    </div>
  );
}
