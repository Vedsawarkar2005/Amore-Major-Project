import express from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/ordersController.js';

const router = express.Router();

// POST /api/orders - Create an order and dispatch luxury React Email invoice
router.post('/', createOrder);

// GET /api/orders/user/:userId - Retrieve all orders for a specific user ID with nested items
router.get('/user/:userId', getUserOrders);

// GET /api/orders/:id - Retrieve order details by order ID
router.get('/:id', getOrderById);

export default router;
