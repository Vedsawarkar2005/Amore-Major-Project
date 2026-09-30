import express from 'express';
import { pool } from '../db.js';
import { verifyToken } from '../middleware/auth.js';
import { decrypt } from '../utils/crypto.js';

const router = express.Router();

/**
 * Middleware to enforce admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Admin privileges required.' });
  }
  next();
};

// Protect all admin endpoints with JWT verification and admin role check
router.use(verifyToken, requireAdmin);

/**
 * GET /api/admin/users
 * Returns all users from PostgreSQL with both raw encrypted database values
 * and decrypted plaintext using decrypt() from utils/crypto.js.
 */
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, role, encrypted_phone, encrypted_address, created_at FROM users ORDER BY id ASC'
    );

    const users = result.rows.map((row) => {
      let decryptedPhone = null;
      let decryptedAddress = null;

      try {
        if (row.encrypted_phone) {
          decryptedPhone = decrypt(row.encrypted_phone);
        }
      } catch (e) {
        console.warn(`Failed to decrypt phone for user ID ${row.id}:`, e.message);
        decryptedPhone = '[Decryption Failed]';
      }

      try {
        if (row.encrypted_address) {
          decryptedAddress = decrypt(row.encrypted_address);
        }
      } catch (e) {
        console.warn(`Failed to decrypt address for user ID ${row.id}:`, e.message);
        decryptedAddress = '[Decryption Failed]';
      }

      return {
        id: row.id,
        email: row.email,
        role: row.role,
        encrypted_phone: row.encrypted_phone,
        encrypted_address: row.encrypted_address,
        decrypted_phone: decryptedPhone,
        decrypted_address: decryptedAddress,
        phone: decryptedPhone,
        address: decryptedAddress,
        created_at: row.created_at,
      };
    });

    return res.json({ users });
  } catch (err) {
    console.error('Admin users fetch error:', err);
    return res.status(500).json({ error: 'Internal server error while fetching admin users.' });
  }
});

/**
 * GET /api/admin/metrics
 * Returns aggregate stats: total users, total orders, total revenue, low-stock products,
 * along with recent orders and real-time inventory for the admin dashboard.
 */
router.get('/metrics', async (req, res) => {
  try {
    // 1. Total users
    const usersCountRes = await pool.query('SELECT COUNT(*) as count FROM users');
    const totalUsers = parseInt(usersCountRes.rows[0]?.count || '0', 10);

    // 2. Total orders and total revenue
    const ordersRes = await pool.query(
      'SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders'
    );
    const totalOrders = parseInt(ordersRes.rows[0]?.count || '0', 10);
    const totalRevenue = parseFloat(ordersRes.rows[0]?.revenue || '0');

    // 3. Low-stock products (threshold <= 20)
    const lowStockThreshold = 20;
    const lowStockCountRes = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE stock_quantity <= $1',
      [lowStockThreshold]
    );
    const lowStockCount = parseInt(lowStockCountRes.rows[0]?.count || '0', 10);

    // Low stock product details
    const lowStockListRes = await pool.query(
      `SELECT id, sku, name, shade_name, hex_code, price, stock_quantity, finish, image_url 
       FROM products 
       WHERE stock_quantity <= $1 
       ORDER BY stock_quantity ASC 
       LIMIT 10`,
      [lowStockThreshold]
    );

    // 4. Recent orders with user email
    const recentOrdersRes = await pool.query(
      `SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at, u.email as user_email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    const recentOrders = await Promise.all(
      recentOrdersRes.rows.map(async (order) => {
        const itemsRes = await pool.query(
          `SELECT oi.id, oi.product_id, oi.quantity, oi.price_at_purchase,
                  p.name as product_name, p.sku as product_sku, p.hex_code
           FROM order_items oi
           LEFT JOIN products p ON oi.product_id = p.id
           WHERE oi.order_id = $1`,
          [order.id]
        );
        return {
          ...order,
          total_amount: parseFloat(order.total_amount),
          items: itemsRes.rows,
        };
      })
    );

    // 5. Full inventory snapshot
    const productsRes = await pool.query(
      `SELECT id, sku, name, shade_name, hex_code, price, stock_quantity, finish, image_url 
       FROM products 
       ORDER BY id ASC`
    );

    return res.json({
      total_users: totalUsers,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      low_stock_products: lowStockCount,
      low_stock_threshold: lowStockThreshold,
      low_stock_list: lowStockListRes.rows,
      // camelCase aliases for flexible client usage
      totalUsers,
      totalOrders,
      totalRevenue,
      lowStockProducts: lowStockCount,
      recent_orders: recentOrders,
      recentOrders,
      inventory: productsRes.rows,
    });
  } catch (err) {
    console.error('Admin metrics fetch error:', err);
    return res.status(500).json({ error: 'Internal server error while fetching admin metrics.' });
  }
});

/**
 * GET /api/admin/shades
 * Retrieve full catalog of lipstick shades for shade management dashboard
 */
router.get('/shades', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, sku, name, shade_name, hex_code, price, stock_quantity, finish, description, image_url
       FROM products
       ORDER BY id ASC`
    );
    return res.json({ shades: result.rows });
  } catch (err) {
    console.error('Admin fetch shades error:', err);
    return res.status(500).json({ error: 'Failed to retrieve shades.' });
  }
});

