import { describe, expect, it } from "vitest";
import {
  calculateLifeExpectancy,
  computeHealthAge,
  computeLifeScore,
  deriveLifeExpectancyMetrics,
  getBaseLifeExpectancy,
} from "../algorithm";

type QuestionnaireData = Parameters<typeof calculateLifeExpectancy>[0];

/** A neutral-to-healthy 30-year-old male answering the v1 required fields. */
function healthyProfile(overrides: Partial<QuestionnaireData> = {}): QuestionnaireData {
  return {
    age: 30,
    gender: "male",
    heightCm: 175,
    weightKg: 68,
    bmi: 22.2,
    waistCm: 80,
    ethnicity: "east_asian",
    chronicDiseases: [],
    cancerHistory: false,
    bloodPressure: "normal",
    bloodSugar: "normal",
    regularCheckup: true,
    currentMedications: [],
    parentLongevity: "other",
    familyMemberAbove90: false,
    familyAlzheimers: false,
    familyParkinsons: false,
    familyHeartDisease: false,
    familyCancer: false,
    smokingStatus: "never",
    alcoholConsumption: "occasional",
    exerciseFrequency: "three_plus",
    sedentaryHours: "under_4",
    dietPattern: "balanced",
    sleepHours: 7.5,
    happinessScore: 8,
    chronicStress: false,
    depressionTendency: false,
    stablePartner: true,
    socialActivity: "high",
    senseOfPurpose: true,
    highRiskOccupation: false,
    longTermNoise: false,
    ...overrides,
  };
}

describe("getBaseLifeExpectancy", () => {
  it("uses a higher baseline for women than men", () => {
    expect(getBaseLifeExpectancy("female")).toBeGreaterThan(
      getBaseLifeExpectancy("male")
    );
  });

  it("returns the birth baseline for younger ages", () => {
    expect(getBaseLifeExpectancy("male", 30)).toBe(75);
    expect(getBaseLifeExpectancy("female", 40)).toBe(80);
  });

  it("conditions the baseline on current age for older users", () => {
    const at80 = getBaseLifeExpectancy("male", 80);
    expect(at80).toBeGreaterThan(80);
    expect(at80).toBeGreaterThan(getBaseLifeExpectancy("male", 30));
  });
});

describe("deriveLifeExpectancyMetrics", () => {
  it("maps the unadjusted baseline to the 50th percentile", () => {
    const base = getBaseLifeExpectancy("male", 30);
    const { percentile, totalAdjustment } = deriveLifeExpectancyMetrics(
      "male",
      base,
      30
    );
    expect(percentile).toBe(50);
    expect(totalAdjustment).toBe(0);
  });

  it("gives higher percentiles for higher adjusted expectancy", () => {
    const base = getBaseLifeExpectancy("female", 30);
    const better = deriveLifeExpectancyMetrics("female", base + 5, 30);
    const worse = deriveLifeExpectancyMetrics("female", base - 5, 30);
    expect(better.percentile).toBeGreaterThan(50);
    expect(worse.percentile).toBeLessThan(50);
    expect(better.totalAdjustment).toBe(5);
  });
});

describe("computeHealthAge", () => {
  it("maps positive adjustments to a younger health age", () => {
    expect(computeHealthAge(40, 10)).toBeLessThan(40);
    expect(computeHealthAge(40, -10)).toBeGreaterThan(40);
    expect(computeHealthAge(40, 0)).toBe(40);
  });

  it("clamps the delta to a plausible band", () => {
    expect(40 - computeHealthAge(40, 50)).toBeLessThanOrEqual(12);
    expect(computeHealthAge(40, -50) - 40).toBeLessThanOrEqual(12);
    expect(computeHealthAge(18, 30)).toBeGreaterThanOrEqual(18);
  });

  it("is exposed coherently by calculateLifeExpectancy", () => {
    const result = calculateLifeExpectancy(healthyProfile());
    expect(result.healthAge).toBe(computeHealthAge(30, result.totalAdjustment));
    expect(result.healthAgeDelta).toBe(result.healthAge - 30);
    // Healthy profile should read younger than chronological age.
    expect(result.healthAgeDelta).toBeLessThan(0);
  });
});

