// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Backend Cafe API!' });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Menu routes
app.use('/api/menu', menuRoutes);

// Order routes
app.use('/api/orders', orderRoutes);

// ==================== START SERVER ====================
// Define port (use environment variable or default to 5000)
const PORT = process.env.PORT || 5000;

// Start listening on the port
app.listen(PORT, () => {
  console.log(`🚀 Backend Cafe server is running on port ${PORT}`);
  console.log(`📝 Test the API: http://localhost:${PORT}`);
});
