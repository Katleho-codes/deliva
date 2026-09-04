import pool from "../../db.js";
import { getRedisClient } from "../../config/redis.js";
import { io } from "../../services/io.js";

const redis = await getRedisClient();
const CART_CACHE_TTL = 60 * 30;

const removeFromCart = async (req, res) => {
    const { id: productId } = req.params;
    const { id: userId } = req.user;

    try {
        const { rows: cartRows } = await pool.query(
            `SELECT id FROM carts WHERE user_id = $1 AND status = 'active' LIMIT 1`,
            [userId],
        );

        if (!cartRows.length) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cartId = cartRows[0].id;

        // get quantity before deleting so we can restore the right amount
        const { rows: itemRows } = await pool.query(
            `DELETE FROM cart_items 
             WHERE cart_id = $1 AND product_id = $2 
             RETURNING quantity`,
            [cartId, productId],
        );

        if (!itemRows.length) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // restore actual quantity back to Redis
        // await redis.incrBy(`product:${productId}:stock`, itemRows[0].quantity);

        // fetch updated cart and refresh cache
        const { rows: updatedCart } = await pool.query(
            `SELECT
                c.id AS cart_id,
                c.status,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'product_id',   p.id,
                            'name',         p.name,
                            'slug',         p.slug,
                            'sale_price',        p.sale_price,
                            'quantity',     ci.quantity,
                            'image',        p.main_image,
                            'out_of_stock', ci.quantity > $2
                        )
                    ) FILTER (WHERE ci.id IS NOT NULL),
                    '[]'::json
                ) AS items
             FROM carts c
             LEFT JOIN cart_items ci ON ci.cart_id = c.id
             LEFT JOIN products p    ON p.id = ci.product_id
             WHERE c.user_id = $1 AND c.status = 'active'
             GROUP BY c.id, c.status`,
            [userId, 0],
        );

        const cart = updatedCart[0] ?? null;

        // if (cart) {
        //     await redis.set(`cart:user:${userId}`, JSON.stringify(cart), {
        //         EX: CART_CACHE_TTL,
        //     });
        // }

        io.to(`user:${userId}`).emit("cart:updated", cart);
        return res.status(200).json({ message: "Item removed", cart });
    } catch (error) {
        console.error("removeFromCart error:", error);
        return res.status(500).json({ message: "Could not remove item" });
    }
};

export default removeFromCart;
