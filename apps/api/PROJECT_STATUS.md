# Project Status - Amore Cosmetics Backend

**Branch:** `feat/backend-foundation`  
**Last Updated:** 2026-09-30  

## 1. Completed Features

- [x] **Backend Project Initialization**: Set up `apps/api` with Node.js and ES module support.
- [x] **Express Server Foundation**: Created Express server in `apps/api/src/server.js` listening on port `8000`.
- [x] **CORS & Middleware**: Configured `cors` allowing origin `http://localhost:3000` with `credentials: true`, along with `express.json({ limit: '25mb' })` body parser for image payloads.
- [x] **PostgreSQL & Neon Integration**:
  - Replaced `node:sqlite` with `pg.Pool` targeting Neon PostgreSQL via `DATABASE_URL` with SSL (`rejectUnauthorized: false`).
  - Implemented async query helpers in `apps/api/src/db.js`.
  - Configured `@neon/config` with `neon.ts` policy.
- [x] **AES-256-GCM Field-Level Encryption**:
  - Created symmetric encryption utility in `apps/api/src/utils/crypto.js` using Node's `crypto` module.
  - Requires `ENCRYPTION_KEY` (32-byte hex/secret).
  - Implemented `encrypt(text)` returning `iv:authTag:ciphertext` and `decrypt(encryptedPayload)` returning plaintext.
- [x] **PostgreSQL Schema Definitions (`apps/api/src/schema.sql`)**:
  - `users`: `id SERIAL PRIMARY KEY`, `email VARCHAR UNIQUE`, `password_hash TEXT`, `role VARCHAR DEFAULT 'customer'`, `encrypted_phone TEXT`, `encrypted_address TEXT`, `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `products`: `id SERIAL PRIMARY KEY`, `sku VARCHAR UNIQUE`, `name TEXT`, `shade_name TEXT`, `hex_code VARCHAR(7)`, `price NUMERIC(10,2)`, `stock_quantity INT`, `image_url TEXT`, `finish TEXT`, `description TEXT`
  - `orders`: `id SERIAL PRIMARY KEY`, `user_id INT REFERENCES users(id)`, `total_amount NUMERIC(10,2)`, `status VARCHAR`, `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
  - `order_items`: `id SERIAL PRIMARY KEY`, `order_id INT REFERENCES orders(id) ON DELETE CASCADE`, `product_id INT REFERENCES products(id)`, `quantity INT`, `price_at_purchase NUMERIC(10,2)`
- [x] **PostgreSQL Seed Script (`apps/api/src/seed.js`)**:
  - Parameterized seeding for 12 HydraVelvet products (`HVL001` - `HVL012`).
  - Seeds 2 initial users (admin + customer) with AES-256-GCM encrypted phone and address fields.
- [x] **Async Express Routes Update**:
  - Replaced all SQLite synchronous calls with `await pool.query(...)` and parameterized `$1, $2, ...` placeholders.
  - Implemented ACID transaction for `POST /api/orders` using dedicated client (`await pool.connect()`, `BEGIN`, `COMMIT`, `ROLLBACK`, `release()`).
- [x] **Health Check Endpoint**: Implemented `GET /api/health` returning `{ status: "ok", timestamp: <epoch_ms> }`.
- [x] **Virtual Try-On Endpoint**: Proxying to Python shade recommendation microservice with fallback.

---

## 2. Current File Tree

```
apps/api/
├── .env.example
├── PROJECT_STATUS.md
├── package.json
└── src/
    ├── db.js
    ├── schema.sql
    ├── seed.js
    ├── server.js
    ├── middleware/
    │   └── auth.js
    ├── routes/
    │   ├── auth.js
    │   ├── orders.js
    │   ├── products.js
    │   └── tryon.js
    └── utils/
        └── crypto.js
```

---

## 3. Dependency Installation & Commands

### Install API Dependencies
```bash
cd apps/api && npm install
```

### Run Database Seed Script
```bash
cd apps/api && npm run seed
```

### Start Server
```bash
cd apps/api && npm run dev
```
