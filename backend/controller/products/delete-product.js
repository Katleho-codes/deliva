import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";
import * as Yup from "yup";
import { io } from "../../services/io.js";
const redis = await getRedisClient();

const deleteProduct = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
        const findProduct = await pool.query(
            "SELECT id FROM products WHERE id = $1 AND created_by = $2 LIMIT 1",
            [id, userId],
        );
        if (findProduct.rows.length === 0)
            return res.status(404).json({ message: "Product not found" });

        await pool.query(
            "DELETE FROM products WHERE id = $1 AND created_by = $2",
            [id, userId],
        );

        io.to(`user:${userId}`).emit("product:deleted", { id });

        return res
            .status(200)
            .json({ message: "Product deleted successfully" });
    } catch (error) {
        process.env.NODE_ENV === "development"
            ? console.log("delete product error", error)
            : null;
        return res
            .status(500)
            .json({ message: "Product not deleted, try again" });
    }
};
export default deleteProduct;
