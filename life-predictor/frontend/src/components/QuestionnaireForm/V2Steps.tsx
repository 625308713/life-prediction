import { Children, cloneElement, isValidElement, useId } from "react";
import { useLanguage } from "../../hooks/useLanguage";
import type { ReactElement, ReactNode } from "react";
import type { Language, QuestionnaireData } from "../../types";

interface Props {
  data: QuestionnaireData;
  onChange: <K extends keyof QuestionnaireData>(
    field: K,
    value: QuestionnaireData[K]
  ) => void;
}

type OnChange = Props["onChange"];

type Option = {
  value: string;
  label: string;
  meta?: string;
};

const GLUCOSE_MMOLL_TO_MGDL = 18.0182;

const copy: Record<
  Language,
  {
    intro: string;
    optionalIntro: string;
    measuredHint: string;
    measuredSkipTitle: string;
    measuredSkipBody: string;
    measuredStatusTitle: string;
    glucoseUnit: string;
    glucoseUnitMgdl: string;
    glucoseUnitMmoll: string;
    glucoseConverted: string;
    skipValue: string;
    clearMeasured: string;
    unknownCoreHint: string;
    unknown: string;
    bpStatus: string;
    glucoseStatus: string;
    bmi: string;
    waist: string;
    years: string;
    cm: string;
    kg: string;
    yes: string;
    no: string;
    notSure: string;
    sections: Record<string, { title: string; subtitle?: string }>;
    labels: Record<string, string>;
    options: Record<string, Option[]>;
  }
