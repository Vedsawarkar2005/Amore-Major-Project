# Project Status - Amore Cosmetics Full Web

**Branch:** `feat/monorepo-workspace-migration`  
**Last Updated:** 2026-09-23  

## 1. Architecture — NPM Workspace Monorepo

```
Amore Full Web/                   ← Repo Root
├── package.json                  ← Root workspace runner (workspaces: ["apps/*", "packages/*"])
├── .gitignore
├── PROJECT_STATUS.md
├── apps/
│   ├── api/                      ← Express + SQLite backend (port 8000)
│   │   ├── package.json
│   │   ├── data/
│   │   │   └── amore.db          ← SQLite database (runtime)
│   │   └── src/
│   │       ├── db.js             ← node:sqlite DatabaseSync
│   │       ├── server.js
│   │       ├── seed.js
│   │       ├── middleware/
│   │       │   └── auth.js
│   │       └── routes/
│   │           ├── auth.js
│   │           ├── orders.js
│   │           ├── products.js
│   │           └── tryon.js
│   └── web/                      ← Next.js 16 frontend (port 3000) [migrated from frontend/]
│       ├── package.json          ← name: "amore-web"
│       ├── .env.local            ← NEXT_PUBLIC_API_URL=http://localhost:8000/api
│       ├── next.config.ts
│       ├── tsconfig.json
│       ├── app/
│       │   ├── page.tsx          ← Homepage (live API: fetchProducts)
│       │   ├── shop/
│       │   │   ├── page.tsx      ← Shop catalog (live SQLite, loading state)
│       │   │   └── [slug]/
│       │   │       ├── page.tsx           ← PDP (live API, generateStaticParams from API)
│       │   │       └── ProductDetailView.tsx
│       │   ├── try-on/page.tsx   ← Virtual Try-On Studio
│       │   └── wishlist/page.tsx
│       ├── components/
│       │   ├── auth/AuthModal.tsx
│       │   ├── layout/
│       │   │   ├── Header.tsx    ← Live search (fetches from API on open)
│       │   │   └── MobileNav.tsx
│       │   └── shop/
│       │       ├── CartDrawer.tsx
│       │       ├── ProductCard.tsx
│       │       └── ShadeSelector.tsx
│       ├── context/
│       │   ├── AuthContext.tsx
│       │   ├── CartContext.tsx
│       │   └── WishlistContext.tsx
│       ├── lib/
│       │   ├── api.ts            ← API helpers: fetchProducts, fetchProductBySku, etc.
│       │   ├── types.ts          ← Shared Product interface [NEW - migrated from data/]
│       │   └── utils.ts
│       └── public/
│           ├── brand/            ← Amore logo and brand assets
│           ├── models/           ← Model photography
│           ├── products/         ← Product imagery
│           └── test-images/      ← Virtual try-on test assets
└── packages/                     ← Reserved for future shared packages (e.g., types, config)
```

---

## 2. Completed Features

- [x] **Backend Project Initialization**: Set up `apps/api` with Node.js and ES module support.
- [x] **Express Server Foundation**: Minimal Express server in `apps/api/src/server.js` on port `8000`.
- [x] **CORS & Middleware**: Configured `cors` allowing origin `http://localhost:3000` with `credentials: true`.
- [x] **SQLite Database (node:sqlite)**: `DatabaseSync` via Node 22+ built-in — no native compilation required.
- [x] **Schema Definitions**: `users`, `products`, `orders`, `order_items` tables auto-created.
- [x] **Health Check**: `GET /api/health`.
- [x] **Authentication**: JWT-based `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
- [x] **Product Endpoints**: `GET /api/products`, `GET /api/products/:sku`.
- [x] **Order Management**: `POST /api/orders` (transactional, inventory decrement), `GET /api/orders/user/:userId`.
- [x] **Virtual Try-On Endpoint**: `POST /api/tryon`.
- [x] **Database Seed**: `apps/api/src/seed.js` — 2 users + 12 Hydravelvet lipstick products (`HVL001`–`HVL012`).
- [x] **Frontend Integration**: Auth, cart, wishlist, product catalog, orders, try-on all connected to live API.
- [x] **Monorepo Migration**: `frontend/` renamed and relocated to `apps/web/`.
- [x] **Root NPM Workspaces**: `package.json` updated with `"workspaces": ["apps/*", "packages/*"]`.
- [x] **Workspace Dev Scripts**: Root `npm run dev` uses `--workspace=apps/api` and `--workspace=apps/web`.
- [x] **Product Type Extraction**: `Product` interface moved from `data/products.ts` → `lib/types.ts`.
- [x] **Full API Integration (All Pages)**: All 10 previous consumers of static `data/products.ts` migrated to live API:
  - `app/page.tsx` — homepage fetches products on mount (GSAP animation preserved).
  - `app/shop/page.tsx` — live SQLite catalog with loading state badge.
  - `app/shop/[slug]/page.tsx` — PDP, `generateStaticParams`, and `generateMetadata` all use live API.
  - `components/layout/Header.tsx` — search fetches from API on first open.
  - All contexts and components use `Product` from `lib/types`.
- [x] **Dead Code Removal**: Deleted `apps/web/data/products.ts` (static data) and 5 default Next.js boilerplate SVGs (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`).
- [x] **Realistic Lip Renderer & AI Recommendation Integration**:
  - Integrated CIE LAB color science, edge feathering, and multi-finish simulation (`Velvet Matte`, `Matte`, `Satin`, `Glossy`) into `apps/web/lib/tryon/lips/realistic-lipstickRenderer.ts`.
  - Added AI skin tone analyzer & shade recommendation microservice under `apps/shade-recom` with `data/shade_catalogue.json` covering all 12 Amore HydraVelvet shades.
  - Upgraded Virtual Try-On Studio (`apps/web/app/try-on/page.tsx`) with AI Stylist match scores, dual video/photo mode, and direct store checkout integration.

---

## 3. Commands

### From Repo Root (Workspace Commands)
```bash
# Run both Backend API (port 8000) and Next.js Frontend (port 3000)
npm run dev

# Run all 3 services concurrently (Express API + Next.js Web + AI Recommendation)
npm run dev:all

# Run individual services
npm run dev:web
npm run dev:api
npm run dev:ai

# Install all workspace dependencies
npm install
```

### Seed Database
```bash
npm run seed --workspace=apps/api
# or
npm --prefix apps/api run seed
```

---

## 4. Outstanding Tasks

- [x] **Production Try-On Engine**: Integrated realistic lip rendering engine and AI shade recommendation microservice.
- [ ] **Automated Testing**: Add end-to-end tests for product queries, order creation transactions, and auth flows.
- [ ] **`data/` folder cleanup**: Remove empty `apps/web/data/` directory (empty after products.ts deletion).
- [x] **Slug derivation hardening**: Move slug generation (`hydravelvet-lipstick-${sku.toLowerCase()}`) into a shared utility to avoid drift across `app/shop/[slug]/page.tsx`, `Header.tsx`, `app/shop/page.tsx`, and `app/page.tsx`.
