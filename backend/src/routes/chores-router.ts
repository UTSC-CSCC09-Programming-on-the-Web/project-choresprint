import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const router = Router();

router.post("/", async (req, res) => {
  // For now, the user and house IDs are expected to be provided in the request body.
  const { title, description, houseId, points } = req.body;

  try {
    const newChore = await prisma.chore.create({
      data: {
        title,
        description,
        houseId: Number(houseId),
        points: Number(points),
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
