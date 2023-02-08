const express = require('express');
const protectRoute = require('../middlewares/authMiddleware');

const {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  loginStatus,
  updateUser,
  changePassword,
  forgotPassword,
} = require('../controllers/userController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/logout', logoutUser);
router.get('/getuser', protectRoute, getUser);
router.get('/loggedin', loginStatus);
router.patch('/updateuser', protectRoute, updateUser);
router.patch('/changepassword', protectRoute, changePassword);
router.post('/forgotpassword', forgotPassword);

module.exports = router;
