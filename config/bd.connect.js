const mongoose = require("mongoose");

const connectedbd = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 30000,
    });
    console.log("data base connected");
  } catch (error) {
    console.log("dataase not connected");
    process.exit(1);
  }
};

module.exports = connectedbd;
