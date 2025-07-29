import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import multer from "multer";
import {
  authMiddleware,
  subscriptionMiddleware,
} from "../middlewares/middleware";
import {
  uploadBufferToCloudinary,
  deletePhotoFromCloudinary,
} from "../config/cloudinary";
import {
  createChoreValidator,
  updateChoreValidator,
  getChoreValidator,
  deleteChoreValidator,
  uploadCompletionPhotoValidator,
} from "../validators/choreValidators";
import { choreVerificationQueue } from "../queues/choreVerificationQueue";
import { getESTEndOfDayUTC } from "../utils/date";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export const router = Router();

router.use(authMiddleware, subscriptionMiddleware); // require auth and active subscription
router.post(
  "/",
  upload.single("file"),
  createChoreValidator,
  async (req: Request, res: Response) => {
    // For now, the user and house IDs are expected to be provided in the request body.
    const { title, description, houseId, points, dueDate, assignedToId } =
      req.body;

    if (!req.file) {
      res.status(400).json({ error: "File is required." });
      return;
    }

    const result = await uploadBufferToCloudinary(
      req.file.buffer,
      req.file.originalname
    );

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

      if (user.houseId !== Number(houseId)) {
        res.status(403).json({
          error: "You do not have access to this house.",
        });
        return;
      }

      const house = await prisma.house.findUnique({
        where: { id: Number(houseId) },
        include: {
          members: true, // Include members to check if the user is a member
        },
      });
      if (!house) {
        res.status(404).json({ error: "House not found" });
        return;
      }

      if (!user.isAdmin && user.id !== house.createdById) {
        res.status(403).json({
          error: "You do not have permission to create chores in this house.",
        });
        return;
      }

      const newChore = await prisma.chore.create({
        data: {
          title,
          description,
          houseId: Number(houseId),
          points: Number(points),
          referencePhotoUrl: (result as any).secure_url,
          dueDate: dueDate ? getESTEndOfDayUTC(dueDate) : undefined,
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
    const {
      title,
      description,
      dueDate,
      isCompleted,
      assignedToId,
      points,
      explanation,
    } = req.body;

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

      if (chore.house.createdById !== user.id && !user.isAdmin) {
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
          dueDate: dueDate ? getESTEndOfDayUTC(dueDate) : chore.dueDate,
          isCompleted: isCompleted,
          assignedToId: assignedToId
            ? Number(assignedToId)
            : chore.assignedToId,
          points: points || chore.points,
          explanation: explanation,
        },
      });
      if (isCompleted && updatedChore.assignedToId && !chore.isCompleted) {
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
      if (!isCompleted && chore.isCompleted && chore.assignedToId) {
        // If reverting completion, subtract points from the original assignee
        await prisma.user.update({
          where: { id: chore.assignedToId },
          data: {
            points: {
              decrement: chore.points,
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

      if (chore.house.createdById !== user.id && !user.isAdmin) {
        res.status(403).json({
          error: "You do not have permission to delete this chore.",
        });
        return;
      }
      await prisma.chore.delete({
        where: { id: Number(id) },
      });

      if (chore.referencePhotoUrl) {
        await deletePhotoFromCloudinary(chore.referencePhotoUrl);
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting chore:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post(
  "/:id/upload-completion-photo",
  upload.single("file"),
  uploadCompletionPhotoValidator,
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ error: "File is required." });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const chore = await prisma.chore.findUnique({
        where: { id: Number(id) },
      });

      if (!chore) {
        res.status(404).json({ error: "Chore not found" });
        return;
      }

      if (chore.isCompleted) {
        res.status(400).json({ error: "Chore is already completed." });
        return;
      }

      if (chore.assignedToId !== (req.user as any).id) {
        res.status(403).json({
          error: "You are not assigned to this chore.",
        });
        return;
      }

      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.originalname
      );

      // Reset the attempted flag when a new proof is uploaded
      await prisma.chore.update({
        where: { id: Number(id) },
        data: {
          attempted: false,
          verified: false,
          photoUrl: (result as any).secure_url,
        },
      });

      await choreVerificationQueue.add("verify-chore", {
        choreId: chore.id,
        referenceUrl: chore.referencePhotoUrl,
        proofUrl: (result as any).secure_url,
        title: chore.title,
        description: chore.description,
      });

      res.status(200).json({ message: "Chore verification in progress." });
    } catch (error) {
      console.error("Error uploading completion photo:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