> = {
  zh: {
    intro: "核心问题只保留对健康寿命影响更明确、普通人也容易回答的信号。",
    optionalIntro: "这些进阶问题会提高结果可信度；不知道可以跳过。",
    measuredHint: "如果你有最近 12 个月的数据，填数字会比选择题更准；没有就留空。",
    measuredSkipTitle: "没有化验单也没关系",
    measuredSkipBody:
      "本页完全可以跳过。留空不会被当成健康答案，只会让结果少一点精细度。",
    measuredStatusTitle: "当前会使用的粗略分类",
    glucoseUnit: "血糖单位",
    glucoseUnitMgdl: "mg/dL",
    glucoseUnitMmoll: "mmol/L",
    glucoseConverted: "系统会自动换算成 mg/dL 参与计算",
    skipValue: "留空",
    clearMeasured: "清空本页数字",
    unknownCoreHint:
      "不知道就选“不知道”。系统不会把未知当成健康，只会降低一点结果可信度。",
    unknown: "不知道",
    bpStatus: "血压",
    glucoseStatus: "血糖",
    bmi: "BMI",
    waist: "腰围",
    years: "岁",
    cm: "厘米",
    kg: "公斤",
    yes: "是",
    no: "否",
    notSure: "不确定",
    sections: {
      profile: { title: "你的基础画像", subtitle: "用于建立年龄、体型和地区基线。" },
      health: { title: "已知健康信号", subtitle: "慢病、血压、血糖比“感觉健康”更有预测价值。" },
      activity: { title: "运动与久坐", subtitle: "按每周中等强度活动时间来问，比“每周几次运动”更稳定。" },
      substances: { title: "烟酒习惯", subtitle: "烟草和过量饮酒是可改变风险里最关键的两项。" },
      sleep: { title: "睡眠与饮食", subtitle: "睡眠恢复和饮食结构决定健康寿命的底盘。" },
      mind: { title: "压力与社会连接", subtitle: "长期压力、孤立感和目标感会改变风险曲线。" },
      biomarkers: { title: "化验与临床数字", subtitle: "有数字就填，没有就留空。" },
      function: { title: "功能体能", subtitle: "日常体能往往比单次运动表现更能反映长期状态。" },
      family: { title: "家族风险", subtitle: "家族史不是命运，但会改变风险权重。" },
      prevention: { title: "筛查与医疗可及性", subtitle: "能否早发现、早干预，会影响健康寿命。" },
      environment: { title: "环境与安全", subtitle: "把容易被忽略的外部风险补进去。" },
    },
    labels: {
      age: "年龄",
      gender: "性别",
      male: "男",
      female: "女",
      height: "身高",
      weight: "体重",
      region: "主要居住地区",
      conditions: "目前是否有医生诊断过的疾病",
      bloodPressure: "最近一次血压大致属于",
      bloodSugar: "最近一次血糖 / 糖化血红蛋白大致属于",
      activity: "每周中等强度活动时间",
      muscle: "每周是否做力量训练",
      sedentary: "每天久坐时间",
      smoking: "吸烟情况",
      alcohol: "饮酒情况",
      sleepDuration: "平均睡眠时长",
      sleepQuality: "醒来后的恢复感",
      apnea: "是否明显打鼾或被提示呼吸暂停",
      fruitVeg: "一周有几天蔬果充足",
      processedFood: "加工食品 / 甜饮 / 油炸频率",
      happiness: "近期整体状态评分",
      stress: "压力频率",
      social: "社会连接",
      purpose: "目标感",
      systolic: "收缩压",
      diastolic: "舒张压",
      a1c: "糖化血红蛋白 A1c",
      fastingGlucose: "空腹血糖",
      ldl: "LDL 胆固醇 mg/dL",
      restingHr: "静息心率",
      stairs: "连续上 3 层楼",
      walking: "平地步速",
      vo2: "心肺水平自评",
      grip: "握力 / 力量感",
      parentLongevity: "父母长寿情况",
      familyFlags: "家族中是否有这些情况",
      screening: "适龄癌症筛查",
      dental: "口腔检查",
      checkups: "过去 2 年体检次数",
      hospital: "到综合医院时间",
      insurance: "商业医疗保险",
      doctor: "固定医生 / 家庭医生",
      pollution: "长期空气污染暴露",
      secondhand: "二手烟暴露",
      occupation: "高危职业",
      noise: "长期噪声暴露",
      workHours: "每周工作时长",
      riskyBehavior: "高风险行为",
      weightLoss: "非刻意体重下降",
    },
    options: {
      region: [
        { value: "china", label: "中国大陆" },
        { value: "us", label: "美国" },
        { value: "other", label: "其他地区" },
      ],
      conditions: [
        { value: "none", label: "没有" },
        { value: "hypertension", label: "高血压" },
        { value: "diabetes", label: "糖尿病" },
        { value: "heart_disease", label: "心脏病" },
        { value: "stroke", label: "中风" },
        { value: "kidney", label: "慢性肾病" },
        { value: "copd", label: "慢性肺病" },
        { value: "cancer", label: "癌症史" },
        { value: "unknown", label: "不确定" },
      ],
      bp: [
        { value: "normal", label: "正常", meta: "<120/80" },
        { value: "elevated", label: "偏高", meta: "120-129/<80" },
        { value: "stage1", label: "一级高血压", meta: "130-139 或 80-89" },
        { value: "stage2", label: "二级高血压", meta: ">=140 或 >=90" },
        { value: "unknown", label: "不知道" },
      ],
      sugar: [
        { value: "normal", label: "正常" },
        { value: "prediabetes", label: "糖尿病前期" },
        { value: "diabetes", label: "糖尿病" },
        { value: "unknown", label: "不知道" },
      ],
      activity: [
        { value: "under_30", label: "<30 分钟" },
        { value: "30_90", label: "30-90 分钟" },
        { value: "90_149", label: "90-149 分钟" },
        { value: "150_300", label: "150-300 分钟" },
        { value: "300_plus", label: "300+ 分钟" },
      ],
      muscle: [
        { value: "yes", label: "每周 2 次左右" },
        { value: "no", label: "基本没有" },
        { value: "unknown", label: "不确定" },
      ],
      sedentary: [
        { value: "under_4", label: "<4 小时" },
        { value: "four_to_eight", label: "4-8 小时" },
        { value: "above_8", label: ">8 小时" },
      ],
      smoking: [
        { value: "none", label: "从不吸烟" },
        { value: "quit_10y_plus", label: "戒烟 10 年以上" },
        { value: "quit_under_10y", label: "戒烟未满 10 年" },
        { value: "1_9", label: "现在每天 1-9 支" },
        { value: "10_19", label: "现在每天 10-19 支" },
        { value: "20_plus", label: "现在每天 20+ 支" },
      ],
      alcohol: [
        { value: "none", label: "不喝" },
        { value: "rare", label: "偶尔喝" },
        { value: "moderate", label: "规律但不过量" },
        { value: "above_moderate", label: "经常超过建议量" },
        { value: "prefer_not", label: "不想回答" },
      ],
      sleepDuration: [
        { value: "under_5", label: "<5 小时" },
        { value: "5_6", label: "5-6 小时" },
        { value: "7_8", label: "7-8 小时" },
        { value: "9_plus", label: "9+ 小时" },
      ],
      sleepQuality: [
        { value: "refreshed", label: "多数时候精神恢复" },
        { value: "unrefreshed", label: "经常醒来仍累" },
        { value: "unknown", label: "说不准" },
      ],
      apnea: [
        { value: "yes", label: "是" },
        { value: "no", label: "否" },
        { value: "unknown", label: "不确定" },
      ],
      fruitVeg: [
        { value: "0_2", label: "0-2 天" },
        { value: "3_5", label: "3-5 天" },
        { value: "6_7", label: "6-7 天" },
      ],
      processed: [
        { value: "rare", label: "很少" },
        { value: "sometimes", label: "有时" },
        { value: "most_days", label: "多数天" },
      ],
      stress: [
        { value: "rare", label: "很少" },
        { value: "sometimes", label: "有时" },
        { value: "often", label: "经常" },
      ],
      social: [
        { value: "strong", label: "有稳定支持" },
        { value: "some", label: "一般" },
        { value: "isolated", label: "比较孤立" },
      ],
      purpose: [
        { value: "yes", label: "很明确" },
        { value: "somewhat", label: "有一点" },
        { value: "no", label: "不明显" },
      ],
      stairs: [
        { value: "yes", label: "能，不明显气喘" },
        { value: "no", label: "比较困难" },
        { value: "unknown", label: "不确定" },
      ],
      walking: [
        { value: "slow", label: "偏慢" },
        { value: "average", label: "普通" },
        { value: "brisk", label: "偏快" },
        { value: "unknown", label: "不确定" },
      ],
      vo2: [
        { value: "excellent", label: "很好" },
        { value: "average", label: "一般" },
        { value: "poor", label: "较差" },
      ],
      grip: [
        { value: "strong", label: "偏强" },
        { value: "average", label: "一般" },
        { value: "weak", label: "偏弱" },
      ],
      parentLongevity: [
        { value: "both_above_75", label: "父母均 75 岁以上或长寿" },
        { value: "one_above_75", label: "一方 75 岁以上或长寿" },
        { value: "both_below_65", label: "双方均 65 岁前去世" },
        { value: "other", label: "其他 / 不确定" },
      ],
      screening: [
        { value: "up_to_date", label: "按年龄完成" },
        { value: "not_up_to_date", label: "没有按时做" },
        { value: "not_sure", label: "不确定" },
        { value: "not_applicable", label: "暂不适用" },
      ],
      dental: [
        { value: "within_year", label: "1 年内" },
        { value: "over_year", label: "超过 1 年" },
        { value: "not_sure", label: "不确定" },
      ],
      hospital: [
        { value: "under_15min", label: "15 分钟内" },
        { value: "15_30min", label: "15-30 分钟" },
        { value: "over_30min", label: "30 分钟以上" },
      ],
      pollution: [
        { value: "low", label: "较低" },
        { value: "medium", label: "一般" },
        { value: "high", label: "较高" },
        { value: "unknown", label: "不确定" },
      ],
    },
  },
  en: {
    intro: "The core quiz keeps only high-signal inputs that ordinary users can answer quickly.",
    optionalIntro: "These booster questions improve confidence. Skip anything you do not know.",
    measuredHint: "If you have numbers from the last 12 months, measured values are better than broad choices. If not, leave them blank.",
    measuredSkipTitle: "No lab report? No problem.",
    measuredSkipBody:
      "This page is fully skippable. Blank values are not treated as healthy answers; they only make the result a little less specific.",
    measuredStatusTitle: "Broad categories currently used",
    glucoseUnit: "Glucose unit",
    glucoseUnitMgdl: "mg/dL",
    glucoseUnitMmoll: "mmol/L",
    glucoseConverted: "The system converts this to mg/dL for scoring",
    skipValue: "Leave blank",
    clearMeasured: "Clear this page",
    unknownCoreHint:
      "Choose “Unknown” when you are not sure. Unknowns are not counted as healthy answers; they only lower confidence slightly.",
    unknown: "Unknown",
    bpStatus: "Blood pressure",
    glucoseStatus: "Glucose",
    bmi: "BMI",
    waist: "Waist",
    years: "years",
    cm: "cm",
    kg: "kg",
    yes: "Yes",
    no: "No",
    notSure: "Not sure",
    sections: {
      profile: { title: "Your Baseline Profile", subtitle: "Sets the age, body, and region baseline." },
      health: { title: "Known Health Signals", subtitle: "Diagnosed conditions, blood pressure, and glucose beat vague wellness guesses." },
      activity: { title: "Movement & Sitting", subtitle: "Weekly activity minutes are more stable than asking how often you exercise." },
      substances: { title: "Smoking & Alcohol", subtitle: "Tobacco and heavy drinking are two of the strongest modifiable risks." },
      sleep: { title: "Sleep & Food", subtitle: "Sleep recovery and food patterns form the base layer of health span." },
      mind: { title: "Stress & Social Connection", subtitle: "Chronic stress, isolation, and purpose shift long-term risk." },
      biomarkers: { title: "Clinical Numbers", subtitle: "Fill recent numbers if you have them; otherwise leave blank." },
      function: { title: "Functional Fitness", subtitle: "Daily physical function often says more than one workout." },
      family: { title: "Family Risk", subtitle: "Family history is not destiny, but it changes risk weighting." },
      prevention: { title: "Screening & Access", subtitle: "Early detection and access change long-term outcomes." },
      environment: { title: "Environment & Safety", subtitle: "Adds external risks that people often miss." },
    },
    labels: {
      age: "Age",
      gender: "Gender",
      male: "Male",
      female: "Female",
      height: "Height",
      weight: "Weight",
      region: "Primary region",
      conditions: "Doctor-diagnosed conditions",
      bloodPressure: "Latest blood pressure level",
      bloodSugar: "Latest glucose / A1c level",
      activity: "Weekly moderate activity",
      muscle: "Weekly strength training",
      sedentary: "Daily sitting time",
      smoking: "Smoking",
      alcohol: "Alcohol",
      sleepDuration: "Average sleep duration",
      sleepQuality: "Wake-up recovery",
      apnea: "Loud snoring or possible apnea",
      fruitVeg: "Days with enough fruit / vegetables",
      processedFood: "Processed food / sugary drink / fried food",
      happiness: "Recent wellbeing score",
      stress: "Stress frequency",
      social: "Social connection",
      purpose: "Sense of purpose",
      systolic: "Systolic",
      diastolic: "Diastolic",
      a1c: "A1c",
      fastingGlucose: "Fasting glucose",
      ldl: "LDL cholesterol mg/dL",
      restingHr: "Resting heart rate",
      stairs: "Climb 3 floors",
      walking: "Walking pace",
      vo2: "Cardio fitness self-rating",
      grip: "Grip / strength feel",
      parentLongevity: "Parental longevity",
      familyFlags: "Family history flags",
      screening: "Age-appropriate cancer screening",
      dental: "Dental checkup",
      checkups: "Checkups in past 2 years",
      hospital: "Time to general hospital",
      insurance: "Commercial health insurance",
      doctor: "Regular doctor",
      pollution: "Long-term air pollution exposure",
      secondhand: "Secondhand smoke exposure",
      occupation: "High-risk occupation",
      noise: "Long-term noise exposure",
      workHours: "Weekly work hours",
      riskyBehavior: "High-risk behaviors",
      weightLoss: "Unintentional weight loss",
    },
    options: {
      region: [
        { value: "china", label: "Mainland China" },
        { value: "us", label: "United States" },
        { value: "other", label: "Other" },
      ],
      conditions: [
        { value: "none", label: "None" },
        { value: "hypertension", label: "Hypertension" },
        { value: "diabetes", label: "Diabetes" },
        { value: "heart_disease", label: "Heart disease" },
        { value: "stroke", label: "Stroke" },
        { value: "kidney", label: "Chronic kidney disease" },
        { value: "copd", label: "Chronic lung disease" },
        { value: "cancer", label: "Cancer history" },
        { value: "unknown", label: "Not sure" },
      ],
      bp: [
        { value: "normal", label: "Normal", meta: "<120/80" },
        { value: "elevated", label: "Elevated", meta: "120-129/<80" },
        { value: "stage1", label: "Stage 1", meta: "130-139 or 80-89" },
        { value: "stage2", label: "Stage 2", meta: ">=140 or >=90" },
        { value: "unknown", label: "Unknown" },
      ],
      sugar: [
        { value: "normal", label: "Normal" },
        { value: "prediabetes", label: "Prediabetes" },
        { value: "diabetes", label: "Diabetes" },
        { value: "unknown", label: "Unknown" },
      ],
      activity: [
        { value: "under_30", label: "<30 min" },
        { value: "30_90", label: "30-90 min" },
        { value: "90_149", label: "90-149 min" },
        { value: "150_300", label: "150-300 min" },
        { value: "300_plus", label: "300+ min" },
      ],
      muscle: [
        { value: "yes", label: "About 2 days/week" },
        { value: "no", label: "Rarely" },
        { value: "unknown", label: "Not sure" },
      ],
      sedentary: [
        { value: "under_4", label: "<4 hours" },
        { value: "four_to_eight", label: "4-8 hours" },
        { value: "above_8", label: ">8 hours" },
      ],
      smoking: [
        { value: "none", label: "Never smoked" },
        { value: "quit_10y_plus", label: "Quit 10+ years ago" },
        { value: "quit_under_10y", label: "Quit under 10 years" },
        { value: "1_9", label: "Current 1-9/day" },
        { value: "10_19", label: "Current 10-19/day" },
        { value: "20_plus", label: "Current 20+/day" },
      ],
      alcohol: [
        { value: "none", label: "None" },
        { value: "rare", label: "Occasional" },
        { value: "moderate", label: "Regular, within limits" },
        { value: "above_moderate", label: "Often above limits" },
        { value: "prefer_not", label: "Prefer not to say" },
      ],
      sleepDuration: [
        { value: "under_5", label: "<5 hours" },
        { value: "5_6", label: "5-6 hours" },
        { value: "7_8", label: "7-8 hours" },
        { value: "9_plus", label: "9+ hours" },
      ],
      sleepQuality: [
        { value: "refreshed", label: "Usually refreshed" },
        { value: "unrefreshed", label: "Often still tired" },
        { value: "unknown", label: "Not sure" },
      ],
      apnea: [
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
        { value: "unknown", label: "Unsure" },
      ],
      fruitVeg: [
        { value: "0_2", label: "0-2 days" },
        { value: "3_5", label: "3-5 days" },
        { value: "6_7", label: "6-7 days" },
      ],
      processed: [
        { value: "rare", label: "Rarely" },
        { value: "sometimes", label: "Sometimes" },
        { value: "most_days", label: "Most days" },
      ],
      stress: [
        { value: "rare", label: "Rarely" },
        { value: "sometimes", label: "Sometimes" },
        { value: "often", label: "Often" },
      ],
      social: [
        { value: "strong", label: "Stable support" },
        { value: "some", label: "Some support" },
        { value: "isolated", label: "Mostly isolated" },
      ],
      purpose: [
        { value: "yes", label: "Strong" },
        { value: "somewhat", label: "Somewhat" },
        { value: "no", label: "Not much" },
      ],
      stairs: [
        { value: "yes", label: "Yes, without major breathlessness" },
        { value: "no", label: "Difficult" },
        { value: "unknown", label: "Not sure" },
      ],
      walking: [
        { value: "slow", label: "Slow" },
        { value: "average", label: "Average" },
        { value: "brisk", label: "Brisk" },
        { value: "unknown", label: "Not sure" },
      ],
      vo2: [
        { value: "excellent", label: "Excellent" },
        { value: "average", label: "Average" },
        { value: "poor", label: "Poor" },
      ],
      grip: [
        { value: "strong", label: "Strong" },
        { value: "average", label: "Average" },
        { value: "weak", label: "Weak" },
      ],
      parentLongevity: [
        { value: "both_above_75", label: "Both parents 75+ or long-lived" },
        { value: "one_above_75", label: "One parent 75+ or long-lived" },
        { value: "both_below_65", label: "Both died before 65" },
        { value: "other", label: "Other / not sure" },
      ],
      screening: [
        { value: "up_to_date", label: "Up to date" },
        { value: "not_up_to_date", label: "Not up to date" },
        { value: "not_sure", label: "Not sure" },
        { value: "not_applicable", label: "Not applicable" },
      ],
      dental: [
        { value: "within_year", label: "Within 1 year" },
        { value: "over_year", label: "Over 1 year" },
        { value: "not_sure", label: "Not sure" },
      ],
      hospital: [
        { value: "under_15min", label: "Under 15 min" },
        { value: "15_30min", label: "15-30 min" },
        { value: "over_30min", label: "Over 30 min" },
      ],
      pollution: [
        { value: "low", label: "Low" },
        { value: "medium", label: "Medium" },
        { value: "high", label: "High" },
        { value: "unknown", label: "Not sure" },
      ],
    },
  },
};

