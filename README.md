# 🎤 Microphone Equalizer & Real-Time Transcription

A production-ready MERN stack application featuring a stunning circular audio equalizer with real-time AI-powered transcription using Google Gemini API.

![Project Banner](https://img.shields.io/badge/MERN-Stack-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4-black)

## ✨ Features

### 🎵 Circular Audio Equalizer
- **Real-time visualization** with 60fps performance
- **32 radial bars** using Canvas API and Web Audio API
- **FFT analysis** with 256 frequency bins
- **Smooth animations** with requestAnimationFrame
- **Neon glow effects** and gradient colors
- **Adjustable sensitivity** slider
- **Mobile-first** responsive design

### 🎙️ Real-Time Transcription
- **Google Gemini Live API** integration
- **Socket.io** streaming for real-time communication
- **Partial transcripts** with typing effect
- **Final transcripts** saved to MongoDB
- **<200ms latency** for transcription
- **Auto-reconnection** on network issues

### 🗄️ Database & API
- **MongoDB** for transcript storage
- **RESTful API** for CRUD operations
- **Pagination** support
- **Statistics** endpoint
- **Error handling** with detailed messages

## 🏗️ Project Structure

```
microphone/
├── frontend/                    # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── CircularEqualizer.tsx    # Canvas-based audio visualizer
│   │   │   └── RealTimeTranscription.tsx # Socket.io transcription client
│   │   ├── hooks/
│   │   │   └── useAudioAnalyzer.ts      # Web Audio API hook
│   │   ├── App.tsx              # Main application component
│   │   ├── main.tsx             # React entry point
│   │   └── index.css            # Tailwind + custom styles
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                     # Node.js + Express + Socket.io
│   ├── server.js                # Express server with Socket.io
│   ├── geminiService.js         # Google Gemini API integration
│   ├── routes/
│   │   └── transcription.js     # MongoDB REST API routes
│   └── package.json
│
├── package.json                 # Monorepo workspace configuration
├── .env.example                 # Environment variables template
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or MongoDB Atlas)
- **Google Gemini API Key** ([Get one here](https://ai.google.dev/))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jayb4evr/microphone.git
   cd microphone
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   cd ..
   ```

3. **Configure environment variables**
   
   Create `.env` files in both root and backend directories:
   
   **Backend `.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/microphone
   GEMINI_API_KEY=your_google_gemini_api_key_here
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   ```
   
   **Frontend `.env`:**
   ```env
   VITE_BACKEND_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start MongoDB**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud database
   ```

5. **Run the application**
   
   **Development (both servers):**
   ```bash
   npm run dev
   ```
   
   **Or run separately:**
   ```bash
   # Terminal 1 - Backend
   npm run dev:backend
   
   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

6. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📱 Usage

1. **Start Recording**: Click the "🎤 Start Recording" button to activate your microphone
2. **Visualize Audio**: Watch the circular equalizer visualize your audio in real-time with beautiful neon effects
3. **Adjust Sensitivity**: Use the slider to control the visualization intensity
4. **Speak**: Start speaking to see real-time transcription appear
5. **Save Transcripts**: Click "💾 Save to Database" to store your transcripts in MongoDB

## 🎨 Technologies Used

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time communication
- **Web Audio API** - Audio processing and visualization
- **Canvas API** - Custom visualizations

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB & Mongoose** - Database and ODM
- **Axios** - HTTP client for Gemini API
- **dotenv** - Environment configuration

### APIs & Services
- **Google Gemini 2.0 Flash** - AI-powered transcription
- **MediaDevices API** - Microphone access
- **MediaRecorder API** - Audio recording

## 🔧 API Endpoints

### REST API

#### Transcription Endpoints

```http
POST /api/transcription
```
Save a new transcription
```json
{
  "text": "Transcribed text",
  "confidence": 0.95,
  "duration": 1000,
  "language": "en-US"
}
```

```http
GET /api/transcription?page=1&limit=10
```
Get all transcriptions with pagination

```http
GET /api/transcription/:id
```
Get a specific transcription by ID

```http
DELETE /api/transcription/:id
```
Delete a specific transcription

```http
GET /api/transcription/stats/summary
```
Get transcription statistics

```http
GET /health
```
Health check endpoint

### Socket.io Events

#### Client → Server
- `audio-stream` - Send audio chunks for transcription
- `stop-transcription` - Stop transcription session

#### Server → Client
- `transcription-partial` - Partial transcript update
- `transcription-final` - Final transcript
- `transcription-error` - Error message

## 🎯 Performance

- **60fps** circular equalizer animation
- **<200ms** transcription latency
- **FFT 256** frequency bins for detailed analysis
- **100ms** audio chunks for real-time streaming
- **Auto-reconnection** for network resilience

## 🛡️ Error Handling

- Microphone permission denial
- Network disconnections
- API rate limits
- MongoDB connection errors
- Audio processing errors
- Invalid API keys

## 🎨 UI/UX Features

- **Dark theme** with neon accents
- **Neumorphism** design elements
- **Gradient effects** and glow shadows
- **Smooth animations** and transitions
- **Responsive design** (mobile-first)
- **Loading states** and error messages
- **Typing effect** for transcriptions

## 📦 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set root directory to `frontend`
4. Add environment variables:
   ```
   VITE_BACKEND_URL=https://your-backend.onrender.com
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
5. Deploy!

### Backend (Render)

1. Create new Web Service
2. Set root directory to `backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   GEMINI_API_KEY=your_api_key
   PORT=5000
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
6. Deploy!

### MongoDB (MongoDB Atlas)

1. Create free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Get connection string
3. Update `MONGODB_URI` in backend environment

## 🔐 Environment Variables

See `.env.example` files for required environment variables.

**Important**: Never commit `.env` files to version control!

## 🧪 Development

### Linting
```bash
cd frontend
npm run lint
```

### Building
```bash
cd frontend
npm run build
```

### Preview Production Build
```bash
cd frontend
npm run preview
```

## 🐛 Troubleshooting

### Microphone not working
- Check browser permissions
- Ensure HTTPS (required for microphone access)
- Try a different browser

### Transcription not appearing
- Verify Gemini API key is valid
- Check backend logs for errors
- Ensure Socket.io connection is established

### MongoDB connection failed
- Verify MongoDB is running
- Check connection string format
- Ensure network access in MongoDB Atlas

## 📄 License

MIT License - feel free to use this project for your own purposes!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

## 🙏 Acknowledgments

- Google Gemini API for AI transcription
- Socket.io for real-time communication
- Web Audio API for audio processing
- Canvas API for visualizations
- Tailwind CSS for styling

---

**Built with ❤️ using the MERN stack**

🚀 **Ready for production deployment!**
