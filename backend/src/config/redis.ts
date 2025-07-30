import { Redis } from "ioredis";

export const redis = new Redis(
  process.env.REDIS_URL || "redis://localhost:6379",
  {
    maxRetriesPerRequest: null, // Disable automatic retries
    enableReadyCheck: true, // Enable ready check to ensure connection is established
    // connectTimeout: 10000, // 10 seconds timeout for connection
  },
);
