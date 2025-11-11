# Quick Start Guide

## 📋 Prerequisites

Before starting, make sure you have:
- **Python 3.8+** installed
- **Node.js and npm** installed (see `INSTALL_NODEJS.md` if you don't have it)

## 🚀 Getting Started in 4 Steps

### Step 0: Install Node.js (if not installed)

If you see "npm is not recognized" error:
- See `INSTALL_NODEJS.md` for detailed installation instructions
- Or visit https://nodejs.org/ and download the LTS version

### Step 1: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

### Step 3: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

**Or use the batch files (Windows):**
- Double-click `start_backend.bat` to start the backend
- Double-click `start_frontend.bat` to start the frontend

### Step 4: Open in Browser

Navigate to `http://localhost:3000` (or the port shown in the terminal)

## ✅ You're Ready!

1. Click **"Start Recording"**
2. Speak into your microphone
3. See real-time transcription
4. Use **Pause/Resume** as needed
5. Click **Stop** when finished

## 📝 Notes

- First run will download the Whisper model (may take a few minutes)
- Make sure to allow microphone access when prompted
- Backend runs on port 8000
- Frontend runs on port 3000 (or next available)

## 🐛 Troubleshooting

**Backend not starting?**
- Make sure Python 3.8+ is installed
- Check if port 8000 is available

**Frontend not starting?**
- Make sure Node.js is installed
- Run `npm install` in the frontend directory

**No audio?**
- Check microphone permissions in browser
- Try refreshing the page

**Connection errors?**
- Make sure backend is running before starting frontend
- Check browser console for errors

