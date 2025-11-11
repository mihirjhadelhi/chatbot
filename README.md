# 🏠 Real Estate Chatbot (React + Node.js + MongoDB)

An **AI-assisted real estate assistant** that:  
- Accepts **natural language** or **form-based filters** (budget, location, bedrooms, bathrooms, size, amenities)  
- Filters and displays properties from **MongoDB**  
- Supports **real-time search** as you type  
- Lets users **save favorites**  
- Compares **multiple properties side-by-side**  
- Uses **OpenAI** for NLP (optional)

---

## 🧠 Tech Stack

**Frontend:** React (Vite), Axios  
**Backend:** Node.js, Express, Mongoose  
**Database:** MongoDB (Local or Atlas)  
**NLP:** OpenAI API (optional)

---

## 📁 Project Structure

```bash
.
├── client/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBot.jsx / ChatBot.css
│   │   │   ├── PropertyCard.jsx / PropertyCard.css
│   │   │   └── PropertyComparison.jsx / PropertyComparison.css
│   │   ├── services/api.js
│   │   ├── App.jsx / App.css / main.jsx
│   └── package.json
│
├── server/                # Node backend
│   ├── config/database.js
│   ├── models/Property.js
│   ├── models/UserPreference.js
│   ├── services/nlpService.js
│   ├── importData.js
│   ├── server.js
│   └── package.json
│
├── data/                  # Seed JSONs
│   ├── property_basics.json
│   ├── property_characteristics.json
│   └── property_images.json
│
└── README.md
```

---

## ✨ Features

- 🧩 NLP-driven filter extraction (e.g., “3 bedroom in Austin under $500k”)  
- ⚡ Real-time search with debouncing  
- ❤️ Favorites (saved properties) stored by user  
- 🆚 Property comparison (up to 4)  
- 🔗 REST API for properties and preferences  

---

## 🧰 Prerequisites

- Node.js (LTS)  
- MongoDB (Local or Atlas)  
- OpenAI API key *(optional, for NLP)*  

---

## 🚀 Setup

### 1. Install dependencies

**Backend**
```bash
cd server
npm install
# If using NLP
npm install openai
```

**Frontend**
```bash
cd ../client
npm install
```

---

### 2. Environment variables

Create a file: **`server/.env`**

```bash
MONGODB_URI=mongodb://localhost:27017/propertydb
# or for Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/propertydb

# NLP (optional)
OPENAI_API_KEY=sk-your-openai-api-key
```

---

### 3. Seed data into MongoDB

```bash
cd server
npm run import
```

This reads all JSON files from `/data`, merges them by `id`, and inserts into the `properties` collection.

---

### 4. Run servers

**Backend**
```bash
cd server
npm start
# http://localhost:5000
```

**Frontend (new terminal)**
```bash
cd client
npm run dev
# http://localhost:5173 (default Vite port)
```

---

## 💡 Usage

Open the frontend URL and:

- Type natural queries in chat — e.g.,  
  "Find me a 3 bedroom condo under 600000 in Miami"
- Or open **Filters** panel to set filters (budget, location, bedrooms, bathrooms, size)
- Use the **real-time search input**
- Save properties to favorites
- Add up to 4 properties for comparison  

**Notes:**
- A temporary `userId` is generated per session.  
- Comparison and favorites are linked to that `userId`.

---

## 🔌 API Overview

**Base URL:** `http://localhost:5000/api`

### Property Routes
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/properties` | Filter properties |
| GET | `/properties/:id` | Get a single property |
| POST | `/preferences` | Create/update user preferences |
| GET | `/preferences/:userId` | Fetch user preferences |
| POST | `/preferences/:userId/save` | Add favorite |
| DELETE | `/preferences/:userId/save/:propertyId` | Remove favorite |

### NLP (optional)
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/nlp/extract` | Extract filters & intent |
| POST | `/nlp/chat` | Get AI-generated response |

---

## 🧩 Frontend Integration

- **`client/src/services/api.js`** – Axios client for API calls  
- **`ChatBot.jsx`** – NLP integration, search, favorites, comparison  
- **`PropertyCard.jsx`** – Property card UI  
- **`PropertyComparison.jsx`** – Comparison grid  

---

## 🧱 Data Models

### **Property**
```js
{
  id: Number,
  bedrooms: Number,
  bathrooms: Number,
  size_sqft: Number,
  amenities: [String],
  image_url: String,
  price: Number,
  location: String
}
```

### **UserPreference**
```js
{
  userId: String,
  savedProperties: [ObjectId],
  preferences: Object,
  searchHistory: [Object]
}
```

---

## 🧩 Troubleshooting

**❌ “Objects are not valid as a React child”**  
Render `aiResponse.data` (string), not the full object.

**❌ “MODULE_NOT_FOUND: importData.js”**  
Create `server/importData.js` and rerun `npm run import`.

**⚙️ MongoDB connection issues**  
Check `MONGODB_URI` and whitelist your IP for Atlas.

**🌐 CORS issues**  
Ensure backend has `cors()` and frontend uses `http://localhost:5000/api`.

---

## 🧾 Scripts

**Backend (`server/package.json`)**
```bash
npm start        # start server
npm run import   # import data
```

**Frontend (`client/package.json`)**
```bash
npm run dev      # start Vite dev server
npm run build    # production build
npm run preview  # preview build
```

---

## 🔒 Security

- Never commit `.env`  
- Add **input validation** & **rate limiting** in production  
- Rotate **API keys** regularly  

---

## 🗺️ Roadmap

- 🔐 Authentication & user profiles  
- 📜 Pagination and infinite scroll  
- 🗺️ Map view with geospatial queries  
- ⚡ Server-side caching of frequent searches  

---

**End of README**
