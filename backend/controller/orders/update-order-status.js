"use strict";
import pool from "../../db.js";
import { io } from "../../services/io.js";

// PATCH /api/dashboard/stores/:slug/orders/:orderId/status
const updateOrderStatus = async (req, res) => {
    const storeId = req.store.id;
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
        "paid",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    ];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const result = await pool.query(
            `UPDATE orders SET status = $1, updated_at = NOW()
             WHERE id = $2
             AND id IN (
                SELECT DISTINCT o.id FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                JOIN products p ON p.id = oi.product_id
                WHERE p.store_id = $3
             )
             RETURNING id, status, user_id`,
            [status, orderId, storeId],
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Order not found" });
        }

        // this part is where we send an email
        // notify the CUSTOMER who owns the order via socket
        io.to(`user:${result.rows[0].user_id}`).emit("order:updated", {
            order_id: orderId,
            status,
            message: `Your order has been marked as ${status.replace("_", " ")}`,
        });

        return res.json({ message: "Status updated", status });
    } catch (err) {
        console.error("updateOrderStatus error:", err);
        return res.status(500).json({ message: "Could not update status" });
    }
};
export default updateOrderStatus;
