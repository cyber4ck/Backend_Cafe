const mongoose = require('mongoose');

// Define MenuItem Schema (structure of menu item data)
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['coffee', 'snacks', 'meals', 'desserts', 'beverages'],
    required: true,
  },
  image: {
    type: String, // URL or file path
    default: '',
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export MenuItem model
module.exports = mongoose.model('MenuItem', menuItemSchema);