function setFields(onChange: OnChange, fields: Partial<QuestionnaireData>) {
  Object.entries(fields).forEach(([field, value]) => {
    onChange(
      field as keyof QuestionnaireData,
      value as QuestionnaireData[keyof QuestionnaireData]
    );
  });
}

function toOptionalNumber(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function optionLabel(options: Option[], value: string | undefined, fallback: string): string {
  return options.find((option) => option.value === value)?.label || fallback;
}

function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function glucoseInputValue(
  mgdl: number | undefined,
  unit: QuestionnaireData["fastingGlucoseUnit"]
): number | undefined {
  if (mgdl === undefined) return undefined;
  return unit === "mmoll" ? roundTo(mgdl / GLUCOSE_MMOLL_TO_MGDL, 1) : roundTo(mgdl, 0);
}

function glucoseInputToMgdl(
  value: number | undefined,
  unit: QuestionnaireData["fastingGlucoseUnit"]
): number | undefined {
  if (value === undefined) return undefined;
  return unit === "mmoll" ? roundTo(value * GLUCOSE_MMOLL_TO_MGDL, 1) : value;
}

function mapActivityToLegacy(value: string): QuestionnaireData["exerciseFrequency"] {
  if (value === "under_30") return "rarely";
  if (value === "150_300" || value === "300_plus") return "three_plus";
  return "one_to_two";
}

function mapSmokingToLegacy(value: string): QuestionnaireData["smokingStatus"] {
  if (value === "none") return "never";
  if (value === "quit_10y_plus") return "quit_10y_plus";
  if (value === "quit_under_10y") return "quit_under_10y";
  if (value === "20_plus") return "current_heavy";
  return "current_light";
}

function mapAlcoholToLegacy(value: string): QuestionnaireData["alcoholConsumption"] {
  if (value === "none") return "never";
  if (value === "rare") return "occasional";
  if (value === "above_moderate") return "daily_heavy";
  return "weekly_moderate";
}

function mapSleepHours(value: string): number {
  if (value === "under_5") return 4.5;
  if (value === "5_6") return 5.5;
  if (value === "9_plus") return 9.5;
  return 7.5;
}

function mapDietToLegacy(fruitVeg?: string, processed?: string): QuestionnaireData["dietPattern"] {
  if (processed === "most_days") return "high_meat_salt";
  if (fruitVeg === "6_7" && processed === "rare") return "veggie_rich";
  return "balanced";
}

function bpCategory(systolic?: number, diastolic?: number): string | undefined {
  if (!systolic || !diastolic) return undefined;
  if (systolic >= 140 || diastolic >= 90) return "stage2";
  if (systolic >= 130 || diastolic >= 80) return "stage1";
  if (systolic >= 120 && diastolic < 80) return "elevated";
  return "normal";
}

function glucoseCategory(a1c?: number, fasting?: number): string | undefined {
  if (a1c !== undefined) {
    if (a1c >= 6.5) return "diabetes";
    if (a1c >= 5.7) return "prediabetes";
    return "normal";
  }
  if (fasting !== undefined) {
    if (fasting >= 126) return "diabetes";
    if (fasting >= 100) return "prediabetes";
    return "normal";
  }
  return undefined;
}

function stepShell(
  language: Language,
  sectionKey: keyof typeof copy.zh.sections,
  children: ReactNode,
  optional = false
) {
  const text = copy[language];
  const section = text.sections[sectionKey];
  return (
    <div className="rounded-card border border-line bg-white p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-700">
        {optional ? text.optionalIntro : text.intro}
      </p>
      <div className="mt-3">
        <h3 className="text-xl font-black text-ink">{section.title}</h3>
        {section.subtitle && (
          <p className="mt-1 text-sm leading-6 text-ink-faint">{section.subtitle}</p>
        )}
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}

function FieldGroup({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const fieldId = useId();
  // Associate the visible label with a single NumberInput child so screen
  // readers announce the field name (other children keep their own labelling).
  let labelFor: string | undefined;
  const enhanced = Children.map(children, (child) => {
    if (isValidElement(child) && child.type === NumberInput) {
      labelFor = fieldId;
      return cloneElement(child as ReactElement<{ id?: string; ariaLabel?: string }>, {
        id: fieldId,
        ariaLabel: label,
      });
    }
    return child;
  });
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <label htmlFor={labelFor} className="text-sm font-bold text-ink-soft">
          {label}
        </label>
        {hint && <span className="text-xs text-ink-faint">{hint}</span>}
      </div>
      {enhanced}
    </div>
  );
}

function ChoiceGrid({
  value,
  options,
  onSelect,
  columns = "sm:grid-cols-2",
}: {
  value?: string;
  options: Option[];
  onSelect: (value: string) => void;
  columns?: string;
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            aria-pressed={active}
            className={`min-h-14 rounded-xl border px-3 py-2 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
              active
                ? "border-primary-600 bg-primary-50 text-primary-900 shadow-card ring-1 ring-primary-600"
                : "border-line bg-white text-ink-soft hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card"
            }`}
          >
            <span className="block text-sm font-bold leading-5">{option.label}</span>
            {option.meta && (
              <span className="mt-1 block text-xs leading-4 text-ink-faint">
                {option.meta}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`rounded-xl border px-3 py-3 text-left text-sm font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
        active
          ? "border-primary-600 bg-primary-50 text-primary-900 ring-1 ring-primary-600"
          : "border-line bg-white text-ink-soft hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-card"
      }`}
    >
      {label}
    </button>
  );
}

function NumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
  clearLabel,
  step,
  id,
  ariaLabel,
}: {
  value?: number;
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  suffix?: string;
  clearLabel?: string;
  step?: number | string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          aria-label={ariaLabel}
          type="number"
          inputMode="decimal"
          className="input-field pr-16"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(toOptionalNumber(event.target.value))}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-faint">
            {suffix}
          </span>
        )}
      </div>
      {clearLabel && value !== undefined && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="mt-2 text-xs font-bold text-primary-700 hover:text-primary-900"
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}

