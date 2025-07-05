import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { prisma } from "../lib/prisma";

export const authMiddleware: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token =
    req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!);
    (req as any).user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// check if the user has an active subscription
export const subscriptionMiddleware: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.subscriptionStatus !== "active") {
      res.status(402).json({ error: "Active subscription required" });
      return;
    }

    next();
  } catch (err) {
    console.error("Subscription check failed:", err);
    res.status(500).json({ error: "Server error" });
  }
};
