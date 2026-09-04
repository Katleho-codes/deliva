import pool from "../db.js";
import "dotenv/config";

export const isStoreOwnerCanDelete = async (req, res, next) => {
    const { id: storeId } = req.params;
    const userId = req.user.id;
    try {
        // We filter by both store_name AND owner_id in the query itself
        const { rows } = await pool.query(
            "SELECT id, owner_id FROM stores WHERE owner_id = $1 AND id = $2 LIMIT 1",
            [userId, storeId],
        );


        // If no rows are returned, it means either:
        //    - The store doesn't exist
        //    - The user doesn't own it
        if (rows.length === 0) {
            return res.status(403).json({
                message: "Access Denied: You are not the owner of this store.",
            });
        }

        // 4. Success: The query found a match, so user is the owner
        req.store = rows[0];
        next();
    } catch (error) {
        console.error("Middleware Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