export function CoreProfileStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "profile",
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.age}>
          <NumberInput
            value={data.age}
            min={18}
            max={120}
            suffix={text.years}
            onChange={(value) => onChange("age", value ?? 18)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.gender}>
          <ChoiceGrid
            columns="grid-cols-2"
            value={data.gender}
            options={[
              { value: "male", label: text.labels.male },
              { value: "female", label: text.labels.female },
            ]}
            onSelect={(value) => onChange("gender", value)}
          />
        </FieldGroup>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FieldGroup label={text.labels.height}>
          <NumberInput
            value={data.heightCm}
            min={100}
            max={250}
            suffix={text.cm}
            onChange={(value) => onChange("heightCm", value ?? 170)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.weight}>
          <NumberInput
            value={data.weightKg}
            min={30}
            max={300}
            suffix={text.kg}
            onChange={(value) => onChange("weightKg", value ?? 65)}
          />
        </FieldGroup>
        <FieldGroup label={text.waist}>
          <NumberInput
            value={data.waistCm}
            min={45}
            max={200}
            suffix={text.cm}
            onChange={(value) => onChange("waistCm", value ?? 80)}
          />
        </FieldGroup>
      </div>

      <div className="rounded-lg bg-surface px-4 py-3 text-sm text-ink-soft">
        <span className="font-semibold text-primary-800">
          {text.bmi}: <span className="num">{data.bmi}</span>
        </span>
        <span className="mx-3 text-line">|</span>
        <span>
          {text.waist}: <span className="num">{data.waistCm}</span> {text.cm}
        </span>
      </div>

      <FieldGroup label={text.labels.region}>
        <ChoiceGrid
          value={data.region}
          options={text.options.region}
          onSelect={(value) => onChange("region", value as QuestionnaireData["region"])}
          columns="sm:grid-cols-3"
        />
      </FieldGroup>
    </>
  );
}

