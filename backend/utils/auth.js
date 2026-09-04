import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
import { Resend } from "resend";
import { getRedisClient } from "../config/redis.js";
import pool from "../db.js";
import "dotenv/config";

const redis = await getRedisClient();
const resend = new Resend(process.env.RESEND_TOKEN);

const verificationEmailHtml = (url) => `
    <h2>Welcome to Deliva!</h2>
    <p>Click the link below to verify your email address:</p>
    <a href="${url}">Verify Email</a>
    <p>This link expires in 24 hours.</p>
`;

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.BASE_URL,
    database: pool,
    emailAndPassword: {
        enabled: true,
    },
    user: {
        changeEmail: {
            enabled: true,
            sendChangeEmailConfirmation: async ({ user, url }) => {
                await resend.emails.send({
                    from: "Deliva <onboarding@resend.dev>",
                    to: user.email,
                    subject: "Verify your Deliva email",
                    html: verificationEmailHtml(url),
                });
            },
        },
    },
    trustedOrigins: [process.env.CLIENT_URL].filter(Boolean),
    socialProviders: {
        google: {
            prompt: "select_account",
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
    },

    // emailVerification: {
    //     // send a verification email at signup
    //     sendOnSignUp: true,
    //     autoSignInAfterVerification: true,
    //     async afterEmailVerification(user, request) {
    //         // Your custom logic here, e.g., grant access to premium features
    //     },
    //     sendVerificationEmail: async ({ user, url }) => {
    //         await resend.emails.send({
    //             from: "Deliva <onboarding@resend.dev>",
    //             to: user.email,
    //             subject: "Verify your Deliva email",
    //             html: verificationEmailHtml(url),
    //         });
    //     },
    // },
    // redis
    secondaryStorage: {
        get: async (key) => {
            return await redis.get(key);
        },
        set: async (key, value, ttl) => {
            if (ttl) await redis.set(key, value, { EX: ttl });
            else await redis.set(key, value);
        },
        delete: async (key) => {
            await redis.del(key);
        },
    },
});
