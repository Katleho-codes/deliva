import pool from "../../../db.js";

const getStoreDashboard = async (req, res) => {
    const storeId = req.store.id;
    try {
        const [
            ordersRes,
            revenueRes,
            productsRes,
            customersRes,
            recentOrdersRes,
        ] = await Promise.all([
            // total orders
            pool.query(
                `SELECT COUNT(DISTINCT o.id) as total
                 FROM orders o
                 JOIN order_items oi ON oi.order_id = o.id
                 JOIN products p ON p.id = oi.product_id
                 WHERE p.store_id = $1`,
                [storeId],
            ),
            // total revenue
            pool.query(
                `SELECT COALESCE(SUM(o.total_amount), 0) as total
                 FROM orders o
                 JOIN order_items oi ON oi.order_id = o.id
                 JOIN products p ON p.id = oi.product_id
                 WHERE p.store_id = $1 AND o.status = 'paid'`,
                [storeId],
            ),
            // total products
            pool.query(
                `SELECT COUNT(*) as total FROM products WHERE store_id = $1`,
                [storeId],
            ),
            // total customers
            pool.query(
                `SELECT COUNT(DISTINCT o.user_id) as total
                 FROM orders o
                 JOIN order_items oi ON oi.order_id = o.id
                 JOIN products p ON p.id = oi.product_id
                 WHERE p.store_id = $1`,
                [storeId],
            ),
            // recent orders
            pool.query(
                `SELECT DISTINCT
                    o.id, o.order_number, o.status,
                    o.total_amount, o.created_at,
                    u.name as customer_name
                 FROM orders o
                 JOIN order_items oi ON oi.order_id = o.id
                 JOIN products p ON p.id = oi.product_id
                 JOIN "user" u ON u.id = o.user_id
                 WHERE p.store_id = $1
                 ORDER BY o.created_at DESC
                 LIMIT 5`,
                [storeId],
            ),
        ]);

        return res.json({
            stats: {
                total_orders: Number(ordersRes.rows[0].total),
                total_revenue: Number(revenueRes.rows[0].total),
                total_products: Number(productsRes.rows[0].total),
                total_customers: Number(customersRes.rows[0].total),
            },
            recent_orders: recentOrdersRes.rows,
        });
    } catch (err) {
        console.error("getStoreDashboard error:", err);
        return res.status(500).json({ message: "Could not fetch dashboard" });
    }
};
export default getStoreDashboard;
