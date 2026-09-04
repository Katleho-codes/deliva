import pool from "../../db.js";
const search = async (req, res) => {
    const { q, type = "all" } = req.query;

    if (!q || q.trim().length < 2) {
        return res.status(400).json({ message: "Query too short" });
    }

    const search = `%${q.trim()}%`;

    try {
        let products = [];
        let stores = [];

        if (type === "all" || type === "products") {
            const { rows } = await pool.query(
                `SELECT 
                    id, name, slug, sale_price, main_image, stock_quantity
                 FROM products 
                 WHERE name ILIKE $1 OR description ILIKE $1
                 AND stock_quantity > 0
                 LIMIT 10`,
                [search],
            );
            products = rows;
        }

        if (type === "all" || type === "stores") {
            const { rows } = await pool.query(
                `SELECT 
                    id, name, slug, banner_url, description
                 FROM stores 
                 WHERE name ILIKE $1 OR description ILIKE $1
                 LIMIT 5`,
                [search],
            );
            stores = rows;
        }

        return res.json({ products, stores });
    } catch (err) {
        console.error("search error:", err);
        return res.status(500).json({ message: "Search failed" });
    }
};

export default search;
