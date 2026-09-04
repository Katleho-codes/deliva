create table orders (
    id bigserial primary key,
    user_id integer references users(id) ON DELETE CASCADE,
    order_number text unique not null,
    status text,
    sub_total numeric,
    delivery_fee numeric,
    total_amount numeric,
    created_at timestamp,
    updated_at timestamp,
    shipping_address_id integer REFERENCES shipping_addresses(id),
    store_id integer REFERENCES stores(id) ON DELETE CASCADE,
);

create table order_items (
    id bigserial primary key,
    order_id integer references orders(id) ON DELETE CASCADE,
    product_id integer references products(id) ON DELETE CASCADE,
    quantity integer,
    total_amount numeric,
    currency varchar(3) default 'ZAR'
)