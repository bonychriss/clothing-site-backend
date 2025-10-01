const express = require('express');
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

const BestPick = require('../models/BestPick'); // Import BestPick model
const router = express.Router();
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../client/public/images'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});
const upload = multer({ storage });

// Get all products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Add new product (with image upload)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, description, variants } = req.body;
    let imagePath = '';
    if (req.file) {
      imagePath = '/images/' + req.file.filename;

      // Create a low-quality image placeholder (LQIP)
      const lqipPath = path.join(__dirname, '../../client/public/images', `lqip-${req.file.filename}`);
      await sharp(req.file.path)
        .resize(20) // Resize to a small width
        .blur(2)   // Apply a slight blur
        .toFile(lqipPath);

    } else if (req.body.image) {
      imagePath = req.body.image;
    }
    const productData = { name, price, category, image: imagePath, description, isNewArrival: true };
    if (variants) {
      productData.variants = JSON.parse(variants);
    }
    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    console.error('Product upload error:', err);
    if (req.file) {
      console.error('File info:', req.file);
    }
    if (req.body) {
      console.error('Body:', req.body);
    }
    res.status(400).json({ message: err.message });
  }
});

// Toggle stock status
router.patch('/:id/stock', protect, admin, async (req, res) => {
  try {
    const { inStock } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.inStock = inStock;
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error while updating stock status.' });
  }
});

// Update product by ID (with image upload)
router.put('/:id', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, description, variants } = req.body;
    const updateData = { ...req.body };

    if (variants && typeof variants === 'string') {
      updateData.variants = JSON.parse(variants);
    }

    if (req.file) {
      const imagePath = '/images/' + req.file.filename;
      updateData.image = imagePath;

      // Create a low-quality image placeholder (LQIP) for the new image
      const lqipPath = path.join(__dirname, '../../client/public/images', `lqip-${req.file.filename}`);
      await sharp(req.file.path)
        .resize(20) // Resize to a small width
        .blur(2)   // Apply a slight blur
        .toFile(lqipPath);
    }
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
});

// Delete product by ID
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
