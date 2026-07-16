const mongoose = require("mongoose");

const connectedbd = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 30000,
    });

    console.log("Database Connected");
  } catch (error) {
    console.log("Database not connected");
    console.error("Error:", error.message);
    console.error(error);
    // process.exit(1);  // abhi comment kar do
  }
};

module.exports = connectedbd;
