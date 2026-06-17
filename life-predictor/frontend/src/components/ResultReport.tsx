import { useMemo, useState, useEffect } from "react";
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
import { Link } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
import { getPrediction, submitLead as submitLeadApi } from "../utils/api";
import { track } from "../utils/analytics";
import type { Language, PredictionResult } from "../types";

interface Props {
  result: PredictionResult;
  predictionId: string;
}

const copy = {
  zh: {
    brand: "LifeScore",
    eyebrow: "你的健康寿命画像",
    scoreLabel: "健康寿命分数",
    rangeLabel: "寿命区间估计",
    rangeNote: "这是基于问卷的概率估计，不是医学诊断。",
    betterThan: "同龄同性别人群百分位",
    healthyYears: "健康寿命",
    confidence: "结果可信度",
    potential: "优先处理前三项风险，理论改善空间约",
    years: "年",
    profileTitle: "你的结果读法",
    profileHigh: "你的健康寿命画像整体不错，重点是把已有优势继续稳定下来。",
    profileMid: "你的结果处在可塑区间，少数关键习惯会明显影响后续分数。",
    profileLow: "你的结果提示需要优先处理几个高影响风险，先从最小的一步开始。",
    strongest: "当前优势",
    firstPriority: "优先关注",
    archetypeEyebrow: "你的 LifeScore 类型",
    archetypeSignal: "关键线索",
    archetypeFocus: "本周重点",
    methodTitle: "分数怎么来的",
    methodDesc:
      "LifeScore 不是在预测一个确定日期，而是把问卷里的健康信号整理成一张可行动的优先级地图。",
    methodSignalsTitle: "健康信号",
    methodSignalsBody: "年龄、身体指标、生活方式、睡眠、压力、预防筛查和环境暴露会一起影响结果。",
    methodCompareTitle: "同龄比较",
    methodCompareBody: "百分位帮助你理解自己相对同龄同性别人群的大致位置，而不是给出绝对排名。",
    methodConfidenceTitle: "可信度",
    methodConfidenceBody: "填写的高信号信息越完整，结果越稳定；不知道的化验值可以跳过，不会被当成健康答案。",
    methodPriorityTitle: "行动优先级",
    methodPriorityBody: "系统优先展示更可改变、影响更大的风险，并保留你已经做对的优势。",
    strengthsIntro: "这些是你已经做对的事。",
    risksIntro: "这些是最值得优先关注的习惯或信号。",
    whyLabel: "为什么重要",
    tryLabel: "先试这个",
    keepLabel: "继续保持",
    actionTitle: "接下来 7 天可以先做的 3 件事",
    actionIntro: "不用立刻改变人生，先完成一个能重复的小挑战。",
    action1: "选一个风险因素，只做一个足够小的改变，例如每天多走 15 分钟或提前 20 分钟睡觉。",
    action2: "把最强的长寿优势保留下来，不要为了激进改变打乱已经稳定的好习惯。",
    action3: "如果结果涉及血压、血糖、体重快速变化或长期不适，请优先咨询医生。",
    challengeTitle: "7 天 LifeScore 小挑战",
    challengeSubtitle: "选一个动作，连续 7 天做完，比一次性下狠心更有用。",
    challengeHabit: "核心动作",
    challengeProof: "打卡方式",
    challengeProtect: "保留优势",
    challengeShare: "复制挑战文案",
    chartTitle: "维度画像",
    aiTitle: "个性化分析",
    aiLoading: "正在生成更完整的个性化分析...",
    aiDisabled:
      "你看到的已经是完整的规则化结果。当前部署没有开启 AI 深度解读，开启后这里会出现更个性化的文字分析。",
    aiFailed: "个性化分析暂时没有生成成功，基础结果不受影响。",
    shareTitle: "分享这张结果卡",
    shareDesc: "复制一段带结果亮点的分享文案，让朋友也测一测自己的 LifeScore。",
    copy: "复制分享文案",
    copied: "已复制",
    downloadPoster: "下载分享卡",
    posterPreview: "分享卡预览",
    posterTitle: "健康寿命结果卡",
    posterSubtitle: "轻量自测，不是医学诊断",
    posterCta: "测测你的 LifeScore",
    posterFootnote: "结果用于健康教育和自我观察",
    sharePrefix: "我的 LifeScore 是",
    shareStrength: "当前优势",
    shareRisk: "优先关注",
    shareCta: "你也可以测一下",
    disclaimer:
      "LifeScore 用于健康教育和自我观察，不用于诊断、治疗或替代专业医疗建议。",
    adLabel: "健康工具推荐位",
    adBody: "这里会展示与体检、运动、睡眠或营养相关的低干扰推荐。",
    healthAgeLabel: "你的健康年龄",
    healthAgeUnit: "岁",
    youngerBy: "比实际年龄年轻 {n} 岁",
    olderBy: "比实际年龄大 {n} 岁",
    sameAge: "和实际年龄持平",
    healthAgeNote: "健康年龄反映习惯信号的综合方向，不是医学测量。",
    compareLast: "上次",
    compareThis: "这次",
    compareDaysAgo: "{n} 天前",
    unlockTitle: "解锁完整 AI 深度解读",
    unlockDesc:
      "留下邮箱即可解锁针对你作答的 AI 深度解读，并保存这份结果的找回链接。只用于结果相关通知，可随时联系删除。",
    unlockPlaceholder: "你的邮箱",
    unlockButton: "解锁完整解读",
    unlockSubmitting: "解锁中...",
    unlockError: "请输入有效的邮箱地址",
    unlockFailed: "提交失败，请稍后重试",
    subscribeTitle: "保存结果，接收复测提醒",
    subscribeDesc:
      "留下邮箱保存这份结果的找回链接；复测提醒功能上线后你会第一时间收到。",
    subscribeButton: "保存我的结果",
    subscribed: "已保存，邮箱已记录。",
    trackerTitle: "7 天打卡",
    trackerHint: "每完成一天就点亮一格，连续比强度更重要。",
    trackerDay: "第 {n} 天",
    trackerProgress: "已完成 {done}/7 天",
    trackerComplete: "7 天完成！习惯已经开始成形——90 天后回来复测，看看分数变化。",
    noRiskYet: "暂无高优先级风险",
    noStrengthYet: "暂无特别突出的优势，先把基础稳住",
    medicalBannerTitle: "建议尽快线下评估",
    medicalBannerBody: "你的回答里有需要专业判断的信号（如血压/血糖偏高、长期不适或体重明显变化）。请把结果当作提醒，尽快安排体检或咨询医生，不要仅凭本页结论自行处理。",
    rangeYoungNote: "你还年轻，这个区间只是当前习惯的粗略外推，可塑性很高，真正该看的是健康年龄和可改善空间。",
    unlockBenefit: "解锁后你会看到：针对你具体作答的个性化解读、最该优先改善的 3 件事的展开说明，以及结果找回链接。",
    dimensionBarsTitle: "各维度得分",
    unknownDataHint: "你有一些关键健康信息选择了“不知道”。补充血压、血糖或体检数据后，分数和可信度会更准。",
  },
  en: {
    brand: "LifeScore",
    eyebrow: "Your health-span profile",
    scoreLabel: "Health-span score",
    rangeLabel: "Estimated lifespan range",
    rangeNote: "A questionnaire-based probability estimate, not a medical diagnosis.",
    betterThan: "Peer percentile",
    healthyYears: "Healthy lifespan",
    confidence: "Confidence",
    potential: "Addressing top risks may unlock up to",
    years: "years",
    profileTitle: "How to read this result",
    profileHigh:
      "Your health-span profile looks strong overall. The main job is keeping the good parts stable.",
    profileMid:
      "Your result is in a flexible zone. A few key habits can move the score meaningfully.",
    profileLow:
      "Your result points to several high-impact risks. Start with the smallest useful change.",
    strongest: "Current strength",
    firstPriority: "First priority",
    archetypeEyebrow: "Your LifeScore type",
    archetypeSignal: "Key signal",
    archetypeFocus: "This week's focus",
    methodTitle: "How the score works",
    methodDesc:
      "LifeScore does not predict a fixed date. It turns questionnaire signals into an actionable priority map.",
    methodSignalsTitle: "Health signals",
    methodSignalsBody: "Age, body metrics, lifestyle, sleep, stress, prevention, and environment signals are considered together.",
    methodCompareTitle: "Peer comparison",
    methodCompareBody: "The percentile helps you read your rough position among similar peers, not an absolute ranking.",
    methodConfidenceTitle: "Confidence",
    methodConfidenceBody: "More high-signal answers make the result steadier. Unknown lab values can be skipped instead of guessed.",
    methodPriorityTitle: "Action priority",
    methodPriorityBody: "The result lifts risks that are more changeable and impactful while keeping your existing strengths visible.",
    strengthsIntro: "These are the things already working in your favor.",
    risksIntro: "These are the habits or signals worth prioritizing first.",
    whyLabel: "Why it matters",
    tryLabel: "Try this first",
    keepLabel: "Keep doing this",
    actionTitle: "3 small moves for the next 7 days",
    actionIntro: "Do not redesign your whole life. Finish one repeatable challenge first.",
    action1:
      "Pick one risk factor and make one small change, like walking 15 more minutes or sleeping 20 minutes earlier.",
    action2:
      "Keep your strongest longevity advantage stable instead of disrupting good habits with drastic changes.",
    action3:
      "If the result touches blood pressure, blood sugar, rapid weight change, or ongoing symptoms, talk with a clinician.",
    challengeTitle: "7-day LifeScore challenge",
    challengeSubtitle: "Choose one move and repeat it for 7 days. Repeatability beats intensity.",
    challengeHabit: "Core move",
    challengeProof: "Proof",
    challengeProtect: "Protect",
    challengeShare: "Copy challenge text",
    chartTitle: "Dimension profile",
    aiTitle: "Personalized analysis",
    aiLoading: "Generating a fuller personalized analysis...",
    aiDisabled:
      "What you see is the complete rule-based result. AI deep-dive analysis is not enabled on this deployment; once enabled, a personalized narrative appears here.",
    aiFailed: "The personalized analysis did not finish, but your core result is unaffected.",
    shareTitle: "Share this result card",
    shareDesc: "Copy a shareable note with your score highlights and invite friends to check their LifeScore.",
    copy: "Copy share text",
    copied: "Copied",
    downloadPoster: "Download card",
    posterPreview: "Card preview",
    posterTitle: "Health-span result card",
    posterSubtitle: "A light self-check, not a diagnosis",
    posterCta: "Check your LifeScore",
    posterFootnote: "For health education and self-reflection",
    sharePrefix: "My LifeScore is",
    shareStrength: "Current strength",
    shareRisk: "First priority",
    shareCta: "Try yours",
    disclaimer:
      "LifeScore is for health education and self-reflection. It is not diagnosis, treatment, or professional medical advice.",
    adLabel: "Health tools",
    adBody: "Low-distraction recommendations for checkups, movement, sleep, or nutrition can appear here.",
    healthAgeLabel: "Your health age",
    healthAgeUnit: "yrs",
    youngerBy: "{n} years younger than your actual age",
    olderBy: "{n} years older than your actual age",
    sameAge: "Same as your actual age",
    healthAgeNote: "Health age reflects the combined direction of your habit signals, not a medical measurement.",
    compareLast: "Last time",
    compareThis: "This time",
    compareDaysAgo: "{n} days ago",
    unlockTitle: "Unlock the full AI deep-dive",
    unlockDesc:
      "Leave your email to unlock the AI interpretation written for your answers, and to save a recovery link for this result. Used only for result-related notices; contact us anytime to delete it.",
    unlockPlaceholder: "Your email",
    unlockButton: "Unlock full analysis",
    unlockSubmitting: "Unlocking...",
    unlockError: "Please enter a valid email address",
    unlockFailed: "Submission failed. Please try again.",
    subscribeTitle: "Save this result & get retest reminders",
    subscribeDesc:
      "Leave your email to save a recovery link for this result. You will be notified when retest reminders launch.",
    subscribeButton: "Save my result",
    subscribed: "Saved. Your email is on file.",
    trackerTitle: "7-day tracker",
    trackerHint: "Light up one cell per completed day. Consistency beats intensity.",
    trackerDay: "Day {n}",
    trackerProgress: "{done}/7 days done",
    trackerComplete: "7 days complete! The habit is taking shape — come back in 90 days to see your score move.",
    noRiskYet: "No high-priority risks yet",
    noStrengthYet: "No standout strengths yet — focus on stabilizing the basics",
    medicalBannerTitle: "Consider an in-person check soon",
    medicalBannerBody: "Some of your answers carry signals that deserve professional judgment (such as high blood pressure or glucose, ongoing discomfort, or notable weight change). Treat this as a prompt to book a checkup or talk with a clinician, not as something to manage from this page alone.",
    rangeYoungNote: "You are still young, so this range is only a rough extrapolation of current habits with high plasticity. What matters more is your health age and room to improve.",
    unlockBenefit: "Once unlocked you will see: a personalized read of your specific answers, an expanded version of your top 3 priorities, and a recovery link for this result.",
    dimensionBarsTitle: "Dimension scores",
    unknownDataHint: "You answered \"don't know\" to some key health items. Adding blood pressure, glucose, or checkup data will make the score and confidence more accurate.",
  },
};

