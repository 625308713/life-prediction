import { Router, Request, Response } from "express";
import prisma from "../prisma/client";
import { adminAuthMiddleware } from "../middleware/adminAuth";

const router = Router();

// All admin routes require auth
router.use(adminAuthMiddleware);

// GET /api/admin/stats - Dashboard statistics
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const thirtyDaysAgo = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    const [
      totalCount,
      todayCount,
      avgLifeExpectancy,
      avgAge,
      genderDistribution,
      ageDistribution,
      dailySubmissions,
      bmiDistribution,
      lifeExpectancyDistribution,
      riskFactorCounts,
      leadsCount,
      funnelEvents,
    ] = await Promise.all([
      // Total count
      prisma.prediction.count(),

      // Today's count
      prisma.prediction.count({
        where: { createdAt: { gte: todayStart } },
      }),

      // Average result range midpoint
      prisma.prediction.aggregate({
        _avg: { baseLifeExpectancy: true },
      }),

      // Average age
      prisma.prediction.aggregate({
        _avg: { age: true },
      }),

      // Gender distribution
      prisma.prediction.groupBy({
        by: ["gender"],
        _count: true,
      }),

      // Age distribution
      prisma.prediction.findMany({
        select: { age: true },
      }),

      // Daily submissions (last 30 days)
      prisma.prediction.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),

      // BMI distribution
      prisma.prediction.findMany({
        select: { bmi: true },
      }),

      // Result range distribution
      prisma.prediction.findMany({
        select: { baseLifeExpectancy: true },
      }),

      // Risk factor counts
      prisma.prediction.findMany({
        select: { topRisks: true },
      }),

      // Leads total
      prisma.lead.count(),

      // Funnel events (last 30 days)
      prisma.event.groupBy({
        by: ["type"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: true,
      }),
    ]);

    // Process age distribution
    const ageGroups = { under30: 0, "30_40": 0, "40_50": 0, "50_60": 0, above60: 0 };
    ageDistribution.forEach(({ age }) => {
      if (age < 30) ageGroups.under30++;
      else if (age < 40) ageGroups["30_40"]++;
      else if (age < 50) ageGroups["40_50"]++;
      else if (age < 60) ageGroups["50_60"]++;
      else ageGroups.above60++;
    });

    // Process daily submissions
    const dailyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      dailyMap[key] = 0;
    }
    dailySubmissions.forEach(({ createdAt }) => {
      const d = new Date(createdAt);
      const key = `${d.getMonth() + 1}/${d.getDate()}`;
      if (dailyMap[key] !== undefined) dailyMap[key]++;
    });

    // Process BMI distribution
    const bmiGroups = { underweight: 0, normal: 0, overweight: 0, obese: 0 };
    bmiDistribution.forEach(({ bmi }) => {
      if (bmi < 18.5) bmiGroups.underweight++;
      else if (bmi < 24) bmiGroups.normal++;
      else if (bmi < 28) bmiGroups.overweight++;
      else bmiGroups.obese++;
    });

    // Process result range distribution
    const leGroups = {
      "65_70": 0,
      "70_75": 0,
      "75_80": 0,
      "80_85": 0,
      "85_90": 0,
      above90: 0,
    };
    lifeExpectancyDistribution.forEach(({ baseLifeExpectancy }) => {
      if (baseLifeExpectancy < 70) leGroups["65_70"]++;
      else if (baseLifeExpectancy < 75) leGroups["70_75"]++;
      else if (baseLifeExpectancy < 80) leGroups["75_80"]++;
      else if (baseLifeExpectancy < 85) leGroups["80_85"]++;
      else if (baseLifeExpectancy < 90) leGroups["85_90"]++;
      else leGroups.above90++;
    });

    // Process risk factor counts
    const riskCounts: Record<string, number> = {};
    riskFactorCounts.forEach(({ topRisks }) => {
      topRisks.forEach((risk) => {
        riskCounts[risk] = (riskCounts[risk] || 0) + 1;
      });
    });
    const top10Risks = Object.entries(riskCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalCount,
      todayCount,
      avgLifeExpectancy: Math.round((avgLifeExpectancy._avg.baseLifeExpectancy || 0) * 10) / 10,
      avgAge: Math.round((avgAge._avg.age || 0) * 10) / 10,
      genderDistribution: {
        male: genderDistribution.find((g) => g.gender === "male")?._count || 0,
        female: genderDistribution.find((g) => g.gender === "female")?._count || 0,
      },
      ageDistribution: ageGroups,
      dailySubmissions: Object.entries(dailyMap).map(([date, count]) => ({
        date,
        count,
      })),
      bmiDistribution: bmiGroups,
      lifeExpectancyDistribution: leGroups,
      top10Risks,
      leadsCount,
      funnel: funnelEvents
        .map((event) => ({ type: event.type, count: event._count }))
        .sort((a, b) => b.count - a.count),
    });
  } catch (error) {
    console.error("[Admin] Stats error:", error);
    res.status(500).json({ error: "获取统计数据失败" });
  }
});

