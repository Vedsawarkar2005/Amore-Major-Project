import express from 'express';
import { verifyToken, requireAdmin } from '../middleware/auth.js';
import {
  getAdminUsers,
  getAdminMetrics,
  getAdminShades,
  createAdminShade,
  updateAdminShade,
  deleteAdminShade,
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin endpoints with JWT verification and admin role check
router.use(verifyToken, requireAdmin);

/**
 * GET /api/admin/users
 * Returns all users from PostgreSQL with raw encrypted database values and decrypted plaintext
 */
router.get('/users', getAdminUsers);

/**
 * GET /api/admin/metrics
 * Returns aggregate stats: total users, total orders, total revenue, low-stock products, etc.
 */
router.get('/metrics', getAdminMetrics);

/**
 * GET /api/admin/shades
 * Retrieve full catalog of lipstick shades for shade management dashboard
 */
router.get('/shades', getAdminShades);

/**
 * POST /api/admin/shades
 * Add a new shade to catalog
 */
router.post('/shades', createAdminShade);

/**
 * PUT /api/admin/shades/:id
 * Update an existing shade
 */
router.put('/shades/:id', updateAdminShade);

/**
 * DELETE /api/admin/shades/:id
 * Delete a shade from catalog
 */
router.delete('/shades/:id', deleteAdminShade);

export default router;
