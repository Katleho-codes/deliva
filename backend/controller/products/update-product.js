import { getRedisClient } from "../../config/redis.js";
import pool from "../../db.js";
import * as Yup from "yup";
import { io } from "../../services/io.js";
const redis = await getRedisClient();

const ALLOWED_FIELDS = [
    "name",
    "slug",
    "description",
    "brand",
    "cost_price",
    "sale_price",
    "stock_quantity",
    "category",
    "low_stock_threshold",
    "status",
    "discount",
    "discount_start",
    "discount_end",
];

const updateProductSchema = Yup.object({
    name: Yup.string()
        .required("The name is required")
        .min(3, "Cannot be less than 3 characters")
        .max(100, "Cannot be more than 100 characters"),

    description: Yup.string().required("The description is required"),

    cost_price: Yup.number().required("The cost price is required"),

    sale_price: Yup.number()
        .required("The sale price is required")
        .test(
            "sale-greater-than-cost",
            "Sale price must be greater than or equal to cost price",
            function (value) {
                const { cost_price } = this.parent;

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
    stock_quantity: Yup.number().required("The stock quantity is required"),

    slug: Yup.string().required("The store slug is required"),

    main_image: Yup.string(),
    image_two: Yup.string(),

    category: Yup.string(),

    low_stock_threshold: Yup.number()
        .required("The low stock threshold is required")
        .test(
            "low_stock_threshold-greater-than-stock",
            "Low stock threshold must be less than stock quantity",
            function (value) {
                const { stock_quantity } = this.parent;

                if (value == null || stock_quantity == null) return true;

                return value < stock_quantity;
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
});
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { id: userId } = req.user;

    try {
        await updateProductSchema.validate(req.body, { abortEarly: false });
        // Fetch existing product and verify ownership in one query
        const findProduct = await pool.query(
            "SELECT * FROM products WHERE id = $1 and created_by = $2",
            [id, userId],
        );
        if (findProduct.rows.length === 0)
            return res.status(404).json({ message: "Product not found" });

        const existing = findProduct.rows[0];

        // Only allow whitelisted fields — never trust raw req.body keys
        const changes = {};
        for (const key of ALLOWED_FIELDS) {
            if (
                key in req.body &&
                req.body[key] !== undefined &&
                req.body[key] !== existing[key]
            ) {
                if (key === "discount_start" || key === "discount_end") {
                    changes[key] =
                        req.body[key] === "" || req.body[key] == null
                            ? null
                            : req.body[key];
                } else {
                    changes[key] = req.body[key];
                }
            }
        }

        if (Object.keys(changes).length === 0) {
            return res.status(204).json({ message: "No changes detected" });
        }

        // Dynamically build a parameterised SET clause
        const keys = Object.keys(changes);
        const setClause = keys
            .map((key, index) => `${key} = $${index + 1}`)
            .join(", ");
        const values = keys.map((key) => changes[key]);

        // $N for id, appended after the change values
        const updatedProduct = await pool.query(
            `UPDATE products SET ${setClause}, updated_at = NOW() WHERE id = $${keys.length + 1} RETURNING *`,
            [...values, id],
        );
        if ("stock_quantity" in changes) {
            await redis.set(`product:${id}:stock`, changes.stock_quantity);
        }
        await redis.del(`product:name:${updatedProduct.rows[0].slug}`);
        io.to(`user:${userId}`).emit("product:updated", updatedProduct.rows[0]);
        return res.status(200).json({
            message: "Product updated successfully",
            product: updatedProduct.rows[0],
        });
    } catch (error) {
        process.env.NODE_ENV === "development"
            ? console.log("update product error", error)
            : null;
        // Handle validation or other errors
        const errors = {};
        if (error.inner) {
            error.inner.forEach((err) => {
                errors[err.path] = err.message; // Collect field validation errors
            });
            return res.status(400).json({ errors });
        }
        res.status(500).json({ message: "Product not updated, try again" });
    }
};

export default updateProduct;
