// Run this once to make a user an admin:
// node makeAdmin.js youremail@example.com
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const email = process.argv[2];

if (!email) {
  console.log('Usage: node makeAdmin.js <email>');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✓ Connected to MongoDB Atlas');

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log(`✗ No user found with email: ${email}`);
    } else {
      console.log(`✓ ${user.name} (${user.email}) is now an admin!`);
    }

    process.exit(0);
  })
  .catch((err) => {
    console.log('✗ Connection error:', err.message);
    process.exit(1);
  });
