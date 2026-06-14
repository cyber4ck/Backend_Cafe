const MenuItem = require('../models/MenuItem');

// ==================== GET ALL MENU ITEMS ====================
// Anyone can see the menu (public route)
exports.getAllMenuItems = async (req, res) => {
  try {
    // Admins (with valid token) can see all items including unavailable ones
    let filter = { available: true };
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
          filter = {};
        }
      } catch (e) {
        // invalid token, ignore and show only available items
      }
    }
    const menuItems = await MenuItem.find(filter);

    res.json({
      message: 'Menu items fetched successfully!',
      items: menuItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu: ' + error.message });
  }
};

// ==================== GET SINGLE MENU ITEM ====================
exports.getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    res.json({
      message: 'Menu item fetched successfully!',
      item: menuItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching menu item: ' + error.message });
  }
};

// ==================== ADD NEW MENU ITEM (ADMIN ONLY) ====================
exports.addMenuItem = async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can add menu items.' });
    }

    const { name, description, price, category, image } = req.body;

    // Validate input
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create new menu item
    const newMenuItem = new MenuItem({
      name,
      description,
      price,
      category,
      image,
    });

    // Save to database
    await newMenuItem.save();

    res.status(201).json({
      message: 'Menu item added successfully!',
      item: newMenuItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding menu item: ' + error.message });
  }
};

// ==================== UPDATE MENU ITEM (ADMIN ONLY) ====================
exports.updateMenuItem = async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update menu items.' });
    }

    const { id } = req.params;
    const { name, description, price, category, image, available } = req.body;

    // Find and update menu item
    const updatedItem = await MenuItem.findByIdAndUpdate(
      id,
      { name, description, price, category, image, available },
      { new: true } // Returns updated item
    );

    if (!updatedItem) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    res.json({
      message: 'Menu item updated successfully!',
      item: updatedItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating menu item: ' + error.message });
  }
};

// ==================== DELETE MENU ITEM (ADMIN ONLY) ====================
exports.deleteMenuItem = async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete menu items.' });
    }

    const { id } = req.params;

    // Find and delete menu item
    const deletedItem = await MenuItem.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: 'Menu item not found.' });
    }

    res.json({
      message: 'Menu item deleted successfully!',
      item: deletedItem,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting menu item: ' + error.message });
  }
};
