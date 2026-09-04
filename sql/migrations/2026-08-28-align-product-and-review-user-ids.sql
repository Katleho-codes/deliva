-- Migration: align product/store_review schema with current auth (uuid) user ids
-- and the live discount columns (date).
--
-- Background: better-auth moved from serial (integer) user ids to uuid (text).
-- Most tables were aligned already, but `products.created_by` and
-- `store_reviews.user_id` were still `integer`. The live `products` table also
-- carries `discount_start` / `discount_end` as `date` columns while older
-- versions of init.sql declared them as `varchar(10)` and bound empty strings
-- (which the date columns reject with 22007).
--
-- For an existing database, run these once:

-- 1. products.created_by: integer -> text (uuid)
ALTER TABLE products
    ALTER COLUMN created_by TYPE text USING created_by::text;

-- 2. products discount columns: keep as date, but collapse any stale empty
--    strings / varchar leftovers into NULL so inserts with no discount never
--    bind '' to a date column.
ALTER TABLE products
    ALTER COLUMN discount_start DROP DEFAULT;
ALTER TABLE products
    ALTER COLUMN discount_end DROP DEFAULT;
ALTER TABLE products
    ALTER COLUMN discount_start TYPE date
    USING CASE
        WHEN discount_start IS NULL OR discount_start = '' THEN NULL
        ELSE discount_start::date
    END;
ALTER TABLE products
    ALTER COLUMN discount_end TYPE date
    USING CASE
        WHEN discount_end IS NULL OR discount_end = '' THEN NULL
        ELSE discount_end::date
    END;

-- 3. store_reviews.user_id: integer -> text (uuid)
ALTER TABLE store_reviews
    ALTER COLUMN user_id TYPE text USING user_id::text;

-- Re-add FK constraints (dropped implicitly by the type change) if desired.
-- Only needed if the previous definitions referenced them explicitly.
-- ALTER TABLE products
--     ADD CONSTRAINT products_created_by_fkey
--     FOREIGN KEY (created_by) REFERENCES "user"(id);
-- ALTER TABLE store_reviews
--     ADD CONSTRAINT store_reviews_user_id_fkey
--     FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
