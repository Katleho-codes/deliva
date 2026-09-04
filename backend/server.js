"use strict";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import compression from "compression";
import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { router as carts } from "./routes/carts/index.js";
import { router as dashboardStores } from "./routes/dashboard/stores/index.js";
import { router as orders } from "./routes/orders/orders.js";
import { router as products } from "./routes/products/products.js";
import { router as search } from "./routes/search/index.js";
import { router as stores } from "./routes/stores/stores.js";
import app from "./services/app.js";
import httpServer from "./services/http.js";
import { io } from "./services/io.js";
import { auth } from "./utils/auth.js";
import { corsOptions } from "./utils/cors.js";
import { authLimiter } from "./utils/limiter.js";

const port = process.env.PORT;

io.use(async (socket, next) => {
    try {
        // reuse your existing better-auth session check
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(socket.request.headers),
        });

        if (!session) {
            return next(new Error("Unauthorized"));
        }

        // attach user to socket — same as req.user in middleware
        socket.user = session.user;
        next();
    } catch (err) {
        next(new Error("Unauthorized"));
    }
});
io.on("connection", (socket) => {
    // auto join using the authenticated user id — no need for client to emit join
    socket.join(`user:${socket.user.id}`);

    socket.on("disconnect", () => {
        // console.log("client disconnected:", socket.id);
    });
});

// proxy + hardening settings must be set before any request handling
app.set("trust proxy", 1); // trust first proxy
app.disable("x-powered-by");

app.use(helmet()); // security headers first
app.use(compression()); // gzip responses
app.use(cors(corsOptions)); // CORS before routes so preflights succeed
// better-auth reads/parses request bodies itself, so only form bodies
// for non-auth routes need this (JSON is mounted after the auth route)
app.use(express.urlencoded({ extended: false }));

// auth endpoints: stricter limits, handled entirely by better-auth
app.all("/api/auth/*splat", authLimiter, toNodeHandler(auth));

// Handle JSON requests for the rest of the API
app.use(express.json());

app.use("/api/orders", orders);
app.use("/api/search", search);
app.use("/api/products", products);
app.use("/api/carts", carts);
app.use("/api/stores", stores);
app.use("/api/dashboard/stores/:slug", dashboardStores);

// 404 for unknown routes, then central error handler (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

httpServer.listen(port, () => {
    console.log(`Deliva app listening on port ${port}`);
});
