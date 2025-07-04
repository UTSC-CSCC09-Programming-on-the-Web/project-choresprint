import express, { Request, Response } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { authMiddleware, subscriptionMiddleware } from "../middlewares/middleware";
import { prisma } from "../lib/prisma";
import {
  loginValidator,
  signupValidator,
  refreshTokenValidator,
  resetPasswordValidator,
  newPasswordValidator,
} from "../validators/authValidators";

export const router = express.Router();

// Step 1: Redirect user to Google for login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Step 2: Handle Google's callback after login
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const user = req.user as any;

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      // Include other non-sensitive fields here
    };

    // Send token to frontend (you can use a redirect + query param too)
    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // false in development
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // lax in development
        path: "/api/auth/refresh",
      })
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // false in development
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // lax in development
        maxAge: 3600000,
      })
      //   .json({ accessToken, safeUser })
      .redirect(process.env.CLIENT_URL! || "http://localhost:5173"); // Redirect to frontend URL
  }
);

// (Optional) Get current user session
router.get("/me", authMiddleware, subscriptionMiddleware, async (req, res) => {
  try {
    // If authMiddleware passed, we have a valid user
    const userId = (req.user as any).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        // Add other fields you want to return
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Error in /me endpoint:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.post(
  "/refresh",
  refreshTokenValidator,
  async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ error: "Missing refresh token" });
      return;
    }

    try {
      const payload: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);

      // OPTIONAL: Check if token matches what's in the DB
      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user || user.refreshToken !== token) {
        res.status(403).json({ error: "Invalid refresh token" });
        return;
      }
      res.json({
        accessToken: jwt.sign(
          { id: user.id, email: user.email },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "1h" }
        ),
      });
    } catch (err) {
      res.status(403).json({ error: "Invalid or expired refresh token" });
    }
  }
);

router.post("/logout", async (req: Request, res: Response) => {
  const token = req.cookies.refreshToken;
  if (token) {
    // OPTIONAL: Invalidate in DB
    const payload: any = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!);
    await prisma.user.update({
      where: { id: payload.id },
      data: { refreshToken: null },
    });
  }

  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.clearCookie("accessToken");
  res.json({ message: "Logged out" });
});