type FactorInsight = {
  why: string;
  action: string;
};

type ChallengeItem = {
  label: string;
  title: string;
  body: string;
};

type ArchetypeKey =
  | "steady_builder"
  | "movement_unlock"
  | "recovery_first"
  | "metabolic_tune"
  | "prevention_catchup"
  | "environment_reset"
  | "substance_reset";

type ArchetypeContent = {
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  signal: string;
  focus: string;
};

type PosterContent = {
  language: Language;
  lifeScore: number;
  scoreLabel: string;
  title: string;
  subtitle: string;
  typeLabel: string;
  archetypeName: string;
  archetypeTagline: string;
  signalLabel: string;
  signal: string;
  focusLabel: string;
  focus: string;
  strengthLabel: string;
  strength: string;
  riskLabel: string;
  risk: string;
  cta: string;
  footnote: string;
  shareHost: string;
};

const archetypeCopy: Record<Language, Record<ArchetypeKey, ArchetypeContent>> = {
  zh: {
    steady_builder: {
      name: "稳态建造型",
      shortName: "稳态型",
      tagline: "基础不错，关键是把好节奏守住。",
      description:
        "你的画像里已经有几个稳定优势。与其突然大改，不如把睡眠、活动、体检和饮食节奏做得更可持续。",
      signal: "优势多于高影响风险",
      focus: "选择一个已经有效的习惯，把它固定到日程里。",
    },
    movement_unlock: {
      name: "运动解锁型",
      shortName: "运动型",
      tagline: "你的分数最可能被活动量和力量训练拉动。",
      description:
        "这类结果通常不是需要复杂方案，而是需要把身体重新动起来。先追求连续，再追求强度。",
      signal: "运动量、久坐、力量或步速相关风险靠前",
      focus: "每天 10-15 分钟快走，加每周 2 次短力量训练。",
    },
    recovery_first: {
      name: "恢复优先型",
      shortName: "恢复型",
      tagline: "睡眠、压力和恢复质量是你的第一杠杆。",
      description:
        "你的结果提示恢复系统可能在拖后腿。先把睡眠质量、压力出口和日常节奏稳住，其他改变才更容易坚持。",
      signal: "睡眠、压力、情绪或社会连接相关风险靠前",
      focus: "提前 20 分钟上床，并记录 7 天醒来后的精神状态。",
    },
    metabolic_tune: {
      name: "代谢调优型",
      shortName: "代谢型",
      tagline: "体重、腰围、血糖或血脂是更值得关注的线索。",
      description:
        "这类结果适合从饮食结构、饭后活动和关键体检数字入手。小幅、稳定的改变比短期极端控制更重要。",
      signal: "体重、腰围、血压、血糖或 LDL 相关风险靠前",
      focus: "饭后散步 10 分钟，并减少一个高糖或高油高盐选择。",
    },
    prevention_catchup: {
      name: "预防补课型",
      shortName: "预防型",
      tagline: "你需要补齐体检、筛查和医疗可及性的确定性。",
      description:
        "这类结果的重点不是焦虑，而是把该确认的指标确认清楚。早知道，才有更多选择。",
      signal: "筛查、体检、医疗资源或明确健康信号需要补齐",
      focus: "列出下一项应该完成的体检或筛查，并预约时间。",
    },
    environment_reset: {
      name: "环境减压型",
      shortName: "环境型",
      tagline: "外部环境和工作节奏正在影响你的健康底盘。",
      description:
        "空气、二手烟、噪声、久坐和过长工时会悄悄叠加。先从可控空间开始，减少每天反复出现的暴露。",
      signal: "环境暴露、工作时长、噪声或二手烟风险靠前",
      focus: "先把一个固定空间变成低烟、低噪或可站立活动的环境。",
    },
    substance_reset: {
      name: "戒断重启型",
      shortName: "戒断型",
      tagline: "烟草或酒精是你当前最值得优先处理的杠杆。",
      description:
        "在你的画像里，烟草或过量饮酒是影响最大、也最可改变的风险。先把这一项稳住，其他改变会更容易见效。",
      signal: "吸烟或过量饮酒相关风险靠前",
      focus: "设一个明确的减量目标，并考虑戒烟门诊或替代方案。",
    },
  },
  en: {
    steady_builder: {
      name: "Steady Builder",
      shortName: "Steady",
      tagline: "Your base looks solid. The job is keeping the rhythm stable.",
      description:
        "You already have useful strengths in the profile. Instead of a drastic reset, make the good routines easier to repeat.",
      signal: "Strengths outweigh high-impact risks",
      focus: "Choose one habit that is already working and anchor it to your schedule.",
    },
    movement_unlock: {
      name: "Movement Unlock",
      shortName: "Movement",
      tagline: "Activity and strength are the biggest score levers.",
      description:
        "This type usually does not need a complicated plan. It needs the body moving again: consistency first, intensity later.",
      signal: "Activity, sitting, strength, pace, or stair signals appear first",
      focus: "Walk briskly for 10-15 minutes daily and add 2 short strength sessions weekly.",
    },
    recovery_first: {
      name: "Recovery First",
      shortName: "Recovery",
      tagline: "Sleep, stress, and recovery quality are the first lever.",
      description:
        "Your profile suggests the recovery system may be dragging other habits down. Stabilize sleep quality and stress outlets first.",
      signal: "Sleep, stress, mood, or social connection risks appear first",
      focus: "Move bedtime 20 minutes earlier and track morning energy for 7 days.",
    },
    metabolic_tune: {
      name: "Metabolic Tune-Up",
      shortName: "Metabolic",
      tagline: "Weight, waist, glucose, blood pressure, or lipids need attention.",
      description:
        "This type benefits from food structure, post-meal movement, and clearer lab trends. Small stable changes beat extremes.",
      signal: "Weight, waist, blood pressure, glucose, or LDL risks appear first",
      focus: "Walk 10 minutes after meals and replace one high-sugar, high-fat, or salty choice.",
    },
    prevention_catchup: {
      name: "Prevention Catch-Up",
      shortName: "Prevention",
      tagline: "Checkups, screening, and access need more certainty.",
      description:
        "The point is not to worry more. It is to confirm what can be confirmed so you have more options earlier.",
      signal: "Screening, checkup, access, or known health signals need follow-up",
      focus: "List the next checkup or screening item and book a date.",
    },
    environment_reset: {
      name: "Environment Reset",
      shortName: "Environment",
      tagline: "Your surroundings and work rhythm are adding background load.",
      description:
        "Air, smoke, noise, long sitting, and long work hours can add up quietly. Start by changing one repeated exposure.",
      signal: "Environment, work hours, noise, or secondhand-smoke risks appear first",
      focus: "Make one regular space lower-smoke, lower-noise, or easier to move in.",
    },
    substance_reset: {
      name: "Substance Reset",
      shortName: "Reset",
      tagline: "Tobacco or alcohol is your highest-priority lever right now.",
      description:
        "In your profile, tobacco or heavy alcohol is the highest-impact and most changeable risk. Stabilize this first and other changes get easier.",
      signal: "Smoking or heavy-drinking risks rank high",
      focus: "Set a clear reduction target and consider a cessation clinic or support.",
    },
  },
};

