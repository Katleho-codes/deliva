CREATE TABLE IF NOT EXISTS store_reviews (
    id bigserial PRIMARY KEY,
    store_id integer REFERENCES stores(id) ON DELETE CASCADE,
    user_id integer REFERENCES "user"(id) ON DELETE CASCADE,
    order_id integer REFERENCES orders(id) ON DELETE CASCADE,
    rating integer CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment text,
    created_at timestamp DEFAULT NOW(),
    UNIQUE(order_id, user_id) -- one review per order per user
);