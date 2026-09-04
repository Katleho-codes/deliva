import "dotenv/config";
import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";
import { io } from "../../services/io.js";

const redis = await getRedisClient();
const CART_CACHE_TTL = 60 * 30;

const luaScript = `
    local stock = tonumber(redis.call('GET', KEYS[1]))
    if stock == nil then return -2 end
    if stock < tonumber(ARGV[1]) then return -1 end
    return redis.call('DECRBY', KEYS[1], ARGV[1])
`;

const addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    const { id: userId } = req.user;

    if (!product_id || !quantity || quantity < 1) {
        return res.status(400).json({
            message: "Invalid product or quantity hello",
        });
    }

    try {
        const { rows } = await pool.query(
            `SELECT stock_quantity FROM products WHERE id = $1`,
            [product_id],
        );

        if (!rows.length) {
            return res.status(404).json({ message: "Product not found" });
        }

        const dbStock = rows[0].stock_quantity;

        if (dbStock <= 0) {
            return res.status(409).json({ message: "Out of stock" });
        }

        if (quantity > dbStock) {
            return res.status(409).json({ message: "Not enough stock" });
        }

        let cartId;
        const { rows: cartRows } = await pool.query(
            `SELECT id FROM carts WHERE user_id = $1 AND status = 'active' LIMIT 1`,
            [userId],
        );

        if (cartRows.length > 0) {
            cartId = cartRows[0].id;
        } else {
            // the user can only ever have one carts row (user_id is UNIQUE),
            // so if a previous cart was converted/abandoned, reactivate it
            // instead of trying to insert a second row (which would fail).
            const { rows: existingRow } = await pool.query(
                `SELECT id FROM carts WHERE user_id = $1 LIMIT 1`,
                [userId],
            );

            if (existingRow.length > 0) {
                await pool.query(
                    `UPDATE carts SET status = 'active', updated_at = now() WHERE id = $1`,
                    [existingRow[0].id],
                );
                cartId = existingRow[0].id;
            } else {
                const { rows: newCart } = await pool.query(
                    `INSERT INTO carts (user_id, status) VALUES ($1, 'active') RETURNING id`,
                    [userId],
                );
                cartId = newCart[0].id;
            }
        }

        await pool.query(
            `INSERT INTO cart_items (cart_id, product_id, quantity, created_at)
             VALUES ($1, $2, $3, now())
             ON CONFLICT (cart_id, product_id)
             DO UPDATE SET
                 quantity   = cart_items.quantity + EXCLUDED.quantity,
                 updated_at = now()`,
            [cartId, product_id, quantity],
        );

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
        return res.status(201).json({ message: "Added to cart", cart });
    } catch (error) {
        console.error("addToCart error:", error);
        return res.status(500).json({ message: "Could not add to cart" });
    }
};
export default addToCart;
