const dns = require("dns");
const mongoose = require("mongoose");

// Kuch networks SRV DNS lookup block karte hain, isliye is process ke liye public DNS use karo
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    console.error(
      "Check karo: Atlas cluster chal raha hai, Network Access mein 0.0.0.0/0 hai, aur MONGO_URI sahi hai."
    );
    process.exit(1);
  }
};

module.exports = connectDB;