export function CoreHealthSignalsStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];
  const selected = data.diagnosedConditions ?? [];

  const toggleCondition = (value: string) => {
    const exclusive = value === "none" || value === "unknown";
    const next = exclusive
      ? [value]
      : selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected.filter((item) => item !== "none" && item !== "unknown"), value];
    const chronicDiseases = next.filter((item) => item !== "none" && item !== "unknown");
    setFields(onChange, {
      diagnosedConditions: next,
      chronicDiseases,
      cancerHistory: chronicDiseases.includes("cancer"),
    });
  };

  return stepShell(
    language,
    "health",
    <>
      <FieldGroup label={text.labels.conditions}>
        <div className="grid gap-2 sm:grid-cols-3">
          {text.options.conditions.map((option) => (
            <ToggleRow
              key={option.value}
              label={option.label}
              active={selected.includes(option.value)}
              onToggle={() => toggleCondition(option.value)}
            />
          ))}
        </div>
      </FieldGroup>

      <FieldGroup label={text.labels.bloodPressure}>
        <ChoiceGrid
          value={data.bloodPressureKnown ?? data.bloodPressure}
          options={text.options.bp}
          onSelect={(value) =>
            setFields(onChange, { bloodPressureKnown: value, bloodPressure: value })
          }
        />
      </FieldGroup>

      <FieldGroup label={text.labels.bloodSugar}>
        <ChoiceGrid
          value={data.bloodSugarKnown ?? data.bloodSugar}
          options={text.options.sugar}
          onSelect={(value) =>
            setFields(onChange, { bloodSugarKnown: value, bloodSugar: value })
          }
        />
      </FieldGroup>

      <p className="rounded-lg bg-primary-50 px-4 py-3 text-sm leading-6 text-primary-800">
        {text.unknownCoreHint}
      </p>
    </>
  );
}