// GET /api/admin/predictions - List predictions with filters
router.get("/predictions", async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = 20;
    const { gender, ageMin, ageMax, startDate, endDate, leMin, leMax } =
      req.query;

    const where: Record<string, unknown> = {};

    if (gender && ["male", "female"].includes(gender as string)) {
      where.gender = gender;
    }

    if (ageMin || ageMax) {
      where.age = {};
      if (ageMin) (where.age as Record<string, number>).gte = parseInt(ageMin as string);
      if (ageMax) (where.age as Record<string, number>).lte = parseInt(ageMax as string);
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) (where.createdAt as Record<string, Date>).gte = new Date(startDate as string);
      if (endDate) (where.createdAt as Record<string, Date>).lte = new Date(endDate as string);
    }

    if (leMin || leMax) {
      where.baseLifeExpectancy = {};
      if (leMin) (where.baseLifeExpectancy as Record<string, number>).gte = parseFloat(leMin as string);
      if (leMax) (where.baseLifeExpectancy as Record<string, number>).lte = parseFloat(leMax as string);
    }

    const [predictions, totalCount] = await Promise.all([
      prisma.prediction.findMany({
        where,
        select: {
          id: true,
          createdAt: true,
          gender: true,
          age: true,
          bmi: true,
          baseLifeExpectancy: true,
          adjustedMin: true,
          adjustedMax: true,
          confidenceLevel: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.prediction.count({ where }),
    ]);

    res.json({
      predictions,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("[Admin] List predictions error:", error);
    res.status(500).json({ error: "获取结果列表失败" });
  }
});

// GET /api/admin/predictions/:id - Get prediction detail
router.get("/predictions/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const prediction = await prisma.prediction.findUnique({
      where: { id },
    });

    if (!prediction) {
      res.status(404).json({ error: "未找到该记录" });
      return;
    }

    res.json(prediction);
  } catch (error) {
    console.error("[Admin] Get prediction detail error:", error);
    res.status(500).json({ error: "获取结果详情失败" });
  }
});

// GET /api/admin/predictions/export/csv - Export CSV
router.get("/predictions/export/csv", async (req: Request, res: Response): Promise<void> => {
  try {
    const predictions = await prisma.prediction.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "编号",
      "提交时间",
      "性别",
      "年龄",
      "BMI",
      "腰围",
      "血压",
      "血糖",
      "吸烟",
      "饮酒",
      "运动",
      "结果区间",
      "下限",
      "上限",
      "健康寿命",
      "置信度",
      "改善潜力",
    ];

    const csvRows = [headers.join(",")];

    predictions.forEach((p) => {
      const row = [
        p.id,
        p.createdAt.toISOString(),
        p.gender === "male" ? "男" : "女",
        p.age,
        p.bmi,
        p.waistCm,
        p.bloodPressure,
        p.bloodSugar,
        p.smokingStatus,
        p.alcoholConsumption,
        p.exerciseFrequency,
        p.baseLifeExpectancy,
        p.adjustedMin,
        p.adjustedMax,
        p.healthLifespan,
        p.confidenceLevel,
        p.potentialGain,
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(row.join(","));
    });

    const csvContent = "﻿" + csvRows.join("\n"); // BOM for Excel

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=lifescore_results_${new Date().toISOString().split("T")[0]}.csv`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("[Admin] Export CSV error:", error);
    res.status(500).json({ error: "导出CSV失败" });
  }
});

// GET /api/admin/leads/export/csv - Export captured emails
router.get("/leads/export/csv", async (_req: Request, res: Response): Promise<void> => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = ["邮箱", "提交时间", "来源", "语言", "关联结果ID"];
    const csvRows = [headers.join(",")];
    leads.forEach((lead) => {
      const row = [
        lead.email,
        lead.createdAt.toISOString(),
        lead.source,
        lead.language,
        lead.predictionId || "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
      csvRows.push(row.join(","));
    });

    const csvContent = "﻿" + csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=lifescore_leads_${new Date().toISOString().split("T")[0]}.csv`
    );
    res.send(csvContent);
  } catch (error) {
    console.error("[Admin] Export leads error:", error);
    res.status(500).json({ error: "导出失败" });
  }
});

// POST /api/admin/logout
router.post("/logout", async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      await prisma.adminSession.deleteMany({ where: { token } });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("[Admin] Logout error:", error);
    res.status(500).json({ error: "退出登录失败" });
  }
});

export default router;
