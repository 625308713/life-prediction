import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../prisma/client";
import { calculateLifeExpectancy } from "../services/algorithm";
import {
  generateAIReport,
  PredictionSummary,
} from "../services/ai";

const router = Router();

const predictionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "提交过于频繁，请稍后再试" },
  standardHeaders: true,
  legacyHeaders: false,
});

function validateQuestionnaireData(
  data: Record<string, unknown>
): string | null {
  if (!data.age || typeof data.age !== "number" || data.age < 18 || data.age > 120) {
    return "请提供有效的年龄（18-120）";
  }
  if (!data.gender || !["male", "female"].includes(data.gender as string)) {
    return "请选择性别";
  }
  if (!data.heightCm || typeof data.heightCm !== "number" || data.heightCm < 100 || data.heightCm > 250) {
    return "请提供有效的身高（100-250cm）";
  }
  if (!data.weightKg || typeof data.weightKg !== "number" || data.weightKg < 30 || data.weightKg > 300) {
    return "请提供有效的体重（30-300kg）";
  }
  if (!data.bmi || typeof data.bmi !== "number") {
    return "请提供有效的BMI";
  }
  if (!data.waistCm || typeof data.waistCm !== "number") {
    return "请提供腰围数据";
  }
  if (!data.bloodPressure) {
    return "请填写血压状况";
  }
  if (!data.bloodSugar) {
    return "请填写血糖状况";
  }
  if (!data.smokingStatus) {
    return "请填写吸烟状况";
  }
  if (!data.alcoholConsumption) {
    return "请填写饮酒状况";
  }
  if (!data.exerciseFrequency) {
    return "请填写运动频率";
  }
  if (!data.dietPattern) {
    return "请填写饮食模式";
  }
  if (!data.sleepHours || typeof data.sleepHours !== "number") {
    return "请填写睡眠时长";
  }
  if (!data.happinessScore || typeof data.happinessScore !== "number") {
    return "请填写幸福感评分";
  }
  if (!data.socialActivity) {
    return "请填写社交活跃度";
  }
  return null;
}

