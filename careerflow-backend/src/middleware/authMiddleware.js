const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // 1. Check if header exists
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // 2. Attempt to verify
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      
      req.user = decoded;
      return next();
    } catch (error) {
      console.error(`[MIDDLEWARE ERROR] JWT Verification Failed:`, error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token failed or expired", error: error.message });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