const archetypeRiskSignals: Record<Exclude<ArchetypeKey, "steady_builder">, string[]> = {
  movement_unlock: [
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
  recovery_first: [
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
  metabolic_tune: [
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
  prevention_catchup: [
    "screening_not_up_to_date",
    "hospital_distance",
    "frequent_illness",
    "chronic_diseases",
    "cancer_history",
    "autoimmune_disease",
    "chronic_inflammation",
    "unintended_weight_loss",
  ],
  environment_reset: [
    "high_air_pollution",
    "secondhand_smoke",
    "high_risk_occupation",
    "overwork",
    "noise_exposure",
    "high_risk_behaviors",
  ],
  substance_reset: [
    "current_light_smoker",
    "current_heavy_smoker",
    "quit_smoking_short",
    "heavy_alcohol",
  ],
};

const genericInsights: Record<Language, { risk: FactorInsight; strength: FactorInsight }> = {
  zh: {
    risk: {
      why: "这是当前结果里权重较高的可观察信号，值得优先确认和改善。",
      action: "先记录 7 天真实情况，再选择一个最容易坚持的小动作开始。",
    },
    strength: {
      why: "这是你当前画像里的正向信号，稳定性比短期冲刺更重要。",
      action: "继续保持当前节奏，并观察它是否会被新的改变打乱。",
    },
  },
  en: {
    risk: {
      why: "This is a higher-weight signal in your profile and is worth confirming first.",
      action: "Track it honestly for 7 days, then choose one small change you can repeat.",
    },
    strength: {
      why: "This is a positive signal in your profile. Stability matters more than a short push.",
      action: "Keep the current rhythm and make sure new changes do not disrupt it.",
    },
  },
};

const factorInsights: Record<
  Language,
  { risks: Record<string, FactorInsight>; strengths: Record<string, FactorInsight> }
> = {
  zh: {
    risks: {
      bmi_overweight: {
        why: "体重偏高通常会和血压、血糖、脂代谢一起影响长期健康。",
        action: "先把晚餐主食或零食减少一小份，并连续走路 15 分钟。",
      },
      bmi_obese_class1: {
        why: "肥胖会放大代谢和心血管风险，腰围变化尤其值得关注。",
        action: "这一周只盯两个指标：每天步数和含糖饮料次数。",
      },
      bmi_obese_class2: {
        why: "严重肥胖属于高影响风险，最好结合专业评估做长期计划。",
        action: "先预约一次体检或医生咨询，同时记录 7 天饮食和活动。",
      },
      waist_risk: {
        why: "腰围偏高常提示内脏脂肪压力，比单看体重更有信息量。",
        action: "每天饭后散步 10-15 分钟，先坚持一周。",
      },
      elevated_bp: {
        why: "血压偏高是可干预的早期信号，越早稳定越有价值。",
        action: "连续 7 天在同一时间测血压，并减少一次高盐外食。",
      },
      stage1_hypertension: {
        why: "一级高血压会增加长期心脑血管压力，需要持续确认。",
        action: "建立家庭血压记录；如果多次偏高，带记录咨询医生。",
      },
      stage2_hypertension: {
        why: "二级高血压是高优先级信号，不适合只靠自我感觉判断。",
        action: "优先咨询医生，并在本周开始规律记录家庭血压。",
      },
      prediabetes: {
        why: "糖尿病前期仍有较大逆转空间，是非常值得早动手的信号。",
        action: "把一顿精制主食换成粗粮或加一份蛋白质，先做 7 天。",
      },
      diabetes: {
        why: "血糖异常会影响血管、肾脏和神经系统，需要长期管理。",
        action: "如果尚未规律复查，先安排一次血糖或 A1c 复查。",
      },
      high_ldl: {
        why: "LDL 偏高会增加动脉粥样硬化风险，是体检里很关键的数字。",
        action: "减少一类高饱和脂肪食物，并准备下次复查对比。",
      },
      very_high_ldl: {
        why: "LDL 很高时不建议只靠生活方式猜测，专业评估更重要。",
        action: "带最近化验单咨询医生，确认是否需要进一步干预。",
      },
      current_light_smoker: {
        why: "即使轻度吸烟，也会影响血管、肺功能和长期风险。",
        action: "先选一个固定场景不吸，比如饭后或通勤时段。",
      },
      current_heavy_smoker: {
        why: "重度吸烟是结果里最有改善空间的风险之一。",
        action: "先设定一个减量目标，并考虑使用戒烟门诊或替代方案。",
      },
      heavy_alcohol: {
        why: "过量饮酒会影响肝脏、睡眠、血压和意外风险。",
        action: "本周先设 2 个无酒精日，并避免睡前饮酒。",
      },
      low_activity: {
        why: "运动量不足会同时影响心肺、血糖、情绪和睡眠。",
        action: "从每天 12 分钟快走开始，不追求强度，先追求连续。",
      },
      no_exercise: {
        why: "缺少运动会让多个维度一起失分，属于高性价比改善点。",
        action: "选择一个固定时间，每天走路 10-15 分钟。",
      },
      no_strength_training: {
        why: "力量训练关系到肌肉、骨骼和中老年功能体能。",
        action: "本周做 2 次深蹲、俯卧撑或弹力带训练，每次 10 分钟。",
      },
      sedentary_above_8h: {
        why: "久坐过长会削弱运动收益，也会影响代谢和腰围。",
        action: "给自己设一个每 50 分钟站起来 3 分钟的提醒。",
      },
      low_fruit_veg: {
        why: "蔬果不足会影响膳食纤维、微量营养素和饱腹感。",
        action: "每天固定加一份水果或一盘深色蔬菜。",
      },
      processed_food_high: {
        why: "加工食品偏多常伴随盐、糖、油和总热量偏高。",
        action: "先替换一个最常吃的加工零食，不需要一次全戒。",
      },
      insufficient_sleep: {
        why: "睡眠不足会影响食欲、血糖、情绪和恢复能力。",
        action: "把上床时间提前 20 分钟，先连续做 5 天。",
      },
      poor_sleep_quality: {
        why: "睡够但不恢复，可能提示压力、作息或睡眠呼吸问题。",
        action: "记录 7 天睡前屏幕、咖啡因和醒来精神状态。",
      },
      untreated_sleep_apnea: {
        why: "疑似睡眠呼吸暂停会影响血压、白天精力和心血管风险。",
        action: "如果经常打鼾或憋醒，优先咨询医生或做睡眠评估。",
      },
      chronic_stress: {
        why: "长期高压会通过睡眠、饮食、血压和情绪间接放大风险。",
        action: "每天固定一个 8 分钟降压动作：散步、呼吸或拉伸。",
      },
      social_isolation: {
        why: "社会连接会影响情绪、恢复和长期健康行为的稳定性。",
        action: "这周主动约一个人短聊或散步，不需要复杂社交。",
      },
      high_air_pollution: {
        why: "长期空气污染暴露会影响呼吸和心血管系统。",
        action: "空气差的日子减少户外高强度运动，必要时使用防护。",
      },
      secondhand_smoke: {
        why: "二手烟暴露同样会增加呼吸和心血管风险。",
        action: "先把家中或车内空间设为无烟区。",
      },
      screening_not_up_to_date: {
        why: "筛查不及时会错过早发现、早干预的机会。",
        action: "根据年龄和性别列出下一项应做筛查，并预约时间。",
      },
      slow_walking_pace: {
        why: "步速偏慢是功能体能的信号，常能反映长期状态。",
        action: "每天选一段 5 分钟路程，略快一点走但不要憋气。",
      },
      poor_stair_climb: {
        why: "爬楼困难提示心肺或下肢力量需要关注。",
        action: "从每天 1-2 组坐站训练开始，必要时咨询医生。",
      },
    },
    strengths: {
      no_chronic_disease: {
        why: "没有明确慢病会让基础风险更低，是很重要的底盘优势。",
        action: "继续保持体检节奏，不要等到不舒服才关注指标。",
      },
      normal_bp: {
        why: "血压正常说明血管压力目前较稳，是长期健康的重要优势。",
        action: "继续少盐、规律活动，并偶尔复测确认趋势。",
      },
      normal_glucose: {
        why: "血糖正常代表代谢状态较稳，值得继续维护。",
        action: "保持当前饮食节奏，避免把含糖饮料变成日常。",
      },
      optimal_ldl: {
        why: "LDL 理想是心血管维度里的好信号。",
        action: "继续保持饮食结构，并在下次体检复核趋势。",
      },
      regular_checkup: {
        why: "规律体检能帮助你更早发现可干预的指标变化。",
        action: "保留体检节奏，并把关键数字做成年度对比。",
      },
      up_to_date_screening: {
        why: "筛查及时能提高早发现、早干预的机会。",
        action: "把下一次适龄筛查写进日历，避免靠记忆管理。",
      },
      dental_checkup: {
        why: "口腔健康和炎症、饮食质量及生活质量都有关系。",
        action: "继续保持每年口腔检查和基础清洁。",
      },
      recommended_activity: {
        why: "活动量达标会同时支持心肺、代谢、睡眠和情绪。",
        action: "保持频率，优先避免连续多天中断。",
      },
      strength_training: {
        why: "力量训练能保护肌肉、骨骼和中长期行动能力。",
        action: "保持每周 2 次，把动作做稳比追求重量更重要。",
      },
      high_fruit_veg: {
        why: "蔬果充足说明饮食结构有不错的基础。",
        action: "继续保持颜色多样，不必追求复杂食谱。",
      },
      low_processed_food: {
        why: "少吃加工食品通常能帮助控制盐、糖和总热量。",
        action: "保留这个习惯，外食时优先选择原型食物。",
      },
      healthy_sleep: {
        why: "稳定睡眠时长是恢复能力的基础。",
        action: "继续固定起床时间，别为了短期效率牺牲睡眠。",
      },
      good_sleep_quality: {
        why: "醒来恢复感好，说明睡眠不只是时长够，质量也不错。",
        action: "保留当前睡前节奏，尤其是光照、咖啡因和屏幕习惯。",
      },
      low_stress: {
        why: "压力较低能让睡眠、饮食和血压更容易稳定。",
        action: "继续保留让你降压的固定活动。",
      },
      strong_social_connection: {
        why: "稳定社会支持会帮助健康习惯更容易长期坚持。",
        action: "把一次散步、运动或做饭变成和他人的固定连接。",
      },
      sense_of_purpose: {
        why: "目标感会提高自我管理的持续性。",
        action: "把目标拆成每周一个小动作，避免只停留在愿望。",
      },
      brisk_walking_pace: {
        why: "步速较快通常提示心肺和下肢功能状态不错。",
        action: "继续保留日常快走，但给身体安排恢复日。",
      },
      good_stair_climb: {
        why: "爬楼能力好是功能体能的实用优势。",
        action: "继续维持下肢力量和心肺活动。",
      },
    },
  },
  en: {
    risks: {
      bmi_overweight: {
        why: "Higher body weight often travels with blood pressure, glucose, and lipid risk.",
        action: "Reduce one dinner starch or snack portion and add a 15-minute walk.",
      },
      bmi_obese_class1: {
        why: "Obesity can amplify metabolic and cardiovascular risk, especially with a higher waist size.",
        action: "Track just two things this week: daily steps and sugary drinks.",
      },
      bmi_obese_class2: {
        why: "Severe obesity is a high-impact risk and is best handled with a long-term plan.",
        action: "Book a checkup or clinician visit and log food and activity for 7 days.",
      },
      waist_risk: {
        why: "A higher waist size can signal visceral fat pressure, often more useful than weight alone.",
        action: "Walk 10-15 minutes after meals for one week.",
      },
      elevated_bp: {
        why: "Elevated blood pressure is an early signal where small changes can matter.",
        action: "Measure at the same time for 7 days and swap one salty meal.",
      },
      stage1_hypertension: {
        why: "Stage 1 hypertension increases long-term cardiovascular load.",
        action: "Start a home blood-pressure log; if it stays high, bring it to a clinician.",
      },
      stage2_hypertension: {
        why: "Stage 2 hypertension is a high-priority signal and should not rely on guesswork.",
        action: "Talk with a clinician and begin regular home blood-pressure tracking.",
      },
      prediabetes: {
        why: "Prediabetes still has meaningful room to improve with early action.",
        action: "Swap one refined-carb meal for whole grains or add a protein serving for 7 days.",
      },
      diabetes: {
        why: "High glucose affects vessels, kidneys, and nerves, so consistency matters.",
        action: "If you are not already tracking it, schedule a glucose or A1c follow-up.",
      },
      high_ldl: {
        why: "Higher LDL is one of the key lab signals for cardiovascular risk.",
        action: "Reduce one high-saturated-fat food and compare at the next checkup.",
      },
      very_high_ldl: {
        why: "Very high LDL deserves professional review rather than guesswork.",
        action: "Bring your lab result to a clinician and discuss next steps.",
      },
      current_light_smoker: {
        why: "Even light smoking affects blood vessels, lungs, and long-term risk.",
        action: "Choose one fixed situation to make smoke-free, like after meals or commuting.",
      },
      current_heavy_smoker: {
        why: "Heavy smoking is one of the biggest modifiable risks in the profile.",
        action: "Set a reduction target and consider a cessation clinic or replacement support.",
      },
      heavy_alcohol: {
        why: "Heavy drinking affects liver health, sleep, blood pressure, and injury risk.",
        action: "Set 2 alcohol-free days this week and avoid alcohol near bedtime.",
      },
      low_activity: {
        why: "Low activity affects cardio fitness, glucose, mood, and sleep at once.",
        action: "Start with a 12-minute brisk walk daily. Chase consistency before intensity.",
      },
      no_exercise: {
        why: "Lack of exercise pulls several dimensions down at once.",
        action: "Pick a fixed time and walk 10-15 minutes every day.",
      },
      no_strength_training: {
        why: "Strength work protects muscle, bones, and future mobility.",
        action: "Do 2 short sessions this week: squats, pushups, or bands for 10 minutes.",
      },
      sedentary_above_8h: {
        why: "Long sitting can blunt the benefits of exercise and affect metabolism.",
        action: "Stand up for 3 minutes every 50 minutes.",
      },
      low_fruit_veg: {
        why: "Low fruit and vegetable intake often means less fiber and micronutrient density.",
        action: "Add one fruit or one plate of dark vegetables daily.",
      },
      processed_food_high: {
        why: "Processed foods often bring more salt, sugar, fat, and calories.",
        action: "Replace one repeat processed snack first. Do not try to change everything.",
      },
      insufficient_sleep: {
        why: "Short sleep affects appetite, glucose, mood, and recovery.",
        action: "Move bedtime 20 minutes earlier for 5 days.",
      },
      poor_sleep_quality: {
        why: "Enough time in bed without recovery can point to stress, schedule, or breathing issues.",
        action: "Track evening screens, caffeine, and morning energy for 7 days.",
      },
      untreated_sleep_apnea: {
        why: "Possible sleep apnea can affect blood pressure, daytime energy, and heart risk.",
        action: "If snoring or gasping is common, ask a clinician about sleep evaluation.",
      },
      chronic_stress: {
        why: "Chronic stress can indirectly raise risk through sleep, food, blood pressure, and mood.",
        action: "Pick one 8-minute decompression habit: walk, breathe, or stretch.",
      },
      social_isolation: {
        why: "Social connection supports mood, recovery, and habit stability.",
        action: "Schedule one short call, walk, or meal with someone this week.",
      },
      high_air_pollution: {
        why: "Long-term pollution exposure can affect respiratory and cardiovascular health.",
        action: "On poor-air days, reduce hard outdoor exercise and use protection when needed.",
      },
      secondhand_smoke: {
        why: "Secondhand smoke also raises respiratory and cardiovascular risk.",
        action: "Make your home or car a smoke-free space first.",
      },
      screening_not_up_to_date: {
        why: "Missed screening can delay early detection and intervention.",
        action: "List the next age-appropriate screening and book a date.",
      },
      slow_walking_pace: {
        why: "Slower walking pace is a practical signal of functional fitness.",
        action: "Choose one 5-minute route and walk slightly faster without breathlessness.",
      },
      poor_stair_climb: {
        why: "Difficulty climbing stairs can point to cardio or leg-strength limits.",
        action: "Start with sit-to-stand practice daily; check with a clinician if symptoms appear.",
      },
    },
    strengths: {
      no_chronic_disease: {
        why: "No known chronic disease lowers baseline risk and is an important advantage.",
        action: "Keep a regular checkup rhythm instead of waiting for symptoms.",
      },
      normal_bp: {
        why: "Normal blood pressure means your vascular load is currently steadier.",
        action: "Keep salt moderate, stay active, and recheck occasionally.",
      },
      normal_glucose: {
        why: "Normal glucose suggests a steadier metabolic baseline.",
        action: "Keep your current food rhythm and avoid making sugary drinks routine.",
      },
      optimal_ldl: {
        why: "Optimal LDL is a positive cardiovascular signal.",
        action: "Keep the food pattern and compare trends at the next checkup.",
      },
      regular_checkup: {
        why: "Regular checkups help catch changeable markers earlier.",
        action: "Keep the rhythm and compare key numbers year by year.",
      },
      up_to_date_screening: {
        why: "Up-to-date screening improves the chance of earlier detection and action.",
        action: "Put the next age-appropriate screening on your calendar.",
      },
      dental_checkup: {
        why: "Oral health connects with inflammation, food quality, and quality of life.",
        action: "Keep yearly dental checks and basic cleaning.",
      },
      recommended_activity: {
        why: "Meeting activity guidance supports cardio fitness, metabolism, sleep, and mood.",
        action: "Keep frequency stable and avoid multi-day breaks.",
      },
      strength_training: {
        why: "Strength training protects muscle, bones, and long-term mobility.",
        action: "Keep 2 sessions per week; stable form beats heavier loads.",
      },
      high_fruit_veg: {
        why: "High fruit and vegetable intake gives your diet a strong base.",
        action: "Keep colors varied without making the plan complicated.",
      },
      low_processed_food: {
        why: "Low processed food usually helps control salt, sugar, and calories.",
        action: "Keep this habit and choose whole foods when eating out.",
      },
      healthy_sleep: {
        why: "Stable sleep duration is a base layer of recovery.",
        action: "Keep a consistent wake time and protect sleep from short-term productivity pushes.",
      },
      good_sleep_quality: {
        why: "Feeling restored means sleep quality is working, not just sleep duration.",
        action: "Keep the evening routine that supports light, caffeine, and screen boundaries.",
      },
      low_stress: {
        why: "Lower stress makes sleep, food choices, and blood pressure easier to stabilize.",
        action: "Protect the activity that reliably helps you decompress.",
      },
      strong_social_connection: {
        why: "Stable social support makes healthy routines easier to sustain.",
        action: "Turn one walk, workout, or meal into a recurring connection.",
      },
      sense_of_purpose: {
        why: "A sense of purpose helps self-management last longer.",
        action: "Translate it into one small weekly action instead of keeping it abstract.",
      },
      brisk_walking_pace: {
        why: "Brisk walking pace is a good practical signal of cardio and leg function.",
        action: "Keep the habit, but leave room for recovery.",
      },
      good_stair_climb: {
        why: "Good stair ability is a useful functional-fitness advantage.",
        action: "Maintain leg strength and regular cardio activity.",
      },
    },
  },
};

function getArchetype(result: PredictionResult, lifeScore: number): ArchetypeKey {
  // The #1 risk gets a dominant weight so the headline issue (e.g. heavy
  // smoking) drives the archetype instead of being outvoted by common
  // secondary risks like sedentary time.
  const indexWeights = [5, 2, 1];
  const riskWeights = result.topRisks.reduce<Record<string, number>>((acc, risk, index) => {
    acc[risk] = indexWeights[index] ?? 1;
    return acc;
  }, {});

  const scores = Object.entries(archetypeRiskSignals).map(([key, signals]) => {
    const score = signals.reduce((sum, signal) => sum + (riskWeights[signal] || 0), 0);
    return { key: key as Exclude<ArchetypeKey, "steady_builder">, score };
  });

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];

  if (!top || top.score === 0) return "steady_builder";
  if (lifeScore >= 82 && top.score < 3) return "steady_builder";

  return top.key;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  color: string
) {
  ctx.fillStyle = color;
  drawRoundRect(ctx, x, y, width, height, radius);
  ctx.fill();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
) {
  const hasSpaces = /\s/.test(text);
  const units = hasSpaces ? text.split(/\s+/) : Array.from(text);
  const joiner = hasSpaces ? " " : "";
  let line = "";
  let drawn = 0;
  let currentY = y;

  for (const unit of units) {
    const nextLine = line ? `${line}${joiner}${unit}` : unit;
    if (ctx.measureText(nextLine).width <= maxWidth || !line) {
      line = nextLine;
      continue;
    }

    ctx.fillText(line, x, currentY);
    drawn += 1;
    currentY += lineHeight;
    line = unit;

    if (drawn === maxLines - 1) {
      while (ctx.measureText(`${line}...`).width > maxWidth && line.length > 1) {
        line = line.slice(0, -1);
      }
      ctx.fillText(`${line}...`, x, currentY);
      return currentY + lineHeight;
    }
  }

  if (line && drawn < maxLines) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
}

function downloadSharePoster(content: PosterContent, fileName: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1440;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const serif = content.language === "zh" ? "\"Microsoft YaHei\"" : "Georgia";
  const sans =
    content.language === "zh"
      ? "\"Microsoft YaHei\", \"PingFang SC\", Arial, sans-serif"
      : "Arial, Helvetica, sans-serif";
  // Tabular monospace for the headline number: the data-instrument signature.
  const mono = "\"SF Mono\", \"Consolas\", \"Menlo\", monospace";
  const MINT = "#5ad6b0";

  // Near-black instrument canvas.
  ctx.fillStyle = "#070d0b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  fillRoundRect(ctx, 66, 66, 948, 1308, 56, "#0c1a16");
  ctx.strokeStyle = "rgba(90,214,176,0.18)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(720 + i * 44, 66);
    ctx.lineTo(1014, 360 + i * 44);
    ctx.stroke();
  }

  ctx.fillStyle = MINT;
  ctx.font = `700 42px ${sans}`;
  ctx.fillText("LifeScore", 116, 154);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = `500 28px ${sans}`;
  ctx.fillText(content.title, 116, 204);
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `500 22px ${sans}`;
  ctx.fillText(content.subtitle, 116, 244);

  fillRoundRect(ctx, 116, 274, 852, 316, 34, "rgba(255,255,255,0.05)");
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 170px ${mono}`;
  ctx.fillText(String(content.lifeScore), 156, 462);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `600 28px ${sans}`;
  ctx.fillText(content.scoreLabel, 166, 522);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `700 24px ${sans}`;
  ctx.fillText(content.typeLabel, 480, 334);
  ctx.fillStyle = MINT;
  ctx.font = `700 48px ${serif}, ${sans}`;
  drawWrappedText(ctx, content.archetypeName, 478, 388, 410, 56, 2);
  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = `500 28px ${sans}`;
  drawWrappedText(ctx, content.archetypeTagline, 480, 476, 420, 38, 2);

  fillRoundRect(ctx, 116, 650, 852, 368, 28, "rgba(255,255,255,0.05)");
  ctx.fillStyle = MINT;
  ctx.font = `700 27px ${sans}`;
  ctx.fillText(content.signalLabel, 164, 730);
  ctx.fillText(content.focusLabel, 164, 882);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = `500 34px ${sans}`;
  drawWrappedText(ctx, content.signal, 164, 780, 728, 44, 2);
  drawWrappedText(ctx, content.focus, 164, 932, 728, 44, 2);

  fillRoundRect(ctx, 116, 1072, 396, 166, 24, "rgba(255,255,255,0.05)");
  fillRoundRect(ctx, 552, 1072, 416, 166, 24, "rgba(255,255,255,0.05)");
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = `700 24px ${sans}`;
  ctx.fillText(content.strengthLabel, 154, 1130);
  ctx.fillText(content.riskLabel, 590, 1130);
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 32px ${sans}`;
  drawWrappedText(ctx, content.strength, 154, 1180, 318, 40, 2);
  drawWrappedText(ctx, content.risk, 590, 1180, 330, 40, 2);

  ctx.fillStyle = MINT;
  ctx.font = `700 32px ${sans}`;
  ctx.fillText(content.cta, 116, 1294);
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `500 24px ${sans}`;
  drawWrappedText(ctx, content.shareHost, 116, 1334, 560, 30, 1);
  ctx.textAlign = "right";
  ctx.fillText(content.footnote, 968, 1334);
  ctx.textAlign = "left";

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, "image/png");
}

