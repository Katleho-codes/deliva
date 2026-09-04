CREATE TABLE carts (
    id bigserial PRIMARY KEY,
    user_id bigint UNIQUE REFERENCES "user"(id),
    status text DEFAULT 'active',
    -- active | converted | abandoned
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now()
);

CREATE TABLE cart_items (
    id bigserial PRIMARY KEY,
    cart_id bigint REFERENCES carts(id) ON DELETE CASCADE,
    product_id bigint REFERENCES products(id) ON DELETE CASCADE,
    quantity int CHECK (quantity > 0),
    created_at timestamp DEFAULT now(),
    updated_at timestamp DEFAULT now(),
    UNIQUE (cart_id, product_id)
);