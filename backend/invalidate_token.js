require('dotenv').config();
const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./models/user');

async function invalidateToken() {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB successfully.');

    const email = 'anujcarder@gmail.com';
    const randomString = crypto.randomBytes(32).toString('hex'); // Generate random string

    // Find user and update accessToken
    const user = await User.findOneAndUpdate(
      { Email: email },
      { accessToken: randomString },
      { new: true }
    );

    if (user) {
      console.log(`✅ Successfully invalidated access token for: ${email}`);
      console.log(`New random token: ${user.accessToken}`);
    } else {
      console.log(`❌ User not found with email: ${email}`);
    }
  } catch (error) {
    console.error('Error during token invalidation:', error);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Disconnected from DB.');
  }
}

invalidateToken();
