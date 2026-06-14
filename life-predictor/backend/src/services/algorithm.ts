interface QuestionnaireData {
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  waistCm: number;
  ethnicity: string;
  chronicDiseases: string[];
  cancerHistory: boolean;
  bloodPressure: string;
  bloodSugar: string;
  cholesterolLevel?: string;
  regularCheckup: boolean;
  currentMedications: string[];
  parentLongevity: string;
  familyMemberAbove90: boolean;
  familyAlzheimers: boolean;
  familyParkinsons: boolean;
  familyHeartDisease: boolean;
  familyCancer: boolean;
  smokingStatus: string;
  alcoholConsumption: string;
  exerciseFrequency: string;
  sedentaryHours: string;
  dietPattern: string;
  sleepHours: number;
  waterIntake?: string;
  happinessScore: number;
  chronicStress: boolean;
  depressionTendency: boolean;
  stablePartner: boolean;
  socialActivity: string;
  senseOfPurpose: boolean;
  educationLevel?: string;
  highRiskOccupation: boolean;
  weeklyWorkHours?: number;
  longTermNoise: boolean;
  incomeLevel?: string;
  selfDisciplineScore?: number;
  positiveAgingAttitude?: boolean;
  readingHabit?: boolean;
  highRiskBehaviors?: boolean;
  bedtimeRange?: string;
  untreatedSleepApnea?: boolean;
  moderateNapping?: boolean;
  preSleepScreenTime?: boolean;
  frequentIllness?: boolean;
  autoimmuneDisease?: boolean;
  chronicInflammation?: boolean;
  distanceToHospital?: string;
  commercialInsurance?: boolean;
  recentCheckupCount?: number;
  hasFamilyDoctor?: boolean;
  restingHeartRate?: number;
  vo2maxLevel?: string;
  gripStrength?: string;
  unintendedWeightLoss?: boolean;
  formVersion?: "v2";
  region?: "china" | "us" | "other";
  diagnosedConditions?: string[];
  bloodPressureKnown?: string;
  bloodSugarKnown?: string;
  activityMinutesPerWeek?: string;
  muscleStrengthening?: string;
  smokingAmount?: string;
  alcoholPattern?: string;
  sleepDurationRange?: string;
  sleepQuality?: string;
  snoreOrApnea?: string;
  dietFruitVegDays?: string;
  processedFoodFrequency?: string;
  stressFrequency?: string;
  socialConnection?: string;
  purposeLevel?: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  a1c?: number;
  fastingGlucose?: number;
  fastingGlucoseUnit?: "mgdl" | "mmoll";
  ldlCholesterol?: number;
  climbThreeFloors?: string;
  walkingPace?: string;
  cancerScreeningStatus?: string;
  dentalCheckup?: string;
  airPollutionExposure?: string;
  secondhandSmoke?: string;
}

interface DimensionResult {
  name: string;
  score: number;
  weight: number;
}

interface AlgorithmResult {
  baselineLifeExpectancy: number;
  adjustedLifeExpectancy: number;
  /**
   * Legacy API/DB alias for adjustedLifeExpectancy.
   * The original schema used this field name for the final point estimate.
   */
  baseLifeExpectancy: number;
  adjustedMin: number;
  adjustedMax: number;
  healthLifespan: number;
  dimensionScores: Record<string, number>;
  topRisks: string[];
  topStrengths: string[];
  potentialGain: number;
  confidenceLevel: number;
  percentile: number;
  totalAdjustment: number;
  lifeScore: number;
  healthAge: number;
  healthAgeDelta: number;
}

const BASE_LIFE_EXPECTANCY_MALE = 75.0;
const BASE_LIFE_EXPECTANCY_FEMALE = 80.0;
const STD_DEV = 8.0;
const MAX_POSITIVE_ADJUSTMENT = 14.0;

const conditionalRemainingYears = {
  male: [
    { age: 65, years: 17.5 },
    { age: 70, years: 14.1 },
    { age: 75, years: 11.0 },
    { age: 80, years: 8.3 },
    { age: 85, years: 6.0 },
    { age: 90, years: 4.2 },
    { age: 95, years: 3.1 },
    { age: 100, years: 2.3 },
  ],
  female: [
    { age: 65, years: 20.0 },
    { age: 70, years: 16.1 },
    { age: 75, years: 12.8 },
    { age: 80, years: 9.8 },
    { age: 85, years: 7.0 },
    { age: 90, years: 4.8 },
    { age: 95, years: 3.4 },
    { age: 100, years: 2.5 },
  ],
};

