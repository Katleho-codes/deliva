# Archived SQL

One-off table definitions that contradicted `init.sql` (the canonical schema).
They used `users(id)` / `integer` for user references while the live auth table
is `"user"` with TEXT ids issued by better-auth.

Superseded by:
- `../init.sql` (canonical schema)
- `../migrations/2026-08-22-align-user-id-types.sql` (aligns legacy int columns)

Do not execute these files.
- carts.sql        (used bigint user_id)
- orders.sql       (referenced non-existent `users` table)
- products.sql     (created_by integer)
- shipping.sql     (user_id integer)
- store_reviews.sql (user_id integer)
- store_staff.sql  (user_id integer)
