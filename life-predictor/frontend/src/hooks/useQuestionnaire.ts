import { useState, useCallback, useEffect } from "react";
import type { QuestionnaireData } from "../types";

const STORAGE_KEY = "life_predictor_questionnaire";

// Choice questions intentionally start unanswered ("" / empty list): a user
// must make an explicit selection on each core step before moving on, so an
// all-defaults submission is impossible. Legacy mirror fields keep neutral
// values and are overwritten by the v2 selections.
const defaultData: QuestionnaireData = {
  formVersion: "v2",
  region: undefined,
  age: 30,
  gender: "",
  heightCm: 170,
  weightKg: 65,
  bmi: 22.5,
  waistCm: 80,
  ethnicity: "east_asian",
  chronicDiseases: [],
  diagnosedConditions: [],
  cancerHistory: false,
  bloodPressure: "unknown",
  bloodPressureKnown: "",
  bloodSugar: "unknown",
  bloodSugarKnown: "",
  cholesterolLevel: undefined,
  regularCheckup: false,
  currentMedications: [],
  parentLongevity: "other",
  familyMemberAbove90: false,
  familyAlzheimers: false,
  familyParkinsons: false,
  familyHeartDisease: false,
  familyCancer: false,
  smokingStatus: "never",
  smokingAmount: "",
  alcoholConsumption: "occasional",
  alcoholPattern: "",
  exerciseFrequency: "one_to_two",
  activityMinutesPerWeek: "",
  muscleStrengthening: "",
  sedentaryHours: "",
  dietPattern: "balanced",
  dietFruitVegDays: "",
  processedFoodFrequency: "",
  sleepHours: 7,
  sleepDurationRange: "",
  sleepQuality: "",
  snoreOrApnea: "",
  waterIntake: undefined,
  happinessScore: 7,
  chronicStress: false,
  stressFrequency: "",
  depressionTendency: false,
  stablePartner: false,
  socialActivity: "moderate",
  socialConnection: "",
  senseOfPurpose: false,
  purposeLevel: "",
  educationLevel: undefined,
  highRiskOccupation: false,
  weeklyWorkHours: undefined,
  longTermNoise: false,
  incomeLevel: undefined,
  selfDisciplineScore: undefined,
  positiveAgingAttitude: undefined,
  readingHabit: undefined,
  highRiskBehaviors: undefined,
  bedtimeRange: undefined,
  untreatedSleepApnea: undefined,
  moderateNapping: undefined,
  preSleepScreenTime: undefined,
  frequentIllness: undefined,
  autoimmuneDisease: undefined,
  chronicInflammation: undefined,
  distanceToHospital: undefined,
  commercialInsurance: undefined,
  recentCheckupCount: undefined,
  hasFamilyDoctor: undefined,
  restingHeartRate: undefined,
  vo2maxLevel: undefined,
  gripStrength: undefined,
  unintendedWeightLoss: undefined,
  bpSystolic: undefined,
  bpDiastolic: undefined,
  a1c: undefined,
  fastingGlucose: undefined,
  fastingGlucoseUnit: "mgdl",
  ldlCholesterol: undefined,
  climbThreeFloors: undefined,
  walkingPace: undefined,
  cancerScreeningStatus: undefined,
  dentalCheckup: undefined,
  airPollutionExposure: undefined,
  secondhandSmoke: undefined,
};

export function useQuestionnaire() {
  const [data, setData] = useState<QuestionnaireData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultData, ...JSON.parse(saved) };
      }
    } catch {
      // ignore parse errors
    }
    return defaultData;
  });

  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem("questionnaire_step");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Auto-save to localStorage on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Save current step to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("questionnaire_step", String(currentStep));
  }, [currentStep]);

  const updateField = useCallback(
    <K extends keyof QuestionnaireData>(
      field: K,
      value: QuestionnaireData[K]
    ) => {
      setData((prev) => {
        const next = { ...prev, [field]: value };

        // Auto-calculate BMI
        if (field === "heightCm" || field === "weightKg") {
          const h = (field === "heightCm" ? value : prev.heightCm) as number;
          const w = (field === "weightKg" ? value : prev.weightKg) as number;
          if (h > 0) {
            next.bmi = Math.round((w / ((h / 100) * (h / 100))) * 10) / 10;
          }
        }

        return next;
      });
    },
    []
  );

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, 10));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, 10)));
  }, []);

  const clearSaved = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem("questionnaire_step");
  }, []);

  const resetData = useCallback(() => {
    setData(defaultData);
    setCurrentStep(0);
    clearSaved();
  }, [clearSaved]);

  return {
    data,
    currentStep,
    updateField,
    nextStep,
    prevStep,
    goToStep,
    clearSaved,
    resetData,
  };
}
