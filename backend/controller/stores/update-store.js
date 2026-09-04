import pool from "../../db.js";
import { getRedisClient } from "../../config/redis.js";

const redis = await getRedisClient();

const updateStore = async (req, res) => {
    const storeId = req.store.id;
    const {
        name,
        description,
        email,
        phone,
        address_line1,
        address_line2,
        city,
        province,
        postal_code,
        country,
        operating_hours,
    } = req.body;

    try {
        const { rows } = await pool.query(
            `UPDATE stores SET
                name = COALESCE($1, name),
                description = COALESCE($2, description),
                email = COALESCE($3, email),
                phone = COALESCE($4, phone),
                address_line1 = COALESCE($5, address_line1),
                address_line2 = COALESCE($6, address_line2),
                city = COALESCE($7, city),
                province = COALESCE($8, province),
                postal_code = COALESCE($9, postal_code),
                country = COALESCE($10, country),
                operating_hours = COALESCE($11, operating_hours),
                updated_at = NOW()
             WHERE id = $12
             RETURNING id, name, slug`,
            [
                name,
                description,
                email,
                phone,
                address_line1,
                address_line2,
                city,
                province,
                postal_code,
                country,
                operating_hours,
                storeId,
            ],
        );

        // invalidate cache
        await redis.del(`store:${req.params.slug}`);
        await redis.del(`stores:user:${req.user.id}`);

        return res.json({ message: "Store updated", store: rows[0] });
    } catch (err) {
        console.error("updateStore error:", err);
        return res.status(500).json({ message: "Could not update store" });
    }
};

export default updateStore;