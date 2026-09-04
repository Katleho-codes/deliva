import pool from "../../db.js";

const addStaff = async (req, res) => {
    const storeId = req.store.id;
    const { id: invitedBy } = req.user;
    const { email, role = "staff" } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!["staff", "manager"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    try {
        // find user by email
        const userRes = await pool.query(
            `SELECT id FROM "user" WHERE email = $1`,
            [email],
        );

        if (!userRes.rows.length) {
            return res
                .status(404)
                .json({ message: "No user found with that email" });
        }

        const userId = userRes.rows[0].id;

        // prevent owner from being added as staff
        if (userId === req.store.owner_id) {
            return res
                .status(400)
                .json({ message: "Owner cannot be added as staff" });
        }

        // add staff member
        const { rows } = await pool.query(
            `INSERT INTO store_staff (store_id, user_id, role, invited_by, created_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (store_id, user_id) DO NOTHING
             RETURNING id`,
            [storeId, userId, role, invitedBy],
        );

        if (!rows.length) {
            return res
                .status(409)
                .json({ message: "User is already a staff member" });
        }

        return res.status(201).json({ message: "Staff member added" });
    } catch (err) {
        console.error("inviteStaff error:", err);
        return res.status(500).json({ message: "Could not add staff member" });
    }
};
export default addStaff;
