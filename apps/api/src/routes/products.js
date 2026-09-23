import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/products - Retrieve all products
router.get('/', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    return res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/products/:sku - Retrieve a single product by SKU
router.get('/:sku', (req, res) => {
  try {
    const { sku } = req.params;
    const product = db.prepare('SELECT * FROM products WHERE UPPER(sku) = UPPER(?)').get(sku);

    if (!product) {
      return res.status(404).json({ error: `Product with SKU ${sku} not found.` });
    }

    return res.json({ product });
  } catch (err) {
    console.error(`Error fetching product with SKU ${req.params.sku}:`, err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
