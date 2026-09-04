import pool from "../../db.js";
// GET /api/orders/:orderId/tracking
const getOrderTracking = async (req, res) => {
    const { id: orderId } = req.params;
    const userId = req.user.id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const orderRes = await pool.query(
            `SELECT id, order_number, status, created_at FROM orders WHERE id = $1 AND user_id = $2`,
            [orderId, userId],
        );

        if (!orderRes.rows.length) {
            return res.status(404).json({ error: "Order not found" });
        }

        const order = orderRes.rows[0];

        // updated statusOrder and allSteps
        const statusOrder = [
            "pending",
            "awaiting_payment",
            "paid",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        const allSteps = [
            {
                status: "pending",
                label: "Order Placed",
                icon: "📦",
                description: "Your order has been received",
            },
            {
                status: "awaiting_payment",
                label: "Awaiting Payment",
                icon: "💳",
                description: "Redirected to payment",
            },
            {
                status: "paid",
                label: "Payment Confirmed",
                icon: "✅",
                description: "Payment has been verified",
            },
            {
                status: "processing",
                label: "Being Packed",
                icon: "🏭",
                description: "Your items are being packed",
            },
            {
                status: "shipped",
                label: "Out for Delivery",
                icon: "🚚",
                description: "Your order is on its way",
            },
            {
                status: "delivered",
                label: "Delivered",
                icon: "🎉",
                description: "Your order has been delivered",
            },
        ];

        // cancelled is terminal — show it instead of the progress steps
        if (order.status === "canceled" || order.status === "cancelled") {
            return res.json({
                order_number: order.order_number,
                tracking_number: `TCG-${order.order_number.replace("ORD-", "")}`,
                courier: "The Courier Guy",
                current_status: "cancelled",
                cancelled: true,
                steps,
                });
        }

        const currentIndex = statusOrder.indexOf(order.status);

        const steps = allSteps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            current: index === currentIndex,
        }));

        const trackingNumber = `TCG-${order.order_number.replace("ORD-", "")}`;

        return res.json({
            order_number: order.order_number,
            tracking_number: trackingNumber,
            courier: "The Courier Guy",
            current_status: order.status,
            steps,
        });
    } catch (err) {
        console.error("getOrderTracking error:", err);
        return res.status(500).json({ error: "Could not load tracking" });
    }
};

export default getOrderTracking;
