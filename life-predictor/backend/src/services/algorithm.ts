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
}

interface DimensionResult {
  name: string;
  score: number;
  weight: number;
}

interface AlgorithmResult {
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
}

const BASE_LIFE_EXPECTANCY_MALE = 75.0;
const BASE_LIFE_EXPECTANCY_FEMALE = 80.0;
const STD_DEV = 8.0;

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

export function calculateLifeExpectancy(
  data: QuestionnaireData
): AlgorithmResult {
  const baseLifeExpectancy =
    data.gender === "male"
      ? BASE_LIFE_EXPECTANCY_MALE
      : BASE_LIFE_EXPECTANCY_FEMALE;

  let totalAdjustment = 0;
  const riskFactors: { name: string; value: number }[] = [];
  const strengthFactors: { name: string; value: number }[] = [];
  const dimensionScores: Record<string, number> = {};

  // ===== DIMENSION 1: 基础生物特征 (weight 15%) =====
  let dim1 = 0;

  // BMI scoring
  if (data.bmi < 18.5) {
    dim1 -= 1.5;
    riskFactors.push({ name: "bmi_underweight", value: -1.5 });
  } else if (data.bmi >= 18.5 && data.bmi < 24) {
    // normal, no change
  } else if (data.bmi >= 24 && data.bmi < 28) {
    dim1 -= 1;
    riskFactors.push({ name: "bmi_overweight", value: -1 });
  } else if (data.bmi >= 28 && data.bmi <= 32) {
    dim1 -= 2.5;
    riskFactors.push({ name: "bmi_obese_class1", value: -2.5 });
  } else if (data.bmi > 32) {
    dim1 -= 4;
    riskFactors.push({ name: "bmi_obese_class2", value: -4 });
  }

  // Waist circumference risk
  const waistRiskMale = data.gender === "male" && data.waistCm > 90;
  const waistRiskFemale = data.gender === "female" && data.waistCm > 80;
  if (waistRiskMale || waistRiskFemale) {
    dim1 -= 1.5;
    riskFactors.push({ name: "waist_risk", value: -1.5 });
  }

  dimensionScores["基础生物特征"] = dim1;
  totalAdjustment += dim1;

  // ===== DIMENSION 2: 疾病与健康状况 (weight 20%) =====
  let dim2 = 0;

  // Chronic diseases
  const cancerDiseases = ["cancer", "癌症", "恶性肿瘤"];
  const hasCancer = data.chronicDiseases.some((d) =>
    cancerDiseases.some((c) => d.toLowerCase().includes(c.toLowerCase()))
  );
  const nonCancerChronicCount = data.chronicDiseases.filter(
    (d) => !cancerDiseases.some((c) => d.toLowerCase().includes(c.toLowerCase()))
  ).length;

  if (data.cancerHistory || hasCancer) {
    dim2 -= 5;
    riskFactors.push({ name: "cancer_history", value: -5 });
  } else if (nonCancerChronicCount > 0) {
    dim2 -= nonCancerChronicCount * 2;
    riskFactors.push({
      name: "chronic_diseases",
      value: -nonCancerChronicCount * 2,
    });
  } else if (data.chronicDiseases.length === 0) {
    dim2 += 1;
    strengthFactors.push({ name: "no_chronic_disease", value: 1 });
  }

  // Blood pressure
  switch (data.bloodPressure) {
    case "normal":
      dim2 += 0.5;
      strengthFactors.push({ name: "normal_bp", value: 0.5 });
      break;
    case "elevated":
      dim2 -= 1;
      riskFactors.push({ name: "elevated_bp", value: -1 });
      break;
    case "stage1":
      dim2 -= 2;
      riskFactors.push({ name: "stage1_hypertension", value: -2 });
      break;
    case "stage2":
      dim2 -= 3;
      riskFactors.push({ name: "stage2_hypertension", value: -3 });
      break;
  }

  // Blood sugar
  switch (data.bloodSugar) {
    case "normal":
      dim2 += 0.5;
      strengthFactors.push({ name: "normal_glucose", value: 0.5 });
      break;
    case "prediabetes":
      dim2 -= 1.5;
      riskFactors.push({ name: "prediabetes", value: -1.5 });
      break;
    case "diabetes":
      dim2 -= 3;
      riskFactors.push({ name: "diabetes", value: -3 });
      break;
  }

  // Regular checkup
  if (data.regularCheckup) {
    dim2 += 1;
    strengthFactors.push({ name: "regular_checkup", value: 1 });
  }

  dimensionScores["疾病与健康状况"] = dim2;
  totalAdjustment += dim2;

  // ===== DIMENSION 3: 家族遗传史 (weight 15%) =====
  let dim3 = 0;

  switch (data.parentLongevity) {
    case "both_above_75":
      dim3 += 3;
      strengthFactors.push({ name: "parents_longevity_both", value: 3 });
      break;
    case "one_above_75":
      dim3 += 1.5;
      strengthFactors.push({ name: "parent_longevity_one", value: 1.5 });
      break;
    case "both_below_65":
      dim3 -= 3;
      riskFactors.push({ name: "parents_early_death", value: -3 });
      break;
  }

  if (data.familyMemberAbove90) {
    dim3 += 2;
    strengthFactors.push({ name: "family_above_90", value: 2 });
  }

  if (data.familyAlzheimers) {
    dim3 -= 1.5;
    riskFactors.push({ name: "family_alzheimers", value: -1.5 });
  }
  if (data.familyParkinsons) {
    dim3 -= 1;
    riskFactors.push({ name: "family_parkinsons", value: -1 });
  }
  if (data.familyHeartDisease) {
    dim3 -= 1.5;
    riskFactors.push({ name: "family_heart_disease", value: -1.5 });
  }
  if (data.familyCancer) {
    dim3 -= 2;
    riskFactors.push({ name: "family_cancer", value: -2 });
  }

  dimensionScores["家族遗传史"] = dim3;
  totalAdjustment += dim3;

  // ===== DIMENSION 4: 生活方式 (weight 25%) =====
  let dim4 = 0;

  // Smoking
  switch (data.smokingStatus) {
    case "never":
      dim4 += 1;
      strengthFactors.push({ name: "never_smoked", value: 1 });
      break;
    case "quit_10y_plus":
      dim4 += 0.5;
      strengthFactors.push({ name: "quit_smoking_long", value: 0.5 });
      break;
    case "quit_under_10y":
      dim4 -= 0.5;
      riskFactors.push({ name: "quit_smoking_short", value: -0.5 });
      break;
    case "current_light":
      dim4 -= 3;
      riskFactors.push({ name: "current_light_smoker", value: -3 });
      break;
    case "current_heavy":
      dim4 -= 6;
      riskFactors.push({ name: "current_heavy_smoker", value: -6 });
      break;
  }

  // Alcohol
  switch (data.alcoholConsumption) {
    case "never":
      dim4 += 0.5;
      strengthFactors.push({ name: "no_alcohol", value: 0.5 });
      break;
    case "occasional":
      dim4 += 0.5;
      strengthFactors.push({ name: "moderate_alcohol", value: 0.5 });
      break;
    case "weekly_moderate":
      // neutral
      break;
    case "daily_heavy":
      dim4 -= 3;
      riskFactors.push({ name: "heavy_alcohol", value: -3 });
      break;
  }

  // Exercise
  switch (data.exerciseFrequency) {
    case "three_plus":
      dim4 += 3;
      strengthFactors.push({ name: "regular_exercise", value: 3 });
      break;
    case "one_to_two":
      dim4 += 1.5;
      strengthFactors.push({ name: "moderate_exercise", value: 1.5 });
      break;
    case "rarely":
      dim4 -= 2;
      riskFactors.push({ name: "no_exercise", value: -2 });
      break;
  }

  // Sedentary
  if (data.sedentaryHours === "above_8") {
    dim4 -= 2;
    riskFactors.push({ name: "sedentary_above_8h", value: -2 });
  } else if (data.sedentaryHours === "four_to_eight") {
    dim4 -= 1;
    riskFactors.push({ name: "sedentary_4_8h", value: -1 });
  }

  // Diet
  switch (data.dietPattern) {
    case "balanced":
      dim4 += 2;
      strengthFactors.push({ name: "balanced_diet", value: 2 });
      break;
    case "high_meat_salt":
      dim4 -= 2;
      riskFactors.push({ name: "unhealthy_diet", value: -2 });
      break;
    case "veggie_rich":
      dim4 += 1;
      strengthFactors.push({ name: "veggie_rich_diet", value: 1 });
      break;
  }

  // Sleep hours
  if (data.sleepHours >= 6 && data.sleepHours <= 8) {
    dim4 += 1;
    strengthFactors.push({ name: "healthy_sleep", value: 1 });
  } else if (data.sleepHours < 5) {
    dim4 -= 3;
    riskFactors.push({ name: "insufficient_sleep", value: -3 });
  } else if (data.sleepHours > 9) {
    dim4 -= 1;
    riskFactors.push({ name: "excessive_sleep", value: -1 });
  }

  dimensionScores["生活方式"] = dim4;
  totalAdjustment += dim4;

  // ===== DIMENSION 5: 心理与社会因素 (weight 15%) =====
  let dim5 = 0;

  if (data.happinessScore >= 8) {
    dim5 += 2;
    strengthFactors.push({ name: "high_happiness", value: 2 });
  } else if (data.happinessScore >= 5) {
    dim5 += 0.5;
  } else {
    dim5 -= 2;
    riskFactors.push({ name: "low_happiness", value: -2 });
  }

  if (data.chronicStress) {
    dim5 -= 2;
    riskFactors.push({ name: "chronic_stress", value: -2 });
  }

  if (data.depressionTendency) {
    dim5 -= 2;
    riskFactors.push({ name: "depression_tendency", value: -2 });
  }

  if (data.stablePartner) {
    dim5 += 1;
    strengthFactors.push({ name: "stable_partner", value: 1 });
  }

  if (data.socialActivity === "high") {
    dim5 += 1;
    strengthFactors.push({ name: "high_social", value: 1 });
  } else if (data.socialActivity === "isolated") {
    dim5 -= 2;
    riskFactors.push({ name: "social_isolation", value: -2 });
  }

  if (data.senseOfPurpose) {
    dim5 += 1.5;
    strengthFactors.push({ name: "sense_of_purpose", value: 1.5 });
  }

  if (data.educationLevel === "bachelor_plus") {
    dim5 += 1;
    strengthFactors.push({ name: "higher_education", value: 1 });
  }

  dimensionScores["心理与社会因素"] = dim5;
  totalAdjustment += dim5;

  // ===== DIMENSION 6: 环境与职业 (weight 10%) =====
  let dim6 = 0;

  if (data.highRiskOccupation) {
    dim6 -= 2;
    riskFactors.push({ name: "high_risk_occupation", value: -2 });
  }

  if (data.weeklyWorkHours && data.weeklyWorkHours > 55) {
    dim6 -= 2;
    riskFactors.push({ name: "overwork", value: -2 });
  }

  if (data.longTermNoise) {
    dim6 -= 1;
    riskFactors.push({ name: "noise_exposure", value: -1 });
  }

  if (data.incomeLevel === "high") {
    dim6 += 1;
    strengthFactors.push({ name: "high_income", value: 1 });
  }

  dimensionScores["环境与职业"] = dim6;
  totalAdjustment += dim6;

  // ===== DIMENSION 7: 行为与认知模式 =====
  let dim7 = 0;

  if (data.selfDisciplineScore !== undefined && data.selfDisciplineScore >= 8) {
    dim7 += 2;
    strengthFactors.push({ name: "high_discipline", value: 2 });
  }

  if (data.positiveAgingAttitude) {
    dim7 += 2;
    strengthFactors.push({ name: "positive_aging", value: 2 });
  }

  if (data.readingHabit) {
    dim7 += 1;
    strengthFactors.push({ name: "reading_habit", value: 1 });
  }

  if (data.highRiskBehaviors) {
    dim7 -= 2;
    riskFactors.push({ name: "high_risk_behaviors", value: -2 });
  }

  dimensionScores["行为与认知模式"] = dim7;
  totalAdjustment += dim7;

  // ===== DIMENSION 8: 睡眠深度指标 =====
  let dim8 = 0;

  if (data.bedtimeRange === "22_23") {
    dim8 += 1;
    strengthFactors.push({ name: "optimal_bedtime", value: 1 });
  }

  if (data.untreatedSleepApnea) {
    dim8 -= 2;
    riskFactors.push({ name: "untreated_sleep_apnea", value: -2 });
  }

  if (data.moderateNapping) {
    dim8 += 0.5;
    strengthFactors.push({ name: "moderate_napping", value: 0.5 });
  }

  if (data.preSleepScreenTime) {
    dim8 -= 0.5;
    riskFactors.push({ name: "pre_sleep_screen", value: -0.5 });
  }

  dimensionScores["睡眠深度指标"] = dim8;
  totalAdjustment += dim8;

  // ===== DIMENSION 9: 免疫与炎症 =====
  let dim9 = 0;

  if (data.frequentIllness) {
    dim9 -= 1.5;
    riskFactors.push({ name: "frequent_illness", value: -1.5 });
  }

  if (data.autoimmuneDisease) {
    dim9 -= 1;
    riskFactors.push({ name: "autoimmune_disease", value: -1 });
  }

  if (data.chronicInflammation) {
    dim9 -= 1.5;
    riskFactors.push({ name: "chronic_inflammation", value: -1.5 });
  }

  dimensionScores["免疫与炎症"] = dim9;
  totalAdjustment += dim9;

  // ===== DIMENSION 10: 医疗资源获取 =====
  let dim10 = 0;

  if (data.distanceToHospital === "over_30min") {
    dim10 -= 1;
    riskFactors.push({ name: "hospital_distance", value: -1 });
  }

  if (data.commercialInsurance) {
    dim10 += 0.5;
    strengthFactors.push({ name: "commercial_insurance", value: 0.5 });
  }

  if (data.recentCheckupCount !== undefined && data.recentCheckupCount >= 3) {
    dim10 += 1;
    strengthFactors.push({ name: "frequent_checkups", value: 1 });
  }

  if (data.hasFamilyDoctor) {
    dim10 += 0.5;
    strengthFactors.push({ name: "family_doctor", value: 0.5 });
  }

  dimensionScores["医疗资源获取"] = dim10;
  totalAdjustment += dim10;

  // ===== DIMENSION 11: 进阶选填项 =====
  let dim11 = 0;

  if (data.restingHeartRate !== undefined) {
    if (data.restingHeartRate < 60) {
      dim11 += 1.5;
      strengthFactors.push({ name: "low_resting_hr", value: 1.5 });
    } else if (data.restingHeartRate <= 70) {
      dim11 += 0.5;
    } else if (data.restingHeartRate > 90) {
      dim11 -= 1.5;
      riskFactors.push({ name: "high_resting_hr", value: -1.5 });
    }
  }

  if (data.vo2maxLevel === "excellent") {
    dim11 += 2;
    strengthFactors.push({ name: "excellent_vo2max", value: 2 });
  } else if (data.vo2maxLevel === "poor") {
    dim11 -= 1;
    riskFactors.push({ name: "poor_vo2max", value: -1 });
  }

  if (data.gripStrength === "strong") {
    dim11 += 1;
    strengthFactors.push({ name: "strong_grip", value: 1 });
  }

  if (data.unintendedWeightLoss) {
    dim11 -= 2;
    riskFactors.push({ name: "unintended_weight_loss", value: -2 });
  }

  dimensionScores["进阶选填项"] = dim11;
  totalAdjustment += dim11;

  // Clamp total adjustment to [-20, +20]
  totalAdjustment = Math.max(-20, Math.min(20, totalAdjustment));

  const adjustedLifeExpectancy = baseLifeExpectancy + totalAdjustment;
  const adjustedMin = Math.round((adjustedLifeExpectancy - 5) * 10) / 10;
  const adjustedMax = Math.round((adjustedLifeExpectancy + 5) * 10) / 10;
  const healthLifespan = Math.round(adjustedLifeExpectancy * 0.88);

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

  confidenceLevel = Math.min(95, confidenceLevel);

  // Percentile calculation
  const percentile = Math.round(
    normalCDF(adjustedLifeExpectancy, baseLifeExpectancy, STD_DEV) * 100
  );

  return {
    baseLifeExpectancy: Math.round(adjustedLifeExpectancy * 10) / 10,
    adjustedMin,
    adjustedMax,
    healthLifespan,
    dimensionScores,
    topRisks,
    topStrengths,
    potentialGain,
    confidenceLevel,
    percentile,
    totalAdjustment,
  };
}
