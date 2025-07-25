import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, subscriptionMiddleware } from "../middlewares/middleware";
import {
  createUserValidator,
  updateUserValidator,
  deleteMeValidator,
  getUserValidator,
  getUsersValidator,
  updateUserPreferencesValidator,
} from "../validators/userValidators";

export const router = Router();

router.use(authMiddleware, subscriptionMiddleware); // require auth and active subscription

router.get("/", getUsersValidator, async (req: Request, res: Response) => {
  // Pagination parameters
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  try {
    const totalCount = await prisma.user.count();
    const totalPages = Math.ceil(totalCount / limit);
    const users = await prisma.user.findMany({
      // fetch users with parameters
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    res.json({
      data: users,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get a single user by ID
router.get("/:id", getUserValidator, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Create a new user
router.post("/", createUserValidator, async (req: Request, res: Response) => {
  const { email, name, avatarUrl } = req.body;
  try {
    const newUser = await prisma.user.create({
      data: { email, name, avatarUrl },
    });
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Update an existing user
router.patch(
  "/:id",
  updateUserValidator, // Validate the ID and body before updating
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, name, avatarUrl } = req.body;
    try {
      const updatedUser = await prisma.user.update({
        where: { id: Number(id) },
        data: { email, name, avatarUrl },
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
router.delete(
  "/me",
  deleteMeValidator,
  async (req: Request, res: Response) => {
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
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);