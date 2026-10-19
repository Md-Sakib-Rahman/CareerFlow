const dotenv = require("dotenv");
// 1. Load env vars first so they are available everywhere
dotenv.config();
const app = require("./src/app");
const dbConnect = require("./src/config/db");

// DATABASE CONNECTION
dbConnect().catch((err) => {
  console.error("Database connection failed:", err.message);
  process.exit(1);
});

// START SERVER
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
