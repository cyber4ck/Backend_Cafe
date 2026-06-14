const express = require('express');
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/menu - Get all menu items (public, no login needed)
router.get('/', menuController.getAllMenuItems);

// GET /api/menu/:id - Get single menu item (public)
router.get('/:id', menuController.getMenuItemById);

// POST /api/menu - Add new menu item (admin only, requires login)
router.post('/', authMiddleware, menuController.addMenuItem);

// PUT /api/menu/:id - Update menu item (admin only, requires login)
router.put('/:id', authMiddleware, menuController.updateMenuItem);

// DELETE /api/menu/:id - Delete menu item (admin only, requires login)
router.delete('/:id', authMiddleware, menuController.deleteMenuItem);

module.exports = router;
