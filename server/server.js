const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const Property = require('./models/Property');
const UserPreference = require('./models/UserPreference');
const nlpService = require('./services/nlpService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes

// Get all properties with filters
app.get('/api/properties', async (req, res) => {
  try {
    const { 
      budget, 
      location, 
      bedrooms, 
      bathrooms, 
      minSize, 
      maxSize,
      amenities 
    } = req.query;

    // Build filter object
    const filter = {};

    if (bedrooms) {
      filter.bedrooms = { $gte: parseInt(bedrooms) };
    }

    if (bathrooms) {
      filter.bathrooms = { $gte: parseInt(bathrooms) };
    }

    if (location && location !== 'any') {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (budget) {
      filter.price = { $lte: parseInt(budget) };
    }

    if (minSize) {
      filter.size_sqft = { ...filter.size_sqft, $gte: parseInt(minSize) };
    }

    if (maxSize) {
      filter.size_sqft = { ...filter.size_sqft, $lte: parseInt(maxSize) };
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      filter.amenities = { $in: amenityList };
    }

    const properties = await Property.find(filter).limit(50);
    res.json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get single property by ID
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await Property.findOne({ id: parseInt(req.params.id) });
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }
    res.json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save user preferences
app.post('/api/preferences', async (req, res) => {
  try {
    const { userId, savedProperties, preferences, searchHistory } = req.body;

    let userPref = await UserPreference.findOne({ userId });

    if (userPref) {
      // Update existing preferences
      if (savedProperties) {
        userPref.savedProperties = savedProperties;
      }
      if (preferences) {
        userPref.preferences = { ...userPref.preferences, ...preferences };
      }
      if (searchHistory) {
        userPref.searchHistory.push(searchHistory);
      }
      await userPref.save();
    } else {
      // Create new preferences
      userPref = await UserPreference.create({
        userId,
        savedProperties: savedProperties || [],
        preferences: preferences || {},
        searchHistory: searchHistory ? [searchHistory] : []
      });
    }

    res.json({ success: true, data: userPref });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user preferences
app.get('/api/preferences/:userId', async (req, res) => {
  try {
    const userPref = await UserPreference.findOne({ userId: req.params.userId })
      .populate('savedProperties');
    
    if (!userPref) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: userPref });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save a property to user's favorites
app.post('/api/preferences/:userId/save', async (req, res) => {
  try {
    const { propertyId } = req.body;
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ success: false, error: 'Property not found' });
    }

    let userPref = await UserPreference.findOne({ userId: req.params.userId });

    if (!userPref) {
      userPref = await UserPreference.create({
        userId: req.params.userId,
        savedProperties: [property._id]
      });
    } else {
      if (!userPref.savedProperties.includes(property._id)) {
        userPref.savedProperties.push(property._id);
        await userPref.save();
      }
    }

    res.json({ success: true, data: userPref });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Remove a property from favorites
app.delete('/api/preferences/:userId/save/:propertyId', async (req, res) => {
  try {
    const userPref = await UserPreference.findOne({ userId: req.params.userId });

    if (userPref) {
      userPref.savedProperties = userPref.savedProperties.filter(
        id => id.toString() !== req.params.propertyId
      );
      await userPref.save();
    }

    res.json({ success: true, data: userPref });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});


// ... existing code ...

// NLP endpoint - Extract filters from natural language
app.post('/api/nlp/extract', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const filters = await nlpService.extractFiltersFromText(message, conversationHistory || []);
    res.json({ success: true, data: filters });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// NLP endpoint - Generate chatbot response
app.post('/api/nlp/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const response = await nlpService.generateChatResponse(message, context || {});
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});