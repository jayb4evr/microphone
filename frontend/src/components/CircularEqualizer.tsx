import { useEffect, useRef, useState } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';

interface CircularEqualizerProps {
  sensitivity?: number;
  onSensitivityChange?: (value: number) => void;
  onRecordingChange?: (isRecording: boolean) => void;
}

export default function CircularEqualizer({ 
  sensitivity = 1, 
  onSensitivityChange,
  onRecordingChange
}: CircularEqualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isRecording, error, startRecording, stopRecording, getFrequencyData } = useAudioAnalyzer();
  const [localSensitivity, setLocalSensitivity] = useState(sensitivity);
  const animationFrameRef = useRef<number | null>(null);

  // Draw circular equalizer
  useEffect(() => {
    if (!isRecording || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    const bars = 32; // Number of radial bars

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Get frequency data
      const frequencyData = getFrequencyData();
      if (!frequencyData) return;

      // Draw radial bars
      for (let i = 0; i < bars; i++) {
        const angle = (Math.PI * 2 * i) / bars;
        
        // Sample frequency data (distribute across the spectrum)
        const dataIndex = Math.floor((i / bars) * frequencyData.length);
        const amplitude = frequencyData[dataIndex] * localSensitivity;
        
        // Calculate bar length based on amplitude
        const barLength = (amplitude / 255) * radius * 0.8;
        
        // Start and end points for the bar
        const startX = centerX + Math.cos(angle) * (radius * 0.3);
        const startY = centerY + Math.sin(angle) * (radius * 0.3);
        const endX = centerX + Math.cos(angle) * (radius * 0.3 + barLength);
        const endY = centerY + Math.sin(angle) * (radius * 0.3 + barLength);

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        const hue = (i / bars) * 360;
        gradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
        gradient.addColorStop(1, `hsla(${hue + 60}, 100%, 60%, 0.4)`);

        // Draw bar
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      // Draw center circle
      const avgAmplitude = Array.from(frequencyData).reduce((a, b) => a + b, 0) / frequencyData.length;
      const centerRadius = 30 + (avgAmplitude / 255) * 20;
      
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRadius);
      centerGradient.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
      centerGradient.addColorStop(1, 'rgba(180, 0, 255, 0.4)');
      
      ctx.fillStyle = centerGradient;
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();

      // Request next frame
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, getFrequencyData, localSensitivity]);

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const container = canvasRef.current.parentElement;
        if (container) {
          canvasRef.current.width = container.clientWidth;
          canvasRef.current.height = container.clientHeight;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleMic = async () => {
    if (isRecording) {
      stopRecording();
      onRecordingChange?.(false);
    } else {
      await startRecording();
      onRecordingChange?.(true);
    }
  };

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLocalSensitivity(value);
    onSensitivityChange?.(value);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <div className="relative w-full max-w-2xl aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: 'block' }}
        />
        
        {/* Center overlay when not recording */}
        {!isRecording && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-50 backdrop-blur-sm">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center animate-glow">
                <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white text-lg font-semibold">Click to start</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 w-full max-w-2xl space-y-4">
        <button
          onClick={handleToggleMic}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/50'
              : 'bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white shadow-lg shadow-neon-blue/50'
          }`}
        >
          {isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
        </button>

        {/* Sensitivity Slider */}
        <div className="bg-slate-800 rounded-xl p-4">
          <label className="block text-white text-sm font-medium mb-2">
            Sensitivity: {localSensitivity.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={localSensitivity}
            onChange={handleSensitivityChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 px-4 py-3 rounded-xl">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
