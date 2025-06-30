import { createClient } from "redis";
import { REDIS_URL } from "./env";

export const redisClient = createClient({
    url: REDIS_URL,
});

export const initializeRedisConnection = async () => {
    await redisClient.connect();

    console.log("redis client connected!");
};
