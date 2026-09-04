"use strict";
import pool from "../../db.js";
import { io } from "../../services/io.js";
import * as Yup from "yup";
import { getRedisClient } from "../../config/redis.js";

// GET /api/stores/nearby?lat=-26.2&lng=28.0&radius=5
const getNearbyStores = async (req, res) => {
    const { lat, lng, radius = 5 } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ message: "lat and lng are required" });
    }

    try {
        const { rows } = await pool.query(
            `SELECT
                id, name, slug, description, banner_url,
                average_rating, total_reviews, city, province,
                latitude, longitude,
                ROUND((
                    6371 * acos(
                        LEAST(1.0, cos(radians($1::float)) * cos(radians(latitude::float))
                        * cos(radians(longitude::float) - radians($2::float))
                        + sin(radians($1::float)) * sin(radians(latitude::float)))
                    )
                )::numeric, 1) AS distance_km
             FROM stores
             WHERE latitude IS NOT NULL
             AND longitude IS NOT NULL
             AND is_active = true
             AND ROUND((
                    6371 * acos(
                        LEAST(1.0, cos(radians($1::float)) * cos(radians(latitude::float))
                        * cos(radians(longitude::float) - radians($2::float))
                        + sin(radians($1::float)) * sin(radians(latitude::float)))
                    )
                )::numeric, 1) <= $3::float
             ORDER BY distance_km ASC;`,
            [lat, lng, radius],
        );
        return res.json(rows);
    } catch (err) {
        console.error("getNearbyStores error:", err);
        return res
            .status(500)
            .json({ message: "Could not fetch nearby stores" });
    }
};
export default getNearbyStores;