export function CoreActivityStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "activity",
    <>
      <FieldGroup label={text.labels.activity}>
        <ChoiceGrid
          value={data.activityMinutesPerWeek}
          options={text.options.activity}
          columns="sm:grid-cols-5"
          onSelect={(value) =>
            setFields(onChange, {
              activityMinutesPerWeek: value,
              exerciseFrequency: mapActivityToLegacy(value),
            })
          }
        />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.muscle}>
          <ChoiceGrid
            value={data.muscleStrengthening}
            options={text.options.muscle}
            onSelect={(value) => onChange("muscleStrengthening", value)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.sedentary}>
          <ChoiceGrid
            value={data.sedentaryHours}
            options={text.options.sedentary}
            onSelect={(value) => onChange("sedentaryHours", value)}
          />
        </FieldGroup>
      </div>
    </>
  );
}

export function CoreSubstancesStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "substances",
    <>
      <FieldGroup label={text.labels.smoking}>
        <ChoiceGrid
          value={data.smokingAmount}
          options={text.options.smoking}
          columns="sm:grid-cols-3"
          onSelect={(value) =>
            setFields(onChange, {
              smokingAmount: value,
              smokingStatus: mapSmokingToLegacy(value),
            })
          }
        />
      </FieldGroup>

      <FieldGroup label={text.labels.alcohol}>
        <ChoiceGrid
          value={data.alcoholPattern}
          options={text.options.alcohol}
          onSelect={(value) =>
            setFields(onChange, {
              alcoholPattern: value,
              alcoholConsumption: mapAlcoholToLegacy(value),
            })
          }
        />
      </FieldGroup>
    </>
  );
}

export function CoreRecoveryStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "sleep",
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.sleepDuration}>
          <ChoiceGrid
            value={data.sleepDurationRange}
            options={text.options.sleepDuration}
            onSelect={(value) =>
              setFields(onChange, {
                sleepDurationRange: value,
                sleepHours: mapSleepHours(value),
              })
            }
          />
        </FieldGroup>
        <FieldGroup label={text.labels.sleepQuality}>
          <ChoiceGrid
            value={data.sleepQuality}
            options={text.options.sleepQuality}
            onSelect={(value) => onChange("sleepQuality", value)}
          />
        </FieldGroup>
      </div>

      <FieldGroup label={text.labels.apnea}>
        <ChoiceGrid
          value={data.snoreOrApnea}
          options={text.options.apnea}
          columns="sm:grid-cols-3"
          onSelect={(value) =>
            setFields(onChange, {
              snoreOrApnea: value,
              untreatedSleepApnea: value === "yes" ? true : value === "no" ? false : undefined,
            })
          }
        />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.fruitVeg}>
          <ChoiceGrid
            value={data.dietFruitVegDays}
            options={text.options.fruitVeg}
            onSelect={(value) =>
              setFields(onChange, {
                dietFruitVegDays: value,
                dietPattern: mapDietToLegacy(value, data.processedFoodFrequency),
              })
            }
          />
        </FieldGroup>
        <FieldGroup label={text.labels.processedFood}>
          <ChoiceGrid
            value={data.processedFoodFrequency}
            options={text.options.processed}
            onSelect={(value) =>
              setFields(onChange, {
                processedFoodFrequency: value,
                dietPattern: mapDietToLegacy(data.dietFruitVegDays, value),
              })
            }
          />
        </FieldGroup>
      </div>

    </>
  );
}

export function CoreMindStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "mind",
    <>
      <FieldGroup label={text.labels.happiness} hint="1-10">
        <NumberInput
          value={data.happinessScore}
          min={1}
          max={10}
          onChange={(value) => onChange("happinessScore", value ?? 7)}
        />
      </FieldGroup>

      <div className="grid gap-4 sm:grid-cols-3">
        <FieldGroup label={text.labels.stress}>
          <ChoiceGrid
            value={data.stressFrequency}
            options={text.options.stress}
            onSelect={(value) =>
              setFields(onChange, {
                stressFrequency: value,
                chronicStress: value === "often",
              })
            }
          />
        </FieldGroup>
        <FieldGroup label={text.labels.social}>
          <ChoiceGrid
            value={data.socialConnection}
            options={text.options.social}
            onSelect={(value) =>
              setFields(onChange, {
                socialConnection: value,
                socialActivity:
                  value === "strong" ? "high" : value === "isolated" ? "isolated" : "moderate",
                stablePartner: value === "strong",
              })
            }
          />
        </FieldGroup>
        <FieldGroup label={text.labels.purpose}>
          <ChoiceGrid
            value={data.purposeLevel}
            options={text.options.purpose}
            onSelect={(value) =>
              setFields(onChange, {
                purposeLevel: value,
                senseOfPurpose: value === "yes",
              })
            }
          />
        </FieldGroup>
      </div>
    </>
  );
}

