/**
 * AI report retry worker.
 *
 * Report generation is fire-and-forget at submit time, so a server restart or
 * a transient AI-endpoint failure used to lose the report permanently. This
 * worker sweeps recent predictions that still lack a report and retries,
 * recomputing the summary from the stored rawAnswers.
 *
 * Bounds: only predictions younger than RETRY_WINDOW_HOURS, small batches,
 * sequential generation. Permanent failures simply age out of the window.
 */
import { Prisma } from "@prisma/client";
import prisma from "../prisma/client";
import { calculateLifeExpectancy } from "./algorithm";
import {
  generateAIReport,
  isAIReportEnabled,
  PredictionSummary,
  ReportLanguage,
} from "./ai";

const RETRY_WINDOW_HOURS = 48;
const BATCH_SIZE = 5;
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

let sweeping = false;

export async function sweepMissingAIReports(): Promise<number> {
  if (!isAIReportEnabled() || sweeping) return 0;
  sweeping = true;

  try {
    const windowStart = new Date(
      Date.now() - RETRY_WINDOW_HOURS * 60 * 60 * 1000
    );
    const pending = await prisma.prediction.findMany({
      where: {
        aiReport: null,
        createdAt: { gte: windowStart },
        rawAnswers: { not: Prisma.DbNull },
      },
      orderBy: { createdAt: "asc" },
      take: BATCH_SIZE,
      select: { id: true, rawAnswers: true, confidenceLevel: true },
    });

    let generated = 0;
    for (const prediction of pending) {
      const rawAnswers = prediction.rawAnswers as Record<string, unknown> | null;
      if (!rawAnswers || typeof rawAnswers !== "object") continue;

      try {
        const result = calculateLifeExpectancy(rawAnswers as never);
        const language: ReportLanguage =
          rawAnswers.language === "en" ? "en" : "zh";
        const summary: PredictionSummary = {
          gender: String(rawAnswers.gender || ""),
          age: Number(rawAnswers.age || 0),
          bmi: Number(rawAnswers.bmi || 0),
          baselineLifeExpectancy: result.baselineLifeExpectancy,
          adjustedLifeExpectancy: result.adjustedLifeExpectancy,
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
        };

        const report = await generateAIReport(rawAnswers, summary, language);
        if (report) {
          await prisma.prediction.update({
            where: { id: prediction.id },
            data: { aiReport: report, aiReportGeneratedAt: new Date() },
          });
          generated += 1;
          console.log(`[AI-Retry] Recovered report for ${prediction.id}`);
        }
      } catch (error) {
        console.error(
          `[AI-Retry] Failed for prediction ${prediction.id}:`,
          error
        );
      }
    }

    return generated;
  } catch (error) {
    console.error("[AI-Retry] Sweep failed:", error);
    return 0;
  } finally {
    sweeping = false;
  }
}

/** Start the periodic sweep; first run shortly after boot. */
export function startAIRetryWorker(): void {
  if (!isAIReportEnabled()) {
    console.log("[AI-Retry] AI not configured; retry worker disabled");
    return;
  }
  setTimeout(() => void sweepMissingAIReports(), 15 * 1000);
  setInterval(() => void sweepMissingAIReports(), SWEEP_INTERVAL_MS);
  console.log(
    `[AI-Retry] Worker started (window ${RETRY_WINDOW_HOURS}h, every ${SWEEP_INTERVAL_MS / 60000}min)`
  );
}
