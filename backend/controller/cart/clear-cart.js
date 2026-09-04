import pool from "../../db.js";
import { getRedisClient } from "../../config/redis.js";

const redis = await getRedisClient();

const clearCart = async (req, res) => {
    const { id: userId } = req.user;
    try {
        /* get active cart */
        const cartRes = await pool.query(
            `SELECT id FROM carts WHERE user_id = $1 AND status = 'active'`,
            [userId],
        );

        if (cartRes.rows.length === 0) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cart_id = cartRes.rows[0].id;

        /* delete cart items */
        await pool.query(`DELETE FROM cart_items WHERE cart_id = $1`, [
            cart_id,
        ]);

        /*  invalidate Redis */
        await redis.del(`cart:user:${userId}`);

        return res.status(200).json({ message: "Cart cleared" });
    } catch (error) {
        console.error("clearCart error", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export default clearCart;
