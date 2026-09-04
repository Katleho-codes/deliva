import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { getRedisClient } from "../config/redis.js";

// Redis-backed store so limits hold across restarts and instances.
// The client resolves lazily on first request; if Redis is unreachable
// the limiter fails open instead of blocking traffic.
const makeStore = (prefix) =>
    new RedisStore({
        prefix,
        sendCommand: async (...commands) => {
            const redis = await getRedisClient();
            return redis.sendCommand(commands);
        },
    });

const baseOptions = {
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    passOnStoreError: true,
};

// general API limiter
export const limiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    store: makeStore("rl:api:"),
});

// stricter limiter for auth endpoints (login/signup brute-force protection)
export const authLimiter = rateLimit({
    ...baseOptions,
    windowMs: 15 * 60 * 1000,
    limit: 20,
    skipSuccessfulRequests: true, // only count failed attempts
    store: makeStore("rl:auth:"),
});
