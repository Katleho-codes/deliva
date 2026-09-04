# Deliva

E-commerce built for South African spaza shops — connecting township businesses with their local customers through a full online store experience.

## Inspiration

Spaza shops are the backbone of South African township economies, serving millions daily, yet almost none have any digital presence. We wanted to build something that gave these informal but essential businesses the same online tools that big retailers take for granted, while keeping the experience rooted in community trust.

## What it does

Deliva connects local spaza shops with their customers through a complete e-commerce experience:

- **Customers** discover nearby shops using a live, radar-style locator, browse products grouped by category, add items to a real-time cart, check out securely via PayFast, and track their order/delivery status live.
- **Shop owners** get a full dashboard to manage products, inventory, staff, orders, and customers, and can post deals and updates that their followers see instantly.
- **Customers** can follow their favourite shops and rate & review them after delivery.

## Features

**Customer**
- Radar-style nearby-store discovery based on geolocation (haversine distance)
- Browse products grouped by category, with filtering, pagination, and sale/stock badges
- Real-time cart that syncs with the backend and survives navigation & checkout abandonment
- Checkout via PayFast (sandbox by default) with shipping details and order creation
- Live order tracking with status updates pushed over Socket.IO
- Store reviews after delivery
- Follow stores to stay updated

**Shop owner**
- Dashboard for products, inventory/low-stock thresholds, staff, and orders
- Create / update / delete products and stores
- Update order status from the dashboard (notifies customers in real time)
- Manage store reviews and a community/discount feed

**Platform**
- Authentication with email/password **and** Google OAuth (better-auth, cookie sessions)
- Real-time Socket.IO updates (cart, orders, status changes)
- Server-side rate limiting backed by Redis
- Centralized error handling and API error envelope
- Protection of dashboard/auth/account routes via client + server guards

## Tech stack

| Layer | Tech |
| --- | --- |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, Radix UI, Axios, Socket.IO client, Recharts, react-slick |
| **Backend** | Node.js, Express 5, better-auth, Socket.IO, Multer + Sharp (uploads), Resend (email), Yup (validation), helmet, compression |
| **Database** | PostgreSQL 16 (`pg`) |
| **Cache / rate limits** | Redis |
| **Infra** | Docker & Docker Compose |

## Architecture

The **Next.js frontend** talks to the **Express backend** at `NEXT_PUBLIC_SERVER_URL` using Axios with `withCredentials` (so the better-auth session cookie is sent automatically). **Socket.IO** provides live updates. Data lives in **PostgreSQL**, and **Redis** backs auth rate limiters.

```
┌──────────────────┐   REST (axios, cookies)   ┌──────────────────┐
│   Next.js app     │ ────────────────────────▶ │   Express API     │
│   (port 3002)     │ ◀──────────────────────── │  (port 8002)      │
└──────────────────┘   Socket.IO (realtime)     └────────┬─────────┘
                                                         │
                                              ┌──────────┴──────────┐
                                              │  PostgreSQL   Redis │
                                              └─────────────────────┘
```

## Project structure

```
deliva/
├── backend/            # Express API (controllers, routes, middleware, services)
│   ├── controller/     # business logic per resource (carts, orders, products, stores...)
│   ├── middleware/     # auth guards, error handler, rate limiting
│   ├── routes/         # express routers mounted under /api
│   └── server.js       # app entrypoint
├── frontend/           # Next.js app
│   ├── app/            # routes/pages (account, auth, checkout, dashboard, orders, stores...)
│   ├── components/     # screens + shared UI (Card, Logo, Loading, EmptyState...)
│   ├── hooks/          # data-fetching hooks (axios + Socket.IO)
│   └── context/        # shared providers (Cart, Socket)
├── sql/
│   ├── init.sql        # full schema + seed (auto-applied by Docker, or run manually)
│   └── migrations/     # incremental SQL migrations
└── docker-compose.yml  # frontend + backend + PostgreSQL + Redis
```

## Prerequisites

**Option A — Docker (recommended)**
- Docker Desktop
- Git

**Option B — No Docker (local dev)**
- Node.js 20
- PostgreSQL 16
- Redis
- Git

---

## Setup — Option A: Docker (recommended)

1. Clone the repo and enter it:

```bash
   git clone https://github.com/Katleho-codes/deliva
   cd deliva
```

2. Create environment files from the examples:

```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env.local
   cp .env.example .env
```

