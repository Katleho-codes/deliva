"use strict";
import pool from "../db.js";

// asserts the requester owns the store resolved earlier in the chain.
// dashboard routes run isStoreDashboardAuth first, which attaches
// req.store and req.isOwner; falls back to a DB check otherwise.
export const isStoreOwner = async (req, res, next) => {
    try {
        if (req.isOwner !== undefined) {
            if (!req.isOwner) {
                return res.status(403).json({
                    message:
                        "Access Denied: You are not the owner of this store.",
                });
            }
            return next();
        }

        const slug = req.params.slug;
        const userId = req.user.id;

        const { rows } = await pool.query(
            "SELECT id FROM stores WHERE owner_id = $1 AND slug = $2 LIMIT 1",
            [userId, slug],
        );

        if (rows.length === 0) {
            return res.status(403).json({
                message: "Access Denied: You are not the owner of this store.",
            });
        }

        next();
    } catch (error) {
        console.error("isStoreOwner error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
