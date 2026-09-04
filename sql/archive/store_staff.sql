-- staff members for a store
CREATE TABLE store_staff (
    id bigserial PRIMARY KEY,
    store_id integer REFERENCES stores(id) ON DELETE CASCADE,
    user_id integer REFERENCES "user"(id) ON DELETE CASCADE,
    role text DEFAULT 'staff',
    -- 'staff' | 'manager'
    invited_by integer REFERENCES "user"(id),
    created_at timestamp DEFAULT NOW(),
    UNIQUE(store_id, user_id)
);
-- customers are users who ordered from the store
CREATE VIEW store_customers AS
SELECT
    DISTINCT u.id,
    u.name,
    u.email,
    o.store_id,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent,
    MAX(o.created_at) as last_order_at
FROM
    orders o
    JOIN "user" u ON u.id = o.user_id
GROUP BY
    u.id,
    u.name,
    u.email,
    o.store_id;