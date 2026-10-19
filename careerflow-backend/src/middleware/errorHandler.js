const mongoose = require("mongoose");

// Maps Mongoose cast/validation errors to 400; everything else goes to Express' default handler.
const errorHandler = () => (err, req, res, next) => {
  if (err instanceof mongoose.Error.CastError || err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
};

module.exports = errorHandler;
