import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Audio buffer to accumulate chunks
let audioBuffer = [];
let processingTimeout = null;

/**
 * Convert audio buffer to PCM 16kHz mono format
 * @param {Buffer} audioData - Raw audio data from client
 * @returns {Buffer} - Converted PCM audio
 */
function convertToPCM16kHz(audioData) {
  // In a production environment, you would use libraries like 'node-wav' or 'fluent-ffmpeg'
  // to properly convert audio formats. For this demo, we'll assume the client sends
  // compatible audio format or add conversion logic here.
  return audioData;
}

/**
 * Process audio chunk through Google Gemini API
 * @param {Object} audioData - Audio chunk from client
 * @returns {Promise<Object>} - Transcription result
 */
export async function processAudioChunk(audioData) {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Convert audio data to appropriate format
    const audioBuffer = Buffer.from(audioData.data);
    const pcmAudio = convertToPCM16kHz(audioBuffer);

    // Encode audio to base64 for API request
    const base64Audio = pcmAudio.toString('base64');

    // Prepare request payload for Gemini API
    const requestPayload = {
      contents: [{
        parts: [{
          text: "Transcribe the following audio. Provide only the transcribed text without any additional commentary."
        }, {
          inline_data: {
            mime_type: "audio/wav",
            data: base64Audio
          }
        }]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 200,
      }
    };

    // Make API request to Gemini
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    // Extract transcription from response
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      const text = candidate.content?.parts?.[0]?.text || '';
      
      return {
        text: text.trim(),
        confidence: candidate.finishReason === 'STOP' ? 0.95 : 0.7,
        isFinal: candidate.finishReason === 'STOP',
        timestamp: Date.now(),
      };
    }

    return null;
  } catch (error) {
    console.error('Gemini API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      throw new Error('Invalid API key or insufficient permissions.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    }
    
    throw new Error('Failed to transcribe audio. Please try again.');
  }
}

/**
 * Alternative: Stream audio processing for better real-time performance
 * This would be used with Gemini's streaming API when available
 */
export async function processAudioStream(audioChunks) {
  // This is a placeholder for streaming implementation
  // When Gemini supports WebSocket/streaming for audio, implement here
  return processAudioChunk(audioChunks);
}

/**
 * Clean up resources
 */
export function cleanup() {
  audioBuffer = [];
  if (processingTimeout) {
    clearTimeout(processingTimeout);
    processingTimeout = null;
  }
}
