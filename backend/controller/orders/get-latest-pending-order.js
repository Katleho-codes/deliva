import pool from "../../db.js";

// this will be used in the checkout screen
// pulls latest pending order
const getLatestPendingOrder = async (req, res) => {
    const { id } = req.user;
    try {
        const { rows } = await pool.query(
            `
SELECT
  o.id AS order_id,
  o.order_number,
  o.status,
  o.sub_total,
  o.delivery_fee,
  o.total_amount,
   COALESCE(
    json_agg(
      json_build_object(
        'product_id', oi.product_id,
        'quantity', oi.quantity,
        'sale_price', oi.total_amount
      )
    ) FILTER (WHERE oi.id IS NOT NULL),
    '[]'::json
  ) AS items
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.user_id = $1
AND o.status = 'pending'
GROUP BY o.id
ORDER BY o.created_at DESC
LIMIT 1;

            `,
            [id],
        );
        return res.status(200).json(rows[0]);
    } catch (error) {
        console.log("get-latest-pending-order.js error", error);
    }
};

export default getLatestPendingOrder;
