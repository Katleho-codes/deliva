"use strict";
import pool from "../../db.js";
import { getRedisClient } from "../../config/redis.js";
import { io } from "../../services/io.js";

const redis = await getRedisClient();
const deleteStore = async (req, res) => {
    const storeId = req.params.id;
    const { id: userId } = req.user;

    try {
        // double check — only owner can delete
        if (req.store.owner_id !== Number(userId)) {
            return res.status(403).json({
                message: "Only the store owner can delete this store",
            });
        }
        // get all product ids before deleting — we need them for redis cleanup
        const products = await pool.query(
            `SELECT id, slug FROM products WHERE store_id = $1`,
            [storeId],
        );
        await pool.query(`DELETE FROM stores WHERE id = $1`, [storeId]);

        // clean up redis
        const pipeline = redis.multi();

        // delete each product's stock and cache
        for (const product of products.rows) {
            pipeline.del(`product:${product.id}:stock`);
            pipeline.del(`product:${product.id}:threshold`);
            pipeline.del(`product:name:${product.slug}`);
        }

        // delete store cache and user's store list
        pipeline.del(`store:${req.params.slug}`);
        pipeline.del(`stores:user:${userId}`);

        // delete product listing pages (all pages since products are gone)
        const productCacheKeys = await redis.keys("products:page:*");
        for (const key of productCacheKeys) {
            pipeline.del(key);
        }

        await pipeline.exec();

        io.to(`user:${userId}`).emit("store:deleted", { id: storeId });
        return res.json({ message: "Store deleted" });
    } catch (err) {
        console.error("deleteStore error:", err);
        return res.status(500).json({ message: "Could not delete store" });
    }
};

export default deleteStore;
