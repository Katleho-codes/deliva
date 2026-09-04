import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";
// this gets all stores (used for public view)
// with redis cache

const redis = await getRedisClient();

const getAllStores = async (req, res) => {
    let { page = 1, limit = 10 } = req.query;

    // Parse and validate `page` and `limit`
    page = Math.max(parseInt(page, 10), 1); // Ensure `page` is at least 1
    limit = Math.max(parseInt(limit, 10), 1); // Ensure `limit` is at least 1
    const offset = (page - 1) * limit;

    const cacheKey = `stores:page:${page}:limit:${limit}`;

    try {
        // try cache
        const cached = await redis.get(cacheKey);
        if (cached) return res.status(200).json(JSON.parse(cached));

        const { rows } = await pool.query(
            "SELECT id, name, description, email, slug, phone, logo, address_line1, address_line2, city, province, postal_code, operating_hours FROM stores ORDER BY name DESC LIMIT $1 OFFSET $2",
            [limit, offset],
        );

        // Fetch the total count of stores
        const total = await pool.query("SELECT COUNT(*) FROM stores");
        const totalStores = parseInt(total.rows[0].count, 10);

        const response = {
            data: rows,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(totalStores / limit),
                totalStores,
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

export default getAllStores;
