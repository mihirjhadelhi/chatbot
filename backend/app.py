"""
FastAPI Backend for Voice to Text Application
Handles audio transcription using Whisper via WebSocket
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import numpy as np
import io
import wave
import asyncio
import base64
import json
from typing import Optional
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Voice to Text API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Whisper model (lazy loaded)
whisper_model: Optional[WhisperModel] = None
model_size = "base"
device = "cpu"
language = None

def get_model():
    """Get or initialize Whisper model"""
    global whisper_model
    if whisper_model is None:
        logger.info(f"Loading Whisper model: {model_size} on {device}")
        whisper_model = WhisperModel(model_size, device=device)
        logger.info("Whisper model loaded successfully")
    return whisper_model

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    get_model()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Voice to Text API is running", "status": "ok"}

@app.get("/api/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy", "model": model_size}

@app.websocket("/ws/transcribe")
async def websocket_transcribe(websocket: WebSocket):
    """
    WebSocket endpoint for real-time audio transcription
    Receives audio chunks and returns transcriptions
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    model = get_model()
    audio_buffer = []
    accumulated_text = ""
    is_paused = False
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive()
            
            if "text" in data:
                # Handle control messages (JSON)
                try:
                    message = json.loads(data["text"])
                    command = message.get("command")
                    
                    if command == "pause":
                        is_paused = True
                        await websocket.send_json({
                            "type": "status",
                            "message": "Recording paused"
                        })
                        logger.info("Recording paused")
                    
                    elif command == "resume":
                        is_paused = False
                        await websocket.send_json({
                            "type": "status",
                            "message": "Recording resumed"
                        })
                        logger.info("Recording resumed")
                    
                    elif command == "stop":
                        # Process remaining audio
                        if audio_buffer:
                            text = await transcribe_audio_chunks(model, audio_buffer)
                            if text:
                                accumulated_text += " " + text
                                await websocket.send_json({
                                    "type": "transcription",
                                    "text": text,
                                    "full_text": accumulated_text.strip()
                                })
                        
                        await websocket.send_json({
                            "type": "final",
                            "full_text": accumulated_text.strip()
                        })
                        logger.info("Recording stopped")
                        break
                    
                    elif command == "reset":
                        audio_buffer = []
                        accumulated_text = ""
                        await websocket.send_json({
                            "type": "status",
                            "message": "Buffer reset"
                        })
                        logger.info("Buffer reset")
                    
                    continue
                
                except json.JSONDecodeError:
                    logger.warning("Invalid JSON message received")
                    continue
            
            elif "bytes" in data:
                # Handle audio data (binary)
                if not is_paused:
                    audio_bytes = data["bytes"]
                    audio_buffer.append(audio_bytes)
                    
                    # Process when buffer reaches certain size (every ~2 seconds at 16kHz)
                    if len(audio_buffer) >= 32:  # Adjust based on your needs
                        # Transcribe accumulated audio
                        text = await transcribe_audio_chunks(model, audio_buffer)
                        
                        if text:
                            accumulated_text += " " + text
                            await websocket.send_json({
                                "type": "transcription",
                                "text": text,
                                "full_text": accumulated_text.strip()
                            })
                            logger.info(f"Transcribed: {text}")
                        
                        # Clear buffer (keep last few chunks for context)
                        audio_buffer = audio_buffer[-8:]  # Keep last ~0.5 seconds
    
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"Error in WebSocket: {e}", exc_info=True)
        await websocket.send_json({
            "type": "error",
            "message": str(e)
        })

async def transcribe_audio_chunks(model: WhisperModel, audio_chunks: list) -> str:
    """
    Transcribe audio chunks using Whisper
    
    Args:
        model: Whisper model instance
        audio_chunks: List of audio bytes chunks (WebM format from browser)
    
    Returns:
        Transcribed text
    """
    try:
        # Combine all audio chunks
        audio_data = b''.join(audio_chunks)
        
        if len(audio_data) < 1000:  # Too small to process
            return ""
        
        # For WebM audio from browser, we need to use ffmpeg or similar
        # For now, try to use faster-whisper's built-in audio handling
        # which can handle various formats via ffmpeg
        
        # Save to temporary bytes buffer
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.webm') as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name
        
        try:
            # Transcribe using Whisper (faster-whisper handles audio format conversion)
            segments, info = model.transcribe(
                tmp_file_path,
                language=language,
                beam_size=5,
                vad_filter=True,
                vad_parameters=dict(min_silence_duration_ms=500)
            )
            
            # Combine segments
            text = " ".join([segment.text for segment in segments])
            return text.strip()
        
        finally:
            # Clean up temp file
            try:
                os.unlink(tmp_file_path)
            except:
                pass
    
    except Exception as e:
        logger.error(f"Transcription error: {e}", exc_info=True)
        return ""

@app.post("/api/transcribe")
async def transcribe_audio_file(audio_file: bytes):
    """
    REST endpoint for transcribing audio file
    Accepts audio file as binary data
    """
    try:
        model = get_model()
        
        # Convert audio bytes to numpy array
        # Assuming 16-bit PCM, mono, 16kHz
        audio_np = np.frombuffer(audio_file, dtype=np.int16).astype(np.float32)
        audio_np = audio_np / 32768.0
        
        # Transcribe
        segments, info = model.transcribe(
            audio_np,
            language=language,
            beam_size=5
        )
        
        text = " ".join([segment.text for segment in segments])
        
        return {
            "success": True,
            "text": text.strip(),
            "language": info.language,
            "language_probability": info.language_probability
        }
    
    except Exception as e:
        logger.error(f"Transcription error: {e}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