export function BoosterBiomarkersStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  const updateBp = (field: "bpSystolic" | "bpDiastolic", value: number | undefined) => {
    const systolic = field === "bpSystolic" ? value : data.bpSystolic;
    const diastolic = field === "bpDiastolic" ? value : data.bpDiastolic;
    const category = bpCategory(systolic, diastolic);
    setFields(onChange, {
      [field]: value,
      ...(category
        ? { bloodPressureKnown: category, bloodPressure: category }
        : { bloodPressureKnown: "unknown", bloodPressure: "unknown" }),
    });
  };

  const updateGlucose = (field: "a1c" | "fastingGlucose", value: number | undefined) => {
    const a1c = field === "a1c" ? value : data.a1c;
    const fasting = field === "fastingGlucose" ? value : data.fastingGlucose;
    const category = glucoseCategory(a1c, fasting);
    setFields(onChange, {
      [field]: value,
      ...(category
        ? { bloodSugarKnown: category, bloodSugar: category }
        : { bloodSugarKnown: "unknown", bloodSugar: "unknown" }),
    });
  };

  const updateFastingGlucoseInput = (value: number | undefined) => {
    updateGlucose(
      "fastingGlucose",
      glucoseInputToMgdl(value, data.fastingGlucoseUnit ?? "mgdl")
    );
  };

  const clearMeasuredValues = () => {
    setFields(onChange, {
      bpSystolic: undefined,
      bpDiastolic: undefined,
      a1c: undefined,
      fastingGlucose: undefined,
      ldlCholesterol: undefined,
      restingHeartRate: undefined,
      bloodPressureKnown: "unknown",
      bloodPressure: "unknown",
      bloodSugarKnown: "unknown",
      bloodSugar: "unknown",
      fastingGlucoseUnit: data.fastingGlucoseUnit ?? "mgdl",
    });
  };

  const bpSummary = optionLabel(
    text.options.bp,
    data.bloodPressureKnown ?? data.bloodPressure,
    text.unknown
  );
  const glucoseSummary = optionLabel(
    text.options.sugar,
    data.bloodSugarKnown ?? data.bloodSugar,
    text.unknown
  );

  return stepShell(
    language,
    "biomarkers",
    <>
      <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black text-primary-950">{text.measuredSkipTitle}</p>
            <p className="mt-2 text-sm leading-6 text-primary-800">{text.measuredSkipBody}</p>
          </div>
          <button
            type="button"
            onClick={clearMeasuredValues}
            className="shrink-0 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-black text-primary-800 hover:bg-primary-50"
          >
            {text.clearMeasured}
          </button>
        </div>
        <p className="mt-4 rounded-lg bg-white/75 px-3 py-2 text-sm leading-6 text-ink-soft">
          {text.measuredHint}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-surface px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
            {text.measuredStatusTitle}
          </p>
          <p className="mt-2 text-sm font-black text-ink">
            {text.bpStatus}: {bpSummary}
          </p>
        </div>
        <div className="rounded-lg bg-surface px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-700">
            {text.measuredStatusTitle}
          </p>
          <p className="mt-2 text-sm font-black text-ink">
            {text.glucoseStatus}: {glucoseSummary}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.systolic} hint="mmHg">
          <NumberInput
            value={data.bpSystolic}
            min={70}
            max={240}
            clearLabel={text.skipValue}
            onChange={(value) => updateBp("bpSystolic", value)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.diastolic} hint="mmHg">
          <NumberInput
            value={data.bpDiastolic}
            min={40}
            max={140}
            clearLabel={text.skipValue}
            onChange={(value) => updateBp("bpDiastolic", value)}
          />
        </FieldGroup>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.a1c} hint="%">
          <NumberInput
            value={data.a1c}
            min={3}
            max={14}
            step={0.1}
            clearLabel={text.skipValue}
            onChange={(value) => updateGlucose("a1c", value)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.fastingGlucose} hint={data.fastingGlucoseUnit === "mmoll" ? "mmol/L" : "mg/dL"}>
          <div className="mb-3">
            <p className="mb-2 text-xs font-bold text-ink-faint">{text.glucoseUnit}</p>
            <ChoiceGrid
              value={data.fastingGlucoseUnit ?? "mgdl"}
              columns="grid-cols-2"
              options={[
                { value: "mgdl", label: text.glucoseUnitMgdl },
                { value: "mmoll", label: text.glucoseUnitMmoll },
              ]}
              onSelect={(value) =>
                onChange("fastingGlucoseUnit", value as QuestionnaireData["fastingGlucoseUnit"])
              }
            />
          </div>
          <NumberInput
            ariaLabel={text.labels.fastingGlucose}
            value={glucoseInputValue(data.fastingGlucose, data.fastingGlucoseUnit ?? "mgdl")}
            min={data.fastingGlucoseUnit === "mmoll" ? 2.8 : 50}
            max={data.fastingGlucoseUnit === "mmoll" ? 16.7 : 300}
            step={data.fastingGlucoseUnit === "mmoll" ? 0.1 : 1}
            clearLabel={text.skipValue}
            onChange={updateFastingGlucoseInput}
          />
          {data.fastingGlucose !== undefined && data.fastingGlucoseUnit === "mmoll" && (
            <p className="mt-2 text-xs leading-5 text-ink-faint">
              {text.glucoseConverted}: {roundTo(data.fastingGlucose, 1)} mg/dL
            </p>
          )}
        </FieldGroup>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.ldl}>
          <NumberInput
            value={data.ldlCholesterol}
            min={30}
            max={300}
            clearLabel={text.skipValue}
            onChange={(value) => onChange("ldlCholesterol", value)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.restingHr}>
          <NumberInput
            value={data.restingHeartRate}
            min={35}
            max={140}
            clearLabel={text.skipValue}
            onChange={(value) => onChange("restingHeartRate", value)}
          />
        </FieldGroup>
      </div>
    </>,
    true
  );
}

