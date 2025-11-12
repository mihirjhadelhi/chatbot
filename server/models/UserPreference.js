const mongoose = require('mongoose');

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  savedProperties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  searchHistory: [{
    budget: Number,
    location: String,
    bedrooms: Number,
    bathrooms: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  preferences: {
    minBudget: Number,
    maxBudget: Number,
    preferredLocations: [String],
    minBedrooms: Number,
    minBathrooms: Number,
    requiredAmenities: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('UserPreference', userPreferenceSchema);