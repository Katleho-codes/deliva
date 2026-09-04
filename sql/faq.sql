create table faq(
    id bigserial primary key,
    created_at timestamp,
    updated_at timestamp,
    title varchar(50),
    content text,
    store_id integer references stores(id) ON DELETE CASCADE
)