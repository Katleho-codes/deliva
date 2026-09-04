"use strict";
import pool from "../../db.js";
import * as Yup from "yup";
import "dotenv/config";
import { now } from "../../utils/datetime.js";
import crypto from "crypto";
import { getRedisClient } from "../../config/redis.js";
import { io } from "../../services/io.js";

const createProductSchema = Yup.object({
    name: Yup.string()
        .required("The name is required")
        .min(3, "Cannot be less than 3 characters")
        .max(50, "Cannot be more than 50 characters"),
    description: Yup.string().required("The description is required"),
    cost_price: Yup.number()
        .required("The cost price is required")
        .typeError("The cost price must be a valid number"),

    sale_price: Yup.number("The sale price is required")
        .required()
        .typeError("The sale price must be a valid number")
        .test(
            "sale-greater-than-cost",
            "Sale price must be greater than or equal to cost price",
            function (value) {
                const { cost_price } = this.parent;

                // if one is missing, skip this test
                if (value == null || cost_price == null) return true;

                return value >= cost_price;
            },
        ),
    discount: Yup.number()
        .nullable()
        .min(0, "Discount cannot be negative")
        .max(100, "Discount cannot exceed 100%")
        .test(
            "discount-above-cost",
            "Discounted price cannot be below cost price",
            function (value) {
                const { sale_price, cost_price } = this.parent;
                if (value == null || !sale_price || !cost_price) return true;
                const effectivePrice = sale_price - (sale_price * value) / 100;
                return effectivePrice >= cost_price;
            },
        ),

    discount_start: Yup.string()
        .nullable()
        .transform((value) => (value === "" ? null : value))
        .when("discount", {
            is: (discount) => discount > 0,
            then: (schema) =>
                schema.required(
                    "Discount start date is required when a discount is set",
                ),
        }),

    discount_end: Yup.string()
        .nullable()
        .transform((value) => (value === "" ? null : value))
        .when("discount", {
            is: (discount) => discount > 0,
            then: (schema) =>
                schema.required(
                    "Discount end date is required when a discount is set",
                ),
        })
        .test(
            "discount-end-after-start",
            "Discount end date must be after start date",
            function (value) {
                const { discount, discount_start } = this.parent;

                if (!discount || discount <= 0 || !discount_start || !value) {
                    return true;
                }

                return (
                    new Date(value).getTime() >
                    new Date(discount_start).getTime()
                );
            },
        ),
    stock_quantity: Yup.number().required("The stock quantity is required"),
    main_image: Yup.string(),
    brand: Yup.string()
        .required("The brand name is required")
        .min(2, "Cannot be less than 2 characters")
        .max(30, "Cannot be more than 30 characters"),
    image_two: Yup.string(),
    category: Yup.string(),
    low_stock_threshold: Yup.number()
        .required("The low stock threshold is required")
        .test(
            "low_stock_threshold-lower-than-stock",
            "Low stock threshold must be lesser than stock quantity",
            function (value) {
                const { stock_quantity } = this.parent;

                // if one is missing, skip this test
                if (value == null || stock_quantity == null) return true;

                return value < stock_quantity;
            },
        ),
});

const redis = await getRedisClient();

const createProduct = async (req, res) => {
    const {
        name,
        description,
        cost_price,
        sale_price,
        discount,
        discount_start,
        discount_end,
        stock_quantity,
        main_image,
        image_two,
        category,
        store_slug,
        brand,
        status,
        low_stock_threshold,
    } = req.body;
    const { id: userId } = req.user;
    const created_at = now();
    const sku = "SKU-" + crypto.randomBytes(4).toString("hex").toUpperCase();
    const publicId = "PID" + crypto.randomInt(10_000_000, 100_000_000);
    const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "") // remove special chars
        .replace(/\s+/g, "-") // spaces → hyphens
        .replace(/-+/g, "-"); // collapse dashes

    // only send dates to the DB when a discount is actually set,
    // otherwise an empty string would fail the date column
    const discountStart =
        discount && discount > 0 && discount_start ? discount_start : null;
    const discountEnd =
        discount && discount > 0 && discount_end ? discount_end : null;

    try {
        await createProductSchema.validate(req.body, { abortEarly: false });

        const findStoreId = await pool.query(
            "select id from stores where slug = $1 limit 1",
            [store_slug],
        );
        const findProduct = await pool.query(
            "select slug from products where slug = $1 limit 1",
            [slug],
        );
        if (findStoreId.rows.length === 0)
            return res.status(404).json({ message: "Store does not exist" });
        if (findProduct.rows.length > 0)
            return res
                .status(409)
                .json({ message: "Product exists, try another name" });

        const { rows } = await pool.query(
            "insert into products (created_at, name, description, sku, cost_price, sale_price, stock_quantity, main_image, image_two, category, slug, public_id, store_id, low_stock_threshold, brand, status, discount, discount_start, discount_end, created_by) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) returning id, created_at, name, description, sku, cost_price, sale_price, stock_quantity, main_image, image_two, category, slug, public_id, store_id, brand, status, low_stock_threshold, discount, discount_start, discount_end",
            [
                created_at,
                name,
                description,
                sku,
                cost_price,
                sale_price,
                stock_quantity,
                main_image,
                image_two,
                category,
                slug,
                publicId,
                findStoreId.rows[0].id,
                low_stock_threshold,
                brand,
                status,
                discount,
                discountStart,
                discountEnd,
                userId,
            ],
        );
        const product = rows[0];
        await redis.set(`product:${product.id}:stock`, product.stock_quantity);
        await redis.set(
            `product:${product.id}:threshold`,
            product.low_stock_threshold,
        );
        // emit updated cart to user's room
        io.to(`user:${userId}`).emit("product:added", product);
        return res.status(201).json({
            message: "Product successfuly created",
            rows: rows[0],
        });

        // Store stock as atomic integer
    } catch (error) {
        process.env.NODE_ENV === "development"
            ? console.log("add product error", error)
            : null;
        // Handle validation or other errors
        const errors = {};
        if (error.inner) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message; // Collect field validation errors
            });
            console.log(JSON.stringify({ errors }));
            return res.status(400).json({ errors });
        }
        res.status(500).json({ message: "Product not added, try again" });
    }
};

export default createProduct;
