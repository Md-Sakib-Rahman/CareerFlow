const mongoose = require("mongoose");

const isObjectId = (value) =>
  typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value) && mongoose.isValidObjectId(value);

// router.param handler: rejects malformed ObjectIds in route params with 400.
const validateObjectIdParam = (req, res, next, value) => {
  if (!isObjectId(value)) return res.status(400).json({ success: false, message: "Invalid id" });
  next();
};

module.exports = { isObjectId, validateObjectIdParam };
