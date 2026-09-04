import pool from "../../../db.js";

const getStoreCustomers = async (req, res) => {
    const storeId = req.store.id;
    let { page = 1, limit = 10 } = req.query;

    page = Math.max(parseInt(page, 10), 1);
    limit = Math.max(parseInt(limit, 10), 1);
    const offset = (page - 1) * limit;

    try {
        const { rows } = await pool.query(
            `SELECT
                u.id, u.name, u.email,
                COUNT(DISTINCT o.id) as total_orders,
                COALESCE(SUM(o.total_amount), 0) as total_spent,
                MAX(o.created_at) as last_order_at
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p ON p.id = oi.product_id
             JOIN "user" u ON u.id = o.user_id
             WHERE p.store_id = $1
             GROUP BY u.id, u.name, u.email
             ORDER BY last_order_at DESC
             LIMIT $2 OFFSET $3`,
            [storeId, limit, offset],
        );

        const total = await pool.query(
            `SELECT COUNT(DISTINCT o.user_id) as total
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.id
             JOIN products p ON p.id = oi.product_id
             WHERE p.store_id = $1`,
            [storeId],
        );

        return res.json({
            data: rows,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(Number(total.rows[0].total) / limit),
                totalCount: Number(total.rows[0].total),
            },
        });
    } catch (err) {
        console.error("getStoreCustomers error:", err);
        return res.status(500).json({ message: "Could not fetch customers" });
    }
};

export default getStoreCustomers;
