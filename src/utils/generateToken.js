const jwt = require("jsonwebtoken");

exports.generateToken = (userId) => {
  const payload = {
    userId,
  };
  return jwt.sign({ payload }, process.env.JWT_SECRET, {});
};
