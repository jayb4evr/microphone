import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface TranscriptionData {
  text: string;
  confidence: number;
  timestamp: number;
  isFinal?: boolean;
}

interface RealTimeTranscriptionProps {
  isRecording: boolean;
  onSaveTranscript?: (text: string) => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export default function RealTimeTranscription({ 
  isRecording, 
  onSaveTranscript 
}: RealTimeTranscriptionProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [partialTranscript, setPartialTranscript] = useState('');
  const [finalTranscripts, setFinalTranscripts] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Socket.io connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      setError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setError('Failed to connect to server');
    });

    newSocket.on('transcription-partial', (data: TranscriptionData) => {
      setPartialTranscript(data.text);
    });

    newSocket.on('transcription-final', (data: TranscriptionData) => {
      setFinalTranscripts(prev => [...prev, data.text]);
      setPartialTranscript('');
    });

    newSocket.on('transcription-error', (data: { message: string }) => {
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Handle audio recording and streaming
  useEffect(() => {
    if (!isRecording || !socket || !isConnected) {
      // Stop recording if it's running
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    const startAudioStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        });
        
        streamRef.current = stream;

        // Detect supported mime type
        let mimeType = 'audio/webm';
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
          mimeType = 'audio/ogg';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        }

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
        });
        
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && socket && isConnected) {
            // Convert blob to array buffer and send to server
            event.data.arrayBuffer().then((buffer) => {
              socket.emit('audio-stream', {
                data: Array.from(new Uint8Array(buffer)),
                timestamp: Date.now(),
              });
            });
          }
        };

        mediaRecorder.onerror = (event) => {
          console.error('MediaRecorder error:', event);
          setError('Recording error occurred');
        };

        // Start recording with chunks every 100ms
        mediaRecorder.start(100);
      } catch (err) {
        console.error('Error starting audio stream:', err);
        setError(err instanceof Error ? err.message : 'Failed to start audio stream');
      }
    };

    startAudioStream();

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (socket) {
        socket.emit('stop-transcription');
      }
    };
  }, [isRecording, socket, isConnected]);

  const saveTranscript = async () => {
    const fullTranscript = finalTranscripts.join(' ');
    if (!fullTranscript.trim()) {
      setError('No transcript to save');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: fullTranscript,
          confidence: 0.85,
          duration: 0,
          language: 'en-US',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcript');
      }

      const data = await response.json();
      console.log('Transcript saved:', data);
      
      onSaveTranscript?.(fullTranscript);
      
      // Clear transcripts after saving
      setFinalTranscripts([]);
      setPartialTranscript('');
    } catch (err) {
      console.error('Error saving transcript:', err);
      setError(err instanceof Error ? err.message : 'Failed to save transcript');
    } finally {
      setIsSaving(false);
    }
  };

  const clearTranscripts = () => {
    setFinalTranscripts([]);
    setPartialTranscript('');
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-neon-blue to-neon-purple p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🎙️</span>
              Real-Time Transcription
            </h2>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
              <span className="text-white text-sm">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>

        {/* Transcript Display */}
        <div className="p-6 min-h-[300px] max-h-[500px] overflow-y-auto bg-slate-900">
          {finalTranscripts.length === 0 && !partialTranscript && (
            <div className="text-center text-slate-500 py-12">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <p className="text-lg">Start recording to see transcription...</p>
            </div>
          )}

          {/* Final Transcripts */}
          {finalTranscripts.map((transcript, index) => (
            <div key={index} className="mb-4 p-4 bg-slate-800 rounded-lg border-l-4 border-neon-green">
              <p className="text-white text-lg leading-relaxed">{transcript}</p>
              <span className="text-slate-500 text-xs mt-2 block">Final transcript #{index + 1}</span>
            </div>
          ))}

          {/* Partial Transcript */}
          {partialTranscript && (
            <div className="p-4 bg-slate-800 bg-opacity-50 rounded-lg border-l-4 border-neon-blue animate-pulse">
              <p className="text-slate-300 text-lg leading-relaxed italic">{partialTranscript}</p>
              <span className="text-slate-500 text-xs mt-2 block">Transcribing...</span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-6 mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex gap-4">
          <button
            onClick={saveTranscript}
            disabled={finalTranscripts.length === 0 || isSaving}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              finalTranscripts.length === 0 || isSaving
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-green to-neon-blue hover:shadow-lg hover:shadow-neon-green/50 text-white'
            }`}
          >
            {isSaving ? '💾 Saving...' : '💾 Save to Database'}
          </button>
          <button
            onClick={clearTranscripts}
            disabled={finalTranscripts.length === 0 && !partialTranscript}
            className={`py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              finalTranscripts.length === 0 && !partialTranscript
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
}
