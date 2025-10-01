const express = require('express');
const router = express.Router();
const BestPick = require('../models/BestPick');
const multer = require('multer');
const Product = require('../models/Product'); // Import the Product model
const { protect, admin } = require('../middleware/authMiddleware.js');
const path = require('path');

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

// GET all best picks
// GET a single best pick by ID
router.get('/:id', async (req, res) => {
  try {
    const pick = await BestPick.findById(req.params.id);
    if (!pick) return res.status(404).json({ error: 'Best pick not found' });
    res.status(200).json(pick);
  } catch (err) {
    console.error("Error fetching best pick by ID:", err);
    res.status(500).json({ error: 'Failed to fetch best pick' });
  }
});
router.get('/', async (req, res) => {
  try {
    const picks = await BestPick.find().sort({ createdAt: -1 }).lean();
    // Ensure best picks are always considered in stock on the frontend
    picks.forEach(pick => { pick.inStock = true; });
    res.status(200).json(picks);
  } catch (err) {
    console.error("Error fetching best picks:", err);
    res.status(500).json({ error: 'Failed to fetch best picks' });
  }
});

// POST a new best pick (with image upload)
router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, description, category } = req.body;
    let image = '';
    if (req.file) {
      image = '/images/' + req.file.filename;
    } else if (req.body.image) {
      image = req.body.image;
    }
    const newPick = new BestPick({ name, image, price, description, category });
    await newPick.save();

    // Also create a corresponding Product entry
    const productExists = await Product.findOne({ name: name });
    if (!productExists) {
      const variants = ['S', 'M', 'L', 'XL'].map(size => ({ size, stock: 10 })); // Default stock
      const newProduct = new Product({
        name, price, description, category, image, variants, isNewArrival: true, inStock: true
      });
      await newProduct.save();
      // Optionally, you can dispatch an event here if your frontend uses it
    }

    res.status(201).json(newPick);
  } catch (err) {
    console.error("Error saving best pick:", err);
    res.status(500).json({ error: 'Failed to save best pick' });
  }
});


// DELETE a best pick by ID
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const result = await BestPick.findByIdAndDelete(req.params.id);
    if (result) {
      // Also delete the corresponding product if it exists
      await Product.deleteOne({ name: result.name });
    }
    if (!result) return res.status(404).json({ error: 'Best pick not found' });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting best pick:", err);
    res.status(500).json({ error: 'Failed to delete best pick' });
  }
});

module.exports = router;
