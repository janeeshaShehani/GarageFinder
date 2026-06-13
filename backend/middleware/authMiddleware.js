const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  next();
};

module.exports = { protect };