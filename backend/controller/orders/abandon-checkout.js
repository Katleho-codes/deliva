import pool from "../../db.js";
import { io } from "../../services/io.js";

// POST /api/orders/:orderId/abandon
// Called when a user leaves the checkout screen without paying.
// Cancels any pending order and reactivates the cart so the items
// seamlessly reappear for the next checkout attempt.
const abandonCheckout = async (req, res) => {
    const { orderId } = req.params;
    const { id: userId } = req.user;

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // find the order and ensure it belongs to the user and is pending
        const orderRes = await client.query(
            `SELECT id, status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE`,
            [orderId, userId],
        );
        if (orderRes.rows.length === 0) {
            throw Object.assign(new Error("Order not found"), { status: 404 });
        }

        const order = orderRes.rows[0];

        // only pending orders can be abandoned; if already paid/paid-processed,
        // just return the current cart without touching anything
        if (order.status === "pending") {
            await client.query(
                `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND user_id = $2`,
                [orderId, userId],
            );

            // reactivate the user's cart so the items come back
            await client.query(
                `UPDATE carts SET status = 'active', updated_at = NOW() WHERE user_id = $1`,
                [userId],
            );
        }

        await client.query("COMMIT");

        // push the refreshed cart so the UI updates live
        const cartRes = await client.query(
            `SELECT
                c.id AS cart_id,
                c.status,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'product_id',   p.id,
                            'name',         p.name,
                            'slug',         p.slug,
                            'sale_price',   p.sale_price,
                            'quantity',     ci.quantity,
                            'image',        p.main_image
                        )
                    ) FILTER (WHERE ci.id IS NOT NULL),
                    '[]'::json
                ) AS items
             FROM carts c
             LEFT JOIN cart_items ci ON ci.cart_id = c.id
             LEFT JOIN products p    ON p.id = ci.product_id
             WHERE c.user_id = $1 AND c.status = 'active'
             GROUP BY c.id, c.status`,
            [userId],
        );

        const cart =
            cartRes.rows.length === 0
                ? { cart_id: null, status: "empty", items: [] }
                : cartRes.rows[0];

        io.to(`user:${userId}`).emit("cart:updated", cart);
        io.to(`user:${userId}`).emit("order:canceled", {
            order_id: Number(orderId),
            status: "cancelled",
        });

        return res.status(200).json({ message: "Checkout abandoned", cart });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        if (err.status === 404) {
            return res.status(404).json({ message: "Order not found" });
        }
        console.error("abandonCheckout error:", err);
        return res.status(500).json({ message: "Could not abandon checkout" });
    } finally {
        client.release();
    }
};

export default abandonCheckout;
