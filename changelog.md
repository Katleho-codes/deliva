## 2026-08-31

### Added

- [x] `abandon-checkout` endpoint `POST /api/orders/:orderId/abandon` — cancels a pending order, reactivates the user's cart, emits `cart:updated` / `order:canceled` socket events; wired into checkout's "Back to cart"/leave flow
- [x] client-side `RequireAuth` guard — redirects unauthenticated users to `/auth/login?next=...`
- [x] auth guard applied to account, checkout, create-store, onboarding, orders, order tracking, and my-stores screens
- [x] login honors the `?next=` redirect after sign-in (email + Google), wrapped in `<Suspense>`
- [x] reusable components: `Logo` (`sm`/`md`/`lg`), `Loading`, `EmptyState`, `SectionLabel`
- [x] brand color tokens in `globals.css` (`brand`, `brand-dark`, `surface`, `cardline`); consolidated duplicate `--deliva-*` vars
- [x] separate root `.env` guide in `readme.md` for setting up the project with docker

### Changed

- [x] cart state unified to a single shared context (`useCartContext`) across home, product listing, product detail, and store pages
- [x] product/review/dashboard/checkout/store card markup migrated to the reusable `Card` component (visual-identical)
- [x] inline logo markup replaced with `<Logo>` across MainNav, login/signup, checkout, create-store, and dashboard layout
- [x] quantity selector in product listing and product detail is now functional (was hardcoded to `1`), bounded by stock
- [x] standardized primary button hover direction (`#F15025 → #F86624`) for consistency
- [x] MainNav fixed-header spacer `h-24 → h-16`; order-tracking height offset aligned to `calc(100vh-64px)`
- [x] signup login-link color changed from violet to brand orange
- [x] login/signup link changed to a button that uses `router.push()`

### Fixed

- [x] adding to cart after an abandoned/converted cart failed with a `UNIQUE(user_id)` violation — existing cart row is now reactivated instead of re-inserted
- [x] account screen logged-out/loading states no longer render a bare button/link text

### Removed

- (none)

## 2026-08-28

### Added

- [x] central error handler and 404 handler with `ApiError`
- [x] `isStoreStaff` middleware — allows owner or staff into store endpoints
- [x] update order status from dashboard, notifies customer via socket
- [x] Redis-backed rate limiters (`limiter` / `authLimiter`) using `rate-limit-redis`
- [x] shared frontend API client `lib/api.ts` (baseURL + `getApiErrorMessage`)
- [x] route guard middleware `proxy.ts` (redirects unauthenticated users, blocks auth pages when signed in)
- [x] server-side PayFast proxy `/api/payments/initiate` (merchant creds stay server-only)
- [x] `ViewProduct` component; dashboard layout auth gating
- [x] login/signup forms: real `<form>` submit, submitting state, password length validation, autocomplete
- [x] guest landing page on `/` (hero, how it works, store-owner CTA) for logged-out users
- [x] empty state for the product grid when no products exist yet
- [x] SQL migration `sql/migrations/2026-08-28-align-product-and-review-user-ids.sql`

### Changed

- [x] payfast merchant id/key/passphrase moved out of `NEXT_PUBLIC_` → server env (PayFast now posted via `/api/payments/initiate`)
- [x] `canceled` → `cancelled` order status; tracking shows a terminal cancelled state
- [x] `get-store-by-name` rewritten: pagination meta, whitelisted sort, clamped page/limit
- [x] better-auth uses uuid ids (was serial), openAPI plugin only in dev
- [x] CORS allows `PATCH`; added `compression`
- [x] docker-compose: services on private network, backend/db/redis no longer expose host ports
- [x] `isStoreOwner` rewritten (uses `req.isOwner`/slug instead of `req.query.id`); orders `/store/:store_id` requires login + store staff
- [x] clear-cart now requires auth
- [x] all REST calls use shared `lib/api.ts` client (removed per-call URL interpolation)
- [x] `products.discount_start`/`discount_end` declared as `date` in schema (was `varchar(10)`)

### Fixed

- [x] get-orders-by-store returned nothing on error → now returns 500
- [x] track-order silently bailed when no user → returns 401
- [x] optional auth no longer blocks public routes on session lookup failure
- [x] create-product duplicate returns 409 instead of 200
- [x] login used recharts' `Label` instead of ui `Label`
- [x] adding a product with no discount broke (`invalid input syntax for type date: ""`) — empty discount dates are now sent as `null` (create + update)
- [x] `products.created_by` and `store_reviews.user_id` still `integer` while auth ids are uuid → aligned to `text`
- [x] guests no longer get a "Could not load products" error toast; products never fetch while the session is still loading

### Removed

- [x] Pendo analytics (backend service + frontend initializer + all track calls)
- [x] single-product `create-order.js` and its route
- [x] unused backend deps: axios, bcrypt, body-parser, bullmq, crypto-js, json-2-csv, jsonwebtoken, moment, nodemailer, zod
- [x] SQL files moved to `sql/archive/` (schemas contradicted `init.sql`)

## 2026-06-18

### Added

- [x] update order status
- [x] create store posts from dashboard
- [x] allow users to follow their favorite store
- [ ] get feed, this is updates from stores you follow

### Changed

-

### Fixed

- if `cart` is converted and user tries to add items, an error shows

## 2026-06-13

### Added

- [x] typeError check for `cost_price` and `cost_price` in create-product.js
- [x] `discount`, `discount_start`, `discount_end`, `brand` validation in create-product.js
- [x] `effective_price` in get_products.js and get_product.js which is generated from calculating to discount
- [x] store reviews, and get store reviews
- [x] `/onboarding` which searches stores near you
- [x] `/discover page` which discovers stores near you
- [x] when deleting store, also clean its related redis

### Changed

- `price` to `sale_price`
- `user_id` to `userId` clear-cart.js
- `email` required validation to `nullable`, some local stores do not have email
- clear cart endpoint is now `api/carts/clear`

### Fixed

- debounce the `add/decrease` quantity in cart
- `add/decrease` quantity in cart updates cart

## 2026-05-31

### Added

- [x] Can delete store if user owns it

## 2026-05-24

### Added

- [x] docker and docker compose
- [x] Low stock threshold must be lesser than stock quantity check
- [x] Delete product (if store owns it)
- [x] Update product (if store owns it)
- [x] Store for products and stores using zustand

### Changed

- [x] <http://localhost:3000> to <http://localhost:3002>
- [x] <http://localhost:8000> to <http://localhost:8002>

### Removed

- [x] product images from cart item card

## 2026-03-07

### Added

- [x] add to cart
- [x] clear cart
- [x] get user cart
- [x] update cart (append items to cart)
- [x] add shipping details to order
- [x] create order from cart (happens in the background upon clicking 'checkout')
- [x] get user's latest pending order (aligns with the point above this)
- [x] get user's order (can be filtered by 3, 6 months, 1 year, or custom date from and date to)
- [x] create product
- [x] check if auth middleware
- [x] check if store owner middleware
- [x] Signup, signin pages (can also handle google signin)
- [x] account screen (can change name, and email)
- [x] uses payfast (sandbox for dev)
- [x] context for user cart
- [x] custom accordion (didn't like the default one)

## 2026-03-16

### Added

- [x] socket io for realtime crud
- [ ] other changes (i am tired)
