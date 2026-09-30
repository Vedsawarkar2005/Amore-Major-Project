import express from 'express';
import { getAllProducts, getProductBySku } from '../controllers/productsController.js';

const router = express.Router();

// GET /api/products - Retrieve all products
router.get('/', getAllProducts);

// GET /api/products/:sku - Retrieve a single product by SKU
router.get('/:sku', getProductBySku);

export default router;
