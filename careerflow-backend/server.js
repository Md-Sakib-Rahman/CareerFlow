const dotenv = require('dotenv');
// 1. Load env vars first so they are available everywhere
dotenv.config();
const app = require('./src/app');
const dbConnect = require('./src/config/db');

// Replace with your MongoDB URI in .env file
const DB = process.env.MONGO_URL;

// DATABASE CONNECTION
dbConnect()

// START SERVER
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}...`);
});

