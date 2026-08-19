const mongoose = require("mongoose");

const connectedbd = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb+srv://kapilk:kapil123@cluster0.zd4jead.mongodb.net/School_data?appName=Cluster0";
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 300000,
      connectTimeoutMS: 30000,
      family: 4,
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
