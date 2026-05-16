import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const queueKey = (eventId: string) => `queue:${eventId}`;
export const etaKey = (eventId: string) => `eta:${eventId}`;
export const positionKey = (eventId: string) => `pos:${eventId}`;
