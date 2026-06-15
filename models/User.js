const mongoose = require('mongoose');

// Define User Schema (structure of user data)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have same email
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // Can only be 'user' or 'admin'
    default: 'user',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  messages: [
    {
      text: { type: String, required: true },
      from: { type: String, default: 'admin' },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Create and export User model
module.exports = mongoose.model('User', userSchema);
