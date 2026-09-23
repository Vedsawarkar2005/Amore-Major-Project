# Project Status - Amore Cosmetics Backend

**Branch:** `feat/backend-foundation`  
**Last Updated:** 2026-09-23  

## 1. Completed Features

- [x] **Backend Project Initialization**: Set up `apps/api` with Node.js and ES module support.
- [x] **Express Server Foundation**: Created minimal Express server in `apps/api/src/server.js` listening on port `8000`.
- [x] **CORS & Middleware**: Configured `cors` allowing origin `http://localhost:3000` with `credentials: true`, along with `express.json({ limit: '25mb' })` body parser for image payloads.
- [x] **SQLite Database Integration**: Initialized database connection with `better-sqlite3` targeting `apps/api/data/amore.db` (via `apps/api/src/db.js`).
- [x] **Schema Definitions**: Added initial database schema with auto-creation for:
  - `users`: `id`, `name`, `email` (UNIQUE), `password_hash`, `role` (DEFAULT 'CUSTOMER'), `created_at`
  - `products`: `id`, `sku` (UNIQUE), `name`, `description`, `price`, `shade_hex`, `image_url`, `stock` (DEFAULT 50)
  - `orders`: `id`, `order_number` (UNIQUE), `user_id`, `total_amount`, `status` (DEFAULT 'PAID'), `shipping_address`, `created_at`
  - `order_items`: `id`, `order_id`, `product_id`, `quantity`, `price`
- [x] **Health Check Endpoint**: Implemented `GET /api/health` returning `{ status: "ok", timestamp: <epoch_ms> }`.
- [x] **Authentication Middleware**: Created `apps/api/src/middleware/auth.js` to extract and verify Bearer JWT tokens from the `Authorization` header.
- [x] **Authentication Endpoints**:
  - `POST /api/auth/register`: Accepts `name`, `email`, `password`; hashes password with `bcryptjs`, inserts user, and returns JWT + user object.
  - `POST /api/auth/login`: Accepts `email`, `password`; validates credentials via `bcryptjs.compare`, and returns JWT + user object.
  - `GET /api/auth/me`: Authenticated endpoint using `authMiddleware` to return current user profile.
- [x] **Product Endpoints**:
  - `GET /api/products`: Retrieves all products from the catalog.
  - `GET /api/products/:sku`: Retrieves a specific product by its unique SKU (case-insensitive).
- [x] **Order Management Endpoints**:
  - `POST /api/orders`: Transactional (`db.transaction`) order placement that creates an order with status `PAID`, bulk-inserts line items into `order_items`, and atomically decrements product inventory.
  - `GET /api/orders/user/:userId`: Retrieves all orders for a user with nested order items and product details.
- [x] **Virtual Try-On Endpoint**:
  - `POST /api/tryon`: Mock AI endpoint accepting `imageBase64` and `shadeSku`, returning `{ status: "success", shade: shadeSku, processedUrl: imageBase64 }`.
- [x] **Router Registrations**: Registered `auth`, `products`, `orders`, and `tryon` routers in `apps/api/src/server.js`.
- [x] **Database Seed Script**: Created `apps/api/src/seed.js` connecting to `amore.db`:
  - Clears `users` and `products` tables.
  - Inserts admin (`admin@amorecosmetics.in` / `admin123`, role `ADMIN`) and test user (`client@amorecosmetics.in` / `user123`, role `CUSTOMER`).
  - Inserts 12 lipstick products (`HVL001` - `HVL012`) priced at `349.00` with stock `50`.

---

## 2. Current File Tree

```
apps/api/
├── PROJECT_STATUS.md
├── package.json
├── data/
│   └── (amore.db - created at runtime)
└── src/
    ├── db.js
    ├── server.js
    ├── seed.js
    ├── middleware/
    │   └── auth.js
    └── routes/
        ├── auth.js
        ├── orders.js
        ├── products.js
        └── tryon.js
```

---

## 3. Dependency Installation & Commands

### Install API Dependencies
Navigate to `apps/api` and install required packages:

```bash
cd apps/api && npm install express cors better-sqlite3 bcryptjs jsonwebtoken
```

### Run Database Seed Script
To initialize and populate the SQLite database with seed users and products:

```bash
cd apps/api && node src/seed.js
```
*(or via npm script: `npm run seed`)*

### Start Server
```bash
cd apps/api && npm run dev
```

---

## 4. Outstanding Tasks

- [ ] **Run Dependency Installation & Seed Script**: Execute `npm install` and `node src/seed.js` in `apps/api`.
- [ ] **Frontend Integration**: Connect frontend state and API calls to `http://localhost:8000/api/*`.
- [ ] **Production Try-On Engine**: Connect `POST /api/tryon` to actual virtual try-on inference service/model.
- [ ] **Automated Testing**: Add end-to-end tests for product queries, order creation transactions, and auth flows.
