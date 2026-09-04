import pool from "../../db.js";
import { getRedisClient } from "../../config/redis.js";

const redis = await getRedisClient();
const getUserOwnedStores = async (req, res) => {
    const { id: userId } = req.user;
    try {
        const cacheKey = `stores:user:${userId}`;
        const cached = await redis.get(cacheKey);
        if (cached) return res.status(200).json(JSON.parse(cached));

        const { rows } = await pool.query(
            `SELECT id, name, description, slug, banner_url
             FROM stores
             WHERE owner_id = $1 
             ORDER BY created_at DESC`,
            [userId],
        );
        await redis.set(cacheKey, JSON.stringify(rows), { EX: 60 * 5 });
        return res.status(200).json(rows);
    } catch (err) {
        console.error("getMyStores error:", err);
        return res.status(500).json({ message: "Could not fetch stores" });
    }
};

export default getUserOwnedStores;
