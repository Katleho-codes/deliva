CREATE INDEX idx_stores_name ON stores(name);

CREATE INDEX idx_products_store_id ON products(store_id);

CREATE INDEX idx_stores_slug ON stores(slug);

CREATE UNIQUE INDEX one_active_cart_per_user ON carts (user_id)
WHERE
    status = 'active';

ALTER TABLE
    carts
ADD
    CONSTRAINT carts_user_id_unique UNIQUE (user_id);