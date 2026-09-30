import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { register, login, getMe, getUsers } from '../controllers/authController.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', authMiddleware, getMe);

// GET /api/auth/users (Admin user listing to demonstrate encrypted and decrypted field protection)
router.get('/users', authMiddleware, getUsers);

export default router;
