Real Estate Chatbot (React + Node.js + MongoDB)
An AI-assisted real estate assistant that:
Accepts natural language or form-based filters (budget, location, bedrooms, bathrooms, size, amenities)
Filters and displays properties from MongoDB
Supports real-time search as you type
Lets users save favorites
Compares multiple properties side-by-side
Uses OpenAI for NLP (optional)
Tech Stack
Frontend: React (Vite), Axios
Backend: Node.js, Express, Mongoose
Database: MongoDB (Local or Atlas)
NLP: OpenAI API (optional)
Project Structure
.├── client/                # React frontend│   ├── src/│   │   ├── components/│   │   │   ├── ChatBot.jsx / ChatBot.css│   │   │   ├── PropertyCard.jsx / PropertyCard.css│   │   │   └── PropertyComparison.jsx / PropertyComparison.css│   │   ├── services/api.js│   │   ├── App.jsx / App.css / main.jsx│   └── package.json├── server/                # Node backend│   ├── config/database.js│   ├── models/Property.js│   ├── models/UserPreference.js│   ├── services/nlpService.js│   ├── importData.js│   ├── server.js│   └── package.json├── data/                  # Seed JSONs│   ├── property\_basics.json│   ├── property\_characteristics.json│   └── property\_images.json└── README.md
Features
NLP-driven filter extraction (e.g., “3 bedroom in Austin under $500k”)
Real-time search with debouncing
Favorites (saved properties) stored by user
Property comparison (up to 4)
REST API for properties and preferences
Prerequisites
Node.js LTS
MongoDB (Local or Atlas)
OpenAI API key (optional, for NLP)
Setup
---

1. #### Install dependencies

#### Backend cd server npm install# If using NLP npm install openai# Frontend cd ../clientnpm install

2. Environment variables
   Create server/.env:
   ---

#### MONGODB\_URI=mongodb://localhost:27017/propertydb# or Atlas# MONGODB\_URI=mongodb+srv://username:password@cluster.mongodb.net/propertydb# NLP (optional)

#### OPENAI\_API\_KEY=sk-your-openai-api-key

3. Seed data to MongoDB
   cd servernpm run import
   This reads all JSON files from data/, merges by id, and inserts into properties collection.
   ---
4. #### Run servers

#### Backend 

#### cd server 

#### npm start

#### \# http://localhost:5000

#### \# Frontend (new terminal)

#### cd clientnpm run dev

#### \# http://localhost:5173 (default Vite port)

Usage
Open the frontend URL and:
Type natural queries in the chat (e.g., “Find me a 3 bedroom condo under 600000 in Miami”)
Or open Filters panel to set budget, location, bedrooms, bathrooms, size
Use the real-time search input to dynamically filter as you type
Save properties to favorites
Add up to 4 properties to comparison
Notes:
A temporary userId is generated per session.
Comparison and favorites are linked to that userId.
API Overview
Base URL: http://localhost:5000/api
GET /properties
Query params: budget, location, bedrooms, bathrooms, minSize, maxSize, amenities
Example: /properties?location=Austin\&bedrooms=3\&budget=500000
GET /properties/:id
Fetch a single property by numeric id field
POST /preferences
Body: { userId, savedProperties?, preferences?, searchHistory? }
Creates/updates user preferences
GET /preferences/:userId
Fetch user preferences and saved properties
POST /preferences/:userId/save
Body: { propertyId } (MongoDB ObjectId)
Adds a property to user favorites
DELETE /preferences/:userId/save/:propertyId
Removes a property from favorites
POST /nlp/extract (optional)
Body: { message, conversationHistory? }
Returns extracted filters and intent
POST /nlp/chat (optional)
Body: { message, context? }
Returns AI-generated assistant reply
Frontend Integration
client/src/services/api.js: Axios client for all API calls
ChatBot.jsx:
Sends text to NLP for filter extraction
Performs property search and renders results
Supports real-time search via debounced input
Saves/removes favorites
Adds/removes properties from comparison
PropertyCard.jsx: Displays a card with Save/Compare actions
PropertyComparison.jsx: Side-by-side comparison grid
Data Model
Property document fields include:
id (number, unique)
bedrooms, bathrooms, size\_sqft
amenities (string\[])
image\_url (string)
Optional: price, location
UserPreference
userId (string, unique)
savedProperties (ObjectId\[] -> Property)
preferences (filter snapshot)
searchHistory (array of past filter objects)
Troubleshooting
“Objects are not valid as a React child”
Ensure you render aiResponse.data (string), not the whole object.
Normalize message text before rendering if needed.
“MODULE\_NOT\_FOUND: importData.js”
Create server/importData.js and re-run npm run import.
MongoDB connection
Verify MONGODB\_URI in server/.env
For Atlas, whitelist your IP and use the exact connection string.
CORS issues
The backend has cors() enabled. Ensure frontend points to http://localhost:5000/api.
Scripts
Backend (server/package.json):
npm start → start server
npm run import → import data from data/
Frontend (client/package.json):
npm run dev → start Vite dev server
npm run build → production build
npm run preview → preview build
Security
Never commit .env
Consider input validation, rate limiting for production
Rotate API keys regularly
Roadmap
Authentication for persistent user profiles
Pagination and infinite scroll
Map view with geospatial queries
Server-side caching of frequent searches
End of README -
---

