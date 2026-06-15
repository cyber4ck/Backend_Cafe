const User = require('../models/User');
const Order = require('../models/Order');

// ==================== GET ALL USERS (ADMIN ONLY) ====================
exports.getAllUsers = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view users.' });
    }

    // Exclude password field
    const users = await User.find().select('-password');

    res.json({
      message: 'Users fetched successfully!',
      users,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users: ' + error.message });
  }
};

// ==================== GET A SPECIFIC USER'S ORDERS (ADMIN ONLY) ====================
exports.getUserOrders = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view user orders.' });
    }

    const { id } = req.params;

    const orders = await Order.find({ user: id })
      .populate('items.menuItem', 'name price')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Orders fetched successfully!',
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders: ' + error.message });
  }
};

// ==================== SEND MESSAGE TO USER (ADMIN ONLY) ====================
exports.sendMessageToUser = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admins can send messages.' });
    }

    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required.' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.messages.push({ text: text.trim(), from: 'admin' });
    await user.save();

    res.json({ message: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending message: ' + error.message });
  }
};

// ==================== GET MY MESSAGES (LOGGED IN USER) ====================
exports.getMyMessages = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('messages');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({
      message: 'Messages fetched successfully!',
      messages: user.messages || [],
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages: ' + error.message });
  }
};

// ==================== MARK MY MESSAGES AS READ (LOGGED IN USER) ====================
exports.markMessagesRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.userId },
      { $set: { 'messages.$[].read': true } }
    );

    res.json({ message: 'Messages marked as read.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating messages: ' + error.message });
  }
};
