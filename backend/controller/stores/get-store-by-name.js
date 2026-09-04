import pool from "../../db.js";

const getStoreByName = async (req, res) => {
    const { slug } = req.params;
    const {
        category = null,
        brand = null,
        sort = "newest",
        page = 1,
        limit = 12,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    // Map sort param to column + direction (whitelisted)
    const sortMap = {
        price_asc: { col: "p.sale_price", dir: "ASC" },
        price_desc: { col: "p.sale_price", dir: "DESC" },
        lowest: { col: "p.sale_price", dir: "ASC" },
        highest: { col: "p.sale_price", dir: "DESC" },
        newest: { col: "p.created_at", dir: "DESC" },
        oldest: { col: "p.created_at", dir: "ASC" },
    };
    const { col, dir } = sortMap[sort] ?? sortMap["newest"];

    try {
        const storeRes = await pool.query(
            `SELECT
                s.id,
                s.name,
                s.description,
                s.email,
                s.phone,
                s.address_line1,
                s.city,
                s.province,
                s.postal_code,
                s.banner_url,
                s.slug,
                s.average_rating,
                s.total_reviews
             FROM stores s
             WHERE s.slug = $1`,
            [slug],
        );

        if (!storeRes.rows[0]) {
            return res.status(404).json({ error: "Store not found" });
        }
        const store = storeRes.rows[0];

        const productsRes = await pool.query(
            `SELECT
                p.id,
                p.name,
                p.description,
                p.sale_price,
                p.main_image,
                p.category,
                p.brand,
                p.slug,
                p.stock_quantity,
                p.discount,
                p.discount_start,
                p.discount_end,
                CASE
                    WHEN p.discount > 0
                    AND p.discount_start IS NOT NULL
                    AND p.discount_end IS NOT NULL
                    AND p.discount_start <= NOW()
                    AND p.discount_end >= NOW()
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
                    AND p.discount_start IS NOT NULL
                    AND p.discount_end IS NOT NULL
                    AND p.discount_start <= NOW()
                    AND p.discount_end >= NOW()
                    THEN ROUND(p.sale_price - (p.sale_price * p.discount / 100), 2)
                    ELSE p.sale_price
                END AS effective_price
             FROM products p
             WHERE p.store_id = $1
               AND ($2::text IS NULL OR p.category = $2::text)
               AND ($3::text IS NULL OR p.brand = $3::text)
             ORDER BY ${col} ${dir}
             LIMIT $4 OFFSET $5`,
            [store.id, category || null, brand || null, limitNum, offset],
        );

        const countRes = await pool.query(
            `SELECT COUNT(*) AS total
             FROM products p
             WHERE p.store_id = $1
               AND ($2::text IS NULL OR p.category = $2::text)
               AND ($3::text IS NULL OR p.brand = $3::text)`,
            [store.id, category || null, brand || null],
        );

        res.json({
            ...store,
            products: productsRes.rows,
            meta: {
                currentPage: pageNum,
                totalPages: Math.max(
                    Math.ceil(Number(countRes.rows[0].total) / limitNum),
                    1,
                ),
                totalCount: Number(countRes.rows[0].total),
            },
        });
    } catch (error) {
        console.error("getStoreByName error:", error);
        return res.status(500).json({ message: "Could not load store" });
    }
};

export default getStoreByName;
