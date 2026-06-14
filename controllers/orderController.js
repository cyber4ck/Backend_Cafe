const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');

// ==================== CREATE NEW ORDER ====================
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress } = req.body;
    const userId = req.userId; // From authMiddleware

    // Validate input
    if (!items || items.length === 0 || !deliveryAddress) {
      return res.status(400).json({ message: 'Items and delivery address are required.' });
    }

    let totalPrice = 0;
    const orderItems = [];

    // Validate each item and calculate total price
    for (let item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);

      if (!menuItem) {
        return res.status(404).json({ message: `Menu item ${item.menuItemId} not found.` });
      }

      if (!menuItem.available) {
        return res.status(400).json({ message: `${menuItem.name} is not available.` });
      }

      const itemTotal = menuItem.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
        price: menuItem.price,
      });
    }

    // Create new order
    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalPrice,
      deliveryAddress,
    });

    // Save order to database
    await newOrder.save();

    res.status(201).json({
      message: 'Order created successfully!',
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order: ' + error.message });
  }
};

// ==================== GET USER'S ORDERS ====================
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId; // From authMiddleware

    // Find all orders for this user
    const orders = await Order.find({ user: userId })
      .populate('items.menuItem') // Get full menu item details
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      message: 'User orders fetched successfully!',
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders: ' + error.message });
  }
};

// ==================== GET ALL ORDERS (ADMIN ONLY) ====================
exports.getAllOrders = async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view all orders.' });
    }

    // Get all orders with user and menu item details
    const orders = await Order.find()
      .populate('user', 'name email') // Get user name and email
      .populate('items.menuItem', 'name price') // Get menu item name and price
      .sort({ createdAt: -1 }); // Newest first

    res.json({
      message: 'All orders fetched successfully!',
      orders: orders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders: ' + error.message });
  }
};

// ==================== GET SINGLE ORDER ====================
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findById(id)
      .populate('items.menuItem')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check if user owns this order or is admin
    if (order.user._id.toString() !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to view this order.' });
    }

    res.json({
      message: 'Order fetched successfully!',
      order: order,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order: ' + error.message });
  }
};

// ==================== UPDATE ORDER STATUS (ADMIN ONLY) ====================
exports.updateOrderStatus = async (req, res) => {
  try {
    // Check if user is admin
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update order status.' });
    }

    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'preparing', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status.' });
    }

    // Find and update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: Date.now() },
      { new: true }
    ).populate('items.menuItem');

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    res.json({
      message: 'Order status updated successfully!',
      order: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order: ' + error.message });
  }
};

// ==================== CANCEL ORDER (USER OR ADMIN) ====================
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to cancel this order.' });
    }

    // Only pending orders can be cancelled
    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled.' });
    }

    // Update status to cancelled
    const cancelledOrder = await Order.findByIdAndUpdate(
      id,
      { status: 'cancelled', updatedAt: Date.now() },
      { new: true }
    ).populate('items.menuItem');

    res.json({
      message: 'Order cancelled successfully!',
      order: cancelledOrder,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling order: ' + error.message });
  }
};
