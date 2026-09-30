import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { pool, query, db } from './db.js';
import { ensureSeeded, seedDatabase } from './seed.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import tryonRouter from './routes/tryon.js';
import adminRouter from './routes/admin.js';

// Auto-seed database if empty (e.g. fresh container or restart)
ensureSeeded();

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 8000;

// Configure CORS middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // fallback allow or restrict if desired
    }
  },
  credentials: true,
}));

// Forward Better Auth endpoints if called without /auth prefix (e.g. when baseURL is configured with /api)
app.use((req, res, next) => {
  if (
    req.url.startsWith('/api/sign-in') ||
    req.url.startsWith('/api/sign-up') ||
    req.url.startsWith('/api/sign-out') ||
    req.url.startsWith('/api/get-session') ||
    req.url.startsWith('/api/session')
  ) {
    req.url = req.url.replace('/api', '/api/auth');
  }
  next();
});

// Better Auth route handler - MUST be mounted before express.json() to prevent stream consumption issues
app.all(['/api/auth', '/api/auth/*'], toNodeHandler(auth));

// Express body parsers
app.use(express.json({ limit: '25mb' }));

// Register API Routes — support both with and without /api prefix
// This ensures frontend works even if NEXT_PUBLIC_API_URL is configured without /api
app.use(['/api/auth', '/auth'], authRouter);
app.use(['/api/products', '/products'], productsRouter);
app.use(['/api/orders', '/orders'], ordersRouter);
app.use(['/api/tryon', '/tryon'], tryonRouter);
app.use(['/api/admin', '/admin'], adminRouter);

// Health-check endpoint
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

// Seed endpoint (for environments without shell access like Render Free tier)
app.post(['/api/seed', '/seed'], async (req, res) => {
  const secret = req.query.secret || req.headers['x-seed-secret'] || req.body?.secret;
  if (process.env.SEED_SECRET && secret !== process.env.SEED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized: invalid seed secret' });
  }
  try {
    const force = req.query.force === 'true' || req.body?.force === true;
    await seedDatabase({ force });
    res.json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    console.error('Seed endpoint error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Start listening if run directly
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export { app, pool, query, db };
