import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { compareImagesWithOpenAI } from "../services/openaiService";
import { prisma } from "../lib/prisma";
import { io as socketClient } from "socket.io-client";

// Create a socket client connection to the main backend server
const socket = socketClient("http://localhost:4000");

socket.on("connect", () => {
  // Worker connected to main backend socket server
});

socket.on("disconnect", () => {
  // Worker disconnected from main backend socket server
});

type JobPayload = {
  choreId: number;
  referenceUrl: string;
  proofUrl: string;
  title: string;
  description: string;
};

const worker = new Worker(
  "chore-verification",
  async (job: Job<JobPayload>) => {
    const { choreId, referenceUrl, proofUrl, title, description } = job.data;

    const response = await compareImagesWithOpenAI(
      referenceUrl,
      proofUrl,
      title,
      description
    );

    await prisma.chore.update({
      where: { id: choreId },
      data: {
        verified: response.is_completed,
        isCompleted: response.is_completed,
        photoUrl: proofUrl,
        attempted: true,
        explanation: response.explanation,
      },
    });

    if (response.is_completed) {
      // Increment points for the user who completed the chore
      const chore = await prisma.chore.findUnique({ where: { id: choreId } });
      if (chore?.assignedToId) {
        await prisma.user.update({
          where: { id: chore.assignedToId },
          data: {
            points: {
              increment: chore.points,
            },
          },
        });
      }
    }

    const returnValue = {
      success: true,
      verified: response.is_completed,
      explanation: response.explanation,
    };

    return returnValue;
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  // Emit event to main backend via socket client
  if (socket.connected) {
    socket.emit("worker-chore-verified", {
      choreId: job.data.choreId,
      verified: job.returnvalue?.verified || false,
      explanation: job.returnvalue?.explanation || "Verification completed",
    });
  }
});

worker.on("failed", (job, err) => {
  if (job && socket.connected) {
    socket.emit("worker-chore-verified", {
      choreId: job.data.choreId,
      verified: false,
      explanation: "Verification failed due to system error",
    });
  }
});
