import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [fullText, setFullText] = useState('');
  const [status, setStatus] = useState('Ready to record');
  const [error, setError] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const websocketRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (websocketRef.current) {
        websocketRef.current.close();
      }
    };
  }, []);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws/transcribe');
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setStatus('Connected');
        setError(null);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'transcription') {
            setTranscription(data.text);
            setFullText(data.full_text);
          } else if (data.type === 'status') {
            setStatus(data.message);
          } else if (data.type === 'final') {
            setFullText(data.full_text);
            setStatus('Recording stopped');
          } else if (data.type === 'error') {
            setError(data.message);
            setStatus('Error occurred');
          }
        } catch (e) {
          console.error('Error parsing WebSocket message:', e);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Make sure the backend is running.');
        setStatus('Connection error');
      };
      
      ws.onclose = () => {
        console.log('WebSocket closed');
        setStatus('Disconnected');
      };
      
      websocketRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      setError('Failed to connect to server');
    }
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        }
      });
      
      streamRef.current = stream;
      
      // Connect WebSocket
      connectWebSocket();
      
      // Wait for WebSocket to be ready
      await new Promise((resolve) => {
        if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
          resolve();
        } else {
          websocketRef.current.addEventListener('open', resolve, { once: true });
        }
      });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      // Handle data available
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && !isPaused) {
          audioChunksRef.current.push(event.data);
          
          // Send audio data to WebSocket
          if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
            try {
              // Convert Blob to ArrayBuffer then to bytes
              const buffer = await event.data.arrayBuffer();
              websocketRef.current.send(new Uint8Array(buffer));
            } catch (error) {
              console.error('Error sending audio data:', error);
            }
          }
        }
      };
      
      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      
      setIsRecording(true);
      setIsPaused(false);
      setStatus('Recording...');
      setTranscription('');
      setFullText('');
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to access microphone. Please check permissions.');
      setStatus('Error');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      setIsPaused(true);
      setStatus('Paused');
      
      // Send pause command to server
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ command: 'pause' }));
      }
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      setIsPaused(false);
      setStatus('Recording...');
      
      // Resume MediaRecorder if supported
      if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
      
      // Send resume command to server
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ command: 'resume' }));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Stop MediaRecorder
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Send stop command to server
      if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({ command: 'stop' }));
      }
      
      setIsRecording(false);
      setIsPaused(false);
      setStatus('Stopped');
    }
  };

  const resetRecording = () => {
    setTranscription('');
    setFullText('');
    setStatus('Ready to record');
    setError(null);
    
    if (websocketRef.current && websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.send(JSON.stringify({ command: 'reset' }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullText);
    setStatus('Copied to clipboard!');
    setTimeout(() => setStatus('Ready to record'), 2000);
  };

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🎙️ Voice to Text</h1>
          <p className="subtitle">Powered by Whisper AI</p>
        </header>

        <div className="status-bar">
          <div className={`status-indicator ${isRecording ? (isPaused ? 'paused' : 'recording') : 'idle'}`}></div>
          <span className="status-text">{status}</span>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <div className="controls">
          {!isRecording ? (
            <button 
              className="btn btn-primary btn-large"
              onClick={startRecording}
            >
              🎤 Start Recording
            </button>
          ) : (
            <div className="recording-controls">
              {isPaused ? (
                <button 
                  className="btn btn-resume"
                  onClick={resumeRecording}
                >
                  ▶️ Resume
                </button>
              ) : (
                <button 
                  className="btn btn-pause"
                  onClick={pauseRecording}
                >
                  ⏸️ Pause
                </button>
              )}
              <button 
                className="btn btn-stop"
                onClick={stopRecording}
              >
                🛑 Stop
              </button>
            </div>
          )}
          
          {fullText && (
            <button 
              className="btn btn-secondary"
              onClick={resetRecording}
            >
              🔄 Reset
            </button>
          )}
        </div>

        <div className="transcription-container">
          <div className="transcription-section">
            <h3>Current Transcription</h3>
            <div className="transcription-box current">
              {transcription || <span className="placeholder">Speak to see transcription...</span>}
            </div>
          </div>

          <div className="transcription-section">
            <div className="section-header">
              <h3>Full Text</h3>
              {fullText && (
                <button 
                  className="btn btn-small btn-copy"
                  onClick={copyToClipboard}
                >
                  📋 Copy
                </button>
              )}
            </div>
            <div className="transcription-box full">
              {fullText || <span className="placeholder">Your full transcription will appear here...</span>}
            </div>
          </div>
        </div>

        <footer className="footer">
          <p>Press Start to begin recording. You can pause and resume anytime.</p>
        </footer>
      </div>
    </div>
  );
}

export default App;

