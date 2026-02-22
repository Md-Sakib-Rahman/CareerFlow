const jwt = require("jsonwebtoken");

const generateTokens = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    plan: user.plan,
  };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "50m",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

module.exports = generateTokens;