export function BoosterFunctionStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "function",
    <>
      <FieldGroup label={text.labels.stairs}>
        <ChoiceGrid
          value={data.climbThreeFloors}
          options={text.options.stairs}
          columns="sm:grid-cols-3"
          onSelect={(value) => onChange("climbThreeFloors", value)}
        />
      </FieldGroup>
      <FieldGroup label={text.labels.walking}>
        <ChoiceGrid
          value={data.walkingPace}
          options={text.options.walking}
          columns="sm:grid-cols-4"
          onSelect={(value) => onChange("walkingPace", value)}
        />
      </FieldGroup>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.vo2}>
          <ChoiceGrid
            value={data.vo2maxLevel}
            options={text.options.vo2}
            onSelect={(value) => onChange("vo2maxLevel", value)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.grip}>
          <ChoiceGrid
            value={data.gripStrength}
            options={text.options.grip}
            onSelect={(value) => onChange("gripStrength", value)}
          />
        </FieldGroup>
      </div>
    </>,
    true
  );
}

export function BoosterFamilyStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "family",
    <>
      <FieldGroup label={text.labels.parentLongevity}>
        <ChoiceGrid
          value={data.parentLongevity}
          options={text.options.parentLongevity}
          onSelect={(value) => onChange("parentLongevity", value)}
        />
      </FieldGroup>
      <FieldGroup label={text.labels.familyFlags}>
        <div className="grid gap-2 sm:grid-cols-2">
          <ToggleRow
            label={language === "zh" ? "家族中有 90 岁以上成员" : "Family member aged 90+"}
            active={data.familyMemberAbove90}
            onToggle={() => onChange("familyMemberAbove90", !data.familyMemberAbove90)}
          />
          <ToggleRow
            label={language === "zh" ? "心脏病家族史" : "Family heart disease"}
            active={data.familyHeartDisease}
            onToggle={() => onChange("familyHeartDisease", !data.familyHeartDisease)}
          />
          <ToggleRow
            label={language === "zh" ? "癌症家族史" : "Family cancer"}
            active={data.familyCancer}
            onToggle={() => onChange("familyCancer", !data.familyCancer)}
          />
          <ToggleRow
            label={language === "zh" ? "阿尔茨海默病家族史" : "Family Alzheimer's"}
            active={data.familyAlzheimers}
            onToggle={() => onChange("familyAlzheimers", !data.familyAlzheimers)}
          />
        </div>
      </FieldGroup>
    </>,
    true
  );
}

export function BoosterPreventionStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "prevention",
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.screening}>
          <ChoiceGrid
            value={data.cancerScreeningStatus}
            options={text.options.screening}
            onSelect={(value) =>
              setFields(onChange, {
                cancerScreeningStatus: value,
                regularCheckup: value === "up_to_date" || data.regularCheckup,
              })
            }
          />
        </FieldGroup>
        <FieldGroup label={text.labels.dental}>
          <ChoiceGrid
            value={data.dentalCheckup}
            options={text.options.dental}
            onSelect={(value) => onChange("dentalCheckup", value)}
          />
        </FieldGroup>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.checkups}>
          <NumberInput
            value={data.recentCheckupCount}
            min={0}
            max={12}
            onChange={(value) =>
              setFields(onChange, {
                recentCheckupCount: value,
                regularCheckup: (value ?? 0) > 0,
              })
            }
          />
        </FieldGroup>
        <FieldGroup label={text.labels.hospital}>
          <ChoiceGrid
            value={data.distanceToHospital}
            options={text.options.hospital}
            onSelect={(value) => onChange("distanceToHospital", value)}
          />
        </FieldGroup>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <ToggleRow
          label={text.labels.insurance}
          active={data.commercialInsurance === true}
          onToggle={() => onChange("commercialInsurance", !data.commercialInsurance)}
        />
        <ToggleRow
          label={text.labels.doctor}
          active={data.hasFamilyDoctor === true}
          onToggle={() => onChange("hasFamilyDoctor", !data.hasFamilyDoctor)}
        />
      </div>
    </>,
    true
  );
}

export function BoosterEnvironmentStep({ data, onChange }: Props) {
  const { language } = useLanguage();
  const text = copy[language];

  return stepShell(
    language,
    "environment",
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.pollution}>
          <ChoiceGrid
            value={data.airPollutionExposure}
            options={text.options.pollution}
            onSelect={(value) => onChange("airPollutionExposure", value)}
          />
        </FieldGroup>
        <FieldGroup label={text.labels.secondhand}>
          <ChoiceGrid
            value={data.secondhandSmoke}
            options={text.options.apnea}
            columns="sm:grid-cols-3"
            onSelect={(value) => onChange("secondhandSmoke", value)}
          />
        </FieldGroup>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup label={text.labels.workHours}>
          <NumberInput
            value={data.weeklyWorkHours}
            min={0}
            max={120}
            onChange={(value) => onChange("weeklyWorkHours", value)}
          />
        </FieldGroup>
        <div className="grid gap-2">
          <ToggleRow
            label={text.labels.occupation}
            active={data.highRiskOccupation}
            onToggle={() => onChange("highRiskOccupation", !data.highRiskOccupation)}
          />
          <ToggleRow
            label={text.labels.noise}
            active={data.longTermNoise}
            onToggle={() => onChange("longTermNoise", !data.longTermNoise)}
          />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <ToggleRow
          label={text.labels.riskyBehavior}
          active={data.highRiskBehaviors === true}
          onToggle={() => onChange("highRiskBehaviors", !data.highRiskBehaviors)}
        />
        <ToggleRow
          label={text.labels.weightLoss}
          active={data.unintendedWeightLoss === true}
          onToggle={() => onChange("unintendedWeightLoss", !data.unintendedWeightLoss)}
        />
      </div>
    </>,
    true
  );
}
