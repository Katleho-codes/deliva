create table shipping_addresses (
    id bigserial primary key,
    created_at timestamp,
    updated_at timestamp,
    user_id integer references "user"(id),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT NOT NULL,
    province TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    email text,
    phone TEXT NOT NULL,
    country TEXT DEFAULT 'South Africa'
)