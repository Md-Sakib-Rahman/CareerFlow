const mongoose = require("mongoose");

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected, skip!
  }

  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("MongoDB Connected for Serverless!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    throw error;
  }
};

module.exports = connectDB;