/**
 * POST /api/admin/shades
 * Add a new shade to catalog
 */
router.post('/shades', async (req, res) => {
  try {
    const {
      sku,
      name,
      shade_name,
      hex_code,
      price,
      stock_quantity = 50,
      finish = 'Velvet Matte',
      description = '',
      image_url = '/images/products/hvl001.jpg',
    } = req.body;

    if (!sku || !shade_name || !hex_code || price === undefined) {
      return res.status(400).json({
        error: 'Missing required shade fields: sku, shade_name, hex_code, and price are required.',
      });
    }

    const productName = name || `HydraVelvet Matte Lipstick - ${shade_name}`;

    const insertRes = await pool.query(
      `INSERT INTO products (sku, name, shade_name, hex_code, price, stock_quantity, finish, description, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, sku, name, shade_name, hex_code, price, stock_quantity, finish, description, image_url`,
      [
        sku.toUpperCase().trim(),
        productName.trim(),
        shade_name.trim(),
        hex_code.trim(),
        parseFloat(price),
        parseInt(stock_quantity, 10) || 0,
        finish.trim(),
        description.trim(),
        image_url.trim(),
      ]
    );

    return res.status(201).json({ shade: insertRes.rows[0], message: 'Shade created successfully.' });
  } catch (err) {
    console.error('Admin create shade error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A shade with this SKU already exists.' });
    }
    return res.status(500).json({ error: 'Failed to create shade.' });
  }
});

/**
 * PUT /api/admin/shades/:id
 * Update an existing shade
 */
router.put('/shades/:id', async (req, res) => {
  try {
    const shadeId = parseInt(req.params.id, 10);
    if (isNaN(shadeId)) {
      return res.status(400).json({ error: 'Invalid shade ID.' });
    }

    const {
      sku,
      name,
      shade_name,
      hex_code,
      price,
      stock_quantity,
      finish,
      description,
      image_url,
    } = req.body;

    // Check if shade exists
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [shadeId]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Shade not found.' });
    }

    const current = existing.rows[0];
    const updatedSku = sku ? sku.toUpperCase().trim() : current.sku;
    const updatedShadeName = shade_name !== undefined ? shade_name.trim() : current.shade_name;
    const updatedName = name !== undefined ? name.trim() : (shade_name ? `HydraVelvet Matte Lipstick - ${updatedShadeName}` : current.name);
    const updatedHex = hex_code !== undefined ? hex_code.trim() : current.hex_code;
    const updatedPrice = price !== undefined ? parseFloat(price) : current.price;
    const updatedStock = stock_quantity !== undefined ? parseInt(stock_quantity, 10) : current.stock_quantity;
    const updatedFinish = finish !== undefined ? finish.trim() : current.finish;
    const updatedDesc = description !== undefined ? description.trim() : current.description;
    const updatedImg = image_url !== undefined ? image_url.trim() : current.image_url;

    const updateRes = await pool.query(
      `UPDATE products
       SET sku = $1, name = $2, shade_name = $3, hex_code = $4, price = $5,
           stock_quantity = $6, finish = $7, description = $8, image_url = $9
       WHERE id = $10
       RETURNING id, sku, name, shade_name, hex_code, price, stock_quantity, finish, description, image_url`,
      [
        updatedSku,
        updatedName,
        updatedShadeName,
        updatedHex,
        updatedPrice,
        updatedStock,
        updatedFinish,
        updatedDesc,
        updatedImg,
        shadeId,
      ]
    );

    return res.json({ shade: updateRes.rows[0], message: 'Shade updated successfully.' });
  } catch (err) {
    console.error('Admin update shade error:', err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'A shade with this SKU already exists.' });
    }
    return res.status(500).json({ error: 'Failed to update shade.' });
  }
});

/**
 * DELETE /api/admin/shades/:id
 * Delete a shade from catalog
 */
router.delete('/shades/:id', async (req, res) => {
  try {
    const shadeId = parseInt(req.params.id, 10);
    if (isNaN(shadeId)) {
      return res.status(400).json({ error: 'Invalid shade ID.' });
    }

    const deleteRes = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id, sku, shade_name', [shadeId]);
    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Shade not found.' });
    }

    return res.json({ message: 'Shade deleted successfully.', deleted: deleteRes.rows[0] });
  } catch (err) {
    console.error('Admin delete shade error:', err);
    return res.status(500).json({ error: 'Failed to delete shade.' });
  }
});

export default router;

