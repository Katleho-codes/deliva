import pool from "../../db.js";

const getOrdersByStore = async (req, res) => {
    const { store_id } = req.params;
    try {
        const { rows } = await pool.query(
            `
            SELECT
    o.id AS order_id,
    o.order_number,
    o.created_at,
    o.status,
    o.quantity,
    o.total_amount,

    u.id AS user_id,
    u.email,

    p.id AS product_id,
    p.name AS product_name,
    p.sale_price
FROM orders o
JOIN products p ON p.id = o.product_id
JOIN "user" u ON u.id = o.user_id
WHERE o.store_id = $1
ORDER BY o.created_at DESC;

            `,
            [store_id],
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("get-orders-by-store error:", error);
        return res.status(500).json({ message: "Could not load orders" });
    }
};

export default getOrdersByStore;
