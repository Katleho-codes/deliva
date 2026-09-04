import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";
// this gets all products (used for public view)
// with redis cache

const redis = await getRedisClient();

const getProducts = async (req, res) => {
    let { page = 1, limit = 20 } = req.query;

    // fix: radix should be 10 not 20
    page = Math.max(parseInt(page, 10), 1);
    limit = Math.max(parseInt(limit, 10), 1);
    const offset = (page - 1) * limit;

    const cacheKey = `products:page:${page}:limit:${limit}`;

    try {
        const cached = await redis.get(cacheKey);
        let data;

        if (cached) {
            data = JSON.parse(cached);
        } else {
            const { rows } = await pool.query(
                `SELECT
    p.category,
    json_agg(
        json_build_object(
            'product_id', p.id,
            'name', p.name,
            'description', p.description,
            'sale_price', p.sale_price,
            'main_image', p.main_image,
            'slug', p.slug,
            'stock_quantity', p.stock_quantity,
            'store_name', s.name,
            'discount', p.discount,
            'discount_end', p.discount_end::date,
            'is_on_sale', CASE
                WHEN p.discount > 0
                AND p.discount_start::date <= NOW()
                AND p.discount_end::date >= NOW()
                THEN true
                ELSE false
            END,
            'is_new', CASE
            WHEN p.created_at >= NOW() - INTERVAL '24 hours'
            THEN true
            ELSE false
            END,
            'effective_price', CASE
                WHEN p.discount > 0
                AND p.discount_start::date <= NOW()
                AND p.discount_end::date >= NOW()
                THEN ROUND(p.sale_price - (p.sale_price * p.discount / 100), 2)
                ELSE p.sale_price
            END
        )
    ) AS products
FROM products p
JOIN stores s ON p.store_id = s.id
GROUP BY p.category
ORDER BY p.category DESC
LIMIT $1 OFFSET $2
                `,
                [limit, offset],
            );

            const total = await pool.query("SELECT COUNT(*) FROM products");
            const totalProducts = parseInt(total.rows[0].count, 10);

            data = {
                data: rows,
                meta: {
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    totalProducts,
                },
            };

            await redis.setEx(cacheKey, 60, JSON.stringify(data));
        }

        // override stock_quantity with live redis stock for each product
        for (const category of data.data) {
            for (const product of category.products) {
                const stockKey = `product:${product.product_id}:stock`;
                const cachedStock = await redis.get(stockKey);

                if (cachedStock !== null) {
                    product.stock_quantity = Number(cachedStock);
                } else {
                    // not in redis yet, use db value and cache it
                    const { rows: stockRows } = await pool.query(
                        `SELECT stock_quantity FROM products WHERE id = $1`,
                        [product.product_id],
                    );
                    const dbStock = stockRows[0]?.stock_quantity ?? 0;
                    await redis.set(stockKey, dbStock);
                    product.stock_quantity = dbStock;
                }
            }
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error:
                process.env.NODE_ENV === "production"
                    ? undefined
                    : error.message,
        });
    }
};
export default getProducts;
