const dotenv = require("dotenv");
// 1. Load env vars first so they are available everywhere
dotenv.config();
const app = require("./src/app");
const dbConnect = require("./src/config/db");

// Replace with your MongoDB URI in .env file
const DB = process.env.MONGO_URL;

// DATABASE CONNECTION
dbConnect();

// START SERVER
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// const dotenv = require("dotenv");
// dotenv.config();

// const app = require("./src/app");

// const PORT = process.env.PORT || 8080;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });