const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { fileSizeFormatter } = require('../utils/fileUpload');
const cloudinary = require('cloudinary').v2;

const createProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;
  //validation
  if (!name || !category || !quantity || !price || !description) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  //Handle Image upload
  let fileData = {};
  if (req.file) {
    //Save the upoloaded image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: 'inventory management app',
        resource_type: 'image',
      });
    } catch (error) {
      res.status(500);
      throw new Error('Image could not be uploaded');
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  console.log(req.body);
  // Create Product
  const product = await Product.create({
    user: req.userId,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: fileData,
  });

  res.status(201).json(product);
});
//-----------------------------------------------------------------------------------------------------------------------
//Get all products
const getProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ user: req.userId }).sort('-createdAt');
  res.status(200).json(products);
});

//----------------------------------------------------------------------------------------------

//Get single product
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.user.toString() !== req.userId) {
    res.status(401);
    throw new Error('User not authorized to view this product');
  }
  res.status(200).json(product);
});

//-------------------------------------------------------------------------------------

//Delete product
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  //Match product to the user who created it
  if (product.user.toString() !== req.userId) {
    res.status(401);
    throw new Error('User not authorized to delete this product');
  }

  await product.remove();
  res.status(200).json({ message: 'Product deleted successfully!' });
});

//update product

const updateProduct = asyncHandler(async (req, res) => {
  const { name, sku, category, quantity, price, description } = req.body;
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  //Match product to the user who created it
  if (product.user.toString() !== req.userId) {
    res.status(401);
    throw new Error('User not authorized to delete this product');
  }

  //Handle Image upload
  let fileData = {};
  if (req.file) {
    //Save the upoloaded image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: 'inventory management app',
        resource_type: 'image',
      });
    } catch (error) {
      res.status(500);
      throw new Error('Image could not be uploaded');
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }

  // Update Product
  const updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },

    {
      name,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json(updatedProduct);
});

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
