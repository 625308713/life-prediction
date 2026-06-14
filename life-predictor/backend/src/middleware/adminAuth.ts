import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/client";
import { v4 as uuidv4 } from "uuid";

export async function adminLogin(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // No default fallback: an unset ADMIN_PASSWORD disables admin entirely
    // instead of silently accepting a well-known password.
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error(
        "[Admin] ADMIN_PASSWORD is not configured; admin login is disabled"
      );
      res.status(503).json({ error: "后台未启用" });
      return;
    }

    const { password } = req.body;

    if (!password || password !== adminPassword) {
      res.status(401).json({ error: "密码错误" });
      return;
    }

    // Clean expired sessions
    await prisma.adminSession.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.adminSession.create({
      data: { token, expiresAt },
    });

    res.json({ token, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    console.error("[Admin] Login error:", error);
    res.status(500).json({ error: "登录失败，请稍后重试" });
  }
}

export async function adminAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "未授权访问" });
      return;
    }

    const token = authHeader.slice(7);

    const session = await prisma.adminSession.findUnique({
      where: { token },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.adminSession.delete({ where: { id: session.id } });
      }
      res.status(401).json({ error: "登录已过期，请重新登录" });
      return;
    }

    next();
  } catch (error) {
    console.error("[Admin] Auth middleware error:", error);
    res.status(500).json({ error: "认证服务异常" });
  }
}
