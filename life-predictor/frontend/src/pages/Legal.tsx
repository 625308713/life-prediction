import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import LanguageSwitch from "../components/LanguageSwitch";
import LegalLinks from "../components/LegalLinks";
import { setPageSeo } from "../utils/seo";
import type { Language } from "../types";

type PageKey = "privacy" | "disclaimer" | "advertising";

type Section = {
  title: string;
  body: string[];
};

type LegalCopy = {
  navHome: string;
  updated: string;
  pages: Record<
    PageKey,
    {
      eyebrow: string;
      title: string;
      intro: string;
      sections: Section[];
    }
  >;
};

const copy: Record<Language, LegalCopy> = {
  zh: {
    navHome: "返回首页",
    updated: "最近更新：2026 年 6 月 12 日",
    pages: {
      privacy: {
        eyebrow: "Privacy",
        title: "隐私政策",
        intro:
          "LifeScore 会收集你主动填写的问卷信息，用来生成健康寿命画像。我们把这类信息视为敏感健康相关信息处理。",
        sections: [
          {
            title: "我们会收集什么",
            body: [
              "基础画像：年龄、性别、身高、体重、腰围、主要居住地区。",
              "健康信号：慢病、血压、血糖、胆固醇、体检和筛查状态等你主动填写的信息。",
              "生活方式：运动、久坐、烟酒、睡眠、饮食、压力、社会连接和环境暴露。",
              "技术信息：为了运行网站，服务器和托管平台可能记录访问时间、浏览器、设备、IP 地址和错误日志。",
            ],
          },
          {
            title: "我们如何使用这些信息",
            body: [
              "生成你的 LifeScore、风险/优势解释、行动建议和结果分享页。",
              "改进问卷、算法、页面体验和产品稳定性。",
              "排查错误、防滥用、保护服务安全。",
              "在你明确同意或主动使用相关功能时，才会把结果用于更完整的个性化分析。",
            ],
          },
          {
            title: "草稿、本地保存和服务器保存",
            body: [
              "问卷草稿会保存在你当前浏览器的 localStorage 中，方便你继续填写；清除浏览器数据会删除这些草稿。",
              "提交问卷后，结果和必要的问卷字段会保存到服务器数据库，用于展示结果页和后台统计。",
              "上线前应配置正式的数据保留期限、删除流程和用户联系邮箱。",
            ],
          },
          {
            title: "AI 与第三方服务",
            body: [
              "提交问卷需要你勾选同意。只有在你同意后，系统才会生成结果并（在启用 AI 时）请求 AI 个性化解读。",
              "如果启用 AI 个性化分析，系统会把你的结果摘要和问卷中参与计算的字段（白名单）发送给配置的 OpenAI 兼容模型服务；未参与计算的字段不会发送。",
              "AI 服务方仅用于生成本次报告文本；我们不会把你的答案出售给模型服务方或其他第三方。",
              "未配置 AI 模型时，基础报告仍可使用，不会向任何外部模型服务发送问卷数据。",
              "支付、广告、统计、错误监控等第三方服务上线前应在本政策中补充列明。",
            ],
          },
          {
            title: "广告和敏感信息",
            body: [
              "LifeScore 不应把个人健康答案出售给广告商。",
              "健康工具推荐位应保持低干扰展示，并清楚标识合作或赞助关系。",
              "除非获得明确同意，不应基于个人疾病、血压、血糖等敏感答案做定向广告。",
            ],
          },
          {
            title: "你的选择",
            body: [
              "你可以不填写选填项，也可以关闭页面放弃提交。",
              "提交前，你可以返回修改答案；提交后，如需删除数据，上线版本应提供联系邮箱或账户内删除入口。",
              "本产品不面向 18 岁以下用户。",
            ],
          },
        ],
      },
      disclaimer: {
        eyebrow: "Safety",
        title: "免责声明",
        intro:
          "LifeScore 是健康教育和自我观察工具，不是医疗器械，也不提供诊断、治疗或个体化医疗决策。",
        sections: [
          {
            title: "不是医疗建议",
            body: [
              "结果基于自填问卷和统计规则，只能作为健康教育参考。",
              "LifeScore 不建立医生与患者关系，也不能替代医生、营养师、心理咨询师或其他专业人员。",
              "不要因为本产品结果而自行停药、改药、延迟就医或忽视症状。",
            ],
          },
          {
            title: "什么时候应该咨询医生",
            body: [
              "如果你有持续胸痛、呼吸困难、昏厥、突发肢体无力、严重过敏反应等紧急情况，请立即联系当地急救服务。",
              "如果结果涉及高血压、糖尿病、癌症史、快速体重变化、睡眠呼吸暂停或长期不适，请优先咨询医生。",
              "如果你正在怀孕、接受治疗、服用长期药物或有复杂病史，请把 LifeScore 当作讨论材料，而不是决策依据。",
            ],
          },
          {
            title: "结果可能不准确",
            body: [
              "自填信息可能有记忆误差、理解差异或测量误差。",
              "寿命区间、健康寿命、百分位和潜在收益都是概率估计，不代表确定结果。",
              "算法没有覆盖所有基因、医疗、社会、地区和突发事件因素。",
            ],
          },
        ],
      },
      advertising: {
        eyebrow: "Commercial",
        title: "推荐与广告说明",
        intro:
          "LifeScore 未来可能通过健康工具推荐、品牌合作或广告获得收入。我们的原则是低干扰、清楚标识、不制造焦虑。",
        sections: [
          {
            title: "我们可能展示什么",
            body: [
              "体检、运动、睡眠、营养、健康教育等与用户目标相关的工具或服务。",
              "普通展示广告、赞助内容、联盟链接或合作推荐。",
              "所有合作内容都应以“合作推荐”“赞助”或类似方式清楚标识。",
            ],
          },
          {
            title: "我们不会做什么",
            body: [
              "不把广告写成医学诊断或疗效承诺。",
              "不暗示某个产品可以保证延寿、治愈疾病或替代医生。",
              "不以恐吓、羞辱或制造焦虑的方式推动购买。",
              "不应在没有明确同意的情况下，使用个人敏感健康答案做定向广告。",
            ],
          },
          {
            title: "推荐不等于背书",
            body: [
              "合作推荐可能带来收入，但不代表 LifeScore 对效果做保证。",
              "用户在购买任何健康服务前，应自行查看服务条款、资质、价格和风险。",
              "涉及诊断、治疗、药物、补剂或医疗服务时，应优先咨询专业人士。",
            ],
          },
        ],
      },
    },
  },
  en: {
    navHome: "Back home",
    updated: "Last updated: June 12, 2026",
    pages: {
      privacy: {
        eyebrow: "Privacy",
        title: "Privacy Policy",
        intro:
          "LifeScore collects questionnaire information that you choose to provide to generate a health-span profile. We treat this as sensitive health-related information.",
        sections: [
          {
            title: "What we collect",
            body: [
              "Profile inputs: age, sex, height, weight, waist size, and primary region.",
              "Health signals: diagnosed conditions, blood pressure, glucose, cholesterol, checkup and screening status, and other fields you choose to answer.",
              "Lifestyle inputs: activity, sitting, smoking, alcohol, sleep, food patterns, stress, social connection, and environmental exposure.",
              "Technical data: to run the site, hosting systems may log request time, browser, device, IP address, and error logs.",
            ],
          },
          {
            title: "How we use information",
            body: [
              "To generate your LifeScore, risk and strength explanations, action suggestions, and result page.",
              "To improve the questionnaire, algorithm, page experience, and reliability.",
              "To debug errors, prevent abuse, and protect the service.",
              "Only with the relevant feature enabled or your clear action do we use your result for fuller personalized analysis.",
            ],
          },
          {
            title: "Drafts and server storage",
            body: [
              "Questionnaire drafts are stored in your browser localStorage so you can continue later. Clearing browser data removes these drafts.",
              "After submission, result data and necessary questionnaire fields are stored in the server database to show the result page and aggregate admin stats.",
              "Before public launch, configure a real data retention period, deletion process, and user contact email.",
            ],
          },
          {
            title: "AI and third-party services",
            body: [
              "Submitting the questionnaire requires checking a consent box. Only after you consent does the system generate a result and (when AI is enabled) request an AI interpretation.",
              "If AI analysis is enabled, the system sends your result summary and only the allow-listed questionnaire fields used by the scoring algorithm to the configured OpenAI-compatible model provider. Fields not used in scoring are never sent.",
              "The AI provider is used only to generate this report text. We do not sell your answers to the model provider or any other third party.",
              "If AI is not configured, the core report still works and no questionnaire data is sent to any external model service.",
              "Payment, advertising, analytics, and error-monitoring services should be listed here before launch if added.",
            ],
          },
          {
            title: "Ads and sensitive information",
            body: [
              "LifeScore should not sell individual health answers to advertisers.",
              "Health tool recommendations should stay low-distraction and clearly identify sponsored or partner relationships.",
              "Unless there is clear consent, personal disease, blood pressure, glucose, or similar sensitive answers should not be used for targeted advertising.",
            ],
          },
          {
            title: "Your choices",
            body: [
              "You can skip optional questions or leave without submitting.",
              "Before submitting, you can go back and edit answers. After submission, the public version should provide a contact email or account deletion flow.",
              "This product is not intended for users under 18.",
            ],
          },
        ],
      },
      disclaimer: {
        eyebrow: "Safety",
        title: "Disclaimer",
        intro:
          "LifeScore is a health education and self-reflection tool. It is not a medical device and does not provide diagnosis, treatment, or individual medical decisions.",
        sections: [
          {
            title: "Not medical advice",
            body: [
              "Results are based on self-reported questionnaire answers and statistical rules. They are educational only.",
              "LifeScore does not create a doctor-patient relationship and does not replace clinicians, dietitians, therapists, or other professionals.",
              "Do not stop medication, change medication, delay care, or ignore symptoms because of a LifeScore result.",
            ],
          },
          {
            title: "When to seek care",
            body: [
              "For emergencies such as ongoing chest pain, trouble breathing, fainting, sudden weakness, or severe allergic reactions, contact local emergency services immediately.",
              "If your result involves high blood pressure, diabetes, cancer history, rapid weight change, possible sleep apnea, or persistent symptoms, talk with a clinician first.",
              "If you are pregnant, in treatment, taking long-term medication, or have complex medical history, use LifeScore as discussion material, not a decision rule.",
            ],
          },
          {
            title: "Results may be inaccurate",
            body: [
              "Self-reported answers can include memory, interpretation, and measurement errors.",
              "Lifespan ranges, health-span estimates, percentiles, and potential gains are probability estimates, not certainties.",
              "The algorithm does not cover every genetic, medical, social, regional, or unexpected life event factor.",
            ],
          },
        ],
      },
      advertising: {
        eyebrow: "Commercial",
        title: "Recommendations & Advertising",
        intro:
          "LifeScore may earn revenue through health tool recommendations, brand partnerships, or advertising. Our principles are low distraction, clear labeling, and no fear-based selling.",
        sections: [
          {
            title: "What may appear",
            body: [
              "Tools or services related to checkups, movement, sleep, nutrition, or health education.",
              "Display ads, sponsored content, affiliate links, or partner recommendations.",
              "Partner content should be clearly labeled as sponsored, partner, or similar wording.",
            ],
          },
          {
            title: "What we should not do",
            body: [
              "No ad should look like a medical diagnosis or treatment promise.",
              "No recommendation should imply guaranteed longevity, disease cure, or replacement for a clinician.",
              "We should not push purchases through fear, shame, or anxiety.",
              "Without clear consent, sensitive personal health answers should not be used for targeted advertising.",
            ],
          },
          {
            title: "Recommendations are not guarantees",
            body: [
              "Partner recommendations may generate revenue, but LifeScore does not guarantee outcomes.",
              "Before buying a health service, users should review terms, credentials, price, and risks.",
              "For diagnosis, treatment, medication, supplements, or medical services, professional advice comes first.",
            ],
          },
        ],
      },
    },
  },
};

