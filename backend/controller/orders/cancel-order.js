import pool from "../../db.js";
import { io } from "../../services/io.js";

const cancelOrder = async (req, res) => {
    const { id: orderId } = req.params;
    const { id } = req.user;

    if (!id) return res.status(401).json({ message: "Unauthorized" });

    try {
        const findOrder = await pool.query(
            "SELECT id, status FROM orders WHERE id = $1 AND user_id = $2",
            [orderId, id],
        );

        if (findOrder.rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = findOrder.rows[0];

        // only allow cancelling pending orders
        if (order.status !== "pending") {
            return res.status(400).json({
                message: `Cannot cancel an order that is ${order.status}`,
            });
        }

        const updateOrderStatus = await pool.query(
            "UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id as order_id, status",
            [orderId, id],
        );

        io.to(`user:${id}`).emit("order:canceled", {
            order_id: updateOrderStatus.rows[0].order_id,
            status: "cancelled",
        });

        return res.status(200).json({ message: "Order cancelled" });
    } catch (error) {
        console.error("cancelOrder error", error);
        return res.status(500).json({ message: "Could not cancel order" });
    }
};

export default cancelOrder;
