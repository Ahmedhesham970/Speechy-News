const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const signToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

module.exports = signToken;
