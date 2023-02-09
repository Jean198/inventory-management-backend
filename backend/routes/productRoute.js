const express = require('express');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();
const { createProduct } = require('../controllers/productController');

router.post('/createproduct', protectRoute, createProduct);

module.exports = router;
