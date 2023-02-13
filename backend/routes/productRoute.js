const express = require('express');
const protectRoute = require('../middlewares/authMiddleware');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
} = require('../controllers/productController');
const { upload } = require('../utils/fileUpload');

router.post(
  '/createproduct',
  protectRoute,
  upload.single('image'),
  createProduct
);

router.get('/getproducts', protectRoute, getProducts);
router.get('/getproduct/:id', protectRoute, getProduct);
router.delete('/deleteproduct/:id', protectRoute, deleteProduct);
router.patch('/updateproduct/:id', protectRoute, updateProduct);

module.exports = router;
