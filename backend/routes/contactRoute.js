const express = require('express');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();
const protect = require('../middlewares/authMiddleware');
const { contactUs } = require('../controllers/contactController');

router.post('/', protectRoute, contactUs);

module.exports = router;