3. Fill in the values (see the [environment reference](#environment-variables) below). At minimum, set the Postgres credentials, `BETTER_AUTH_SECRET`, and any auth/PayFast keys you want to use.

   The root `.env` is used by Docker Compose to configure the `db` service (`POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD`) — it's separate from `backend/.env` and `frontend/.env.local`, which configure the app containers themselves. All three must be filled in.

4. Build and start everything:

```bash
   docker-compose up --build
```

5. Open the app:

```text
   Frontend: http://localhost:3002
```

   Only the frontend is exposed to the host. The backend (internal `http://backend:8000`), PostgreSQL, and Redis run on a private Docker network and are not published to host ports. `sql/init.sql` is applied automatically the first time the database container starts.
## Setup — Option B: No Docker (local dev)

1. Clone the repo and enter it:

   ```bash
   git clone https://github.com/Katleho-codes/deliva
   cd deliva
   ```

2. Create the database and apply the schema:

   ```bash
   createdb deliva
   psql -U <your-postgres-user> -d deliva -f sql/init.sql
   ```

3. Start Redis locally (e.g. `redis-server` on `localhost:6379`).

4. Configure the backend environment:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Set these local-dev values (adjust to your Postgres setup):

   ```dotenv
   POSTGRES_USER=<your-postgres-user>
   POSTGRES_DB=deliva
   POSTGRES_PASSWORD=<your-postgres-password>
   DB_HOST=localhost
   DB_PORT=5432
   REDIS_URL=redis://localhost:6379
   PORT=8002
   BETTER_AUTH_URL=http://localhost:3002
   CLIENT_URL=http://localhost:3002
   ```

5. Start the backend:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

6. Configure the frontend environment and start it (in a second terminal):

   ```bash
   cd frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

   Set `NEXT_PUBLIC_SERVER_URL=http://localhost:8002` and `NEXT_PUBLIC_APP_URL=http://localhost:3002` in `frontend/.env.local`.

7. Open the app:

   ```text
   Frontend: http://localhost:3002
   Backend:  http://localhost:8002
   ```

## Environment variables

### Backend (`backend/.env`)

| Variable | Purpose |
| --- | --- |
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_DB` | PostgreSQL database name |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host (`localhost` locally, `db` in Docker) |
| `DB_PORT` | PostgreSQL port (default `5432`) |
| `REDIS_URL` | Redis connection URL (`redis://redis:6379` in Docker, `redis://localhost:6379` locally) |
| `PORT` | Backend port (default `8002`) |
| `NODE_ENV` | `development` / `production` |
| `BETTER_AUTH_SECRET` | Secret used to sign authentication sessions |
| `BETTER_AUTH_URL` | Public URL of the API (used for better-auth) |
| `CLIENT_URL` | Trusted frontend origin (CORS) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (for "Continue with Google") |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `RESEND_TOKEN` | Resend API token (transactional email) |

### Frontend (`frontend/.env.local`)

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SERVER_URL` | Backend API base URL (`http://localhost:8002`) |
| `NEXT_PUBLIC_APP_URL` | Frontend public URL (`http://localhost:3002`) |
| `PAYFAST_MERCHANT_ID` | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | PayFast passphrase (used to sign the payment request) |
| `PAYFAST_PROCESS_URL` | PayFast gateway URL (`https://sandbox.payfast.co.za/eng/process` for testing) |

> **PayFast:** the default `PAYFAST_PROCESS_URL` points to the sandbox — use it while developing. Switch to the live gateway and production merchant credentials only when you're ready to go live.

## Authentication

Deliva uses [better-auth](https://better-auth.com) for email/password and Google OAuth. Sessions are cookie-based and sent with every API request (`withCredentials`). Key screens (account, checkout, orders, dashboard, onboarding, my-stores) are wrapped in a `RequireAuth` guard that redirects unauthenticated users to `/auth/login?next=<original-url>` so they return to where they left off.

## Order lifecycle

1. Customer adds items to the cart (cart is created/kept active server-side).
2. At checkout, an order is created from the cart and shipping details are added.
3. The customer pays through PayFast (sandbox by default).
4. The shop owner updates the order status from the dashboard (pending → shipped → delivered, or cancelled).
5. Status changes are pushed to the customer in real time via Socket.IO and shown on the live tracking screen.

## API overview

All API routes are mounted under `/api`:

| Prefix | Purpose |
| --- | --- |
| `/api/auth/*` | better-auth signup / sign-in / session / Google OAuth |
| `/api/products` | list, create, update, delete products |
| `/api/stores` | stores, nearby radar discovery, my-stores, reviews |
| `/api/carts` | view / add / update / clear cart |
| `/api/orders` | create from cart, add shipping, latest-pending, list, cancel, abandon, payfast-checkout, tracking |
| `/api/dashboard/stores/:slug` | shop-owner dashboard (products, orders, overview) |
| `/api/search` | search products / stores |

Errors are returned in a consistent `{ message }` envelope via a central error handler, and a shared Axios instance (`frontend/lib/api.ts`) normalizes them for the UI.

## Scripts

**Backend**

```bash
npm run dev          # start with nodemon
npm run start        # start in production
npm run test         # run vitest (watch)
npm run test:run     # run vitest once
npm run test:coverage
```

**Frontend**

```bash
npm run dev          # next dev on port 3002
npm run build        # production build
npm run start        # start production server on 3002
npm run lint         # eslint
```

## Testing

Backend tests use [Vitest](https://vitest.dev) + Supertest. Run them with:

```bash
cd backend
npm run test:run
```

> Note: one test currently asserts the order status string as `"canceled"` while the app uses `"cancelled"` — a known, pre-existing mismatch that can be reconciled before CI is enabled.

## Contributing

This project is under active development in the [`new-updates`](https://github.com/Katleho-codes/deliva/tree/new-updates) branch. Please open an issue or pull request at https://github.com/Katleho-codes/deliva.

## License

Please refer to the repository for license details.