describe("computeLifeScore", () => {
  it("stays inside the 35-99 band at the extremes", () => {
    expect(computeLifeScore(1, -20, 50)).toBeGreaterThanOrEqual(35);
    expect(computeLifeScore(99, 14, 95)).toBeLessThanOrEqual(99);
  });

  it("is monotonic in percentile and adjustment", () => {
    expect(computeLifeScore(80, 5, 80)).toBeGreaterThan(computeLifeScore(40, 5, 80));
    expect(computeLifeScore(60, 8, 80)).toBeGreaterThan(computeLifeScore(60, -2, 80));
  });

  it("matches the lifeScore returned by calculateLifeExpectancy", () => {
    const result = calculateLifeExpectancy(healthyProfile());
    expect(result.lifeScore).toBe(
      computeLifeScore(
        result.percentile,
        result.totalAdjustment,
        result.confidenceLevel
      )
    );
  });
});

describe("calculateLifeExpectancy", () => {
  it("rewards a healthy profile above the baseline", () => {
    const result = calculateLifeExpectancy(healthyProfile());
    expect(result.adjustedLifeExpectancy).toBeGreaterThan(
      result.baselineLifeExpectancy
    );
    expect(result.topStrengths.length).toBeGreaterThan(0);
    expect(result.percentile).toBeGreaterThan(50);
  });

  it("keeps the legacy alias equal to the adjusted estimate", () => {
    const result = calculateLifeExpectancy(healthyProfile());
    expect(result.baseLifeExpectancy).toBe(result.adjustedLifeExpectancy);
  });

  it("returns a coherent range around the point estimate", () => {
    const result = calculateLifeExpectancy(healthyProfile());
    expect(result.adjustedMin).toBeLessThan(result.adjustedMax);
    expect(result.adjustedLifeExpectancy).toBeGreaterThanOrEqual(result.adjustedMin);
    expect(result.adjustedLifeExpectancy).toBeLessThanOrEqual(result.adjustedMax);
    expect(result.potentialGain).toBeGreaterThanOrEqual(0);
  });

  it("scores heavy smokers below never-smokers, all else equal", () => {
    const nonSmoker = calculateLifeExpectancy(healthyProfile());
    const smoker = calculateLifeExpectancy(
      healthyProfile({ smokingStatus: "current_heavy" })
    );
    expect(smoker.adjustedLifeExpectancy).toBeLessThan(
      nonSmoker.adjustedLifeExpectancy
    );
    expect(smoker.topRisks).toContain("current_heavy_smoker");
  });

  it("caps the positive adjustment at +14 years", () => {
    const best = calculateLifeExpectancy(
      healthyProfile({
        parentLongevity: "both_above_75",
        familyMemberAbove90: true,
        activityMinutesPerWeek: "300_plus",
        muscleStrengthening: "yes",
        dietFruitVegDays: "6_7",
        processedFoodFrequency: "rare",
        sleepQuality: "refreshed",
        stressFrequency: "rare",
        socialConnection: "strong",
        educationLevel: "bachelor_plus",
        incomeLevel: "high",
        selfDisciplineScore: 9,
        positiveAgingAttitude: true,
        readingHabit: true,
        bedtimeRange: "22_23",
        moderateNapping: true,
        commercialInsurance: true,
        recentCheckupCount: 4,
        cancerScreeningStatus: "up_to_date",
        dentalCheckup: "within_year",
        hasFamilyDoctor: true,
        restingHeartRate: 55,
        vo2maxLevel: "excellent",
        gripStrength: "strong",
        climbThreeFloors: "yes",
        walkingPace: "brisk",
      })
    );
    expect(
      best.adjustedLifeExpectancy - best.baselineLifeExpectancy
    ).toBeLessThanOrEqual(14);
  });

  it("never predicts a lifespan at or below the user's current age", () => {
    const result = calculateLifeExpectancy(
      healthyProfile({
        age: 82,
        bmi: 33,
        waistCm: 110,
        chronicDiseases: ["diabetes", "hypertension", "copd"],
        cancerHistory: true,
        bloodPressure: "stage2",
        bloodSugar: "diabetes",
        smokingStatus: "current_heavy",
        alcoholConsumption: "daily_heavy",
        exerciseFrequency: "rarely",
        sedentaryHours: "above_8",
        dietPattern: "high_meat_salt",
        sleepHours: 4,
        happinessScore: 2,
        chronicStress: true,
        depressionTendency: true,
        stablePartner: false,
        socialActivity: "isolated",
        senseOfPurpose: false,
        regularCheckup: false,
      })
    );
    expect(result.adjustedLifeExpectancy).toBeGreaterThanOrEqual(83);
    expect(result.adjustedMin).toBeGreaterThanOrEqual(82);
    expect(result.healthLifespan).toBeGreaterThanOrEqual(82);
  });

  it("lets measured blood pressure override the categorical answer", () => {
    const claimedNormal = calculateLifeExpectancy(
      healthyProfile({ formVersion: "v2", bloodPressureKnown: "normal" })
    );
    const measuredHigh = calculateLifeExpectancy(
      healthyProfile({
        formVersion: "v2",
        bloodPressureKnown: "normal",
        bpSystolic: 152,
        bpDiastolic: 95,
      })
    );
    expect(measuredHigh.adjustedLifeExpectancy).toBeLessThan(
      claimedNormal.adjustedLifeExpectancy
    );
    expect(measuredHigh.dimensionScores["疾病与健康状况"]).toBeLessThan(
      claimedNormal.dimensionScores["疾病与健康状况"]
    );
  });

  it("lets a measured A1c override the categorical glucose answer", () => {
    const normal = calculateLifeExpectancy(
      healthyProfile({ formVersion: "v2", a1c: 5.2 })
    );
    const diabetic = calculateLifeExpectancy(
      healthyProfile({ formVersion: "v2", a1c: 7.1 })
    );
    expect(diabetic.adjustedLifeExpectancy).toBeLessThan(
      normal.adjustedLifeExpectancy
    );
    expect(diabetic.topRisks).toContain("diabetes");
  });

  it("keeps confidence inside the 50-95 band for v2 submissions", () => {
    const sparse = calculateLifeExpectancy(
      healthyProfile({
        formVersion: "v2",
        bloodPressure: "unknown",
        bloodSugar: "unknown",
      })
    );
    const rich = calculateLifeExpectancy(
      healthyProfile({
        formVersion: "v2",
        diagnosedConditions: ["none"],
        bloodPressureKnown: "normal",
        bloodSugarKnown: "normal",
        activityMinutesPerWeek: "150_300",
        muscleStrengthening: "yes",
        smokingAmount: "none",
        alcoholPattern: "rare",
        sleepDurationRange: "7_8",
        sleepQuality: "refreshed",
        snoreOrApnea: "no",
        dietFruitVegDays: "6_7",
        processedFoodFrequency: "rare",
        stressFrequency: "rare",
        socialConnection: "strong",
        purposeLevel: "strong",
        bpSystolic: 115,
        bpDiastolic: 72,
        a1c: 5.1,
        restingHeartRate: 58,
      })
    );
    expect(sparse.confidenceLevel).toBeGreaterThanOrEqual(50);
    expect(rich.confidenceLevel).toBeLessThanOrEqual(95);
    expect(rich.confidenceLevel).toBeGreaterThan(sparse.confidenceLevel);
  });

  it("does not treat unknown answers as healthy answers", () => {
    const known = calculateLifeExpectancy(healthyProfile());
    const unknown = calculateLifeExpectancy(
      healthyProfile({ bloodPressure: "unknown", bloodSugar: "unknown" })
    );
    // Unknown removes the "normal" bonus but must not add a risk either.
    // (Compare the dimension score: the headline number may sit at the +14 cap.)
    expect(unknown.dimensionScores["疾病与健康状况"]).toBeLessThan(
      known.dimensionScores["疾病与健康状况"]
    );
    expect(unknown.topRisks).not.toContain("stage2_hypertension");
    expect(unknown.topRisks).not.toContain("diabetes");
  });
});
