import express from "express";
import cors from "cors";
import path from "path";
import predictionRoutes from "./routes/prediction";
import adminRoutes from "./routes/admin";
import { adminLogin } from "./middleware/adminAuth";

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const NODE_ENV = process.env.NODE_ENV || "development";

// Middleware
app.use(
  cors({
    origin: NODE_ENV === "production" ? false : FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Public routes
app.post("/api/admin/login", adminLogin);
app.use("/api/predictions", predictionRoutes);

// Admin routes (auth required)
app.use("/api/admin", adminRoutes);

// Serve frontend static files in production
if (NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../../dist/public");
  app.use(express.static(staticPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// Global error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[Server] Unhandled error:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
);

app.listen(PORT, () => {
  console.log(`[Server] Life Predictor API running on port ${PORT}`);
  console.log(`[Server] Environment: ${NODE_ENV}`);
});

export default app;
