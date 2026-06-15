const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/admin/users - Get all users (admin only)
router.get('/users', authMiddleware, adminController.getAllUsers);

// GET /api/admin/users/:id/orders - Get a specific user's orders (admin only)
router.get('/users/:id/orders', authMiddleware, adminController.getUserOrders);

// POST /api/admin/users/:id/message - Send a message to a user (admin only)
router.post('/users/:id/message', authMiddleware, adminController.sendMessageToUser);

// GET /api/admin/messages - Get my own messages (any logged in user)
router.get('/messages', authMiddleware, adminController.getMyMessages);

// PUT /api/admin/messages/read - Mark my messages as read (any logged in user)
router.put('/messages/read', authMiddleware, adminController.markMessagesRead);

module.exports = router;
