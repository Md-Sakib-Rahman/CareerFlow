const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // 1. Check if header exists
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(`\n[MIDDLEWARE] Token received from frontend.`);

      // 2. Attempt to verify
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      console.log(`[MIDDLEWARE] Token verified successfully. Payload ID:`, decoded.id || decoded._id || "MISSING ID");
      
      req.user = decoded;
      return next();
    } catch (error) {
      console.error(`[MIDDLEWARE ERROR] JWT Verification Failed:`, error.message);
      return res.status(401).json({ success: false, message: "Not authorized, token failed or expired", error: error.message });
    }
  }

  if (!token) {
    console.log(`[MIDDLEWARE ERROR] No Authorization header found in the request.`);
    return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
  }
};

module.exports = { protect };
// const jwt = require("jsonwebtoken");

// const protect =  (req, res, next) => {
//   let token;

//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];

//       const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//       req.user = decoded;

//      return next();
//     } catch (error) {
//       return res
//         .status(401)
//         .json({ success: false, message: "Not authorized, token failed or expired" });
//     }
//   }

//   if (!token) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Not authorized, no token provided" });
//   }
// };

// module.exports = { protect };
