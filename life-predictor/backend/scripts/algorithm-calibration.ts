import assert from "node:assert/strict";
import {
  calculateLifeExpectancy,
  getBaseLifeExpectancy,
} from "../src/services/algorithm";

type QuestionnaireData = Parameters<typeof calculateLifeExpectancy>[0];

type CalibrationCase = {
  name: string;
  data: QuestionnaireData;
  check: (result: ReturnType<typeof calculateLifeExpectancy>) => void;
};

const baseProfile: QuestionnaireData = {
  formVersion: "v2",
  region: "china",
  age: 35,
  gender: "male",
  heightCm: 170,
  weightKg: 66,
  bmi: 22.8,
  waistCm: 82,
  ethnicity: "east_asian",
  chronicDiseases: [],
  diagnosedConditions: [],
  cancerHistory: false,
  bloodPressure: "normal",
  bloodPressureKnown: "normal",
  bloodSugar: "normal",
  bloodSugarKnown: "normal",
  cholesterolLevel: undefined,
  regularCheckup: true,
  currentMedications: [],
  parentLongevity: "other",
  familyMemberAbove90: false,
  familyAlzheimers: false,
  familyParkinsons: false,
  familyHeartDisease: false,
  familyCancer: false,
  smokingStatus: "never",
  smokingAmount: "none",
  alcoholConsumption: "occasional",
  alcoholPattern: "rare",
  exerciseFrequency: "three_plus",
  activityMinutesPerWeek: "150_300",
  muscleStrengthening: "yes",
  sedentaryHours: "under_4",
  dietPattern: "balanced",
  dietFruitVegDays: "6_7",
  processedFoodFrequency: "rare",
  sleepHours: 7.5,
  sleepDurationRange: "7_8",
  sleepQuality: "refreshed",
  snoreOrApnea: "no",
  waterIntake: undefined,
  happinessScore: 8,
  chronicStress: false,
  stressFrequency: "rare",
  depressionTendency: false,
  stablePartner: true,
  socialActivity: "high",
  socialConnection: "strong",
  senseOfPurpose: true,
  purposeLevel: "yes",
  educationLevel: undefined,
  highRiskOccupation: false,
  weeklyWorkHours: 40,
  longTermNoise: false,
  incomeLevel: undefined,
  selfDisciplineScore: undefined,
  positiveAgingAttitude: undefined,
  readingHabit: undefined,
  highRiskBehaviors: undefined,
  bedtimeRange: undefined,
  untreatedSleepApnea: false,
  moderateNapping: undefined,
  preSleepScreenTime: undefined,
  frequentIllness: undefined,
  autoimmuneDisease: undefined,
  chronicInflammation: undefined,
  distanceToHospital: undefined,
  commercialInsurance: undefined,
  recentCheckupCount: 1,
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

function profile(overrides: Partial<QuestionnaireData>): QuestionnaireData {
  return { ...baseProfile, ...overrides };
}

function assertIncludes(values: string[], expected: string, context: string) {
  assert.ok(
    values.includes(expected),
    `${context}: expected ${expected} in [${values.join(", ")}]`
  );
}

const cases: CalibrationCase[] = [
  {
    name: "healthy young adult should be strong but not maxed out",
    data: profile({}),
    check: (result) => {
      assert.equal(result.topRisks.length, 0);
      assert.ok(
        result.totalAdjustment <= 14,
        `healthy profile should not hit a +20 year ceiling; got ${result.totalAdjustment}`
      );
      assert.ok(
        result.percentile < 98,
        `healthy profile should not look nearly perfect; got percentile ${result.percentile}`
      );
    },
  },
  {
    name: "movement gap should surface activity risks",
    data: profile({
      activityMinutesPerWeek: "under_30",
      exerciseFrequency: "rarely",
      muscleStrengthening: "no",
      sedentaryHours: "above_8",
      happinessScore: 7,
      senseOfPurpose: false,
      purposeLevel: "somewhat",
    }),
    check: (result) => {
      assertIncludes(result.topRisks, "low_activity", "movement gap");
      assertIncludes(result.topRisks, "sedentary_above_8h", "movement gap");
    },
  },
  {
    name: "heavy smoking should not be offset into a high percentile",
    data: profile({
      age: 45,
      smokingStatus: "current_heavy",
      smokingAmount: "20_plus",
      activityMinutesPerWeek: "90_149",
      exerciseFrequency: "one_to_two",
    }),
    check: (result) => {
      assertIncludes(result.topRisks, "current_heavy_smoker", "heavy smoker");
      assert.ok(
        result.totalAdjustment <= 6,
        `heavy smoker should stay close to baseline or below; got ${result.totalAdjustment}`
      );
      assert.ok(
        result.percentile <= 77,
        `heavy smoker should not read as top-tier longevity; got percentile ${result.percentile}`
      );
    },
  },
  {
    name: "metabolic risk should prioritize measured cardiometabolic signals",
    data: profile({
      age: 52,
      heightCm: 172,
      weightKg: 91,
      bmi: 30.8,
      waistCm: 102,
      diagnosedConditions: ["hypertension"],
      chronicDiseases: ["hypertension"],
      bloodPressure: "stage2",
      bloodPressureKnown: "stage2",
      bloodSugar: "prediabetes",
      bloodSugarKnown: "prediabetes",
      ldlCholesterol: 175,
      activityMinutesPerWeek: "30_90",
      exerciseFrequency: "one_to_two",
      muscleStrengthening: "no",
      dietFruitVegDays: "0_2",
      processedFoodFrequency: "most_days",
      dietPattern: "high_meat_salt",
    }),
    check: (result) => {
      assertIncludes(result.topRisks, "stage2_hypertension", "metabolic risk");
      assertIncludes(result.topRisks, "bmi_obese_class1", "metabolic risk");
      assert.ok(
        result.totalAdjustment < 0,
        `metabolic high-risk profile should be below baseline; got ${result.totalAdjustment}`
      );
    },
  },
  {
    name: "sleep apnea and poor recovery should be visible",
    data: profile({
      age: 40,
      gender: "female",
      heightCm: 164,
      weightKg: 58,
      bmi: 21.6,
      waistCm: 74,
      sleepHours: 5.5,
      sleepDurationRange: "5_6",
      sleepQuality: "unrefreshed",
      snoreOrApnea: "yes",
      untreatedSleepApnea: true,
      chronicStress: true,
      stressFrequency: "often",
      happinessScore: 4,
      depressionTendency: true,
      stablePartner: false,
      socialActivity: "isolated",
      socialConnection: "isolated",
      senseOfPurpose: false,
      purposeLevel: "no",
    }),
    check: (result) => {
      assertIncludes(result.topRisks, "insufficient_sleep", "recovery risk");
      assertIncludes(result.topRisks, "untreated_sleep_apnea", "recovery risk");
    },
  },
  {
    name: "older high-risk adult should never receive an impossible past age",
    data: profile({
      age: 86,
      heightCm: 168,
      weightKg: 84,
      bmi: 29.8,
      waistCm: 101,
      diagnosedConditions: ["hypertension", "diabetes"],
      chronicDiseases: ["hypertension", "diabetes"],
      bloodPressure: "stage2",
      bloodPressureKnown: "stage2",
      bloodSugar: "diabetes",
      bloodSugarKnown: "diabetes",
      smokingStatus: "current_heavy",
      smokingAmount: "20_plus",
      activityMinutesPerWeek: "under_30",
      exerciseFrequency: "rarely",
      muscleStrengthening: "no",
      sleepHours: 5.5,
      sleepDurationRange: "5_6",
      happinessScore: 5,
      chronicStress: true,
      stressFrequency: "often",
    }),
    check: (result) => {
      assert.ok(
        result.adjustedMin >= 86,
        `older profile should not show a lower-than-current range; got ${result.adjustedMin}-${result.adjustedMax}`
      );
      assert.ok(
        result.adjustedLifeExpectancy >= 87,
        `older profile should keep point estimate in the future; got ${result.adjustedLifeExpectancy}`
      );
      assert.ok(
        result.totalAdjustment <= 0,
        `older high-risk profile should not become positive after age correction; got ${result.totalAdjustment}`
      );
    },
  },
];

for (const testCase of cases) {
  const result = calculateLifeExpectancy(testCase.data);
  testCase.check(result);
  console.log(
    JSON.stringify({
      case: testCase.name,
      baseline: getBaseLifeExpectancy(testCase.data.gender, testCase.data.age),
      adjustedLifeExpectancy: result.adjustedLifeExpectancy,
      adjustedRange: [result.adjustedMin, result.adjustedMax],
      totalAdjustment: result.totalAdjustment,
      percentile: result.percentile,
      confidenceLevel: result.confidenceLevel,
      topRisks: result.topRisks,
      topStrengths: result.topStrengths,
    })
  );
}

console.log(`Algorithm calibration checks passed: ${cases.length}/${cases.length}`);
