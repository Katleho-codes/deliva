import { NextResponse, type NextRequest } from "next/server";

// Routes that require an authenticated session
const PROTECTED_PREFIXES = ["/dashboard", "/orders", "/checkout", "/onboarding"];

// Auth pages a signed-in user should not see
const AUTH_PAGES = ["/auth/login", "/auth/signup"];

const SESSION_COOKIE = "better-auth.session_token";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // better-auth sets a signed-in suffix variant like ".0" on the token
    const hasSession = request.cookies
        .getAll()
        .some((c) => c.name.startsWith(SESSION_COOKIE) && Boolean(c.value));

    const isProtected = PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );

    if (isProtected && !hasSession) {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (AUTH_PAGES.includes(pathname) && hasSession) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/orders/:path*",
        "/checkout",
        "/onboarding",
        "/auth/login",
        "/auth/signup",
    ],
};
