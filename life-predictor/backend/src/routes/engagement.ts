import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import prisma from "../prisma/client";

const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Funnel event types the frontend is allowed to record.
export const EVENT_TYPES = [
  "home_view",
  "quiz_start",
  "quiz_submit",
  "result_view",
  "share_view",
  "share_copy",
  "poster_download",
  "challenge_copy",
  "challenge_done",
  "lead_submit",
] as const;

const leadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: "提交过于频繁，请稍后再试" },
  standardHeaders: true,
  legacyHeaders: false,
});

const eventLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 240,
  message: { error: "too many events" },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/leads - capture an email tied to a result.
router.post("/leads", leadLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const predictionId = req.body.predictionId
      ? String(req.body.predictionId).slice(0, 64)
      : null;
    const source = ["result_unlock", "retest_reminder"].includes(req.body.source)
      ? (req.body.source as string)
      : "result_unlock";
    const language = req.body.language === "en" ? "en" : "zh";

    if (!EMAIL_PATTERN.test(email) || email.length > 254) {
      res.status(400).json({ error: "请输入有效的邮箱地址" });
      return;
    }

    const existing = await prisma.lead.findFirst({
      where: { email, predictionId },
    });
    if (!existing) {
      await prisma.lead.create({
        data: { email, predictionId, source, language },
      });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("[Engagement] Lead error:", error);
    res.status(500).json({ error: "提交失败，请稍后重试" });
  }
});

// POST /api/events - record a funnel event (fire-and-forget on the client).
router.post("/events", eventLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const type = String(req.body.type || "");
    if (!(EVENT_TYPES as readonly string[]).includes(type)) {
      res.status(400).json({ error: "unknown event type" });
      return;
    }
    const predictionId = req.body.predictionId
      ? String(req.body.predictionId).slice(0, 64)
      : null;

    await prisma.event.create({ data: { type, predictionId } });
    res.json({ ok: true });
  } catch (error) {
    console.error("[Engagement] Event error:", error);
    res.status(500).json({ error: "event failed" });
  }
});

// GET /api/stats/public - completion count for the trust badge.
// Cached in memory; shown on the home page only once meaningful.
let publicStatsCache: { totalCount: number; fetchedAt: number } | null = null;
const PUBLIC_STATS_TTL_MS = 5 * 60 * 1000;

router.get("/stats/public", async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = Date.now();
    if (!publicStatsCache || now - publicStatsCache.fetchedAt > PUBLIC_STATS_TTL_MS) {
      const totalCount = await prisma.prediction.count();
      publicStatsCache = { totalCount, fetchedAt: now };
    }
    res.json({ totalCount: publicStatsCache.totalCount });
  } catch (error) {
    console.error("[Engagement] Public stats error:", error);
    res.status(500).json({ error: "stats failed" });
  }
});

export default router;
