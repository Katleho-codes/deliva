import { auth } from "../utils/auth.js";
import { fromNodeHeaders } from "better-auth/node";

export const isLoggedIn = async (req, res, next) => {
    // we will check if user has a session, instead of doing this in every controller
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    if (!session) {
        return res
            .status(401)
            .json({ message: "Unauthorized: Please log in." });
    }
    req.user = session.user; // Attach user object to the request
    next();
};
