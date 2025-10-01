
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, index: true },
  isNewArrival: { type: Boolean, default: false },
  sizes: [
    { size: String, price: Number }
  ],
  variants: [
    { size: String, stock: { type: Number, default: 0 }, price: Number }
  ],
  image: { type: String },
  stock: { type: Number, required: true, default: 0 },
  inStock: { type: Boolean, default: true },
  ratings: [
    { stars: Number, comment: String, name: String, date: { type: Date, default: Date.now } }
  ],
  rating: { type: Number, default: 0 },
  addedByAdmin: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// Virtual property to check if product is out of stock
productSchema.virtual('isOutOfStock').get(function () {
  if (this.variants && this.variants.length > 0) {
    return this.variants.every(v => v.stock === 0);
  }
  // Fallback for older products without variants
  return !this.inStock;
});

// Ensure virtuals are included in JSON and Object outputs
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
