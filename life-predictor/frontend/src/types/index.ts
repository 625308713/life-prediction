// ---- Shared Types (frontend/backend aligned) ----

export interface QuestionnaireData {
  // Step 1: Basic biometrics
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  bmi: number;
  waistCm: number;
  ethnicity: string;

  // Step 2: Health & diseases
  chronicDiseases: string[];
  cancerHistory: boolean;
  bloodPressure: string;
  bloodSugar: string;
  cholesterolLevel?: string;
  regularCheckup: boolean;
  currentMedications: string[];

  // Step 3: Family history
  parentLongevity: string;
  familyMemberAbove90: boolean;
  familyAlzheimers: boolean;
  familyParkinsons: boolean;
  familyHeartDisease: boolean;
  familyCancer: boolean;

  // Step 4: Lifestyle
  smokingStatus: string;
  alcoholConsumption: string;
  exerciseFrequency: string;
  sedentaryHours: string;
  dietPattern: string;
  sleepHours: number;
  waterIntake?: string;

  // Step 5: Mental & social
  happinessScore: number;
  chronicStress: boolean;
  depressionTendency: boolean;
  stablePartner: boolean;
  socialActivity: string;
  senseOfPurpose: boolean;
  educationLevel?: string;

  // Step 6: Environment & occupation
  highRiskOccupation: boolean;
  weeklyWorkHours?: number;
  longTermNoise: boolean;
  incomeLevel?: string;

  // Step 7: Behavior & cognition
  selfDisciplineScore?: number;
  positiveAgingAttitude?: boolean;
  readingHabit?: boolean;
  highRiskBehaviors?: boolean;

  // Step 8: Sleep depth
  bedtimeRange?: string;
  untreatedSleepApnea?: boolean;
  moderateNapping?: boolean;
  preSleepScreenTime?: boolean;

  // Step 9: Immune & inflammation
  frequentIllness?: boolean;
  autoimmuneDisease?: boolean;
  chronicInflammation?: boolean;

  // Step 10: Medical access
  distanceToHospital?: string;
  commercialInsurance?: boolean;
  recentCheckupCount?: number;
  hasFamilyDoctor?: boolean;

  // Step 11: Advanced optional
  restingHeartRate?: number;
  vo2maxLevel?: string;
  gripStrength?: string;
  unintendedWeightLoss?: boolean;

  // Questionnaire v2: higher-signal product fields, kept optional for
  // backward compatibility with saved drafts and the current database schema.
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

export interface PredictionResult {
  id: string;
  baselineLifeExpectancy?: number;
  adjustedLifeExpectancy?: number;
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
  age?: number;
  healthAge?: number;
  healthAgeDelta?: number;
  aiReportEnabled?: boolean;
}

export interface PredictionDetail {
  id: string;
  createdAt: string;
  age: number;
  gender: string;
  baselineLifeExpectancy?: number;
  adjustedLifeExpectancy?: number;
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
  healthAge?: number;
  healthAgeDelta?: number;
  aiReportEnabled: boolean;
  aiReport: string | null;
  aiReportGeneratedAt: string | null;
}

export interface PredictionShare {
  id: string;
  topRisks: string[];
  topStrengths: string[];
  potentialGain: number;
  confidenceLevel: number;
  percentile: number;
  totalAdjustment: number;
  lifeScore: number;
  healthAgeDelta?: number;
}

export interface AdminStats {
  totalCount: number;
  todayCount: number;
  avgLifeExpectancy: number;
  avgAge: number;
  genderDistribution: { male: number; female: number };
  ageDistribution: Record<string, number>;
  dailySubmissions: { date: string; count: number }[];
  bmiDistribution: Record<string, number>;
  lifeExpectancyDistribution: Record<string, number>;
  top10Risks: { name: string; count: number }[];
  leadsCount?: number;
  funnel?: { type: string; count: number }[];
}

export interface AdminPrediction {
  id: string;
  createdAt: string;
  gender: string;
  age: number;
  bmi: number;
  baseLifeExpectancy: number;
  adjustedMin: number;
  adjustedMax: number;
  confidenceLevel: number;
}

export interface AdminPredictionList {
  predictions: AdminPrediction[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

export type Language = "zh" | "en";
