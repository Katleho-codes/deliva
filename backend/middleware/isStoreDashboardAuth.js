import pool from "../db.js";
// checks user is owner OR staff of the store
const isStoreDashboardAuth = async (req, res, next) => {
    const { slug } = req.params;
    const { id: userId } = req.user;

    try {
        const { rows } = await pool.query(
            `SELECT s.id, s.owner_id 
             FROM stores s
             LEFT JOIN store_staff ss ON ss.store_id = s.id AND ss.user_id = $1
             WHERE s.slug = $2 AND (s.owner_id = $1 OR ss.user_id = $1)`,
            [userId, slug],
        );

        if (!rows.length) {
            return res.status(403).json({ message: "Access denied" });
        }

        req.store = rows[0]; // attach store to request
        req.isOwner = rows[0].owner_id === userId;
        next();
    } catch (err) {
        return res.status(500).json({ message: "Auth check failed" });
    }
};

export default isStoreDashboardAuth;
