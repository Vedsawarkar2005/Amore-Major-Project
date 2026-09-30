import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { pool, query, db } from './db.js';
import { ensureSeeded } from './seed.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import tryonRouter from './routes/tryon.js';

// Auto-seed database if empty (e.g. fresh container or restart)
ensureSeeded();

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 8000;

// Configure CORS and JSON parsing middleware
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

app.use(express.json({ limit: '25mb' }));

// Register API Routes — support both with and without /api prefix
// This ensures frontend works even if NEXT_PUBLIC_API_URL is configured without /api
app.use(['/api/auth', '/auth'], authRouter);
app.use(['/api/products', '/products'], productsRouter);
app.use(['/api/orders', '/orders'], ordersRouter);
app.use(['/api/tryon', '/tryon'], tryonRouter);

// Health-check endpoint
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
  });
});

// Start listening if run directly
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export { app, pool, query, db };
