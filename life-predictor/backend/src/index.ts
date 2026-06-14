import { readFile } from "fs/promises";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import predictionRoutes from "./routes/prediction";
import adminRoutes from "./routes/admin";
import engagementRoutes from "./routes/engagement";
import { startAIRetryWorker } from "./services/aiRetry";
import { adminLogin } from "./middleware/adminAuth";
import prisma from "./prisma/client";
import {
  computeLifeScore,
  deriveLifeExpectancyMetrics,
} from "./services/algorithm";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || "";
const NODE_ENV = process.env.NODE_ENV || "development";

app.set("trust proxy", 1);

type SeoMeta = {
  title: string;
  description: string;
  path: string;
  robots?: string;
  imagePath?: string;
  type?: "website" | "article";
};

const defaultSeo: SeoMeta = {
  title: "LifeScore - Health-Span Scorecard",
  description:
    "A lightweight health-span scorecard for strengths, priority risks, and the next small move.",
  path: "/",
};

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function getBaseUrl(req: express.Request): string {
  if (PUBLIC_SITE_URL) return normalizeBaseUrl(PUBLIC_SITE_URL);
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  return `${protocol}://${req.get("host") || `localhost:${PORT}`}`;
}

function toAbsoluteUrl(req: express.Request, value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  const pathValue = value.startsWith("/") ? value : `/${value}`;
  return `${getBaseUrl(req)}${pathValue}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value: string): string {
  return escapeHtml(value);
}

function normalizePathname(pathname: string): string {
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

async function getShareSeoMeta(id: string): Promise<SeoMeta> {
  const fallback: SeoMeta = {
    title: "LifeScore Share Card | Health-Span Score",
    description:
      "A lightweight LifeScore share card showing a score, strengths, priority risks, and next-step guidance.",
    path: `/share/${id}`,
    robots: "noindex, follow",
  };

  try {
    const prediction = await prisma.prediction.findUnique({
      where: { id },
      select: {
        age: true,
        gender: true,
        baseLifeExpectancy: true,
        confidenceLevel: true,
      },
    });

    if (!prediction) return fallback;

    const { percentile, totalAdjustment } = deriveLifeExpectancyMetrics(
      prediction.gender,
      prediction.baseLifeExpectancy,
      prediction.age
    );
    const score = computeLifeScore(
      percentile,
      totalAdjustment,
      prediction.confidenceLevel
    );

    return {
      ...fallback,
      title: `${score} LifeScore Share Card | Health-Span Score`,
      description:
        "A share-safe LifeScore card with only public highlights: score, confidence, strengths, and first priority.",
    };
  } catch (error) {
    console.error("[SEO] Failed to build share meta:", error);
    return fallback;
  }
}

async function resolveSeoMeta(req: express.Request): Promise<SeoMeta> {
  const pathname = normalizePathname(req.path);
  const shareMatch = pathname.match(/^\/share\/([^/]+)$/);
  if (shareMatch) return getShareSeoMeta(shareMatch[1]);

  const staticMeta: Record<string, SeoMeta> = {
    "/": defaultSeo,
    "/how-it-works": {
      title: "How LifeScore Works | Health-Span Score Method",
      description:
        "Learn how LifeScore turns health signals, result ranges, confidence, and action priorities into a lightweight health-span scorecard.",
      path: "/how-it-works",
    },
    "/privacy": {
      title: "Privacy Policy | LifeScore",
      description:
        "Learn what LifeScore collects, how questionnaire data is used, and how health-related information should be protected.",
      path: "/privacy",
    },
    "/disclaimer": {
      title: "Disclaimer | LifeScore",
      description:
        "LifeScore is a health education and self-reflection tool, not medical advice, diagnosis, treatment, or emergency guidance.",
      path: "/disclaimer",
    },
    "/advertising": {
      title: "Recommendations & Advertising | LifeScore",
      description:
        "LifeScore may use low-distraction recommendations or ads, with clear labeling and no sensitive health-data targeting without consent.",
      path: "/advertising",
    },
  };

  if (staticMeta[pathname]) return staticMeta[pathname];
  if (pathname === "/share") {
    return {
      title: "LifeScore Share Card | Health-Span Score",
      description:
        "A lightweight LifeScore share card showing public highlights without full questionnaire answers.",
      path: "/share",
      robots: "noindex, follow",
    };
  }
  if (pathname.startsWith("/result")) {
    return {
      title: "LifeScore Result",
      description:
        "View a private LifeScore result with strengths, priority risks, and next-step guidance.",
      path: pathname,
      robots: "noindex, nofollow",
    };
  }
  if (pathname.startsWith("/admin")) {
    return {
      title: "LifeScore Admin",
      description: "LifeScore private admin area.",
      path: pathname,
      robots: "noindex, nofollow",
    };
  }

  return { ...defaultSeo, path: pathname };
}

function injectSeoTags(
  html: string,
  req: express.Request,
  meta: SeoMeta
): string {
  const managedMetaPattern =
    /<meta\b(?=[^>]*(?:name|property)=["'](?:description|robots|og:site_name|og:type|og:title|og:description|og:url|og:image|twitter:card|twitter:title|twitter:description|twitter:image)["'])[^>]*>\s*/gi;
  const canonicalPattern = /<link\b(?=[^>]*rel=["']canonical["'])[^>]*>\s*/gi;
  const titlePattern = /<title>[\s\S]*?<\/title>\s*/i;

  const canonicalUrl = toAbsoluteUrl(req, meta.path);
  const imageUrl = toAbsoluteUrl(req, meta.imagePath || "/og-lifescore.svg");
  const title = escapeHtml(meta.title);
  const description = escapeHtml(meta.description);
  const robots = escapeHtml(meta.robots || "index, follow");
  const type = escapeHtml(meta.type || "website");

  const tags = [
    `    <title>${title}</title>`,
    `    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `    <meta name="description" content="${description}" />`,
    `    <meta name="robots" content="${robots}" />`,
    `    <meta property="og:site_name" content="LifeScore" />`,
    `    <meta property="og:type" content="${type}" />`,
    `    <meta property="og:title" content="${title}" />`,
    `    <meta property="og:description" content="${description}" />`,
    `    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `    <meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${title}" />`,
    `    <meta name="twitter:description" content="${description}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
  ].join("\n");

  const strippedHtml = html
    .replace(titlePattern, "")
    .replace(canonicalPattern, "")
    .replace(managedMetaPattern, "");

  return strippedHtml.replace(/<\/head>/i, `${tags}\n  </head>`);
}

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // Recharts and React set inline style attributes at runtime.
        styleSrc: ["'self'", "'unsafe-inline'"],
        // data: covers the inline SVG favicon; blob:/data: cover poster downloads.
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: NODE_ENV === "production" ? false : FRONTEND_URL,
    credentials: true,
  })
);
// The questionnaire payload is a few KB; anything near the limit is abuse.
app.use(express.json({ limit: "200kb" }));

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "尝试次数过多，请 15 分钟后再试" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public routes
app.post("/api/admin/login", adminLoginLimiter, adminLogin);
app.use("/api/predictions", predictionRoutes);
app.use("/api", engagementRoutes);

// Admin routes (auth required)
app.use("/api/admin", adminRoutes);

app.get("/robots.txt", (req, res) => {
  const sitemapUrl = toAbsoluteUrl(req, "/sitemap.xml");
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Allow: /",
      "Disallow: /api",
      "Disallow: /api/",
      "Disallow: /admin",
      "Disallow: /admin/",
      "Disallow: /result",
      "Disallow: /result/",
      `Sitemap: ${sitemapUrl}`,
      "",
    ].join("\n")
  );
});

app.get("/sitemap.xml", (req, res) => {
  const lastmod = new Date().toISOString().slice(0, 10);
  const urls = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/how-it-works", changefreq: "monthly", priority: "0.8" },
    { path: "/privacy", changefreq: "yearly", priority: "0.4" },
    { path: "/disclaimer", changefreq: "yearly", priority: "0.4" },
    { path: "/advertising", changefreq: "yearly", priority: "0.4" },
  ];
  const body = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(toAbsoluteUrl(req, url.path))}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
    )
    .join("\n");

  res.type("application/xml").send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
  );
});

// Serve frontend static files in production
if (NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../../dist/public");
  app.use(express.static(staticPath, { index: false }));
  app.get("*", async (req, res, next) => {
    try {
      const html = await readFile(path.join(staticPath, "index.html"), "utf8");
      const meta = await resolveSeoMeta(req);
      res.type("html").send(injectSeoTags(html, req, meta));
    } catch (error) {
      next(error);
    }
  });
}

// Global error handler
app.use(
  (
    err: Error & { status?: number; statusCode?: number },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    // Preserve client-error statuses from middleware (e.g. 413 payload too
    // large, 400 malformed JSON from body-parser) instead of masking as 500.
    const status = err.status || err.statusCode;
    if (status && status >= 400 && status < 500) {
      res.status(status).json({ error: "请求无效" });
      return;
    }
    console.error("[Server] Unhandled error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
);

app.listen(PORT, () => {
  console.log(`[Server] LifeScore API running on port ${PORT}`);
  console.log(`[Server] Environment: ${NODE_ENV}`);
  startAIRetryWorker();
});

export default app;
