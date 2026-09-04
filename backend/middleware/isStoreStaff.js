import pool from "../db.js";

// checks user is owner OR staff of the store identified by :store_id
const isStoreStaff = async (req, res, next) => {
    const storeId = req.params.store_id ?? req.params.storeId;
    const { id: userId } = req.user;

    try {
        const { rows } = await pool.query(
            `SELECT s.id, s.owner_id
             FROM stores s
             LEFT JOIN store_staff ss ON ss.store_id = s.id AND ss.user_id = $1
             WHERE s.id = $2 AND (s.owner_id = $1 OR ss.user_id = $1)
             LIMIT 1`,
            [userId, storeId],
        );

        if (!rows.length) {
            return res.status(403).json({ message: "Access denied" });
        }

        req.store = rows[0];
        req.isOwner = rows[0].owner_id === userId;
        next();
    } catch (err) {
        next(err);
    }
};

export default isStoreStaff;
