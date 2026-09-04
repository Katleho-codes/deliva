import pool from "../../db.js";
import * as Yup from "yup";
import "dotenv/config";
import { now } from "../../utils/datetime.js";
import { getRedisClient } from "../../config/redis.js";
import { io } from "../../services/io.js";

const createStoreSchema = Yup.object({
    name: Yup.string()
        .required("The name is required")
        .min(3, "Cannot be less than 3 characters"),
    description: Yup.string().required("The description is required"),
    // some stores do not have email
    email: Yup.string().email(),
    phone: Yup.string()
        .max(10, "Maximum numbers has to be 10")
        .required("The phone number is required"),
    logo: Yup.string(),
    address_line1: Yup.string().required("The address is required"),
    address_line2: Yup.string(),
    city: Yup.string().required("The city is required"),
    province: Yup.string().required("The province is required"),
    postal_code: Yup.string()
        .required("The postal code is required")
        .min(4, "Can only be 4 characters")
        .max(4, "Can only be 4 characters"),
});

const redis = await getRedisClient();

const createStore = async (req, res) => {
    const {
        name,
        description,
        email,
        phone,
        logo,
        address_line1,
        address_line2,
        city,
        province,
        postal_code,
        banner_url,
    } = req.body;
    const { id: userId } = req.user;
    // country will always be South Africa
    // is_active is true by default
    // is_verified once the email and all profiles are filled out
    const created_at = now();
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // spaces → hyphens
        .replace(/-+/g, "-"); // collapse dashes
    const country = "South Africa";
    const provinceCoords = {
        Gauteng: { lat: -26.2041, lng: 28.0473 },
        "Western Cape": { lat: -33.9249, lng: 18.4241 },
        "KwaZulu-Natal": { lat: -29.8587, lng: 31.0218 },
        "Eastern Cape": { lat: -33.0153, lng: 27.9116 },
        Limpopo: { lat: -23.9045, lng: 29.4689 },
        Mpumalanga: { lat: -25.4653, lng: 30.9714 },
        "North West": { lat: -26.6638, lng: 25.4617 },
        "Free State": { lat: -29.1, lng: 26.214 },
        "Northern Cape": { lat: -29.0467, lng: 23.6426 },
    };
    const baseCoords = provinceCoords[province] ?? {
        lat: -26.2041,
        lng: 28.0473,
    };
    // The random offset (* 0.05) spreads stores slightly so they don't all appear at exactly the same distance — makes the radar look more realistic
    const latitude = baseCoords.lat + (Math.random() - 0.5) * 0.1;
    const longitude = baseCoords.lng + (Math.random() - 0.5) * 0.1;
    try {
        await createStoreSchema.validate(req.body, { abortEarly: false });
        const checkStoreExists = await pool.query(
            "select id from stores where slug = $1",
            [slug],
        );
        if (checkStoreExists.rows.length > 0)
            return res
                .status(403)
                .json({ message: "Store name already taken, choose another" });
        else {
            const { rows } = await pool.query(
                "insert into stores (created_at, name, description, email, phone, logo, slug, owner_id, address_line1, address_line2, city, province, postal_code, country, banner_url, latitude, longitude) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) returning *",
                [
                    created_at,
                    name,
                    description,
                    email,
                    phone,
                    logo,
                    slug,
                    userId,
                    address_line1,
                    address_line2,
                    city,
                    province,
                    postal_code,
                    country,
                    banner_url,
                    latitude,
                    longitude,
                ],
            );
            // clear this key (used in get-stores.js) to cache response
            // create-store.js — add this alongside the page cache invalidation
            const keys = await redis.keys("stores:page:*");
            if (keys.length) await redis.del(keys);

            await redis.del(`stores:user:${userId}`); // bust the my-stores cache

            await redis.set(`store:${rows[0].id}`, JSON.stringify(rows[0]));
            // emit updated store to user's room
            io.to(`user:${userId}`).emit("store:created", rows[0]);
            return res.status(201).json({
                message: "Store successfuly created",
                rows: rows[0],
            });
        }
    } catch (error) {
        process.env.NODE_ENV === "development"
            ? console.log("add store error", error)
            : null;
        // Handle validation or other errors
        const errors = {};
        if (error.inner) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message; // Collect field validation errors
            });
            return res
                .status(400)
                .json({ message: "Check errors in your form", errors });
        }
        res.status(500).json({ message: "Store not added, try again" });
    }
};

export default createStore;
