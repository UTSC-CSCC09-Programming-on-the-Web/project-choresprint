import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middlewares/middleware";
import {
  createChoreValidator,
  updateChoreValidator,
  getChoreValidator,
  deleteChoreValidator,
  uploadCompletionPhotoValidator,
} from "../validators/choreValidators";

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

export const router = Router();

router.use(authMiddleware); // Apply auth middleware to all routes in this router

router.post(
  "/",
  upload.single("file"),
  createChoreValidator,
  async (req: Request, res: Response) => {
    // For now, the user and house IDs are expected to be provided in the request body.
    const { title, description, houseId, points, dueDate, assignedToId } =
      req.body;

    if (!title || !houseId) {
      res.status(400).json({ error: "title and houseId are required." });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    try {
      const newChore = await prisma.chore.create({
        data: {
          title,
          description,
          houseId: Number(houseId),
          points: Number(points),
          referencePhotoUrl: photoUrl,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assignedToId: assignedToId ? Number(assignedToId) : undefined,
        },
      });
      res.status(201).json(newChore);
    } catch (error) {
      console.error("Error creating chore:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get("/:id", getChoreValidator, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const chore = await prisma.chore.findUnique({
      where: { id: Number(id) },
    });
    if (!chore) {
      res.status(404).json({ error: "Chore not found" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: (req.user as any).id },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (chore.houseId !== user.houseId) {
      res.status(403).json({ error: "You do not have access to this chore." });
      return;
    }

    res.json(chore);
  } catch (error) {
    console.error("Error fetching chore:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch(
  "/:id",
  updateChoreValidator,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, dueDate, isCompleted, assignedToId } = req.body;

    try {
      const chore = await prisma.chore.findUnique({
        where: { id: Number(id) },
        include: {
          house: true, // Include the house to check if the user is a member
        },
      });

      if (!chore) {
        res.status(404).json({ error: "Chore not found" });
        return;
      }

      if (!chore.assignedToId && isCompleted) {
        res.status(400).json({
          error:
            "Cannot mark a chore as completed if it is not assigned to anyone.",
        });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: (req.user as any).id },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (
        chore.house.createdById !== user.id &&
        chore.assignedToId !== user.id
      ) {
        res
          .status(403)
          .json({ error: "You do not have access to this chore." });
        return;
      }
      const updatedChore = await prisma.chore.update({
        where: { id: Number(id) },
        data: {
          title: title || chore.title,
          description: description || chore.description,
          dueDate: dueDate ? new Date(dueDate) : chore.dueDate,
          isCompleted: isCompleted,
          assignedToId: assignedToId
            ? Number(assignedToId)
            : chore.assignedToId,
        },
      });
      if (isCompleted && updatedChore.assignedToId) {
        // Increment points for the user who completed the chore
        await prisma.user.update({
          where: { id: updatedChore.assignedToId },
          data: {
            points: {
              increment: updatedChore.points,
            },
          },
        });
      }
      res.json(updatedChore);
    } catch (error) {
      console.error("Error updating chore:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/:id",
  deleteChoreValidator,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: (req.user as any).id },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const chore = await prisma.chore.findUnique({
        where: { id: Number(id) },
        include: {
          house: true, // Include the house to check if the user is a member
        },
      });

      if (!chore) {
        res.status(404).json({ error: "Chore not found" });
        return;
      }

      if (chore.house.createdById !== user.id) {
        res.status(403).json({
          error: "You do not have permission to delete this chore.",
        });
        return;
      }
      await prisma.chore.delete({
        where: { id: Number(id) },
      });

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting chore:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
