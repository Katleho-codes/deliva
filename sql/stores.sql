create table stores (
    id bigserial primary key,
    created_at timestamp,
    updated_at timestamp,
    name text,
    description text,
    email varchar(100),
    phone varchar(10),
    logo text,
    slug text unique,
    owner_id integer references users(id) ON DELETE CASCADE,
    address_line1 text,
    address_line2 text,
    city text,
    province text,
    postal_code text,
    country text,
    is_active boolean default true,
    is_verified boolean default false,
    banner_url text,
    operating_hours json,
    average_rating numeric DEFAULT 0,
    total_reviews integer DEFAULT 0
);

ALTER TABLE
    stores
ADD
    COLUMN IF NOT EXISTS latitude numeric;

ALTER TABLE
    stores
ADD
    COLUMN IF NOT EXISTS longitude numeric;