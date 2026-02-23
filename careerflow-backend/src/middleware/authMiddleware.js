const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // ১. check the authorization header for a Bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // ২. token verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // 3 user data request object send (without passwordHash)
      req.user = await User.findById(decoded.id).select("-passwordHash");

      next(); // All okay then going to next function (Controller)
    } catch (error) {
      res
        .status(401)
        .json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }
};

module.exports = { protect };
