// Sends a 400 and returns true if any listed field is present but not a string.
const rejectNonStrings = (res, source, fields) => {
  const bad = fields.find((f) => source[f] !== undefined && typeof source[f] !== "string");
  if (!bad) return false;
  res.status(400).json({ success: false, message: `${bad} must be a string` });
  return true;
};

module.exports = { rejectNonStrings };
