import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';
import { encrypt, decrypt } from '../utils/crypto.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'amore-secret-key-2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [trimmedEmail]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Encrypt sensitive fields if provided
    const encrypted_phone = phone ? encrypt(phone) : null;
    const encrypted_address = address ? encrypt(address) : null;

    // Insert user into PostgreSQL
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, encrypted_phone, encrypted_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, role, encrypted_phone, encrypted_address, created_at`,
      [trimmedEmail, password_hash, 'customer', encrypted_phone, encrypted_address]
    );

    const insertedUser = result.rows[0];
    const user = {
      id: insertedUser.id,
      name: name ? name.trim() : trimmedEmail.split('@')[0],
      email: insertedUser.email,
      role: insertedUser.role,
      created_at: insertedUser.created_at,
    };

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [trimmedEmail]);
    const userRow = result.rows[0];
    if (!userRow) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    let decryptedPhone = null;
    let decryptedAddress = null;
    try {
      if (userRow.encrypted_phone) decryptedPhone = decrypt(userRow.encrypted_phone);
      if (userRow.encrypted_address) decryptedAddress = decrypt(userRow.encrypted_address);
    } catch (e) {
      console.warn('Failed to decrypt user profile fields:', e.message);
    }

    const user = {
      id: userRow.id,
      name: userRow.email.split('@')[0],
      email: userRow.email,
      role: userRow.role,
      phone: decryptedPhone,
      address: decryptedAddress,
      encrypted_phone: userRow.encrypted_phone,
      encrypted_address: userRow.encrypted_address,
      created_at: userRow.created_at,
    };

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, encrypted_phone, encrypted_address, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    const userRow = result.rows[0];
    if (!userRow) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let decryptedPhone = null;
    let decryptedAddress = null;
    try {
      if (userRow.encrypted_phone) decryptedPhone = decrypt(userRow.encrypted_phone);
      if (userRow.encrypted_address) decryptedAddress = decrypt(userRow.encrypted_address);
    } catch (e) {
      console.warn('Failed to decrypt user profile fields:', e.message);
    }

    const user = {
      id: userRow.id,
      name: userRow.email.split('@')[0],
      email: userRow.email,
      role: userRow.role,
      phone: decryptedPhone,
      address: decryptedAddress,
      encrypted_phone: userRow.encrypted_phone,
      encrypted_address: userRow.encrypted_address,
      created_at: userRow.created_at,
    };

    return res.json({ user });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/auth/users (Admin user listing to demonstrate encrypted and decrypted field protection)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, encrypted_phone, encrypted_address, created_at FROM users ORDER BY id ASC'
    );

    const users = result.rows.map((row) => {
      let phone = null;
      let address = null;
      try {
        if (row.encrypted_phone) phone = decrypt(row.encrypted_phone);
        if (row.encrypted_address) address = decrypt(row.encrypted_address);
      } catch (e) {
        console.warn('Failed to decrypt user row:', e.message);
      }

      return {
        id: row.id,
        email: row.email,
        role: row.role,
        encrypted_phone: row.encrypted_phone,
        encrypted_address: row.encrypted_address,
        decrypted_phone: phone,
        decrypted_address: address,
        created_at: row.created_at,
      };
    });

    return res.json({ users });
  } catch (err) {
    console.error('Admin users fetch error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

export default router;
