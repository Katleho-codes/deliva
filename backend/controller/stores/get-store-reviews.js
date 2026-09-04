import pool from "../../db.js";
// GET /api/stores/:slug/reviews
const getStoreReviews = async (req, res) => {
    const { slug } = req.params;
    let { page = 1, limit = 10 } = req.query;

    page = Math.max(parseInt(page, 10), 1);
    limit = Math.max(parseInt(limit, 10), 1);
    const offset = (page - 1) * limit;

    try {
        const { rows } = await pool.query(
            `SELECT
                sr.id, sr.rating, sr.comment, sr.created_at,
                u.name as reviewer_name,
                u.image as reviewer_image
             FROM store_reviews sr
             JOIN stores s ON s.id = sr.store_id
             JOIN "user" u ON u.id = sr.user_id
             WHERE s.slug = $1
             ORDER BY sr.created_at DESC
             LIMIT $2 OFFSET $3`,
            [slug, limit, offset],
        );

        const total = await pool.query(
            `SELECT COUNT(*) FROM store_reviews sr
             JOIN stores s ON s.id = sr.store_id
             WHERE s.slug = $1`,
            [slug],
        );

        return res.json({
            data: rows,
            meta: {
                currentPage: page,
                totalPages: Math.ceil(Number(total.rows[0].count) / limit),
                totalCount: Number(total.rows[0].count),
            },
        });
    } catch (err) {
        console.error("getStoreReviews error:", err);
        return res.status(500).json({ message: "Could not fetch reviews" });
    }
};
export default getStoreReviews;
