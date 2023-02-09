const express = require('express');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();
const { createProduct } = require('../controllers/productController');
const { upload } = require('../utils/fileUpload');

router.post(
  '/createproduct',
  protectRoute,
  upload.single('image'),
  createProduct
);

module.exports = router;