function roundOne(value: number): number {
  return Math.round(value * 10) / 10;
}

function estimateRemainingYears(gender: string, age: number): number | null {
  if (age < 65) return null;

  const table =
    gender === "male" ? conditionalRemainingYears.male : conditionalRemainingYears.female;

  if (age <= table[0].age) return table[0].years;
  const last = table[table.length - 1];
  if (age >= last.age) return Math.max(1, last.years - (age - last.age) * 0.15);

  for (let index = 0; index < table.length - 1; index += 1) {
    const current = table[index];
    const next = table[index + 1];
    if (age >= current.age && age <= next.age) {
      const progress = (age - current.age) / (next.age - current.age);
      return current.years + (next.years - current.years) * progress;
    }
  }

  return null;
}

function getAdjustmentScale(age: number): number {
  if (age >= 85) return 0.35;
  if (age >= 75) return 0.5;
  if (age >= 65) return 0.65;
  if (age >= 50) return 0.85;
  return 1;
}

export function getBaseLifeExpectancy(gender: string, age?: number): number {
  const birthBaseline =
    gender === "male" ? BASE_LIFE_EXPECTANCY_MALE : BASE_LIFE_EXPECTANCY_FEMALE;

  if (age === undefined) return birthBaseline;

  const remainingYears = estimateRemainingYears(gender, age);
  if (remainingYears === null) return birthBaseline;

  return roundOne(Math.max(birthBaseline, age + remainingYears));
}

/**
 * Health age: the headline "your habits make you read N years younger/older"
 * metric. A positive totalAdjustment (longer estimated life) maps to a
 * younger health age. Damped and clamped so it stays plausible.
 */
export function computeHealthAge(age: number, totalAdjustment: number): number {
  const delta = Math.max(-12, Math.min(12, -totalAdjustment * 0.8));
  return Math.max(18, Math.round(age + delta));
}

/**
 * The single source of truth for the headline LifeScore (35-99).
 * Frontend and SEO must consume this instead of re-deriving it.
 */
export function computeLifeScore(
  percentile: number,
  totalAdjustment: number,
  confidenceLevel: number
): number {
  const raw =
    62 +
    (percentile - 50) * 0.28 +
    totalAdjustment * 1.1 +
    (confidenceLevel - 80) * 0.18;
  return Math.min(99, Math.max(35, Math.round(raw)));
}

export function deriveLifeExpectancyMetrics(
  gender: string,
  adjustedLifeExpectancy: number,
  age?: number
): { percentile: number; totalAdjustment: number } {
  const baseLifeExpectancy = getBaseLifeExpectancy(gender, age);
  return {
    percentile: Math.round(
      normalCDF(adjustedLifeExpectancy, baseLifeExpectancy, STD_DEV) * 100
    ),
    totalAdjustment:
      Math.round((adjustedLifeExpectancy - baseLifeExpectancy) * 10) / 10,
  };
}

