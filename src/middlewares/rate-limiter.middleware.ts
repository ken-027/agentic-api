import rateLimitPackage from "express-rate-limit";
import { BASE_URL, PRODUCTION } from "../config/env";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "@/config/redis.connection";

const rateLimit = rateLimitPackage({
    windowMs: 60 * 1000, // per minute
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
});

export const resourceLimit = rateLimitPackage({
    windowMs: 60 * 1000, // per minute
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

export const modifyResourceLimit = rateLimitPackage({
    windowMs: 60 * 1000, // per minute
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
});

export const chatResourceLimit = rateLimitPackage({
    windowMs: 1000 * 60 * 60 * 24, // 24 hours
    limit: (req) => {
        let limit = PRODUCTION ? 10 : 100;
        const { origin } = req.headers;

        if (origin === BASE_URL) {
            limit = 1;
        }

        return limit;
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipFailedRequests: true,
    store: PRODUCTION
        ? new RedisStore({
              sendCommand: (...args: string[]) => redisClient.sendCommand(args),
          })
        : undefined,
    keyGenerator: (req) => req.ip as string,
    message: {
        message:
            "🤖 Chatbot response limit reached for today. Please try again tomorrow",
    },
});

export const scriptResourceLimit = rateLimitPackage({
    windowMs: 1000 * 60 * 60 * 24, // 24 hours
    limit: PRODUCTION ? 5 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: PRODUCTION
        ? new RedisStore({
              sendCommand: (...args: string[]) => redisClient.sendCommand(args),
          })
        : undefined,
});

export const emailResourceLimit = rateLimitPackage({
    windowMs: 1000 * 60 * 60 * 24, // 24 hours
    limit: 3,
    standardHeaders: true,
    legacyHeaders: false,
    store: PRODUCTION
        ? new RedisStore({
              sendCommand: (...args: string[]) => redisClient.sendCommand(args),
          })
        : undefined,
    message: {
        message:
            "⚠️ Email request limit reached for today. Please try again tomorrow",
    },
});

export default rateLimit;
