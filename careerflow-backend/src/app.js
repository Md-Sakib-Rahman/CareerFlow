const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes= require('./routes/authRoutes')

//  GLOBAL MIDDLEWARE
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Body parser for JSON
app.use(cookieParser());
//  ROUTES
// Replace these with your actual route files for CareerFlow 

// example: app.use("/auth", authRoutes)

app.use("/auth", authRoutes)

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Welcome to the CareerFlow API'
    });
});




module.exports = app;