import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { authMiddleware, subscriptionMiddleware } from "../middlewares/middleware";
import {
  createHouseValidator,
  updateHouseValidator,
  deleteHouseValidator,
  getHouseValidator,
  getHousesValidator,
  getHouseChoresValidator,
} from "../validators/houseValidators";

export const router = Router();

router.use(authMiddleware, subscriptionMiddleware); // require auth and active subscription
router.get("/", getHousesValidator, async (req: Request, res: Response) => {
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
        createdAt: "desc",
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { members: true, chores: true },
        },
      },
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
        hasPrevious: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching houses:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", createHouseValidator, async (req: Request, res: Response) => {
  const { name } = req.body;

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

    if (user.houseId !== null) {
      res.status(400).json({ error: "You are already a member of a house." });
      return;
    }

    const newHouse = await prisma.house.create({
      data: {
        name,
        createdById: (req.user as any).id,
      },
    });
    await prisma.user.update({
      where: { id: (req.user as any).id },
      data: { houseId: newHouse.id },
    });
    res.status(201).json(newHouse);
  } catch (error) {
    console.error("Error creating house:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", getHouseValidator, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const house = await prisma.house.findUnique({
      where: { id: Number(id) },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { members: true, chores: true },
        },
      },
    });

    if (!house) {
      res.status(404).json({ error: "House not found" });
      return;
    }

    res.json(house);
  } catch (error) {
    console.error("Error fetching house:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.patch(
  "/:id",
  updateHouseValidator,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name } = req.body;

    try {
      const updatedHouse = await prisma.house.update({
        where: { id: Number(id) },
        data: { name },
      });

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      if (updatedHouse.createdById !== (req.user as any).id) {
        res.status(403).json({
          error: "Forbidden: You do not have permission to update this house.",
        });
        return;
      }
      res.json(updatedHouse);
    } catch (error) {
      console.error("Error updating house:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/:id",
  deleteHouseValidator,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const house = await prisma.house.findUnique({
        where: { id: Number(id) },
        select: { id: true, createdById: true },
      });

      if (!house) {
        res.status(404).json({ error: "House not found" }); // raise 404 not found
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" }); // raise 401 unauthorized
        return;
      }

      if (house.createdById !== (req.user as any).id) {
        res.status(403).json({ // raise 403 forbidden
          error: "Forbidden: You do not have permission to delete this house.",
        });
        return;
      }
      
      await prisma.invitation.deleteMany({ where: { houseId: house.id } });
      await prisma.chore.deleteMany({ where: { houseId: house.id } });
      await prisma.user.updateMany({
        where: { houseId: house.id },
        data: { houseId: null, points: 0 }, 
      });
      await prisma.house.delete({ where: { id: house.id } });
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting house:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.get(
  "/:id/chores",
  getHouseChoresValidator,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      cursor,
      limit = "10",
      sortBy = "createdAt",
      sortDir = "desc",
      assignedTo,
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit as string) || 10, 50); // Cap at 50 items
    const cursorId = cursor ? parseInt(cursor as string) : undefined;

    try {
      // Validate house exists
      const house = await prisma.house.findUnique({
        where: { id: Number(id) },
        select: { id: true },
      });

      if (!house) {
        res.status(404).json({ error: "House not found" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: (req.user as any).id },
        select: { houseId: true },
      });

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (house.id !== user.houseId) {
        res.status(403).json({
          error: "Forbidden: You do not have permission to access this house.",
        });
        return;
      }
      

      // Define query parameters
      const validatedSortBy =
        (sortBy as string) === "createdAt" || (sortBy as string) === "dueDate"
          ? (sortBy as string)
          : "createdAt";

      const validatedSortDir =
        (sortDir as string) === "asc" || (sortDir as string) === "desc"
          ? (sortDir as "asc" | "desc")
          : "desc";

      // Prepare where clause with filters
      const whereClause: any = {
        houseId: Number(id),
      };

      // Add assignedTo filter if provided
      if (assignedTo) {
        whereClause.assignedToId = Number(assignedTo);
      }

      // Prepare query options
      let queryOptions: any = {
        where: whereClause,
        take: parsedLimit,
        orderBy: [
          { [validatedSortBy]: validatedSortDir },
          { id: "asc" }, // Secondary sort by ID to ensure consistent ordering
        ],
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      };

      // Add cursor pagination if cursor is provided
      if (cursorId) {
        queryOptions.cursor = { id: cursorId };
        queryOptions.skip = 1; // Skip the cursor item
      }

      // Get chores with cursor pagination
      const chores = await prisma.chore.findMany(queryOptions);

      // Get total count of chores for this house with the same filters
      const totalCount = await prisma.chore.count({
        where: whereClause,
      });

      // Determine the next cursor
      const nextCursor =
        chores.length === parsedLimit ? chores[chores.length - 1].id : null;

      res.json({
        data: chores,
        pagination: {
          totalCount,
          nextCursor,
          hasNextPage: chores.length === parsedLimit,
          limit: parsedLimit,
        },
      });
    } catch (error) {
      console.error("Error fetching chores for house:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

router.post("/:id/invitations", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const house = await prisma.house.findUnique({
      where: { id: Number(id) },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!house) {
      res.status(404).json({ error: "House not found" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (house.createdById !== (req.user as any).id) {
      res.status(403).json({
        error:
          "Forbidden: You do not have permission to invite users to this house.",
      });
      return;
    }

    await prisma.invitation.deleteMany({
      where: { houseId: Number(id) },
    });

    const code = uuidv4();

    const invitation = await prisma.invitation.create({
      data: {
        code,
        houseId: Number(id),
        invitedById: (req.user as any).id,
      },
    });

    res.json({
      code,
      link: `${process.env.CLIENT_URL}/join/${code}`,
    });
  } catch (error) {
    console.error("Error handling house invitation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/invitations/:code/use", async (req: Request, res: Response) => {
  const { code } = req.params;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { code },
      include: {
        house: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      res.status(404).json({ error: "Invitation not found" });
      return;
    }

    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Check if user is already a member of the house
    const user = await prisma.user.findUnique({
      where: { id: (req.user as any).id },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.houseId !== null) {
      res.status(400).json({ error: "You are already a member of a house." });
      return;
    }

    // Add user to the house
    await prisma.user.update({
      where: { id: user.id },
      data: { houseId: invitation.house.id },
    });

    res.json({
      message: `You have successfully joined the house "${invitation.house.name}".`,
      houseId: invitation.house.id,
    });
  } catch (error) {
    console.error("Error using invitation code:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id/users", async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: (req.user as any).id },
      select: { houseId: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (user.houseId !== Number(id)) {
      res.status(403).json({ error: "You do not have access to this house." });
      return;
    }

    // Get total count for pagination metadata
    const totalCount = await prisma.user.count({
      where: { houseId: Number(id) },
    });

    const totalPages = Math.ceil(totalCount / limit);

    const users = await prisma.user.findMany({
      where: { houseId: Number(id) },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        chores: {
          where: {
            isCompleted: true,
          },
          select: {
            points: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        name: "asc", // Order by name since we can't order by points directly
      },
    });

    // Calculate points for each user and map the response
    const usersWithPoints = users.map(user => {
      const totalPoints = user.chores.reduce((sum, chore) => sum + chore.points, 0);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        points: totalPoints,
      };
    });

    // Sort by points in descending order
    usersWithPoints.sort((a, b) => b.points - a.points);

    res.json({
      data: usersWithPoints,
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
    console.error("Error fetching house users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id/leave", async (req: Request, res: Response) => {
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

    if (user.houseId !== Number(id)) {
      res.status(403).json({ error: "You do not have access to this house." });
      return;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { houseId: null, points: 0 }, // Reset points when leaving the house
    });

    await prisma.chore.updateMany({
      where: {
        houseId: Number(id),
        assignedToId: (req.user as any).id,
      },
      data: { assignedToId: null },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error leaving house:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