function normalCDF(x: number, mean: number, std: number): number {
  const z = (x - mean) / std;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const prob =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  if (z > 0) return 1 - prob;
  return prob;
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

function getConditionList(data: QuestionnaireData): string[] {
  const source =
    data.diagnosedConditions && data.diagnosedConditions.length > 0
      ? data.diagnosedConditions
      : data.chronicDiseases;

  return source.filter(
    (condition) => condition !== "none" && condition !== "unknown"
  );
}

function getBloodPressureStatus(data: QuestionnaireData): string {
  if (data.bpSystolic && data.bpDiastolic) {
    if (data.bpSystolic >= 140 || data.bpDiastolic >= 90) return "stage2";
    if (data.bpSystolic >= 130 || data.bpDiastolic >= 80) return "stage1";
    if (data.bpSystolic >= 120 && data.bpDiastolic < 80) return "elevated";
    return "normal";
  }

  return data.bloodPressureKnown || data.bloodPressure;
}

function getBloodSugarStatus(data: QuestionnaireData): string {
  if (data.a1c !== undefined) {
    if (data.a1c >= 6.5) return "diabetes";
    if (data.a1c >= 5.7) return "prediabetes";
    return "normal";
  }

  if (data.fastingGlucose !== undefined) {
    if (data.fastingGlucose >= 126) return "diabetes";
    if (data.fastingGlucose >= 100) return "prediabetes";
    return "normal";
  }

  return data.bloodSugarKnown || data.bloodSugar;
}

function calculateV2Confidence(data: QuestionnaireData): number {
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

  const coreKnown = coreFields.filter((field) => hasKnownValue(data[field])).length;
  const boosterKnown = boosterFields.filter((field) => hasKnownValue(data[field])).length;
  const score = 50 + coreKnown * 1.4 + boosterKnown * 0.9;

  return Math.min(95, Math.max(50, Math.round(score)));
}

// ============================================================================
// Factor registry
//
// Every questionnaire signal is declared here once: which dimension it
// belongs to and how it contributes. Adding a new factor = adding one entry
// (plus display copy on the frontend). Order matters in two ways and must be
// preserved when inserting entries:
//   1. Entries are evaluated top-down; within a dimension the floating-point
//      accumulation order affects low bits locked by the golden tests.
//   2. risk/strength lists keep insertion order for equal values (stable sort).
//
// A contribution with a `key` is surfaced as a named risk (value < 0) or
// strength (value > 0); without a `key` it only moves the score.
// ============================================================================

interface FactorContribution {
  key?: string;
  value: number;
}

interface FactorDef {
  id: string;
  dimension: string;
  evaluate: (
    data: QuestionnaireData
  ) => FactorContribution | FactorContribution[] | null;
}

const DIMENSIONS = [
  "基础生物特征",
  "疾病与健康状况",
  "家族遗传史",
  "生活方式",
  "心理与社会因素",
  "环境与职业",
  "行为与认知模式",
  "睡眠深度指标",
  "免疫与炎症",
  "医疗资源获取",
  "进阶选填项",
] as const;

const CANCER_CONDITION_NAMES = ["cancer", "癌症", "恶性肿瘤"];

function matchesCancer(condition: string): boolean {
  return CANCER_CONDITION_NAMES.some((name) =>
    condition.toLowerCase().includes(name.toLowerCase())
  );
}

const FACTOR_REGISTRY: FactorDef[] = [
  // ===== DIMENSION 1: 基础生物特征 =====
  {
    id: "bmi",
    dimension: "基础生物特征",
    evaluate: (d) => {
      if (d.bmi < 18.5) return { key: "bmi_underweight", value: -1.5 };
      if (d.bmi >= 24 && d.bmi < 28) return { key: "bmi_overweight", value: -1 };
      if (d.bmi >= 28 && d.bmi <= 32) return { key: "bmi_obese_class1", value: -2.5 };
      if (d.bmi > 32) return { key: "bmi_obese_class2", value: -4 };
      return null;
    },
  },
  {
    id: "waist",
    dimension: "基础生物特征",
    evaluate: (d) => {
      const atRisk =
        (d.gender === "male" && d.waistCm > 90) ||
        (d.gender === "female" && d.waistCm > 80);
      return atRisk ? { key: "waist_risk", value: -1.5 } : null;
    },
  },

  // ===== DIMENSION 2: 疾病与健康状况 =====
  {
    id: "chronic_conditions",
    dimension: "疾病与健康状况",
    evaluate: (d) => {
      const conditions = getConditionList(d);
      const hasCancer = conditions.some(matchesCancer);
      const nonCancerCount = conditions.filter((c) => !matchesCancer(c)).length;

      if (d.cancerHistory || hasCancer) {
        return { key: "cancer_history", value: -5 };
      }
      if (nonCancerCount > 0) {
        return { key: "chronic_diseases", value: -nonCancerCount * 2 };
      }
      if (conditions.length === 0) {
        return { key: "no_chronic_disease", value: 1 };
      }
      return null;
    },
  },
  {
    id: "blood_pressure",
    dimension: "疾病与健康状况",
    evaluate: (d) => {
      switch (getBloodPressureStatus(d)) {
        case "normal":
          return { key: "normal_bp", value: 0.5 };
        case "elevated":
          return { key: "elevated_bp", value: -1 };
        case "stage1":
          return { key: "stage1_hypertension", value: -2 };
        case "stage2":
          return { key: "stage2_hypertension", value: -3 };
        default:
          return null;
      }
    },
  },
  {
    id: "blood_sugar",
    dimension: "疾病与健康状况",
    evaluate: (d) => {
      switch (getBloodSugarStatus(d)) {
        case "normal":
          return { key: "normal_glucose", value: 0.5 };
        case "prediabetes":
          return { key: "prediabetes", value: -1.5 };
        case "diabetes":
          return { key: "diabetes", value: -3 };
        default:
          return null;
      }
    },
  },
  {
    id: "regular_checkup",
    dimension: "疾病与健康状况",
    evaluate: (d) =>
      d.regularCheckup ? { key: "regular_checkup", value: 1 } : null,
  },
  {
    id: "ldl_cholesterol",
    dimension: "疾病与健康状况",
    evaluate: (d) => {
      if (d.ldlCholesterol === undefined) return null;
      if (d.ldlCholesterol >= 190) return { key: "very_high_ldl", value: -2 };
      if (d.ldlCholesterol >= 160) return { key: "high_ldl", value: -1.2 };
      if (d.ldlCholesterol < 100) return { key: "optimal_ldl", value: 0.5 };
      return null;
    },
  },

  // ===== DIMENSION 3: 家族遗传史 =====
  {
    id: "parent_longevity",
    dimension: "家族遗传史",
    evaluate: (d) => {
      switch (d.parentLongevity) {
        case "both_above_75":
          return { key: "parents_longevity_both", value: 3 };
        case "one_above_75":
          return { key: "parent_longevity_one", value: 1.5 };
        case "both_below_65":
          return { key: "parents_early_death", value: -3 };
        default:
          return null;
      }
    },
  },
  {
    id: "family_above_90",
    dimension: "家族遗传史",
    evaluate: (d) =>
      d.familyMemberAbove90 ? { key: "family_above_90", value: 2 } : null,
  },
  {
    id: "family_alzheimers",
    dimension: "家族遗传史",
    evaluate: (d) =>
      d.familyAlzheimers ? { key: "family_alzheimers", value: -1.5 } : null,
  },
  {
    id: "family_parkinsons",
    dimension: "家族遗传史",
    evaluate: (d) =>
      d.familyParkinsons ? { key: "family_parkinsons", value: -1 } : null,
  },
  {
    id: "family_heart_disease",
    dimension: "家族遗传史",
    evaluate: (d) =>
      d.familyHeartDisease ? { key: "family_heart_disease", value: -1.5 } : null,
  },
  {
    id: "family_cancer",
    dimension: "家族遗传史",
    evaluate: (d) =>
      d.familyCancer ? { key: "family_cancer", value: -2 } : null,
  },

  // ===== DIMENSION 4: 生活方式 =====
  {
    id: "smoking",
    dimension: "生活方式",
    evaluate: (d) => {
      switch (d.smokingStatus) {
        case "never":
          return { key: "never_smoked", value: 1 };
        case "quit_10y_plus":
          return { key: "quit_smoking_long", value: 0.5 };
        case "quit_under_10y":
          return { key: "quit_smoking_short", value: -0.5 };
        case "current_light":
          return { key: "current_light_smoker", value: -4 };
        case "current_heavy":
          return { key: "current_heavy_smoker", value: -12 };
        default:
          return null;
      }
    },
  },
  {
    id: "alcohol",
    dimension: "生活方式",
    evaluate: (d) => {
      switch (d.alcoholConsumption) {
        case "never":
          return { key: "no_alcohol", value: 0.5 };
        case "occasional":
          return { key: "moderate_alcohol", value: 0.5 };
        case "daily_heavy":
          return { key: "heavy_alcohol", value: -3 };
        default:
          return null;
      }
    },
  },
  {
    id: "activity",
    dimension: "生活方式",
    evaluate: (d) => {
      // v2 weekly-minutes signal wins over the legacy frequency question.
      if (d.activityMinutesPerWeek) {
        switch (d.activityMinutesPerWeek) {
          case "300_plus":
            return { key: "recommended_activity", value: 3.5 };
          case "150_300":
            return { key: "recommended_activity", value: 3 };
          case "90_149":
            return { key: "moderate_exercise", value: 1.5 };
          case "30_90":
            return { value: 0.5 };
          case "under_30":
            return { key: "low_activity", value: -3.5 };
          default:
            return null;
        }
      }
      switch (d.exerciseFrequency) {
        case "three_plus":
          return { key: "regular_exercise", value: 3 };
        case "one_to_two":
          return { key: "moderate_exercise", value: 1.5 };
        case "rarely":
          return { key: "no_exercise", value: -2 };
        default:
          return null;
      }
    },
  },
  {
    id: "strength_training",
    dimension: "生活方式",
    evaluate: (d) => {
      if (d.muscleStrengthening === "yes")
        return { key: "strength_training", value: 1 };
      if (d.muscleStrengthening === "no")
        return { key: "no_strength_training", value: -1.2 };
      return null;
    },
  },
  {
    id: "sedentary",
    dimension: "生活方式",
    evaluate: (d) => {
      if (d.sedentaryHours === "above_8")
        return { key: "sedentary_above_8h", value: -2.5 };
      if (d.sedentaryHours === "four_to_eight")
        return { key: "sedentary_4_8h", value: -1 };
      return null;
    },
  },
  {
    id: "diet_pattern",
    dimension: "生活方式",
    evaluate: (d) => {
      switch (d.dietPattern) {
        case "balanced":
          return { key: "balanced_diet", value: 2 };
        case "high_meat_salt":
          return { key: "unhealthy_diet", value: -2 };
        case "veggie_rich":
          return { key: "veggie_rich_diet", value: 1 };
        default:
          return null;
      }
    },
  },
  {
    id: "fruit_veg",
    dimension: "生活方式",
    evaluate: (d) => {
      if (d.dietFruitVegDays === "6_7") return { key: "high_fruit_veg", value: 1 };
      if (d.dietFruitVegDays === "0_2") return { key: "low_fruit_veg", value: -1 };
      return null;
    },
  },
  {
    id: "processed_food",
    dimension: "生活方式",
    evaluate: (d) => {
      if (d.processedFoodFrequency === "rare")
        return { key: "low_processed_food", value: 0.5 };
      if (d.processedFoodFrequency === "most_days")
        return { key: "processed_food_high", value: -1.2 };
      return null;
    },
  },
  {
    id: "sleep_hours",
    dimension: "生活方式",
    evaluate: (d) => {
      if (d.sleepHours >= 7 && d.sleepHours <= 8.5)
        return { key: "healthy_sleep", value: 1 };
      if (d.sleepHours < 5) return { key: "insufficient_sleep", value: -3 };
      if (d.sleepHours < 7) return { key: "insufficient_sleep", value: -2.2 };
      if (d.sleepHours > 9) return { key: "excessive_sleep", value: -1 };
      return null;
    },
  },
  {
    id: "sleep_quality",
    dimension: "生活方式",
    evaluate: (d) => {
      if (d.sleepQuality === "refreshed")
        return { key: "good_sleep_quality", value: 0.7 };
      if (d.sleepQuality === "unrefreshed")
        return { key: "poor_sleep_quality", value: -1 };
      return null;
    },
  },

  // ===== DIMENSION 5: 心理与社会因素 =====
  {
    id: "happiness",
    dimension: "心理与社会因素",
    evaluate: (d) => {
      if (d.happinessScore >= 8) return { key: "high_happiness", value: 2 };
      if (d.happinessScore >= 5) return { value: 0.5 };
      return { key: "low_happiness", value: -2 };
    },
  },
  {
    id: "stress",
    dimension: "心理与社会因素",
    evaluate: (d) => {
      if (d.chronicStress) return { key: "chronic_stress", value: -2 };
      if (d.stressFrequency === "rare") return { key: "low_stress", value: 0.5 };
      return null;
    },
  },
  {
    id: "depression",
    dimension: "心理与社会因素",
    evaluate: (d) =>
      d.depressionTendency ? { key: "depression_tendency", value: -2 } : null,
  },
  {
    id: "stable_partner",
    dimension: "心理与社会因素",
    evaluate: (d) =>
      d.stablePartner ? { key: "stable_partner", value: 1 } : null,
  },
  {
    id: "social_activity",
    dimension: "心理与社会因素",
    evaluate: (d) => {
      if (d.socialActivity === "high") return { key: "high_social", value: 1 };
      if (d.socialActivity === "isolated")
        return { key: "social_isolation", value: -2 };
      return null;
    },
  },
  {
    id: "social_connection",
    dimension: "心理与社会因素",
    evaluate: (d) =>
      d.socialConnection === "strong"
        ? { key: "strong_social_connection", value: 0.5 }
        : null,
  },
  {
    id: "purpose",
    dimension: "心理与社会因素",
    evaluate: (d) => {
      if (d.senseOfPurpose) return { key: "sense_of_purpose", value: 1.5 };
      if (d.purposeLevel === "somewhat") return { value: 0.5 };
      return null;
    },
  },
  {
    id: "education",
    dimension: "心理与社会因素",
    evaluate: (d) =>
      d.educationLevel === "bachelor_plus"
        ? { key: "higher_education", value: 1 }
        : null,
  },

  // ===== DIMENSION 6: 环境与职业 =====
  {
    id: "high_risk_occupation",
    dimension: "环境与职业",
    evaluate: (d) =>
      d.highRiskOccupation ? { key: "high_risk_occupation", value: -2 } : null,
  },
  {
    id: "overwork",
    dimension: "环境与职业",
    evaluate: (d) =>
      d.weeklyWorkHours && d.weeklyWorkHours > 55
        ? { key: "overwork", value: -2 }
        : null,
  },
  {
    id: "noise",
    dimension: "环境与职业",
    evaluate: (d) =>
      d.longTermNoise ? { key: "noise_exposure", value: -1 } : null,
  },
  {
    id: "air_pollution",
    dimension: "环境与职业",
    evaluate: (d) =>
      d.airPollutionExposure === "high"
        ? { key: "high_air_pollution", value: -1.2 }
        : null,
  },
  {
    id: "secondhand_smoke",
    dimension: "环境与职业",
    evaluate: (d) =>
      d.secondhandSmoke === "yes"
        ? { key: "secondhand_smoke", value: -1.5 }
        : null,
  },
  {
    id: "income",
    dimension: "环境与职业",
    evaluate: (d) =>
      d.incomeLevel === "high" ? { key: "high_income", value: 1 } : null,
  },

  // ===== DIMENSION 7: 行为与认知模式 =====
  {
    id: "self_discipline",
    dimension: "行为与认知模式",
    evaluate: (d) =>
      d.selfDisciplineScore !== undefined && d.selfDisciplineScore >= 8
        ? { key: "high_discipline", value: 2 }
        : null,
  },
  {
    id: "positive_aging",
    dimension: "行为与认知模式",
    evaluate: (d) =>
      d.positiveAgingAttitude ? { key: "positive_aging", value: 2 } : null,
  },
  {
    id: "reading",
    dimension: "行为与认知模式",
    evaluate: (d) =>
      d.readingHabit ? { key: "reading_habit", value: 1 } : null,
  },
  {
    id: "risk_behaviors",
    dimension: "行为与认知模式",
    evaluate: (d) =>
      d.highRiskBehaviors ? { key: "high_risk_behaviors", value: -2 } : null,
  },

  // ===== DIMENSION 8: 睡眠深度指标 =====
  {
    id: "bedtime",
    dimension: "睡眠深度指标",
    evaluate: (d) =>
      d.bedtimeRange === "22_23" ? { key: "optimal_bedtime", value: 1 } : null,
  },
  {
    id: "sleep_apnea",
    dimension: "睡眠深度指标",
    evaluate: (d) =>
      d.untreatedSleepApnea
        ? { key: "untreated_sleep_apnea", value: -3 }
        : null,
  },
  {
    id: "napping",
    dimension: "睡眠深度指标",
    evaluate: (d) =>
      d.moderateNapping ? { key: "moderate_napping", value: 0.5 } : null,
  },
  {
    id: "pre_sleep_screen",
    dimension: "睡眠深度指标",
    evaluate: (d) =>
      d.preSleepScreenTime ? { key: "pre_sleep_screen", value: -0.5 } : null,
  },

  // ===== DIMENSION 9: 免疫与炎症 =====
  {
    id: "frequent_illness",
    dimension: "免疫与炎症",
    evaluate: (d) =>
      d.frequentIllness ? { key: "frequent_illness", value: -1.5 } : null,
  },
  {
    id: "autoimmune",
    dimension: "免疫与炎症",
    evaluate: (d) =>
      d.autoimmuneDisease ? { key: "autoimmune_disease", value: -1 } : null,
  },
  {
    id: "inflammation",
    dimension: "免疫与炎症",
    evaluate: (d) =>
      d.chronicInflammation
        ? { key: "chronic_inflammation", value: -1.5 }
        : null,
  },

  // ===== DIMENSION 10: 医疗资源获取 =====
  {
    id: "hospital_distance",
    dimension: "医疗资源获取",
    evaluate: (d) =>
      d.distanceToHospital === "over_30min"
        ? { key: "hospital_distance", value: -1 }
        : null,
  },
  {
    id: "insurance",
    dimension: "医疗资源获取",
    evaluate: (d) =>
      d.commercialInsurance
        ? { key: "commercial_insurance", value: 0.5 }
        : null,
  },
  {
    id: "checkup_count",
    dimension: "医疗资源获取",
    evaluate: (d) =>
      d.recentCheckupCount !== undefined && d.recentCheckupCount >= 3
        ? { key: "frequent_checkups", value: 1 }
        : null,
  },
  {
    id: "cancer_screening",
    dimension: "医疗资源获取",
    evaluate: (d) => {
      if (d.cancerScreeningStatus === "up_to_date")
        return { key: "up_to_date_screening", value: 1 };
      if (d.cancerScreeningStatus === "not_up_to_date")
        return { key: "screening_not_up_to_date", value: -1 };
      return null;
    },
  },
  {
    id: "dental",
    dimension: "医疗资源获取",
    evaluate: (d) =>
      d.dentalCheckup === "within_year"
        ? { key: "dental_checkup", value: 0.5 }
        : null,
  },
  {
    id: "family_doctor",
    dimension: "医疗资源获取",
    evaluate: (d) =>
      d.hasFamilyDoctor ? { key: "family_doctor", value: 0.5 } : null,
  },

  // ===== DIMENSION 11: 进阶选填项 =====
  {
    id: "resting_heart_rate",
    dimension: "进阶选填项",
    evaluate: (d) => {
      if (d.restingHeartRate === undefined) return null;
      if (d.restingHeartRate < 60) return { key: "low_resting_hr", value: 1.5 };
      if (d.restingHeartRate <= 70) return { value: 0.5 };
      if (d.restingHeartRate > 90) return { key: "high_resting_hr", value: -1.5 };
      return null;
    },
  },
  {
    id: "vo2max",
    dimension: "进阶选填项",
    evaluate: (d) => {
      if (d.vo2maxLevel === "excellent")
        return { key: "excellent_vo2max", value: 2 };
      if (d.vo2maxLevel === "poor") return { key: "poor_vo2max", value: -1 };
      return null;
    },
  },
  {
    id: "grip_strength",
    dimension: "进阶选填项",
    evaluate: (d) => {
      if (d.gripStrength === "strong") return { key: "strong_grip", value: 1 };
      if (d.gripStrength === "weak") return { key: "weak_grip", value: -1 };
      return null;
    },
  },
  {
    id: "stair_climb",
    dimension: "进阶选填项",
    evaluate: (d) => {
      if (d.climbThreeFloors === "yes")
        return { key: "good_stair_climb", value: 1 };
      if (d.climbThreeFloors === "no")
        return { key: "poor_stair_climb", value: -1.5 };
      return null;
    },
  },
  {
    id: "walking_pace",
    dimension: "进阶选填项",
    evaluate: (d) => {
      if (d.walkingPace === "brisk")
        return { key: "brisk_walking_pace", value: 1 };
      if (d.walkingPace === "slow")
        return { key: "slow_walking_pace", value: -1.2 };
      return null;
    },
  },
  {
    id: "weight_loss",
    dimension: "进阶选填项",
    evaluate: (d) =>
      d.unintendedWeightLoss
        ? { key: "unintended_weight_loss", value: -2 }
        : null,
  },
];

export function calculateLifeExpectancy(
  data: QuestionnaireData
): AlgorithmResult {
  const baseLifeExpectancy = getBaseLifeExpectancy(data.gender, data.age);

  const riskFactors: { name: string; value: number }[] = [];
  const strengthFactors: { name: string; value: number }[] = [];
  const dimensionScores: Record<string, number> = Object.fromEntries(
    DIMENSIONS.map((dimension) => [dimension, 0])
  );

  for (const factor of FACTOR_REGISTRY) {
    const evaluated = factor.evaluate(data);
    if (!evaluated) continue;
    const contributions = Array.isArray(evaluated) ? evaluated : [evaluated];
    for (const contribution of contributions) {
      dimensionScores[factor.dimension] += contribution.value;
      if (contribution.key) {
        (contribution.value < 0 ? riskFactors : strengthFactors).push({
          name: contribution.key,
          value: contribution.value,
        });
      }
    }
  }

  // Sum dimension subtotals (same accumulation order as the pre-registry
  // implementation, so float low bits stay identical for the golden tests).
  const totalAdjustment = DIMENSIONS.reduce(
    (sum, dimension) => sum + dimensionScores[dimension],
    0
  );


  // Older users need an age-conditioned baseline; otherwise a high-risk
  // result can produce a nonsensical lifespan below the user's current age.
  const scaledAdjustment = totalAdjustment * getAdjustmentScale(data.age);
  const cappedAdjustment = Math.max(
    -20,
    Math.min(MAX_POSITIVE_ADJUSTMENT, scaledAdjustment)
  );
  const minimumFutureAge = data.age + 1;
  const adjustedLifeExpectancy = Math.max(
    baseLifeExpectancy + cappedAdjustment,
    minimumFutureAge
  );
  const adjustedMin = Math.max(
    data.age,
    Math.round((adjustedLifeExpectancy - 5) * 10) / 10
  );
  const adjustedMax = Math.max(
    adjustedMin + 1,
    Math.round((adjustedLifeExpectancy + 5) * 10) / 10
  );
  const healthLifespan = Math.max(data.age, Math.round(adjustedLifeExpectancy * 0.88));

  // Top 3 risks and strengths
  const sortedRisks = riskFactors.sort((a, b) => a.value - b.value);
  const sortedStrengths = strengthFactors.sort((a, b) => b.value - a.value);

  const topRisks = sortedRisks.slice(0, 3).map((r) => r.name);
  const topStrengths = sortedStrengths.slice(0, 3).map((s) => s.name);

  // Potential gain from fixing top 3 risks
  const potentialGain = Math.round(
    Math.abs(sortedRisks.slice(0, 3).reduce((sum, r) => sum + r.value, 0)) *
      10
  ) / 10;

  // Confidence level calculation
  let confidenceLevel = 60;
  const filledDimensions = Object.keys(dimensionScores).filter(
    (k) => dimensionScores[k] !== undefined
  ).length;
  confidenceLevel += filledDimensions * 4;

  // Advanced optional fields bonus
  const advancedFields = [
    data.selfDisciplineScore,
    data.positiveAgingAttitude,
    data.readingHabit,
    data.highRiskBehaviors,
    data.bedtimeRange,
    data.untreatedSleepApnea,
    data.moderateNapping,
    data.preSleepScreenTime,
    data.frequentIllness,
    data.autoimmuneDisease,
    data.chronicInflammation,
    data.distanceToHospital,
    data.commercialInsurance,
    data.recentCheckupCount,
    data.hasFamilyDoctor,
    data.restingHeartRate,
    data.vo2maxLevel,
    data.gripStrength,
    data.unintendedWeightLoss,
  ];
  const filledAdvanced = advancedFields.filter(
    (f) => f !== undefined && f !== null && f !== ""
  ).length;
  confidenceLevel += filledAdvanced;

  if (data.formVersion === "v2") {
    confidenceLevel = calculateV2Confidence(data);
  }

  confidenceLevel = Math.min(95, confidenceLevel);

  const { percentile, totalAdjustment: effectiveTotalAdjustment } =
    deriveLifeExpectancyMetrics(
    data.gender,
    adjustedLifeExpectancy,
    data.age
  );
  const roundedBaselineLifeExpectancy = Math.round(baseLifeExpectancy * 10) / 10;
  const roundedAdjustedLifeExpectancy = Math.round(adjustedLifeExpectancy * 10) / 10;

  return {
    baselineLifeExpectancy: roundedBaselineLifeExpectancy,
    adjustedLifeExpectancy: roundedAdjustedLifeExpectancy,
    baseLifeExpectancy: roundedAdjustedLifeExpectancy,
    adjustedMin,
    adjustedMax,
    healthLifespan,
    dimensionScores,
    topRisks,
    topStrengths,
    potentialGain,
    confidenceLevel,
    percentile,
    totalAdjustment: effectiveTotalAdjustment,
    lifeScore: computeLifeScore(
      percentile,
      effectiveTotalAdjustment,
      confidenceLevel
    ),
    healthAge: computeHealthAge(data.age, effectiveTotalAdjustment),
    healthAgeDelta:
      computeHealthAge(data.age, effectiveTotalAdjustment) - data.age,
  };
}
