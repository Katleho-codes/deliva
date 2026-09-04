import { createClient } from "redis";

let redisClient;

export async function getRedisClient() {
    if (redisClient && redisClient.isOpen) {
        return redisClient;
    }

    redisClient = createClient({
        url: `${process.env.REDIS_URL}`, // optional but recommended
    });

    redisClient.on("error", (err) => {
        console.error("Redis Client Error", err);
    });

    if (!redisClient.isOpen) {
        await redisClient.connect();
    }

    return redisClient;
}
