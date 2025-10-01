const express = require('express');
const Order = require('../models/Order'); // This was missing in the provided context, but should be here.
const Product = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware.js');
const router = express.Router();

// Place order (new schema)
router.post('/', protect, async (req, res) => {
  try {
    console.log('Received order:', req.body);
    const { items, customer, total } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }
    if (!customer || !customer.name || !customer.email || !customer.address) {
      return res.status(400).json({ message: 'Customer information is incomplete' });
    }
    
    // Create the order without stock reduction
    const userId = req.user._id;
    const order = new Order({ ...req.body, userId, status: 'Pending' });
    await order.save();
    res.status(201).json({ success: true, orderId: order._id, message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order: ' + error.message });
  }
});


// Get my orders (user)
router.get('/my', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Decoded userId from token:', userId);
    // Find orders by userId
    const orders = await Order.find({ userId });
    console.log('Orders found for user:', orders);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all orders (admin)
router.get('/', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Invalid request' });
  }
});

// Update order status (admin)
router.patch('/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Invalid request' });
  }
});

// Dedicated confirm endpoint for environments that block PATCH/PUT
router.post('/:id/confirm', protect, admin, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'Confirmed' },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Invalid request' });
  }
});


// Delete order by ID (admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Order not found' });
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

module.exports = router;
