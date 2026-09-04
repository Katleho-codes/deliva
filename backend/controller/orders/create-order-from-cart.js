import pool from "../../db.js";
import "dotenv/config";
import crypto from "crypto";
import { now } from "../../utils/datetime.js";
import { getRedisClient } from "../../config/redis.js";
import { ApiError } from "../../middleware/error-handler.js";

const redis = await getRedisClient();

const createOrderFromCart = async (req, res) => {
    const { id: userId } = req.user;
    const client = await pool.connect();
    try {
        const created_at = now();
        await client.query("BEGIN");

        // get active cart
        const cartRes = await client.query(
            `SELECT id FROM carts WHERE user_id = $1 AND status = 'active' LIMIT 1`,
            [userId],
        );
        if (cartRes.rows.length === 0) {
            throw new ApiError(400, "No active cart");
        }

        const cartId = cartRes.rows[0].id;

        // get cart items
        const itemsRes = await client.query(
            `
            SELECT 
                ci.product_id,
                ci.quantity,
                p.sale_price
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = $1
            `,
            [cartId],
        );

        if (!itemsRes.rows.length) {
            throw new ApiError(400, "Cart is empty");
        }

        // calculate total
        const subTotal = itemsRes.rows.reduce(
            (sum, item) => sum + item.sale_price * item.quantity,
            0,
        );
        const deliveryFee = 50;

        const totalAmount = subTotal + deliveryFee;
        const status = "pending";
        const orderRef =
            "ORD-" + crypto.randomBytes(4).toString("hex").toUpperCase();

        // add to orders table first
        const addOrder = await client.query(
            `
            insert into orders (user_id, status, order_number, created_at, sub_total, delivery_fee, total_amount) values ($1, $2, $3, $4, $5, $6, $7) returning id, sub_total, delivery_fee, total_amount
            `,
            [
                userId,
                status,
                orderRef,
                created_at,
                subTotal,
                deliveryFee,
                totalAmount,
            ],
        );

        const orderId = addOrder.rows[0].id;

        // add order items, linked to orders table
        for (const item of itemsRes.rows) {
            await client.query(
                `
                 insert into order_items (order_id, product_id, total_amount, quantity)
                 values ($1, $2, $3, $4) returning id, order_id, product_id, total_amount

                `,
                [orderId, item.product_id, item.sale_price, item.quantity],
            );
        }

        // lock cart
        await client.query(
            `UPDATE carts SET status = 'converted' WHERE id = $1`,
            [cartId],
        );

        // clear redis cart since it is now converted
        await redis.del(`cart:user:${userId}`);

        await client.query("COMMIT");

        // Cache order
        await redis.set(`order:${orderId}`, JSON.stringify(addOrder.rows[0]), {
            EX: 60 * 60,
        });

        return res.status(201).json({
            message: "Order successfuly created",
            order_id: orderId,
        });
    } catch (err) {
        await client.query("ROLLBACK").catch(() => {});
        if (err instanceof ApiError) {
            return res.status(err.status).json({ error: err.message });
        }
        console.error("Create order error:", err);
        return res.status(500).json({ error: "Could not create order" });
    } finally {
        client.release();
    }
};

export default createOrderFromCart;
