const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection string (update this in your .env file)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/propertydb';

// Property Schema
const propertySchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  bedrooms: Number,
  bathrooms: Number,
  size_sqft: Number,
  amenities: [String],
  image_url: String
});

const Property = mongoose.model('Property', propertySchema);

// Function to read all JSON files from data folder
function readAllJsonFiles(dataFolder) {
  const files = fs.readdirSync(dataFolder);
  const jsonFiles = files.filter(file => file.endsWith('.json'));
  const allData = {};

  jsonFiles.forEach(file => {
    const filePath = path.join(dataFolder, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    console.log(`Reading ${file}: ${jsonData.length || 'N/A'} records`);
    
    // Process each record in the JSON array
    if (Array.isArray(jsonData)) {
      jsonData.forEach(item => {
        const id = item.id;
        if (!allData[id]) {
          allData[id] = {};
        }
        // Merge all properties from this item
        Object.assign(allData[id], item);
      });
    }
  });

  return Object.values(allData);
}

// Main function to import data
async function importData() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Read and merge all JSON files
    const dataFolder = path.join(__dirname, '..', 'data');
    console.log(`Reading JSON files from: ${dataFolder}`);
    
    const mergedData = readAllJsonFiles(dataFolder);
    console.log(`\nTotal merged records: ${mergedData.length}`);

    // Clear existing data (optional - remove if you want to keep existing data)
    await Property.deleteMany({});
    console.log('Cleared existing properties');

    // Insert merged data
    const result = await Property.insertMany(mergedData);
    console.log(`\n✅ Successfully imported ${result.length} properties to MongoDB!`);

    // Display sample data
    const sample = await Property.findOne();
    console.log('\nSample property:', JSON.stringify(sample, null, 2));

  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed.');
    process.exit(0);
  }
}

// Run the import
importData();