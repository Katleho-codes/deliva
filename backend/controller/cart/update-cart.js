import pool from "../../db.js";
import { getRedisClient } from "../../config/redis.js";
import { io } from "../../services/io.js";

const redis = await getRedisClient();

const updateCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const { id: userId } = req.user;
    if (!product_id || quantity === undefined || quantity < 0) {
        return res.status(400).json({ message: "Invalid product or quantity" });
    }

    try {
        const { rows: cartRows } = await pool.query(
            `SELECT id FROM carts WHERE user_id = $1 AND status = 'active' LIMIT 1`,
            [userId],
        );

        if (cartRows.length === 0) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cartId = cartRows[0].id;

        const { rows: itemRows } = await pool.query(
            `SELECT quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
            [cartId, product_id],
        );

        if (itemRows.length === 0) {
            return res.status(404).json({ message: "Item not found in cart" });
        }

        // fetch stock upfront so it's always in scope
        const { rows: stockRows } = await pool.query(
            `SELECT stock_quantity FROM products WHERE id = $1`,
            [product_id],
        );

        if (!stockRows.length) {
            return res.status(404).json({ message: "Product not found" });
        }

        const dbStock = stockRows[0].stock_quantity;

        if (quantity === 0) {
            await pool.query(
                `DELETE FROM cart_items WHERE cart_id = $1 AND product_id = $2`,
                [cartId, product_id],
            );
        } else {
            if (quantity > dbStock) {
                return res.status(409).json({ message: "Not enough stock" });
            }

            await pool.query(
                `UPDATE cart_items
                 SET quantity = $1, updated_at = now()
                 WHERE cart_id = $2 AND product_id = $3`,
                [quantity, cartId, product_id],
            );
        }

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
            [userId, dbStock],
        );

        const cart = updatedCart[0] ?? null;

        io.to(`user:${userId}`).emit("cart:updated", cart);
        return res.status(200).json({ message: "Cart updated", cart });
    } catch (error) {
        console.error("updateCart error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export default updateCart;
