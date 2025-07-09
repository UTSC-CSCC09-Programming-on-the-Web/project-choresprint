import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { authMiddleware, subscriptionMiddleware } from "../middlewares/middleware";
import {
  createUserValidator,
  updateUserValidator,
  deleteUserValidator,
  getUserValidator,
  getUsersValidator,
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

// Delete a user
router.delete(
  "/:id",
  deleteUserValidator, // Validate the ID before deletion
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      await prisma.user.delete({ where: { id: Number(id) } });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/:id/houses", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if ((req.user as any).id !== Number(id)) {
      res
        .status(403)
        .json({ error: "Forbidden: You can only access your own houses." });
      return;
    }

    const userHouses = await prisma.userHouse.findMany({
      where: { userId: Number(id) },
      include: { house: true }, // Include house details
    });
    res.json(userHouses);
  } catch (error) {
    console.error("Error fetching user's houses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