export default function ResultReport({ result, predictionId }: Props) {
  const { t, language } = useLanguage();
  const text = copy[language];
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(result.aiReportEnabled !== false);
  const [aiError, setAiError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);

  // Email unlock (lead magnet) state.
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [unlockedEmail, setUnlockedEmail] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ls_lead_email");
    } catch {
      return null;
    }
  });

  // 7-day challenge tracker, persisted per result.
  const [challengeDays, setChallengeDays] = useState<boolean[]>(() => {
    try {
      const saved = localStorage.getItem(`ls_challenge_${predictionId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 7) return parsed;
      }
    } catch {
      // fall through to a fresh tracker
    }
    return Array(7).fill(false);
  });

  // Previous result for the retest comparison chip.
  const [previousEntry, setPreviousEntry] = useState<{
    id: string;
    lifeScore: number;
    date: number;
  } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ls_history");
      const history: { id: string; lifeScore: number; date: number }[] = raw
        ? JSON.parse(raw)
        : [];
      const prev = [...history].reverse().find((entry) => entry.id !== predictionId);
      if (prev) setPreviousEntry(prev);

      const next = history.filter((entry) => entry.id !== predictionId);
      next.push({ id: predictionId, lifeScore: result.lifeScore, date: Date.now() });
      localStorage.setItem("ls_history", JSON.stringify(next.slice(-10)));
    } catch {
      // history is a nice-to-have; never block the result page
    }
  }, [predictionId, result.lifeScore]);

  const toggleChallengeDay = (index: number) => {
    setChallengeDays((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      try {
        localStorage.setItem(`ls_challenge_${predictionId}`, JSON.stringify(next));
        if (next.every(Boolean) && !prev.every(Boolean)) {
          track("challenge_done", predictionId);
        }
      } catch {
        // persistence best-effort
      }
      return next;
    });
  };

  const submitLead = async () => {
    const email = leadEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setLeadError(copy[language].unlockError);
      return;
    }
    setLeadSubmitting(true);
    setLeadError(null);
    try {
      await submitLeadApi({ email, predictionId, language });
      try {
        localStorage.setItem("ls_lead_email", email);
      } catch {
        // unlock still works for this session via state
      }
      setUnlockedEmail(email);
      track("lead_submit", predictionId);
    } catch {
      setLeadError(copy[language].unlockFailed);
    } finally {
      setLeadSubmitting(false);
    }
  };

  useEffect(() => {
    if (result.aiReportEnabled === false) {
      setAiLoading(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30;

    const poll = async () => {
      try {
        const data = await getPrediction(predictionId);
        if (cancelled) return;

        if (data.aiReport) {
          setAiReport(data.aiReport);
          setAiLoading(false);
          return;
        }

        if (!data.aiReportEnabled) {
          setAiLoading(false);
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          window.setTimeout(poll, 10000);
        } else {
          setAiError(true);
          setAiLoading(false);
        }
      } catch {
        if (cancelled) return;
        attempts++;
        if (attempts < maxAttempts) {
          window.setTimeout(poll, 10000);
        } else {
          setAiError(true);
          setAiLoading(false);
        }
      }
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [predictionId, result.aiReportEnabled]);

  // The headline score is computed server-side (algorithm.ts computeLifeScore).
  const lifeScore = result.lifeScore;
  const userAge = result.age ?? null;
  const isYoung = userAge !== null && userAge < 30;
  // Red-flag risks that warrant a prominent "see a clinician" prompt.
  const MEDICAL_FLAGS = [
    "stage2_hypertension",
    "diabetes",
    "very_high_ldl",
    "unintended_weight_loss",
    "current_heavy_smoker",
    "cancer_history",
  ];
  const needsMedical =
    result.topRisks.some((r) => MEDICAL_FLAGS.includes(r)) || lifeScore < 40;
  // Whether the user left key clinical inputs unknown (lower-confidence result).
  const hasUnknownKeyData = result.confidenceLevel < 70;
  const archetypeKey = useMemo(
    () => getArchetype(result, lifeScore),
    [lifeScore, result]
  );
  const archetype = archetypeCopy[language][archetypeKey];

  const radarData = Object.entries(result.dimensionScores).map(([name, score]) => ({
    dimension: t.dimensionNames[name as keyof typeof t.dimensionNames] || name,
    score: Math.max(-10, Math.min(10, Number(score))),
  }));

  const riskName = (key: string) => t.riskNames[key as keyof typeof t.riskNames] || key;
  const strengthName = (key: string) =>
    t.strengthNames[key as keyof typeof t.strengthNames] || key;

  const getRiskInsight = (key: string) =>
    factorInsights[language].risks[key] || genericInsights[language].risk;

  const getStrengthInsight = (key: string) =>
    factorInsights[language].strengths[key] || genericInsights[language].strength;

  const primaryRisk = result.topRisks[0];
  const primaryStrength = result.topStrengths[0];
  const profileText =
    lifeScore >= 82 ? text.profileHigh : lifeScore >= 65 ? text.profileMid : text.profileLow;

  // Health age is the headline metric; older cached results may not carry it.
  const healthAge = result.healthAge;
  const healthAgeDelta = result.healthAgeDelta ?? 0;
  const healthAgeBadge =
    healthAgeDelta < 0
      ? text.youngerBy.replace("{n}", String(Math.abs(healthAgeDelta)))
      : healthAgeDelta > 0
      ? text.olderBy.replace("{n}", String(healthAgeDelta))
      : text.sameAge;
  const challengeDone = challengeDays.filter(Boolean).length;
  const previousDaysAgo = previousEntry
    ? Math.max(1, Math.round((Date.now() - previousEntry.date) / 86400000))
    : 0;

  const actionPlan = result.topRisks.slice(0, 3).map((risk) => ({
    title: riskName(risk),
    body: getRiskInsight(risk).action,
  }));

  while (actionPlan.length < 3) {
    const fallbackIndex = actionPlan.length;
    const fallback = [text.action1, text.action2, text.action3][fallbackIndex];
    actionPlan.push({
      title:
        fallbackIndex === 1 && primaryStrength
          ? strengthName(primaryStrength)
          : text.actionTitle,
      body: fallback,
    });
  }

  const challengePlan: ChallengeItem[] =
    language === "zh"
      ? [
          {
            label: text.challengeHabit,
            title: archetype.shortName,
            body: primaryRisk ? getRiskInsight(primaryRisk).action : archetype.focus,
          },
          {
            label: text.challengeProof,
            title: "每天一行记录",
            body: "只记 3 个字：做了没、感觉如何、明天是否继续。越轻越容易坚持。",
          },
          {
            label: text.challengeProtect,
            title: primaryStrength ? strengthName(primaryStrength) : "保留稳定节奏",
            body: primaryStrength
              ? getStrengthInsight(primaryStrength).action
              : genericInsights.zh.strength.action,
          },
        ]
      : [
          {
            label: text.challengeHabit,
            title: archetype.shortName,
            body: primaryRisk ? getRiskInsight(primaryRisk).action : archetype.focus,
          },
          {
            label: text.challengeProof,
            title: "One-line daily log",
            body: "Write only three things: done or not, how it felt, and whether you will repeat tomorrow.",
          },
          {
            label: text.challengeProtect,
            title: primaryStrength ? strengthName(primaryStrength) : "Keep the stable rhythm",
            body: primaryStrength
              ? getStrengthInsight(primaryStrength).action
              : genericInsights.en.strength.action,
          },
        ];

  const methodItems = [
    {
      label: text.methodSignalsTitle,
      value: `${result.topRisks.length + result.topStrengths.length}`,
      unit: language === "zh" ? "个重点信号" : "key signals",
      body: text.methodSignalsBody,
    },
    {
      label: text.methodCompareTitle,
      value: `${result.percentile}%`,
      unit: text.betterThan,
      body: text.methodCompareBody,
    },
    {
      label: text.methodConfidenceTitle,
      value: `${result.confidenceLevel}%`,
      unit: text.confidence,
      body: text.methodConfidenceBody,
    },
    {
      label: text.methodPriorityTitle,
      value: primaryRisk ? riskName(primaryRisk) : "-",
      unit: text.firstPriority,
      body: text.methodPriorityBody,
    },
  ];

  const metricNotes =
    language === "zh"
      ? {
          range: "教育性估算范围",
          healthyYears: "健康状态参考线索",
          percentile: "粗略同类参照",
          potential:
            "这是优先级提示，不是承诺收益；真正目标是找到最值得先做的小动作。",
          methodLink: "查看完整计算说明",
          methodSummary: "展开查看分数、区间和可信度的计算读法",
          openMethod: "展开说明",
        }
      : {
          range: "Educational estimate range",
          healthyYears: "Health-span reference signal",
          percentile: "Rough peer reference",
          potential:
            "This is a priority cue, not a promised gain. The real goal is choosing the next useful move.",
          methodLink: "Read full method",
          methodSummary: "Open the score, range, and confidence reading guide",
          openMethod: "Open guide",
        };

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/share/${predictionId}` : "";
  const shareHost =
    typeof window !== "undefined"
      ? window.location.origin.replace(/^https?:\/\//, "")
      : "LifeScore";
  const shareMessage =
    language === "zh"
      ? `${text.sharePrefix} ${lifeScore}，我是「${archetype.shortName}」。${text.shareStrength}: ${
          primaryStrength ? strengthName(primaryStrength) : "-"
        }；${text.shareRisk}: ${primaryRisk ? riskName(primaryRisk) : "-"}。${
          text.shareCta
        }: ${shareUrl}`
      : `${text.sharePrefix} ${lifeScore}. I am a ${archetype.shortName} type. ${
          text.shareStrength
        }: ${
          primaryStrength ? strengthName(primaryStrength) : "-"
        }; ${text.shareRisk}: ${primaryRisk ? riskName(primaryRisk) : "-"}. ${
          text.shareCta
        }: ${shareUrl}`;
  const challengeMessage =
    language === "zh"
      ? `我的 7 天 LifeScore 小挑战：${challengePlan[0].body}。我会每天做一行记录，7 天后再看变化。你也来测测自己的 LifeScore：${shareUrl}`
      : `My 7-day LifeScore challenge: ${challengePlan[0].body} I will keep a one-line daily log and check in after 7 days. Try your LifeScore: ${shareUrl}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareMessage).then(() => {
      setCopied(true);
      track("share_copy", predictionId);
      window.setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyChallenge = () => {
    navigator.clipboard.writeText(challengeMessage).then(() => {
      setChallengeCopied(true);
      track("challenge_copy", predictionId);
      window.setTimeout(() => setChallengeCopied(false), 2000);
    });
  };

  const posterContent: PosterContent = {
    language,
    lifeScore,
    scoreLabel: text.scoreLabel,
    title: text.posterTitle,
    subtitle: text.posterSubtitle,
    typeLabel: text.archetypeEyebrow,
    archetypeName: archetype.name,
    archetypeTagline: archetype.tagline,
    signalLabel: text.archetypeSignal,
    signal: archetype.signal,
    focusLabel: text.archetypeFocus,
    focus: archetype.focus,
    strengthLabel: text.shareStrength,
    strength: primaryStrength ? strengthName(primaryStrength) : "-",
    riskLabel: text.shareRisk,
    risk: primaryRisk ? riskName(primaryRisk) : "-",
    cta: text.posterCta,
    footnote: text.posterFootnote,
    shareHost,
  };

  const savePoster = () => {
    track("poster_download", predictionId);
    downloadSharePoster(
      posterContent,
      `lifescore-${archetypeKey}-${predictionId}.png`
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {needsMedical && (
        <section className="rounded-card border-l-4 border-l-red-500 bg-red-50 p-5">
          <p className="text-sm font-black text-red-800">{text.medicalBannerTitle}</p>
          <p className="mt-2 text-sm leading-6 text-red-900">{text.medicalBannerBody}</p>
        </section>
      )}
      <section className="card-dark animate-fade-up">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_320px] lg:p-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-300/90">
              {healthAge !== undefined ? text.healthAgeLabel : text.eyebrow}
            </p>
            <div className="mt-4 flex flex-wrap items-end gap-4">
              <p className="num text-8xl font-bold leading-[0.85] text-white sm:text-9xl">
                {healthAge !== undefined ? healthAge : lifeScore}
              </p>
              <div className="pb-2">
                {healthAge !== undefined ? (
                  <>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-black ${
                        healthAgeDelta < 0
                          ? "bg-accent-400/20 text-accent-300"
                          : healthAgeDelta > 0
                          ? "bg-orange-400/20 text-orange-300"
                          : "bg-white/15 text-white/80"
                      }`}
                    >
                      {healthAgeBadge}
                    </span>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
                      {text.healthAgeNote}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-bold">{text.scoreLabel}</p>
                    <p className="mt-1 max-w-sm text-sm leading-6 text-white/65">
                      {text.rangeNote}
                    </p>
                  </>
                )}
              </div>
            </div>
            {previousEntry && (
              <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
                <span className="text-white/60">
                  {text.compareLast} <span className="num">{previousEntry.lifeScore}</span>
                </span>
                <span aria-hidden className="text-white/40">→</span>
                <span className="font-bold text-accent-300">
                  {text.compareThis} <span className="num">{lifeScore}</span>
                </span>
                <span className="text-xs text-white/45">
                  {text.compareDaysAgo.replace("{n}", String(previousDaysAgo))}
                </span>
              </div>
            )}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {isYoung ? (
                <div className="rounded-lg bg-white/10 p-4 sm:col-span-2">
                  <p className="text-xs text-white/55">{text.rangeLabel}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-white/85">
                    {text.rangeYoungNote}
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-lg bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10">
                    <p className="text-[11px] uppercase tracking-wider text-white/45">{text.rangeLabel}</p>
                    <p className="num mt-1.5 text-2xl font-semibold text-white">
                      {result.adjustedMin}-{result.adjustedMax}
                      <span className="ml-1 text-sm font-normal text-white/50">{text.years}</span>
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/45">{metricNotes.range}</p>
                  </div>
                  <div className="rounded-lg bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10">
                    <p className="text-[11px] uppercase tracking-wider text-white/45">{text.healthyYears}</p>
                    <p className="num mt-1.5 text-2xl font-semibold text-white">
                      {result.healthLifespan}
                      <span className="ml-1 text-sm font-normal text-white/50">{text.years}</span>
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/45">
                      {metricNotes.healthyYears}
                    </p>
                  </div>
                </>
              )}
              <div className="rounded-lg bg-white/[0.05] p-4 ring-1 ring-inset ring-white/10">
                <p className="text-[11px] uppercase tracking-wider text-white/45">{text.betterThan}</p>
                <p className="num mt-1.5 text-2xl font-semibold text-primary-300">{result.percentile}%</p>
                <p className="mt-2 text-xs leading-5 text-white/45">
                  {metricNotes.percentile}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-card bg-white p-5 text-ink shadow-lift">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
              {text.brand}
            </p>
            <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
                {text.archetypeEyebrow}
              </p>
              <p className="mt-2 text-2xl font-black leading-tight text-ink">
                {archetype.name}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-primary-800">
                {archetype.tagline}
              </p>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <p className="text-sm font-bold text-ink-soft">{text.scoreLabel}</p>
              <p className="num text-3xl font-semibold text-ink">{lifeScore}</p>
            </div>
            <div className="mt-2 h-4 overflow-hidden rounded-full bg-line">
              <div
                className="h-full animate-bar-fill rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400"
                style={{ width: `${lifeScore}%` }}
              />
            </div>
            <p className="mt-4 text-sm font-semibold text-ink-soft">
              {text.confidence}: {result.confidenceLevel}%
            </p>
            {hasUnknownKeyData && (
              <p className="mt-3 rounded-lg bg-primary-50 p-3 text-xs leading-5 text-primary-800">
                {text.unknownDataHint}
              </p>
            )}
            {result.potentialGain > 0 && (
              <div className="mt-5 rounded-lg bg-accent-50 p-4 text-sm leading-6 text-accent-900">
                {text.potential}{" "}
                <span className="num text-xl font-semibold">{result.potentialGain}</span>{" "}
                {text.years}
                <p className="mt-2 text-xs leading-5 text-accent-800">
                  {metricNotes.potential}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-white/85 p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
          {text.profileTitle}
        </p>
        <p className="mt-3 text-xl font-black leading-8 text-ink">
          {archetype.description}
        </p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">{profileText}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg bg-surface px-4 py-3">
            <p className="text-xs font-bold text-ink-faint">{text.archetypeSignal}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-soft">
              {archetype.signal}
            </p>
          </div>
          <div className="rounded-lg bg-surface px-4 py-3">
            <p className="text-xs font-bold text-ink-faint">{text.archetypeFocus}</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-ink-soft">
              {archetype.focus}
            </p>
          </div>
          <div className="rounded-lg bg-primary-50 px-4 py-3">
            <p className="text-xs font-bold text-primary-700">{text.strongest}</p>
            <p className="mt-1 text-sm font-black text-ink">
              {primaryStrength ? strengthName(primaryStrength) : "-"}
            </p>
          </div>
          <div className="rounded-lg bg-accent-50 px-4 py-3">
            <p className="text-xs font-bold text-accent-800">{text.firstPriority}</p>
            <p className="mt-1 text-sm font-black text-accent-900">
              {primaryRisk ? riskName(primaryRisk) : "-"}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="card">
          <h2 className="text-xl font-black text-ink">{text.actionTitle}</h2>
          <p className="mt-1 text-sm leading-6 text-ink-faint">{text.actionIntro}</p>
          <div className="mt-5 space-y-3">
            {actionPlan.map((item, index) => (
              <div key={`${item.title}-${index}`} className="flex gap-3 rounded-lg bg-surface p-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-800 text-xs font-black text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-black text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-ink-soft">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-primary-200 bg-primary-50 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700">
            {text.challengeTitle}
          </p>
          <h2 className="mt-2 text-xl font-black leading-tight text-ink">
            {text.challengeSubtitle}
          </h2>
          <div className="mt-5 grid gap-3">
            {challengePlan.map((item) => (
              <article
                key={item.label}
                className="rounded-lg border border-primary-100 bg-white/75 p-3"
              >
                <p className="text-xs font-black text-primary-700">{item.label}</p>
                <p className="mt-1 text-sm font-black text-ink">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-soft">{item.body}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 rounded-lg border border-primary-100 bg-white/75 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-primary-700">
                {text.trackerTitle}
              </p>
              <p className="text-xs font-bold text-ink-faint">
                {text.trackerProgress.replace("{done}", String(challengeDone))}
              </p>
            </div>
            <p className="mt-1 text-xs leading-5 text-ink-faint">{text.trackerHint}</p>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {challengeDays.map((done, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => toggleChallengeDay(index)}
                  aria-pressed={done}
                  aria-label={text.trackerDay.replace("{n}", String(index + 1))}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm font-black transition-all duration-150 ${
                    done
                      ? "bg-primary-600 text-white shadow-sm"
                      : "border border-line bg-surface text-ink-faint hover:border-primary-300 hover:text-primary-700"
                  }`}
                >
                  {done ? "✓" : index + 1}
                </button>
              ))}
            </div>
            {challengeDone === 7 && (
              <p className="mt-3 rounded-lg bg-accent-50 p-3 text-sm font-semibold leading-6 text-accent-900">
                {text.trackerComplete}
              </p>
            )}
          </div>
          <button onClick={copyChallenge} className="btn-secondary mt-4 w-full justify-center">
            {challengeCopied ? text.copied : text.challengeShare}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="card border-l-4 border-l-primary-600">
          <h2 className="text-xl font-black text-primary-900">{t.result.topStrengths}</h2>
          <p className="mt-1 text-sm text-ink-faint">{text.strengthsIntro}</p>
          <div className="mt-5 space-y-3">
            {result.topStrengths.length > 0 ? (
              result.topStrengths.map((strength) => {
                const insight = getStrengthInsight(strength);
                return (
                  <article
                    key={strength}
                    className="rounded-lg bg-primary-50 px-4 py-3 text-sm text-ink"
                  >
                    <h3 className="font-black">{strengthName(strength)}</h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-primary-700">
                      {text.whyLabel}
                    </p>
                    <p className="mt-1 leading-6">{insight.why}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-primary-700">
                      {text.keepLabel}
                    </p>
                    <p className="mt-1 leading-6">{insight.action}</p>
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-ink-faint">{text.noStrengthYet}</p>
            )}
          </div>
        </div>

        <div className="card border-l-4 border-l-accent-500">
          <h2 className="text-xl font-black text-accent-900">{t.result.topRisks}</h2>
          <p className="mt-1 text-sm text-ink-faint">{text.risksIntro}</p>
          <div className="mt-5 space-y-3">
            {result.topRisks.length > 0 ? (
              result.topRisks.map((risk) => {
                const insight = getRiskInsight(risk);
                return (
                  <article
                    key={risk}
                    className="rounded-lg bg-accent-50 px-4 py-3 text-sm text-accent-900"
                  >
                    <h3 className="font-black">{riskName(risk)}</h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-accent-800">
                      {text.whyLabel}
                    </p>
                    <p className="mt-1 leading-6">{insight.why}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-accent-800">
                      {text.tryLabel}
                    </p>
                    <p className="mt-1 leading-6">{insight.action}</p>
                  </article>
                );
              })
            ) : (
              <p className="text-sm text-ink-faint">{text.noRiskYet}</p>
            )}
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-black text-ink">{text.chartTitle}</h2>
        <div className="mt-4 h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#d8d0c4" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11, fill: "#5f695f" }} />
              <PolarRadiusAxis angle={90} domain={[-10, 10]} tick={{ fontSize: 10 }} />
              <Radar
                name="score"
                dataKey="score"
                stroke="#148b80"
                fill="#1fae9d"
                fillOpacity={0.24}
                strokeWidth={2}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-sm font-black text-ink">{text.dimensionBarsTitle}</p>
          <div className="mt-4 space-y-2.5">
            {radarData
              .slice()
              .sort((a, b) => a.score - b.score)
              .map((d) => {
                const pct = (Math.abs(d.score) / 10) * 50;
                const positive = d.score >= 0;
                return (
                  <div key={d.dimension} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-xs text-ink-soft" title={d.dimension}>
                      {d.dimension}
                    </span>
                    <div className="relative h-2.5 flex-1 rounded-full bg-line">
                      <span className="absolute left-1/2 top-0 h-full w-px bg-ink-faint/40" />
                      <span
                        className={`absolute top-0 h-full rounded-full ${
                          positive ? "bg-primary-500" : "bg-accent-500"
                        }`}
                        style={
                          positive
                            ? { left: "50%", width: `${pct}%` }
                            : { right: "50%", width: `${pct}%` }
                        }
                      />
                    </div>
                    <span className="num w-8 shrink-0 text-right text-xs font-semibold text-ink-soft">
                      {d.score > 0 ? "+" : ""}
                      {d.score}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="text-xl font-black text-ink">{text.aiTitle}</h2>
        {result.aiReportEnabled !== false && !unlockedEmail ? (
          <div className="mt-5 overflow-hidden rounded-lg border border-primary-100">
            <div aria-hidden className="space-y-2 bg-surface p-4 [filter:blur(5px)] select-none">
              <div className="h-3 w-2/3 rounded bg-line" />
              <div className="h-3 w-full rounded bg-line" />
              <div className="h-3 w-5/6 rounded bg-line" />
              <div className="h-3 w-3/4 rounded bg-line" />
            </div>
            <div className="border-t border-primary-100 bg-primary-50 p-5">
              <p className="text-base font-black text-ink">{text.unlockTitle}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{text.unlockDesc}</p>
              <p className="mt-2 rounded-lg bg-white/70 p-3 text-xs leading-5 text-primary-800">
                {text.unlockBenefit}
              </p>
              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row"
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitLead();
                }}
              >
                <input
                  type="email"
                  value={leadEmail}
                  onChange={(event) => setLeadEmail(event.target.value)}
                  placeholder={text.unlockPlaceholder}
                  className="input-field flex-1"
                  autoComplete="email"
                />
                <button
                  type="submit"
                  disabled={leadSubmitting}
                  className="btn-primary justify-center"
                >
                  {leadSubmitting ? text.unlockSubmitting : text.unlockButton}
                </button>
              </form>
              {leadError && (
                <p className="mt-2 text-sm text-red-600">{leadError}</p>
              )}
            </div>
          </div>
        ) : (
          <>
            {aiLoading && (
              <div className="mt-5 flex flex-col items-center rounded-lg bg-primary-50 py-8">
                <div className="mb-3 h-10 w-10 rounded-full border-4 border-primary-200 border-t-primary-700 animate-spin" />
                <p className="text-sm text-primary-800">{text.aiLoading}</p>
              </div>
            )}
            {!aiLoading && !aiReport && !aiError && (
              <div className="mt-5 rounded-lg bg-surface p-4 text-sm leading-6 text-ink-soft">
                {text.aiDisabled}
              </div>
            )}
            {aiError && (
              <div className="mt-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {text.aiFailed}
              </div>
            )}
            {aiReport && (
              <div className="prose prose-sm mt-5 max-w-none text-ink-soft">
                <ReactMarkdown>{aiReport}</ReactMarkdown>
              </div>
            )}
          </>
        )}
        {result.aiReportEnabled === false && !unlockedEmail && (
          <div className="mt-4 rounded-lg border border-primary-100 bg-primary-50 p-5">
            <p className="text-base font-black text-ink">{text.subscribeTitle}</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{text.subscribeDesc}</p>
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                void submitLead();
              }}
            >
              <input
                type="email"
                value={leadEmail}
                onChange={(event) => setLeadEmail(event.target.value)}
                placeholder={text.unlockPlaceholder}
                className="input-field flex-1"
                autoComplete="email"
              />
              <button
                type="submit"
                disabled={leadSubmitting}
                className="btn-primary justify-center"
              >
                {leadSubmitting ? text.unlockSubmitting : text.subscribeButton}
              </button>
            </form>
            {leadError && <p className="mt-2 text-sm text-red-600">{leadError}</p>}
          </div>
        )}
        {result.aiReportEnabled === false && unlockedEmail && (
          <p className="mt-4 rounded-lg bg-primary-50 p-4 text-sm font-semibold text-primary-800">
            {text.subscribed}
          </p>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="card min-w-0">
          <h2 className="text-xl font-black text-ink">{text.shareTitle}</h2>
          <p className="mt-1 text-sm text-ink-faint">{text.shareDesc}</p>
          <div className="mt-5 break-words rounded-lg bg-surface p-4 text-sm leading-6 text-ink-soft">
            {shareMessage}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={copyLink} className="btn-primary">
              {copied ? text.copied : text.copy}
            </button>
            <button onClick={savePoster} className="btn-secondary">
              {text.downloadPoster}
            </button>
          </div>
        </div>

        <div className="card-dark min-w-0 p-5">
          <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
            <div className="min-w-0">
              <p className="text-lg font-black text-accent-300">LifeScore</p>
              <p className="mt-1 text-xs text-white/55">{text.posterTitle}</p>
            </div>
            <p className="shrink-0 whitespace-nowrap rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
              {text.posterPreview}
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-surface p-5 text-ink">
            <p className="text-xs font-bold text-ink-faint">{text.posterSubtitle}</p>
            <div className="mt-4 flex items-end gap-4">
              <p className="text-7xl font-black leading-none">{lifeScore}</p>
              <div className="pb-2">
                <p className="text-sm font-black">{text.scoreLabel}</p>
                <p className="mt-1 text-xs text-ink-faint">{shareHost}</p>
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-bold text-ink-faint">{text.archetypeEyebrow}</p>
              <p className="mt-1 text-2xl font-black text-primary-600">{archetype.name}</p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{archetype.tagline}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs font-bold text-accent-300">{text.archetypeSignal}</p>
              <p className="mt-2 text-sm leading-6 text-white/85">{archetype.signal}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="min-w-0 rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold text-white/55">{text.shareStrength}</p>
                <p className="mt-2 break-words text-sm font-black">
                  {primaryStrength ? strengthName(primaryStrength) : text.noStrengthYet}
                </p>
              </div>
              <div className="min-w-0 rounded-xl bg-white/10 p-4">
                <p className="text-xs font-bold text-white/55">{text.shareRisk}</p>
                <p className="mt-2 break-words text-sm font-black">
                  {primaryRisk ? riskName(primaryRisk) : text.noRiskYet}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <details className="group overflow-hidden rounded-lg border border-line bg-ink text-white">
        <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 marker:content-none sm:flex-row sm:items-center sm:justify-between [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-300">
              LifeScore
            </p>
            <h2 className="mt-2 text-xl font-black leading-tight">{text.methodTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {metricNotes.methodSummary}
            </p>
          </div>
          <span className="inline-flex shrink-0 rounded-lg border border-white/20 px-4 py-2 text-sm font-black text-white group-open:bg-white group-open:text-ink">
            {metricNotes.openMethod}
          </span>
        </summary>
        <div className="border-t border-white/10 p-5">
          <p className="max-w-2xl text-sm leading-6 text-white/70">{text.methodDesc}</p>
          <Link
            to="/how-it-works"
            className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-black text-ink hover:bg-primary-50"
          >
            {metricNotes.methodLink}
          </Link>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {methodItems.map((item) => (
              <article key={item.label} className="rounded-lg bg-white/10 p-4">
                <p className="text-xs font-bold text-accent-300">{item.label}</p>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p className="text-2xl font-black leading-none">{item.value}</p>
                  <p className="text-xs font-semibold text-white/55">{item.unit}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/75">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </details>

      <div className="rounded-lg border border-dashed border-line bg-white/60 p-5 text-sm text-ink-faint">
        <p className="font-black text-ink">{text.adLabel}</p>
        <p className="mt-2 leading-6">{text.adBody}</p>
      </div>

      <p className="px-2 pb-4 text-center text-xs leading-5 text-ink-faint">
        {text.disclaimer}
      </p>
    </div>
  );
}
