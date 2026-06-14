// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Initialize Express app
const app = express();

// ==================== MIDDLEWARE ====================
// Allow requests from other domains (important for frontend)
app.use(cors());

// Parse incoming JSON data
app.use(express.json());

// ==================== DATABASE CONNECTION ====================
// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✓ Connected to MongoDB Atlas successfully!');
})
.catch((error) => {
  console.log('✗ MongoDB connection error:', error.message);
  console.log('⚠ Server will keep running, but DB-dependent routes will fail until MongoDB connects.');
  console.log('⚠ Check: 1) connection string uses mongodb+srv://  2) your IP is whitelisted in MongoDB Atlas Network Access.');
});

// ==================== ROUTES ====================
// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Auth routes
app.use('/api/auth', authRoutes);

// Menu routes
app.use('/api/menu', menuRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// Fallback to index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});


// ==================== TEMPORARY SETUP ROUTES (REMOVE AFTER USE) ====================
const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const SETUP_KEY = 'cafe-setup-2026'; // change this to something only you know

// One-time: seed menu items
app.get('/setup/seed-menu', async (req, res) => {
  if (req.query.key !== SETUP_KEY) return res.status(403).json({ message: 'Invalid key' });
  try {
    const count = await MenuItem.countDocuments();
    if (count > 0) return res.json({ message: `Menu already has ${count} items. Skipped.` });

    const sampleItems = [
      { name: 'Cappuccino', description: 'Creamy espresso with velvety steamed milk foam', price: 250, category: 'coffee', image: '' },
      { name: 'Double Espresso', description: 'Pure, bold, and straight to the point', price: 150, category: 'coffee', image: '' },
      { name: 'Caramel Latte', description: 'Sweet caramel notes with creamy texture', price: 280, category: 'coffee', image: '' },
      { name: 'Cold Brew', description: 'Smooth, refreshing and coding-approved', price: 200, category: 'beverages', image: '' },
      { name: 'Americano', description: 'Classic espresso diluted with hot water', price: 180, category: 'coffee', image: '' },
      { name: 'Mocha', description: 'Espresso with chocolate and steamed milk', price: 290, category: 'coffee', image: '' },
      { name: 'Croissant', description: 'Buttery, flaky, freshly baked', price: 120, category: 'snacks', image: '' },
      { name: 'Blueberry Muffin', description: 'Soft muffin loaded with blueberries', price: 140, category: 'desserts', image: '' },
      { name: 'Club Sandwich', description: 'Grilled sandwich with veggies and cheese', price: 220, category: 'meals', image: '' },
      { name: 'Iced Tea', description: 'Refreshing chilled tea with lemon', price: 160, category: 'beverages', image: '' },
    ];
    await MenuItem.insertMany(sampleItems);
    res.json({ message: `Inserted ${sampleItems.length} menu items!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// One-time: make a user admin by email
app.get('/setup/make-admin', async (req, res) => {
  if (req.query.key !== SETUP_KEY) return res.status(403).json({ message: 'Invalid key' });
  try {
    const email = req.query.email;
    if (!email) return res.status(400).json({ message: 'Pass ?email=... in the URL' });

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: `No user found with email ${email}` });
    res.json({ message: `${user.name} (${user.email}) is now admin!` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== START SERVER ====================
// Define port (use environment variable or default to 5000)
const PORT = process.env.PORT || 5000;

// Start listening on the port
app.listen(PORT, () => {
  console.log(`🚀 Backend Cafe server is running on port ${PORT}`);
  console.log(`📝 Test the API: http://localhost:${PORT}`);
});
