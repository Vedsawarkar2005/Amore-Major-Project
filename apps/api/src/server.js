import express from 'express';
import cors from 'cors';
import { db } from './db.js';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import tryonRouter from './routes/tryon.js';

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 8000;

// Configure CORS and JSON parsing middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));

// Register API Routes
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/tryon', tryonRouter);

// Health-check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now()
  });
});

// Start listening if run directly
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export { app, db };
