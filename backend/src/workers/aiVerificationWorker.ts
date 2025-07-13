import "dotenv/config";
import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { compareImagesWithOpenAI } from "../services/openaiService";
import { prisma } from "../lib/prisma";

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

    return { success: true, verified: response.is_completed };
  },
  { connection: redis }
);

worker.on("completed", (job) => {
  console.log(`✅ Chore ${job.id} verified`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
