"use strict";

// Thrown intentionally by controllers/middleware for expected failures.
// Anything else that reaches the handler is treated as an unexpected 500.
export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

export const notFoundHandler = (req, res) => {
    res.status(404).json({ message: "Route not found" });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError || (err && typeof err.status === "number")) {
        return res.status(err.status).json({ message: err.message });
    }

    console.error(`[${req.method}] ${req.originalUrl} ->`, err);
    const status = err.status || err.statusCode || 500;
    res.status(status >= 400 ? status : 500).json({
        message: status < 500 ? err.message : "Internal server error",
    });
};
