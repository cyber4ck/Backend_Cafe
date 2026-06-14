// Run this once to populate sample menu items: node seedMenu.js
const mongoose = require('mongoose');
require('dotenv').config();
const MenuItem = require('./models/MenuItem');

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

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✓ Connected to MongoDB Atlas');

    const count = await MenuItem.countDocuments();
    if (count > 0) {
      console.log(`Menu already has ${count} items. Skipping seed to avoid duplicates.`);
      console.log('If you want to re-seed, delete existing items from Atlas first.');
    } else {
      await MenuItem.insertMany(sampleItems);
      console.log(`✓ Inserted ${sampleItems.length} menu items successfully!`);
    }

    process.exit(0);
  })
  .catch((err) => {
    console.log('✗ Connection error:', err.message);
    process.exit(1);
  });
