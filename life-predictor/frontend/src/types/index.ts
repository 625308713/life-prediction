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
}

export interface PredictionResult {
  id: string;
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

export interface PredictionDetail {
  id: string;
  createdAt: string;
  age: number;
  gender: string;
  baseLifeExpectancy: number;
  adjustedMin: number;
  adjustedMax: number;
  healthLifespan: number;
  dimensionScores: Record<string, number>;
  topRisks: string[];
  topStrengths: string[];
  potentialGain: number;
  confidenceLevel: number;
  aiReport: string | null;
  aiReportGeneratedAt: string | null;
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
