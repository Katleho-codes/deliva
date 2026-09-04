import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";
const CART_CACHE_TTL = 60 * 30;
const redis = await getRedisClient();

const getUserCart = async (req, res) => {
    const { id } = req.user;
    if (!id) return;

    try {
        /* Fallback to DB */
        const { rows } = await pool.query(
            `
          SELECT
    c.id AS cart_id,
    c.status,
    COALESCE(
        json_agg(
            json_build_object(
                'product_id', p.id,
                'name', p.name,
                'slug', p.slug,
                'sale_price', p.sale_price,
                'quantity', ci.quantity,
                'image', p.main_image
            )
            ORDER BY ci.created_at
        ) FILTER (WHERE ci.id IS NOT NULL),
        '[]'::json
    ) AS items
FROM carts c
LEFT JOIN cart_items ci ON ci.cart_id = c.id
LEFT JOIN products p ON p.id = ci.product_id
WHERE c.user_id = $1
  AND c.status = 'active'
GROUP BY c.id, c.status;

            `,
            [id],
        );

        const cart =
            rows.length === 0
                ? { cart_id: null, status: "empty", items: [] }
                : rows[0];
        return res.status(200).json(cart);
    } catch (error) {
        console.error("getUserCart error", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export default getUserCart;
