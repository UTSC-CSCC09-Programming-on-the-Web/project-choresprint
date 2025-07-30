import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  authMiddleware,
  subscriptionMiddleware,
} from "../middlewares/middleware";
import {
  createUserValidator,
  updateUserValidator,
  deleteMeValidator,
  getUserValidator,
  getUsersValidator,
  updateUserPreferencesValidator,
} from "../validators/userValidators";

export const router = Router();

router.use(authMiddleware); // require auth

// Get a single user by ID
router.get(
  "/:id",
  subscriptionMiddleware,
  getUserValidator,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const reqUser = await prisma.user.findUnique({
        where: { id: (req.user as any).id },
      });
      if (!reqUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (user.houseId !== reqUser.houseId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Update an existing user
router.patch(
  "/:id",
  subscriptionMiddleware, // require subscription for updates
  updateUserValidator, // Validate the ID and body before updating
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, name, avatarUrl, isAdmin } = req.body;
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: Number(id) } });
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const house = await prisma.house.findUnique({
        where: { id: user?.houseId || undefined },
      });
      if (!house) {
        res.status(404).json({ error: "House not found" });
        return;
      }
      if (house?.createdById !== (req.user as any).id) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: { email, name, avatarUrl, isAdmin },
      });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Update authenticated user's preferences
router.patch(
  "/me/preferences",
  updateUserPreferencesValidator,
  async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userId = (req.user as any)?.id;
    const { weeklyDigest } = req.body;
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { weeklyDigest },
        select: { weeklyDigest: true },
      });
      res.json(updated);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Delete authenticated user's account
router.delete("/me", deleteMeValidator, async (req: Request, res: Response) => {
  try {
    const id = (req.user as any).id;

    // Fetch the user with related house info
    const user = await prisma.user.findUnique({
      where: { id },
      include: { createdHouse: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // If user created a house, remove it and reset all members
    if (user.createdHouse) {
      const houseId = user.createdHouse.id;
      await prisma.invitation.deleteMany({ where: { houseId } });
      await prisma.chore.deleteMany({ where: { houseId } });
      await prisma.user.updateMany({
        where: { houseId },
        data: { houseId: null, points: 0 },
      });
      await prisma.house.delete({ where: { id: houseId } });
    } else if (user.houseId) {
      // If the user is a member of a house they didn't create, unassign chores
      await prisma.chore.updateMany({
        where: { houseId: user.houseId, assignedToId: id },
        data: { assignedToId: null },
      });
    }
    await prisma.user.delete({ where: { id } });
    // Clear auth cookies so deleted users are also signed out
    res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
    res.clearCookie("accessToken");
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
