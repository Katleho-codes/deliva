-- schema.sql
-- 1. better-auth tables
CREATE TABLE IF NOT EXISTS "user" (
    id text PRIMARY KEY,
    name text,
    email text UNIQUE NOT NULL,
    "emailVerified" boolean,
    image text,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
    id text PRIMARY KEY,
    "expiresAt" timestamp NOT NULL,
    token text UNIQUE NOT NULL,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS account (
    id text PRIMARY KEY,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" timestamp,
    "refreshTokenExpiresAt" timestamp,
    scope text,
    password text,
    "createdAt" timestamp NOT NULL,
    "updatedAt" timestamp NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
    id text PRIMARY KEY,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp NOT NULL,
    "createdAt" timestamp,
    "updatedAt" timestamp
);

-- 2. stores
CREATE TABLE IF NOT EXISTS stores (
    id bigserial PRIMARY KEY,
    created_at timestamp,
    updated_at timestamp,
    name text,
    description text,
    email varchar(100),
    phone varchar(10),
    logo text,
    slug text unique,
    owner_id text REFERENCES "user"(id) ON DELETE CASCADE,
    address_line1 text,
    address_line2 text,
    city text,
    province text,
    postal_code text,
    country text,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    banner_url text,
    operating_hours json
);

-- 3. faq
CREATE TABLE IF NOT EXISTS faq (
    id bigserial PRIMARY KEY,
    created_at timestamp,
    updated_at timestamp,
    title varchar(50),
    content text,
    store_id integer REFERENCES stores(id) ON DELETE CASCADE
);

-- 4. store_staff
CREATE TABLE IF NOT EXISTS store_staff (
    id bigserial PRIMARY KEY,
    store_id integer REFERENCES stores(id) ON DELETE CASCADE,
    user_id text REFERENCES "user"(id) ON DELETE CASCADE,
    role text DEFAULT 'staff',
    invited_by text REFERENCES "user"(id),
    created_at timestamp DEFAULT NOW(),
    UNIQUE(store_id, user_id)
);

-- 5. products
CREATE TABLE IF NOT EXISTS products (
    id bigserial PRIMARY KEY,
    created_at timestamp,
    updated_at timestamp,
    created_by text REFERENCES "user"(id),
    name varchar(50),
    description text,
    sku varchar(100),
    cost_price numeric,
    sale_price numeric,
    discount integer,
    discount_start date,
    discount_end date,
    stock_quantity integer,
    main_image text,
    image_two text,
    category text,
    status text,
    slug text,
    public_id text,
    low_stock_threshold integer,
    store_id integer REFERENCES stores(id) ON DELETE CASCADE,
    brand varchar(30)
);

-- 6. carts
CREATE TABLE IF NOT EXISTS carts (
    id bigserial PRIMARY KEY,
    user_id text UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
    status text DEFAULT 'active',
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW()
);

-- 7. cart_items
CREATE TABLE IF NOT EXISTS cart_items (
    id bigserial PRIMARY KEY,
    cart_id bigint REFERENCES carts(id) ON DELETE CASCADE,
    product_id bigint REFERENCES products(id) ON DELETE CASCADE,
    quantity int CHECK (quantity > 0),
    created_at timestamp DEFAULT NOW(),
    updated_at timestamp DEFAULT NOW(),
    UNIQUE(cart_id, product_id)
);

-- 8. shipping_addresses
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id bigserial PRIMARY KEY,
    created_at timestamp,
    updated_at timestamp,
    user_id text REFERENCES "user"(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    address text NOT NULL,
    province text NOT NULL,
    postal_code text NOT NULL,
    email text,
    phone text NOT NULL,
    country text DEFAULT 'South Africa'
);

-- 9. orders
CREATE TABLE IF NOT EXISTS orders (
    id bigserial PRIMARY KEY,
    user_id text REFERENCES "user"(id) ON DELETE CASCADE,
    order_number text UNIQUE NOT NULL,
    status text,
    sub_total numeric,
    delivery_fee numeric,
    total_amount numeric,
    created_at timestamp,
    updated_at timestamp,
    shipping_address_id integer REFERENCES shipping_addresses(id)
);

-- 10. order_items
CREATE TABLE IF NOT EXISTS order_items (
    id bigserial PRIMARY KEY,
    order_id integer REFERENCES orders(id) ON DELETE CASCADE,
    product_id integer REFERENCES products(id) ON DELETE CASCADE,
    quantity integer,
    total_amount numeric,
    currency varchar(3) DEFAULT 'ZAR'
);

-- 11. store_customers view
CREATE
OR REPLACE VIEW store_customers AS
SELECT
    u.id,
    u.name,
    u.email,
    p.store_id,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total_amount), 0) as total_spent,
    MAX(o.created_at) as last_order_at
FROM
    orders o
    JOIN order_items oi ON oi.order_id = o.id
    JOIN products p ON p.id = oi.product_id
    JOIN "user" u ON u.id = o.user_id
GROUP BY
    u.id,
    u.name,
    u.email,
    p.store_id;

CREATE INDEX idx_stores_name ON stores(name);

CREATE INDEX idx_products_store_id ON products(store_id);

CREATE INDEX idx_stores_slug ON stores(slug);

CREATE UNIQUE INDEX one_active_cart_per_user ON carts (user_id)
WHERE
    status = 'active';

CREATE TABLE IF NOT EXISTS store_reviews (
    id bigserial PRIMARY KEY,
    store_id integer REFERENCES stores(id) ON DELETE CASCADE,
    user_id text REFERENCES "user"(id) ON DELETE CASCADE,
    order_id integer REFERENCES orders(id) ON DELETE CASCADE,
    rating integer CHECK (
        rating >= 1
        AND rating <= 5
    ),
    comment text,
    created_at timestamp DEFAULT NOW(),
    UNIQUE(order_id, user_id) -- one review per order per user
);

ALTER TABLE
    products
ADD
    COLUMN IF NOT EXISTS discount_start date;

ALTER TABLE
    products
ADD
    COLUMN IF NOT EXISTS discount_end date;

ALTER TABLE
    stores
ADD
    COLUMN IF NOT EXISTS latitude numeric;

ALTER TABLE
    stores
ADD
    COLUMN IF NOT EXISTS longitude numeric;

    