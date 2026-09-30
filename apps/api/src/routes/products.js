import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

/**
 * Ensures backward compatibility with frontend consumers expecting shade_hex and stock
 */
function normalizeProduct(p) {
  if (!p) return null;
  return {
    ...p,
    shade_hex: p.hex_code || p.shade_hex,
    stock: p.stock_quantity !== undefined ? p.stock_quantity : p.stock,
  };
}

// GET /api/products - Retrieve all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    const products = result.rows.map(normalizeProduct);
    return res.json({ products });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/products/:sku - Retrieve a single product by SKU
router.get('/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE UPPER(sku) = UPPER($1)', [sku]);
    const product = result.rows[0];

    if (!product) {
      return res.status(404).json({ error: `Product with SKU ${sku} not found.` });
    }

    return res.json({ product: normalizeProduct(product) });
  } catch (err) {
    console.error(`Error fetching product with SKU ${req.params.sku}:`, err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
