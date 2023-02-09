const User = require('../models/userModel');
const Token = require('../models/tokenModel');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

//-------------------------------------------------------------------------------------

//Register user
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  //Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be atleast to 6 characters');
  }

  //Check if user already exists
  const userExist = await User.findOne({ email });
  if (userExist) {
    res.status(400);
    throw new Error('Email has already been used');
  }

  //Create new user
  const user = await User.create({
    name: name,
    email: email,
    password: password,
  });

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      id: _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

//--------------------------------------------------------------------------------------------------------

//Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  //Validate request
  if (!email || !password) {
    res.status(400);
    throw new Error('Both email and password are required!');
    //Check if the user exist
  }
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error('Incorrect email or Password');
  }

  //If user found, check if password is correct!
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  if (user && passwordIsCorrect) {
    // Generate Token
    const token = generateToken(user._id);

    //Send Http-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 86400),
      sameSite: 'none',
    });
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      id: _id,
      name,
      email,
      photo,
      phone,
      bio,
      token,
    });
  } else {
    res.status(400);
    throw new Error('Incorrect email or Password');
  }
});

//-----------------------------------------------------------------------------------------------------------------------

// Logout user
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
  });

  res.status(200).json({ message: 'User logout succesfully!' });
});

//-----------------------------------------------------------------------------------------------------------------------

//Get user data

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId); // from the authMiddleware
  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    res.status(201).json({
      id: _id,
      name,
      email,
      photo,
      phone,
      bio,
    });
  } else {
    res.status(404);
    throw new Error('Not found!');
  }
});

//-----------------------------------------------------------------------------------------------------------

//Get login status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }

  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true);
  }
  return res.json(false);
});

//-------------------------------------------------------------------------------------------------------------------------

//Update User
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId); // from the authMiddleware

  if (user) {
    const { _id, name, email, photo, phone, bio } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;

    const updatedUser = await user.save();

    res.status(201).json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      photo: updatedUser.photo,
      phone: updatedUser.phone,
      bio: updatedUser.bio,
    });
  } else {
    res.status(404);
    throw new Error('User Not found!');
  }
});

//-------------------------------------------------------------------------------------------------------

//Change password

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);

  if (!user) {
    res.status(400);
    throw new Error('You need to login before you make changes');
  }

  const { oldPassword, newPassword } = req.body;
  //validate
  if (!oldPassword || !newPassword) {
    res.status(400);
    throw new Error('Both fields are required!');
  }

  //Check if oldPassword matches the one in the database

  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

  //Save new password.
  if (user && passwordIsCorrect) {
    user.password = newPassword;
    await user.save();
    res.status(200).send('Password changed succesfully!');
  } else {
    res.status(400);
    throw new Error('Incorrect old password');
  }
});

//--------------------------------------------------------------------------

//Forgot password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error('User does not exist');
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) {
    await token.deleteOne();
  }

  //create reset token

  let resetToken = crypto.randomBytes(32).toString('hex') + user._id;
  //Hash token before saving it to the database

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //Save hashed token to database

  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000), //Thirty minutes
  }).save();

  //construct reset Url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

  //COnstruct reset email
  const message = `<h2>Hello ${user.name}</h2>
  <p>Please use the url below to reset your password</p>
  <p>This reset link is valid for only 30 minutes</p>
  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
  <p>Regards,</p>
  <p> <b>Jean's Code</b> team</p>
  `;

  const subject = 'Password reset request';
  const send_to = user.email;
  const sent_from = process.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from);
    res.status(200).json({ success: true, message: 'Reset email sent' });
  } catch {
    res.status(500);
    throw new Error('Email not sent, please try again');
  }
});

//------------------------------------------------------------------------------------------------------

//Reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  //Has token and compare it it its hashed version in the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  //FInd token in database
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    res.status(404);
    throw new Error('Invalid or Expired token');
  }

  //Find User
  const user = await User.findOne({ _id: userToken.userId });
  user.password = password;
  await user.save();
  res.status(200).json({
    message: 'Password reset successful, Please login',
  });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
