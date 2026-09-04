import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";
// this gets all stores (used for public view)
// with redis cache

const redis = await getRedisClient();

const getStoreStaff = async (req, res) => {
    let { page = 1, limit = 10 } = req.query;

    // Parse and validate `page` and `limit`
    page = Math.max(parseInt(page, 10), 1); // Ensure `page` is at least 1
    limit = Math.max(parseInt(limit, 10), 1); // Ensure `limit` is at least 1
    const offset = (page - 1) * limit;

    const cacheKey = `store:staff:page:${page}:limit:${limit}`;

    try {
        // try cache
        const cached = await redis.get(cacheKey);
        if (cached) return res.status(200).json(JSON.parse(cached));

        const { rows } = await pool.query(
            "SELECT id, store_id, user_id, role, invited_by as created_by, created_at from store_staff LIMIT $1 OFFSET $2",
            [limit, offset],
        );

        // Fetch the total count of stores
        const total = await pool.query("SELECT COUNT(*) FROM store_staff");
        const totalStaff = parseInt(total.rows[0].count, 10);

        const response = {
            data: rows,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalStaff / limit),
                totalStaff,
            },
        };

        // cache result
        // this expires
        await redis.setEx(cacheKey, 60, JSON.stringify(response));
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : error.message, // Hide detailed error message in production
        });
    }
};

export default getStoreStaff;
