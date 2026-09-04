"use client"

import { useSession } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/Loading";

// Redirects unauthenticated visitors to the login page (with a `next`
// return param so they land back where they were after signing in).
function RequireAuth({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isPending && !session) {
            router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
        }
    }, [isPending, session, router, pathname]);

    if (isPending) {
        return <Loading label="Loading..." />;
    }

    if (!session) {
        return null; // redirect in flight
    }

    return <>{children}</>;
}

export default RequireAuth;
