import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const optionalAuth = async (req, res, next) => {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        // If no session, we don't block. We just don't attach a user.
        req.user = session?.user || null;
        next();
    } catch (err) {
        // never block public routes on session lookup failures
        console.error("optionalAuth error:", err);
        req.user = null;
        next();
    }
};
