"use strict";
import pool from "../../db.js";
import { io } from "../../services/io.js";
import * as Yup from "yup";
import { getRedisClient } from "../../config/redis.js";
const createStoreReviewSchema = Yup.object({
    rating: Yup.number()
        .required("The rating is required")
        .min(1, "Cannot be less than 3 stars")
        .max(5, "Cannot be more than 5 stars"),
    comment: Yup.string().required("The comment is required"),
});
const redis = await getRedisClient();
const createReview = async (req, res) => {
    const { slug } = req.params;
    const { id: userId } = req.user;
    const { rating, comment, order_id } = req.body;


    try {
        await createStoreReviewSchema.validate(req.body, { abortEarly: false });

        // create review
        const review = await pool.query(
            `INSERT INTO store_reviews (store_id, user_id, rating, comment)
             SELECT s.id, $1, $2, $3
             FROM stores s WHERE s.slug = $4
             RETURNING id`,
            [userId, rating, comment, slug],
        );

        // update store average rating
        await pool.query(
            `UPDATE stores SET
                average_rating = (
                    SELECT ROUND(AVG(rating)::numeric, 1)
                    FROM store_reviews sr
                    JOIN stores s ON s.id = sr.store_id
                    WHERE s.slug = $1
                ),
                total_reviews = (
                    SELECT COUNT(*)
                    FROM store_reviews sr
                    JOIN stores s ON s.id = sr.store_id
                    WHERE s.slug = $1
                )
             WHERE slug = $1`,
            [slug],
        );

        // invalidate store cache
        await redis.del(`store:${slug}`);
        // emit updated store to user's room
        io.to(`user:${userId}`).emit("store_review:created", review.rows[0]);

        return res
            .status(201)
            .json({ message: "Review submitted", id: review.rows[0].id });
    } catch (err) {
        if (err.code === "23505") {
            return res
                .status(409)
                .json({ message: "You have already reviewed this order" });
        }
        const errors = {};
        if (err.inner) {
            err.inner.forEach((err) => {
                errors[err.path] = err.message; // Collect field validation errors
            });
            return res.status(400).json({ errors });
        }
        console.error("createReview error:", err);
        return res.status(500).json({ message: "Could not submit review" });
    }
};

export default createReview;
