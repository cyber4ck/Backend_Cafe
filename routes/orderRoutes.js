const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/orders - Create new order (user must be logged in)
router.post('/', authMiddleware, orderController.createOrder);

// GET /api/orders/myorders - Get logged in user's orders
router.get('/myorders', authMiddleware, orderController.getUserOrders);

// GET /api/orders - Get all orders (admin only)
router.get('/', authMiddleware, orderController.getAllOrders);

// GET /api/orders/:id - Get single order by ID
router.get('/:id', authMiddleware, orderController.getOrderById);

// PUT /api/orders/:id - Update order status (admin only)
router.put('/:id', authMiddleware, orderController.updateOrderStatus);

// PUT /api/orders/:id/cancel - Cancel order
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router;
