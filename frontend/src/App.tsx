import { useState } from 'react';
import CircularEqualizer from './components/CircularEqualizer';
import RealTimeTranscription from './components/RealTimeTranscription';
import './index.css';

function App() {
  const [sensitivity, setSensitivity] = useState(1);
  const [isRecording, setIsRecording] = useState(false);

  const handleSaveTranscript = (text: string) => {
    console.log('Transcript saved:', text);
    // You can add additional logic here, such as showing a notification
  };

  const handleRecordingChange = (recording: boolean) => {
    setIsRecording(recording);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900 bg-opacity-50 backdrop-blur-md border-b border-slate-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center">
                <span className="text-2xl">🎤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Audio Equalizer & Transcription</h1>
                <p className="text-slate-400 text-sm">Real-time visualization powered by Web Audio API</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-lg">
              <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></span>
              <span className="text-white text-sm font-medium">
                {isRecording ? 'Recording' : 'Ready'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Circular Equalizer */}
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🎵</span>
              Circular Equalizer
            </h2>
            <CircularEqualizer 
              sensitivity={sensitivity}
              onSensitivityChange={(value) => {
                setSensitivity(value);
              }}
              onRecordingChange={handleRecordingChange}
            />
          </div>

          {/* Right Column - Transcription */}
          <div>
            <RealTimeTranscription 
              isRecording={isRecording}
              onSaveTranscript={handleSaveTranscript}
            />

            {/* Instructions */}
            <div className="mt-6 bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span>ℹ️</span>
                How to Use
              </h3>
              <ol className="text-slate-300 space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-neon-blue font-bold">1.</span>
                  <span>Click "Start Recording" on the equalizer to activate your microphone</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue font-bold">2.</span>
                  <span>Watch the circular equalizer visualize your audio in real-time</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue font-bold">3.</span>
                  <span>Adjust the sensitivity slider to control visualization intensity</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue font-bold">4.</span>
                  <span>Speak into your microphone to see real-time transcription</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-neon-blue font-bold">5.</span>
                  <span>Save your transcripts to the database for later review</span>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-blue to-neon-purple rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Real-Time Processing</h3>
            <p className="text-slate-400 text-sm">60fps equalizer with &lt;200ms transcription latency using Web Audio API</p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-green to-neon-blue rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Beautiful Visualization</h3>
            <p className="text-slate-400 text-sm">Custom Canvas-based circular equalizer with 32 radial bars and neon glow effects</p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl p-6 border border-slate-700">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI-Powered Transcription</h3>
            <p className="text-slate-400 text-sm">Google Gemini integration for accurate speech-to-text with streaming support</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 bg-opacity-50 backdrop-blur-md border-t border-slate-700 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-slate-400 text-sm">
              Built with React 18, TypeScript, Vite, Socket.io & Google Gemini
            </div>
            <div className="flex gap-4">
              <span className="text-slate-400 text-sm">🚀 Deployment Ready</span>
              <span className="text-slate-400 text-sm">📱 Mobile Responsive</span>
              <span className="text-slate-400 text-sm">🎯 Production Code</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