router.post("/", predictionLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;

    // Server-side validation
    const validationError = validateQuestionnaireData(data);
    if (validationError) {
      res.status(400).json({ error: validationError });
      return;
    }

    // Run algorithm
    const result = calculateLifeExpectancy(data);

    // Prepare data for database
    const predictionData = {
      age: data.age as number,
      gender: data.gender as string,
      heightCm: data.heightCm as number,
      weightKg: data.weightKg as number,
      bmi: data.bmi as number,
      waistCm: data.waistCm as number,
      ethnicity: (data.ethnicity as string) || "east_asian",
      chronicDiseases: (data.chronicDiseases as string[]) || [],
      cancerHistory: (data.cancerHistory as boolean) || false,
      bloodPressure: data.bloodPressure as string,
      bloodSugar: data.bloodSugar as string,
      cholesterolLevel: data.cholesterolLevel as string | undefined,
      regularCheckup: (data.regularCheckup as boolean) || false,
      currentMedications: (data.currentMedications as string[]) || [],
      parentLongevity: (data.parentLongevity as string) || "other",
      familyMemberAbove90: (data.familyMemberAbove90 as boolean) || false,
      familyAlzheimers: (data.familyAlzheimers as boolean) || false,
      familyParkinsons: (data.familyParkinsons as boolean) || false,
      familyHeartDisease: (data.familyHeartDisease as boolean) || false,
      familyCancer: (data.familyCancer as boolean) || false,
      smokingStatus: data.smokingStatus as string,
      alcoholConsumption: data.alcoholConsumption as string,
      exerciseFrequency: data.exerciseFrequency as string,
      sedentaryHours: data.sedentaryHours as string,
      dietPattern: data.dietPattern as string,
      sleepHours: data.sleepHours as number,
      waterIntake: data.waterIntake as string | undefined,
      happinessScore: data.happinessScore as number,
      chronicStress: (data.chronicStress as boolean) || false,
      depressionTendency: (data.depressionTendency as boolean) || false,
      stablePartner: (data.stablePartner as boolean) || false,
      socialActivity: data.socialActivity as string,
      senseOfPurpose: (data.senseOfPurpose as boolean) || false,
      educationLevel: data.educationLevel as string | undefined,
      highRiskOccupation: (data.highRiskOccupation as boolean) || false,
      weeklyWorkHours: data.weeklyWorkHours as number | undefined,
      longTermNoise: (data.longTermNoise as boolean) || false,
      incomeLevel: data.incomeLevel as string | undefined,
      selfDisciplineScore: data.selfDisciplineScore as number | undefined,
      positiveAgingAttitude: data.positiveAgingAttitude as boolean | undefined,
      readingHabit: data.readingHabit as boolean | undefined,
      highRiskBehaviors: data.highRiskBehaviors as boolean | undefined,
      bedtimeRange: data.bedtimeRange as string | undefined,
      untreatedSleepApnea: data.untreatedSleepApnea as boolean | undefined,
      moderateNapping: data.moderateNapping as boolean | undefined,
      preSleepScreenTime: data.preSleepScreenTime as boolean | undefined,
      frequentIllness: data.frequentIllness as boolean | undefined,
      autoimmuneDisease: data.autoimmuneDisease as boolean | undefined,
      chronicInflammation: data.chronicInflammation as boolean | undefined,
      distanceToHospital: data.distanceToHospital as string | undefined,
      commercialInsurance: data.commercialInsurance as boolean | undefined,
      recentCheckupCount: data.recentCheckupCount as number | undefined,
      hasFamilyDoctor: data.hasFamilyDoctor as boolean | undefined,
      restingHeartRate: data.restingHeartRate as number | undefined,
      vo2maxLevel: data.vo2maxLevel as string | undefined,
      gripStrength: data.gripStrength as string | undefined,
      unintendedWeightLoss: data.unintendedWeightLoss as boolean | undefined,
      baseLifeExpectancy: result.baseLifeExpectancy,
      adjustedMin: result.adjustedMin,
      adjustedMax: result.adjustedMax,
      healthLifespan: result.healthLifespan,
      dimensionScores: result.dimensionScores,
      topRisks: result.topRisks,
      topStrengths: result.topStrengths,
      potentialGain: result.potentialGain,
      confidenceLevel: result.confidenceLevel,
    };

    // Save to database
    const prediction = await prisma.prediction.create({
      data: predictionData,
    });

    // Async AI report generation
    const predictionSummary: PredictionSummary = {
      gender: data.gender as string,
      age: data.age as number,
      bmi: data.bmi as number,
      baseLifeExpectancy: result.baseLifeExpectancy,
      adjustedMin: result.adjustedMin,
      adjustedMax: result.adjustedMax,
      healthLifespan: result.healthLifespan,
      dimensionScores: result.dimensionScores as Record<string, number>,
      topRisks: result.topRisks,
      topStrengths: result.topStrengths,
      potentialGain: result.potentialGain,
      confidenceLevel: result.confidenceLevel,
      percentile: result.percentile,
    };

    // Fire-and-forget: generate AI report in background
    generateAIReport(data as Record<string, unknown>, predictionSummary)
      .then(async (report) => {
        if (report) {
          await prisma.prediction.update({
            where: { id: prediction.id },
            data: {
              aiReport: report,
              aiReportGeneratedAt: new Date(),
            },
          });
          console.log(`[AI] Report generated for prediction ${prediction.id}`);
        }
      })
      .catch((err) => {
        console.error(
          `[AI] Failed to generate report for prediction ${prediction.id}:`,
          err
        );
      });

    // Return response immediately (without waiting for AI)
    res.json({
      id: prediction.id,
      baseLifeExpectancy: result.baseLifeExpectancy,
      adjustedMin: result.adjustedMin,
      adjustedMax: result.adjustedMax,
      healthLifespan: result.healthLifespan,
      dimensionScores: result.dimensionScores,
      topRisks: result.topRisks,
      topStrengths: result.topStrengths,
      potentialGain: result.potentialGain,
      confidenceLevel: result.confidenceLevel,
      percentile: result.percentile,
      totalAdjustment: result.totalAdjustment,
    });
  } catch (error) {
    console.error("[Prediction] Error creating prediction:", error);
    res.status(500).json({ error: "预测计算失败，请稍后重试" });
  }
});

// Get prediction by ID (for result page + polling AI report)
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const prediction = await prisma.prediction.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        age: true,
        gender: true,
        baseLifeExpectancy: true,
        adjustedMin: true,
        adjustedMax: true,
        healthLifespan: true,
        dimensionScores: true,
        topRisks: true,
        topStrengths: true,
        potentialGain: true,
        confidenceLevel: true,
        aiReport: true,
        aiReportGeneratedAt: true,
      },
    });

    if (!prediction) {
      res.status(404).json({ error: "未找到该预测记录" });
      return;
    }

    res.json(prediction);
  } catch (error) {
    console.error("[Prediction] Error fetching prediction:", error);
    res.status(500).json({ error: "获取预测记录失败" });
  }
});

export default router;
