import axios, { AxiosError } from "axios";

/**
 * Shared API client for all backend REST calls.
 * - baseURL from env (no more per-call URL interpolation)
 * - cookies sent automatically (better-auth session)
 * - errors normalized: err.apiMessage always carries the backend message
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    withCredentials: true,
});

// Extract the backend's `{ message }` / `{ error }` envelope into one place.
export function getApiErrorMessage(
    error: unknown,
    fallback = "Something went wrong",
): string {
    const err = error as AxiosError<{ message?: string; error?: string }>;
    return (
        err?.response?.data?.message ?? err?.response?.data?.error ?? fallback
    );
}

export default api;
