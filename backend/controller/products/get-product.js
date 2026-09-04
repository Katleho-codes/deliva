import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";

const redis = await getRedisClient();

const getProduct = async (req, res) => {
    let { slug } = req.params;
    const cacheKey = `product:name:${slug}`;

    try {
        // try cache for product data
        const cached = await redis.get(cacheKey);
        let product;

        if (cached) {
            product = JSON.parse(cached);
        } else {
            const { rows } = await pool.query(
                `SELECT
                    p.id, p.created_at, p.name, p.description, p.sku,
                    p.sale_price as sale_price, p.main_image, p.image_two,
                    p.category, p.slug, p.brand, p.stock_quantity,
                    p.discount, s.name as store_name, s.slug as store_slug,
                    p.discount_start, p.discount_end,
                    CASE
                        WHEN p.discount > 0
                        AND p.discount_start::date <= NOW()
                        AND p.discount_end::date >= NOW()
                        THEN true
                        ELSE false
                    END AS is_on_sale,
                    CASE
                        WHEN p.created_at >= NOW() - INTERVAL '24 hours'
                        THEN true
                        ELSE false
                    END AS is_new,
                    CASE
                        WHEN p.discount > 0
                        AND p.discount_start::date <= NOW()
                        AND p.discount_end::date >= NOW()
                        THEN ROUND(p.sale_price - (p.sale_price * p.discount / 100), 2)
                        ELSE p.sale_price
                    END AS effective_price
                 FROM products p
                JOIN stores s ON s.id = p.store_id
                 WHERE p.slug = $1`,
                [slug],
            );

            if (!rows.length) {
                return res.status(404).json({ message: "Product not found" });
            }

            product = rows[0];
            await redis.setEx(cacheKey, 60, JSON.stringify(product));
        }

        // always get live stock from redis stock key
        // this is the same key decremented by addToCart
        const stockKey = `product:${product.id}:stock`;
        const cachedStock = await redis.get(stockKey);

        if (cachedStock !== null) {
            // override stock_quantity with the live value
            product.stock_quantity = Number(cachedStock);
        } else {
            // stock not in redis yet — pull from db and cache it
            const { rows: stockRows } = await pool.query(
                `SELECT stock_quantity FROM products WHERE id = $1`,
                [product.id],
            );
            const dbStock = stockRows[0]?.stock_quantity ?? 0;
            await redis.set(stockKey, dbStock);
            product.stock_quantity = dbStock;
        }

        return res.status(200).json(product);
    } catch (error) {
        console.error("get-product.js error", error);
        return res.status(500).json({
            message: "Internal server error",
            error:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : error.message,
        });
    }
};

export default getProduct;
