// config/db.connect.js
const mongoose = require("mongoose");

let cached = global.mongooseConnection;

if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

const connectedbd = async () => {
  if (cached.conn) {
    return cached.conn; // already connected, reuse
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 300000,
        connectTimeoutMS: 30000,
        bufferCommands: false, // buffering off - turant error dega agar not connected
      })
      .then((mongooseInstance) => {
        console.log("Database Connected");
        return mongooseInstance;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectedbd;
