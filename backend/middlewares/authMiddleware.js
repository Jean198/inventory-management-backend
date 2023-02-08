const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const protectRoute = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401);
    throw new Error('Not authorised, please login!');
  }

  //Verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);

  //Get user id from token
  const user = await User.findById(verified.id).select('-password');
  if (!user) {
    res.status(401);
    throw new Error('User not found!');
  }
  req.userId = verified.id;

  next();
});

module.exports = protectRoute;
