import rateLimitPackage from "express-rate-limit";
import { BASE_URL, EXCLUDE_FROM_RATELIMIT, PRODUCTION } from "../config/env";
import { RedisStore } from "rate-limit-redis";
import { redisClient } from "@/config/redis.connection";
import { Request } from "express";

const keyGenerator = (req: Request) =>
    req.headers["cf-connecting-ip"]?.toString().split(",")[0].trim() ||
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket.remoteAddress ||
    req.ip ||
    "unknown";

const rateLimit = rateLimitPackage({
    windowMs: 60 * 1000, // per minute
    limit: 50,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator,
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
    keyGenerator,
});

export const chatResourceLimit = rateLimitPackage({
    windowMs: 1000 * 60 * 60 * 24, // 24 hours
    limit: (req) => {
        let limit = PRODUCTION ? 10 : 100;
        const { origin } = req.headers;

        if (origin === BASE_URL) {
            limit = 1;
        }

        if (EXCLUDE_FROM_RATELIMIT.includes(origin || "")) limit = Infinity;

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
    keyGenerator,
    message: {
        message:
            "🤖 Chatbot response limit reached for today. Please try again tomorrow",
    },
});

export const webAgentLimit = rateLimitPackage({
    windowMs: 1000 * 60 * 60 * 24, // 24 hours
    limit: (req) => {
        let limit = PRODUCTION ? 2 : 100;
        const { origin } = req.headers;

        if (origin === BASE_URL) {
            limit = 1;
        }

        if (EXCLUDE_FROM_RATELIMIT.includes(origin || "")) limit = Infinity;

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
    keyGenerator,
    message: {
        message:
            "🤖 Chatbot response limit reached for today. Please try again tomorrow",
    },
});

export default rateLimit;
