// frontend/lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: `${process.env.NEXT_PUBLIC_SERVER_URL}`, // Your Express Backend
    fetchOptions: {
        credentials: "include", // Required for cross-origin cookies
    },
});

// Export the hooks specifically from this instance
export const { useSession, signIn, signUp, signOut } = authClient;
