const mongoose = require('mongoose');

const BestPickSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // url or path
  price: { type: Number, required: true },
  description: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BestPick', BestPickSchema);
