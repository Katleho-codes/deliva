import pool from "../../db.js";
const removeStaff = async (req, res) => {
    const storeId = req.store.id;
    const { userId } = req.params;

    try {
        const result = await pool.query(
            `DELETE FROM store_staff
             WHERE store_id = $1 AND user_id = $2
             RETURNING id`,
            [storeId, userId],
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: "Staff member not found" });
        }

        return res.json({ message: "Staff member removed" });
    } catch (err) {
        console.error("removeStaff error:", err);
        return res
            .status(500)
            .json({ message: "Could not remove staff member" });
    }
};
export default removeStaff;
