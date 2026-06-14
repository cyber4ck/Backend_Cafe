const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri.replace(/:[^:@]+@/, ':****@'));

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 15000,
  family: 4
})
  .then(() => {
    console.log('✓ SUCCESS - Connected!');
    process.exit(0);
  })
  .catch((err) => {
    console.log('✗ FAILED:', err.message);
    console.log('Full error:', err);
    process.exit(1);
  });