import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const router = Router();

router.get("/", async (req, res) => {
  try {
    // Parse pagination parameters from query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalCount = await prisma.house.count();
    const totalPages = Math.ceil(totalCount / limit);
    
    // Fetch houses with pagination
    const houses = await prisma.house.findMany({
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { userHouses: true, chores: true }
        }
      }
    });

    // Return paginated results with metadata
    res.json({
      data: houses,
      pagination: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    console.error("Error fetching houses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  // For now, the user ID is expected to be provided in the request body.
  const { name, userId } = req.body;

  try {
    const newHouse = await prisma.house.create({
      data: {
        name,
        createdById: Number(userId),
      },
    });
    await prisma.userHouse.create({
      data: {
        userId: Number(userId),
        houseId: newHouse.id,
      },
    });
    res.status(201).json(newHouse);
  } catch (error) {
    console.error("Error creating house:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedHouse = await prisma.house.update({
      where: { id: Number(id) },
      data: { name },
    });
    res.json(updatedHouse);
  } catch (error) {
    console.error("Error updating house:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.house.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting house:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/chores", async (req, res) => {
  const { id } = req.params;
  const { cursor, limit = "10", sortBy = "createdAt", sortDir = "desc" } = req.query;
  
  const parsedLimit = Math.min(parseInt(limit as string) || 10, 50); // Cap at 50 items
  const cursorId = cursor ? parseInt(cursor as string) : undefined;
  
  try {
    // Validate house exists
    const house = await prisma.house.findUnique({
      where: { id: Number(id) },
      select: { id: true }
    });
    
    if (!house) {
      res.status(404).json({ error: "House not found" });
      return;
    }

    // Define query parameters
    const validatedSortBy = (sortBy as string) === 'createdAt' || (sortBy as string) === 'dueDate' 
      ? sortBy as string 
      : 'createdAt';
    
    const validatedSortDir = (sortDir as string) === 'asc' || (sortDir as string) === 'desc'
      ? sortDir as 'asc' | 'desc'
      : 'desc';

    // Prepare query options
    let queryOptions: any = {
      where: { 
        houseId: Number(id) 
      },
      take: parsedLimit,
      orderBy: [
        { [validatedSortBy]: validatedSortDir },
        { id: 'asc' } // Secondary sort by ID to ensure consistent ordering
      ],
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    };

    // Add cursor pagination if cursor is provided
    if (cursorId) {
      queryOptions.cursor = { id: cursorId };
      queryOptions.skip = 1; // Skip the cursor item
    }
    
    // Get chores with cursor pagination
    const chores = await prisma.chore.findMany(queryOptions);
    
    // Get total count of chores for this house
    const totalCount = await prisma.chore.count({
      where: { houseId: Number(id) }
    });
    
    // Determine the next cursor
    const nextCursor = chores.length === parsedLimit ? chores[chores.length - 1].id : null;

    res.json({
      data: chores,
      pagination: {
        totalCount,
        nextCursor,
        hasNextPage: chores.length === parsedLimit,
        limit: parsedLimit
      }
    });
  } catch (error) {
    console.error("Error fetching chores for house:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});