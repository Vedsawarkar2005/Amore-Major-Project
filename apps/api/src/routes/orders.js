import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// POST /api/orders - Create an order and dispatch luxury React Email invoice
router.post('/', async (req, res) => {
  const {
    user_id,
    total_amount,
    status,
    items,
    customer_name,
    customer_email,
    customerName,
    customerEmail,
    shipping_address,
    shippingAddress,
  } = req.body;

  if (
    !user_id ||
    total_amount === undefined ||
    !items ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res.status(400).json({
      error: 'Invalid order data. user_id, total_amount, and items array are required.',
    });
  }

  // Resolve customer name and email (from body or user table lookup)
  let resolvedName = customer_name || customerName;
  let resolvedEmail = customer_email || customerEmail;

  if (!resolvedName || !resolvedEmail) {
    try {
      const userLookup = await pool.query(
        'SELECT name, email FROM "user" WHERE id = $1',
        [user_id]
      );
      if (userLookup.rows.length > 0) {
        if (!resolvedName) resolvedName = userLookup.rows[0].name;
        if (!resolvedEmail) resolvedEmail = userLookup.rows[0].email;
      }
    } catch (uErr) {
      console.warn('[Orders] User lookup notice:', uErr.message);
    }
  }

  resolvedName = resolvedName || 'Valued Client';
  resolvedEmail = resolvedEmail || 'customer@amorecosmetics.com';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert order record
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total_amount, status)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, total_amount, status, created_at`,
      [user_id, total_amount, status || 'PAID']
    );

    const createdOrder = orderResult.rows[0];
    const orderId = createdOrder.id;

    // Insert order items and decrement product stock
    const insertedItems = [];
    const invoiceItems = [];

    for (const item of items) {
      const price =
        item.price_at_purchase !== undefined ? item.price_at_purchase : item.price;
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
         VALUES ($1, $2, $3, $4)
         RETURNING id, order_id, product_id, quantity, price_at_purchase`,
        [orderId, item.product_id, item.quantity, price]
      );

      // Fetch product name and shade name for receipt and inventory
      const prodQuery = await client.query(
        'SELECT name, shade_name, sku, hex_code, image_url FROM products WHERE id = $1',
        [item.product_id]
      );
      const prod = prodQuery.rows[0] || {};

      insertedItems.push({
        ...itemResult.rows[0],
        price: itemResult.rows[0].price_at_purchase,
        product_name: prod.name || item.name,
        shade_name: prod.shade_name || item.shade_name,
      });

      invoiceItems.push({
        product_id: item.product_id,
        name: prod.name || item.name || 'Hydravelvet Matte Lipstick',
        shade_name: prod.shade_name || item.shade_name || '',
        quantity: item.quantity,
        price: Number(price),
      });

      // Update product inventory in PostgreSQL
      await client.query(
        `UPDATE products
         SET stock_quantity = GREATEST(0, stock_quantity - $1)
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query('COMMIT');

    // Asynchronously dispatch luxury React Email invoice via Next.js internal endpoint
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const emailSecret =
      process.env.EMAIL_SECRET ||
      process.env.BETTER_AUTH_SECRET ||
      'amore-secret-key-2026';

    const invoicePayload = {
      orderId: `AM-${orderId}`,
      customerName: resolvedName,
      customerEmail: resolvedEmail,
      totalAmount: createdOrder.total_amount,
      items: invoiceItems,
      purchaseDate: new Date(createdOrder.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    };

    fetch(`${frontendUrl}/api/emails/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-email-secret': emailSecret,
      },
      body: JSON.stringify(invoicePayload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text();
          console.warn('[Orders] Invoice dispatch warning response:', errText);
        } else {
          console.log(`[Orders] Luxury invoice successfully requested for order #${orderId}`);
        }
      })
      .catch((emailErr) => {
        console.warn('[Orders] Failed to reach invoice email route:', emailErr.message);
      });

    return res.status(201).json({
      success: true,
      order_id: createdOrder.id,
      order: {
        ...createdOrder,
        order_number: `AM-${createdOrder.id}`,
        items: insertedItems,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order Transaction Error:', error);
    return res.status(500).json({ error: 'Internal server error while placing order.' });
  } finally {
    client.release();
  }
});

// GET /api/orders/user/:userId - Retrieve all orders for a specific user ID with nested items
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const ordersResult = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const orders = ordersResult.rows;

    const itemsQuery = `
      SELECT oi.id, oi.order_id, oi.product_id, oi.quantity,
             oi.price_at_purchase, oi.price_at_purchase AS price,
             p.name AS product_name, p.sku AS product_sku,
             p.hex_code AS shade_hex, p.hex_code, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
    `;

    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemsResult = await pool.query(itemsQuery, [order.id]);
        return {
          ...order,
          items: itemsResult.rows,
        };
      })
    );

    return res.json({ orders: ordersWithItems });
  } catch (err) {
    console.error(`Error fetching orders for user ${req.params.userId}:`, err);
    return res.status(500).json({ error: 'Internal server error while fetching user orders.' });
  }
});

// GET /api/orders/:id - Retrieve order details by order ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    const order = orderResult.rows[0];

    if (!order) {
      return res.status(404).json({ error: `Order with ID ${id} not found.` });
    }

    const itemsResult = await pool.query(
      `SELECT oi.id, oi.order_id, oi.product_id, oi.quantity,
              oi.price_at_purchase, oi.price_at_purchase AS price,
              p.name AS product_name, p.sku AS product_sku,
              p.hex_code AS shade_hex, p.hex_code, p.image_url
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    return res.json({
      order: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (err) {
    console.error(`Error fetching order ${req.params.id}:`, err);
    return res.status(500).json({ error: 'Internal server error while fetching order.' });
  }
});

export default router;
