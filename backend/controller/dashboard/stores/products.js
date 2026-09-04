import pool from "../../../db.js";
import { getRedisClient } from "../../../config/redis.js";

const redis = await getRedisClient();
// controller/dashboard/stores/products.js
const getStoreProducts = async (req, res) => {
    const storeId = req.store.id;
    let { page = 1, limit = 20, search } = req.query;

    page = Math.max(parseInt(page, 10), 1);
    limit = Math.max(parseInt(limit, 10), 1);
    const offset = (page - 1) * limit;

    try {
        const searchFilter = search ? `AND p.name ILIKE '%${search}%'` : "";

        const { rows } = await pool.query(
            `SELECT
        p.id, p.name, p.description, p.slug, p.sku, p.sale_price,
        p.cost_price, p.stock_quantity, p.category,
        p.status, p.brand, p.main_image, p.discount,
        p.discount_start, p.discount_end,
        p.low_stock_threshold, p.created_at
     FROM products p
     WHERE p.store_id = $1 ${searchFilter}
     ORDER BY p.created_at DESC
     LIMIT $2 OFFSET $3`,
            [storeId, limit, offset],
        );

        const total = await pool.query(
            `SELECT COUNT(*) FROM products WHERE store_id = $1`,
            [storeId],
        );

        // sync stock from redis
        for (const product of rows) {
            const cached = await redis.get(`product:${product.id}:stock`);
            if (cached !== null) product.stock_quantity = Number(cached);
        }

        return res.json({
            data: rows,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(Number(total.rows[0].count) / limit),
                totalCount: Number(total.rows[0].count),
            },
        });
    } catch (err) {
        console.error("getStoreProducts error:", err);
        return res.status(500).json({ message: "Could not fetch products" });
    }
};

export default getStoreProducts;
