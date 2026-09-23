import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Transaction for creating order, inserting order items, and updating stock
const createOrderTx = db.transaction((orderData) => {
  const { user_id, total_amount, shipping_address, items } = orderData;
  const orderNumber = `AMORE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const orderResult = db.prepare(
    `INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address)
     VALUES (?, ?, ?, 'PAID', ?)`
  ).run(orderNumber, user_id, total_amount, shipping_address || '');

  const orderId = Number(orderResult.lastInsertRowid);

  const insertItemStmt = db.prepare(
    `INSERT INTO order_items (order_id, product_id, quantity, price)
     VALUES (?, ?, ?, ?)`
  );

  const decrementStockStmt = db.prepare(
    `UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`
  );

  for (const item of items) {
    insertItemStmt.run(orderId, item.product_id, item.quantity, item.price);
    decrementStockStmt.run(item.quantity, item.product_id);
  }

  return { orderId, orderNumber };
});

// POST /api/orders - Create an order with transaction
router.post('/', (req, res) => {
  try {
    const { user_id, total_amount, shipping_address, items } = req.body;

    if (!user_id || total_amount === undefined || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: 'Invalid order data. user_id, total_amount, and items array are required.'
      });
    }

    const { orderId, orderNumber } = createOrderTx({
      user_id,
      total_amount,
      shipping_address,
      items
    });

    const createdOrder = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(orderId);

    return res.status(201).json({
      order: {
        ...createdOrder,
        items: orderItems
      }
    });
  } catch (error) {
    console.error("Order Transaction Error:", error);
    return res.status(500).json({ error: 'Internal server error while placing order.' });
  }
});

// GET /api/orders/user/:userId - Retrieve all orders for a specific user ID with nested items
router.get('/user/:userId', (req, res) => {
  try {
    const { userId } = req.params;

    const orders = db.prepare(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
    ).all(userId);

    const getItemsStmt = db.prepare(`
      SELECT oi.*, p.name as product_name, p.sku as product_sku, p.shade_hex, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `);

    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: getItemsStmt.all(order.id)
    }));

    return res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error(`Error fetching orders for user ${req.params.userId}:`, err);
    return res.status(500).json({ error: 'Internal server error while fetching user orders.' });
  }
});

export default router;
