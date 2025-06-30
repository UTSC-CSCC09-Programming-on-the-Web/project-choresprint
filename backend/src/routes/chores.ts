import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middlewares/middleware";

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

router.post("/", upload.single("file"), async (req, res) => {
  // For now, the user and house IDs are expected to be provided in the request body.
  const { title, description, houseId, points } = req.body;

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
      },
    });
    res.status(201).json(newChore);
  } catch (error) {
    console.error("Error creating chore:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const chore = await prisma.chore.findUnique({
      where: { id: Number(id) },
    });
    if (!chore) {
      res.status(404).json({ error: "Chore not found" });
      return;
    }
    res.json(chore);
  } catch (error) {
    console.error("Error fetching chore:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, dueDate, completed } = req.body;

  try {
    const updatedChore = await prisma.chore.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
      },
    });
    res.json(updatedChore);
  } catch (error) {
    console.error("Error updating chore:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.chore.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting chore:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
