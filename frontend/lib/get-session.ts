// lib/get-session.ts (Server Only)
import { headers } from "next/headers";

export async function getSession() {
    const cookieHeader = await headers(); // Next.js 15+: async
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/get-session`,
        {
            headers: Object.fromEntries(cookieHeader), // Forward cookies to Express
            cache: "no-store",
        },
    );
    if (!response.ok) return null;
    return response.json();
}
