import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import transcriptionRoutes from './routes/transcription.js';
import { processAudioChunk } from './geminiService.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microphone';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// REST API Routes
app.use('/api/transcription', transcriptionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Socket.io setup
const io = new Server(httpServer, {
  cors: corsOptions,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Handle audio stream for transcription
  socket.on('audio-stream', async (audioData) => {
    try {
      // Process audio chunk through Gemini API
      const transcription = await processAudioChunk(audioData);
      
      if (transcription) {
        // Send partial transcript back to client
        socket.emit('transcription-partial', {
          text: transcription.text,
          confidence: transcription.confidence,
          timestamp: Date.now(),
        });

        // If it's a final transcript, also emit final event
        if (transcription.isFinal) {
          socket.emit('transcription-final', {
            text: transcription.text,
            confidence: transcription.confidence,
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      socket.emit('transcription-error', {
        message: error.message || 'Failed to process audio',
        timestamp: Date.now(),
      });
    }
  });

  // Handle manual stop of transcription
  socket.on('stop-transcription', () => {
    console.log(`⏹️  Client ${socket.id} stopped transcription`);
  });

  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id}, Reason: ${reason}`);
  });

  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});
