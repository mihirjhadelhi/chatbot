# Voice to Text Application - React Frontend & Python Backend

A full-stack voice-to-text application using React frontend and Python FastAPI backend with OpenAI's Whisper model. Features real-time transcription with pause/resume functionality.

## 🎯 Features

- ✅ **Real-time Speech-to-Text** using Whisper AI
- ✅ **Pause/Resume** functionality during recording
- ✅ **Modern React Frontend** with beautiful UI
- ✅ **FastAPI Backend** with WebSocket support for real-time communication
- ✅ **Multiple Whisper Model Sizes** (tiny, base, small, medium, large-v2, large-v3)
- ✅ **Auto Language Detection** or manual specification
- ✅ **Voice Activity Detection (VAD)** for better accuracy
- ✅ **Responsive Design** works on desktop and mobile

## 📁 Project Structure

```
.
├── backend/
│   └── app.py              # FastAPI backend with WebSocket
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── App.css          # Styling
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── index.html           # HTML template
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** installed
- **Node.js 16+** and **npm** installed
- **Microphone** connected to your computer
- At least **4GB RAM** (for base model, more for larger models)

### Installation

#### 1. Install Python Backend Dependencies

```bash
pip install -r requirements.txt
```

#### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Running the Application

#### Start the Backend (Terminal 1)

```bash
cd backend
python app.py
```

Or use uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The backend will start on `http://localhost:8000`

#### Start the Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000` (or the next available port)

#### Open in Browser

Navigate to `http://localhost:3000` in your web browser.

## 🎮 Usage

1. **Click "Start Recording"** to begin
2. **Speak into your microphone**
3. **Click "Pause"** to temporarily stop recording
4. **Click "Resume"** to continue recording
5. **Click "Stop"** to finish and see the full transcription
6. **Click "Copy"** to copy the full text to clipboard

## ⚙️ Configuration

### Backend Configuration

You can modify the model settings in `backend/app.py`:

```python
model_size = "base"  # Options: tiny, base, small, medium, large-v2, large-v3
device = "cpu"       # Options: cpu, cuda (for GPU)
language = None      # None for auto-detection, or specify like "en", "es", "fr"
```

### Frontend Configuration

The frontend connects to the backend via WebSocket. The connection URL is configured in `frontend/src/App.jsx`:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/transcribe');
```

Change this if your backend runs on a different host/port.

## 📊 Model Size Comparison

| Model | Size | Speed | Accuracy | Use Case |
|-------|------|-------|----------|----------|
| tiny | 39 MB | Fastest | Basic | Quick testing, low resource |
| base | 74 MB | Fast | Good | General purpose (recommended) |
| small | 244 MB | Moderate | Better | Better accuracy needed |
| medium | 769 MB | Slower | Very Good | High accuracy needed |
| large-v2 | 1550 MB | Slowest | Excellent | Best accuracy |
| large-v3 | 1550 MB | Slowest | Excellent | Best accuracy (latest) |

## 🔧 API Endpoints

### WebSocket Endpoint

**URL:** `ws://localhost:8000/ws/transcribe`

**Client Messages (JSON):**
- `{"command": "pause"}` - Pause recording
- `{"command": "resume"}` - Resume recording
- `{"command": "stop"}` - Stop recording
- `{"command": "reset"}` - Reset buffer

**Server Messages (JSON):**
- `{"type": "transcription", "text": "...", "full_text": "..."}` - Transcription update
- `{"type": "status", "message": "..."}` - Status update
- `{"type": "final", "full_text": "..."}` - Final transcription
- `{"type": "error", "message": "..."}` - Error message

### REST Endpoints

- `GET /` - Health check
- `GET /api/health` - Health check with model info
- `POST /api/transcribe` - Transcribe audio file (binary data)

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Change port in backend/app.py or use:
uvicorn app:app --port 8001
```

**Model loading errors:**
- Ensure you have enough RAM for the selected model
- Try a smaller model first (tiny or base)
- Check internet connection (first run downloads model)

**Audio processing errors:**
- Ensure audio format is correct (16-bit PCM, 16kHz, mono)
- Check that audio data is being sent correctly

### Frontend Issues

**WebSocket connection failed:**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app.py`
- Verify firewall isn't blocking the connection

**Microphone access denied:**
- Grant microphone permissions in browser settings
- Check browser console for permission errors
- Try a different browser (Chrome/Firefox recommended)

**Audio not recording:**
- Check browser console for errors
- Verify microphone is working in other applications
- Try refreshing the page

### Performance Issues

- Use a smaller model (`tiny` or `base`) for faster processing
- Close other applications to free up resources
- Use GPU acceleration if available (change `device = "cuda"` in backend)

### Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: May have limitations with WebSocket
- **Mobile browsers**: Works but may have audio limitations

## 🛠️ Development

### Backend Development

```bash
cd backend
# Install in development mode
pip install -r ../requirements.txt

# Run with auto-reload
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development

```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📝 Notes

- The application uses WebSocket for real-time bidirectional communication
- Audio is processed in chunks for real-time transcription
- Pausing stops audio capture but keeps the WebSocket connection active
- The final transcription includes all text from the session
- Models are downloaded automatically on first use (stored in cache)

## 🔒 Security Notes

- The backend currently allows all CORS origins in development
- For production, update CORS settings in `backend/app.py`
- Consider adding authentication for production deployments
- WebSocket connections should be secured (WSS) in production

## 📄 License

This project uses the Whisper model which is licensed under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 🙏 Acknowledgments

- OpenAI for the Whisper model
- FastAPI for the excellent Python web framework
- React and Vite for the frontend framework
