import { Queue } from 'bullmq';
import { redis } from '../config/redis';

export const choreVerificationQueue = new Queue('chore-verification', {
  connection: redis,
});