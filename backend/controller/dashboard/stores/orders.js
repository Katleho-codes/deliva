import pool from "../../../db.js";
const getStoreOrders = async (req, res) => {
    const storeId = req.store.id;
    let { page = 1, limit = 10, status } = req.query;

    page = Math.max(parseInt(page, 10), 1);
    limit = Math.max(parseInt(limit, 10), 1);
    const offset = (page - 1) * limit;

    try {
        const statusFilter = status ? `AND o.status = '${status}'` : "";

        const { rows } = await pool.query(
            `SELECT
        o.id, o.order_number, o.status,
        o.total_amount, o.sub_total, o.delivery_fee,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email,
        json_agg(
            json_build_object(
                'product_id', p.id,
                'product_name', p.name,
                'quantity', oi.quantity,
                'sale_price', oi.total_amount
            )
        ) as items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN products p ON p.id = oi.product_id
     JOIN "user" u ON u.id = o.user_id
     WHERE p.store_id = $1 ${statusFilter}
     GROUP BY o.id, o.order_number, o.status,
              o.total_amount, o.sub_total, o.delivery_fee,
              o.created_at, u.name, u.email
     ORDER BY o.created_at DESC
     LIMIT $2 OFFSET $3`,
            [storeId, limit, offset],
        );

        const total = await pool.query(
            `SELECT COUNT(DISTINCT o.id) as total
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
        console.error("getStoreOrders error:", err);
        return res.status(500).json({ message: "Could not fetch orders" });
    }
};
export default getStoreOrders;
