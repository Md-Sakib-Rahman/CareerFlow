const mongoose = require("mongoose");

const dbConnect = async () => {
  try {
    // No need for dotenv.config() here anymore
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`[SUCCESS] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[FAILED] Database Connection Error: ${error.message}`);
    // Exit process with failure if DB connection is critical
    process.exit(1);
  }
};

module.exports = dbConnect;