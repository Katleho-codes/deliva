create table products(
    id bigserial primary key,
    created_at timestamp,
    updated_at timestamp,
    created_by integer,
    name varchar(50),
    description text,
    sku varchar(100),
    cost_price numeric,
    sale_price numeric,
    discount integer,
    stock_quantity integer,
    main_image text,
    image_two text,
    category text,
    status text,
    slug text,
    public_id text,
    low_stock_threshold integer,
    store_id integer references stores(id) ON DELETE CASCADE,
    brand varchar(30),
);

ALTER TABLE
    products
ADD
    COLUMN IF NOT EXISTS discount_start varchar(10);

ALTER TABLE
    products
ADD
    COLUMN IF NOT EXISTS discount_end varchar(10);