function getPageKey(pathname: string): PageKey {
  if (pathname.includes("disclaimer")) return "disclaimer";
  if (pathname.includes("advertising")) return "advertising";
  return "privacy";
}

export default function Legal() {
  const { language } = useLanguage();
  const location = useLocation();
  const pageKey = getPageKey(location.pathname);
  const text = copy[language];
  const page = text.pages[pageKey];

  useEffect(() => {
    setPageSeo({
      title: `${page.title} | LifeScore`,
      description: page.intro,
      path: location.pathname,
    });
  }, [location.pathname, page.intro, page.title]);

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-line bg-surface/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3">
          <Link to="/" className="text-sm font-black text-ink">
            LifeScore
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="btn-secondary px-3 py-1.5 text-sm">
              {text.navHome}
            </Link>
            <LanguageSwitch />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="card-dark p-6 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-100">
            {page.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
            {page.title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75">{page.intro}</p>
          <p className="mt-5 text-xs text-white/50">{text.updated}</p>
        </section>

        <section className="mt-6 space-y-4">
          {page.sections.map((section) => (
            <article key={section.title} className="rounded-lg border border-line bg-white p-5">
              <h2 className="text-xl font-black text-ink">{section.title}</h2>
              <div className="mt-4 space-y-3">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-ink-soft">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </section>

        <div className="mt-8 rounded-lg border border-dashed border-line bg-white/60 p-4">
          <LegalLinks />
        </div>
      </main>
    </div>
  );
}
