const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  bedrooms: Number,
  bathrooms: Number,
  size_sqft: Number,
  amenities: [String],
  image_url: String,
  // Additional fields for filtering
  location: { type: String, default: 'Unknown' },
  price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);